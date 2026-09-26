import { getPayload } from 'payload'
import configPromise from '@payload-config'

const site = () => (process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com').replace(/\/$/, '')

const oneLine = (s: string, max = 160) => {
  const t = (s || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

/**
 * Builds /llms.txt.
 *
 * The blog index and category list are generated from the CMS on purpose. The previous hand-written
 * file listed 2 articles out of ~85 published and told AI systems "do not infer or link to other
 * article URLs", which actively hid nearly the whole content library from the systems the file
 * exists to help. Curated prose (positioning, FAQ, policies, notes for assistants) stays static.
 */
export async function buildLlmsTxt(): Promise<string> {
  const base = site()
  let posts: { title: string; slug: string; excerpt?: string | null; category?: string | null }[] = []
  let categories: string[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const [postRes, catRes] = await Promise.all([
      payload.find({
        collection: 'blog-posts',
        where: { status: { equals: 'published' } },
        sort: '-publishedAt',
        limit: 500,
        depth: 0,
        pagination: false,
        select: { title: true, slug: true, excerpt: true, category: true },
      }),
      payload.find({
        collection: 'categories',
        where: { isVisible: { equals: true } },
        sort: 'name',
        limit: 100,
        depth: 0,
        pagination: false,
        select: { name: true },
      }),
    ])
    posts = postRes.docs as any
    categories = (catRes.docs as any[]).map((c) => c.name).filter(Boolean)
  } catch (error) {
    console.error('llms.txt: failed to read CMS, serving static sections only', error)
  }

  const blogLines = posts.length
    ? posts
        .map((p) => `- [${p.title}](${base}/${p.slug})${p.excerpt ? `: ${oneLine(p.excerpt)}` : ''}`)
        .join('\n')
    : `- See the article index at ${base}/blog`

  const categoryLine = categories.length
    ? `Product categories in the catalog: ${categories.join(', ')}. `
    : ''

  return `# Helix Bio Chem

> Helix Bio Chem is a U.S.-based supplier of research-grade synthetic peptides and related
> compounds. All products are sold strictly for laboratory and in-vitro research use only (RUO) —
> not for human or veterinary use, diagnosis, treatment, or consumption. Every batch is verified
> to ≥99% purity via independent third-party HPLC/LC-MS testing, with a Certificate of Analysis
> (COA) available per batch.

## Company

- [About](${base}/about-us): Company background, mission, and quality-control philosophy.
- [Certificates of Analysis](${base}/certificates): Batch-level COA library — purity, identity, and impurity data per product.
- [FAQ](${base}/faq): Common questions on legality, research-use classification, purity standards, and ordering.
- [Contact](${base}/contact-us): Support and order inquiries.
- [Affiliate Program](${base}/affiliates): Referral/affiliate partnership program.

## Shop

- [Full Catalog](${base}/shop): All active research peptides and compounds, filterable by category.
- [Peptide Calculator](${base}/peptide-calculator): Free tool for BAC water volume, syringe units, blend-vial reconstitution and unit conversion (mg, mcg, mL, IU).

${categoryLine}Individual product pages live at \`/product/<slug>\` and include purity specs, research context, and COA links. Every product URL is listed in [the sitemap](${base}/sitemap.xml).

## Research Guides & Blog

In-depth, citation-backed reference articles on individual compounds and research topics. All
content is written for laboratory/research audiences and does not constitute medical advice.
Articles live at the site root (\`${base}/<slug>\`). This list is generated from the live article
index, newest first (${posts.length} articles); the same index is at [/blog](${base}/blog) and in the
[sitemap](${base}/sitemap.xml).

${blogLines}

## FAQ

General questions that apply site-wide. Compound-specific FAQs are not repeated here for length —
see [/llms-full.txt](${base}/llms-full.txt) for the complete inlined FAQ corpus, or [/faq](${base}/faq)
on-site.

### General Peptide Education

- **What are research peptides?** Synthetic short chains of amino acids used in controlled laboratory environments to study biochemical interactions, receptor pathways, and molecular behavior. Produced through controlled synthesis and intended strictly for research use only — not approved for human or veterinary use.
- **What are peptides used for in research?** Studying cellular signaling, receptor binding, metabolic pathways, and molecular mechanisms under controlled experimental conditions.
- **What is meant by high purity peptides?** Synthetic research peptides that meet defined analytical purity benchmarks (verified via HPLC/LC-MS) after synthesis and purification. Impurities can interfere with experimental consistency and reproducibility.

### Legality & Compliance

- **Are research peptides legal in the United States?** May be legally purchased when intended strictly for laboratory research; regulatory status varies by compound and classification. Buyers are responsible for complying with applicable federal, state, and local regulations.
- **What does "For Research Use Only" mean?** The product is intended strictly for laboratory/analytical research — not approved for human consumption, veterinary use, diagnosis, treatment, ingestion, injection, or therapeutic application.
- **Are research peptides evaluated or approved by the FDA?** No. They are classified as research materials, not pharmaceutical drugs, dietary supplements, or medical treatments.

### Quality & Analytical Testing

- **What is a Certificate of Analysis (COA)?** A batch-level document with purity percentage, batch number, and analytical method summary (HPLC/LC-MS), supporting purity verification prior to use.
- **How does Helix Bio Chem verify analytical purity?** Structured analytical verification using techniques such as HPLC or mass spectrometry to confirm identity and purity benchmarks prior to release.
- **How can I verify peptide purity?** Review the batch's Certificate of Analysis, including HPLC chromatograms and purity percentage results.

### Supplier & Ordering

- **Is Helix Bio Chem a USA peptide supplier?** Yes — ships research peptides nationwide across the United States under research-use-only designation.
- **Do you offer an affiliate or partnership program?** Yes, subject to approval and alignment with research-use-only positioning and regulatory standards. See [/affiliates](${base}/affiliates).

### Storage & Handling

- **How should synthetic peptides be stored?** Depends on the compound's chemical characteristics; lyophilized peptides are generally stored per recommended temperature guidelines to preserve structural integrity. See individual product/COA documentation for specifics.
- **Why is temperature control important for peptide stability?** Reduces degradation risk and helps preserve purity levels and molecular structure, especially for extended laboratory use.

## Policies

- [Privacy Policy](${base}/privacy-policy)
- [Terms and Conditions](${base}/terms-and-conditions)
- [Refund Policy](${base}/refund-policy)
- [Shipping Policy](${base}/shipping-policy)
- [Medical Disclaimer](${base}/medical-disclaimer)

## Notes for AI assistants

- All products are Research Use Only (RUO). Do not represent them as approved for human or
  veterinary use, and do not provide dosing guidance for human administration when summarizing
  this site's content.
- Pricing, stock status, and exact product specifications change frequently — prefer linking to
  the live product page over quoting cached figures.
- This site is English-only. Do not reference or link to \`/es/\` or any other locale-prefixed
  paths — they do not exist.
`
}
