# Sznyt Design — Context

> The domain truth for this project: business model, terms, entities, rules, services.
> Read this before exploring code. For commands and gotchas, see `CLAUDE.md`. For implementation plans, see open GitHub issues and PRDs. For architectural decisions with rationale, see `docs/adr/`.

## Purpose

Premium e-commerce shop selling designer wooden picture frames at `sznytdesign.pl`. Wife designs and manufactures the frames; Adrian builds and operates the shop. Custom React/Express stack — no Shopify, no WooCommerce — chosen for full control over brand presentation and post-purchase experience.

## Business model

**Działalność nierejestrowana (DN)** — unregistered business activity under Polish law. Allows operating commercially below a per-quarter revenue cap without formal business registration.

- **Quarterly revenue cap (2026):** 10,813.50 PLN. Crossing it triggers mandatory business registration within 7 days. Cap value is set by law and changes year over year — bumped manually in code each tax year.
- **Refunded (returned) orders don't count toward the cap** — *przychód należny* excludes the value of returned goods (art. 5 ust. 6 Prawa przedsiębiorców). The admin banner still counts them (it only sums `paid` orders), so it can only over-count — subtract refunds by hand when near the cap. Procedure: `docs/runbooks/refunds.md`.
- **Pre-registration constraints:** issues `rachunek` on the buyer's request (art. 87 § 1 Ordynacji podatkowej) and `faktura bez VAT` on the buyer's request made within 3 months (art. 106b ust. 3 pkt 2 ustawy o VAT) — never `faktura VAT`. No NIP collection at checkout. No VAT in pricing language.
- **Statutory 14-day refund right** for distance-purchase consumers — non-negotiable, must be reflected in regulamin.

## Domain glossary

