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
| GET `/api/me/store-credit` | token | | `{balance, transactions:[{id,direction:CREDIT/DEBIT,type,amount,reason,createdAt}]}` oldest first; 404 for an account with no credit row yet (treat as 0). Types: REFUND_ISSUED, REFERRAL_BONUS, REDEEMED, ADMIN_ADJUSTMENT, EXPIRY |
| GET `/api/me/referrals` | token | | `{code, rule:{enabled,referrerAmount,referredAmount,minOrderAmount,rewardTrigger(ON_PAYMENT/AFTER_DELIVERY),holdDays}, joined, rewarded, earned, referrals[], referredBy, canApply}`. `code` null if none; all copy and amounts come from `rule` |
| POST `/api/me/referrals/apply` | token | `{code}` | add a code to an existing account (only before the first paid order, see `canApply`). Not built in the app |

Order status vocab: IMMEDIATE `pending,preparing,ready,out_for_delivery,delivered,failed_delivery,cancelled,refunded`; SCHEDULED starts `scheduled`; DELIVERY_IN_DAYS `pending,sourcing,packed,shipped,delivered,returned,cancelled,rejected,refunded`. `paymentStatus`: `unpaid|paid|...`.

## Mobile feature -> backend

**Production check (2026-11-13, owner-authorized, via `https://spoonupfoods.com`, no payments/orders; one test user created, its address deleted).** Responses matched the app's types for: GET `/api/products` (200, 42 rows, 39 available, absolute `https://storage.googleapis.com/...` image URLs, `sizes[]` on pantry items; the app sells the first size, which is the default the backend uses when `sizeId` is omitted), GET `/api/settings`, GET `/api/schedule/slots`, POST `/api/cart/quote` (guest and bearer), POST `/api/coupons/validate` (invalid code -> `valid:false`), POST `/api/auth/signup`, `/login` (wrong password -> 401 `Invalid credentials.`), GET `/api/auth/me` (401 after logout), POST `/api/auth/logout`, PATCH `/api/me`, POST/GET/DELETE `/api/me/addresses`, GET `/api/me/orders` (`[]`), GET `/api/me/subscriptions` via plan status, quote with a SUBSCRIPTION line (30 deliveries / 30 days). No Cloudflare challenge or bot block for non-browser clients; no custom headers or user agent needed; http redirects not an issue; `www.` 301-redirects to the apex. Not verified live: checkout prepare/complete/abandon, `/api/orders/:id`, `x-order-token`, store credit, coupon success. A non-JSON 2xx (e.g. a challenge page) now raises an ApiError instead of being returned as data.

Verification level: "read-only wiring" = request/response shapes checked against `server/index.js` and the web client, covered by stubbed-client unit tests, not run against a live server except the endpoints listed in the production check above.

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
| SpoonUp credit (history, amount, toggle) | `/api/me/store-credit`, `storeCreditAmount` on `/api/checkout/prepare` | live | read-only wiring + live GET check |
| Referral card (code, share, stats) | `/api/me/referrals` | live | live GET check (2026-11-16) |
| Cashfree | `gateway:'cashfree'` | not used (hidden on the website too) | not built |

## Payment flow (live)

1. `POST /api/checkout/prepare` returns the authoritative `amount`, `razorpayKeyId`, `razorpayOrderId`, `checkoutToken`.
2. If `razorpayKeyId` is not `rzp_test_...` the app calls `/api/checkout/abandon` and refuses to start (live or unknown key = no real payment from this build).
3. Razorpay Standard Checkout runs inside `react-native-webview` (`features/payments`), same approach as KesarMahal-Mobile.
4. The WebView result (payment id, order id, signature) is only a hint. The app posts it to `/api/checkout/complete`; the backend verifies the signature and fulfils. Success is shown only when the returned order (or parent order for plan-only carts) has `paymentStatus: 'paid'`. A not-yet-paid response keeps polling (the call is idempotent); 400/404/410 = failed.
5. Cancel or failure calls `/api/checkout/abandon` so a reserved coupon is released.

Idempotency: one prepared checkout per Payment-screen idempotency key (double taps reuse it until cancel/failure); `complete` is idempotent server-side. If the app restarts mid-payment, a captured payment is still fulfilled by the Razorpay webhook and appears under Orders.

## SpoonUp credit and referral (website "store credit")

Read from `server/storeCredit.js`, `server/referrals.js`, `/api/checkout/prepare`, and the website Checkout/Account pages. The owner dropped the wallet concept; credit follows the website.

- **Earned:** admin converts a refund to credit (REFUND_ISSUED), referral rewards (REFERRAL_BONUS), admin adjustments. There is no welcome/signup credit. Spent at checkout (REDEEMED). EXPIRY is a ledger type, but nothing in the code expires credit on a schedule. Non-withdrawable, no cash value, no top-up.
- **Redeeming:** only `POST /api/checkout/prepare` takes credit: `storeCreditAmount` (number). Signed-in only (guest: 401 `STORE_CREDIT_NEEDS_ACCOUNT`). The server applies the coupon first, clamps credit to `min(requested, payable)`, checks it against the live ledger minus credit held by other open checkouts (400 `INSUFFICIENT_STORE_CREDIT`), reserves it, charges the gateway `amount = payable - credit`, and returns `storeCredit:{applied}` (or null). Credit is captured on complete and released on abandon/expiry. `/api/cart/quote` has no credit params, so the website (and app) show an estimate `min(credit, total - coupon)`. Credit applies to the whole payable of any cart (eat-now, scheduled, plan lines); there is no per-item restriction (the mockup's "on eat-now items" is not backend behaviour). A fully covered total gives a 0 gateway amount, which the website does not special-case (untested).
- **Referral:** every account gets a code. A new user enters it at signup (`referralCode` on `/api/auth/signup`; response `referral:{status}` or `{error,message}`) or later via `/api/me/referrals/apply` before the first paid order. The programme is admin-configured (`referral_rules`), no built-in amounts: the client reads `rule` (production now: both get 100 after the friend's first order of at least 350 is delivered). Reward timing follows `rewardTrigger`/`holdDays`; fraud signals can hold a referral for admin review. Public check: GET `/api/referrals/validate?code=` (rate limited). Website share link: `<origin>/signin?ref=CODE`.

## Gaps for the backend team

- Phone-OTP login, forgot/reset password.
- Support tickets (create/list/reply/attachments, rate limits, email side effects).
- Notifications list and push-token registration.
- Home content (delivery location/ETA text, reorder suggestions) and order ETA text.
- A guest lookup by order number or reference (today guests need the internal id + token).
- Address recipient name/phone fields; a payable-total-after-coupon in `/cart/quote`; a payment-status route (a `GET` on the checkout) so clients need not re-post `complete`; a mobile `platform` value.
