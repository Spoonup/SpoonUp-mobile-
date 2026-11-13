import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { mocksEnabled } from '../../../services/api/mode';
import { orderTokens } from '../../../services/storage/orderTokens';
import type { DeliveryType, Order, OrderStatus, PaymentStatus } from '../types';

// Backend sub-order (GET /api/me/orders, GET /api/orders/:id, and the orders
// returned by POST /api/checkout/complete). The parent/sub-order split is
// hidden here: each sub-order is shown as one order.
export type ApiOrder = {
  id: string;
  orderNumber?: number | string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  subOrderType?: string;
  scheduledFor?: string | null;
  expectedShipDate?: string | null;
  trackingLink?: string;
  accessToken?: string;
  deliveryAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    pincode?: string;
  } | null;
  items?: { name?: string; productName?: string; quantity: number }[];
};

export const mapStatus = (status: string): OrderStatus => {
  switch (status) {
    case 'preparing':
    case 'ready':
    case 'sourcing':
    case 'packed':
      return 'preparing';
    case 'out_for_delivery':
    case 'shipped':
      return 'out_for_delivery';
    case 'delivered':
    case 'completed':
      return 'delivered';
    case 'cancelled':
    case 'rejected':
    case 'refunded':
    case 'returned':
    case 'failed_delivery':
      return 'cancelled';
    default:
      return 'placed'; // pending, scheduled
  }
};

export const mapPayment = (status?: string): PaymentStatus =>
  status === 'paid'
    ? 'paid'
    : status === 'failed'
    ? 'failed'
    : status === 'refunded'
    ? 'refunded'
    : 'pending';

const mapDelivery = (type?: string): DeliveryType =>
  type === 'DELIVERY_IN_DAYS'
    ? 'shipped'
    : type === 'SCHEDULED'
    ? 'scheduled'
    : 'immediate';

export const orderFromApi = (o: ApiOrder): Order => ({
  id: o.id,
  number: o.orderNumber != null ? `SU-${o.orderNumber}` : o.id,
  placedAt: new Date(o.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }),
  total: Number(o.totalAmount),
  status: mapStatus(o.status),
  paymentStatus: mapPayment(o.paymentStatus),
  deliveryType: mapDelivery(o.subOrderType),
  address: o.deliveryAddress
    ? [
        o.deliveryAddress.line1,
        o.deliveryAddress.line2,
        o.deliveryAddress.city,
        o.deliveryAddress.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : '',
  items: (o.items ?? []).map(i => ({
    name: i.name ?? i.productName ?? '',
    quantity: i.quantity,
  })),
  // The backend sends no ETA text for these fields; none is computed here.
  ...(o.trackingLink ? { trackingLink: o.trackingLink } : {}),
});

// Orders returned to the placer carry the secret accessToken; keep it on the
// device so the order can be read back without signing in (guest tracking).
export const rememberPlacedOrders = (orders: ApiOrder[]) =>
  orderTokens.remember(
    orders.flatMap(o =>
      o.accessToken
        ? [{ id: o.id, accessToken: o.accessToken, orderNumber: o.orderNumber }]
        : [],
    ),
  );

const orders: Order[] = [
  {
    id: 'SU-24817',
    number: 'SU-24817',
    placedAt: '22 Sep, 6:42 pm',
    total: 598,
    status: 'out_for_delivery',
    etaText: 'Arriving in about 25 min',
    paymentStatus: 'paid',
    deliveryType: 'immediate',
    address: '14, 3rd Cross, HSR Layout, Bengaluru 560102',
    items: [
      { name: 'Sabudana Sweet Potato Tikki', quantity: 1 },
      { name: 'Green Glow Smoothie', quantity: 1 },
    ],
  },
  {
    id: 'SU-24810',
    number: 'SU-24810',
    placedAt: '21 Sep, 11:10 am',
    total: 899,
    status: 'preparing',
    etaText: 'Ships in 3–5 days',
    paymentStatus: 'paid',
    deliveryType: 'shipped',
    address: '14, 3rd Cross, HSR Layout, Bengaluru 560102',
    items: [{ name: 'Kashmiri Dry Fruits', quantity: 1 }],
  },
  {
    id: 'SU-24802',
    number: 'SU-24802',
    placedAt: '19 Sep, 7:30 pm',
    total: 698,
    status: 'delivered',
    paymentStatus: 'paid',
    deliveryType: 'scheduled',
    address: '14, 3rd Cross, HSR Layout, Bengaluru 560102',
    items: [{ name: 'Peri Peri House Fries', quantity: 2 }],
  },
];

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 400));

export const ordersService = {
  // Live: GET /api/me/orders. Status and totals are backend-owned.
  async list(): Promise<Order[]> {
    if (!mocksEnabled) {
      const rows = await apiClient.get<ApiOrder[]>(endpoints.myOrders);
      return rows.map(orderFromApi);
    }
    await delay();
    return [...orders];
  },
  // MOCK: the backend creates the order at checkout; this stands in for it.
  add(order: Order): void {
    if (!orders.some(item => item.id === order.id)) orders.unshift(order);
  },
  // Live: GET /api/orders/:id. Authorised by the owner's bearer token or the
  // order's x-order-token (kept on this device); 404 otherwise.
  async get(id: string): Promise<Order> {
    if (!mocksEnabled) {
      const token = await orderTokens.tokenFor(id);
      return orderFromApi(
        await apiClient.get<ApiOrder>(endpoints.order(id), {
          headers: token ? { 'x-order-token': token } : undefined,
        }),
      );
    }
    await delay();
    const order = orders.find(item => item.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },
};
