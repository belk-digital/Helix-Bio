'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { createPayloadOrder, notifyAdminFailedPayment } from './actions'
import { buildOrderSku, buildJurisdictionCode } from './dataoptHelpers'

const DATAOPT_BASE_URL = 'https://pay.data-opt.com'

/**
 * Creates the pending order (same reservation/dedupe path as every other payment method), then
 * registers a one-off SKU priced at the order's exact total and opens a Data-opt receipt for it.
 * The receipt id returned is stored on the order so the webhook/status lookup can find it back —
 * mirroring how CircoFlows' merchant_transaction_id / nextlvlpay's PaymentIntent metadata work.
 */
export async function createDataOptPayment(
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
    'dataopt_pending',
    userId,
    'dataopt',
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

  const sku = buildOrderSku(order.id)
  const total = Number(order.total || 0)

  try {
    const inventoryRes = await fetch(`${DATAOPT_BASE_URL}/api/inventory`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.DATAOPT_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sku,
        name: `HelixBio Order #${order.orderNumber || order.id}`,
        priceUsd: total,
        stockQty: 1,
        taxable: false,
      }),
    })

    if (!inventoryRes.ok) {
      const errBody = await inventoryRes.text().catch(() => '')
      await cancelUnfinalizedOrder(order.id)
      await notifyAdminFailedPayment(String(order.id), `Failed to register Data-opt SKU: ${errBody || inventoryRes.status}`).catch(console.error)
      return { error: 'Failed to initialize payment. Please try again.' }
    }

    const orderPayload: Record<string, any> = { items: [{ sku, qty: 1 }] }
    const jurisdictionCode = buildJurisdictionCode(formData)
    if (jurisdictionCode) orderPayload.jurisdictionCode = jurisdictionCode
    if (process.env.DATAOPT_SHOP_SLUG) orderPayload.shopSlug = process.env.DATAOPT_SHOP_SLUG

    const orderCreateRes = await fetch(`${DATAOPT_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.DATAOPT_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    })

    const data = await orderCreateRes.json()
    const receiptId = data?.receipt?.receiptId

    if (!orderCreateRes.ok || !receiptId) {
      await cancelUnfinalizedOrder(order.id)
      await notifyAdminFailedPayment(String(order.id), data?.error || 'Failed to initialize Data-opt payment session').catch(console.error)
      return { error: 'Failed to initialize payment. Please try again.' }
    }

    // The SKU workaround above only works if Data-opt actually charges what we registered —
    // verify it before sending the customer to pay, exactly like the amount checks every other
    // gateway's sync function does after the fact.
    const totalUsd = Number(data.receipt.totalUsd)
    if (!Number.isFinite(totalUsd) || Math.abs(totalUsd - total) > 0.01) {
      console.error(`createDataOptPayment: totalUsd mismatch for order ${order.id} (Data-opt quoted ${totalUsd}, expected ${total})`)
      await cancelUnfinalizedOrder(order.id)
      await notifyAdminFailedPayment(String(order.id), `Data-opt receipt total (${totalUsd}) did not match order total (${total})`).catch(console.error)
      return { error: 'Failed to initialize payment. Please try again.' }
    }

    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { dataoptReceiptId: String(receiptId) },
      overrideAccess: true,
    })

    // The order-creation response already includes a portalLink with `recipient` resolved
    // server-side from our API key (confirmed live — it comes back matching our own configured
    // wallet), so build on that rather than hand-constructing the portal URL ourselves. Layout and
    // returnUrl are just appended on top; if portalLink is ever missing, fall back to constructing
    // it — with our own server-only wallet constant, never anything client-supplied.
    const headersList = await headers()
    const origin = headersList.get('origin') || `https://${headersList.get('host')}`
    const portalUrl = new URL(data.portalLink || `${DATAOPT_BASE_URL}/portal/${receiptId}?recipient=${process.env.DATAOPT_MERCHANT_WALLET}`)
    portalUrl.searchParams.set('layout', 'wide')
    portalUrl.searchParams.set('returnUrl', `${origin}/order-confirmation/${order.id}`)
    return { orderId: orderRes.orderId, redirectUrl: portalUrl.toString() }
  } catch (error: any) {
    await cancelUnfinalizedOrder(order.id)
    await notifyAdminFailedPayment(String(order.id), error.message || 'Data-opt session creation threw').catch(console.error)
    console.error('Data-opt session creation failed:', error)
    return { error: 'Failed to reach Data-opt. Please try again.' }
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
    console.error(`Failed to cancel unfinalized Data-opt order ${orderId}:`, err)
  }
}

/**
 * Fallback status check for when the customer lands back on the confirmation page before the
 * webhook has arrived — mirrors syncCircoFlowsPaymentStatus/syncNextlvlpayPaymentStatus. Never
 * trusts anything the client passes beyond the orderId; the status truth always comes from an
 * authenticated call back to Data-opt's own status endpoint.
 *
 * Unlike the other gateways, the paid amount isn't re-verified here against order.total — the
 * status response's amount/currency fields are the actual on-chain payment (e.g. in ETH/USDT),
 * not USD, and Data-opt's docs don't document a conversion rate to cross-check against. The
 * amount was already verified once, in USD, when the receipt was created in createDataOptPayment.
 */
export async function syncDataOptPaymentStatus(orderId: string): Promise<{ success?: boolean; status?: string; error?: string }> {
  try {
    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0, overrideAccess: true })
    if (!order) return { error: 'Order not found' }

    const receiptId = order.dataoptReceiptId
    if (!receiptId) return { error: 'No payment reference on this order' }

    const response = await fetch(`${DATAOPT_BASE_URL}/api/receipts/status?receiptId=${encodeURIComponent(receiptId)}`, {
      headers: { 'x-api-key': process.env.DATAOPT_API_KEY as string },
    })

    if (!response.ok) {
      return { error: 'Failed to reach Data-opt for status check' }
    }

    const data = await response.json()

    if (data.status === 'failed' || data.status === 'tx_mismatch') {
      if (!order.isFinalized && order.status === 'pending') {
        await payload.update({ collection: 'orders', id: Number(orderId), data: { status: 'cancelled' }, overrideAccess: true, context: { paymentFailed: true } })
        await notifyAdminFailedPayment(orderId, `Data-opt payment ${data.status}`).catch(console.error)
      }
      return { success: false, status: data.status }
    }

    if (data.status !== 'completed') {
      // 'generated' / 'pending' / 'tx_mined' / 'recipient_validated' — still in flight on-chain.
      return { success: false, status: data.status }
    }

    if (data.transactionHash) {
      await payload.update({
        collection: 'orders',
        id: Number(orderId),
        data: { dataoptTransactionHash: data.transactionHash },
        overrideAccess: true,
      })
    }

    const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
    await finalizeOrder(orderId, {})
    return { success: true }
  } catch (error: any) {
    console.error('Failed to sync Data-opt payment status:', error)
    return { error: error.message }
  }
}
