# SpoonUp Mobile — Design Spec (from live site)

Source: https://spoonupfoods.com, browsed read-only as a guest, 390x844 @2x (plus 1440x900 desktop). Tokens were read from computed styles. Screenshots are in `design/website-ref/` (21 PNGs, about 5 MB).

Key finding: the website and the app already share the same palette and font families, because the app tokens came from the design handoff. The redesign is mostly layout, shape and copy, not new colors. Main shape changes: button/input radius, the Instrument Serif type scale, the mono kicker, and the olive primary CTA.

Not visible as guest: account, orders, support/tickets (redirect to `/signin?next=/account`) and any logged-in state. Specs for those screens reuse the site's tokens, not observed layouts.

There is no product detail page on the website. Cards are not links and there is no `/product/...` route. See the Product Details section.

## 1. Tokens (website value -> existing `src/theme` name)

### Color (all already in `colors.ts`)

| Website use | Hex | App token | Status |
|---|---|---|---|
| Page bg / header (header is 95% opaque) | `#FCFBF7` | `surface` | same; the site uses `surface` as the screen bg, so keep that |
| Section/footer/summary bg | `#F4F1E7` | `surfaceMuted` | same |
| Card bg (cards, inputs) | `#FFFFFF` | `white` | same |
| Text / dark button / cart pill / cookie bar | `#1B2A18` | `ink` | same |
| Primary CTA (Order now, Pay, Sign in submit) | `#4A5D2E` | `olive` | CHANGE: app uses ink for the primary Button |
| Cart badge, plan-banner button, Accept | `#A8B98C` | `sage` | same |
| Kicker text, pantry accents, size chip on | `#8B6A46` | `tan` | same |
| Kicker on content pages (WELCOME BACK) | about `#6B4F33` (darker tan) | none | ADD `tanDark` (optional). Computed `rgb(107,79,51)` on `p` kickers. |
| Muted text | `rgba(27,42,24,.65)` | `textSecondary` is .60 | CHANGE to .65 (`textMuted` is .55) |
| Border default (cards) | `rgba(27,42,24,.10)` | `border` | same |
| Input border | `rgba(27,42,24,.14)` | none (`borderStrong` is .16) | use .14 for inputs, or accept `borderStrong` |
| Outline button / pill border | `rgba(27,42,24,.20)` | none | ADD `borderButton` |
| Inactive size-chip border | `rgba(27,42,24,.15)` | none | use `borderStrong` |
| Tag NOW | bg `#4A5D2E` solid on card image, text `#FCFBF7`. Tile variant: bg `rgba(74,93,46,.10)` and text olive | `tagNow`, `tagNowBg` | CHANGE card tag to solid olive |
| Tag SHIPS | text `#8B6A46`, bg `rgba(139,106,70,.12)` | `tagShips`, `tagShipsBg` | same |
| Selected delivery option | bg about `rgba(168,185,140,.4)`, 2px olive border | none | ADD `selectedBg` |
| Error / helper warning | tan `#8B6A46` text ("Add your email.") | `danger` is terracotta | Website uses tan for inline validation hints; terracotta not seen in guest views. Keep `danger` for real errors. |

The site has no drop shadows anywhere (all `box-shadow: none`). Depth comes from 1px borders and the `surfaceMuted` panels. The app has none either, so no change.

### Fonts (same families as the app)

- **Instrument Serif 400** for display and all headings (h1/h2/h3, prices in totals, stats). Letter-spacing is -0.01em. Italic is used for one emphasised word: "like a *craving*", "Then just *eat*".
- **DM Sans** (variable, weights 400/500) for body, buttons, labels, inputs. The site never uses 600 or 700. The app's `sansSemiBold` and `sansBold` are not used on the website.
- **JetBrains Mono** for kickers and tags: uppercase, letter-spacing 0.1em on tags (0.95px at 9.5px) and about 0.18em on kickers (2.25px at 12.5px).

### Type scale (mobile 390px)

