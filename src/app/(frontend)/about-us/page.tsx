import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { AboutHero } from '@/components/about/AboutHero'
import { MissionPhilosophyJourney } from '@/components/about/MissionPhilosophyJourney'
import { WhyChooseUsGrid } from '@/components/about/WhyChooseUsGrid'
import { ResearchProcessTimeline } from '@/components/about/ResearchProcessTimeline'
import { OurServices } from '@/components/about/OurServices'
import { ComplianceStatement } from '@/components/about/ComplianceStatement'
import { SharedFaqSection } from '@/components/shared/SharedFaqSection'
import { getOgImageUrl } from '@/lib/utils'

const ABOUT_FAQ_KEYS = [
  'trustworthySupplier',
  'analyticalQuality',
  'laboratoryResearchOnly',
  'documentationProvided',
  'checkCoaVial',
  'researchGradeMeaning',
  'requestCoaBeforeOrder',
]

const slug = 'about-us'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations('content.aboutPage')
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
      images: [{ url: getOgImageUrl(title, description) }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImageUrl(title, description)],
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params?: Promise<any>
}) {
  const locale = 'en'
  const t = await getTranslations('content.aboutPage')
  const title = t('metaTitle')
  const description = t('metaDescription')

  const visibleFaqs = ABOUT_FAQ_KEYS.map((key) => {
    const question = t(`faqs.${key}.question`)
    const answerText = t(`faqs.${key}.answer`)

    if (key === 'checkCoaVial') {
      return {
        question,
        answer: (
          <>
            Match the lot number. The certificate carries a lot number, and so does the vial label. If the two agree, the document describes the exact material in your hand. If they don't, the certificate belongs to a different batch and won't tell you what you need to know about the one you have.{' '}
            <Link href="/certificates" className="text-primary underline hover:text-ink font-medium">
              View Certificates
            </Link>
          </>
        ),
      }
    }

    if (key === 'requestCoaBeforeOrder') {
      return {
        question,
        answer: (
          <>
            Yes. Certificates are published per lot and available to review before purchase. If the documentation for a specific lot isn't visible on the site, our{' '}
            <Link href="/contact-us" className="text-primary underline hover:text-ink font-medium">
              support team
            </Link>{' '}
            can provide it.
          </>
        ),
      }
    }

    return {
      question,
      answer: answerText,
    }
  })

  const schemaFaqs = ABOUT_FAQ_KEYS.map((key) => ({
    '@type': 'Question',
    name: t(`faqs.${key}.question`),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(`faqs.${key}.answer`),
    },
  }))

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
  const path = `/${slug}`
  const url = `${baseUrl}${path}`

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
        '@type': 'AboutPage',
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
          { '@type': 'ListItem', position: 2, name: 'About Us', item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        'isPartOf': {
          '@id': `${url}#webpage`,
        },
        mainEntity: schemaFaqs,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="bg-[#FAFAFA] min-h-screen">
        <AboutHero />
        <MissionPhilosophyJourney />
        <WhyChooseUsGrid />
        <ResearchProcessTimeline />
        <OurServices />
        <ComplianceStatement />

        <SharedFaqSection
          title={t('faqTitle')}
          description={
            <span>
              Common questions about research peptides, ordering, and lab standards.{' '}
              <Link href="/faq" className="text-primary underline hover:opacity-80 font-bold ml-1">
                View Full FAQ &rarr;
              </Link>
            </span>
          }
          faqs={visibleFaqs}
        />
      </main>
    </>
  )
}
