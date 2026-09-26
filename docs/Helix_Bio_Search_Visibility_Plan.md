# Helix Bio — Search Visibility Acceleration Plan (1–2 Day Execution)

**Project:** Helix Bio (helixbiochem.com), U.S. organic search only
**Prepared:** 25 September 2026
**Data window:** 7 August – 22 September 2026. Meaningful helixbiochem.com data starts on 7 August, when the domain went live.

**Confirmed properties**

| Source | Property | Notes |
|---|---|---|
| Google Search Console | `sc-domain:helixbiochem.com` | |
| GA4 | 549457557 | Filtered to hostName = helixbiochem.com |
| Bing Webmaster | `https://helixbiochem.com/` | |
| Microsoft Clarity | Helix Bio project | Confirmed by client |
| Google Trends | TrendsMCP | Index values only, 90-day history, region not selectable |

**Excluded as a separate project:** 99puritypeptides.com, 99puritywholesale.com, and the legacy helix-bio.vercel.app host.

**Data not available:** Semrush. The account needs more API units to run keyword-volume and competitor reports.

---

## About the timeline

All the work in this plan can be done in 1–2 days. The results cannot appear that fast:

- Google and Bing need to recrawl each changed page, which usually takes days to a few weeks.
- Search Console data runs about 2–3 days behind.
- Ranking changes usually take 2–8 weeks to settle.

So the plan runs on two clocks:

| Clock | What happens |
|---|---|
| Days 1–2 | Execute every fix |
| Days 3–30 | Measure the effect, change nothing else on the tested pages, then decide what's next |

---

## 1. Executive Summary

Helix Bio is visible in Google, but almost entirely in positions nobody clicks. Over the last 28 days:

| Metric | Value |
|---|---:|
| U.S. impressions per day | 125.5 |
| U.S. clicks per day | 0.43 |
| U.S. CTR | 0.34% |

The problems in brief:

1. **Deep rankings.** 93% of attributable U.S. impressions come from positions 51–100, pages 6–10 of Google. Only 32 queries rank in the top 10, and most are brand or trivial queries.
2. **One page carries a quarter of the visibility.** The peptide calculator holds 27% of all U.S. impressions but sits around position 80.
3. **The brand search doesn't get clicks.** A search for "helix bio" shows the homepage at position 3, 71 times, with zero clicks.
4. **Sales can't be measured.** GA4 has no ecommerce tracking. Revenue, add-to-cart and checkout are all invisible, so there's no way to tell whether any SEO work makes money.
5. **The biggest compounds are invisible.** BPC-157 product pages are indexed and valid but get no U.S. impressions. Retatrutide's product page gets none either.

**Reality check.** The targets are 10,000 impressions a day, about 80× today, and a 10% CTR, about 29× today. Current evidence doesn't support reaching either in 2 days or in 14. The plan below is the fastest legitimate route toward them:

- fix measurement
- win the brand search
- rebuild the one page that already has the most visibility
- clean up the technical issues that weaken how the site appears in search

---

## 2. Current U.S. Baseline (Google Search Console)

### 2.1 Traffic over time

| Window | Impressions | Impr./day | Clicks | Clicks/day | CTR |
|---|---:|---:|---:|---:|---:|
| 7 Aug – 22 Sep (47 days) | 4,460 | 94.9 | 18 | 0.38 | 0.40% |
| **Last 28 days (26 Aug – 22 Sep)** | **3,514** | **125.5** | **12** | **0.43** | **0.34%** |
| Last 14 days | 1,715 | 122.5 | 8 | 0.57 | 0.47% |
| Last 7 days | 791 | 113.0 | 5 | 0.71 | 0.63% |
| First 14 days (8–21 Aug) | 717 | 51.2 | 5 | 0.36 | 0.70% |

- **Equivalents:** about 879 impressions a week; about 3,765 impressions and 13 clicks a month (30-day basis).
- **Trend:** impressions grew about 2.4× after the first two weeks, then flattened from about 30 August at 72–246 a day. Growth has stalled.
- **Average position:** 63.1 over 47 days (impression-weighted).

### 2.2 Where the site ranks

654 U.S. queries account for 3,258 of the 4,460 impressions. Google hides the rest (27%) for privacy.

| Position | Queries | Impressions | Clicks |
|---|---:|---:|---:|
| 1–3 | 14 | 94 | 0 |
| 4–10 | 18 | 58 | 0 |
| 11–20 | 4 | 5 | 0 |
| 21–50 | 29 | 57 | 0 |
| 51–100 | 582 | 3,030 | 2 |
| 100+ | 7 | 14 | 1 |

### 2.3 What people search for (U.S.)

| Cluster | Queries | Impressions | Clicks | Avg position |
|---|---:|---:|---:|---:|
| Calculator / reconstitution / dosing math | 160 | 1,212 | 1 | 79.8 |
| Compound and product names | 445 | 1,451 | 2 | 76.0 |
| Lab-reagent mismatch ("antibody", "ELISA kit") | 19 | 285 | 0 | 77.3 |
| Affiliate program | 8 | 163 | 0 | 75.7 |
| Brand (contains "helix") | 22 | 147 | 0 | 26.7 |

### 2.4 Devices (U.S., 47 days)

| Device | Share of impressions | Avg position | CTR | Clicks |
|---|---:|---:|---:|---:|
| Desktop | 90.4% | 64.8 | 0.10% | 4 |
| Mobile | 9.6% | 46.7 | 3.26% | 14 |

Mobile produces 78% of the clicks from only about 10% of impressions.

