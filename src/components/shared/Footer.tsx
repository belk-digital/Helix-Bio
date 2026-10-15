'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Mail, Check } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { useTranslations } from 'next-intl'
import { FluidButton } from '@/components/ui/fluid-button'


const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61595200202970',
    ariaLabel: 'Helix Bio Chem on Facebook',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/helix-bio-chem-a1a9aa442/',
    ariaLabel: 'Helix Bio Chem on LinkedIn',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/helixbiochem',
    ariaLabel: 'Helix Bio Chem on X',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Reddit',
    href: 'https://www.reddit.com/user/HelixBioChem/',
    ariaLabel: 'Helix Bio Chem on Reddit',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
]

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
      setMessage('Subscribed!')
      // Reset form
      const form = e.target as HTMLFormElement
      form.reset()

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err.message || 'Error')

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
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
                Research-grade means documented purity, confirmed identity, and a batch-specific certificate to prove it. Every compound, every lot.
              </p>
            </div>

            {/* Scrolling Curved Marquee (3D Cylinder) */}
            <div 
              className="w-full h-[240px] md:h-[300px] lg:h-[340px] relative flex items-center justify-center cta-cylinder-container" 
              style={{ perspective: '3000px' }}
            >
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
               
               {/* Left/Right Fade Masks (Extended vertically to cover overflow) */}
               <div className="absolute left-0 -top-[100px] -bottom-[100px] w-16 md:w-32 lg:w-48 bg-gradient-to-r from-[#d9f0ff] via-[#d9f0ff]/80 to-transparent z-10 pointer-events-none" />
               <div className="absolute right-0 -top-[100px] -bottom-[100px] w-16 md:w-32 lg:w-48 bg-gradient-to-l from-[#d9f0ff] via-[#d9f0ff]/80 to-transparent z-10 pointer-events-none" />

               <div className="relative w-full h-full animate-cylinder flex items-center justify-center">
                 {[
                   ...[
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_23_31 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_41_24 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_44_49 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_46_36 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_50_41 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_21 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_53 AM.webp',
                   ],
                   ...[
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_23_31 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_41_24 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_44_49 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_46_36 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_50_41 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_21 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_53 AM.webp',
                   ],
                   ...[
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_23_31 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_41_24 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_44_49 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_46_36 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_50_41 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_21 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_53 AM.webp',
                   ],
                   ...[
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_23_31 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_41_24 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_44_49 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_46_36 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_50_41 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_21 AM.webp',
                     '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_53 AM.webp',
                   ]
                 ].map((src, idx) => {
                   const angle = idx * (360 / 28);
                   const galleryAlts = [
                     "Lyophilized research peptide vial with certificate of analysis on lab bench",
                     "HPLC testing equipment used to verify Helix Bio Chem peptide batch purity",
                     "Vacuum-sealed peptide vials packaged for cold-chain shipping",
                     "Mass spectrometry analytical documentation alongside a sealed research vial",
                     "High-purity lyophilized synthetic peptide in clear glass laboratory vial",
                     "ISO-certified USA laboratory environment for synthetic peptide research",
                     "Precision automated liquid chromatography system performing peptide purity analysis",
                     "Helix Bio Chem research peptide vials with batch-specific QR codes",
                     "Analytical spectrum report confirming synthetic peptide molecular weight",
                     "Reconstituted research compound prepared for in-vitro assay testing",
                     "Cryogenic cold-storage storage tray holding lyophilized peptide vials",
                     "HPLC chromatogram showing single peak 99% purity verification",
                     "Laboratory research technician preparing high-purity peptide reagent sample",
                     "Sealed research peptide vial with tamper-evident security seal",
                     "Mass spectrometer ion source chamber during peptide identity verification",
                     "Sterile laboratory hood for research peptide handling and aliquot preparation",
                     "Helix Bio Chem batch certificate of analysis documenting HPLC purity testing",
                     "Solid-phase peptide synthesis reaction vessel in US manufacturing facility",
                     "Calibrated precision micropipette dispensing research peptide reagent solution",
                     "Lyophilization vacuum chamber drying pure synthetic peptide sequence",
                     "Close-up of laboratory-grade glass vial containing research peptide powder",
                     "High-resolution mass spectrum confirming exact molecular weight of peptide",
                     "Cold-chain insulated shipping container for temperature-sensitive peptide delivery",
                     "Spectrophotometer assay plate for peptide concentration measurement",
                     "Helix Bio Chem catalog research vials aligned for quality control inspection",
                     "Microcentrifuge tube containing reconstituted peptide sample for analysis",
                     "Analytical balance measuring precise milligram mass of peptide material",
                     "Final quality assurance inspection of sealed Helix Bio Chem peptide batch"
                   ];
                   return (
                      <div 
                        key={idx} 
                        className="absolute top-1/2 left-1/2 -ml-[90px] -mt-[110px] md:-ml-[110px] md:-mt-[140px] lg:-ml-[140px] lg:-mt-[160px] w-[180px] h-[220px] md:w-[220px] md:h-[280px] lg:w-[280px] lg:h-[320px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm group/image bg-black/5"
                        style={{
                         transform: `rotateY(${angle}deg) translateZ(var(--cyl-radius))`,
                         backfaceVisibility: 'hidden'
                       }}
                     >
                       <img src={src} alt={galleryAlts[idx]} className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110" />
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none" />
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* Bottom Button */}
            <div className="relative z-20 flex justify-center mt-4 md:mt-6">
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
          
          {/* Main Layout Area */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 w-full mb-12 lg:mb-16">
            
            {/* LEFT SIDE (Logo, Tagline, Newsletter) */}
            <div className="flex flex-col gap-10 lg:w-5/12">
              {/* Logo & Tagline */}
              <div className="flex flex-col gap-5">
                <a href="/">
                  <img src="/HelixBio Images/hb-logo.webp" alt="HelixBio" width={400} height={100} className="h-14 md:h-20 lg:h-24 w-auto object-contain" />
                </a>
                <p className="text-black/60 text-base md:text-[17px] font-medium leading-relaxed max-w-[400px]">
                  Setting the gold standard in peptide synthesis with verified HPLC/MS testing for uncompromised results.
                </p>
              </div>

              {/* Newsletter */}
              <div className="w-full max-w-[420px] flex flex-col items-start text-left mt-2 lg:mt-auto">
                <h3 className="text-black text-3xl md:text-[40px] font-medium mb-1 tracking-tight">HelixBio</h3>
                <p className="text-black/60 text-xl md:text-3xl font-light mb-6 tracking-wide">in your mailbox</p>
                
                <form onSubmit={handleNewsletterSubmit} className="w-full relative group">
                  <input
                    type="email"
                    name="email"
                    placeholder={message || "name@example.com"}
                    required
                    disabled={status === 'loading' || status === 'success'}
                    className={`w-full rounded-[20px] px-7 py-4 md:py-5 outline-none text-base disabled:opacity-80 font-medium shadow-inner transition-all focus:ring-4 focus:ring-black/5 ${
                      status === 'success' ? 'text-green-600 placeholder:text-green-600 bg-green-50' : 
                      status === 'error' ? 'text-red-600 placeholder:text-red-600 bg-red-50' : 
                      'bg-black/5 text-black placeholder:text-black/60'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    aria-label="Subscribe to newsletter"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black hover:bg-black/80 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                       <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : status === 'success' ? (
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                    ) : (
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* RIGHT SIDE (Links, Contact, Back to top) */}
            <div className="flex flex-col gap-12 lg:gap-16 lg:w-7/12 lg:pl-8 xl:pl-16 pt-4 lg:pt-0">
              
              {/* Links Grid */}
              <div className="flex flex-wrap sm:flex-nowrap justify-between gap-8 w-full">
                {/* Link Col 1 */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-black/60 text-[12px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Menu</h4>
                  {[
                    { label: t('navHome'), href: '/' },
                    { label: t('navShop'), href: '/shop' },
                    { label: t('navAbout'), href: '/about-us' },
                    { label: t('navAffiliates'), href: '/affiliates' },
                    { label: 'Account', href: '/account' },
                  ].map(link => (
                    <Link key={link.label} href={link.href} className="text-black/60 hover:text-black text-sm md:text-base font-medium transition-colors tracking-wide w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Link Col 2 */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-black/60 text-[12px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Resources</h4>
                  {[
                    { label: t('navCalculator'), href: '/peptide-calculator' },
                    { label: t('navFaq'), href: '/faq' },
                    { label: t('navBlog'), href: '/blog' },
                  ].map(link => (
                     <Link key={link.label} href={link.href} className="text-black/60 hover:text-black text-sm md:text-base font-medium transition-colors tracking-wide w-fit">
                       {link.label}
                     </Link>
                  ))}
                </div>

                {/* Link Col 3 */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-black/60 text-[12px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Contact</h4>
                  <Link href="/contact-us" className="text-black/60 hover:text-black text-sm md:text-base font-medium transition-colors tracking-wide w-fit">
                    Contact Us
                  </Link>
                  <a href="mailto:support@helixbiochem.com" className="text-black/60 hover:text-black text-sm md:text-base font-medium transition-colors tracking-wide break-words">
                    support@helixbiochem.com
                  </a>
                </div>

                {/* Link Col 4 */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-black/60 text-[12px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Legal</h4>
                  {[
                    { label: t('termsOfService'), href: '/terms-and-conditions' },
                    { label: t('privacyPolicy'), href: '/privacy-policy' },
                    { label: t('refundPolicy'), href: '/refund-policy' },
                    { label: t('shippingPolicy'), href: '/shipping-policy' },
                    { label: t('medicalDisclaimer'), href: '/medical-disclaimer' },
                  ].map(link => (
                    <Link key={link.label} href={link.href} className="text-black/60 hover:text-black text-sm md:text-base font-medium transition-colors tracking-wide w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Right (Contact & Back to top) */}
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 lg:mt-auto pt-8 border-t border-black/5 lg:border-none lg:pt-0 items-start sm:items-end justify-between">
                
                {/* Copyright & Social Links */}
                <div className="flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2.5">
                    {SOCIAL_LINKS.map(link => (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener"
                        aria-label={link.ariaLabel}
                        className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/10 text-black/60 hover:text-black flex items-center justify-center transition-all duration-200 border border-black/5 hover:border-black/10 hover:-translate-y-0.5"
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                  <div className="text-black/60 text-[12px] font-medium leading-relaxed tracking-wide">
                    HelixBio - {new Date().getFullYear()} © All rights reserved
                  </div>
                </div>

                {/* Back to top */}
                <button 
                  onClick={handleScrollToTop}
                  className="group flex items-center gap-6 bg-black/5 hover:bg-black/10 text-black pl-6 pr-2 py-2 rounded-[16px] transition-colors w-fit border border-black/5 hover:border-black/10"
                >
                  <span className="text-sm font-medium tracking-wide">Back to top</span>
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center group-hover:-translate-y-0.5 transition-transform shrink-0">
                    <ArrowRight className="w-4 h-4 -rotate-90" strokeWidth={2.5} />
                  </div>
                </button>
                
              </div>

            </div>
          </div>
          
          {/* Disclaimer & Footer Bottom */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-t border-black/5 pt-8 lg:pt-12 w-full mt-12 lg:mt-16">
             <p className="text-black/60 text-[10px] md:text-xs leading-relaxed max-w-4xl text-left">
               <span className="font-bold text-black/70 uppercase tracking-wider mr-2">{t('disclaimerLabel')}:</span>
               {t('disclaimerText')}
             </p>
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shrink-0">

                <span className="text-black/60 text-[11px] md:text-xs font-medium tracking-wide">{t('designedBy')} <a href="https://belkdigital.com" target="_blank" rel="noopener" className="text-black/70 hover:text-black transition-colors font-semibold">Belk Digital</a></span>
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
    <div id="global-footer" ref={footerRef} className="w-full relative z-40 bg-black print:hidden" style={{ pointerEvents: 'auto' }}>
      <FooterContent />
    </div>
  )
}

