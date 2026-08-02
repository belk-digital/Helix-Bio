'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 0,
    title: "PRECISION LABS",
    subtitle: "Research environments",
    image: "/HelixBio Images/featured-research-2.webp"
  },
  {
    id: 1,
    title: "PURE SYNTHESIS",
    subtitle: "99%+ guarantee",
    image: "/HelixBio Images/military-1.webp"
  },
  {
    id: 2,
    title: "UNCOMPROMISING",
    subtitle: "Quality standards",
    image: "/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_44_49 AM.webp"
  }
]

interface AuthSplitLayoutProps {
  children: React.ReactNode
  mode: 'login' | 'register'
}

export function AuthSplitLayout({ children, mode }: AuthSplitLayoutProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#FAFAFA] flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* Left Column - Typography & Content */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-10 lg:p-12 xl:p-16 relative h-auto lg:h-full bg-[#FAFAFA] justify-start lg:justify-between overflow-visible lg:overflow-hidden shrink-0 z-20">
        
        {/* Top Header Logo & Back Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between shrink-0 pt-2 lg:pt-0 pb-6 lg:pb-0 gap-6 sm:gap-4 w-full">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image 
              src="/HelixBio Images/hb-logo.png" 
              alt="Helix Bio" 
              width={200} 
              height={60} 
              className="h-8 lg:h-14 w-auto" 
            />
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 text-[10px] font-bold uppercase tracking-widest text-ink/60 hover:text-ink hover:bg-black/5 hover:border-black/20 transition-all"
          >
            <ChevronLeft size={14} />
            Return to home
          </Link>
        </div>

        {/* Center Typography */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-xl mx-auto lg:mx-0 my-0 lg:my-auto pb-8 lg:pb-0 relative z-10 shrink-0">
          <h1 className="text-[2rem] sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold leading-[1.1] text-ink tracking-tight font-heading">
            SYNTHESIZED <br className="hidden lg:block" />
            <span className="relative inline-block z-10">
              WITH PRECISION
              {/* Blue Highlight shapes */}
              <div className="absolute -bottom-1 lg:-bottom-2 left-0 w-[105%] h-4 lg:h-6 bg-[#84D0D9]/60 -z-10 rounded-full blur-[2px]" />
            </span> <br className="hidden lg:block" />
            FOR RESEARCH.
            <span className="inline-flex items-center ml-2 lg:ml-4 relative top-1 lg:top-2">
               <motion.div 
                 animate={{ y: [0, -8, 0] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                 className="w-6 h-6 lg:w-10 lg:h-10 bg-[#143D45] rounded-full -mr-3 lg:-mr-4 relative z-10"
               />
               <motion.div 
                 animate={{ y: [0, -8, 0] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                 className="w-6 h-6 lg:w-10 lg:h-10 bg-[#1E5661] rounded-full -mr-3 lg:-mr-4 relative z-20"
               />
               <motion.div 
                 animate={{ y: [0, -8, 0] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                 className="w-6 h-6 lg:w-10 lg:h-10 bg-[#84D0D9] rounded-full relative z-30 shadow-sm"
               />
            </span>
          </h1>
        </div>

        {/* About Us Card (Bottom Left) */}
        <div className="hidden lg:flex shrink-0 pb-4 lg:pb-0">
          <div className="bg-[#111] rounded-3xl p-6 xl:p-8 w-full max-w-[420px] relative overflow-hidden flex flex-col justify-end min-h-[180px] xl:min-h-[220px]">
            <Image 
              src="/HelixBio Images/vial-on-sand.webp" 
              alt="Lab" 
              fill 
              className="object-cover opacity-20"
            />
            <div className="relative z-10 flex gap-4 xl:gap-6 items-end">
              <h3 className="text-white font-bold text-base xl:text-lg w-1/3">About us</h3>
              <p className="text-white/60 text-xs xl:text-sm leading-relaxed w-2/3">
                Over <strong className="text-white">3 million vials</strong> synthesized by the world's most precise laboratory environment for <strong className="text-white">researchers.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Slider & Form */}
      <div className="w-full lg:w-1/2 relative flex-1 min-h-[500px] lg:h-full flex items-center justify-center px-4 py-20 sm:p-8 lg:p-12 overflow-hidden bg-black shrink-0">
        
        {/* Slider Background */}
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image 
              src={SLIDES[currentSlide].image}
              alt="Background"
              fill
              className="object-cover opacity-60"
            />
            {/* Dark vignette to ensure form pops */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 mix-blend-multiply" />
          </motion.div>
        </AnimatePresence>

        {/* Floating Slider Title (Top) */}
        <div className="absolute top-6 lg:top-12 left-1/2 -translate-x-1/2 z-10 text-center flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="text-white font-medium text-[10px] lg:text-sm tracking-widest uppercase mb-1">{SLIDES[currentSlide].title}</h4>
              <p className="text-white/70 text-[10px] lg:text-xs">{SLIDES[currentSlide].subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Form Card */}
        <div className="relative z-20 w-full max-w-[420px]">
          {children}
        </div>

        {/* Slider Controls (Bottom) */}
        <div className="absolute bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-12 z-10 flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-center lg:justify-start px-6">
          <div className="text-white/80 font-medium text-[10px] lg:text-sm tracking-widest">
            {String(currentSlide + 1).padStart(2, '0')}/{String(SLIDES.length).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevSlide} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextSlide} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