### 2.5 Top U.S. pages by impressions

| Page | Impressions | Avg position |
|---|---:|---:|
| /peptide-calculator | 1,220 | 79.8 |
| /product/kisspeptin | 231 | 85.8 |
| /product/dsip | 214 | 82.9 |
| /shop | 211 | 88.6 |
| /affiliates | 159 | 77.1 |
| /product/vip | 124 | 75.6 |
| / (homepage) | 115 | 15.2 |
| /product/thymosin-alpha-1 | 83 | 85.4 |
| /product/ara-290 | 81 | 71.8 |

**Search appearance (all countries):** Product snippets had 1,693 impressions and 6 clicks. Merchant listings had 2 impressions.

---

## 3. Target Gap

| Metric | Current (28-day) | Target | Gap |
|---|---:|---:|---:|
| U.S. impressions/day | 125.5 | 10,000 | 9,874.5 (+7,868%, 79.7×) |
| U.S. CTR | 0.34% | 10% | 9.66 percentage points |

**Implied clicks per day**

| Scenario | Calculation | Clicks/day |
|---|---|---:|
| Current impressions, current CTR | 125.5 × 0.34% | 0.43 |
| 10,000 impressions, current CTR | 10,000 × 0.34% | 34 |
| 10,000 impressions, 10% CTR | 10,000 × 10% | 1,000 (≈30,000/month) |

---

## 4. Can the Targets Be Supported by Current Evidence?

| Component | Classification | Reason |
|---|---|---|
| 10,000 U.S. impressions/day | **Not currently supported by evidence** | See below. |
| 10% average CTR | **Not currently supported by evidence** | See below. |
| Brand-search CTR improvement | **Potentially achievable** | Brand is already at position 3. This is a presentation problem, not an authority problem. |
| Calculator page reaching Google pages 1–2 | **Requires significant growth** | Largest impression pool, but the search results are crowded with established calculators. |
| Measurable revenue impact | **Not currently supported** | Ecommerce tracking doesn't exist yet. |

**Why 10,000 impressions a day isn't supported:**
- It is an 80× increase.
- The site is seven weeks old and has plateaued for four weeks.
- There is no keyword-volume data to size the reachable market.

**Why a 10% CTR isn't supported:**
- 93% of impressions sit at positions 51–100, where clicks are close to zero.
- A 10% blended CTR generally needs most impressions to come from top-3 or brand positions.
- Only 94 U.S. impressions in 47 days did.

**Statistical note.** At about 0.4 clicks a day, a CTR change can't be detected even over 14 days. Doubling clicks would still look like noise. Daily impressions swing between 72 and 246, so only large effects will show. Results should be judged at day 28, not day 2 or day 14.

---

## 5. Issues Explained: What's Wrong and Why It Needs Fixing

Each issue lists what it is, the evidence, why it matters, the fix, and the priority.

- **P0:** must fix; blocks everything else.
- **P1:** high impact.
- **P2:** worthwhile.
- **P3:** low.

---

### Issue 1 — Sales and conversions are not tracked (P0)

**What it is.** GA4 records only basic events: page views, scrolls, form starts and clicks. There is no `view_item`, `add_to_cart`, `begin_checkout` or `purchase` event. Key events, purchases and revenue read zero across every channel and country.

**Evidence.** GA4 event list for 6 Aug – 22 Sep:

| Event | Count |
|---|---:|
| page_view | 2,814 |
| session_start | 986 |
| user_engagement | 761 |
| first_visit | 426 |
| scroll | 386 |
| form_start | 70 |
| click | 8 |

**Why it matters.** The goal is revenue from search, not impressions. Without purchase tracking:
- Nobody can tell whether organic visitors buy.
- Nobody can tell which pages drive sales, or whether any change in this plan paid off.
- Traffic could double while sales fall, and the data would never show it.

The current conversion rate isn't zero; it's **unknown**, which is worse.

**Fix.**
- Implement the GA4 ecommerce events on product, cart and checkout.
- Mark `purchase` (and optionally `add_to_cart`) as key events.
- Verify in GA4 DebugView with a test order.

---

### Issue 2 — Team and development traffic is polluting GA4 (P0)

**What it is.** A large share of GA4 sessions appear to come from the team building the site, not from customers.

**Evidence.**
- India/Direct shows 282 sessions from only 27 users, about 10.4 sessions each. Real customers don't behave that way; developers do.
- The property also receives hits from `localhost` (46 sessions in 90 days) and the old `helix-bio.vercel.app` host (10).

**Why it matters.** Internal visits distort every behaviour metric: engagement rate, time on page, pages per session. Internal sessions also inflate the desktop figures in Clarity; desktop averages 457 seconds of engagement, which isn't plausible for shoppers. If the baseline is contaminated, the before/after comparison is meaningless.

**Fix.**
- Define internal traffic by IP in GA4 and activate the filter.
- Stop the GA4 tag from firing on localhost and preview/staging hosts.
- Apply `hostName = helixbiochem.com` in every report.

---

### Issue 3 — Rankings are too deep to generate clicks (P1)

**What it is.** The site appears for hundreds of queries, but almost always on pages 6–10 of Google.

**Evidence.** 3,030 of 3,258 attributable U.S. impressions (93%) are at positions 51–100. Only 4 queries sit at positions 11–20, so there is almost no "page 2" to push onto page 1.

