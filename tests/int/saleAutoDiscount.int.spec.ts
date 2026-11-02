import { describe, it, expect } from 'vitest'
import {
  computeSaleDiscount,
  chooseDiscount,
  eligibleSubtotalOf,
  tierFor,
  progressFor,
  progressMessage,
  isSaleActive,
  round2,
  SALE_ENDS_AT,
  type SaleCartLine,
} from '@/lib/sale/autoDiscount'

const DURING = new Date('2026-10-30T12:00:00.000Z')
const AFTER = new Date('2026-11-06T05:00:00.000Z') // one minute past the end instant

const line = (price: number, qty = 1, extra: Partial<SaleCartLine> = {}): SaleCartLine => ({
  priceSnapshot: price,
  quantity: qty,
  variantSku: 'SINGLE-10MG',
  ...extra,
})

/** Mirrors the server fee rule: percentage fee charged on the discounted subtotal. */
const feeOn = (subtotal: number, pct: number) => round2(subtotal * (pct / 100))

describe('Halloween tiered discount', () => {
  it('case 1 — single item cart (~$73.99 with accessories) gets 20% and fee on the discounted subtotal', () => {
    const lines = [line(59.99), line(14.0)] // peptide + auto-added BAC water
    const sale = computeSaleDiscount(lines, DURING)

    expect(sale.active).toBe(true)
    expect(sale.eligibleSubtotal).toBe(73.99)
    expect(sale.percent).toBe(20)
    // 73.99 * 0.20 = 14.798 -> 14.80
    expect(sale.amount).toBe(14.8)
    expect(sale.label).toBe('Halloween Deals (20% off)')

    const discounted = round2(73.99 - sale.amount)
    expect(discounted).toBe(59.19)

    const fee = feeOn(discounted, 3)
    expect(fee).toBe(1.78)
    // Hand calculation: 59.19 + 1.78 + 0 shipping = 60.97
    expect(round2(discounted + fee)).toBe(60.97)
  })

  it('case 2 — adding a second product scales the discount, rate stays 20%', () => {
    const one = computeSaleDiscount([line(59.99), line(14.0)], DURING)
    const two = computeSaleDiscount([line(59.99), line(14.0), line(89.99)], DURING)

    expect(two.percent).toBe(20)
    expect(two.eligibleSubtotal).toBe(163.98)
    expect(two.amount).toBe(32.8) // 163.98 * 0.2 = 32.796 -> 32.80
    expect(two.amount).toBeGreaterThan(one.amount)
  })

  it('case 3 — crossing $250.01 jumps to 25% on the whole eligible subtotal and targets 30%', () => {
    const at250 = computeSaleDiscount([line(125, 2)], DURING) // exactly 250.00
    expect(at250.percent).toBe(20)

    const over = computeSaleDiscount([line(50.01), line(100, 2)], DURING) // 250.01
    expect(over.eligibleSubtotal).toBe(250.01)
    expect(over.percent).toBe(25)
    // Applied to the entire eligible subtotal, not just the amount above the threshold
    expect(over.amount).toBe(62.5) // 250.01 * 0.25 = 62.5025 -> 62.50

    expect(over.progress?.nextTier?.percent).toBe(30)
    expect(over.progress?.amountToNextTier).toBe(250) // 500.01 - 250.01
    expect(progressMessage(over.progress)).toBe('Add $250.00 more to unlock 30% off')
  })

  it('case 3b — over $500 reaches the top tier and the bar shows as unlocked', () => {
    const top = computeSaleDiscount([line(250.01, 2)], DURING) // 500.02
    expect(top.percent).toBe(30)
    expect(top.progress?.isTopTier).toBe(true)
    expect(top.progress?.percentToNextTier).toBe(100)
    expect(progressMessage(top.progress)).toBe('30% off unlocked — top tier')

    // $500.00 exactly is still 25% — the tier needs strictly more
    expect(computeSaleDiscount([line(250, 2)], DURING).percent).toBe(25)
  })

  it('case 4 — removing items steps the rate back down but never removes the discount', () => {
    const before = computeSaleDiscount([line(300), line(50)], DURING) // 350 -> 25%
    expect(before.percent).toBe(25)

    const after = computeSaleDiscount([line(50)], DURING) // 50 -> 20%
    expect(after.percent).toBe(20)
    expect(after.amount).toBe(10)
    expect(after.amount).toBeGreaterThan(0)
    expect(after.active).toBe(true)

    // Only an empty cart yields no discount, and the sale is still "on"
    const empty = computeSaleDiscount([], DURING)
    expect(empty.active).toBe(true)
    expect(empty.amount).toBe(0)
  })

  it('case 5 — coupon and tier never stack; the larger one wins', () => {
    const sale = computeSaleDiscount([line(100, 2)], DURING) // 200 -> 20% -> 40.00

    const couponLoses = chooseDiscount(sale, 25, 'Coupon (SAVE25)')
    expect(couponLoses.source).toBe('sale')
    expect(couponLoses.amount).toBe(40)
    expect(couponLoses.couponAmount).toBe(25) // still reported so the UI can explain

    const couponWins = chooseDiscount(sale, 60, 'Coupon (BIG60)')
    expect(couponWins.source).toBe('coupon')
    expect(couponWins.amount).toBe(60)
    expect(couponWins.saleAmount).toBe(40)

    // Never both
    expect(couponWins.amount).not.toBe(couponWins.amount + couponWins.saleAmount)
    // A tie goes to the sale, so dropping a coupon cannot lower the discount
    expect(chooseDiscount(sale, 40, 'Coupon (TIE)').source).toBe('sale')
  })

  it('case 6 — kits and bundles are excluded from the eligible subtotal and the progress math', () => {
    const lines = [
      line(100),
      line(400, 1, { variantSku: 'KIT-10MG - 5 Kits' }), // legacy " - " bundle marker
      line(300, 1, { variantSku: 'BULK-20MG', isKit: true }), // authoritative flag
    ]

    expect(eligibleSubtotalOf(lines)).toBe(100)

    const sale = computeSaleDiscount(lines, DURING)
    expect(sale.eligibleSubtotal).toBe(100)
    expect(sale.excludedSubtotal).toBe(700)
    expect(sale.percent).toBe(20) // $800 cart, but only $100 is eligible
    expect(sale.amount).toBe(20)
    // Progress is driven by the eligible subtotal only
    expect(sale.progress?.nextTier?.percent).toBe(25)
    expect(sale.progress?.amountToNextTier).toBe(150.01)
  })

  it('case 7 — after the end date there is no discount and no progress bar, coupons unaffected', () => {
    expect(isSaleActive(DURING)).toBe(true)
    expect(isSaleActive(AFTER)).toBe(false)
    expect(isSaleActive(new Date(SALE_ENDS_AT))).toBe(false) // boundary is exclusive

    const ended = computeSaleDiscount([line(600)], AFTER)
    expect(ended.active).toBe(false)
    expect(ended.amount).toBe(0)
    expect(ended.progress).toBeNull()
    expect(ended.label).toBe('')

    // A coupon still applies normally once the sale is over
    const choice = chooseDiscount(ended, 30, 'Coupon (SAVE30)')
    expect(choice.source).toBe('coupon')
    expect(choice.amount).toBe(30)
  })

  it('case 8 — cart and checkout derive identical totals from the same module', () => {
    const lines = [line(129.99), line(99.99), line(14.0)] // 243.98
    const sale = computeSaleDiscount(lines, DURING)
    const shipping = 12.5
    const feePct = 3

    // Cart page pipeline
    const cartDiscounted = round2(sale.eligibleSubtotal - sale.amount)
    const cartTotal = round2(cartDiscounted + shipping + feeOn(cartDiscounted, feePct))

    // Checkout pipeline — same inputs, same module
    const coDiscount = chooseDiscount(sale, 0, '')
    const coDiscounted = round2(243.98 - coDiscount.amount)
    const coTotal = round2(coDiscounted + shipping + feeOn(coDiscounted, feePct))

    expect(sale.amount).toBe(48.8) // 243.98 * 0.2 = 48.796 -> 48.80
    expect(cartTotal).toBe(coTotal)
    expect(coTotal).toBe(213.54)
  })

  it('tier boundaries resolve exactly at the documented cents', () => {
    expect(tierFor(0).percent).toBe(20)
    expect(tierFor(250).percent).toBe(20)
    expect(tierFor(250.01).percent).toBe(25)
    expect(tierFor(500).percent).toBe(25)
    expect(tierFor(500.01).percent).toBe(30)
  })

  it('progress percentage fills across the band and clamps at the ends', () => {
    expect(progressFor(0).percentToNextTier).toBe(0)
    expect(progressFor(250.01).percentToNextTier).toBeCloseTo(0, 2)
    expect(progressFor(125).percentToNextTier).toBeCloseTo(49.998, 2)
    expect(progressFor(500.01).percentToNextTier).toBe(100)
  })
})
