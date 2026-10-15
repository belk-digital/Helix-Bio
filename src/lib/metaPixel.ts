import { FB_PIXEL_ID } from './analyticsConfig'

export { FB_PIXEL_ID }

type FbqFunction = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[]
  push?: unknown
  loaded?: boolean
  version?: string
}

declare global {
  interface Window {
    fbq?: FbqFunction
    _fbq?: FbqFunction
  }
}

/**
 * Standard Meta Pixel event tracking function.
 * Safe to call in SSR or before the script has loaded (queues calls).
 */
export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
): void {
  if (typeof window === 'undefined') return
  const w = window

  if (typeof w.fbq !== 'function') {
    const n: FbqFunction = function (...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(...args)
      } else {
        n.queue = n.queue || []
        n.queue.push(args)
      }
    }
    if (!w._fbq) w._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    w.fbq = n
  }

  if (params && options?.eventID) {
    w.fbq('track', event, params, { eventID: options.eventID })
  } else if (params) {
    w.fbq('track', event, params)
  } else {
    w.fbq('track', event)
  }
}

/**
 * Fire ViewContent on product pages.
 */
export function trackViewContent(params: {
  content_ids: string[]
  value: number
  currency?: string
  content_type?: string
  content_name?: string
}): void {
  trackPixel('ViewContent', {
    content_ids: params.content_ids,
    content_type: params.content_type || 'product',
    value: params.value,
    currency: params.currency || 'USD',
    ...(params.content_name ? { content_name: params.content_name } : {}),
  })
}

/**
 * Fire AddToCart when an item is added to the cart.
 */
export function trackAddToCart(params: {
  content_ids: string[]
  value: number
  currency?: string
  content_type?: string
  content_name?: string
}): void {
  trackPixel('AddToCart', {
    content_ids: params.content_ids,
    content_type: params.content_type || 'product',
    value: params.value,
    currency: params.currency || 'USD',
    ...(params.content_name ? { content_name: params.content_name } : {}),
  })
}

/**
 * Fire InitiateCheckout when the buyer reaches /checkout.
 */
export function trackInitiateCheckout(params: {
  value: number
  currency?: string
  content_ids?: string[]
  num_items?: number
}): void {
  trackPixel('InitiateCheckout', {
    value: params.value,
    currency: params.currency || 'USD',
    ...(params.content_ids ? { content_ids: params.content_ids } : {}),
    ...(params.num_items !== undefined ? { num_items: params.num_items } : {}),
  })
}

/**
 * Fire Purchase on the order-confirmation page.
 * Deduplicates against repeat renders of the confirmation page.
 */
export function trackPurchase(params: {
  value: number
  order_id: string
  currency?: string
  content_ids?: string[]
  content_type?: string
  num_items?: number
}): void {
  if (typeof window !== 'undefined') {
    const key = `fb_tracked_${params.order_id}`
    if (sessionStorage.getItem(key)) {
      return // Deduplicated against repeat renders
    }
    sessionStorage.setItem(key, 'true')
  }

  trackPixel(
    'Purchase',
    {
      value: params.value,
      currency: params.currency || 'USD',
      content_ids: params.content_ids || [],
      content_type: params.content_type || 'product',
      order_id: params.order_id,
      ...(params.num_items !== undefined ? { num_items: params.num_items } : {}),
    },
    { eventID: params.order_id }
  )
}
