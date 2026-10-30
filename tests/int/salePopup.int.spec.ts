import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import { SALE_TIERS } from '@/lib/sale/autoDiscount'

const DURING = new Date('2026-10-30T12:00:00.000Z')
const AFTER = new Date('2026-11-02T05:00:00.000Z')

let pathname = '/'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: any) =>
    React.createElement('a', { href, ...rest }, children),
}))

async function freshPopup() {
  vi.resetModules()
  const mod = await import('@/components/sale/SalePopup')
  return mod.SalePopup
}

/** Mount and run past the open delay. */
async function openPopup(Popup: React.ComponentType) {
  const r = render(React.createElement(Popup))
  await act(async () => {
    vi.advanceTimersByTime(3100)
  })
  return r
}

beforeEach(() => {
  pathname = '/'
  window.localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(DURING)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  window.localStorage.clear()
})

describe('SalePopup', () => {
  it('opens a few seconds after load, not immediately', async () => {
    const Popup = await freshPopup()
    const { container } = render(React.createElement(Popup))

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    await act(async () => {
      vi.advanceTimersByTime(1500)
    })
    expect(container.querySelector('[role="dialog"]')).toBeTruthy()
  })

  it('shows the three tiers with names, conditions and the best-deal pill', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)

    const rows = container.querySelectorAll('li')
    expect(rows).toHaveLength(3)

    expect(rows[0].textContent).toMatch(/dusk/i)
    expect(rows[0].textContent).toMatch(/every order/i)
    expect(rows[1].textContent).toMatch(/nightfall/i)
    expect(rows[1].textContent).toMatch(/orders over \$250/i)
    expect(rows[2].textContent).toMatch(/midnight/i)
    expect(rows[2].textContent).toMatch(/orders over \$500/i)
    expect(rows[2].textContent).toMatch(/best deal/i)
    expect(rows[0].textContent).not.toMatch(/best deal/i)

    // Thresholds come from the sale module, not hardcoded copy
    expect(SALE_TIERS.map((t) => t.over)).toEqual([0, 250, 500])
  })

  it('counts the percentages up from zero and settles on 20/25/30', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)

    // The percentage is the row's last direct child span; a plain
    // span:last-of-type lookup matches the nested tier label instead.
    const read = () =>
      Array.from(container.querySelectorAll('li')).map((li) =>
        parseInt(
          (li.querySelector(':scope > span:last-child')?.textContent || '0').replace(/\D/g, ''),
          10,
        ),
      )

    // First frame of the animation is still well below target
    await act(async () => {
      vi.advanceTimersByTime(16)
    })
    const early = read()
    expect(early.every((n) => n < 20)).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(1200)
    })
    expect(read()).toEqual([20, 25, 30])
    expect(read()).toEqual(SALE_TIERS.map((t) => t.percent))
  })

  it('closes on the X, on Escape and on a backdrop click', async () => {
    for (const how of ['x', 'escape', 'backdrop'] as const) {
      window.localStorage.clear()
      const Popup = await freshPopup()
      const { container } = await openPopup(Popup)
      expect(container.querySelector('[role="dialog"]')).toBeTruthy()

      await act(async () => {
        if (how === 'x') fireEvent.click(screen.getByLabelText('Close'))
        if (how === 'escape') fireEvent.keyDown(window, { key: 'Escape' })
        if (how === 'backdrop') fireEvent.click(container.querySelector('[role="presentation"]')!)
      })

      expect(container.querySelector('[role="dialog"]')).toBeNull()
      cleanup()
    }
  })

  it('a click inside the card does not close it', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)
    await act(async () => {
      fireEvent.click(container.querySelector('[role="dialog"]')!)
    })
    expect(container.querySelector('[role="dialog"]')).toBeTruthy()
  })

  it('dismissal persists browser-wide and leaves a badge that reopens it', async () => {
    const Popup = await freshPopup()
    await openPopup(Popup)
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Close'))
    })
    expect(window.localStorage.getItem('helix-halloween-popup-dismissed')).toBe('1')
    cleanup()

    // A fresh module + fresh mount stands in for a reload or a new tab
    const Reloaded = await freshPopup()
    let container!: HTMLElement
    await act(async () => {
      container = render(React.createElement(Reloaded)).container
    })
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    // ...but the badge is there and reopens the popup
    const badge = screen.getByText(new RegExp(`up to ${SALE_TIERS[2].percent}% off`, 'i'))
    expect(badge).toBeTruthy()
    await act(async () => {
      fireEvent.click(badge)
    })
    expect(container.querySelector('[role="dialog"]')).toBeTruthy()
  })

  it('the badge can itself be dismissed, and stays gone', async () => {
    window.localStorage.setItem('helix-halloween-popup-dismissed', '1')
    const Popup = await freshPopup()
    let container!: HTMLElement
    await act(async () => {
      container = render(React.createElement(Popup)).container
    })

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Dismiss sale badge'))
    })
    expect(container.innerHTML).toBe('')
    expect(window.localStorage.getItem('helix-halloween-badge-dismissed')).toBe('1')
  })

  it('Shop the sale points at plain /shop with no query string', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)
    const cta = screen.getByText(/shop the sale/i).closest('a')!
    expect(cta.getAttribute('href')).toBe('/shop')
    expect(cta.getAttribute('href')).not.toContain('?')

    // Clicking it also closes the popup
    await act(async () => {
      fireEvent.click(cta)
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('never appears on cart or checkout', async () => {
    for (const p of ['/cart', '/checkout']) {
      window.localStorage.clear()
      pathname = p
      const Popup = await freshPopup()
      const { container } = await openPopup(Popup)
      expect(container.innerHTML).toBe('')
      cleanup()
    }
  })

  it('renders nothing after the sale end date', async () => {
    vi.setSystemTime(AFTER)
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)
    expect(container.innerHTML).toBe('')
  })

  it('carries no countdown and no orange', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)
    const html = container.innerHTML.toLowerCase()

    expect(html).not.toMatch(/\d{1,2}:\d{2}:\d{2}/) // no ticking clock
    for (const banned of ['orange', 'amber', 'gold', 'yellow']) {
      expect(html).not.toContain(banned)
    }
    expect(html).toContain('text-primary')
    // End date is plain text
    expect(container.textContent).toMatch(/ends sunday, november 1 at 11:59 pm et/i)
  })
})
