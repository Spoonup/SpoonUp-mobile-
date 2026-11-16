import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { ApiError } from '../../../services/api/interceptors';
import { mocksEnabled } from '../../../services/api/mode';
import type { CreditResponse, CreditStatement, Referral } from '../types';

// MOCK data (mock mode only); live mode shows exactly what the backend sends.
const MOCK_STATEMENT: CreditStatement = {
  available: 150,
  transactions: [
    {
      id: 'm1',
      direction: 'CREDIT',
      type: 'REFUND_ISSUED',
      amount: 150,
      reason: 'Refund for a missing item',
      createdAt: '2026-09-24T10:00:00Z',
    },
  ],
};
const MOCK_REFERRAL: Referral = {
  code: 'ANANYA150',
  rule: {
    enabled: true,
    referrerAmount: 100,
    referredAmount: 100,
    minOrderAmount: 350,
    rewardTrigger: 'AFTER_DELIVERY',
    holdDays: 0,
  },
  joined: 3,
  rewarded: 1,
  earned: 100,
};

export const creditService = {
  // A new account has no credit row until the server creates one (404): that
  // is a genuine zero, not an error (same as the website).
  async statement(): Promise<CreditStatement> {
    if (mocksEnabled) return MOCK_STATEMENT;
    try {
      const res = await apiClient.get<CreditResponse>(endpoints.storeCredit);
      return {
        available: Number(res.balance) || 0,
        transactions: res.transactions ?? [],
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { available: 0, transactions: [] };
      }
      throw error;
    }
  },

  async referral(): Promise<Referral> {
    if (mocksEnabled) return MOCK_REFERRAL;
    return apiClient.get<Referral>(endpoints.myReferrals);
  },
};
