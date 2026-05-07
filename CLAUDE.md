# Sznyt Design — Claude Instructions

## About

Premium e-commerce shop for designer wooden picture frames. Real production business (sznytdesign.pl). Adrian is the business owner — Claude Code acts as the developer.

## Working on this project

- After each task: one-line summary, how to test, what's next
- Always provide exact git commands
- Real production business — premium quality, no shortcuts

## Stack & Commands

- **Frontend**: React + TypeScript + Tailwind CSS v4 (Vite), port 5173
- **Backend**: Express + Prisma + PostgreSQL, port 3000
- **Run backend**: `npx tsx index.js` from `backend/` — NOT plain `node`
- **Seed database**: `npx tsx seed.js` from `backend/`
- After Prisma schema changes: run both `npx prisma migrate dev` AND `npx prisma generate`

## Routes

`/` Home | `/sklep` Shop listing | `/sklep/:id` ProductDetail | `/o-nas` About | `/kontakt` Contact | `/koszyk` Cart → Stripe checkout | `/sukces` OrderSuccess | `/moje-zamowienia` MyOrders (protected) | `/moje-zamowienia/:id` OrderDetail | `/regulamin` | `/polityka-prywatnosci` | `/zwroty` (Zwrot + Reklamacja forms) | `/faq` (accordion) | `/admin` AdminProducts | `/admin/produkty/nowy` | `/admin/produkty/:id` | `/admin/zamowienia` AdminOrders

Shop routes use `ShopLayout` with `<Outlet />`; admin routes sit outside it. `ScrollOnNav` scrolls to top on route change.

## Database (Prisma)

- **Product**: id, name, tagline, description, price, imageUrl, lifestyleImageUrl, stock, sortOrder, createdAt
- **Order**: id, stripeSessionId, status, total, createdAt, customerEmail, userId (optional — guest checkout), shippingMethod, shippingAddress (JSON), paymentMethod, fulfillmentStatus (`received` → `processing` → `shipped` → `delivered`), trackingNumber
- **OrderItem**: id, quantity, price (snapshot), orderId, productId
- Seed resets auto-increment to 1; 2 products seeded

## Design tokens

- Backgrounds: `bg-warm-white`, `bg-near-black` | Text: `text-near-black`, `text-secondary-text`, `text-accent` (gold) | Border: `border-borders`
- Headings: `font-cormorant font-light` | Body: `font-dm-sans`
- Eyebrow labels: `font-dm-sans text-xs text-accent tracking-[0.3em] uppercase`
- Dynamic values (e.g. background-image URLs) use inline `style={}`, not Tailwind classes

## Key code patterns

- Image hover: two `absolute inset-0` divs, opacity transition on `hovered` state
- Controlled forms with `e.preventDefault()`, null guard `if (!product) return <p>Ładowanie...</p>`
- `useParams()` returns strings → `Number(id)` for API calls
- Modal: `{isOpen && <><div overlay z-10 /><div modal z-20 /></>}`, centered with `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`
- Active nav: `NavLink` + `isActive ? "text-accent" : "text-near-black hover:text-accent"`
- Last page section must NOT be `bg-near-black` (merges with footer) → use `bg-warm-white border-t border-borders`

## Shared types (`src/types.ts`)

All components import from here: `Product`, `Order`, `AdminOrder`, `OrderItem`, `CartItem`, `CourierAddress`, `PaczkomatPoint`

## Auth (Clerk)

- Package: `@clerk/react` — NOT `@clerk/clerk-react` or `@clerk/react-router`
- `ClerkProvider` in `main.tsx`, Polish localization via `plPL` from `@clerk/localizations`
- Frontend: `VITE_CLERK_PUBLISHABLE_KEY` in root `.env`
- Backend: both `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` in `backend/.env`
- `ADMIN_USER_ID` in both `.env` files (with/without `VITE_` prefix)

## Shipping & Payments

- 3 methods: InPost Paczkomat (20 PLN), InPost Kurier (25 PLN), DPD Kurier (25 PLN); free above 350 PLN
- Paczkomat opens easyPack widget for locker selection
- Stripe hosted checkout; webhook handles `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
- Stripe supports BLIK, Przelewy24, cards in PL

## Hosting plan

Frontend → Vercel | Backend + DB → Railway | Domain + email → cyberfolks.pl | Nodemailer SMTP credentials needed in `backend/.env`

## Decisions (short)

- No SSR/Next.js — react-helmet-async for SEO; revisit post-launch
- No custom auth — Clerk
- No React Admin — custom admin panel
- Furgonetka for shipping labels — blocked on business registration (NIP)
- Honeypot spam protection on forms; reCAPTCHA v3 post-launch if needed

## Git workflow

Commit after every meaningful unit (one page, one component, one fix). Conventional commits format per global preferences.

## IMPORTANT reminders

- Backend: `npx tsx index.js` — NEVER plain `node`
- Clerk package: `@clerk/react` — nothing else
- Stripe CLI for dev: `stripe listen --forward-to localhost:3000/webhook`
- Stripe success_url uses http in dev — Chrome SSL error workaround: navigate manually to `http://localhost:5173/sukces`
- TODOs and roadmap: GitHub issues
- For test plan see `docs/TEST-PLAN.md`
