'use client'

import React from 'react'
import { motion } from 'framer-motion'

export type FaqItemType = {
  question: string;
  answer: string | React.ReactNode;
};

export function SharedFaqSection({
  title,
  subtitle,
  description,
  faqs,
}: {
  title: string | React.ReactNode;
  subtitle?: string;
  description?: string | React.ReactNode;
  faqs: FaqItemType[];
}) {

  return (
    <section className="bg-[#FAFAFA] py-24 md:py-32 w-full font-sans relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-10 max-w-[120rem] relative z-10">
        
        {/* Header */}
        <div className="mb-20 md:mb-32">
          {subtitle && (
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">
              {subtitle}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-ink uppercase tracking-tighter max-w-4xl leading-[0.9]">
            {title}
          </h2>
          {description && (
            <div className="mt-6 text-zinc-600 max-w-2xl text-base md:text-lg leading-relaxed font-medium">
              {description}
            </div>
          )}
        </div>

        <div className="flex flex-col w-full">
          {faqs.map((faq, index) => {
            const num = (index + 1).toString().padStart(2, '0')
            
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex flex-col md:flex-row relative w-full group cursor-default"
              >
                
                {/* Left Side: Sticky Number */}
                <div className="w-full md:w-1/3 lg:w-[35%] relative">
                  <div className="md:sticky md:top-32 text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] min-[1650px]:text-[18rem] font-heading font-black leading-[0.8] text-ink pb-8 md:pb-24 pt-4 md:pt-0 -ml-1 md:-ml-2 lg:-ml-4 transition-all duration-500 ease-out group-hover:text-transparent group-hover:[-webkit-text-stroke:2px_#008B8B] md:group-hover:[-webkit-text-stroke:4px_#008B8B] group-hover:scale-105 origin-left">
                    {num}
                  </div>
                </div>

                {/* Right Side: Content Area with Top Border */}
                <div className="w-full md:w-2/3 lg:w-[65%] flex flex-col pt-8 md:pt-12 lg:pt-16 pb-16 md:pb-32 relative">
                  {/* Base Border */}
                  <div className="absolute top-0 left-0 w-full h-[4px] md:h-[6px] bg-ink" />
                  {/* Animated Hover Border */}
                  <div className="absolute top-0 left-0 w-0 h-[4px] md:h-[6px] bg-[#008B8B] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full z-10" />

                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative z-20">
                    
                    {/* Title Column */}
                    <div className="w-full lg:w-5/12 transform transition-transform duration-500 group-hover:translate-x-2">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl min-[1650px]:text-5xl font-heading font-bold text-ink group-hover:text-[#008B8B] transition-colors duration-500 leading-[1.1] tracking-tight pr-4">
                        {faq.question}
                      </h3>
                      <p className="text-zinc-500 font-bold text-xs sm:text-sm mt-4 tracking-[0.1em] uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                        Knowledge Base
                      </p>
                    </div>

                    {/* Description Column */}
                    <div className="w-full lg:w-7/12 transform transition-transform duration-500 lg:group-hover:translate-x-2">
                      <div className="text-sm sm:text-base min-[1650px]:text-lg text-zinc-600 group-hover:text-ink transition-colors duration-500 leading-relaxed font-medium [&_a]:text-[#008B8B] [&_a]:underline [&_a]:underline-offset-2">
                        {faq.answer}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
