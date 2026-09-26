import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'

// Isolated component test: no database, no network, no real orders. Everything the component
// talks to (gateway sync actions, cart store, i18n, animation) is mocked.
const { syncNextlvlpay, syncCirco, syncDataOpt, clearCart } = vi.hoisted(() => ({
  syncNextlvlpay: vi.fn(),
  syncCirco: vi.fn(),
  syncDataOpt: vi.fn(),
  clearCart: vi.fn(),
}))

vi.mock('@/app/(frontend)/(shop)/checkout/nextlvlpayActions', () => ({ syncNextlvlpayPaymentStatus: syncNextlvlpay }))
vi.mock('@/app/(frontend)/(shop)/checkout/circoflowsActions', () => ({ syncCircoFlowsPaymentStatus: syncCirco }))
vi.mock('@/app/(frontend)/(shop)/checkout/dataoptActions', () => ({ syncDataOptPaymentStatus: syncDataOpt }))
vi.mock('@/lib/cart/store', () => ({ useCartStore: { getState: () => ({ clear: clearCart }) } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('next-intl', () => ({
  useTranslations: () => Object.assign((key: string) => key, { rich: (key: string) => key }),
}))
vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', { alt: props.alt || '' }),
}))
vi.mock('next/link', () => ({
  default: ({ href, children }: any) => React.createElement('a', { href }, children),
}))
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => React.createElement('div', { className }, children),
  },
}))
vi.mock('@/components/motion/FadeUp', () => ({
  FadeUp: ({ children, className }: any) => React.createElement('div', { className }, children),
}))
vi.mock('@/components/ui/container', () => ({
  Container: ({ children }: any) => React.createElement('div', null, children),
}))
vi.mock('@/components/ui/button', () => ({ buttonVariants: () => 'btn' }))

import { OrderConfirmationClient } from '@/app/(frontend)/(shop)/order-confirmation/[id]/OrderConfirmationClient'

