# SpoonUp Mobile - Progress Report

Audit date: 2026-10-17. Read-only audit; this file is the only change. Git status was identical before and after.
Scope: ~2,800 lines of TS/TSX in `src/` + `App.tsx`; 1 test file. Secrets: `.env` exists and is gitignored; `.env.example` exists. No values recorded here.

## 1. Overall completion estimate

**~8-10% of the CLAUDE.md scope (about 4 of ~45 inventory screens built, all UI-only on mock data; 0% of backend integration).**

Evidence:
- Real screens: Splash, Onboarding, Auth (Welcome/Phone/OTP/Profile/Done as 5 steps inside one `AuthScreen`), Home. Everything else is `PlaceholderScreen` (Cart, Notifications, Shop, Orders, Plans, Account) or absent.
- Zero `useQuery` / `useMutation` anywhere. `QueryClientProvider` is mounted in `App.tsx` but never used.
- `src/services/api/endpoints.ts` is entirely comments. `apiClient` is never called by any feature.
- Auth is a mock (`authService.ts`: delays only; any code except `000000` passes). No session, no token, no logout, no session restore.
- `secureTokenStore` (Keychain) is never imported. `interceptors.ts` does not attach auth.
- Catalog = hardcoded `PRODUCTS`; home data = `HOME_MOCK` (hardcoded "Priya", pincode, plan); serviceability = hardcoded 7 pincodes.
- Checkout, payments (Razorpay/Cashfree), orders, tracking, 30-day plan, support, push, deep links: no code, no dependencies in package.json.
- Quality of what exists is good: typed, tsc clean, lint clean, small components, theme tokens, fonts bundled.

## 2. Completed features (verified in code)

- Project scaffold: RN 0.87.1, TS, ESLint/Prettier/Husky, `.env` loading via react-native-dotenv, bundle id renamed to `com.spoonup.mobile` / `SpoonUp` iOS project.
- Theme system (colors, typography, spacing, radius) and custom fonts (DM Sans, Instrument Serif, JetBrains Mono) bundled.
- Navigation shell: native stack (Splash -> Onboarding -> Auth -> MainTabs, + Cart, Notifications) and 5 bottom tabs with icons and active dot.
- Splash (animated, routes by onboarding-seen flag via AsyncStorage).
- Onboarding carousel (slides, skip, get started, persisted "seen").
- Auth UI flow: phone (10-digit validation), OTP input with 30 s resend timer, wrong-code error, profile (name, 6-digit pincode, serviceability message, optional referral), done screen. Client-side validation and busy states present. Logic is mocked.
- Home UI: header (greeting, notification bell, avatar), welcome-credit card, breakfast plan card, active plan card with skip toggle, category tiles, reorder row with add-to-cart, coach mark.
- Local cart state (`CartContext`, in-memory, quantity add/remove, count, subtotal computed client-side) - only add is reachable from Home.
- Base HTTP client (timeout, JSON, `ApiError`) - built but unused.
- Reusable components: Button, TextField, OtpInput, Icon, TabBarIcon (5 only).

## 3. Partially completed

- Auth: UI done, backend not wired; no token persistence; "Continue with Google" is a disabled stub; "Skip" guest path simply enters tabs (no guest/auth gating exists).
- Home: UI done; all data mock; "isNewUser" is hardcoded `true`; the returning-user branch is only reachable by editing code.
- Cart: context exists with client-side subtotal (violates "backend decides totals" once real), not persisted, no UI screen, no stepper, no guest->login preservation.
- API layer: client + error class exist; no endpoints, no auth header injection, no 401/refresh handling, no TanStack hooks, no offline detection.
- Navigation types: `Shop` accepts a category param but Shop is a placeholder.
- Android/iOS: native projects renamed and configured; not built in this audit.

## 4. Not started

Product listing/categories/search/detail; real cart screen; checkout (address list/add/edit, delivery selection, coupon, order summary); payment SDKs and success/failed/cancelled screens; backend verification polling; order confirmation; orders list/details/tracking; guest order tracking; 30-day plan (details/payment/success/active/expired); account (profile, addresses, notifications list, logout); support (tickets list/create/detail/attachments); push notifications (FCM/APNs); deep links; image picker/permissions; logout and cache clear; session restore; offline/network-error UI; analytics/crash reporting; E2E tests; CI.

## 5. Broken functionality and blockers

