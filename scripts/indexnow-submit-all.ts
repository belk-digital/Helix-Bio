/**
 * One-off / on-demand: submit every URL in the live sitemap to IndexNow.
 * Use after a large change (e.g. a site-wide title update) so Bing recrawls immediately.
 *
 *   INDEXNOW_KEY=<key> npx tsx scripts/indexnow-submit-all.ts
 *   INDEXNOW_KEY=<key> SITE_URL=https://helixbiochem.com npx tsx scripts/indexnow-submit-all.ts
 *
 * The key file must already be reachable at https://<host>/<key>.txt (see src/lib/indexnow.ts).
 */
const siteUrl = (process.env.SITE_URL || 'https://helixbiochem.com').replace(/\/$/, '')
const key = process.env.INDEXNOW_KEY

async function main() {
  if (!key) throw new Error('INDEXNOW_KEY is not set')

  const sitemap = await (await fetch(`${siteUrl}/sitemap.xml`)).text()
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (urls.length === 0) throw new Error('No URLs found in sitemap')

  const host = new URL(siteUrl).host
  for (let i = 0; i < urls.length; i += 10_000) {
    const batch = urls.slice(i, i + 10_000)
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `${siteUrl}/${key}.txt`, urlList: batch }),
    })
    console.log(`Submitted ${batch.length} URLs -> HTTP ${res.status}${res.status === 200 || res.status === 202 ? ' (ok)' : ''}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
