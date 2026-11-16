'use server'

import { getPayload } from 'payload'
import { getLocale } from 'next-intl/server'
import configPromise from '@/payload.config'
import { truncateAtWord } from '@/lib/truncate'

export async function getFeaturedProducts() {
  try {
    const payload = await getPayload({ config: configPromise })
    const locale = await getLocale()
    const products = await payload.find({
      collection: 'products',
      limit: 6,
      where: {
        status: { equals: 'active' }
      },
      locale: locale as 'en' | 'es',
      fallbackLocale: 'en',
    })

    return products.docs.map((p: any) => {
      const imageUrl = p.images?.[0]?.image?.url || '/hero-image.png'
      // Use the actual description and truncate it if it's too long
      const rawDesc = p.description || ''
      // Same 120-character budget as before, but cut on a word boundary. The three-dot
      // suffix is kept so the existing card styling is unchanged.
      const shortDesc = truncateAtWord(rawDesc, 120, { suffix: '...' })
      
      return {
        title: p.name,
        desc: shortDesc,
        image: imageUrl,
        link: `/product/${p.slug}`
      }
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}
