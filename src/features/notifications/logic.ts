import type { AppNotification } from './types';

export type NotificationGroup = {
  title: 'Today' | 'Earlier';
  items: AppNotification[];
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Newest first; empty groups are dropped.
export const groupNotifications = (
  list: AppNotification[],
  now = new Date(),
): NotificationGroup[] => {
  const sorted = [...list].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const today = sorted.filter(n => sameDay(new Date(n.createdAt), now));
  const earlier = sorted.filter(n => !sameDay(new Date(n.createdAt), now));
  return [
    { title: 'Today' as const, items: today },
    { title: 'Earlier' as const, items: earlier },
  ].filter(group => group.items.length > 0);
};

export type NotificationTarget =
  | { name: 'TicketDetails'; params: { ticketId: string } }
  | { name: 'OrderDetails'; params: { orderId: string } }
  | { name: 'Plans' }
  | null;

// Support types open the ticket, plan types the Plans tab, the rest the order.
export const routeFor = (n: AppNotification): NotificationTarget => {
  if (n.type === 'support_reply' || n.type === 'ticket_resolved') {
    return n.ticketId
      ? { name: 'TicketDetails', params: { ticketId: n.ticketId } }
      : null;
  }
  if (n.type === 'plan_activated' || n.type === 'plan_expiring') {
    return { name: 'Plans' };
  }
  return n.orderId
    ? { name: 'OrderDetails', params: { orderId: n.orderId } }
    : null;
};

export const unreadCount = (list: AppNotification[] = []): number =>
  list.filter(n => !n.read).length;
