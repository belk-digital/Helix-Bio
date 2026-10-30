import { it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { SaleTierProgress } from '@/components/sale/SaleTierProgress'
import { computeSaleDiscount } from '@/lib/sale/autoDiscount'

const D = new Date('2026-10-30T12:00:00.000Z')

it('each tier node carries its own Halloween icon', () => {
  const sale = computeSaleDiscount(
    [{ priceSnapshot: 300, quantity: 1, variantSku: 'S' }],
    D,
  )
  const { container } = render(React.createElement(SaleTierProgress, { sale }))

  // Node circles are the absolutely positioned spans on the track.
  const nodes = Array.from(container.querySelectorAll('span.absolute.rounded-full'))
  expect(nodes).toHaveLength(3)

  const svgs = nodes.map((n) => n.querySelector('svg')!)
  expect(svgs.every(Boolean)).toBe(true)

  // Pumpkin: 3 ellipses (lobes) + stem rect + leaf path
  expect(svgs[0].querySelectorAll('ellipse')).toHaveLength(3)
  expect(svgs[0].querySelectorAll('rect')).toHaveLength(1)

  // Bat: head circle + 2 ears, 1 body, 2 wings
  expect(svgs[1].querySelectorAll('circle')).toHaveLength(1)
  expect(svgs[1].querySelectorAll('path')).toHaveLength(5)

  // Moon comes from lucide and keeps its own class
  expect(svgs[2].getAttribute('class')).toContain('lucide-moon')

  // Every path has parseable, non-empty geometry starting with a move command
  for (const svg of svgs.slice(0, 2)) {
    for (const p of Array.from(svg.querySelectorAll('path'))) {
      const d = p.getAttribute('d') || ''
      expect(d.length).toBeGreaterThan(10)
      expect(d.trim().startsWith('M')).toBe(true)
      // No stray characters beyond SVG path grammar
      expect(/^[MmLlHhVvCcSsQqTtAaZz0-9.,\-\s]+$/.test(d)).toBe(true)
    }
  }

  // Icons inherit the node colour rather than hardcoding one
  expect(svgs[0].getAttribute('fill')).toBe('currentColor')
  expect(svgs[1].getAttribute('fill')).toBe('currentColor')

  // Current tier node (25% here) is the enlarged one
  expect(nodes[1].className).toContain('h-8')
  expect(nodes[0].className).toContain('h-6')
})
