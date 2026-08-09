import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function check() {
  const payload = await getPayload({ config: configPromise })
  
  const docs = await payload.find({
    collection: 'products',
    where: { slug: { contains: 'bac-water' } },
    depth: 1,
    overrideAccess: true,
  })

  console.log(`Found ${docs.totalDocs} products matching 'bac-water'`);
  
  if (docs.totalDocs > 0) {
    const prod = docs.docs[0];
    console.log('Slug:', prod.slug);
    console.log('Status:', prod.status);
    console.log('Has Variants:', prod.hasVariants);
    console.log('Variants length:', prod.variants?.length);
    console.log('SKUs:', prod.variants?.map((v: any) => v.sku));
  }
  
  process.exit(0)
}

check()
