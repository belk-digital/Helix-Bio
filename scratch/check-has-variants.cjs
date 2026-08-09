const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.tpukpnpdehbtlqhnffpb:Cx5fRufd3NVxOny5@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
  });
  
  await client.connect();
  
  const res = await client.query(`
    SELECT p.id, p.slug, p.has_variants
    FROM products p
    WHERE p.slug = 'bac-water-bacteriostatic-water'
  `);
  
  console.log(res.rows);
  
  await client.end();
}

run().catch(console.error);
