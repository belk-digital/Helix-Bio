import React from 'react'
import { notFound } from 'next/navigation'
import { blogPostExists } from '@/lib/routeGuards'

// `[slug]` is the blog-post route, but it also matches every unknown single-segment URL. Doing the
// existence check here (outside the root loading.tsx Suspense boundary) makes those return a real
// HTTP 404 rather than a streamed 200. See src/lib/routeGuards.ts.
export default async function BlogSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!(await blogPostExists(slug))) notFound()
  return <>{children}</>
}