**Why it matters.**
- Impressions at position 80 mean the page was shown to someone (or some tool) scrolling very deep. They produce near-zero clicks.
- They make the site look more visible than it is. 125 impressions a day sounds reasonable, but it yields under one click every two days.
- Desktop carries 90% of these deep impressions at a 0.10% CTR. Some are likely automated rank-checking tools; that part is inference, since Google doesn't label them.

**Fix.** There is no single switch. This is an authority and relevance problem for a seven-week-old domain. The plan concentrates effort on the pages with the most existing impressions (the calculator), the pages already near the top (§15), and the brand search, instead of spreading thin across hundreds of weak rankings.

---

### Issue 4 — People searching for "Helix Bio" by name don't click (P1)

**What it is.** When someone searches the brand, the homepage shows but gets no clicks.

**Evidence.**

| Query | Position | Impressions | Clicks |
|---|---:|---:|---:|
| helix bio | 3 | 71 | 0 |
| helixbio | 6 | 21 | 0 |

More variants — "helix research peptides", "heliabiochem", "helix peptides", "helixpep" — also have low or no clicks.

**Why it matters.** Brand searchers are the highest-intent visitors a site has; they are looking for this company. Normally brand queries are where a site's best CTR comes from. Zero clicks at position 3 means something is wrong with the result, most likely:
- The title and description don't clearly say "this is Helix Bio, the research peptide supplier."
- Other companies with "Helix" in their name compete for the same searches.
- The name used across the site is inconsistent: "Helix Bio", "HelixBioChem" and 99Purity Peptides as the operating entity.

This is the fastest and cheapest CTR win available.

**Fix.**
- Rewrite the homepage title and meta description to lead with the exact brand plus what the company does. The current title couldn't be read from here because the site blocks automated fetches; confirm it before editing.
- Add Organization schema with one canonical name, `alternateName` for variants, and `sameAs` links to real profiles only.

---

### Issue 5 — The calculator page holds the most visibility but ranks around 80 (P1)

**What it is.** /peptide-calculator is the site's biggest search asset but is buried.

**Evidence.**
- 1,220 U.S. impressions in 47 days, 27% of the site's U.S. total, at average position 79.8.
- It appears for about 160 query variants: "peptide calculator", "peptide reconstitution calculator", "peptide dosage calculator", "peptide mixing calculator" and more.
- On Bing, the site already ranks at positions 2–7 for unit-conversion searches such as "mcg to iu calculator" and "iu to mg calculator".

**Why it matters.**
- This is the one page where moving up would noticeably change the site's total visibility. Moving from position 80 into the top 20 multiplies the impressions and clicks this cluster can produce.
- The results page is crowded (§19): a national pharmacy brand, dedicated calculator sites, and competitor vendor calculators. Many offer syringe-unit output, peptide presets, blend guidance and worked examples. To compete, Helix needs at least the same features plus something distinctive.
- The Bing data points to that differentiator: mg / mcg / IU / syringe-unit conversion.

**Fix.**
- Add a conversion mode and blend handling.
- Add question-style headings with short direct answers, and a worked-example table.
- Link the three related guides to the calculator and back.
- Keep all copy research-use-only, with no dosing recommendations.

---

### Issue 6 — Breadcrumb schema is broken on every page checked (P1)

**What it is.** The structured data describing the breadcrumb trail is missing item names.

**Evidence.** URL Inspection on /peptide-calculator, /product/bpc-157 and /product/bpc-157-spray all report the breadcrumb as "Unnamed item".

**Why it matters.** Google uses breadcrumb data to show the page path in results and to understand site structure. Nameless items give Google nothing to display and weaken the site's structural signals. It's a sitewide template bug, so one fix repairs every page.

**Fix.** Populate `name` for each `ListItem` in the BreadcrumbList. Keep the three-level trail (Home > Shop > Product) that matches the visible breadcrumb.

---

### Issue 7 — Sitemap has warnings and hasn't been resubmitted (P1)

**What it is.** The Google sitemap was last submitted on 6 August and carries warnings.

**Evidence.**
- Google: 196 URLs submitted, 17 warnings, 0 errors.
- Bing: 192 URLs, status "Success", last crawled 23 September.

**Why it matters.** Many pages and blog posts have been added since August. Warnings can mean Google is ignoring some listed URLs. The API doesn't itemize them, so they have to be read in the Search Console interface. A clean, current sitemap is how new pages get discovered quickly.

**Fix.** Open the sitemap report in GSC, resolve the 17 warnings, and resubmit to Google and Bing.

---

### Issue 8 — Product pages may be missing meta descriptions (P1, verify first)

**What it is.** In an earlier session, product pages (for example /product/semax-spray) emitted no meta description, canonical or social tags, while the shop page did. **This was not re-verified in this audit** because the live site blocked automated access.

**Why it matters.** Without a meta description, Google writes its own snippet from page text, and it's often a poor one. That directly weakens CTR on every product page, which are the pages closest to a sale.

**Fix.** Check the page source of three product pages. If the tags are missing, populate unique meta descriptions and canonical tags per product.

---

### Issue 9 — Some visibility is for the wrong audience (P3; don't chase)

**What it is.** Product pages appear for laboratory reagent searches: people looking for antibodies and ELISA test kits, not peptides.

**Evidence.** 19 queries and 285 U.S. impressions (8.7% of the attributable total). Examples:
- "kisspeptin antibody"
- "vip receptor 1 elisa kit"
- "dehydroepiandrosterone antibody"
- "hcg receptor antibody"

They land on /product/kisspeptin, /product/vip, /product/dhea and /product/hcg at positions 53–87.

