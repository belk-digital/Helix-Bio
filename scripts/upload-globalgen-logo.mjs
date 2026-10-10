import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
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

async function main() {
  const fileBuffer = fs.readFileSync('public/images/GLOBALGEN_logo.png');
  const targetKey = 'email-assets/globalgen-logo.png';

  console.log(`Uploading public/images/GLOBALGEN_logo.png to ${targetKey}...`);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: targetKey,
    Body: fileBuffer,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  // Also upload as GLOBALGEN_logo.png just in case
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'email-assets/GLOBALGEN_logo.png',
    Body: fileBuffer,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  console.log('Successfully uploaded GlobalGen logo to R2!');
}

main().catch(err => {
  console.error('Failed to upload:', err);
  process.exit(1);
});
