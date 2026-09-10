// Restores stock reserved by the nextlvlpay integration test orders and deletes all synthetic
// test orders (15-21) created while testing the nextlvlpay integration and the CMS-managed
// payment methods feature. Orders 17 and 20 were already cancelled during testing (their stock
// reservations already released), so they are only deleted, not stock-restored. Order 21 never
// completed payment (still pending) but did reserve stock. Run with:
//   npx tsx --env-file=.env.local scratch/cleanup-test-order.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const ORDERS_TO_DELETE = [15, 16, 17, 18, 19, 20, 21, 26]
const ORDERS_NEEDING_STOCK_RESTORE = [15, 16, 18, 19, 21, 26] // 17 & 20 already released on cancellation

async function main() {
  const payload = await getPayload({ config: configPromise })

  for (const id of ORDERS_NEEDING_STOCK_RESTORE) {
    const order = await payload.findByID({ collection: 'orders', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (!order) continue
    for (const item of order.items || []) {
      const productId = typeof item.product === 'object' ? item.product?.id : item.product
      if (!productId) continue
      const product = await payload.findByID({ collection: 'products', id: productId, depth: 0, overrideAccess: true })
      const restored = (product.stock || 0) + (item.quantity || 1)
      await payload.update({ collection: 'products', id: productId, data: { stock: restored }, overrideAccess: true })
      console.log(`Order ${id}: restored ${product.name}: ${product.stock} -> ${restored}`)
    }
  }

  for (const id of ORDERS_TO_DELETE) {
    await payload.delete({ collection: 'orders', id, overrideAccess: true }).catch((err) => {
      console.log(`Order ${id}: delete skipped (${err.message})`)
    })
    console.log(`Deleted test order ${id}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
