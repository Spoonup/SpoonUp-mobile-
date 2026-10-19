export type NotificationType =
  | 'order_confirmed'
  | 'status_changed'
  | 'out_for_delivery'
  | 'delivered'
  | 'payment_failed'
  | 'support_reply'
  | 'ticket_resolved'
  | 'plan_activated'
  | 'plan_expiring';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
  ticketId?: string;
};
