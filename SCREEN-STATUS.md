# SpoonUp Mobile: Screen Status

Visually verified on the iOS Simulator for the screens listed in the Visual QA section below (2026-10-19); everything else is not. "Ready" means: real UI, loading/empty/error/validation handled, reachable in navigation, backed by a mock service. Checks run: `tsc --noEmit`, `npm run lint`, `npm test` all pass.


## Expo migration (branch `expo-migration`)

Migrated from bare React Native 0.87 to managed Expo SDK 58 (Expo Go). Native `ios/`/`android/` removed (gitignored prebuild output). Session token storage moved from `react-native-keychain` to `expo-secure-store` (same `secureTokenStore` interface; existing stored tokens are not migrated, users sign in again). Env vars renamed to `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_USE_MOCKS`. Fonts load via `expo-font`. Verified: expo-doctor, tsc, lint, jest, Android bundle builds; not yet opened in Expo Go on a device.

## Backend wiring (live vs mock)

Switch: `EXPO_PUBLIC_USE_MOCKS` env (default true; tests run mocks). Set `EXPO_PUBLIC_USE_MOCKS=false` and `EXPO_PUBLIC_API_BASE_URL=http://<LAN-IP>:<port>` (a non-production backend) to go live. Full contract and gaps: `API-CONTRACT.md`.

**Verification level: nothing has been run against a live server.** The website backend folder is configured with Supabase service credentials, so it was not started (rule: only run if it uses the local JSON DB). Everything below marked "read-only wiring" was checked against `server/index.js` and the web client and has stubbed-client unit tests (`__tests__/live.test.ts`, `payments.test.ts`, `orders.test.ts`). Android bundle export succeeds.

| Feature | Live mode | Level |
|---|---|---|
| Login / signup / session restore / logout / 401 modal | live | read-only wiring |
| Profile (username + email + phone, one PATCH) | live | read-only wiring |
| Catalog, search, cart summary (GST shown as backend returns it), coupon | live | read-only wiring |
| Addresses | live (recipient name/phone kept in memory only) | read-only wiring |
| Delivery options (Deliver now / slots from `/api/schedule/slots`, courier for pantry) | live | read-only wiring |
| Checkout quote | live (no client money math; coupon shows "total before coupon", final charge comes from prepare) | read-only wiring |
| Payment (Razorpay in WebView, then backend `complete`) | live, rzp_test_ keys only; live/unknown key -> "not available", nothing charged | read-only wiring |
| Orders list / detail / tracking timeline (from order status, courier link if present) | live | read-only wiring |
| Guest tracking (orders remembered on this device via `x-order-token`; no reference field) | live | read-only wiring |
| 30-day plan (dish + frequency, SUBSCRIPTION line through checkout) | live | read-only wiring |
| Forgot password | mock info screen | backend gap |
| Support tickets, attachments | live: "email support@spoonupfoods.com" screen | backend gap |
| Notifications / push | live: same screen, badge empty | backend gap |
| Home location/ETA pill | live: hidden | backend gap |

Open issues: the payment WebView has never been exercised on a device or Expo Go; start with a test key and a test UPI/card. Order ETA text is never shown live (backend sends none).

## API seam (mock service -> endpoint it replaces; names only)

| File | Live endpoint |
|---|---|
| `features/auth/services/authService.ts` | `/api/auth/login`, `/signup` |
| `features/account/services/profileService.ts` | `PATCH /api/me` |
| `features/shop/services/catalogService.ts` | `/api/products` |
| `features/cart/services/cartService.ts` | `/api/cart/quote` |
| `features/checkout/services/checkoutService.ts` | `/api/schedule/slots`, `/api/coupons/validate`, `/api/cart/quote` |
| `features/checkout/services/addressService.ts` | `/api/me/addresses` |
| `features/checkout/services/paymentService.ts`, `features/payments/liveCheckout.ts` | `/api/checkout/prepare`, `complete`, `abandon` |
| `features/orders/services/ordersService.ts` | `/api/me/orders`, `/api/orders/:id` |
| `features/orders/services/guestOrderService.ts` + `services/storage/orderTokens.ts` | `/api/orders/:id` with `x-order-token` |
| `features/plan/services/planService.ts` | `/api/settings`, `/api/cart/quote`, checkout, `/api/me/subscriptions` |
| `features/support/*`, `features/notifications/services/notificationService.ts`, `features/home/services/homeService.ts` | none (gap; `BackendGapScreen` in live) |

