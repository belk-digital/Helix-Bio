import { describe, it, expect, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import {
  parseMarkdownLinks,
  isSafeHref,
  hasMarkdownLink,
  blogLinkRel,
  COMPETITOR_DOMAINS,
} from '@/lib/blog/markdownLinks'
import { PostRichText } from '@/components/blog/PostRichText'

vi.mock('next/image', () => ({ __esModule: true, default: () => null }))

afterEach(cleanup)

/* ------------------------------------------------------------------ *
 * Renders a calloutBox block through the real production pipeline:
 * PostRichText -> blocks.calloutBox converter -> CalloutBox.
 * ------------------------------------------------------------------ */
const callout = (text: string, extra: Record<string, unknown> = {}) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'block',
        version: 2,
        format: '',
        fields: { id: 'tst', blockName: '', blockType: 'calloutBox', style: 'tip', text, ...extra },
      },
    ],
  },
})

const renderCallout = (text: string, extra: Record<string, unknown> = {}) =>
  render(React.createElement(PostRichText, { content: callout(text, extra) }))

/** Visible text of the callout paragraph, as a reader would see it. */
const visibleText = () => document.body.textContent ?? ''

/* ----------------------------- one link ----------------------------- */

describe('CalloutBox markdown links — single link', () => {
  it('renders a link and preserves the text on both sides', () => {
    renderCallout('Read the [research guide](https://example.com) here.')

    const a = document.querySelector('a[href="https://example.com"]') as HTMLAnchorElement
    expect(a).not.toBeNull()
    expect(a.textContent).toBe('research guide')
    expect(visibleText()).toContain('Read the ')
    expect(visibleText()).toContain(' here.')
    // The raw syntax must be gone.
    expect(visibleText()).not.toContain('](')
    expect(visibleText()).not.toContain('[research guide]')
  })

  it('reproduces the original prose exactly, minus the wrappers', () => {
    renderCallout('Read the [research guide](https://example.com) here.')
    expect(visibleText()).toContain('Read the research guide here.')
  })

  it('renders a site-relative link', () => {
    renderCallout('See our [COA guide](/how-to-read-peptide-certificate-of-analysis) first.')
    const a = document.querySelector('a[href="/how-to-read-peptide-certificate-of-analysis"]')
    expect(a?.textContent).toBe('COA guide')
  })
})

/* --------------------------- multiple links -------------------------- */

describe('CalloutBox markdown links — multiple links', () => {
  const text =
    'Our [COA guide](/how-to-read-peptide-certificate-of-analysis) walks through it, and the [storage guide](/peptide-storage) covers handling.'

  it('renders every link in one callout', () => {
    renderCallout(text)
    expect(document.querySelectorAll('a').length).toBe(2)
    expect(
      document.querySelector('a[href="/how-to-read-peptide-certificate-of-analysis"]')?.textContent,
    ).toBe('COA guide')
    expect(document.querySelector('a[href="/peptide-storage"]')?.textContent).toBe('storage guide')
  })

  it('keeps the connecting prose between links', () => {
    renderCallout(text)
    expect(visibleText()).toContain(' walks through it, and the ')
    expect(visibleText()).toContain(' covers handling.')
    expect(visibleText()).not.toContain('](')
  })

  it('handles back-to-back links with no text between them', () => {
    renderCallout('[one](/a)[two](/b)')
    expect(document.querySelectorAll('a').length).toBe(2)
    expect(visibleText()).toContain('onetwo')
  })
})

/* ---------------------------- plain text ----------------------------- */

