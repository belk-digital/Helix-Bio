async function run() {
  try {
    const qs = new URLSearchParams({ 'where[slug][equals]': 'bac-water-bacteriostatic-water', 'depth': '1' });
    const res = await fetch('http://localhost:3000/api/products?' + qs.toString());
    const data = await res.json();
    console.log(`Total Docs: ${data.totalDocs}`);
    if (data.docs.length > 0) {
      console.log('Product Found:', data.docs[0].slug);
      console.log('Variants:', JSON.stringify(data.docs[0].variants, null, 2));
    }
  } catch (e) {
    console.error('Error fetching API', e);
  }
}
run();
