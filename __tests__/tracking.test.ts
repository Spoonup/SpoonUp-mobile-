import { ApiError } from '../src/services/api/interceptors';
import { trackingError } from '../src/features/orders/errorMessage';
import {
  guestOrderService,
  mockGuestControls,
} from '../src/features/orders/services/guestOrderService';
import {
  buildTimeline,
  normalizeReference,
  validateReference,
} from '../src/features/orders/tracking';
import {
  groupNotifications,
  routeFor,
  unreadCount,
} from '../src/features/notifications/logic';
import type { AppNotification } from '../src/features/notifications/types';

describe('reference validation', () => {
  test('trims and uppercases', () => {
    expect(normalizeReference('  su-24817 ')).toBe('SU-24817');
  });
  test('rejects empty, short and bad characters', () => {
    expect(validateReference('  ')).toMatch(/Enter/);
    expect(validateReference('ab1')).toMatch(/6–20/);
    expect(validateReference('SU 24817!')).toMatch(/6–20/);
    expect(validateReference(' su-24817 ')).toBeUndefined();
  });
});

describe('guest tracking service', () => {
  afterEach(() => (mockGuestControls.force = null));
  test('finds known, 404s unknown, 429s when limited', async () => {
    await expect(
      guestOrderService.trackGuestOrder('SU-24817'),
    ).resolves.toMatchObject({
      status: 'out_for_delivery',
    });
    const miss = await guestOrderService
      .trackGuestOrder('SU-00000')
      .catch(e => e);
    expect(trackingError(miss)).toMatch(/couldn’t find/);
    mockGuestControls.force = 'rate_limit';
    const limited = await guestOrderService
      .trackGuestOrder('SU-24817')
      .catch(e => e);
    expect(trackingError(limited)).toMatch(/Too many/);
    expect(trackingError(new ApiError(500, undefined))).toMatch(/right now/);
  });
});

describe('buildTimeline', () => {
  test('marks done/current/upcoming', () => {
    expect(buildTimeline('out_for_delivery').map(s => s.state)).toEqual([
      'done',
      'done',
      'current',
      'upcoming',
    ]);
  });
  test('cancelled shows only placed and cancelled', () => {
    expect(buildTimeline('cancelled').map(s => s.status)).toEqual([
      'placed',
      'cancelled',
    ]);
  });
});

const n = (over: Partial<AppNotification>): AppNotification => ({
  id: 'x',
  type: 'delivered',
  title: 't',
  body: 'b',
  createdAt: new Date().toISOString(),
  read: false,
  ...over,
});

describe('notifications', () => {
  test('groups Today/Earlier newest first and drops empty groups', () => {
    const now = new Date(2026, 5, 10, 15, 0);
    const list = [
      n({ id: 'old', createdAt: new Date(2026, 5, 8, 9).toISOString() }),
      n({ id: 'a', createdAt: new Date(2026, 5, 10, 9).toISOString() }),
      n({ id: 'b', createdAt: new Date(2026, 5, 10, 12).toISOString() }),
    ];
    const groups = groupNotifications(list, now);
    expect(groups.map(g => g.title)).toEqual(['Today', 'Earlier']);
    expect(groups[0].items.map(i => i.id)).toEqual(['b', 'a']);
    expect(groupNotifications([list[0]], now).map(g => g.title)).toEqual([
      'Earlier',
    ]);
  });
  test('routes to order or ticket', () => {
    expect(routeFor(n({ type: 'payment_failed', orderId: 'SU-1' }))).toEqual({
      name: 'OrderDetails',
      params: { orderId: 'SU-1' },
    });
    expect(routeFor(n({ type: 'support_reply', ticketId: 'T-1' }))).toEqual({
      name: 'TicketDetails',
      params: { ticketId: 'T-1' },
    });
    expect(routeFor(n({ type: 'delivered' }))).toBeNull();
  });
  test('counts unread', () => {
    expect(unreadCount([n({}), n({ read: true })])).toBe(1);
    expect(unreadCount(undefined)).toBe(0);
  });
});