describe('CalloutBox markdown links — plain text unchanged', () => {
  it('renders a plain callout with no anchors at all', () => {
    renderCallout('Store the vial cool and dry. No links in this note.')
    expect(document.querySelectorAll('a').length).toBe(0)
    expect(screen.getByText('Store the vial cool and dry. No links in this note.')).toBeTruthy()
  })

  it('keeps the existing shell, icon and prose classes', () => {
    renderCallout('Plain note', { style: 'warning' })
    const box = Array.from(document.querySelectorAll('div')).find((d) =>
      d.className.includes('rounded-[1.25rem]'),
    )
    expect(box?.className).toContain('p-6 sm:p-7')
    expect(box?.className).toContain('flex items-start gap-3.5')
    expect(box?.className).toContain('bg-warning-bg')
    expect(box?.querySelector('svg')).not.toBeNull()
    expect(screen.getByText('Plain note').className).toBe(
      'text-sm sm:text-base text-ink-soft leading-relaxed',
    )
  })

  it('leaves unrelated square brackets and parentheses alone', () => {
    renderCallout('Values [A] and (B) are separate. See note [1].')
    expect(document.querySelectorAll('a').length).toBe(0)
    expect(visibleText()).toContain('Values [A] and (B) are separate. See note [1].')
  })
})

/* -------------------------- malformed input -------------------------- */

describe('CalloutBox markdown links — malformed markdown is safe', () => {
  const malformed = [
    'Unclosed [label](/path',
    'No href [label]()',
    'Empty label [](/path)',
    'Whitespace label [   ](/path)',
    'Stray bracket ] and ( here',
    'Reversed (label)[/path]',
    'Nested [a [b] c](/path)',
  ]

  it('never throws and never emits a broken anchor', () => {
    for (const text of malformed) {
      expect(() => renderCallout(text)).not.toThrow()
      cleanup()
    }
  })

  it('leaves unclosed syntax as literal text', () => {
    renderCallout('Unclosed [label](/path')
    expect(document.querySelectorAll('a').length).toBe(0)
    expect(visibleText()).toContain('Unclosed [label](/path')
  })

  it('does not create an invisible anchor from an empty label', () => {
    renderCallout('Empty label [](/path) end')
    expect(document.querySelectorAll('a').length).toBe(0)
    expect(visibleText()).toContain('[](/path)')
  })

  it('does not treat an empty href as a link', () => {
    renderCallout('No href [label]() end')
    expect(document.querySelectorAll('a').length).toBe(0)
  })
})

/* ---------------------------- empty content --------------------------- */

describe('CalloutBox markdown links — empty content', () => {
  it('handles an empty string without throwing', () => {
    expect(() => renderCallout('')).not.toThrow()
    expect(document.querySelectorAll('a').length).toBe(0)
  })

  it('parser returns an empty array for empty or non-string input', () => {
    expect(parseMarkdownLinks('')).toEqual([])
    expect(parseMarkdownLinks(undefined)).toEqual([])
    expect(parseMarkdownLinks(null)).toEqual([])
    expect(parseMarkdownLinks(42)).toEqual([])
    expect(parseMarkdownLinks({})).toEqual([])
  })

  it('whitespace-only text produces no links', () => {
    expect(hasMarkdownLink('   \n ')).toBe(false)
  })
})

/* --------------------------- safe rendering --------------------------- */

