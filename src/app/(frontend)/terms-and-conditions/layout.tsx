import React from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/shared/JsonLd'
import { UNIFIED_ORGANIZATION_NODE, UNIFIED_WEBSITE_NODE } from '@/lib/schema'

const breadcrumbName = 'Terms & Conditions'
const slug = 'terms-and-conditions'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations('legal.termsAndConditions')
  const title = t('metaTitle')
  const description = t('metaDescription')
  const path = `/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function TermsAndConditionsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params?: Promise<any>
}) {
  const locale = 'en'
  const t = await getTranslations('legal.termsAndConditions')
  const title = t('metaTitle')
  const description = t('metaDescription')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
  const path = `/${slug}`
  const url = `${baseUrl}${path}`

  const faqKeys = ['humanUseApproved', 'cancelOrder', 'shipsInternationally', 'damagedOrDelayed', 'ageRequirement', 'currency', 'orderQuestionsContact', 'termsChangeNotice']

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      UNIFIED_ORGANIZATION_NODE,
      UNIFIED_WEBSITE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: locale,
        'isPartOf': {
          '@id': 'https://helixbiochem.com/#website',
        },
        'publisher': {
          '@id': 'https://helixbiochem.com/#organization',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: breadcrumbName, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faqKeys.map((key) => ({
          '@type': 'Question',
          name: t(`faqs.${key}.question`),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(`faqs.${key}.answer`),
          },
        })),
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-legal-terms" data={schema} />
      {children}
    </>
  )
}
