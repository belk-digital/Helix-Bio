import { HomePreloaderWrapper } from '@/components/home/HomePreloaderWrapper'
import { Hero } from '@/components/home/Hero'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { TrustBadges } from '@/components/shared/TrustBadges'
import { FaqSection } from '@/components/home/FaqSection'
import { BlogSection } from '@/components/home/BlogSection'
import { JourneySection } from '@/components/home/JourneySection'
import { WhatSetsUsApart } from '@/components/home/WhatSetsUsApart'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { DifferenceSection } from '@/components/home/DifferenceSection'
import { BestSellerSection } from '@/components/home/BestSellerSection'
import { ImageSliderSection } from '@/components/home/ImageSliderSection'
import { MilitaryDiscountSection } from '@/components/home/MilitaryDiscountSection'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getOgImageUrl } from '@/lib/utils'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getFeaturedImageUrl, formatPostDate } from '@/lib/blog/postDisplay'
import { estimateReadingTime } from '@/lib/blog/readingTime'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations('home')
  const title = t('metaTitle')
  const description = t('metaDescription')
  const path = true ? '/' : `/${locale}`

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

import { getShopProducts } from '@/app/(frontend)/(shop)/actions'
import { getVisibleCategories } from '@/app/(frontend)/actions/categories'

