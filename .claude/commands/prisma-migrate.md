---
description: Safely run a Prisma migration for sznytdesign — show schema diff first, confirm the migration name, then run migrate dev + generate
argument-hint: [migration-name]
---

Help me run a Prisma migration safely for sznytdesign (Prisma 7 + adapter-pg).

Steps:
1. Show me the current schema diff — what changed since the last migration? (`cd backend && npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-migrations prisma/migrations`)
2. If the diff looks empty or wrong, stop and ask me
3. If I passed a migration name as $ARGUMENTS, use it. Otherwise ask me for a kebab-case name that describes the change (e.g. `add-shipping-tracking-url`)
4. Run: `cd backend && npx prisma migrate dev --name <name>`
5. After success, run: `cd backend && npx prisma generate` (required on Prisma 7 to regenerate client in `generated/prisma/`)
6. Report success or the exact error

Safety rules:
- Never run `prisma migrate reset` without explicit confirmation — it destroys data
- Never run `prisma db push` in this shop — we use migrations, not push
- Never run migrations against a prod `DATABASE_URL` from here — only local dev DB
- If the diff includes `DROP TABLE` or `DROP COLUMN` or `NOT NULL` on existing rows, flag it explicitly before proceeding
