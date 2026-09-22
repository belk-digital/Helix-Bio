'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { CheckCircle2, ArrowRight, Beaker, ShieldAlert, FileText, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function OurServices() {
  const t = useTranslations('content.ourServices')

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const areas = [
    {
      title: t('areas.area1.title'),
      description: (
        <>
          Status, invoicing, and account access, handled by our{' '}
          <Link href="/contact-us" className="underline text-primary hover:text-ink font-medium">
            support team
          </Link>.
        </>
      ),
      icon: ArrowRight
    },
    {
      title: t('areas.area2.title'),
      description: (
        <>
          <Link href="/certificates" className="underline text-primary hover:text-ink font-medium">
            Certificates of analysis
          </Link>{' '}
          for any lot, available before you order or after delivery.
        </>
      ),
      icon: FileText
    },
    {
      title: t('areas.area3.title'),
      description: (
        <>
          Compound identity, format, and vial contents as recorded on the{' '}
          <Link href="/shop" className="underline text-primary hover:text-ink font-medium">
            product page
          </Link>{' '}
          and its lot documentation.
        </>
      ),
      icon: Search
    },
    {
      title: t('areas.area4.title'),
      description: t('areas.area4.description'),
      icon: Beaker
    }
  ];

  return (
    <section className="py-24 lg:py-40 bg-[#FAFAFA] relative overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at center, #000 2px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 border border-black/5 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-ink font-bold">
              {t('capabilitiesLabel')}
            </span>
          </motion.div>
          
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-ink tracking-tighter uppercase leading-[0.95]"
          >
            {t('titleLine1')} <br className="hidden md:block" />
            <span className="text-primary">{t('titleLine2')}</span>
          </motion.h3>
        </div>

        {/* Bento Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(350px,auto)]"
        >
          
          {/* Card 1: Main Feature (Spans 2 columns) */}
          <motion.div 
            variants={cardVariants}
            className="md:col-span-2 relative bg-white rounded-[2.5rem] border border-black/5 p-8 md:p-12 overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col justify-center"
          >
            {/* Background Image Fade */}
            <div className="absolute top-0 right-0 w-full md:w-2/3 h-full opacity-10 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none mask-image-gradient-to-l from-black to-transparent">
              <Image src="/HelixBio Images/mutiple-vial-1.webp" alt="Row of multiple Helix Bio Chem research peptide vials" fill className="object-cover object-right" />
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mb-8">
                <Beaker strokeWidth={1.5} className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-3xl sm:text-4xl font-heading font-black text-ink uppercase tracking-tight mb-4">
                {t('card1Title')}
              </h4>
              <p className="text-ink/60 text-lg font-medium leading-relaxed mb-6">
                {t('card1Text')}
              </p>
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary hover:underline group/link"
              >
                View Catalogue <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Exclusive Application */}
          <motion.div 
            variants={cardVariants}
            className="relative bg-white rounded-[2.5rem] border border-black/5 p-8 md:p-12 overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col"
          >
            <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mb-auto">
              <ShieldAlert strokeWidth={1.5} className="w-7 h-7 text-primary" />
            </div>
            
            <div className="mt-12">
              <h4 className="text-2xl font-heading font-black text-ink uppercase tracking-tight mb-4">
                {t('card2Title')}
              </h4>
              <p className="text-ink/80 font-medium mb-6">
                {t('card2Text1')}
              </p>
              <div className="w-full h-[1px] bg-black/5 mb-4" />
              <p className="text-ink/40 text-sm font-medium italic">
                {t('card2Text2')}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Research Commitment Footer Card (Spans all columns) */}
          <motion.div 
            variants={cardVariants}
            className="md:col-span-2 lg:col-span-3 bg-white rounded-[2.5rem] border border-black/5 p-8 md:p-12 group hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500"
          >
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start lg:items-center">
              
              {/* Left Side */}
              <div className="w-full lg:w-1/3">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink/40 font-bold">
                    {t('footerLabel')}
                  </span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-heading font-black text-ink uppercase tracking-tight mb-4">
                  {t('footerTitle')}
                </h4>
                <p className="text-ink/60 font-medium leading-relaxed">
                  {t('footerText')}
                </p>
              </div>

              {/* Right Side Grid */}
              <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {areas.map((area, i) => (
                  <div 
                    key={i}
                    className="flex flex-col gap-2 p-5 rounded-2xl bg-black/[0.02] border border-black/5 group/item hover:bg-white hover:border-black/10 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm group-hover/item:text-primary transition-colors">
                        <area.icon className="w-4 h-4 text-ink/40 group-hover/item:text-primary transition-colors" />
                      </div>
                      <span className="font-bold text-ink text-base sm:text-lg">
                        {area.title}
                      </span>
                    </div>
                    <div className="text-ink/60 text-sm leading-relaxed pl-11">
                      {area.description}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
