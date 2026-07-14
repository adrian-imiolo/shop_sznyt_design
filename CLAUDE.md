# Sznyt Design — Claude Instructions

## Read this before answering

**You MUST read `CONTEXT.md` before answering any question about this project's domain, business model, terms, entities, lifecycles, rules, or external services. Do not answer from memory. `CONTEXT.md` is the single source of truth for what this business is and how it works.**

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
- E2E: `npm run test:e2e` (requires `stripe listen` running and ports 3000/5173 free; local-only, not in CI — see `e2e/README.md`)

## Git

Commit per meaningful unit (one page, one component, one fix). Conventional commits per global preferences.

## Critical gotchas

- Backend: `npx tsx index.js` — NEVER plain `node`
- Clerk package: `@clerk/react` — NOT `@clerk/clerk-react` or `@clerk/react-router`
- Stripe CLI for dev: `stripe listen --forward-to localhost:3000/webhook`
- Stripe `success_url` uses http in dev — Chrome SSL workaround: navigate manually to `http://localhost:5173/sukces`
- Last page section must NOT use `bg-near-black` (merges with footer)
- TODOs and roadmap: GitHub issues
- Test plan: `docs/TEST-PLAN.md`

## Agent skills

### Issue tracker

GitHub issues in `adrian-imiolo/shop_sznyt_design`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles map 1:1 to label names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` and `docs/adr/` at the repo root (created lazily). See `docs/agents/domain.md`.
