# E2E tests (Playwright)

Real-browser tests of the two critical flows (issue #110, closes #4):

- **Guest checkout** — browse → cart → checkout form → real Stripe test-mode
  hosted checkout (4242 card) → success page; asserts the order row exists and
  stock decremented in the database.
- **Order tracking** — signs in with Clerk **testing tokens** (no UI signup),
  then verifies MyOrders and the order detail page show the user's order.

Local-only by design — **not** wired into CI.

## Running

Prerequisites, once per machine:

- Local Postgres running (same server as the dev `DATABASE_URL`)
- `npx playwright install chromium`

Prerequisite, per session — **the Stripe webhook forwarder must be running**,
on the account matching `backend/.env`:

```bash
stripe listen --forward-to localhost:3000/webhook
```

Without it the guest-checkout test times out on the success page (the order is
only recorded when the `checkout.session.completed` webhook arrives).

Then one command runs everything:

```bash
npm run test:e2e
```

Ports 3000 and 5173 must be free — stop `npm run dev` first
(`reuseExistingServer` is off so the suite can never hit the dev database).

## What the run does

1. Creates the dedicated e2e database if missing (dev database name + `_e2e`
   suffix; override with `E2E_DATABASE_URL`, name must end in `_e2e`),
   applies migrations, truncates orders, reseeds products — every run, so
   assertions like "stock went from 10 to 9" are deterministic and the dev
   database never fills with robot orders.
2. Starts the backend against that database (with `SMTP_HOST` blanked, so no
   real order emails are sent) and the Vite frontend.
3. Provisions a Clerk test user (`e2e+clerk_test@sznytdesign.pl`) with a
   password generated fresh each run via the Clerk Backend API.
4. Runs the specs serially (they share the database).

Failure debugging: traces are kept on failure — `npx playwright show-trace
test-results/<test>/trace.zip`.
