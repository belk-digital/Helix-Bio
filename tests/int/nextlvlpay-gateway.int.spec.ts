import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Isolated logic tests: no database, no network, no real orders. Payload, the gateway HTTP API and
// the stock/coupon/points helpers are all mocked.
const { payloadMock, reserveStock, reserveCouponUsage, reservePoints, execute } = vi.hoisted(() => {
  const execute = vi.fn()
  return {
    execute,
    payloadMock: {
      findByID: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      db: { drizzle: { execute } },
    },
    reserveStock: vi.fn(),
    reserveCouponUsage: vi.fn(),
    reservePoints: vi.fn(),
  }
})

vi.mock('payload', () => ({ getPayload: async () => payloadMock }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@payloadcms/db-postgres', () => ({ sql: (..._args: any[]) => ({}) }))
vi.mock('@/lib/orders/reserve', () => ({ reserveStock, reserveCouponUsage, reservePoints }))
vi.mock('@/lib/affiliates/commission', () => ({ attributeOrder: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/google/sheets', () => ({ appendOrderToSheet: vi.fn() }))
vi.mock('@/lib/emails/sendTrackedEmail', () => ({ sendTrackedEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/emails/generateOrderEmail', () => ({ generateOrderInvoiceHtml: vi.fn().mockResolvedValue('<p>email</p>') }))

import { findExistingNextlvlpayPayment, syncNextlvlpayRefund } from '@/lib/orders/nextlvlpayGateway'
import { finalizeOrder } from '@/lib/orders/finalizeOrder'

const gatewayReturns = (body: any | null) =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    body === null ? new Response('boom', { status: 500 }) : new Response(JSON.stringify(body), { status: 200 }),
  )

beforeEach(() => {
  process.env.NEXTLVLPAY_API_BASE_URL = 'http://gateway.test/api'
  process.env.NEXTLVLPAY_API_SECRET = 'secret'
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  payloadMock.findByID.mockReset()
  payloadMock.find.mockReset()
  payloadMock.update.mockReset().mockResolvedValue({})
  execute.mockReset().mockResolvedValue({ rows: [{ id: 1 }] }) // the finalize "claim" succeeds
  reserveStock.mockReset().mockResolvedValue({ success: true })
  reserveCouponUsage.mockReset().mockResolvedValue({ success: true })
  reservePoints.mockReset().mockImplementation(async (_p: any, _u: any, n: number) => n)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('findExistingNextlvlpayPayment — one PaymentIntent per order', () => {
  const order = { id: 48, total: 10, nextlvlpayPaymentIntentId: 'pi_A' }

  it('creates a new payment when the order has none yet', async () => {
    const spy = gatewayReturns({})
    expect(await findExistingNextlvlpayPayment({ id: 48, total: 10 })).toEqual({ kind: 'create' })
    expect(spy).not.toHaveBeenCalled()
  })

  it.each(['requires_payment_method', 'requires_confirmation', 'requires_action'])(
    'reuses the existing PaymentIntent while it is still payable (%s)',
    async (status) => {
      gatewayReturns({ status, amount: 1000, currency: 'usd', metadata: { helixOrderId: '48' } })
      expect(await findExistingNextlvlpayPayment(order)).toEqual({ kind: 'reuse', paymentIntentId: 'pi_A' })
    },
  )

  it.each(['succeeded', 'processing', 'requires_capture'])(
    'never opens a second payment once the first is paid or paying (%s)',
    async (status) => {
      gatewayReturns({ status, amount: 1000, currency: 'usd', metadata: { helixOrderId: '48' } })
      expect(await findExistingNextlvlpayPayment(order)).toEqual({ kind: 'already_paid' })
    },
  )

  it('opens a new payment only when the old one is dead, for another order, or for another amount', async () => {
    gatewayReturns({ status: 'canceled', amount: 1000, currency: 'usd', metadata: { helixOrderId: '48' } })
    expect(await findExistingNextlvlpayPayment(order)).toEqual({ kind: 'create' })

    gatewayReturns({ status: 'requires_payment_method', amount: 1000, currency: 'usd', metadata: { helixOrderId: '99' } })
    expect(await findExistingNextlvlpayPayment(order)).toEqual({ kind: 'create' })

    gatewayReturns({ status: 'requires_payment_method', amount: 999, currency: 'usd', metadata: { helixOrderId: '48' } })
    expect(await findExistingNextlvlpayPayment(order)).toEqual({ kind: 'create' })
  })

  it('falls back to creating when the gateway cannot be reached', async () => {
    gatewayReturns(null)
    expect(await findExistingNextlvlpayPayment(order)).toEqual({ kind: 'create' })
  })
})

describe('syncNextlvlpayRefund — refunds issued in Stripe reach the order', () => {
  const baseOrder = (over: any = {}) => ({ id: 48, status: 'paid', paymentStatus: 'captured', nextlvlpayPaymentIntentId: 'pi_A', notes: [], ...over })
  const paid = (over: any = {}) => ({ status: 'succeeded', amount: 1000, currency: 'usd', metadata: { helixOrderId: '48' }, amountRefunded: 0, ...over })

  it('marks the order refunded on a full refund', async () => {
    payloadMock.findByID.mockResolvedValue(baseOrder())
    gatewayReturns(paid({ amountRefunded: 1000 }))
    expect(await syncNextlvlpayRefund('48')).toEqual({ action: 'refunded' })
    expect(payloadMock.update).toHaveBeenCalledWith(expect.objectContaining({ id: 48, data: { status: 'refunded', paymentStatus: 'refunded' } }))
  })

  it('only adds an internal note on a partial refund, and not twice', async () => {
    payloadMock.findByID.mockResolvedValue(baseOrder())
    gatewayReturns(paid({ amountRefunded: 300 }))
    expect(await syncNextlvlpayRefund('48')).toEqual({ action: 'partial_noted' })
    const data = payloadMock.update.mock.calls[0][0].data
    expect(data.status).toBeUndefined()
    expect(data.notes[0].note).toContain('Partial refund of $3.00 (of $10.00)')

    payloadMock.update.mockClear()
    payloadMock.findByID.mockResolvedValue(baseOrder({ notes: data.notes }))
    expect(await syncNextlvlpayRefund('48')).toEqual({ action: 'none' })
    expect(payloadMock.update).not.toHaveBeenCalled()
  })

  it('does nothing when nothing was refunded, or when it is already refunded', async () => {
    payloadMock.findByID.mockResolvedValue(baseOrder())
    gatewayReturns(paid())
    expect(await syncNextlvlpayRefund('48')).toEqual({ action: 'none' })

    payloadMock.findByID.mockResolvedValue(baseOrder({ status: 'refunded', paymentStatus: 'refunded' }))
    gatewayReturns(paid({ amountRefunded: 1000 }))
    expect(await syncNextlvlpayRefund('48')).toEqual({ action: 'none' })
    expect(payloadMock.update).not.toHaveBeenCalled()
  })

  it('on a cancelled order only the payment state changes (status machine has no cancelled → refunded)', async () => {
    payloadMock.findByID.mockResolvedValue(baseOrder({ status: 'cancelled', paymentStatus: 'unpaid' }))
    gatewayReturns(paid({ amountRefunded: 1000 }))
    await syncNextlvlpayRefund('48')
    expect(payloadMock.update).toHaveBeenCalledWith(expect.objectContaining({ data: { paymentStatus: 'refunded' } }))
  })

  it('refuses a payment that belongs to a different order, and reports gateway outages as errors', async () => {
    payloadMock.findByID.mockResolvedValue(baseOrder())
    gatewayReturns(paid({ amountRefunded: 1000, metadata: { helixOrderId: '99' } }))
    expect((await syncNextlvlpayRefund('48')).error).toBe('Order/payment mismatch')

    gatewayReturns(null)
    expect((await syncNextlvlpayRefund('48')).error).toBeTruthy()
    expect(payloadMock.update).not.toHaveBeenCalled()
  })
})

describe('finalizeOrder — payment arrives for a cancelled order', () => {
  const cancelledOrder = (over: any = {}) => ({
    id: 48,
    status: 'cancelled',
    paymentStatus: 'unpaid',
    isFinalized: false,
    paymentMethod: 'nextlvlpay',
    guestEmail: 'buyer@example.com',
    items: [
      { product: 7, quantity: 2 },
      { product: 9, quantity: 1 },
    ],
    notes: [],
    ...over,
  })

  it('takes the stock back, marks the order paid and leaves no review flag when everything is available', async () => {
    payloadMock.findByID.mockResolvedValue(cancelledOrder())
    await finalizeOrder(48, {})

    expect(reserveStock).toHaveBeenCalledWith(payloadMock, [
      { productId: 7, quantity: 2 },
      { productId: 9, quantity: 1 },
    ])
    const update = payloadMock.update.mock.calls.find((c) => c[0].collection === 'orders')![0]
    expect(update.data.status).toBe('paid')
    expect(update.data.paymentStatus).toBe('captured')
    expect(update.data.notes[0].note).not.toContain('NEEDS REVIEW')
    expect(update.data.notes[0].note).toContain('reinstated as paid')
  })

  it('still records the paid order when an item sold out meanwhile, and flags it for a human', async () => {
    reserveStock.mockResolvedValue({ success: false, error: 'sold out' })
    payloadMock.findByID.mockResolvedValue(cancelledOrder())
    await finalizeOrder(48, {})

    const update = payloadMock.update.mock.calls.find((c) => c[0].collection === 'orders')![0]
    expect(update.data.status).toBe('paid') // money was taken — the order must not vanish
    expect(update.data.notes[0].note).toContain('NEEDS REVIEW')
    expect(update.data.notes[0].note).toContain('stock could not be re-reserved')
  })

  it('re-applies the coupon and re-deducts points', async () => {
    payloadMock.find.mockResolvedValue({ docs: [{ id: 5, type: 'percentage' }] })
    payloadMock.findByID.mockResolvedValue(cancelledOrder({ couponCode: 'SAVE10', discountTotal: 4, redeemedPoints: 50, owner: 3 }))
    await finalizeOrder(48, {})

    expect(reserveCouponUsage).toHaveBeenCalledWith(payloadMock, 5, 4, false)
    expect(reservePoints).toHaveBeenCalledWith(payloadMock, 3, 50)
  })

  it('does not touch stock for an ordinary pending order', async () => {
    payloadMock.findByID.mockResolvedValue(cancelledOrder({ status: 'pending' }))
    await finalizeOrder(48, {})

    expect(reserveStock).not.toHaveBeenCalled()
    const update = payloadMock.update.mock.calls.find((c) => c[0].collection === 'orders')![0]
    expect(update.data).toEqual({ status: 'paid', paymentStatus: 'captured' })
  })

  it('never resurrects a refunded order', async () => {
    payloadMock.findByID.mockResolvedValue(cancelledOrder({ status: 'refunded' }))
    await finalizeOrder(48, {})

    expect(execute).not.toHaveBeenCalled() // did not even claim it
    expect(payloadMock.update).not.toHaveBeenCalled()
  })

  it('an already-finalized order is still a no-op (idempotent)', async () => {
    payloadMock.findByID.mockResolvedValue(cancelledOrder({ isFinalized: true }))
    await finalizeOrder(48, {})
    expect(reserveStock).not.toHaveBeenCalled()
    expect(payloadMock.update).not.toHaveBeenCalled()
  })
})
