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
 *
 * Product exclusions (BAC water, needles) ARE resolvable here, because the cart
 * line stores the product slug. Passing it is what keeps this preview equal to
 * the server's figure — without it the cart would promise a discount on an
 * excluded item that checkout then refuses.
 */
export function useSaleDiscount(items: CartLine[]): SaleDiscount {
  // Depend on the price/qty/sku shape rather than the array identity, so an
  // unrelated re-render does not recompute and a real change always does.
  const signature = items
    .map((i) => `${i.product?.slug ?? ''}:${i.variantSku ?? ''}:${i.priceSnapshot}:${i.quantity}`)
    .join('|')

  return useMemo(() => {
    const lines: SaleCartLine[] = items.map((i) => ({
      priceSnapshot: i.priceSnapshot,
      quantity: i.quantity,
      variantSku: i.variantSku,
      productSlug: i.product?.slug ?? null,
    }))
    return computeSaleDiscount(lines)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])
}
