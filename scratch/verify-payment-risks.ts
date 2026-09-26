// End-to-end check of the payment-risk fixes against TEST-mode Stripe (through the locally running
// nextlvlpay gateway on :3001) and NEW throwaway orders only. It never reads, updates or deletes
// an existing order, never touches products/stock (the test orders have no line items), and
// refuses to run if the Stripe key is not a test key.
//
// Run under vitest (it handles next-auth's CJS interop, which plain tsx does not). NODE_ENV is
// production so Payload never runs its dev-mode schema push against the shared database, and
// emails + Google Sheets are blanked so nothing external is contacted:
//   NODE_ENV=production RESEND_API_KEY= GOOGLE_SHEETS_CLIENT_EMAIL= GOOGLE_SHEETS_PRIVATE_KEY= \n//     npx vitest run --config scratch/vitest.verify.config.mts
import http from 'http'
import { it } from 'vitest'
import { readFileSync } from 'fs'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

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

const gwEnv = readEnv('F:/Belk Digital Projects/nextlvlpay/.env.local')
if (!String(gwEnv.STRIPE_SECRET_KEY).startsWith('sk_test_')) {
  throw new Error('Refusing to run: nextlvlpay/.env.local STRIPE_SECRET_KEY is not a test key.')
}
const stripe = new Stripe(gwEnv.STRIPE_SECRET_KEY)
const GATEWAY = process.env.NEXTLVLPAY_API_BASE_URL as string
const SECRET = process.env.NEXTLVLPAY_API_SECRET as string
if (!GATEWAY?.startsWith('http://localhost:3001')) {
  throw new Error('Refusing to run: NEXTLVLPAY_API_BASE_URL is not the local gateway.')
}

