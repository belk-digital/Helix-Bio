import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { absoluteUrl, submitToIndexNow } from '@/lib/indexnow'

/**
 * Builds the afterChange / afterDelete hooks that ping IndexNow for one collection.
 * `pathFor` returns the public URL path for a document, or null if it is not publicly indexable.
 * `isLive` decides whether a document is currently public (published / active).
 */
export function indexNowHooks(options: {
  pathFor: (doc: any) => string | null
  isLive: (doc: any) => boolean
}) {
  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
    const urls: string[] = []
    const path = options.pathFor(doc)
    const previousPath = previousDoc ? options.pathFor(previousDoc) : null

    // Submit when the document is live, or when it just stopped being live (so the engine
    // re-fetches and sees the removal / noindex), and when a slug change orphaned the old URL.
    if (path && (options.isLive(doc) || (previousDoc && options.isLive(previousDoc)))) urls.push(absoluteUrl(path))
    if (previousPath && previousPath !== path && previousDoc && options.isLive(previousDoc)) urls.push(absoluteUrl(previousPath))

    await submitToIndexNow(urls)
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    const path = options.pathFor(doc)
    if (path && options.isLive(doc)) await submitToIndexNow([absoluteUrl(path)])
    return doc
  }

  return { afterChange, afterDelete }
}
