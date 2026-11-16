// Live (EXPO_PUBLIC_USE_MOCKS=false): the backend has no standalone plan
// route. Like the website, a plan is a SUBSCRIPTION cart line (product +
// frequency) priced by /api/cart/quote and bought through checkout
// prepare/complete; status comes from /api/me/subscriptions. Mock paths below
// remain the default.
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { ApiError } from '../../../services/api/interceptors';
import { mocksEnabled } from '../../../services/api/mode';
import { secureTokenStore } from '../../../services/storage/secureTokenStore';
import type {
  Address,
  PaymentStatusResult,
  SdkOutcome,
} from '../../checkout/types';
import { liveCheckout, type Customer } from '../../payments/liveCheckout';
import { paymentService } from '../../checkout/services/paymentService';
import { catalogService } from '../../shop/services/catalogService';
import { derivePlan, planFromSubscriptions } from '../logic';
import type {
  ApiSubscription,
  Plan,
  PlanIntent,
  PlanOffer,
  PlanOptions,
  PlanQuote,
  PlanRow,
  PlanRecord,
} from '../types';

export type PlanInput = {
  productId: string;
  frequency: string;
  address: Address;
  customer: Customer;
  // SpoonUp credit to use (display estimate; the backend clamps it).
  creditAmount?: number;
};

const subscriptionLine = (productId: string, frequency: string) => ({
  id: productId,
  quantity: 1,
  purchaseMode: 'SUBSCRIPTION',
  frequency,
});

const liveIntents = new Map<string, PlanIntent>();

