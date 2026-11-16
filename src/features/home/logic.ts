import type { Order } from '../orders/types';
import type { Product } from '../shop/data/products';
import type { PlanRow } from '../plan/types';

const DAY_MS = 24 * 60 * 60 * 1000;

// 2-up tile row: two equal columns filling the width, one gap, no third column.
export const TILE_COLUMNS = 2;
export const TILE_GAP = 14;

export const timeGreeting = (hour: number): string =>
  hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

// First name for greetings. Backend `name` can be a login username
// (e.g. "mobiletest_x7k2"); those read badly, so they yield '' and the
// greeting falls back to the nameless form.
export const firstNameOf = (name?: string | null): string => {
  const first = name?.trim().split(/\s+/)[0] ?? '';
  if (/[_\d@.]/.test(first) || first.length > 14) return '';
  return first.charAt(0).toUpperCase() + first.slice(1);
};

export const initialsOf = (name?: string | null): string => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'G';
  return parts
    .slice(0, 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('');
};

// First visit = no orders and no plan ever; guests are always first visit.
export const isReturning = (
  signedIn: boolean,
  orders: Order[],
  subs: PlanRow[],
): boolean =>
  signedIn && (orders.length > 0 || subs.some(s => !!s.activatedAt));

export const greetingFor = (
  name: string | null | undefined,
  returning: boolean,
  hour: number,
): string => {
  const first = firstNameOf(name);
  if (!first) return returning ? timeGreeting(hour) : 'Hi there';
  return returning
    ? `${timeGreeting(hour)}, ${first}`
    : `Hi ${first}, welcome in`;
};

// A live (ACTIVE/PAUSED, unexpired) plan; latest activated wins.
export const livePlan = (
  subs: PlanRow[],
  now = new Date(),
): PlanRow | undefined =>
  subs
    .filter(
      s =>
        (s.status === 'ACTIVE' || s.status === 'PAUSED') &&
        s.activatedAt &&
        s.expiresAt &&
        new Date(s.expiresAt).getTime() > now.getTime(),
    )
    .sort((a, b) =>
      (b.activatedAt as string).localeCompare(a.activatedAt as string),
    )[0];

const midnight = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const calendarDays = (from: Date, to: Date) =>
  Math.round((midnight(to) - midnight(from)) / DAY_MS);

// Display only: day 1 on the activation day, capped at the pass length.
export const planDay = (activatedAt: string, now = new Date(), cap = 30) =>
  Math.min(cap, Math.max(1, calendarDays(new Date(activatedAt), now) + 1));

export const subline = (
  sub: PlanRow | undefined,
  dish: string | undefined,
  now = new Date(),
): string =>
  sub?.activatedAt
    ? `Day ${planDay(sub.activatedAt, now)} of your ${
        dish ? `${dish} ` : ''
      }plan. Nice going.`
    : 'Eat-now delivers in about 30–45 min.';

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

// Next planned (not yet delivered/skipped) delivery on or after today.
export const nextDelivery = (sub: PlanRow, now = new Date()) =>
  (sub.deliveries ?? [])
    .filter(d => d.status === 'PLANNED' && d.scheduledDate >= isoDay(now))
    .sort((a, b) => a.sequenceNo - b.sequenceNo)[0];

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

export const deliveryKicker = (scheduledDate: string, now = new Date()) => {
  if (scheduledDate === isoDay(now)) return 'TODAY';
  if (scheduledDate === isoDay(new Date(now.getTime() + DAY_MS)))
    return 'TOMORROW';
  const d = new Date(`${scheduledDate}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

// Distinct catalog products from past orders (API order = newest first).
export const orderAgain = (
  orders: Order[],
  catalog: Product[],
  max = 8,
): Product[] => {
  const byName = new Map(catalog.map(p => [p.name.toLowerCase(), p]));
  const found = new Map<string, Product>();
  for (const order of orders)
    for (const item of order.items) {
      const product = byName.get(item.name.toLowerCase());
      if (product) found.set(product.id, product);
    }
  return [...found.values()].slice(0, max);
};
