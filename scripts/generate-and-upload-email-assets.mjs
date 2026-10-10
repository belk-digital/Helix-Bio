import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
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
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || 'https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev').replace(/\/$/, '');

// 1. Icon: Made in USA / Domestic Synthesis
const usaBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="usaBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </radialGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Background circle -->
  <circle cx="64" cy="64" r="60" fill="url(#usaBg)" stroke="#334155" stroke-width="2" />
  <circle cx="64" cy="64" r="54" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
  
  <!-- Shield outline -->
  <path d="M64 24L88 34V60C88 77 77.5 92 64 98C50.5 92 40 77 40 60V34L64 24Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  
  <!-- Stripes inside shield (clipped) -->
  <g clip-path="url(#shieldClip)">
    <clipPath id="shieldClip">
      <path d="M64 26L86 35V60C86 75.5 76.5 89.5 64 95.5C51.5 89.5 42 75.5 42 60V35L64 26Z" />
    </clipPath>
    <!-- Background white -->
    <rect x="40" y="24" width="50" height="75" fill="#f8fafc" />
    <!-- Red stripes -->
    <rect x="48" y="24" width="7" height="75" fill="url(#redGrad)" />
    <rect x="62" y="24" width="7" height="75" fill="url(#redGrad)" />
    <rect x="76" y="24" width="7" height="75" fill="url(#redGrad)" />
    <!-- Blue canton -->
    <rect x="40" y="24" width="26" height="30" fill="#1e3a8a" />
    <!-- White stars in canton -->
    <polygon points="48,32 49.5,35 53,35 50,37 51.5,40 48,38 44.5,40 46,37 43,35 46.5,35" fill="#ffffff" />
    <polygon points="58,32 59.5,35 63,35 60,37 61.5,40 58,38 54.5,40 56,37 53,35 56.5,35" fill="#ffffff" />
    <polygon points="53,42 54.5,45 58,45 55,47 56.5,50 53,48 49.5,50 51,47 48,45 51.5,45" fill="#ffffff" />
  </g>
  
  <!-- Shield border re-stroke -->
  <path d="M64 24L88 34V60C88 77 77.5 92 64 98C50.5 92 40 77 40 60V34L64 24Z" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  
  <!-- Bottom Stars -->
  <polygon points="64,105 65.5,108 69,108 66,110 67.5,113 64,111 60.5,113 62,110 59,108 62.5,108" fill="#38bdf8" />
  <polygon points="50,103 51.2,105.5 54,105.5 51.5,107 52.7,109.5 50,108 47.3,109.5 48.5,107 46,105.5 48.8,105.5" fill="#94a3b8" />
  <polygon points="78,103 79.2,105.5 82,105.5 79.5,107 80.7,109.5 78,108 75.3,109.5 76.5,107 74,105.5 76.8,105.5" fill="#94a3b8" />
</svg>
`;

// 2. Icon: 503A Verified & High Purity (Shield with Checkmark & Molecular Ring)
const verifiedBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0f2922" />
      <stop offset="100%" stop-color="#04120e" />
    </radialGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="tealGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#vBg)" stroke="#134e4a" stroke-width="2" />
  <circle cx="64" cy="64" r="54" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6" />
  
  <!-- Outer Hexagon ring -->
  <polygon points="64,20 98,38 98,78 64,98 30,78 30,38" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linejoin="round" opacity="0.4" />
  
  <!-- Center Verified Shield -->
  <path d="M64 28L86 38V62C86 78 76.5 91 64 96C51.5 91 42 78 42 62V38L64 28Z" fill="#064e3b" stroke="url(#emeraldGrad)" stroke-width="2.5" stroke-linejoin="round"/>
  
  <!-- Checkmark -->
  <path d="M53 61L61 69L76 52" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- 99%+ text badge below checkmark -->
  <rect x="46" y="76" width="36" height="14" rx="7" fill="#022c22" stroke="#34d399" stroke-width="1" />
  <text x="64" y="86.5" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="8.5" font-weight="800" fill="#34d399" text-anchor="middle" letter-spacing="0.5">503A · HPLC</text>
  
  <!-- Floating Orbit Molecule Nodes -->
  <circle cx="30" cy="38" r="4" fill="#34d399" />
  <circle cx="98" cy="38" r="4" fill="#34d399" />
  <circle cx="98" cy="78" r="4" fill="#34d399" />
  <circle cx="30" cy="78" r="4" fill="#34d399" />
</svg>
`;

