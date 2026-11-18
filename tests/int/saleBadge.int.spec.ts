import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup, act } from '@testing-library/react'
import { SaleBadge } from '@/components/sale/SaleBadge'
import { availableStockOf } from '@/lib/products/availableStock'
import { SALE_TIERS } from '@/lib/sale/autoDiscount'

/**
 * The 30% OFF marker on a product card.
 *
 * It must appear on exactly the products the discount will actually apply to:
 * eligible, in stock, while the sale runs. Anything else — an excluded product,
 * a retired one, a card whose data source cannot supply stock, or the period
 * after the sale ends — shows nothing, because a badge is a promise about a
 * price and the checkout is what has to keep it.
 */

const DURING = new Date('2026-11-19T12:00:00.000Z')
const AFTER = new Date('2026-11-24T18:30:00.000Z')

/** The badge is mount-gated against hydration mismatch, so let the effect run. */
async function renderBadge(props: Record<string, unknown>) {
  let container!: HTMLElement
  await act(async () => {
    container = render(React.createElement(SaleBadge, props)).container
  })
  return container
}

const shows = async (props: Record<string, unknown>) =>
  (await renderBadge(props)).textContent?.trim() ?? ''

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(DURING)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('SaleBadge — what it advertises', () => {
  it('case 1 — an eligible in-stock product shows 30% OFF', async () => {
    const text = await shows({ productSlug: 'bpc-157', stock: 500 })
    expect(text.toLowerCase()).toBe('30% off')
    // The figure comes from the sale module, never a literal in the view.
    expect(text).toContain(String(SALE_TIERS[SALE_TIERS.length - 1].percent))
  })

  it('case 2 — all six eligible blends show the badge', async () => {
    for (const slug of [
      'bpc-157-tb-500-blend',
      'semax-selank-blend',
      'cjc-1295-ipamorelin',
      'tesamorelin-ipamorelin-blend',
      'glow',
      'klow',
    ]) {
      cleanup()
      const text = await shows({ productSlug: slug, stock: 995 })
      expect(text.toLowerCase(), `${slug} should be badged`).toBe('30% off')
    }
  })

  it('case 3 — BAC Water never shows the badge, on any variant', async () => {
    for (const sku of ['BACWAT-3ML', 'BACWAT-10ML', 'BACWAT-30ML']) {
      cleanup()
      // In stock and plentiful — it is excluded on eligibility, not availability.
      expect(await shows({ productSlug: 'bac-water', variantSku: sku, stock: 962 })).toBe('')
    }
    cleanup()
    // Excluded by SKU alone, when a card has no slug to offer.
    expect(await shows({ variantSku: 'BACWAT-10ML', stock: 500 })).toBe('')
  })

  it('case 4 — needles never show the badge', async () => {
    expect(await shows({ productSlug: '10-needles', variantSku: '10-NEEDLES', stock: 979 })).toBe('')
    cleanup()
    expect(await shows({ variantSku: '10-NEEDLES', stock: 979 })).toBe('')
  })

  it('case 5 — kits and bundles never show the badge', async () => {
    // The legacy " - " bundle marker, the same signal the discount excludes on.
    expect(await shows({ productSlug: 'starter-kit', variantSku: 'KIT-10MG - 5 Kits', stock: 100 })).toBe('')
  })

  it('case 6 — an out-of-stock product never shows the badge', async () => {
    // The 57 retired products: active and eligible, but nobody can buy them.
    expect(await shows({ productSlug: 'bpc-157', stock: 0 })).toBe('')
  })

  it('fails safe when stock is unknown', async () => {
    for (const stock of [undefined, null, NaN, -5, '500' as unknown]) {
      cleanup()
      expect(await shows({ productSlug: 'bpc-157', stock })).toBe('')
    }
  })

  it('shows nothing once the sale has ended, however much stock there is', async () => {
    vi.setSystemTime(AFTER)
    expect(await shows({ productSlug: 'bpc-157', stock: 500 })).toBe('')
  })

  it('renders no element at all when hidden, not an empty box', async () => {
    const container = await renderBadge({ productSlug: 'bac-water', stock: 962 })
    expect(container.innerHTML).toBe('')
  })
})

describe('availableStockOf — the shared rule behind the badge', () => {
  it('sums variant stock when a product has variants', () => {
    // Every catalogue product has hasVariants, so this is the normal path.
    expect(
      availableStockOf({
        hasVariants: true,
        stock: 962,
        variants: [{ stock: 500 }, { stock: 500 }, { stock: 0 }],
      }),
    ).toBe(1000)
  })

  it('treats a product whose every variant is retired as unavailable', () => {
    // How the 57 retired products look: the product column may be anything,
    // but no variant can be bought.
    expect(
      availableStockOf({ hasVariants: true, stock: 0, variants: [{ stock: 0 }, { stock: 0 }] }),
    ).toBe(0)
  })

  it('falls back to the product column when there are no variant rows', () => {
    expect(availableStockOf({ hasVariants: false, stock: 42 })).toBe(42)
    expect(availableStockOf({ hasVariants: true, stock: 42, variants: [] })).toBe(42)
  })

  it('returns 0 for anything unreadable rather than guessing', () => {
    expect(availableStockOf(null)).toBe(0)
    expect(availableStockOf(undefined)).toBe(0)
    expect(availableStockOf({})).toBe(0)
    expect(availableStockOf({ stock: '500' })).toBe(0)
    expect(availableStockOf({ hasVariants: true, variants: [{ stock: null }, {}] })).toBe(0)
  })

  it('drives the badge end to end: retired hides, stocked shows', async () => {
    const retired = { hasVariants: true, stock: 0, variants: [{ stock: 0 }] }
    const stocked = { hasVariants: true, stock: 0, variants: [{ stock: 500 }, { stock: 495 }] }

    expect(await shows({ productSlug: 'bpc-157', stock: availableStockOf(retired) })).toBe('')
    cleanup()
    expect(await shows({ productSlug: 'bpc-157', stock: availableStockOf(stocked) })).toBe('30% off')
  })
})
