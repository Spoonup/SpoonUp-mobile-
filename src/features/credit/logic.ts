import type { CartSummary } from '../cart/services/cartService';
import { appConfig } from '../../config/appConfig';
import { formatMoney } from '../../utils/money';
import type { CreditTxn, ReferralRule } from './types';

// What is still owed before credit. With a coupon the quote returns the
// pre-coupon total plus the discount; the website subtracts the coupon first,
// then credit (same order as the server).
export const payableBeforeCredit = (s: CartSummary): number =>
  Math.max(0, s.finalAtPayment ? s.total - s.discount : s.total);

// Display estimate only (the website does the same sum). The backend clamps
// and reserves the real amount at prepare and returns the final charge.
export const creditToApply = (available: number, payable: number): number =>
  Math.max(0, Math.min(available, payable));

export const withCredit = (s: CartSummary, applied: number): CartSummary =>
  applied > 0
    ? {
        ...s,
        credit: applied,
        total: payableBeforeCredit(s) - applied,
        finalAtPayment: false,
      }
    : s;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Programme copy built only from the backend rule (website referralCode.js).
export const rewardCopy = (rule: ReferralRule): string => {
  const give = rule.referredAmount;
  const get = rule.referrerAmount;
  if (give > 0 && get > 0) {
    return `Your friend gets ${formatMoney(give)}, you get ${formatMoney(get)}`;
  }
  if (give > 0) return `Your friend gets ${formatMoney(give)} SpoonUp credit`;
  if (get > 0) return `You get ${formatMoney(get)} SpoonUp credit`;
  return '';
};

export const firstOrderClause = (
  rule: ReferralRule,
  owner = 'your friend’s',
): string => {
  const min = rule.minOrderAmount;
  const order = `${owner} first order${
    min > 0 ? ` of ${formatMoney(min)} or more` : ''
  }`;
  if (rule.rewardTrigger === 'ON_PAYMENT') return `once ${order} is paid`;
  return rule.holdDays > 0
    ? `${plural(rule.holdDays, 'day')} after ${order} is delivered`
    : `once ${order} is delivered`;
};

export const shareMessage = (code: string, rule: ReferralRule): string =>
  `Try SpoonUp. Sign up with my code ${code}${
    rule.referredAmount > 0
      ? ` and get ${formatMoney(rule.referredAmount)} SpoonUp credit`
      : ''
  }: ${appConfig.env.apiBaseUrl}/signin?ref=${encodeURIComponent(code)}`;

const TXN_LABEL: Record<string, string> = {
  REFUND_ISSUED: 'Refund',
  REFERRAL_BONUS: 'Referral reward',
  REDEEMED: 'Used on an order',
  ADMIN_ADJUSTMENT: 'Adjustment',
  EXPIRY: 'Expired',
};
export const txnLabel = (t: CreditTxn): string =>
  TXN_LABEL[t.type] ??
  t.type.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase());
