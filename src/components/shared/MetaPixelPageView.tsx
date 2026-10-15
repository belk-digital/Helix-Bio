'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from '@/i18n/navigation'
import { trackPixel } from '@/lib/metaPixel'

export function MetaPixelPageView() {
  const pathname = usePathname()
  const isFirstMount = useRef(true)

  useEffect(() => {
    // The base snippet already tracks PageView on initial page load.
    // Only fire on subsequent client-side route navigations.
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    trackPixel('PageView')
  }, [pathname])

  return null
}
