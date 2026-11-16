import { describe, it, expect } from 'vitest'
import {
  rankSuggestedBlogs,
  scoreBlogPost,
  mentionsProduct,
  RELEVANCE_WEIGHTS,
  MAX_SUGGESTED_BLOGS,
  MAX_BLOG_CANDIDATES,
  type RankableBlogPost,
} from '@/lib/blog/rankSuggestedBlogs'

/* ------------------------------------------------------------------ *
 * Fixtures mirror real stored rows (slug, title, focusKeyphrase,
 * keywords, publishedAt) for the products named in the investigation.
 * ------------------------------------------------------------------ */

/** Fixtures carry a `slug` so assertions stay readable; the ranker only needs the base fields. */
type TestPost = RankableBlogPost & { slug: string }

const post = (
  slug: string,
  title: string,
  focusKeyphrase: string,
  publishedAt: string,
  keywords = '',
): TestPost => ({ id: slug, slug, title, focusKeyphrase, keywords, publishedAt })

const slugs = (posts: TestPost[]) => posts.map((p) => p.slug)

// The three generic posts published 2026-11-14/15 that currently occupy every slot.
const GENERIC = [
  post(
    'best-peptide-affiliate-programs',
    'Best Peptide Affiliate Programs',
    'best peptide affiliate programs',
    '2026-11-15T00:00:00.000Z',
  ),
  post(
    'are-peptides-research-chemicals',
    'Are Peptides Research Chemicals?',
    'are peptides research chemicals',
    '2026-11-14T00:00:00.000Z',
  ),
  post(
    'verify-peptide-lab-testing-iso-17025-coa-mismatch',
    'How to Verify a Peptide Lab',
    'how to verify a peptide lab',
    '2026-11-14T00:00:00.000Z',
  ),
  post(
    'research-peptide-account-requirements-documentation',
    'Research Peptide Account Requirements',
    'research peptide account requirements',
    '2026-11-14T00:00:00.000Z',
  ),
]

describe('rankSuggestedBlogs — BPC-157', () => {
  // Real titles/keyphrases; all topical posts predate the generic ones.
  const topical = [
    post(
      'oral-bpc-157-bioavailability-evidence',
      'Oral BPC-157 Bioavailability Evidence',
      'oral BPC-157 bioavailability',
      '2026-09-29T00:00:00.000Z',
    ),
    post(
      'what-is-bpc-157-peptide-structure-mechanism-evidence',
      'What Is BPC-157 Peptide? Structure, Mechanism and Evidence',
      'what is bpc 157 peptide',
      '2026-09-15T00:00:00.000Z',
    ),
    post(
      'bpc-157-vs-tb-500-direct-comparison-research',
      'BPC-157 vs TB-500: Direct Comparison',
      'bpc 157 vs tb 500',
      '2026-08-22T00:00:00.000Z',
    ),
  ]

  it('ranks topical BPC-157 articles above newer generic posts', () => {
    const ranked = rankSuggestedBlogs([...GENERIC, ...topical], 'BPC-157')
    expect(slugs(ranked)).toEqual([
      'oral-bpc-157-bioavailability-evidence',
      'what-is-bpc-157-peptide-structure-mechanism-evidence',
      'bpc-157-vs-tb-500-direct-comparison-research',
    ])
    // None of the generic posts survive into the top three.
    expect(slugs(ranked).some((s) => s?.toString().startsWith('are-peptides'))).toBe(false)
  })

  it('matches the hyphen/space variant "bpc 157" in a keyphrase', () => {
    const p = topical[1]
    expect(scoreBlogPost(p, 'BPC-157')).toBe(
      RELEVANCE_WEIGHTS.focusKeyphrase + RELEVANCE_WEIGHTS.title,
    )
  })
})

describe('rankSuggestedBlogs — Semaglutide', () => {
  const comparisons = [
    post(
      'retatrutide-vs-tirzepatide-vs-semaglutide-agonists-compared',
      'Retatrutide vs Tirzepatide vs Semaglutide: Agonists Compared',
      'retatrutide vs tirzepatide vs semaglutide',
      '2026-08-15T00:00:00.000Z',
    ),
    post(
      'glp-1-gip-agonists-semaglutide-tirzepatide-retatrutide-research',
      'Semaglutide vs. Tirzepatide vs. Retatrutide: Trial Data Compared',
      'semaglutide vs tirzepatide vs retatrutide',
      '2026-08-04T00:00:00.000Z',
    ),
  ]

  it('ranks both GLP comparison articles above unrelated generic posts', () => {
    const ranked = rankSuggestedBlogs([...GENERIC, ...comparisons], 'Semaglutide')
    expect(slugs(ranked).slice(0, 2)).toEqual([
      'retatrutide-vs-tirzepatide-vs-semaglutide-agonists-compared',
      'glp-1-gip-agonists-semaglutide-tirzepatide-retatrutide-research',
    ])
    // Third slot falls to the newest zero-scoring post — date order, as before.
    expect(slugs(ranked)[2]).toBe('best-peptide-affiliate-programs')
  })
})

