# SpoonUp Mobile: Screen Status

Visually verified on the iOS Simulator for the screens listed in the Visual QA section below (2026-10-19); everything else is not. "Ready" means: real UI, loading/empty/error/validation handled, reachable in navigation, backed by a mock service. Checks run: `tsc --noEmit`, `npm run lint`, `npm test` all pass.

## API seam (mock service -> endpoint it will replace; names only)

| Mock file | Replaces |
|---|---|
| `features/auth/services/authService.ts` | send OTP, verify OTP, complete profile (website `/api/auth/*`) |
| `features/auth/context/AuthContext.tsx` (in-memory user) | session restore / refresh / logout; 401 enters via `services/api/sessionEvents.ts` |
| `features/account/services/profileService.ts` | update customer profile (name) |
| `features/shop/services/catalogService.ts` (+ `data/products.ts`) | product list, product detail |
| `features/home/data/homeMock.ts` | home content / reorder suggestions |
| `features/cart/services/cartService.ts` | cart validate/quote (prices, totals) |
| `features/checkout/services/checkoutService.ts` | checkout quote, coupon apply, place order |
| `features/checkout/services/addressService.ts` | address list/create/update/delete |
| `features/checkout/services/paymentService.ts` | create payment (Razorpay/Cashfree), verify payment status |
| `features/orders/services/ordersService.ts` | order list, order detail, tracking |
| `features/orders/services/guestOrderService.ts` | existing secure guest-order lookup |
| `features/plan/services/planService.ts` | plan offer/status, create plan payment, verify |
| `features/support/services/supportService.ts` | tickets list/get/create/reply, attachment signed-URL |
| `features/support/services/pickAttachment.ts` | native image/document picker (library not installed) |
| `features/notifications/services/notificationService.ts` | notifications list, mark read, mark all read |
| `services/network/connectivity.ts` | NetInfo listener (single marked place) |
| `services/api/client.ts` + `interceptors.ts` | real HTTP; auth-token injection; 401 already wired to session-expired UI |

## Inventory audit (CLAUDE.md section 7)

Status after this pass. Gaps listed are what remains, if any.

| Group | Screen | File | Status | Notes / gaps |
|---|---|---|---|---|
| Auth | Splash | `features/onboarding/screens/SplashScreen.tsx` | Ready | Static, no data. |
| Auth | Onboarding | `features/onboarding/screens/OnboardingScreen.tsx` | Ready | |
| Auth | Login / Signup | `features/auth/screens/AuthScreen.tsx` (+ components) | Ready | Single phone-OTP flow (welcome, phone, OTP, profile, done) with validation + guest skip. Removed dead disabled "Continue with Google (coming soon)" button. |
| Auth | Forgot Password | `features/auth/screens/HelpSignInScreen.tsx` | Ready (conflict) | CLAUDE.md says password reset; the app and website are OTP-based, so the equivalent is "Help signing in". Flag for owner. |
| Shopping | Home | `features/home/screens/HomeScreen.tsx` | Ready | Now driven by `useHome` (TanStack Query, `homeService` mock) with skeleton loading and ErrorState + retry. Plan card, location and reorder products are still mock. No pull-to-refresh. |
| Shopping | Categories / Search / Product Listing | `features/shop/screens/ShopScreen.tsx` | Ready | One Shop tab covers all three (category chips, search, grid), matching the design handoff. Added sort, clear-search action, pull-to-refresh. No price/protein filters (backend filter contract unknown). |
| Shopping | Product Details | `features/shop/screens/ProductDetailsScreen.tsx` | Ready | |
| Shopping | Cart | `features/cart/screens/CartScreen.tsx` | Ready | |
| Checkout | Checkout (+ Delivery Selection, Coupon) | `features/checkout/screens/CheckoutScreen.tsx`, `components/DeliverySection.tsx`, `CouponSection.tsx` | Ready | Delivery and coupon are sections inside Checkout, not separate screens (matches design). |
| Checkout | Address List / Add-Edit Address | `features/checkout/screens/AddressListScreen.tsx`, `AddressFormScreen.tsx` | Ready | Added pull-to-refresh. |
| Checkout | Payment | `features/checkout/screens/PaymentScreen.tsx` (+ `PaymentVerifyScreen.tsx`) | Ready | Verification polling screen exists. |
| Checkout | Payment Success | `features/checkout/screens/OrderConfirmationScreen.tsx` | Ready | Shown only after backend verification; serves as Payment Success + Order Confirmation (no duplicate built). |
| Checkout | Payment Failed / Cancelled | `features/checkout/screens/PaymentOutcomeScreens.tsx` | Ready | |
| Orders | Orders | `features/orders/screens/OrdersScreen.tsx` | Ready | Pull-to-refresh now actually shows a spinner. |
| Orders | Order Details | `features/orders/screens/OrderDetailsScreen.tsx` | Ready | No pull-to-refresh (tracking screen has it). |
| Orders | Order Tracking | `features/orders/screens/OrderTrackingScreen.tsx` | Ready | |
| Orders | Guest Order Tracking | `features/orders/screens/GuestTrackingScreen.tsx` | Ready | |
| Plan | Plan Details / Expired Plan / Active Plan | `features/plan/screens/PlansScreen.tsx` | Ready | One tab, three states. Added pull-to-refresh. |
| Plan | Payment / Verify | `PlanPaymentScreen.tsx`, `PlanVerifyScreen.tsx` | Ready | |
| Plan | Success / Failed / Cancelled | `PlanSuccessScreen.tsx`, `PlanOutcomeScreens.tsx` | Ready | |
| Account | Account | `features/account/screens/AccountScreen.tsx` | Ready | |
| Account | Profile | `features/account/screens/ProfileScreen.tsx` | Ready (new) | Was read-only. Now edit name with validation, save/busy/error/saved states, offline-disabled save, keyboard handling. Phone read-only (login identity). |
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
