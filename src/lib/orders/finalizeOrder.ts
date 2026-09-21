import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import configPromise from '@payload-config'
import { attributeOrder } from '@/lib/affiliates/commission'
import { appendOrderToSheet } from '@/lib/google/sheets'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'
import { reserveStock, reserveCouponUsage, reservePoints } from '@/lib/orders/reserve'

/**
 * A gateway can report a payment as failed while the customer is still free to retry the very same
 * payment (a declined card, then a working one, on the same hosted page) — and the failure ping
 * cancels the order, releasing its stock, coupon slot and points. If the retry then succeeds we
 * have verified money in hand for a cancelled order. Rather than drop it, take those reservations
 * back (best effort — an item may have sold out in between) and report what couldn't be, so the
 * order can be honoured or refunded by a person instead of silently disappearing.
 */
async function reinstateCancelledOrder(payload: any, order: any): Promise<string[]> {
  const problems: string[] = []

  const items = (Array.isArray(order.items) ? order.items : [])
    .map((item: any) => ({
      productId: typeof item.product === 'object' ? item.product?.id : item.product,
      quantity: item.quantity || 1,
    }))
    .filter((i: any) => i.productId)
  if (items.length > 0) {
    const stock = await reserveStock(payload, items)
    if (!stock.success) problems.push('stock could not be re-reserved (an item sold out after the cancellation)')
  }

  if (order.couponCode) {
    const coupons = await payload.find({ collection: 'coupons', where: { code: { equals: order.couponCode } }, overrideAccess: true, limit: 1 })
    const coupon = coupons.docs[0]
    if (coupon) {
      const res = await reserveCouponUsage(payload, coupon.id, order.discountTotal || 0, coupon.type === 'store_credit')
      if (!res.success) problems.push(`coupon ${order.couponCode} could not be re-applied (${res.error})`)
    }
  }

  if (order.redeemedPoints > 0 && order.owner) {
    const userId = typeof order.owner === 'object' ? order.owner.id : order.owner
    const taken = await reservePoints(payload, userId, order.redeemedPoints)
    if (taken < order.redeemedPoints) problems.push(`only ${taken} of ${order.redeemedPoints} redeemed HB points could be re-deducted`)
  }

  return problems
}

/**
 * Centralized post-checkout logic: marks the order paid, clears the cart, attributes the
 * affiliate conversion, and sends the confirmation email. Inventory and the coupon's
 * usage/store-credit balance are NOT touched here anymore — they're reserved atomically at
 * order-creation time (see lib/orders/reserve.ts) to avoid the oversell/over-redeem race
 * that existed when they were only decremented here.
 *
 * The Stripe webhook, the client-triggered sync fallback, and the admin "mark as paid"
 * action can all call this for the same order — the isFinalized claim below is a single
 * atomic UPDATE, so only the first caller to arrive actually runs the side effects below;
 * every other concurrent/duplicate call is a safe no-op.
 */
export async function finalizeOrder(orderId: string | number, paymentIntentMetadata?: any) {
  try {
    const payload = await getPayload({ config: configPromise })
    const numericId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId
    const idToUse = isNaN(numericId as number) ? orderId : numericId

    const order = await payload.findByID({
      collection: 'orders',
      id: idToUse,
      depth: 0,
    })

    if (!order) {
      console.error(`finalizeOrder: Order ${orderId} not found`)
      return false
    }

    if (order.isFinalized) {
      console.warn(`finalizeOrder: Order ${orderId} already finalized. Skipping.`)
      return true
    }

    // A refunded order must never be resurrected by a late payment confirmation.
    if (order.status === 'refunded') {
      console.warn(`finalizeOrder: Order ${orderId} is refunded. Skipping.`)
      return true
    }

    // Atomically claim this order for finalization — whichever caller wins this UPDATE is
    // the only one that proceeds past this point.
    const db = payload.db as any
    const claim: any = await db.drizzle.execute(sql`
      UPDATE "orders" SET "is_finalized" = true
      WHERE "id" = ${typeof idToUse === 'number' ? idToUse : Number(idToUse)} AND ("is_finalized" IS NOT TRUE)
      RETURNING "id"`)
    const claimRows = claim.rows || claim
    if (!claimRows || claimRows.length === 0) {
      console.warn(`finalizeOrder: Order ${orderId} was claimed by a concurrent call. Skipping.`)
      return true
    }

    // 1. Mark Order as Paid
    const wasCancelled = order.status === 'cancelled'
    if (order.paymentStatus !== 'captured' || wasCancelled) {
      let reinstateNotes: any[] | undefined
      if (wasCancelled) {
        const problems = await reinstateCancelledOrder(payload, order)
        console.warn(`finalizeOrder: Order ${orderId} was cancelled but its payment succeeded — reinstating.${problems.length ? ' Problems: ' + problems.join('; ') : ''}`)
        const noteText = problems.length
          ? `Payment was received after this order had been cancelled, so it was reinstated as paid. NEEDS REVIEW: ${problems.join('; ')}.`
          : 'Payment was received after this order had been cancelled (e.g. a retry after a declined attempt), so it was reinstated as paid.'
        reinstateNotes = [...(Array.isArray(order.notes) ? order.notes : []), { type: 'internal', note: noteText }]
      }
      await payload.update({
        collection: 'orders',
        id: idToUse,
        data: {
          status: 'paid',
          paymentStatus: 'captured',
          ...(reinstateNotes ? { notes: reinstateNotes } : {}),
        }
      })
      // Update in-memory object so subsequent emails don't show unpaid instructions
      order.status = 'paid';
      order.paymentStatus = 'captured';
    }

    // 2. Clear User Cart
    if (order.owner) {
      const userId = typeof order.owner === 'object' ? order.owner.id : order.owner

      // Clear user's Payload cart instantly
      const carts = await payload.find({ collection: 'carts', where: { user: { equals: userId } } });
      if (carts.docs.length > 0) {
        await payload.update({ collection: 'carts', id: carts.docs[0].id, data: { items: [] } });
      }
    } else if (paymentIntentMetadata?.cartId) {
      // Clear Guest Cart using metadata fallback
      await payload.update({ collection: 'carts', id: paymentIntentMetadata.cartId, data: { items: [] } });
    }

    // 3. Affiliate Attribution
    const affiliateId = paymentIntentMetadata?.affiliateId || (order as any).affiliateId;
    const clickId = paymentIntentMetadata?.clickId || (order as any).clickId; 
    
    if (affiliateId || order.couponCode) {
      attributeOrder(
        order as any,
        affiliateId || null,
        order.couponCode || null,
        clickId || null
      ).catch(console.error)
    }

    // 4. Send Email
    try {
        let customerEmail = order.guestEmail;
        if (!customerEmail && order.owner) {
            const userDoc = typeof order.owner === 'object' ? order.owner : await payload.findByID({ collection: 'users', id: order.owner });
            customerEmail = userDoc.email;
        }
        if (customerEmail && order.paymentMethod !== 'zelle') {
            const { generateOrderInvoiceHtml } = await import('@/lib/emails/generateOrderEmail');
            const invoiceHtml = await generateOrderInvoiceHtml(order, payload);

            await sendTrackedEmail(payload, {
                from: 'Orders | Helix Bio <support@helixbiochem.com>',
                to: customerEmail,
                bcc: 'support@helixbiochem.com',
                subject: `Order Confirmation #${order.orderNumber || order.id}`,
                html: invoiceHtml,
            })
        }
    } catch (err) {
        console.error('Failed to send confirmation email', err)
    }

    return true

  } catch (error) {
    console.error('Error in finalizeOrder:', error)
    return false
  }
}