// MOCK server state: replace all of this with the backend + provider webhook.
// Set `record` to an expired date to preview the Expired Plan screen.
const OFFER: PlanOffer = {
  price: 7380,
  validityDays: 30,
  benefits: [
    'One payment, 30 days of access',
    'Price is fixed by SpoonUp, never changed in the app',
    'Pay once. It never renews by itself',
    'Priority support while your plan is active',
  ],
};
let record: PlanRecord | null = null;
const intents = new Map<string, PlanIntent>();
const polls = new Map<string, number>();
let counter = 100;
// First attempt succeeds, then cancel and failure, so retry paths are testable.
const MOCK_SDK_CYCLE: SdkOutcome[] = ['success', 'cancelled', 'failed'];
let attempt = 0;

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export const planService = {
  newIdempotencyKey: paymentService.newIdempotencyKey,

  // MOCK: replace with API (GET /plan). The offer is public, the plan status
  // is per user and needs auth; status is decided by the backend.
  async getPlan(): Promise<Plan> {
    if (!mocksEnabled) {
      const { validityDays } = await planService.getOptions();
      // Per-plan prices come from the quote; there is no fixed offer price.
      const offer = { price: 0, validityDays, benefits: [] };
      if (!(await secureTokenStore.getToken())) return derivePlan(offer, null);
      try {
        const subs = await apiClient.get<ApiSubscription[]>(
          endpoints.mySubscriptions,
        );
        return planFromSubscriptions(subs, offer);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return derivePlan(offer, null);
        }
        throw error;
      }
    }
    await delay(400);
    return derivePlan(OFFER, record);
  },

  // MOCK: replace with API (POST /plan/orders with an Idempotency-Key header).
  // The backend sets the amount; a repeated key returns the same order.
  // Live: GET /api/settings (public): the frequencies the backend accepts and
  // the fixed pass length.
  async getOptions(): Promise<PlanOptions> {
    const settings = await apiClient.get<{
      subscriptionFrequencies?: string[];
      subscriptionPlanDurationDays?: number;
    }>(endpoints.settings);
    return {
      frequencies: settings.subscriptionFrequencies ?? [],
      validityDays: settings.subscriptionPlanDurationDays ?? 30,
    };
  },

  // Live: POST /api/cart/quote with a SUBSCRIPTION line. Price, GST and
  // delivery count are the backend's.
  async quote(productId: string, frequency: string): Promise<PlanQuote> {
    const res = await apiClient.post<{
      totals: { calculatedTotal: number };
      subscriptions: { deliveryCount: number; planDurationDays: number }[];
    }>(endpoints.cartQuote, {
      lines: [subscriptionLine(productId, frequency)],
    });
    const sub = res.subscriptions[0];
    return {
      total: res.totals.calculatedTotal,
      deliveryCount: sub.deliveryCount,
      validityDays: sub.planDurationDays,
    };
  },

  // Live: the signed-in customer's raw subscription rows (home/next delivery).
  // Mocks and guests have none.
  async getPlanRows(): Promise<PlanRow[]> {
    return planService.getSubscriptions();
  },

  async getSubscriptions(): Promise<ApiSubscription[]> {
    if (mocksEnabled || !(await secureTokenStore.getToken())) return [];
    return apiClient.get<ApiSubscription[]>(endpoints.mySubscriptions);
  },

  // Live: lowest per-jar price across the backend's frequencies for the
  // cheapest plan-able dish (display only: backend quote total / deliveries).
  // null when mocked or unavailable, so Home shows no "from" price.
  async fromPerJar(): Promise<number | null> {
    if (mocksEnabled) return null;
    const [products, options] = await Promise.all([
      catalogService.list(),
      planService.getOptions(),
    ]);
    const dish = products
      .filter(p => p.canSubscribe)
      .sort((a, b) => a.price - b.price)[0];
    if (!dish || options.frequencies.length === 0) return null;
    const quotes = await Promise.all(
      options.frequencies.map(f => planService.quote(dish.id, f)),
    );
    return Math.min(...quotes.map(q => q.total / q.deliveryCount));
  },

  async createPlanIntent(
    idempotencyKey: string,
    input?: PlanInput,
  ): Promise<PlanIntent> {
    if (!mocksEnabled) {
      const cached = liveIntents.get(idempotencyKey);
      if (cached) return cached;
      if (!input) throw new Error('Choose a plan first.');
      // startDate is omitted: the backend defaults it (the next day).
      const prepared = await liveCheckout.prepare(
        {
          lines: [subscriptionLine(input.productId, input.frequency)],
          ...(input.creditAmount
            ? { storeCreditAmount: input.creditAmount }
            : {}),
          deliveryAddress: {
            line1: input.address.line1,
            city: input.address.city,
            pincode: input.address.pincode,
          },
        },
        input.customer,
      );
      const live = {
        planOrderId: prepared.checkoutId,
        amount: prepared.amount,
        idempotencyKey,
      };
      liveIntents.set(idempotencyKey, live);
      return live;
    }
    await delay(300);
    const existing = intents.get(idempotencyKey);
    if (existing) return existing;
    counter += 1;
    const intent = {
      planOrderId: `PLAN-${counter}`,
      amount: OFFER.price,
      idempotencyKey,
    };
    intents.set(idempotencyKey, intent);
    return intent;
  },

  // MOCK: replace with the Razorpay SDK launch. The result is a UI hint only
  // and is never treated as proof of payment.
  async startPayment(
    intent: PlanIntent,
    open: () => void = () => {},
  ): Promise<SdkOutcome> {
    if (!mocksEnabled) {
      const outcome = await liveCheckout.pay(intent.planOrderId, open);
      if (outcome !== 'success') liveIntents.delete(intent.idempotencyKey);
      return outcome;
    }
    await delay(600);
    const outcome = MOCK_SDK_CYCLE[attempt % MOCK_SDK_CYCLE.length];
    attempt += 1;
    return outcome;
  },

  // MOCK: replace with API (GET /plan/orders/:id/payment-status), set by the
  // provider webhook. Reports 'pending' twice before 'paid'. Access starts
  // here, server side, only once payment is verified.
  async getPaymentStatus(planOrderId: string): Promise<PaymentStatusResult> {
    if (!mocksEnabled) return liveCheckout.verify(planOrderId);
    await delay(400);
    if (![...intents.values()].some(i => i.planOrderId === planOrderId)) {
      return { status: 'failed' };
    }
    const count = (polls.get(planOrderId) ?? 0) + 1;
    polls.set(planOrderId, count);
    if (count <= 2) return { status: 'pending' };
    const paymentReference = `pay_mock_${planOrderId}`;
    if (!record || record.paymentReference !== paymentReference) {
      const start = new Date();
      record = {
        startsAt: start.toISOString(),
        expiresAt: new Date(
          start.getTime() + OFFER.validityDays * 24 * 60 * 60 * 1000,
        ).toISOString(),
        paymentReference,
      };
    }
    return { status: 'paid', paymentReference };
  },
};
