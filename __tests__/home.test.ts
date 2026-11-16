import {
  TILE_COLUMNS,
  deliveryKicker,
  greetingFor,
  initialsOf,
  isReturning,
  livePlan,
  nextDelivery,
  orderAgain,
  planDay,
  subline,
} from '../src/features/home/logic';

const sub = {
  id: 's1',
  status: 'ACTIVE',
  activatedAt: '2026-11-12T08:00:00Z',
  expiresAt: '2026-12-12T08:00:00Z',
  parentOrderId: null,
  productId: 'pudding',
  deliveryCount: 30,
  deliveries: [
    { sequenceNo: 1, scheduledDate: '2026-11-13', status: 'DELIVERED' },
    { sequenceNo: 3, scheduledDate: '2026-11-15', status: 'PLANNED' },
    { sequenceNo: 2, scheduledDate: '2026-11-14', status: 'PLANNED' },
  ],
};
const now = new Date(2026, 10, 14, 9, 0);

test('greeting by device hour, first visit, and guest', () => {
  expect(greetingFor('sushant n', false, 9)).toBe('Hi Sushant, welcome in');
  expect(greetingFor('mobiletest_ab12', false, 9)).toBe('Hi there');
  expect(greetingFor('mobiletest_ab12', true, 9)).toBe('Good morning');
  expect(greetingFor('Ananya Rao', true, 9)).toBe('Good morning, Ananya');
  expect(greetingFor('Ananya', true, 13)).toBe('Good afternoon, Ananya');
  expect(greetingFor('Ananya', true, 20)).toBe('Good evening, Ananya');
  expect(greetingFor(undefined, false, 9)).toBe('Hi there');
  expect(initialsOf('Ananya Rao')).toBe('AR');
  expect(initialsOf(undefined)).toBe('G');
});

test('first visit vs returning comes from orders and plans', () => {
  expect(isReturning(false, [{} as never], [sub])).toBe(false);
  expect(isReturning(true, [], [])).toBe(false);
  expect(isReturning(true, [{} as never], [])).toBe(true);
  expect(isReturning(true, [], [sub])).toBe(true);
});

test('plan day, subline and next delivery', () => {
  expect(planDay('2026-11-12T08:00:00Z', now)).toBe(3);
  expect(livePlan([sub], now)).toBe(sub);
  expect(subline(sub, 'chia', now)).toBe(
    'Day 3 of your chia plan. Nice going.',
  );
  expect(subline(undefined, undefined, now)).toBe(
    'Eat-now delivers in about 30–45 min.',
  );
  expect(nextDelivery(sub, now)?.sequenceNo).toBe(2);
  expect(deliveryKicker('2026-11-15', now)).toBe('TOMORROW');
  expect(deliveryKicker('2026-11-14', now)).toBe('TODAY');
});

test('order again maps past order items to catalog, deduped', () => {
  const catalog = [
    { id: 'a', name: 'Dragonfruit Smoothie' },
    { id: 'b', name: 'Tikki' },
  ] as never[];
  const orders = [
    { items: [{ name: 'dragonfruit smoothie', quantity: 1 }] },
    {
      items: [
        { name: 'Dragonfruit Smoothie', quantity: 2 },
        { name: 'x', quantity: 1 },
      ],
    },
  ] as never[];
  expect(
    orderAgain(orders, catalog).map(p => (p as { id: string }).id),
  ).toEqual(['a']);
});

test('tiles are a 2-column grid', () => {
  expect(TILE_COLUMNS).toBe(2);
});
