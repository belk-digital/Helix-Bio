import { describe, it, expect } from 'vitest'
import {
  computeSaleDiscount,
  chooseDiscount,
  eligibleSubtotalOf,
  isExcludedLine,
  isExcludedProduct,
  tierFor,
  progressMessage,
  isSaleActive,
  round2,
  SALE_NAME,
  SALE_TIERS,
  SALE_ENDS_AT,
  SALE_STARTS_AT,
  IS_FLAT_SALE,
  type SaleCartLine,
} from '@/lib/sale/autoDiscount'

/**
 * Early Black Friday: a single flat 30% off eligible products, no minimum.
 *
 * The cases below are the acceptance list for the promotion — an eligible vial,
 * each of the six named blends, the two excluded products, mixed carts, coupon
 * precedence, the browser/server agreement and the end date.
 */

const DURING = new Date('2026-11-19T12:00:00.000Z')
/** Nov 24 2026, 11:59 PM IST == 18:29Z. The boundary itself is already over. */
const AT_END = new Date('2026-11-24T18:29:00.000Z')
const AFTER = new Date('2026-11-24T18:30:00.000Z')

const line = (price: number, qty = 1, extra: Partial<SaleCartLine> = {}): SaleCartLine => ({
  priceSnapshot: price,
  quantity: qty,
  variantSku: 'SINGLE-10MG',
  productSlug: 'bpc-157',
  ...extra,
})

/** Mirrors the server fee rule: percentage fee charged on the discounted subtotal. */
const feeOn = (subtotal: number, pct: number) => round2(subtotal * (pct / 100))

describe('Early Black Friday — sale configuration', () => {
  it('is a single flat 30% tier with no minimum purchase', () => {
    expect(SALE_NAME).toBe('Early Black Friday')
    expect(IS_FLAT_SALE).toBe(true)
    expect(SALE_TIERS).toEqual([{ rate: 0.3, percent: 30, over: 0 }])
    // `over: 0` is what "no minimum" means: any eligible cent qualifies.
    expect(tierFor(0.01).percent).toBe(30)
    expect(tierFor(10000).percent).toBe(30)
  })

  it('runs from deployment until Nov 24 2026, 11:59 PM IST', () => {
    // No start gate: live the moment the code ships.
    expect(SALE_STARTS_AT).toBeNull()
    expect(isSaleActive(new Date('2026-01-01T00:00:00.000Z'))).toBe(true)
    expect(isSaleActive(DURING)).toBe(true)

    // 11:59 PM IST on the 24th is 18:29Z, and the boundary is exclusive.
    expect(SALE_ENDS_AT).toBe('2026-11-24T18:29:00.000Z')
    expect(isSaleActive(AT_END)).toBe(false)
    expect(isSaleActive(AFTER)).toBe(false)
    // One minute earlier is still inside the sale.
    expect(isSaleActive(new Date('2026-11-24T18:28:00.000Z'))).toBe(true)
  })

  it('states the flat rate rather than inviting the shopper to unlock a tier', () => {
    const sale = computeSaleDiscount([line(100)], DURING)
    const message = progressMessage(sale.progress)
    expect(message).toBe('30% off eligible products, applied at checkout')
    expect(message).not.toMatch(/unlock|top tier|add \$/i)
  })
})

describe('Early Black Friday — eligible products', () => {
  it('case 1 — an eligible standalone vial gets exactly 30% off', () => {
    const sale = computeSaleDiscount([line(59.99)], DURING)

    expect(sale.active).toBe(true)
    expect(sale.eligibleSubtotal).toBe(59.99)
    expect(sale.percent).toBe(30)
    expect(sale.rate).toBe(0.3)
    // 59.99 * 0.30 = 17.997 -> 18.00
    expect(sale.amount).toBe(18)
    expect(sale.label).toBe('Early Black Friday (30% off)')
    // Exactly 30%, to the cent, not "about" 30%.
    expect(sale.amount).toBe(round2(sale.eligibleSubtotal * 0.3))
  })

  it('case 2 — each of the six named blend products gets the full 30%', () => {
    // Slugs and SKUs as they exist in the catalogue. These are single-vial
    // products: they must NOT be excluded for containing two compounds or for
    // having "Blend" in the name.
    const blends = [
      { slug: 'bpc-157-tb-500-blend', sku: 'BPCTB5-55', price: 89.99 },
      { slug: 'semax-selank-blend', sku: 'SEMAXS-10MG10MG', price: 74.5 },
      { slug: 'cjc-1295-ipamorelin', sku: 'CJCIPA-5MG5MG', price: 109.0 },
      { slug: 'tesamorelin-ipamorelin-blend', sku: 'TESALP-63MG', price: 149.99 },
      { slug: 'glow', sku: 'GLOW-STD', price: 129.0 },
      { slug: 'klow', sku: 'KLOW-STD', price: 139.0 },
    ]

    for (const b of blends) {
      const l = line(b.price, 1, { productSlug: b.slug, variantSku: b.sku })
      expect(isExcludedLine(l)).toBe(false)

      const sale = computeSaleDiscount([l], DURING)
      expect(sale.percent).toBe(30)
      expect(sale.eligibleSubtotal).toBe(b.price)
      expect(sale.excludedSubtotal).toBe(0)
      expect(sale.amount).toBe(round2(b.price * 0.3))
    }
  })

  it('the discount scales with quantity and never changes rate', () => {
    const one = computeSaleDiscount([line(100)], DURING)
    const five = computeSaleDiscount([line(100, 5)], DURING)

    expect(one.amount).toBe(30)
    expect(five.amount).toBe(150)
    expect(five.percent).toBe(one.percent)
  })
})

