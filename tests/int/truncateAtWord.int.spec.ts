import { describe, it, expect, afterEach, vi } from 'vitest'
import { truncateAtWord } from '@/lib/truncate'

/** Count the way the helper does, so assertions match its contract. */
const units = (s: string) =>
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s), (x) => x.segment)
        .length
    : Array.from(s).length

const RUO_RE = /research use only|\bRUO\b/i
const RUO_DESC =
  'SNAP-8 Spray (Acetyl Octapeptide-3), a prepared spray-format material for peptide chemistry and SNARE-complex studies. Research use only.'
const BODY =
  'Acetyl Octapeptide-3, known commercially as SNAP-8, is a synthetic eight-residue peptide with the sequence Ac-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH₂, reproducing residues 12 to 19 of the N-terminal region of the SNAP-25 protein.'

afterEach(() => vi.restoreAllMocks())

/* ----------------------------- length contract ---------------------------- */

describe('truncateAtWord — length contract', () => {
  it('returns text shorter than the limit unchanged, with no ellipsis', () => {
    expect(truncateAtWord('Short research note.', 160)).toBe('Short research note.')
  })

  it('returns text exactly at the limit unchanged, with no ellipsis', () => {
    const exact = 'x'.repeat(40)
    expect(truncateAtWord(exact, 40)).toBe(exact)
  })

  it('truncates text one character over the limit', () => {
    const out = truncateAtWord('abcde fghij klmno', 16)
    expect(out).toBe('abcde fghij…')
    expect(units(out)).toBeLessThanOrEqual(16)
  })

  it('never exceeds max across a wide sweep of limits and suffixes', () => {
    for (const suffix of ['…', '...', ' [more]', '']) {
      for (let max = 1; max <= 80; max++) {
        const out = truncateAtWord(RUO_DESC, max, { suffix })
        expect(units(out)).toBeLessThanOrEqual(max)
      }
    }
  })

  it('never exceeds max when the suffix is longer than the limit', () => {
    for (let max = 1; max <= 8; max++) {
      const out = truncateAtWord(RUO_DESC, max, { suffix: ' [read more]' })
      expect(units(out)).toBeLessThanOrEqual(max)
    }
  })
})

/* ------------------------------ word boundaries --------------------------- */

describe('truncateAtWord — word boundaries', () => {
  it('never splits a word that crosses the limit', () => {
    expect(truncateAtWord('Acetyl Octapeptide-3 reproducing residues', 25)).toBe(
      'Acetyl Octapeptide-3…',
    )
  })

  it('prefers a sentence ending near the limit', () => {
    const out = truncateAtWord('Supplied as a solution. Research use only, see the lot docs.', 30)
    expect(out).toBe('Supplied as a solution.')
    expect(out.endsWith('…')).toBe(false)
  })

  it('collapses multiple spaces and newlines', () => {
    expect(truncateAtWord('Line one.\n\n   Line two   has    gaps.', 25)).toBe(
      'Line one. Line two has…',
    )
  })
})

/* --------------------------- dangling punctuation ------------------------- */

describe('truncateAtWord — no dangling punctuation', () => {
  const cases: [string, string, number][] = [
    ['comma', 'peptide chemistry, SNARE-complex research, analytical method', 20],
    ['semicolon', 'Research use only; not for human consumption', 20],
    ['en dash', 'Research use only – laboratory material', 20],
    ['hyphen', 'spray-format material - prepared solution', 26],
    ['colon', 'Identity check: sequence confirmation and documentation', 20],
  ]

  it.each(cases)('strips a trailing %s before the ellipsis', (_label, input, max) => {
    const out = truncateAtWord(input, max)
    expect(out).not.toMatch(/[\s,;:–—-]…$/u)
    expect(out.endsWith('…')).toBe(true)
  })

  it('never emits a period immediately before the ellipsis', () => {
    // Regression: an early version produced "...studies.…"
    const out = truncateAtWord(RUO_DESC, 120, { protect: RUO_RE })
    expect(out).not.toContain('.…')
    expect(out.endsWith('…')).toBe(true)
  })

  it('leaves a sentence-final period intact when not appending an ellipsis', () => {
    expect(truncateAtWord('Supplied as a solution. Extra wording follows here.', 30)).toBe(
      'Supplied as a solution.',
    )
  })
})

