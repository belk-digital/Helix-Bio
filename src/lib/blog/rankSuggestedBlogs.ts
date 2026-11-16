/**
 * Ranks the "suggested blogs" shown on a product page by topical relevance to that product,
 * using publication date only as a tie-breaker.
 *
 * Why this exists: the product page used to take the three *newest* posts that referenced the
 * product (`sort: '-publishedAt'`, `limit: 3`). Being "related" was binary, so once more than
 * three posts referenced a product, recency alone decided. A generic post that tags a popular
 * product therefore evicts the article actually written about it — e.g. every topical BPC-157
 * article was pushed out by three generic posts published on the same day.
 *
 * Signals are limited to fields that already exist and are already populated on the BlogPosts
 * collection (focusKeyphrase 99%, title 100%, keywords 99%). No schema change, no new CMS field.
 *
 * Deliberately NOT done: aliasing renamed products to their former compound names (GLP-3RTA ->
 * "Retatrutide", GLP-1TRZ -> "Tirzepatide"). Those posts still use the old names, so those two
 * products score zero here and fall back to date order. Asserting the equivalence would be a
 * pharmacological claim this module has no basis to make; it needs an explicit, approved alias.
 */

/** Points awarded per field when the product name matches. Tuned by hand, not derived. */
export const RELEVANCE_WEIGHTS = {
  /** The post's primary target query — the most deliberate topical signal an editor sets. */
  focusKeyphrase: 4,
  /** The headline. Strong, but broader than the keyphrase. */
  title: 3,
  /** Comma-separated secondary terms; weakest, often shared between loosely related posts. */
  keywords: 1,
} as const

/** Never show more than this many suggestions (matches the previous behaviour and the UI). */
export const MAX_SUGGESTED_BLOGS = 3

/**
 * Upper bound on posts fetched for ranking. Ranking must see every match, so the caller can no
 * longer pass `limit: 3` — but Payload's default limit is 10, so an explicit bound is required.
 * The busiest product currently has 13 related posts.
 */
export const MAX_BLOG_CANDIDATES = 100

/**
 * Minimal shape this module needs. Every field is optional because stored data may omit it.
 *
 * Deliberately no index signature: adding one would make Payload's generated `BlogPost` type
 * fail to satisfy this (a named type without an index signature is not assignable to one that
 * has it), forcing a cast at the call site. Structural typing already allows extra fields.
 */
export type RankableBlogPost = {
  id?: string | number | null
  title?: string | null
  focusKeyphrase?: string | null
  keywords?: string | null
  publishedAt?: string | null
}

/**
 * Entry separators for list-style fields. `keywords` is a comma-separated list, so two adjacent
 * entries are not adjacent *words* — "lipo, c-peptide" must not satisfy the product "Lipo-C".
 *
 * `/` is deliberately absent: product names legitimately contain it ("CJC-1295 / Ipamorelin"),
 * and splitting there would break those matches. Same reasoning for `-` and whitespace, which
 * tokenization already handles. Titles and keyphrases are single entries in practice, so
 * segmenting is a no-op for them.
 */
const SEGMENT_SEPARATORS = /[,;|]+/

/**
 * Lowercase, then split on anything that is not a letter or digit.
 *
 * Tokens rather than a squashed string on purpose: naive substring matching produces real false
 * positives in this catalogue. "NAD+" would match inside "ca-nad-a", "VIP" inside "vip-like",
 * "Glow" inside "glowing". Matching whole tokens rules those out; matching within one entry
 * (see SEGMENT_SEPARATORS) additionally rules out adjacency manufactured by a list separator.
 */
function tokenize(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

/** True when `needle` appears as a contiguous run of tokens inside `haystack`. */
function containsTokenSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0 || haystack.length < needle.length) return false
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let hit = true
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        hit = false
        break
      }
    }
    if (hit) return true
  }
  return false
}

/**
 * Does `text` mention the product?
 *
 * The match must sit inside a single list entry (see SEGMENT_SEPARATORS), in one of two
 * boundary-safe forms:
 *   1. the name's tokens appear consecutively — "BPC-157" matches "what is bpc 157 peptide";
 *   2. the name squashed to one token appears as a whole token — "BPC-157" matches "bpc157".
 *
 * A name that squashes to a single character is rejected: one letter carries no topical signal
 * and would match far too much.
 */
export function mentionsProduct(text: unknown, nameTokens: string[]): boolean {
  if (nameTokens.length === 0) return false
  const squashed = nameTokens.join('')
  if (squashed.length < 2) return false
  if (typeof text !== 'string') return false

  return text.split(SEGMENT_SEPARATORS).some((segment) => {
    const segmentTokens = tokenize(segment)
    if (segmentTokens.length === 0) return false

    if (containsTokenSequence(segmentTokens, nameTokens)) return true
    return nameTokens.length > 1 && segmentTokens.includes(squashed)
  })
}

/**
 * Relevance of one post to one product. 0 means "related, but not about this product" — those
 * posts keep their place in date order rather than being dropped.
 */
export function scoreBlogPost(post: RankableBlogPost, productName: unknown): number {
  const nameTokens = tokenize(productName)
  if (nameTokens.length === 0) return 0

  let score = 0
  if (mentionsProduct(post?.focusKeyphrase, nameTokens)) score += RELEVANCE_WEIGHTS.focusKeyphrase
  if (mentionsProduct(post?.title, nameTokens)) score += RELEVANCE_WEIGHTS.title
  if (mentionsProduct(post?.keywords, nameTokens)) score += RELEVANCE_WEIGHTS.keywords
  return score
}

/** Epoch millis for sorting; unparseable or missing dates sort last rather than throwing. */
function publishedTime(post: RankableBlogPost): number {
  const raw = post?.publishedAt
  if (typeof raw !== 'string' && typeof raw !== 'number') return 0
  const ms = new Date(raw).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

/** Stable last-resort key so equal posts never reorder between renders. */
function identity(post: RankableBlogPost): string {
  return String(post?.id ?? '')
}

/**
 * Relevance first, newest-first as the tie-breaker, id as a final stabiliser.
 *
 * With no scoring match anywhere the result is exactly the previous date-ordered behaviour,
 * so products whose posts never name them are unaffected.
 */
export function rankSuggestedBlogs<T extends RankableBlogPost>(
  posts: readonly T[],
  productName: unknown,
  limit: number = MAX_SUGGESTED_BLOGS,
): T[] {
  if (!Array.isArray(posts) || posts.length === 0) return []

  const scored = posts.map((post) => ({ post, score: scoreBlogPost(post, productName) }))

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      publishedTime(b.post) - publishedTime(a.post) ||
      identity(a.post).localeCompare(identity(b.post)),
  )

  return scored.slice(0, Math.max(0, limit)).map((entry) => entry.post)
}
