# Handoff: SpoonUp Foods — Website, Mobile App & Admin Panel

## Overview
SpoonUp (spoonupfoods.com) sells healthy food three ways, and every screen is built around that split:

| Order type | What it is | Delivery | Colour |
|---|---|---|---|
| **Kitchen / Eat Now** | Fresh items (puddings, smoothies, tikkis, fries) | ~30–45 min, or scheduled slot | Olive `#4A5D2E` |
| **Plan / Subscription** | Recurring deliveries of one product | Daily / alternate days / 2×week / weekly, 1–3 months | Forest `#1B2A18` |
| **Pantry / Ships** | Dry fruits, muesli, modak | Courier, 3–5 days | Almond `#8B6A46` |

One cart can hold all three. One payment covers all three. The order then splits into **parts**, each tracked on its own.

**Subscriptions use a wallet.** The user pays the whole plan up front. The money goes into a **plan balance**, and one delivery's price is deducted each time. The wallet has two balances:
- **Plan balance.** Only pays for that plan's deliveries. It **cannot be withdrawn**; exceptions are handled by email to support.
- **Spendable credit.** Comes from refunds and referrals. It can be used on kitchen and pantry orders.

## About the design files
The files in this bundle are **design references built in HTML**. They show how the product should look and behave; they are **not production code to copy**. Recreate them in the target codebase's own stack and patterns. If there is no codebase yet, pick a suitable stack (for example Next.js + Tailwind for web, React Native/Expo or Flutter for the app) and build the designs there.

The `.dc.html` files use a small in-house template runtime (`support.js`), with inline styles on everything. Treat the inline styles as the spec for exact values. Don't port the runtime.

**How to view them:** open `preview/SpoonUp-Website.html`, `preview/SpoonUp-Mobile-App.html` and `preview/SpoonUp-Admin.html` in Chrome. They work offline as long as the `preview/assets/` folder stays next to them: the product and lifestyle photos chosen in code load from there. Each file is one large canvas you can pan around. Screens carry ID badges (`1a`, `2a`, …), which are used below.

## Fidelity
**High-fidelity.** Colours, type, spacing, copy and layout are final. Build them pixel-close.

Exceptions:
- **Nutrition figures** (protein, kcal) and **pantry prices** are placeholders. Only the 23g protein on the Chocolate Chia Pudding comes from the real label. Get the real numbers from the product owner.
- Sample customers, order IDs, dates and addresses are illustrative.
- Mock-only UI that should not ship as drawn:
  - fake phone status bars
  - the app's "First visit / Returning" switch and "Restart / Reset demo" links
  - the OTP "000000 = wrong code" demo trigger
  - the "Added to cart" toast, which is always visible on 1b in the mock
  - the example state baked into each screen

## Screens

### Website (`design/SpoonUp Website.dc.html`), in flow order

**Shared web chrome**
- **Header:** 16px/40px padding, `#FCFBF7` background, bottom border `rgba(27,42,24,.08)`.
  - Logo 46px tall (52px on Home), `object-fit:contain`.
  - Nav: DM Sans 500 13.5px `#1B2A18`, 28px gap. Items: Eat Now, Subscribe, Pantry, Our Story.
  - **Location pill:** `#F4F1E7` background, 1px `rgba(27,42,24,.1)` border, 100px radius, 9px/14px padding. Content: a 7px olive dot, then "Koramangala 560095 · ~35 min ▾". It opens the pincode/serviceability picker.
  - **Cart pill:** `#1B2A18` background, `#FCFBF7` text, 10px/18px padding, 100px radius, "Cart · N".
- **Footer:** logo 52px, tagline "Good food, higher days.", three columns (Shop / Company / Policies). Policies: Terms & conditions, Privacy policy, Returns & refunds, Shipping policy, Wallet & subscription terms.

**1a · Home / landing**
1. Two-column hero (equal columns, `minmax(0,1fr)`) on `#F4F1E7`.
   - **Left:**
     - Eyebrow "GOOD FOOD, HIGHER DAYS" (JetBrains Mono 11px, `.14em` tracking, `#8B6A46`).
     - H1 in Instrument Serif 62px/1.02.
     - Body copy in DM Sans 16px/1.6 at 70% ink, max-width 430px.
     - Buttons: primary "Order in 30 min" (olive) and secondary "Build a subscription" (outline). Both 14px/26px padding, pill-shaped.
     - Serviceability line under the buttons.
     - Three stats (Instrument Serif 22px number + 12px label): 23g protein per jar, 0g added refined sugar, 4.8 avg rating.
   - **Right:** image, 560px tall.
