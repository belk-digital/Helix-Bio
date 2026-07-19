'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { ShoppingBag, Menu, Search, X, User, Copy, Timer } from 'lucide-react'
import { MobileMenu } from './MobileMenu'
import { useCartStore } from '@/lib/cart/store'
import { useUiStore } from '@/lib/ui/store'
import { useWishlistStore } from '@/lib/wishlist/store'
import dynamic from 'next/dynamic'
import { SearchOverlay } from './SearchOverlay'
import { BLOG_POSTS } from '@/data/blog-posts'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { getCategoryDisplayName } from '@/lib/categoryDisplay'

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer').then(mod => mod.CartDrawer), { ssr: false })

const ANNOUNCEMENTS = [
  {
    key: "puritySale",
    couponCode: "PURITY20",
    expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours
  },
  {
    key: "freeShipping",
    couponCode: null,
    expiresAt: null
  },
  {
    key: "newCustomerDiscount",
    couponCode: null,
    expiresAt: null
  },
  {
    key: "kitsDiscount",
    couponCode: null,
    expiresAt: null
  }
]

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime()
      if (difference > 0) {
        return {
          h: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
          m: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
          s: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
        }
      }
      return { h: '00', m: '00', s: '00' }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  return (
    <div className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider">
      <div className="flex flex-col items-center gap-[2px]">
        <div className="flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white w-6 h-6 rounded shadow-sm">
          {timeLeft.h}
        </div>
        <span className="text-[6px] text-white/90 font-sans tracking-widest uppercase">HRS</span>
      </div>
      
      <span className="text-white/50 text-[10px] animate-pulse -mt-3">:</span>
      
      <div className="flex flex-col items-center gap-[2px]">
        <div className="flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white w-6 h-6 rounded shadow-sm">
          {timeLeft.m}
        </div>
        <span className="text-[6px] text-white/90 font-sans tracking-widest uppercase">MIN</span>
      </div>
      
      <span className="text-white/50 text-[10px] animate-pulse -mt-3">:</span>

      <div className="flex flex-col items-center gap-[2px]">
        <div className="flex items-center justify-center bg-white/30 backdrop-blur-md border border-white/50 text-white w-6 h-6 rounded shadow-sm font-black">
          {timeLeft.s}
        </div>
        <span className="text-[6px] text-white/90 font-sans tracking-widest uppercase">SEC</span>
      </div>
    </div>
  )
}

function CouponBox({ code }: { code: string }) {
  const t = useTranslations('header')

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    toast.success(t('couponCopiedTitle'), {
      description: t('couponCopiedDescription', { code }),
    })
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 border border-dashed border-white/60 hover:border-white bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-md text-[10px] font-bold tracking-widest text-white shadow-sm"
      title={t('clickToCopy')}
    >
      {code}
      <Copy size={12} />
    </motion.button>
  )
}