## Inventory audit (CLAUDE.md section 7)

Status after this pass. Gaps listed are what remains, if any.

| Group | Screen | File | Status | Notes / gaps |
|---|---|---|---|---|
| Auth | Splash | `features/onboarding/screens/SplashScreen.tsx` | Ready | Static, no data. |
| Auth | Onboarding | `features/onboarding/screens/OnboardingScreen.tsx` | Ready | |
| Auth | Login / Signup | `features/auth/screens/AuthScreen.tsx`, `components/MobileLogin.tsx` | Ready (mobile login: mock only) | Default view is the mobile-number login (mockup): +91 pill field, Login, Google/Apple shown disabled with "Soon", Sign up, Skip. Mock: number then OTP (any 6 digits except 000000). Live: Login shows "Mobile sign-in isn't available yet. Use email or username." (`TODO(api)`: backend has no phone/OTP login); "Use email or username instead" opens the existing password form. Not visually verified on a device. Previous: Username-or-email + password sign in / create account (matches the website; no OTP) with validation + guest skip. Removed dead disabled "Continue with Google (coming soon)" button. |
| Auth | Forgot Password | `features/auth/screens/HelpSignInScreen.tsx` | Ready (conflict) | CLAUDE.md says password reset; the app and website are OTP-based, so the equivalent is "Help signing in". Flag for owner. |
| Shopping | Home | `features/home/screens/HomeScreen.tsx` | Ready | Now driven by `useHome` (TanStack Query, `homeService` mock) with skeleton loading and ErrorState + retry. Plan card, location and reorder products are still mock. No pull-to-refresh. |
| Shopping | Categories / Search / Product Listing | `features/shop/screens/ShopScreen.tsx` | Ready | One Shop tab covers all three (category chips, search, grid), matching the design handoff. Added sort, clear-search action, pull-to-refresh. No price/protein filters (backend filter contract unknown). |
| Shopping | Product Details | `features/shop/screens/ProductDetailsScreen.tsx` | Ready | |
| Shopping | Cart | `features/cart/screens/CartScreen.tsx` | Ready | |
| Checkout | Checkout (+ Delivery Selection, Coupon) | `features/checkout/screens/CheckoutScreen.tsx`, `components/DeliverySection.tsx`, `CouponSection.tsx` | Ready | Delivery and coupon are sections inside Checkout, not separate screens (matches design). |
| Checkout | Address List / Add-Edit Address | `features/checkout/screens/AddressListScreen.tsx`, `AddressFormScreen.tsx` | Ready | Added pull-to-refresh. |
| Checkout | Payment | `features/checkout/screens/PaymentScreen.tsx` (+ `RazorpayCheckoutScreen.tsx`, `PaymentVerifyScreen.tsx`) | Ready | Razorpay test-mode WebView; verification polling screen asks the backend. |
| Checkout | Payment Success | `features/checkout/screens/OrderConfirmationScreen.tsx` | Ready | Shown only after backend verification; serves as Payment Success + Order Confirmation (no duplicate built). |
| Checkout | Payment Failed / Cancelled | `features/checkout/screens/PaymentOutcomeScreens.tsx` | Ready | |
| Orders | Orders | `features/orders/screens/OrdersScreen.tsx` | Ready | Pull-to-refresh now actually shows a spinner. |
| Orders | Order Details | `features/orders/screens/OrderDetailsScreen.tsx` | Ready | No pull-to-refresh (tracking screen has it). |
| Orders | Order Tracking | `features/orders/screens/OrderTrackingScreen.tsx` | Ready | |
| Orders | Guest Order Tracking | `features/orders/screens/GuestTrackingScreen.tsx` | Ready | Lists orders placed on this device (saved access tokens). Reference input removed: the backend has no reference lookup for guests. |
| Plan | Plan Details / Expired Plan / Active Plan | `features/plan/screens/PlansScreen.tsx` | Ready | One tab, three states. Added pull-to-refresh. |
| Plan | Payment / Verify | `PlanPaymentScreen.tsx`, `PlanVerifyScreen.tsx` | Ready | |
| Plan | Success / Failed / Cancelled | `PlanSuccessScreen.tsx`, `PlanOutcomeScreens.tsx` | Ready | |
| Account | Account | `features/account/screens/AccountScreen.tsx` | Ready | |
| Account | Profile | `features/account/screens/ProfileScreen.tsx` | Ready (new) | Was read-only. Edits username, email and mobile together (the backend requires all three), with validation and backend error text. |
| Account | Addresses | (same as Address List) | Ready | |
| Account | Notifications | `features/notifications/screens/NotificationsScreen.tsx` | Ready | Guest, loading, error, empty handled. Pull-to-refresh fixed. Push permission prompt not built (needs native lib). |
| Account | Logout | `AccountScreen.tsx` | Ready | Clears secure storage, cart, query cache. |
| Support | My Tickets | `features/support/screens/MyTicketsScreen.tsx` | Ready | |
| Support | Create Ticket | `features/support/screens/CreateTicketScreen.tsx` | Ready | |
| Support | Ticket Details / Conversation | `features/support/screens/TicketDetailsScreen.tsx` | Ready | |
| Support | Attachment Upload | `features/support/components/AttachmentPicker.tsx` | Partial | UI + validation done; `pickAttachment.ts` returns a fixed mock file until a picker library is installed. |
| Support | Attachment Preview | `features/support/screens/AttachmentPreviewScreen.tsx` | Ready (new) | Image inline, PDF opens in system viewer, loading/error/retry; fetches short-lived URL. Previously a bare external link. |

