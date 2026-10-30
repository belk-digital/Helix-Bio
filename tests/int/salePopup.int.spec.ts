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

  it('shows the supplied banner, and the banner itself is the link to /shop', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)

    const img = container.querySelector('img')!
    // next/image rewrites src through the optimiser, so assert on the source path
    expect(img.outerHTML).toContain('halloween-sale-banner.png')
    expect(img.getAttribute('width')).toBe('1677')
    expect(img.getAttribute('height')).toBe('938')
    expect(img.closest('a')!.getAttribute('href')).toBe('/shop')
  })

  it('alt text states the offer and matches the sale module rates', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)
    const alt = container.querySelector('img')!.getAttribute('alt')!

    for (const tier of SALE_TIERS) {
      expect(alt).toContain(`${tier.percent}% off`)
    }
    expect(alt).toMatch(/research use only/i)
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

    // ...but the badge is there, in the Helix blue, and reopens the popup
    const badge = screen.getByText(new RegExp(`up to ${SALE_TIERS[2].percent}% off`, 'i'))
    expect(badge.className).toContain('text-primary')
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

  it('the banner link points at plain /shop and closes the popup', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)
    const cta = screen.getByLabelText('Shop the sale')
    expect(cta.getAttribute('href')).toBe('/shop')
    expect(cta.getAttribute('href')).not.toContain('?')

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

  it('states the end date as plain text, with no countdown', async () => {
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)

    expect(container.innerHTML).not.toMatch(/\d{1,2}:\d{2}:\d{2}/) // no ticking clock
    expect(container.textContent).toMatch(/ends sunday, november 1 at 11:59 pm et/i)
    expect(container.textContent).toMatch(/research use only/i)
  })

  it('the component itself introduces no orange classes', async () => {
    // The banner artwork is orange; what is checked here is the component code,
    // whose own styling stays on the Helix dark/blue tokens.
    const Popup = await freshPopup()
    const { container } = await openPopup(Popup)
    const classes = Array.from(container.querySelectorAll('*'))
      .map((el) => el.getAttribute('class') || '')
      .join(' ')
      .toLowerCase()

    for (const banned of ['orange', 'amber', 'gold', 'yellow']) {
      expect(classes).not.toContain(banned)
    }
  })
})
