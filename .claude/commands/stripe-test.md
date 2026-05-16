---
description: Set up Stripe webhook testing for sznytdesign — starts stripe listen and optionally triggers a test event
argument-hint: [event-name]
---

Help me test the Stripe webhook integration for sznytdesign.

Steps:
1. Confirm the backend is running on port 3000 (suggest starting `npm run dev:backend` if not)
2. Tell me the exact command to run `stripe listen --forward-to localhost:3000/webhook` in a separate terminal — I'll run it myself so the secret is captured correctly
3. Once I confirm the listener is up, if I passed an event name as argument ($ARGUMENTS), trigger it via `stripe trigger $ARGUMENTS`. Otherwise suggest common events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
4. After triggering, tail the backend logs briefly and summarize what happened (order created? stock decremented? email sent?)
5. Report results clearly — what was verified, what to check manually, any red flags

If the user's argument is blank, default to a gentle walkthrough without triggering anything yet.

Use the `stripe-webhook-tester` subagent if the flow gets complex or we hit a bug.
