/**
 * Halloween Deals — automatic tiered cart discount.
 *
 * Single source of truth for the tier rule. The cart drawer, cart page, checkout
 * summary AND the two server-side totals paths (createPaymentIntent /
 * createPayloadOrder) all call into here, so a rate change happens in one place.
 *
 * The browser value is a preview only — the server recomputes the discount from
 * live product data at order creation and never trusts a client-supplied amount.
 */

// Sale ends Nov 1, 11:59 PM ET. DST ends Sun Nov 1 2026 at 02:00, so 23:59 that
// evening is already EST (UTC-5) -> 04:59Z on Nov 2. Stored as a fixed instant and
// compared to `now` exactly the way the Coupons collection compares `expiresAt`.
export const SALE_NAME = 'Halloween Deals'
export const SALE_ENDS_AT = '2026-11-02T04:59:00.000Z'

/** Free-shipping threshold already advertised by the marquee and the shipping zones. */
export const FREE_SHIPPING_THRESHOLD = 300

export type SaleTier = {
  /** Discount rate as a fraction, e.g. 0.25 */
  rate: number
  /** Rate as a whole percentage, for labels. */
  percent: number
  /** Eligible subtotal must be strictly GREATER than this to reach the tier. */
  over: number
}

/** Ordered low -> high. "Over $250" means $250.01 qualifies, $250.00 does not. */
export const SALE_TIERS: SaleTier[] = [
  { rate: 0.2, percent: 20, over: 0 },
  { rate: 0.25, percent: 25, over: 250 },
  { rate: 0.3, percent: 30, over: 500 },
]

/**
 * Same rounding the checkout totals use everywhere else — floating-point sums of
 * decimals drift, so every computed dollar amount is rounded to cents.
 */
export const round2 = (n: number) => Math.round(n * 100) / 100

export type SaleCartLine = {
  priceSnapshot: number
  quantity: number
  variantSku?: string | null
  /**
   * Authoritative kit flag from products.variants[].isKit. Server-side callers
   * resolve and pass it; the browser usually cannot and falls back to the sku rule.
   */
  isKit?: boolean | null
}

/**
 * Kits and bundles are excluded from the sale. Mirrors the rule already used by
 * coupon eligibility in (shop)/actions.ts: the variant's isKit flag, falling back
 * to the legacy " - " bundle marker in the sku.
 */
export function isKitLine(line: SaleCartLine): boolean {
  if (line.isKit === true) return true
  return typeof line.variantSku === 'string' && line.variantSku.includes(' - ')
}

export function isSaleActive(now: Date = new Date()): boolean {
  return now < new Date(SALE_ENDS_AT)
}

/** Subtotal of sale-eligible lines only: singles, sprays and auto-added accessories. */
export function eligibleSubtotalOf(lines: SaleCartLine[]): number {
  const sum = (lines || []).reduce(
    (acc, line) => (isKitLine(line) ? acc : acc + line.priceSnapshot * line.quantity),
    0,
  )
  return round2(sum)
}

export function tierFor(eligibleSubtotal: number): SaleTier {
  let match = SALE_TIERS[0]
  for (const tier of SALE_TIERS) {
    if (eligibleSubtotal > tier.over) match = tier
  }
  return match
}

export type SaleProgress = {
  /** The tier currently applied. */
  tier: SaleTier
  /** The next tier up, or null at the top. */
  nextTier: SaleTier | null
  /** Dollars still needed to reach nextTier (0 at the top tier). */
  amountToNextTier: number
  /** 0-100 progress toward nextTier, or 100 at the top tier. */
  percentToNextTier: number
  /** True when the top tier is reached. */
  isTopTier: boolean
}

export type SaleDiscount = {
  active: boolean
  /** Eligible subtotal the rate was applied to (kits excluded). */
  eligibleSubtotal: number
  /** Subtotal of excluded kit/bundle lines, for display. */
  excludedSubtotal: number
  /** Discount in dollars, rounded to cents. */
  amount: number
  rate: number
  percent: number
  /** e.g. "Halloween Deals (20% off)" */
  label: string
  progress: SaleProgress | null
}

