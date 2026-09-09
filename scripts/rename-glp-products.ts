/**
 * Scrubs the legacy compound names out of the product description content.
 *
 *   Retatrutide -> GLP-3RTA   (product 121, slug glp-3rta)
 *   Tirzepatide -> GLP-1TRZ   (product 123, slug glp-1trz)
 *
 * A blind find/replace would turn several passages into false claims (e.g. "Mounjaro and
 * Zepbound are FDA-approved medications containing GLP-1TRZ", or "GLP-3RTA was developed
 * by Eli Lilly"). Those passages are rewritten explicitly by REWRITES below, which run
 * BEFORE the blanket rename; whatever is left over is then renamed mechanically.
 *
 * Products 122 (semaglutide) and 124 (cagrilintide) mention the old names only as
 * comparators, so the blanket rename is enough for them.
 *
 * Scope is deliberately limited to product description fields — media filenames, variant
 * SKUs, blog posts and static source copy are left untouched.
 *
 * Only the `en` locale is written: neither product has `es` rows, so Spanish falls back to
 * English. Run with --apply to write; without it the script is a dry run.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const APPLY = process.argv.includes('--apply')

const RENAMES: [RegExp, string][] = [
  [/Retatrutide/g, 'GLP-3RTA'],
  [/retatrutide/g, 'GLP-3RTA'],
  [/Tirzepatide/g, 'GLP-1TRZ'],
  [/tirzepatide/g, 'GLP-1TRZ'],
]

/** Passages that must be rewritten rather than renamed, keyed by product id. */
const REWRITES: Record<number, [string, string][]> = {
  121: [
    [
      "Originally advanced through Eli Lilly's clinical research pipeline, it has become one of the most closely watched compounds in metabolic and endocrine research because of that three-receptor mechanism, which sets it apart from single- or dual-agonist peptides such as semaglutide and tirzepatide.",
      'That three-receptor mechanism has made it one of the most closely watched areas of metabolic and endocrine research, setting it apart from single- or dual-agonist peptides such as Semaglutide and GLP-1TRZ.',
    ],
    [
      'have both published topline results, giving researchers a growing body of clinical-stage data to reference alongside earlier Phase 1 and Phase 2 findings. Retatrutide remains an investigational compound — it is not FDA-approved and is not available by prescription.',
      'have both published topline results for triple-agonist compounds, giving researchers a growing body of clinical-stage data to reference alongside earlier Phase 1 and Phase 2 findings. Triple hormone receptor agonists remain investigational — GLP-3RTA is not FDA-approved and is not available by prescription.',
    ],
    [
      "It was developed through Eli Lilly's clinical research pipeline and is sold by Helix Bio strictly for laboratory research use.",
      'It is sold by Helix Bio strictly for laboratory research use.',
    ],
    [
      'No. As of mid-2026, Retatrutide remains an investigational compound. It has completed multiple Phase 3 clinical trials with published topline results, but it has not received FDA approval and is not available by prescription.',
      'No. As of mid-2026, triple hormone receptor agonists remain investigational. The class has completed multiple Phase 3 clinical trials with published topline results, but no compound in it has received FDA approval, and GLP-3RTA is not available by prescription.',
    ],
    ['What clinical trial phase is Retatrutide in?', 'What clinical trial phase is this compound class in?'],
    [
      "Retatrutide has advanced through Eli Lilly's Phase 3 TRIUMPH program along with a separate Phase 3 diabetes program (TRANSCEND-T2D-1), with topline results published through 2026. It remains investigational and has not completed the regulatory approval process.",
      "Triple-agonist research has advanced through Eli Lilly's Phase 3 TRIUMPH program along with a separate Phase 3 diabetes program (TRANSCEND-T2D-1), with topline results published through 2026. The class remains investigational and has not completed the regulatory approval process.",
    ],
  ],
  123: [
    [
      'Developed originally by Eli Lilly, it sits between single-receptor compounds like semaglutide and the newer triple-agonist retatrutide, making it a common middle point of comparison in incretin research.',
      'It sits between single-receptor compounds like Semaglutide and the newer triple-agonist GLP-3RTA, making it a common middle point of comparison in incretin research.',
    ],
    [
      "<p>Tirzepatide's clinical trial record is built primarily on Eli Lilly's SURMOUNT program (weight management) and SURPASS program (type 2 diabetes), both widely cited in comparative incretin-class research. Tirzepatide is also the active ingredient in FDA-approved branded prescription medications. The material Helix Bio sells is a separate, research-grade product",
      "<p>The dual GIP/GLP-1 agonist class has a clinical trial record built primarily on Eli Lilly's SURMOUNT program (weight management) and SURPASS program (type 2 diabetes), both widely cited in comparative incretin-class research. Compounds in this class also appear as active ingredients in FDA-approved branded prescription medications. GLP-1TRZ is a separate, research-grade product",
    ],
    [
      'It is a distinct product from any FDA-approved Tirzepatide-containing medication and must not be treated as interchangeable with, or a substitute for, an approved prescription drug.',
      'It is a distinct product from any FDA-approved medication and must not be treated as interchangeable with, or a substitute for, an approved prescription drug.',
    ],
    [
      "What's the difference between research-grade Tirzepatide and Mounjaro or Zepbound?",
      "What's the difference between GLP-1TRZ and FDA-approved prescription medications?",
    ],
    [
      'Mounjaro and Zepbound are FDA-approved branded prescription medications containing tirzepatide, manufactured, formulated, and dosed under regulatory approval for specific medical uses. The research-grade Tirzepatide sold by Helix Bio is a separate, unapproved product manufactured for laboratory research only — it is not equivalent to, interchangeable with, or a substitute for any approved drug product.',
      'FDA-approved branded prescription medications in this class are manufactured, formulated, and dosed under regulatory approval for specific medical uses. GLP-1TRZ, sold by Helix Bio, is a separate, unapproved product manufactured for laboratory research only — it is not equivalent to, interchangeable with, or a substitute for any approved drug product.',
    ],
    [
      "It was originally developed by Eli Lilly, and Helix Bio's version is a research-grade material sold strictly for laboratory research use.",
      "Helix Bio's GLP-1TRZ is a research-grade material sold strictly for laboratory research use.",
    ],
    ['What clinical trial data exists for Tirzepatide?', 'What clinical trial data exists for this compound class?'],
    [
      "Tirzepatide's published clinical trial record is built primarily on Eli Lilly's SURMOUNT program (weight management) and SURPASS program (type 2 diabetes). This literature is a common reference point in comparative incretin research alongside semaglutide's STEP/SUSTAIN data and retatrutide's TRIUMPH program.",
      "The dual GIP/GLP-1 agonist class has a published clinical trial record built primarily on Eli Lilly's SURMOUNT program (weight management) and SURPASS program (type 2 diabetes). This literature is a common reference point in comparative incretin research alongside Semaglutide's STEP/SUSTAIN data and the triple-agonist TRIUMPH program.",
    ],
  ],
}

