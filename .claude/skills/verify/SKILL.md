---
name: verify
description: How to launch and drive this app for runtime verification — dev stack, browser driving, cart/localStorage gotchas.
---

# Verifying sznyt_design at runtime

## Launch

```bash
npm run dev   # concurrently: vite frontend :5173 + backend :3000 (needs local Postgres up)
```

Readiness probes:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/   # 200
curl -s http://localhost:3000/products                          # JSON product list
```

Products come from the backend — seeded DB required (`npx tsx seed.js` from `backend/` if empty).

## Drive

Use the chrome-devtools MCP tools. Open pages with `isolatedContext: "<task-name>"` so cookies/localStorage don't bleed between verification tasks.

Useful routes: `/sklep` (list), `/sklep/:id` (product), `/koszyk` (cart), `/kasa` (checkout), `/admin` (needs Clerk admin login — hard headless; verify around it).

## Gotchas

- Cart persistence is gated on cookie consent: click "Akceptuj" on the banner first, else `localStorage.cart` is never written.
- Cart state lives in `localStorage.cart` — inspect/seed it directly with `evaluate_script` for load-time scenarios, then reload.
- Same-tick UI races (double-click bugs) reproduce via `evaluate_script` calling `btn.click()` twice in one function — MCP click roundtrips are too slow to race React renders.
- Stripe flows need `stripe listen --forward-to localhost:3000/webhook` and the account matching `.env` keys (see memory: account mismatch → webhook 500).