**Why it matters.** These searchers will never buy from Helix. Chasing them would inflate impressions without producing a single sale, which is exactly what the brief says not to do. The point here is to keep these impressions out of the success metrics, not to change the pages.

**Fix.** No page change. Exclude these queries when reporting "qualified" impressions.

---

### Issue 10 — Pages competing with each other (P2)

**What it is.** For a few searches, two Helix pages rank for the same query and split Google's attention.

**Evidence.**

| Query | Pages ranking |
|---|---|
| peptide affiliate program | /affiliates (75); /research-peptide-affiliate-programs-explained (65) |
| dsip coa | DSIP blog (45); /product/dsip (75) |
| peptide concentration | /peptide-calculator (74); the concentration-math blog (65) |

**Why it matters.** When two pages send mixed signals, Google often ranks both lower than one clear page would rank alone. The stakes are low today because all are at position 45 or worse, but the pattern should be fixed before it scales.

**Fix.** Give each page a clear job and link them. For the affiliate pair, /affiliates is for joining and the blog is for explaining, and the blog links to /affiliates. Do the same with the DSIP pair and the calculator cluster.

---

### Issue 11 — The biggest compounds are invisible in search (P2)

**What it is.** Helix's most-searched compounds get almost no U.S. visibility.

**Evidence.**
- /product/bpc-157 and /product/bpc-157-spray are indexed with valid Product markup but have no U.S. impressions.
- BPC-157 is the only rising term in Trends: +8.8% over 3 months, +4.2% over 1 month.
- Retatrutide has no product-page impressions. Clarity shows product URLs /product/glp-3rta and /product/glp-3rta-spray; these appear to be the retatrutide product under a code name. **This is inferred and needs client confirmation.**

**Why it matters.**
- BPC-157 is a highly competitive term dominated by established sites. A seven-week-old domain won't rank for it quickly, so expecting sales from it in the short term would be a planning error.
- If the retatrutide product page doesn't use the word "retatrutide", Google has little reason to show it for retatrutide searches. That may be a deliberate compliance choice, so it is a client decision, not an SEO fix.

**Fix.**
- BPC-157: long-tail supporting content (e.g. explaining the July 2026 advisory committee outcome) linked to the product pages. This is a days 3–30 item.
- Retatrutide: ask the client whether the product page may name the compound.

---

### Issue 12 — Mobile visitors and shop visitors leave quickly (P2, small sample)

**What it is.** Clarity shows signs of friction, but on a very small sample. The API only returns the last 3 days (23–25 September, 27 sessions).

**Evidence.**

| Signal | Value |
|---|---|
| /shop | 6 quickbacks in 12 sessions (50%) |
| Mobile | 15 quickbacks in 17 sessions |
| Mobile avg scroll depth | 32% |
| Mobile avg engagement | 27 seconds |
| Dead clicks | 1 on /account, 1 on /contact-us |

No rage clicks or JavaScript errors were recorded.

**Why it matters.** Mobile visitors click through from Google at 3.26% versus 0.10% on desktop, so they are the most valuable search visitors. If they arrive and bounce straight back, the traffic is wasted. An earlier review noted the shop grid sat behind "Load More" and at one point showed "No Products Found". If a visitor lands on the shop and doesn't immediately see products, they leave.

**Fix.** Watch the Clarity recordings for mobile /shop sessions. Make sure products and filters show on the first screen. Identify and fix the dead-click elements. Treat these as hypotheses until more data accumulates.

---

### Issue 13 — Pages already in Google's top 10 get no clicks (P1)

**What it is.** A handful of pages already rank on page 1 but aren't earning clicks.

**Evidence.** Page-level data, all countries, 9–22 September:

| Page | Impressions | Position | Clicks |
|---|---:|---:|---:|
| /growth-hormone-secretagogues-muscle-research-evidence | 44 | 7.4 | 0 |
| /mots-c-peptide-research-ampk-mitochondria-humanin | 20 | 8.8 | 0 |
| /glow-vs-klow-peptide-blend-comparison | 10 | 7.1 | 0 |
| /peptide-research-evidence-grading-methodology | 9 | 5.3 | 0 |
| /ghrh-analogues-vs-ghrps | 7 | 6.1 | 0 |
| /product/pt-141-spray | 18 | 7.8 | 3 |

**Why it matters.** These pages already did the hard part of reaching page 1. What's left is making the search listing convincing: a clear title and a description that answers the searcher's question. It's cheap to fix, though the volumes are small, so it won't move the site total much on its own.

**Fix.** Rewrite titles and meta descriptions to match what people actually searched for. No clickbait and no claims the page can't back up.

---

### Issue 14 — Bing visibility is not being used (P2)

**What it is.** Bing ranks Helix much higher than Google for long-tail searches, and nobody is feeding it updates.

**Evidence.**
- Bing: 361 impressions and 4 clicks over 42 days; 239 impressions in the last 14 days, including a spike of 89 on 19 September.
- No crawl issues.
- Positions 1–10 for many long-tail and unit-conversion queries.
- Several long queries name the domain directly, e.g. "helixbiochem.com dihexa kisspeptin ss-31 ara-290 research" at position 2. These look like AI-assistant (Copilot-style) retrieval queries; that is inference, since Bing doesn't label the source.

**Why it matters.**
- Bing is where Helix already ranks well, so updates there show results sooner.
- Bing also feeds Microsoft Copilot, so strong Bing visibility supports AI-search visibility.
- Bing supports instant URL submission (IndexNow), so changed pages can be recrawled within hours instead of weeks.

**Fix.** Submit every changed URL through IndexNow or Bing URL submission as soon as it's edited, and resubmit the sitemap.