| Role | Website | App token now | Change |
|---|---|---|---|
| Hero h1 | Serif 36 / lh 36.7 | `display` 34/37 | bump to 36/37 |
| Section h2 | Serif 30 / lh 33 | `headline` 29/32 | bump to 30/33 |
| Card/tile h3 | Serif 23 / lh 27.6 (banner h3 24) | none | ADD `titleCard` 23/28 |
| Page title ("Your cart") | Serif about 34-36 | `title` 28/30 | bump to 34/36 |
| Total amount | Serif 28, ls -0.28 | none | ADD `amount` 28 serif |
| Body lead | DM Sans 16-17 / lh 24 | `body` 13.5/19 | ADD `bodyLarge` 16/24 for hero and plan lead copy |
| Body | DM Sans 13.5-14 / lh 21 | `body` | same |
| Product name | DM Sans 15, wt 500 | `label` 12.5 | CHANGE to 15 |
| Price on card | DM Sans 17, wt 500 | `heading` 14 | CHANGE to 17 |
| Note/hint | DM Sans 11.5, ink .65 | `labelSmall` 11 | 11.5 |
| Button (card) | DM Sans 12.5, wt 500 | `label` | same |
| Button (primary/pill) | 14-16, wt 500 | `button` 14.5 | 14 (regular) and 16 (hero) |
| Kicker | Mono 12.5 uppercase, ls 0.18em, tan | `kicker` 10.5, ls 1.2 | bump to 12 |
| Tag | Mono 9.5, wt 500, ls 0.1em | `tag` | same |

### Radius

| Website | Value | App |
|---|---|---|
| Buttons, pills, chips, search, cart pill, inputs (search) | 100 (pill) | `pill` |
| Form inputs (checkout) | 8 | `sm` |
| Card add-to-cart button, "Plan" button | 7 | none; ADD `xs: 7` |
| Cards, tiles, delivery option, cart item | 12 | `lg` is 14; CHANGE to 12 or add `card: 12` |
| Summary panels | about 14-16 | `lg` or `xl` |
| Tag | 4 | literal 4 (ok) |

The app's primary Button uses `radius.lg` (14). The site uses pill (100). This is the most visible change.

### Spacing

- Screen gutter is 20 (same as `screenPadding`).
- Header is 85px tall on mobile, with a 1px hairline under it.
- Section vertical padding is 52. Footer padding is 48 top and 32 bottom.
- Card inner padding is about 16-20. Buttons: 10x18 (small), 14x26 (large), hero CTA 56px tall.
- Page text blocks are separated by 16-24, sections by 52.

### Icons and imagery

- Icons are thin 1.5px line icons with round caps (cart, search, X). There is no icon pack and no emoji except the 🔒 in "Secure checkout".
- Imagery is warm, natural-light food photography on cream and linen. Product images are 3:2 (381x180 on the shop card, about 1.5:1), `cover`. The hero is a full-bleed blurred photo behind a cream gradient overlay, so text stays legible.
- Logo is the green wordmark "SpoonUp / GOOD FOOD HIGHER DAYS". The mobile header shows it at left.

## 2. Screen-by-screen (mobile)

### Home
Website section order, top to bottom:
1. Header (logo, Cart pill, menu).
2. Hero: kicker "GOOD FOOD, HIGHER DAYS", serif H1 with one italic word, lead copy, then three CTAs (primary olive pill "Order in 30 min", then two outline pills "Build your plan" and "Shop dry fruits" side by side).
3. Two mono stat blocks ("0G REFINED SUGAR", "UP TO 21G PROTEIN") with a one-line description each.
4. "Three ways to eat with us" plus a "See everything" outline pill. Three stacked tiles (white, 12 radius, 1px border): image, mono tag ("NOW · 30–45 MIN", "PLAN · PAY ONCE", "SHIPS · 3–5 DAYS"), serif title, one-line description.
5. "Bestsellers from the kitchen" with a "See all kitchen items" link and 3 product cards.
6. Dark plan banner (ink bg, sage pill "Build your plan"): "SCHEDULE PLAN · PAY ONCE", "30 days of deliveries, paid once", "One prepaid payment. No auto-renewal."
7. "Bestsellers from the pantry" with 3 cards (size chips 100g, 250g, 500g, 1kg).
8. "WHY WE STARTED" story block.
9. Testimonials: serif quote text, then name and city.
10. Footer (Instagram, Shop, Company, Help, Legal).

