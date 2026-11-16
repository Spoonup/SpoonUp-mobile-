# SpoonUp Mobile: Screen Status

Visually verified on the iOS Simulator for the screens listed in the Visual QA section below (2026-10-19); everything else is not. "Ready" means: real UI, loading/empty/error/validation handled, reachable in navigation, backed by a mock service. Checks run: `tsc --noEmit`, `npm run lint`, `npm test` all pass.


## Expo migration (branch `expo-migration`)

Migrated from bare React Native 0.87 to managed Expo SDK 58 (Expo Go). Native `ios/`/`android/` removed (gitignored prebuild output). Session token storage moved from `react-native-keychain` to `expo-secure-store` (same `secureTokenStore` interface; existing stored tokens are not migrated, users sign in again). Env vars renamed to `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_USE_MOCKS`. Fonts load via `expo-font`. Verified: expo-doctor, tsc, lint, jest, Android bundle builds; not yet opened in Expo Go on a device.

## Backend wiring (live vs mock)

Switch: `EXPO_PUBLIC_USE_MOCKS` env (default true; tests run mocks). Set `EXPO_PUBLIC_USE_MOCKS=false` and `EXPO_PUBLIC_API_BASE_URL` (the local `.env` currently points at the public production origin by owner authorization; payments are blocked by the `rzp_test_` guard) to go live. Full contract and gaps: `API-CONTRACT.md`.

**Production verification (2026-11-13, owner-authorized): the app service layer was run against `https://spoonupfoods.com` (no payments, no orders).** Live-verified: catalog (39 available products, absolute GCS image URLs), delivery slots, cart quote (guest and signed in), invalid coupon (friendly message), signup, login (wrong password -> `Invalid credentials.`), `/api/auth/me`, 401 after logout, logout, profile PATCH, address create/list/delete, orders list (empty), plan options/status/quote (30 deliveries, 30 days). NOT verified live: prepare/complete/abandon, Razorpay WebView, order detail/guest tracking with a real order, store credit, coupon success, device rendering in Expo Go. The rows below are therefore "live-verified" only for the items named here; the rest stays read-only wiring. Earlier statement, now superseded: nothing had been run against a live server. The website backend folder is configured with Supabase service credentials, so it was not started (rule: only run if it uses the local JSON DB). Everything below marked "read-only wiring" was checked against `server/index.js` and the web client and has stubbed-client unit tests (`__tests__/live.test.ts`, `payments.test.ts`, `orders.test.ts`). Android bundle export succeeds.

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
| Shopping | Product Details | `features/shop/screens/ProductDetailsScreen.tsx` | Ready | Redesigned 2026-11-16 to the owner reference (see "Product details and Home images" at the end). |
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

## Login / Home / Product pass (2026-11-14)

NOT seen on a device or simulator. Verified: `tsc`, `eslint`, `jest` (69 tests), `expo export` for android and ios.

- Login: root View paints the cream background and the scroll content is at least window height (the gray block under the content came from a container with no background and no flexGrow); every stack screen also has a cream `contentStyle`. Mobile login is vertically centred, with a rotating quote (12 local quotes, native Animated fade every 5s, instant swap when reduce-motion is on) at the bottom. Google/Apple stay disabled "Soon": see `AUTH-PLAN.md` (backend has no phone-OTP, Apple, or in-app Google route).
- Images: new `components/common/AspectImage` (fixed ratio on a View, cover, max height). Used for product cards (4:3, max 240), home tiles (16:9, max 200), plan photo (16:9, max 220), hero (16:9, max 230). Cart thumbs and home carousel cards were already fixed size.
- Home: hero photo `assets/images/hero-home.webp`, kicker over its cream corner, headline, subline, "Order in 30 min" + "Build your plan". Two tiles, one kitchen row.
- Pantry removed from the UI (`// DECISION: pantry sold in a separate app/site`): Shop filter, Home CTA/tile/row, onboarding slide, cart courier group, courier delivery option. `catalogService` drops `ships` products in list and get; `Product.category` still carries the value.
- Product details redesigned (40% hero image, round back button, rounded sheet, kicker from backend `category`, serif name, price with unit parsed from "(Per bottle)", description, feature row from real fields only, qty stepper + "Add to cart · total"). No size selector: only pantry items have `sizes[]` and the cart has no sizeId.
- Stepper buttons are 48dp now.

