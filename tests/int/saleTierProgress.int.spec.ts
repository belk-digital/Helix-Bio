import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { SaleTierProgress } from '@/components/sale/SaleTierProgress'
import { computeSaleDiscount, type SaleCartLine } from '@/lib/sale/autoDiscount'

const DURING = new Date('2026-10-30T12:00:00.000Z')
const AFTER = new Date('2026-11-02T05:00:00.000Z')

const line = (price: number, qty = 1, extra: Partial<SaleCartLine> = {}): SaleCartLine => ({
  priceSnapshot: price,
  quantity: qty,
  variantSku: 'SINGLE-10MG',
  ...extra,
})

/** Node fill is read off the rendered circles rather than any local recomputation. */
function nodeStates(container: HTMLElement) {
  // Scoped to the label row under the track, so the large headline percentage
  // is not mistaken for a node label.
  // The header row also uses justify-between, so take the last one: the labels.
  const rows = container.querySelectorAll('.justify-between')
  const row = rows[rows.length - 1] as HTMLElement
  const labels = Array.from(row.querySelectorAll('span')).filter((el) =>
    /^(20|25|30)%$/.test(el.textContent || ''),
  )
  return labels.map((el) => ({
    label: el.textContent,
    filled: !(el.className.includes('text-white/35')),
  }))
}

/**
 * Fill width as a percentage of the card. jsdom collapses the calc() to a single
 * value, so the number is parsed out rather than matched as a string. The track
 * spans 66.667% of the card (inset by half a node at each end), so a full bar
 * reads ~66.67 and a half bar ~33.33.
 */
function trackFillPercent(container: HTMLElement) {
  const fill = container.querySelector('.bg-orange-500.transition-all') as HTMLElement | null
  const m = (fill?.style.width ?? '').match(/([0-9.]+)%/)
  return m ? parseFloat(m[1]) : 0
}

/** Headline rate, read as text because the "%" sits in its own smaller span. */
function bigPercent(container: HTMLElement) {
  return container.querySelector('span.shrink-0')?.textContent ?? ''
}

afterEach(() => cleanup())

describe('SaleTierProgress — three tier states', () => {
  it('20% state: first node filled, track empty, 25% is the goal', () => {
    const sale = computeSaleDiscount([line(59.99), line(14.0)], DURING) // 73.99
    expect(sale.percent).toBe(20) // guard: driven by the sale module, not the view

    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    expect(bigPercent(container)).toBe('20%')
    expect(screen.getByText('Add $176.02 more to unlock 25% off')).toBeTruthy()
    expect(nodeStates(container)).toEqual([
      { label: '20%', filled: true },
      { label: '25%', filled: false },
      { label: '30%', filled: false },
    ])
    expect(trackFillPercent(container)).toBeCloseTo(14.8, 1)
  })

  it('25% state: first two nodes filled, track half, 30% is the goal', () => {
    const sale = computeSaleDiscount([line(300)], DURING)
    expect(sale.percent).toBe(25)

    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    expect(bigPercent(container)).toBe('25%')
    expect(screen.getByText('Add $200.01 more to unlock 30% off')).toBeTruthy()
    expect(nodeStates(container)).toEqual([
      { label: '20%', filled: true },
      { label: '25%', filled: true },
      { label: '30%', filled: false },
    ])
    expect(trackFillPercent(container)).toBeCloseTo(60.0, 1)
  })

  it('30% state: all nodes filled, track full, unlocked message', () => {
    const sale = computeSaleDiscount([line(600)], DURING)
    expect(sale.percent).toBe(30)
    expect(sale.progress?.isTopTier).toBe(true)

    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    expect(bigPercent(container)).toBe('30%')
    expect(screen.getByText('30% off unlocked — top tier')).toBeTruthy()
    expect(nodeStates(container)).toEqual([
      { label: '20%', filled: true },
      { label: '25%', filled: true },
      { label: '30%', filled: true },
    ])
    expect(trackFillPercent(container)).toBeCloseTo(100, 1)
  })

  it('shows the sale name and never disagrees with the sale module', () => {
    const lines = [line(129.99), line(99.99), line(14.0)] // 243.98 -> 20%
    const sale = computeSaleDiscount(lines, DURING)
    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    expect(screen.getByText('Halloween Deals')).toBeTruthy()
    // The big percentage equals sale.percent, and the copy equals the module's gap
    expect(bigPercent(container)).toBe(`${sale.percent}%`)
    expect(
      screen.getByText(`Add $${sale.progress!.amountToNextTier.toFixed(2)} more to unlock 25% off`),
    ).toBeTruthy()
  })

  it('flags excluded kits and renders nothing once the sale has ended', () => {
    const withKit = computeSaleDiscount(
      [line(100), line(400, 1, { variantSku: 'KIT-10MG - 5 Kits' })],
      DURING,
    )
    const { container: a } = render(React.createElement(SaleTierProgress, { sale: withKit }))
    expect(a.textContent).toContain('Kits & bundles excluded from the sale')

    cleanup()
    const ended = computeSaleDiscount([line(600)], AFTER)
    const { container: b } = render(React.createElement(SaleTierProgress, { sale: ended }))
    expect(b.innerHTML).toBe('')
  })

  it('uses the Halloween orange accent and no leftover blue', () => {
    const sale = computeSaleDiscount([line(300)], DURING)
    const { container } = render(React.createElement(SaleTierProgress, { sale }))
    const html = container.innerHTML

    // Orange for the sale run, matching the announcement bar and the banner
    expect(html).toContain('bg-orange-500')
    expect(html).toContain('text-orange-400')
    // No leftover blue accent, and no third colour
    for (const banned of ['text-primary', 'bg-primary', 'amber', 'gold', 'yellow']) {
      expect(html.toLowerCase()).not.toContain(banned.toLowerCase())
    }
  })
})
