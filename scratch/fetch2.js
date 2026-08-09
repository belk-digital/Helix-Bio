async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/products?limit=5');
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error('Error fetching API', e);
  }
}
run();
