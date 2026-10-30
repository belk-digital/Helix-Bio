'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SALE_NAME, SALE_TIERS, SALE_ENDS_AT, isSaleActive } from '@/lib/sale/autoDiscount'

/**
 * Sale popup: the supplied Halloween banner over a dimmed page.
 *
 * The banner already carries the headline, the three tiers and the
 * "applied automatically at checkout" line, so the card is the artwork plus a
 * close control and the compliance fine print the image does not state in text.
 *
 * The end date still comes from lib/sale/autoDiscount, so the popup retires
 * itself on the same instant the discount does.
 */

const BANNER_SRC = '/images/halloween-sale-banner.png'
const BANNER_WIDTH = 1677
const BANNER_HEIGHT = 938

const POPUP_DISMISSED_KEY = 'helix-halloween-popup-dismissed'
const BADGE_DISMISSED_KEY = 'helix-halloween-badge-dismissed'
const OPEN_DELAY_MS = 3000

/** The popup is a marketing surface — never over the funnel. */
const SUPPRESSED_PREFIXES = ['/cart', '/checkout']

/** localStorage throws in private windows and with site data blocked. */
function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
function writeFlag(key: string) {
  try {
    window.localStorage.setItem(key, '1')
  } catch {
    /* non-fatal: the popup simply returns next visit */
  }
}

export function SalePopup() {
  const pathname = usePathname() || ''
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [popupDismissed, setPopupDismissed] = useState(true)
  const [badgeDismissed, setBadgeDismissed] = useState(true)

  const suppressed = SUPPRESSED_PREFIXES.some((p) => pathname.startsWith(p))

  useEffect(() => {
    setMounted(true)
    setPopupDismissed(readFlag(POPUP_DISMISSED_KEY))
    setBadgeDismissed(readFlag(BADGE_DISMISSED_KEY))
  }, [])

  useEffect(() => {
    if (!mounted || suppressed || popupDismissed || !isSaleActive()) return
    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [mounted, suppressed, popupDismissed])

  const close = useCallback(() => {
    setOpen(false)
    setPopupDismissed(true)
    writeFlag(POPUP_DISMISSED_KEY)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!mounted || suppressed || !isSaleActive()) return null

  const topTier = SALE_TIERS[SALE_TIERS.length - 1]
  const endsLabel = new Date(SALE_ENDS_AT).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  // Badge stands in for the popup once dismissed.
  if (!open) {
    if (!popupDismissed || badgeDismissed) return null
    return (
      <div className="fixed bottom-4 left-4 z-[190] flex items-center gap-1 rounded-full border border-orange-500/35 bg-ink/95 py-1.5 pl-3 pr-1.5 shadow-xl backdrop-blur print:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-400 transition-colors hover:text-white"
        >
          {SALE_NAME}: up to {topTier.percent}% off
        </button>
        <button
          type="button"
          onClick={() => {
            setBadgeDismissed(true)
            writeFlag(BADGE_DISMISSED_KEY)
          }}
          aria-label="Dismiss sale badge"
          className="rounded-full p-1 text-white/40 transition-colors hover:text-white"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 p-3 backdrop-blur-sm sm:p-6 print:hidden"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${SALE_NAME} — up to ${topTier.percent}% off`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[980px] overflow-hidden rounded-[18px] border border-white/10 bg-ink shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 rounded-full bg-ink/60 p-2 text-white/80 backdrop-blur transition-colors hover:bg-ink hover:text-white sm:right-3 sm:top-3"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* The banner is the whole call to action — the artwork carries its own
            "Shop the sale" button, so the image itself is the link. */}
        <Link href="/shop" onClick={close} className="block" aria-label="Shop the sale">
          <Image
            src={BANNER_SRC}
            alt={`${SALE_NAME}: ${SALE_TIERS.map((t) => `${t.percent}% off`).join(', ')} — premium peptides for research use only`}
            width={BANNER_WIDTH}
            height={BANNER_HEIGHT}
            priority
            sizes="(max-width: 1024px) 100vw, 980px"
            className="h-auto w-full"
          />
        </Link>

        {/* Compliance line: the banner states the offer but not the end date or
            the research-use restriction in text. */}
        <p className="border-t border-white/[0.07] px-4 py-3 text-[10px] leading-relaxed text-white/35 sm:px-6">
          Applies automatically at checkout to your whole cart, no code needed. It can&apos;t be
          combined with coupon codes: if you enter one, we&apos;ll show you which is the better
          deal. Ends {endsLabel} at 11:59 PM ET. Research use only, not for human or veterinary
          use.
        </p>
      </div>
    </div>
  )
}