// 3. Icon: Sprays & Comprehensive Catalog (Atomizer Mist & Droplets)
const sprayBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e1e38" />
      <stop offset="100%" stop-color="#0a0a14" />
    </radialGradient>
    <linearGradient id="cyanMist" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#spBg)" stroke="#312e81" stroke-width="2" />
  <circle cx="64" cy="64" r="54" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5" />
  
  <!-- Spray Bottle Body -->
  <rect x="50" y="58" width="28" height="42" rx="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5" />
  <!-- Liquid level inside bottle -->
  <rect x="53" y="74" width="22" height="23" rx="3" fill="#38bdf8" opacity="0.3" />
  <line x1="53" y1="74" x2="75" y2="74" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 2" />
  
  <!-- Spray Neck / Collar -->
  <rect x="56" y="48" width="16" height="10" rx="2" fill="#312e81" stroke="#a5b4fc" stroke-width="2" />
  
  <!-- Actuator / Spray Pump Nozzle -->
  <path d="M57 36H71V48H57V36Z" fill="#4338ca" stroke="#c7d2fe" stroke-width="2" />
  <path d="M57 41H50V45H57" fill="#4338ca" stroke="#c7d2fe" stroke-width="2" stroke-linecap="round" />
  
  <!-- Dip tube -->
  <line x1="64" y1="48" x2="64" y2="92" stroke="#a5b4fc" stroke-width="1.5" stroke-dasharray="3 2" />
  
  <!-- Mist spray particles issuing from nozzle -->
  <!-- Conical mist wave -->
  <path d="M46 43C38 39 30 33 22 28" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3" />
  <path d="M46 43C36 43 28 44 18 45" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />
  <path d="M46 43C38 47 30 53 22 58" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3" />
  
  <!-- Fine droplets -->
  <circle cx="28" cy="34" r="2.5" fill="#38bdf8" />
  <circle cx="18" cy="32" r="1.5" fill="#7dd3fc" />
  <circle cx="22" cy="45" r="3" fill="#38bdf8" />
  <circle cx="12" cy="45" r="2" fill="#7dd3fc" />
  <circle cx="26" cy="54" r="2" fill="#38bdf8" />
  <circle cx="16" cy="58" r="1.5" fill="#7dd3fc" />
  
  <!-- Right Sparkles -->
  <polygon points="86,34 88,40 94,40 89,44 91,50 86,46 81,50 83,44 78,40 84,40" fill="#facc15" />
  <polygon points="98,58 99.2,61.5 103,61.5 100,64 101,67.5 98,65 95,67.5 96,64 93,61.5 96.8,61.5" fill="#facc15" />
</svg>
`;

// 4. Icon: Special 20% Discount / Voucher Spark
const discountBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="dcBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a1215" />
      <stop offset="100%" stop-color="#120406" />
    </radialGradient>
    <linearGradient id="goldAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#dcBg)" stroke="#78350f" stroke-width="2" />
  <circle cx="64" cy="64" r="54" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
  
  <!-- Coupon Tag Shape -->
  <path d="M34 44C34 38.4772 38.4772 34 44 34H84C89.5228 34 94 38.4772 94 44V56C90.6863 56 88 58.6863 88 62C88 65.3137 90.6863 68 94 68V84C94 89.5228 89.5228 94 84 94H44C38.4772 94 34 89.5228 34 84V68C37.3137 68 40 65.3137 40 62C40 58.6863 37.3137 56 34 56V44Z" fill="#1c1917" stroke="url(#goldAmber)" stroke-width="2.5" />
  
  <!-- Dashed dividing line -->
  <line x1="72" y1="36" x2="72" y2="92" stroke="#78716c" stroke-width="2" stroke-dasharray="3 3" />
  
  <!-- Percent Symbol on right -->
  <text x="83" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="900" fill="#f59e0b" text-anchor="middle">%</text>
  
  <!-- 20 on left -->
  <text x="52" y="71" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="28" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="-1">20</text>
  
  <text x="52" y="46" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="8.5" font-weight="800" fill="#fbbf24" text-anchor="middle" letter-spacing="1">SAVE</text>
  <text x="52" y="84" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="8" font-weight="700" fill="#a8a29e" text-anchor="middle" letter-spacing="0.5">EXCLUSIVE</text>
</svg>
`;

