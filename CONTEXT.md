# Sznyt Design — Context

> The domain truth for this project: business model, terms, entities, rules, services.
> Read this before exploring code. For commands and gotchas, see `CLAUDE.md`. For implementation plans, see open GitHub issues and PRDs. For architectural decisions with rationale, see `docs/adr/`.

## Purpose

Premium e-commerce shop selling designer wooden picture frames at `sznytdesign.pl`. Wife designs and manufactures the frames; Adrian builds and operates the shop. Custom React/Express stack — no Shopify, no WooCommerce — chosen for full control over brand presentation and post-purchase experience.

## Business model

**Działalność nierejestrowana (DN)** — unregistered business activity under Polish law. Allows operating commercially below a per-quarter revenue cap without formal business registration.

- **Quarterly revenue cap (2026):** 10,813.50 PLN. Crossing it triggers mandatory business registration within 7 days. Cap value is set by law and changes year over year — bumped manually in code each tax year.
- **Pre-registration constraints:** can only issue `rachunek` (informal receipt), not `faktura VAT`. No NIP collection at checkout. No VAT in pricing language.
- **Statutory 14-day refund right** for distance-purchase consumers — non-negotiable, must be reflected in regulamin.

## Domain glossary

- **Działalność nierejestrowana (DN)** — unregistered business activity. Polish legal regime allowing commerce below a quarterly revenue cap without business registration.
- **NIP** — Polish tax identification number. Required to issue `faktura VAT`. Not collected pre-registration.
- **Rachunek** — informal receipt. What customers get pre-NIP. Line items, totals, seller and buyer data, no VAT or NIP.
- **Faktura VAT** — VAT invoice. Requires NIP. Blocked until business registration.
- **Regulamin** — terms of service. Legal requirement under Polish e-commerce law. Lives at `src/pages/Regulamin.tsx`. Must declare DN status, refund right, returns/complaints procedures, data controller.
- **Polityka prywatności** — privacy policy. Lives at `src/pages/PolitykaPrywatnosci.tsx`. Must describe cookie usage, data processing basis, controller.
- **Paczkomat / InPost** — Polish parcel locker network. Most common delivery method for low-value e-commerce.
- **easyPack** — InPost's JS widget for paczkomat selection at checkout. No business account required.
- **Apaczka / Sendit** — Polish shipping-label aggregators. Operate on individual accounts, no business registration required. Used to manually generate paczkomat labels; admin pastes tracking back into the order.
- **Furgonetka** — another shipping aggregator, requires business account. Blocked on registration; out of scope until then.
- **Cutover** — the coordinated DNS + mail records + production env-var switchover from the WordPress placeholder to the React/Express app.
- **Soft launch** — going live silently, no marketing, with `noindex`. Brand presentation must be production-quality even though no one is being told.

## Core entities

Defined in `backend/prisma/schema.prisma`.

- **Product** — a frame SKU. Has `name`, `tagline`, `description`, `price`, `imageUrl`, `lifestyleImageUrl`, `stock`, `sortOrder`. Stock decrements atomically when an order is paid.
- **Order** — a customer purchase. Lifecycle: `pending` → `paid` (Stripe webhook); fulfillment: `received` → `shipped`. Carries `stripeSessionId` (unique idempotency key), `customerEmail`, `userId` (nullable — guest checkout allowed), `shippingMethod`, `shippingAddress` (JSON), `paymentMethod`, `fulfillmentStatus`, `trackingNumber`.
- **OrderItem** — line item linking an `Order` to a `Product` with `quantity` and `price` snapshotted at purchase time. `productId` is nullable with `onDelete: SetNull` — orders survive product deletion with their historical line items intact.
- **ContactMessage** — submission from the contact form. Stored for support history.

## Core flows

- **Checkout (customer):** browses → adds to cart → enters shipping (paczkomat or address) → Stripe Checkout → returns to `/sukces` → Stripe webhook decrements stock, fires customer order-confirmation email and admin new-order email.
- **Fulfillment (admin):** sees new-order email → opens admin panel on mobile → updates fulfillment status to `shipped` and pastes tracking number → backend fires customer shipping-confirmation email.
- **Returns / complaints (customer):** public forms post to `kontakt@sznytdesign.pl`. No DB tracking; handled by email.

