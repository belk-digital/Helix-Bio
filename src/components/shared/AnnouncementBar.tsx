'use client'

import React, { useEffect, useState } from 'react'
import { X, Moon } from 'lucide-react'
import { SALE_NAME, SALE_TIERS, isSaleActive, FREE_SHIPPING_THRESHOLD } from '@/lib/sale/autoDiscount'
import { PumpkinIcon, BatIcon } from '@/components/sale/HalloweenIcons'

/**
 * Thin strip above the navbar. Rotates three fixed messages, instant swap, no
 * controls, no links. Retires itself once the sale has ended.
 *
 * Height is fixed at 44px because ClientHeader offsets the navbar against it.
 *
 * Theme: orange on black for the Halloween run, using Tailwind's stock orange
 * palette (the project config extends colours, so the defaults are available).
 * This is the one surface that departs from the Helix blue accent.
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

const MESSAGES = [
  {
    key: 'sale',
    Icon: PumpkinIcon,
    text: `${SALE_NAME} — ${SALE_TIERS[0].percent}% off everything`,
  },
  {
    key: 'shipping',
    Icon: BatIcon,
    text: `Free secured shipping on orders over $${FREE_SHIPPING_THRESHOLD}`,
  },
  {
    key: 'tiers',
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
  // Rendering is client-only: the sale cut-off is evaluated against the
  // visitor's clock, and server/client could otherwise disagree on first paint.
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(dismissedThisSession)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const visible = mounted && !dismissed && isSaleActive()

  useEffect(() => {
    onVisibilityChange?.(visible)
  }, [visible, onVisibilityChange])

  useEffect(() => {
    if (!visible) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [visible])

  if (!visible) return null

  const message = MESSAGES[index]
  const { Icon } = message

  const dismiss = () => {
    dismissedThisSession = true
    setDismissed(true)
  }

  return (
    <div
      className="relative z-50 w-full bg-black text-orange-400 pointer-events-auto"
      style={{ height: ANNOUNCEMENT_BAR_HEIGHT }}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-full items-center justify-center gap-2 px-10 sm:px-12">
        <span className="shrink-0 text-orange-500" aria-hidden="true">
          {Icon ? <Icon size={14} /> : <Moon size={13} strokeWidth={2} />}
        </span>
        {/* Plain text: not a link, nothing to click or hover. */}
        <span className="text-center text-[9px] sm:text-[10px] lg:text-[11px] font-heading font-extrabold uppercase leading-snug tracking-[0.14em] sm:tracking-[0.2em]">
          {message.text}
        </span>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-orange-400/60 transition-colors hover:text-orange-400 sm:right-3"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
