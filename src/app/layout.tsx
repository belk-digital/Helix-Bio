import React from 'react'
import '@/app/globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Script from 'next/script'
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider'
import { TidioWidget } from '@/components/shared/TidioWidget'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const TIDIO_PUBLIC_KEY = process.env.NEXT_PUBLIC_TIDIO_PUBLIC_KEY

// NOTE: sitewide force-dynamic used to live here, on the theory that a stale NEXT_LOCALE
// cookie could make Next.js statically cache one locale's HTML and serve it under the other
// locale's URL. That's not actually possible with the current routing config: `src/proxy.ts`
// resolves the locale via next-intl's middleware, and `routing.localeDetection: false` (see
// src/i18n/routing.ts) means the resolver never consults the cookie or Accept-Language header
// — see next-intl's resolveLocale.js, where cookie/header lookups are gated behind
// `routing.localeDetection` — only the URL path decides the locale. Each locale therefore has
// its own distinct URL and its own distinct static cache entry, so removing this is safe.
// Individual pages that need per-request rendering (e.g. shop's live filtering) opt in with
// their own `export const dynamic = 'force-dynamic'` instead of forcing it on the whole site.

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <AuthSessionProvider>
      <html lang="en" translate="no" className="min-h-screen notranslate" suppressHydrationWarning>
        <head>
          <meta name="google" content="notranslate" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev" />
          <link rel="preconnect" href="https://i.pravatar.cc" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Space+Grotesk:wght@300..700&family=Big+Shoulders+Display:wght@100..900&display=swap"
            rel="stylesheet"
          />
          {GA_MEASUREMENT_ID && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `}
              </Script>
            </>
          )}
        </head>
        <body className="min-h-screen antialiased" suppressHydrationWarning>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
          {/* TIDIO_PUBLIC_KEY && <TidioWidget publicKey={TIDIO_PUBLIC_KEY} /> */}
        </body>
      </html>
    </AuthSessionProvider>
  )
}
