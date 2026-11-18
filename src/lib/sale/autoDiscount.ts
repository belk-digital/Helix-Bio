/**
 * Early Black Friday — automatic cart discount on eligible products.
 *
 * Single source of truth for the rule. The cart drawer, cart page, checkout
 * summary AND the two server-side totals paths (createPaymentIntent /
 * createPayloadOrder) all call into here, so a rate, date or exclusion change
 * happens in one place.
 *
 * The browser value is a preview only — the server recomputes the discount from
 * live product data at order creation and never trusts a client-supplied amount.
 * For that preview to agree with what is charged, both sides must feed the same
 * fields into `SaleCartLine`; see `isExcludedLine` for what those are.
 */

/**
 * Sale window. Both are fixed instants compared against `now` exactly the way
 * the Coupons collection compares `expiresAt`. Every sale surface — the
 * discount, the banner popup, the announcement bar, the marquee and the cart
 * card — reads these two values, so moving a date here moves all of them.
 *
 * SALE_STARTS_AT is null, which means the sale is live the moment this code
 * deploys. Set it to an ISO instant to gate the start instead.
 *
 * SALE_ENDS_AT: Nov 24 2026, 11:59 PM IST. IST is UTC+5:30 year-round (no DST),
 * so 23:59 IST on the 24th is 18:29Z the same day.
 */
export const SALE_NAME = 'Early Black Friday'
export const SALE_STARTS_AT: string | null = null
export const SALE_ENDS_AT = '2026-11-24T18:29:00.000Z'

/** Timezone the end date is advertised in, so copy cannot drift from the instant. */
export const SALE_ENDS_TIMEZONE = 'Asia/Kolkata'
export const SALE_ENDS_TIMEZONE_LABEL = 'IST'

/** Free-shipping threshold already advertised by the marquee and the shipping zones. */
export const FREE_SHIPPING_THRESHOLD = 300

export type SaleTier = {
  /** Discount rate as a fraction, e.g. 0.3 */
  rate: number
  /** Rate as a whole percentage, for labels. */
  percent: number
  /** Eligible subtotal must be strictly GREATER than this to reach the tier. */
  over: number
}

/**
 * Ordered low -> high. Early Black Friday is a single flat tier with no minimum
 * purchase, so every eligible cart gets the same rate. The tier machinery is
 * kept because the cart, checkout and progress card all read their figures off
 * it, and a future multi-tier sale needs only this array back.
 */
export const SALE_TIERS: SaleTier[] = [{ rate: 0.3, percent: 30, over: 0 }]

/** True while the sale has exactly one rate, so no "unlock the next tier" copy applies. */
export const IS_FLAT_SALE = SALE_TIERS.length === 1

/**
 * Products excluded from the sale, by slug.
 *
 * Deliberately an explicit list rather than a category or name rule. Verified
 * against the live catalogue: `bac-water` (id 152) and `10-needles` (id 180) are
 * the only BAC water and needle products, and neither carries a category — but
 * five ordinary peptides are uncategorised too, so "no category" would exclude
 * the wrong things. Name matching is worse still: six eligible products are
 * blends and combinations ("BPC-157 / TB-500 Blend", "Glow", "Klow" and the
 * rest), which are single-vial products and must keep the discount.
 *
 * Add a slug here to pull a product out of the sale; nothing else needs editing.
 */
export const SALE_EXCLUDED_SLUGS: string[] = ['bac-water', '10-needles']

/**
 * SKU backstop for the same two products, used when a line has no slug — an old
 * persisted cart, or any caller that cannot resolve the product. Matched as a
 * prefix and case-insensitively against the live SKUs: BACWAT-3ML / -10ML /
 * -30ML and 10-NEEDLES. Confirmed that no other product's SKU begins with
 * either, so this cannot catch an eligible line.
 */
export const SALE_EXCLUDED_SKU_PREFIXES: string[] = ['BACWAT-', '10-NEEDLES']

