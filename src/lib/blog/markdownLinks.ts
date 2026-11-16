/**
 * Renders the Markdown links that are already stored in plain-text blog fields.
 *
 * Why this exists: `CalloutBox.text` is a Payload `textarea`, so editors who wrote
 * `[label](/path)` got the literal characters on the page instead of a link — and search
 * engines saw no link at all. This turns that stored syntax into real anchors at render
 * time, with no CMS change and without asking anyone to re-save a post.
 *
 * Scope is deliberately one feature: inline links. This is NOT a Markdown renderer — bold,
 * italics, headings, images and code spans are left exactly as written. Keeping it to links
 * means there is no HTML to inject and nothing to sanitise beyond the URL itself.
 *
 * Output is data, not markup: the caller turns segments into React elements, so nothing is
 * ever passed to `dangerouslySetInnerHTML`.
 */

export type MarkdownSegment =
  { type: 'text'; value: string } | { type: 'link'; label: string; href: string }

/**
 * `[label](href)` where the label has no newline or `]`, and the href has no whitespace or `)`.
 *
 * Anything that does not match this exactly — an unclosed `[text](`, a stray bracket, a nested
 * `[a[b]](x)` — simply never matches and survives as literal text, which is the safe outcome.
 */
const MARKDOWN_LINK = /\[([^\]\n]*)\]\(([^)\s]*)\)/g

/** Schemes we are willing to put in an href. Everything else stays literal text. */
const SAFE_ABSOLUTE = /^(https?:\/\/|mailto:|tel:)/i

/**
 * Is this href safe to render as a link?
 *
 * Site-relative paths (`/x`), fragments (`#x`) and query-only links (`?x`) are safe by
 * construction. Absolute URLs are allowed only for http(s)/mailto/tel. Everything else —
 * `javascript:`, `data:`, `vbscript:`, protocol-relative `//evil.com` — is rejected, so a
 * malicious or mistaken URL in CMS text can never become a live link.
 *
 * Leading control characters and whitespace are stripped before the check, because
 * `java\tscript:` and ` javascript:` are both treated as a scheme by browsers.
 */
export function isSafeHref(href: unknown): boolean {
  if (typeof href !== 'string') return false

  const cleaned = href.replace(/[\u0000- ]/g, '')
  if (cleaned.length === 0) return false

  // Protocol-relative URLs bypass the scheme allow-list, so reject them outright.
  if (cleaned.startsWith('//')) return false

  if (cleaned.startsWith('/') || cleaned.startsWith('#') || cleaned.startsWith('?')) return true

  return SAFE_ABSOLUTE.test(cleaned)
}

/**
 * Splits text into alternating plain-text and link segments.
 *
 * Guarantees, all covered by tests:
 *   - concatenating every segment's visible text reproduces the input with only the
 *     `[label](href)` wrappers removed — no prose is ever lost or reordered;
 *   - a match with an empty label or an unsafe href is emitted as literal text, keeping the
 *     original characters visible so an editor can see and fix it;
 *   - non-string input yields an empty array rather than throwing.
 */
export function parseMarkdownLinks(text: unknown): MarkdownSegment[] {
  if (typeof text !== 'string' || text.length === 0) return []

  const segments: MarkdownSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  MARKDOWN_LINK.lastIndex = 0
  while ((match = MARKDOWN_LINK.exec(text)) !== null) {
    const [raw, label, href] = match

    // An empty label would produce an invisible, unclickable anchor; an unsafe href must never
    // become one. Both fall through as the literal characters the editor typed.
    if (label.trim().length === 0 || !isSafeHref(href)) continue

    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'link', label, href })
    lastIndex = match.index + raw.length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments
}

/** True when the text contains at least one link this module would actually render. */
export function hasMarkdownLink(text: unknown): boolean {
  return parseMarkdownLinks(text).some((s) => s.type === 'link')
}

/**
 * Competitor domains that must not receive link equity. Single source of truth, shared with
 * the Lexical link converter in PostRichText so both paths stay in step.
 */
export const COMPETITOR_DOMAINS = [
  'aeropeptides.com',
  'peptpedia.org',
  'apexlab.org',
  'peptidedosage.org',
  'peptide-science.org',
  'milo-lab.com',
  'peptideprescriber.com',
  'peptides.nyc',
] as const

/**
 * `rel` for a blog link, matching the existing Lexical converter exactly:
 * competitors get `nofollow`, new-tab links get `noopener noreferrer`, and a same-tab
 * internal link gets no `rel` at all.
 */
export function blogLinkRel(href: string, opensInNewTab = false): string | undefined {
  if (COMPETITOR_DOMAINS.some((d) => href.includes(d))) return 'noopener noreferrer nofollow'
  return opensInNewTab ? 'noopener noreferrer' : undefined
}

/** The anchor styling used for links inside blog body content. */
export const BLOG_LINK_CLASS =
  'hover:text-ink transition-colors inline-flex items-start gap-1.5 underline underline-offset-4 decoration-ink/20 hover:decoration-ink/50'