Change vs app (the app has a location chip, a greeting, a PlanCard, three CategoryTiles and an Order-again row):
- Replace the greeting with the site's mono kicker plus a serif headline. Keep the greeting for signed-in users, set in serif.
- Make "Order in 30 min" the single full-width olive primary pill at the top. Keep the app's location/ETA chip because it is app-specific.
- CategoryTiles: change tags to "NOW · 30–45 MIN", "PLAN · PAY ONCE", "SHIPS · 3–5 DAYS". The app currently says "30 DAYS" and "SHIPS". Change the subtitle to the site's one-line description.
- Add the two stat blocks (0G REFINED SUGAR, UP TO 21G PROTEIN). Static copy.
- Move the plan promo below the product rows as a dark ink banner, as on the site. The app's PlanCard is higher up.
- Add Bestsellers rows ("kitchen" and "pantry"). Data comes from the API, not hardcoded.
- Optional: story and testimonials blocks. Keep them below the fold and low priority. Testimonials are marketing copy on the site, so only show them if the backend provides them.

### Shop / Listing
Website: serif title "Shop all", pill filters (**All · 39**, **Eat now**, **Subscribable**, **Pantry · ships**; selected = ink fill with cream text, 38px tall, pantry chip has a tan border), pill search field (44px, magnifier at left, placeholder "Search beverages, healthy breakfast…"), a "Sort:" dropdown (Popular, Price low to high, Price high to low), then a single-column list of large cards.
- Cards are full width: 3:2 image, mono tag overlay at the top left (solid olive "NOW · 40 MIN" for kitchen, tan for pantry), name (15/500), description (13, muted), price (17/500), availability note ("Eat-now only", "Plan available", "Free shipping over ₹999"), and a full-width ink "Add to cart" button (7 radius, 12.5 text). A "Plan" button appears next to Add for plan-eligible products. Pantry cards have size chips (100g, 250g, 500g, 1kg).
- Change vs app: the app uses 2-column cards (118px image) with a pill "Add" button. Move to a one-column list on phones under about 400px, or keep two columns but adopt the site tag, note line and button shape. A single column matches the site best and has room for the description and note.
- Rename filter chips to the site's labels. The app's Chip is ink fill when selected, which matches. Make Chip height about 38-40 and text 12.5/500.
- Search should be a pill input with an icon, shown above the list (not in a separate screen). Sort control: simple select or bottom sheet.
- Backend still owns prices and availability. The note line ("Eat-now only" and so on) must come from the API fields, not be inferred.

### Product Details
The website has none. The app's ProductDetailsScreen is app-only. Keep it, styled from the card: full-bleed 3:2 hero image, solid mono tag, serif name (30/33), description, price in serif, size chips for pantry (selected = tan border 1.5px with `tagShipsBg` fill), availability note, and a sticky bottom bar with an olive pill "Add to cart". Do not invent nutrition or ingredient content the backend does not provide. The website's contact FAQ says "Every product page lists what's in it", so render ingredients and allergens if the API supplies them.

