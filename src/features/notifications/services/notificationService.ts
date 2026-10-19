import type { AppNotification } from '../types';

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 400));
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// MOCK: in-memory store standing in for the notifications API (push payloads
// are produced by the backend). Replace with API.
let items: AppNotification[] = [
  {
    id: 'n1',
    type: 'out_for_delivery',
    title: 'Out for delivery',
    body: 'Order SU-24817 is on its way.',
    createdAt: ago(10 * MIN),
    read: false,
    orderId: 'SU-24817',
  },
  {
    id: 'n2',
    type: 'support_reply',
    title: 'New reply from support',
    body: 'We’ve replied to your ticket T-1002.',
    createdAt: ago(40 * MIN),
    read: false,
    ticketId: 'T-1002',
  },
  {
    id: 'n5',
    type: 'plan_expiring',
    title: 'Your plan ends in 3 days',
    body: 'Your 30-day plan ends soon. Renew with a new one-time purchase.',
    createdAt: ago(2 * HOUR),
    read: false,
  },
  {
    id: 'n6',
    type: 'plan_activated',
    title: 'Your 30-day plan is active',
    body: 'Payment verified. Your plan is now active.',
    createdAt: ago(75 * HOUR),
    read: true,
  },
  {
    id: 'n3',
    type: 'order_confirmed',
    title: 'Order confirmed',
    body: 'Order SU-24810 is confirmed.',
    createdAt: ago(30 * HOUR),
    read: true,
    orderId: 'SU-24810',
  },
  {
    id: 'n4',
    type: 'ticket_resolved',
    title: 'Ticket resolved',
    body: 'Ticket T-1002 was marked resolved.',
    createdAt: ago(50 * HOUR),
    read: true,
    ticketId: 'T-1002',
  },
];

export const notificationService = {
  // MOCK: replace with API (GET /notifications, scoped to the signed-in user).
  async list(): Promise<AppNotification[]> {
    await delay();
    return items.map(n => ({ ...n }));
  },
  // MOCK: replace with API (POST /notifications/:id/read).
  async markRead(id: string): Promise<void> {
    items = items.map(n => (n.id === id ? { ...n, read: true } : n));
  },
  // MOCK: replace with API (POST /notifications/read-all).
  async markAllRead(): Promise<void> {
    items = items.map(n => ({ ...n, read: true }));
  },
};
