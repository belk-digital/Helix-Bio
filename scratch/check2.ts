import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function checkBacWater() {
  const payload = await getPayload({ config: configPromise })
  const docs = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'bac-water-bacteriostatic-water' } },
    depth: 1,
  })

  const prod = docs.docs[0]
  if (!prod) {
    console.log('BAC Water product not found!')
    process.exit(0)
  }

  console.log(JSON.stringify(prod.variants, null, 2))
  process.exit(0)
}

checkBacWater()
