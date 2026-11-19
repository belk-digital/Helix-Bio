import { escapeHtml } from './escapeHtml'

export interface BroadcastEmailOptions {
  recipientName?: string
  couponCode?: string
  discountPercent?: number
  serverUrl?: string
  previewText?: string
  /** Physical mailing address for the footer — CAN-SPAM and CASL require one in commercial email. */
  postalAddress: string
  /** Resend swaps this token for a per-recipient link, so leave the default for Resend Broadcasts. */
  unsubscribeUrl?: string
}

// Deliberately plain: one tracked link, no hero image, no drug names, text-only benefits. Fewer
// links and images means fewer spam-filter signals and fewer link-scanner "clicks" polluting stats.
export function generateBroadcastEmail(options: BroadcastEmailOptions): string {
  const {
    recipientName = '',
    couponCode = 'GG20',
    discountPercent = 20,
    serverUrl = 'https://helixbiochem.com',
    postalAddress,
    unsubscribeUrl = '{{{RESEND_UNSUBSCRIBE_URL}}}',
  } = options

  if (!postalAddress || !postalAddress.trim()) {
    throw new Error('generateBroadcastEmail: postalAddress is required (CAN-SPAM / CASL).')
  }

  const previewText =
    options.previewText ?? `Our new research division, plus code ${couponCode} for ${discountPercent}% off single items.`
  const greeting = recipientName.trim() ? `Hello ${escapeHtml(recipientName)},` : 'Hello,'
  const shopUrlWithCoupon = `${serverUrl}/shop?coupon=${encodeURIComponent(couponCode)}`
  const r2Base = 'https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev'
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>GlobalGen Pharmacy now offers research peptides</title>
  <style>
    @media only screen and (max-width: 600px) {
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #F8FAFC; font-family: ${font}; color: #0F172A;">

  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(previewText)}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 32px 12px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;">

          <!-- Logos (not linked, so they add no extra tracked links) -->
          <tr>
            <td class="mobile-pad" align="center" style="padding: 32px 36px 8px 36px;">
              <table align="center" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right: 14px;">
                    <img src="${r2Base}/email-assets/globalgen-logo.png" alt="GlobalGen Pharmacy" height="40" style="display: block; height: 40px; width: auto; max-width: 135px; border: 0;" />
                  </td>
                  <td valign="middle" style="padding: 0 6px; font-size: 18px; color: #94A3B8;">&times;</td>
                  <td valign="middle" style="padding-left: 14px;">
                    <img src="${r2Base}/email-assets/hb-logo.png" alt="Helix Bio Chem" height="36" style="display: block; height: 36px; width: auto; max-width: 145px; border: 0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td class="mobile-pad" style="padding: 24px 40px 8px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; line-height: 1.3; color: #0F172A;">
                GlobalGen Pharmacy now offers research peptides
              </h1>
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                ${greeting}
              </p>
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Thank you for being a valued customer of GlobalGen Pharmacy. In response to customer requests for verified, analytical-grade compounds, we have launched <strong>Helix Bio Chem</strong>, our research division.
              </p>
              <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Helix Bio Chem offers domestically synthesized research peptides and ready-to-study nasal sprays:
              </p>
              <ul style="margin: 0 0 8px 0; padding-left: 20px; font-size: 15px; line-height: 1.7; color: #334155;">
                <li>Synthesized in U.S. facilities</li>
                <li>Every lot tested by HPLC and mass spectrometry, at least 99% purity</li>
                <li>Certificates of analysis (COAs) available on our website</li>
              </ul>
            </td>
          </tr>

          <!-- Offer -->
          <tr>
            <td class="mobile-pad" style="padding: 20px 40px 12px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                <tr>
                  <td align="center" style="padding: 24px 20px;">
                    <p style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #0F172A;">
                      ${discountPercent}% off single items with code ${escapeHtml(couponCode)}
                    </p>
                    <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.5; color: #64748B;">
                      One use per account. Kits and bundles are excluded.
                    </p>
                    <a href="${shopUrlWithCoupon}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                      Shop with code ${escapeHtml(couponCode)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-pad" style="padding: 8px 40px 32px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Questions about a product or a COA? Reply to this email and our team will help.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="mobile-pad" style="padding: 24px 36px 28px 36px; border-top: 1px solid #E2E8F0; background-color: #F8FAFC; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 1.5; color: #64748B;">
                You are receiving this email as a registered customer of GlobalGen Pharmacy. Helix Bio Chem is our specialized division dedicated to research-grade biochemical peptides.
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11px; line-height: 1.5; color: #94A3B8;">
                <strong>RESEARCH USE ONLY:</strong> All compounds offered by Helix Bio Chem are intended strictly for in-vitro laboratory research. Not for human or animal consumption, medical diagnosis, or therapy. Statements have not been evaluated by the FDA.
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11px; line-height: 1.5; color: #94A3B8;">
                Helix Bio Chem &bull; ${escapeHtml(postalAddress)}
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} GlobalGen Pharmacy &bull; Helix Bio Chem.
                <a href="${unsubscribeUrl}" target="_blank" style="color: #64748B; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}
