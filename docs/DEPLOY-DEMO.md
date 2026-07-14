# Deploy the demo

One-shot guide for putting Sznyt Design on a free `.vercel.app` URL for portfolio use. Checkout runs the **real Stripe pipeline in test mode** — a recruiter can complete a purchase with card `4242 4242 4242 4242` and no real money moves. Total cost: **zero**. Total time: **~60 minutes**.

Stack: **Vercel** (frontend) + **Render** (backend) + **Neon** (Postgres) + **Clerk dev** (auth) + **Stripe test mode** (payments).

---

## 1. Neon — create the Postgres database

1. Go to <https://neon.tech>, sign in with GitHub.
2. **Create project** → name `sznyt-design-demo`, region closest to you (Frankfurt for EU).
3. On the project dashboard, find the **Connection string** (pooled) — looks like `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`.
4. Copy it. You'll paste it as `DATABASE_URL` in Render.

> Free tier: 0.5 GB storage, no sleep. Plenty for the demo.

---

## 2. Clerk — create the dev application

1. Go to <https://clerk.com>, sign in.
2. **+ Create application** → name `Sznyt Design Demo`.
3. Enable **Email** sign-in (and optionally Google). You don't need anything else.
4. From the dashboard sidebar → **API keys**:
   - Copy the **Publishable key** (`pk_test_...`) → for Vercel as `VITE_CLERK_PUBLISHABLE_KEY`
   - Copy the **Secret key** (`sk_test_...`) → for Render as `CLERK_SECRET_KEY`

> Free tier covers up to 10 000 MAUs. Won't be a problem for a demo.

---

## 3. Render — deploy the backend

1. Go to <https://render.com>, sign in with GitHub.
2. **+ New** → **Web Service** → connect the `shop_sznyt_design` repo.
3. Render reads `render.yaml` from the repo root and pre-fills the settings. Confirm:
   - **Name:** `sznyt-design-backend`
   - **Root directory:** `backend`
   - **Build command:** `npm install && npm run build` (runs `prisma generate && prisma migrate deploy`)
   - **Start command:** `npm start`
   - **Plan:** Free