describe('Early Black Friday — excluded products', () => {
  it('case 3/4 — BAC Water gets no discount, on every variant', () => {
    for (const sku of ['BACWAT-3ML', 'BACWAT-10ML', 'BACWAT-30ML']) {
      const l = line(14, 1, { productSlug: 'bac-water', variantSku: sku })
      expect(isExcludedLine(l)).toBe(true)

      const sale = computeSaleDiscount([l], DURING)
      expect(sale.eligibleSubtotal).toBe(0)
      expect(sale.amount).toBe(0)
      expect(sale.excludedSubtotal).toBe(14)
    }
  })

  it('case 5 — needles get no discount', () => {
    const l = line(9.99, 1, { productSlug: '10-needles', variantSku: '10-NEEDLES' })
    expect(isExcludedLine(l)).toBe(true)

    const sale = computeSaleDiscount([l], DURING)
    expect(sale.amount).toBe(0)
    expect(sale.excludedSubtotal).toBe(9.99)
  })

  it('excludes by SKU even when the line carries no slug, and the match is case-insensitive', () => {
    // An older persisted cart line, or any caller that could not resolve the
    // product, must still be excluded rather than silently discounted.
    expect(isExcludedProduct(null, 'BACWAT-10ML')).toBe(true)
    expect(isExcludedProduct(undefined, '10-NEEDLES')).toBe(true)
    expect(isExcludedProduct(null, 'bacwat-3ml')).toBe(true)
    // Slug matching is case-insensitive on the real slug...
    expect(isExcludedProduct('Bac-Water', null)).toBe(true)
    expect(isExcludedProduct('BAC-WATER', null)).toBe(true)
    // ...but it is an exact match, not a prefix or substring rule.
    expect(isExcludedProduct('bac-water-sterile', null)).toBe(false)
    expect(isExcludedProduct('needles', null)).toBe(false)
  })

  it('does not exclude eligible products that merely look similar', () => {
    // Guards against a loose substring rule creeping back in.
    for (const slug of ['bpc-157', 'water-soluble-peptide', 'aod9604', 'glow', 'klow']) {
      expect(isExcludedProduct(slug, 'ABC-10MG')).toBe(false)
    }
    expect(isExcludedProduct('bpc-157', 'BPC157-10MG')).toBe(false)
  })

  it('case 6 — kits and bundles get no discount', () => {
    const kitByFlag = line(400, 1, { variantSku: 'BULK-20MG', isKit: true })
    const kitBySku = line(300, 1, { variantSku: 'KIT-10MG - 5 Kits' })

    expect(isExcludedLine(kitByFlag)).toBe(true)
    expect(isExcludedLine(kitBySku)).toBe(true)
    expect(computeSaleDiscount([kitByFlag, kitBySku], DURING).amount).toBe(0)
  })
})

describe('Early Black Friday — mixed carts', () => {
  it('case 7 — only the eligible lines are discounted', () => {
    const lines = [
      line(99.99, 1, { productSlug: 'bpc-157', variantSku: 'BPC157-10MG' }), // eligible
      line(129.0, 1, { productSlug: 'glow', variantSku: 'GLOW-STD' }), // eligible blend
      line(14.0, 1, { productSlug: 'bac-water', variantSku: 'BACWAT-10ML' }), // excluded
      line(9.99, 2, { productSlug: '10-needles', variantSku: '10-NEEDLES' }), // excluded
    ]

    const sale = computeSaleDiscount(lines, DURING)

    expect(eligibleSubtotalOf(lines)).toBe(228.99)
    expect(sale.eligibleSubtotal).toBe(228.99)
    expect(sale.excludedSubtotal).toBe(33.98) // 14.00 + 19.98
    expect(sale.amount).toBe(68.7) // 228.99 * 0.3 = 68.697 -> 68.70

    // The excluded lines are charged in full: the discount is strictly less than
    // 30% of the whole cart.
    const wholeCart = round2(228.99 + 33.98)
    expect(sale.amount).toBeLessThan(round2(wholeCart * 0.3))
  })

  it('a cart of nothing but excluded products gets no discount at all', () => {
    const sale = computeSaleDiscount(
      [
        line(14, 1, { productSlug: 'bac-water', variantSku: 'BACWAT-10ML' }),
        line(9.99, 1, { productSlug: '10-needles', variantSku: '10-NEEDLES' }),
      ],
      DURING,
    )
    // The sale is still running — there is simply nothing here it applies to.
    expect(sale.active).toBe(true)
    expect(sale.amount).toBe(0)
    expect(sale.label).toBe('')
  })
})

