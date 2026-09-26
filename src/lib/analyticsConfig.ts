/**
 * Analytics gating shared by both root layouts.
 *
 * GA4 and Clarity used to load whenever their env var existed, so `next dev` on a developer's
 * machine (localhost) and every Vercel preview deployment reported into the production GA4
 * property, contaminating sessions, engagement and conversion baselines.
 *
 * Two independent guards:
 *  1. Server: only render the tags in a production deployment. On Vercel that means
 *     VERCEL_ENV === 'production' (previews are 'preview'); off Vercel (e.g. Docker) it falls
 *     back to NODE_ENV === 'production'. `next dev` is never production.
 *  2. Browser: even if a tag is rendered, hits are suppressed unless the page is served from the
 *     production hostname (covers `next start` on localhost and any misreported environment).
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

export const IS_PRODUCTION_DEPLOYMENT = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production'

const PRODUCTION_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com').hostname.replace(/^www\./, '')
  } catch {
    return 'helixbiochem.com'
  }
})()

/** Inline JS that reports `true` only on the production hostname (apex or www). */
export const IS_PRODUCTION_HOST_JS = `(function(){var h=location.hostname;return h==='${PRODUCTION_HOST}'||h==='www.${PRODUCTION_HOST}';})()`
