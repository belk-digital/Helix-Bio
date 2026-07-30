'use client'

import { ShoppingBag, ShoppingCart, Heart, Loader2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Link, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useCartStore } from '@/lib/cart/store'
import { toast } from 'sonner'
import { FluidButton } from '@/components/ui/fluid-button'
import { ProductCard } from '@/components/shared/ProductCard'

const FALLBACK_PRODUCTS = [
  {
    key: "tb500",
    name: "TB-500",
    categories: [{ title: "Muscle Repair" }],
    meta: { description: "Potent synthetic peptide researched for its role in cellular migration, actin regulation, and wound healing." },
    price: "55",
    images: [{ image: { url: "/Helix Bio product images/NAD+ 500MG.png" } }],
    slug: "tb-500",
  },
  {
    key: "bpc157",
    name: "BPC-157",
    categories: [{ title: "Recovery & Healing" }],
    meta: { description: "A highly purified synthetic peptide widely studied for its profound effects on tissue regeneration and angiogenesis." },
    price: "45",
    images: [{ image: { url: "/Helix Bio product images/NAD+ 500MG.png" } }],
    slug: "bpc-157",
  },
  {
    key: "semaglutide",
    name: "Semaglutide",
    categories: [{ title: "Metabolic Research" }],
    meta: { description: "A GLP-1 receptor agonist actively researched for its mechanisms in glycemic control and metabolic regulation." },
    price: "85",
    images: [{ image: { url: "/Helix Bio product images/NAD+ 500MG.png" } }],
    slug: "semaglutide",
  },
  {
    key: "ghkCu",
    name: "GHK-Cu",
    categories: [{ title: "Cellular Aging" }],
    meta: { description: "A naturally occurring copper complex peptide frequently studied for its role in collagen synthesis and anti-aging." },
    price: "35",
    images: [{ image: { url: "/Helix Bio product images/NAD+ 500MG.png" } }],
    slug: "ghk-cu",
  }
]



export function BestSellerSection({ products = [] }: { products?: any[] }) {
  const t = useTranslations('home.bestSeller')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const sourceProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;

  // Make sure we have enough products for the slider
  const displayProducts = sourceProducts.length >= 8 
    ? sourceProducts.slice(0, 8) 
    : [...sourceProducts, ...sourceProducts, ...sourceProducts, ...sourceProducts].slice(0, 8);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.firstElementChild as HTMLElement;
      if (card) {
        const scrollAmount = card.offsetWidth + 24;
        scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
    }
  }

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDown.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDown.current = true;
    isDraggingRef.current = false;
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.scrollSnapType = 'none';
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
    }
    // Note: click prevention is handled by onClickCapture on the container
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current); // 1:1 drag speed
    if (Math.abs(walk) > 10) {
      isDraggingRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="font-sans relative z-30 py-12 px-4 sm:px-6 md:px-12 bg-[#FAFAFA]">
      <div className="bg-[#d9f0ff] rounded-[32px] md:rounded-[40px] p-6 md:p-12 lg:p-16 w-full mx-auto overflow-hidden">
        
        {/* Header Split */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-block border border-ink/10 rounded-full px-4 py-1.5 mb-6 bg-white shadow-sm">
              <span className="text-primary-dark text-xs font-bold tracking-[0.2em] uppercase">{t('eyebrow')}</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-[1.1] tracking-tighter uppercase">
              {t('title')}
            </h2>
          </div>
          <div className="max-w-md lg:text-right">
            <p className="text-ink/70 text-base md:text-lg leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>

        {/* Slider Track */}
        <div className="relative -mx-6 md:-mx-12 lg:-mx-16 px-6 md:px-12 lg:px-16">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onClickCapture={(e) => {
              if (isDraggingRef.current) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
          >
            {displayProducts.map((product, idx) => (
              <div 
                key={`${product.slug || product.key}-${idx}`}
                className="shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] snap-start snap-always"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
          <Link href="/shop" className="w-full sm:w-auto h-12 md:h-14 bg-[#121212] text-white px-6 xl:px-8 rounded-[16px] font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shrink-0 shadow-md group">
            <span className="whitespace-nowrap uppercase tracking-wide text-sm">{t('ctaText')}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} aria-label="Previous" className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm text-black">
              <svg width="16" height="16" className="md:w-5 md:h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="17 20 7 12 17 4 17 20"/></svg>
            </button>
            <button onClick={() => scroll('right')} aria-label="Next" className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm text-black">
              <svg width="16" height="16" className="md:w-5 md:h-5 ml-1" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="7 4 17 12 7 20 7 4"/></svg>
            </button>
          </div>
        </div>
        
      </div>
    </section>
  )
}
