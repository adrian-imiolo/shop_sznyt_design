# Runbook: Refunding a payment (Stripe)

Who this is for: **both admins** — no developer knowledge needed.
When to use it: a customer returned a frame under the 14-day right (regulamin § 7), a complaint was resolved with a refund (regulamin § 8), or an order has to be cancelled after payment.

The shop has **no in-app refund flow on purpose** — the Stripe dashboard is the tool. This runbook is the whole procedure.

---

## The flow at a glance

1. Customer emails `kontakt@sznytdesign.pl` (or uses the form at `/zwroty`).
2. Customer ships the frame back; you receive and inspect it.
3. You refund the payment in the Stripe dashboard (steps below). **The legal deadline is 14 days from the customer's withdrawal statement** (regulamin § 7 pkt 4), not from receiving the parcel — but you may lawfully **withhold** the refund until the frame or a proof of dispatch arrives (§ 7 pkt 5). In practice: refund as soon as the returned frame arrives; if the customer sends a shipping confirmation instead, the withhold right ends there and the 14-day clock is already running.
4. You do the two manual follow-ups: restock decision + revenue-cap note (see below — the app does none of this automatically).

## Step-by-step: refund in the Stripe dashboard

1. Log in at [dashboard.stripe.com](https://dashboard.stripe.com). Make sure the toggle in the top-left is on the **live** account (not "Test mode").
2. Find the payment. Two ways:
   - **Payments** in the left menu → search by the customer's email, or
   - search bar at the top → paste the customer's email or the amount.
   - Cross-check with the order in the shop's admin panel: the amount, date, and email must match. If the customer placed several orders, verify you have the right one before refunding.
3. Click the payment to open it, then click the **Refund** button (top right).
4. Choose the amount:
   - **Full refund** — the default; the whole amount is pre-filled. Use for a standard 14-day return.
   - **Partial refund** — type a lower amount. Use when e.g. only one of two frames comes back, or you refund the product but not an extra service.
5. Pick a reason (**Requested by customer** for returns) — optional, but it keeps the history readable.
6. Confirm. The refund is issued immediately on Stripe's side and shows on the payment as `Refunded` (or `Partially refunded`).

There is no "undo" for a refund. If you refund the wrong payment, the money goes back to that customer and you'd have to ask them to pay again — so double-check step 2.

## Fees: what a refund costs us

- **Stripe keeps the original processing fee.** Refunding a 300 zł order returns 300 zł to the customer, but the ~2–3% fee Stripe took on the original charge is not returned to us.
- Stripe charges **no additional fee** for issuing the refund itself.
- Net effect: every refund costs us the original Stripe fee. That's the cost of doing business — never try to pass it on to the customer; the regulamin (and consumer law) requires refunding the full amount they paid.

## What the customer sees

- The refund reaches the customer's bank account or card in roughly **5–10 business days** — the delay is on the bank's side, not ours, and we can't speed it up.
- Stripe does not email the customer about the refund by default. **Reply to the customer's return email** confirming the refund was issued and mentioning the 5–10 business-day window — that's our confirmation message.

## What the shop does NOT do automatically

The backend listens only for successful payments. It does **not** react to refunds (`charge.refunded` is not handled). After you refund in Stripe:

- **The order stays `paid`** in the admin panel, and its fulfillment status is untouched. That's a judgment call, not a bug — the order history should still show what happened, and there's no separate "refunded" status to set. Stripe's payment page is the record of the refund.
- **Stock is NOT restored.** If the returned frame comes back in sellable condition, bump its stock by 1 manually in the admin panel. If it's damaged, leave stock as is.
- **The revenue-cap banner keeps counting the refunded order** — see the next section.

## Rejecting a complaint: the mandatory ADR sentence

This applies to **complaints** (reklamacje, regulamin § 8), not 14-day returns.

- No response within **14 calendar days** of receiving a complaint = the complaint is **legally deemed accepted** (art. 7a ustawy o prawach konsumenta). Never let a complaint email sit.
- When you **reject** a complaint, the law (art. 32 ustawy o pozasądowym rozwiązywaniu sporów konsumenckich) requires the rejection email to state whether you agree to out-of-court dispute resolution for that case. **If you say nothing, you are deemed to have consented** and the customer can start the WIIH procedure with you bound to it.
- The shop's stance (regulamin § 9, decided 2026-07): no advance commitment — you decide per case. So every rejection email must end with one of:
  - decline: *"Informujemy, że nie wyrażamy zgody na udział w postępowaniu w sprawie pozasądowego rozwiązywania sporów konsumenckich przed Wojewódzkim Inspektoratem Inspekcji Handlowej w Szczecinie."*
  - or agree (fine for small honest disputes): *"Wyrażamy zgodę na udział w postępowaniu w sprawie pozasądowego rozwiązywania sporów konsumenckich. Podmiotem uprawnionym jest Wojewódzki Inspektorat Inspekcji Handlowej w Szczecinie."*

## Refunds and the DN quarterly revenue cap

**Question resolved (2026-07): a refunded (returned) order does NOT count toward the działalność-nierejestrowana quarterly cap.**

The cap is assessed against *przychód należny*, which the law defines as amounts due **excluding the value of returned goods, rebates, and discounts** ("po wyłączeniu wartości zwróconych towarów, udzielonych bonifikat i skont" — art. 5 ust. 6 ustawy Prawo przedsiębiorców). A full refund for a returned product removes that amount from the quarter's tally; a partial refund removes the refunded part.

**But the admin cap banner does not know about refunds.** It sums every order with status `paid` in the current quarter — refunded orders included. So the banner can only **over-count**, never under-count. That's the safe direction: it will warn you *earlier* than the law requires, never later.

What to do in practice:

- Normally: nothing. A few refunds at our volume don't change the picture.
- If the banner shows **90%+ or over the cap**: before panicking, subtract any refunded orders from that quarter by hand (banner total − refunded amounts) to get the legally relevant number. Check refunds in Stripe: **Payments → filter by "Refunded"**, restricted to the quarter's dates.
- Keep the refund visible in the sales record (ewidencja sprzedaży) as a correction/zwrot entry rather than deleting the sale — the tally must stay auditable.

## Related

- Regulamin § 7 (14-day withdrawal), § 8 (complaints), § 9 (ADR): [sznytdesign.pl/regulamin](https://sznytdesign.pl/regulamin) (source: `src/pages/Regulamin.tsx`)
- Cap banner computation: `backend/revenue/computeQuarterRevenue.ts` (sums `paid` orders per Warsaw-time quarter)
- Return/complaint intake: forms at `/zwroty` → email to `kontakt@sznytdesign.pl` (email-only by design, no DB workflow)