---

### Issue 15 — The brand identity is unclear to search engines and AI systems (P2)

**What it is.** The site uses several names for the same business.

**Evidence.** "Helix Bio" is the customer brand, "HelixBioChem" is the domain, and 99Purity Peptides has been identified as the operating/legal entity in earlier work. Brand searches also collide with other "Helix" companies.

**Why it matters.** Search engines and AI assistants build a picture of who a business is. Mixed names split that picture, which weakens both the brand search (Issue 4) and the chance of being cited by AI systems. There is no evidence yet of Helix being cited in Google AI Overviews, ChatGPT or Perplexity; this is about improving citation potential, not a claim that citations will happen.

**Fix.** One canonical organization name in schema and titles, with the other names as `alternateName`. The client must confirm which name is canonical and which profiles are real.

---

### Issue 16 — GA4 and Search Console disagree on organic visits (P2)

**What it is.** The two tools don't line up.

**Evidence.** GA4 counts 69 U.S. organic search sessions (from Google, Bing, DuckDuckGo, Yahoo and Dogpile) against 18 U.S. Google clicks in Search Console over the same period.

**Why it matters.** Some gap is normal, because the tools count differently and GA4 includes other search engines. This gap is larger than usual, and the cause needs to be known before either number is trusted as a baseline. Likely causes:
- the team arriving via Google searches (links to Issue 2)
- GA4 splitting sessions
- clicks Google hides for privacy

**Fix.** Recheck after the internal-traffic filter is live, comparing Google-only organic sessions with GSC clicks.

---

## 6. Findings by Data Source

### 6.1 Google Search Console

- **Indexing is not the problem.** All three inspected URLs are "Submitted and indexed", self-canonical, allowed by robots and crawled as mobile.
- **Product snippet markup is valid.** The only warnings are the optional `aggregateRating` and `review` fields. Don't invent these; add them only if real reviews exist.
- **Data caveats:**
  - Page×country tables omit some pages. For example, /product/pt-141-spray shows 3 clicks in page-level data but has no country row.
  - Page-level and property-level average positions differ because they are calculated differently.

### 6.2 GA4

| Metric (U.S. organic, 6 Aug – 22 Sep) | Value |
|---|---:|
| Sessions | 69 |
| Users | 51 |
| Engaged sessions | 48 |
| Engagement rate | 69.6% |

- The engagement rate is healthy: visitors who do arrive engage.
- Engaged landing pages include / (8 mobile sessions), /product/tesamorelin (5), /product/pt-141-spray (3) and /cagrilintide-amylin-receptor-research-cagrisema (2 sessions, about 10 minutes each).
- AI Assistant channel: 11 sessions in total, 5 of them from the U.S.

### 6.3 Bing

See Issue 14.

### 6.4 Microsoft Clarity (23–25 Sep only)

| Page | Sessions | Quickbacks | Dead clicks |
|---|---:|---:|---:|
| / | 13 | 3 | 0 |
| /shop | 12 | 6 | 0 |
| /peptide-calculator | 5 | 0 | 0 |
| /contact-us | 3 | 0 | 1 |
| /account | 2 | 3 | 1 |

U.S. organic search sessions in the window: 4. The sample is too small for conclusions; re-pull daily.

### 6.5 Google Trends (TrendsMCP)

**Caveats:** index values, 90 days, region not selectable, so this can't be confirmed as U.S.-only.

| Term | 1-month change | 3-month change |
|---|---:|---:|
| bpc 157 | +4.2% | **+8.8%** |
| peptide calculator | −1.4% | −9.2% |
| tesamorelin | −3.9% | −17.8% |
| kisspeptin | −3.0% | −26.4% |
| retatrutide | −23.0% | −34.5% |
| dsip peptide | −15.6% | −34.9% |
| mots-c | −30.8% | −58.6% |

- Nearly every term declines from a late-June baseline. That looks more like a category-wide summer peak than term-specific decline.
- BPC-157 is the only rising term. That is consistent with news around the July 2026 advisory committee vote, but the link is an inference.
- Trends shows demand direction only. It is not Helix's search volume.

### 6.6 Technical limits of this audit

The live site returned HTTP 403 to automated fetches from this environment. As a result, these were **not** audited:
- page titles and headings
- internal-link graph and orphan pages
- Core Web Vitals

Any recommendation in those areas needs checking against the live site.

---

## 7. Search Demand Gap Map

| Topic | Evidence of demand | Helix visibility | Existing page | Gap | Opportunity | Priority |
|---|---|---|---|---|---|---|
| Unit conversion (mg / mcg / IU / syringe units) | Bing positions 2–7 for conversion queries | Google position ~80 | /peptide-calculator; /peptide-dosage-calculator-mg-mcg-mL-IU-conversions | No conversion function or answer blocks | Add a conversion mode and Q&A blocks to the calculator | P1 |
| Peptide calculator (about 160 variants) | 1,220 U.S. impressions; Trends stable | Position ~80 | /peptide-calculator | Feature parity vs a crowded SERP | Rebuild | P1 |
| Tesamorelin vs sermorelin | 37 U.S. impressions over 4 variants, incl. "which is better…" | Positions 65–76 | /sermorelin-vs-tesamorelin-research-comparison | Weak despite an exact-match page | Direct answer, comparison table, product links | P2 |
| BPC-157 | Only rising Trends term | ~0 U.S. impressions | /product/bpc-157, /product/bpc-157-spray, blog posts | Authority gap | Long-tail supporting content (days 3–30) | P2 |
| Retatrutide | Trends index still high | 0 product impressions | /product/glp-3rta (inferred) | Page may not name the compound | Client decision | P2 |
| DSIP | 214 product impressions; Trends down | Product ~83; blog 45–57 | /product/dsip, DSIP blog | Split intent | Assign COA intent; link the pages | P3 |

