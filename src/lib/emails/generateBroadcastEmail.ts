import { escapeHtml } from './escapeHtml'

export interface BroadcastEmailOptions {
  recipientName?: string
  couponCode?: string
  discountPercent?: number
  serverUrl?: string
  previewText?: string
}

export function generateBroadcastEmail(options: BroadcastEmailOptions = {}): string {
  const {
    recipientName = '',
    couponCode = 'HELIX20',
    discountPercent = 20,
    serverUrl = 'https://helixbiochem.com',
    previewText = `GlobalGen Pharmacy × Helix Bio Chem · Special 20% off with code ${couponCode}`
  } = options

  const greeting = recipientName.trim() ? `Hello ${escapeHtml(recipientName)},` : 'Hello,'
  const shopUrlWithCoupon = `${serverUrl}/shop?coupon=${encodeURIComponent(couponCode)}`
  const r2Base = 'https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev'

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>GlobalGen Pharmacy × Helix Bio Chem · Special 20% Off</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700;800&display=swap');
    :root { color-scheme: light; supported-color-schemes: light; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; filter: none !important; -webkit-filter: none !important; }
    [data-ogsc] img, [data-ogsb] img { filter: none !important; }
    
    @media only screen and (max-width: 600px) {
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-hero-img { height: 150px !important; }
      .mobile-btn { width: 100% !important; display: block !important; padding: 18px 20px !important; box-sizing: border-box !important; }
      .mobile-dual-logo { max-width: 100px !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">

  <!-- PREHEADER -->
  <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(previewText)}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- OUTER WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 48px 12px;">
    <tr>
      <td align="center">
        
        <!-- MAIN CARD (600px max) -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
          
          <!-- DUAL LOGO HEADER: GLOBALGEN PHARMACY × HELIX BIO -->
          <tr>
            <td style="padding: 40px 36px 26px 36px; text-align: center;" class="mobile-pad">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <!-- GlobalGen Pharmacy Logo -->
                  <td valign="middle" align="center" style="padding-right: 16px;">
                    <img src="${r2Base}/email-assets/globalgen-logo.png" alt="GlobalGen Pharmacy" height="42" class="mobile-dual-logo" style="height: 42px; width: auto; max-width: 135px; display: block; object-fit: contain;" />
                  </td>
                  
                  <!-- Elegant '×' Divider -->
                  <td valign="middle" align="center" style="padding: 0 8px;">
                    <span style="font-size: 18px; font-weight: 300; color: #94A3B8; line-height: 1; user-select: none;">&times;</span>
                  </td>
                  
                  <!-- Helix Bio Chem Logo -->
                  <td valign="middle" align="center" style="padding-left: 16px;">
                    <a href="${serverUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${r2Base}/email-assets/hb-logo.png" alt="Helix Bio Chem" height="38" class="mobile-dual-logo" style="height: 38px; width: auto; max-width: 145px; display: block; object-fit: contain;" />
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Subtle Collaboration Sub-Badge -->
              <div style="margin-top: 14px;">
                <span style="display: inline-block; padding: 4px 14px; background-color: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 9999px; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.14em;">
                  GlobalGen Pharmacy &bull; New Research Division
                </span>
              </div>
            </td>
          </tr>

          <!-- HERO BANNER -->
          <tr>
            <td style="padding: 0 36px 28px 36px;" class="mobile-pad">
              <div style="border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
                <a href="${shopUrlWithCoupon}" target="_blank">
                  <img src="${r2Base}/email-assets/ChatGPT%20Image%20Jul%2020%2C%202026%2C%2005_23_31%20AM.webp" alt="Helix Bio Chem Laboratory Purity" style="width: 100%; height: 180px; object-fit: cover; display: block;" class="mobile-hero-img" />
                </a>
              </div>
            </td>
          </tr>

          <!-- HEADLINE & GLOBALGEN PHARMACY INTRO -->
          <tr>
            <td style="padding: 0 40px 28px 40px; text-align: center;" class="mobile-pad">
              <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 800; color: #0284C7; text-transform: uppercase; letter-spacing: 0.16em;">
                A New Chapter in Precision Science
              </p>
              
              <h1 style="margin: 0 0 14px 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.03em; line-height: 1.25;">
                GlobalGen Pharmacy is Expanding Into Precision Peptides.
              </h1>
              
              <p style="margin: 0 auto 16px auto; font-size: 15px; color: #475569; line-height: 1.6; max-width: 490px;">
                ${greeting} First and foremost, <strong>thank you for being a valued customer of GlobalGen Pharmacy</strong>.
              </p>
              
              <p style="margin: 0 auto; font-size: 15px; color: #475569; line-height: 1.6; max-width: 490px;">
                In response to customer requests for verified, analytical-grade compounds, we have officially created our specialized research division: <strong>Helix Bio Chem</strong>. Now, backed by the pharmaceutical rigor you trust, you have direct access to top-tier domestic research peptides and ready-to-study nasal sprays.
              </p>
            </td>
          </tr>

          <!-- 3 CORE PILLARS (WHY CHOOSE HELIX BIO) -->
          <tr>
            <td style="padding: 0 36px 32px 36px;" class="mobile-pad">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 14px; border: 1px solid #E2E8F0; padding: 20px 22px;">
                
                <!-- 1. Made in USA -->
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="52" valign="middle" style="padding-right: 14px;">
                          <img src="${r2Base}/email-assets/icon-modern-usa.png?v=3" alt="Made in USA" width="44" height="44" style="width: 44px; height: 44px; display: block; border: 0; outline: none;" />
                        </td>
                        <td valign="middle">
                          <strong style="font-size: 14px; color: #0F172A; display: block; margin-bottom: 2px;">100% Domestic USA Synthesis</strong>
                          <span style="font-size: 13px; color: #64748B; line-height: 1.5; display: block;">Synthesized and vacuum-lyophilized in U.S. facilities to ensure optimal molecular stability.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 2. 503A Verified -->
                <tr>
                  <td style="padding: 16px 0; border-top: 1px solid #E2E8F0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="52" valign="middle" style="padding-right: 14px;">
                          <img src="${r2Base}/email-assets/icon-modern-503a.png?v=3" alt="503A Verified" width="44" height="44" style="width: 44px; height: 44px; display: block; border: 0; outline: none;" />
                        </td>
                        <td valign="middle">
                          <strong style="font-size: 14px; color: #0F172A; display: block; margin-bottom: 2px;">503A Standards &amp; HPLC Verified</strong>
                          <span style="font-size: 13px; color: #64748B; line-height: 1.5; display: block;">Every lot is independently verified with HPLC &amp; Mass Spectrometry for &ge;99% purity, backed by public COAs.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 3. Wide Catalog & Sprays -->
                <tr>
                  <td style="padding-top: 16px; border-top: 1px solid #E2E8F0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="52" valign="middle" style="padding-right: 14px;">
                          <img src="${r2Base}/email-assets/icon-modern-spray.png?v=3" alt="Specialty Sprays" width="44" height="44" style="width: 44px; height: 44px; display: block; border: 0; outline: none;" />
                        </td>
                        <td valign="middle">
                          <strong style="font-size: 14px; color: #0F172A; display: block; margin-bottom: 2px;">Full Catalog &amp; Specialty Nasal Sprays</strong>
                          <span style="font-size: 13px; color: #64748B; line-height: 1.5; display: block;">Featuring pure peptides alongside an extensive selection of ready-to-study intranasal sprays (Semax, Selank, BPC-157 &amp; more).</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- REFINED EDITORIAL OFFER SECTION -->
          <tr>
            <td style="padding: 0 36px 40px 36px;" class="mobile-pad">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 16px; padding: 36px 28px; text-align: center;">
                <tr>
                  <td align="center">
                    
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.18em;">
                      Exclusive Welcome Courtesy
                    </p>

                    <h2 style="margin: 0 0 10px 0; font-size: 44px; font-weight: 900; color: #0A0A0A; letter-spacing: -0.04em; line-height: 1;">
                      ${discountPercent}% OFF
                    </h2>

                    <p style="margin: 0 auto 20px auto; font-size: 14px; color: #52525B; line-height: 1.5; max-width: 420px;">
                      As a thank you to our GlobalGen Pharmacy community, enjoy 20% off your first Helix Bio Chem research order.
                    </p>

                    <!-- CLEAN MINIMALIST CODE PILL -->
                    <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px auto;">
                      <tr>
                        <td style="background-color: #FFFFFF; border: 1px solid #D4D4D8; border-radius: 8px; padding: 12px 28px; text-align: center;">
                          <span style="font-size: 11px; font-weight: 700; color: #71717A; text-transform: uppercase; letter-spacing: 0.12em; margin-right: 8px;">Code:</span>
                          <span style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 20px; font-weight: 800; color: #0A0A0A; letter-spacing: 2px;">${escapeHtml(couponCode)}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- REFINED SOLID BUTTON -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="${shopUrlWithCoupon}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; text-decoration: none; padding: 16px 38px; border-radius: 8px;">
                            Explore Helix Bio With 20% Off &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 32px 36px; border-top: 1px solid #E2E8F0; text-align: center;" class="mobile-pad">
              
              <!-- Quick Links -->
              <p style="margin: 0 0 16px 0; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                <a href="${serverUrl}/shop" target="_blank" style="color: #0F172A; text-decoration: none; margin: 0 10px;">Shop Catalog</a>
                <span style="color: #CBD5E1;">&bull;</span>
                <a href="${serverUrl}/shop" target="_blank" style="color: #0F172A; text-decoration: none; margin: 0 10px;">Research Sprays</a>
                <span style="color: #CBD5E1;">&bull;</span>
                <a href="${serverUrl}/contact-us" target="_blank" style="color: #0F172A; text-decoration: none; margin: 0 10px;">Support</a>
              </p>

              <!-- GlobalGen Customer Context Note -->
              <p style="margin: 0 0 12px 0; color: #64748B; font-size: 11px; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
                You are receiving this communication as a registered customer of GlobalGen Pharmacy. Helix Bio Chem is our specialized division dedicated to research-grade biochemical peptides.
              </p>

              <!-- Research Use Only Disclaimer -->
              <p style="margin: 0 0 14px 0; color: #94A3B8; font-size: 10px; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
                <strong>RESEARCH USE ONLY:</strong> All compounds offered by Helix Bio Chem are intended strictly for in-vitro laboratory research. Not for human or animal consumption, medical diagnosis, or therapy. Statements have not been evaluated by the FDA.
              </p>

              <p style="margin: 0; color: #94A3B8; font-size: 10px; letter-spacing: 0.05em;">
                &copy; ${new Date().getFullYear()} <a href="${serverUrl}" target="_blank" style="color: inherit; text-decoration: none; font-weight: 600;">Helix Bio Chem</a> &bull; GlobalGen Pharmacy. All rights reserved.<br/>
                <a href="${serverUrl}/unsubscribe" target="_blank" style="color: #94A3B8; text-decoration: underline;">Unsubscribe</a> &bull; <a href="${serverUrl}/account" target="_blank" style="color: #94A3B8; text-decoration: underline;">Manage Preferences</a>
              </p>

            </td>
          </tr>

        </table>
        <!-- END MAIN CARD -->

      </td>
    </tr>
  </table>

</body>
</html>`
}
