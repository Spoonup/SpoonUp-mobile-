# SpoonUp backend API contract (as read from the website backend)

Source: `/Users/sushantnatani/Desktop/SpoonUp/SpoonUp-Website` (read-only). Single Express 5 app, `server/index.js`, Node 22, ESM. DB is Supabase Postgres or local JSON (`data/db.json`). Payments: Razorpay (raw REST) and Cashfree. Production is `spoonupfoods.com` (Cloud Run behind a Cloudflare Worker). No secrets recorded here. Every route below was re-read in `server/index.js` (2026-11-13); web request shapes were read in `src/lib/api.js`, `src/pages/Checkout.jsx`, `Subscribe.jsx`, `OrderStatus.jsx`.

## Conventions

- Base: `EXPO_PUBLIC_API_BASE_URL` + `/api/...`. JSON in/out. Responses are `Cache-Control: no-store`.
- Errors: `{ "error": "<safe message>", "code": "<optional CODE>" }`. Statuses: 400 validation, 401 not signed in / invalid credentials, 404 not found or not yours (anti-IDOR), 409 duplicate username/email, 410 checkout expired, 429 rate limit, 503 not configured. The app's interceptor copies `error` to `message`; `friendlyError` shows that text for 400/404/409/410/422/503 only.
- Customer auth: opaque session token `usr_...`, sent as `Authorization: Bearer usr_...`. Stored in expo-secure-store.
- Guest order access: `x-order-token: <order accessToken>`, stored on device in AsyncStorage (`spoonup.orderTokens`).
- Storefront: optional `x-storefront` header; mobile sends none (= SpoonUp). The backend hard-codes platform `WEB` for quotes/checkouts (no mobile platform pricing).
- Edge gate: if the deploy sets `ORIGIN_AUTH_SECRET`, direct Cloud Run calls get 403. A local backend does not set it. Production must be called through the public domain.
- Rate limits: general 300/min/IP, auth 10/15min, order creation 30/5min.
- Backend env var NAMES: PORT, ADMIN_*, ORIGIN_AUTH_SECRET, TRUST_PROXY, CORS_ORIGINS, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, Cashfree and Google vars.

## Endpoints the app calls (live mode)

| Method + path | Auth | Request | Response / notes |
|---|---|---|---|
| POST `/api/auth/signup` | none | `{username(3-32 [A-Za-z0-9_]), password(8-128), email, phone(10-digit), referralCode?}` | 201 `{token,user,referral}`; 400 field messages; 409 taken |
| POST `/api/auth/login` | none | `{username (username OR email), password}` | `{token,user}`; 401 `Invalid credentials.` |
| GET `/api/auth/me` | token | | `{user}` (session restore; there is no `GET /api/me`) |
| POST `/api/auth/logout` | token | | `{success}` |
| PATCH `/api/me` | token | `{username,email,phone}` all required | `{user}`; 400/409 messages |
| GET `/api/products` | none | | array (see mapping in `catalogService`) |
| GET `/api/settings` | none | | `subscriptionFrequencies[]`, `subscriptionPlanDurationDays`, `razorpayKeyId`, ... |
| GET `/api/schedule/slots` | none | | `{enabled,slotMinutes,days:[{date,label,slots:[{start,end,label}]}]}` |
| POST `/api/cart/quote` | optional | `{lines:[{id,quantity,scheduledFor?,purchaseMode?,frequency?,startDate?}], couponCode?}` | `{totals:{itemsSubtotal,taxTotal,calculatedTotal}, coupon:{valid,discount}, subscriptions[]}`. GST added on top. Does NOT return a post-coupon payable total |
| POST `/api/coupons/validate` | optional | `{code, lines}` | 200 `{valid:true,discount}` / `{valid:false,message}` |
| GET/POST/PATCH/DELETE `/api/me/addresses` | token | `{label(<=40), line1(>=5), line2?, city(>=2), pincode(6 digits), landmark?, isDefault?}` | rows; 404 if not yours. No recipient name/phone |
| POST `/api/checkout/prepare` | optional | `{customerName(2-60), customerPhone, customerEmail, lines, paymentMethod:'online', couponCode?, deliveryAddress{line1,city,pincode}, notes?}` | `{checkoutId, amount, razorpayKeyId, razorpayOrderId, checkoutToken, coupon}`. Address is required for every cart; Eat Now/plans only for Bangalore (560xxx) |
| POST `/api/checkout/complete` | optional | `{checkoutId, checkoutToken, razorpayPaymentId, razorpayOrderId, razorpaySignature}` | 201/200 `{orders[], order, parentOrder, subscriptions}` (orders include `accessToken` to the placer); 400 `Payment verification failed.`; 410 `CHECKOUT_EXPIRED`. Idempotent: a repeat returns `alreadyCompleted` |
| POST `/api/checkout/abandon` | optional | `{checkoutId}` | `{released}` (gives a reserved coupon back) |
| GET `/api/me/orders` | token | | flat sub-orders (`id, orderNumber, status, paymentStatus, subOrderType, items, deliveryAddress, trackingLink`) |
| GET `/api/orders/:id` | owner token OR `x-order-token` | | order; 404 otherwise. Needs the internal id, not the order number |
| GET `/api/me/subscriptions` | token | | rows `{status (PENDING_PAYMENT/ACTIVE/PAUSED/CANCELLED/COMPLETED), activatedAt, expiresAt, parentOrderId, ...}` |
| GET `/api/me/store-credit` | token | | `{balance, transactions}` (not used by the UI yet) |