- Tapping Cart/Notifications bell/Account avatar/Shop/Orders/Plans lands on a plain text placeholder: user-visible dead ends. "Use credit", "Build plan", "Popular/See all" all route to placeholders.
- Home "Cart · N" action goes to a placeholder Cart: cart can be filled but never viewed.
- No logout; no way to return to Auth or reset onboarding after first run.
- `config/env.ts` throws at import if `API_BASE_URL` is unset: app (and tests) crash without `.env`. Tests currently pass only because `.env` exists locally; CI will fail unless env is provided.
- Blocker: no backend contract decisions (see Spec conflicts). Backend source (SpoonUp-Website/server) is referenced in comments but not in this repo.
- Blocker: payment SDK choice/keys (Razorpay vs Cashfree) unresolved; no native deps added.
- Android release manifest sets cleartext false (good); debug sets true (fine). iOS ATS arbitrary loads false with local networking allowed (good). `PrivacyInfo.xcprivacy` exists.
- Test coverage: a single smoke test; no tests for auth flow, cart, components.
- Git: large uncommitted/untracked working tree (src/, design/, CLAUDE.md untracked); only 1 commit. Risk of loss; not committed per instructions.

## 6. Mock data needing API integration

| File | Mock | Replace with |
|---|---|---|
| `src/features/auth/services/authService.ts` | sendOtp / verifyOtp / completeProfile (delays, `000000` fails) | backend `/api/auth/*`, returns session; store via `secureTokenStore` |
| `src/features/auth/data/serviceArea.ts` | 7 hardcoded pincodes + ETA | backend serviceability check |
| `src/features/shop/data/products.ts` | 9 hardcoded products, prices, local images | backend `/api/products` |
| `src/features/home/data/homeMock.ts` | name, initials, isNewUser, unread count, location, active plan | profile, notifications, plan endpoints |
| `src/features/home/components/*` | copy such as "from Rs 246/jar", credit text | backend pricing/credit |
| `src/features/cart/context/CartContext.tsx` | local qty + client subtotal | backend cart validation/totals |
| `src/features/onboarding/data/slides.ts` | static copy (acceptable) | - |

## 7. Screen-by-screen progress

Legend: Verified = code read, tsc/lint clean, behaviour traced. UI-only = renders, mock data, not end-to-end. Not run on device in this audit, so "Verified" means code review, not runtime/visual QA.

| # | Screen (CLAUDE.md inventory) | Status | Notes |
|---|---|---|---|
| 1 | Splash | Verified (code) | Real, onboarding-flag routing; no session restore |
| 2 | Onboarding | Verified (code) | Real, persisted flag |
| 3 | Login | UI-only | Phone+OTP step, mocked |
| 4 | Signup (profile step) | UI-only | Mocked, no account created |
| 5 | Forgot Password | N/A / not started | OTP flow may make it unnecessary; confirm |
| 6 | Home | UI-only | All mock |
| 7 | Categories | Placeholder (Shop tab) | |
| 8 | Search | Not started | |
| 9 | Product Listing | Not started | |
| 10 | Product Details | Not started | |
| 11 | Cart | Placeholder | State exists, no screen |
| 12 | Checkout | Not started | |
| 13 | Address List | Not started | |
| 14 | Add/Edit Address | Not started | |
| 15 | Delivery Selection | Not started | |
| 16 | Coupon | Not started | |
| 17 | Payment | Not started | |
| 18 | Payment Success | Not started | |
| 19 | Payment Failed | Not started | |
| 20 | Payment Cancelled | Not started | |
| 21 | Order Confirmation | Not started | |
| 22 | Orders | Placeholder | |
| 23 | Order Details | Not started | |
| 24 | Order Tracking | Not started | |
| 25 | Guest Order Tracking | Not started | |
| 26 | Plan Details | Placeholder (Plans tab) | |
| 27 | Plan Payment | Not started | |
| 28 | Plan Success | Not started | |
| 29 | Active Plan | Partial: Home card only, UI-only | |
| 30 | Expired Plan | Not started | |
| 31 | Profile | Not started | |
| 32 | Addresses | Not started | |
| 33 | Notifications | Placeholder | |
| 34 | Account (hub) | Placeholder | |
| 35 | Logout | Not started | |
| 36 | Support | Not started | |
| 37 | My Tickets | Not started | |
| 38 | Create Ticket | Not started | |
| 39 | Ticket Details | Not started | |
| 40 | Attachment Upload/Preview | Not started | |

Totals: 4 built UI-only/real (Splash, Onboarding, Auth, Home) of 40 listed; 2 of them (Splash, Onboarding) functionally complete; 0 integrated with backend. Per-screen states: loading/empty/error/offline exist only partially in Auth (busy, OTP error, submit error); none on Home; no offline handling anywhere.

