'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useCartStore } from '@/lib/cart/store'
import { toast } from 'sonner'
import { Product } from '@/components/shop/PrimaryProductCard' // Re-using the interface for now

export interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const addItem = useWishlistStore(state => state.addItem)
  const removeItem = useWishlistStore(state => state.removeItem)
  const isWishlistedGlobal = useWishlistStore(state => product.id ? state.hasItem(product.id) : false)
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'
  const cartStore = useCartStore()
  
  const [inWishlist, setInWishlist] = useState(isWishlistedGlobal)
  const [showParticles, setShowParticles] = useState(false)
  const [isPending, setIsPending] = useState(false)

  React.useEffect(() => {
    setInWishlist(isWishlistedGlobal)
  }, [isWishlistedGlobal])

  const handleWishlistClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isSignedIn) {
      toast.error('Sign in required', { description: 'Please log in to add items to your wishlist.' })
      return
    }

    if (!product.id) {
      toast.error('Product ID missing', { description: 'Unable to add this product to wishlist.' })
      return
    }

    setIsPending(true)
    try {
      if (inWishlist) {
        await removeItem(product.id)
        toast('Removed from wishlist', { description: `${product.name} has been removed.` })
      } else {
        await addItem({
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          priceRange: product.priceRange || ''
        })
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1000)
        toast.success('Added to wishlist', { description: `${product.name} is now in your wishlist.` })
      }
    } catch (error: any) {
      toast.error('Failed to update wishlist', { description: error.message || 'An unexpected error occurred.' })
    } finally {
      setIsPending(false)
    }
  }

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Multi-variant products can't be added as a single "Default" line — send the shopper
    // to the PDP to pick a variant first, same as the rest of the shop.
    if (product.hasVariants) {
      router.push(`/product/${product.slug}`)
      return
    }

    const priceRaw = product.priceRange || (product as any).price || 0
    const priceVal = typeof priceRaw === 'string' ? parseFloat(priceRaw.replace(/[^0-9.]/g, '')) : Number(priceRaw)

    cartStore.addItem(
      { id: product.id || product.slug, name: product.name, imageUrl: product.image, slug: product.slug },
      'Default',
      1,
      priceVal || 0
    )
    toast.success('Added to cart', { action: { label: 'VIEW', onClick: cartStore.openCart } })
    cartStore.openCart()
  }

  return (
    <div className="w-full h-full bg-white/95 rounded-[24px] sm:rounded-[36px] p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white group cursor-pointer relative origin-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(14,165,233,0.1)] flex flex-col justify-between overflow-hidden">
      
      {/* Premium Blue Noise Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.055 0 0 0 0 0.647 0 0 0 0 0.914 0.21 0.72 0.07 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Subtle Inner Ring */}
      <div className="absolute inset-0 rounded-[24px] sm:rounded-[36px] ring-1 ring-inset ring-white pointer-events-none z-10" />
      
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-20" aria-label={`View ${product.name}`} />
      
      {/* Top Text Content & Wishlist */}
      <div className="px-3 sm:px-5 pt-3 sm:pt-5 pb-3 sm:pb-5 flex flex-col gap-1.5 sm:gap-3 relative z-30 pointer-events-none">
        <div className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5 pointer-events-auto z-30">
          <button
            disabled={isPending}
            onClick={handleWishlistClick}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`p-2 sm:p-2.5 transition-all duration-300 relative ${inWishlist ? 'text-red-500' : 'text-ink/30 hover:text-red-500 hover:scale-110'}`}
          >
            {isPending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={inWishlist ? 2.5 : 1.5} fill={inWishlist ? 'currentColor' : 'none'} />}
            {/* Particles */}
            <AnimatePresence>
              {showParticles && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-red-400 rounded-full"
                      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                        y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                        scale: [0, 1.5, 0],
                        opacity: [1, 1, 0]
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </button>
        </div>
        <div className="pr-6 sm:pr-8">
          <h3 className="text-sm sm:text-2xl font-semibold text-ink tracking-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="text-primary text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            {product.category || 'RESEARCH PEPTIDE'}
          </p>
        </div>
        <p className="text-ink/60 text-[9px] sm:text-[13px] leading-tight sm:leading-relaxed line-clamp-2 mt-1">
          {product.shortDescription || `Highly purified synthetic peptide prepared for rigorous laboratory research.`}
        </p>
      </div>

      {/* Inner Image Container */}
      <div className="relative w-full aspect-[4/5] rounded-[16px] sm:rounded-[24px] overflow-hidden bg-[#FAFAFA] pointer-events-none z-10 mt-auto shadow-inner">
        <Image 
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        {/* SALE Badge */}
        {(product.originalPrice || product.discountPercentage) && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              Sale
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-20 pointer-events-none">
          <div className="flex flex-col">
             <span className="text-white/80 text-[8px] sm:text-[10px] font-bold tracking-[0.15em] uppercase mb-0.5">
               From
             </span>
             <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                {product.originalPrice && (
                  <span className="text-[10px] sm:text-sm font-medium text-white/60 line-through">
                    {product.originalPrice}
                  </span>
                )}
                <span className="text-white text-base sm:text-xl lg:text-2xl font-light tracking-tighter">
                  {typeof product.priceRange === 'string' ? product.priceRange.replace('From ', '') : product.priceRange}
                </span>
                {product.discountPercentage && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black text-white text-[9px] sm:text-[10px] font-bold tracking-tight shadow-sm">
                    -{product.discountPercentage}%
                  </span>
                )}
             </div>
          </div>
        </div>

        {/* Action Button - Pointer Events Auto to intercept clicks */}
        <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md text-primary rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-hover:scale-110 z-30 hover:bg-primary hover:text-white group-hover:shadow-[0_8px_30px_rgba(14,165,233,0.3)] pointer-events-auto border border-white/50"
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-current transition-colors" />
        </button>
      </div>
    </div>
  )
}
