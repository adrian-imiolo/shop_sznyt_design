# Order intake is a plain-data module; routes stay the Stripe adapters

The Stripe webhook handler inlined the project's most load-bearing invariants (atomic stock decrement on `paid`, `stripeSessionId` idempotency, "email failure never 500s a recorded order") in one HTTP closure, making them untestable. We extracted them into a TypeScript order-intake module (`backend/orders/`) that takes **already-fetched plain data** — the webhook route keeps all Stripe I/O (signature verification, `listLineItems`, payment-method retrieval) and normalizes it before delegating. One adapter per external service, mirroring how `backend/emails/sendEmail.ts` is the only nodemailer path.

Decisions and why:

- **Route keeps Stripe I/O.** The intake module's only external dependency is Prisma, so its tests need Postgres but zero Stripe stubbing. The alternative (module takes `stripe` + `event`) makes the deep module depend on two external services and forces fake Stripe clients into every test.
- **Idempotency is a discriminated result, not an exception.** `recordPaidOrder` returns `{ created: true, order }` or `{ created: false, reason: "duplicate" }` (mapped from Prisma P2002 on `stripeSessionId`). Webhook retries are routine, not exceptional; the caller sends order emails only when `created` — which also makes "no duplicate emails on retry" explicit instead of an accident of exception flow.
- **Checkout and webhook extracted together.** Both sides of the line-item contract (`metadata.productId` stamped at checkout, read back in intake; shipping = the productId-less line item) live in one module so the contract is visible and tested in both directions.
- **DB-backed integration tests, split scripts.** The transaction + idempotency semantics are exactly what fakes can't prove, so they're tested against a real Postgres via `TEST_DATABASE_URL`. `npm test` stays the fast infra-free unit suite; the DB suite runs separately.

This is the "backend `index.js` split" initiative referenced in CONTEXT.md's out-of-scope list — business-logic extraction, not a routes/ reorganization.