---

## 8. Query-to-Page Map

| Query | Intent | Current page | Position | U.S. impr. | Best page | Action |
|---|---|---|---:|---:|---|---|
| helix bio | Brand | / | 3 | 64 | / | Title and entity fix |
| peptide calculator | Tool | /peptide-calculator | 87 | 184 | Same | Rebuild |
| peptide reconstitution calculator | Tool | /peptide-calculator | 76 | 112 | Same | Rebuild; H2 plus answer |
| peptide dosage calculator | Tool | /peptide-calculator | 88 | 92 | Same | Rebuild |
| peptide concentration | Tool / info | Calculator (74), blog (65) | — | 24 | Calculator | Blog → calculator link |
| peptide affiliate program | Transactional | /affiliates (75), blog (65) | — | 43 | /affiliates | Join vs explain split |
| tesamorelin vs sermorelin | Comparison | Comparison post | 71 | 24 | Same | Answer block and table |
| dsip coa | Verification | DSIP blog (45), product (75) | — | 17 | Product | Blog → product COA link |
| lipo c ingredients | Informational | Lipo-C blog | 24 | ~5 | Same | Answer block |
| kisspeptin antibody | Reagent (mismatch) | /product/kisspeptin | 87 | 42 | None | Leave as is |

---

## 9. Internal Linking Plan

The existing links couldn't be crawled. Add each link only if it isn't already there.

| Source page | Destination | Anchor concept | Reason | Priority |
|---|---|---|---|---|
| /peptide-concentration-calculation-reconstitution-dilution-math | /peptide-calculator | "peptide concentration calculator" | Consolidates the calculator cluster | P1 |
| /peptide-dosage-calculator-mg-mcg-mL-IU-conversions | /peptide-calculator | "mg to mcg / IU calculator" | Matches Bing conversion demand | P1 |
| /peptide-reconstitution-guide-bacteriostatic-water-storage-stability | /peptide-calculator | "reconstitution calculator" | Same cluster | P1 |
| /peptide-calculator | The three guides above | Guide titles | Makes the calculator a topic hub | P1 |
| /research-peptide-affiliate-programs-explained | /affiliates | "join the Helix Bio affiliate program" | Resolves the split | P2 |
| /dsip-peptide-research-mechanism-purity-verification | /product/dsip | "DSIP COA and lot documentation" | COA intent to product | P2 |
| /sermorelin-vs-tesamorelin-research-comparison | /product/tesamorelin | "tesamorelin research peptide" | Comparison to commercial page | P2 |
| /growth-hormone-secretagogues-muscle-research-evidence | /ghrh-analogues-vs-ghrps | "GHRH analogues vs GHRPs" | Two top-10 pages reinforcing each other | P2 |

---

## 10. GEO and AEO Summary

**GEO (AI-search citation potential)**

Strengths:
- Compound pages are entity-dense and cite primary literature.
- Bing already surfaces the domain for long, entity-heavy queries.

Weaknesses:
- Unclear brand entity (Issue 15)
- Broken breadcrumb schema (Issue 6)
- Possibly missing product meta (Issue 8)

**AEO (answering questions directly)**

Real question queries in the data:
- "which is better sermorelin or tesamorelin"
- "what is in lipo c"
- "how to reconstitute"
- "what is mcg vs mg peptide dosage" (Bing)
- "how to convert mg to mcg formula" (Bing)

Each maps to an existing page. The fix is a question-phrased heading, a 40–60-word direct answer, then a worked example and a table.

---

## 11. Competitor Findings

**Observed.** One results page was checked: "peptide reconstitution calculator". It mixes:
- a national pharmacy brand (riteaid.com), whose calculator outputs syringe units, concentration and doses per vial
- dedicated calculator sites (howmuchbacwater.com, peptidescalculator.com)
- competitor vendor calculators (onyxbiolabs.com, primepeptides.co, verifiedpeptides.com, particlepeptides.com, cellgenic.com)

Features seen:
- peptidemind.com offers a dropdown of 100+ preset peptides
- verifiedpeptides.com explains how to handle blend vials
- primepeptides.co walks through a full worked example

**Inferred.** Feature parity is the minimum. A credible differentiator for Helix is unit conversion plus blend handling, which the Bing data supports.

**Limits.** Only one results page was observed. No wider competitor data is available until the Semrush units are topped up.

---

## 12. The 1–2 Day Execution Plan

Work is grouped by dependency: measurement first, so every later change is tracked.

### DAY 1

**Block 1 — Measurement repair (morning)**

| Field | Detail |
|---|---|
| Objective | Make sales measurable and clean the baseline |
| Evidence | Issues 1, 2 and 16 |
| Exact actions | 1) Implement GA4 ecommerce events `view_item`, `add_to_cart`, `begin_checkout`, `purchase` with item and value parameters. 2) Mark `purchase` as a key event. 3) Create a GA4 internal-traffic rule by team IPs and activate the filter. 4) Stop the GA4 tag firing on localhost and preview hosts. 5) Place a test order and confirm the events in DebugView. 6) Export the baseline in §14. |
| Pages | Sitewide; product, cart and checkout templates |
| Queries | — |
| Expected signal | Ecommerce events visible in GA4 within 24 hours; India/Direct sessions drop sharply |
| KPIs | Organic conversions, add-to-cart, organic sessions (now valid) |
| Priority / Effort / Confidence | P0 / Medium / High |