describe('Early Black Friday — coupons', () => {
  it('case 8 — coupon and sale never stack; the larger one wins, ties to the sale', () => {
    const sale = computeSaleDiscount([line(100, 2)], DURING) // 200 -> 30% -> 60.00
    expect(sale.amount).toBe(60)

    const couponLoses = chooseDiscount(sale, 25, 'Coupon (SAVE25)')
    expect(couponLoses.source).toBe('sale')
    expect(couponLoses.amount).toBe(60)
    expect(couponLoses.couponAmount).toBe(25) // still reported so the UI can explain

    const couponWins = chooseDiscount(sale, 80, 'Coupon (BIG80)')
    expect(couponWins.source).toBe('coupon')
    expect(couponWins.amount).toBe(80)
    expect(couponWins.saleAmount).toBe(60)

    // Never the sum of both
    expect(couponWins.amount).toBe(80)
    expect(couponWins.amount).not.toBe(couponWins.saleAmount + couponWins.couponAmount)

    // A tie goes to the sale, so dropping a coupon cannot lower the discount
    expect(chooseDiscount(sale, 60, 'Coupon (TIE)').source).toBe('sale')
  })

  it('a coupon still applies normally once the sale has ended', () => {
    const ended = computeSaleDiscount([line(600)], AFTER)
    const choice = chooseDiscount(ended, 30, 'Coupon (SAVE30)')
    expect(choice.source).toBe('coupon')
    expect(choice.amount).toBe(30)
  })
})

describe('Early Black Friday — totals and the end date', () => {
  it('case 9/10 — the browser preview and the server totals derive the same amount', () => {
    // Both sides call computeSaleDiscount with the same SaleCartLine fields. The
    // browser fills productSlug from the stored cart line, the server from the
    // product record it loads; identical input, identical output.
    const browserLines: SaleCartLine[] = [
      { priceSnapshot: 129.99, quantity: 1, variantSku: 'GLOW-STD', productSlug: 'glow' },
      { priceSnapshot: 14.0, quantity: 1, variantSku: 'BACWAT-10ML', productSlug: 'bac-water' },
    ]
    const serverLines: SaleCartLine[] = [
      // Server additionally resolves the authoritative kit flag.
      { ...browserLines[0], isKit: false },
      { ...browserLines[1], isKit: false },
    ]

    const preview = computeSaleDiscount(browserLines, DURING)
    const authoritative = computeSaleDiscount(serverLines, DURING)
    expect(preview.amount).toBe(authoritative.amount)
    expect(preview.eligibleSubtotal).toBe(authoritative.eligibleSubtotal)

    // ...and the amount charged follows the server's own arithmetic chain.
    const subtotal = round2(129.99 + 14.0)
    const discount = chooseDiscount(authoritative, 0, '').amount
    const subtotalAfterDiscount = round2(Math.max(0, subtotal - discount))
    const shipping = 12.5
    const total = round2(subtotalAfterDiscount + shipping + feeOn(subtotalAfterDiscount, 3))
    const amountInCents = Math.round(total * 100)

    expect(discount).toBe(39) // 129.99 * 0.3 = 38.997 -> 39.00; BAC water excluded
    expect(subtotalAfterDiscount).toBe(104.99)
    expect(total).toBe(120.64) // 104.99 + 12.50 + 3.15
    // The integer handed to the payment intent is the same number the order stores.
    expect(amountInCents).toBe(12064)
    expect(round2(amountInCents / 100)).toBe(total)
  })

  it('case 12 — after Nov 24 11:59 PM IST there is no discount and no sale card', () => {
    const ended = computeSaleDiscount([line(600)], AFTER)
    expect(ended.active).toBe(false)
    expect(ended.amount).toBe(0)
    expect(ended.progress).toBeNull()
    expect(ended.label).toBe('')

    // Exactly at the cut-off instant, too.
    expect(computeSaleDiscount([line(600)], AT_END).active).toBe(false)
  })
})
