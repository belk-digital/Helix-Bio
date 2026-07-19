'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { useTranslations } from 'next-intl'
import { FluidButton } from '@/components/ui/fluid-button'
import { LanguageSwitcher } from './LanguageSwitcher'

const FooterContent = () => {
  const t = useTranslations('footer')
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  
  const lenis = useLenis();

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    
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
      
      setStatus('success')
      setMessage('Successfully subscribed!')
      // Reset form
      const form = e.target as HTMLFormElement
      form.reset()
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  const handleScrollToTop = () => {
    if (lenis) {
      // Use an exponential ease-out curve for buttery smooth deceleration
      lenis.scrollTo(0, { 
        duration: 2, 
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer ref={sectionRef} className="bg-[#050505] w-full relative z-30 font-sans border-t border-white/5 overflow-hidden text-white">

      {/* Pre-Footer CTA - Scrolling Marquee Design */}
      <div className="w-full relative z-40">
        {/* Background split: Top half is FAFAFA (page bg), Bottom half is 050505 (footer bg) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="w-full h-[60%] bg-[#FAFAFA]" />
          <div className="w-full h-[40%] bg-[#050505]" />
        </div>
        
        <div className="w-full px-4 md:px-10 relative z-10 py-8 md:py-12">
          <div className="w-full max-w-[120rem] mx-auto bg-[#d9f0ff] rounded-[32px] py-10 md:py-12 relative overflow-hidden flex flex-col items-center border border-black/5">
            
            {/* Top Text Section */}
            <div className="text-center max-w-4xl px-4 flex flex-col items-center relative z-20 mb-8 md:mb-12">
              <h2 className="font-heading text-[2.5rem] sm:text-[3rem] md:text-[4rem] lg:text-[4.5rem] font-extrabold text-[#0B1221] leading-[1.05] tracking-tight mb-4 drop-shadow-sm">
                {t('ctaHeadlineLine1')} <br /> {t('ctaHeadlineLine2')}
              </h2>
              
              <p className="text-[#0B1221]/70 font-semibold text-xs md:text-sm max-w-xl tracking-wide mb-8 lg:mb-10">
                Boost Your Research with High-Impact Peptides from our expert scientists. Our team is ready to propel your research forward with absolute precision and verifiable results.
              </p>
            </div>

            {/* Scrolling Curved Marquee (3D Cylinder) */}
            <div className="w-full h-[320px] md:h-[420px] lg:h-[480px] relative flex items-center justify-center cta-cylinder-container" style={{ perspective: '3000px' }}>
               <style>{`
                 .cta-cylinder-container {
                   --cyl-radius: 890px;
                   --cyl-y: 47px;
                 }
                 @media (min-width: 768px) {
                   .cta-cylinder-container { 
                     --cyl-radius: 1160px; 
                     --cyl-y: 61px;
                   }
                 }
                 @media (min-width: 1024px) {
                   .cta-cylinder-container { 
                     --cyl-radius: 1420px; 
                     --cyl-y: 74px;
                   }
                 }
                 @keyframes rotate-cylinder {
                   0% { transform: translateY(var(--cyl-y)) translateZ(calc(var(--cyl-radius) * -1)) rotateX(6deg) rotateY(0deg); }
                   100% { transform: translateY(var(--cyl-y)) translateZ(calc(var(--cyl-radius) * -1)) rotateX(6deg) rotateY(-360deg); }
                 }
                 .animate-cylinder {
                   transform-style: preserve-3d;
                   animation: rotate-cylinder 60s linear infinite;
                   will-change: transform;
                   transform-origin: center center;
                 }
                 .animate-cylinder:hover {
                   animation-play-state: paused;
                 }
               `}</style>
               
               {/* Left/Right Fade Masks to blend into the d9f0ff background */}
               <div className="absolute left-0 top-0 w-16 md:w-48 h-full bg-gradient-to-r from-[#d9f0ff] to-transparent z-10 pointer-events-none" />
               <div className="absolute right-0 top-0 w-16 md:w-48 h-full bg-gradient-to-l from-[#d9f0ff] to-transparent z-10 pointer-events-none" />

               <div className="relative w-full h-full animate-cylinder flex items-center justify-center">
                 {[
                   ...[
                     '/99 Images/category-1.webp',
                     '/99 Images/category-2.webp',
                     '/99 Images/category-3.webp',
                     '/99 Images/purity.webp',
                     '/99 Images/identity.webp',
                     '/99 Images/vial-closeup.webp',
                     '/99 Images/vial-ice-closeup.webp',
                   ],
                   ...[
                     '/99 Images/category-1.webp',
                     '/99 Images/category-2.webp',
                     '/99 Images/category-3.webp',
                     '/99 Images/purity.webp',
                     '/99 Images/identity.webp',
                     '/99 Images/vial-closeup.webp',
                     '/99 Images/vial-ice-closeup.webp',
                   ],
                   ...[
                     '/99 Images/category-1.webp',
                     '/99 Images/category-2.webp',
                     '/99 Images/category-3.webp',
                     '/99 Images/purity.webp',
                     '/99 Images/identity.webp',
                     '/99 Images/vial-closeup.webp',
                     '/99 Images/vial-ice-closeup.webp',
                   ],
                   ...[
                     '/99 Images/category-1.webp',
                     '/99 Images/category-2.webp',
                     '/99 Images/category-3.webp',
                     '/99 Images/purity.webp',
                     '/99 Images/identity.webp',
                     '/99 Images/vial-closeup.webp',
                     '/99 Images/vial-ice-closeup.webp',
                   ]
                 ].map((src, idx) => {
                   const angle = idx * (360 / 28);
                   return (
                      <div 
                        key={idx} 
                        className="absolute top-1/2 left-1/2 -ml-[90px] -mt-[110px] md:-ml-[110px] md:-mt-[140px] lg:-ml-[140px] lg:-mt-[160px] w-[180px] h-[220px] md:w-[220px] md:h-[280px] lg:w-[280px] lg:h-[320px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm group/image bg-black/5"
                        style={{
                         transform: `rotateY(${angle}deg) translateZ(var(--cyl-radius))`,
                         backfaceVisibility: 'hidden'
                       }}
                     >
                       <img src={src} alt="Gallery showcase" className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110" />
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none" />
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* Bottom Button */}
            {/* Bottom Button */}
            <div className="relative z-20 flex justify-center mt-8 md:mt-12">
               <Link 
                 href="/shop" 
                 className="w-full sm:w-auto h-12 md:h-14 bg-[#121212] text-white px-8 xl:px-10 rounded-[16px] font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shrink-0 shadow-md group"
               >
                 <span className="whitespace-nowrap uppercase tracking-wide text-sm">{t('exploreCatalogue')}</span>
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full mx-auto px-4 md:px-8 lg:px-12 pb-6 max-w-[1920px] pt-8 md:pt-16 relative z-20">
        
        {/* Unified Light Card */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 w-full shadow-xl relative overflow-hidden">
          
          {/* Precise 12-Column Grid Layout matching reference proportions */}
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-y-16 lg:gap-y-20 gap-x-8 w-full mb-12 lg:mb-16">
            
            {/* --- ROW 1 --- */}
            
            {/* Logo & Tagline */}
            <div className="flex flex-col gap-5 md:col-span-6 lg:col-span-5">
              <a href="/">
                <img src="/HelixBio Images/hb-logo.png" alt="99Purity Peptides" className="h-14 md:h-20 lg:h-24 w-auto object-contain" />
              </a>
              <p className="text-black/50 text-base md:text-[17px] font-medium leading-relaxed mt-2 max-w-[400px]">
                Setting the gold standard in peptide synthesis with verified HPLC/MS testing for uncompromised results.
              </p>
            </div>
            
            {/* Link Col 1 */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              <h4 className="text-black/30 text-[13px] font-bold uppercase tracking-widest mb-2 lg:hidden">Menu</h4>
              {[
                { label: t('navHome'), href: '/' },
                { label: t('navShop'), href: '/shop' },
                { label: t('navAbout'), href: '/about-us' },
                { label: t('navBlog'), href: '/blog' },
                { label: t('navFaq'), href: '/faq' },
              ].map(link => (
                <Link key={link.label} href={link.href} className="text-black/60 hover:text-black text-base font-medium transition-colors tracking-wide w-fit">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Link Col 2 */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              <h4 className="text-black/30 text-[13px] font-bold uppercase tracking-widest mb-2 lg:hidden">Social & More</h4>
              {[
                { label: t('navCalculator'), href: '/peptide-calculator' },
                { label: t('navAffiliates'), href: '/affiliates' },
                { label: 'X (Twitter)', href: 'https://x.com/99puritypeptide' },
              ].map(link => (
                 <Link key={link.label} href={link.href} target={link.href.startsWith('http') ? "_blank" : undefined} className="text-black/60 hover:text-black text-base font-medium transition-colors tracking-wide w-fit">
                   {link.label}
                 </Link>
              ))}
            </div>

            {/* Link Col 3 */}
            <div className="flex flex-col gap-5 lg:col-span-3">
              <h4 className="text-black/30 text-[13px] font-bold uppercase tracking-widest mb-2 lg:hidden">Legal</h4>
              {[
                { label: t('termsOfService'), href: '/terms-and-conditions' },
                { label: t('privacyPolicy'), href: '/privacy-policy' },
                { label: t('refundPolicy'), href: '/refund-policy' },
                { label: t('shippingPolicy'), href: '/shipping-policy' },
                { label: t('medicalDisclaimer'), href: '/medical-disclaimer' },
              ].map(link => (
                <Link key={link.label} href={link.href} className="text-black/50 hover:text-black text-base font-medium transition-colors tracking-wide w-fit">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* --- ROW 2 --- */}

            {/* Newsletter (Moved to Left) */}
            <div className="flex items-end order-1 mt-6 lg:mt-0 md:col-span-6 lg:col-span-5">
              <div className="w-full max-w-[420px] flex flex-col items-start text-left">
                <h3 className="text-black text-4xl md:text-[40px] font-medium mb-1 tracking-tight">99Purity Peptides</h3>
                <p className="text-black/50 text-2xl md:text-3xl font-light mb-8 tracking-wide">in your mailbox</p>
                
                <form onSubmit={handleNewsletterSubmit} className="w-full relative group">
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full bg-black/5 text-black placeholder:text-black/40 rounded-[20px] px-7 py-5 outline-none text-base disabled:opacity-80 font-medium shadow-inner transition-all focus:ring-4 focus:ring-black/5"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-black hover:bg-black/80 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                       <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>
                </form>
                {message && (
                  <p className={`text-sm font-medium mt-4 px-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Back to top (Moved to Center) */}
            <div className="flex items-end order-3 lg:order-2 mt-8 lg:mt-0 md:col-span-6 lg:col-span-4 lg:justify-start">
              <button 
                onClick={handleScrollToTop}
                className="group flex items-center gap-8 bg-black/5 hover:bg-black/10 text-black pl-8 pr-2.5 py-2.5 rounded-[20px] transition-colors w-fit border border-black/5 hover:border-black/10"
              >
                <span className="text-base font-medium tracking-wide">Back to top</span>
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center group-hover:-translate-y-0.5 transition-transform shrink-0">
                  <ArrowRight className="w-5 h-5 -rotate-90" strokeWidth={2.5} />
                </div>
              </button>
            </div>
            
            {/* Contact & Copyright */}
            <div className="flex items-end order-2 lg:order-3 md:col-span-6 lg:col-span-3 lg:justify-start">
              <div className="flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-2">
                  <a href="mailto:support@99puritypeptides.com" className="text-black/90 font-medium hover:text-black transition-colors tracking-wide text-base md:text-[17px] w-fit">
                    support@99puritypeptides.com
                  </a>
                  <a href="tel:+18433307365" className="text-black/50 text-[15px] hover:text-black/70 transition-colors tracking-wide w-fit">
                    +1 (843) 330-7365
                  </a>
                </div>
                <div className="text-black/40 text-[13px] md:text-[14px] font-medium leading-relaxed tracking-wide mt-3">
                  99Purity Peptides<br/>
                  {new Date().getFullYear()} © All rights reserved
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Disclaimer & Footer Bottom */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-t border-black/5 pt-8 lg:pt-12 w-full mt-12 lg:mt-16">
             <p className="text-black/40 text-[10px] md:text-xs leading-relaxed max-w-4xl text-left">
               <span className="font-bold text-black/50 uppercase tracking-wider mr-2">{t('disclaimerLabel')}:</span>
               {t('disclaimerText')}
             </p>
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shrink-0">
                <LanguageSwitcher variant="light" />
                <span className="text-black/40 text-[11px] md:text-xs font-medium tracking-wide">{t('designedBy')} <a href="https://belkdigital.com" target="_blank" className="text-black/70 hover:text-black transition-colors font-semibold">Belk Digital</a></span>
             </div>
          </div>

        </div>

      </div>
    </footer>
  );
}

export function Footer() {
  const [footerHeight, setFooterHeight] = useState(0)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!footerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      setFooterHeight(entries[0].contentRect.height)
    })
    resizeObserver.observe(footerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={footerRef} className="w-full relative z-40 bg-black print:hidden" style={{ pointerEvents: 'auto' }}>
      <FooterContent />
    </div>
  )
}

