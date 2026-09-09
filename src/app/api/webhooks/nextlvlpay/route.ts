// Ping endpoint from nextlvlpay's own Stripe webhook. Mirrors the trust model already used for
// CircoFlows (see api/webhooks/circoflows/route.ts): the body is only ever used to learn which
// order to act on, never trusted as the actual payment verdict. A 'succeeded' ping triggers a
// fresh authenticated status check against nextlvlpay's own /api/payments/status before anything
// is finalized. A 'failed' ping only cancels a still-pending order to release its reservation —
// a safe, reversible action — mirroring HelixBio's own native Stripe webhook's
// payment_intent.payment_failed handler.
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.NEXTLVLPAY_API_SECRET || authHeader !== `Bearer ${process.env.NEXTLVLPAY_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { orderId, eventType } = await req.json()
    if (!orderId || !eventType) {
      return new Response('Missing orderId or eventType', { status: 400 })
    }

    if (eventType === 'succeeded') {
      const { syncNextlvlpayPaymentStatus } = await import(
        '@/app/(frontend)/(shop)/checkout/nextlvlpayActions'
      )
      const result = await syncNextlvlpayPaymentStatus(String(orderId))
      if (result.error) {
        // Let nextlvlpay retry — this failed for a reason other than "not paid yet".
        return new Response(result.error, { status: 500 })
      }
    } else if (eventType === 'failed') {
      const { cancelUnfinalizedOrder } = await import(
        '@/app/(frontend)/(shop)/checkout/nextlvlpayActions'
      )
      await cancelUnfinalizedOrder(orderId)
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error: any) {
    console.error('nextlvlpay webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
}