UI fidelity: Home/Auth/Onboarding follow the design 6a/6b palette, fonts and layout (Olive/Forest/Almond tokens); not pixel-compared against the mockup. Design mobile screens 6a-6h; only 6a, 6b are implemented. Design has no checkout/support screens for mobile, so those have no visual spec.

Responsive/platform: SafeArea insets used on Home; fixed 48x44 tab icon wrapper (meets 44/48 target); no tablet/small-phone or dynamic-type testing evident; no KeyboardAvoidingView check performed beyond code skim; Android back behaviour and permissions not implemented.

## 8. Build/test results

| Command | Result |
|---|---|
| `node_modules` | Present (577 entries); no installs run |
| `npx tsc --noEmit` | No output, no errors (pass) |
| `npm run lint` (`eslint .`) | No warnings or errors (pass); dotenv injected 2 vars |
| `CI=true npm test -- --watchAll=false` | 1 suite, 1 test (`App renders correctly`) passed, ~5.7 s |
| Native iOS/Android builds | Not run: would require pod install / Gradle download and risk tracked-file changes |
| Git status before vs after | Identical (before the report was written) |

Note: exit codes were not captured by my pipeline; outcomes are from output (no errors printed, jest "passed").

Security scan (existence only): no hardcoded keys/tokens found in `src/`; no `console.*` logging; no `TODO/FIXME` markers; fetch uses base URL from `.env` (HTTP in dev only, cleartext disabled in release, ATS strict); Keychain dependency installed but unused, so there is currently no session storage at all; `.env` is gitignored.

## 9. Prioritized next steps

**P0 (unblock everything)**
1. Resolve spec conflicts below with product owner; confirm backend contracts (auth, products, cart, orders, plan, payments) from website `server/`.
2. Fill `endpoints.ts`; add auth header injection + 401 handling in `interceptors.ts`; wire `secureTokenStore`; add session restore and logout; replace `authService` mock; add guest-vs-auth gating with cart preservation.
3. Replace `PRODUCTS`/`HOME_MOCK` with TanStack Query hooks (loading/empty/error/offline states).
4. Fix dead ends: build real Shop/Categories, Product Detail, Cart screens.

**P1 (core commerce)**
5. Checkout (address, delivery, coupon, summary), backend-computed totals, order creation.
6. Payments: pick provider, add SDK, backend verification polling, success/failed/cancel screens.
7. Orders list/details/tracking + guest tracking.
8. 30-day plan screens (one-time prepaid, server price, access state).
9. Account: profile, addresses, notifications, logout.

**P2 (completion/hardening)**
10. Support tickets with attachments (permissions, 429 handling).
11. Push notifications, deep links, offline banner, accessibility pass.
12. Tests (auth hook, cart, components, API client), CI with env fixture, make `env.ts` not throw at import in tests, device QA on small/large iOS and Android.
13. Commit work (needs user request), delete `PlaceholderScreen` when unused.

## Spec conflicts (flag, do not guess)

- **Tabs:** CLAUDE.md = Home, Categories/Search, Orders, Account (cart not a tab). App = Home, Shop, Orders, Plans, Account (5). Design = Home, Shop, Orders, Plans, Wallet (+ Account via avatar). Per CLAUDE.md rule 14, backend/business rules > design > CLAUDE.md, so decision is needed: likely keep Shop as Categories/Search, decide if Plans stays a tab.
- **Wallet:** Design README and mock (6g Wallet, "plan balance", "spendable credit", top-up, per-delivery deduction) conflict with CLAUDE.md (no customer wallet, no top-up/deduction). Home already shows a "welcome credit" card and "SpoonUp credit"; CLAUDE.md allows only non-cash store credit from refunds. Needs business ruling.
- **Plan model:** Design = recurring subscription (daily/alternate/weekly, 1-3 months, per-delivery wallet deduction, pause/skip/extend/renew). CLAUDE.md = one-time prepaid 30-day plan, no recurring, no auto-renewal. Existing Home UI ("Delivery 3 of 30 · prepaid", skip toggle) is a hybrid. Backend behaviour decides; confirm what the website backend actually implements.
- **Guest checkout:** design cart says "no account needed first"; CLAUDE.md says checkout requires auth with cart preserved. Confirm.
- **Payment gateway:** design says no gateway names in UI; CLAUDE.md names Razorpay (plan) and Cashfree (as per backend).
