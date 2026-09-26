import { NextResponse } from 'next/server'

// Serves the IndexNow ownership key. Reached via the rewrite `/<key>.txt` -> `/api/indexnow/key`
// in next.config.ts (the file has to live at the site root for the engines to accept it).
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const key = process.env.INDEXNOW_KEY
  const requested = new URL(request.url).searchParams.get('k')

  // Only ever reveal the key at its own filename; anything else is a plain 404.
  if (!key || requested !== key) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(key, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  })
}
