import crypto from 'crypto'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Ping endpoint from Data-opt's own webhook (documented as X-DataOpt-Signature: sha256={hex},
// HMAC-SHA256 over the raw body using the merchant API key as the signing secret). Signature
// verification failures are rejected outright, unlike CircoFlows' webhook (which had to fall back
// to a soft warning because that gateway didn't reliably send its signature in practice) — treat
// that as the fallback to reach for here too if Data-opt's signature turns out to be as unreliable
// once live traffic is observed.
//
// Either way, the body is only ever used to learn *which* order to check — the actual paid/failed
// verdict always comes from syncDataOptPaymentStatus's own authenticated call to Data-opt, which
// can't be forged by whoever POSTs here.
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, signingSecret: string | undefined): boolean {
  if (!signatureHeader || !signingSecret) return false

  const match = signatureHeader.match(/^sha256=(.+)$/)
  if (!match) return false
  const providedSignature = match[1]

  const expectedSignature = crypto.createHmac('sha256', signingSecret).update(rawBody).digest('hex')

  try {
    const providedBuf = Buffer.from(providedSignature, 'hex')
    const expectedBuf = Buffer.from(expectedSignature, 'hex')
    if (providedBuf.length !== expectedBuf.length) return false
    return crypto.timingSafeEqual(providedBuf, expectedBuf)
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signatureHeader = req.headers.get('x-dataopt-signature')

    if (!verifyWebhookSignature(rawBody, signatureHeader, process.env.DATAOPT_API_KEY)) {
      return new Response('Invalid signature', { status: 401 })
    }

    const payloadBody = JSON.parse(rawBody)
    const { event, receiptId } = payloadBody
    if (event !== 'receipt.paid' || !receiptId) {
      return new Response('Ignored', { status: 200 })
    }

    // The webhook only names Data-opt's own receiptId, not our order id — look up which order
    // that receipt belongs to (set on the order at creation time, see createDataOptPayment).
    const payload = await getPayload({ config: configPromise })
    const orders = await payload.find({
      collection: 'orders',
      where: { dataoptReceiptId: { equals: String(receiptId) } },
      limit: 1,
      overrideAccess: true,
    })
    const order = orders.docs[0]
    if (!order) {
      return new Response('Unknown receipt', { status: 200 })
    }

    const { syncDataOptPaymentStatus } = await import('@/app/(frontend)/(shop)/checkout/dataoptActions')
    const result = await syncDataOptPaymentStatus(String(order.id))
    if (result.error) {
      // Let Data-opt retry — this failed for a reason other than "not paid yet".
      return new Response(result.error, { status: 500 })
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error: any) {
    console.error('Data-opt webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
}
