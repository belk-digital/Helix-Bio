async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/products?where[slug][equals]=bac-water-bacteriostatic-water&depth=1');
    const data = await res.json();
    console.log(JSON.stringify(data.docs[0].variants, null, 2));
  } catch (e) {
    console.error('Error fetching API', e);
  }
}
run();
