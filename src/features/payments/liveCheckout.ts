// Live online-payment machinery shared by orders and the 30-day plan:
//   prepare (backend creates checkout + Razorpay order, returns the amount)
//   -> pay (Razorpay in a WebView; test-mode keys only)
//   -> verify (POST /api/checkout/complete; the backend checks the signature
//      and fulfils; "paid" comes only from the backend's order/payment status).
// The client result is never trusted. Used only when EXPO_PUBLIC_USE_MOCKS=false.
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import { ApiError } from '../../services/api/interceptors';
import { colors } from '../../theme';
import { UserFacingError } from '../checkout/errorMessage';
import type { PaymentStatusResult, SdkOutcome } from '../checkout/types';
import {
  rememberPlacedOrders,
  type ApiOrder,
} from '../orders/services/ordersService';
import {
  isRazorpayTestKey,
  startRazorpay,
  type RazorpayProof,
} from './razorpay';

export type Customer = { name: string; phone: string; email: string };

type Prepared = {
  checkoutId: string;
  amount: number;
  razorpayKeyId: string;
  razorpayOrderId: string;
  checkoutToken: string;
};

type CompleteResponse = {
  orders?: ApiOrder[];
  order?: ApiOrder;
  parentOrder?: { paymentStatus?: string } | null;
};

type Entry = {
  prepared: Prepared;
  customer: Customer;
  proof?: RazorpayProof;
  result?: PaymentStatusResult;
};

const entries = new Map<string, Entry>();

const abandon = (checkoutId: string) => {
  entries.delete(checkoutId);
  // Gives a reserved coupon back; failure here is harmless.
  apiClient.post(endpoints.checkout.abandon, { checkoutId }).catch(() => {});
};

export const liveCheckout = {
  // body: lines, deliveryAddress, couponCode?, ... (what the site sends).
  async prepare(
    body: Record<string, unknown>,
    customer: Customer,
  ): Promise<{ checkoutId: string; amount: number }> {
    const prepared = await apiClient.post<Prepared>(
      endpoints.checkout.prepare,
      {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        paymentMethod: 'online',
        ...body,
      },
    );
    if (!isRazorpayTestKey(prepared.razorpayKeyId)) {
      // Live or unknown key: never start a real payment from this build.
      abandon(prepared.checkoutId);
      throw new UserFacingError(
        'Online payments are not available in this build yet.',
      );
    }
    entries.set(prepared.checkoutId, { prepared, customer });
    return { checkoutId: prepared.checkoutId, amount: prepared.amount };
  },

  async pay(checkoutId: string, open: () => void): Promise<SdkOutcome> {
    const entry = entries.get(checkoutId);
    if (!entry) return 'failed';
    const { prepared, customer } = entry;
    const result = await startRazorpay(
      {
        keyId: prepared.razorpayKeyId,
        razorpayOrderId: prepared.razorpayOrderId,
        amount: prepared.amount,
        prefill: {
          name: customer.name,
          contact: customer.phone,
          email: customer.email,
        },
        brand: 'SpoonUp',
        themeColor: colors.olive,
      },
      open,
    );
    if (result.kind === 'success') {
      entry.proof = result.proof;
      return 'success';
    }
    abandon(checkoutId);
    return result.kind === 'cancelled' ? 'cancelled' : 'failed';
  },

  // Idempotent on the backend: re-posting a completed checkout returns the same
  // orders (alreadyCompleted), so polling this is safe.
  async verify(checkoutId: string): Promise<PaymentStatusResult> {
    const entry = entries.get(checkoutId);
    // Nothing to verify (e.g. the app restarted mid-payment). The backend
    // webhook still fulfils a captured payment; it shows up under Orders.
    if (!entry?.proof) return { status: 'pending' };
    if (entry.result) return entry.result;
    let res: CompleteResponse;
    try {
      res = await apiClient.post<CompleteResponse>(
        endpoints.checkout.complete,
        {
          checkoutId,
          checkoutToken: entry.prepared.checkoutToken,
          ...entry.proof,
        },
      );
    } catch (error) {
      // 400 verification failed, 404 unknown, 410 expired: definitive.
      if (
        error instanceof ApiError &&
        (error.status === 400 || error.status === 404 || error.status === 410)
      ) {
        entries.delete(checkoutId);
        return { status: 'failed' };
      }
      throw error;
    }
    const orders = res.orders ?? (res.order ? [res.order] : []);
    await rememberPlacedOrders(orders);
    // Plan-only checkouts create no sub-orders; use the parent's status.
    const paymentStatus =
      orders[0]?.paymentStatus ?? res.parentOrder?.paymentStatus;
    if (paymentStatus !== 'paid') return { status: 'pending' };
    entry.result = {
      status: 'paid',
      paymentReference: entry.proof.razorpayPaymentId,
      orderId: orders[0]?.id,
    };
    return entry.result;
  },
};
