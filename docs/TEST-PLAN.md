# Sznyt Design — Manual Test Plan

Two parts, matching the two launch gates:

- **Part A — Portfolio surface** is the checklist for the portfolio-launch gate (#31). Run against the **staged Vercel + Railway environment** (DNS not yet flipped), with **all stock at 0**. Verifies everything the DNS flip exposes: public pages, stock-0 gating, forms, legal pages, `noindex`.
- **Part B — Commerce** is the checklist for the commerce-open gate (#85). Run against the **live domain** (`https://sznytdesign.pl`) after the DNS flip, with real stock seeded. Verifies the full purchase path: cart, checkout, Stripe payment, webhook, all six emails, my-orders, admin, fulfillment loop.

Both parts are HITL: Adrian (and/or wife) clicks through each step on real desktop and mobile devices. Any red is fixed before the gate closes.

> **Neither part runs today.** Both gates are blocked on real products (issues labelled `waiting-for-products`), and Part B needs live Stripe keys on the flipped domain. The environment that *is* live is the recruiter demo — its smoke checklist lives in `docs/DEPLOY-DEMO.md` § 7 "Smoke-test the demo", not here, because it verifies a deployment rather than a launch gate. Re-read this plan when the frames exist; assume individual steps drifted while it sat idle.

## Setup

### Local dev (for reproducing reds and pre-run smoke tests)

- Frontend: `npm run dev` (port 5173)
- Backend: `npx tsx index.js` from `backend/` — NOT plain `node` (port 3000)
- Seed: `npx tsx seed.js` from `backend/`
- Stripe CLI: `stripe listen --forward-to localhost:3000/webhook`
- Chrome SSL gotcha: after a dev checkout, navigate manually to `http://localhost:5173/sukces` (Stripe `success_url` uses http in dev)

### Stripe cards

- Test mode (local / demo): `4242 4242 4242 4242` success, `4000 0000 0000 9995` decline — any future date, any CVC
- **Live mode (Part B): a real card and a real charge.** Refund it from the Stripe dashboard afterwards (`docs/runbooks/refunds.md`). Test cards do not work live.

### Which environment runs what

| Part | Environment | Stripe | Webhook | Emails |
|---|---|---|---|---|
| A | Staged Vercel + Railway URL (pre-flip) | not exercised | not exercised | form emails only, via cyberfolks SMTP |
| B | `https://sznytdesign.pl` (live) | live mode, one real charge | production endpoint (no CLI) | all six, via cyberfolks SMTP |

Email checks: read `kontakt@sznytdesign.pl` (and the admin inboxes) in Thunderbird.

---

## Part A — Portfolio surface (gate: #31)

Preconditions: staged URL up, all products seeded with `stock = 0`, `VITE_DEMO_MODE` **not** set.

### A1. Navigation & layout

- [ ] All nav links work (Sklep, O nas, Kontakt)
- [ ] Active nav link highlighted in gold
- [ ] Logo links to `/`
- [ ] Cart icon shows badge with correct count
- [ ] Hamburger opens/closes on mobile; tapping a link closes the menu
- [ ] Footer links all work (incl. Regulamin, Polityka prywatności, Zwroty, FAQ)
- [ ] ScrollToTop button appears after 300px, scrolls smoothly
- [ ] Route change scrolls to top
- [ ] Demo banner is absent (it only renders with `VITE_DEMO_MODE=true`)

### A2. Home (`/`)

- [ ] Hero renders, scroll indicator visible
- [ ] Product section loads products from the backend
- [ ] BrandStatement renders
- [ ] "Why us" 3-column strip renders
- [ ] Footer links correct

### A3. Shop (`/sklep`)

- [ ] Products load in grid (name, tagline, price — cards intentionally have no stock info or add-to-cart button)
- [ ] Hover swaps to lifestyle image
- [ ] Click navigates to `/sklep/:id`
- [ ] Philosophy + materials strips render

### A4. Product detail (`/sklep/:id`)

- [ ] Name, description, price render
- [ ] Breadcrumb renders
- [ ] Image swap on hover
- [ ] "← Odkryj całą kolekcję" → `/sklep`

### A5. Stock-0 gating (the portfolio state)

- [ ] Product detail: availability line shows **"Brak w magazynie"** (instead of "X szt.")
- [ ] Product detail: add-to-cart button disabled
- [ ] Home product section: add-to-cart button disabled (note: label reads "Maksymalna ilość w koszyku" — the button caps at stock, there is no separate out-of-stock label on Home)
- [ ] No path adds a stock-0 product to the cart; cart badge stays at 0
- [ ] `/koszyk` shows the empty-cart state with a link to the shop

### A6. Contact form (`/kontakt`)

- [ ] All fields fillable; submit shows loading → success state
- [ ] Empty form → validation error
- [ ] Submission stores a ContactMessage in the DB
- [ ] Contact-notification email arrives at `kontakt@sznytdesign.pl` (Thunderbird)
- [ ] Honeypot: fill the hidden `_hp` field via devtools and submit → fake success, **no** email, **no** DB row
- [ ] A normal submission (honeypot empty) is not blocked

### A7. Returns & complaints (`/zwroty`)

- [ ] Tab switch between zwrot and reklamacja works
- [ ] Both forms: all fields required, submit → success state
- [ ] Info boxes render
- [ ] Return-request email arrives at `kontakt@sznytdesign.pl`
- [ ] Complaint-request email arrives at `kontakt@sznytdesign.pl`
- [ ] Honeypot on both forms: filled `_hp` → fake success, no email

### A8. FAQ (`/faq`)

- [ ] Accordion opens/closes
- [ ] "Formularz reklamacyjny" link → `/zwroty`
- [ ] CTA links → `/kontakt` and `/zwroty`

### A9. Legal pages

- [ ] `/regulamin` renders all sections (post-#90 rewrite: DN status, 14-day withdrawal incl. the art. 32 no-advance-commitment sentence, rachunek / faktura bez VAT on request)
- [ ] `/polityka-prywatnosci` renders all sections (post-#99: browser-storage description, Stripe/Clerk DPF transfers, Adrian as sole controller)
- [ ] Both reachable from the footer

### A10. Browser storage (no cookie banner)

The cookie banner was removed in #96 — cart and checkout draft are strictly-necessary storage, described in the privacy policy instead of gated by consent.

- [ ] **No cookie banner appears** on any page, desktop or mobile
- [ ] Cart contents survive a page reload (localStorage) with no consent prompt

### A11. `noindex`

- [ ] View-source on home, shop, product detail, cart, kontakt, FAQ, zwroty, regulamin, polityka prywatności, and `/admin`: `<meta name="robots" content="noindex, nofollow" />` present (single source: `index.html`)

### A12. Public mobile (375px, real phone)

- [ ] No horizontal scrolling on any public page
- [ ] Navbar collapses to hamburger; hero readable
- [ ] Shop grid: single column
- [ ] Product detail: stacked layout
- [ ] Forms (kontakt, zwroty) usable
- [ ] Footer: centered, columns side by side

---

## Part B — Commerce (gate: #85)

Preconditions: DNS flipped, real stock seeded (≥ 1), Stripe live keys + production webhook endpoint configured, Clerk production instance with `publicMetadata.role = "admin"` on both admin accounts. One step makes a **real charge** — refund it afterwards.

### B1. Stock seeded — the A5 gating is gone

- [ ] Product detail: availability line shows "X szt." (no "Brak w magazynie"), add-to-cart enabled
- [ ] Home product section: add-to-cart button enabled, adds to cart
- [ ] Stock quantities match what was actually seeded

### B2. Cart (`/koszyk`)

- [ ] Items show image, name, unit price, quantity, line total
- [ ] +/− buttons work; − disabled at quantity 1; + capped at stock
- [ ] "Usuń" removes the item
- [ ] Adding the same product twice increments quantity — no duplicate line
- [ ] Subtotal correct
- [ ] Below 350 PLN: progress bar + "Brakuje Ci jeszcze X PLN do darmowej dostawy."
- [ ] At ≥ 350 PLN: "Masz darmową dostawę!" and shipping shows Gratis
- [ ] Cart survives page reload (localStorage)

### B3. Shipping & address form

- [ ] Three methods selectable with correct cost: InPost Paczkomat 20 PLN, InPost Kurier 25 PLN, DPD Kurier 25 PLN (all Gratis at ≥ 350 PLN)
- [ ] Address form appears for **every** method — paczkomat included (widget point + full address)
- [ ] All 7 address fields required: imię, nazwisko, e-mail, ulica, kod pocztowy, miasto, telefon
- [ ] Format validation fires on submit attempt (e-mail shape, kod `XX-XXX`, telefon 9 cyfr / `+48`) — errors shown inline, button itself is not gated by format
- [ ] Order note: "Uwagi do zamówienia (opcjonalnie)" textarea appears once a method is selected; live counter; input capped at 300 characters
- [ ] Regulamin checkbox required; its Regulamin and Polityka prywatności links open in a new tab
- [ ] Checkout button disabled until: method selected + paczkomat point (if paczkomat) + all address fields filled + checkbox checked
- [ ] Button shows "Przekierowywanie..." while redirecting to Stripe

### B4. Checkout draft persistence

- [ ] Fill method + point + address + note → navigate to `/sklep` → back to `/koszyk`: everything restored (sessionStorage)
- [ ] Close the tab → reopen the site: form empty (draft dies with the tab)
- [ ] Restoring a draft with paczkomat selected does **not** auto-open the map
- [ ] After a completed checkout, returning to `/koszyk` shows an empty form (draft cleared on `/sukces`)

### B5. Paczkomat widget (easyPack)

- [ ] Clicking the Paczkomat method **auto-opens** the map widget — no second click needed
- [ ] Closing the widget without picking: "Wybierz paczkomat" button remains, checkout stays gated
- [ ] Picking a point shows "Wybrany: {code} — {street}, {city}" — full address including city
- [ ] "Zmień paczkomat" reopens the widget
- [ ] Widget works in production (live domain) and at 375px

### B6. Checkout errors

- [ ] Backend unreachable → Polish fallback "Nie udało się przejść do płatności. Spróbuj ponownie." — never a raw English "Failed to fetch"
- [ ] Server-side stock conflict (someone bought the last unit first) → Polish server message shown
- [ ] Hammering checkout (>10/min) → rate-limit message "Zbyt wiele prób. Spróbuj ponownie za chwilę."

### B7. Stripe payment & webhook

- [ ] Stripe page shows correct line items, shipping line, and pre-filled email
- [ ] Payment methods offered: card, Przelewy24, BLIK
- [ ] Cancel on Stripe → back to `/koszyk`, cart intact
- [ ] (Test mode only) decline card `4000...9995` → error stays on the Stripe page
- [ ] **Live order:** pay with a real card → lands on `/sukces?session_id=...`
- [ ] Webhook creates the order: status `paid`, correct items and quantities, prices snapshotted
- [ ] Stock decremented by exactly the ordered quantity (atomic, in the webhook — verify in admin)
- [ ] `paymentMethod`, `customerEmail`, and the order note saved on the order
- [ ] Duplicate webhook delivery (Stripe dashboard → resend event) → no duplicate order, no duplicate email (`stripeSessionId` idempotency)
- [ ] **Refund the live charge** from the Stripe dashboard afterwards (`docs/runbooks/refunds.md`)

### B8. Order success (`/sukces`)

- [ ] Order summary card with id + total; item breakdown correct
- [ ] "Moje zamówienia" link visible when signed in, hidden for guests
- [ ] Cart and checkout draft cleared
- [ ] No `session_id` in the URL → redirect to `/sklep`
- [ ] Slow webhook: page polls, then shows "Płatność została przyjęta, a zamówienie wciąż się przetwarza…" instead of an error

### B9. Transactional emails (all six, from `kontakt@sznytdesign.pl` via cyberfolks)

- [ ] **Order confirmation** (customer): full line items, quantities, unit prices, shipping address, paczkomat point with city, payment method, order note, grand total; branded HTML + plain-text part
- [ ] **Admin new order** (to `CONTACT_RECIPIENT`): arrives the moment the webhook records the order
- [ ] **Order shipped** (customer): fires only when status is set to Wysłane **and** tracking number is present; contains the tracking number
- [ ] **Contact notification** (admin) — covered in A6, re-verify live
- [ ] **Return request** (admin) — covered in A7, re-verify live
- [ ] **Complaint request** (admin) — covered in A7, re-verify live

### B10. My orders (customer)

- [ ] `/moje-zamowienia` unauthenticated → sign-in redirect
- [ ] Shows only the signed-in user's orders; empty state when none
- [ ] Card: order #, date, payment dot, fulfillment dot, thumbnails, total
- [ ] Click → `/moje-zamowienia/:id`: order #, date, payment badge, fulfillment label, tracking number when set, products with image/qty/price, payment method, delivery (paczkomat → locker code + address with city; kurier → full address), total
- [ ] "← Moje zamówienia" back link works
- [ ] Another user's order id → 403 handled gracefully

### B11. Auth & roles (Clerk)

- [ ] "Zaloguj" opens the Polish sign-in modal
- [ ] Signed in: UserButton with "Moje zamówienia"; sign out restores "Zaloguj"
- [ ] Guest checkout works end-to-end (order has no userId)
- [ ] Signed-in checkout stamps userId on the order
- [ ] **Both** admin accounts (Adrian + wife) pass the admin guard
- [ ] A non-admin Clerk user: redirected away from `/admin` routes **and** gets 403 on admin API endpoints

### B12. Admin — products & revenue banner (`/admin`)

- [ ] Revenue banner: "Przychód Q{n} {year}", total vs 10 813,50 zł cap, percentage, progress bar
- [ ] Thresholds: < 70% green, no message; ≥ 70% amber "Ponad 70% limitu — czas zaplanować rejestrację działalności."; ≥ 90% red "Ponad 90% limitu — rozpocznij rejestrację działalności."; > 100% "Limit przekroczony — obowiązek rejestracji działalności w ciągu 7 dni!"
- [ ] Banner sums only `paid` orders from the current calendar quarter (the live test order should appear in the total)
- [ ] Product list loads; ▲▼ reorder persists after reload; arrows disabled at list ends
- [ ] "Edytuj" → pre-filled edit page; saves; "Anuluj" returns without saving
- [ ] "Usuń" → confirm modal → deletes and removes from the list (historical orders keep their line items)
- [ ] `/admin/produkty/nowy`: form creates a product and navigates back to `/admin`

### B13. Admin — orders & fulfillment loop (`/admin/zamowienia`, `/admin/zamowienia/:id`)

- [ ] All orders listed, newest first; guest orders included
- [ ] Address column shows "Uwagi: …" in accent when the order has a note
- [ ] Fulfillment dropdown (Przyjęte / W realizacji / Wysłane / Dostarczone) PATCHes immediately
- [ ] Tracking number saves on blur
- [ ] Setting Wysłane with a tracking number triggers the shipping email (see B9)
- [ ] Order id links to the detail page: line items with images, Dostawa cost row, total, delivery method + paczkomat point, payment method, full recipient address, note section when present
- [ ] Fulfillment controls on the **detail page** behave identically to the list's inline controls (same email trigger)
- [ ] **Full loop:** admin new-order email → open admin on phone → set Wysłane + paste tracking → customer receives the shipping email

### B14. Admin mobile (375px, real phone — wife's primary device)

- [ ] Revenue banner legible
- [ ] Products list usable (reorder, edit, delete)
- [ ] Orders list usable (table scrolls horizontally inside its container; page doesn't break)
- [ ] Order detail readable; fulfillment loop (status + tracking) doable one-handed
- [ ] No horizontal page scroll on any admin route

### B15. Edge cases

- [ ] Product goes out of stock after it's in someone's cart → checkout returns the Polish stock error, no order created
- [ ] Non-existent order id (customer and admin detail pages) → error handled, no crash
- [ ] Direct navigation to `/admin/*` as guest or non-admin → redirected
- [ ] `/sukces` with a bogus `session_id` → handled gracefully (polling gives up with the processing message)
