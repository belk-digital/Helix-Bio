/**
 * How many units of a product are actually buyable.
 *
 * A product with variants holds its real inventory on the variant rows, and its
 * own `stock` column is not the sum — so the variant stocks are added up when
 * they exist and the product column is only used when they do not. This mirrors
 * the rule getShopProducts has always applied; it lives here so the several
 * places that map a product doc for a card cannot drift apart.
 *
 * Returns 0 for anything it cannot read, which is the safe direction: callers
 * use this to decide whether to advertise something, and advertising an item
 * that turns out to be unbuyable is worse than staying quiet about one that is.
 */
export function availableStockOf(product: any): number {
  if (!product) return 0

  const variants = Array.isArray(product.variants) ? product.variants : []
  if (product.hasVariants && variants.length > 0) {
    return variants.reduce(
      (acc: number, v: any) => acc + (typeof v?.stock === 'number' ? v.stock : 0),
      0,
    )
  }

  return typeof product.stock === 'number' ? product.stock : 0
}
