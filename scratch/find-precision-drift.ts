import { Client } from 'pg'

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  console.log('--- Column types (confirm these are exact-decimal, not float8) ---')
  const types = await client.query(
    `SELECT table_name, column_name, data_type, numeric_precision, numeric_scale
     FROM information_schema.columns
     WHERE table_name IN ('orders', 'orders_applied_fees')
       AND column_name IN ('subtotal', 'discount_total', 'shipping_total', 'tax_total', 'fee_total', 'total', 'redeemed_points', 'amount')
     ORDER BY table_name, column_name`
  )
  console.log(JSON.stringify(types.rows, null, 2))

  console.log('\n--- orders rows with precision drift (stored value != rounded-to-2dp value) ---')
  const driftedOrders = await client.query(`
    SELECT id, order_number, subtotal, discount_total, shipping_total, tax_total, fee_total, total, redeemed_points
    FROM orders
    WHERE subtotal IS DISTINCT FROM ROUND(subtotal::numeric, 2)
       OR discount_total IS DISTINCT FROM ROUND(discount_total::numeric, 2)
       OR shipping_total IS DISTINCT FROM ROUND(shipping_total::numeric, 2)
       OR tax_total IS DISTINCT FROM ROUND(tax_total::numeric, 2)
       OR fee_total IS DISTINCT FROM ROUND(fee_total::numeric, 2)
       OR total IS DISTINCT FROM ROUND(total::numeric, 2)
       OR redeemed_points IS DISTINCT FROM ROUND(redeemed_points::numeric, 2)
    ORDER BY id
  `)
  console.log(`Found ${driftedOrders.rows.length} drifted order row(s):`)
  console.log(JSON.stringify(driftedOrders.rows, null, 2))

  console.log('\n--- orders_applied_fees rows with precision drift ---')
  const driftedFees = await client.query(`
    SELECT id, _parent_id, fee_name, amount, percentage
    FROM orders_applied_fees
    WHERE amount IS DISTINCT FROM ROUND(amount::numeric, 2)
       OR (percentage IS NOT NULL AND percentage IS DISTINCT FROM ROUND(percentage::numeric, 4))
    ORDER BY _parent_id
  `)
  console.log(`Found ${driftedFees.rows.length} drifted applied-fee row(s):`)
  console.log(JSON.stringify(driftedFees.rows, null, 2))

  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