describe('rankSuggestedBlogs — Melanotan-1 (already correct, must not change)', () => {
  const related = [
    post(
      'melanotan-1-vs-melanotan-2-receptor-data',
      'Melanotan 1 vs Melanotan 2: Receptor Data',
      'melanotan 1 vs melanotan 2',
      '2026-10-20T00:00:00.000Z',
    ),
    post(
      'melanotan-1-research-mc1r-afamelanotide',
      'Melanotan-1 Research: MC1R and Afamelanotide',
      'melanotan 1 research',
      '2026-09-10T00:00:00.000Z',
    ),
    post(
      'pt-141-vs-melanotan-ii-melanocortin-receptor-research',
      'PT-141 vs Melanotan II: Melanocortin Receptor Research',
      'pt 141 vs melanotan ii',
      '2026-08-22T00:00:00.000Z',
    ),
  ]

  it('returns the identical order it produced before the change', () => {
    expect(slugs(rankSuggestedBlogs(related, 'Melanotan-1'))).toEqual(slugs(related))
  })
})

describe('zero-score behaviour', () => {
  it('falls back to pure date order when nothing names the product', () => {
    const ranked = rankSuggestedBlogs(GENERIC, 'Thymosin Alpha-1')
    expect(ranked.every((p) => scoreBlogPost(p, 'Thymosin Alpha-1') === 0)).toBe(true)
    expect(slugs(ranked)).toEqual([
      'best-peptide-affiliate-programs',
      'are-peptides-research-chemicals',
      'research-peptide-account-requirements-documentation',
    ])
  })

  it('is deterministic when score and date both tie', () => {
    const a = post('aaa', 'X', 'x', '2026-01-01T00:00:00.000Z')
    const b = post('bbb', 'Y', 'y', '2026-01-01T00:00:00.000Z')
    expect(slugs(rankSuggestedBlogs([b, a], 'Nothing'))).toEqual(['aaa', 'bbb'])
    expect(slugs(rankSuggestedBlogs([a, b], 'Nothing'))).toEqual(['aaa', 'bbb'])
  })
})

describe('no related posts', () => {
  it('returns an empty array so the caller’s site-wide fallback still fires', () => {
    expect(rankSuggestedBlogs([], 'BPC-157')).toEqual([])
    expect(rankSuggestedBlogs(undefined as never, 'BPC-157')).toEqual([])
  })
})

describe('missing metadata is safe', () => {
  it('does not throw on absent title, keyphrase, keywords or date', () => {
    const broken: RankableBlogPost[] = [
      { id: '1' },
      { id: '2', title: null, focusKeyphrase: null, keywords: null, publishedAt: null },
      { id: '3', title: 'BPC-157 Research', publishedAt: 'not-a-date' },
      { id: '4', publishedAt: '2026-05-05T00:00:00.000Z' },
    ]
    expect(() => rankSuggestedBlogs(broken, 'BPC-157')).not.toThrow()
    // The only post that names the product still wins despite its unparseable date.
    expect(rankSuggestedBlogs(broken, 'BPC-157')[0].id).toBe('3')
  })

  it('scores zero for an empty or non-string product name', () => {
    const p = post('x', 'BPC-157 Research', 'bpc 157', '2026-01-01T00:00:00.000Z')
    expect(scoreBlogPost(p, '')).toBe(0)
    expect(scoreBlogPost(p, null)).toBe(0)
    expect(scoreBlogPost(p, undefined)).toBe(0)
  })
})

describe('normalization', () => {
  it('matches across punctuation and spacing variants', () => {
    const tokens = ['bpc', '157']
    for (const text of ['BPC-157', 'bpc 157', 'BPC–157', 'bpc.157', '  BPC   157  ', 'bpc157']) {
      expect(mentionsProduct(text, tokens)).toBe(true)
    }
  })

  it('matches multi-token names with punctuation, e.g. GHK-CU and MOTS-C', () => {
    expect(mentionsProduct('ghk cu copper peptide', ['ghk', 'cu'])).toBe(true)
    expect(mentionsProduct('GHK-Cu dosage guide', ['ghk', 'cu'])).toBe(true)
    expect(mentionsProduct('mots c mitochondrial research', ['mots', 'c'])).toBe(true)
  })
})