2. "Three ways to eat with us": three cards, each with a 180px image, a mono tag chip, a 23px serif title and 13.5px copy.
3. Founder story band on `#1B2A18`: image left (400px tall), copy right. Eyebrow in `#A8B98C`, 36px serif headline.
4. Testimonials: four-column band on `#F4F1E7`.
5. Footer.

**1b · Shop (all products)**
- Filter chips:
  - "All · 24" is active (dark fill).
  - "Eat now" is olive-outlined, "Subscribable" is ink-outlined, "Pantry · ships" is almond-outlined.
  - Right-aligned quick filters: High protein · Under ₹300 · Sort: Popular.
- 4-column product grid with 20px gap. Each card:
  - white background, 10px radius, 1px `rgba(27,42,24,.1)` border
  - 180px image with a type badge in the top-left (NOW · 30 MIN / SHIPS · 3–5 DAYS)
  - name (DM Sans 500 15px), meta line (12px, 60% ink), price (500 17px) and optional struck-through MRP
  - **Plan hint line:**
    - "from ₹286/jar on a plan" (olive) on items you can subscribe to
    - "Eat-now only" (45% ink) on kitchen items with no plan
    - shipping note (almond) on pantry items
  - **Exactly one primary action:** full-width "Add to cart" (`#1B2A18`, 7px radius, 11px padding).
    - Subscribable items also get a text link "Subscribe & save →" (olive, 12px) that opens the builder (2a) with that product selected.
    - Pantry items get **size chips** above the button. Selected chip: almond 1.5px border with a 10% almond fill. Unselected: 1px 15% ink border. 100px radius.
- The 8th grid cell is a dashed "Build a plan instead" promo card.
- **Add-to-cart toast:** dark card in the bottom-right of the viewport. It shows a 44px thumbnail, "Added to cart", the item name and price, and a "View cart · N" button (`#A8B98C` background). Auto-dismiss after about 4 seconds.

**2a · Subscribe / plan builder** (interactive in the prototype)
- Hero: two columns. Left has the eyebrow, a 52px serif H1 ("Decide once. Then just *eat*."), body copy and three stats. Right is a 440px image.
- Builder: left column (1.4fr) holds the steps, right column (1fr) holds the **sticky** summary.
  1. **Choose a product:** three cards; the selected one has a 2px olive border.
  2. **How often?** Four options, each with a note: Daily (30/month), Alternate days (15/month), Twice a week (8/month), Weekly (4/month).
  3. **For how long?**
     - 1 month: 8% off deliveries
     - 2 months: 14% off deliveries
     - 3 months: 18% off deliveries
     - Helper text: the discount depends on the number of deliveries, not the calendar; pausing never loses deliveries.
  4. **First delivery:** Tomorrow / Fri / Sat / Mon, each with its date.
  5. **Time slot & address:** 7–9 am Breakfast, 12–2 pm Lunch, 6–8 pm Evening, plus the saved address row.
  - **Option tiles:** 14px padding, 10px radius, 1.5px border.
    - Unselected: `#FFFFFF` background, `#1B2A18` text, `rgba(27,42,24,.14)` border.
    - Selected: `#1B2A18` fill, `#FCFBF7` text, note in `rgba(252,251,247,.7)`. On duration tiles the note is `#A8B98C`.
- **Summary panel:**
  - `#1B2A18` background, 12px radius, 26px padding
  - "YOUR PLAN" eyebrow, product name (26px serif), then "{freq} · {duration} · {N} deliveries · {slot}" and "First delivery {date}"
  - price lines: `₹base × N`, then "Plan discount {pct}" in `#A8B98C`, then "Plan price" in 30px
  - "₹X per delivery · against ₹base buying one-off"
  - optional savings callout
  - **CTA "Start plan · ₹{net}"** (olive), with helper text "Adds to your cart · paid into your plan wallet at checkout"
  - three ✓ reassurance lines: skip or pause free; paid deliveries never expire; change slot, address or start date from My plans
  - the no-withdrawal note in 10.5px at 55% opacity

