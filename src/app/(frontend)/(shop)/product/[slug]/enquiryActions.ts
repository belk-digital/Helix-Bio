'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { generateEnquiryEmail } from '@/lib/emails/generateEnquiryEmail'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'

const MAX_NOTE_LENGTH = 2000
const MAX_EMAIL_LENGTH = 254
const MAX_QUANTITY = 999

/** Deliberately conservative: rejects the obvious nonsense without pretending to be RFC 5322. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type EnquiryResult = { success: true } | { success?: false; error: string }

/**
 * Availability enquiry raised from a product page when the selected variant is out of stock.
 *
 * Nothing the browser sends about the product is trusted. The slug and SKU are only used to
 * look the records up again; the name, URL, variant title and stock state that get stored and
 * emailed are all read from the database here. Otherwise this form would be an open relay for
 * sending arbitrary product claims to staff, and a way to generate enquiries for items that are
 * perfectly in stock.
 *
 * Email-only by design: nothing about the enquiry is stored in its own table. Delivery is
 * still auditable through email-logs, which sendTrackedEmail writes for every attempt.
 */
export async function submitProductEnquiry(formData: FormData): Promise<EnquiryResult> {
  const t = await getTranslations('shop.productDetail')

  try {
    // Honeypot: a real browser leaves this hidden field empty. Answer as though it worked so a
    // bot gets no signal about why it failed.
    if (String(formData.get('company') || '').trim() !== '') {
      return { success: true }
    }

    const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = await checkRateLimit(`enquiry:${ip}`, 5, 60 * 60)
    if (!allowed) {
      return { error: t('enquireTooMany') }
    }

    const email = String(formData.get('email') || '').trim()
    const slug = String(formData.get('productSlug') || '').trim()
    const sku = String(formData.get('variantSku') || '').trim()
    const rawQuantity = String(formData.get('quantity') || '').trim()
    const note = String(formData.get('note') || '').trim()

    if (!email) return { error: t('enquireErrorEmailRequired') }
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
      return { error: t('enquireErrorEmailInvalid') }
    }
    if (note.length > MAX_NOTE_LENGTH) return { error: t('enquireErrorNoteTooLong') }

    let quantity: number | null = null
    if (rawQuantity) {
      const parsed = Number(rawQuantity)
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_QUANTITY) {
        return { error: t('enquireErrorQuantity') }
      }
      quantity = parsed
    }

    if (!slug) return { error: t('enquireError') }

    const payload = await getPayload({ config: configPromise })

    // Re-resolve the product. `status: active` matches what the product page itself serves, so
    // an enquiry cannot be raised against a draft or archived record by guessing its slug.
    const found = await payload.find({
      collection: 'products',
      where: { and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const product = found.docs[0] as any
    if (!product) return { error: t('enquireError') }

    // Resolve the variant the same way the cart does (SKU first, then the computed option
    // title), so a line that only ever carried the title still matches. A product with no
    // variant rows falls back to the product itself, mirroring the product page's own synthetic
    // "Standard" variant.
    const variants: any[] = Array.isArray(product.variants) ? product.variants : []
    let variantTitle: string
    let variantSku: string
    let variantStock: number

    if (variants.length > 0) {
      const variant = variants.find((v: any) => {
        const computedTitle = v.options?.map((o: any) => o.value).filter(Boolean).join(' ') || ''
        return v.sku === sku || (computedTitle !== '' && computedTitle === sku)
      })
      if (!variant) return { error: t('enquireError') }

      variantTitle =
        variant.options?.map((o: any) => o.value).filter(Boolean).join(' ') || variant.sku || 'Standard'
      variantSku = variant.sku || ''
      variantStock = typeof variant.stock === 'number' ? variant.stock : 0
    } else {
      variantTitle = 'Standard'
      variantSku = product.sku || ''
      variantStock = typeof product.stock === 'number' ? product.stock : 0
    }

    // An enquiry only makes sense for something that cannot be bought. If it is purchasable the
    // customer should be using Add to Cart, and accepting this would let the form be used as a
    // generic contact channel that bypasses the real one.
    if (variantStock > 0) return { error: t('enquireErrorInStock') }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
    const productName = product.name || slug
    const productUrl = `${serverUrl}/product/${product.slug}`
    const submittedAt = new Date()

    // The email IS the enquiry. Nothing is stored for it, so a delivery failure means the
    // enquiry is genuinely gone and the customer must be told to try again — reporting success
    // here would strand someone who believes they have been heard. sendTrackedEmail still
    // records the attempt in email-logs, which is where staff can audit delivery.
    try {
      await sendTrackedEmail(payload, {
        from: '"Helix Bio Chem" <forms@helixbiochem.com>',
        to: 'support@helixbiochem.com',
        replyTo: email,
        subject: `[Availability Enquiry] ${productName} — ${variantTitle} (${variantSku || 'no SKU'})`,
        html: generateEnquiryEmail({
          email,
          productName,
          productUrl,
          variantTitle,
          variantSku,
          quantity,
          note,
          submittedAt,
        }),
      })
    } catch (err) {
      console.error('Product enquiry: notification email failed, enquiry not delivered', err)
      return { error: t('enquireError') }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting product enquiry:', error)
    return { error: t('enquireError') }
  }
}