describe('false-positive protection', () => {
  it('does not match a short name inside an unrelated word', () => {
    // "NAD+" -> ["nad"] must not match "canada" / "nadir" / "gonadal".
    expect(mentionsProduct('peptide sourcing in canada', ['nad'])).toBe(false)
    expect(mentionsProduct('gonadal research models', ['nad'])).toBe(false)
    expect(mentionsProduct('NAD+ research', ['nad'])).toBe(true)

    // "VIP" and "Glow" are real catalogue names.
    expect(mentionsProduct('vip-like peptide family', ['vip'])).toBe(true) // own token
    expect(mentionsProduct('glowing skin outcomes', ['glow'])).toBe(false)
    expect(mentionsProduct('Glow blend research', ['glow'])).toBe(true)
  })

  it('does not match Semax inside Semaglutide, or partial token runs', () => {
    expect(mentionsProduct('semaglutide trial data', ['semax'])).toBe(false)
    // "TB-500" must not match a bare "500".
    expect(mentionsProduct('500 mcg per vial', ['tb', '500'])).toBe(false)
    expect(mentionsProduct('tb 500 healing research', ['tb', '500'])).toBe(true)
  })

  it('rejects single-character names outright', () => {
    expect(mentionsProduct('c peptide research', ['c'])).toBe(false)
  })
})

describe('list-entry boundaries (D1)', () => {
  // `keywords` is a comma-separated list. Two adjacent entries are not adjacent words, so a
  // multi-token product name must not be satisfied by spanning an entry separator.
  it('does not match a multi-token name across comma-separated keyword entries', () => {
    expect(mentionsProduct('lipo, c-peptide, research', ['lipo', 'c'])).toBe(false)
    expect(mentionsProduct('ghk, cu, copper', ['ghk', 'cu'])).toBe(false)
    expect(mentionsProduct('tb, 500 mcg', ['tb', '500'])).toBe(false)
    expect(mentionsProduct('MOTS, C-terminal fragments', ['mots', 'c'])).toBe(false)
  })

  it('treats semicolons and pipes as entry separators too', () => {
    expect(mentionsProduct('lipo; c-peptide; research', ['lipo', 'c'])).toBe(false)
    expect(mentionsProduct('ghk | cu | copper', ['ghk', 'cu'])).toBe(false)
    expect(mentionsProduct('tb;500 mcg', ['tb', '500'])).toBe(false)
  })

  it('still matches when the whole name sits inside one entry', () => {
    expect(mentionsProduct('copper peptides, ghk-cu, collagen', ['ghk', 'cu'])).toBe(true)
    expect(mentionsProduct('shipping, does igf 1 lr3 need cold', ['igf', '1', 'lr3'])).toBe(true)
    expect(mentionsProduct('MOTS-c KPV Semax Epitalon compounding', ['mots', 'c'])).toBe(true)
  })

  it('does not split on slashes, so names containing "/" keep matching', () => {
    // Product "CJC-1295 / Ipamorelin" tokenizes to [cjc, 1295, ipamorelin].
    const cjc = ['cjc', '1295', 'ipamorelin']
    expect(mentionsProduct('CJC-1295 / Ipamorelin research', cjc)).toBe(true)
    expect(mentionsProduct('CJC-1295 Ipamorelin combination', cjc)).toBe(true)
    expect(mentionsProduct('CJC-1295 ipamorelin synergy evidence', cjc)).toBe(true)
    // ...but a comma between the parts is still a real boundary.
    expect(mentionsProduct('cjc-1295, ipamorelin', cjc)).toBe(false)
  })

  it('keeps the required legitimate matches intact', () => {
    expect(mentionsProduct('what is bpc 157 peptide', ['bpc', '157'])).toBe(true)
    expect(mentionsProduct('bpc157', ['bpc', '157'])).toBe(true)
    expect(mentionsProduct('mots-c research', ['mots', 'c'])).toBe(true)
  })

  it('single-token names are unaffected by segmentation', () => {
    expect(mentionsProduct('emideltide DSIP vote, compounding', ['dsip'])).toBe(true)
    expect(mentionsProduct('a, b, semax, c', ['semax'])).toBe(true)
    expect(mentionsProduct('peptide sourcing in canada', ['nad'])).toBe(false)
  })
})

describe('exported constants', () => {
  it('caps display at three and candidates well above the busiest product', () => {
    expect(MAX_SUGGESTED_BLOGS).toBe(3)
    expect(MAX_BLOG_CANDIDATES).toBeGreaterThanOrEqual(50)
    expect(rankSuggestedBlogs(GENERIC, 'Nothing')).toHaveLength(3)
  })
})
