'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calculator } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function Hero() {
  const images = [
    '/HelixBio Images/hero-1.webp',
    '/HelixBio Images/hero-2.webp',
    '/HelixBio Images/hero-3.webp'
  ]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [emailMessage, setEmailMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailStatus('loading')
    setEmailMessage('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }
      
      setEmailStatus('success')
      setEmailMessage('Subscribed!')
      const form = e.target as HTMLFormElement
      form.reset()
      
      setTimeout(() => {
        setEmailStatus('idle')
        setEmailMessage('')
      }, 3000)
    } catch (err: any) {
      console.error(err)
      setEmailStatus('error')
      setEmailMessage(err.message || 'Error')
      
      setTimeout(() => {
        setEmailStatus('idle')
        setEmailMessage('')
      }, 3000)
    }
  }
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])
  return (
    <section className="bg-[#FAFAFA] w-full px-4 sm:px-6 md:px-12 pb-6 md:pb-8 min-[1600px]:pb-12 pt-[140px] font-sans min-h-screen flex flex-col">
      {/* Hero Image Container */}
      <div className="relative w-full flex-1 min-h-[400px] md:min-h-[380px] min-[1600px]:min-h-[450px] rounded-[32px] overflow-visible bg-zinc-200">
        <AnimatePresence>
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt="Researcher handling a Helix Bio research peptide vial in a laboratory setting."
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full object-cover object-[75%_center] sm:object-center rounded-[32px]"
            fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent rounded-[32px] pointer-events-none" />

        {/* Hero Content */}
        <div className="absolute top-8 sm:top-12 md:top-[15%] min-[1600px]:top-1/4 left-6 sm:left-8 md:left-16 flex flex-col items-start text-white max-w-3xl lg:max-w-[800px] pr-4 md:pr-12 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] min-[1600px]:text-[4rem] font-bold leading-[1.1] tracking-tight mb-4 text-left drop-shadow-sm">
            Discover Premium<br className="hidden sm:block" /> Research Peptides
          </h1>
          <p className="hidden md:block text-white text-sm md:text-base min-[1600px]:text-lg font-medium max-w-xl lg:max-w-2xl text-left leading-relaxed drop-shadow-md">
            Research-grade peptides, synthesized for precision and verified for purity. Every batch ships with third-party HPLC and mass spectrometry testing, so you know exactly what you're studying before it reaches your bench.
          </p>
          <div className="mt-4 min-[1600px]:mt-8 flex flex-wrap gap-4">
            <Link 
              href="/shop" 
              className="px-6 py-3 min-[1600px]:px-8 min-[1600px]:py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-sm md:text-base font-semibold rounded-[16px] transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center gap-2"
            >
              Shop All Peptides
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute -bottom-24 sm:-bottom-28 md:-bottom-8 min-[1600px]:-bottom-10 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] lg:w-[80%] max-w-5xl bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3 min-[1600px]:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 z-20">
          
          {/* Item 1: Calculator */}
          <div className="flex-1 flex justify-start md:justify-center w-full md:w-auto">
            <Link href="/peptide-calculator" className="flex items-center gap-3 px-1 md:px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors shrink-0 group w-full md:w-auto">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-50 items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Calculator size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Tools</span>
                <span className="text-sm font-semibold text-gray-800">Calculator</span>
              </div>
            </Link>
          </div>

          {/* Divider 1 */}
          <div className="hidden md:block w-px h-10 bg-gray-100 shrink-0 mx-2 lg:mx-4" />

          {/* Item 2: Newsletter Input */}
          <div className="flex-[1.5] flex justify-center w-full md:w-auto px-1 md:px-0">
            <form onSubmit={handleSubscribe} className="relative w-full max-w-sm">
              <input 
                type="email" 
                name="email"
                required
                disabled={emailStatus === 'loading' || emailStatus === 'success'}
                placeholder={emailMessage || "Subscribe to newsletter..."} 
                className={`w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-[16px] px-4 py-3.5 pr-10 text-sm outline-none transition-all ${
                  emailStatus === 'success' ? 'text-green-600 placeholder:text-green-600 bg-green-50' : 
                  emailStatus === 'error' ? 'text-red-600 placeholder:text-red-600 bg-red-50' : 
                  'text-black placeholder:text-gray-400'
                }`}
              />
              <button 
                type="submit"
                disabled={emailStatus === 'loading' || emailStatus === 'success'}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-[10px] hover:bg-gray-800 transition-colors disabled:opacity-50"
                aria-label="Subscribe"
              >
                {emailStatus === 'loading' ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : emailStatus === 'success' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                )}
              </button>
            </form>
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
      <div className="mt-32 sm:mt-36 md:mt-10 min-[1600px]:mt-20 shrink-0 w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-4 min-[1600px]:p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl min-[1600px]:text-4xl font-bold text-black tracking-tight">10K+</h2>
            <div className="flex -space-x-3 ml-auto">
              <img src="https://i.pravatar.cc/100?img=33" className="w-8 h-8 min-[1600px]:w-10 min-[1600px]:h-10 rounded-full border-2 border-white object-cover" alt="Portrait of a Helix Bio research customer" />
              <img src="https://i.pravatar.cc/100?img=47" className="w-8 h-8 min-[1600px]:w-10 min-[1600px]:h-10 rounded-full border-2 border-white object-cover" alt="Portrait of a Helix Bio research customer" />
              <img src="https://i.pravatar.cc/100?img=12" className="w-8 h-8 min-[1600px]:w-10 min-[1600px]:h-10 rounded-full border-2 border-white object-cover" alt="Portrait of a Helix Bio research customer" />
            </div>
          </div>
          <p className="text-gray-500 font-medium text-xs min-[1600px]:text-sm">Research orders fulfilled in the USA</p>
        </div>

        {/* Card 2 */}
        <div className="relative rounded-3xl overflow-hidden p-4 min-[1600px]:p-6 flex flex-col justify-end bg-zinc-200 min-h-[110px] min-[1600px]:min-h-[140px]">
          <img src="https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover object-[75%_center] sm:object-center" alt="Laboratory analyst reviewing a Certificate of Analysis for a research peptide batch" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <h2 className="text-2xl min-[1600px]:text-3xl font-bold text-white tracking-tight mb-1">COA</h2>
              <p className="text-white/80 font-medium text-xs min-[1600px]:text-sm">Certificate of analysis included with every batch</p>
            </div>
            <button aria-label="View Certificates of Analysis" className="w-10 h-6 min-[1600px]:w-12 min-[1600px]:h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-[12px] min-[1600px]:rounded-[14px] flex items-center justify-center">
              <span className="sr-only">View Certificates of Analysis</span>
              <div className="w-3 min-[1600px]:w-4 h-0.5 bg-white rounded-full" />
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121212] rounded-3xl p-4 min-[1600px]:p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl min-[1600px]:text-4xl font-bold text-white tracking-tight mb-1">3rd Party</h2>
            <p className="text-white/70 font-medium text-xs min-[1600px]:text-sm">Independently tested for purity and identity</p>
          </div>
          <div aria-hidden="true" className="absolute -right-4 -bottom-4 text-white/20 font-black text-5xl min-[1600px]:text-7xl select-none pointer-events-none">
            Tested
          </div>
        </div>

      </div>
    </section>
  )
}