### Cart
Website: serif title "Your cart", subtitle "1 item · arrives in 1 delivery", one card per delivery group (a 3-4px olive left border, mono header "EAT NOW · FROM OUR KITCHEN" and "Timing is set at checkout"), item row with 56px thumbnail, name, "₹275 each", a − / qty / + stepper (square 40px, 8 radius, outline), and line total. Then a `surfaceMuted` Summary panel (Items, "Delivery & packaging: Free", "Estimated total" in serif 28, hint "Coupons and GST are applied at checkout.") and the olive pill "Continue to checkout" with "No account needed first — you'll enter your mobile number at checkout."
- Empty state: serif "Your cart is empty", "Nothing here yet. The kitchen is warm and the pantry is stocked.", then "Browse the shop" (primary) and "Build a plan" (outline).
- Change vs app: the app's group header uses a tinted band and a "Remove" text link. Adopt the left accent bar, mono header text and the surfaceMuted summary panel. Use serif for the estimated total. CTA becomes the olive pill. Keep the app's "Log in to checkout" CTA for guests (CLAUDE.md requires auth to check out).
- Cart groups, delivery counts and totals come from the backend response.

### Checkout
Website is one scrolling form with numbered sections (number in tan, title in dark): 1 Your details (name, email, mobile +91), 2 Delivery address (flat/street, city, pincode, landmark optional), 3 "When should the kitchen order arrive?" (two selectable cards: "Deliver now · Arrives by 2:30 pm · about 40 min" and "Schedule for later"), 4 Coupon (input plus Apply), 5 Store credit ("Sign in to use any store credit"), 6 Payment (single card "Pay online — UPI, card or netbanking via Razorpay"). A `surfaceMuted` "Your order · 1 delivery" panel follows, with the group card, Items, Delivery, GST, Total (serif 28), and an olive pill "Pay ₹288.75 with Razorpay". The button is disabled (sage) until valid, with a tan inline hint under it ("Add your email."). Below: terms line.
- Change vs app: use the same numbered-section pattern (the app already has Address, Delivery, Coupon, Summary, Payment steps; make them sections in the site style). Selectable option cards: 12 radius, 2px olive border and `selectedBg` when selected. Pay button: olive pill, label includes backend-returned total. Disabled state is sage, not grey.
- The app does not collect name/email/mobile (it has the account). Skip section 1 when signed in.
- Everything shown (GST, totals, coupon result, store credit) must come from the backend.

### Orders
Not visible as guest. The site's "Track an order" page (`/status`) says "Orders you've placed on this device — no sign-in needed", and shows an empty state: serif title, "No orders remembered on this device", "Browse the shop". Orders history for signed-in users is under Account → Orders (per the FAQ). For the app, apply the card pattern (12 radius, 1px border, mono status tag, serif order number or total). Status chip uses `tagNow`/`tagShips`/`ink` tints. Keep parent/sub-order hidden.

### Plan (30-day)
Website `/subscribe` ("Schedule Plan"): mono kicker, serif H1 "Decide once. Then just *eat*.", lead, three serif stat blocks ("30 days per pass", "4 rhythms daily to weekly", "0 fees to pause or skip by email"), a lifestyle photo (jars labelled MON-SAT), then a builder: 1 Choose a product (cards with ₹ one-off and ₹ per-delivery when subscribed), 2 How often (Every day 30 deliveries, Alternate days 15, Twice a week 8, Weekly 4), 3 First delivery (date chips), 4 Time slot (7–9 am Breakfast, 12–2 pm Lunch, 6–8 pm Evening). A "YOUR PLAN" summary shows ₹180 × 15 = ₹2,700, GST ₹135, Plan price ₹2,835, "₹189 per delivery", and a CTA "Start plan · ₹2,835" that adds to cart and is paid at checkout. Bullets: skip or pause any day, free (by email); runs 30 days from activation; "Plans are available in Bangalore city only."
- Change vs app: the app's Plans screen is a fixed-price 30-day pass with kicker "30-DAY PLAN · PAID ONCE", price and benefits. Keep the app's fixed-price model (CLAUDE.md); see section 5 for the conflict. Adopt the visuals: mono kicker, serif H1 with italic word, serif stat trio, photo hero, `surfaceMuted` summary panel with serif total, olive pill CTA. Copy "No auto-renewal" and "Runs for 30 days from activation" can be reused. Active and Expired screens: serif "N days left", rows for Started/Expires/Payment reference.

### Account
Website account pages are not visible without login. Use the tokens: serif name heading, `surfaceMuted` list groups with 1px dividers, row height at least 48, olive for primary actions. Website mentions an account referral code and store credit (see section 5).