export default async function Homepage() {
  const t = await getTranslations('home')
  const title = t('metaTitle')
  const description = t('metaDescription')
  let products: any[] = []
  let categories: any[] = []
  let blogPosts: any[] = []
  try {
    categories = await getVisibleCategories()
  } catch (e) {
    console.error("Failed to fetch categories", e)
  }
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 4,
      depth: 1,
    })
    blogPosts = docs.map((post: any) => ({
      slug: post.slug,
      title: post.title,
      category: post.category || '',
      excerpt: post.excerpt || '',
      imageSrc: getFeaturedImageUrl(post),
      readTime: post.readTime || estimateReadingTime(post.content),
      date: formatPostDate(post.publishedAt || post.createdAt),
    }))
  } catch (e) {
    console.error("Failed to fetch blog posts", e)
  }
  try {
    const bestSellers = await getShopProducts({ limit: 8, sort: 'newest', bestSellersOnly: true })
    products = bestSellers.success && bestSellers.products ? (bestSellers.products as any[]) : []

    // Fill any remaining slots with other live products so the section is never sparse
    // before best sellers have been curated in the admin.
    if (products.length < 8) {
      const fallback = await getShopProducts({ limit: 8, sort: 'newest' })
      if (fallback.success && fallback.products) {
        const existingIds = new Set(products.map((p: any) => p.id))
        const filler = (fallback.products as any[]).filter(p => !existingIds.has(p.id))
        products = [...products, ...filler].slice(0, 8)
      }
    }
  } catch (e) {
    console.error("Failed to fetch featured products", e)
  }

  return (
    <>
      <div className="flex flex-col w-full min-h-screen relative z-10 bg-black overflow-x-clip">
        <Hero />
        <BestSellerSection products={products} />
        <ImageSliderSection />
        <DifferenceSection />
        <TrustBadges />
        <CategoriesSection categories={categories} />
        <WhatSetsUsApart />
        <MilitaryDiscountSection />
        <JourneySection />
        <WhyChooseUs />
        <BlogSection posts={blogPosts} />
        <FaqSection />
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": "https://helixbiochem.com/#webpage",
              "url": "https://helixbiochem.com/",
              "name": title,
              "description": description
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "@id": "https://helixbiochem.com/#breadcrumb",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://helixbiochem.com/" }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What does \"Research Use Only\" (RUO) mean for these peptides?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Research Use Only means a compound is intended strictly for laboratory and scientific research, not for human or veterinary consumption, diagnosis, or treatment. Helix Bio Chem peptides are labeled and sold on this basis and are not evaluated by the FDA for safety or efficacy in those other contexts."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is considered a research-grade peptide?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A research-grade peptide is synthesized to a documented purity standard of 99% or higher, with HPLC confirming that purity and mass spectrometry confirming molecular identity and weight. At Helix Bio Chem, every batch is tested both ways, and the batch-specific certificate of analysis is published before the product is listed. This material is intended for laboratory research use only, not formulated or labeled for human or veterinary administration."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What should a peptide's certificate of analysis (COA) include?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A complete COA lists the batch or lot number, purity percentage as measured by HPLC, molecular weight confirmation by mass spectrometry, and the date of testing. Matching the batch number on the COA to the vial label confirms the document corresponds to the exact vial received."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do you verify peptide identity beyond mass spectrometry?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Mass spectrometry and HPLC each answer a different question about a peptide, and identity verification needs both. Mass spectrometry measures molecular weight to confirm the compound matches its expected structure. HPLC separates the target peptide from related impurities to measure purity. At Helix Bio Chem, every batch carries both results on its certificate of analysis, published before the product is listed, so identity and purity can each be checked on their own terms."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What storage conditions are recommended for lyophilized peptides?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Unreconstituted (lyophilized) peptides are generally stored frozen or refrigerated, protected from light and moisture, until they're needed for a study. Once reconstituted, most peptides should stay refrigerated and be used within the window noted on the product page or COA."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do peptide reagents support laboratory research studies?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Peptide reagents give a study a fixed starting point: the same compound, at a documented purity, used across every experiment in a series. When a later batch matches an earlier one, results from week one and week ten can be compared directly, and the certificate of analysis for each batch is the record that shows they match. Helix Bio Chem HPLC-tests every batch for purity, confirms identity by mass spectrometry, and publishes the COA before the product is listed."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Why does peptide purity matter for research reproducibility?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Purity matters because impurities can quietly shape an experiment's outcome. Truncated sequences or synthesis by-products may carry their own activity, and even small amounts can shift a result enough to make it hard to repeat. High-purity material lets researchers attribute an observed effect to the peptide itself with more confidence. Helix Bio Chem HPLC-tests every batch for purity, confirms identity by mass spectrometry, and publishes the COA before the product is listed."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do peptide reagents support receptor-binding studies?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "In receptor-binding research, a peptide that isn't what its label claims can produce a signal that looks real, when contamination is actually driving the result. Confirmed purity and identity reduce that risk, because the compound being tested is fully characterized. Helix Bio Chem documents both on every batch's certificate of analysis."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How can I tell if a research peptide supplier is legitimate?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Look for a supplier that publishes a certificate of analysis for every batch, uses independent third-party testing, and states its research-use-only positioning prominently. Before ordering, ask whether every batch is tested, whether the COA is available before purchase, what purity threshold is guaranteed, and how orders are shipped and stored. A supplier that answers plainly and documents its process is easier to evaluate than one that only advertises a purity number."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Helix Bio Chem publish certificates of analysis before listing products?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Helix Bio Chem publishes each batch's certificate of analysis before the product is listed. Every batch is tested first, with HPLC measuring purity and mass spectrometry confirming identity. No listing goes live without its batch documentation, so the COA can be reviewed before an order is placed, and the lot number on the certificate can be matched to the vial label when it arrives."
                  }
                }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://helixbiochem.com/#organization",
              "name": "Helix Bio Chem",
              "url": "https://helixbiochem.com",
              "description": "USA-based supplier of research-use-only synthetic peptides for laboratory research.",
              "email": "support@helixbiochem.com",
              "sameAs": [
                "https://twitter.com/helixbiochem",
                "https://www.instagram.com/helixbiochem"
              ],
              "logo": {
                "@type": "ImageObject",
                "url": "https://helixbiochem.com/HelixBio%20Images/hb-logo.png"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              "@id": "https://helixbiochem.com/#bestsellers",
              "name": "Best Sellers — Research Peptides",
              "numberOfItems": products.length,
              "itemListElement": products.map((p: any, idx: number) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                  "@type": "Product",
                  "name": p.name,
                  "url": `https://helixbiochem.com/product/${p.slug}`,
                  "description": p.description || p.seoDescription || "High-purity research peptide.",
                  "brand": {
                    "@type": "Brand",
                    "name": "Helix Bio Chem"
                  },
                  "offers": {
                    "@type": "Offer",
                    "priceCurrency": "USD",
                    "price": p.price || p.regularPrice || "0.00",
                    "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "url": `https://helixbiochem.com/product/${p.slug}`
                  }
                }
              }))
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://helixbiochem.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://helixbiochem.com/shop?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            }
          ])
        }}
      />
    </>
  )
}
