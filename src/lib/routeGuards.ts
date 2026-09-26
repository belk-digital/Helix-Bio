import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Cheap existence checks used by segment layouts to return a genuine HTTP 404.
 *
 * Why this exists: `(frontend)/loading.tsx` (and the product `loading.tsx`) wrap each page in a
 * Suspense boundary, so Next flushes the response shell — and commits status 200 — before a page
 * can call `notFound()`. Unknown URLs were therefore served as 200 (with a noindex meta), i.e.
 * soft-404s, to browsers and search bots alike. A layout renders OUTSIDE that boundary, so a
 * `notFound()` thrown there is still able to set the 404 status.
 *
 * `cache()` de-dupes the lookup within a single request.
 */
export const productExists = cache(async (slug: string): Promise<boolean> => {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'products',
    // Active only — draft/archived products must 404 (the local API ignores access rules).
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }] },
  })
  return totalDocs > 0
})

export const blogPostExists = cache(async (slug: string): Promise<boolean> => {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'blog-posts',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
  })
  return totalDocs > 0
})
