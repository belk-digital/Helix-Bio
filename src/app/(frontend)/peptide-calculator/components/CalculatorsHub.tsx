'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { PeptideReconstitution } from './PeptideReconstitution'
import { BlendVial } from './BlendVial'
import { UnitConverter } from './UnitConverter'
import { FadeUp } from '@/components/motion/FadeUp'
import { Syringe, Layers, ArrowRightLeft } from 'lucide-react'

type CalculatorTab = 'reconstitution' | 'blend' | 'unit';

interface CalculatorsHubProps {
  isEmbedded?: boolean
}

export function CalculatorsHub({ isEmbedded = false }: CalculatorsHubProps) {
  const t = useTranslations('calculator.hub')
  const [activeTab, setActiveTab] = useState<CalculatorTab>('reconstitution');

  const TABS: { id: CalculatorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'reconstitution', label: 'Reconstitution', icon: <Syringe className="w-4 h-4" /> },
    { id: 'blend', label: 'Blend Vial', icon: <Layers className="w-4 h-4" /> },
    { id: 'unit', label: 'Unit Converter', icon: <ArrowRightLeft className="w-4 h-4" /> },
  ];

  return (
    <div className={`w-full flex flex-col items-center relative z-10 ${isEmbedded ? 'pt-2 pb-6 px-0' : 'pt-20 lg:pt-32 pb-16 lg:pb-24 px-4 sm:px-6'}`}>
      
      <FadeUp className={`w-full max-w-5xl mx-auto flex justify-center ${isEmbedded ? 'mb-6' : 'mb-10 lg:mb-16'}`}>
        {/* Navigation Tabs - Floating Island Design */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 bg-white/90 backdrop-blur-3xl rounded-2xl border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group transition-all duration-700 hover:shadow-xl hover:border-black/10 z-20">
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl pointer-events-none" />

          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-500 ${
                  isActive ? 'text-white shadow-sm' : 'text-ink/50 hover:text-ink hover:bg-black/5 hover:scale-105'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-ink rounded-xl -z-10 shadow-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Icon Container with pop effect */}
                <div className={`relative z-10 shrink-0 flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 text-white' : ''}`}>
                  {tab.icon}
                </div>
                
                {/* Label with slide effect */}
                <span className={`relative z-10 hidden md:inline-block transition-transform duration-500 ${isActive ? 'translate-x-1' : ''}`}>
                  {tab.label}
                </span>
                
                {/* Active dot indicator for mobile instead of full text */}
                {isActive && <div className="md:hidden w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                
                {/* Mobile Animated Bubble Popup */}
                <AnimatePresence>
                  {isActive && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 md:hidden pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="bg-ink text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl whitespace-nowrap flex items-center justify-center relative"
                      >
                        {tab.label}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-ink rotate-45" />
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>
      </FadeUp>

      {/* Calculator Content Area */}
      <div className="w-full max-w-[1400px] mx-auto min-h-[600px] relative">
        <AnimatePresence mode="wait">
          {activeTab === 'reconstitution' && (
            <motion.div
              key="reconstitution"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PeptideReconstitution />
            </motion.div>
          )}
          {activeTab === 'blend' && (
            <motion.div
              key="blend"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BlendVial />
            </motion.div>
          )}
          {activeTab === 'unit' && (
            <motion.div
              key="unit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UnitConverter />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-6 text-center text-xs text-ink/50 font-medium tracking-wide">
          For laboratory research use only. Not for human or veterinary use.
        </p>
      </div>

    </div>
  )
}
