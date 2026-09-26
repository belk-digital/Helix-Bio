import Stripe from 'stripe'
import { readFileSync } from 'fs'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// READ-ONLY reconciliation: live-mode PaymentIntents on nextlvlpay's Stripe account vs HelixBio orders.
// Prints no customer PII (no emails/names/addresses) and never prints the API key.
function readEnv(path: string) {
  return Object.fromEntries(
    readFileSync(path, 'utf-8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
      }),
  )
}

async function main() {
  const env = readEnv('F:/Belk Digital Projects/nextlvlpay/.env')
  const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  const since = Math.floor(new Date('2026-09-01T00:00:00Z').getTime() / 1000)

  const pis: Stripe.PaymentIntent[] = []
  for await (const pi of stripe.paymentIntents.list({ created: { gte: since }, limit: 100 })) {
    pis.push(pi)
  }
  console.log(`Live PaymentIntents since 2026-09-01: ${pis.length}`)
  const byStatus: Record<string, number> = {}
  pis.forEach((p) => (byStatus[p.status] = (byStatus[p.status] || 0) + 1))
  console.log('By Stripe status:', JSON.stringify(byStatus))

  const ids = pis.map((p) => Number(p.metadata?.helixOrderId)).filter((n) => Number.isFinite(n))
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'orders',
    where: { id: { in: ids } },
    limit: 1000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const orderById = new Map(res.docs.map((o: any) => [o.id, o]))

  const rows = pis
    .map((p) => {
      const oid = Number(p.metadata?.helixOrderId)
      const o: any = orderById.get(oid)
      return {
        orderId: oid,
        orderNo: o?.orderNumber,
        pi: p.id.slice(0, 14),
        pi_status: p.status,
        amount: p.amount / 100,
        declineCode: (p.last_payment_error as any)?.decline_code || (p.last_payment_error as any)?.code || '',
        method: (p.payment_method_types || []).join(','),
        order_status: o?.status,
        order_pay: o?.paymentStatus,
        finalized: o?.isFinalized,
        total: o?.total,
        created: new Date(p.created * 1000).toISOString().slice(0, 16),
        storedPi: o?.nextlvlpayPaymentIntentId === p.id,
      }
    })
    .sort((a, b) => a.orderId - b.orderId)

  const paidInStripe = rows.filter((r) => r.pi_status === 'succeeded')
  console.log(`\nSucceeded in Stripe: ${paidInStripe.length}`)

  const notRecorded = paidInStripe.filter((r) => !(r.order_pay === 'captured' && r.finalized))
  console.log(`\n!! PAID in Stripe but NOT captured+finalized in HelixBio: ${notRecorded.length}`)
  notRecorded.forEach((r) => console.log(JSON.stringify(r)))

  const cancelledButPaid = paidInStripe.filter((r) => r.order_status === 'cancelled')
  console.log(`\n!! PAID in Stripe but order status = cancelled: ${cancelledButPaid.length}`)
  cancelledButPaid.forEach((r) => console.log(JSON.stringify(r)))

  const amountMismatch = paidInStripe.filter((r) => r.total !== undefined && Math.abs(r.total - r.amount) > 0.005)
  console.log(`\nAmount mismatches (paid vs order total): ${amountMismatch.length}`)
  amountMismatch.forEach((r) => console.log(JSON.stringify(r)))

  const capturedNotPaid = rows.filter((r) => r.order_pay === 'captured' && r.pi_status !== 'succeeded')
  console.log(`\nOrders marked captured but PI not succeeded: ${capturedNotPaid.length}`)
  capturedNotPaid.forEach((r) => console.log(JSON.stringify(r)))

  // Decline-then-retry / duplicate-payment risk: same customer, several succeeded payments.
  const emailOf = (id: number) => String((orderById.get(id) as any)?.guestEmail || '').toLowerCase()
  const groups = new Map<string, typeof paidInStripe>()
  paidInStripe.forEach((r) => {
    const e = emailOf(r.orderId)
    if (!e) return
    groups.set(e, [...(groups.get(e) || []), r])
  })
  const dupes = [...groups.values()].filter((g) => g.length > 1)
  console.log(`\nCustomers with >1 succeeded payment (possible double-pay): ${dupes.length}`)
  dupes.forEach((g) => console.log(JSON.stringify(g.map((r) => ({ orderId: r.orderId, orderNo: r.orderNo, amount: r.amount, created: r.created })))))

  console.log('\nFull list (id, PI status, order status/pay/finalized):')
  rows.forEach((r) =>
    console.log(`${String(r.orderId).padStart(5)} #${r.orderNo ?? '-'} | ${r.pi_status.padEnd(24)} | ${String(r.amount).padStart(8)} | ${r.method.padEnd(18)} | ${r.order_status ?? '-'}/${r.order_pay ?? '-'}/${r.finalized ? 'final' : 'notfinal'} | ${r.declineCode} | ${r.created}`),
  )
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