## Home rebuilt to approved app design 6b (2026-11-14)

NOT seen on a device or simulator. Verified: `tsc`, `eslint`, `jest` (72 tests), `expo export` for android and ios.

- Home now follows images 10/11 (6b First visit / Returning), not the website layout. Removed: website hero (`hero-home.webp` kept on disk, unused), logo + Cart pill header, location/ETA pill, "Three ways" stacked tiles, bestseller rows, plan banner, tab-tour coach mark, `homeService`/`useHome`/`homeMock`/`PlanCard`/`CoachMark`.
- Header: bell (count badge only when a real unread count exists; live mode has none) + avatar (initials, "G" for guests, ring + chevron badge) right-aligned, serif greeting below.
- States come from real data: signed in AND (orders from `/api/me/orders` or an activated plan from `/api/me/subscriptions`) = Returning, otherwise First visit (guests always).
- Greeting: guest "Hi there"; first visit "Hi {first}, welcome in"; returning "Good morning/afternoon/evening, {first}" (device time). Subline: "Day N of your {dish} plan. Nice going." with a live plan, else "Eat-now delivers in about 30–45 min." (no location).
- First visit: "Start a breakfast plan" card ("PLAN · FROM ₹X A JAR", X = lowest backend quote total / deliveries for the cheapest plan-able dish; "PLAN · PAY ONCE" if the quote fails). Returning: dark next-delivery card (date kicker, dish, "Delivery N of M · prepaid") from the plan's deliveries; "Order again" row from past order items matched to the catalog by name, + / check-count wired to the cart, "Cart · N" link.
- 2-up tiles (Eat now, 30-day plan): two equal flex columns, gap 14, no third column.
- Omitted because the backend lacks it: Welcome credit card (the backend has no signup/welcome credit; credit comes only from refunds, referral rewards and admin adjustments), Skip button (skip endpoint is admin-only), "7–9 AM" in the kicker (not in subscription data; static website copy only), location/ETA, notification count (no endpoint), "Skip any day and it moves to the end" copy (not backed).
- Cart entry on Home exists only in the Returning "Order again" row (per design); the First visit layout has no cart link.
- Dimensions are the design's px scaled to pt (~0.64) with 44pt minimum touch targets, not measured on device.

### Deviations from approved app design
The Shop, Orders, Plans and Account deviations listed here earlier are resolved by the 2026-11-16 mockup pass below. Cart (6d) deviations are listed under the Cart section. Mockup 6g is built as a SpoonUp credit history screen (see the credit section at the end), not a wallet.

## Cart / Checkout / payment results rebuilt to owner mockups 6d-6d6 (2026-11-16)

Seen on the Android emulator (Pixel_8, Expo Go, live mode, signed in): Cart immediate + scheduled (day chips, slot grid, coupon expanded with keyboard), Checkout, Payment failed, Payment cancelled, Order confirmed (the last three with temporary hard-coded navigation/data, since removed; no payment was made). Not seen: iOS, Payment successful as its own screen, a real order confirmation from the backend. `tsc`, `eslint`, `jest` (72) pass.

### Changed
- Cart (6d): "Cart / N in cart" header, EAT NOW group with timing line ("Immediate" or "Scheduled · day, slot"), steppers, DELIVERY TYPE tiles (Immediate / Scheduled), day chips + 2-column slot grid (`checkout/components/DeliveryPicker.tsx`), Deliver-to card (signed in only) with Change, "Apply a coupon" row (expands to a code field), bill, dark "Checkout · ₹X" CTA. The cart quote now carries the coupon, so the bill matches checkout.
- Checkout (6d2): Deliver-to card, PAY ONLINE with Razorpay, bill, "Pay ₹X with Razorpay". Payment now starts here; the separate Payment screen/route was removed (audit a: no more step numbers, no clipped heading; Section and DeliverySection deleted). "Estimated total" is now "To pay" (f).
- Payment failed (6d4) / cancelled (6d5) / Order confirmed (6d6, dark "Order placed" card, Track order, Continue shopping). Shared `PaymentOutcome` also restyles the Plan failed/cancelled screens.
- Audit: (b) slot list replaced by chips + grid; (c) New address form uses `KeyboardAvoidingView behavior="padding"` on Android too (edge-to-edge) and the Save button is visible over the keyboard (verified); (d) `hooks/useFooterPadding.ts` gives Android a minimum bottom inset, used by Cart, Checkout, outcome screens, address screens; (e) cart group header is now a single tinted bar.

