# Admin responsive audit — sign-off evidence (#105, parent #30)

Date: 2026-07-14 · Branch: `chore/30/admin-mobile-sweep` · Driven live in Chrome
(device emulation) against the dev stack with seeded orders, logged in as admin.

## Evidence per acceptance criterion

| AC | Evidence |
| --- | --- |
| Screenshots per surface × breakpoint | `admin-home-{375,768,1440}.png`, `orders-{375,768,1440}.png`, `order-detail-{375,768,1440}.png` (detail = order #21: paczkomat + customer note) |
| Products list readable/scrollable at 375px | `admin-home-375.png` — table starts at "Kolejność", full width reachable by horizontal scroll (measured max scroll 749px of a 1092px table) |
| Products touch targets ≥40px | Measured live: reorder ▲▼ 80×40px; Edytuj/Usuń 47×40px (were 24px — fixed this commit) |
| Order detail readable, controls usable at 375px | `order-detail-{375,768,1440}.png`; no horizontal page scroll at 375 (scrollWidth = 375) |
| Revenue banner: no overflow at "over" with 5-digit total | `revenue-banner-over-375.png` — over state simulated in DOM (`12 345,67 zł / 10 813,50 zł (114.2%)`); amounts line 214px wide, fits. Note: bar color in the shot is a simulation artifact (only container classes were swapped); the component maps `over` → red bar |
| Update-tracking flow end-to-end at 375px | Order #30: status → Wysłane, tracking `690000112233`, saved via blur; persisted after full reload (`orders-375-tracking-saved.png`). Shipping-confirmation email path exercised (recipient = Adrian's own address on the order) |
| Trivial fixes applied + re-verified | Two, both in `AdminProducts.tsx`, re-verified live (see below) |

## Fixes found by the audit

1. **Products table left columns were unreachable below ~900px.** The wrapper was
   `flex flex-col items-center overflow-x-auto`; centering a 900px+ table in a
   343px container pushes ~280px past the *left* edge, and horizontal scroll can
   never reach start-side overflow. Kolejność/Nazwa/Slogan were invisible at
   375px with no way to scroll to them. Fix: wrapper is now `w-full
   overflow-x-auto`. (The spec's "horizontal scroll already works — audit only"
   assumption was wrong.)
2. **Edytuj/Usuń touch targets were 24px tall** (AC requires ≥40px). Fix:
   `min-h-[40px] flex items-center` on both.

## Outstanding for Adrian

- Per-surface sign-off from the screenshots.
- Final on-device phone check (issue #30 AC).
- Order #30 in the dev DB was set to shipped + tracking `690000112233` by the
  flow test — revert if it matters for other testing.
