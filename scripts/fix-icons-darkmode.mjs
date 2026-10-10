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

// 1. Made in USA Flag Shield - Transparent background, no dark circle
// Works perfectly on both light & dark mode without inversion
const usaBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="usaRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#B91C1C" />
    </linearGradient>
    <linearGradient id="usaBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <clipPath id="shieldShape">
      <path d="M64 14L104 30V66C104 90 85 109 64 116C43 109 24 90 24 66V30L64 14Z" />
    </clipPath>
  </defs>
  
  <!-- Subtle Soft Base Container -->
  <rect x="8" y="8" width="112" height="112" rx="28" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="2"/>
  
  <!-- Shield with Flag Pattern -->
  <g clip-path="url(#shieldShape)">
    <!-- White background base -->
    <rect x="20" y="10" width="88" height="110" fill="#FFFFFF" />
    
    <!-- Red stripes -->
    <rect x="34" y="10" width="10" height="110" fill="url(#usaRed)" />
    <rect x="54" y="10" width="10" height="110" fill="url(#usaRed)" />
    <rect x="74" y="10" width="10" height="110" fill="url(#usaRed)" />
    <rect x="94" y="10" width="10" height="110" fill="url(#usaRed)" />
    
    <!-- Blue Canton -->
    <rect x="24" y="10" width="40" height="42" fill="url(#usaBlue)" />
    
    <!-- Crisp White Stars in Canton -->
    <polygon points="34,22 36,26 40,26 37,28 38,32 34,30 30,32 31,28 28,26 32,26" fill="#FFFFFF" />
    <polygon points="50,22 52,26 56,26 53,28 54,32 50,30 46,32 47,28 44,26 48,26" fill="#FFFFFF" />
    <polygon points="42,34 44,38 48,38 45,40 46,44 42,42 38,44 39,40 36,38 40,38" fill="#FFFFFF" />
  </g>
  
  <!-- Outer Shield Crisp Outline -->
  <path d="M64 14L104 30V66C104 90 85 109 64 116C43 109 24 90 24 66V30L64 14Z" fill="none" stroke="#0284C7" stroke-width="3.5" stroke-linejoin="round"/>
</svg>
`;

// 2. 503A Verified HPLC Tested - Clean Emerald / Teal Lab Shield
const verifiedBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="emGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  
  <!-- Subtle Soft Base Container -->
  <rect x="8" y="8" width="112" height="112" rx="28" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="2"/>
  
  <!-- Outer Hexagon Lab Ring -->
  <polygon points="64,22 98,40 98,82 64,102 30,82 30,40" fill="#FFFFFF" stroke="#10B981" stroke-width="2.5" stroke-linejoin="round" />
  
  <!-- Inner Shield -->
  <path d="M64 32L88 44V68C88 83 77 93 64 97C51 93 40 83 40 68V44L64 32Z" fill="url(#emGrad)" stroke="#047857" stroke-width="2" stroke-linejoin="round"/>
  
  <!-- Crisp White Checkmark -->
  <path d="M52 64L60 72L76 54" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Hexagon Molecule Node Dots -->
  <circle cx="30" cy="40" r="4.5" fill="#059669" />
  <circle cx="98" cy="40" r="4.5" fill="#059669" />
  <circle cx="98" cy="82" r="4.5" fill="#059669" />
  <circle cx="30" cy="82" r="4.5" fill="#059669" />
  <circle cx="64" cy="22" r="4.5" fill="#059669" />
  <circle cx="64" cy="102" r="4.5" fill="#059669" />
</svg>
`;

// 3. Specialty Nasal Sprays & Extended Catalog - Clean Cyan / Indigo
const sprayBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
  </defs>
  
  <!-- Subtle Soft Base Container -->
  <rect x="8" y="8" width="112" height="112" rx="28" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="2"/>
  
  <!-- Spray Bottle Body -->
  <rect x="52" y="56" width="32" height="48" rx="8" fill="#FFFFFF" stroke="#0284C7" stroke-width="3" />
  
  <!-- Liquid Level -->
  <rect x="56" y="74" width="24" height="26" rx="4" fill="#E0F2FE" />
  <line x1="56" y1="74" x2="80" y2="74" stroke="#0284C7" stroke-width="2" stroke-dasharray="3 2" />
  
  <!-- Bottle Neck -->
  <rect x="60" y="44" width="16" height="12" rx="2" fill="#0284C7" />
  
  <!-- Actuator / Spray Nozzle Pump -->
  <path d="M60 30H76V44H60V30Z" fill="url(#spGrad)" />
  <path d="M60 36H50V41H60" fill="url(#spGrad)" />
  
  <!-- Fine Mist Spray Particles -->
  <path d="M44 38C34 34 26 28 18 22" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 3" />
  <path d="M44 38C32 38 24 39 14 40" stroke="#0284C7" stroke-width="3" stroke-linecap="round" />
  <path d="M44 38C34 43 26 50 18 56" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 3" />
  
  <!-- Micro Droplets -->
  <circle cx="24" cy="28" r="3" fill="#0284C7" />
  <circle cx="16" cy="40" r="3.5" fill="#0284C7" />
  <circle cx="24" cy="50" r="2.5" fill="#0284C7" />
</svg>
`;

const ASSETS = [
  { name: 'icon-usa-verified', svg: usaBadgeSvg },
  { name: 'icon-503a-purity', svg: verifiedBadgeSvg },
  { name: 'icon-spray-catalog', svg: sprayBadgeSvg },
];

async function main() {
  for (const asset of ASSETS) {
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

  console.log('Successfully re-uploaded icons with non-inverting light backgrounds.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
