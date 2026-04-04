# Sznyt Design — TODO & Roadmap

## Roadmap (in order)

1. ~~Admin panel~~ ✅
2. ~~Stripe checkout~~ ✅
3. ~~Clerk auth~~ ✅
4. ~~Shipping selector + address form~~ ✅ (Furgonetka labels pending business registration)
5. ~~Fulfillment status + tracking~~ ✅
6. **Testing** — run manual test plan (`docs/TEST-PLAN.md`) before launch
7. **SEO** — react-helmet-async for per-page titles/meta, Google Search Console + sitemap
8. **Deployment** — Vercel (frontend) + Railway (backend + DB) + cyberfolks DNS

## TODO — Testing

- [ ] **Add unit tests** — test individual components and utility functions in isolation
- [ ] **Add integration tests** — test API endpoints, database interactions, and service integrations
- [ ] **Add end-to-end tests** — test full user flows (checkout, auth, order tracking) with a tool like Playwright or Cypress

## TODO — Functionality

- [ ] **Order note** — customer note at checkout (delivery instructions); needs Cart UI field + Order model field + Stripe metadata
- [ ] **Abandoned checkout recovery email** — needs job scheduler (node-cron/BullMQ); skip until post-launch

## TODO — SEO & Analytics

- [ ] **react-helmet-async** — per-page `<title>` and `<meta description>` for all pages; submit sitemap
- [ ] **SEO content audit** — review copy, headings, image alt tags; keyword-rich for Polish search terms
- [ ] **Google Search Console** — set up after deployment; verify domain, submit sitemap
- [ ] **Google Analytics (GA4)** — install gtag, add to cookie consent banner; connects to Search Console

## TODO — Design & Content

- [ ] **Real product photos** — replace placehold.co images with actual photography
- [ ] **Real product descriptions** — accurate, keyword-rich copy in product records
- [ ] **Frame care instructions** — drafted in FAQ; add to individual product pages when ready

## TODO — Invoicing (blocked on business registration)

- [ ] **NIP field + invoice request** — optional NIP + "Chcę fakturę VAT" checkbox in Cart; blocked because nierejestrowana działalność = only rachunki
- [ ] **Invoice generation** — when registered: manual first, later automate via iFirma/wFirma API

## TODO — Legal (review needed)

- [ ] **Regulamin sklepu** — Adrian to review content for accuracy
- [ ] **Polityka prywatności + cookies** — Adrian to review
