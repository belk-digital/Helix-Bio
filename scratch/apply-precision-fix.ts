// Applies 20261011_030000_fix_order_total_precision.ts directly via reviewed SQL (payload migrate
// hung on an unrelated boot issue earlier this session — see prior ledger-backfill work), then
// records it in payload_migrations. Prints before/after values for every touched row so the
// change is auditable, and verifies no row count or unrelated-column change occurred.
import { Client } from 'pg'

const MIGRATION_NAME = '20261011_030000_fix_order_total_precision'

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  try {
    const existingLedger = await client.query(`SELECT name FROM payload_migrations WHERE name = $1`, [MIGRATION_NAME])
    if (existingLedger.rows.length > 0) {
      console.error('Aborting: already applied.', existingLedger.rows)
      process.exit(1)
    }

    const before = await client.query(`
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
    console.log(`Before (${before.rows.length} rows):`, JSON.stringify(before.rows, null, 2))

    const totalCountBefore = await client.query(`SELECT COUNT(*) FROM orders`)

    await client.query('BEGIN')

    const updateRes = await client.query(`
      UPDATE "orders"
      SET
        "subtotal" = ROUND("subtotal"::numeric, 2),
        "discount_total" = ROUND("discount_total"::numeric, 2),
        "shipping_total" = ROUND("shipping_total"::numeric, 2),
        "tax_total" = ROUND("tax_total"::numeric, 2),
        "fee_total" = ROUND("fee_total"::numeric, 2),
        "total" = ROUND("total"::numeric, 2),
        "redeemed_points" = ROUND("redeemed_points"::numeric, 2)
      WHERE "subtotal" IS DISTINCT FROM ROUND("subtotal"::numeric, 2)
         OR "discount_total" IS DISTINCT FROM ROUND("discount_total"::numeric, 2)
         OR "shipping_total" IS DISTINCT FROM ROUND("shipping_total"::numeric, 2)
         OR "tax_total" IS DISTINCT FROM ROUND("tax_total"::numeric, 2)
         OR "fee_total" IS DISTINCT FROM ROUND("fee_total"::numeric, 2)
         OR "total" IS DISTINCT FROM ROUND("total"::numeric, 2)
         OR "redeemed_points" IS DISTINCT FROM ROUND("redeemed_points"::numeric, 2)
      RETURNING id, order_number, subtotal, discount_total, shipping_total, tax_total, fee_total, total, redeemed_points
    `)
    console.log(`\nUpdated ${updateRes.rowCount} rows. After:`, JSON.stringify(updateRes.rows, null, 2))

    // Sanity: every updated row's new total must be within half a cent of its old total — if
    // not, this touched something other than float noise, and we abort before committing.
    const beforeById = new Map(before.rows.map((r: any) => [r.id, r]))
    for (const row of updateRes.rows) {
      const prev = beforeById.get(row.id)
      if (!prev) throw new Error(`Row ${row.id} updated but wasn't in the before-set — aborting.`)
      for (const col of ['subtotal', 'discount_total', 'shipping_total', 'tax_total', 'fee_total', 'total', 'redeemed_points']) {
        const diff = Math.abs(Number(row[col]) - Number(prev[col]))
        if (diff > 0.005) {
          throw new Error(`Row ${row.id} column ${col} changed by ${diff} (more than half a cent) — aborting.`)
        }
      }
    }

    const totalCountAfter = await client.query(`SELECT COUNT(*) FROM orders`)
    if (totalCountBefore.rows[0].count !== totalCountAfter.rows[0].count) {
      throw new Error(`Row count changed (${totalCountBefore.rows[0].count} -> ${totalCountAfter.rows[0].count}) — aborting.`)
    }

    await client.query(
      `INSERT INTO payload_migrations (name, batch, updated_at, created_at) VALUES ($1, 3, NOW(), NOW())`,
      [MIGRATION_NAME]
    )

    await client.query('COMMIT')
    console.log('\nCommitted. All diffs were <= half a cent, row count unchanged, ledger recorded.')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Precision fix failed:', err)
  process.exit(1)
})
