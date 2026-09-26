import React from 'react'
import { notFound } from 'next/navigation'
import { productExists } from '@/lib/routeGuards'

// Runs outside the segment's loading.tsx Suspense boundary, so an unknown slug yields a real
// HTTP 404 instead of a streamed 200 "Product Not Found" page. See src/lib/routeGuards.ts.
export default async function ProductSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!(await productExists(slug))) notFound()
  return <>{children}</>
}
