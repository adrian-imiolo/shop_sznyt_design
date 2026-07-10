---
name: verify
description: How to launch and drive sznytdesign for runtime verification — dev servers, checkout flow, evidence points.
---

# Verifying sznytdesign changes at runtime

## Launch

- `npm run dev` from the repo root — concurrently starts vite (5173) and the backend (`nodemon --exec tsx index.js`, port 3000). Backend env comes from `backend/.env`; without `STRIPE_SECRET_KEY` it runs in demo mode and checkout 503s.
- Port 3000 taken → the backend now exits with "Port 3000 is already in use" (issue #42 fix). Kill the squatter: `Get-NetTCPConnection -LocalPort 3000 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`. Note: killing an `npx.cmd` wrapper PID does NOT kill the child node process — kill by port.
- After changing workspace/package.json layout, a stale `backend/node_modules` can break **POSTs only** (`iconv-lite` missing `encodings`; GETs still work). Fix: remove `backend/node_modules`, `npm install` from root.

## Drive the checkout flow (chrome-devtools MCP)

1. `/sklep` → product page → add to cart (cart persists in localStorage, badge in nav).
2. `/koszyk`: button "Przejdź do płatności" must be disabled until: shipping method chosen, paczkomat point picked (iff paczkomat), all 7 address fields non-empty, regulamin checked.
3. The easyPack widget works headlessly against the live InPost API: click "Wybierz paczkomat" → click a `parcel_locker.svg` marker image in the snapshot → click "Wybierz" in the popup.
4. Valid data + submit → POST `localhost:3000/create-checkout-session` → redirect to `checkout.stripe.com` (sandbox badge "Piaskownica"). Inspect the request body via `get_network_request` — the `shippingAddress` JSON is the contract to eyeball (flat, 7 fields, `code`/`name` iff paczkomat).
5. Don't pay unless webhook-side changes are under test; that needs `stripe listen --forward-to localhost:3000/webhook` (see the stripe-test skill) and the CLI account must match the key in `.env` (mismatch = webhook 500).

## Evidence points

- Format errors render under fields (e.g. "Podaj poprawny adres e-mail") and block the POST entirely — check the network list stays clean.
- Stripe page shows line items priced from the DB plus "Dostawa — <label>" line; email prefilled from the shipping address.