const INACTIVE: SaleDiscount = {
  active: false,
  eligibleSubtotal: 0,
  excludedSubtotal: 0,
  amount: 0,
  rate: 0,
  percent: 0,
  label: '',
  progress: null,
}

/**
 * The tier discount for a cart. Returns an inactive result after the end date so
 * callers can hide both the discount line and the progress bar with one check.
 */
export function computeSaleDiscount(
  lines: SaleCartLine[],
  now: Date = new Date(),
): SaleDiscount {
  if (!isSaleActive(now)) return { ...INACTIVE }

  const eligibleSubtotal = eligibleSubtotalOf(lines)
  const totalSubtotal = round2(
    (lines || []).reduce((acc, l) => acc + l.priceSnapshot * l.quantity, 0),
  )
  const excludedSubtotal = round2(Math.max(0, totalSubtotal - eligibleSubtotal))

  if (eligibleSubtotal <= 0) {
    return { ...INACTIVE, active: true, excludedSubtotal, progress: progressFor(0) }
  }

  const tier = tierFor(eligibleSubtotal)
  return {
    active: true,
    eligibleSubtotal,
    excludedSubtotal,
    amount: round2(eligibleSubtotal * tier.rate),
    rate: tier.rate,
    percent: tier.percent,
    label: `${SALE_NAME} (${tier.percent}% off)`,
    progress: progressFor(eligibleSubtotal),
  }
}

export function progressFor(eligibleSubtotal: number): SaleProgress {
  const tier = tierFor(eligibleSubtotal)
  const index = SALE_TIERS.findIndex((t) => t.rate === tier.rate)
  const nextTier = SALE_TIERS[index + 1] || null

  if (!nextTier) {
    return { tier, nextTier: null, amountToNextTier: 0, percentToNextTier: 100, isTopTier: true }
  }

  // A tier needs strictly more than `over`, so the smallest qualifying amount is
  // one cent past it — that cent is what the "add $X more" figure must cover.
  const target = round2(nextTier.over + 0.01)
  const amountToNextTier = round2(Math.max(0, target - eligibleSubtotal))
  const span = target - tier.over
  const percentToNextTier = span > 0
    ? Math.min(100, Math.max(0, ((eligibleSubtotal - tier.over) / span) * 100))
    : 100

  return { tier, nextTier, amountToNextTier, percentToNextTier, isTopTier: false }
}

export type DiscountChoice = {
  /** Which discount applies. 'none' when neither is available. */
  source: 'sale' | 'coupon' | 'none'
  /** The applied discount in dollars. */
  amount: number
  /** Label for the applied line. */
  label: string
  /** Tier value on this cart, shown even when the coupon wins. */
  saleAmount: number
  saleLabel: string
  /** Coupon value on this cart, shown even when the tier wins. */
  couponAmount: number
  couponLabel: string
}

/**
 * Coupons never stack with the auto-tier: compute both on the same cart and apply
 * the larger. Ties go to the sale, so removing a coupon can never reduce the
 * discount. Both figures are returned so the UI can show why one won.
 *
 * `couponAmount` must be whatever the caller's own coupon path produced, so the
 * comparison matches the value that will actually be charged.
 */
export function chooseDiscount(
  sale: SaleDiscount,
  couponAmount: number,
  couponLabel: string,
): DiscountChoice {
  const saleAmount = sale.active ? sale.amount : 0
  const coupon = Math.max(0, couponAmount || 0)

  const base = {
    saleAmount,
    saleLabel: sale.label,
    couponAmount: coupon,
    couponLabel: couponLabel || '',
  }

  if (coupon > saleAmount) return { ...base, source: 'coupon', amount: coupon, label: couponLabel }
  if (saleAmount > 0) return { ...base, source: 'sale', amount: saleAmount, label: sale.label }
  return { ...base, source: 'none', amount: 0, label: '' }
}

/** Progress-bar copy, e.g. "Add $176.02 more to unlock 25% off". */
export function progressMessage(progress: SaleProgress | null): string {
  if (!progress) return ''
  if (progress.isTopTier) return `${progress.tier.percent}% off unlocked — top tier`
  return `Add $${progress.amountToNextTier.toFixed(2)} more to unlock ${progress.nextTier!.percent}% off`
}