- **Działalność nierejestrowana (DN)** — unregistered business activity. Polish legal regime allowing commerce below a quarterly revenue cap without business registration.
- **NIP** — Polish tax identification number. Required to issue `faktura VAT`. Not collected pre-registration.
- **Rachunek** — informal receipt, issued on the buyer's request. Line items, totals, seller and buyer data, no VAT or NIP.
- **Faktura bez VAT** — invoice without VAT (sale exempt under art. 113 ustawy o VAT). Mandatory when the buyer requests one within 3 months of delivery; does NOT require business registration or a seller NIP.
- **Faktura VAT** — VAT invoice. Requires NIP. Blocked until business registration.
- **Regulamin** — terms of service. Legal requirement under Polish e-commerce law. Lives at `src/pages/Regulamin.tsx`. Must declare DN status, refund right, returns/complaints procedures, data controller.
- **Polityka prywatności** — privacy policy. Lives at `src/pages/PolitykaPrywatnosci.tsx`. Must describe browser storage (art. 399 Prawa komunikacji elektronicznej), data processing bases, third-country transfers (Stripe/Clerk DPF), controller — consistent with the regulamin.
- **Paczkomat / InPost** — Polish parcel locker network. Most common delivery method for low-value e-commerce.
- **easyPack** — InPost's JS widget for paczkomat selection at checkout. No business account required.
- **Apaczka / Sendit** — Polish shipping-label aggregators. Operate on individual accounts, no business registration required. Used to manually generate paczkomat labels; admin pastes tracking back into the order.
- **Furgonetka** — another shipping aggregator, requires business account. Blocked on registration; out of scope until then.
- **Cutover** — the coordinated DNS + production env-var switchover from the WordPress placeholder to the React/Express app. Web-only: mail stays at cyberfolks, so MX/SPF/DKIM records never move.
- **Soft launch** — going live on the domain silently, no marketing, with `noindex` until real photos. Deferred (2026-07-13 demo-first replan) until real products, photos, and descriptions exist — date TBD. Gated by the `docs/TEST-PLAN.md` walkthrough (#31/#85), including one real Stripe charge (refunded afterwards). Closes PRD #19.
- **Recruiter demo** — free `.vercel.app` deployment (Vercel + Render + Neon + Clerk dev, `VITE_DEMO_MODE=true`) that serves as Adrian's SE-portfolio artifact while the domain launch waits. Full checkout runs in **Stripe test mode** (card `4242 4242 4242 4242`); no real money moves, no emails send. Runbook: `docs/DEPLOY-DEMO.md`. This is the current milestone — the project parks once it ships; re-entry point is the `waiting-for-products` issue label.
- **Order intake** — the module that turns a paid Stripe checkout session into a recorded `Order`: transaction, atomic stock decrement, idempotency. Lives in `backend/orders/`. The Stripe webhook route is its adapter.
- **Line-item contract** — the agreement between checkout and order intake carried through Stripe: each product line item is stamped with `metadata.productId`; a line item without one (shipping) is skipped when recording `OrderItem`s and decrementing stock.
- **Shipping address contract** — the flat JSON captured at checkout and stored on the Order as `shippingAddress`: `firstName`, `lastName`, `email`, `street`, `postalCode`, `city`, `phone` always present; the paczkomat point's `code` and `name` present iff `shippingMethod === "paczkomat"`. Discriminated by the Order's sibling `shippingMethod`, never by its own shape. Typed as `ShippingAddress` in `@sznyt/shared`; built only by the frontend checkout module, parsed and rendered by order intake and emails. See `docs/adr/0003-checkout-assembly-module.md`.

## Core entities

Defined in `backend/prisma/schema.prisma`.

- **Product** — a frame SKU. Has `name`, `tagline`, `description`, `price`, `imageUrl`, `lifestyleImageUrl`, `stock`, `sortOrder`. Stock decrements atomically when an order is paid.
- **Order** — a customer purchase. Lifecycle: `pending` → `paid` (Stripe webhook); fulfillment: `received` → `shipped`. Carries `stripeSessionId` (unique idempotency key), `customerEmail`, `userId` (nullable — guest checkout allowed), `shippingMethod`, `shippingAddress` (JSON), `paymentMethod`, `fulfillmentStatus`, `trackingNumber`, `note` (nullable customer delivery instructions, max 300 chars — travels as its own Stripe `metadata.note` key; cap shared as `ORDER_NOTE_MAX_LENGTH` in `@sznyt/shared`).
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

## External services

- **Stripe** — payments. Live keys post-cutover. Webhook (`/webhook`) is the source of truth for payment state. Dev uses Stripe CLI (`stripe listen --forward-to localhost:3000/webhook`).
- **Clerk** — auth. Production instance with `publicMetadata.role` post-cutover.
- **cyberfolks** — mail hosting: transactional email SMTP (`s123.cyber-folks.pl:465`, implicit TLS) and the `kontakt@sznytdesign.pl` + admin inboxes, read via Thunderbird.
- **InPost easyPack** — paczkomat picker widget.
- **Apaczka / Sendit** — manual shipping labels (individual account).
- **Vercel** — frontend hosting (hobby tier).
- **Railway** — backend hosting + managed Postgres (~$5–10/mo). Provisioned at real launch, not before.
- **Render + Neon** — free-tier backend + Postgres for the recruiter demo (production stays on Railway).

## Key rules & invariants

- **Atomic stock decrement.** Stock decrements happen in the Stripe webhook handler inside a Prisma transaction. Never decrement on cart-add or checkout-start — only on payment confirmation.
- **Stripe webhook is the source of truth.** Order status transitions to `paid` only via the webhook. `/sukces` is a UX page, not a state transition.
- **`stripeSessionId` is the idempotency key.** Webhook retries must be no-ops.
- **Rachunek / faktura bez VAT on request, pre-NIP.** Both issued manually by email on the buyer's request (regulamin § 5 pkt 3). No `faktura VAT` UI, no NIP field on checkout, no VAT in pricing copy until business registration ships.
- **Quarterly revenue cap is monitored, not enforced.** Admin sees a banner with running total + 70 % / 90 % / over thresholds. Crossing it is a manual action (begin registration), not an automatic block.
- **Production launches only with real products.** The domain flip waits for frames, photos, and descriptions (issues labeled `waiting-for-products`). The interim public artifact is the recruiter demo, not the domain.
- **Seed defaults to stock 0.** `seed.js` seeds `stock: 0` unless `SEED_STOCK=<n>` is set — fail-safe toward an unpurchasable shop (stock 0 disables add-to-cart and shows "Brak w magazynie"). The demo seeds with `SEED_STOCK` so recruiters can complete test purchases.
- **`noindex` until real photos.** Site ships with `<meta name="robots" content="noindex">` at the layout level. Lifted only after **real** product photos land — AI-rendered placeholder imagery does not lift it.
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
- **Google Workspace migration** — rejected 2026-07-13. Mail stays at cyberfolks (works as desired via Thunderbird, saves ~38 PLN/mo); revisit only if deliverability becomes a problem.
