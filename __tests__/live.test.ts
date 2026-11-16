// Live-mode (EXPO_PUBLIC_USE_MOCKS=false) wiring against a stubbed API client.
// These prove request shapes and mapping only; they are NOT a live-server run.
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../src/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../src/services/storage/secureTokenStore', () => ({
  secureTokenStore: {
    getToken: jest.fn(async () => 'usr_test'),
    setToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

// Loads a module with mocks disabled, plus the stubbed client it will use.
const live = <T>(path: string) => {
  let out!: {
    mod: T;
    api: Record<'get' | 'post' | 'patch' | 'delete', jest.Mock>;
    ApiError: typeof import('../src/services/api/interceptors').ApiError;
  };
  jest.isolateModules(() => {
    process.env.EXPO_PUBLIC_USE_MOCKS = 'false';
    out = {
      mod: require(path),
      api: require('../src/services/api/client').apiClient,
      // Same class instance the isolated modules use (instanceof checks).
      ApiError: require('../src/services/api/interceptors').ApiError,
    };
  });
  process.env.EXPO_PUBLIC_USE_MOCKS = 'true';
  return out;
};

const product = (id: string, category: 'now' | 'ships') =>
  ({ product: { id, category }, quantity: 2 } as never);

beforeEach(() => AsyncStorage.clear());

test('profile update sends username, email, phone together to PATCH /api/me', async () => {
  const { mod, api, ApiError } = live<
    typeof import('../src/features/account/services/profileService')
  >('../src/features/account/services/profileService');
  api.patch.mockResolvedValue({
    user: { username: 'asha_r', email: 'a@b.co', phone: '9876543210' },
  });
  const out = await mod.profileService.update({
    username: ' asha_r ',
    email: 'a@b.co ',
    phone: '9876543210',
  });
  expect(api.patch).toHaveBeenCalledWith('/api/me', {
    username: 'asha_r',
    email: 'a@b.co',
    phone: '9876543210',
  });
  expect(out).toEqual({ name: 'asha_r', email: 'a@b.co', phone: '9876543210' });
  api.patch.mockRejectedValue(
    new ApiError(409, { message: 'That username is already taken.' }),
  );
  await expect(
    mod.profileService.update({
      username: 'x',
      email: 'a@b.co',
      phone: '9876543210',
    }),
  ).rejects.toThrow('That username is already taken.');
});

test('delivery options come from /api/schedule/slots and carry the slot start', async () => {
  const { mod, api } = live<
    typeof import('../src/features/checkout/services/checkoutService')
  >('../src/features/checkout/services/checkoutService');
  api.get.mockResolvedValue({
    enabled: true,
    days: [
      {
        date: '2026-11-14',
        label: 'Today',
        slots: [
          {
            start: '2026-11-14T13:30:00.000Z',
            end: 'x',
            label: '7:00-8:00 pm',
          },
        ],
      },
    ],
  });
  const options = await mod.checkoutService.getDeliveryOptions([
    product('a', 'now'),
    product('b', 'ships'),
  ]);
  expect(api.get).toHaveBeenCalledWith('/api/schedule/slots');
  // DECISION: pantry sold in a separate app/site, so no courier option.
  expect(options.map(o => o.kind)).toEqual(['immediate', 'scheduled']);
  expect(options[1]).toMatchObject({
    label: 'Today, 7:00-8:00 pm',
    scheduledFor: '2026-11-14T13:30:00.000Z',
  });
});

test('quote sends the slot on kitchen lines only and shows backend totals untouched', async () => {
  const { mod, api } = live<
    typeof import('../src/features/checkout/services/checkoutService')
  >('../src/features/checkout/services/checkoutService');
  api.post.mockResolvedValue({
    totals: { itemsSubtotal: 1000, taxTotal: 50, calculatedTotal: 1050 },
    coupon: { valid: true, discount: 100 },
  });
  const summary = await mod.checkoutService.getQuote({
    lines: [product('a', 'now'), product('b', 'ships')],
    addressId: 'x',
    deliveryOptionId: 'slot:s',
    couponCode: 'SPOON10',
    scheduledFor: '2026-11-14T13:30:00.000Z',
  });
  expect(api.post).toHaveBeenCalledWith('/api/cart/quote', {
    lines: [
      { id: 'a', quantity: 2, scheduledFor: '2026-11-14T13:30:00.000Z' },
      { id: 'b', quantity: 2 },
    ],
    couponCode: 'SPOON10',
  });
  // total is the backend's pre-coupon total; nothing is subtracted client side.
  expect(summary).toMatchObject({
    subtotal: 1000,
    tax: 50,
    total: 1050,
    discount: 100,
    finalAtPayment: true,
  });
});

test('orders: owner/guest read sends the saved x-order-token', async () => {
  const { mod, api } = live<
    typeof import('../src/features/orders/services/ordersService')
  >('../src/features/orders/services/ordersService');
  await mod.rememberPlacedOrders([
    {
      id: 'ord-1',
      orderNumber: 7,
      accessToken: 'tok',
      createdAt: '',
      totalAmount: 1,
      status: 'pending',
    },
  ]);
  api.get.mockResolvedValue({
    id: 'ord-1',
    orderNumber: 7,
    createdAt: '2026-11-13T10:00:00Z',
    totalAmount: 499,
    status: 'out_for_delivery',
    paymentStatus: 'paid',
    trackingLink: 'https://courier.example/t/1',
    items: [{ productName: 'Pudding', quantity: 1 }],
  });
  const order = await mod.ordersService.get('ord-1');
  expect(api.get).toHaveBeenCalledWith('/api/orders/ord-1', {
    headers: { 'x-order-token': 'tok' },
  });
  expect(order).toMatchObject({
    id: 'ord-1',
    number: 'SU-7',
    status: 'out_for_delivery',
    paymentStatus: 'paid',
    trackingLink: 'https://courier.example/t/1',
  });
});

test('guest tracking reads back remembered orders and counts the ones that fail', async () => {
  const { mod, api, ApiError } = live<
    typeof import('../src/features/orders/services/guestOrderService')
  >('../src/features/orders/services/guestOrderService');
  const tokens = require('../src/services/storage/orderTokens').orderTokens;
  await tokens.remember([
    { id: 'o1', accessToken: 't1' },
    { id: 'o2', accessToken: 't2' },
  ]);
  api.get.mockImplementation(async (path: string) => {
    if (path.endsWith('o2')) throw new ApiError(404, undefined);
    return {
      id: 'o1',
      orderNumber: 1,
      createdAt: '2026-11-13T10:00:00Z',
      totalAmount: 1,
      status: 'pending',
    };
  });
  const res = await mod.guestOrderService.listRecent();
  expect(res.orders.map(o => o.id)).toEqual(['o1']);
  expect(res.unavailable).toBe(1);
});

test('plan: quote uses a SUBSCRIPTION line; status follows the backend subscription', async () => {
  const { mod, api } = live<
    typeof import('../src/features/plan/services/planService')
  >('../src/features/plan/services/planService');
  api.post.mockResolvedValue({
    totals: { calculatedTotal: 3150 },
    subscriptions: [{ deliveryCount: 15, planDurationDays: 30 }],
  });
  expect(await mod.planService.quote('p1', 'ALTERNATE_DAYS')).toEqual({
    total: 3150,
    deliveryCount: 15,
    validityDays: 30,
  });
  expect(api.post).toHaveBeenCalledWith('/api/cart/quote', {
    lines: [
      {
        id: 'p1',
        quantity: 1,
        purchaseMode: 'SUBSCRIPTION',
        frequency: 'ALTERNATE_DAYS',
      },
    ],
  });
  api.get.mockImplementation(async (path: string) =>
    path === '/api/settings'
      ? { subscriptionFrequencies: ['DAILY'], subscriptionPlanDurationDays: 30 }
      : [],
  );
  expect((await mod.planService.getPlan()).status).toBe('none');
});

test('an HTML 200 (e.g. a Cloudflare challenge) is an ApiError, not data', async () => {
  const {
    handleResponse,
    ApiError,
  } = require('../src/services/api/interceptors');
  const html = {
    ok: true,
    status: 200,
    headers: { get: () => 'text/html' },
    text: async () => '<html>Just a moment...</html>',
  };
  await expect(handleResponse(html)).rejects.toBeInstanceOf(ApiError);
  const json = {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => [1],
  };
  await expect(handleResponse(json)).resolves.toEqual([1]);
});
