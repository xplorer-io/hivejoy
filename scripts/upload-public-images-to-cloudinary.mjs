import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { v2 as cloudinary } from 'cloudinary';

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!key) continue;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function slugifyFilename(filename) {
  const base = filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base.length ? base : 'image';
}

async function main() {
  const repoRoot = path.resolve(process.cwd());
  loadEnvFile(path.join(repoRoot, '.env.local'));

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing Cloudinary credentials. Ensure CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), CLOUDINARY_API_KEY (or NEXT_PUBLIC_CLOUDINARY_API_KEY), and CLOUDINARY_API_SECRET are set in .env.local.'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const imagesDir = path.join(repoRoot, 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    console.log(`No public/images directory found at ${imagesDir}`);
    return;
  }

  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log('No images found in public/images. Nothing to upload.');
    return;
  }

  const outDir = path.join(repoRoot, 'scripts', '_generated');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'cloudinary-public-images-map.json');

  const results = [];

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const publicIdBase = slugifyFilename(file);
    const publicId = `hivejoy/public_images/${publicIdBase}`;

    console.log(`Uploading: ${file} → ${publicId}`);
    const uploaded = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
    });

    results.push({
      file,
      public_id: uploaded.public_id,
      secure_url: uploaded.secure_url,
      bytes: uploaded.bytes,
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
    });
  }

  fs.writeFileSync(
    outPath,
    JSON.stringify({ uploadedAt: new Date().toISOString(), results }, null, 2)
  );
  console.log(`\nDone. Wrote mapping to: ${outPath}`);
  console.log(
    'Next: confirm any env vars (e.g. NEXT_PUBLIC_DEFAULT_COVER_IMAGE_URL, NEXT_PUBLIC_FOUNDER_IMAGE_URL) point at the Cloudinary URLs you want, then delete public/images/.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

