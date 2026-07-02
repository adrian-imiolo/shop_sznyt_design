---
description: Walk through the pre-launch test plan in docs/TEST-PLAN.md interactively — confirm each step, record results, flag anything unchecked
---

Guide me through the full launch readiness test plan for sznytdesign.

1. Read `docs/TEST-PLAN.md` to see all sections and steps
2. Read `C:\Users\adria\.claude\projects\c--Users-adria-projects-shop-sznyt-design\memory\project_testing_progress.md` to see what's already been checked off
3. Start from the first unchecked section
4. For each step:
   - State the step clearly
   - Tell me exactly what to do and what to watch for
   - Wait for my response (pass / fail / skip with reason)
   - If fail, help me diagnose but don't fix unless I ask
5. At the end, update the testing-progress memory file with what was completed this session and any new bugs found

Non-negotiable gates before "launch-ready":
- Stripe payment flow tested with real test cards
- Admin panel CRUD all working
- Order confirmation email actually delivers to an inbox
- CORS locked to `FRONTEND_URL` (not `origin: true`)
- `.env` has all required keys (`CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, SMTP creds, `FRONTEND_URL`)

If I try to mark "launch-ready" without one of those, push back.
