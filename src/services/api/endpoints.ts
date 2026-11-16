// Centralized endpoint paths (SpoonUp-Website/server/index.js). Keeps route
// strings out of screens/hooks/services so a path only changes in one place.
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },
  profile: '/api/me',
  settings: '/api/settings',
  scheduleSlots: '/api/schedule/slots',
  products: '/api/products',
  cartQuote: '/api/cart/quote',
  couponValidate: '/api/coupons/validate',
  addresses: '/api/me/addresses',
  myOrders: '/api/me/orders',
  mySubscriptions: '/api/me/subscriptions',
  storeCredit: '/api/me/store-credit',
  myReferrals: '/api/me/referrals',
  checkout: {
    prepare: '/api/checkout/prepare',
    complete: '/api/checkout/complete',
    abandon: '/api/checkout/abandon',
  },
  order: (id: string) => `/api/orders/${encodeURIComponent(id)}`,
};
