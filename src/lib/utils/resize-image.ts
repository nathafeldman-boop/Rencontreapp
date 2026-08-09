const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.82;

/**
 * Resizes an image file to fit within `maxDimension` (longest side) and
 * re-encodes it as JPEG, returning a data URL. Browser-only (canvas).
 *
 * Full-resolution desktop screenshots are routinely large enough that
 * their base64 payload alone exceeds Vercel's ~4.5MB serverless request
 * body limit — that rejection happens at the platform level, before our
 * route handler ever runs, so it produces no application log and just
 * shows up client-side as a generic network failure. Downscaling before
 * upload avoids that entirely; these are screenshots of app UI (text/UI
 * elements), so a JPEG at moderate quality loses nothing that matters for
 * either transcription or counting what's on screen.
 */
export async function resizeImageToDataUrl(
  file: File,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
  quality: number = DEFAULT_QUALITY
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
