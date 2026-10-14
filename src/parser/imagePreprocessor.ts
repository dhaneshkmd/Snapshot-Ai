/**
 * Screenshot Image Preprocessing Engine
 * Prepares screenshots for maximum OCR accuracy and extracts optimal layout bounds.
 * Runs 100% locally in the browser/node without AI vision calls.
 */

export interface PreprocessedImageResult {
  originalDataUrl: string;
  ocrDataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export async function preprocessScreenshot(
  imageSource: string | File | Blob,
  maxDimension = 1600
): Promise<PreprocessedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const handleLoad = () => {
      let { naturalWidth: width, naturalHeight: height } = img;
      if (!width || !height) {
        width = img.width || 800;
        height = img.height || 600;
      }

      // 1. Calculate aspect ratio and scaling for optimal OCR text clarity
      let targetWidth = width;
      let targetHeight = height;

      if (targetWidth > maxDimension || targetHeight > maxDimension) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
          targetWidth = maxDimension;
        } else {
          targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
          targetHeight = maxDimension;
        }
      }

      // Normal display canvas
      const displayCanvas = document.createElement('canvas');
      displayCanvas.width = targetWidth;
      displayCanvas.height = targetHeight;
      const displayCtx = displayCanvas.getContext('2d');

      if (!displayCtx) {
        return resolve({
          originalDataUrl: typeof imageSource === 'string' ? imageSource : '',
          ocrDataUrl: typeof imageSource === 'string' ? imageSource : '',
          width,
          height,
          aspectRatio: width / height,
        });
      }

      displayCtx.imageSmoothingEnabled = true;
      displayCtx.imageSmoothingQuality = 'high';
      displayCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const originalDataUrl = displayCanvas.toDataURL('image/jpeg', 0.88);

      // 2. High-contrast OCR enhancement canvas
      // Increases text contrast against varied backgrounds, sharpens characters
      const ocrCanvas = document.createElement('canvas');
      ocrCanvas.width = targetWidth;
      ocrCanvas.height = targetHeight;
      const ocrCtx = ocrCanvas.getContext('2d');

      if (ocrCtx) {
        ocrCtx.drawImage(displayCanvas, 0, 0);
        try {
          const imgData = ocrCtx.getImageData(0, 0, targetWidth, targetHeight);
          const data = imgData.data;

          // Adaptive grayscale and contrast stretch
          for (let i = 0; i < data.length; i += 4) {
            // Luminance formula
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Mild contrast enhancement curve
            const enhanced = gray > 180 ? 255 : gray < 70 ? 0 : gray;
            data[i] = enhanced;
            data[i + 1] = enhanced;
            data[i + 2] = enhanced;
          }
          ocrCtx.putImageData(imgData, 0, 0);
        } catch {
          // If cross-origin or canvas security prevents pixel manipulation, keep displayCtx
        }
      }

      const ocrDataUrl = ocrCanvas ? ocrCanvas.toDataURL('image/png') : originalDataUrl;

      resolve({
        originalDataUrl,
        ocrDataUrl,
        width: targetWidth,
        height: targetHeight,
        aspectRatio: targetWidth / targetHeight,
      });
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load image for preprocessing: ' + e));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    }
  });
}
