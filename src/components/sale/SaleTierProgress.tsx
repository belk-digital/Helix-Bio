'use client'

import React from 'react'
import { progressMessage, type SaleDiscount } from '@/lib/sale/autoDiscount'

/**
 * Tier progress bar shared by the cart drawer, cart page and checkout summary.
 * Renders nothing once the sale has ended, so the caller needs no date check.
 */
export function SaleTierProgress({
  sale,
  variant = 'light',
  className = '',
}: {
  sale: SaleDiscount
  /** 'dark' for the cart drawer's dark panel, 'light' elsewhere. */
  variant?: 'light' | 'dark'
  className?: string
}) {
  if (!sale.active || !sale.progress) return null

  const { progress } = sale
  const isDark = variant === 'dark'
  const track = isDark ? 'bg-white/15' : 'bg-ink/10'
  const fill = isDark ? 'bg-gold' : 'bg-gold-dark'
  const label = isDark ? 'text-white/70' : 'text-ink-muted'
  const strong = isDark ? 'text-white' : 'text-ink'

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${strong}`}>
          {progress.tier.percent}% off applied
        </span>
        <span className={`text-[10px] tracking-wide ${label}`}>{progressMessage(progress)}</span>
      </div>
      <div
        className={`h-1.5 w-full rounded-full overflow-hidden ${track}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.percentToNextTier)}
        aria-label="Halloween Deals tier progress"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${fill}`}
          style={{ width: `${progress.isTopTier ? 100 : progress.percentToNextTier}%` }}
        />
      </div>
      {sale.excludedSubtotal > 0 && (
        <p className={`mt-2 text-[9px] uppercase tracking-[0.15em] ${label}`}>
          Kits &amp; bundles excluded from the sale
        </p>
      )}
    </div>
  )
}
