import { it, expect } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { SaleTierProgress } from '@/components/sale/SaleTierProgress'
import { computeSaleDiscount } from '@/lib/sale/autoDiscount'

const D = new Date('2026-10-30T12:00:00.000Z')
const L = (p: number, q = 1) => ({ priceSnapshot: p, quantity: q, variantSku: 'S' })

function fillOf(lines: any[]) {
  cleanup()
  const sale = computeSaleDiscount(lines, D)
  const { container } = render(React.createElement(SaleTierProgress, { sale }))
  const el = container.querySelector('.bg-primary.transition-all') as HTMLElement
  const m = (el?.style.width ?? '').match(/([0-9.]+)%/)
  return { pct: sale.percent, fill: m ? parseFloat(m[1]) : 0, gap: sale.progress!.amountToNextTier }
}

it('fill grows on every add, not only at tier boundaries', () => {
  const steps = [
    ['1 item  $59.99', [L(59.99)]],
    ['+ BAC   $73.99', [L(59.99), L(14)]],
    ['ref     $133.99', [L(133.99)]],
    ['+ item  $163.98', [L(59.99), L(14), L(89.99)]],
    ['tier2   $250.01', [L(250.01)]],
    ['        $300.00', [L(300)]],
    ['        $400.00', [L(400)]],
    ['top     $600.00', [L(600)]],
  ] as const

  const seen: number[] = []
  for (const [name, lines] of steps) {
    const r = fillOf(lines as any)
    console.log(
      name.padEnd(16) + ' tier=' + String(r.pct).padStart(2) + '%  fill=' +
        r.fill.toFixed(2).padStart(6) + '%  gap=$' + r.gap.toFixed(2),
    )
    seen.push(r.fill)
  }

  // Strictly increasing across every single addition — the behaviour asked for.
  for (let i = 1; i < seen.length; i++) {
    expect(seen[i]).toBeGreaterThan(seen[i - 1])
  }
  // Still inside the first tier, yet already part-filled (not 0, not snapped to 50)
  expect(seen[0]).toBeGreaterThan(0)
  expect(seen[0]).toBeLessThan(50)
})