### Login / Signup
Website `/signin` (single page, mobile):
- Mono kicker "WELCOME BACK", serif H1 "Sign in to your SpoonUp account", muted lead "Track live orders, manage your plans, and reorder favourites. One account across web and app."
- Ink pill "Continue with Google" (white G badge, 48px).
- Divider "or use your account".
- Segmented toggle: ink pill **Sign in** / outline pill **Create account**.
- Fields: "Username or email" and "Password" (white input, 8 radius, 1px border `.14`, 42px tall, 13.5 text, label 12.5/500 above).
- Olive pill submit "Sign in".
- Two disabled outline buttons "Facebook · soon" and "Apple · soon".
- Referral note and terms line.

Change vs app: the app uses phone + OTP (see section 4). Do not change the app's auth method from the design pass; flag to the team. Visual changes: kicker, serif headline, olive submit pill, pill segmented toggle if both modes exist.

### Support
Website has no ticket UI. The Contact page lists support@spoonupfoods.com and an FAQ accordion (delivery, plan pause/cancel, payments, refunds, tracking, allergens), with serif title "Get in touch" and a mono kicker. For the app's ticket screens use: card style for ticket rows (12 radius, 1px border), mono status chip, serif subject, olive primary "New ticket" pill. Optionally add an FAQ list above "My tickets" using the site's FAQ copy.

## 3. Components

