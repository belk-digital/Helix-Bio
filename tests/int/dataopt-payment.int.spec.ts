import crypto from 'crypto'
import { describe, it, expect } from 'vitest'
import { buildOrderSku, buildJurisdictionCode } from '@/app/(frontend)/(shop)/checkout/dataoptHelpers'
import { verifyWebhookSignature } from '@/app/api/webhooks/dataopt/route'

describe('Data-opt payment gateway', () => {
  describe('buildOrderSku', () => {
    it('derives a stable, order-specific SKU', () => {
      expect(buildOrderSku(42)).toBe('HB-ORDER-42')
      expect(buildOrderSku('42')).toBe('HB-ORDER-42')
    })
  })

  describe('buildJurisdictionCode', () => {
    it('builds a US-<STATE> code for US orders with a two-letter state', () => {
      expect(buildJurisdictionCode({ country: 'US', state: 'ca' })).toBe('US-CA')
      expect(buildJurisdictionCode({ country: 'US', state: 'TX' })).toBe('US-TX')
    })

    it('omits the code for non-US orders or malformed state values', () => {
      expect(buildJurisdictionCode({ country: 'CA', state: 'ON' })).toBeUndefined()
      expect(buildJurisdictionCode({ country: 'US', state: 'California' })).toBeUndefined()
      expect(buildJurisdictionCode({ country: 'US' })).toBeUndefined()
      expect(buildJurisdictionCode({})).toBeUndefined()
    })
  })

  describe('verifyWebhookSignature', () => {
    const secret = 'test-signing-secret'
    const body = JSON.stringify({ event: 'receipt.paid', receiptId: 'rcpt_123' })
    const validSignature = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`

    it('accepts a correctly signed body', () => {
      expect(verifyWebhookSignature(body, validSignature, secret)).toBe(true)
    })

    it('rejects a tampered body', () => {
      const tamperedBody = JSON.stringify({ event: 'receipt.paid', receiptId: 'rcpt_999' })
      expect(verifyWebhookSignature(tamperedBody, validSignature, secret)).toBe(false)
    })

    it('rejects a signature made with the wrong secret', () => {
      const wrongSecretSignature = `sha256=${crypto.createHmac('sha256', 'wrong-secret').update(body).digest('hex')}`
      expect(verifyWebhookSignature(body, wrongSecretSignature, secret)).toBe(false)
    })

    it('rejects a malformed header', () => {
      expect(verifyWebhookSignature(body, 'not-a-valid-header', secret)).toBe(false)
      expect(verifyWebhookSignature(body, '', secret)).toBe(false)
    })

    it('rejects when the header or secret is missing', () => {
      expect(verifyWebhookSignature(body, null, secret)).toBe(false)
      expect(verifyWebhookSignature(body, validSignature, undefined)).toBe(false)
    })

    it('rejects a signature of different length without throwing', () => {
      expect(verifyWebhookSignature(body, 'sha256=abcd', secret)).toBe(false)
    })
  })
})
