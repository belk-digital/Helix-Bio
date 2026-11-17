'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Mail, X, Loader2, Check, Plus, Minus } from 'lucide-react'

import { submitProductEnquiry } from '@/app/(frontend)/(shop)/product/[slug]/enquiryActions'

type EnquirePanelProps = {
  productName: string
  productSlug: string
  /** Display label for the selected variant, e.g. "10mg". */
  variantTitle: string
  /** Selected variant's SKU. The server re-resolves the variant from this. */
  variantSku: string
  /** Controlled so the sticky bar can open the same panel instead of owning a second one. */
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Rendered to the right of the ENQUIRE NOW trigger, on the same row — the wishlist button.
   * Passed in rather than built here so this component owns no wishlist behaviour, and so the
   * expanding panel still spans the full width beneath both controls.
   */
  trailing?: React.ReactNode
  className?: string
}

type Status = 'idle' | 'sending' | 'success' | 'error'

/**
 * Availability enquiry for an out-of-stock variant: a black CTA that expands an inline panel.
 *
 * Rendered in place of Add to Cart / Buy Now, never alongside them — an enquiry only applies
 * when the selected variant cannot be bought, and showing both would invite the shopper to do
 * the wrong one. The parent decides that from `selectedVariant.inStock`; this component makes
 * no availability judgement of its own.
 */
export function EnquirePanel({
  productName,
  productSlug,
  variantTitle,
  variantSku,
  open,
  onOpenChange,
  trailing,
  className = '',
}: EnquirePanelProps) {
  const t = useTranslations('shop.productDetail')
  const panelId = useId()

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')

  const triggerRef = useRef<HTMLButtonElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  // Guards against a double-click firing two submissions before React re-renders the
  // disabled button. `status` alone is a render-cycle behind a fast second click.
  const submittingRef = useRef(false)

  // The shopper can change variant while the panel is open. The label updates from props on its
  // own, but a success or error message from the previous variant would then be stale and
  // misleading, so clear it and let them send a fresh enquiry for the new one.
  useEffect(() => {
    setStatus('idle')
    setError(null)
  }, [variantSku])

  // Move focus into the panel when it opens so keyboard and screen-reader users land on the
  // field they came for rather than having to hunt for it after the trigger.
  useEffect(() => {
    if (open) emailRef.current?.focus()
  }, [open])

  const close = () => {
    onOpenChange(false)
    setStatus('idle')
    setError(null)
    triggerRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submittingRef.current) return

    const trimmed = email.trim()
    if (!trimmed) {
      setStatus('error')
      setError(t('enquireErrorEmailRequired'))
      emailRef.current?.focus()
      return
    }

    submittingRef.current = true
    setStatus('sending')
    setError(null)

    try {
      const fd = new FormData(e.currentTarget)
      fd.set('productSlug', productSlug)
      fd.set('variantSku', variantSku)
      const res = await submitProductEnquiry(fd)

      if (res && 'error' in res && res.error) {
        setStatus('error')
        setError(res.error)
      } else {
        setStatus('success')
        setEmail('')
        setQuantity('')
        setNote('')
        setDetailsOpen(false)
      }
    } catch (err) {
      console.error('Enquiry submission failed:', err)
      setStatus('error')
      setError(t('enquireError'))
    } finally {
      submittingRef.current = false
    }
  }

  const sending = status === 'sending'

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-3">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpenChange(!open)}
          className="flex-1 min-w-0 h-[60px] rounded-[24px] text-sm font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md bg-[#121212] text-white hover:bg-gray-900 hover:-translate-y-0.5"
        >
          <Mail className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
          {t('enquireNow')}
        </button>
        {trailing}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink/50">{t('enquireHint')}</p>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-[24px] border border-ink/10 bg-[#FAFAFA] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h3 className="font-heading font-black text-base sm:text-lg uppercase tracking-tight text-ink">
                    {t('enquirePanelTitle')}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-ink/60 break-words">
                    {productName}
                    {variantTitle ? ` — ${variantTitle}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t('enquireClose')}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {status === 'success' ? (
                <div role="status" className="flex items-start gap-3 py-2">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-green-600/10 text-green-700 flex items-center justify-center">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t('enquireSuccessTitle')}</p>
                    <p className="mt-1 text-xs sm:text-sm text-ink/60">{t('enquireSuccessBody')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {/* Honeypot: hidden from people, irresistible to bots. Not display:none, which
                      some bots skip; off-screen and untabbable instead. */}
                  <div className="absolute w-px h-px -left-[9999px] overflow-hidden" aria-hidden="true">
                    <label htmlFor={`${panelId}-company`}>Company</label>
                    <input
                      id={`${panelId}-company`}
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`${panelId}-email`}
                      className="text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-ink/50"
                    >
                      {t('enquireEmail')}
                    </label>
                    <input
                      ref={emailRef}
                      id={`${panelId}-email`}
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={status === 'error' ? true : undefined}
                      aria-describedby={error ? `${panelId}-error` : undefined}
                      placeholder={t('enquireEmailPlaceholder')}
                      className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailsOpen((v) => !v)}
                    aria-expanded={detailsOpen}
                    aria-controls={`${panelId}-details`}
                    className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-ink/60 hover:text-ink transition-colors"
                  >
                    {detailsOpen ? (
                      <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    {detailsOpen ? t('enquireHideDetails') : t('enquireAddDetails')}
                  </button>

                  <AnimatePresence initial={false}>
                    {detailsOpen && (
                      <motion.div
                        id={`${panelId}-details`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-4 pt-1">
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor={`${panelId}-quantity`}
                              className="text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-ink/50"
                            >
                              {t('enquireQuantity')}
                            </label>
                            <input
                              id={`${panelId}-quantity`}
                              type="number"
                              name="quantity"
                              min={1}
                              max={999}
                              step={1}
                              inputMode="numeric"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="w-full sm:w-32 bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor={`${panelId}-note`}
                              className="text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-ink/50"
                            >
                              {t('enquireNote')}
                            </label>
                            <textarea
                              id={`${panelId}-note`}
                              name="note"
                              rows={3}
                              maxLength={2000}
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder={t('enquireNotePlaceholder')}
                              className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 resize-y"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <p id={`${panelId}-error`} role="alert" className="text-xs font-medium text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full h-12 rounded-[20px] text-xs font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 bg-[#121212] text-white hover:bg-gray-900 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#121212]"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                        {t('enquireSending')}
                      </>
                    ) : (
                      t('enquireSend')
                    )}
                  </button>
                </form>
              )}

              <p className="mt-4 text-[11px] leading-relaxed text-ink/40">{t('enquireRuoNote')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