/** Plain-English exclusion note, shown wherever the sale is explained. */
export const SALE_EXCLUSION_NOTE = 'BAC water, needles, kits and bundles are excluded'

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
   * Product slug, the primary eligibility key. Server-side callers read it off
   * the product record they already load; the browser reads it from the cart
   * line's stored product. Both must pass it or the preview and the charged
   * amount can disagree.
   */
  productSlug?: string | null
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
 *
 * No catalogue row currently sets either, so this excludes nothing today — it is
 * kept so a kit added later is out of the sale without a code change.
 */
export function isKitLine(line: SaleCartLine): boolean {
  if (line.isKit === true) return true
  return typeof line.variantSku === 'string' && line.variantSku.includes(' - ')
}

/** True when a line is named in the exclusions, by slug or by its SKU backstop. */
export function isExcludedProduct(
  productSlug?: string | null,
  variantSku?: string | null,
): boolean {
  const slug = typeof productSlug === 'string' ? productSlug.trim().toLowerCase() : ''
  if (slug && SALE_EXCLUDED_SLUGS.includes(slug)) return true

  const sku = typeof variantSku === 'string' ? variantSku.trim().toUpperCase() : ''
  if (sku && SALE_EXCLUDED_SKU_PREFIXES.some((prefix) => sku.startsWith(prefix))) return true

  return false
}

/**
 * The one eligibility rule. Every surface that decides whether a line is in the
 * sale — the browser preview, the server totals, the product badge — goes
 * through here, so they cannot drift apart.
 */
export function isExcludedLine(line: SaleCartLine): boolean {
  if (isKitLine(line)) return true
  return isExcludedProduct(line.productSlug, line.variantSku)
}

export function isSaleActive(now: Date = new Date()): boolean {
  if (SALE_STARTS_AT && now < new Date(SALE_STARTS_AT)) return false
  return now < new Date(SALE_ENDS_AT)
}

/** Subtotal of sale-eligible lines only — excluded products and kits left out. */
export function eligibleSubtotalOf(lines: SaleCartLine[]): number {
  const sum = (lines || []).reduce(
    (acc, line) => (isExcludedLine(line) ? acc : acc + line.priceSnapshot * line.quantity),
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
  /** Eligible subtotal the rate was applied to (exclusions removed). */
  eligibleSubtotal: number
  /** Subtotal of excluded lines, for display. */
  excludedSubtotal: number
  /** Discount in dollars, rounded to cents. */
  amount: number
  rate: number
  percent: number
  /** e.g. "Early Black Friday (30% off)" */
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
 * The discount for a cart. Returns an inactive result outside the sale window so
 * callers can hide both the discount line and the sale card with one check.
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
  /** Sale value on this cart, shown even when the coupon wins. */
  saleAmount: number
  saleLabel: string
  /** Coupon value on this cart, shown even when the sale wins. */
  couponAmount: number
  couponLabel: string
}

/**
 * Coupons never stack with the automatic sale: compute both on the same cart and
 * apply the larger. Ties go to the sale, so removing a coupon can never reduce
 * the discount. Both figures are returned so the UI can show why one won.
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

/**
 * Cart-card copy. With one flat tier there is nothing to unlock, so it states
 * the rate instead of inviting the shopper to spend more; a multi-tier sale gets
 * the "add $X more" message back automatically.
 */
export function progressMessage(progress: SaleProgress | null): string {
  if (!progress) return ''
  if (IS_FLAT_SALE) return `${progress.tier.percent}% off eligible products, applied at checkout`
  if (progress.isTopTier) return `${progress.tier.percent}% off unlocked — top tier`
  return `Add $${progress.amountToNextTier.toFixed(2)} more to unlock ${progress.nextTier!.percent}% off`
}

/**
 * The end date as advertised, derived from SALE_ENDS_AT so the copy can never
 * state a different day from the one the discount actually stops on. Rendered in
 * the timezone the sale was set in, with the US Eastern equivalent alongside,
 * since the store prices and ships from the US.
 */
export function saleEndsLabel(): string {
  const ends = new Date(SALE_ENDS_AT)
  const day = ends.toLocaleString('en-US', {
    timeZone: SALE_ENDS_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const time = ends.toLocaleString('en-US', {
    timeZone: SALE_ENDS_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
  const et = ends.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${day} at ${time} ${SALE_ENDS_TIMEZONE_LABEL} (${et} ET)`
}
