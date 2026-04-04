# Sznyt Design — Manual Test Plan

Run through before launch. Uses real browser, Stripe test mode, and Stripe CLI webhook forwarding.

## Setup required

- Frontend running: `npm run dev` (port 5173)
- Backend running: `npx tsx index.js` (port 3000)
- Stripe CLI: `stripe listen --forward-to localhost:3000/webhook`
- Stripe test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 9995` (decline)

---

### 1. Navigation & layout ✅ PASSED

- [x] All nav links work (Sklep, O nas, Kontakt)
- [x] Active nav link highlighted in gold
- [x] Logo links to `/`
- [x] Cart icon shows badge with correct count
- [x] Hamburger opens/closes on mobile
- [x] Mobile nav link closes menu
- [x] Footer links all work
- [x] ScrollToTop appears after 300px, scrolls smoothly
- [x] ScrollOnNav scrolls to top on route change

### 2. Home page (`/`)

- [ ] Hero renders, scroll indicator visible
- [ ] ProductSection loads from backend
- [ ] BrandStatement renders
- [ ] "Why us" 3-column strip renders
- [ ] Footer correct links

### 3. Shop page (`/sklep`)

- [ ] Products load in grid
- [ ] Hover swaps to lifestyle image
- [ ] Click navigates to `/sklep/:id`
- [ ] Philosophy + materials strips render
- [ ] Out-of-stock handled gracefully

### 4. Product detail (`/sklep/:id`)

- [ ] Name, description, price render
- [ ] Image swap on hover
- [ ] Stock count displayed
- [ ] "Dodaj do koszyka" works + badge increments
- [ ] Cannot exceed stock
- [ ] Out of stock: button disabled
- [ ] "← Odkryj całą kolekcję" → `/sklep`
- [ ] Breadcrumb renders

### 5. Cart (`/koszyk`)

- [ ] Items: image, name, unit price, quantity, line total
- [ ] +/− buttons work; − disabled at 1; + capped at stock
- [ ] "Usuń" removes item
- [ ] Empty cart state with shop link
- [ ] Subtotal correct
- [ ] Free shipping banner at ≥ 350 PLN + progress bar
- [ ] All 3 shipping methods selectable with correct cost
- [ ] Paczkomat: widget picker + address fields
- [ ] Kurier: address form only
- [ ] All address fields required
- [ ] Regulamin checkbox required
- [ ] Checkout button disabled until: shipping + address + regulamin
- [ ] Checkout → Stripe with pre-filled email

### 6. Stripe checkout & payment

- [ ] Correct line items and shipping on Stripe page
- [ ] Success card `4242...` → `/sukces?session_id=...`
- [ ] Decline card `4000...0995` → error on Stripe page
- [ ] Cancel → `/koszyk`
- [ ] Webhook `checkout.session.completed` processed
- [ ] Order created: status "paid", correct items, stock decremented
- [ ] PaymentMethod + customerEmail saved

### 7. Order success (`/sukces`)

- [ ] Order details card with id + total
- [ ] Item breakdown correct
- [ ] "Moje zamówienia" link: visible signed-in, hidden guest
- [ ] No session_id: handled gracefully

### 8. My orders (`/moje-zamowienia`)

- [ ] Unauth → sign-in redirect
- [ ] Shows only user's orders
- [ ] Card: order#, date, payment dot, fulfillment dot, thumbnails, total
- [ ] Click → `/moje-zamowienia/:id`
- [ ] Empty state

### 9. Order detail (`/moje-zamowienia/:id`)

- [ ] Order#, date, payment badge, fulfillment dot + label
- [ ] Tracking number when set
- [ ] Products: image, name, qty, price
- [ ] Payment method shown
- [ ] Shipping: Paczkomat → locker code; Kurier → full address
- [ ] Total correct
- [ ] "← Moje zamówienia" works
- [ ] Cannot access other user's order (403)

### 10. Admin — Products (`/admin`)

- [ ] Non-admin redirected (AdminGuard)
- [ ] Product list loads
- [ ] ▲▼ reorder persists on reload
- [ ] Edytuj → pre-filled edit page
- [ ] Usuń → confirm modal → delete + remove from list

### 11. Admin — Add product (`/admin/produkty/nowy`)

- [ ] Form submits, creates product, navigates to /admin

### 12. Admin — Edit product (`/admin/produkty/:id`)

- [ ] Pre-filled form, saves correctly, "Anuluj" returns without saving

### 13. Admin — Orders (`/admin/zamowienia`)

- [ ] All orders listed, newest first
- [ ] Fulfillment dropdown PATCHes immediately
- [ ] Tracking number saves on blur
- [ ] "Wysłane" + tracking → triggers shipping email

### 14. Auth (Clerk)

- [ ] "Zaloguj" → Polish sign-in modal
- [ ] Sign in → UserButton with "Moje zamówienia"
- [ ] Sign out → "Zaloguj" returns
- [ ] Guest checkout works
- [ ] Signed-in checkout → userId on order

### 15. Contact (`/kontakt`)

- [ ] All fields fillable, submit shows loading → success
- [ ] Empty form → error
- [ ] ContactMessage saved in DB

### 16. Zwroty (`/zwroty`)

- [ ] Tab switch works
- [ ] Both forms: all required, submit → success
- [ ] Info boxes render

### 17. FAQ (`/faq`)

- [ ] Accordion opens/closes
- [ ] "Formularz reklamacyjny" → `/zwroty`
- [ ] CTA links: /kontakt and /zwroty

### 18. Legal pages

- [ ] `/regulamin` and `/polityka-prywatnosci` render all sections
- [ ] Links from Cart checkbox open in new tab

### 19. Responsiveness (390px viewport)

- [ ] Navbar → hamburger
- [ ] Hero readable
- [ ] Shop grid: single column
- [ ] ProductDetail: stacked
- [ ] Cart: compact layout
- [ ] Address form: single column
- [ ] MyOrders: stacked headers
- [ ] Footer: centered, columns side by side

### 20. Edge cases

- [ ] stock=0 → cannot add to cart
- [ ] Non-existent order id → error handled
- [ ] Non-admin → /admin redirected
- [ ] Duplicate webhook → order not duplicated (unique stripeSessionId)
- [ ] Same product added twice → quantity increments, not duplicate line