### Deviations (owner to confirm)
- Cash on delivery, Cashfree: not rendered (no COD: `paymentMethod` is always online; Cashfree is hidden on the website). The SpoonUp credit toggle IS rendered now (see the credit section at the end).
- "Immediate · ~40 min" / "Arrives in ~40 min": backend sends no ETA, so tiles say "Made fresh"; confirmation card says "Order placed" unless the order has `etaText`.
- Slots: mockup shows 4 meal windows; backend slots are hourly, so the grid lists them all (first 3 days).
- Payment success (6d3) is not a separate screen: Order confirmed appears only after backend verification and shows amount, Razorpay and payment reference (no UPI/method detail, no date, no SMS receipt line).
- Failed screen: no provider decline reason / payment id from the backend, so Reason is generic and Reference is the checkout handle. "Try again" and "Pay ₹X" return to Checkout (same idempotency key) instead of paying immediately; "Use another payment method" is "Back to cart" (only one method).
- Order confirmed has no "NOW / rider texts you" note and no COD row. Stepper keeps the square outline style (not the mockup pill). Guests see no Deliver-to card in Cart (addresses need an account) and still log in at checkout.

## Remaining screens rebuilt to owner mockups (2026-11-16)

Seen on the Android emulator (Pixel_8, Expo Go): live mode, signed in as the test account: Sign in, Home (guest-style first visit), Shop, Product details, My plans (empty), New 30-day plan, Account, Addresses. Mock mode (Metro restarted with `EXPO_PUBLIC_USE_MOCKS=true`, then restored): Orders list, Order details, Notifications, Help & support, Ticket details, New ticket. Not seen: iOS, an active/paused/ended plan card with real deliveries, Order details "Reorder" bar, the keyboard over Sign in (the emulator did not raise its soft keyboard; the form uses `KeyboardAvoidingView padding` plus `useFooterPadding`, same as the verified address form), Plan success. `tsc`, `eslint`, `jest` (70) pass.

