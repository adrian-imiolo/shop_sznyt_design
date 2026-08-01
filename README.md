# Sznyt Design

> Premium e-commerce for designer wooden picture frames.

[![CI](https://github.com/adrian-imiolo/shop_sznyt_design/actions/workflows/ci.yml/badge.svg)](https://github.com/adrian-imiolo/shop_sznyt_design/actions/workflows/ci.yml)

**Live demo:** [shop-sznyt-design.vercel.app](https://shop-sznyt-design.vercel.app/) — full checkout on Stripe **test mode**: pay with card `4242 4242 4242 4242`, no real money moves
**Production:** `sznytdesign.pl` — domain registered, cutover deliberately deferred until the real frames, photos, and copy exist. The demo is the current public artifact.

A custom React + Express + Postgres e-commerce stack built and operated end-to-end by one developer. No Shopify, no WooCommerce — full control over brand presentation, checkout flow, and admin tooling.

---

## What's interesting

- **Real production code, not a tutorial clone.** Powers a working business.
- **Operates under Polish _działalność nierejestrowana_ (DN)** — unregistered business activity below a quarterly revenue cap (~10,800 PLN in 2026). The regime constrains the code: no VAT invoices, no NIP collection, statutory 14-day refund right, quarterly revenue tracker in the admin.
- **Solo-built, full stack.** Frontend, backend, database, payments, transactional emails, admin panel.
- **Architectural decisions documented.** See `CONTEXT.md` for the domain model and `docs/adr/` for the why-behind each major choice.

## Live demo

The demo runs the **real checkout pipeline against Stripe test mode** — not a mock. Land on [shop-sznyt-design.vercel.app](https://shop-sznyt-design.vercel.app/), add a frame to the cart, fill in any address, and pay with test card `4242 4242 4242 4242` (any future expiry, any CVC). You'll get a real order confirmation page backed by a webhook-recorded order in Postgres.

Worth noticing while you're in there:

- **The Stripe webhook is the source of truth** — the order flips to `paid` only when Stripe's `checkout.session.completed` event lands, never from the client. Replay the event from the Stripe dashboard and no duplicate order appears (`stripeSessionId` is the idempotency key).
- **Stock decrements atomically** in a Prisma transaction inside the webhook handler — two buyers can't oversell the last frame.
- **Clerk role-based admin** — `/admin` is gated by `publicMetadata.role === "admin"`; sign up freely, you'll be authenticated but unauthorized (by design).
- **npm-workspaces monorepo** with shared TypeScript types across the React frontend and Express backend — one definition of `Product`/`Order` on both sides of the API boundary.
- **Transactional email module** — order confirmation, shipping notification, contact form; in the demo SMTP is intentionally unset, so the backend logs `[demo] sendEmail skipped` instead of sending.

Demo infra: Vercel (frontend) + Render Starter (backend) + Neon (Postgres) + Clerk dev + Stripe test mode. Runbook: `docs/DEPLOY-DEMO.md`. The backend runs on a paid instance so it doesn't spin down — the demo is warm when you open it.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript (strict) | Modern React, fast HMR, strict typing across the API boundary |
| Styling | Tailwind CSS v4 | Design tokens via theme, no CSS file proliferation |
| Routing | React Router 7 | SPA routing without Next.js overhead |
| Backend | Express 5 on Node 20+ | A small monolith doesn't need a framework |
| ORM | Prisma 7 | Type-safe queries, schema-first, painless migrations |
| Database | PostgreSQL (Neon serverless in the demo; Railway at launch) | Order → OrderItem → Product is naturally relational |
| Auth | Clerk | Hosted; saves writing session/password infrastructure |
| Payments | Stripe Checkout | Hosted = no PCI scope; webhook is the source of truth |
| Email | Nodemailer + hosting-provider SMTP | Transactional volume too low to justify a paid provider |
| Hosting | Vercel (frontend) + Render/Railway (backend) + Neon (DB) | Vercel free tier for the SPA; Render Starter for the demo backend so it never spins down |

## Architecture

```
                ┌─────────────┐
                │   Browser   │
                │  React + TS │
                └──────┬──────┘
                       │ HTTPS / JSON
                       ▼
                ┌─────────────┐  webhook  ┌────────────┐
                │   Express   │ ◀──────── │   Stripe   │
                │  Node + TS  │           │  Checkout  │
                └──┬───────┬──┘           └────────────┘
                   │       │
           Prisma  │       │  SMTP
                   ▼       ▼
          ┌──────────────┐  ┌──────────┐
          │  PostgreSQL  │  │   SMTP   │
          │    (Neon)    │  │ provider │
          └──────────────┘  └──────────┘
                   ▲
                   │ session claims (@clerk/express)
                   │
          ┌──────────────┐
          │    Clerk     │
          │   (auth)     │
          └──────────────┘
```

### Load-bearing invariants

- **Stripe webhook is the source of truth.** `Order.status` flips to `paid` only inside the webhook handler — never from `/sukces` or any client action.
- **`stripeSessionId` is the idempotency key.** Webhook retries are no-ops by design.
- **Stock decrements atomically** inside a Prisma transaction, only on `checkout.session.completed`.
- **Cart lives client-side** in `localStorage` (gated by cookie consent) — never persisted server-side until payment.
- **Orders survive product deletion.** `OrderItem.productId` is nullable with `onDelete: SetNull`; historical line items keep their price + name snapshot.

## Testing

Three layers, each with a different cost/confidence trade-off. The first two run on every push and pull request via GitHub Actions.

| Layer | What it covers | Command |
|---|---|---|
| **Unit** — 219 tests, Vitest | Pure business logic extracted away from I/O: cart math, shipping-cost rules, checkout-draft validation, revenue-threshold banding, order-note normalisation, email rendering (subject + HTML + text) | `npm test` |
| **Integration** — 8 suites, Vitest + real Postgres | Every Express route against a real database: webhook idempotency, atomic stock decrement, admin 403s, form honeypots | `npm run test:db --workspace backend` |
| **E2E** — Playwright | Guest checkout through Stripe test mode and order tracking. Local-only by design (needs `stripe listen`) — see `e2e/README.md` | `npm run test:e2e` |

Two decisions worth calling out:

- **The integration suite is hermetic — it needs no secrets.** Clerk auth, Stripe, and the mailer are injected into `createApp()` as fakes, so CI runs the real routing, real Prisma queries, and real transaction boundaries against a throwaway Postgres service container, with zero third-party accounts involved. That's why the CI badge above is green without a single repository secret.
- **Business logic is deliberately pulled out of route handlers** so it can be unit-tested without HTTP or a database. `bannerPresentation`, `calcShippingCost`, `buildCheckoutLineItems`, and `normalizeOrderNote` are pure functions; the routes stay thin.

The test database is guarded — `backend/scripts/test-db-url.js` refuses any connection string whose database name doesn't end in `_test`, so a stray `TEST_DATABASE_URL` can't truncate a real one.

Beyond automation, `docs/TEST-PLAN.md` is the human checklist for the two launch gates — the paths that only a person on a real phone can sign off.

## Features

### Customer
- Product catalog with admin-controlled sort order
- Detail pages with studio + lifestyle imagery
- Cart with quantity controls, free-shipping threshold, address form / InPost paczkomat picker
- Stripe Checkout supporting card, BLIK, P24
- Order tracking by Clerk account or by Stripe session ID (guest checkout)
- Polish e-commerce compliance: regulamin, polityka prywatności, returns + complaints forms

### Admin (mobile-first, 375 px primary device)
- Product CRUD with drag-to-reorder
- Order list with fulfillment lifecycle: `received` → `processing` → `shipped` → `delivered`
- Tracking number paste → triggers customer shipping-confirmation email
- Admin role gated by `publicMetadata.role === "admin"` on Clerk

## Business context

The shop operates under Polish **działalność nierejestrowana (DN)** — unregistered commercial activity below a quarterly revenue cap (10,813.50 PLN in 2026). This shaped the codebase:

- **`rachunek` only**, no `faktura VAT` until business registration
- **No NIP field** at checkout
- **Quarterly revenue tracker** on the admin home (banners at 70 % / 90 % / over cap)
- **Statutory 14-day refund right** declared in regulamin; forms post to support inbox (no DB workflow)

Crossing the threshold triggers business registration within 7 days. The regime change unlocks features currently tracked as `blocked` issues (VAT invoice generation, NIP collection, Furgonetka API).

## Local development

### Prerequisites
- Node 20+
- PostgreSQL running locally (or a Neon connection string)
- Clerk account (development instance is fine)
- Stripe account in test mode (optional — checkout endpoints return 503 without `STRIPE_SECRET_KEY`)

### Setup

```bash
git clone https://github.com/adrian-imiolo/shop_sznyt_design.git
cd shop_sznyt_design
npm install                # workspaces: covers frontend, backend, and packages/shared

cp backend/.env.example backend/.env
# Fill in DATABASE_URL and CLERK_SECRET_KEY at minimum
# STRIPE_* and SMTP_* are optional (backend boots without them, features disabled)

# Frontend env
cat > .env <<EOF
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
EOF

cd backend
npx prisma migrate dev
npx tsx seed.js          # seeds 2 sample products
cd ..

npm run dev              # starts frontend (5173) + backend (3000) concurrently
```

### Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/webhook
# paste the whsec_... value into backend/.env as STRIPE_WEBHOOK_SECRET
```

### Demo mode

Set `VITE_DEMO_MODE=true` (frontend) to show the demo banner and test-card instructions. The backend runs the real checkout pipeline against Stripe **test mode** (`sk_test_...` keys) — full purchase with card `4242 4242 4242 4242`, webhook-recorded order, atomic stock decrement. With `SMTP_HOST` unset, emails are skipped and logged. Without `STRIPE_SECRET_KEY`, checkout endpoints return 503. Deploy runbook: `docs/DEPLOY-DEMO.md`.

## Project layout

npm workspaces: the root is the frontend, with `backend/` and `packages/*` as workspaces. One `npm install` at the root covers all three.

```
.
├── src/                     # Frontend (React + Vite)
│   ├── pages/               # Route components (incl. pages/admin/)
│   ├── components/          # Reusable UI
│   ├── checkout/            # Checkout assembly — pure core + useCheckout hook
│   ├── cart/                # Cart math and localStorage persistence
│   ├── orders/              # Order rendering shared by customer and admin
│   ├── context/             # Cart provider
│   └── types.ts             # Frontend-only view types
├── packages/shared/         # @sznyt/shared — types and rules used by BOTH sides
│   └── src/                 # statuses, shipping costs, money, roles, form contracts
├── backend/
│   ├── index.js             # Boot: env checks, dependency wiring
│   ├── app.js               # createApp() — injectable auth/Stripe/mailer (testability seam)
│   ├── routes/              # checkout, webhook, orders, products, forms, revenue
│   ├── orders/              # Order intake: recordPaidOrder, notifications, Stripe facts
│   ├── emails/              # Per-template renderers → { subject, html, text }
│   ├── revenue/             # Quarterly DN revenue computation
│   ├── middleware/          # adminAuth, error handling
│   ├── test/                # DB-backed integration suite + fakes/harness
│   ├── seed.js              # Development seed
│   └── prisma/
│       ├── schema.prisma    # DB single source of truth
│       └── migrations/
├── e2e/                     # Playwright specs (local-only)
├── docs/
│   ├── TEST-PLAN.md         # Manual launch-gate checklist
│   ├── DEPLOY-DEMO.md       # Demo deployment runbook
│   ├── adr/                 # Architectural decision records
│   └── runbooks/            # Refunds, production migrations
├── CONTEXT.md               # Domain glossary, business rules, entity model
├── CLAUDE.md                # AI-assistant project conventions
└── README.md                # This file
```

## Roadmap

Tracked in [GitHub Issues](https://github.com/adrian-imiolo/shop_sznyt_design/issues). The software is feature-complete for launch; what remains is blocked on things outside the code.

- **Waiting on real products** — the domain cutover is gated on actual frames existing: real photography, real descriptions, care instructions, then production provisioning, DNS flip, and the two manual launch-gate walkthroughs in `docs/TEST-PLAN.md` (one involving a real Stripe charge, refunded afterwards). Deliberate: shipping a shop full of placeholder imagery would be worse than not shipping.
- **Blocked on business registration** — VAT invoice generation, NIP collection at checkout, and the Furgonetka shipping API only become legal/possible once the DN revenue cap is crossed and the business is formally registered.
- **Considered** — customer reviews on product pages.

## License & usage

Source is public for portfolio purposes. Do not reuse product imagery, copy, or trademarks. Code patterns may be referenced freely.
