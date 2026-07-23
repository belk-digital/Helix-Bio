'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { getCategoryDisplayName } from '@/lib/categoryDisplay'
import { ArrowRight } from 'lucide-react'

export interface HomeCategory {
  id: string | number
  name: string
  slug?: string
}

export interface CategoriesSectionProps {
  categories?: HomeCategory[]
}

const CATEGORY_IMAGES = [
  '/HelixBio Images/category-1.webp',
  '/HelixBio Images/category-2.webp',
  '/HelixBio Images/category-3.webp',
  '/HelixBio Images/category-4.webp',
  '/HelixBio Images/category-5.webp',
  '/HelixBio Images/category-6.webp',
  '/HelixBio Images/category-7.webp',
  '/HelixBio Images/category-8.webp',
]

// Fallback generic descriptions (in case category doesn't have one)
const DEFAULT_DESC = "Premium quality and purity for your specific needs."

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  const t = useTranslations('home.categories')

  const header = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 mb-12"
    >
      <h2 className="font-heading text-[2rem] sm:text-3xl md:text-5xl lg:text-6xl font-black text-ink leading-[0.9] tracking-tighter uppercase w-full md:w-1/2 break-words">
        {t('titleLine1')}<br />{t('titleLine2')}
      </h2>
      <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-md text-left md:text-right leading-relaxed font-medium">
        {t('description')}
      </p>
    </motion.div>
  )

  return (
    <section className="bg-[#FAFAFA] py-16 md:py-24 relative font-sans overflow-hidden">
      <div className="container mx-auto px-4 md:px-10 max-w-[120rem]">
        {header}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              key={category.id}
              className="group relative flex overflow-hidden rounded-[24px] md:rounded-[32px] bg-[#f8f9fa] min-h-[220px] md:min-h-[260px] shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Content Left Side */}
              <div className="w-[55%] md:w-1/2 p-6 md:p-8 flex flex-col justify-center relative z-20">
                <h3 className="font-heading text-xl md:text-3xl font-bold uppercase text-ink mb-2 md:mb-3 leading-tight tracking-tighter">
                  {getCategoryDisplayName(category.name)}
                </h3>
                <p className="text-[10px] md:text-xs text-ink/50 uppercase font-bold tracking-[0.1em] leading-relaxed mb-6 md:mb-8 line-clamp-3">
                  {DEFAULT_DESC}
                </p>
                <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-widest text-ink/70 group-hover:text-primary transition-colors mt-auto">
                  <span>{t('exploreCursor')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
                </div>
              </div>

              {/* Image Right Side with Gradient Blend */}
              <div className="absolute right-0 top-0 w-[70%] h-full z-0 overflow-hidden pointer-events-none">
                <Image
                  src={CATEGORY_IMAGES[index % CATEGORY_IMAGES.length]}
                  alt={getCategoryDisplayName(category.name)}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Linear gradient overlay masking the left edge of the image into the background color */}
                <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-gradient-to-r from-[#f8f9fa] via-[#f8f9fa]/80 to-transparent" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
