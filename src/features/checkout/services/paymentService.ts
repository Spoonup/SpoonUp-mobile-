import { ordersService } from '../../orders/services/ordersService';
import type { DeliveryType, Order } from '../../orders/types';
import type { CartLine } from '../../cart/services/cartService';
import type {
  Address,
  DeliveryOption,
  OrderIntent,
  PaymentStatusResult,
  SdkOutcome,
} from '../types';
import { checkoutService } from './checkoutService';

const DELIVERY_TYPE: Record<DeliveryOption['kind'], DeliveryType> = {
  immediate: 'immediate',
  scheduled: 'scheduled',
  in_days: 'shipped',
};

type CreateParams = {
  lines: CartLine[];
  address: Address;
  option: DeliveryOption;
  couponCode: string | null;
  idempotencyKey: string;
};

// MOCK server state: replace all of this with the backend + provider webhook.
const intents = new Map<string, OrderIntent>();
const pending = new Map<string, { order: Order; polls: number }>();
// First attempt succeeds, then cancel and failure, so retry paths are testable.
const MOCK_SDK_CYCLE: SdkOutcome[] = ['success', 'cancelled', 'failed'];
let attempt = 0;
let counter = 24900;

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export const paymentService = {
  // The key makes order creation idempotent so a double tap or retry reuses
  // the same order instead of creating a duplicate.
  newIdempotencyKey: (): string =>
    `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,

  // MOCK: replace with API (POST /orders with an Idempotency-Key header). The
  // backend recomputes the amount; it never trusts a client total.
  async createOrderIntent(params: CreateParams): Promise<OrderIntent> {
    const existing = intents.get(params.idempotencyKey);
    if (existing) return existing;
    const quote = await checkoutService.getQuote({
      lines: params.lines,
      addressId: params.address.id,
      deliveryOptionId: params.option.id,
      couponCode: params.couponCode,
    });
    counter += 1;
    const orderId = `SU-${counter}`;
    const intent = {
      orderId,
      amount: quote.total,
      idempotencyKey: params.idempotencyKey,
    };
    intents.set(params.idempotencyKey, intent);
    pending.set(orderId, {
      polls: 0,
      order: {
        id: orderId,
        placedAt: 'Just now',
        total: quote.total,
        status: 'placed',
        paymentStatus: 'paid',
        deliveryType: DELIVERY_TYPE[params.option.kind],
        address: `${params.address.line1}, ${params.address.city} ${params.address.pincode}`,
        items: params.lines.map(line => ({
          name: line.product.name,
          quantity: line.quantity,
        })),
      },
    });
    return intent;
  },

  // MOCK: replace with the Razorpay/Cashfree SDK launch. The result is a UI
  // hint only and is never treated as proof of payment.
  async startPayment(_intent: OrderIntent): Promise<SdkOutcome> {
    await delay(600);
    const outcome = MOCK_SDK_CYCLE[attempt % MOCK_SDK_CYCLE.length];
    attempt += 1;
    return outcome;
  },

  // MOCK: replace with API (GET /orders/:id/payment-status), set by the
  // provider webhook. Reports 'pending' twice before 'paid'.
  async getPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    await delay(400);
    const entry = pending.get(orderId);
    if (!entry) return { status: 'failed' };
    entry.polls += 1;
    if (entry.polls <= 2) return { status: 'pending' };
    ordersService.add(entry.order);
    return { status: 'paid', paymentReference: `pay_mock_${orderId}` };
  },
};