Order status vocab: IMMEDIATE `pending,preparing,ready,out_for_delivery,delivered,failed_delivery,cancelled,refunded`; SCHEDULED starts `scheduled`; DELIVERY_IN_DAYS `pending,sourcing,packed,shipped,delivered,returned,cancelled,rejected,refunded`. `paymentStatus`: `unpaid|paid|...`.

## Mobile feature -> backend

Verification level: "read-only wiring" = request/response shapes checked against `server/index.js` and the web client, covered by stubbed-client unit tests, never run against a live server (the website folder is configured for Supabase, so it was not started). "Live-verified" = none yet.

| Mobile feature | Backend | Mode in live | Verification |
|---|---|---|---|
| Login / signup (username or email + password) | `/api/auth/login`, `/signup` | live | read-only wiring |
| Session restore / logout / 401 seam | `/api/auth/me`, `/logout` | live | read-only wiring |
| Forgot password | none | mock (`HelpSignIn` info screen) | backend gap |
| Profile edit | `PATCH /api/me` (username+email+phone) | live | read-only wiring + unit test |
| Catalog, cart summary, coupon | `/api/products`, `/cart/quote`, `/coupons/validate` | live | read-only wiring |
| Delivery options / slots | `/api/schedule/slots` (+ courier for pantry lines) | live | read-only wiring + unit test |
| Addresses | `/api/me/addresses` | live | read-only wiring. Recipient name/phone are kept in memory per address (backend has none) |
| Checkout + payment | `prepare` -> Razorpay WebView -> `complete` | live, **test keys only** | read-only wiring + unit tests |
| Payment status | no status route; `complete` is idempotent and returns the order with `paymentStatus`; "paid" is shown only from that | live | read-only wiring + unit tests |
| Orders list/detail/tracking | `/api/me/orders`, `/api/orders/:id` (status from order data, `trackingLink` when present) | live | read-only wiring + unit tests |
| Guest tracking | `x-order-token` + `/api/orders/:id`, orders remembered on this device. No reference lookup exists for non-admins, so the reference field was removed | live | read-only wiring + unit test |
| 30-day plan | SUBSCRIPTION cart line (`id, quantity:1, purchaseMode:'SUBSCRIPTION', frequency`; `startDate` omitted -> backend default next day), priced via `/cart/quote`, bought via prepare/complete; status from `/api/me/subscriptions` | live | read-only wiring + unit tests |
| Support tickets / replies / attachments | none | live: "email support" state; mock only in mock mode | backend gap |
| Notifications / push tokens | none | live: "email support" state, empty badge; mock only in mock mode | backend gap |
| Home content (location, ETA, reorder) | none | live: location pill hidden | backend gap |
| Store credit display | `/api/me/store-credit` | not used | not built |
| Cashfree | `gateway:'cashfree'` | not used (hidden on the website too) | not built |

## Payment flow (live)

1. `POST /api/checkout/prepare` returns the authoritative `amount`, `razorpayKeyId`, `razorpayOrderId`, `checkoutToken`.
2. If `razorpayKeyId` is not `rzp_test_...` the app calls `/api/checkout/abandon` and refuses to start (live or unknown key = no real payment from this build).
3. Razorpay Standard Checkout runs inside `react-native-webview` (`features/payments`), same approach as KesarMahal-Mobile.
4. The WebView result (payment id, order id, signature) is only a hint. The app posts it to `/api/checkout/complete`; the backend verifies the signature and fulfils. Success is shown only when the returned order (or parent order for plan-only carts) has `paymentStatus: 'paid'`. A not-yet-paid response keeps polling (the call is idempotent); 400/404/410 = failed.
5. Cancel or failure calls `/api/checkout/abandon` so a reserved coupon is released.

Idempotency: one prepared checkout per Payment-screen idempotency key (double taps reuse it until cancel/failure); `complete` is idempotent server-side. If the app restarts mid-payment, a captured payment is still fulfilled by the Razorpay webhook and appears under Orders.

## Gaps for the backend team

- Phone-OTP login, forgot/reset password.
- Support tickets (create/list/reply/attachments, rate limits, email side effects).
- Notifications list and push-token registration.
- Home content (delivery location/ETA text, reorder suggestions) and order ETA text.
- A guest lookup by order number or reference (today guests need the internal id + token).
- Address recipient name/phone fields; a payable-total-after-coupon in `/cart/quote`; a payment-status route (a `GET` on the checkout) so clients need not re-post `complete`; a mobile `platform` value.
