/**
 * IndexNow: push changed URLs to Bing (and other participating engines) the moment they change,
 * instead of waiting days for a recrawl. Bing also feeds Microsoft Copilot / ChatGPT Search, so this
 * is a search *and* AI-visibility lever.
 *
 * Fully inert unless INDEXNOW_KEY is set AND the deployment is production, so local development,
 * previews and builds never submit anything. Failures are swallowed (and logged): publishing a post
 * or saving a product must never fail because a search-engine ping did.
 *
 * Setup: generate a key (8–128 chars, a–z A–Z 0–9 -), set INDEXNOW_KEY. The key file is served at
 * https://<host>/<key>.txt by a rewrite in next.config.ts -> /api/indexnow/key.
 */
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const TIMEOUT_MS = 3000

const siteUrl = () => (process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com').replace(/\/$/, '')

export const isIndexNowEnabled = () =>
  Boolean(process.env.INDEXNOW_KEY) &&
  (process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production')

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (!isIndexNowEnabled()) return
  const key = process.env.INDEXNOW_KEY as string
  const unique = Array.from(new Set(urls.filter(Boolean)))
  if (unique.length === 0) return

  const host = new URL(siteUrl()).host
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `${siteUrl()}/${key}.txt`, urlList: unique }),
      signal: controller.signal,
    })
    // 200 = received, 202 = received (key validation pending). Anything else is worth a log line.
    if (res.status !== 200 && res.status !== 202) {
      console.warn(`[indexnow] unexpected status ${res.status} for ${unique.length} url(s)`)
    }
  } catch (error) {
    console.warn('[indexnow] submission failed', error instanceof Error ? error.message : error)
  } finally {
    clearTimeout(timer)
  }
}
