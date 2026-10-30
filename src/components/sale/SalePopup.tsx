'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SALE_NAME, SALE_TIERS, SALE_ENDS_AT, isSaleActive } from '@/lib/sale/autoDiscount'
import { PumpkinIcon, BatIcon } from './HalloweenIcons'
import { Moon } from 'lucide-react'

/**
 * Sale popup: the tier table, the end date and the research-use-only line.
 *
 * Opens a few seconds after load, once per browser. Tier rates, thresholds and
 * the end date all come from lib/sale/autoDiscount, so the popup can never
 * advertise a rate the cart will not honour.
 */

const POPUP_DISMISSED_KEY = 'helix-halloween-popup-dismissed'
const BADGE_DISMISSED_KEY = 'helix-halloween-badge-dismissed'
const OPEN_DELAY_MS = 3000
const COUNT_UP_MS = 900

/** The popup is a homepage/marketing surface — never over the funnel. */
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

const TIER_META = [
  { label: 'Dusk', condition: 'Every order', Icon: PumpkinIcon },
  { label: 'Nightfall', condition: null as string | null, Icon: BatIcon },
  { label: 'Midnight', condition: null as string | null, Icon: null },
]

function tierCondition(index: number) {
  const meta = TIER_META[index]
  if (meta?.condition) return meta.condition
  const tier = SALE_TIERS[index]
  return `Orders over $${tier.over}`
}

/** Counts 0 -> target once, then holds. Honours prefers-reduced-motion. */
function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduced) {
      setValue(target)
      return
    }

    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_MS)
      // ease-out so the number decelerates onto its final value
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [target, active])

  return value
}

