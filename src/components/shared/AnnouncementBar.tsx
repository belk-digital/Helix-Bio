'use client'

import React, { useEffect, useState } from 'react'
import { X, Moon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SALE_NAME, SALE_TIERS, isSaleActive, FREE_SHIPPING_THRESHOLD } from '@/lib/sale/autoDiscount'
import { PumpkinIcon, BatIcon } from '@/components/sale/HalloweenIcons'
import { LEGACY_ANNOUNCEMENTS, CouponBox } from './AnnouncementLegacy'

/**
 * Thin strip above the navbar. Rotates a fixed set of messages, instant swap,
 * no controls.
 *
 * Two sets, chosen by the sale clock:
 *  - while the Halloween sale runs: the three sale messages, orange on black
 *  - once it expires: the evergreen announcements that ran before it, white on
 *    black, with their click-to-copy coupon pills
 *
 * So the header is never left empty, and the sale retires itself without anyone
 * having to edit a file.
 *
 * Height is fixed at 44px because ClientHeader offsets the navbar against it.
 */
export const ANNOUNCEMENT_BAR_HEIGHT = 44

/** ~5s a message, ~15s a full cycle. */
const ROTATE_MS = 5000

/**
 * Dismissal lives at module scope rather than in component state, so it survives
 * client-side navigation (the strip stays gone while browsing) but resets on a
 * full page load — session-only, deliberately not persisted to storage.
 */
let dismissedThisSession = false

const SALE_MESSAGES = [
  {
    Icon: PumpkinIcon,
    text: `${SALE_NAME} — ${SALE_TIERS[0].percent}% off everything`,
  },
  {
    Icon: BatIcon,
    text: `Free secured shipping on orders over $${FREE_SHIPPING_THRESHOLD}`,
  },
  {
    Icon: null, // lucide Moon, rendered below
    text: `Over $${SALE_TIERS[1].over} for ${SALE_TIERS[1].percent}%, over $${SALE_TIERS[2].over} for ${SALE_TIERS[2].percent}%`,
  },
] as const

export function AnnouncementBar({
  onVisibilityChange,
}: {
  /** Lets the header move the navbar up when the strip goes away. */
  onVisibilityChange?: (visible: boolean) => void
}) {
  const t = useTranslations('header')
  // Rendering is client-only: the sale cut-off is evaluated against the
  // visitor's clock, and server/client could otherwise disagree on first paint.
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(dismissedThisSession)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const saleRunning = mounted && isSaleActive()
  const count = saleRunning ? SALE_MESSAGES.length : LEGACY_ANNOUNCEMENTS.length
  const visible = mounted && !dismissed

  useEffect(() => {
    onVisibilityChange?.(visible)
  }, [visible, onVisibilityChange])

  // Reset to the first message whenever the set changes, so an index left over
  // from the longer set cannot point past the end of the shorter one.
  useEffect(() => {
    setIndex(0)
  }, [saleRunning])

  useEffect(() => {
    if (!visible) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [visible, count])

  if (!visible) return null

  const dismiss = () => {
    dismissedThisSession = true
    setDismissed(true)
  }

  const sale = saleRunning ? SALE_MESSAGES[index % SALE_MESSAGES.length] : null
  const legacy = saleRunning ? null : LEGACY_ANNOUNCEMENTS[index % LEGACY_ANNOUNCEMENTS.length]
  const Icon = sale?.Icon

  return (
    <div
      className={`relative z-50 w-full bg-black pointer-events-auto ${
        saleRunning ? 'text-orange-400' : 'text-white'
      }`}
      style={{ height: ANNOUNCEMENT_BAR_HEIGHT }}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-full items-center justify-center gap-2 px-10 sm:gap-4 sm:px-12">
        {sale && (
          <>
            <span className="shrink-0 text-orange-500" aria-hidden="true">
              {Icon ? <Icon size={14} /> : <Moon size={13} strokeWidth={2} />}
            </span>
            {/* Plain text: not a link, nothing to click or hover. */}
            <span className="text-center text-[9px] font-heading font-extrabold uppercase leading-snug tracking-[0.14em] sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px]">
              {sale.text}
            </span>
          </>
        )}

        {legacy && (
          <>
            <span className="text-center text-[9px] font-heading font-extrabold uppercase leading-snug tracking-[0.1em] sm:text-[10px] sm:tracking-[0.2em] lg:text-[11px]">
              {t(`announcements.${legacy.key}`)}
            </span>
            {legacy.couponCode && (
              <span className="hidden shrink-0 sm:block">
                <CouponBox code={legacy.couponCode} />
              </span>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 transition-colors sm:right-3 ${
          saleRunning
            ? 'text-orange-400/60 hover:text-orange-400'
            : 'text-white/60 hover:text-white'
        }`}
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