- **Button primary:** olive `#4A5D2E`, cream text, pill radius, DM Sans 500 14 (16 for hero), min height 48, padding 14x26. Currently ink with radius 14.
- **Button secondary/outline:** transparent or white 60%, 1px `rgba(27,42,24,.14-.20)`, pill, ink text.
- **Button dark:** ink bg, cream text. Use for the cart pill and the "Add to cart" button on cards (radius 7, 12.5 text, 40px tall at least 44 for touch on the app).
- **Button on dark surface:** sage `#A8B98C` bg, ink text, pill (plan banner, cookie "Accept").
- **Disabled:** sage fill with cream text (site's disabled pay button), not grey.
- **Inputs:** white, radius 8, 1px `rgba(27,42,24,.14)`, padding 10x14, 13.5 text; label 12.5/500 above; hint 11.5 muted below. Search input is a pill (100), 44px tall, icon at left, 1px `.20` border. Focus state not captured.
- **Chips/filters:** pill, 12.5/500, 38-40px tall, selected = ink fill and cream text; the Pantry chip has a tan border and tan text. Size chips: 11.5/500, 1px `.15` border, selected = tan 1.5px border with tan text and `rgba(139,106,70,.12)` fill.
- **Cards:** white, 12 radius, 1px `rgba(27,42,24,.10)` border, no shadow, 3:2 image on top, mono tag overlay at top-left (4 radius, 3-4x7-8 padding).
- **Panels (summary):** `#F4F1E7`, radius about 16, padding 20-24, hairline separators.
- **Stepper:** square outline buttons (40px, 8 radius, "−" and "+" glyphs) with the quantity between.
- **Header (mobile):** 85px tall, `surface` at 95% opacity, bottom hairline; logo at left, a dark pill "Cart" button with a count badge (sage circle, ink text, 11.5/500) and a circular 40px outline menu button. The app uses a location chip, bell and avatar. Keep the app's controls but add the logo and the dark Cart pill (cart entry is global per CLAUDE.md).
- **Tab bar:** the website has no tab bar (top menu drawer: Eat Now, Schedule Plan, Pantry & Dry Fruits, Our Story, Contact, Sign in). Keep the app's tabs. Match the site in color only: active icon ink with an olive dot (already so), inactive `textDisabled`. Note CLAUDE.md says 4 tabs (Home, Categories/Search, Orders, Account), while the app has 5 including Plans.
- **Cookie notice/banner:** ink bar with cream text, outline "Dismiss" and sage "Accept". Not needed in the app.
- **Toasts/modals:** none observed. Add-to-cart gives only a count change on the cart pill (0 -> 1). Mirror that with a haptic and a badge bump; a toast is optional.
- **404/empty states:** voice is playful: "Someone ate this page.", "Nothing here yet. The kitchen is warm and the pantry is stocked." Use serif headline plus muted sentence plus primary and outline pill pair. Mono kicker ("ERROR 404 · PAGE NOT FOUND").
- **Copy/tone:** warm and plain, short sentences, lowercase-ish, rupee prices with no decimals except totals (₹288.75). Positive claims in mono caps ("0G REFINED SUGAR").

## 4. Auth method on the website

- Email-or-username plus **password**, and **Continue with Google** (OAuth). Facebook and Apple are shown as disabled "soon".
- No OTP or phone login on the web sign-in page. A mobile number is collected at checkout for delivery updates only, as a plain field.
- Sign-in and Create account are tabs on one page; "Create account" has an optional referral code.
- Guest checkout is allowed on the web (name, email, mobile, address, then Razorpay).

The app currently uses phone + OTP (`features/auth`: PhoneStep, OtpStep, ProfileStep). This differs from the site: "One account across web and app" means the app would need to support email/username + password (and ideally Google) against the same backend. This is a backend/product decision, not a design one. Flag: do not change the app's auth without confirming the backend contract.

## 5. Conflicts with CLAUDE.md

1. **Guest checkout.** The website lets guests check out (cart says "No account needed first"). CLAUDE.md says checkout under an account requires auth. Follow CLAUDE.md unless the backend allows guest checkout; the cart CTA copy "No account needed" must not be copied.
2. **Plan model.** The website has four frequencies (daily, alternate, twice a week, weekly), a product picker, GST, a start date and time slot, and the plan is **added to the cart and paid at checkout** with products. CLAUDE.md describes a separate fixed-price 30-day prepaid plan with its own payment flow. The app's fixed plan is the stated model; the website's builder is richer. Do not implement the builder without a product decision.
3. **"Subscription" wording.** The website calls it "Subscription terms" and uses `/subscribe`, "Subscribable" and "subscribe" in prices ("₹200 per delivery when you subscribe"). CLAUDE.md says no recurring subscription. Terms copy says it is not recurring and does not auto-renew, but the app should say "30-day plan" or "prepaid plan", not "subscription".
4. **"Wallet" slug.** The Plan terms page URL is `/legal/wallet`. Its text states "No wallet, no cash-out", which agrees with CLAUDE.md. Do not link or show the slug in the app.
5. **Store credit + referral.** The website offers store credit at checkout and a referral code (₹100 store credit after the first delivered order of at least ₹350). CLAUDE.md allows non-withdrawable store credit from refunds only; referral credit is not in CLAUDE.md. Do not build the referral UI without approval.
6. **Support.** The website has only a support email and an FAQ, no ticket system. CLAUDE.md requires tickets with anti-spam rules. Keep tickets per CLAUDE.md.
7. **Pause/skip/cancel.** On the website these are done by emailing support. CLAUDE.md has no in-app pause. Keep email (or the ticket flow) for these.
8. **Guest order tracking.** The website's `/status` shows orders remembered on the same device (browser storage), and the FAQ mentions a link and order number from the confirmation. CLAUDE.md says to use the existing secure guest-order mechanism. The device-local list is not a reference-based lookup. Confirm with backend.
9. **Payment provider.** The website shows Razorpay only for checkout. CLAUDE.md lists Razorpay for the 30-day plan and Cashfree "as specified by the backend". Check which provider the backend wants for product orders.
10. **City limit.** Plans are Bangalore only per the site. Surface this in the app only if the backend returns serviceability.
11. **Prices:** Site shows GST as a separate line at checkout (5%). The app must display whatever the backend returns, not compute GST locally.
12. **Tabs.** CLAUDE.md: Home, Categories/Search, Orders, Account. The app has Home, Shop, Orders, Plans, Account. Not a website conflict, but note it.
