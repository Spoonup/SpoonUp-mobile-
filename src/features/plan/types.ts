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
