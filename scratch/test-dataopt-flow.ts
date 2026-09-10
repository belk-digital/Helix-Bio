// One-off verification of Data-opt's real HTTP API against our integration's exact logic —
// stopping short of ever paying (creating a SKU/order/receipt costs nothing; only completing the
// crypto payment on the hosted portal would move funds). Doesn't touch the `orders` table at all
// (no Payload order is created), so there's nothing to clean up there; the one throwaway SKU this
// registers in Data-opt's own inventory is harmless and left as-is (Data-opt has no docs for
// deleting one, and it references no real HelixBio product).
//
// Run with: npx tsx --env-file=.env scratch/test-dataopt-flow.ts
const DATAOPT_BASE_URL = 'https://pay.data-opt.com'
const TEST_TOTAL = 1.23
const sku = `HB-TEST-${Date.now()}`

async function main() {
  console.log(`Using API key: ${process.env.DATAOPT_API_KEY?.slice(0, 12)}... / wallet: ${process.env.DATAOPT_MERCHANT_WALLET}`)

  console.log('\n--- Step 1: POST /api/inventory (register a throwaway test SKU) ---')
  const inventoryRes = await fetch(`${DATAOPT_BASE_URL}/api/inventory`, {
    method: 'POST',
    headers: { 'x-api-key': process.env.DATAOPT_API_KEY as string, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sku, name: 'HelixBio Integration Test', priceUsd: TEST_TOTAL, stockQty: 1, taxable: false }),
  })
  const inventoryBody = await inventoryRes.text()
  console.log('Status:', inventoryRes.status)
  console.log('Body:', inventoryBody)

  if (!inventoryRes.ok) {
    console.log('\nStopping here — inventory registration failed.')
    process.exit(1)
  }

  console.log('\n--- Step 2: POST /api/orders (create a receipt referencing that SKU) ---')
  const orderRes = await fetch(`${DATAOPT_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'x-api-key': process.env.DATAOPT_API_KEY as string, 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ sku, qty: 1 }] }),
  })
  const orderBody = await orderRes.text()
  console.log('Status:', orderRes.status)
  console.log('Body:', orderBody)

  if (!orderRes.ok) {
    console.log('\nStopping here — order/receipt creation failed.')
    process.exit(1)
  }

  const orderData = JSON.parse(orderBody)
  const receiptId = orderData?.receipt?.receiptId
  const totalUsd = orderData?.receipt?.totalUsd
  console.log(`\nreceiptId=${receiptId}, totalUsd=${totalUsd} (expected ${TEST_TOTAL})`)
  console.log(`totalUsd matches expected: ${Math.abs(Number(totalUsd) - TEST_TOTAL) <= 0.01}`)

  if (!receiptId) {
    console.log('\nStopping here — no receiptId returned, cannot check status.')
    process.exit(1)
  }

  const portalUrl = `${DATAOPT_BASE_URL}/portal/${receiptId}?${new URLSearchParams({ recipient: process.env.DATAOPT_MERCHANT_WALLET as string, layout: 'wide', returnUrl: 'https://helixbiochem.com/order-confirmation/TEST' })}`
  console.log(`\nPortal redirect URL would be: ${portalUrl}`)

  console.log('\n--- Step 3: GET /api/receipts/status (should show unpaid, since nobody paid) ---')
  const statusRes = await fetch(`${DATAOPT_BASE_URL}/api/receipts/status?receiptId=${encodeURIComponent(receiptId)}`, {
    headers: { 'x-api-key': process.env.DATAOPT_API_KEY as string },
  })
  const statusBody = await statusRes.text()
  console.log('Status:', statusRes.status)
  console.log('Body:', statusBody)

  console.log('\nDone. No payment was made at any point — this only exercised the API surface up to (not including) the actual payment step.')
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
