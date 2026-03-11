/**
 * Client-side image compression utility.
 * Resizes images to ≤1024 px on the longest side and re-encodes as WebP at 75 % quality.
 * Typical result: 50–70 % smaller file — no visible quality loss for chat thumbnails.
 */

export interface CompressedImage {
  blob:     Blob;
  dataUrl:  string;  // base64 data URL for preview
  width:    number;
  height:   number;
  sizeBefore: number;
  sizeAfter:  number;
}

/**
 * Client-side pending image — local preview before the user hits Send.
 * No backend upload happens until the message is submitted.
 */
export interface PendingImage {
  id:      string;   // browser-generated temp UUID
  blob:    Blob;     // compressed WebP blob (for upload on send)
  dataUrl: string;   // local data URL for instant preview
  name:    string;   // original filename
  size:    number;   // compressed size in bytes
  width:   number;
  height:  number;
}

const MAX_SIDE_PX = 1024;  // longest dimension after resize
const QUALITY     = 0.75;  // WebP quality (0–1)

/**
 * Compresses a File or Blob containing an image.
 * Falls back to the original file if the browser does not support Canvas / WebP.
 */
export async function compressImage(file: File | Blob): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img     = new Image();

      img.onerror = () => reject(new Error('Failed to decode image'));

      img.onload = () => {
        // ── Determine target dimensions ──────────────────────────────────────
        let { width, height } = img;

        if (width > MAX_SIDE_PX || height > MAX_SIDE_PX) {
          if (width >= height) {
            height = Math.round((height / width) * MAX_SIDE_PX);
            width  = MAX_SIDE_PX;
          } else {
            width  = Math.round((width / height) * MAX_SIDE_PX);
            height = MAX_SIDE_PX;
          }
        }

        // ── Draw onto canvas ────────────────────────────────────────────────
        const canvas    = document.createElement('canvas');
        canvas.width    = width;
        canvas.height   = height;
        const ctx       = canvas.getContext('2d');

        if (!ctx) {
          // Graceful fallback: use original file
          resolve({
            blob:       file,
            dataUrl,
            width:      img.width,
            height:     img.height,
            sizeBefore: file.size,
            sizeAfter:  file.size,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // ── Encode as WebP ──────────────────────────────────────────────────
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to original
              resolve({
                blob:       file,
                dataUrl,
                width:      img.width,
                height:     img.height,
                sizeBefore: file.size,
                sizeAfter:  file.size,
              });
              return;
            }

            // Build preview dataUrl from compressed blob
            const compressedReader = new FileReader();
            compressedReader.onload = (ev) => {
              resolve({
                blob,
                dataUrl:    ev.target?.result as string,
                width,
                height,
                sizeBefore: file.size,
                sizeAfter:  blob.size,
              });
            };
            compressedReader.onerror = () => {
              // Return blob without dataUrl
              resolve({
                blob,
                dataUrl,
                width,
                height,
                sizeBefore: file.size,
                sizeAfter:  blob.size,
              });
            };
            compressedReader.readAsDataURL(blob);
          },
          'image/webp',
          QUALITY,
        );
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/** Human-readable file size (e.g. "1.4 MB") */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
