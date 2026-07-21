# Runbook: Database migrations in production

Who this is for: **the developer** (Adrian / Claude Code).
When to use it: any time a change touches `backend/prisma/schema.prisma` and will reach a deployed environment.

The short version: **you never run a migration against production by hand.** The host runs it for you at build time. Your job is to make sure the migration that gets deployed is one you already proved safe locally.

Hosting note: the demo backend runs on Render (`render.yaml`); real production moves to Railway at launch. Both run the same `npm run build`, so everything below applies unchanged — substitute your host's name for "Render".

---

## The one rule

| Environment | Command | Who runs it |
|---|---|---|
| Local dev | `npx prisma migrate dev` | You |
| Any deployed env | `npx prisma migrate deploy` | the host, via `npm run build` |

`migrate dev` is a **development-only** command. It compares the schema to the database and, when it can't reconcile them, **offers to reset the database — dropping every table**. Against production that is unrecoverable data loss: real orders, real customers, real money already taken.

`migrate deploy` applies pending migration files and nothing else. It never resets, never prompts, never generates a new migration. It's already wired into `backend/package.json` (`"build": "prisma generate && prisma migrate deploy"`), which `render.yaml` runs as the build command.

**So: never run `migrate dev` with `DATABASE_URL` pointing at a deployed database.** The realistic way this goes wrong is not a typo in the command — it's a `.env` still holding a Neon connection string from a debugging session. Check `DATABASE_URL` before you run anything.

---

## Normal flow: shipping a schema change

1. **Locally**, edit `backend/prisma/schema.prisma`, then from `backend/`:
   ```bash
   npx prisma migrate dev --name descriptive_name
   npx prisma generate
   ```
   This writes a new folder under `backend/prisma/migrations/`.
2. **Commit the migration folder.** It is the deployable artifact — a schema change without its migration file deploys as a broken app (the client expects columns the database doesn't have).
3. **Review the generated SQL** before pushing. Open the new `migration.sql` and read it. See the destructive-change checklist below.
4. Push / merge to `main`. Render redeploys, `npm run build` runs `migrate deploy`, the migration applies.
5. **Verify** in Neon's SQL Editor that the table looks right, and that the site still loads.

There is no manual step against the production database in this flow. If you find yourself opening a SQL console to make a schema change, stop — that drift will break the next `migrate deploy`.

## Before you commit: destructive-change checklist

Read the generated `migration.sql` and look for:

- `DROP TABLE` / `DROP COLUMN` — the data in it is gone permanently. Is it referenced anywhere in `backend/` or `src/`?
- `ALTER COLUMN ... SET NOT NULL` on an existing table — fails outright if any existing row has a NULL there. Add the column nullable, backfill, then tighten in a second migration.
- Adding a required column without a default — same failure.
- Renames — Prisma usually emits drop + create, which **loses the data**. If you want a true rename, hand-edit the SQL to `ALTER TABLE ... RENAME COLUMN`.
- Anything touching `Order` or `OrderItem` — these hold financial records for orders customers already paid for. Treat as append-only: add columns, don't reshape.

A failed migration on Render fails the **build**, so the old version keeps serving — that's the good outcome. A migration that *succeeds* but drops data is the bad one, and only the review above catches it.

## Never seed production

`backend/seed.js` starts with `prisma.product.deleteMany()` — it wipes the product table by design, because its job is to reset local dev to a known state.

Against production that deletes the live catalogue, and depending on FK constraints either fails halfway or takes order history with it. **`npm run seed` has no legitimate production use.** Products in production are created through the admin panel (`/admin/produkty/nowy`).

The demo environment is the one exception, and only because it holds nothing real — its one-off seeding is done through Neon's SQL Editor (`docs/DEPLOY-DEMO.md`), not this script.

## Backups

Both Neon and Railway offer point-in-time restore, with the retention window depending on the plan — **check the actual window on your plan before you rely on it**, don't assume. PITR covers "the migration was wrong, rewind an hour". It does **not** cover noticing the mistake three weeks later.

So before any migration that drops or reshapes a column holding order data, take an explicit snapshot first — on Neon, dashboard → **Branches** → branch from the current state (cheap, copy-on-write); on Railway, a manual backup or `pg_dump`. That snapshot is the difference between a bad afternoon and a lost order history.

## If a migration fails on deploy

1. The build fails and the previous deploy keeps serving. Nothing is down. Don't rush.
2. Read the build log — Prisma names the failing migration and the SQL error.
3. Prisma marks the migration as failed in the `_prisma_migrations` table; **later deploys will keep failing** until it's resolved, even after you fix the code.
4. Fix forward: correct the migration locally, verify against a local database, commit, redeploy. Avoid editing an already-applied migration file — write a new one.
5. If the migration partially applied and left the schema inconsistent, restoring the Neon branch you took beforehand is the fastest way out.

## Going live: environment separation

Production is a *deployment target*, not a git branch — same `main`, different env vars (see the discussion in `CONTEXT.md`). What must differ from the demo:

- `DATABASE_URL` — its own Neon project. Never point two environments at one database.
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — live mode, with a webhook endpoint registered against the production URL.
- Clerk — production instance, which needs its own session-token customization and its own admin user (`docs/DEPLOY-DEMO.md` § 2).
- `SMTP_*` — set, so order emails actually send (unset means skipped-and-logged).

## Related

- Schema: `backend/prisma/schema.prisma`; migrations: `backend/prisma/migrations/`
- Build wiring: `backend/package.json` (`build` script), `render.yaml`
- Local migration helper: the `prisma-migrate` skill (shows the diff and confirms the name before running)
- Demo deploy: `docs/DEPLOY-DEMO.md`
- Refunds and order-data handling: `docs/runbooks/refunds.md`
