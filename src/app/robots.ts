import type { MetadataRoute } from 'next'

// Private / transactional routes that should never be crawled.
const PRIVATE_PATHS = [
  '/admin',
  '/api',
  '/my-route',
  '/ref',
  '/account',
  '/cart',
  '/checkout',
  '/wishlist',
  '/order-confirmation',
  '/affiliates/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

// robots.txt rules are PREFIX matches: a bare `Disallow: /ref` also blocks `/refund-policy`
// (it did, while that page sat in the sitemap). Each rule is therefore emitted as an exact match
// (`/path$`) plus a directory match (`/path/`), so a future blog slug that merely starts with
// "cart", "account", "login", etc. can never be swept up. `$` is supported by Google and Bing.
const disallow = PRIVATE_PATHS.flatMap((p) => [`${p}$`, `${p}/`])

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
