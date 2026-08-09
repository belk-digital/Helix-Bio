import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.tpukpnpdehbtlqhnffpb:Cx5fRufd3NVxOny5@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
  });
  
  await client.connect();
  
  const res = await client.query(`
    SELECT pv.sku, pvo.value as option_value
    FROM products p
    JOIN products_variants pv ON p.id = pv._parent_id
    LEFT JOIN products_variants_options pvo ON pv.id = pvo._parent_id
    WHERE p.slug = 'bac-water-bacteriostatic-water'
  `);
  
  console.log('BAC Water variants SKUs:');
  console.log(res.rows);
  
  await client.end();
}

run().catch(console.error);
