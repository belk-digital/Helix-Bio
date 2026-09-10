// Pure helpers for the Data-opt integration, kept out of dataoptActions.ts (a 'use server' file,
// which may only export async functions) so they can be unit tested directly.

// Data-opt's own order-creation endpoint doesn't take an arbitrary charge amount the way
// CircoFlows/nextlvlpay do — it looks up a price per-SKU from a catalog you register via
// POST /api/inventory, then totals whatever SKUs/quantities you reference in POST /api/orders.
// To carry our own server-computed total (after coupons/shipping/fees/points — see
// createPayloadOrder) through that model without a shared/racy SKU, each order registers its
// own one-off SKU priced at exactly that total, then immediately references it with qty 1.
export function buildOrderSku(orderId: string | number): string {
  return `HB-ORDER-${orderId}`
}

// Data-opt's jurisdictionCode is only meaningful for its own (unused here — orders are registered
// taxable:false) tax calculation, so this is best-effort metadata, not something we need to get
// exactly right. Only attempt it for US orders with a real two-letter state code; anything else
// is omitted rather than guessed.
export function buildJurisdictionCode(formData: any): string | undefined {
  const country = formData?.country || 'US'
  const state = formData?.state
  if (country === 'US' && typeof state === 'string' && /^[A-Za-z]{2}$/.test(state)) {
    return `US-${state.toUpperCase()}`
  }
  return undefined
}
