'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Microscope, ShieldCheck, FileCheck } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const STAGES = [
  {
    key: 'stage1',
    num: '01',
    title: 'Stage 1: Raw Material Screening',
    description: 'Raw material is screened against our defined purity and identity specifications on arrival before entering the production line.',
    icon: Microscope,
    image: '/HelixBio Images/category-2.webp',
  },
  {
    key: 'stage2',
    num: '02',
    title: 'Stage 2: Third-Party Analytical Verification',
    description: 'Finished material is verified by an independent third-party laboratory using HPLC for purity and mass spectrometry for identity confirmation.',
    icon: ShieldCheck,
    image: '/HelixBio Images/military-2.webp',
  },
  {
    key: 'stage3',
    num: '03',
    title: 'Pre-Listing COA Publication',
    description: 'Both analytical results are recorded on the certificate of analysis for that lot, which is published before the product goes live on the site.',
    icon: FileCheck,
    image: '/HelixBio Images/category-7.webp',
  },
];

export function WhyChooseUsGrid() {
  const t = useTranslations('content.whyChooseUsGrid')

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.25, 0.35, 1], [1, 1, 0, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.25, 0.35, 0.65, 0.75], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.65, 0.75, 1, 1], [0, 1, 1, 1]);

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacities = [opacity1, opacity2, opacity3];

  return (
    <section ref={containerRef} className="relative h-[500vh] bg-black">
      
      {/* STICKY BACKGROUND CONTAINER */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Background Images Crossfading */}
        {STAGES.map((stage, idx) => (
          <motion.div
            key={`bg-${stage.key}`}
            style={{ opacity: opacities[idx], scale }}
            className="absolute inset-0 z-0 will-change-transform"
          >
            <Image 
              src={stage.image} 
              alt={stage.title} 
              fill 
              className="object-cover opacity-100" 
              priority={idx === 0}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 md:from-black/60 md:to-black/60" />
          </motion.div>
        ))}

        {/* Floating Typography Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full overflow-hidden pointer-events-none z-0 opacity-[0.03] flex flex-col gap-4">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            style={{ willChange: 'transform' }}
            className="whitespace-nowrap font-heading font-black text-[15vw] text-white uppercase leading-none tracking-tighter"
          >
            ANALYTICAL PURITY &bull; ANALYTICAL PURITY &bull; ANALYTICAL PURITY &bull; ANALYTICAL PURITY
          </motion.div>
        </div>

      </div>

      {/* FOREGROUND SCROLLING CONTENT */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">
        
        {/* Intro Header Section */}
        <div className="h-screen flex items-center max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pointer-events-auto">
          <div className="max-w-3xl pt-32">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-primary" />
              <h2 className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-primary font-bold shadow-black drop-shadow-md">
                {t('eyebrow')}
              </h2>
            </div>
            <h3 className="text-5xl sm:text-6xl md:text-8xl font-heading font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl mb-8">
              {t('title')}
            </h3>
            <p className="text-white/80 font-medium max-w-xl text-lg md:text-xl drop-shadow-md border-l-2 border-primary/50 pl-6 py-2 bg-black/40 backdrop-blur-md rounded-lg">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Feature Sections */}
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isEven = idx % 2 === 0;

          return (
            <div key={stage.key} className="h-screen flex items-center max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 pointer-events-auto">
              <div className={`w-full flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-20% 0px -20% 0px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full max-w-xl relative group"
                >
                  <div className="relative z-10 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-black/60 border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
                    
                    <div className={`absolute -top-24 ${isEven ? '-left-24' : '-right-24'} w-48 h-48 bg-primary/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(14,165,233,0.15)] group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-white/10 font-serif text-6xl md:text-8xl leading-none select-none -mt-4 -mr-4 font-black">
                        {stage.num}
                      </span>
                    </div>

                    <h4 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-white uppercase mb-6 leading-[1.1] relative z-10">
                      {stage.title}
                    </h4>
                    
                    <p className="text-white/70 text-base md:text-lg leading-relaxed font-light relative z-10">
                      {stage.description}
                    </p>

                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>

              </div>
            </div>
          )
        })}

        <div className="h-[50vh]" />
        
      </div>
    </section>
  )
}
