import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import * as Sentry from '@sentry/nextjs'

// Without this, Next.js treats sitemap.xml as fully static (no dynamic APIs are used
// inside it) and freezes it at build time — new products/posts silently stop appearing
// in the sitemap until the next deploy. Regenerate hourly instead.
export const revalidate = 3600

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'

type Freq = MetadataRoute.Sitemap[number]['changeFrequency']

// Grouped by crawl priority rather than alphabetically, so the sitemap's own ordering
// reflects which pages matter most (highest first) — homepage/shop first, then core
// conversion-adjacent pages, then supporting/legal pages.
//
// `lastModified` is deliberately NOT set for pages whose content has no reliable "last changed"
// date. Emitting `new Date()` (the request time) made every static URL claim it changed on every
// regeneration, which teaches search engines to ignore <lastmod> everywhere. Where a truthful date
// exists (home / shop / blog index — derived from the newest product/post below) it is applied;
// otherwise the field is omitted, which is valid and honest.
const STATIC_PATHS: { path: string; priority: number; changeFrequency: Freq }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
  { path: '/peptide-calculator', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/certificates', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/about-us', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/affiliates', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact-us', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/shipping-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/medical-disclaimer', priority: 0.3, changeFrequency: 'yearly' },
]

function entry(
  path: string,
  opts?: { lastModified?: Date; priority?: number; changeFrequency?: Freq },
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path}`,
    ...(opts?.lastModified ? { lastModified: opts.lastModified } : {}),
    ...(opts?.priority !== undefined ? { priority: opts.priority } : {}),
    ...(opts?.changeFrequency ? { changeFrequency: opts.changeFrequency } : {}),
  }
}

function newest(dates: (Date | undefined)[]): Date | undefined {
  const valid = dates.filter((d): d is Date => !!d && !Number.isNaN(d.getTime()))
  return valid.length ? new Date(Math.max(...valid.map((d) => d.getTime()))) : undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productEntries: MetadataRoute.Sitemap = []
  const postEntries: MetadataRoute.Sitemap = []
  const productDates: Date[] = []
  const postDates: Date[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      limit: 1000,
      depth: 0,
    })

    for (const product of products) {
      const lastModified = product.updatedAt ? new Date(product.updatedAt) : undefined
      if (lastModified) productDates.push(lastModified)
      productEntries.push(entry(`/product/${product.slug}`, { lastModified, priority: 0.8, changeFrequency: 'weekly' }))
    }
  } catch (error) {
    console.error('sitemap: failed to fetch products', error)
    Sentry.captureException(error, { tags: { route: 'sitemap.xml' } })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const { docs: posts } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
    })

    for (const post of posts) {
      const lastModified = post.updatedAt ? new Date(post.updatedAt) : undefined
      if (lastModified) postDates.push(lastModified)
      postEntries.push(entry(`/${post.slug}`, { lastModified, priority: 0.6, changeFrequency: 'monthly' }))
    }
  } catch (error) {
    console.error('sitemap: failed to fetch blog posts', error)
    Sentry.captureException(error, { tags: { route: 'sitemap.xml' } })
  }

  // Truthful dates for the listing pages: they change when their contents change.
  const derivedLastModified: Record<string, Date | undefined> = {
    '': newest([...productDates, ...postDates]),
    '/shop': newest(productDates),
    '/blog': newest(postDates),
  }

  const staticEntries = STATIC_PATHS.map(({ path, priority, changeFrequency }) =>
    entry(path, { priority, changeFrequency, lastModified: derivedLastModified[path] }),
  )

  return [...staticEntries, ...productEntries, ...postEntries]
}