const baseOrder = (overrides: Record<string, unknown> = {}): any => ({
  id: '1045',
  orderId: '48',
  customerName: 'Test Buyer',
  email: 'buyer@example.com',
  shippingAddress: { line1: '1 Main St', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' },
  billingAddress: { line1: '1 Main St', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' },
  estimatedDeliveryType: 'standard',
  items: [{ id: 'a', name: 'Item', variant: 'v', quantity: 1, price: 10, image: '/x.png' }],
  subtotal: 10,
  shipping: 0,
  processingFee: 0,
  total: 10,
  paymentMethod: 'nextlvlpay',
  paymentStatus: 'unpaid',
  ...overrides,
})

const headline = () => (screen.getByRole('heading', { level: 1 }).textContent || '').trim()

// Only setTimeout is faked (the component's polling delay). The component loads the sync actions
// with a dynamic import(), which is real async work (module load) that fake timers don't drive —
// so after every step we also wait a short *real* moment (captured before faking) for it to settle.
const realSetTimeout = globalThis.setTimeout
const settle = async () => {
  await act(async () => {
    await new Promise<void>((resolve) => realSetTimeout(resolve, 40))
  })
}
const flush = async (ms = 0) => {
  await settle()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
  await settle()
}
const setQuery = (query: string) => window.history.replaceState({}, '', `/order-confirmation/48${query}`)

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  // mockReset (not clearAllMocks): also drops queued mockResolvedValueOnce values so one test
  // can never leak a response into the next.
  syncNextlvlpay.mockReset()
  syncCirco.mockReset()
  syncDataOpt.mockReset()
  clearCart.mockReset()
  sessionStorage.clear()
  ;(window as any).dataLayer = []
  setQuery('')
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

// The site uses plain gtag.js, which only consumes `gtag('event', name, params)` calls (queued on
// dataLayer as `arguments` objects). The old GTM-style `{ event: 'purchase' }` object shape is
// ignored by gtag.js, so asserting on that shape would pass while GA4 recorded nothing.
const sentPurchaseToGA4 = () =>
  (window as any).dataLayer.some((entry: any) => {
    const args = Array.from(entry ?? [])
    return args[0] === 'event' && args[1] === 'purchase'
  })

describe('OrderConfirmationClient payment verification', () => {
  it('a customer who really paid is never told the payment failed, even while the order still reads unpaid', async () => {
    // The exact production failure: Stripe redirects back with redirect_status=succeeded while the
    // server-rendered order is still `unpaid` (webhook/finalize hasn't landed yet).
    setQuery('?redirect_status=succeeded&payment_intent=pi_123')
    syncNextlvlpay
      .mockResolvedValueOnce({ success: false, status: 'requires_payment_method' }) // gateway lag
      .mockResolvedValueOnce({ success: true })

    render(React.createElement(OrderConfirmationClient, { order: baseOrder() }))

    expect(headline()).toBe('Confirming your payment…')
    expect(headline()).not.toBe('Payment Not Completed')
    expect(clearCart).not.toHaveBeenCalled()

    await flush(0)
    expect(headline()).toBe('Confirming your payment…') // still not a failure after a lagging check

    await flush(2500)
    expect(headline()).toBe('paymentSuccessful')
    expect(clearCart).toHaveBeenCalledTimes(1)
    expect(sentPurchaseToGA4()).toBe(true)
  })

  it('an abandoned payment is reported as not completed, and keeps the cart', async () => {
    syncNextlvlpay.mockResolvedValue({ success: false, status: 'requires_payment_method' })

    render(React.createElement(OrderConfirmationClient, { order: baseOrder() }))
    await flush(0)

    expect(headline()).toBe('Payment Not Completed')
    expect(syncNextlvlpay).toHaveBeenCalledTimes(1) // definitive answer, no polling
    expect(clearCart).not.toHaveBeenCalled()
    expect(sentPurchaseToGA4()).toBe(false)
    expect(document.body.textContent).not.toContain('have not been charged')
    expect(document.body.textContent).toContain('Return to Checkout')
  })

  it('a payment still being processed says so instead of failing', async () => {
    syncNextlvlpay.mockResolvedValue({ success: false, status: 'processing' })

    render(React.createElement(OrderConfirmationClient, { order: baseOrder() }))
    await flush(0)
    expect(headline()).toBe('Payment Processing')

    await flush(10000)
    expect(headline()).toBe('Payment Processing')
    expect(document.body.textContent).not.toContain('Return to Checkout')
  })

  it('when verification itself keeps failing it never claims the customer was not charged', async () => {
    setQuery('?redirect_status=succeeded')
    syncNextlvlpay.mockResolvedValue({ error: 'nextlvlpay unreachable' })

    render(React.createElement(OrderConfirmationClient, { order: baseOrder() }))

    const seen = new Set<string>()
    for (let i = 0; i < 14; i++) {
      await flush(2500)
      seen.add(headline())
    }
    expect(seen.has('Payment Not Completed')).toBe(false)
    expect(headline()).toBe("We're Verifying Your Payment")
    expect(document.body.textContent).not.toContain('Return to Checkout')
    expect(clearCart).not.toHaveBeenCalled()
  })

  it('if Stripe says succeeded but the gateway never catches up, it ends on "processing", not failure', async () => {
    setQuery('?redirect_status=succeeded')
    syncNextlvlpay.mockResolvedValue({ success: false, status: 'requires_payment_method' })

    render(React.createElement(OrderConfirmationClient, { order: baseOrder() }))
    for (let i = 0; i < 14; i++) await flush(2500)

    expect(headline()).toBe('Payment Processing')
  })

  it('an order already captured shows success immediately without re-checking', async () => {
    render(React.createElement(OrderConfirmationClient, { order: baseOrder({ paymentStatus: 'captured' }) }))
    await flush(0)

    expect(headline()).toBe('paymentSuccessful')
    expect(syncNextlvlpay).not.toHaveBeenCalled()
    expect(clearCart).toHaveBeenCalledTimes(1)
  })

  it('Zelle (unpaid by design) is unaffected', async () => {
    render(React.createElement(OrderConfirmationClient, { order: baseOrder({ paymentMethod: 'zelle' }) }))
    await flush(0)

    expect(headline()).toBe('orderPlaced')
    expect(syncNextlvlpay).not.toHaveBeenCalled()
    expect(clearCart).toHaveBeenCalledTimes(1)
  })

  it('Data-opt: a failed payment is not completed; a pending one is processing', async () => {
    syncDataOpt.mockResolvedValue({ success: false, status: 'failed' })
    render(React.createElement(OrderConfirmationClient, { order: baseOrder({ paymentMethod: 'dataopt' }) }))
    await flush(0)
    expect(headline()).toBe('Payment Not Completed')
    cleanup()

    syncDataOpt.mockResolvedValue({ success: false, status: 'pending' })
    render(React.createElement(OrderConfirmationClient, { order: baseOrder({ paymentMethod: 'dataopt' }) }))
    await flush(0)
    expect(headline()).toBe('Payment Processing')
  })
})
