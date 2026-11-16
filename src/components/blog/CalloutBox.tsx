import React from 'react'
import { Info, Lightbulb, AlertTriangle } from 'lucide-react'
import { parseMarkdownLinks, blogLinkRel, BLOG_LINK_CLASS } from '@/lib/blog/markdownLinks'

const STYLES = {
  info: { icon: Info, bg: 'bg-info-bg', text: 'text-info' },
  tip: { icon: Lightbulb, bg: 'bg-success-bg', text: 'text-success' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-bg', text: 'text-warning' },
} as const

// Typography for the note itself.
const PROSE = 'text-sm sm:text-base text-ink-soft leading-relaxed'

/**
 * Renders the plain `text` field, turning any `[label](href)` already stored in it into real
 * anchors. Editors wrote that syntax expecting links; because the field is a textarea it was
 * rendering as literal characters instead.
 *
 * Returns a plain string when there is nothing to link, so callouts without Markdown produce
 * byte-identical markup to before. Segments become React elements — never raw HTML.
 */
function renderTextWithLinks(text: string): React.ReactNode {
  const segments = parseMarkdownLinks(text)
  if (!segments.some((s) => s.type === 'link')) return text

  return segments.map((segment, i) =>
    segment.type === 'link' ? (
      <a
        key={i}
        href={segment.href}
        rel={blogLinkRel(segment.href)}
        className={BLOG_LINK_CLASS}
      >
        {segment.label}
      </a>
    ) : (
      <React.Fragment key={i}>{segment.value}</React.Fragment>
    ),
  )
}

export function CalloutBox({
  style = 'info',
  text,
}: {
  style?: keyof typeof STYLES
  text: string
}) {
  const { icon: Icon, bg, text: textColor } = STYLES[style] || STYLES.info

  return (
    <div className={`rounded-[1.25rem] p-6 sm:p-7 flex items-start gap-3.5 ${bg}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${textColor}`} />
      <p className={PROSE}>{renderTextWithLinks(text)}</p>
    </div>
  )
}