4. In the **Environment** section, add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | (paste from Neon) |
   | `CLERK_PUBLISHABLE_KEY` | (paste from Clerk — same `pk_test_...` you'll use on Vercel) |
   | `CLERK_SECRET_KEY` | (paste from Clerk — `sk_test_...`) |
   | `FRONTEND_URL` | leave empty for now (set in step 5) |

   > `CLERK_PUBLISHABLE_KEY` is required by `@clerk/express` middleware even though it's a "public" key. Without it, every request hits a `Publishable key is missing` 500.

   > **Don't set the Stripe vars yet.** The backend exits at boot if `STRIPE_SECRET_KEY` is set without `STRIPE_WEBHOOK_SECRET` + `FRONTEND_URL`, and the webhook secret only exists after you register the endpoint (step 6) — which needs this service's URL. Until then the backend runs with checkout returning 503, which is fine for wiring up the rest.

5. **Create Web Service**. Wait ~3–5 min for the first build.
6. When the status turns green, copy the public URL (e.g. `https://sznyt-design-backend.onrender.com`). You'll paste it as `VITE_API_URL` in Vercel.

> Free tier sleeps after 15 min of inactivity. First request after sleep takes ~30 s to wake the service — fine for a demo, the interviewer's first click will warm it.

### Seed the database (one-off)

Render's free tier doesn't include Shell access. Seed via **Neon's SQL Editor** instead (no Render upgrade required):

1. Neon dashboard → **SQL Editor**
2. Paste and run:

   ```sql
   TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;

   INSERT INTO "Product" (name, tagline, description, price, "imageUrl", "lifestyleImageUrl", stock, "sortOrder", "createdAt") VALUES
   ('Ramka Szachownica',
    'Dwa kolory, jeden charakter.',
    'Rama wykonana z litego dębu, w której naprzemienne kwadraty jasnego i ciemnego drewna tworzą wzór szachownicy. Każdy element precyzyjnie dopasowany — kontrast kolorów nadaje jej wyrazisty, a zarazem ponadczasowy charakter.',
    299,
    '/images/szachownica-studio.webp',
    '/images/szachownica-lifestyle.webp',
    10, 0, NOW()),
   ('Ramka Corner Cut',
    'Minimalizm w każdym detalu.',
    'Dębowa rama z charakterystycznymi nacięciami na narożnikach, w które wpuszczono kontrastowy materiał. Połączenie drewna i wyraźnego detalu na rogach tworzy subtelny, nowoczesny akcent bez zbędnej ozdobności.',
    349,
    '/images/corner-cut-studio.webp',
    '/images/corner-cut-lifestyle.webp',
    8, 0, NOW());
   ```

3. Verify with `SELECT id, name FROM "Product";` — should return 2 rows.

> If you have a paid Render plan, you can run `npm run seed` from the Render Shell tab instead.

---

## 4. Vercel — deploy the frontend

1. Go to <https://vercel.com>, sign in with GitHub.
2. **Add New** → **Project** → import `shop_sznyt_design`.
3. Vercel auto-detects Vite. Leave **Framework Preset**, **Build Command**, and **Output Directory** as-is.
4. Expand **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | (paste Render URL from step 3) |
   | `VITE_CLERK_PUBLISHABLE_KEY` | (paste from Clerk) |
   | `VITE_DEMO_MODE` | `true` |

5. **Deploy**. Wait ~1–2 min.
6. Copy the deployment URL (e.g. `https://sznyt-design.vercel.app`).

---

## 5. Backend: set FRONTEND_URL

Back in Render → Service → **Environment**, set:

```
FRONTEND_URL=https://sznyt-design.vercel.app
```

Save — Render redeploys automatically.

`FRONTEND_URL` is used for the Stripe `success_url`/`cancel_url` and to prefix relative product image URLs so Stripe checkout can show thumbnails. Checkout 500s without it.

---

## 6. Stripe — test-mode keys + webhook

All of this happens in **test mode** — check the Stripe dashboard's test-mode toggle (top right) before copying anything.

1. Go to <https://dashboard.stripe.com>, sign in.
2. **Developers → API keys** → copy the **Secret key** (`sk_test_...`).
3. **Developers → Webhooks** → **+ Add endpoint**:
   - **Endpoint URL:** `https://sznyt-design-backend.onrender.com/webhook` (your Render URL + `/webhook`)
   - **Events:** select `checkout.session.completed` only
4. Open the new endpoint and reveal the **Signing secret** (`whsec_...`).
5. In Render → Service → **Environment**, add:

   | Key | Value |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_test_...` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

   Save — Render redeploys. The boot log should no longer say `[DEMO MODE] ... Stripe: off`.

> **Never paste live keys here.** The demo must only ever see `sk_test_...` / `whsec_...` from test mode. Leave `SMTP_*` unset — the backend logs `[demo] sendEmail skipped` instead of sending order emails.

---

## 7. Smoke-test the demo

Open the Vercel URL and confirm:

- [ ] Black banner at top: _"Portfolio demo — pay with Stripe test card 4242 4242 4242 4242 …"_
- [ ] Two sample products on `/sklep`, with images (served from `/images/...`)
- [ ] Adding to cart works
- [ ] **Full test purchase:** on `/koszyk` fill the address, accept the regulamin, click **Przejdź do płatności** — the Stripe page shows the product thumbnail; pay with `4242 4242 4242 4242`, any future date, any CVC → you land on `/sukces` with the order summary
- [ ] Render logs show the webhook processed the order and `[demo] sendEmail skipped — ...` (no email sent)
- [ ] In Neon SQL Editor: `SELECT id, status, total FROM "Order" ORDER BY id DESC LIMIT 1;` → status `paid`, and `SELECT name, stock FROM "Product";` → stock decremented by the purchased quantity
- [ ] In Stripe dashboard → Webhooks → the endpoint, **Resend** the `checkout.session.completed` event → returns 200 and no duplicate order appears (idempotency)
- [ ] `/kontakt` submits without error (backend logs `[demo] sendEmail skipped`)
- [ ] `/admin` is gated by Clerk — sign up with email, you'll land on `/admin` with no admin permissions (intentional — admin role isn't granted)

---

## 8. Update README + make the repo public

```bash
# In your local clone:
# Edit README.md "Live demo" line to point to the Vercel URL
git add README.md
git commit -m "docs: link live demo URL"
git push
```

Then on GitHub:

1. **Settings** → **General** → scroll to **Danger Zone** → **Change repository visibility** → **Make public**.
2. Confirm.

> The git history was audited — only `.env.example` placeholder files were ever committed. No real secrets to rotate.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Render build fails with `Environment variable not found: DATABASE_URL` | Env var not set before first build | Set `DATABASE_URL` in Environment, then **Manual Deploy → Deploy latest commit** |
| Frontend loads but products list is empty | Database not seeded | Run `npm run seed` in Render shell |
| Frontend loads but API calls 404 | `VITE_API_URL` missing or wrong | Check Vercel env vars; redeploy after editing |
| Frontend loads but Clerk fails to load | `VITE_CLERK_PUBLISHABLE_KEY` missing | Same as above |
| Pay button works but backend returns 503 | `STRIPE_SECRET_KEY` not set | Complete step 6, redeploy |
| Backend crash-loops after adding Stripe key | `STRIPE_WEBHOOK_SECRET` or `FRONTEND_URL` missing | Boot check requires all three together — set them, redeploy |
| Payment succeeds but no order in DB | Webhook signature mismatch or wrong endpoint URL | Check Render logs for `Webhook error`; re-copy `whsec_...` from the exact endpoint, confirm the URL ends with `/webhook` |
| Stripe checkout page shows no product image | `FRONTEND_URL` wrong or image path 404s | Open `<FRONTEND_URL>/images/szachownica-studio.webp` in a browser — must resolve publicly |
| First request after some idle time hangs | Render free-tier cold start | Wait ~30 s; the service is waking. No fix on free tier |
| Site appears in Google search | `noindex` meta missing | Check `index.html` — should have `<meta name="robots" content="noindex, nofollow" />` |

---

## What to delete when the interview is over

Free tier — nothing has to be cleaned up. Resources sit idle at $0/month.

If you want to: delete the Render service, delete the Neon project, delete the Clerk application, delete the Vercel project. Repo stays.
