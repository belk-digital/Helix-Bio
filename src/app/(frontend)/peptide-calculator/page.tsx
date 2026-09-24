import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PeptideCalculatorPage from './PeptideCalculatorClient'
import { getOgImageUrl } from '@/lib/utils'
import { JsonLd } from '@/components/shared/JsonLd'
import { UNIFIED_ORGANIZATION_NODE, UNIFIED_WEBSITE_NODE } from '@/lib/schema'

const slug = 'peptide-calculator'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations('calculator.page')
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

export default async function Page({
  params,
}: {
  params?: Promise<any>
}) {
  const locale = 'en'
  const t = await getTranslations('calculator.page')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
  const path = `/${slug}`
  const url = `${baseUrl}${path}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      UNIFIED_ORGANIZATION_NODE,
      UNIFIED_WEBSITE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: t('metaTitle'),
        description: t('metaDescription'),
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
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': t('breadcrumb.home'),
            'item': baseUrl,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': t('breadcrumb.calculator'),
            'item': url,
          },
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': `${url}#webapp`,
        'name': t('webApp.name'),
        'url': url,
        'description': t('webApp.description'),
        'applicationCategory': 'HealthApplication',
        'operatingSystem': 'Web Browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'creator': {
          '@id': 'https://helixbiochem.com/#organization',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        'isPartOf': {
          '@id': `${url}#webpage`,
        },
        'mainEntity': [
          {
            '@type': 'Question',
            'name': t('faq.q1Question'),
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': t('faq.q1Answer'),
            },
          },
          {
            '@type': 'Question',
            'name': t('faq.q2Question'),
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': t('faq.q2Answer'),
            },
          },
          {
            '@type': 'Question',
            'name': t('faq.q3Question'),
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': t('faq.q3Answer'),
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <JsonLd id="schema-calculator" data={schema} />
      <PeptideCalculatorPage />
    </>
  )
}
