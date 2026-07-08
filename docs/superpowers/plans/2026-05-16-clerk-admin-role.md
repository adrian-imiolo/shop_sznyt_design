# Clerk `publicMetadata.role` admin migration — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `ADMIN_USER_ID` / `VITE_ADMIN_USER_ID` env-based admin check with a Clerk `publicMetadata.role === "admin"` check on both backend and frontend, and remove every reference to the old env vars from code, env templates, and docs.

**Architecture:** Backend reads the role from Clerk session claims via a one-time JWT-template customization (`sessionClaims.metadata.role`). Frontend reads it from `useUser().user.publicMetadata.role` through a small `useIsAdmin()` hook that returns `{ isAdmin, isLoaded }` and that `AdminGuard` consumes. Single-role named wrappers (`requireAdmin`, `useIsAdmin`) sit on top of trivial role-reading helpers — adding a second role later is a one-place change per surface.

**Tech Stack:** Express + `@clerk/express` 2.x (backend, ESM, `tsx` runtime — no compile step). React 19 + `@clerk/react` 6.x + TypeScript + Vite (frontend). No test framework wired (per PRD #19 §Testing, M1 is covered by manual verification).

**Spec:** `docs/superpowers/specs/2026-05-16-clerk-admin-role-design.md`
**Issue:** [#21](https://github.com/adrian-imiolo/shop_sznyt_design/issues/21)
**Parent PRD:** [#19](https://github.com/adrian-imiolo/shop_sznyt_design/issues/19) §M1
**Branch:** `chore/21/clerk-admin-role`

---

## Pre-flight (one-time ops, not code — done by Adrian before merging)

These two steps must be done on the **dev** Clerk instance before manual verification (Task 4). They do not block code Tasks 1–3.

1. Clerk Dashboard → Sessions → Customize session token → add the claim:
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```
   Save. Existing dev sessions auto-refresh within ~1 minute.
2. Clerk Dashboard → Users → (your dev user) → Public metadata → set:
   ```json
   { "role": "admin" }
   ```
   Save.

The same two steps repeat on the **production** Clerk instance at cutover for both Adrian's prod user and the wife's. That is a cutover-runbook item (PRD #19 §M7), not part of this PR.

---

## File structure

| File | Action | Responsibility |
| --- | --- | --- |
| `backend/index.js` | Modify (lines 49–55) | Replace env-based `requireAdmin` with role-based; add `getRole(req)` helper |
| `backend/.env.example` | Modify (delete line 11) | Drop dead `ADMIN_USER_ID` template entry |
| `src/hooks/useIsAdmin.ts` | Create | Single-source hook for `{ isAdmin, isLoaded }` |
| `src/components/AdminGuard.tsx` | Rewrite | Consume `useIsAdmin`; drop env read; preserve no-flicker behavior |
| `.env.example` | Modify (delete line 3) | Drop dead `VITE_ADMIN_USER_ID` template entry |
| `CLAUDE.md` | Modify (delete line 35) | Drop stale "needed in both .env files" gotcha |
| `CONTEXT.md` | Modify (delete line 64) | Drop stale "Legacy (pre-cutover)" bullet |
| `.claude/commands/launch-check.md` | Modify (line 22) | Remove `ADMIN_USER_ID` from required-keys list |

The first three tasks each ship as one commit. Task 4 is manual verification — no commit.

---

## Task 1: Backend — switch `requireAdmin` to Clerk role check

**Files:**
- Modify: `backend/index.js` (lines 49–55)
- Modify: `backend/.env.example` (line 11)

- [ ] **Step 1: Read the current middleware to confirm the exact block**

Run: open `backend/index.js` and locate the existing function. It should match:

```js
function requireAdmin(req, res, next) {
  const { userId } = getAuth(req);
  if (userId !== process.env.ADMIN_USER_ID) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
```

If the block has drifted (e.g., line numbers shifted), search for `process.env.ADMIN_USER_ID` in `backend/index.js` to find the only occurrence. There must be exactly one match — abort if there are more.

- [ ] **Step 2: Replace the block with the role-based version**

Replace the entire `function requireAdmin(...)` block (5 body lines plus the function signature, lines 49–55 of the original file) with:

```js
function getRole(req) {
  const { sessionClaims } = getAuth(req);
  return sessionClaims?.metadata?.role ?? null;
}

function requireAdmin(req, res, next) {
  if (getRole(req) !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
```

The `getAuth` import (`backend/index.js:10`) stays — `getRole` uses it. The `userId` destructure is gone because the new middleware doesn't need it.

- [ ] **Step 3: Verify no other `ADMIN_USER_ID` references remain in backend code**

Run (from repo root):

```bash
grep -n "ADMIN_USER_ID" backend/index.js
```

Expected: no output. If anything matches, that's an unexpected residual reference — investigate before continuing.

- [ ] **Step 4: Verify the backend boots cleanly**

Run (from repo root):

```bash
npm run dev:backend
```

Expected: the server logs its usual startup line (Express listening on `:3000`) with no exceptions. Once you see it boot cleanly, Ctrl+C. This catches parse errors, import errors, and Clerk-middleware setup failures.

(A full `npm run dev` works too — it just also starts Vite, which you don't need for this code-only sanity check.)

- [ ] **Step 5: Remove the dead env-var entry from `backend/.env.example`**

Open `backend/.env.example`. Find line 11:

```
ADMIN_USER_ID=your_clerk_user_id_here
```

Delete that entire line. The surrounding lines (10: `CLERK_SECRET_KEY=...` and 12: blank line before `SMTP_HOST`) stay.

- [ ] **Step 6: Confirm the example file is clean**

Run:

```bash
grep -n "ADMIN_USER_ID" backend/.env.example
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add backend/index.js backend/.env.example
git commit -m "refactor(auth): switch backend requireAdmin to Clerk publicMetadata.role

Reads role from sessionClaims.metadata.role (requires Clerk session
token to include publicMetadata — configured in Clerk dashboard).
getRole() helper centralizes the role read for future multi-role use.
The 6 mounted route guards (DELETE/PUT/PATCH/POST /products, GET
/orders, PATCH /orders/:id/fulfillment) are unchanged — only the
middleware body changes.

Drops ADMIN_USER_ID from backend/.env.example as a dead reference.

Refs #21"
```

---

## Task 2: Frontend — add `useIsAdmin` hook and refactor `AdminGuard`

**Files:**
- Create: `src/hooks/useIsAdmin.ts`
- Modify: `src/components/AdminGuard.tsx` (full rewrite of 16-line file)
- Modify: `.env.example` (line 3)

- [ ] **Step 1: Create the hook file**

The `src/hooks/` directory does not exist yet — create it as part of writing the file.

Write `src/hooks/useIsAdmin.ts` with exactly this content:

```ts
import { useUser } from "@clerk/react";

export function useIsAdmin(): { isAdmin: boolean; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  return { isAdmin, isLoaded };
}
```

Notes for the implementer:
- `@clerk/react` is the correct package — NOT `@clerk/clerk-react` or `@clerk/react-router` (per project gotcha in `CLAUDE.md`).
- `publicMetadata` is typed by Clerk as `UserPublicMetadata` (defaults to `{}`); reading `.role` works without module augmentation.
- The optional chain handles both unloaded (`user` is `null`) and signed-out states.

- [ ] **Step 2: Rewrite `src/components/AdminGuard.tsx`**

The current file (16 lines) compares `userId` to `import.meta.env.VITE_ADMIN_USER_ID`. Replace the entire file contents with:

```tsx
import { useIsAdmin } from "../hooks/useIsAdmin";
import { Navigate } from "react-router-dom";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoaded } = useIsAdmin();
  if (!isLoaded) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default AdminGuard;
```

The `useAuth` import is gone (the hook handles the loaded/user reads). The `VITE_ADMIN_USER_ID` env read is gone. The `return null` while-loading branch is preserved — that's the no-flicker behavior callers expect.

- [ ] **Step 3: Verify the import path resolves and the build succeeds**

Run (from repo root):

```bash
npm run build
```

Expected: TypeScript compile (`tsc -b`) and Vite build both succeed with no errors. The TS compile catches: missing import paths, type mismatches on the hook return shape, JSX in `.tsx` correctness.

If `tsc -b` complains about strict-null on `user?.publicMetadata?.role`, the existing project tsconfig is already strict-mode-friendly with this pattern (it's a chained optional read against an `unknown`-default type — `=== "admin"` narrows to boolean). Investigate any error rather than weakening the type.

- [ ] **Step 4: Verify no other `VITE_ADMIN_USER_ID` references remain in frontend code**

Run:

```bash
grep -rn "VITE_ADMIN_USER_ID" src/
```

Expected: no output.

- [ ] **Step 5: Remove the dead env-var entry from `.env.example`**

Open `.env.example` (repo root). Find line 3:

```
VITE_ADMIN_USER_ID=your_clerk_user_id_here
```

Delete that line. The file becomes:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 6: Confirm the example file is clean**

Run:

```bash
grep -n "VITE_ADMIN_USER_ID" .env.example
```

Expected: no output.

- [ ] **Step 7: Lint check**

Run:

```bash
npm run lint
```

Expected: no errors. (Project uses flat-config ESLint with the React hooks plugin — a new hook starting with `use` and a single `useUser` call inside is rules-of-hooks compliant.)

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useIsAdmin.ts src/components/AdminGuard.tsx .env.example
git commit -m "refactor(auth): add useIsAdmin hook; switch AdminGuard to Clerk publicMetadata.role

useIsAdmin() wraps useUser() and returns { isAdmin, isLoaded } so
AdminGuard can preserve its render-null-until-loaded behavior. Single
source of truth for isAdmin on the frontend — a future role check
(e.g. fulfillment) becomes one new hook in src/hooks/.

Drops VITE_ADMIN_USER_ID from .env.example as a dead reference.

Refs #21"
```

---

## Task 3: Documentation cleanup

**Files:**
- Modify: `CLAUDE.md` (delete one bullet on or around line 35)
- Modify: `CONTEXT.md` (delete one bullet on or around line 64)
- Modify: `.claude/commands/launch-check.md` (remove one item from the list on line 22)

- [ ] **Step 1: Update `CLAUDE.md` — remove the env-var gotcha**

Open `CLAUDE.md`. Find the bullet (currently at line 35, in the "Critical gotchas" section):

```
- `ADMIN_USER_ID` needed in both `.env` files (with and without `VITE_` prefix)
```

Delete that entire line. The bullets immediately above and below it (`- Stripe success_url uses http in dev — Chrome SSL workaround: navigate manually to http://localhost:5173/sukces` and `- Last page section must NOT use bg-near-black (merges with footer)`) stay.

- [ ] **Step 2: Update `CONTEXT.md` — remove the legacy bullet**

Open `CONTEXT.md`. Find the bullet (currently at line 64, in the "Auth & roles" section):

```
- **Legacy (pre-cutover):** hardcoded `ADMIN_USER_ID` env var. Being phased out by the soft-launch PRD.
```

Delete that entire line. The bullets immediately above it (the "Admin role" description and "Two admins" bullet) already describe the post-cutover state accurately — no edits needed there.

- [ ] **Step 3: Update `.claude/commands/launch-check.md` — drop the env-var key**

Open `.claude/commands/launch-check.md`. Find line 22:

```
- `.env` has all required keys (`CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, SMTP creds, `FRONTEND_URL`, `ADMIN_USER_ID`)
```

Replace with:

```
- `.env` has all required keys (`CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, SMTP creds, `FRONTEND_URL`)
```

(Removed the trailing `, `ADMIN_USER_ID``.)

- [ ] **Step 4: Confirm no `ADMIN_USER_ID` or `VITE_ADMIN_USER_ID` references survive anywhere**

Run (from repo root):

```bash
grep -rn -E "ADMIN_USER_ID|VITE_ADMIN_USER_ID" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=generated \
  --exclude-dir=docs/superpowers
```

Expected: no output. If anything matches, address it before committing — the migration leaves no orphaned references in tracked code/config/docs.

The exclusions:
- `node_modules`, `.git`, and `backend/generated/` are noise.
- `docs/superpowers/` (spec + this plan) is excluded by design — those docs describe what was migrated *away from* and necessarily reference the old env-var name.

(Untracked local `.env` files may still contain the variables — they are not searched here and are not touched by this PR. Adrian removes those two lines manually after merge.)

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md CONTEXT.md .claude/commands/launch-check.md
git commit -m "docs: remove stale ADMIN_USER_ID references after Clerk role migration

CLAUDE.md gotcha, CONTEXT.md \"Legacy (pre-cutover)\" bullet, and
launch-check's required-keys list all referenced an env var that no
longer exists after this PR. Updated to describe the post-migration
state.

Refs #21"
```

---

## Task 4: Manual verification (no commit)

Per PRD #19 §Testing, M1 is covered by manual verification — no unit tests in scope.

Pre-flight ops (Clerk dashboard session-token + dev user `publicMetadata.role`) must be complete before this task runs. See "Pre-flight" at the top of this plan.

Start both processes (from repo root):

```bash
npm run dev
```

(Spins up Vite on `:5173` and the backend on `:3000` via `concurrently`.)

For the backend admin endpoint check (Step 3 below), grab a Clerk JWT from the browser dev tools while signed in (Application → Cookies → `__session`).

- [ ] **Step 1: Admin happy path**

Sign in as the dev Clerk user with `publicMetadata.role = "admin"`. Visit `http://localhost:5173/admin` — the products page renders. From `/admin/zamowienia`, mark any order shipped (`PATCH /orders/:id/fulfillment` from the UI) — succeeds with no 403.

- [ ] **Step 2: Non-admin frontend redirect**

Sign in (in a new browser profile or incognito window) as a second dev Clerk user with no `publicMetadata.role`. Visit `/admin` — the page redirects to `/` (home). The `AdminGuard`'s `Navigate to="/"` fires.

- [ ] **Step 3: Non-admin backend 403**

While signed in as the non-admin user, hit a backend admin endpoint directly. Easiest: open dev tools → Console on the running app and run:

```js
const token = (await window.Clerk.session.getToken());
const res = await fetch("http://localhost:3000/products/SOME_PRODUCT_ID", {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
console.log(res.status, await res.text());
```

Expected: `403 {"error":"Forbidden"}`. (Replace `SOME_PRODUCT_ID` with any valid product id from `/sklep` — the id doesn't matter because the 403 fires before the handler runs.)

- [ ] **Step 4: Signed-out frontend**

Sign out. Visit `/admin`. `AdminGuard` returns `null` briefly while `isLoaded === false`, then `<Navigate to="/" replace />` runs. End state: `/` is shown.

- [ ] **Step 5: Signed-out backend**

Hit `DELETE /products/SOME_PRODUCT_ID` with no `Authorization` header (use Postman or `curl`):

```bash
curl -i -X DELETE http://localhost:3000/products/SOME_PRODUCT_ID
```

Expected: `401` from `requireAuth()` (this is unchanged Clerk behavior, but worth re-confirming the order — `requireAuth()` fires before `requireAdmin`).

- [ ] **Step 6: JWT misconfig sanity check**

Temporarily remove the `metadata` claim from the dev Clerk Session-token customization (Clerk Dashboard → Sessions → Customize session token → delete the claim → save). Sign in fresh (or wait ~1 min for the existing session JWT to refresh, then reload `/admin`).

Expected: admin user is now redirected from `/admin` (frontend still sees `user.publicMetadata.role` because `useUser()` doesn't use the JWT claim, but the **backend** 403s any admin endpoint). Hitting `DELETE /products/SOME_PRODUCT_ID` returns `403`. This confirms the backend's "if the claim is missing, deny" loud-fail behavior.

Restore the claim (`"metadata": "{{user.public_metadata}}"`) and re-verify Step 1 still passes.

- [ ] **Step 7: Push the branch and open a PR**

After all six checks pass:

```bash
git push -u origin chore/21/clerk-admin-role
```

Then open a PR (via `gh pr create`). Body should include:

- A reference to the spec (`docs/superpowers/specs/2026-05-16-clerk-admin-role-design.md`) and `Closes #21`.
- The "Pre-flight" section reproduced verbatim, retitled "Production cutover ops (post-merge)" — same two Clerk dashboard steps need to happen on the prod Clerk instance at cutover for both Adrian's and the wife's users.
- A checklist mirroring Task 4 Steps 1–6 as the test plan.

(The `managing-git` skill governs PR conventions — squash merge, delete branch after merge, link `Closes #21`.)

---

## Post-merge follow-up (out of plan scope, captured for completeness)

- Adrian deletes `ADMIN_USER_ID` from `backend/.env` and `VITE_ADMIN_USER_ID` from `.env` (local untracked files). After deletion the lines have no readers — purely tidiness.
- At production cutover (PRD #19 §M7): repeat the two Pre-flight Clerk steps on the **prod** Clerk instance, once for Adrian's prod user and once for the wife's. Then re-run Task 4 Steps 1–3 against the production app.