/* ------------------------------- abbreviations ---------------------------- */

describe('truncateAtWord — abbreviations are not sentence ends', () => {
  it('does not cut at "U.S."', () => {
    expect(truncateAtWord('Approved by the U.S. Food and Drug Administration elsewhere.', 40)).toBe(
      'Approved by the U.S. Food and Drug…',
    )
  })

  it('does not cut at a decimal point', () => {
    expect(truncateAtWord('Purity is 99.5% by HPLC and the lot documentation confirms it.', 40)).toBe(
      'Purity is 99.5% by HPLC and the lot…',
    )
  })

  it('does not cut at "Fig."', () => {
    const out = truncateAtWord('See Fig. 2 for the chromatogram and identity data here.', 40)
    expect(out.startsWith('See Fig. 2 for the chromatogram')).toBe(true)
  })
})

/* ---------------------------------- unicode -------------------------------- */

describe('truncateAtWord — unicode', () => {
  it('keeps a subscript character intact', () => {
    expect(truncateAtWord('Sequence Ac-Glu-NH₂ reproducing residues', 25)).toBe(
      'Sequence Ac-Glu-NH₂…',
    )
  })

  it('never leaves a lone surrogate', () => {
    const out = truncateAtWord('Research 🧪 material for laboratory use only', 14)
    expect(/[\uD800-\uDBFF]$/.test(out)).toBe(false)
    expect(units(out)).toBeLessThanOrEqual(14)
  })

  it('does not split a ZWJ emoji sequence when Intl.Segmenter is available', () => {
    const out = truncateAtWord('Family 👩‍👩‍👧 group photo', 12)
    expect(out.endsWith('…')).toBe(true)
    // Either the whole family survives, or it is dropped — never half of it.
    const hasPartial = out.includes('‍') && !out.includes('👧')
    expect(hasPartial).toBe(false)
  })

  it('keeps a combining accent attached to its base letter', () => {
    const out = truncateAtWord('Café solution reproducing residues', 10)
    expect(out.startsWith('Café')).toBe(true)
  })

  it('falls back safely when Intl.Segmenter is unavailable', () => {
    const original = Intl.Segmenter
    try {
      // @ts-expect-error — simulating a runtime without Segmenter (e.g. a lean edge runtime)
      delete Intl.Segmenter
      const out = truncateAtWord('Research 🧪 material for laboratory use', 14)
      expect(typeof out).toBe('string')
      expect(/[\uD800-\uDBFF]$/.test(out)).toBe(false)
      expect(Array.from(out).length).toBeLessThanOrEqual(14)
    } finally {
      // @ts-expect-error — restoring the real implementation
      Intl.Segmenter = original
    }
  })
})

/* --------------------------- long unbroken tokens -------------------------- */

describe('truncateAtWord — long unbroken tokens', () => {
  it('hard-cuts a single unbroken token rather than returning nothing', () => {
    const out = truncateAtWord('A'.repeat(200), 30)
    expect(units(out)).toBe(30)
    expect(out.endsWith('…')).toBe(true)
  })

  it('keeps information when a long token follows a short prefix', () => {
    // A pure word-boundary cut would return just "Seq…", discarding the budget.
    const out = truncateAtWord('Seq ' + 'B'.repeat(200), 20)
    expect(units(out)).toBe(20)
    expect(out.startsWith('Seq ')).toBe(true)
  })

  it('does not hard-cut when a reasonable word boundary exists', () => {
    const source = 'alpha beta gamma delta epsilon zeta eta theta'
    const out = truncateAtWord(source, 24)
    expect(out).toBe('alpha beta gamma delta…')
    // "not a severed word" means the kept text is a whole-word prefix of the source:
    // the source continues with a space at exactly that point.
    const kept = out.slice(0, -1)
    expect(source.startsWith(kept)).toBe(true)
    expect(source[kept.length]).toBe(' ')
  })
})

