import type { PaymentStatusResult, SdkOutcome } from '../../checkout/types';
import { paymentService } from '../../checkout/services/paymentService';
import { derivePlan } from '../logic';
import type { Plan, PlanIntent, PlanOffer, PlanRecord } from '../types';

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
    await delay(400);
    return derivePlan(OFFER, record);
  },

  // MOCK: replace with API (POST /plan/orders with an Idempotency-Key header).
  // The backend sets the amount; a repeated key returns the same order.
  async createPlanIntent(idempotencyKey: string): Promise<PlanIntent> {
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
  async startPayment(_intent: PlanIntent): Promise<SdkOutcome> {
    await delay(600);
    const outcome = MOCK_SDK_CYCLE[attempt % MOCK_SDK_CYCLE.length];
    attempt += 1;
    return outcome;
  },

  // MOCK: replace with API (GET /plan/orders/:id/payment-status), set by the
  // provider webhook. Reports 'pending' twice before 'paid'. Access starts
  // here, server side, only once payment is verified.
  async getPaymentStatus(planOrderId: string): Promise<PaymentStatusResult> {
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
