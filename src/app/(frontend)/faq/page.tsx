import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FaqClient } from '@/components/faq/FaqClient'
import { faqData } from '@/data/faqs'
import { getOgImageUrl } from '@/lib/utils'

const slug = 'faq'
const locale = 'en'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('content.faqPage')
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

export default async function FaqPage() {
  const t = await getTranslations('content.faqPage')
  const allFaqs = faqData.flatMap(category =>
    category.items.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer,
      },
    }))
  )

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': 'https://helixbiochem.com/#organization',
        '@type': 'Organization',
        'alternateName': 'Helix Bio',
        'description': 'US supplier of research-grade peptides, sold strictly for laboratory research use only.',
        'email': 'support@helixbiochem.com',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://helixbiochem.com/HelixBio%20Images/hb-logo.webp',
        },
        'name': 'Helix Bio Chem',
        'sameAs': [],
        'url': 'https://helixbiochem.com/',
      },
      {
        '@id': 'https://helixbiochem.com/#website',
        '@type': 'WebSite',
        'name': 'Helix Bio Chem',
        'publisher': {
          '@id': 'https://helixbiochem.com/#organization',
        },
        'url': 'https://helixbiochem.com/',
      },
      {
        '@id': 'https://helixbiochem.com/faq#webpage',
        '@type': 'WebPage',
        'breadcrumb': {
          '@id': 'https://helixbiochem.com/faq#breadcrumb',
        },
        'description': 'Answers on research peptides, analytical standards, ordering, and laboratory handling. All products are for research use only.',
        'isPartOf': {
          '@id': 'https://helixbiochem.com/#website',
        },
        'name': 'Frequently Asked Questions',
        'publisher': {
          '@id': 'https://helixbiochem.com/#organization',
        },
        'url': 'https://helixbiochem.com/faq',
      },
      {
        '@id': 'https://helixbiochem.com/faq#breadcrumb',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'item': 'https://helixbiochem.com/',
            'name': 'Home',
            'position': 1,
          },
          {
            '@type': 'ListItem',
            'item': 'https://helixbiochem.com/faq',
            'name': 'FAQ',
            'position': 2,
          },
        ],
      },
      {
        '@id': 'https://helixbiochem.com/faq#faq',
        '@type': 'FAQPage',
        'isPartOf': {
          '@id': 'https://helixbiochem.com/faq#webpage',
        },
        'mainEntity': allFaqs,
      },
    ],
  }

  return (
    <>
      <FaqClient />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}
