import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Covers the email-only product availability enquiry server action.
 *
 * Email delivery is mocked throughout — no message leaves the process, so these can run
 * anywhere without reaching a real inbox and without touching the database.
 */

const mockFind = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockSendTrackedEmail = vi.fn()
const mockGenerateEnquiryEmail = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockHeadersGet = vi.fn()

// create/update are exposed purely so the tests can prove the action never calls them.
vi.mock('payload', () => ({
  getPayload: async () => ({ find: mockFind, create: mockCreate, update: mockUpdate }),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next-intl/server', () => ({
  // Error copy is asserted by key, so a failure names the branch that produced it.
  getTranslations: async () => (key: string) => key,
}))
vi.mock('next/headers', () => ({
  headers: async () => ({ get: mockHeadersGet }),
}))
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}))
vi.mock('@/lib/emails/sendTrackedEmail', () => ({
  sendTrackedEmail: (...args: unknown[]) => mockSendTrackedEmail(...args),
}))
vi.mock('@/lib/emails/generateEnquiryEmail', () => ({
  generateEnquiryEmail: (...args: unknown[]) => mockGenerateEnquiryEmail(...args),
}))

import { submitProductEnquiry } from '@/app/(frontend)/(shop)/product/[slug]/enquiryActions'

/** Product 152 shaped like the real BAC Water record: 30 mL retired, siblings in stock. */
const bacWater = {
  id: 152,
  slug: 'bac-water',
  name: 'BAC Water',
  stock: 962,
  variants: [
    { sku: 'BACWAT-3ML', stock: 500, options: [{ value: '3mL' }, { value: 'Single' }] },
    { sku: 'BACWAT-10ML', stock: 500, options: [{ value: '10mL' }, { value: 'Single' }] },
    { sku: 'BACWAT-30ML', stock: 0, options: [{ value: '30mL' }, { value: 'Single' }] },
  ],
}

function form(fields: Record<string, string>) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v))
  return fd
}

const validFields = {
  email: 'researcher@lab.example',
  productSlug: 'bac-water',
  variantSku: 'BACWAT-30ML',
}

/** Fields handed to the email template — the only place enquiry data now lands. */
const emailData = () => mockGenerateEnquiryEmail.mock.calls[0][0] as any

beforeEach(() => {
  vi.clearAllMocks()
  mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 4 })
  mockHeadersGet.mockReturnValue('203.0.113.9')
  mockFind.mockResolvedValue({ docs: [bacWater] })
  mockSendTrackedEmail.mockResolvedValue({})
  mockGenerateEnquiryEmail.mockReturnValue('<html>enquiry</html>')
})

