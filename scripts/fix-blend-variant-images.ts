/**
 * Repairs the variant images on product 132 (bpc-157-tb-500-blend).
 *
 * Both variants pointed at media 194 — "SEMAX + SELANK BLEND spray 300MCG.webp", a nasal
 * spray bottle from an unrelated product. The product page concatenates variant images
 * BEFORE product images, so that spray was rendering as the primary product shot.
 *
 * Cause: scripts/remap-variants.ts builds its candidate list from loose name tokens, so
 * "blend" in "BPC-157 / TB-500 Blend" matched "SEMAX + SELANK BLEND spray". It then tried
 * to narrow by strength, but the option value "5mg/5mg" never appears in a filename, so it
 * fell through to the unconditional `productMedia[0]` fallback and grabbed the spray.
 *
 * Correct images, confirmed by eye (not by filename or alt text — media 278/279 are named
 * for this product but are spray bottles):
 *   168  BPC TB500 BLEND 5 5-3.webp   -> label reads "BPC/TB500 BLEND 5/5 PER VIAL"
 *    92  BPC TB500 10MG 10MG.webp     -> label reads "BPC/TB500 10MG/10MG PER VIAL"
 *
 * The product-level image (168) is already correct and is left alone. Run with --apply to
 * write; without it the script is a dry run.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const APPLY = process.argv.includes('--apply')

const SLUG = 'bpc-157-tb-500-blend'

/** variant SKU -> the media id its image should point at */
const CORRECT_IMAGE: Record<string, number> = {
  'BPCTB5-55': 168,
  'BPCTB5-1010': 92,
}

async function run() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: SLUG } },
    depth: 2,
    locale: 'en',
    limit: 1,
  })

  const doc: any = docs[0]
  if (!doc) {
    console.error(`Product "${SLUG}" not found.`)
    process.exit(1)
  }

  const unknown = (doc.variants ?? []).filter((v: any) => !(v.sku in CORRECT_IMAGE))
  if (unknown.length) {
    console.error(`Variant SKUs have drifted — not in the fix map: ${unknown.map((v: any) => v.sku).join(', ')}`)
    process.exit(1)
  }

  const variants = (doc.variants ?? []).map((v: any) => {
    const target = CORRECT_IMAGE[v.sku]
    const current = v.images?.[0]?.image
    const currentId = typeof current === 'object' ? current?.id : current
    console.log(
      `  ${v.sku}: ${currentId ?? '(none)'} (${typeof current === 'object' ? current?.filename : '?'})` +
        ` -> ${target}`,
    )
    return {
      id: v.id,
      sku: v.sku,
      isKit: v.isKit,
      price: v.price,
      salePrice: v.salePrice,
      stock: v.stock,
      options: (v.options ?? []).map((o: any) => ({ id: o.id, key: o.key, value: o.value })),
      images: [{ image: target }],
    }
  })

  if (APPLY) {
    await payload.update({
      collection: 'products',
      id: doc.id,
      locale: 'en',
      data: { variants },
      overrideAccess: true,
    })
    console.log('\nUpdated.')
  } else {
    console.log('\nDry run — re-run with --apply to write.')
  }

  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
