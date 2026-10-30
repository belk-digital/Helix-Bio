'use client'

import { useMemo } from 'react'
import { computeSaleDiscount, type SaleCartLine, type SaleDiscount } from './autoDiscount'
import type { CartLine } from '@/lib/cart/store'

/**
 * Browser-side preview of the tier discount. Recomputed from the cart lines on
 * every render, so add / quantity-change / remove all step the rate up or down
 * immediately without any extra wiring.
 *
 * The browser cannot see products.variants[].isKit, so kit detection here falls
 * back to the legacy " - " sku marker. The server re-resolves the real flag at
 * order creation, which is the value actually charged.
 */
export function useSaleDiscount(items: CartLine[]): SaleDiscount {
  // Depend on the price/qty/sku shape rather than the array identity, so an
  // unrelated re-render does not recompute and a real change always does.
  const signature = items
    .map((i) => `${i.variantSku ?? ''}:${i.priceSnapshot}:${i.quantity}`)
    .join('|')

  return useMemo(() => {
    const lines: SaleCartLine[] = items.map((i) => ({
      priceSnapshot: i.priceSnapshot,
      quantity: i.quantity,
      variantSku: i.variantSku,
    }))
    return computeSaleDiscount(lines)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])
}
