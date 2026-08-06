'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useCartStore } from '@/lib/cart/store'
import { toast } from 'sonner'
import { Product } from '@/components/shop/PrimaryProductCard' // Re-using the interface for now

export interface ProductCardProps {
  product: Product | any
}

export function ProductCard({ product }: ProductCardProps) {
  // Helpers to safely pull data
  const getImageUrl = (prod: any) => prod.imageUrl || prod.image || prod.images?.[0]?.image?.url || '/HelixBio Images/featured-research-2.webp';
  const getCategory = (prod: any) => prod.category || prod.categories?.[0]?.title || 'RESEARCH PEPTIDE';
  const getDescription = (prod: any) => prod.shortDescription || prod.meta?.description || 'Highly purified synthetic peptide prepared for rigorous laboratory research.';
  const getPrice = (prod: any) => prod.isFrom ? `From $${prod.price}` : (prod.priceRange ?? prod.price);

  const addWishlistItem = useWishlistStore(state => state.addItem)
  const removeWishlistItem = useWishlistStore(state => state.removeItem)
  const isWishlistedGlobal = useWishlistStore(state => product.id ? state.hasItem(product.id) : false)
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'
  const cartStore = useCartStore()
  const router = useRouter()

  const [inWishlist, setInWishlist] = useState(isWishlistedGlobal)
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
        await removeWishlistItem(product.id)
        setInWishlist(false)
        toast('Removed from wishlist', { description: `${product.name} has been removed.` })
      } else {
        await addWishlistItem({
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: getImageUrl(product),
          priceRange: String(getPrice(product) ?? ''),
        })
        setInWishlist(true)
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

    if (product.hasVariants) {
      router.push(`/product/${product.slug}`)
      return
    }

    const priceRaw = getPrice(product)
    const priceVal = typeof priceRaw === 'string' ? parseFloat(priceRaw.replace(/[^0-9.]/g, '')) : Number(priceRaw)

    cartStore.addItem(
      { id: product.id || product.slug, name: product.name, imageUrl: getImageUrl(product), slug: product.slug },
      'Default',
      1,
      priceVal || 0
    )
    toast.success('Added to cart', { action: { label: 'VIEW', onClick: cartStore.openCart } })
    cartStore.openCart()
  }

  return (
    <div className="w-full h-full bg-[#2a2a2a] rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 group cursor-pointer relative transition-all duration-500 hover:z-30 flex flex-col border border-white/10 hover:border-white/20">
      <Link draggable={false} href={`/product/${product.slug}`} className="absolute inset-0 z-20" aria-label={product.name} />

      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square rounded-[16px] sm:rounded-[24px] overflow-hidden bg-[#f0f0f0] shrink-0">
        <Image
          src={getImageUrl(product)}
          alt={`${product.name}`}
          fill
          draggable={false}
          className="object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110 pointer-events-none"
        />

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 pointer-events-auto">
          <button
            disabled={isPending}
            onClick={handleWishlistClick}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center transition-all duration-300 shadow-sm ${inWishlist ? 'text-red-500' : 'text-white hover:text-red-400 hover:scale-110'}`}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={inWishlist ? 'currentColor' : 'none'} />}
          </button>
        </div>
      </div>

      {/* Text Content */}
      <div className="pt-4 px-2 sm:px-3 pb-2 flex flex-col flex-1">
        <h3 className="text-sm sm:text-lg font-semibold text-white tracking-tight line-clamp-1 mb-0.5">
          {product.name}
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm font-medium mb-2 line-clamp-1">
          {getCategory(product)}
        </p>
        <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed line-clamp-2 mb-4">
          {getDescription(product)}
        </p>

        <div className="mt-auto flex items-center justify-between">
          {/* Price */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-white text-xl sm:text-3xl font-bold tracking-tight">
              {(() => {
                const price = getPrice(product)
                return typeof price === 'string' && price.includes('$') ? price.replace('From ', '') : `$${price}`
              })()}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl group-hover:scale-105 z-30 hover:bg-gray-100 pointer-events-auto"
          >
            <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-black transition-colors" />
          </button>
        </div>
      </div>
    </div>
  )
}
