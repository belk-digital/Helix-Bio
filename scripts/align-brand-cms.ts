// Aligns CMS-stored SEO text with the canonical brand name "Helix Bio Chem".
//
// The code-side brand change (titles, schema, emails, llms.txt) can't reach text that lives in the
// database: blog post meta titles, product SEO titles, and the blog author profile name.
//
//   npx tsx --env-file=.env.local scripts/align-brand-cms.ts            # DRY RUN (default) — prints, writes nothing
//   npx tsx --env-file=.env.local scripts/align-brand-cms.ts --apply    # writes the changes
//
// Rules (deliberately conservative):
//   * Only replaces "Helix Bio" NOT already followed by " Chem", as a whole phrase.
//   * If the rewritten title would exceed 66 characters (likely to truncate in results) the row is
//     reported as NEEDS MANUAL EDIT and left unchanged — shorten those by hand.
//   * Titles with no brand are only reported (never invented).
//   * Product/blog *body* text is not touched.

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const APPLY = process.argv.includes('--apply')
const MAX_TITLE = 66
const BRAND_RE = /Helix Bio(?! Chem)/g
const rebrand = (s: string) => s.replace(BRAND_RE, 'Helix Bio Chem')

type Row = { collection: string; id: string | number; field: string; before: string; after?: string; note?: string }

async function main() {
  const payload = await getPayload({ config: configPromise })
  const changes: Row[] = []
  const flags: Row[] = []

  // Blog posts: meta.title
  const posts = await payload.find({ collection: 'blog-posts', limit: 1000, depth: 0, pagination: false, overrideAccess: true })
  for (const p of posts.docs as any[]) {
    const title: string | undefined = p.meta?.title
    if (!title) {
      flags.push({ collection: 'blog-posts', id: p.id, field: 'meta.title', before: '', note: `no meta.title — falls back to "${p.title} | Helix Bio Chem"` })
      continue
    }
    if (!/Helix Bio(?! Chem)/.test(title)) {
      if (!/Helix Bio Chem/.test(title)) flags.push({ collection: 'blog-posts', id: p.id, field: 'meta.title', before: title, note: 'no brand in title' })
      continue
    }
    const after = rebrand(title)
    if (after.length > MAX_TITLE) flags.push({ collection: 'blog-posts', id: p.id, field: 'meta.title', before: title, after, note: `NEEDS MANUAL EDIT (${after.length} chars)` })
    else changes.push({ collection: 'blog-posts', id: p.id, field: 'meta.title', before: title, after })
  }

  // Products: seoTitle
  const products = await payload.find({ collection: 'products', limit: 1000, depth: 0, pagination: false, overrideAccess: true })
  for (const p of products.docs as any[]) {
    const title: string | undefined = p.seoTitle
    if (!title || !/Helix Bio(?! Chem)/.test(title)) continue
    const after = rebrand(title)
    if (after.length > MAX_TITLE) flags.push({ collection: 'products', id: p.id, field: 'seoTitle', before: title, after, note: `NEEDS MANUAL EDIT (${after.length} chars)` })
    else changes.push({ collection: 'products', id: p.id, field: 'seoTitle', before: title, after })
  }

  // Blog author (feeds Article schema + byline)
  const author: any = await payload.findGlobal({ slug: 'blog-author-profile' })
  const authorRow: Row | null =
    author?.name && /Helix Bio(?! Chem)/.test(author.name)
      ? { collection: 'global:blog-author-profile', id: 'global', field: 'name', before: author.name, after: rebrand(author.name) }
      : null

  console.log(`\nMODE: ${APPLY ? 'APPLY' : 'DRY RUN (no writes)'}\n`)
  console.log(`Changes: ${changes.length + (authorRow ? 1 : 0)}   Needs attention: ${flags.length}\n`)
  for (const r of [...changes, ...(authorRow ? [authorRow] : [])]) console.log(`CHANGE  ${r.collection} #${r.id} ${r.field}\n   - ${r.before}\n   + ${r.after}`)
  for (const r of flags) console.log(`FLAG    ${r.collection} #${r.id} ${r.field}  [${r.note}]\n   ${r.before}${r.after ? `\n   → ${r.after}` : ''}`)

  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply to write the CHANGE rows above.')
    return
  }

  for (const r of changes) {
    if (r.collection === 'blog-posts') {
      const doc: any = await payload.findByID({ collection: 'blog-posts', id: r.id, depth: 0, overrideAccess: true })
      await payload.update({ collection: 'blog-posts', id: r.id, data: { meta: { ...(doc.meta || {}), title: r.after } }, overrideAccess: true })
    } else {
      await payload.update({ collection: 'products', id: r.id, data: { seoTitle: r.after }, overrideAccess: true })
    }
  }
  if (authorRow) await payload.updateGlobal({ slug: 'blog-author-profile', data: { name: authorRow.after }, overrideAccess: true })
  console.log('\nDone.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