function TierRow({ index, open }: { index: number; open: boolean }) {
  const tier = SALE_TIERS[index]
  const meta = TIER_META[index]
  const shown = useCountUp(tier.percent, open)
  const isBest = index === SALE_TIERS.length - 1
  const Icon = meta?.Icon

  return (
    <li className="flex items-center gap-4 py-3.5 border-b border-white/[0.07] last:border-b-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
        {Icon ? <Icon size={18} /> : <Moon size={17} strokeWidth={2} aria-hidden="true" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-white">
            {meta?.label}
          </span>
          {isBest && (
            <span className="rounded-full bg-primary px-2 py-[3px] text-[8px] font-black uppercase tracking-[0.12em] text-ink">
              Best deal
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[12px] text-white/50">{tierCondition(index)}</span>
      </span>

      <span className="shrink-0 font-heading text-2xl sm:text-[28px] font-black leading-none tracking-tight text-primary tabular-nums">
        {shown}
        <span className="text-base align-top">% off</span>
      </span>
    </li>
  )
}

/** Moon, bats and faint orbit rings — CSS/SVG only, no image assets. */
function NightArtwork() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="helix-moon-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#92DCE5" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#92DCE5" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#92DCE5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="helix-moon-body" cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#CFF2F6" />
          <stop offset="100%" stopColor="#6FB9C2" />
        </radialGradient>
      </defs>

      {/* orbit rings */}
      <circle cx="100" cy="92" r="86" fill="none" stroke="#92DCE5" strokeOpacity="0.1" />
      <circle cx="100" cy="92" r="68" fill="none" stroke="#92DCE5" strokeOpacity="0.14" />

      {/* glow then body */}
      <circle cx="100" cy="92" r="78" fill="url(#helix-moon-glow)" />
      <circle cx="100" cy="92" r="44" fill="url(#helix-moon-body)" />

      {/* craters */}
      <circle cx="86" cy="78" r="8" fill="#5FA6AF" fillOpacity="0.45" />
      <circle cx="112" cy="98" r="6" fill="#5FA6AF" fillOpacity="0.4" />
      <circle cx="95" cy="110" r="4.5" fill="#5FA6AF" fillOpacity="0.35" />
      <circle cx="116" cy="74" r="3.5" fill="#5FA6AF" fillOpacity="0.3" />

      {/* Bats, reusing the node icon silhouette. The two over the moon are near
          black so they read as silhouettes; the one in open sky is tinted,
          because a dark bat on a dark card is invisible. */}
      <g fill="#07171A" fillOpacity="0.9">
        <g transform="translate(62 54) scale(1.7)">
          <path d="M10.4 9.1C8.4 7.3 5.6 6.3 2.3 6.4c1.2 1.5 1.8 3.3 1.6 5.1 1.1-.9 2.4-.8 3.6.1.9.7 2 1.2 3.2 1.3a6.2 6.2 0 0 1-.3-3.8z" />
          <path d="M13.6 9.1c2-1.8 4.8-2.8 8.1-2.7-1.2 1.5-1.8 3.3-1.6 5.1-1.1-.9-2.4-.8-3.6.1-.9.7-2 1.2-3.2 1.3a6.2 6.2 0 0 0 .3-3.8z" />
          <circle cx="12" cy="9.3" r="2" />
        </g>
        <g transform="translate(100 96) scale(1.15)">
          <path d="M10.4 9.1C8.4 7.3 5.6 6.3 2.3 6.4c1.2 1.5 1.8 3.3 1.6 5.1 1.1-.9 2.4-.8 3.6.1.9.7 2 1.2 3.2 1.3a6.2 6.2 0 0 1-.3-3.8z" />
          <path d="M13.6 9.1c2-1.8 4.8-2.8 8.1-2.7-1.2 1.5-1.8 3.3-1.6 5.1-1.1-.9-2.4-.8-3.6.1-.9.7-2 1.2-3.2 1.3a6.2 6.2 0 0 0 .3-3.8z" />
          <circle cx="12" cy="9.3" r="2" />
        </g>
      </g>
      <g fill="#92DCE5" fillOpacity="0.3" transform="translate(146 22) scale(0.95)">
        <path d="M10.4 9.1C8.4 7.3 5.6 6.3 2.3 6.4c1.2 1.5 1.8 3.3 1.6 5.1 1.1-.9 2.4-.8 3.6.1.9.7 2 1.2 3.2 1.3a6.2 6.2 0 0 1-.3-3.8z" />
        <path d="M13.6 9.1c2-1.8 4.8-2.8 8.1-2.7-1.2 1.5-1.8 3.3-1.6 5.1-1.1-.9-2.4-.8-3.6.1-.9.7-2 1.2-3.2 1.3a6.2 6.2 0 0 0 .3-3.8z" />
        <circle cx="12" cy="9.3" r="2" />
      </g>
    </svg>
  )
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

  // Auto-open a few seconds in, only on a page the popup is allowed on.
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

  // Escape closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!mounted || suppressed || !isSaleActive()) return null

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
      <div className="fixed bottom-4 left-4 z-[190] flex items-center gap-1 rounded-full border border-primary/30 bg-ink/95 py-1.5 pl-3 pr-1.5 shadow-xl backdrop-blur print:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:text-white"
        >
          {SALE_NAME}: up to {SALE_TIERS[SALE_TIERS.length - 1].percent}% off
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm print:hidden"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-[22px] border border-white/10 bg-ink shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-white/50 transition-colors hover:text-white"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.15fr_0.85fr] md:gap-8">
          {/* Left: copy, tiers, CTA */}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary">
              Seasonal event
              <span className="mx-2 text-white/25">/</span>
              <span className="text-white/50">Ends Nov 1</span>
            </p>

            <h2
              id="sale-popup-title"
              className="mt-2 font-heading text-3xl sm:text-4xl font-black uppercase leading-[0.95] tracking-tight text-white"
            >
              {SALE_NAME}
            </h2>

            <p className="mt-2.5 text-[13px] leading-relaxed text-white/60">
              Every order gets a discount. The more you add, the deeper it goes.
            </p>

            <ul className="mt-5 border-t border-white/[0.07]">
              {SALE_TIERS.map((tier, i) => (
                <TierRow key={tier.percent} index={i} open={open} />
              ))}
            </ul>

            <p className="mt-3 text-[11px] text-white/40">
              Single vials only. No kits or bundles.
            </p>

            <Link
              href="/shop"
              onClick={close}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-ink transition-colors hover:bg-white"
            >
              Shop the sale
              <ArrowRight size={15} strokeWidth={3} />
            </Link>
          </div>

          {/* Right: night artwork */}
          <div className="relative hidden min-h-[220px] items-center justify-center md:flex">
            <NightArtwork />
          </div>
        </div>

        <p className="border-t border-white/[0.07] px-6 py-4 text-[10px] leading-relaxed text-white/35 sm:px-8">
          Applies automatically at checkout to your whole cart, no code needed. It can&apos;t be
          combined with coupon codes: if you enter one, we&apos;ll show you which is the better
          deal. Ends {endsLabel} at 11:59 PM ET. Research use only, not for human or veterinary
          use.
        </p>
      </div>
    </div>
  )
}