## Transactional emails (six types)

All rendered by per-template render functions returning `{ subject, html, text }`. A single `sendEmail()` helper wraps nodemailer.

1. **Order confirmation** (customer) — full line items, totals, shipping address.
2. **Admin new order** (Adrian + wife) — paid-order alert. Recipient is `CONTACT_RECIPIENT`.
3. **Order shipped** (customer) — tracking number, carrier.
4. **Contact notification** (admin) — contact form submission.
5. **Return request** (admin) — return form submission.
6. **Complaint request** (admin) — complaint form submission.

## Auth & roles

- **Provider:** Clerk.
- **Admin role:** `publicMetadata.role === "admin"` on the Clerk user. Read in backend via `@clerk/express` session claims; in frontend via a `useIsAdmin()` hook wrapping `useUser()`. Both surfaces share one source of truth.
- **Two admins:** Adrian + wife. Each has own Clerk account with the admin role.
- **Legacy (pre-cutover):** hardcoded `ADMIN_USER_ID` env var. Being phased out by the soft-launch PRD.

## External services

- **Stripe** — payments. Live keys post-cutover. Webhook (`/webhook`) is the source of truth for payment state. Dev uses Stripe CLI (`stripe listen --forward-to localhost:3000/webhook`).
- **Clerk** — auth. Production instance with `publicMetadata.role` post-cutover.
- **Google Workspace** — transactional email SMTP and `kontakt@sznytdesign.pl` inbox.
- **InPost easyPack** — paczkomat picker widget.
- **Apaczka / Sendit** — manual shipping labels (individual account).
- **Vercel** — frontend hosting (hobby tier).
- **Railway** — backend hosting + managed Postgres (~$5–10/mo).

## Key rules & invariants

- **Atomic stock decrement.** Stock decrements happen in the Stripe webhook handler inside a Prisma transaction. Never decrement on cart-add or checkout-start — only on payment confirmation.
- **Stripe webhook is the source of truth.** Order status transitions to `paid` only via the webhook. `/sukces` is a UX page, not a state transition.
- **`stripeSessionId` is the idempotency key.** Webhook retries must be no-ops.
- **Rachunek only pre-NIP.** No `faktura VAT` UI, no NIP field on checkout, no VAT in pricing copy until business registration ships.
- **Quarterly revenue cap is monitored, not enforced.** Admin sees a banner with running total + 70 % / 90 % / over thresholds. Crossing it is a manual action (begin registration), not an automatic block.
- **`noindex` until photos.** Site ships with `<meta name="robots" content="noindex">` at the layout level. Lifted only after real product photos land (mid-June 2026 decision point).
- **Admin must work at 375 px.** Wife uses phone as primary admin device.
- **Returns and complaints are email-only.** No DB workflow. Forms post to `kontakt@sznytdesign.pl`.

## Security & abuse mitigation

- **Honeypot fields** on public forms (contact, returns, complaints) to filter automated spam.
- **reCAPTCHA v3** deferred — add only if honeypot proves insufficient post-launch.

## Out-of-scope concepts

What the project explicitly does NOT do — to prevent reintroducing rejected ideas:

- **Furgonetka API integration** — blocked on business registration.
- **Faktura VAT generation, NIP collection at checkout** — blocked on business registration.
- **In-app refund flow** — Stripe dashboard is sufficient.
- **DB-tracked returns / complaints** — email-only.
- **Real-time admin dashboards** — Convex was considered and rejected; Prisma + page refresh suffices.
- **SSR / Next.js** — react-helmet-async for SEO; revisit only if SEO requires it post-launch.
- **React Admin** — custom admin panel.
- **`comingSoon` flag on `Product`** — only 2 products at launch; if a product is not for sale, it doesn't get seeded.
- **Backend `index.js` split** — works as-is at 507 lines; refactor tracked as a separate initiative.
