import type { Order } from '../types';

const orders: Order[] = [
  {
    id: 'SU-24817',
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
  // MOCK: replace with API (GET /orders). Status and totals are backend-owned.
  async list(): Promise<Order[]> {
    await delay();
    return [...orders];
  },
  // MOCK: the backend creates the order at checkout; this stands in for it.
  add(order: Order): void {
    if (!orders.some(item => item.id === order.id)) orders.unshift(order);
  },
  // MOCK: replace with API (GET /orders/:id), enforcing ownership server-side.
  async get(id: string): Promise<Order> {
    await delay();
    const order = orders.find(item => item.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },
};