describe('submitProductEnquiry (email-only)', () => {
  describe('happy path', () => {
    it('emails staff and writes nothing to the database', async () => {
      const res = await submitProductEnquiry(form(validFields))

      expect(res).toEqual({ success: true })
      expect(mockSendTrackedEmail).toHaveBeenCalledTimes(1)
      // The whole point of this change: no enquiry record is created or updated.
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('emails server-resolved product and variant details, not what the browser sent', async () => {
      await submitProductEnquiry(
        form({
          ...validFields,
          // A forged payload claiming a different product, URL and size.
          productName: 'Free Gold Bars',
          productUrl: 'https://evil.example/phish',
          variantTitle: '999mg',
        }),
      )

      const data = emailData()
      expect(data.productName).toBe('BAC Water')
      expect(data.productUrl).toMatch(/\/product\/bac-water$/)
      expect(data.productUrl).not.toContain('evil.example')
      expect(data.variantTitle).toBe('30mL Single')
      expect(data.variantSku).toBe('BACWAT-30ML')
    })

    it('passes an optional quantity and note through to the email', async () => {
      await submitProductEnquiry(form({ ...validFields, quantity: '5', note: 'Need a CoA.' }))
      expect(emailData().quantity).toBe(5)
      expect(emailData().note).toBe('Need a CoA.')
    })

    it('resolves a variant by its computed option title as well as its SKU', async () => {
      const res = await submitProductEnquiry(form({ ...validFields, variantSku: '30mL Single' }))
      expect(res).toEqual({ success: true })
      expect(emailData().variantSku).toBe('BACWAT-30ML')
    })

    it('sets the customer address as replyTo so staff can answer directly', async () => {
      await submitProductEnquiry(form(validFields))
      const args = mockSendTrackedEmail.mock.calls[0][1] as any
      expect(args.replyTo).toBe('researcher@lab.example')
      expect(args.to).toBe('support@helixbiochem.com')
      expect(args.subject).toContain('BAC Water')
      expect(args.subject).toContain('BACWAT-30ML')
    })
  })

  describe('validation', () => {
    it('rejects an empty email without emailing', async () => {
      const res = await submitProductEnquiry(form({ ...validFields, email: '' }))
      expect(res).toEqual({ error: 'enquireErrorEmailRequired' })
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })

    it('rejects a malformed email', async () => {
      for (const bad of ['not-an-email', 'a@b', 'a b@c.com', '@nope.com']) {
        const res = await submitProductEnquiry(form({ ...validFields, email: bad }))
        expect(res).toEqual({ error: 'enquireErrorEmailInvalid' })
      }
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })

    it('rejects a quantity outside 1-999 or a non-integer', async () => {
      for (const bad of ['0', '-3', '1000', '2.5', 'abc']) {
        const res = await submitProductEnquiry(form({ ...validFields, quantity: bad }))
        expect(res).toEqual({ error: 'enquireErrorQuantity' })
      }
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })

    it('rejects an over-long note', async () => {
      const res = await submitProductEnquiry(form({ ...validFields, note: 'x'.repeat(2001) }))
      expect(res).toEqual({ error: 'enquireErrorNoteTooLong' })
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })
  })

  describe('server-side verification', () => {
    it('rejects an unknown product slug', async () => {
      mockFind.mockResolvedValue({ docs: [] })
      const res = await submitProductEnquiry(form({ ...validFields, productSlug: 'no-such-thing' }))
      expect(res).toEqual({ error: 'enquireError' })
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })

    it('rejects a forged SKU that does not belong to the product', async () => {
      const res = await submitProductEnquiry(form({ ...validFields, variantSku: 'TOTALLY-MADE-UP' }))
      expect(res).toEqual({ error: 'enquireError' })
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })

    it('refuses an enquiry for a variant that is actually in stock', async () => {
      const res = await submitProductEnquiry(form({ ...validFields, variantSku: 'BACWAT-10ML' }))
      expect(res).toEqual({ error: 'enquireErrorInStock' })
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })

    it('treats a variant with missing stock data as unavailable (fail-safe)', async () => {
      mockFind.mockResolvedValue({
        docs: [
          {
            ...bacWater,
            variants: [{ sku: 'BACWAT-30ML', stock: null, options: [{ value: '30mL' }] }],
          },
        ],
      })
      const res = await submitProductEnquiry(form(validFields))
      expect(res).toEqual({ success: true })
    })

    it('falls back to the product itself when it has no variant rows', async () => {
      mockFind.mockResolvedValue({
        docs: [{ id: 300, slug: 'thing', name: 'Thing', sku: 'THING-STD', stock: 0, variants: [] }],
      })
      const res = await submitProductEnquiry(
        form({ email: 'a@b.com', productSlug: 'thing', variantSku: 'THING-STD' }),
      )
      expect(res).toEqual({ success: true })
      expect(emailData().variantTitle).toBe('Standard')
      expect(emailData().variantSku).toBe('THING-STD')
    })
  })

  describe('abuse prevention', () => {
    it('silently accepts a filled honeypot without emailing', async () => {
      const res = await submitProductEnquiry(form({ ...validFields, company: 'AcmeBot' }))
      // Reports success so a bot learns nothing about why it failed.
      expect(res).toEqual({ success: true })
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('rejects once the per-IP rate limit is exhausted', async () => {
      mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0 })
      const res = await submitProductEnquiry(form(validFields))
      expect(res).toEqual({ error: 'enquireTooMany' })
      expect(mockSendTrackedEmail).not.toHaveBeenCalled()
    })

    it('rate limits per IP at 5 per hour', async () => {
      await submitProductEnquiry(form(validFields))
      expect(mockCheckRateLimit).toHaveBeenCalledWith('enquiry:203.0.113.9', 5, 60 * 60)
    })
  })

  describe('failure handling', () => {
    it('returns an error when the email fails, because nothing was stored', async () => {
      mockSendTrackedEmail.mockRejectedValue(new Error('resend 500'))
      const res = await submitProductEnquiry(form(validFields))

      // With no persistence a failed send means the enquiry is genuinely lost, so claiming
      // success would strand a customer who believes they have been heard.
      expect(res).toEqual({ error: 'enquireError' })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('never writes to the database on any path', async () => {
      await submitProductEnquiry(form(validFields))
      await submitProductEnquiry(form({ ...validFields, email: 'bad' }))
      mockSendTrackedEmail.mockRejectedValue(new Error('boom'))
      await submitProductEnquiry(form(validFields))

      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })
})
