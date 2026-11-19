// Renders the broadcast email to scratch/broadcast-final-batch.html, ready to paste into Resend.
// Usage: npx tsx scripts/render-broadcast-email.ts "<business mailing address>" [couponCode]
import { mkdirSync, writeFileSync } from 'node:fs'
import { generateBroadcastEmail } from '../src/lib/emails/generateBroadcastEmail'

const [address, couponCode] = process.argv.slice(2)

if (!address || !address.trim()) {
  console.error('Usage: npx tsx scripts/render-broadcast-email.ts "<business mailing address>" [couponCode]')
  process.exit(1)
}

const html = generateBroadcastEmail({ postalAddress: address, couponCode: couponCode || 'GG20' })

mkdirSync('scratch', { recursive: true })
writeFileSync('scratch/broadcast-final-batch.html', html, 'utf8')
console.log(`Wrote scratch/broadcast-final-batch.html (${html.length} bytes)`)
