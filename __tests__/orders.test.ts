import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildDeliveryOptions } from '../src/features/checkout/services/checkoutService';
import { toApiLines } from '../src/features/checkout/apiLines';
import {
  mapStatus,
  orderFromApi,
} from '../src/features/orders/services/ordersService';
import { derivePlan, planFromSubscriptions } from '../src/features/plan/logic';
import { orderTokens } from '../src/services/storage/orderTokens';

beforeEach(() => AsyncStorage.clear());

test('backend statuses map onto the customer timeline', () => {
  expect(mapStatus('pending')).toBe('placed');
  expect(mapStatus('scheduled')).toBe('placed');
  expect(mapStatus('sourcing')).toBe('preparing');
  expect(mapStatus('shipped')).toBe('out_for_delivery');
  expect(mapStatus('delivered')).toBe('delivered');
  expect(mapStatus('refunded')).toBe('cancelled');
});

test('order mapping uses the backend id for lookups and SU-<number> for display', () => {
  const order = orderFromApi({
    id: 'ord-1',
    orderNumber: 24817,
    createdAt: '2026-11-13T10:00:00Z',
    totalAmount: '598' as never,
    status: 'preparing',
    paymentStatus: 'unpaid',
    subOrderType: 'SCHEDULED',
    deliveryAddress: {
      line1: '14 Cross',
      city: 'Bengaluru',
      pincode: '560102',
    },
    items: [{ name: 'Tikki', quantity: 1 }],
  });
  expect(order).toMatchObject({
    id: 'ord-1',
    number: 'SU-24817',
    total: 598,
    paymentStatus: 'pending',
    deliveryType: 'scheduled',
    address: '14 Cross, Bengaluru, 560102',
  });
  expect(order.etaText).toBeUndefined();
});

test('order tokens: newest first, deduped, capped, ignores entries without a token', async () => {
  await orderTokens.remember([
    { id: 'a', accessToken: 't1' },
    { id: 'b' } as never,
  ]);
  await orderTokens.remember([
    { id: 'a', accessToken: 't2' },
    { id: 'c', accessToken: 't3' },
  ]);
  expect((await orderTokens.list()).map(o => o.id)).toEqual(['a', 'c']);
  expect(await orderTokens.tokenFor('a')).toBe('t2');
  expect(await orderTokens.tokenFor('zzz')).toBeUndefined();
});

// DECISION: pantry sold in a separate app/site, so there is no courier option.
test('delivery options: ASAP + slots for kitchen items, no courier, no ETA invented', () => {
  const lines = [
    { product: { category: 'now' }, quantity: 1 },
    { product: { category: 'ships' }, quantity: 1 },
  ] as never;
  const day = (label: string, n: number) => ({
    date: label,
    label,
    slots: Array.from({ length: n }, (_, i) => ({
      start: `${label}-${i}`,
      end: '',
      label: `s${i}`,
    })),
  });
  const slots = {
    enabled: true,
    days: [day('Today', 2), day('Tomorrow', 1), day('Sat', 5)],
  };
  const options = buildDeliveryOptions(lines, slots);
  expect(options.map(o => o.id)).toEqual([
    'now',
    'slot:Today-0',
    'slot:Today-1',
    'slot:Tomorrow-0',
    'slot:Sat-0',
    'slot:Sat-1',
    'slot:Sat-2',
    'slot:Sat-3',
    'slot:Sat-4',
  ]);
  expect(options[1]).toMatchObject({ dayLabel: 'Today', slotLabel: 's0' });
  expect(
    buildDeliveryOptions(lines, { enabled: false, days: [] }).map(o => o.id),
  ).toEqual(['now']);
  expect(buildDeliveryOptions([lines[1]], slots)).toEqual([]);
});

test('api lines carry ids and quantities only; slot goes on kitchen lines', () => {
  const lines = [
    { product: { id: 'a', category: 'now', price: 1 }, quantity: 1 },
    { product: { id: 'b', category: 'ships', price: 9 }, quantity: 3 },
  ] as never;
  expect(toApiLines(lines)).toEqual([
    { id: 'a', quantity: 1 },
    { id: 'b', quantity: 3 },
  ]);
  expect(toApiLines(lines, 'S')).toEqual([
    { id: 'a', quantity: 1, scheduledFor: 'S' },
    { id: 'b', quantity: 3 },
  ]);
});

describe('plan from backend subscriptions', () => {
  const offer = { price: 0, validityDays: 30, benefits: [] };
  const now = new Date('2026-11-13T12:00:00Z');
  const sub = (over: object) => ({
    id: 's',
    status: 'ACTIVE',
    activatedAt: '2026-11-01T00:00:00Z',
    expiresAt: '2026-12-01T00:00:00Z',
    parentOrderId: 'par-1',
    ...over,
  });
  test('none when nothing was ever activated (pending payment is ignored)', () => {
    expect(planFromSubscriptions([], offer, now).status).toBe('none');
    expect(
      planFromSubscriptions(
        [
          sub({
            status: 'PENDING_PAYMENT',
            activatedAt: null,
            expiresAt: null,
          }),
        ],
        offer,
        now,
      ).status,
    ).toBe('none');
  });
  test('active wins over an older expired pass; expired otherwise', () => {
    const old = sub({
      id: 'old',
      status: 'COMPLETED',
      expiresAt: '2026-10-01T00:00:00Z',
      activatedAt: '2026-09-01T00:00:00Z',
    });
    const plan = planFromSubscriptions([old, sub({})], offer, now);
    expect(plan).toMatchObject({
      status: 'active',
      paymentReference: 'par-1',
      daysLeft: 18,
    });
    expect(planFromSubscriptions([old], offer, now).status).toBe('expired');
    expect(
      planFromSubscriptions(
        [sub({ expiresAt: '2026-11-13T00:00:00Z' })],
        offer,
        now,
      ).status,
    ).toBe('expired');
  });
  test('mock record logic is unchanged', () => {
    expect(derivePlan(offer, null, now).status).toBe('none');
  });
});
