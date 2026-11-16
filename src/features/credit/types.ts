// Shapes of GET /api/me/store-credit and GET /api/me/referrals (website
// server/storeCredit.js, server/referrals.js). Amounts are the backend's.
export type CreditTxn = {
  id: string;
  direction: 'CREDIT' | 'DEBIT';
  type: string; // REFUND_ISSUED | REFERRAL_BONUS | REDEEMED | ADMIN_ADJUSTMENT | EXPIRY
  amount: number;
  reason: string;
  createdAt: string;
};

// Wire shape; `balance` is the backend's name for the customer's credit.
export type CreditResponse = { balance: number; transactions: CreditTxn[] };
// What the app uses.
export type CreditStatement = { available: number; transactions: CreditTxn[] };

export type ReferralRule = {
  enabled: boolean;
  referrerAmount: number;
  referredAmount: number;
  minOrderAmount: number;
  rewardTrigger: 'ON_PAYMENT' | 'AFTER_DELIVERY';
  holdDays: number;
};

export type Referral = {
  code: string | null;
  rule: ReferralRule;
  joined: number;
  rewarded: number;
  earned: number;
};
