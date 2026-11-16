import { describe, it, expect, afterEach, vi } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { PostRichText } from '@/components/blog/PostRichText'

// PostRichText's upload converter imports next/image. No fixture here contains an upload node.
vi.mock('next/image', () => ({ __esModule: true, default: () => null }))

afterEach(cleanup)

/* ------------------------------------------------------------------ *
 * Regression cover for the Lexical rendering path: the link converter's
 * target/rel rules, unrelated converters (tables), and the CalloutBox
 * style default. Node shapes are copied from real stored content.
 *
 * These moved here from calloutBoxRichText.int.spec.ts when the optional
 * CalloutBox `body` RichText field was removed; they never depended on it.
 * ------------------------------------------------------------------ */

const textNode = (text: string) => ({
  type: 'text',
  text,
  mode: 'normal',
  style: '',
  detail: 0,
  format: 0,
  version: 1,
})

const linkNode = (text: string, url: string, newTab = false) => ({
  type: 'link',
  version: 3,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields: { url, newTab, linkType: 'custom' },
  children: [textNode(text)],
})

const paragraph = (children: unknown[]) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  textFormat: 0,
  children,
})

const editorState = (children: unknown[]) => ({
  root: { type: 'root', version: 1, format: '', indent: 0, direction: 'ltr', children },
})

const renderContent = (children: unknown[]) =>
  render(React.createElement(PostRichText, { content: editorState(children) }))

/** The callout shell: the only element carrying the rounded-[1.25rem] class. */
const box = () =>
  Array.from(document.querySelectorAll('div')).find((d) =>
    d.className.includes('rounded-[1.25rem]'),
  )

describe('link converter behavior', () => {
  it('an article-level internal link is a plain anchor with no target or rel', () => {
    renderContent([paragraph([linkNode('calculator', '/peptide-calculator')])])
    const a = document.querySelector('a[href="/peptide-calculator"]')
    expect(a).not.toBeNull()
    expect(a?.getAttribute('target')).toBeNull()
    expect(a?.getAttribute('rel')).toBeNull()
  })

  it('newTab yields target=_blank and noopener', () => {
    renderContent([paragraph([linkNode('ext', 'https://example.com/x', true)])])
    const a = document.querySelector('a[href="https://example.com/x"]')
    expect(a?.getAttribute('target')).toBe('_blank')
    expect(a?.getAttribute('rel')).toContain('noopener')
  })

  it('competitor domains still get nofollow', () => {
    const url = 'https://peptidedosage.org/article'
    renderContent([paragraph([linkNode('competitor', url)])])
    expect(document.querySelector(`a[href="${url}"]`)?.getAttribute('rel')).toContain('nofollow')
  })

  it('still renders tables, so unrelated converters are untouched', () => {
    renderContent([
      {
        type: 'table',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        children: [
          {
            type: 'tablerow',
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: [
              {
                type: 'tablecell',
                version: 1,
                format: '',
                indent: 0,
                direction: 'ltr',
                headerState: 0,
                colSpan: 1,
                children: [paragraph([textNode('cell A')])],
              },
            ],
          },
        ],
      },
    ])
    expect(document.querySelector('table')).not.toBeNull()
    expect(document.body.textContent).toContain('cell A')
  })
})

describe('CalloutBox block converter', () => {
  it('defaults to the info style when style is omitted', () => {
    renderContent([
      {
        type: 'block',
        version: 2,
        format: '',
        fields: { id: 'x', blockName: '', blockType: 'calloutBox', text: 'PLAIN TEXT FALLBACK' },
      },
    ])
    expect(box()?.className).toContain('bg-info-bg')
  })
})
