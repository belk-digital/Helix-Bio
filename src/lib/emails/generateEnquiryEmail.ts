import { escapeHtml } from './escapeHtml'
import { emailLayout } from './emailLayout'

export type EnquiryEmailData = {
  /** Customer's address. Also set as replyTo so staff can answer straight from the inbox. */
  email: string
  productName: string
  productUrl: string
  variantTitle: string
  variantSku: string
  quantity?: number | null
  note?: string | null
  submittedAt: Date
}

/**
 * Staff notification for an availability enquiry raised on an out-of-stock variant.
 *
 * Every interpolated value is escaped: all of them except the timestamp originate from either
 * the customer (email, note, quantity) or the database (product/variant), and an unescaped
 * apostrophe or angle bracket in a product name would be enough to break the markup — a
 * crafted note would do considerably more in an inbox that renders HTML.
 */
export function generateEnquiryEmail(data: EnquiryEmailData): string {
  const email = escapeHtml(data.email)
  const productName = escapeHtml(data.productName)
  const productUrl = escapeHtml(data.productUrl)
  const variantTitle = escapeHtml(data.variantTitle)
  const variantSku = escapeHtml(data.variantSku)
  const quantity = data.quantity ? escapeHtml(data.quantity) : ''
  const note = data.note ? escapeHtml(data.note) : ''
  const submittedAt = escapeHtml(data.submittedAt.toUTCString())

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'

  const row = (label: string, value: string) => `
            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">${label}</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #0A0A0A; font-weight: 500; word-break: break-word;">${value}</p>`

  return emailLayout({
    title: 'New Availability Enquiry',
    serverUrl,
    content: `
      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Availability Enquiry</h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">A customer asked about an out-of-stock item. Reply to this email to answer them directly.</p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf7; border-radius: 12px; border: 1px solid #e2ddd3; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <tr>
          <td style="padding: 24px;">
${row('Customer Email', email)}
${row('Product', productName)}
${row('Variant / Size', variantTitle)}
${row('SKU', variantSku)}
${quantity ? row('Requested Quantity', quantity) : ''}
            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Product Page</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; word-break: break-all;"><a href="${productUrl}" style="color: #1e5661; font-weight: 500;">${productUrl}</a></p>

            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Submitted</p>
            <p style="margin: 0; font-size: 16px; color: #0A0A0A; font-weight: 500;">${submittedAt}</p>
          </td>
        </tr>
      </table>
${
  note
    ? `
      <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #1e5661; font-weight: 800;">Customer Note</h3>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border: 1px dashed #d1d5db; font-size: 16px; color: #4b5563; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">${note}</div>`
    : ''
}
      <p style="margin: 24px 0 0 0; font-size: 13px; color: #8A8A8A; font-style: italic; text-align: center;">You can reply directly to this email to respond to ${email}.</p>
    `,
  })
}
