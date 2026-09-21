import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Server-side helpers for talking to the nextlvlpay gateway that are shared by the checkout
 * action and the webhook route. Deliberately NOT a 'use server' file: nothing in here should be
 * callable from a browser.
 */

export type NextlvlpayStatus = {
  status: string
  amount: number
  currency: string
  metadata?: Record<string, string>
  amountRefunded?: number
}

/** Authenticated status lookup — the real, current PaymentIntent state straight from Stripe. */
export async function fetchNextlvlpayStatus(paymentIntentId: string): Promise<NextlvlpayStatus | null> {
  try {
    const response = await fetch(`${process.env.NEXTLVLPAY_API_BASE_URL}/payments/status`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXTLVLPAY_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId }),
    })
    if (!response.ok) return null
    return (await response.json()) as NextlvlpayStatus
  } catch {
    return null
  }
}

// PaymentIntent states where the customer can still (re)try paying on the hosted page.
const PAYABLE_STATUSES = ['requires_payment_method', 'requires_confirmation', 'requires_action']
// States where money has been, or is about to be, taken.
const PAID_OR_PAYING_STATUSES = ['succeeded', 'processing', 'requires_capture']

export type ExistingPayment =
  | { kind: 'reuse'; paymentIntentId: string }
  | { kind: 'already_paid' }
  | { kind: 'create' }

/**
 * An order must only ever have ONE PaymentIntent. Checkout's duplicate-click guard hands back the
 * same pending order for a repeat "Place order", and a fresh PaymentIntent for it would replace
 * the stored one — leaving the earlier one (which the customer may still have open in another
 * tab, and which Stripe's webhook still reports against this order) payable but no longer the
 * one we verify, so a real payment could land and never be recorded.
 *
 * So: if the order already has a PaymentIntent for the right order and amount, keep using it.
 */
export async function findExistingNextlvlpayPayment(order: {
  id: number | string
  total?: number | null
  nextlvlpayPaymentIntentId?: string | null
}): Promise<ExistingPayment> {
  const paymentIntentId = order.nextlvlpayPaymentIntentId
  if (!paymentIntentId) return { kind: 'create' }

  const existing = await fetchNextlvlpayStatus(paymentIntentId)
  if (!existing) return { kind: 'create' }

  const expectedCents = Math.round((order.total || 0) * 100)
  if (existing.metadata?.helixOrderId !== String(order.id) || existing.amount !== expectedCents) {
    return { kind: 'create' }
  }

  if (PAYABLE_STATUSES.includes(existing.status)) return { kind: 'reuse', paymentIntentId }
  if (PAID_OR_PAYING_STATUSES.includes(existing.status)) return { kind: 'already_paid' }
  return { kind: 'create' } // canceled — that PaymentIntent is dead, a new one is needed
}

/**
 * Keeps HelixBio in step with a refund issued from the Stripe dashboard. Like every other
 * nextlvlpay ping this never trusts the webhook body: the refunded amount is re-read from the
 * gateway. A full refund marks the order refunded (which runs the normal refund side effects —
 * restock, points/coupon release, affiliate reversal, customer email). A partial refund only
 * leaves an internal note, since what to do about the goods is a human decision.
 */
export async function syncNextlvlpayRefund(
  orderId: string,
): Promise<{ error?: string; action?: 'refunded' | 'partial_noted' | 'none' }> {
  try {
    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0, overrideAccess: true })
    if (!order) return { error: 'Order not found' }

    const paymentIntentId = order.nextlvlpayPaymentIntentId
    if (!paymentIntentId) return { error: 'No payment reference on this order' }

    const data = await fetchNextlvlpayStatus(paymentIntentId)
    if (!data) return { error: 'Failed to reach nextlvlpay for status check' }

    if (!data.metadata?.helixOrderId || data.metadata.helixOrderId !== String(orderId)) {
      console.error(`syncNextlvlpayRefund: orderId mismatch (requested ${orderId}, PaymentIntent belongs to ${data.metadata?.helixOrderId})`)
      return { error: 'Order/payment mismatch' }
    }

    const refunded = data.amountRefunded || 0
    if (data.status !== 'succeeded' || refunded <= 0) return { action: 'none' }

    if (refunded >= data.amount) {
      if (order.paymentStatus === 'refunded' && (order.status === 'refunded' || order.status === 'cancelled')) {
        return { action: 'none' }
      }
      // A cancelled order has already released its stock/coupon/points, and the status machine
      // has no cancelled → refunded step; only the payment state changes.
      const update: Record<string, string> =
        order.status === 'cancelled' ? { paymentStatus: 'refunded' } : { status: 'refunded', paymentStatus: 'refunded' }
      await payload.update({ collection: 'orders', id: order.id, data: update as any, overrideAccess: true })
      return { action: 'refunded' }
    }

    const noteText = `Partial refund of $${(refunded / 100).toFixed(2)} (of $${(data.amount / 100).toFixed(2)}) was issued in Stripe. Order status left unchanged.`
    const notes = Array.isArray(order.notes) ? order.notes : []
    if (notes.some((n: any) => n?.note === noteText)) return { action: 'none' }
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { notes: [...notes, { type: 'internal', note: noteText }] } as any,
      overrideAccess: true,
    })
    return { action: 'partial_noted' }
  } catch (error: any) {
    console.error('Failed to sync nextlvlpay refund:', error)
    return { error: error.message }
  }
}
