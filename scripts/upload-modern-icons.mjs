import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const s3 = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  region: 'auto',
  forcePathStyle: true,
});

const BUCKET = process.env.R2_BUCKET;

// Modern Linear/Apple-inspired duo-tone minimalist vector icons (96x96 @ 2x)
// Transparent background, refined 2.5px strokes, no clunky circles, perfect in light & dark mode.

// 1. Modern USA Synthesis Shield
const usaModernSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Modern Soft Squircle Backdrop (Adaptive soft tint that looks stunning on white OR dark mode) -->
  <rect x="4" y="4" width="88" height="88" rx="22" fill="#0284C7" fill-opacity="0.08" stroke="#0284C7" stroke-opacity="0.25" stroke-width="1.5" />
  
  <!-- Sleek Geometric Shield -->
  <path d="M48 20L72 29V48C72 63.5 61.5 74.5 48 78C34.5 74.5 24 63.5 24 48V29L48 20Z" fill="#0284C7" fill-opacity="0.12" stroke="#0284C7" stroke-width="2.5" stroke-linejoin="round" />
  
  <!-- US Flag Stripes Inside Shield -->
  <path d="M48 26V76" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round" />
  <path d="M40 28V72" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" />
  <path d="M56 28V72" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" />
  <path d="M32 33V63" stroke="#0284C7" stroke-width="2" stroke-linecap="round" />
  <path d="M64 33V63" stroke="#0284C7" stroke-width="2" stroke-linecap="round" />

  <!-- Modern Star Accent -->
  <circle cx="48" cy="38" r="4.5" fill="#0284C7" />
  <circle cx="48" cy="38" r="2" fill="#FFFFFF" />
</svg>
`;

// 2. Modern 503A HPLC Verified Lab Shield
const verifiedModernSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Modern Soft Squircle Backdrop -->
  <rect x="4" y="4" width="88" height="88" rx="22" fill="#059669" fill-opacity="0.08" stroke="#059669" stroke-opacity="0.25" stroke-width="1.5" />
  
  <!-- Outer Analytical Hexagon Ring -->
  <polygon points="48,22 72,36 72,60 48,74 24,60 24,36" fill="#059669" fill-opacity="0.1" stroke="#059669" stroke-width="2" stroke-linejoin="round" />
  
  <!-- Inner Verification Shield -->
  <path d="M48 28L64 36V52C64 62 57 68 48 70C39 68 32 62 32 52V36L48 28Z" fill="#059669" stroke="#059669" stroke-width="2" stroke-linejoin="round" />
  
  <!-- Sharp Modern Checkmark -->
  <path d="M41 49L46 54L56 42" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Satellite Analytical Node Dots -->
  <circle cx="48" cy="22" r="3" fill="#10B981" />
  <circle cx="72" cy="36" r="3" fill="#10B981" />
  <circle cx="72" cy="60" r="3" fill="#10B981" />
  <circle cx="48" cy="74" r="3" fill="#10B981" />
  <circle cx="24" cy="60" r="3" fill="#10B981" />
  <circle cx="24" cy="36" r="3" fill="#10B981" />
</svg>
`;

// 3. Modern Specialty Spray & Catalog Droplet Atomizer
const sprayModernSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Modern Soft Squircle Backdrop -->
  <rect x="4" y="4" width="88" height="88" rx="22" fill="#6366F1" fill-opacity="0.08" stroke="#6366F1" stroke-opacity="0.25" stroke-width="1.5" />
  
  <!-- Minimalist Spray Bottle Body -->
  <rect x="38" y="46" width="28" height="34" rx="6" fill="#6366F1" fill-opacity="0.12" stroke="#6366F1" stroke-width="2.5" />
  
  <!-- Liquid Indicator Line -->
  <line x1="42" y1="62" x2="62" y2="62" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="2 2" />
  
  <!-- Collar & Pump Nozzle -->
  <rect x="46" y="38" width="12" height="8" rx="1.5" fill="#6366F1" />
  <path d="M47 28H57V38H47V28Z" fill="#6366F1" />
  <path d="M47 32H39V36H47" fill="#6366F1" stroke="#6366F1" stroke-width="1" stroke-linejoin="round" />
  
  <!-- Micron Mist Spray Cloud Particles -->
  <circle cx="31" cy="27" r="2.5" fill="#6366F1" />
  <circle cx="23" cy="33" r="3.5" fill="#6366F1" />
  <circle cx="29" cy="41" r="2.5" fill="#6366F1" />
  <circle cx="17" cy="42" r="2" fill="#818CF8" />
  <circle cx="23" cy="23" r="1.5" fill="#818CF8" />

  <!-- Spray Flow Arc Lines -->
  <path d="M35 32C28 30 22 26 18 20" stroke="#818CF8" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2" />
  <path d="M35 36C28 39 22 45 18 51" stroke="#818CF8" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2" />
</svg>
`;

const ASSETS = [
  { name: 'icon-usa-verified', svg: usaModernSvg },
  { name: 'icon-503a-purity', svg: verifiedModernSvg },
  { name: 'icon-spray-catalog', svg: sprayModernSvg },
];

async function main() {
  for (const asset of ASSETS) {
    const pngKey = `email-assets/${asset.name}.png`;
    const svgKey = `email-assets/${asset.name}.svg`;

    console.log(`Rendering and uploading ${pngKey}...`);
    const pngBuffer = await sharp(Buffer.from(asset.svg.trim(), 'utf-8'))
      .resize(96, 96)
      .png({ quality: 100 })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: pngKey,
      Body: pngBuffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: svgKey,
      Body: Buffer.from(asset.svg.trim(), 'utf-8'),
      ContentType: 'image/svg+xml',
      CacheControl: 'public, max-age=31536000, immutable',
    }));
  }

  console.log('Successfully uploaded ultra-modern, non-inverting squircle icons!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