const TEXT_FIELDS = [
  'description',
  'seoTitle',
  'seoDescription',
  'productDetailsDescription',
  'researchFocusDescription',
  'qualityPurityDescription',
  'complianceNoticeDescription',
] as const

const HAS_OLD_NAME = /retatrutide|tirzepatide/i

const rename = (s: string) => RENAMES.reduce((acc, [rx, to]) => acc.replace(rx, to), s)

async function run() {
  const payload = await getPayload({ config: configPromise })
  let failed = false

  for (const id of [121, 122, 123, 124]) {
    const doc: any = await payload.findByID({ collection: 'products', id, depth: 0, locale: 'en' })
    const rewrites = REWRITES[id] ?? []

    // Bail loudly rather than silently skipping a rewrite whose source text has drifted.
    const serialized = JSON.stringify(doc)
    const unmatched = rewrites.filter(([from]) => !serialized.includes(JSON.stringify(from).slice(1, -1)))
    if (unmatched.length) {
      failed = true
      console.error(`\n!! product ${id}: ${unmatched.length} rewrite(s) did not match the stored text:`)
      unmatched.forEach(([from]) => console.error(`   - ${from.slice(0, 90)}...`))
      continue
    }

    const transform = (s: string) => rename(rewrites.reduce((acc, [from, to]) => acc.split(from).join(to), s))

    const data: Record<string, any> = {}
    for (const field of TEXT_FIELDS) {
      if (typeof doc[field] === 'string' && HAS_OLD_NAME.test(doc[field])) {
        data[field] = transform(doc[field])
      }
    }
    if (Array.isArray(doc.faqs) && doc.faqs.some((f: any) => HAS_OLD_NAME.test(`${f.question}${f.answer}`))) {
      data.faqs = doc.faqs.map((f: any) => ({
        id: f.id,
        question: transform(f.question),
        answer: transform(f.answer),
      }))
    }

    const changed = Object.keys(data)
    if (!changed.length) {
      console.log(`\nproduct ${id} (${doc.slug}): nothing to change`)
      continue
    }
    console.log(`\nproduct ${id} (${doc.slug}) -> ${changed.join(', ')}`)

    const leftover = JSON.stringify(data).match(/retatrutide|tirzepatide/gi)
    if (leftover) {
      failed = true
      console.error(`   !! ${leftover.length} occurrence(s) would survive — skipping this product`)
      continue
    }

    if (APPLY) {
      await payload.update({ collection: 'products', id, locale: 'en', data, overrideAccess: true })
      console.log('   updated')
    } else {
      console.log('   (dry run)')
    }
  }

  console.log(APPLY ? '\nDone.' : '\nDry run complete — re-run with --apply to write.')
  process.exit(failed ? 1 : 0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
