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

  // Three nodes in equal columns -> centres sit at 1/6, 1/2 and 5/6 of the width.
  // The track spans between the outer centres so the line never pokes out past
  // the first and last node.
  const EDGE = 100 / (SALE_TIERS.length * 2) // 16.667%
  const fillPercent = (reachedIndex / (SALE_TIERS.length - 1)) * 100

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
        <span className="shrink-0 font-heading text-4xl sm:text-5xl font-black leading-none tracking-tight text-white">
          {currentPercent}%
        </span>
      </div>

      {/* Track with one node per tier */}
      <div className="relative mt-6">
        <div
          className="absolute top-[13px] h-[2px] rounded-full bg-white/10"
          style={{ left: `${EDGE}%`, right: `${EDGE}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute top-[13px] h-[2px] rounded-full bg-primary transition-all duration-500"
          style={{ left: `${EDGE}%`, width: `calc((100% - ${EDGE * 2}%) * ${fillPercent / 100})` }}
          aria-hidden="true"
        />

        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${SALE_TIERS.length}, minmax(0, 1fr))` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.percentToNextTier)}
          aria-label={`${SALE_NAME} tier progress — ${currentPercent}% off applied`}
        >
          {SALE_TIERS.map((tier, i) => {
            const reached = hasDiscount && i <= reachedIndex
            return (
              <div key={tier.percent} className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-500 ${
                    reached
                      ? 'bg-primary border-primary text-ink'
                      : 'bg-ink-soft border-white/15 text-white/25'
                  }`}
                >
                  {reached ? (
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <Moon size={13} strokeWidth={2} aria-hidden="true" />
                  )}
                </span>
                <span
                  className={`text-[10px] font-bold tracking-[0.1em] ${
                    reached ? 'text-white' : 'text-white/35'
                  }`}
                >
                  {tier.percent}%
                </span>
              </div>
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
