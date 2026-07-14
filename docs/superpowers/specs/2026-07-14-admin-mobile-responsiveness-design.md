# Admin mobile responsiveness sweep — design

**Issue:** #30
**Date:** 2026-07-14
**Status:** approved by Adrian (pattern decisions made 2026-07-14: cards for orders, two-row stack for nav)

## Goal

Every admin surface readable and usable at 375 / 768 / 1440 px, so the shop's
fulfillment flow (update status + tracking number) works end-to-end on a phone —
the primary admin device for order handling.

## Surfaces and changes

### 1. AdminNav (`src/pages/admin/AdminNav.tsx`) — two-row stack

Below `sm` (640px) the "Panel admina" heading takes its own row
(`max-sm:basis-full` inside the existing flex-wrap container); the three links
form a clean second row. At `sm:` and up the current single-row layout is
unchanged. Zero JS, no new components, everything stays one tap away.

Rejected alternatives: hamburger (hides the two most-used links behind a tap,
adds menu state for 3 links), icon-only row (unlabeled icons are guesswork for
a non-technical admin).

### 2. AdminOrders (`src/pages/admin/AdminOrders.tsx`) — cards below `md`, table above

Two render trees switched by CSS: `md:hidden` (card list) and `hidden md:block`
(table). No JS media queries.

**Card layout** (< 768px), top to bottom:

- `#id` (link to detail) · order date
- payment status · customer email
- total · shipping method
- collapsed address line; the orange `Uwagi` note when present
- `FulfillmentControls` full-width at the bottom

The loading skeleton gets a matching card variant under the same breakpoint
switch.

**Table** (≥ 768px): today's table plus the missing `min-w-[900px]` on the real
table — the skeleton already has it; its absence on the data table is why
columns crush at narrow widths instead of scrolling. Straight bug fix.

**Accepted edge case:** both trees mount their own `FulfillmentControls`, which
owns draft state. If an edit is in flight and the viewport crosses 768px before
blur, the other instance shows stale state. Real-world exposure ~zero (phones
stay < 768 even in landscape; nobody resizes a desktop mid-edit). Lifting draft
state up or CSS-morphing `<tr>`s into blocks costs more than it buys.

### 3. AdminProducts (`src/pages/admin/AdminProducts.tsx`) — audit only

Horizontal scroll (`overflow-x-auto` + `min-w-[900px]`) already works at 375px.
Products are managed from desktop; the phone flow is orders. Verify touch-target
sizes on reorder/delete (already ≥ 40px) and leave the pattern alone. No card
variant — YAGNI.

### 4. AdminOrderDetail (`src/pages/admin/AdminOrderDetail.tsx`) — audit only

Already mobile-first (`max-w-2xl`, single column, controls capped `max-w-xs`).
Expect zero or trivial changes after verification.

### 5. RevenueBanner (`src/pages/admin/RevenueBanner.tsx`) — audit only

`flex-wrap` header + full-width bar should hold at 375px. Verify the amounts
line (`10 813,50 zł / … (%)`) does not overflow at the `over` threshold with
5-digit totals.

## Verification

No unit tests — pure layout. Drive the running app with Chrome DevTools at
375 / 768 / 1440 on all five surfaces with seeded orders (including one with a
customer note and a paczkomat address). Screenshot each surface per breakpoint.
Walk the full update-tracking flow at 375px (orders list → change status →
enter tracking → saved). Adrian signs off per surface from the screenshots;
the final on-device phone check is his (issue AC).

## Out of scope

- Add/Edit product form pages (not listed in issue #30)
- Any data or API changes
- Products list card variant