export function ClientHeader({ cartItemCount = 0, wishlistItemCount = 0, isLoggedIn = false, categories: initialCategories = [], initialWishlistItems = [], initialCartItems = [] }: any) {
  const t = useTranslations('header')
  const cartStore = useCartStore()
  const setCartItems = useCartStore((state) => state.setItems)
  const setWishlistItems = useWishlistStore((state) => state.setItems)
  const activeCartCount = cartStore.items.reduce((acc: any, i: any) => acc + i.quantity, 0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const setUiMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen)

  // Mirrors local open state into the shared UI store so sections elsewhere on the page
  // (e.g. the Hero's autoplaying video) can react to the mobile menu opening/closing.
  useEffect(() => {
    setUiMobileMenuOpen(mobileMenuOpen)
  }, [mobileMenuOpen, setUiMobileMenuOpen])
  const [hidden, setHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [showMobileTimer, setShowMobileTimer] = useState(false)
  const [announcementClosed, setAnnouncementClosed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const [categoriesData, setCategoriesData] = useState<any[]>(initialCategories)
  const [isLoadingMenu, setIsLoadingMenu] = useState(initialCategories.length === 0)
  
  const menuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMenuEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setIsMegaMenuOpen(true)
  }

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false)
    }, 150)
  }

  useEffect(() => {
    if (initialCategories.length === 0) {
      import('@/app/[locale]/(frontend)/actions/megaMenu').then(module => {
        module.getMegaMenuData().then(data => {
          setCategoriesData(data)
          setIsLoadingMenu(false)
        })
      })
    }
  }, [initialCategories])

  const cartHydrated = useRef(false)
  const wishlistHydrated = useRef(false)

  // Sync Cart with Backend
  useEffect(() => {
    if (isLoggedIn && !cartHydrated.current) {
      const localItems = cartStore.items
      if (initialCartItems.length > 0) {
        setCartItems(initialCartItems)
      } else if (localItems.length > 0) {
        import('@/app/[locale]/(frontend)/actions/cart').then(m => m.syncCartToPayload(localItems))
      }
      cartHydrated.current = true
    }
  }, [isLoggedIn, initialCartItems])

  // Sync Wishlist with Backend
  useEffect(() => {
    if (isLoggedIn && !wishlistHydrated.current) {
      const localItems = useWishlistStore.getState().items
      if (initialWishlistItems.length > 0) {
        setWishlistItems(initialWishlistItems)
      } else if (localItems.length > 0) {
        import('@/app/[locale]/(frontend)/actions/wishlist').then(m => {
          localItems.forEach(item => m.toggleWishlistInPayload(item.id, true))
        })
      }
      wishlistHydrated.current = true
    }
  }, [isLoggedIn, initialWishlistItems])

  // Global Search Shortcut & Custom Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    const handleOpenSearch = () => setIsSearchOpen(true)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-search-modal', handleOpenSearch)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-search-modal', handleOpenSearch)
    }
  }, [])

  const pathname = usePathname()
  const isBlogPost = BLOG_POSTS.some(post => pathname === `/${post.slug}`)
  const isTransparentHeader = pathname === '/' || pathname === '/en' || pathname === '/shop' || pathname === '/about-us' || pathname === '/faq' || pathname === '/contact-us' || pathname === '/affiliates' || pathname === '/blog' || isBlogPost

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Reset announcement state on route change
    setAnnouncementClosed(false)
    document.body.classList.remove('announcement-closed')
    
    let tick = 0;
    const timer = setInterval(() => {
      tick++;
      if (tick % 2 !== 0) {
        setShowMobileTimer(true)
      } else {
        setShowMobileTimer(false)
        setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
      }
    }, 4000)
    
    return () => clearInterval(timer)
  }, [pathname])

  const closeAnnouncement = () => {
    setAnnouncementClosed(true)
    document.body.classList.add('announcement-closed')
  }
  
  const { scrollY } = useScroll()
  const lastYRef = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setIsScrolled(y > 20)
    const difference = y - lastYRef.current
    
    // Lower threshold so it reacts instantly to a single scroll wheel tick
    if (Math.abs(difference) > 5) {
      // Hide immediately when scrolling down, as long as we aren't at the very top
      if (difference > 0 && y > 60) {
        setHidden(true)
      } 
      // Show immediately when scrolling up
      else if (difference < 0) {
        setHidden(false)
      }
      lastYRef.current = y
    }
  })

  // Force light theme text/icons for the new white layout
  const textColor = 'text-black'
  const textHoverColor = 'hover:text-primary transition-colors'
  const iconColor = '#000000'
  const buttonBorder = 'border-black/20 hover:bg-black/10'

  const headerContent = (
    <div className={`flex items-center justify-between transition-all duration-300 px-6 md:px-12 w-full text-black py-4 md:py-5`}>
      {/* Left: Logo */}
      <div className="flex-1 xl:flex-none flex justify-start">
        <a 
          href="/" 
          className="flex items-center hover:opacity-80 transition-opacity gap-2"
        >
          <img src="/HelixBio Images/hb-logo.png" alt="HelixBio" className="h-10 sm:h-12 w-auto object-contain" />
        </a>
      </div>

      {/* Center: Nav */}
      <nav className="hidden xl:flex items-center justify-center gap-2 xl:gap-3 min-[1650px]:gap-6 flex-1 h-full min-w-0">
        {(() => {
          const getNavLinkClass = (path: string) => {
            const targetPath = path.replace('/en', '');
            const isActive = targetPath === '' ? pathname === '/en' || pathname === '/' : pathname.includes(targetPath);
            return `relative text-[9px] xl:text-[10px] min-[1650px]:text-[11px] font-heading tracking-[0.05em] min-[1650px]:tracking-[0.1em] uppercase transition-all duration-300 h-full flex items-center py-2 whitespace-nowrap ${
              isActive 
                ? `font-bold text-primary opacity-100 after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[2px] after:bg-primary after:rounded-full` 
                : `font-semibold ${textColor} opacity-60 hover:opacity-100 hover:text-black hover:after:w-full after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-black/20 after:transition-all after:duration-300 after:rounded-full`
            }`;
          };

          return (
            <>
              <Link href="/shop" className={getNavLinkClass('/shop')}>
                {t('navShop')}
              </Link>

              <div
                className="h-full flex items-center cursor-pointer"
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
                <Link href="/shop" onClick={() => setIsMegaMenuOpen(false)} className={`group relative flex items-center gap-1.5 text-[9px] xl:text-[10px] min-[1650px]:text-[11px] font-heading tracking-[0.05em] min-[1650px]:tracking-[0.1em] uppercase transition-all duration-300 h-full py-2 font-semibold whitespace-nowrap ${textColor} opacity-60 hover:opacity-100 hover:text-black hover:after:w-full after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-black/20 after:transition-all after:duration-300 after:rounded-full`}>
                  {t('navCategories')}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-transform duration-300 group-hover:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
                </Link>
              </div>

              <Link href="/peptide-calculator" className={getNavLinkClass('/peptide-calculator')}>
                {t('navCalculator')}
              </Link>
              <Link href="/about-us" className={getNavLinkClass('/about-us')}>
                {t('navAbout')}
              </Link>
              <Link href="/blog" className={getNavLinkClass('/blog')}>
                {t('navBlog')}
              </Link>
              <Link href="/faq" className={getNavLinkClass('/faq')}>
                {t('navFaq')}
              </Link>
              <Link href="/contact-us" className={getNavLinkClass('/contact-us')}>
                {t('navContact')}
              </Link>
              <Link href="/affiliates" className={getNavLinkClass('/affiliates')}>
                {t('navAffiliates')}
              </Link>
            </>
          )
        })()}
      </nav>

      {/* Right: Search, SHOP NOW Button & Cart */}
      <div className="flex items-center justify-end gap-1 sm:gap-2 xl:gap-3 flex-none shrink-0 text-sm relative z-20">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className={`p-2 rounded-full transition-all duration-300 relative flex items-center justify-center ${textColor} hover:bg-black/5 hover:scale-105`}
          aria-label={t('openSearch')}
        >
          <Search size={18} strokeWidth={2} />
        </button>

        <button onClick={cartStore.openCart} className={`p-2 rounded-full transition-all duration-300 relative flex items-center justify-center ${textColor} hover:bg-black/5 hover:scale-105`} aria-label={t('openCart')}>
          <ShoppingBag size={18} strokeWidth={2} />
          <AnimatePresence>
            {activeCartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`absolute top-0 right-0 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full bg-[#121212] text-white shadow-sm`}
              >
                {activeCartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        
        <LanguageSwitcher className={`${textColor} hidden sm:flex px-2 hover:bg-black/5 rounded-full transition-colors`} />

        <div className="flex items-center justify-center ml-1">
          {mounted ? (
            isLoggedIn ? (
              <Link href="/account" className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${textColor} hover:bg-black/5 hover:scale-105`} title="Account">
                <User size={18} strokeWidth={2} />
              </Link>
            ) : (
              <>
                <Link href="/login" className={`sm:hidden p-2 rounded-full transition-all duration-300 flex items-center justify-center ${textColor} hover:bg-black/5 hover:scale-105`} title="Login">
                  <User size={18} strokeWidth={2} />
                </Link>
                <Link href="/login" className={`hidden sm:flex transition-all duration-300 items-center justify-center text-black hover:text-black/70 px-4 py-2 text-[9px] xl:text-[10px] min-[1650px]:text-[11px] font-heading font-bold uppercase tracking-widest whitespace-nowrap`}>
                  Login
                </Link>
              </>
            )
          ) : null}
        </div>
        <Link href="/shop" className={`hidden md:inline-flex bg-[#121212] hover:bg-black text-white rounded-[10px] px-6 py-3 min-[1650px]:px-8 min-[1650px]:py-4 text-[11px] xl:text-[12px] min-[1650px]:text-[13px] font-heading font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ml-2`}>
          {t('shopNow')}
        </Link>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileMenuOpen(true)} className={`xl:hidden p-1 -mr-1 transition-colors ${textColor} hover:text-primary`} aria-label={t('openMenu')}>
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )

  return (
    <>
      {!pathname.includes('/account') && (
        <>
          <div className="fixed top-0 inset-x-0 z-sticky flex flex-col pointer-events-none print:hidden">
        
        <motion.div
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: { y: -100, opacity: 0 }
          }}
          initial="hidden"
          animate={hidden ? "hidden" : "visible"}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full flex flex-col"
        >
          {/* Announcement Bar */}
          <AnimatePresence>
            {!announcementClosed && (
              <motion.div 
                initial={{ height: 44, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full bg-black text-white flex items-center justify-center pointer-events-auto overflow-hidden relative z-50"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={announcementIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute w-full px-4 md:px-12 h-full flex items-center justify-center"
                  >
                    {/* Desktop & Tablet Layout */}
                    <div className="hidden sm:flex flex-row items-center justify-center gap-4 lg:gap-6 w-full">
                      <span className="text-[10px] lg:text-[11px] font-heading font-extrabold tracking-[0.2em] uppercase text-center shrink-0 mt-[2px] drop-shadow-sm">
                        {t(`announcements.${ANNOUNCEMENTS[announcementIndex].key}`)}
                      </span>
                      {ANNOUNCEMENTS[announcementIndex].couponCode && ANNOUNCEMENTS[announcementIndex].expiresAt && (
                        <div className="flex items-center gap-3 shrink-0">
                          <CountdownTimer expiresAt={ANNOUNCEMENTS[announcementIndex].expiresAt} />
                          <CouponBox code={ANNOUNCEMENTS[announcementIndex].couponCode} />
                        </div>
                      )}
                    </div>

                    {/* Mobile Layout */}
                    <div className="flex sm:hidden flex-row items-center justify-center w-full h-full relative">
                      <AnimatePresence mode="wait">
                        {(!ANNOUNCEMENTS[announcementIndex].couponCode || !showMobileTimer) ? (
                          <motion.span
                            key={`text-${announcementIndex}`}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[9px] font-heading font-extrabold tracking-[0.1em] uppercase text-center mt-[1px] absolute w-full px-6 leading-snug drop-shadow-sm"
                          >
                            {t(`announcements.${ANNOUNCEMENTS[announcementIndex].key}`)}
                          </motion.span>
                        ) : (
                          <motion.div
                            key={`timer-${announcementIndex}`}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center gap-2 scale-90 absolute w-full"
                          >
                            <CountdownTimer expiresAt={ANNOUNCEMENTS[announcementIndex].expiresAt} />
                            <CouponBox code={ANNOUNCEMENTS[announcementIndex].couponCode} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <button 
                  onClick={closeAnnouncement}
                  className="absolute right-2 md:right-4 text-white/80 hover:text-white transition-colors z-50 p-2 md:p-0 bg-black/10 hover:bg-black/20 rounded-full md:bg-transparent md:hover:bg-transparent"
                  aria-label={t('closeAnnouncement')}
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`w-full relative pointer-events-auto bg-white transition-all duration-500 z-50 ${isScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : ''}`}>
            <div className="w-full mx-auto">
              {headerContent}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Render the Mega Menu OUTSIDE the motion.div wrapper so backdrop-filter is NOT broken by the stacking context! */}
      <div 
        className="hidden lg:block fixed inset-x-0 z-[45] transition-transform duration-300 ease-out"
        style={{ 
          position: isScrolled || (announcementClosed && !isScrolled) ? 'fixed' : 'absolute',
          top: announcementClosed ? '53px' : '97px',
          transform: hidden ? 'translateY(-100px)' : 'translateY(0)'
        }}
      >
        {/* Background Blur Overlay for Mega Menu */}
        <div 
          className={`fixed inset-0 bg-black/10 transition-opacity duration-300 ${isMegaMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onMouseEnter={handleMenuLeave}
        />

        {/* Full-Width Mega Menu Dropdown */}
        <div 
          className={`absolute left-0 right-0 w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] mx-auto z-50 transition-all duration-300 ${isTransparentHeader && !isScrolled ? 'top-14 md:top-16' : 'top-10 md:top-12'} ${isMegaMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div 
            className={`w-full max-h-[80vh] overflow-y-auto no-scrollbar rounded-[32px] md:rounded-[40px] bg-black/60 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-300 ${isMegaMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
          >
          {/* Noise Texture Overlay */}
          <div 
            className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
          />

          <div className="w-full flex flex-col md:flex-row relative z-10 text-white min-h-[350px] xl:min-h-[450px]">
            {/* Left side: Massive typography list (40%) */}
            <div className="w-full md:w-2/5 flex flex-col justify-center py-6 px-8 xl:px-16 border-r border-white/5 relative z-20">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-3 xl:mb-4">{t('megaMenu.navigation')}</span>
              <div className="flex flex-col gap-0.5 xl:gap-1">
                {isLoadingMenu ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 w-3/4 bg-white/5 rounded-md animate-pulse" />
                  ))
                ) : categoriesData.map((cat: any, index: number) => {
                  const isActive = activeCategory === cat.id || (activeCategory === null && index === 0);
                  return (
                    <Link
                      key={cat.id || index}
                      href={`/shop?category=${encodeURIComponent(cat.name)}#products-grid`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      onMouseEnter={() => setActiveCategory(cat.id)}
                      className={`group relative w-full block transition-all duration-500 py-0.5 cursor-pointer ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                    >
                      <h3 className={`text-xs lg:text-sm xl:text-base 2xl:text-lg font-light tracking-tight transition-all duration-500 ${isActive ? 'text-primary translate-x-4' : 'text-white'}`}>
                        {getCategoryDisplayName(cat.name)}
                      </h3>
                      {/* Animated indicator dot */}
                      <span className={`absolute left-[-20px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side: Multiple products grid (60%) */}
            <div className="w-full md:w-3/5 relative bg-black/20 rounded-r-[32px] md:rounded-r-[40px]">
              {isLoadingMenu ? (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              ) : categoriesData.map((cat: any, index: number) => {
                const isActive = activeCategory === cat.id || (activeCategory === null && index === 0);
                return (
                  <div 
                    key={cat.id || index}
                    className={`${isActive ? 'relative opacity-100 scale-100 z-10' : 'absolute inset-0 opacity-0 scale-110 pointer-events-none z-0'} w-full flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] px-8 pt-6 pb-12 xl:px-12 xl:pt-8 xl:pb-20`}
                  >
                    {/* Header for Right Side */}
                    <div className="w-full flex justify-between items-end mb-4 xl:mb-6 relative z-20">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1">{t('megaMenu.featuredFormulations')}</span>
                        <h4 className="text-xl xl:text-2xl font-light text-white">{getCategoryDisplayName(cat.name)}</h4>
                      </div>
                      <Link
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="inline-flex items-center gap-2 px-5 py-2 xl:px-6 xl:py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md"
                      >
                        {t('megaMenu.exploreCategory')} &rarr;
                      </Link>
                    </div>

                    {cat.products && cat.products.length > 0 ? (
                      <div className="w-full flex-1 relative flex items-center justify-center group/showcase">
                        {/* Dramatic Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full bg-primary/10 opacity-0 group-hover/showcase:opacity-100 blur-[80px] xl:blur-[120px] transition-all duration-1000 pointer-events-none" />
                        
                        {/* Staggered Grid of 3 ProductCards - Rebuilt exclusively for the Mega Menu to ensure 100% text readability without any scaling hacks */}
                        <div className="w-full relative z-10 flex items-start justify-center mt-2 xl:mt-4">
                          <div className="w-full grid grid-cols-3 gap-3 xl:gap-5 px-0 lg:px-4 xl:px-8">
                            {cat.products.slice(0, 3).map((prod: any, pIndex: number) => (
                              <Link 
                                href={`/product/${prod.slug}`}
                                key={prod.id || pIndex} 
                                onClick={() => setIsMegaMenuOpen(false)}
                                className={`group flex flex-col justify-between w-full bg-white rounded-[16px] xl:rounded-[24px] p-2.5 xl:p-3 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-ink/5 relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${pIndex === 1 ? 'translate-y-4 xl:translate-y-8' : ''}`}
                              >
                                {/* Top Text Content */}
                                <div className="flex flex-col gap-1.5 xl:gap-2 mb-3 relative z-20">
                                  <div className="pr-4">
                                    <h3 className="text-xs xl:text-sm font-semibold text-ink tracking-tight line-clamp-1">{prod.name}</h3>
                                    <p className="text-primary text-[8px] xl:text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5">{prod.category || t('megaMenu.researchPeptideFallback')}</p>
                                  </div>
                                  <p className="text-ink/60 text-[9px] xl:text-[10px] leading-tight line-clamp-2">{prod.shortDescription || t('megaMenu.productDescriptionFallback')}</p>
                                </div>
                                
                                {/* Inner Image Container */}
                                <div className="relative w-full aspect-[4/5] xl:aspect-square rounded-[10px] xl:rounded-[16px] overflow-hidden bg-ink/5 mt-auto">
                                  <Image src={prod.image} alt={prod.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                                  
                                  <div className="absolute bottom-2 left-2 xl:bottom-3 xl:left-3 z-20 flex flex-col">
                                    <span className="text-white/80 text-[7px] xl:text-[8px] font-bold tracking-[0.1em] uppercase mb-0.5">{t('megaMenu.from')}</span>
                                    <span className="text-white text-xs xl:text-sm font-light tracking-tight">
                                      {prod.priceRange ? (typeof prod.priceRange === 'string' ? prod.priceRange.replace('From ', '') : prod.priceRange) : `$${prod.price}`}
                                    </span>
                                  </div>
                                  
                                  <div className="absolute bottom-2 right-2 xl:bottom-3 xl:right-3 w-6 h-6 xl:w-8 xl:h-8 bg-white text-ink rounded-full flex items-center justify-center shadow-lg transition-colors group-hover:bg-ink group-hover:text-white">
                                    <ShoppingBag className="w-3 h-3 xl:w-4 xl:h-4 text-current" />
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-50 flex-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{t('megaMenu.newArrivalsPending')}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          </div>
        </div>
      </div>
        </>
      )}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        onSearchClick={() => setIsSearchOpen(true)}
        categories={categoriesData}
      />
      <CartDrawer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} categories={categoriesData} />
    </>
  )
}