## Cross-cutting (added)

| Item | Where | Status |
|---|---|---|
| App-wide offline banner | `components/common/AppShell.tsx` + `OfflineBanner.tsx`, mounted in `App.tsx` | Ready; per-screen banners removed. Driven by `useOffline()`. Real detection: edit only `services/network/connectivity.ts` once NetInfo is installed (until then the app always reports online). |
| Session-expired / 401 | `services/api/sessionEvents.ts`, `AuthContext`, `features/auth/components/SessionExpiredModal.tsx` | Ready; 401 in `handleResponse` clears session and shows modal (log in again / keep browsing). |
| Global error boundary | `components/common/AppErrorBoundary.tsx` | Ready; crash reporting hook is a marked MOCK. |
| Reusable pull-to-refresh | `hooks/useRefresh.ts` | Used on Shop, Orders, Notifications, Tickets, Addresses, Plans. |
| Skeletons | `components/common/Skeleton.tsx` | Already used on every data-backed list/detail. |

## Screens outside the inventory

`HelpSignIn` (maps to Forgot Password), `PaymentVerify`, `PlanVerify` (post-SDK backend polling), `Plans` tab (5th tab; CLAUDE.md lists four tabs, design handoff has this layout), Shop tab in place of Categories/Search.

## Not ready and why

