import { createHash } from 'crypto'
import { IS_PRODUCTION_DEPLOYMENT } from './analyticsConfig'

const GRAPH_API_VERSION = 'v21.0'

// A "Dataset ID" in Meta's current Events Manager is the same identifier as a Pixel ID — reuse
// the public pixel env var rather than duplicating it under a second name. The access token is
// server-only and must NEVER be prefixed NEXT_PUBLIC_ (that would ship it to the browser).
const DATASET_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
const ACCESS_TOKEN = process.env.FB_CONVERSIONS_API_ACCESS_TOKEN
// Set while verifying in Meta's Test Events tab; remove once events show up as real/live.
const TEST_EVENT_CODE = process.env.FB_CONVERSIONS_API_TEST_EVENT_CODE

const sha256 = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex')

/**
 * Sends a Purchase event to Meta's Conversions API, mirroring the browser Pixel's `trackPurchase`
 * (src/lib/metaPixel.ts, fired from OrderConfirmationClient). Both use the SAME event_id — the
 * order id — which is what lets Meta deduplicate the two into a single conversion instead of
 * double-counting it. This one fires server-side from finalizeOrder, so it still lands even when
 * the customer's browser never loads the confirmation page (closed the tab, ad blocker, Safari
 * ITP stripping the pixel, async payment methods like Zelle/crypto confirmed later by a human).
 *
 * Fire-and-forget by design: a failure here must never affect order finalization. Inert (silently
 * a no-op) unless both the dataset ID and access token are configured, and only sends in
 * production — same gating as every other analytics integration in this codebase.
 */
export async function sendMetaPurchaseEvent(params: {
  orderId: string
  value: number
  email?: string | null
  phone?: string | null
  externalId?: string | null
  contentIds: string[]
  numItems?: number
  eventSourceUrl?: string
}): Promise<void> {
  if (!IS_PRODUCTION_DEPLOYMENT || !DATASET_ID || !ACCESS_TOKEN) return

  const userData: Record<string, unknown> = {}
  if (params.email) userData.em = [sha256(params.email)]
  if (params.phone) {
    const digitsOnly = params.phone.replace(/[^0-9]/g, '')
    if (digitsOnly) userData.ph = [sha256(digitsOnly)]
  }
  if (params.externalId) userData.external_id = [sha256(String(params.externalId))]

  // No user_data at all means Meta can't match this to anyone — not worth sending.
  if (Object.keys(userData).length === 0) {
    console.warn(`[meta-capi] Skipping Purchase event for order ${params.orderId}: no email/phone/external_id to match on`)
    return
  }

  const event = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.orderId,
    action_source: 'website',
    ...(params.eventSourceUrl ? { event_source_url: params.eventSourceUrl } : {}),
    user_data: userData,
    custom_data: {
      currency: 'USD',
      value: params.value,
      content_ids: params.contentIds,
      content_type: 'product',
      ...(params.numItems !== undefined ? { num_items: params.numItems } : {}),
      order_id: params.orderId,
    },
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${DATASET_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [event],
        ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[meta-capi] Purchase event rejected for order ${params.orderId} (HTTP ${res.status}): ${body}`)
    }
  } catch (error) {
    console.error(`[meta-capi] Purchase event failed to send for order ${params.orderId}`, error)
  }
}
