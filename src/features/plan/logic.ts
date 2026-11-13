import type { ApiSubscription, Plan, PlanOffer, PlanRecord } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Display only: whole days remaining, rounded up, never negative.
export const daysLeft = (expiresAt: string, now = new Date()): number =>
  Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / DAY_MS),
  );

// Stand-in for the backend's status mapping: no record = none, an expiry in
// the future = active, otherwise expired.
export const derivePlan = (
  offer: PlanOffer,
  record: PlanRecord | null,
  now = new Date(),
): Plan => {
  if (!record) return { status: 'none', offer, daysLeft: 0 };
  const left = daysLeft(record.expiresAt, now);
  return {
    ...record,
    offer,
    status:
      new Date(record.expiresAt).getTime() > now.getTime()
        ? 'active'
        : 'expired',
    daysLeft: left,
  };
};

export const formatPlanDate = (iso: string): string => {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const daysLeftLabel = (days: number): string =>
  days === 1 ? '1 day left' : `${days} days left`;

// Delivery frequency ids come from the backend (/api/settings); these are the
// site's display labels for them.
const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: 'Every day',
  ALTERNATE_DAYS: 'Alternate days',
  TWICE_WEEKLY: 'Twice a week',
  WEEKLY: 'Weekly',
};
export const frequencyLabel = (id: string): string => FREQUENCY_LABEL[id] ?? id;

// Maps the backend's subscriptions to the single plan the app shows: a live
// (ACTIVE/PAUSED, not past its expiry) pass wins; otherwise the latest
// activated one is "expired"; unpaid (PENDING_PAYMENT) rows are ignored.
export const planFromSubscriptions = (
  subs: ApiSubscription[],
  offer: PlanOffer,
  now = new Date(),
): Plan => {
  const isLive = (s: ApiSubscription) =>
    (s.status === 'ACTIVE' || s.status === 'PAUSED') &&
    new Date(s.expiresAt as string).getTime() > now.getTime();
  const activated = subs
    .filter(s => s.activatedAt && s.expiresAt)
    .sort((a, b) =>
      (b.activatedAt as string).localeCompare(a.activatedAt as string),
    );
  const current = activated.find(isLive) ?? activated[0];
  if (!current) return { status: 'none', offer, daysLeft: 0 };
  return {
    status: isLive(current) ? 'active' : 'expired',
    offer,
    startsAt: current.activatedAt as string,
    expiresAt: current.expiresAt as string,
    paymentReference: current.parentOrderId ?? current.id,
    daysLeft: daysLeft(current.expiresAt as string, now),
  };
};