**Block 2 — Technical fixes (midday)**

| Field | Detail |
|---|---|
| Objective | Remove sitewide technical defects |
| Evidence | Issues 6, 7 and 8 |
| Exact actions | 1) Add `name` to every BreadcrumbList `ListItem`. 2) Open the GSC sitemap report, resolve the 17 warnings, and resubmit sitemap.xml. 3) Check the source of 3 product pages for a meta description and canonical; if missing, add unique ones per product. 4) Re-inspect 3 URLs in GSC and request indexing. |
| Pages | All templates; /peptide-calculator, /product/bpc-157, /product/bpc-157-spray for verification |
| Expected signal | "Unnamed item" disappears in URL Inspection; the sitemap shows no warnings |
| KPIs | Rich-result validity; indexed page count |
| Priority / Effort / Confidence | P1 / Low / High |

**Block 3 — Brand and snippet fixes (afternoon)**

| Field | Detail |
|---|---|
| Objective | Turn existing top-10 visibility into clicks |
| Evidence | Issues 4, 13 and 15 |
| Exact actions | 1) Confirm the current homepage title, then rewrite the title and meta to lead with "Helix Bio" plus what the company is. 2) Add Organization schema (name, `alternateName`, logo, confirmed `sameAs`). 3) Rewrite titles and metas for the six pages in Issue 13, matching the queries they already rank for. |
| Pages | /; plus the six pages listed in Issue 13 |
| Queries | helix bio, helixbio, helix research peptides; the pages' existing queries |
| Expected signal | Brand CTR above 0 within 7–14 days of recrawl |
| KPIs | Brand clicks and CTR; CTR on the edited pages |
| Priority / Effort / Confidence | P1 / Low / Medium |

**Block 4 — Internal links (end of day)**

| Field | Detail |
|---|---|
| Objective | Consolidate ranking signals on the calculator and resolve page splits |
| Evidence | Issues 5 and 10 |
| Exact actions | Implement every link in §9 that doesn't already exist. |
| Expected signal | Recrawl of the linked pages; calculator position begins to improve over 2–4 weeks |
| KPIs | Calculator average position |
| Priority / Effort / Confidence | P1 / Low / Medium |

### DAY 2

**Block 5 — Calculator rebuild (morning to midday)**

This is the largest task and the one most at risk of not fitting in 2 days. If time runs short, ship parts 1 and 2 first.

| Field | Detail |
|---|---|
| Objective | Make the calculator competitive for its 160-query cluster |
| Evidence | Issue 5; Bing conversion rankings; competitor features in §11 |
| Exact actions | 1) Add a unit-conversion mode (mg ↔ mcg, IU, syringe units) and blend-vial handling. 2) Add question headings with 40–60-word answers, e.g. "How much bacteriostatic water do I add to a peptide vial?" and "How do I convert mg to mcg?". 3) Add a worked-example table. 4) Add a short FAQ. 5) Keep all copy research-use-only, with no dosing recommendations. |
| Pages | /peptide-calculator |
| Queries | peptide calculator, peptide reconstitution calculator, peptide dosage calculator, peptide mixing calculator, mcg to iu calculator |
| Expected signal | Position improvement over 2–6 weeks |
| KPIs | Calculator impressions, position, clicks |
| Priority / Effort / Confidence | P1 / High / Medium |

**Block 6 — Answer blocks and commercial links (early afternoon)**

| Field | Detail |
|---|---|
| Objective | Improve answer-readiness and route readers to products |
| Evidence | §10 questions; Issue 10 |
| Exact actions | 1) Add direct-answer blocks and a comparison table to /sermorelin-vs-tesamorelin-research-comparison. 2) Add answer blocks to the Lipo-C ingredients post and the GHS evidence post. 3) Give /affiliates the "join" job and the affiliate explainer the "learn" job. |
| Pages | /sermorelin-vs-tesamorelin-research-comparison, /lipo-c-ingredients-formulation-composition-research, /growth-hormone-secretagogues-muscle-research-evidence, /affiliates, /research-peptide-affiliate-programs-explained |
| KPIs | Position; product-page sessions from the blog; add-to-cart |
| Priority / Effort / Confidence | P2 / Medium / Medium |

**Block 7 — Mobile and shop fixes (afternoon)**

| Field | Detail |
|---|---|
| Objective | Stop mobile and shop visitors bouncing |
| Evidence | Issue 12 |
| Exact actions | 1) Watch the Clarity recordings for mobile /shop and product sessions. 2) Make sure products and filters show on the first mobile screen. 3) Fix the dead-click elements on /account and /contact-us. |
| KPIs | Quickbacks, engagement rate, add-to-cart |
| Priority / Effort / Confidence | P2 / Medium / Low (small sample) |

**Block 8 — Bing submission and handover (end of day)**

| Field | Detail |
|---|---|
| Objective | Get every change recrawled as fast as possible |
| Evidence | Issue 14 |
| Exact actions | 1) Submit every changed URL via IndexNow or Bing URL submission. 2) Resubmit the sitemap to Bing. 3) Request indexing in GSC for the homepage, calculator and edited pages. 4) Log every change with its date for the experiments in §15. 5) Send the client the retatrutide naming question (Issue 11). |
| KPIs | Bing impressions for conversion queries |
| Priority / Effort / Confidence | P2 / Low / Medium |

---

## 13. Priority Backlog