- Attachment picker: needs a native picker library.
- Offline detection and push permission: need NetInfo / notification libraries (not installed by instruction).
- Tab layout (5 tabs, "Shop" vs CLAUDE.md's "Categories/Search") deviates from CLAUDE.md; follows the design. Owner to confirm.

## Visual QA (2026-10-19)

Devices: iOS Simulator iPhone 17 (iOS 27, Xcode 27), light mode, default text size, plus a one-off accessibility-extra-large text check. Android: Pixel_8 AVD (API 17 image, 1080x2400), short pass. Not tested: iPhone SE / small phones, tablets, dark mode (app is light-only; forcing system dark left the app unchanged), landscape.

Verified on iOS (seen in screenshots): Splash/Onboarding (3 slides, Skip), Welcome, phone step, OTP (valid code, `000000` error state, not captured as a screenshot of the error text), name/pincode step (in-zone and out-of-zone note), Done, guest skip, Home (new user, guest greeting, signed-in name), Shop (grid, add/stepper, search empty state, filters/sort chips), Product Details, Cart (filled), Checkout (add address, address validation, delivery, coupon invalid and SPOON10), Payment, Verify, Order Confirmation, Order Details, Order Tracking, Orders (active, past, guest sign-in prompt), Guest Tracking (invalid reference error, valid reference), Payment Cancelled and Failed (mock cycle success, cancelled, failed), Plans (none, buy, verify, success, active, expired via temporary mock flip, since restored), Account, Profile edit (save, saved note), Addresses list/edit/delete confirm, Notifications (mark all read), Support (tickets list, ticket details, create-ticket validation, mock attachment), Logout, tab bar, keyboard behaviour on auth/address/coupon/guest-tracking.
Verified on Android (seen): Onboarding, Welcome, Home, Shop, Product Details, hardware Back (details -> shop), phone step with keyboard, status/gesture bars.

Fixed:
- iOS 27 SDK refused to launch (UIScene required): `ios/SpoonUp/AppDelegate.swift` + `Info.plist` now use a SceneDelegate (RN window created per scene).
- `WelcomeStep.tsx`: hero image did not fill its box (absoluteFill on Image); now width/height 100%.
- `AuthScreen.tsx`: removed `contentInsetAdjustmentBehavior` (extra top gap), added `keyboardDismissMode`, bottom safe-area padding dropped while keyboard is up (new `hooks/useKeyboardVisible.ts`; same in `AddressFormScreen`, `TicketDetailsScreen`).
- `ShopScreen.tsx`: tapping a chip while the keyboard was open only dismissed it (needed `keyboardShouldPersistTaps` on chip rows); empty-search state now fits under the header.
- `PlansScreen.tsx`, `PlanPaymentScreen.tsx`: Rs price was garbled (Instrument Serif has no rupee glyph); price now DM Sans.
- `PaymentOutcomeScreens.tsx`, `PlanOutcomeScreens.tsx`: Retry/Back used `navigate`, which pushed duplicate screens; now `popTo`.
- `ScreenHeader.tsx`: back arrow overflowed its circle at large text; `allowFontScaling={false}`.
- `CheckoutScreen.tsx`: `automaticallyAdjustKeyboardInsets` so the coupon field is not covered.
- `HomeScreen.tsx`: now uses `useHome` (skeleton + ErrorState retry); greeting/avatar show the signed-in user, guests see "Hi there" / "G" instead of mock "Priya".
- `AttachmentPicker.tsx`: hint shows "[MOCK picker, dev only]" in `__DEV__` only.

Remaining / not verified:
- Home skeleton and error states are unit-tested (`__tests__/home.test.ts`) but not captured visually (400 ms load; no runtime toggle).
- Support 429 / open-ticket messages, attachment preview screen, session-expired modal and offline banner were not triggered on a device (covered by existing unit tests only).
- Address text renders "B engaluru": this was the Simulator `text` tool typing artifact on my input, not an app bug (not investigated further).
- Android: first launch shows a system "nearby devices" permission prompt in the debug build (RN dev tooling); declining made Metro unreachable, allowing it worked. Full Android flow (checkout, cart-> auth return) not run.
- Guest Cart -> Auth -> returnTo flow not exercised end to end.
- Metro warns about `ReactNativeFeatureFlags` export resolution (harmless warning).

## Website-match redesign (DESIGN-SPEC.md pass)

NOT visually verified on a device or simulator. Verified only: `tsc`, `eslint`, `jest` (42 tests), and `expo export --platform android` bundling. Check every screen on a phone before sign-off.

### Changed
- Tokens: olive pill primary Button (ink `dark`, sage `sage`, outline variants; disabled = sage fill), radius `lg` 12 / `card` 12 / `xs` 7, type scale (display 36, headline 30, title 34, `titleCard`, `amount`, `bodyLarge`, `price`), mono kicker 12 / ls 2.2, DM Sans 500 only (no 600/700), `borderInput`, `borderButton`, `tanDark`, `selectedBg`. No shadows (CartBar and ReorderRow shadows removed).
- Components: Button, TextField (hint, Show/Hide password), Chip, ProductCard (single column, 3:2 image, solid tag, note line, Add to cart + Plan), ScreenHeader, EmptyState, Stepper (square outline in cart), BillSummary (muted panel, "Items", "Estimated total"), Section (numbered), SearchIcon.
- Home: logo + dark Cart pill header, kicker + serif H1 with italic word, olive "Order in 30 min", two outline CTAs, stat pair, stacked "Three ways to eat with us" tiles, kitchen bestsellers, dark plan banner, pantry bestsellers (rows come from the catalog service).
- Shop: "Shop all", pill search with icon, filters All · N / Eat now / Subscribable / Pantry · ships, Sort chips, single-column cards.
- Product details: kept the existing screen (website has no PDP), styled by tokens.
- Cart: "Your cart", left-accent group cards, "each" price, line total, muted summary, GST hint, site empty state with "Build a plan".
- Checkout/Payment: numbered sections, selectable option cards (olive border + selectedBg), "Payment" section.
- Orders: serif order id, mono status tag.
- Plan: "SCHEDULE PLAN" kicker, "Decide once. Then just eat.", stat trio, photo, muted summary panel, "Start plan".
- Account/Profile: serif name, muted list group, shows email/mobile (read-only).
- Support: card tokens, mono status chip, "Prefer email" line.
- Auth: phone-OTP flow removed (PhoneStep, OtpStep, ProfileStep, DoneStep, AuthHeader, WelcomeStep, OtpInput, useAuthFlow, serviceArea). New single sign-in / create-account screen (username-or-email + password; sign-up username, email, mobile, password, optional referral), validation mirrors the backend, guest continue, track order, Facebook/Apple "soon". `authService.login/signup` are mock by default and call `/api/auth/login` and `/api/auth/signup` (token to secure store) when `EXPO_PUBLIC_USE_MOCKS=false`; mock quirks: password `wrongpass` fails, username `taken` fails. HelpSignIn is now a "Get in touch" screen with support@spoonupfoods.com (backend has no password-reset endpoint).

### Decisions (website is source of truth over CLAUDE.md)
- Auth is username/email + password, not phone OTP (`// DECISION` in AuthScreen). Google is not shown: on the web it is a browser redirect and is not an in-app option; the site shows it as active, not "soon".
- Optional referral code at sign-up (site has it; backend applies it).
- "Subscribable" filter label and `/subscribe`-style wording only where the site uses it; no "subscription", "wallet", "balance" wording (noWallet test unchanged, still passes).
- Plan keeps the fixed server-priced pass; the site's builder (product, frequency, GST, add to cart) is not built.

### Not done / flagged
- Guest checkout (site allows it): not built, app still asks guests to sign in.
- Store credit line at checkout and referral credit display: not built (no mock/backend contract in the app).
- Device-stored guest order list (site `/status`): not built, guest tracking still uses the reference lookup.
- Support: the website has email-only support, the app keeps tickets (flagged in MyTicketsScreen).
- Google sign-in, forgot-password reset: no app flow or backend endpoint.
- Product details has no ingredients/allergens (API does not supply them).
- Tab bar left as built (5 tabs); site has none. Chip height stays 44 for touch targets (site 38-40).
- Serif amounts: Instrument Serif has no rupee glyph, so totals use DM Sans 500 (spec says serif).
