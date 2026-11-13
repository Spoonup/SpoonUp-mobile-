export type PlanStatus = 'none' | 'active' | 'expired';

// Fixed, server-controlled offer. The app never computes or edits the price.
export type PlanOffer = {
  price: number;
  validityDays: number;
  benefits: string[];
};

// What the backend stores after a verified payment.
export type PlanRecord = {
  startsAt: string;
  expiresAt: string;
  paymentReference: string;
};

export type Plan = {
  status: PlanStatus;
  offer: PlanOffer;
  startsAt?: string;
  expiresAt?: string;
  paymentReference?: string;
  daysLeft: number;
};

export type PlanIntent = {
  planOrderId: string;
  amount: number;
  idempotencyKey: string;
};

// Backend subscription row (GET /api/me/subscriptions). A plan is a fixed
// 30-day pass: ACTIVE after verified payment, activatedAt/expiresAt set by the
// backend.
export type ApiSubscription = {
  id: string;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
  parentOrderId: string | null;
};

// Backend-priced plan quote (POST /api/cart/quote with a SUBSCRIPTION line).
export type PlanQuote = {
  total: number;
  deliveryCount: number;
  validityDays: number;
};

export type PlanOptions = { frequencies: string[]; validityDays: number };
