import {
  routeAfterSdk,
  routeAfterStatus,
} from '../src/features/checkout/paymentFlow';
import { routeFor } from '../src/features/notifications/logic';
import { daysLeft, derivePlan } from '../src/features/plan/logic';
import { planService } from '../src/features/plan/services/planService';

const offer = { price: 100, validityDays: 30, benefits: [] };
const now = new Date('2026-10-17T12:00:00Z');
const record = (expiresAt: string) => ({
  startsAt: '2026-09-17T12:00:00Z',
  expiresAt,
  paymentReference: 'pay_1',
});

describe('plan state mapping', () => {
  test('none, active, expired', () => {
    expect(derivePlan(offer, null, now).status).toBe('none');
    expect(derivePlan(offer, record('2026-10-20T12:00:00Z'), now).status).toBe(
      'active',
    );
    expect(derivePlan(offer, record('2026-10-17T12:00:00Z'), now).status).toBe(
      'expired',
    );
    expect(
      derivePlan(offer, record('2026-10-01T12:00:00Z'), now).daysLeft,
    ).toBe(0);
  });
});

describe('daysLeft', () => {
  test('rounds up and never goes negative', () => {
    expect(daysLeft('2026-10-18T12:00:00Z', now)).toBe(1);
    expect(daysLeft('2026-10-18T13:00:00Z', now)).toBe(2);
    expect(daysLeft('2026-10-01T00:00:00Z', now)).toBe(0);
  });
});

describe('plan payment', () => {
  test('SDK success only leads to verification, never to active', () => {
    expect(routeAfterSdk('success')).toBe('verify');
    expect(routeAfterStatus(undefined)).toBe('wait');
    expect(routeAfterStatus('pending')).toBe('wait');
  });

  test('plan is none until the backend reports paid, and keys are idempotent', async () => {
    const key = planService.newIdempotencyKey();
    const intent = await planService.createPlanIntent(key);
    expect(await planService.createPlanIntent(key)).toEqual(intent);
    expect((await planService.getPlan()).status).toBe('none');
    // SDK reports success but the backend is still pending.
    expect(await planService.startPayment(intent)).toBe('success');
    expect(
      (await planService.getPaymentStatus(intent.planOrderId)).status,
    ).toBe('pending');
    expect((await planService.getPlan()).status).toBe('none');
    await planService.getPaymentStatus(intent.planOrderId);
    const paid = await planService.getPaymentStatus(intent.planOrderId);
    expect(paid.status).toBe('paid');
    const plan = await planService.getPlan();
    expect(plan.status).toBe('active');
    expect(plan.paymentReference).toBe(paid.paymentReference);
  });

  test('unknown plan order is failed', async () => {
    expect((await planService.getPaymentStatus('nope')).status).toBe('failed');
  });
});

describe('plan notifications', () => {
  test('route to Plans', () => {
    for (const type of ['plan_activated', 'plan_expiring'] as const) {
      expect(
        routeFor({
          id: '1',
          type,
          title: '',
          body: '',
          createdAt: '',
          read: false,
        }),
      ).toEqual({ name: 'Plans' });
    }
  });
});
