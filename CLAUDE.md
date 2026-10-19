# SpoonUp Mobile — CLAUDE.md

Never do the work yourself.
Always hand it to a sub-agent.

## 1. Project Overview

- SpoonUp **customer** mobile app: React Native, iOS + Android, production-ready.
- Shares the existing SpoonUp backend/API with the website.
- The mobile app is a **client, NOT the source of truth**. Website/backend is.

## 2. Core Architecture

```
Mobile App → SpoonUp Backend/API → Supabase / Payment Providers
```

The app must NOT implement business-critical logic. Backend is authoritative for: product prices, inventory, cart validation, order totals, coupons, payments, payment verification, 30-day plan activation, access expiry, refund/store-credit logic, authorization, support-ticket authorization/rate limits.

## 3. Main Navigation

Bottom tabs: **Home · Categories/Search · Orders · Account**.

- Cart is globally/persistently accessible (header icon / floating entry), not necessarily a tab.
- **Guest (no auth):** browse catalog, search, use cart, track an order via confirmation/tracking reference.
- **Auth required:** checkout under an account, order history, addresses, 30-day plan, support tickets, notifications, profile.
- Prompt login/signup when a guest hits an auth-required action; preserve cart and return to the interrupted step afterward.

## 4. Customer Flows

### Authentication

Splash → Login / Signup / Continue as Guest → Home.
Login, Signup, Logout (clear secure storage + query cache), Session restoration on launch (silent refresh; fall back to guest/login on failure), Forgot Password (backend-driven reset), Guest mode.

### Product Discovery

Home → Category/Search → Product Listing → Product Details → Add to Cart.

### Cart

Supports immediate-delivery items, scheduled orders, delivery-in-days items. **Backend decides how orders/sub-orders are created.** Client only displays what the backend returns.

### Checkout

Cart → Checkout → Address → Delivery → Coupon → Order Summary → Payment → Backend Verification → Confirmation.
Handle Success, Failure, Cancel, Retry. **Never trust client-side payment success**; confirmation is shown only after backend verification.

### 30-Day Prepaid Plan (separate from product ordering)

Plan → Fixed Price → One-time Payment → Backend Verification → 30-Day Access → Expiry.

- One-time upfront payment; fixed, server-controlled price.
- **No** wallet, wallet balance, top-up, wallet deduction, recurring subscription, or auto-renewal.
- Access activates ONLY after verified payment.
- Store payment reference + access start/expiry dates (backend). Access expires after 30 days.

### Orders

Orders → Active/Past → Order Details → Status/Tracking.
Show: order ID, items, delivery type, address, payment status, order status, support action. If backend uses parent/sub-orders, **hide that from customers**.

### Guest Order Tracking

Confirmation/Tracking Reference → Guest Order Status, via the **existing secure guest-order mechanism** (do not invent a new one).

### Support

Account → Support → My Tickets.
New ticket: Category → Optional Order → Subject → Description → Attachment → Submit.
Lifecycle: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`. Includes replies, attachments, customer/admin authorization, email notifications.
Anti-spam (server-side):

- Ticket-creation and reply rate limits; default max **3 new tickets/user/hour**.
- No new ticket while one is OPEN/IN_PROGRESS.
- Violations return **429**; app shows a friendly message.

## 5. Support Attachments

Allowed: JPG/JPEG, PNG, WEBP, PDF. Backend must enforce: MIME/type validation, extension validation, file-size limits, safe filenames, no executable HTML/SVG/script content, **private storage**, authorization before view/download, metadata linked to ticket/reply. Client-side checks are UX only.

## 6. Email + Push Notifications

Email: new ticket → support/admin; admin reply → customer; resolved/closed → customer.
**Ticket creation must succeed even if email fails.** Email is a side effect, not part of the transaction.
Push: order confirmed, status changed, out for delivery, delivered, payment failed, 30-day access activated, access nearing expiry, support reply, ticket resolved.

## 7. Screen Inventory

- **Auth:** Splash, Onboarding (if required), Login, Signup, Forgot Password
- **Shopping:** Home, Categories, Search, Product Listing, Product Details, Cart
- **Checkout:** Checkout, Address List, Add/Edit Address, Delivery Selection, Coupon, Payment, Payment Success, Payment Failed, Payment Cancelled, Order Confirmation
- **Orders:** Orders, Order Details, Order Tracking, Guest Order Tracking
- **30-Day Plan:** Plan Details, Payment, Success, Active Plan, Expired Plan
- **Account:** Profile, Addresses, Notifications, Support, Logout
- **Support:** My Tickets, Create Ticket, Ticket Details/Conversation, Attachment Upload/Preview

Every screen needs loading, empty, error, validation, and offline/network-error states.

## 8. Technical Architecture

```
src/
├── navigation/  ├── screens/  ├── components/
├── features/ (auth, catalog, cart, checkout, orders, payments, plan, support)
├── api/  ├── state/  ├── services/  └── utils/
```

- TanStack Query for server state.
- Lightweight store for local/cart/UI state.
- Secure platform storage (Keychain/Keystore) for session credentials.
- Single shared API layer; reusable components; feature-based organization.
- Don't duplicate backend data/business logic.

## 9. API Principles

All important operations go through the SpoonUp backend. Never trust the client for: price, quantity totals, coupon validity, payment status, payment amount, plan activation, order ownership, ticket ownership, attachment authorization. Backend validates all of these.

## 10. Payment Architecture

```
Mobile → Backend → Payment Provider → Backend Verification/Webhook → Database → Mobile refresh
```

- Providers: **Razorpay** (30-day prepaid one-time payment); **Cashfree** as specified by current backend/business plan.
- Never activate access from a client callback alone.
- Handle success, failure, cancel; signature verification; webhook verification; idempotency; duplicate-payment protection; wrong-amount protection; client-tampering protection (all server-side).
- After the SDK returns, the app polls/refreshes backend status.
- No payment secrets in the app.

## 11. Security

Secure auth/session handling · API authorization · no secrets in app bundle · backend validation · IDOR protection · secure file access · server-side payment verification · rate limiting · input validation · safe error messages · no sensitive data in logs · HTTPS only.

## 12. Responsive / Platform

Must work on iOS and Android, small and large phones. Follow platform conventions while keeping SpoonUp branding. Handle: keyboard, safe areas, status/nav bars, permissions (camera/photos/notifications), network failures, loading states, deep links, accessibility (labels, contrast, dynamic type), minimum touch targets (44pt iOS / 48dp Android).

## 13. Business Rules

- Product/catalog data is backend-controlled.
- No customer-facing wallet; no wallet top-up/deduction/withdrawal.
- 30-day plan is prepaid once, not recurring.
- Payment is verified server-side; access starts only after successful verification; access expires after 30 days.
- Refunds, where applicable, become non-cash SpoonUp **store credit** per backend rules; store credit is not withdrawable.
- Support tickets require authorization and anti-spam controls.

## 14. Development Rules

Before changing code: inspect project structure and existing API/backend contracts; reuse existing components/patterns; don't redesign completed UI without reason; don't invent unsupported business logic or duplicate backend functionality; preserve working functionality.
While working: small, testable changes; test affected flows; run lint/tests before calling work complete; never use production data for testing; never expose secrets; **do not commit/push unless explicitly asked**.

**Source-of-truth order on conflict:**

1. Current backend behavior
2. Current approved business rules
3. Current UI/design
4. This CLAUDE.md

Flag conflicts explicitly; don't silently guess.

## 15. Principle

Deliver a clean native customer experience on the same SpoonUp business logic and backend as the website. Do not build a separate business system for mobile.
