import sharp from "sharp";

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 82;

/**
 * Downloads an image from `url` server-side and returns it as a resized,
 * JPEG-encoded base64 data URL.
 *
 * Used to send profile photos to Mistral's vision model as a self-contained
 * request payload instead of a Supabase signed URL that Mistral would have
 * to fetch itself — see analyze-profile.ts for why: sending the raw signed
 * URL as `image_url` produced "not a real photo" from the model on every
 * single photo in prod, while this exact base64-data-URL approach already
 * works for the conversation coach's screenshot extraction.
 *
 * Resized to at most MAX_DIMENSION on the long edge — plenty of detail for
 * the model to judge photo quality/composition, and keeps a 5-6 photo
 * request well under any reasonable payload limit.
 */
export async function fetchPhotoAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download photo (${response.status}): ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const resized = await sharp(buffer)
    .rotate() // apply EXIF orientation before resizing so it isn't lost
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}
