import React from 'react'

/**
 * Halloween node icons for the sale tier bar.
 *
 * lucide-react (the project's only icon set) has no pumpkin or bat, so these two
 * are inline silhouettes drawn on the same 24x24 grid and filled with
 * currentColor, so they inherit the node's text colour exactly like a lucide
 * icon would. The moon node keeps using lucide's own `Moon`.
 */

type IconProps = {
  size?: number
  className?: string
}

/** Three overlapping lobes plus a stem and leaf — reads as a pumpkin at 14-16px. */
export function PumpkinIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* leaf + stem */}
      <path d="M12.9 6.6c-.3-1.8.5-3.4 2.1-4.2.3 1.6-.4 3.1-1.7 4z" />
      <rect x="11.2" y="5.8" width="1.6" height="3.4" rx=".8" />
      {/* body: side lobes first, centre lobe over them — one solid silhouette */}
      <ellipse cx="7.9" cy="14.8" rx="4.1" ry="5.5" />
      <ellipse cx="16.1" cy="14.8" rx="4.1" ry="5.5" />
      <ellipse cx="12" cy="14.6" rx="5.2" ry="6" />
    </svg>
  )
}

/** Body with two ears and mirrored swept wings. */
export function BatIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* ears: short, close to the head, so the silhouette reads as a bat head */}
      <path d="M10.6 7.7 10.2 5.6l1.4 1.5z" />
      <path d="M13.4 7.7l.4-2.1-1.4 1.5z" />
      {/* head */}
      <circle cx="12" cy="9.3" r="2" />
      {/* body, tapering below the head */}
      <path d="M12 10.5c1.1 0 1.8.8 1.8 1.9 0 1.3-.7 2.6-1.8 3.7-1.1-1.1-1.8-2.4-1.8-3.7 0-1.1.7-1.9 1.8-1.9z" />
      {/* wings: swept out from the shoulders with a scalloped lower edge.
          Sized to carry visual weight down to 16px, where a thin wing vanishes. */}
      <path d="M10.4 9.1C8.4 7.3 5.6 6.3 2.3 6.4c1.2 1.5 1.8 3.3 1.6 5.1 1.1-.9 2.4-.8 3.6.1.9.7 2 1.2 3.2 1.3a6.2 6.2 0 0 1-.3-3.8z" />
      <path d="M13.6 9.1c2-1.8 4.8-2.8 8.1-2.7-1.2 1.5-1.8 3.3-1.6 5.1-1.1-.9-2.4-.8-3.6.1-.9.7-2 1.2-3.2 1.3a6.2 6.2 0 0 0 .3-3.8z" />
    </svg>
  )
}
