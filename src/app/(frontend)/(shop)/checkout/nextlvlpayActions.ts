'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { createPayloadOrder, notifyAdminFailedPayment } from './actions'
import { fetchNextlvlpayStatus, findExistingNextlvlpayPayment } from '@/lib/orders/nextlvlpayGateway'

const NEXTLVLPAY_API_BASE_URL = process.env.NEXTLVLPAY_API_BASE_URL as string
const NEXTLVLPAY_API_SECRET = process.env.NEXTLVLPAY_API_SECRET as string
const NEXTLVLPAY_CHECKOUT_URL = process.env.NEXT_PUBLIC_NEXTLVLPAY_CHECKOUT_URL as string

/**
 * Creates the pending order (same reservation/dedupe path as every other payment method), then
 * asks nextlvlpay's own Stripe account to open a PaymentIntent for it. The order's own id is
 * passed as metadata so the status check / webhook ping can find it back — mirroring exactly how
 * CircoFlows' merchant_transaction_id works in createCircoFlowsPayment.
 */
export async function createNextlvlpayPayment(
  items: any[],
  shippingMethodName: string,
  couponCode: string | undefined,
  isRedeemingPoints: boolean,
  formData: any,
  userId?: string,
  isNewAddress = false
): Promise<{ orderId?: string; redirectUrl?: string; error?: string; updatedItems?: any[]; priceChanged?: boolean }> {
  const orderRes = await createPayloadOrder(
    items,
    shippingMethodName,
    couponCode,
    isRedeemingPoints,
    formData,
    'nextlvlpay_pending',
    userId,
    'nextlvlpay',
    isNewAddress
  )

  if (orderRes.error || !orderRes.orderId) {
    return orderRes
  }

  const payload = await getPayload({ config: configPromise })
  const order = await payload.findByID({ collection: 'orders', id: Number(orderRes.orderId), depth: 0, overrideAccess: true })
  if (!order) {
    return { error: 'Order not found after creation' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || `https://${headersList.get('host')}`

  // The duplicate-click guard in createPayloadOrder can hand back an order that already has a
  // PaymentIntent. Keep that one rather than opening a second — see findExistingNextlvlpayPayment.
  const existing = await findExistingNextlvlpayPayment(order)
  if (existing.kind === 'reuse') {
    return { orderId: orderRes.orderId, redirectUrl: `${NEXTLVLPAY_CHECKOUT_URL}?pi=${existing.paymentIntentId}` }
  }
  if (existing.kind === 'already_paid') {
    // Paid (or paying) already: send them to the confirmation page, which verifies and finalizes.
    return { orderId: orderRes.orderId, redirectUrl: `${origin}/order-confirmation/${order.id}` }
  }

  try {
    const response = await fetch(`${NEXTLVLPAY_API_BASE_URL}/payments/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NEXTLVLPAY_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: String(order.id),
        amount: order.total,
        currency: 'usd',
        returnUrl: `${origin}/order-confirmation/${order.id}`,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.paymentIntentId) {
      // Release the reservation immediately rather than leaving a dead pending order sitting
      // on reserved stock/coupon/points — same cleanup path used for a failed CircoFlows session.
      await cancelUnfinalizedOrder(order.id)
      await notifyAdminFailedPayment(String(order.id), data.error || 'Failed to initialize nextlvlpay payment session').catch(console.error)
      return { error: 'Failed to initialize payment. Please try again.' }
    }

    // Stored for support/reconciliation lookups and for the status-check fallback below.
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { nextlvlpayPaymentIntentId: data.paymentIntentId },
      overrideAccess: true,
    })

    return { orderId: orderRes.orderId, redirectUrl: `${NEXTLVLPAY_CHECKOUT_URL}?pi=${data.paymentIntentId}` }
  } catch (error: any) {
    await cancelUnfinalizedOrder(order.id)
    await notifyAdminFailedPayment(String(order.id), error.message || 'nextlvlpay session creation threw').catch(console.error)
    console.error('nextlvlpay session creation failed:', error)
    return { error: 'Failed to reach nextlvlpay. Please try again.' }
  }
}

export async function cancelUnfinalizedOrder(orderId: string | number) {
  try {
    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0, overrideAccess: true })
    if (order && !order.isFinalized && order.status === 'pending') {
      await payload.update({ collection: 'orders', id: Number(orderId), data: { status: 'cancelled' }, overrideAccess: true, context: { paymentFailed: true } })
    }
  } catch (err) {
    console.error(`Failed to cancel unfinalized nextlvlpay order ${orderId}:`, err)
  }
}

/**
 * Fallback status check for when the customer lands back on the confirmation page before the
 * webhook ping has arrived — mirrors syncCircoFlowsPaymentStatus's role. Never trusts anything
 * the client passes beyond the orderId; the real status/amount always comes from an authenticated
 * call back to nextlvlpay's own /api/payments/status, which reads it straight from Stripe.
 */
export async function syncNextlvlpayPaymentStatus(orderId: string): Promise<{ success?: boolean; status?: string; error?: string }> {
  try {
    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0, overrideAccess: true })
    if (!order) return { error: 'Order not found' }

    const paymentIntentId = order.nextlvlpayPaymentIntentId
    if (!paymentIntentId) return { error: 'No payment reference on this order' }

    const data = await fetchNextlvlpayStatus(paymentIntentId)
    if (!data) {
      return { error: 'Failed to reach nextlvlpay for status check' }
    }

    // Never trust the caller-supplied orderId beyond using it to look up the order above — the
    // order to finalize is only ever the one nextlvlpay's own PaymentIntent metadata names.
    const trueOrderId = data.metadata?.helixOrderId
    if (!trueOrderId || trueOrderId !== String(orderId)) {
      console.error(`syncNextlvlpayPaymentStatus: orderId mismatch (requested ${orderId}, PaymentIntent belongs to ${trueOrderId})`)
      return { error: 'Order/payment mismatch' }
    }

    if (data.status !== 'succeeded') {
      return { success: false, status: data.status }
    }

    const expectedCents = Math.round((order.total || 0) * 100)
    if (data.amount !== expectedCents) {
      console.error(`syncNextlvlpayPaymentStatus: amount mismatch for order ${orderId} (paid ${data.amount}, expected ${expectedCents})`)
      return { error: 'Payment amount does not match order total' }
    }

    const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
    await finalizeOrder(orderId, data.metadata)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to sync nextlvlpay payment status:', error)
    return { error: error.message }
  }
}
