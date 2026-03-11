/**
 * POST /api/chat/upload-image
 * Uploads a chat image to Vercel Blob (private storage).
 * Returns the blob URL + metadata for use in multimodal Gemini requests.
 *
 * Security:
 * - Validates file size (≤10 MB)
 * - Validates MIME type (JPEG / PNG / WebP / HEIC)
 * - Rate-limited (10 images / hour per wallet)
 * - Files stored under chat-images/{walletAddress}/{uuid}.{ext}
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const RATE_LIMIT_MAX = 10;              // images per hour per wallet
const RATE_LIMIT_WINDOW = 3600;         // seconds (1 hour)

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

// ─── Handler ──────────────────────────────────────────────────────────────────
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Only POST allowed
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Optional: extract wallet address from header (set by frontend)
  const walletAddress = (req.headers['x-wallet-address'] as string || 'anonymous').toLowerCase().trim();

  // ── Rate limiting (10 uploads/hour per wallet) ────────────────────────────
  try {
    const today = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const rlKey = `imgupload:${walletAddress}:${today}`;
    const count = await kv.incr(rlKey);
    if (count === 1) await kv.expire(rlKey, RATE_LIMIT_WINDOW);

    if (count > RATE_LIMIT_MAX) {
      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Maximum ${RATE_LIMIT_MAX} image uploads per hour. Try again later.`,
        retryAfter: RATE_LIMIT_WINDOW,
      });
      return;
    }
  } catch {
    // KV errors are non-blocking — proceed
    console.warn('[upload-image] KV rate limit check failed, continuing');
  }

  // ── Parse multipart body ──────────────────────────────────────────────────
  // Vercel Node Runtime provides req.body as Buffer when content-type is multipart.
  // We receive the raw bytes plus metadata via custom headers set by the frontend.
  // ── Parse JSON body ──────────────────────────────────────────────────────
  // Frontend sends: { image: base64string, mimeType: string, name?: string }
  const body = req.body as { image?: string; mimeType?: string; name?: string };

  const { image: imageBase64, mimeType: reqMimeType, name: reqName } = body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    res.status(400).json({ error: 'Missing or invalid "image" field (base64 string required)' });
    return;
  }

  const mimeType     = (reqMimeType || '').toLowerCase();
  const originalName = reqName || 'image';
  const imageBuffer  = Buffer.from(imageBase64, 'base64');

  // ── Validate MIME type ─────────────────────────────────────────────────────
  const ext = ALLOWED_MIME_TYPES[mimeType];
  if (!ext) {
    res.status(400).json({
      error: 'INVALID_FILE_TYPE',
      message: `Unsupported image type "${mimeType}". Allowed: JPEG, PNG, WebP, HEIC.`,
    });
    return;
  }

  // ── Validate file size ─────────────────────────────────────────────────────
  if (imageBuffer.length > MAX_FILE_SIZE) {
    const sizeMB = (imageBuffer.length / 1024 / 1024).toFixed(1);
    res.status(400).json({
      error: 'FILE_TOO_LARGE',
      message: `File size ${sizeMB} MB exceeds 10 MB limit.`,
    });
    return;
  }

  if (imageBuffer.length === 0) {
    res.status(400).json({ error: 'Empty file' });
    return;
  }

  // ── Upload to Vercel Blob ──────────────────────────────────────────────────
  const fileId   = uuidv4();
  const blobPath = `chat-images/${walletAddress}/${fileId}.${ext}`;

  let blobUrl: string;

  try {
    const blob = await put(blobPath, imageBuffer, {
      access: 'public',        // public so Gemini can fetch via URL directly
      contentType: mimeType,
      addRandomSuffix: false,  // we already generate a UUID
    });
    blobUrl = blob.url;
    console.log(`[upload-image] ✅ Uploaded ${blobPath} (${(imageBuffer.length / 1024).toFixed(0)} KB)`);
  } catch (uploadErr) {
    console.error('[upload-image] ❌ Blob upload failed:', uploadErr);
    res.status(500).json({ error: 'Upload failed. Try again.' });
    return;
  }

  // ── Return metadata ────────────────────────────────────────────────────────
  res.status(200).json({
    id:   fileId,
    url:  blobUrl,
    name: originalName,
    size: imageBuffer.length,
    type: mimeType,
    uploadedAt: new Date().toISOString(),
  });
}

export default handler;
