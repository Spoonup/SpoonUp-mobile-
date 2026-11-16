import {
  creditToApply,
  firstOrderClause,
  payableBeforeCredit,
  withCredit,
} from '../src/features/credit/logic';

const summary = {
  subtotal: 400,
  tax: 20,
  deliveryFee: 0,
  discount: 0,
  total: 420,
};
const rule = {
  enabled: true,
  referrerAmount: 100,
  referredAmount: 100,
  minOrderAmount: 350,
  rewardTrigger: 'AFTER_DELIVERY' as const,
  holdDays: 0,
};

test('credit is clamped to what is owed and comes off after the coupon', () => {
  expect(creditToApply(150, 420)).toBe(150);
  expect(creditToApply(500, 420)).toBe(420);
  expect(creditToApply(0, 420)).toBe(0);
  const coupon = { ...summary, discount: 50, finalAtPayment: true };
  expect(payableBeforeCredit(coupon)).toBe(370);
  const out = withCredit(coupon, 150);
  expect(out).toMatchObject({ credit: 150, total: 220, finalAtPayment: false });
  expect(withCredit(summary, 0)).toBe(summary);
});

test('referral timing copy is built from the backend rule', () => {
  expect(firstOrderClause(rule)).toBe(
    'once your friend’s first order of ₹350 or more is delivered',
  );
  expect(firstOrderClause({ ...rule, holdDays: 3 }, 'your')).toContain(
    '3 days after your first order',
  );
});
