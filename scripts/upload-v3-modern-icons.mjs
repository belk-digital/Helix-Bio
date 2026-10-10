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

// Icon 1: Modern USA Synthesis (High-contrast, bold, self-contained squircle badge)
const usaSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid High-Contrast Container Badge (Non-inverted in dark mode) -->
  <rect x="4" y="4" width="120" height="120" rx="32" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="3"/>
  
  <!-- Modern Geometric USA Shield -->
  <g>
    <!-- Shield Base -->
    <path d="M64 22L96 34V66C96 88 80 102 64 108C48 102 32 88 32 66V34L64 22Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="4" stroke-linejoin="round"/>
    
    <!-- Red Stripes -->
    <path d="M48 30V99.5C43 95 38 88 36 78V33L48 30Z" fill="#EF4444" />
    <path d="M60 23.5V106.5C62.5 107.5 64 108 64 108C64 108 65.5 107.5 68 106.5V23.5L64 22L60 23.5Z" fill="#EF4444" />
    <path d="M80 30V99.5C85 95 90 88 92 78V33L80 30Z" fill="#EF4444" />
    
    <!-- Blue Canton Top Left -->
    <path d="M32 34V58H64V22L32 34Z" fill="#1E3A8A" />
    
    <!-- Bold White Star in Canton -->
    <polygon points="48,34 50.5,41 58,41 52,45.5 54.5,52.5 48,48 41.5,52.5 44,45.5 38,41 45.5,41" fill="#FFFFFF" />
    
    <!-- Re-outline Shield for Razor-Sharp Border -->
    <path d="M64 22L96 34V66C96 88 80 102 64 108C48 102 32 88 32 66V34L64 22Z" fill="none" stroke="#0284C7" stroke-width="4" stroke-linejoin="round"/>
  </g>
</svg>
`;

// Icon 2: Modern 503A HPLC Verified (Laboratory Flask + Precision Checkmark)
const verifiedSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid High-Contrast Container Badge -->
  <rect x="4" y="4" width="120" height="120" rx="32" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="3"/>
  
  <!-- Laboratory Flask Silhouette -->
  <path d="M56 24H72V42L88 72C93 81 87 92 78 92H50C41 92 35 81 40 72L56 42V24Z" fill="#DCFCE7" stroke="#059669" stroke-width="4" stroke-linejoin="round" />
  <line x1="52" y1="24" x2="76" y2="24" stroke="#059669" stroke-width="4" stroke-linecap="round" />
  
  <!-- Liquid Wave inside Flask -->
  <path d="M44 76C48 72 54 72 58 75C62 78 68 78 72 75C76 72 80 73 84 76L86 78C87 81 86 86 82 88C80 89 77 90 74 90H54C48 90 44 87 43 82L44 76Z" fill="#10B981" />
  
  <!-- Circular Verified Seal Floating Right -->
  <circle cx="82" cy="74" r="22" fill="#059669" stroke="#FFFFFF" stroke-width="3.5" />
  <!-- Crisp White Checkmark -->
  <path d="M73 74L79 80L91 68" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

// Icon 3: Modern Specialty Nasal Sprays & Extended Catalog (Medical Precision Atomizer)
const spraySvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid High-Contrast Container Badge -->
  <rect x="4" y="4" width="120" height="120" rx="32" fill="#EEF2FF" stroke="#C7D2FE" stroke-width="3"/>
  
  <!-- Modern Spray Bottle Body -->
  <rect x="52" y="54" width="36" height="52" rx="10" fill="#E0E7FF" stroke="#4F46E5" stroke-width="4" />
  
  <!-- Liquid Level Window -->
  <rect x="58" y="74" width="24" height="26" rx="5" fill="#4F46E5" fill-opacity="0.3" />
  <line x1="58" y1="74" x2="82" y2="74" stroke="#4F46E5" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 3" />
  
  <!-- Atomizer Neck & Pump -->
  <rect x="62" y="42" width="16" height="12" rx="3" fill="#4F46E5" />
  <path d="M60 26H80V42H60V26Z" fill="#4338CA" />
  
  <!-- Precision Spray Nozzle -->
  <path d="M60 32H48V38H60" fill="#4338CA" stroke="#4338CA" stroke-width="1.5" stroke-linecap="round" />
  
  <!-- Active Mist Cloud & Droplets -->
  <path d="M42 34C32 30 24 23 16 16" stroke="#06B6D4" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 4" />
  <path d="M40 35C28 36 20 37 12 38" stroke="#06B6D4" stroke-width="3.5" stroke-linecap="round" />
  <path d="M42 36C32 43 24 51 16 58" stroke="#06B6D4" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 4" />
  
  <!-- Precision Mist Micro-Droplets -->
  <circle cx="28" cy="24" r="3.5" fill="#06B6D4" />
  <circle cx="20" cy="37" r="4" fill="#06B6D4" />
  <circle cx="28" cy="50" r="3" fill="#06B6D4" />
</svg>
`;

const NEW_ASSETS = [
  { name: 'icon-modern-usa', svg: usaSvg },
  { name: 'icon-modern-503a', svg: verifiedSvg },
  { name: 'icon-modern-spray', svg: spraySvg },
];

async function main() {
  console.log('Uploading brand new modern high-contrast icons to R2...');

  for (const asset of NEW_ASSETS) {
    const pngKey = `email-assets/${asset.name}.png`;
    const svgKey = `email-assets/${asset.name}.svg`;

    console.log(`Rendering and uploading ${pngKey}...`);
    const pngBuffer = await sharp(Buffer.from(asset.svg.trim(), 'utf-8'))
      .resize(128, 128)
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

  console.log('All new modern icons uploaded successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
