import type { SaleCartLine } from './autoDiscount'

/**
 * Builds sale lines from server-validated cart items, resolving the authoritative
 * kit flag from products.variants[].isKit rather than trusting anything the
 * browser sent. Prices come from `liveItems` (already re-validated against the
 * database), so a tampered priceSnapshot cannot inflate the discount.
 *
 * Kit detection mirrors coupon eligibility in (shop)/actions.ts: the variant's
 * isKit flag, falling back to the legacy " - " marker in the sku.
 */
export async function buildSaleLines(
  items: any[],
  liveItems: any[],
  payload: any,
  productsCache?: Map<any, any>,
): Promise<SaleCartLine[]> {
  const lines: SaleCartLine[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const live = liveItems?.[i] || item
    const rawId = item.productId ?? item.product?.id ?? item.product
    const id = !isNaN(Number(rawId)) ? Number(rawId) : rawId

    let product = productsCache?.get(id)
    if (!product) {
      try {
        product = await payload.findByID({ collection: 'products', id, depth: 0 })
      } catch {
        product = null
      }
      if (product && productsCache) productsCache.set(id, product)
    }

    const matchedVariant = Array.isArray(product?.variants)
      ? product.variants.find((v: any) => v.sku === item.variantSku)
      : null

    lines.push({
      priceSnapshot: Number(live.priceSnapshot) || 0,
      quantity: item.quantity || 1,
      variantSku: item.variantSku ?? null,
      isKit: matchedVariant ? !!matchedVariant.isKit : undefined,
    })
  }

  return lines
}