describe('CalloutBox markdown links — safe link rendering', () => {
  const unsafe = [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    '//evil.example.com',
  ]

  it('rejects dangerous schemes in isSafeHref', () => {
    for (const href of unsafe) expect(isSafeHref(href)).toBe(false)
  })

  it('strips control characters before checking the scheme', () => {
    expect(isSafeHref('java\tscript:alert(1)')).toBe(false)
    expect(isSafeHref(' javascript:alert(1)')).toBe(false)
    expect(isSafeHref('\u0000javascript:alert(1)')).toBe(false)
  })

  it('accepts the schemes we do allow', () => {
    for (const href of [
      '/path',
      '#frag',
      '?q=1',
      'https://x.com',
      'http://x.com',
      'mailto:a@b.c',
      'tel:+1',
    ])
      expect(isSafeHref(href)).toBe(true)
  })

  it('never renders an anchor for a javascript: url, and keeps the raw text visible', () => {
    renderCallout('Click [here](javascript:alert(1)) now.')
    // No anchor at all, and crucially no href carrying the scheme. The raw characters DO
    // remain as inert text — that is deliberate: nothing is silently dropped, and an editor
    // can see the bad link. Text content cannot execute.
    expect(document.querySelectorAll('a').length).toBe(0)
    expect(document.querySelector('[href]')).toBeNull()
    expect(document.body.innerHTML).not.toContain('href="javascript:')
    expect(visibleText()).toContain('[here]')
  })

  it('never renders a protocol-relative anchor', () => {
    renderCallout('Go [there](//evil.example.com) now.')
    expect(document.querySelectorAll('a').length).toBe(0)
  })

  it('uses React elements, not raw HTML — markup in text is escaped', () => {
    renderCallout('Danger <img src=x onerror=alert(1)> and [ok](/safe).')
    expect(document.querySelector('img')).toBeNull()
    expect(visibleText()).toContain('<img src=x onerror=alert(1)>')
    expect(document.querySelector('a[href="/safe"]')).not.toBeNull()
  })
})

/* ------------------- link conventions match the converter ------------- */

describe('CalloutBox markdown links — matches existing link conventions', () => {
  it('applies the shared blog link class', () => {
    renderCallout('See the [guide](/guide).')
    expect(document.querySelector('a[href="/guide"]')?.className).toBe(
      'hover:text-ink transition-colors inline-flex items-start gap-1.5 underline underline-offset-4 decoration-ink/20 hover:decoration-ink/50',
    )
  })

  it('adds nofollow for competitor domains inside a callout', () => {
    const url = `https://${COMPETITOR_DOMAINS[3]}/article`
    renderCallout(`Compare with [their page](${url}).`)
    expect(document.querySelector(`a[href="${url}"]`)?.getAttribute('rel')).toContain('nofollow')
  })

  it('gives a same-tab internal link no rel at all', () => {
    renderCallout('Read the [guide](/guide).')
    expect(document.querySelector('a[href="/guide"]')?.getAttribute('rel')).toBeNull()
  })

  it('blogLinkRel matches the converter rules exactly', () => {
    expect(blogLinkRel('/internal')).toBeUndefined()
    expect(blogLinkRel('/internal', true)).toBe('noopener noreferrer')
    expect(blogLinkRel('https://peptidedosage.org/x')).toBe('noopener noreferrer nofollow')
    expect(blogLinkRel('https://peptidedosage.org/x', true)).toBe('noopener noreferrer nofollow')
  })
})

/* --------------------- unknown block fields are ignored --------------- */

describe('CalloutBox markdown links — unrecognised block fields', () => {
  it('ignores extra fields on the block and still renders text with links', () => {
    renderCallout('Fallback [link](/x) text', { somethingUnknown: { a: 1 } })
    expect(document.querySelector('a[href="/x"]')?.textContent).toBe('link')
    expect(visibleText()).toContain('Fallback')
  })
})

/* ----------------------------- parser unit ---------------------------- */

describe('parseMarkdownLinks — segment structure', () => {
  it('splits text/link/text in order', () => {
    expect(parseMarkdownLinks('a [b](/c) d')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'link', label: 'b', href: '/c' },
      { type: 'text', value: ' d' },
    ])
  })

  it('round-trips the visible text exactly', () => {
    const input =
      'Our [COA guide](/coa) walks through it, and the [storage guide](/store) covers handling.'
    const visible = parseMarkdownLinks(input)
      .map((s) => (s.type === 'link' ? s.label : s.value))
      .join('')
    expect(visible).toBe('Our COA guide walks through it, and the storage guide covers handling.')
  })

  it('returns a single text segment when there is nothing to link', () => {
    expect(parseMarkdownLinks('just words')).toEqual([{ type: 'text', value: 'just words' }])
  })
})
