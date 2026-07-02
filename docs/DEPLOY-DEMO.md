# Deploy the read-only demo

One-shot guide for putting Sznyt Design on a free `.vercel.app` URL for portfolio use. Total cost: **zero**. Total time: **~45 minutes**.

Stack: **Vercel** (frontend) + **Render** (backend) + **Neon** (Postgres) + **Clerk dev** (auth).

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
   | `FRONTEND_URL` | leave empty for now (set in step 6) |

   > `CLERK_PUBLISHABLE_KEY` is required by `@clerk/express` middleware even though it's a "public" key. Without it, every request hits a `Publishable key is missing` 500.

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
    'https://placehold.co/800x1000/2a2420/FAFAF8?text=Studio',
    'https://placehold.co/800x1000/4a3f35/FAFAF8?text=Lifestyle',
    10, 0, NOW()),
   ('Ramka Corner Cut',
    'Minimalizm w każdym detalu.',
    'Dębowa rama z charakterystycznymi nacięciami na narożnikach, w które wpuszczono kontrastowy materiał. Połączenie drewna i wyraźnego detalu na rogach tworzy subtelny, nowoczesny akcent bez zbędnej ozdobności.',
    349,
    'https://placehold.co/800x1000/1a1a1a/FAFAF8?text=Studio',
    'https://placehold.co/800x1000/2d2d2d/FAFAF8?text=Lifestyle',
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

## 5. Backend: finish the loop

Back in Render → Service → **Environment**, set:

```
FRONTEND_URL=https://sznyt-design.vercel.app
```

Save — Render redeploys automatically.

`FRONTEND_URL` is only used for Stripe `success_url`; demo mode doesn't hit it, but setting it keeps the env complete.

---

## 6. Smoke-test the demo

Open the Vercel URL and confirm:

- [ ] Black banner at top: _"Portfolio demo — checkout and admin actions are disabled."_
- [ ] Two sample products on `/sklep`
- [ ] Adding to cart works
- [ ] On `/koszyk`, the Pay button shows _"Demo — checkout disabled"_ and is disabled
- [ ] `/kontakt` submits without error (backend logs `[demo] sendMail skipped`)
- [ ] `/admin` is gated by Clerk — sign up with email, you'll land on `/admin` with no admin permissions (intentional — admin role isn't granted)

---

## 7. Update README + make the repo public

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
| First request after some idle time hangs | Render free-tier cold start | Wait ~30 s; the service is waking. No fix on free tier |
| Site appears in Google search | `noindex` meta missing | Check `index.html` — should have `<meta name="robots" content="noindex, nofollow" />` |

---

## What to delete when the interview is over

Free tier — nothing has to be cleaned up. Resources sit idle at $0/month.

If you want to: delete the Render service, delete the Neon project, delete the Clerk application, delete the Vercel project. Repo stays.
