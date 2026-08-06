import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getOgImageUrl(title: string, description?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
  const url = new URL('/api/og', baseUrl)
  url.searchParams.set('title', title)
  if (description) {
    url.searchParams.set('description', description)
  }
  return url.toString()
}

export function encodeImageUrl(url: string | undefined): string {
  if (!url) return ''
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url)
      parsed.pathname = parsed.pathname.split('/').map(s => encodeURIComponent(decodeURIComponent(s))).join('/')
      return parsed.toString()
    }
    return url.split('/').map(s => encodeURIComponent(decodeURIComponent(s))).join('/')
  } catch (e) {
    return url
  }
}
