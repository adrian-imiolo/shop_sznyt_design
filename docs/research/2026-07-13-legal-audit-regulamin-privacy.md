# Legal audit: Regulamin, Polityka prywatności, CookieBanner (issues #27 / #28)

**Date:** 2026-07-13
**Scope:** `src/pages/Regulamin.tsx`, `src/pages/PolitykaPrywatnosci.tsx`, `src/components/CookieBanner.tsx` (+ consent context/hook), checked against current Polish and EU law.
**Status:** research support for HITL review — **this is not legal advice**. Every substantive claim cites its source; where the primary statute text was verified through a verbatim secondary mirror (sip.lex.pl / lexlege.pl) rather than the ISAP PDF itself, that is flagged.

---

## Executive summary

The documents are structurally good — controller identified, DN status declared, 14-day withdrawal present, ADR section present — but several **substantive legal errors** must be fixed before launch, and **both issues' acceptance criteria contain outdated law**:

1. **Issue #28 cites a repealed statute.** Cookie consent is no longer governed by `Prawo telekomunikacyjne` art. 173. Since 10 Nov 2024 the governing provision is **art. 399 ustawy z 12 lipca 2024 r. — Prawo komunikacji elektronicznej (PKE)** (Dz.U. 2024 poz. 1221). Same substance (informed prior consent, strictly-necessary exemption), but the banner/policy should not cite art. 173 PT and the issue's criterion needs rewording.
2. **Issue #27 demands a now-defunct ODR reference.** The EU ODR platform was **shut down on 20 July 2025**; Regulation (EU) 524/2013 was repealed by **Regulation (EU) 2024/3228**, which obliges traders to **remove** ODR links from websites and terms. Regulamin § 8 pkt 1 currently violates this — the ODR link must be deleted, not kept.
3. **Regulamin § 7 (complaints) rests on the wrong legal basis.** For consumers, Kodeks cywilny rękojmia (art. 556 i n. KC) has **not applied since 1 Jan 2023**. Consumer conformity claims are governed by **rozdział 5a ustawy o prawach konsumenta (art. 43a–43g)** — "brak zgodności towaru z umową". § 7 pkt 1 must be rewritten.
4. **"14 dni roboczych" for complaint response is wrong.** Art. 7a ustawy o prawach konsumenta: **14 days (calendar)**, and silence = complaint deemed accepted. "Roboczych" extends the statutory deadline to the consumer's detriment — invalid and a UOKiK risk.
5. **Refund timing in § 6 pkt 7 is wrong.** Art. 32 ust. 1 upk: refund within **14 days of receiving the withdrawal statement** (not of receiving the goods back), including **original delivery costs** (capped at the cheapest offered method, art. 33). The seller may only **withhold** the refund until the goods or proof of dispatch arrive (art. 32 ust. 3). The current clause is less favourable than the statute → unenforceable and abusive-clause risk.
6. **"Zwracany produkt powinien być nieużywany, nieuszkodzony" (§ 6 pkt 4) is an abusive-clause risk.** The withdrawal right cannot be conditioned on the state of the goods; the statute only makes the consumer liable for diminished value beyond handling needed to check the goods (art. 34 ust. 4 upk).
7. **The "rachunek-only, never faktura" framing (issue #27 + CONTEXT.md) is too strong.** A DN seller **must** issue a rachunek on request (art. 87 § 1 Ordynacji podatkowej) **and must issue a faktura (bez VAT) on the buyer's request** made within 3 months (art. 106b ust. 3 pkt 2 ustawy o VAT). The regulamin may not promise faktura VAT z NIP-em, but it also must not deny invoices outright.
8. **The regulamin is missing mandatory UŚUDE content** (art. 8 ustawy o świadczeniu usług drogą elektroniczną): technical requirements, prohibition of unlawful content, and terms for the electronic services actually provided (Clerk user accounts!).
9. **A phone number is mandatory.** Post-Omnibus art. 12 ust. 1 pkt 3 upk requires the seller's telephone number, not just e-mail. Neither document lists one.
10. **The 2026 DN cap framing in CONTEXT.md is correct** — from 1 Jan 2026 the limit is **quarterly, 225% of minimum wage = 10,813.50 PLN** (minimum wage 4,806 PLN). Verified on biznes.gov.pl.
11. **Cookie banner irony:** everything the site currently stores (cart localStorage, consent flag, Clerk session) is **strictly necessary** and exempt from consent (art. 399 ust. 2 PKE analogue of old art. 173 ust. 3 PT). The banner gates cart persistence on consent, degrading UX for something that needs no consent — while the policy references an "Ustawienia cookies" control **that does not exist in the code**.

---

## Issue #27 — Regulamin, criterion by criterion

### 1. DN status declaration — ✅
§ 1 pkt 1 and § 4 pkt 2 explicitly state "działalność nierejestrowana". Legal basis: art. 5 ust. 1 ustawy z 6 marca 2018 r. — Prawo przedsiębiorców (Dz.U. 2018 poz. 646 z późn. zm.). No obligation exists to *declare* DN status in a regulamin, but doing so supports the required seller-identification duty (art. 12 ust. 1 pkt 2 upk).

**2026 cap detail (verified):** from 1 Jan 2026 the DN threshold is **quarterly: 225% of minimum wage in any calendar quarter**. With the 2026 minimum wage of 4,806 PLN (rozporządzenie Rady Ministrów z 11 września 2025 r.), the cap is **10,813.50 PLN/quarter**; exceeding it requires CEIDG registration within **7 days**. Source: [biznes.gov.pl — Działalność nierejestrowana](https://www.biznes.gov.pl/pl/portal/00115) (official government portal). CONTEXT.md is correct.

### 2. Rachunek-only language — ⚠️ document OK, criterion too strong
- The regulamin makes no faktura-VAT promises and collects no NIP — the criterion as written is met.
- **But the criterion itself overshoots the law.** Even a DN seller (VAT-exempt under art. 113 ust. 1/9 ustawy o VAT):
  - must issue a **rachunek** on the buyer's request — art. 87 § 1 Ordynacji podatkowej (request valid within 3 months; issue within 7 days of request);
  - must issue a **faktura** (a "faktura bez VAT" / zwolnieniowa, which does **not** require the seller to have a NIP registered business) if the buyer demands one within 3 months from the end of the month of delivery — **art. 106b ust. 3 pkt 2 ustawy o VAT**. Confirmed by the official DN guide: "Musisz jednak wystawić fakturę, jeżeli twój klient tego zażąda" ([biznes.gov.pl/pl/portal/00115](https://www.biznes.gov.pl/pl/portal/00115)).
- § 4 pkt 2 currently says only "wystawia rachunek" on request. Recommended wording: rachunek issued on request; faktura (bez VAT) also issued on request per art. 106b ust. 3 ustawy o VAT. Do not use "faktura VAT" — the shop issues invoices *without* VAT.
- **Terminology fix:** "nie jest płatnikiem VAT" (§ 4 pkt 2) is colloquial and technically wrong — the correct statement is "sprzedaż zwolniona od podatku VAT na podstawie art. 113 ustawy o VAT" (the seller *is* a VAT taxpayer in the statutory sense, just exempt).
- ⚠️ Secondary-source flag (not fully verified against the primary regulation): per [INFORLEX](https://www.inforlex.pl/dok/tresc,FOB0000000000007580090,Dzialalnosc-nierejestrowana-rachunki-czy-faktury-przez-KSeF.html), from 1 Feb 2026 changes to the invoicing regulation (§ 3 pkt 3) affect when a rachunek doubles as a faktura (NIP nabywcy requirement) — worth checking with an accountant before promising specific document types, especially around KSeF applicability to VAT-exempt sellers.
- **Action item for CONTEXT.md:** soften "can only issue rachunek, not faktura VAT" to "issues rachunek; issues faktura bez VAT on request; never faktura VAT with NIP".

### 3. No VAT in pricing copy — ✅
§ 4 pkt 1: "zawierają wszystkie obowiązujące podatki" — no VAT mention, and this phrasing is actually *required*: total price inclusive of taxes must be communicated (art. 12 ust. 1 pkt 5 ustawy o prawach konsumenta). Keep as is.

### 4. Statutory 14-day withdrawal right — ⚠️/❌ several errors
Governing statute: ustawa z 30 maja 2014 r. o prawach konsumenta (upk; t.j. Dz.U. 2024 poz. 1796).

| Clause | Assessment |
|---|---|
| 14 days from receipt of goods (§ 6 pkt 1) | ✅ art. 27 + art. 28 pkt 1 upk |
| Withdrawal via form or e-mail statement (§ 6 pkt 2) | ✅ art. 30 upk allows any unambiguous statement — **but** the seller must also *provide* the statutory model withdrawal form (art. 12 ust. 1 pkt 9 upk + załącznik nr 2 do upk). **Missing** — link the model form (or an equivalent form containing its content) from the regulamin/`/zwroty`. |
| Return goods within 14 days of withdrawal (§ 6 pkt 3) | ✅ art. 34 ust. 1 upk |
| "Produkt powinien być nieużywany, nieuszkodzony" (§ 6 pkt 4) | ❌ **Abusive-clause risk.** The right of withdrawal cannot be conditioned on the goods being unused/undamaged. The correct rule: the consumer is liable for **diminished value** resulting from use beyond what is necessary to establish the nature, characteristics and functioning of the goods — art. 34 ust. 4 upk. Rewrite the clause in those terms. See also UOKiK guidance: [prawakonsumenta.uokik.gov.pl — Skutek odstąpienia](https://prawakonsumenta.uokik.gov.pl/prawo-odstapienia-od-umowy/skutek/). |
| Consumer pays return shipping (§ 6 pkt 5) | ✅ art. 34 ust. 2 upk — valid **only because it is stated** (otherwise the seller pays). Keep. |
| Seller pays return costs for defective goods (§ 6 pkt 6) | ✅ consistent with rozdział 5a (art. 43d ust. 6 upk: repair/replacement costs borne by seller). But this sentence belongs in § 7 (complaints), not § 6 (withdrawal) — mixing the two regimes invites confusion. |
| Refund "w terminie do 14 dni **od otrzymania zwróconego produktu**" (§ 6 pkt 7) | ❌ **Contradicts art. 32 ust. 1 upk**: refund is due immediately, no later than **14 days from receipt of the withdrawal statement**. The seller's protection is art. 32 ust. 3: it may **withhold** the refund until it receives the goods back **or** proof of dispatch, whichever is first. Also **missing**: the refund must include **original delivery costs** (art. 32 ust. 1), limited to the cheapest ordinary delivery method offered (art. 33 upk). Same payment method — ✅ art. 32 ust. 2. |

**Custom / made-to-order frames (art. 38 exemption):** the right of withdrawal does not apply to "rzecz nieprefabrykowana, wyprodukowana według specyfikacji konsumenta lub służąca zaspokojeniu jego zindywidualizowanych potrzeb" — **art. 38 ust. 1 pkt 3 upk**. Current catalogue = stocked SKUs (`Product.stock` decrements), so the exemption does **not** apply today and the regulamin is right not to invoke it. If made-to-order/personalized frames are ever added: (a) the exemption is interpreted **narrowly** (genuine consumer-specified parameters, not just "picked from options"), (b) it only works if the consumer was **informed of the exclusion before purchase** (art. 12 ust. 1 pkt 12 upk) — so it must be added to the regulamin and product page *before* selling such items. Source: [UOKiK — Wyłączenia prawa do odstąpienia](https://prawakonsumenta.uokik.gov.pl/prawo-odstapienia-od-umowy/wylaczenia-prawa-do-odstapienia/).

### 5. Returns address — ⚠️
The postal address appears in § 1 pkt 1; § 6 pkt 3 says only "na adres Sprzedawcy". Legally sufficient (art. 12 ust. 1 pkt 3 i 10 upk are about informing of the address and return costs), but restate the full return address inside § 6 to remove ambiguity — the issue's criterion ("correct procedure and address") is best read as requiring it inline.

### 6. Complaints procedure — ❌ wrong legal basis, wrong deadline, wrong remedies
- **Legal basis (§ 7 pkt 1) is outdated.** Since 1 Jan 2023 (ustawa z 4 listopada 2022 r., Dz.U. 2022 poz. 2337), KC rękojmia does **not** apply to consumer sales; art. 43a ust. 1 upk excludes księga III tytuł XI dział II KC and replaces it with **rozdział 5a upk — "brak zgodności towaru z umową" (art. 43a–43g)**. Citing "Kodeksu cywilnego o rękojmi (art. 556 i następne)" is correct **only for B2B buyers** (the shop's definition of Kupujący includes them, so a split clause is appropriate: rozdział 5a upk for Konsument + przedsiębiorca na prawach konsumenta; KC rękojmia for other buyers). Sources: [UOKiK — Niezgodność towaru z umową](https://prawakonsumenta.uokik.gov.pl/reklamacja/niezgodnosc/); art. 43a upk via [sip.lex.pl](https://sip.lex.pl/akty-prawne/dzu-dziennik-ustaw/prawa-konsumenta-18105223/art-43-d) (verbatim mirror).
- **Response deadline (§ 7 pkt 3) "14 dni roboczych" is wrong.** Art. 7a ust. 1 upk: response within **14 dni** (calendar) from receipt; art. 7a ust. 2: no response in time = complaint **deemed accepted**; art. 7a ust. 3: response on paper or a durable medium (e-mail qualifies). "Roboczych" stretches ~14 → ~20 days, to the consumer's detriment — unenforceable and a UOKiK "praktyka naruszająca zbiorowe interesy konsumentów" risk. Source: art. 7a upk via [lexlege.pl](https://lexlege.pl/ustawa-o-prawach-konsumenta/art-7a/) (verbatim mirror of Dz.U. 2024 poz. 1796).
- **Remedies (§ 7 pkt 4) misstate the hierarchy.** "Sprzedawca oferuje wymianę, naprawę lub zwrot — w zależności od okoliczności i dostępności" inverts the statute: the **consumer chooses** repair or replacement first (art. 43d ust. 1 upk; the seller may switch between them only under art. 43d ust. 2–3 conditions, e.g. impossibility or excessive cost); price reduction or withdrawal is the second tier (art. 43e upk), available directly when the non-conformity is substantial. Withdrawal is excluded for immaterial non-conformity (art. 43e ust. 5? — see UOKiK summary).
- **Missing:** the 2-year liability window — the seller is liable for non-conformity existing at delivery and revealed within **2 years** (art. 43c upk), with a presumption that non-conformity revealed within 2 years existed at delivery.
- Terminology: replace "wady fizyczne i prawne" with "brak zgodności towaru z umową" for the consumer track.
- Complaint channel + photo documentation: fine as a *request*, but the regulamin must not make photos a condition of accepting the complaint (no statutory basis).

### 7. Data controller identification — ✅ (with one open point)
Adrian Imioło is named with full name, business name, postal address and e-mail in both documents — meets art. 13 ust. 1 lit. a RODO (Rozporządzenie (UE) 2016/679) and is consistent across regulamin § 1 / privacy policy § 1. A DN seller **is** a controller — GDPR's controller definition (art. 4 pkt 7) does not depend on business registration.

Open point — **the wife**: she manufactures the frames and is a second admin with access to order data. That is compatible with Adrian being the sole controller **if** she processes data under his authority (art. 29 RODO / art. 32 ust. 4 — persons acting under the authority of the controller). Recommended (internal, not in the public policy): a short written **upoważnienie do przetwarzania danych** for her admin access. If she independently decided purposes/means (e.g. ran her own customer list), she would become a separate/joint controller — currently no evidence of that.

### 8. Dispute resolution clause — ❌ criterion partly defunct; document must change
- **The EU ODR platform no longer exists.** Regulation (EU) 524/2013 was repealed by **Regulation (EU) 2024/3228 of 19 December 2024** ([EUR-Lex OJ L 2024/3228](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202403228)). The platform stopped accepting complaints on 20 March 2025 and was **discontinued on 20 July 2025**; traders are required to **remove references and links to the ODR platform** from their websites and terms. Regulamin § 8 pkt 1 (link to `ec.europa.eu/consumers/odr`) must be **deleted**. The issue #27 criterion "dispute resolution clause with ODR reference" is **wrong as written** — satisfying it would put the shop out of compliance.
- What should replace it (Polish ADR framework, ustawa z 23 września 2016 r. o pozasądowym rozwiązywaniu sporów konsumenckich, Dz.U. 2016 poz. 1823):
  - **art. 31**: the duty to name an ADR entity on the website applies only to sellers who **committed** to ADR or are obliged by sector rules. A DN frame seller is not obliged — the regulamin should state clearly **whether** the seller agrees to participate in ADR (either is lawful; stating nothing is the risk).
  - **art. 32**: if a complaint is rejected, the seller must tell the consumer, on a durable medium, whether it agrees to ADR and identify the competent entity — **silence = deemed consent to ADR**. Worth encoding in the complaints-handling runbook.
  - The competent general ADR entity for goods sellers is the **Wojewódzki Inspektorat Inspekcji Handlowej** (for Szczecin: WIIH w Szczecinie); consumers can also use miejski/powiatowy rzecznik konsumentów. Keeping the pointer to [uokik.gov.pl](https://uokik.gov.pl) (§ 8 pkt 2) is good.

---

## Issue #28 — Polityka prywatności + CookieBanner, criterion by criterion

### 1. Consistency with regulamin (controller / contact / DN) — ✅
Same person, same business name, same address, same e-mail, DN status declared in both. Consistent.

### 2. Cookie section lists actual cookies with purpose and lifetime — ⚠️
What the site actually stores (verified in code):
- `localStorage`: cart (`CartContext`, persisted **only after consent** — see below), `cookie_consent` flag (`src/context/cookie-consent-context.ts`).
- `sessionStorage`: checkout draft (persisted only after consent — `src/checkout/useCheckout.ts`; feature from commit 6b27a40).
- **Clerk cookies** (e.g. `__session`, `__client`) — set when auth is used; the policy names Clerk but not the cookies or lifetimes.
- **Stripe**: no Stripe.js on the frontend (verified — no `loadStripe`; checkout is a redirect to Stripe-hosted Checkout), so Stripe cookies are set on `stripe.com`, not on sznytdesign.pl. The policy's "Stripe używa własnych cookies" is acceptable but should say they are set **on Stripe's own pages** during payment.
- GA4 — not present in code; policy correctly marks it "planowana", but listing a non-existent processing operation in the *current* policy is mildly misleading; prefer adding it when it ships.

Gaps: **no lifetimes per item** (the issue's criterion explicitly asks for them; art. 13 RODO also wants storage periods), no distinction cookie vs localStorage/sessionStorage (PKE art. 399 covers all terminal-equipment storage, so the disclosure should name the actual mechanisms), and **§ 5 references a "Ustawienia cookies" control that does not exist anywhere in the code** — either build it or reword ("usuwając dane przeglądarki / kontaktując się z nami").

### 3. Banner copy matches the policy — ⚠️
Banner says the site uses cookies "do zapamiętania zawartości koszyka" only; the policy lists Clerk sessions, Stripe, consent flag, planned GA4. Also the banner's link text says "Polityka cookies" but routes to the privacy policy (fine substantively; align the label). When GA4 lands, the banner text must actually describe the analytics purpose being consented to — current copy could not carry a GA4 consent.

### 4. Valid consent per "Prawo telekomunikacyjne art. 173" — ❌ criterion cites a repealed act; substance mostly fine
- **Governing law today:** art. 399 ustawy z 12 lipca 2024 r. — **Prawo komunikacji elektronicznej** (Dz.U. 2024 poz. 1221), in force since **10 Nov 2024**, replacing art. 173 Prawa telekomunikacyjnego. Requirements: prior, clear information about purpose; consent expressed via an unambiguous affirmative action (RODO-standard consent); no configuration changes to the user's device. Exemption (equivalent of old art. 173 ust. 3): storage/access necessary for transmitting a communication or for providing **a service explicitly requested by the user** needs no consent. Sources: [sip.lex.pl — art. 399 PKE (Dz.U.2024.1221)](https://sip.lex.pl/akty-prawne/dzu-dziennik-ustaw/prawo-komunikacji-elektronicznej-22035493/art-399) (verbatim mirror); analysis: [Grant Thornton](https://grantthornton.pl/publikacja/prawo-komunikacji-elektronicznej-a-ochrona-danych-osobowych/), [Kancelaria KHM](https://kancelariakhm.pl/ciasteczka-w-prawie-komunikacji-elektronicznej-wszystko-po-staremu/). Note: the old "browser settings = consent" reading is dead under PKE — active consent required for non-exempt storage. **Rewrite the issue #28 criterion and any doc references to cite art. 399 PKE.**
- **Substantive position of this site:** everything currently stored (cart, checkout draft, consent flag, Clerk auth session) is **strictly necessary for services the user explicitly requests** (keeping a cart, staying logged in, remembering the consent choice) → **exempt from consent** under art. 399 ust. 2 PKE. Consequences:
  - The current banner asks consent for exempt storage, and on "Odrzuć" the app **stops persisting the cart and checkout draft** (`hasStoredConsent()` gates both) — a self-inflicted UX penalty with no legal basis. Lawful and simpler: persist cart/draft unconditionally as strictly necessary; keep the banner as an **information + future-analytics-consent** surface, or drop it until GA4 ships.
  - When GA4 (or any marketing tech) ships, its scripts must load **only after** an affirmative "accept analytics" — the current binary accepted/declined flag can carry that, but the copy must name analytics.
- **Banner UX vs UOKiK/EDPB expectations:** "Odrzuć" is present in the **first layer** with parity to "Akceptuj" — this matches UOKiK's dark-patterns enforcement line (reject must be available in layer one, not hidden in settings; misleading colour hierarchy criticized) and EDPB cookie-banner taskforce/dark-pattern guidance. The accent-filled Accept vs outlined Reject is a mild visual asymmetry; both are same size and adjacent — acceptable, but equalizing styles is the conservative choice. Sources: [UOKiK dark-patterns positions (analysis)](https://prawodlabiznesu.eu/dark-patterns-w-swietle-stanowiska-uokik/), [PrawoMarketingu.pl](https://prawomarketingu.pl/dark-patterns-czego-nie-robic/) (secondary — no single primary UOKiK URL captured; UOKiK's decisions/wystąpienia are the primary line).

### 5. Banner accessible (WCAG), non-blocking — ✅ with small improvements
Non-blocking: fixed bottom bar, no overlay, page fully usable, no cookie wall — ✅ (cookie walls are the EDPB/UOKiK no-go; none here). Real `<button>` elements → keyboard operable. Improvements: add `role="region"` + `aria-label="Zgoda na pliki cookie"` so screen-reader users can find/skip it; verify focus indicator visibility on the dark background; the `sm:pr-24` clearance for the scroll-to-top button avoids overlap (good). No focus trap needed since it is non-modal.

---

## Gaps not covered by either issue

1. **UŚUDE regulamin content — mandatory, missing.** Art. 8 ust. 3 ustawy z 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną (Dz.U. 2002 nr 144 poz. 1204, t.j. Dz.U. 2024 poz. 1513) requires the regulamin to specify: (a) types and scope of electronic services (browsing, **user account via Clerk**, cart, checkout, contact/returns/complaints forms), (b) technical requirements (browser, JS, cookies enabled), (c) **prohibition on supplying unlawful content**, (d) conditions for concluding **and terminating** electronic-service contracts (esp. account deletion), (e) complaint procedure for the electronic services themselves. None of this is in the current regulamin. Source: [ISAP WDU20021441204](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20021441204); art. 8 text via [lexlege.pl](https://lexlege.pl/ustawa-o-swiadczeniu-uslug-droga-elektroniczna/art-8/).
2. **Telephone number — mandatory, missing.** Post-Omnibus (ustawa z 1 grudnia 2022 r., in force 1 Jan 2023) art. 12 ust. 1 pkt 3 upk requires the seller's **telephone number** and e-mail (phone is no longer "o ile dostępny"). Neither document nor (apparently) the site lists a phone number. Add one to § 1 regulaminu and the contact page.
3. **Courier-delay disclaimer (§ 5 pkt 7) — abusive-clause risk.** "Sprzedawca nie ponosi odpowiedzialności za opóźnienia wynikające z działania firm kurierskich" — in a B2C distance sale the seller bears the risk until delivery to the consumer (art. 548 § 3 KC) and cannot exclude liability for its performance via the carrier it chose (art. 385¹ KC abusive-clause test; cf. clauses of this type in the UOKiK register). Reword to an informational statement about typical courier times, without excluding liability. The damage-protocol sentence is fine as a *recommendation* only — receiving a complaint may not be conditioned on a protocol.
4. **"Korzystanie ze Sklepu oznacza akceptację Regulaminu" (§ 1 pkt 3)** — browsing does not equal contractual acceptance; acceptance happens via the checkout checkbox (§ 3 pkt 2, which is correct). Low risk, but drop or soften pkt 3.
5. **Omnibus price-reduction rule — not yet applicable, must be known.** If any "promocja/obniżka" is ever shown, the **lowest price in the 30 days before the reduction** must be displayed next to it — art. 4 ust. 2 ustawy z 9 maja 2014 r. o informowaniu o cenach towarów i usług (Dz.U. 2014 poz. 915 z późn. zm.). Verified in code: no discount/promo UI exists today, so no current obligation. Source: [UOKiK — Informacje o obniżkach cen](https://prawakonsumenta.uokik.gov.pl/prawo-do-informacji/informacje-o-obnizkach-cen/) and [Wyjaśnienia Prezesa UOKiK 2023 (PDF)](https://uokik.gov.pl/storage/archiwum/e6e552a1.pdf).
6. **Consumer reviews** — none displayed (verified in code). If ever added: duty to disclose whether and how the seller verifies that reviews come from actual purchasers (art. 12 ust. 1 upk as amended by the Omnibus implementation).
7. **Privacy policy — GDPR art. 13 gaps** (Rozporządzenie (UE) 2016/679, [EUR-Lex 32016R0679](https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX%3A32016R0679)):
   - **Third-country transfers (art. 13 ust. 1 lit. f)** — Stripe and Clerk are US companies; the policy only vaguely covers hosting ("serwery w UE lub z odpowiednimi zabezpieczeniami"). Add an explicit transfers section naming the safeguard (EU–US Data Privacy Framework certification and/or standard contractual clauses per the providers' DPAs). I did not verify each vendor's current DPF status — check stripe.com/legal/dpa, clerk.com DPA, and the DPF list before drafting.
   - **Stripe is not a plain processor.** Per Stripe's own [DPA](https://stripe.com/legal/dpa) and [Privacy Center](https://stripe.com/legal/privacy-center), Stripe acts as **processor for some activities and independent controller for others** (fraud prevention, regulatory compliance). Section 3's blanket label "podmioty przetwarzające (procesorzy)" should be adjusted ("odbiorcy danych", noting Stripe's dual role). For EU merchants the contracting entity is Stripe Payments Europe Ltd, not "Stripe Inc." — worth correcting.
   - **art. 13 ust. 2 lit. e** — whether providing data is a contractual requirement and consequences of not providing (add one sentence: order data is required to conclude/perform the contract).
   - GA4 "anonimowe dane" — inaccurate; GA4 data is at best pseudonymous. Remove "anonimowe" when GA4 ships.
   - Retention "5 lat od końca roku... (obowiązek podatkowy)" — reasonable for DN sales records (tax documentation kept until limitation of the tax liability, ~5 years from the end of the year in which the payment deadline passed — art. 70 § 1 i art. 86 § 1 Ordynacji podatkowej). ✅.
   - Legal bases chosen (art. 6 ust. 1 lit. b for orders/accounts, lit. f for contact forms, lit. a for newsletter/analytics) — ✅ standard and defensible. Consider adding lit. c (obowiązek prawny — tax records) as the basis for the 5-year retention leg, which is more precise than stretching lit. b.
8. **Order-cancellation clause (§ 3 pkt 6)** — cancelling for stock-out with refund is acceptable, but under art. 66¹ KC and the checkout flow the contract is concluded on payment; framing it as "anulowanie zamówienia" (rather than unilateral contract rescission) is fine as long as refunds are immediate. Low priority.

---

## Corrections to the issues themselves (summary)

| Issue | Criterion | Problem |
|---|---|---|
| #27 | "Dispute resolution clause with **ODR** reference" | ODR platform defunct since 20.07.2025 (Reg. 2024/3228 repealing Reg. 524/2013); the link must be **removed**, criterion should demand an ADR clause (ustawa o pozasądowym rozwiązywaniu sporów konsumenckich) instead. |
| #27 | "Rachunek-only language — no faktura promises anywhere" | Too strong: faktura **bez VAT** is mandatory on buyer request (art. 106b ust. 3 pkt 2 ustawy o VAT); rachunek mandatory on request (art. 87 § 1 Ordynacji podatkowej). The prohibition should be limited to *faktura VAT* / NIP collection. |
| #27 | "Complaints … response timeframe per Polish consumer law" | Correct as a criterion, but note the statutory deadline is **14 calendar days** (art. 7a upk) and the legal basis is **rozdział 5a upk**, not KC rękojmia — the current document fails on both. |
| #28 | "Valid consent per Prawo telekomunikacyjne art. 173" | Repealed. Governing provision: **art. 399 PKE** (Dz.U. 2024 poz. 1221), in force 10.11.2024. |

---

## Source list

**Primary (statutes, official portals):**
- Ustawa z 30.05.2014 o prawach konsumenta (t.j. Dz.U. 2024 poz. 1796) — [ISAP WDU20140000827](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827); article texts (art. 7a, 12, 27–38, 43a–43g) verified via verbatim mirrors [lexlege.pl](https://lexlege.pl/ustawa-o-prawach-konsumenta/art-7a/) and [sip.lex.pl](https://sip.lex.pl/akty-prawne/dzu-dziennik-ustaw/prawa-konsumenta-18105223/art-12) — ISAP consolidated PDF not fetched directly.
- Ustawa z 6.03.2018 — Prawo przedsiębiorców, art. 5 — DN rules confirmed on the official portal [biznes.gov.pl/pl/portal/00115](https://www.biznes.gov.pl/pl/portal/00115) (quarterly 225% limit from 1.01.2026; 10,813.50 PLN; 7-day registration; faktura on request).
- Ustawa z 12.07.2024 — Prawo komunikacji elektronicznej (Dz.U. 2024 poz. 1221), art. 399 — [sip.lex.pl mirror](https://sip.lex.pl/akty-prawne/dzu-dziennik-ustaw/prawo-komunikacji-elektronicznej-22035493/art-399).
- Ustawa z 18.07.2002 o świadczeniu usług drogą elektroniczną (Dz.U. 2002 nr 144 poz. 1204), art. 8 — [ISAP](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20021441204), text via [lexlege.pl](https://lexlege.pl/ustawa-o-swiadczeniu-uslug-droga-elektroniczna/art-8/).
- Ustawa z 23.09.2016 o pozasądowym rozwiązywaniu sporów konsumenckich (Dz.U. 2016 poz. 1823), art. 31–32 — [ISAP](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160001823), text via [lexlege.pl](https://lexlege.pl/pozas-rozw-sporow-kons/art-31/).
- Ustawa z 9.05.2014 o informowaniu o cenach towarów i usług, art. 4 ust. 2 — [UOKiK explanation](https://prawakonsumenta.uokik.gov.pl/prawo-do-informacji/informacje-o-obnizkach-cen/), [Wyjaśnienia Prezesa UOKiK (PDF)](https://uokik.gov.pl/storage/archiwum/e6e552a1.pdf).
- Ustawa z 11.03.2004 o podatku od towarów i usług, art. 106b ust. 3, art. 113; Ordynacja podatkowa, art. 87 § 1 — obligations confirmed on [biznes.gov.pl](https://www.biznes.gov.pl/pl/portal/00115); statute text via [sip.lex.pl](https://sip.lex.pl/akty-prawne/dzu-dziennik-ustaw/podatek-od-towarow-i-uslug-17086198/art-106-b).
- Rozporządzenie (UE) 2016/679 (RODO), art. 4, 6, 13, 29 — [EUR-Lex 32016R0679](https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX%3A32016R0679).
- Rozporządzenie (UE) 2024/3228 (repeal of ODR Regulation 524/2013) — [EUR-Lex OJ L 2024/3228](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202403228); shutdown dates also per [EU consumer centre notice](https://portal-cec.consumo.gob.es/en/comunicacion/noticias/2025/european-platform-online-dispute-resolution-will-cease-be-operational-20).
- UOKiK consumer-law portal (withdrawal effects, exclusions, non-conformity) — [prawakonsumenta.uokik.gov.pl](https://prawakonsumenta.uokik.gov.pl/).
- Stripe DPA / Privacy Center (controller-vs-processor roles) — [stripe.com/legal/dpa](https://stripe.com/legal/dpa), [stripe.com/legal/privacy-center](https://stripe.com/legal/privacy-center).

**Secondary (used where primary text not fetched directly; flagged inline):**
- Grant Thornton, Kancelaria KHM, Bird & Bird / Taylor Wessing (ODR), INFORLEX (rachunek/faktura Feb 2026 change — **unverified against the primary regulation**), poradnikprzedsiebiorcy.pl, prawodlabiznesu.eu / prawomarketingu.pl (UOKiK dark-patterns line).

---

*Research support prepared 2026-07-13 by an automated research agent. Not legal advice; a qualified Polish lawyer should review the final wording before launch.*
