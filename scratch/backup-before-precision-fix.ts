// Read-only safety-net export, run BEFORE the floating-point precision cleanup on orders.
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.join(process.cwd(), 'scratch')

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  try {
    const tablesRes = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND (table_name = 'orders' OR table_name LIKE 'orders\\_%')
       ORDER BY table_name`
    )
    const orderTables = tablesRes.rows.map((r) => r.table_name)
    const summary: Record<string, number> = {}

    for (const table of orderTables) {
      const res = await client.query(`SELECT * FROM "${table}"`)
      const outFile = path.join(OUT_DIR, `backup2_${table}.json`)
      fs.writeFileSync(outFile, JSON.stringify(res.rows, null, 2))
      summary[table] = res.rows.length
      console.log(`Backed up ${table}: ${res.rows.length} rows -> ${outFile}`)
    }

    console.log('\nDone. Summary:', summary)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Backup failed:', err)
  process.exit(1)
})