// 5. Icon: Fast Temperature-Monitored Dispatch
const shippingBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="shBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="cyanGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#shBg)" stroke="#1e293b" stroke-width="2" />
  <circle cx="64" cy="64" r="54" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5" />
  
  <!-- Express Shipping Delivery Van -->
  <path d="M30 46H68V76H30V46Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
  <path d="M68 54H84L94 65V76H68V54Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Window -->
  <path d="M72 58H82L88 66H72V58Z" fill="#38bdf8" opacity="0.3" stroke="#38bdf8" stroke-width="1.5" />
  <!-- Wheels -->
  <circle cx="46" cy="78" r="9" fill="#020617" stroke="#38bdf8" stroke-width="2.5" />
  <circle cx="46" cy="78" r="3.5" fill="#38bdf8" />
  <circle cx="82" cy="78" r="9" fill="#020617" stroke="#38bdf8" stroke-width="2.5" />
  <circle cx="82" cy="78" r="3.5" fill="#38bdf8" />
  
  <!-- Speed lines -->
  <line x1="20" y1="52" x2="26" y2="52" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
  <line x1="16" y1="60" x2="26" y2="60" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
  <line x1="22" y1="68" x2="26" y2="68" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
  
  <!-- Cold shield / snowflake indicator -->
  <circle cx="49" cy="61" r="5" fill="#0369a1" />
  <path d="M49 57V65M45 61H53" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
</svg>
`;

// 6. Icon: Pure Molecular Research / COA Guarantee
const molecularBadgeSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="molBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#111827" />
      <stop offset="100%" stop-color="#030712" />
    </radialGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#molBg)" stroke="#374151" stroke-width="2" />
  <circle cx="64" cy="64" r="54" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5" />
  
  <!-- Laboratory Flask -->
  <path d="M58 32H70V44L85 70C88 75 84 82 78 82H50C44 82 40 75 43 70L58 44V32Z" fill="#1f2937" stroke="#06b6d4" stroke-width="2.5" stroke-linejoin="round" />
  <line x1="55" y1="32" x2="73" y2="32" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" />
  
  <!-- Liquid level -->
  <path d="M47 72L54 60C58 63 62 63 66 60C70 58 74 61 78 63L81 72C82 75 80 80 76 80H52C48 80 46 75 47 72Z" fill="#06b6d4" opacity="0.35" />
  
  <!-- Bubbles inside liquid -->
  <circle cx="56" cy="72" r="2.5" fill="#22d3ee" />
  <circle cx="68" cy="74" r="1.5" fill="#22d3ee" />
  <circle cx="63" cy="67" r="2" fill="#22d3ee" />
  
  <!-- Sparkles -->
  <polygon points="88,36 89.5,40 94,40 90,43 91.5,47 88,44 84.5,47 86,43 82,40 86.5,40" fill="#22d3ee" />
</svg>
`;

const ASSETS = [
  { name: 'icon-usa-verified', svg: usaBadgeSvg },
  { name: 'icon-503a-purity', svg: verifiedBadgeSvg },
  { name: 'icon-spray-catalog', svg: sprayBadgeSvg },
  { name: 'icon-discount-20', svg: discountBadgeSvg },
  { name: 'icon-fast-shipping', svg: shippingBadgeSvg },
  { name: 'icon-lab-quality', svg: molecularBadgeSvg },
];

async function main() {
  console.log(`Uploading assets to R2 bucket: ${BUCKET} (public URL: ${PUBLIC_URL})`);

  for (const asset of ASSETS) {
    const svgKey = `email-assets/${asset.name}.svg`;
    const pngKey = `email-assets/${asset.name}.png`;

    // 1. Upload SVG
    console.log(`Uploading ${svgKey}...`);
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: svgKey,
      Body: Buffer.from(asset.svg.trim(), 'utf-8'),
      ContentType: 'image/svg+xml',
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    // 2. Render to PNG with sharp (high DPI 128x128)
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
  }

  // Verify contents
  const listRes = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: 'email-assets/'
  }));

  console.log('\nAll assets currently in email-assets/:');
  listRes.Contents?.forEach(c => {
    console.log(` - ${PUBLIC_URL}/${c.Key}`);
  });
}

main().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
