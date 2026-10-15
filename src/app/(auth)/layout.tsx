import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Script from 'next/script'
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider'
import '@/app/globals.css'

import { GA_MEASUREMENT_ID, FB_PIXEL_ID, IS_PRODUCTION_DEPLOYMENT, IS_PRODUCTION_HOST_JS } from '@/lib/analyticsConfig'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'),
  title: 'Helix Bio Chem',
  description: 'Premium Peptides for Peak Performance',
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()

  return (
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
        {IS_PRODUCTION_DEPLOYMENT && GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                if (!${IS_PRODUCTION_HOST_JS}) { window['ga-disable-${GA_MEASUREMENT_ID}'] = true; }
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {IS_PRODUCTION_DEPLOYMENT && FB_PIXEL_ID && (
          <>
            <Script id="meta-pixel-init-auth" strategy="afterInteractive">
              {`
                if (${IS_PRODUCTION_HOST_JS}) {
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${FB_PIXEL_ID}');
                fbq('track', 'PageView');
                }
              `}
            </Script>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" alt="" />`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AuthSessionProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="h-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
              {children}
            </div>
          </NextIntlClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
