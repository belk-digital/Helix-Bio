import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client({ connectionString: process.env.DATABASE_URI });

async function main() {
  await client.connect();
  const codes = ['GG20', 'GLOBALGEN20', 'HELIX20'];
  for (const code of codes) {
    const res = await client.query('SELECT id, code, value FROM coupons WHERE code = $1', [code]);
    if (res.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO coupons (code, usage_count, is_active, free_shipping, type, value, applicable_product_types, applies_to, created_at, updated_at)
        VALUES ($1, 0, true, false, 'percentage', 20, 'normal_only', 'all', NOW(), NOW())
        RETURNING id, code, value;
      `, [code]);
      console.log(`Created coupon ${code}:`, ins.rows[0]);
    } else {
      console.log(`Coupon ${code} exists:`, res.rows[0]);
    }
  }
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
