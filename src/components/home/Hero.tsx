'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calculator } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function Hero() {
  const images = [
    '/HelixBio Images/hero-1.png',
    '/HelixBio Images/hero-2.png',
    '/HelixBio Images/hero-3.png'
  ]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])
  return (
    <section className="bg-[#FAFAFA] w-full px-4 sm:px-6 md:px-12 pb-6 md:pb-12 pt-[140px] font-sans min-h-screen flex flex-col">
      {/* Hero Image Container */}
      <div className="relative w-full flex-1 min-h-[400px] md:min-h-[450px] rounded-[32px] overflow-visible bg-zinc-200">
        <AnimatePresence>
          <motion.img 
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt="Premium Research Peptides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-[32px]"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent rounded-[32px] pointer-events-none" />

        {/* Hero Content */}
        <div className="absolute top-8 sm:top-12 md:top-1/4 left-6 sm:left-8 md:left-16 flex flex-col items-start text-white max-w-xl pr-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 text-left">
            Discover Premium<br/>Research Peptides
          </h1>
          <p className="text-white/80 text-sm md:text-base font-medium max-w-sm text-left">
            USA-made, 99%+ purity, third-party tested peptides for advanced scientific research.
          </p>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute -bottom-24 md:-bottom-10 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] lg:w-[80%] max-w-5xl bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 z-20">
          
          {/* Item 1: Calculator */}
          <div className="flex-1 flex justify-start md:justify-center w-full md:w-auto">
            <Link href="/peptide-calculator" className="flex items-center gap-3 px-1 md:px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors shrink-0 group w-full md:w-auto">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-50 items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Calculator size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Tools</span>
                <span className="text-sm font-semibold text-gray-800">Calculator</span>
              </div>
            </Link>
          </div>

          {/* Divider 1 */}
          <div className="hidden md:block w-px h-10 bg-gray-100 shrink-0 mx-2 lg:mx-4" />

          {/* Item 2: Newsletter Input */}
          <div className="flex-[1.5] flex justify-center w-full md:w-auto px-1 md:px-0">
            <div className="relative w-full max-w-sm">
              <input 
                type="email" 
                placeholder="Subscribe to newsletter..." 
                className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-[16px] px-4 py-3.5 pr-10 text-sm text-black outline-none transition-all placeholder:text-gray-400"
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-[10px] hover:bg-gray-800 transition-colors"
                aria-label="Subscribe"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>

          {/* Divider 2 */}
          <div className="hidden md:block w-px h-10 bg-gray-100 shrink-0 mx-2 lg:mx-4" />

          {/* Item 3: Search Button */}
          <div className="flex-1 flex justify-end md:justify-center w-full md:w-auto">
            <button 
              onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new Event('open-search-modal'))}
              className="w-full md:w-auto bg-[#121212] text-white px-6 xl:px-8 py-3.5 rounded-[16px] font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shrink-0 shadow-md group"
            >
              <Search size={18} className="group-hover:scale-110 transition-transform" />
              <span className="whitespace-nowrap">Search Peptides</span>
            </button>
          </div>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-32 md:mt-20 shrink-0 w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-4xl font-bold text-black tracking-tight">10 k+</h2>
            <div className="flex -space-x-3 ml-auto">
              <img src="https://i.pravatar.cc/100?img=33" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="avatar" />
              <img src="https://i.pravatar.cc/100?img=47" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="avatar" />
              <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="avatar" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-sm">Satisfied Researchers</p>
        </div>

        {/* Card 2 */}
        <div className="relative rounded-3xl overflow-hidden p-6 flex flex-col justify-end bg-zinc-200 min-h-[140px]">
          <img src="https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover" alt="Lab Test" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-1">99.9%</h2>
              <p className="text-white/80 font-medium text-sm">Verified Purity</p>
            </div>
            <button className="w-12 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-[14px] flex items-center justify-center">
              <div className="w-4 h-0.5 bg-white rounded-full" />
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121212] rounded-3xl p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-1">3rd Party</h2>
            <p className="text-white/70 font-medium text-sm">Independent Lab Tested</p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-white/5 font-black text-6xl md:text-7xl select-none pointer-events-none">
            Tested
          </div>
        </div>

      </div>
    </section>
  )
}
