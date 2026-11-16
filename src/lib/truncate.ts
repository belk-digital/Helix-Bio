/**
 * Word-boundary truncation for metadata, OG imagery and card copy.
 *
 * A plain `slice`/`substring` cuts mid-word, which is how a product meta description
 * ended up reading "...SNARE-complex studies. R" in production. Worse, for descriptions
 * that close on a research-use-only statement, an arbitrary cut can delete that
 * statement while leaving text that looks deliberately written.
 *
 * This helper never splits a word, never leaves dangling punctuation, and — through
 * `protect` — refuses to produce a result that *looks* complete when wording that must
 * survive did not. It cannot make text fit: when the protected wording genuinely does
 * not fit, the output ends in an ellipsis so the truncation is visible rather than
 * silent. Guaranteeing such wording is the job of the surface itself (the OG template
 * carries a permanent RESEARCH USE ONLY badge for exactly this reason).
 */

/** Characters that must not be left dangling at a cut. */
const DANGLING = /[\s,;:·•\-–—/(["'“‘]+$/u
/** Also strip sentence punctuation when an ellipsis follows, so we never emit ".…". */
const BEFORE_SUFFIX = /[\s.!?,;:·•\-–—/(["'“‘]+$/u
/** Abbreviations and initials that must not be mistaken for a sentence end. */
const ABBREV = /(?:^|\s)(?:[A-Z]|e\.g|i\.e|cf|vs|approx|Fig|No|St|Dr|Mr|Mrs|Ms|Inc|Ltd|Co|et al|U\.S|U\.K)\.$/u

export type TruncateOptions = {
  /** Appended when text was cut. Default '…'. Pass '...' to match existing card styling. */
  suffix?: string
  /**
   * Prefer ending on a complete sentence when one falls at or after
   * `max * sentenceThreshold`. Set to 0 to disable sentence preference entirely.
   * Default 0.6.
   */
  sentenceThreshold?: number
  /**
   * When a word-boundary cut would keep less than this fraction of the budget — which
   * happens when one very long unbroken token follows a short prefix — fall back to a
   * hard cut so the result still carries information. This only ever *adds* a partial
   * token; it never drops a whole word that would otherwise have been kept.
   * Default 0.6.
   */
  minWordCutRatio?: number
  /**
   * Wording that must not be dropped silently. If it is present in the source but
   * would be absent from a sentence-boundary cut, sentence preference is disabled so
   * the result ends in an ellipsis instead of reading as finished prose.
   */
  protect?: RegExp
}

/**
 * Split into grapheme clusters where the runtime supports it, else code points.
 *
 * `Intl.Segmenter` is available in Node 18+ but is not guaranteed in every edge
 * runtime, and this module is imported by an `edge` route. Feature detection plus a
 * try/catch keeps the fallback (code points, via `Array.from`) always safe: surrogate
 * pairs stay intact either way, and only multi-code-point clusters such as ZWJ emoji
 * sequences lose their grouping.
 */
function units(s: string): string[] {
  try {
    const seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter
    if (typeof seg === 'function') {
      return Array.from(new seg('en', { granularity: 'grapheme' }).segment(s), (x) => x.segment)
    }
  } catch {
    // fall through to code points
  }
  return Array.from(s)
}

/**
 * Truncate `text` to at most `max` units without splitting a word.
 *
 * Returns '' for empty, whitespace-only or non-string input, and returns the input
 * unchanged (no ellipsis) when it already fits. The result never exceeds `max`.
 */
export function truncateAtWord(text: unknown, max: number, options: TruncateOptions = {}): string {
  const {
    suffix = '…',
    sentenceThreshold = 0.6,
    minWordCutRatio = 0.6,
    protect,
  } = options

  if (typeof text !== 'string') return ''
  const clean = text.replace(/\s+/gu, ' ').trim()
  if (clean === '' || !Number.isFinite(max) || max <= 0) return ''

  const chars = units(clean)
  if (chars.length <= max) return clean

  const sufUnits = units(suffix)
  // A suffix that cannot fit would push the result past `max`; cut plainly instead.
  if (sufUnits.length >= max) return chars.slice(0, max).join('')
  const budget = max - sufUnits.length

  // One unit wider than the budget, so a word ending exactly on the budget is visible.
  const window = chars.slice(0, budget + 1).join('')

  // 1. Prefer a complete sentence, so the result reads as finished prose.
  let sentenceEnd = -1
  if (sentenceThreshold > 0) {
    for (const m of window.matchAll(/[.!?](?=\s|$)/gu)) {
      const upto = window.slice(0, m.index + 1)
      if (ABBREV.test(upto)) continue
      sentenceEnd = m.index + 1
    }
    if (sentenceEnd >= Math.floor(max * sentenceThreshold)) {
      const candidate = window.slice(0, sentenceEnd)
      // Only accept it when nothing that must survive would be lost.
      if (!protect || !protect.test(clean) || protect.test(candidate)) return candidate
    }
  }

  // 2. Cut at the last word boundary within budget.
  const lastSpace = window.lastIndexOf(' ')
  const wordCut = lastSpace > 0 ? window.slice(0, lastSpace).replace(DANGLING, '') : ''

  // 3. A short prefix followed by one very long token leaves almost nothing; a hard cut
  //    carries more of the text. Never triggered when a reasonable boundary exists.
  if (units(wordCut).length < Math.floor(budget * minWordCutRatio)) {
    const hard = chars.slice(0, budget).join('').replace(BEFORE_SUFFIX, '')
    return (hard === '' ? chars.slice(0, budget).join('') : hard) + suffix
  }

  return wordCut.replace(BEFORE_SUFFIX, '') + suffix
}
