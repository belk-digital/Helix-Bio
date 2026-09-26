# Helix Bio — Verified Fix Plan

**Source:** `docs/Helix_Bio_Search_Visibility_Plan.md` (25 Sep 2026)
**Verified:** 25 Sep 2026, against the live site (helixbiochem.com) and the codebase at `ed158bf`.
**Method:** every claim checkable without GSC/GA4/Clarity access was tested directly:
all 196 sitemap URLs fetched (status, canonical, robots meta, title, description), live JSON-LD parsed on 6 templates, `robots.txt` cross-checked against the sitemap, source code read for analytics, schema, shop and calculator.

Legend: **Confirmed** = reproduced. **Not reproduced** = live site/code contradicts the report. **Partly** = true with a correction. **Unverifiable** = needs GSC/GA4/Clarity/Bing data I don't have.

---

## 1. Claim-by-claim verification

| # | Report claim | Result | Evidence |
|---|---|---|---|
| 1 | GA4 has no ecommerce events | **Confirmed, but the cause differs** | The code *does* emit `view_item`, `add_to_cart`, `begin_checkout`, `purchase` (`ProductClient.tsx:300-355`, `CheckoutClient.tsx:385-406`, `OrderConfirmationClient.tsx:195-225`) — as **GTM-style `dataLayer.push({event, ecommerce})`**. The site loads plain **gtag.js** (`layout.tsx:51-63`), no GTM container anywhere. gtag.js ignores plain-object dataLayer pushes, so GA4 never receives them. Fix is a transport change, not new tracking. |
| 2 | Dev/team traffic pollutes GA4 | **Confirmed (code cause found)** | GA tag is gated only on the env var existing (`layout.tsx:51`, `(auth)/layout.tsx`). `.env.local` defines `NEXT_PUBLIC_GA_MEASUREMENT_ID`, so `localhost` hits the production property. No hostname/environment gate, so Vercel previews also fire. Team-IP filtering is GA4 admin work (not code). |
| 4 | Brand searches get 0 clicks; homepage title doesn't lead with brand | **Confirmed** | Live title: `Premium Research Peptides USA \| 99% Purity \| Helix Bio Chem`. Brand is last, and it's "Helix Bio **Chem**". |
| 5 | Calculator needs a conversion mode, Q&A headings, worked table, FAQ | **Partly — much already exists** | Live page has 1,930 words, a `UnitConverter` tab (mg↔mcg, mL↔IU), 10 question-form FAQ headings with answers in SSR HTML, a dilution table, worked example, `WebApplication` + `FAQPage` schema, and an H1 already containing "Syringe Conversion". **Genuinely missing:** blend-vial handling; *potency* IU conversion (the converter's IU is syringe units, not compound IU); the converter is a tab, so its content isn't a separate crawlable page; the calculator does not link out to two of the three guides. |
| 6 | Breadcrumb items are "Unnamed item" | **Not reproduced as an error** | Every `ListItem` on home, calculator, product, shop has a `name` in live JSON-LD. GSC labels any entity without a `name` property "Unnamed item"; `BreadcrumbList` has none by default, so this is most likely a cosmetic label. Confirm in the Rich Results Test whether an actual warning accompanies it before spending time. |
| 7 | Sitemap has 17 warnings | **Cause partly found** | All 196 URLs return 200, none redirect, canonical == `<loc>` for all 196, none noindexed. **`/refund-policy` is in the sitemap and blocked by `robots.txt`** (see N1). Other warnings can't be itemised without the GSC UI. |
| 8 | Product pages may lack meta description/canonical | **Not reproduced** | bpc-157, bpc-157-spray, semax-spray, pt-141-spray, glp-3rta all have unique title, description, canonical, og:title/description/image, twitter tags. 0 of 196 URLs lack a description. Only `og:url` is missing on product pages (minor). |
| 9 | Reagent-search impressions: don't chase | **Agree** | No code change. |
| 10 | Cannibalising page pairs | **Partly** | Guide→calculator links exist on all three guides. Missing: calculator→2 guides, `/affiliates`→explainer. DSIP blog→product, sermorelin→tesamorelin, GHS→GHRH links **already exist**. |
| 11 | Retatrutide product page not visible; `glp-3rta` is retatrutide | **Confirmed** | `scripts/rename-glp-products.ts` maps Retatrutide→GLP-3RTA (slug `glp-3rta`), Tirzepatide→GLP-1TRZ (`glp-1trz`). The old slugs `/product/retatrutide` and `/product/tirzepatide` now return **HTTP 200 "Product Not Found"** with no redirect (see N2, N3). Blog posts still use the real names (6 sitemap slugs), so the naming policy is inconsistent between products and content. |
| 12 | Mobile/shop friction | **Partly** | Shop SSR HTML contains 24 product links, so it isn't empty. On mobile the grid sits below an H1, intro paragraph and a 350px banner (`ShopClient.tsx:212-216`) that is `cursor-pointer` but not a link — a plausible dead-click source. Clarity sample is 3 days; still a hypothesis. |
| 13 | Six top-10 pages need snippet rewrites | **Partly** | Their titles/descriptions are already query-matched and 52–65 chars. Little to gain by rewriting blind; needs the actual ranking queries per page from GSC. |
| 14 | Bing/IndexNow unused | **Confirmed** | No IndexNow key file, code or env var; no `afterChange` hook on `BlogPosts`/`Products` collections. |
| 15 | Brand identity unclear | **Confirmed** | Organization schema = `Helix Bio Chem` (alt `Helix Bio`, `src/lib/schema.ts`), but 114 vs ~200 occurrences of the two names across `src/` + `messages/`; most titles end `\| Helix Bio`, home ends `\| Helix Bio Chem`, one blog title has no brand. `sameAs` lists X/Twitter (returned 404 to a bot check — unconfirmed) and Instagram (200). |
| 16 | GA4 vs GSC organic gap | **Unverifiable** | Needs GA4/GSC access; likely explained by #2. |
| — | 93% of impressions at positions 51–100; CTR/position tables; Clarity numbers; Trends | **Unverifiable** | GSC/Clarity/Trends data not accessible here. Not disputed. |

---

## 2. Issues the report missed (found during verification)

| ID | Issue | Evidence | Priority |
|---|---|---|---|
| **N1** | `/refund-policy` is blocked by robots.txt while listed in the sitemap | `robots.ts` has `Disallow: /ref` (meant for the `/ref/[slug]` affiliate route). Robots rules are prefix matches, so it also blocks `/refund-policy` and any future `/ref…` slug. Fix: disallow `/ref/`. | **P1**, 1 line |
| **N2** | Unknown URLs return HTTP **200**, not 404 | `/zzz-not-real-page` and `/product/zzz-not-real` both return 200 (with `<meta robots noindex>`). `loading.tsx` at `(frontend)/`, `product/[slug]/`, `shop/` flushes the shell before `notFound()` runs. Soft-404s dilute crawl signals. | **P1** |
| **N3** | Renamed product slugs have no redirect | `next.config.ts` `redirects()` returns `[]`. `/product/retatrutide` and `/product/tirzepatide` → 200 "Product Not Found". | **P1** |
| **N4** | Sitemap `lastmod` is fake for 14 static pages | All share the request timestamp (`2026-09-24T15:56:53Z`) because `sitemap.ts` uses `new Date()`. Google learns to ignore `lastmod`. | P2 |
| **N5** | Schema hygiene | (a) `WebSite.SearchAction` targets `/shop?q=` but the shop ignores `q` (`ShopClient.tsx` reads only category/price/sort). (b) Home `BreadcrumbList` has one item. (c) Shop breadcrumb lists `/shop` twice. (d) `og:url` missing on products. (e) `WebSite` node lacks `alternateName`. | P2 |
| **N6** | Purchase event only fires on confirmed payment | `OrderConfirmationClient.tsx:198` skips when payment is pending, so manual/asynchronous methods (bank/Zelle/crypto/hosted checkout) may never record a purchase even after they settle. Needs a server-side event. | P1 (after N-transport fix) |
| **N7** | ~10 blog titles exceed ~60 chars; brand suffix inconsistent | e.g. "Peptides for Sleep & Recovery: Epitalon, Selank, DSIP Research \| Helix Bio" (74 chars decoded). Lives in Payload CMS, not code. | P3 |

---

## 3. Fix plan

### Phase 1 — Same-day, code, low risk (≈ half a day)

| Task | Files | Acceptance check |
|---|---|---|
| **1.1 Robots prefix bug (N1).** Change `'/ref'` → `'/ref/'` | `src/app/robots.ts` | `curl /robots.txt` shows `Disallow: /ref/`; `/refund-policy` no longer matched by any Disallow. |
| **1.2 Fix GA4 transport (Issue 1).** Add `src/lib/analytics.ts` with `trackEvent(name, params)` → `window.gtag('event', name, params)` (no-op if `gtag` missing). Replace the 4 `dataLayer.push` blocks with it, same payloads. Use SKU (not DB id) for `item_id`. Keep the existing sessionStorage de-dupe guards. | `ProductClient.tsx`, `CheckoutClient.tsx`, `OrderConfirmationClient.tsx`, new `src/lib/analytics.ts` | GA4 **DebugView** shows `view_item`, `add_to_cart`, `begin_checkout`, `purchase` with `value`/`items` from a test order. |
| **1.3 Gate GA/Clarity to production (Issue 2).** Render both tags only when `process.env.VERCEL_ENV === 'production'` in both root layouts. Remove `NEXT_PUBLIC_GA_MEASUREMENT_ID` from local `.env.local`. | `(frontend)/layout.tsx`, `(auth)/layout.tsx` | Dev server and a Vercel preview send no GA hits (Network tab / GA Realtime). |
| **1.4 Sitemap `lastmod` (N4).** Drop `lastModified` for static paths (or hard-code real dates). | `src/app/sitemap.ts` | Static `<url>` entries have no or stable `<lastmod>`. |
| **1.5 Schema hygiene (N5).** Remove `SearchAction`; drop 1-item home breadcrumb; remove duplicate `/shop` crumb; add `og:url` to product metadata; add `alternateName` to `WebSite`; add `name` to every `BreadcrumbList` (harmless hedge for the "Unnamed item" label). | `src/lib/schema.ts`, `(frontend)/page.tsx`, `shop/page.tsx`, `product/[slug]/page.tsx` | Rich Results Test: no new warnings; breadcrumbs still valid. |
| **1.6 Calculator hub links + affiliates link.** Add calculator→`/peptide-concentration-calculation-…` and `/peptide-reconstitution-guide-…` (guide→dosage link already exists); add `/affiliates`→explainer. | `PeptideCalculatorClient.tsx`, affiliates client | Live HTML contains the three `href`s. |

### Phase 2 — Needs a small design decision (≈ 1 day)

| Task | Detail |
|---|---|
| **2.1 Real 404 status (N2).** Options: (a) do the existence check for `product/[slug]` and blog `[slug]` in a parent segment/`proxy` before the Suspense boundary, or (b) remove `loading.tsx` on those two routes. Prefer (a) to keep the skeleton. Verify with `curl -I`. | Test first on a preview; the shop and account skeletons are separate. |
| **2.2 301s for renamed slugs (N3).** Add `redirects()` for `/product/retatrutide`→`/product/glp-3rta`, `/product/tirzepatide`→`/product/glp-1trz` (+ spray variants if they existed). **Client must confirm the rename is permanent first.** | `next.config.ts`. `curl -I` shows 308→200. |
| **2.3 Server-side `purchase` (N6).** Send GA4 Measurement Protocol `purchase` from the payment-confirmation path (webhooks/`checkout/actions.ts`), keyed on `transaction_id` to de-dupe against the client event. Needs an MP API secret. | Reconcile GA4 purchases vs Payload paid orders for a week. |
| **2.4 Calculator gaps (Issue 5).** Add blend-vial handling; a potency-IU conversion **only** for compounds with an established published factor, with a source line and RUO framing; consider a crawlable `/peptide-unit-converter` page instead of a tab. Expect small ranking effect on its own (on-page content is already substantial; position ~80 is mainly authority). | Owner to approve compound list and copy (compliance). |
| **2.5 IndexNow (Issue 14).** Add key file `public/<key>.txt`, env `INDEXNOW_KEY`, `afterChange` hooks on `BlogPosts` and `Products` that POST the changed URL, plus a script to resubmit the full sitemap. | Bing Webmaster → URL Submission shows accepted submissions. |
| **2.6 Mobile shop (Issue 12).** Shrink/remove the banner on mobile so products start in the first viewport; make the banner a real link or non-interactive. | Re-check Clarity quickbacks on `/shop` after ≥2 weeks. |

### Phase 3 — Not code (owner: SEO/client)

| Task | Owner |
|---|---|
| GA4 admin: define internal traffic by IP, activate the data filter, mark `purchase` a key event | SEO |
| Decide canonical brand: "Helix Bio" **or** "Helix Bio Chem"; then align titles (home first), `WebSite.name`, blog title suffix, and the ~10 over-length blog titles in the CMS | Client → SEO |
| Confirm the X/Twitter and Instagram profiles are real and owned; remove any that aren't from `sameAs` | Client |
| Retatrutide/tirzepatide naming policy: products are masked but blog posts use the real names — decide whether that is intended | Client |
| In the GSC sitemap report, read the 17 warnings and resubmit sitemap in GSC + Bing after 1.1/1.4 ship | SEO |
| Pull the ranking queries for the six top-10 pages; rewrite titles only where they don't match the query | SEO |
| BPC-157 long-tail content (report §17) | Content, after Phase 1 |

---

## 4. Sequencing and risk

1. Ship **1.1–1.6** together (one deploy). None changes visible UI except two added links.
2. Measure: GA4 DebugView with a test order **before** any content work, so later changes are attributable (the report's own rule).
3. **2.1 and 2.2** touch routing — test on a preview, check `curl -I` for 200 pages, real 404s and 308s before promoting.
4. Don't edit the tested pages (E1–E4 in the report) during their observation windows; the Phase 1 edits above avoid those pages' titles/copy.

## 5. What could not be verified

GSC positions/CTR/impressions, sitemap warning text, GA4 sessions and events (I inferred the event problem from code, not from GA4), Clarity behaviour, Bing data, Semrush, Core Web Vitals. Anything that depends on those should be re-checked by whoever holds access.

---

# 6. Implementation status (25 Sep 2026)

**Decisions received:** canonical brand text is **"Helix Bio Chem"** (logo unchanged) · **no redirects** · the social profiles are **not real**.
**Verification:** `next build` passes (exit 0); production build run locally and tested; `tsc` clean; ESLint clean on changed files; integration test `order-confirmation` 8/8 (updated to assert the real gtag call shape).

## Done in code (uncommitted in the working tree — review, then deploy)

| # | Change | Files |
|---|---|---|
| 1.1 | `/refund-policy` no longer blocked. Every private rule is now exact (`/cart$`) **plus** directory (`/cart/`), so no future slug can be caught by prefix matching | `src/app/robots.ts` |
| 1.2 | GA4 events now sent with `gtag('event', …)` via one helper (was GTM-style pushes that gtag.js ignores) | `src/lib/analytics.ts`, `ProductClient`, `CheckoutClient`, `OrderConfirmationClient` |
| 1.3 | GA4 + Clarity only in production deployments **and** only on the production hostname (`ga-disable-<id>` otherwise) | `src/lib/analyticsConfig.ts`, both root layouts |
| 1.4 | Sitemap `lastmod` is truthful: dropped on undated static pages; home/shop/blog derive it from newest product/post | `src/app/sitemap.ts` |
| 1.5 | Schema: fake `sameAs` removed; invalid `SearchAction` removed; `alternateName` on WebSite; 1-item home breadcrumb and duplicate shop crumb removed; `og:url` on products | `src/lib/schema.ts`, `page.tsx` (home/shop/product) |
| 1.6 | Calculator → 3 guides ("Related Research Guides"); `/affiliates` → explainer | `PeptideCalculatorClient.tsx`, `AffiliatesLandingClient.tsx` |
| 2.1 | **Real HTTP 404** for unknown URLs, unknown/draft products and unknown posts (were 200). Required removing the root `(frontend)/loading.tsx` (a homepage skeleton wrapping every page) and adding a Suspense boundary to the cart | `routeGuards.ts`, 3 segment layouts, `cart/page.tsx` |
| 2.2 | **Skipped by decision** (no redirects). Old slugs (`/product/retatrutide`, `/product/tirzepatide`) now return a proper 404 | — |
| 2.4 | Calculator: **Blend Vial** tab (multi-peptide reconstitution); converter gains **potency IU** driven by a user-entered IU-per-mg factor (no compound factors are asserted); syringe "units" relabelled to stop clashing with IU; 2 answer-format FAQs (+ FAQPage schema) | `BlendReconstitution.tsx`, `UnitConverter.tsx`, `CalculatorsHub.tsx`, `messages/en.json`, `peptide-calculator/page.tsx` |
| 2.5 | **IndexNow**: key file route + rewrite, `afterChange`/`afterDelete` hooks on Products and BlogPosts, bulk script. Inert until `INDEXNOW_KEY` is set | `src/lib/indexnow.ts`, `src/hooks/indexnow.ts`, `api/indexnow/key`, `next.config.ts`, `scripts/indexnow-submit-all.ts` |
| 2.6 | Mobile shop: decorative banner and stat cards hidden below `sm`, so products start in the first screen; dead "button" in the banner removed | `ShopClient.tsx` |
| 3.x | Brand → "Helix Bio Chem" in 39 files (titles, schema, emails, llms, OG). Homepage title is now brand-first: `Helix Bio Chem \| Premium Research Peptides USA \| 99% Purity`. `Helix Bio` kept only as `alternateName`. localStorage cart key deliberately **not** renamed (would empty customers' carts) | many |

**Additional issues found and fixed (not in the original report)**

| Issue | Fix |
|---|---|
| Product schema claimed **free shipping, 0–1 day handling, invalid unit code `d`** — contradicting real rates (Standard $25 / Express $50, from ShippingZones/checkout) and the Shipping Policy (1–3 business day review) | Shipping now built from the real methods, `unitCode: DAY`, handling 1–3 days; shipping + return + `priceValidUntil` attached to **every variant Offer** (Google evaluates merchant listings per Offer) |
| Draft/archived products publicly reachable (Payload local API bypasses access rules) | Product page, metadata and guard require `status: active` |
| `llms.txt` listed **2 of 87** articles and told AI systems not to use other URLs; category list was stale | `/llms.txt` is now generated from the CMS (all articles + real categories, hourly refresh); `llms-full.txt` points to it |
| Unencoded space in a schema `image` URL (fallback image) | `encodeURI` |

**CMS data written (via `scripts/align-brand-cms.ts`, dry-run by default):** 147 blog `meta.title` / product `seoTitle` values and the blog author name were changed from "… | Helix Bio" to "… | Helix Bio Chem". Note: the first run wrote a partial batch before it was interrupted, then it was completed; the final dry-run reports 0 remaining. Titles that would exceed 66 characters were **not** touched (below).

## Still needs a human

1. **Set `INDEXNOW_KEY`** in Vercel (any 8–128 char `a-zA-Z0-9-`), deploy, confirm `https://helixbiochem.com/<key>.txt` returns the key, then run `INDEXNOW_KEY=… npx tsx scripts/indexnow-submit-all.ts` once. Add the same variable to `.env.local` only if you want to test.
2. **GA4 admin (not code):** define internal traffic by IP and activate the filter; mark `purchase` as a key event; verify with DebugView.
3. **Shorten 18 CMS titles** that are too long once "Chem" is added (the script lists them: `npx tsx --env-file=.env.local scripts/align-brand-cms.ts`). Examples: blog #5, #7, #8, #19; products #158, #183, #185, #196, #202. Also blog #18 has no brand in its title.
4. **Server-side `purchase` (N6) — deliberately not built.** Attribution needs the GA `client_id` stored on each order (new `Orders` field ⇒ a manually-applied migration in the payments path) plus a GA Measurement Protocol API secret. Decide whether to accept that change; until then Zelle/bank/crypto sales that complete after the customer leaves the page will not register as GA4 purchases.
5. **Confirm on Vercel:** `http://www.helixbiochem.com` takes two 308 hops (→ https://www → apex); make www redirect straight to the apex. The legacy host `helix-bio.vercel.app` serves the full site (canonical already points to the primary domain).
6. **Content/compliance decisions for the client:**
   - Product variant SKUs expose masked names in schema (e.g. `RETATR-10MG` on GLP-3RTA) while the visible name is masked.
   - Blog posts use the real compound names while products are masked.
   - `llms.txt`/homepage claim "≥99% purity" per batch, but the footer says "certain items may test below 99%" — reconcile.
   - The calculator hub includes BMI/BMR and Creatinine-Clearance calculators, which sit awkwardly with research-use-only positioning.
   - `<meta name="google" content="notranslate">` is still on every page (undecided).
   - Once real profiles exist, add them to `sameAs` in `src/lib/schema.ts`.
7. **Unencoded spaces in static image paths** (`/HelixBio Images/…`) remain in ~40 components (browsers encode them; low risk). A rename or bulk-encode is a separate, larger change — not done.

## Behaviour changes to be aware of

- The site no longer shows the homepage skeleton while other pages load (it was wrong for every page but `/`). Product, shop, account and order pages keep their own skeletons; the global navigation spinner is unchanged.
- Blog/product pages now do one extra lightweight `count` query for the existence check (cached per request).
- Preview deployments and localhost no longer send analytics.