/* ------------------------------ empty / invalid ---------------------------- */

describe('truncateAtWord — empty and invalid input', () => {
  it.each([
    ['empty string', ''],
    ['whitespace only', '   \n  '],
  ])('returns an empty string for %s', (_label, input) => {
    expect(truncateAtWord(input, 160)).toBe('')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['number', 42],
    ['object', {}],
  ])('returns an empty string for %s', (_label, input) => {
    expect(truncateAtWord(input, 160)).toBe('')
  })

  it('returns an empty string for a non-positive or invalid max', () => {
    expect(truncateAtWord('some text', 0)).toBe('')
    expect(truncateAtWord('some text', -5)).toBe('')
    expect(truncateAtWord('some text', Number.NaN)).toBe('')
  })
})

/* --------------------------------- protect --------------------------------- */

describe('truncateAtWord — protected wording', () => {
  it('keeps RUO wording when the whole description fits', () => {
    const out = truncateAtWord(RUO_DESC, 160, { protect: RUO_RE })
    expect(out).toBe(RUO_DESC)
    expect(RUO_RE.test(out)).toBe(true)
  })

  it('keeps RUO wording at exactly its own length', () => {
    const out = truncateAtWord(RUO_DESC, 137, { protect: RUO_RE })
    expect(RUO_RE.test(out)).toBe(true)
  })

  it('never returns a complete-looking sentence after dropping RUO wording', () => {
    for (const max of [110, 120, 130]) {
      const out = truncateAtWord(RUO_DESC, max, { protect: RUO_RE })
      if (!RUO_RE.test(out)) {
        // The loss must be visible: ends in an ellipsis, not a full stop.
        expect(out.endsWith('…')).toBe(true)
        expect(out).not.toMatch(/\.$/)
      }
    }
  })

  it('without protect, a sentence cut can silently drop RUO wording', () => {
    // Documents why `protect` exists; the OG badge is what actually guarantees RUO.
    const out = truncateAtWord(RUO_DESC, 120)
    expect(RUO_RE.test(out)).toBe(false)
    expect(out.endsWith('.')).toBe(true)
  })

  it('does not interfere when the protected wording is absent from the source', () => {
    const out = truncateAtWord(BODY, 160, { protect: RUO_RE })
    expect(units(out)).toBeLessThanOrEqual(160)
    expect(out.length).toBeGreaterThan(0)
  })
})

/* ------------------------------- call sites -------------------------------- */

describe('truncateAtWord — call-site configurations', () => {
  it('product metadata fallback (160, protect) produces whole words', () => {
    const out = truncateAtWord(BODY, 160, { protect: RUO_RE })
    expect(units(out)).toBeLessThanOrEqual(160)
    expect(out).not.toMatch(/\breproducing r$/) // the exact production defect
    expect(out.endsWith('…')).toBe(true)
  })

  it('OG description (120, no sentence preference) produces whole words', () => {
    const out = truncateAtWord(RUO_DESC, 120, { sentenceThreshold: 0 })
    expect(units(out)).toBeLessThanOrEqual(120)
    expect(out.endsWith('…')).toBe(true)
    expect(out).not.toMatch(/studies\. R$/) // the exact production defect
  })

  it('featured cards (120, three-dot suffix) keep the existing styling', () => {
    const out = truncateAtWord(BODY, 120, { suffix: '...' })
    expect(out.endsWith('...')).toBe(true)
    expect(out.endsWith('…')).toBe(false)
    expect(units(out)).toBeLessThanOrEqual(120)
  })

  it('featured cards leave short descriptions untouched', () => {
    expect(truncateAtWord('Short description.', 120, { suffix: '...' })).toBe('Short description.')
  })
})
