/**
 * Send a GA4 event through gtag.js.
 *
 * The site loads plain gtag.js (not Google Tag Manager). gtag.js only consumes `arguments`
 * objects created by `gtag(...)`; the GTM-style `dataLayer.push({ event, ecommerce })` shape is
 * silently ignored without a GTM container, which is why GA4 previously recorded no ecommerce
 * events. Always go through this helper for GA4 events.
 *
 * Safe to call before gtag.js has loaded (the shim queues onto `dataLayer`, which gtag.js
 * drains on load) and safe where analytics is disabled (the queue is simply never read).
 */
export function trackEvent(name: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const w = window as any
  w.dataLayer = w.dataLayer || []
  if (typeof w.gtag !== 'function') {
    w.gtag = function () {
      // gtag.js requires the literal `arguments` object, not an array.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments)
    }
  }
  w.gtag('event', name, params)
}
