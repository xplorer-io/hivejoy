/**
 * Centralised image URLs for the app.
 * Use Cloudinary (or other CDN) URLs via env to keep assets out of the bundle.
 * Set NEXT_PUBLIC_DEFAULT_COVER_IMAGE_URL and optionally NEXT_PUBLIC_FOUNDER_IMAGE_URL in .env.local.
 */

const DEFAULT_COVER_PLACEHOLDER =
  'https://res.cloudinary.com/demo/image/upload/sample.jpg';

export function getDefaultCoverImageUrl(): string {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_COVER_IMAGE_URL || DEFAULT_COVER_PLACEHOLDER
  );
}

export function getFounderImageUrl(): string {
  return process.env.NEXT_PUBLIC_FOUNDER_IMAGE_URL || DEFAULT_COVER_PLACEHOLDER;
}
