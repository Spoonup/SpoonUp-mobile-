import type { Plan, PlanOffer, PlanRecord } from './types';

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
