/**
 * Repoints blog-post links that still target the pre-rename Retatrutide product URL.
 *
 *   /product/retatrutide -> /product/glp-3rta   (product 121, renamed by rename-glp-products.ts)
 *
 * next.config.ts now 301s the old URL, so these links are not broken for visitors — but an
 * internal link that redirects wastes crawl budget and hides the real destination from link
 * equity calculations, so the stored hrefs are corrected at the source too.
 *
 * Deliberately narrow:
 *   - Only `blog-posts.content` (Lexical rich text) is walked, and only the `url` values of
 *     link nodes. Prose is never touched, so compound names in the copy ("Retatrutide remains
 *     investigational...") stay exactly as written — this script is not a content rewrite.
 *   - Only the exact path matches: `/product/retatrutide`, optionally followed by `?query` or
 *     `#fragment`. `/product/retatrutide-spray` and every other slug are left alone (see the
 *     spray findings — that URL has no evidence of ever having existed).
 *   - Absolute forms on this site's own origin are matched too, since CMS editors paste both.
 *
 * Run with --apply to write; without it the script is a dry run that prints the diff.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const APPLY = process.argv.includes('--apply')

const NEW_PATH = '/product/glp-3rta'

// Matches the old path at the end of an href, or followed only by ?query / #fragment — never
// `/product/retatrutide-spray`, and never a longer slug that merely starts with the old one.
const OLD_URL = /^(https?:\/\/[^/]*helixbiochem\.com)?\/product\/retatrutide(?=$|[?#])/

const rewrite = (url: string) => url.replace(OLD_URL, (_m, origin) => `${origin ?? ''}${NEW_PATH}`)

/** Rewrites link-node URLs in place, returning the hrefs that changed. */
function walk(node: any, changed: string[]): void {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, changed)
    return
  }
  if (!node || typeof node !== 'object') return

  const url = node.fields?.url
  if (typeof url === 'string' && OLD_URL.test(url)) {
    const next = rewrite(url)
    changed.push(`${url} -> ${next}`)
    node.fields.url = next
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') walk(value, changed)
  }
}

async function run() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'blog-posts',
    limit: 1000,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })

  let touched = 0

  for (const doc of docs as any[]) {
    if (!doc.content) continue

    const content = JSON.parse(JSON.stringify(doc.content))
    const changed: string[] = []
    walk(content, changed)
    if (!changed.length) continue

    touched++
    console.log(`\n${doc.slug} (post ${doc.id}) — ${changed.length} link(s)`)
    changed.forEach((c) => console.log(`   ${c}`))

    // Guard against a regex slip repointing something it shouldn't have.
    const leftover = JSON.stringify(content).match(/\/product\/retatrutide(?![a-z-])/g)
    if (leftover) {
      console.error(`   !! ${leftover.length} occurrence(s) would survive — skipping this post`)
      continue
    }

    if (APPLY) {
      await payload.update({
        collection: 'blog-posts',
        id: doc.id,
        locale: 'en',
        data: { content },
        overrideAccess: true,
      })
      console.log('   updated')
    } else {
      console.log('   (dry run)')
    }
  }

  console.log(
    touched === 0
      ? '\nNo stored links point at the old URL.'
      : APPLY
        ? `\nDone — ${touched} post(s) updated.`
        : `\n${touched} post(s) would change. Re-run with --apply to write.`,
  )
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