### Changed
- Icons: one line-icon set in `components/common/Icon.tsx` (`Icon` + names, 24px grid, round caps, 1.7 stroke). Tab bar, headers (back arrow), steppers, account rows, notifications, coupon chevrons, Home tiles/header, onboarding arrow now use it; no text glyphs (`<-`, `>`, `+`, check marks) or emoji remain in UI. Tab bar stays icon-only with a dot: the mockup has no labels (accessibility labels are set).
- Button default is now the ink pill (`variant="dark"`), as in every mockup CTA; `primary` (olive) is still available.
- Sign in (6a): one layout for sign in and sign up (logo, serif heading, pill inputs, ink CTA, Or continue with Google/Apple "soon", switch link, Skip for now, Track an order). The separate mobile-number layout, quote rotator and OTP input were removed (the backend has no phone OTP; the live app already refused it). Footer pads for the Android gesture bar; heading no longer clips on Android.
- Home (6b): verified; greeting uses a first name only, truncates (2 lines), and falls back to "Hi there" / "Good morning" for username-like names (mobiletest_x, digits, underscores, long). Guests and first visits get a "From the kitchen" row (live catalog order, "See all").
- Shop (6c): header + cart, search pill, All / Eat now / Subscribe chips with dots, 2-column grid (image fills card via AspectImage, NOW tag, backend kind/unit line, price + Add or stepper pill, "Plan it" for plan-able dishes), floating cart bar. Sort chips removed (not in mockup).
- New 30-day plan (6f2): jar picker, how-often tiles with backend delivery counts, dark YOUR PLAN card from the backend quote, Continue to the existing Plan payment (address + Razorpay). Plan success restyled.
- My plans (6f): live plans as cards (progress from delivered count, next-two-weeks strip from the plan's own deliveries, Help), ended plans with Buy again, empty state with a "Build a 30-day plan" hero.
- Orders (6e/6e2): All / Active / Past, ACTIVE and PAST groups, cards with tag, status, photo (catalog match by item name), progress segments, Reorder / Get help on past orders; details with status hero, timeline, items, deliver-to, Get help, Reorder bar. Tracking screen restyled.
- Account (6h): avatar + name + phone/email + Edit, Active plans / Orders strip, rows with live counts (orders, plans, saved addresses), Help & support, Sign out, app version. Addresses (6i): "Add a new address" tile and restyled cards. Notifications (6j), Help & support (6k), New ticket (6k2), Ticket thread (6k3) restyled (mock mode only, see below).

### Deviations (owner to confirm)
- Omitted, no backend data (rendered only if it exists; `// DECISION` / `TODO(api)` in code): member-since, Delivery alerts toggle, Terms row, payment methods, rider card and map, order ETA beyond `etaText`, Invoice, rating, Cancel order, plan Skip / Pause / Change slot / Resume / Extend, slot and start-date pickers and "you save" on New plan, "Plan it · from Rs X" price on shop cards, address Save-as tags / landmark / default toggle / map strip, ticket contact tiles (call/WhatsApp numbers unknown).
- Login method: mockup is phone OTP; the backend only has username/email + password, so the mockup's look is kept with the real fields. Google/Apple are disabled "soon".
- Notifications and Help & support are mock-mode screens; live shows the styled "email support" state (backend has no endpoints). Their real layouts were only verified in mock mode.
- Plans tab title "My plans" and Account title are 15px sans, as in the mockups (other tab titles are 30px serif, as mocked).
- New plan then Plan payment are two steps (mockup shows one screen); the address and Razorpay step is unchanged.
- Product details: redesigned 2026-11-16 to the owner's reference image (see the section at the end).
- Onboarding copy ("~35 min", "Koramangala kitchen") is the approved static design copy, not backend data.

## SpoonUp credit and referral (2026-11-16)

**CLAUDE.md conflict, flagged:** section 13 ("no customer-facing wallet"; store credit from refunds only) is superseded by the owner for credit. The wallet concept is dropped; SpoonUp credit (the website's "store credit") and the referral programme follow the website/backend exactly. Backend wins over the mockups: the mockup's "On eat-now items" wording and a welcome-credit card are not built (the backend has neither).

Built (`src/features/credit`; hooks `useCreditStatement`, `useReferral`, `useCreditOffer`):
- Account: Credit tile (opens the Credit screen) beside Active plans and Orders, and a dark Refer & earn card (code, programme copy and timing from the backend rule, "Share your code" via React Native `Share`, link `<site>/signin?ref=CODE` as on the website). Card hidden if the programme is off, there is no code, or the call fails.
- Credit screen (mockup 6g, no wallet): current credit and activity from `/api/me/store-credit` (Refund, Referral reward, Used on an order, Adjustment, Expired), referral card, skeleton / error / logged-out states, pull to refresh. A 404 (new account) shows zero.
- Cart and Checkout: "Use X SpoonUp credit" switch row (signed in with credit only), a "SpoonUp credit" bill row, "To pay". Plan payment: same switch (the website applies credit to plan carts too). Pay sends `storeCreditAmount`; the charge is the backend's `prepare.amount`.
- Credit shown is an estimate `min(credit, payable)` with the coupon off first (what the website does); the backend re-validates, clamps and reserves at prepare (cart/quote has no credit params).
- `noWallet` test: still bans wallet, top-up, withdraw, auto-renew, recurring, subscription wording; `balance` allowed only in `credit/types.ts` and `credit/services/creditService.ts` (backend field name, mapped to `available`). `DECISION` comments saying credit was omitted removed.

Verified: live GET `/api/me/store-credit` and `/api/me/referrals` with the test account (200, shapes match: credit 0, code present, programme enabled). `tsc`, `eslint`, `jest` (72 + credit tests) pass. Not verified: a non-zero credit amount in the UI (test account has 0, so the toggle is hidden), a credit-funded prepare/pay (no payments, no production redemption), iOS, visual render of the new Account tile / Credit screen (emulator step blocked, see report).

Credit visual check (2026-11-16, Android emulator, mock mode, then restored to live): Account Credit tile (₹150) + Refer & earn card, Credit screen (available, programme copy, activity row), Cart credit switch (off: To pay ₹299; on: "SpoonUp credit −₹150", To pay and Checkout ₹149). Rendered correctly; no payment attempted.

## Product details and Home images (2026-11-16)

Product details (owner reference image, brand tokens not the reference's colours/fonts):
- Full-bleed hero (45% of screen height, cover, muted backdrop), round white back button over it (safe-area aware). Flat white content below: olive mono kicker from backend `category` (omitted if absent), DM Sans semibold name, large price + "per <unit>" (unit parsed from "(Per bottle)"), description, divider-bordered row of line-icon chips, sticky bar with outlined stepper "− 1 bottle +" and olive "Add to cart · ₹X" (price × qty, display only; backend prices the cart), bottom padding from `useFooterPadding`.
- Chips from real fields only (`attributes()` in the screen, unit-tested): truck "Eat now" (kitchen/immediate), clock "Ready in N min" (backend `prepMinutes`, now mapped in `catalogService`), calendar "Plan available" (`subscribable`), jar "Per <unit>". Row hidden if empty. New `truck` icon (1.7 stroke).
- Omitted because the backend lacks them (public product allow-list `server/publicProduct.js`): rating row, MRP/compare price and discount pill, veg flag, favourite heart (no favourites endpoint). No "Plan it" on details (it was not there before; Shop cards keep it).

Home images (mockup 6b):
- Root cause of the empty strip beside photos: `AspectImage` put `aspectRatio` and `maxHeight` on one View, so once the height cap applied Yoga shrank the width (strip on the right of the plan card). Now the ratio sits on an inner View and the outer View caps the height and clips; fixes every user (Home, Shop cards, Plans).
- `lifestyle/week-jars.jpg` had a cream frame around the cloth (white strips in the 30-day tile/plan card); cropped to the cloth (1125×680). Also used by Onboarding and Plans.
- Plan card image capped at 120dp, category tile images ratio 2 / max 96dp (mockup 74–120), product row cards unchanged (150 wide, ratio 1.42, matches 6b 136/96).
- `src/assets/images/hero-home.webp` (untracked) is not referenced anywhere.

Seen on the Android emulator (Pixel_8, live, guest): Product details for Asian Salad (no unit) and Cold Coffee (unit "bottle"), mock Mango Chia Pudding (no category), Home top and scrolled, Shop grid. `tsc`, `eslint`, `jest` (73) pass. Not seen: iOS, the "Ready in N min" chip (the products opened had no `prepMinutes`).

Card heights, referral button, mock pudding image:
- Home product rows (`ReorderRow`): name reserves 2 lines (`minHeight`), so cards in a row are equal height with prices aligned. Shop grid already equal (row stretch + `top flex:1` + reserved plan slot); unchanged.
- Refer & earn "Share your code" now uses shared `Button` (`variant="sage"`, pill).
- Mock `chia` item renamed "Mango Chia Pudding" -> "Cocoa Chia Pudding": no mango photo exists in the app, website assets, or backend catalog; `chia.png` is a chocolate chia jar. `chia.png` is only 400px wide (looks soft on Product details); no larger copy of that photo exists. Live images are full-size originals from GCS (no thumbnail variant used). Also noticed: mock "Green Glow Smoothie" uses `smoothie.png`, a pink dragonfruit smoothie (not fixed).
- Seen on Pixel_8: Home (live guest) row, Shop grid (live and mock), Account referral card (mock). tsc, eslint, jest (73) pass.
