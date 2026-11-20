/**
 * Fast client-side screenshot compressor
 * Downscales images to max dimension of 1280px and converts to optimized JPEG
 * Reduces 5-10MB screenshot uploads to ~100-250KB for instant transmission.
 */
export async function optimizeScreenshot(
  fileOrBase64: File | string,
  maxDimension = 1280,
  quality = 0.82
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();

    const processImage = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback if canvas context fails
        if (typeof fileOrBase64 === 'string') {
          resolve({ base64: fileOrBase64, mimeType: 'image/png' });
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ base64: e.target?.result as string, mimeType: fileOrBase64.type });
          reader.readAsDataURL(fileOrBase64);
        }
        return;
      }

      // Draw with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG for best size/speed balance
      const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve({
        base64: optimizedBase64,
        mimeType: 'image/jpeg',
      });
    };

    img.onload = processImage;
    img.onerror = () => {
      // Fallback on error
      if (typeof fileOrBase64 === 'string') {
        resolve({ base64: fileOrBase64, mimeType: 'image/png' });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ base64: e.target?.result as string, mimeType: fileOrBase64.type });
        reader.readAsDataURL(fileOrBase64);
      }
    };

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