**4a · Cart**
- Title "Your cart", with "4 items · arrives in 3 separate deliveries".
- Left column (1.65fr) has three **delivery groups**. Each is a white card with a 3px left border in its type colour and a mono header.
  - **Kitchen:** header has a segmented control, "Now · ~40 min" | "Schedule".
  - **Plan:** header has an "Edit plan" link. The row shows the plan details, the first delivery date, the per-delivery price, and the struck-through list price.
  - **Pantry:** header shows the free-shipping progress ("add ₹100 more").
  - Rows: 64px rounded thumbnail, name and meta, quantity stepper (− n +), line price.
- Right column is a sticky summary on `#F4F1E7`: Items, Plan discount, Delivery & packaging, **Estimated total**, and the note "Coupons and GST are applied at checkout". CTA "Continue to checkout", with the helper text "No account needed first — you'll verify your phone number at checkout."

**1c · Checkout**
- Minimal header: logo, a step indicator (Cart · **Checkout** · Done) and "Secure checkout".
- Left column (1.35fr) has numbered sections:
  1. **Your details:** inline phone + OTP sign-in. The verified state is shown: name and number, "✓ Verified with a one-time code", and a "Not you?" link.
  2. **Delivery address:** the main address, used for the kitchen order and the plan. Then "Where should the pantry shipment go?" with an explicit choice: Same address, or another saved address.
  3. **When should the kitchen order arrive?** ASAP (~40 min) | Schedule, plus slot chips (Today 7–8 / 8–9 / 9–10 pm, Tomorrow…).
  4. **Coupon:** applied state with a "Remove" button and "✓ ₹100 off applied".
  5. **Payment:** radio rows for UPI / Card / Netbanking. **No gateway names in the UI.** Below them, a toggle "Use SpoonUp credit · ₹X" with the explanation "From refunds and referrals. Works on the kitchen and pantry parts of this order."
- Right column on `#F4F1E7`: three part cards, each with a type-coloured left border and a mono header carrying the date/slot. Then totals (Items, Plan discount, Coupon, Delivery, GST, Total) and the CTA "Pay ₹X with UPI" (the label follows the chosen method), with legal consent text underneath.

**4b · Order confirmed**
- Centred success band: 56px olive check circle, 42px serif "Thank you, {name}. Your order is in.", and the order ID, amount, method and receipt email.
- Three cards, each with a 3px top border in its type colour:
  - Kitchen ETA and WhatsApp notice
  - Plan: first delivery, the next five dates as dark chips, "+N more", and the wallet note
  - Pantry: arrival date and the tracking-link notice
- CTAs: "Track this order" (primary), "Manage my plan" (outline), "Continue shopping" (text).
- Referral strip on `#1B2A18`: code chip and a "Share on WhatsApp" button.

**3b · My account (overview)**
- Header with an avatar pill (initials in an olive circle).
- Sidebar, 230px: Overview (active, dark fill), Orders, My plans, Wallet, Addresses, Refer & earn, Profile & settings, then Help & support and Sign out.
- Main area on `#F4F1E7`:
  - Greeting ("Good evening, {name}", 36px serif) with a status line.
  - Three summary cards:
    - **Wallet:** dark card showing the total, the plan balance vs spendable split, and Top up / Activity buttons.
    - **Active plans:** count, progress bar and paused plan.
    - **Refer & earn:** code and stats.
  - **Track your order:** one card per order part, each with a 4-step progress bar in its type colour.
    - Kitchen steps: Placed, Preparing, On the way, Delivered.
    - Plan steps: Paid, Started, Midway, Complete.
    - Pantry steps: Ordered, Sourcing, Shipped, Delivered.
    - Each card has a meta line and an action (Track live / Manage plan / Details).
  - **Previous orders** table. Columns `78px | 1fr | 64px | 132px`:
    - order ID with the date underneath
    - items, with type and status underneath
    - total
    - Reorder (primary) and Invoice
    - filter chips: All / Eat now / Pantry
  - **Wallet activity** list with the no-withdrawal note.
  - Saved addresses and Profile cards.

