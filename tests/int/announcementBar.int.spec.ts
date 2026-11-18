import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import { SALE_ENDS_AT } from '@/lib/sale/autoDiscount'

// The post-sale set renders translated copy and a click-to-copy coupon pill.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    ({
      'announcements.puritySale': 'PURITY SALE: 10% OFF ALL PEPTIDES',
      'announcements.freeShipping': 'FREE SECURED SHIPPING ON ORDERS OVER $300',
      'announcements.newCustomerDiscount': 'NEW CUSTOMERS: 15% OFF YOUR FIRST ORDER',
    })[key] ?? key,
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

const DURING = new Date('2026-11-19T12:00:00.000Z')
const AFTER = new Date('2026-11-24T18:30:00.000Z')

/** Fresh module each time, so the module-scoped session dismissal starts clean. */
async function freshBar() {
  vi.resetModules()
  const mod = await import('@/components/shared/AnnouncementBar')
  return mod.AnnouncementBar
}

function textOf() {
  return document.querySelector('[role="status"] span:last-of-type')?.textContent?.trim() ?? ''
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(DURING)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('AnnouncementBar', () => {
  it('shows the three messages in order and loops', async () => {
    const Bar = await freshBar()
    await act(async () => {
      render(React.createElement(Bar))
    })

    const seen: string[] = [textOf()]
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
      seen.push(textOf())
    }

    expect(seen[0]).toMatch(/early black friday . 30% off eligible products/i)
    expect(seen[1]).toMatch(/free secured shipping on orders over \$300/i)
    expect(seen[2]).toMatch(/applied automatically at checkout . no coupon needed/i)
    // Loops back round
    expect(seen[3]).toBe(seen[0])
    expect(seen[4]).toBe(seen[1])
    expect(seen[5]).toBe(seen[2])
  })

  it('holds each message for ~5s, a full cycle being ~15s', async () => {
    const Bar = await freshBar()
    await act(async () => {
      render(React.createElement(Bar))
    })

    const first = textOf()
    await act(async () => {
      vi.advanceTimersByTime(4900)
    })
    expect(textOf()).toBe(first) // still on message 1 just before the swap

    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    expect(textOf()).not.toBe(first)

    // 15s from the start lands back on message 1
    await act(async () => {
      vi.advanceTimersByTime(15000 - 5100)
    })
    expect(textOf()).toBe(first)
  })

  it('carries no coupon code, countdown, controls or links', async () => {
    const Bar = await freshBar()
    let container!: HTMLElement
    await act(async () => {
      container = render(React.createElement(Bar)).container
    })

    for (let i = 0; i < 3; i++) {
      const html = container.innerHTML
      expect(container.querySelectorAll('a')).toHaveLength(0)
      // The only interactive element is the dismiss button
      expect(container.querySelectorAll('button')).toHaveLength(1)
      expect(html).not.toMatch(/PURITY10|NEW15|copy|code/i)
      expect(html).not.toMatch(/\d{1,2}:\d{2}/) // no countdown clock
      expect(html.toLowerCase()).not.toContain('nov')
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
    }
  })

  it('the message text is inert — no handlers on it', async () => {
    const Bar = await freshBar()
    let container!: HTMLElement
    await act(async () => {
      container = render(React.createElement(Bar)).container
    })

    const text = container.querySelector('[role="status"] span:last-of-type') as HTMLElement
    expect(text.tagName).toBe('SPAN')
    expect(text.closest('a')).toBeNull()
    expect(text.getAttribute('onclick')).toBeNull()
    expect(text.style.cursor).toBe('')
    // Clicking it changes nothing
    const before = container.innerHTML
    fireEvent.click(text)
    expect(container.innerHTML).toBe(before)
  })

  it('the X removes the strip entirely, leaving no spacer behind', async () => {
    const Bar = await freshBar()
    let container!: HTMLElement
    const onVisibilityChange = vi.fn()
    await act(async () => {
      container = render(React.createElement(Bar, { onVisibilityChange })).container
    })

    expect(container.querySelector('[role="status"]')).toBeTruthy()
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true)

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Dismiss announcement'))
    })

    // Nothing rendered at all — not a zero-height wrapper
    expect(container.innerHTML).toBe('')
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false)
  })

  it('dismissal lasts the session but a fresh load restores message 1', async () => {
    const Bar = await freshBar()
    await act(async () => {
      render(React.createElement(Bar))
    })
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Dismiss announcement'))
    })
    cleanup()

    // Re-mounting the same module (client-side navigation) keeps it dismissed
    let again!: HTMLElement
    await act(async () => {
      again = render(React.createElement(Bar)).container
    })
    expect(again.innerHTML).toBe('')
    cleanup()

    // A fresh module instance stands in for a page reload: back, at message 1
    const Reloaded = await freshBar()
    let fresh!: HTMLElement
    await act(async () => {
      fresh = render(React.createElement(Reloaded)).container
    })
    expect(fresh.querySelector('[role="status"]')).toBeTruthy()
    expect(textOf()).toMatch(/early black friday . 30% off eligible products/i)

    // Nothing was written to storage
    expect(Object.keys(window.localStorage)).toHaveLength(0)
    expect(Object.keys(window.sessionStorage)).toHaveLength(0)
  })

  it('falls back to the pre-sale announcements once the sale has ended', async () => {
    vi.setSystemTime(AFTER)
    expect(new Date(SALE_ENDS_AT) <= AFTER).toBe(true)

    const Bar = await freshBar()
    let container!: HTMLElement
    const onVisibilityChange = vi.fn()
    await act(async () => {
      container = render(React.createElement(Bar, { onVisibilityChange })).container
    })

    // The strip stays — the header is never left empty
    expect(container.querySelector('[role="status"]')).toBeTruthy()
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true)

    const seen: string[] = []
    for (let i = 0; i < 3; i++) {
      seen.push(container.textContent || '')
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
    }

    expect(seen[0]).toMatch(/purity sale: 10% off all peptides/i)
    expect(seen[1]).toMatch(/free secured shipping on orders over \$300/i)
    expect(seen[2]).toMatch(/new customers: 15% off your first order/i)

    // Coupon pills are back; the sale styling is not
    expect(seen[0]).toContain('PURITY10')
    expect(seen[2]).toContain('NEW15')
    expect(container.innerHTML).not.toContain('text-orange')
    expect(container.innerHTML).not.toMatch(/halloween|black friday/i)
  })

  it('shows no coupon pill on the free-shipping message', async () => {
    vi.setSystemTime(AFTER)
    const Bar = await freshBar()
    let container!: HTMLElement
    await act(async () => {
      container = render(React.createElement(Bar)).container
    })
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(container.textContent).toMatch(/free secured shipping/i)
    expect(container.querySelector('button[title]')).toBeNull()
  })

  it('uses the white-on-black Black Friday theme, with no Halloween leftovers', async () => {
    const Bar = await freshBar()
    let container!: HTMLElement
    await act(async () => {
      container = render(React.createElement(Bar)).container
    })

    const html = container.innerHTML.toLowerCase()
    // Monochrome strip, matching the sale banner and deliberately departing
    // from the blue theme for the duration of the sale.
    expect(html).toContain('bg-black')
    expect(html).toContain('text-white')
    // No stray second accent, and nothing left of the Halloween palette
    expect(html).not.toContain('text-primary')
    for (const banned of ['orange', 'amber', 'yellow', 'gold']) {
      expect(html).not.toContain(banned)
    }
  })

  it('advertises only the rate the sale module actually applies', async () => {
    const { SALE_TIERS } = await import('@/lib/sale/autoDiscount')
    const Bar = await freshBar()
    let container!: HTMLElement
    await act(async () => {
      container = render(React.createElement(Bar)).container
    })

    // One flat tier, so the strip may name 30% and no other rate.
    expect(SALE_TIERS).toHaveLength(1)
    const seen: string[] = []
    for (let i = 0; i < 3; i++) {
      seen.push(container.textContent || '')
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
    }
    const all = seen.join(' ')
    expect(all).toContain('30%')
    expect(all).not.toMatch(/\b(20|25)%/)
  })
})
