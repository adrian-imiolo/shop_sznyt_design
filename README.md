# Sznyt Design

> Premium e-commerce for designer wooden picture frames.

**Live demo:** [shop-sznyt-design.vercel.app](https://shop-sznyt-design.vercel.app/) — full checkout on Stripe **test mode**: pay with card `4242 4242 4242 4242`, no real money moves
**Production:** [sznytdesign.pl](https://sznytdesign.pl) _(post-cutover)_

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

Demo infra: Vercel (frontend) + Render (backend) + Neon (Postgres) + Clerk dev + Stripe test mode — $0/month. Runbook: `docs/DEPLOY-DEMO.md`. First request may take ~30 s (Render free tier waking up).

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript (strict) | Modern React, fast HMR, strict typing across the API boundary |
| Styling | Tailwind CSS v4 | Design tokens via theme, no CSS file proliferation |
| Routing | React Router 7 | SPA routing without Next.js overhead |
| Backend | Express 5 on Node 20+ | A small monolith doesn't need a framework |
| ORM | Prisma 7 | Type-safe queries, schema-first, painless migrations |
| Database | PostgreSQL (Neon serverless in demo, Railway in prod) | Order → OrderItem → Product is naturally relational |
| Auth | Clerk | Hosted; saves writing session/password infrastructure |
| Payments | Stripe Checkout | Hosted = no PCI scope; webhook is the source of truth |
| Email | Nodemailer + hosting-provider SMTP | Transactional volume too low to justify a paid provider |
| Hosting | Vercel (frontend) + Render/Railway (backend) + Neon (DB) | Vercel free tier for the SPA; Render free for demo backend |

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
npm install
cd backend && npm install && cd ..

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

```
.
├── src/                     # Frontend (React + Vite)
│   ├── pages/               # Route components
│   ├── components/          # Reusable UI
│   ├── context/             # Cart, cookie consent
│   └── types.ts             # Shared types
├── backend/
│   ├── index.js             # Boot: env checks, app assembly
│   ├── routes/              # checkout, webhook, orders, products, forms
│   ├── seed.js              # Development seed
│   └── prisma/
│       ├── schema.prisma    # DB single source of truth
│       └── migrations/
├── docs/
│   ├── TEST-PLAN.md         # Pre-launch checklist
│   └── adr/                 # Architectural decision records
├── CONTEXT.md               # Domain glossary, business rules, entity model
├── CLAUDE.md                # AI-assistant project conventions
└── README.md                # This file
```

## Roadmap

Tracked in [GitHub Issues](https://github.com/adrian-imiolo/shop_sznyt_design/issues). Highlights:

- **Pre-launch (p0):** production provisioning, content audits, mobile sweeps, layout-level noindex meta
- **Post-launch (p1):** branded transactional emails, quarterly DN revenue tracker, admin order detail page, GA4
- **Blocked on business registration:** VAT invoice generation, NIP collection, Furgonetka integration

## License & usage

Source is public for portfolio purposes. Do not reuse product imagery, copy, or trademarks. Code patterns may be referenced freely.
