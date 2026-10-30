import React from 'react'

export interface MarqueeProps {
  items?: string[]
  className?: string
  textClassName?: string
  dotClassName?: string
  separator?: React.ReactNode
}

import { SALE_NAME, isSaleActive } from '@/lib/sale/autoDiscount'

// Sale entry leads the rotation while the sale runs and disappears by itself
// afterwards, so no edit is needed to retire it.
const SALE_ITEM = `${SALE_NAME.toUpperCase()} — 20% OFF, UP TO 30% OVER $500`

const DEFAULT_ITEMS = [
  '≥99% HPLC PURITY',
  'LC-MS VERIFIED IDENTITY',
  'COA WITH EVERY ORDER',
  'US-BASED SYNTHESIS',
  '2-DAY SHIPPING ON ORDERS $300+',
  'ENDOTOXIN-FREE COMPOUNDS'
]

export function Marquee({
  items = isSaleActive() ? [SALE_ITEM, ...DEFAULT_ITEMS] : DEFAULT_ITEMS,
  className = "bg-ink border-y border-border-subtle",
  textClassName = "text-cream",
  dotClassName = "text-gold",
  separator = "✦"
}: MarqueeProps) {
  return (
    <div className={`py-3 overflow-hidden flex whitespace-nowrap ${className}`}>
      <div className="flex w-max motion-safe:animate-marquee motion-reduce:animate-none items-center">
        {[...items, ...items, ...items].map((item, index) => (
          <React.Fragment key={index}>
            <span className={`text-[10px] tracking-[0.25em] uppercase mx-8 ${textClassName}`}>
              {item}
            </span>
            <span className={`mx-4 flex items-center justify-center ${dotClassName}`} aria-hidden="true">
              {separator}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
