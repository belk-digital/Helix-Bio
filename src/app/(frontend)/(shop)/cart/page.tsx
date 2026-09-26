import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CartClient } from './CartClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cartPage')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function CartPage() {
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="pt-20">
        {/* CartClient reads useSearchParams(), which needs its own Suspense boundary now that the
            root (frontend)/loading.tsx no longer wraps every page. */}
        <React.Suspense fallback={null}>
          <CartClient />
        </React.Suspense>
      </div>
    </div>
  )
}