| Priority | Action | Page / query | Evidence | Expected impact | Effort | Confidence | Day |
|---|---|---|---|---|---|---|---|
| P0 | GA4 ecommerce and key events | Sitewide | 0 ecommerce events | Makes sales measurable | Med | High | 1 |
| P0 | Internal and dev traffic exclusion | GA4 | 282 sessions / 27 users; localhost hits | Clean baseline | Low | High | 1 |
| P1 | Breadcrumb `name` fix | All pages | "Unnamed item" | Valid structured data | Low | High | 1 |
| P1 | Sitemap warnings and resubmit | sitemap.xml | 17 warnings; last submitted 6 Aug | Faster discovery | Low | Med | 1 |
| P1 | Product meta check | Product pages | Earlier-session observation | Better product snippets | Low | Med | 1 |
| P1 | Brand title and Organization schema | / — "helix bio" | Position 3, 71 impressions, 0 clicks | First reliable click source | Low | Med | 1 |
| P1 | Top-10 snippet rewrites | 6 pages in Issue 13 | Positions 5–9, ~0 clicks | Small click gains | Low | Med | 1 |
| P1 | Calculator cluster links | 3 guides ↔ calculator | Split rankings | Consolidated signals | Low | Med | 1 |
| P1 | Calculator rebuild | /peptide-calculator | 27% of U.S. impressions at position 80 | Largest visibility lever | High | Med | 2 |
| P2 | Comparison answer block | tesamorelin vs sermorelin | 37 impressions, position 71 | Moderate | Low | Low | 2 |
| P2 | Mobile /shop fix | /shop | 6/12 quickbacks | Engagement | Med | Low | 2 |
| P2 | Bing IndexNow submissions | Changed URLs | Bing top-10 long-tail | Faster recrawl | Low | Med | 2 |

---

## 14. KPI Dashboard

"Current" is the 28-day U.S. average unless noted. Fill in the later columns at each checkpoint.

| KPI | Current | Day 7 | Day 14 | Day 28 | Target |
|---|---:|---:|---:|---:|---:|
| U.S. impressions/day | 125.5 | | | | 10,000 |
| U.S. CTR | 0.34% | | | | 10% |
| U.S. clicks/day | 0.43 | | | | — |
| Avg position (47-day) | 63.1 | | | | — |
| Ranking queries (47-day) | 654 | | | | — |
| Top-3 queries | 14 | | | | — |
| Top-10 queries | 32 | | | | — |
| Brand clicks ("helix bio" + variants) | 0 | | | | — |
| Calculator avg position | 79.8 | | | | — |
| Organic sessions (U.S., 48 days) | 69 | | | | — |
| Organic conversions | Not measured | | | | — |

Search Console lags about 2–3 days, so the Day 7 column reflects only about 4–5 days of post-change data.

---

## 15. Experiments

Each change is treated as a test so its effect can be judged on its own.

| ID | Hypothesis | Pages | Baseline | Success | Rollback trigger | Observation |
|---|---|---|---|---|---|---|
| E1 | An exact-brand title plus entity schema lifts brand CTR | / | 0 clicks from 71 impressions at position 3 | ≥3 brand clicks | Brand position falls below 5 | 21 days |
| E2 | Conversion features plus answer blocks improve calculator ranking | /peptide-calculator | Position ~80; 1,220 impressions over 47 days | Median position ≤50 | Impressions fall 30% for 14 days | 28 days |
| E3 | Query-matched snippets lift CTR on top-10 pages | 6 pages in Issue 13 | ~0 clicks | Any sustained clicks | Position falls below 12 | 28 days |
| E4 | An answer block improves the comparison page | /sermorelin-vs-tesamorelin-research-comparison | Position 71 | Position ≤40 | Position worsens by 10+ | 28 days |

**Rules**
- E1 and E3 start on the same day but on different pages and queries, so their effects can be separated.
- Don't edit a tested page again during its observation window.
- With click volumes this low, treat results as directional, not statistically proven.

---

## 16. Risks and Constraints

- **New domain in a regulated niche.** Research peptides are health-adjacent and ad-restricted. Authority builds slowly, and head terms like BPC-157 won't move quickly.
- **Sibling domain.** 99puritypeptides.com hosts differently written versions of the same product pages. Review cross-domain duplication with the client. It is outside this project's scope.
- **Data limits.**
  - Clarity: 3 days of history only.
  - Trends: indexes only, no region control.
  - Semrush: unavailable.
  - Live site: blocked automated fetches, so titles, headings, links and Core Web Vitals weren't audited.
- **Client decisions.** Retatrutide naming (Issue 11), the canonical brand name and the real social profiles (Issue 15).
- **Timeline.** The calculator rebuild is the one task that may not fit in 2 days. Measurement (Block 1) must not be skipped to save time, because every later result depends on it.

---

## 17. After the 2 Days (Days 3–30)

1. **Day 7 check:** confirm the ecommerce events and internal filter work; confirm Google and Bing have recrawled the edited pages.
2. **Day 14 check:** early read of brand CTR (E1) and calculator position (E2).
3. **Day 28 review:** judge E1–E4 against their success criteria. Record the first real organic conversion baseline.
4. **Next build:** 2–3 long-tail BPC-157 supporting posts linked to the product pages, the only rising term.
5. **Re-size the target.** Top up the Semrush units to get keyword volumes and rebuild the gap model with real demand. A reasonable interim checkpoint to test is 500 U.S. impressions a day at a 2% CTR by day 60. That is a milestone to measure against, not a forecast.
