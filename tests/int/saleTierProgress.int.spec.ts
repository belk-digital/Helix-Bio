import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { SaleTierProgress } from '@/components/sale/SaleTierProgress'
import {
  computeSaleDiscount,
  SALE_NAME,
  SALE_EXCLUSION_NOTE,
  type SaleCartLine,
} from '@/lib/sale/autoDiscount'

/**
 * The cart/checkout sale card under a flat sale.
 *
 * Early Black Friday has one rate and no minimum, so the card states the rate
 * and nothing else: no track, no tier nodes and no "add $X more to unlock"
 * message, which would be false when there is nothing to unlock.
 */

const DURING = new Date('2026-11-19T12:00:00.000Z')
const AFTER = new Date('2026-11-24T18:30:00.000Z')

const line = (price: number, qty = 1, extra: Partial<SaleCartLine> = {}): SaleCartLine => ({
  priceSnapshot: price,
  quantity: qty,
  variantSku: 'SINGLE-10MG',
  productSlug: 'bpc-157',
  ...extra,
})

/** Headline rate, read as text because the "%" sits in its own smaller span. */
function bigPercent(container: HTMLElement) {
  return container.querySelector('span.shrink-0')?.textContent ?? ''
}

afterEach(() => cleanup())

describe('SaleTierProgress — flat sale card', () => {
  it('states the flat 30% rate and names the sale', () => {
    const sale = computeSaleDiscount([line(59.99)], DURING)
    expect(sale.percent).toBe(30) // guard: driven by the sale module, not the view

    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    expect(screen.getByText(SALE_NAME)).toBeTruthy()
    expect(bigPercent(container)).toBe('30%')
    expect(screen.getByText('30% off eligible products, applied at checkout')).toBeTruthy()
  })

  it('shows no progress track, no tier nodes and no unlock message', () => {
    const sale = computeSaleDiscount([line(59.99)], DURING)
    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    expect(container.querySelector('[role="progressbar"]')).toBeNull()
    expect(container.querySelectorAll('span.absolute.rounded-full')).toHaveLength(0)
    expect(container.textContent).not.toMatch(/unlock|top tier|add \$[\d.]+ more/i)
  })

  it('the rate does not change with cart size — there is no minimum and no next tier', () => {
    for (const subtotal of [10, 250.01, 500.01, 2000]) {
      cleanup()
      const sale = computeSaleDiscount([line(subtotal)], DURING)
      const { container } = render(React.createElement(SaleTierProgress, { sale }))
      expect(bigPercent(container)).toBe('30%')
      expect(sale.amount).toBe(Math.round(subtotal * 0.3 * 100) / 100)
    }
  })

  it('prompts for eligible items on an empty cart rather than showing a discount', () => {
    const sale = computeSaleDiscount([], DURING)
    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    expect(sale.amount).toBe(0)
    expect(screen.getByText('Add eligible items to get 30% off')).toBeTruthy()
    expect(bigPercent(container)).toBe('30%') // the rate on offer, not an applied one
  })

  it('names the exclusions when something in the cart was left out', () => {
    const withExcluded = computeSaleDiscount(
      [line(99.99), line(14, 1, { productSlug: 'bac-water', variantSku: 'BACWAT-10ML' })],
      DURING,
    )
    const { container } = render(React.createElement(SaleTierProgress, { sale: withExcluded }))

    expect(withExcluded.excludedSubtotal).toBe(14)
    expect(container.textContent).toContain(SALE_EXCLUSION_NOTE)
  })

  it('says nothing about exclusions when every line is eligible', () => {
    const allEligible = computeSaleDiscount([line(99.99), line(129, 1, { productSlug: 'glow' })], DURING)
    const { container } = render(React.createElement(SaleTierProgress, { sale: allEligible }))

    expect(allEligible.excludedSubtotal).toBe(0)
    expect(container.textContent).not.toContain(SALE_EXCLUSION_NOTE)
  })

  it('renders nothing at all once the sale has ended', () => {
    const ended = computeSaleDiscount([line(600)], AFTER)
    const { container } = render(React.createElement(SaleTierProgress, { sale: ended }))
    expect(container.innerHTML).toBe('')
  })

  it('carries no Halloween styling or artwork', () => {
    const sale = computeSaleDiscount([line(300)], DURING)
    const { container } = render(React.createElement(SaleTierProgress, { sale }))

    const html = container.innerHTML.toLowerCase()
    expect(html).not.toMatch(/halloween|pumpkin|bat\b/)
    for (const banned of ['orange', 'amber', 'yellow', 'gold']) {
      expect(html).not.toContain(banned)
    }
  })
})
