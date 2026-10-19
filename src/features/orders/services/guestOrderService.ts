import { ApiError } from '../../../services/api/interceptors';
import type { OrderStatus } from '../types';

export type GuestOrderStatus = {
  reference: string;
  status: OrderStatus;
  placedAt: string;
  etaText?: string;
};

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 400));

// Lets tests/demos force a server outcome.
export const mockGuestControls = { force: null as null | 'rate_limit' };

const known: Record<string, GuestOrderStatus> = {
  'SU-24817': {
    reference: 'SU-24817',
    status: 'out_for_delivery',
    placedAt: '22 Sep, 6:42 pm',
    etaText: 'Arriving in about 25 min',
  },
  'SU-24802': {
    reference: 'SU-24802',
    status: 'delivered',
    placedAt: '19 Sep, 7:30 pm',
  },
};

export const guestOrderService = {
  // MOCK: replace with API using the existing secure guest-order mechanism
  // (the website's reference-based lookup). Returns read-only status only;
  // 404 for unknown references, 429 when rate limited.
  async trackGuestOrder(reference: string): Promise<GuestOrderStatus> {
    await delay();
    if (mockGuestControls.force === 'rate_limit')
      throw new ApiError(429, undefined);
    const found = known[reference];
    if (!found) throw new ApiError(404, undefined);
    return found;
  },
};