**3a · Sign in / sign up** (standalone; opened from the header's Sign in)
- Split layout: an image with a quote overlay on the left; on the right, Continue with Google (primary), "+91 | Mobile number" and Send OTP, Facebook and Apple shown as disabled "soon", a referral note and a consent line.

**4c · 404: "Someone ate this page"**
- Full header and footer.
- Hero on `#F4F1E7`: eyebrow "ERROR 404 · PAGE NOT FOUND", then "4 [half-eaten cookie] 4". The 4s are Instrument Serif 230px.
  - The cookie is **drawn in CSS** at 200px: a radial-gradient body, chocolate chips, and three overlapping "bite" circles filled with the background colour over a light dough ring. Crumbs sit to the right.
  - It can be rebuilt as an SVG or an illustrated asset.
- H2 "Someone *ate* this page.", body copy, a search field, and "Back to home" / "Track an order" buttons.
- "Still fresh, still here": the three category cards.
- WhatsApp / support email strip.

### Admin (in the website file, section C)
- **1d · Orders:**
  - Sidebar: Orders, Subscriptions, Pantry shipments, Products & menu, Customers, Payments & wallets, Coupons, Take an order, Pricing by channel, Referrals.
  - Four KPI cards, then part filters.
  - Table rows **expand into their order parts**. Each part row has its own status and actions: Mark delivered / Track, Calendar / Pause, Add AWB / Invoice.
  - Channel column: Web / iOS / Android / Admin.
- **1e · Take an order on behalf of a customer:**
  - Customer lookup by phone; if there's no match, a guest profile is created and merged on first login.
  - Items list and fulfilment choice.
  - **Settlement panel:** list total, then "Amount the customer agreed to pay". The difference is auto-recorded as a negotiated discount and attributed to the admin; item prices are not changed.
  - Collected via: Cash / UPI QR / Payment link.
- **1f · Coupons:**
  - Create form:
    - code
    - scope: One person / Cohort / Everyone
    - assignee
    - type (Flat ₹ or %) and value
    - applies to (Eat now / Pantry / Subscriptions)
    - channel (Web / Android / iOS)
  - **Every coupon is single-use per account.**
  - List table: Code, Scope, Value, Used, Status.

### Admin panel (`design/SpoonUp Admin.dc.html`), standalone, desktop
A clickable prototype of the internal ops tool. It is **newer than the admin screens in section C of the website file** (1d–1f) and replaces them as the base. Keep 1e (take an order) and 1f (coupons) from the website file; they aren't redrawn here.

**Tweaks (props):**
- `startScreen`: login | dashboard | orders | kitchen | dispatch | plans | menu | customers | zones
- `role`: Owner | Kitchen staff. Kitchen staff only see Kitchen board, Dispatch and Menu, and land on the Kitchen board after sign-in.

**Login** (split screen, 50/50)
- Left on `#FCFBF7`, 36/56px padding, form max-width 380px:
  - logo 46px, then an "ADMIN" chip (JetBrains Mono 10.5px, `.12em` tracking, `#8B6A46`, 1px border at 35% almond, 4px radius)
  - **Step 1:** eyebrow "STAFF SIGN-IN", H1 "Good morning. Kitchen's waiting." (Instrument Serif 44px/1.05), work email, password, "Trust this device for 30 days" checkbox, "Continue" (`#1B2A18`, 8px radius, 14px padding, hover `#4A5D2E`)
  - **Step 2:** "STEP 2 OF 2", "Check your phone.", masked phone, one OTP input (JetBrains Mono 30px, `.55em` tracking), "Verify & sign in", "← Use a different account", resend timer
  - inputs: 13/14px padding, 8px radius, 1px `rgba(27,42,24,.16)` border; focus `#4A5D2E` border plus a 3px `rgba(74,93,46,.12)` ring
  - footer "SpoonUp Foods · Internal tool · Sign-ins are logged"
- Right: a full-bleed `pudding-jar.png` (cover) under a gradient from transparent to `rgba(27,42,24,.92)`, with the eyebrow "SPOONUP KITCHEN · KORAMANGALA" in `#A8B98C` and a 40px serif line.
- Customer accounts can't sign in here. The password has no self-serve reset; an owner resets it.

**Shell**
- 232px sticky sidebar on `#FCFBF7`:
  - logo and ADMIN chip
  - nav items, 10/12px padding and 8px radius, each with a mono count. Active item: `#1B2A18` fill with `#FCFBF7` text.
  - **Kitchen open/paused toggle card:** pausing hides eat-now on the site; plans keep running.
  - user row with Sign out
- Sticky top bar: a mono date/time eyebrow, the page title (Instrument Serif 30px), a search pill (280px; Enter jumps to Orders) and a kitchen switcher pill.
- The content area has a 1120px minimum width and scrolls horizontally below that.

**Screens**
- **Dashboard:**
  - 4 KPI cards (serif 38px values): orders, revenue, on-time %, active plans
  - "Today by order part": one stacked bar per part (solid is done, 45% opacity is in progress) with three stats each
  - orders-per-hour bar chart; the current hour is olive, past hours 35% ink, future hours 12% ink
  - "Needs attention" list: a coloured dot (`#A34A2A` urgent, `#8B6A46` warning, `#4A5D2E` info) and a pill action that deep-links to the right screen
- **Orders:**
  - part tabs (All / Now / Plan / Ships) with counts, plus filter pills
  - table `110px | 1.3fr | 1fr | 1.1fr | 130px | 90px`: Order, Customer, Parts (type chips), Next up, Status pill, Total
  - clicking a row opens a **460px right drawer**: part cards with a type-tinted header, payment, coupon, total, the customer note, and Call customer / Refund to credit / Cancel part
- **Kitchen board:**
  - 3 columns: New → Preparing → Packed
  - ticket card: type chip, order ID, age, items (14px/500), meta, and a one-tap advance button (Start prep / Mark packed / Hand to rider)
  - **tickets 12 min or older** get a red age and a red 1.5px border
  - side panel: the next plan batch with quantities, "Print batch labels", and a handed-to-riders count
- **Dispatch:** "Packed, waiting for a rider" queue with **Assign {suggested rider}**, which moves the rider to On route. Rider table: status pill, route, bag load out of 4, back-in time.
- **Subscriptions:**
  - 4 KPIs
  - table with a progress bar (delivered / total) and the statuses Active / Paused / Ends in 3 days / Renewal failed
  - a failed renewal holds the plan; it isn't cancelled
- **Menu & products:**
  - card grid `auto-fill minmax(240px,1fr)` with an image, type chip, price, stock/plan meta (red when low or out of stock) and an Available toggle
  - an item switched off is hidden from the store within a minute, and its active plan deliveries are skipped, not charged
- **Customers:** table with orders, active plans, credit and last order.
- **Delivery zones:**
  - pincode table: area, Now ETA, fee, orders per week, and a **Now** toggle
  - turning Now off leaves Plan and Ships available
  - this table feeds the website's location pill

**Admin status colours:** New `rgba(168,185,140,.3)`/ink · Preparing olive tint/olive · Out for delivery olive/paper · Delivered 7% ink/60% ink · Late or Payment failed `rgba(163,74,42,.12)`/`#A34A2A`. Error red `#A34A2A` is used only in admin and for error states.

### Mobile app (`design/SpoonUp Mobile App.dc.html`), section D, in flow order
The frame is 390×812 inside a 9px `#1B2A18` bezel with 42px corner radius. It is one live prototype: tabs, back arrows and "→" CTAs jump between screens, and Home, Shop and Cart share one cart.

**Bottom tab bar (every screen): icon-only, no labels.**
- Home, Shop, Orders, Plans, Wallet. 23px line icons in 48×44px hit areas, padding 8px 0 18px, 1px top border `rgba(27,42,24,.08)`.
- Active: `#1B2A18` icon, 2px stroke, a 4px `#4A5D2E` dot below.
- Inactive: `rgba(27,42,24,.4)`, 1.7px stroke.
- There is no Account tab. Account opens from the avatar on Home.

**6a · Login** (welcome → phone → code → pincode → done)
- **Welcome:**
  - 360px rounded (22px) carousel that auto-advances every 4 seconds with a 0.6s crossfade. Tapping it goes to the next slide; tapping a dot jumps to that slide. The active dot stretches from 7px to 22px.
  - slides: EAT NOW / SUBSCRIBE / PANTRY, each with a one-line promise
  - the logo, centred, then "Eat healthy. Eat longer."
  - buttons: **Continue with phone** (primary), Continue with Google (outline), "Just browsing? Skip for now" (text)
- **Flow header:** back button (40px circle), 3-segment progress bar, "n/3".
- **Phone:**
  - +91 prefix, and the number is formatted `98450 12345` as you type
  - the border turns olive and a ✓ appears at 10 digits
  - helper text above the button counts down ("3 more digits to go")
  - "Send code" stays greyed out until the number is valid
  - on the Google path the copy changes to "Now, your number", with a note that riders use it. **Google sign-in still collects and verifies a phone number.**
- **Code:**
  - 6 boxes over one hidden input with `autocomplete="one-time-code"`
  - it **verifies itself** on the 6th digit (0.9s "Verifying…", then moves on)
  - resend timer of 30 seconds
  - wrong code: every box and the message turn `#A34A2A` ("That code didn't match…"); the demo trigger is `000000`
- **Pincode:**
  - name and 6-digit pincode, with the note "Just your pincode for now. We'll ask for flat and street at checkout."
  - **live serviceability check:** in zone, an olive note with the area and ETA; out of zone, an almond note saying pantry still ships
  - optional referral code behind "+ I have a referral code"
  - helper text says what's missing, and "Start eating" stays disabled until both fields are valid
- **Done:** ✓, "Welcome, {first name}", ETA copy, a ₹150 wallet chip if a referral was applied, then the primary **"Order your first breakfast →"**, which goes to Home. On the guest path it reads "Start browsing →" and goes to Shop.

**6b · Home.** Two states (the switch in the mock is presentation-only).
- **Header:** location pill ("{area} {pin} · {eta} ▾"). The avatar (40px, olive) has a 2px paper + 1.5px olive ring and a 17px "›" badge, so it reads as tappable; it opens Account.
- **First visit:**
  - "Hi {name}, welcome in" with the ETA line
  - **₹150 welcome credit card** (dark) with "Use it →", which opens Shop
  - **"Start a breakfast plan" card:** week-jars image, "PLAN · FROM ₹286 A JAR", and "Build my plan", which opens Shop on the Subscribe filter with the plan sheet already open for the chia pudding
  - **one-time tab tour:** a dark card above the tab bar with the 5 tab names lined up in a grid and "Your account is behind your photo, top right", plus a "Got it" button. Show it once per install.
- **Returning:** tomorrow's plan card with **Skip ⇄ Undo** ("Moved to the end of your plan · nothing charged").
- **Both states:**
  - 3 category tiles (Eat now / Subscribe / Pantry); **each opens Shop with that filter on**
  - a horizontal product row: "Popular in {area}" for a first visit, "Order again" for a returning user. The + quick-add turns into "✓ n".

**6c · Shop**
- Title, cart icon with a count badge (opens Cart), search, filter chips (All / Eat now / Subscribe / Pantry) and a context note that changes per filter.
- 2-column cards: image, type tag, name, meta, price, and "Add", which becomes a − n + stepper.
  - Under Subscribe the tag reads PLAN, so the tag always matches the filter.
- **Plan-eligible cards have a "Plan it · from ₹X each" button.** It reads "✓ On a plan · edit" once the item is on a plan.
- **Plan sheet** (bottom sheet, 22px top radius, 42% ink scrim):
  - four 3-up option groups: **How often** (Daily / Alt days / Weekdays), **Time slot** (7–9 am, 12–2 pm, 6–8 pm), **For how long** (1 week 5% off / 2 weeks 10% off / 1 month 18% off), **First delivery** (Tomorrow / Saturday / Monday)
  - live summary: "₹X per delivery · N deliveries · ₹total · you save ₹Y" and the skip reassurance
  - CTA "Add plan to cart · ₹total", or "Update plan" when editing
- **Floating cart bar:** "{n} in cart · ₹total", then the parts line ("Arrives in 3 parts · Now + Plan + Ships"), then "View cart →".

**6d · Cart** (new)
- Part cards with tinted mono headers:
  - **NOW** (arrives in {eta})
  - **PLAN** (paid upfront into the plan balance): each plan shows its summary, "₹X each · ₹total", and Edit plan (reopens the sheet) / Remove
  - **SHIPS** (courier, 3–5 days)
  - Now and Ships items have − n + steppers
- **Deliver to:** a flat/street input (the address step promised at sign-up).
- **"Use ₹150 welcome credit"** toggle, which applies to eat-now and pantry items only.
- Bill lines, then "To pay".
- **The Pay button stays disabled until an address is entered**; the almond helper text says why.
- **Placed state:** ✓, "Order placed", one line per part (what happens next), "Track in Orders →", and a demo reset.
- Empty state: "Nothing here yet" and "Browse the shop".

**6e · Orders, 6f · Plans, 6g · Wallet:** carried over from the earlier app screens (static). Content is described in the web equivalents above: one order in three parts with progress bars; a plan calendar where dashed means skipped, with Skip / Pause / Change slot / Resume / Extend / Renew; and the plan balance vs spendable split with activity.

**6h · Account:**
- profile, a 3-up stat strip (Wallet / Active plans / Orders)
- referral card with a **Copy** button (shows "Copied ✓" for 1.6s)
- rows: My orders, My plans, Wallet, Saved addresses, Payment methods
- **Delivery alerts** toggle (the off state still texts if a delivery is late), Help & support, Terms, Sign out (goes back to Login)

**⚠ Pricing mismatch to resolve:** the app's plan sheet uses **weeks** (1 wk 5% / 2 wk 10% / 1 mo 18%) with Daily / Alt days / Weekdays. The website builder uses **months** (1 mo 8% / 2 mo 14% / 3 mo 18%) with Daily / Alt / 2×wk / Weekly. Pick one model with the product owner before building. The app's delivery count: Daily = days, Alt = ceil(days/2), Weekdays = round(days×5/7); `per = round(base × (1 − pct))`.

## Interactions & behaviour
- **Plan pricing:**
  - `deliveries = perMonth[freq] × months`
  - `perMonth = {Daily:30, Alternate days:15, Twice a week:8, Weekly:4}`
  - `pct = {1:8, 2:14, 3:18}[months]`
  - `gross = base × deliveries`, `discount = round(gross × pct/100)`, `net = gross − discount`
  - `perDelivery = round(net / deliveries)`
  - Worked example: ₹349 × 30 = ₹10,470; −14% = ₹9,004; ₹300 per delivery.
- **Skip/pause:** skipped deliveries move to the end of the plan and paid deliveries never expire. Pausing is free.
- **Wallet:**
  - The plan balance is ring-fenced to its plan. Refunds on cancelled deliveries go to **spendable credit**.
  - Withdrawals are not a self-serve feature; they are handled by support.
- **Order splitting:** one payment creates one order with up to three parts (kitchen / plan / pantry). Each part has its own status, address and ETA.
- **Serviceability:** the header location pill sets the pincode. When outside the kitchen zone, eat-now items should be disabled with an explanation. This is not drawn yet.
- **Auth:**
  - Google OAuth and phone OTP. Facebook and Apple come later.
  - Checkout does not require signing in first; OTP verification happens inline.
  - Referral code: both sides get ₹150 of spendable credit after the friend's first order.
- **Payments:** UPI, card and netbanking. Gateways may be Razorpay, CCAvenue or Cashfree, but **never show gateway names to users**.
- **Hover states:** not specified in the mocks. Suggestions:
  - dark buttons lighten about 8%
  - outline buttons get a 4% ink fill
  - text links underline
  - cards lift with `0 4px 16px rgba(27,42,24,.08)`
- **Motion:** keep it minimal and calm.
  - toast: slide in from the right over 200ms, ease-out
  - progress bars: animate width over 400ms

## State (suggested)
- **Cart:** `{ kitchen: {items[], mode: 'asap'|'scheduled', slot}, plans: [{productId, freq, months, startDate, slot, addressId, price}], pantry: {items[{id, size, qty}], addressId} }`
- **Checkout:** `phone, otpVerified, addressIds, coupon, paymentMethod, useCredit`
- **Wallet:** `planBalances[{planId, amount, deliveriesLeft}], spendableCredit, ledger[]`
- **Orders:** `order{id, total, parts[{type, status, steps, eta, addressId, items}]}`

## Design tokens
**Colours**
- Error / late `#A34A2A`: errors, wrong OTP, late orders, admin alerts
- Ink / forest `#1B2A18`: primary text, dark surfaces, plan type
- Olive `#4A5D2E`: primary CTA, kitchen/now type, success
- Almond `#8B6A46`: pantry type, eyebrows
- Sage `#A8B98C`: accents on dark surfaces, secondary CTA on dark
- Sage light `#D8E2C4`: savings text on dark
- Cream `#F4F1E7`: section backgrounds, summaries
- Paper `#FCFBF7`: page and card background
- White `#FFFFFF`: cards on cream
- Page canvas `#EDEAE1`: presentation only
- Ink alphas for text: .72 / .65 / .6 / .55 / .5 / .45. Borders: .07 / .08 / .1 / .12 / .14 / .16 / .2
- Type tints: olive `rgba(74,93,46,.1)`, ink `rgba(27,42,24,.09)`, almond `rgba(139,106,70,.12)`

**Typography** (Google Fonts)
- **Instrument Serif** 400 (and italic for emphasis words): display and headings.
  - Sizes: 230 (404) · 62 (hero) · 56 · 52 · 44 · 42 · 36 · 34 · 32 · 30 · 28 · 26 · 23 · 22 · 20
  - Line-height about 1.02–1.2
- **DM Sans** 300–700: all UI.
  - Body: 16 / 15.5 / 14.5 / 13.5
  - UI: 13 / 12.5 / 12
  - Meta: 11.5 / 11 / 10.5
  - Weights: 400 body, 500 labels/buttons/prices
  - Line-height 1.5–1.75 for paragraphs
- **JetBrains Mono** 400/500: eyebrows, type tags, order IDs, coupon codes. 9.5–11px, uppercase, letter-spacing .06–.16em.

**Radius:** 4 (tags) · 5–7 (small buttons, admin) · 8–10 (inputs, tiles, buttons) · 11–13 (mobile cards) · 12 (panels) · 100px (pills)

**Spacing:** content gutter 40px on web (36 in checkout). Section padding 44–64px vertical. Grid gaps 14/16/20/24/28. Card padding 13–26px.

**Shadows:** cards mostly flat (borders instead). Toast `0 10px 30px rgba(27,42,24,.25)`.

**Order-part pattern:** 1px tinted border plus a 3px left (or top) border in the type colour, with a mono uppercase header in the type colour.

## Assets
- `design/assets/spoonup-logo.png`: official logo, transparent background.
- `design/assets/products/*.png`: product cut-outs.
  - chia, smoothie, tikki, fries, dryfruit, muesli and modak were cropped from the printed menu.
  - pudding-jar and dragonfruit-bottle were cropped from a user-supplied product photo.
  - All are low-resolution; **replace them with real product photography.**
- `design/assets/generated/*.jpg`: AI-generated (Nano Banana) lifestyle images: kitchen (home hero), founders, week-jars, eat-now, pantry. They are placeholders for a real shoot, and the founders image is **not the real founders**.
- Placeholders still to be supplied: testimonial photos (none used) and the real nutrition data.

## Files
- `preview/SpoonUp-Website.html`, `preview/SpoonUp-Mobile-App.html`, `preview/SpoonUp-Admin.html`: self-contained, offline previews. **Start here.**
- `design/SpoonUp Website.dc.html`: website + early admin source (screens 1a, 1b, 2a, 4a, 1c, 4b, 3b, 3a, 4c; admin 1d, 1e, 1f). Plan-builder logic is in the `class Component` script at the bottom.
- `design/SpoonUp Mobile App.dc.html`: app section D, screens 6a–6h. All the flow logic (cart, plan pricing, OTP, serviceability) is in `class Component`.
- `design/SpoonUp Admin.dc.html`: admin panel (login plus 8 screens); sample data and role gating are in `class Component`.
- `design/support.js`, `design/image-slot.js`: runtime used only to render the mocks. **Do not port.**

## Suggested build order
1. Tokens and base components: Button, Pill, TypeTag, OptionTile, PartCard, QtyStepper.
2. Catalogue, product types and serviceability.
3. Cart with three groups, then the plan builder and pricing.
4. Checkout (OTP, addresses, schedule, payment), then confirmation.
5. Orders and parts tracking, wallet ledger and plans management.
6. Mobile app, 6a–6h in flow order (resolve the pricing mismatch first).
7. Admin: login + 2FA, shell and roles, orders + drawer, kitchen board, dispatch, then subscriptions, menu, customers and zones. Take order and coupons come from website 1e/1f.
