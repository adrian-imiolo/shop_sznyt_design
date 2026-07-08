# Clerk `publicMetadata.role` admin migration — design

**Issue:** [#21](https://github.com/adrian-imiolo/shop_sznyt_design/issues/21) — `chore: migrate admin access to Clerk publicMetadata.role`
**Parent PRD:** [#19](https://github.com/adrian-imiolo/shop_sznyt_design/issues/19) §M1
**Branch:** `chore/21/clerk-admin-role`
**Date:** 2026-05-16

## Context

Admin access today is gated by a hardcoded Clerk user id stored in two env vars:

- `backend/index.js:49–55` — `requireAdmin` middleware compares `getAuth(req).userId === process.env.ADMIN_USER_ID`. Mounted on 6 routes: `DELETE /products/:id`, `PUT /products/:id`, `PATCH /products/reorder`, `POST /products`, `GET /orders`, `PATCH /orders/:id/fulfillment`.
- `src/components/AdminGuard.tsx:9` — frontend route guard compares `userId === import.meta.env.VITE_ADMIN_USER_ID`. Mounted once in `App.tsx:46`, gating the whole `/admin/**` subtree.

This blocks two soft-launch goals: (a) wife needs her own admin login without sharing credentials, (b) adding a future role (e.g. "fulfillment") shouldn't require touching unrelated files. The fix is a single role check (`publicMetadata.role === "admin"`) read consistently on both surfaces.

## Decisions

1. **Backend reads the role from Clerk session claims**, not from a per-request `clerkClient.users.getUser()` lookup. Requires customizing the Clerk session token to include `publicMetadata` (one dashboard step per Clerk instance). Trade-off: one-time config in exchange for zero extra latency on every admin call.
2. **Frontend hook `useIsAdmin()` returns `{ isAdmin: boolean; isLoaded: boolean }`** (not bare `boolean`). Mirrors Clerk's own hook shape and lets `AdminGuard` keep its current "render `null` until loaded" no-flicker behavior.
3. **Named single-role wrappers (`requireAdmin`, `useIsAdmin`) over a small `getRole` helper** — not a generic `requireRole("admin")` / `useHasRole("admin")` factory. Call sites stay self-documenting; the helper is the single source of truth. Refactor to a factory when a second role lands, not before.
4. **Full cleanup in this PR.** Beyond the files issue #21 names, also remove `ADMIN_USER_ID` from `.claude/commands/launch-check.md` and delete the "Legacy (pre-cutover)" bullet from `CONTEXT.md` — both go stale the moment this PR merges.
5. **Clean cut, no dev fallback.** No `NODE_ENV !== "production"` branch that accepts the old env var. The dev Clerk instance gets configured before the PR merges; the prod Clerk instance gets configured at cutover (per PRD #19 M7).

## Backend changes

In `backend/index.js`, add a role-reading helper and rewrite `requireAdmin`. No file split, no new modules — PRD §Cross-cutting forbids restructuring `index.js`.

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

- `getRole` is the role single-source-of-truth on the backend. When a second role lands, it's reused.
- The 6 `requireAuth(), requireAdmin` route mountings (lines 214, 226, 242, 257, 362, 375 in the current `index.js`) stay untouched. `requireAuth()` still 401s anonymous calls; `requireAdmin` now 403s non-admins.
- The `process.env.ADMIN_USER_ID` reference is removed entirely.

The session-claim path (`sessionClaims.metadata.role`) depends on the Clerk dashboard config in "Ops steps" below. Without that, `sessionClaims.metadata` is `undefined` and every admin route 403s — intended loud-fail behavior.

## Frontend changes

New file `src/hooks/useIsAdmin.ts`:

```ts
import { useUser } from "@clerk/react";

export function useIsAdmin(): { isAdmin: boolean; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  return { isAdmin, isLoaded };
}
```

- Wraps `useUser()` (not `useAuth()`) — `publicMetadata` lives on the `User` object, not the session token. No JWT customization needed on the frontend; `@clerk/react` exposes `publicMetadata` directly via its API.
- `user` is `null` while loading or signed out — the optional chain handles both.
- `publicMetadata` is typed by Clerk as `UserPublicMetadata` (defaults to `{}`). Reading `.role` works without module augmentation; declaring a typed `UserPublicMetadata` shape is a separate change if it ever becomes worth the typing investment.

`src/components/AdminGuard.tsx` is rewritten to consume the hook and preserve the no-flicker behavior:

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

The `useAuth` import and the `VITE_ADMIN_USER_ID` env read are removed. `App.tsx:46` mounting (`<AdminGuard><AdminLayout/></AdminGuard>`) does not change.

## Cleanup

| File | Change |
| --- | --- |
| `.env.example` | Delete `VITE_ADMIN_USER_ID=...` (line 3) |
| `backend/.env.example` | Delete `ADMIN_USER_ID=...` (line 11) |
| `CLAUDE.md` | Delete the gotcha line `` `ADMIN_USER_ID` needed in both `.env` files (with and without `VITE_` prefix) `` (line 35) |
| `.claude/commands/launch-check.md` | Remove `ADMIN_USER_ID` from the required-keys list on line 22 |
| `CONTEXT.md` | Delete the bullet `**Legacy (pre-cutover):** hardcoded ADMIN_USER_ID env var. Being phased out by the soft-launch PRD.` (line 64). The remaining bullets in §Auth & roles still describe the post-cutover state accurately. |

Local `.env` files (untracked) are not touched by the PR — Adrian removes the two dead lines manually after merge. Per global preferences, the assistant never touches `.env`.

## Ops steps (not code)

Pre-merge, on the **dev** Clerk instance:

1. Clerk dashboard → Sessions → Customize session token → add the claim `"metadata": "{{user.public_metadata}}"`.
2. The dev Clerk user used for testing → Public metadata → set `{ "role": "admin" }`.
3. Verify on the feature branch per "Verification" below.

The same two Clerk steps repeat on the **production** Clerk instance at cutover — once for Adrian's prod user and once for the wife's. That repetition is a cutover-runbook entry (PRD #19 M7), not part of this PR.

## Verification

Manual, per issue #21 acceptance criteria and PRD §Testing (M1 covered by manual plan, no unit tests).

On the feature branch, dev Clerk, after the two ops steps:

1. **Admin happy path.** Sign in as the dev Clerk user with `role = "admin"`. Visit `/admin` — products page renders. Mark an order shipped via `AdminOrders` — `PATCH /orders/:id/fulfillment` succeeds.
2. **Non-admin frontend.** Sign in as a second dev Clerk user with no role. Visit `/admin` — redirected to `/`.
3. **Non-admin backend.** Same second user, hit a backend admin endpoint directly with their Clerk JWT (e.g. `DELETE /products/:id`) — `403 {"error":"Forbidden"}`.
4. **Signed-out frontend.** Sign out. Visit `/admin` — `AdminGuard` returns `null` until `isLoaded`, then `Navigate` to `/`.
5. **Signed-out backend.** No auth header on `DELETE /products/:id` — `401` from `requireAuth()` (unchanged behavior).
6. **JWT misconfig sanity check.** Temporarily remove the `metadata` claim from the dev Clerk session token customization. Admin gets 403 on backend, redirected from `/admin` on frontend. Restore the claim.

Post-merge, at cutover: repeat steps 1–3 against the production app with both prod admin users (Adrian, wife).

## Acceptance criteria mapping

| Issue #21 criterion | Covered by |
| --- | --- |
| Backend admin middleware checks Clerk session claim role instead of `ADMIN_USER_ID` | "Backend changes" |
| Frontend exposes `useIsAdmin()` hook (single source of truth) | "Frontend changes" |
| Admin route guard uses `useIsAdmin()` and admits any user with `publicMetadata.role === "admin"` | "Frontend changes" |
| `ADMIN_USER_ID` / `VITE_ADMIN_USER_ID` removed from `.env.example` files and from the `CLAUDE.md` gotcha | "Cleanup" |
| Manually verified: non-admin gets 403 on backend AND is redirected from frontend admin routes | Verification steps 2 + 3 |
| Manually verified: a user with `publicMetadata.role = "admin"` gets through both surfaces | Verification step 1 |

## Out of scope

- **`index.js` split into route modules.** PRD §Cross-cutting forbids it; tracked separately.
- **Generic `requireRole(role)` / `useHasRole(role)` factory.** YAGNI until a second role lands.
- **Module-augmented `UserPublicMetadata` type.** Separate change; not needed for the role check to work.
- **Touching local `.env` files.** Adrian removes the dead lines manually.
- **Dev-only fallback to the old env var.** Rejected during brainstorming — undermines single-source-of-truth.
- **Unit tests for `requireAdmin` / `useIsAdmin`.** PRD §Testing limits unit testing to M2/M3 for soft launch.
