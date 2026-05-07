# Sznyt Design — Claude Instructions

## About

Premium e-commerce for designer wooden picture frames. Real production business (sznytdesign.pl). Adrian owns it; Claude Code is the developer.

## Working on this project

- After each task: one-line summary, how to test, what's next
- Always give exact git commands
- Premium production quality — no shortcuts

## Stack & Commands

- Frontend: React + TypeScript + Tailwind CSS v4 (Vite), port 5173
- Backend: Express + Prisma + PostgreSQL, port 3000
- Run backend: `npx tsx index.js` from `backend/` — NOT plain `node`
- Seed: `npx tsx seed.js` from `backend/`
- After Prisma schema change: `npx prisma migrate dev` AND `npx prisma generate`

## Domain glossary

- Paczkomat / InPost: Polish parcel locker network; uses easyPack widget for locker selection
- NIP: Polish tax ID, required for faktura VAT
- Rachunek (receipt) vs. faktura (VAT invoice) — pre-NIP only rachunek
- Regulamin: terms of service (Polish law requirement)
- Furgonetka: shipping label aggregator (blocked on business registration)

## Decisions

- No SSR/Next.js → react-helmet-async for SEO; revisit post-launch
- Auth: Clerk (no custom)
- Custom admin panel (no React Admin)
- Honeypot for spam; reCAPTCHA v3 post-launch if needed

## Git

Commit per meaningful unit (one page, one component, one fix). Conventional commits per global preferences.

## Critical gotchas

- Backend: `npx tsx index.js` — NEVER plain `node`
- Clerk package: `@clerk/react` — NOT `@clerk/clerk-react` or `@clerk/react-router`
- Stripe CLI for dev: `stripe listen --forward-to localhost:3000/webhook`
- Stripe `success_url` uses http in dev — Chrome SSL workaround: navigate manually to `http://localhost:5173/sukces`
- `ADMIN_USER_ID` needed in both `.env` files (with and without `VITE_` prefix)
- Last page section must NOT use `bg-near-black` (merges with footer)
- TODOs and roadmap: GitHub issues
- Test plan: `docs/TEST-PLAN.md`
