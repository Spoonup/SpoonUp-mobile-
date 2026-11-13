import { mocksEnabled } from '../../../services/api/mode';
import { orderTokens } from '../../../services/storage/orderTokens';
import type { Order } from '../types';
import { ordersService } from './ordersService';

export type RecentOrders = { orders: Order[]; unavailable: number };

const MOCK_GUEST_IDS = ['SU-24817', 'SU-24802'];

export const guestOrderService = {
  // The website's real guest mechanism (src/pages/OrderStatus.jsx): the
  // backend only serves GET /api/orders/:id to the order's owner or to someone
  // holding its secret accessToken (`x-order-token`), and has no order-number
  // lookup for non-admins. So "track an order" means: re-read the orders this
  // device was given tokens for at checkout. Read-only, no new auth scheme.
  async listRecent(): Promise<RecentOrders> {
    if (mocksEnabled) {
      const all = await ordersService.list();
      return {
        orders: all.filter(order => MOCK_GUEST_IDS.includes(order.id)),
        unavailable: 0,
      };
    }
    const remembered = await orderTokens.list();
    const results = await Promise.allSettled(
      remembered.map(o => ordersService.get(o.id)),
    );
    const orders = results.flatMap(r =>
      r.status === 'fulfilled' ? [r.value] : [],
    );
    return { orders, unavailable: results.length - orders.length };
  },
};