let failures = 0
const check = (name: string, ok: boolean, detail?: unknown) => {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`)
}

const RUN = Date.now().toString(36).toUpperCase()

async function main() {
  const payload = await getPayload({ config: configPromise })
  const { findExistingNextlvlpayPayment, syncNextlvlpayRefund } = await import('@/lib/orders/nextlvlpayGateway')
  const { syncNextlvlpayPaymentStatus, cancelUnfinalizedOrder } = await import('@/app/(frontend)/(shop)/checkout/nextlvlpayActions')
  const { POST: helixWebhook } = await import('@/app/api/webhooks/nextlvlpay/route')

  const createdOrderIds: number[] = []
  const newOrder = async (tag: string, total = 10) => {
    const o: any = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber: `TEST-RISK-${RUN}-${tag}`, // explicit so the real order counter is not consumed
        guestEmail: `risk-test-${RUN}@example.invalid`,
        status: 'pending',
        paymentStatus: 'unpaid',
        fulfillmentStatus: 'unfulfilled',
        paymentMethod: 'nextlvlpay',
        items: [],
        subtotal: total,
        shippingTotal: 0,
        taxTotal: 0,
        feeTotal: 0,
        total,
      } as any,
    })
    createdOrderIds.push(o.id)
    return o
  }
  const reload = (id: number) => payload.findByID({ collection: 'orders', id, depth: 0, overrideAccess: true }) as Promise<any>

  // Open a PaymentIntent exactly the way createNextlvlpayPayment does, through the real gateway.
  const openPayment = async (order: any) => {
    const res = await fetch(`${GATEWAY}/payments/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: String(order.id), amount: order.total, currency: 'usd', returnUrl: `http://localhost:3000/order-confirmation/${order.id}` }),
    })
    const { paymentIntentId } = await res.json()
    await payload.update({ collection: 'orders', id: order.id, data: { nextlvlpayPaymentIntentId: paymentIntentId }, overrideAccess: true })
    return paymentIntentId as string
  }
  const pay = (pi: string, method: string) =>
    stripe.paymentIntents.confirm(pi, { payment_method: method, return_url: 'http://localhost:3000/x' })

  console.log(`\nRun ${RUN} — test-mode Stripe, new throwaway orders only\n`)

  // ── Risk 1: one PaymentIntent per order ────────────────────────────────────────────────────
  console.log('— Risk 1: a repeat "Place order" must reuse the order\'s PaymentIntent —')
  const A = await newOrder('A')
  const piA = await openPayment(A)
  // Prove the gateway is really in test mode (a live PI would be unknown to this test key).
  const piAStripe = await stripe.paymentIntents.retrieve(piA)
  check('gateway created a TEST-mode PaymentIntent', piAStripe.livemode === false)

  let r = await findExistingNextlvlpayPayment(await reload(A.id))
  check('fresh PaymentIntent is reused (no second one opened)', r.kind === 'reuse' && (r as any).paymentIntentId === piA, r)

  await pay(piA, 'pm_card_chargeDeclined').catch(() => {})
  check('after a declined attempt Stripe keeps it payable', (await stripe.paymentIntents.retrieve(piA)).status === 'requires_payment_method')
  r = await findExistingNextlvlpayPayment(await reload(A.id))
  check('…and it is still reused, not replaced', r.kind === 'reuse', r)

  await pay(piA, 'pm_card_visa')
  r = await findExistingNextlvlpayPayment(await reload(A.id))
  check('once paid, a repeat "Place order" is sent to confirmation instead of a second payment', r.kind === 'already_paid', r)

  const sync1 = await syncNextlvlpayPaymentStatus(String(A.id))
  const a1 = await reload(A.id)
  check('order A recorded as paid + finalized', sync1.success === true && a1.status === 'paid' && a1.paymentStatus === 'captured' && a1.isFinalized === true, { sync1, s: a1.status })

  // ── Risk 2 + 4: decline cancels the order, retry succeeds → order is reinstated ────────────
  console.log('\n— Risk 2/4: declined → order cancelled → customer retries and pays —')
  const B = await newOrder('B')
  const piB = await openPayment(B)
  await pay(piB, 'pm_card_chargeDeclined').catch(() => {})
  await cancelUnfinalizedOrder(B.id) // exactly what the 'failed' webhook ping does
  const b0 = await reload(B.id)
  check('the failure ping cancelled the order', b0.status === 'cancelled', b0.status)

  await pay(piB, 'pm_card_visa') // customer retries on the same hosted page and succeeds
  const sync2 = await syncNextlvlpayPaymentStatus(String(B.id))
  const b1 = await reload(B.id)
  check('paid-but-cancelled order is reinstated as paid + finalized', sync2.success === true && b1.status === 'paid' && b1.paymentStatus === 'captured' && b1.isFinalized === true, { sync2, status: b1.status })
  check('reinstatement left an internal note', (b1.notes || []).some((n: any) => /reinstated as paid/.test(n.note)), b1.notes)

  // ── Risk 3: refunds issued in Stripe reach the order ───────────────────────────────────────
  console.log('\n— Risk 3: refunds issued in Stripe —')
  await stripe.refunds.create({ payment_intent: piA }) // full
  const refundA = await syncNextlvlpayRefund(String(A.id))
  const a2 = await reload(A.id)
  check('full refund → order refunded', refundA.action === 'refunded' && a2.status === 'refunded' && a2.paymentStatus === 'refunded', { refundA, s: a2.status, p: a2.paymentStatus })
  check('repeat ping is a no-op', (await syncNextlvlpayRefund(String(A.id))).action === 'none')

  const C = await newOrder('C', 20)
  const piC = await openPayment(C)
  await pay(piC, 'pm_card_visa')
  await syncNextlvlpayPaymentStatus(String(C.id))
  await stripe.refunds.create({ payment_intent: piC, amount: 500 }) // partial $5 of $20
  const refundC = await syncNextlvlpayRefund(String(C.id))
  const c1 = await reload(C.id)
  check('partial refund → note only, status untouched', refundC.action === 'partial_noted' && c1.status === 'paid' && c1.paymentStatus === 'captured', { refundC, s: c1.status })
  check('note states the amounts', (c1.notes || []).some((n: any) => /\$5\.00 \(of \$20\.00\)/.test(n.note)), c1.notes)
  await syncNextlvlpayRefund(String(C.id))
  check('repeat ping does not duplicate the note', ((await reload(C.id)).notes || []).length === (c1.notes || []).length)

  // The real merchant webhook route, called the way nextlvlpay calls it.
  const ping = (orderId: number, eventType: string, auth = `Bearer ${SECRET}`) =>
    helixWebhook(new Request('http://x/api/webhooks/nextlvlpay', { method: 'POST', headers: { authorization: auth, 'content-type': 'application/json' }, body: JSON.stringify({ orderId: String(orderId), eventType }) }))
  const D = await newOrder('D')
  const piD = await openPayment(D)
  await pay(piD, 'pm_card_visa')
  await ping(D.id, 'succeeded')
  await stripe.refunds.create({ payment_intent: piD })
  const wh = await ping(D.id, 'refunded')
  check('HelixBio webhook route handles a "refunded" ping', wh.status === 200 && (await reload(D.id)).status === 'refunded', wh.status)
  check('webhook route still rejects a bad secret', (await ping(D.id, 'refunded', 'Bearer nope')).status === 401)

  // ── nextlvlpay side: signed Stripe events + retry-on-outage ────────────────────────────────
  console.log('\n— Gateway webhook: signed events, retry when the merchant is down —')
  const seen: any[] = []
  const stub = (status: number) =>
    http.createServer((req, res) => {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        seen.push(JSON.parse(body || '{}'))
        res.statusCode = status
        res.end('x')
      })
    })
  const sendSigned = async (type: string, object: any) => {
    const payloadStr = JSON.stringify({ id: `evt_${Date.now()}`, object: 'event', type, data: { object } })
    const header = stripe.webhooks.generateTestHeaderString({ payload: payloadStr, secret: gwEnv.STRIPE_WEBHOOK_SECRET })
    return fetch(`${GATEWAY.replace('/api', '')}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': header, 'content-type': 'application/json' }, body: payloadStr })
  }
  const piDObj = await stripe.paymentIntents.retrieve(piD)

  let server = stub(200)
  await new Promise<void>((ok) => server.listen(3000, ok))
  let res = await sendSigned('charge.refunded', { id: 'ch_x', object: 'charge', payment_intent: piD })
  check('charge.refunded → merchant pinged with orderId + "refunded"', res.status === 200 && seen.some((s) => s.orderId === String(D.id) && s.eventType === 'refunded'), { status: res.status, seen })
  res = await sendSigned('payment_intent.succeeded', piDObj)
  check('payment_intent.succeeded → merchant pinged', res.status === 200 && seen.some((s) => s.orderId === String(D.id) && s.eventType === 'succeeded'))
  await new Promise((ok) => server.close(ok))

  server = stub(500)
  await new Promise<void>((ok) => server.listen(3000, ok))
  res = await sendSigned('payment_intent.succeeded', piDObj)
  check('merchant answers 500 → gateway answers non-2xx so Stripe retries', res.status === 503, res.status)
  await new Promise((ok) => server.close(ok))

  res = await sendSigned('payment_intent.succeeded', piDObj) // nothing listening on :3000 now
  check('merchant unreachable → gateway answers non-2xx so Stripe retries', res.status === 503, res.status)

  const bad = await fetch(`${GATEWAY.replace('/api', '')}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': 't=1,v1=bad' }, body: '{}' })
  check('unsigned/forged webhook still rejected', bad.status === 400, bad.status)

  console.log(`\nNew throwaway orders created (ids): ${createdOrderIds.join(', ')}  (numbers TEST-RISK-${RUN}-*)`)
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
  if (failures > 0) throw new Error(`${failures} check(s) failed`)
}

it('payment risk fixes work end to end against test-mode Stripe', main, 280_000)
