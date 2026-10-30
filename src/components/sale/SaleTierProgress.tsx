'use client'

import React from 'react'
import { Check, Moon } from 'lucide-react'
import {
  SALE_NAME,
  SALE_TIERS,
  progressMessage,
  type SaleDiscount,
} from '@/lib/sale/autoDiscount'

/**
 * Tier progress bar shared by the cart drawer, cart page and checkout summary.
 *
 * Every figure shown here comes straight off the `sale` object computed by
 * lib/sale/autoDiscount — the current rate, the eligible subtotal it was derived
 * from and the gap to the next tier. Nothing is recalculated locally, so the bar
 * cannot disagree with the cart totals.
 *
 * Renders nothing once the sale has ended, so callers need no date check.
 *
 * Accent is the Helix logo blue (`primary`, #92DCE5) from the Tailwind theme.
 */
export function SaleTierProgress({
  sale,
  variant = 'light',
  className = '',
}: {
  sale: SaleDiscount
  /**
   * Retained for call-site compatibility. The card is dark in both contexts by
   * design, so this only nudges the outer ring that separates it from the
   * surrounding panel.
   */
  variant?: 'light' | 'dark'
  className?: string
}) {
  if (!sale.active || !sale.progress) return null

  const { progress } = sale
  // The rate actually applied right now. `sale.percent` is 0 on an empty cart,
  // in which case the first tier is what the shopper is working toward.
  const currentPercent = sale.percent || progress.tier.percent
  const currentIndex = SALE_TIERS.findIndex((t) => t.percent === currentPercent)
  const reachedIndex = currentIndex === -1 ? 0 : currentIndex
  const hasDiscount = sale.amount > 0

  // Node centres sit at 0%, 50% and 100% of the track, so the first and last
  // nodes anchor each end and the line spans the full width between them.
  const segments = SALE_TIERS.length - 1

  // The bar creeps forward on every item added, rather than snapping only when a
  // threshold is crossed: the filled length is the current node plus however far
  // the cart has travelled toward the next one. `percentToNextTier` is the sale
  // module's own figure — nothing about the tier is recalculated here.
  const withinTier = progress.isTopTier ? 0 : progress.percentToNextTier / 100
  const fillPercent = hasDiscount
    ? Math.min(100, ((reachedIndex + withinTier) / segments) * 100)
    : 0

  return (
    <div
      className={`w-full rounded-[16px] border p-5 sm:p-6 bg-ink ${
        variant === 'dark' ? 'border-white/10' : 'border-ink/80'
      } ${className}`}
    >
      {/* Top row: sale name + message on the left, current rate on the right */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {SALE_NAME}
          </span>
          <p className="mt-1.5 text-[13px] sm:text-sm font-medium leading-snug text-white">
            {hasDiscount
              ? progressMessage(progress)
              : `Add items to unlock ${SALE_TIERS[0].percent}% off`}
          </p>
        </div>
        <span className="shrink-0 font-heading text-4xl sm:text-5xl font-black leading-none tracking-tight text-primary">
          {currentPercent}
          <span className="text-2xl sm:text-3xl align-top">%</span>
        </span>
      </div>

      {/* Track: one node per tier, outer nodes anchored to each end */}
      <div className="mt-6">
        <div
          className="relative h-8"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(fillPercent)}
          aria-label={`${SALE_NAME} tier progress — ${currentPercent}% off applied`}
        >
          <div
            className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <div
            className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${fillPercent}%` }}
            aria-hidden="true"
          />

          {SALE_TIERS.map((tier, i) => {
            const reached = hasDiscount && i <= reachedIndex
            const isCurrent = hasDiscount && i === reachedIndex
            return (
              <span
                key={tier.percent}
                className={`absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-colors duration-500 ${
                  isCurrent ? 'h-8 w-8' : 'h-6 w-6'
                } ${
                  reached
                    ? 'bg-primary border-primary text-ink'
                    : 'bg-ink-soft border-white/15 text-white/25'
                }`}
                style={{ left: `${(i / segments) * 100}%` }}
              >
                {reached ? (
                  <Check size={isCurrent ? 16 : 13} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Moon size={13} strokeWidth={2} aria-hidden="true" />
                )}
              </span>
            )
          })}
        </div>

        {/* Labels line up under the nodes: first left, last right, rest centred */}
        <div className="mt-2 flex justify-between">
          {SALE_TIERS.map((tier, i) => {
            const reached = hasDiscount && i <= reachedIndex
            return (
              <span
                key={tier.percent}
                className={`text-[11px] font-bold tracking-[0.05em] ${
                  reached ? 'text-white' : 'text-white/35'
                }`}
              >
                {tier.percent}%
              </span>
            )
          })}
        </div>
      </div>

      {sale.excludedSubtotal > 0 && (
        <p className="mt-4 text-[9px] uppercase tracking-[0.15em] text-white/40">
          Kits &amp; bundles excluded from the sale
        </p>
      )}
    </div>
  )
}
