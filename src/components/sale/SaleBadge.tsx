'use client'

import React, { useEffect, useState } from 'react'
import {
  SALE_NAME,
  SALE_TIERS,
  isExcludedLine,
  isSaleActive,
} from '@/lib/sale/autoDiscount'

/**
 * Product-facing sale markers: a corner badge for product cards and a one-line
 * note for the product detail page.
 *
 * Both decide eligibility with `isExcludedProduct` — the same function the cart
 * preview and the server totals use — so an excluded product (BAC water,
 * needles) can never be advertised at a rate it will not receive.
 *
 * Deliberately phrased as a cart discount rather than a price cut: no product
 * price changes for this sale, the 30% comes off the eligible subtotal at
 * checkout. Showing a struck-through price here would be a lie.
 *
 * Mount-gated for the same reason AnnouncementBar is: `isSaleActive()` is
 * evaluated against the visitor's clock, so rendering it during SSR could
 * disagree with the first client paint and break hydration.
 */

const SALE_PERCENT = SALE_TIERS[SALE_TIERS.length - 1].percent

function useSaleVisible(
  productSlug?: string | null,
  variantSku?: string | null,
  stock?: number | null,
  requireStock = false,
): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return false
  // Unknown stock counts as unavailable: a caller that cannot resolve it gets
  // no badge rather than one that might sit on something nobody can buy.
  if (requireStock && !(typeof stock === 'number' && stock > 0)) return false
  // isExcludedLine is the sale's single eligibility rule: kits and bundles,
  // then the named product exclusions. Going through it rather than its parts
  // means the badge cannot disagree with what checkout actually discounts.
  // Only priceSnapshot and quantity are irrelevant here, so they are zeroed.
  if (isExcludedLine({ priceSnapshot: 0, quantity: 0, productSlug, variantSku })) return false
  return isSaleActive()
}

/**
 * Corner pill on a product card.
 *
 * `stock` is required in practice: the badge stays hidden unless it is a number
 * greater than zero, so a retired product never advertises a discount it cannot
 * honour, and a card whose data source omits stock simply shows nothing.
 */
export function SaleBadge({
  productSlug,
  variantSku,
  stock,
  className = '',
}: {
  productSlug?: string | null
  variantSku?: string | null
  /** Buyable units, from availableStockOf(). Undefined hides the badge. */
  stock?: number | null
  className?: string
}) {
  if (!useSaleVisible(productSlug, variantSku, stock, true)) return null

  return (
    <span
      className={`inline-block bg-ink text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm ${className}`}
    >
      {SALE_PERCENT}% off
    </span>
  )
}

/** One-line note under the price on the product detail page. */
export function SaleNote({
  productSlug,
  variantSku,
  className = '',
}: {
  productSlug?: string | null
  variantSku?: string | null
  className?: string
}) {
  if (!useSaleVisible(productSlug, variantSku)) return null

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white ${className}`}
    >
      {SALE_NAME} — {SALE_PERCENT}% off at checkout
    </span>
  )
}
