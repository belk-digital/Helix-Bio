import React from 'react'
import { notFound } from 'next/navigation'

// Catch-all for unknown multi-segment URLs. Calling notFound() from the layout (not only the
// page) is what lets Next return HTTP 404 — the page-level call happens after the response shell
// has already been flushed with status 200 by the root loading.tsx boundary.
export default function NotFoundCatchAllLayout({ children }: { children: React.ReactNode }) {
  notFound()
  return <>{children}</>
}
