'use client'

import React, { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

/**
 * The evergreen announcements that ran before the Halloween sale, restored so
 * the header is not left empty once the sale expires.
 *
 * Moved here verbatim from ClientHeader, where they were left orphaned when the
 * sale bar replaced the inline block.
 */

export const LEGACY_ANNOUNCEMENTS = [
  { key: 'puritySale', couponCode: 'PURITY10' },
  { key: 'freeShipping', couponCode: null },
  { key: 'newCustomerDiscount', couponCode: 'NEW15' },
] as const

/**
 * Counts down to `expiresAt`, refreshed every second, clamped at zero.
 *
 * NOTE: the original wiring passed `Date.now() + 24h`, so the clock reset on
 * every page load and never actually ran out. It now takes a real instant; pass
 * the coupon's own expiry, or leave it off entirely.
 */
export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime()
      if (difference > 0) {
        return {
          h: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
          m: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
          s: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
        }
      }
      return { h: '00', m: '00', s: '00' }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const Cell = ({ value, label, strong }: { value: string; label: string; strong?: boolean }) => (
    <div className="flex flex-col items-center gap-[2px]">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded border text-white shadow-sm backdrop-blur-md ${
          strong ? 'border-white/50 bg-white/30 font-black' : 'border-white/30 bg-white/20'
        }`}
      >
        {value}
      </div>
      <span className="font-sans text-[6px] uppercase tracking-widest text-white/90">{label}</span>
    </div>
  )

  return (
    <div className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider">
      <Cell value={timeLeft.h} label="HRS" />
      <span className="-mt-3 animate-pulse text-[10px] text-white/50">:</span>
      <Cell value={timeLeft.m} label="MIN" />
      <span className="-mt-3 animate-pulse text-[10px] text-white/50">:</span>
      <Cell value={timeLeft.s} label="SEC" strong />
    </div>
  )
}

/** Click-to-copy coupon pill, as it was before the sale. */
export function CouponBox({ code }: { code: string }) {
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
      type="button"
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 rounded-md border border-dashed border-white/60 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-widest text-white shadow-sm transition-colors hover:border-white hover:bg-white/20"
      title={t('clickToCopy')}
    >
      {code}
      <Copy size={12} />
    </motion.button>
  )
}
