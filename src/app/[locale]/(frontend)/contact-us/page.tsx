import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ContactClient } from '@/components/contact/ContactClient'
import { getOgImageUrl } from '@/lib/utils'

const slug = 'contact-us'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'content.contactPage' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  const path = locale === 'en' ? `/${slug}` : `/${locale}/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        en: `/${slug}`,
        es: `/es/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: path,
      images: [getOgImageUrl(title, description)],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImageUrl(title, description)],
    },
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'content.contactPage' })
  const tClient = await getTranslations({ locale, namespace: 'content.contactClient' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbio.com'
  const path = locale === 'en' ? `/${slug}` : `/${locale}/${slug}`
  const url = `${baseUrl}${path}`

  const faqKeys = ['usLabsContact', 'locationShipping', 'serviceHours'] as const
  // contactInfo's answer contains <phone>/<email> rich-text tags for the on-page link rendering
  // (via t.rich in ContactClient), so it's composed here in plain text rather than read with
  // plain t(), which requires tag-value functions for messages containing those tags.
  const contactInfoFaq = {
    question: tClient('faqs.contactInfo.question'),
    answer:
      'Reach us at 5768 Wyncliff Drive, North Charleston, South Carolina 29418, US Phone: +1 (000) 000-0000, and email: support@helixbio.com for lab inquiries.',
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: locale,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Contact Us' },
        ],
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Helix Bio',
        url: baseUrl,
        email: 'support@helixbio.com',
        telephone: '+1-000-000-0000',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '5768 Wyncliff Drive',
          addressLocality: 'North Charleston',
          addressRegion: 'SC',
          postalCode: '29418',
          addressCountry: 'US',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'support@helixbio.com',
            telephone: '+1-000-000-0000',
            areaServed: 'US',
            availableLanguage: ['English', 'Spanish'],
            hoursAvailable: 'Mo-Fr 09:00-17:00',
          },
          {
            '@type': 'ContactPoint',
            contactType: 'order support',
            email: 'orders@helixbio.com',
            areaServed: 'US',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: contactInfoFaq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: contactInfoFaq.answer,
            },
          },
          ...faqKeys.map((key) => ({
            '@type': 'Question',
            name: tClient(`faqs.${key}.question`),
            acceptedAnswer: {
              '@type': 'Answer',
              text: tClient(`faqs.${key}.answer`),
            },
          })),
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ContactClient />
    </>
  )
}
