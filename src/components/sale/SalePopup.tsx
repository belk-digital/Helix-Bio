'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { SALE_NAME, SALE_ENDS_AT, SALE_TIERS, isSaleActive } from '@/lib/sale/autoDiscount'

const DISMISS_KEY = 'helix-halloween-sale-dismissed'

/**
 * Sale popup with the tier table and end date. Shows once per browser until
 * dismissed, and never after the sale has ended.
 *
 * localStorage can throw in private windows or with site data blocked, so every
 * access is guarded and the popup simply shows if the flag cannot be read.
 */
export function SalePopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isSaleActive()) return
    let dismissed = false
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      dismissed = false
    }
    if (dismissed) return
    const timer = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setOpen(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* non-fatal: the popup reappears next visit */
    }
  }

  if (!open) return null

  const endsLabel = new Date(SALE_ENDS_AT).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-popup-title"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md rounded-[20px] bg-cream border border-ink/10 p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 text-ink/40 hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>

        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-dark">
          Limited time
        </span>
        <h2
          id="sale-popup-title"
          className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-ink"
        >
          {SALE_NAME}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Automatic at checkout — no code needed. The more you add, the higher the rate.
        </p>

        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.15em] text-ink-muted">
              <th className="py-2 text-left font-bold">Cart subtotal</th>
              <th className="py-2 text-right font-bold">Discount</th>
            </tr>
          </thead>
          <tbody>
            {SALE_TIERS.map((tier, i) => {
              const next = SALE_TIERS[i + 1]
              const range = next
                ? `$${(tier.over + 0.01).toFixed(2)} – $${next.over.toFixed(2)}`
                : `$${(tier.over + 0.01).toFixed(2)}+`
              return (
                <tr key={tier.rate} className="border-b border-ink/5">
                  <td className="py-2 text-ink">{i === 0 ? 'Every order' : range}</td>
                  <td className="py-2 text-right font-bold text-ink">{tier.percent}% off</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <p className="mt-4 text-[11px] text-ink-muted">Ends {endsLabel} ET.</p>
        <p className="mt-3 text-[10px] leading-relaxed text-ink-muted">
          Kits and bundles are excluded. All products are sold strictly for laboratory
          research use only — not for human or veterinary use.
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full rounded-full bg-ink py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-cream hover:bg-ink/90 transition-colors"
        >
          Shop the sale
        </button>
      </div>
    </div>
  )
}
