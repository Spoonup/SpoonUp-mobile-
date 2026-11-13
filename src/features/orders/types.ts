// Customer-facing order. Parent/sub-orders are a backend concern and are
// flattened by the service before reaching the UI.
export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export type DeliveryType = 'immediate' | 'scheduled' | 'shipped';

export type Order = {
  // Stable lookup id (backend order id in live mode).
  id: string;
  // Customer-facing order number, e.g. SU-24817. Show this, never `id`.
  number: string;
  placedAt: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryType: DeliveryType;
  address: string;
  items: { name: string; quantity: number }[];
  // Backend-provided delivery estimate text; the client never computes it.
  etaText?: string;
  // Courier tracking URL from the backend, when the order has shipped.
  trackingLink?: string;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Order placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Payment pending',
  failed: 'Payment failed',
  refunded: 'Refunded as store credit',
};

export const DELIVERY_LABEL: Record<DeliveryType, string> = {
  immediate: 'Eat now',
  scheduled: 'Scheduled',
  shipped: 'Pantry (ships in 3–5 days)',
};

export const isActive = (order: Order): boolean =>
  order.status !== 'delivered' && order.status !== 'cancelled';
