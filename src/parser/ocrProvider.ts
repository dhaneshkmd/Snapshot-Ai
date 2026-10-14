/**
 * Modular OCR Provider Interface and Implementations
 * Supports local client-side Tesseract.js, native OCR, or server-side OCR.
 * Does NOT call Gemini Vision.
 */

export interface OCRResult {
  text: string;
  confidence: number;
  lines: string[];
  words?: { text: string; confidence: number }[];
}

export interface OCRProvider {
  name: string;
  extractText(image: string | Blob | HTMLCanvasElement): Promise<OCRResult>;
}

// 1. Tesseract.js Browser OCR Provider
export class TesseractOCRProvider implements OCRProvider {
  name = 'Tesseract.js Local OCR';
  private workerPromise: Promise<any> | null = null;

  private async getWorker() {
    if (!this.workerPromise) {
      this.workerPromise = (async () => {
        try {
          const Tesseract = await import('tesseract.js');
          if (Tesseract.createWorker) {
            const worker = await Tesseract.createWorker('eng', 1, {
              logger: () => {}, // suppress verbose console spam
            });
            return worker;
          }
          return null;
        } catch (err) {
          console.warn('Failed to initialize Tesseract worker:', err);
          return null;
        }
      })();
    }
    return this.workerPromise;
  }

  async extractText(image: string | Blob | HTMLCanvasElement): Promise<OCRResult> {
    try {
      const worker = await this.getWorker();
      if (worker) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OCR Timeout (8s)')), 8000)
        );

        const recognitionPromise = (async () => {
          const ret = await worker.recognize(image);
          const text = (ret.data?.text || '').trim();
          const confidence = (ret.data?.confidence || 75) / 100;
          const lines = text
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0);

          return {
            text,
            confidence,
            lines,
            words: ret.data?.words?.map((w: any) => ({
              text: w.text,
              confidence: (w.confidence || 75) / 100,
            })),
          };
        })();

        return await Promise.race([recognitionPromise, timeoutPromise]);
      }
    } catch (err) {
      console.warn('Tesseract client OCR error or timeout:', err);
    }

    // Fallback if worker timed out or failed
    return {
      text: '',
      confidence: 0,
      lines: [],
    };
  }
}

// 2. Hybrid Fast OCR Provider (Combines local with quick backend OCR fallback)
export class HybridOCRProvider implements OCRProvider {
  name = 'Hybrid Local/Server OCR';
  private tesseractProvider = new TesseractOCRProvider();

  async extractText(image: string | Blob | HTMLCanvasElement): Promise<OCRResult> {
    // 1. Attempt local browser OCR first (0 network latency, 0 server cost)
    const localResult = await this.tesseractProvider.extractText(image);
    if (localResult.text && localResult.text.length > 5) {
      return localResult;
    }

    // 2. If client OCR produced very little text (e.g. wasm unsupported), fallback to server OCR endpoint
    try {
      let base64 = '';
      if (typeof image === 'string') {
        base64 = image;
      } else if (image instanceof HTMLCanvasElement) {
        base64 = image.toDataURL('image/png');
      }

      if (base64) {
        const res = await fetch('/api/local-ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.text) {
            return {
              text: data.text,
              confidence: data.confidence || 0.85,
              lines: (data.text || '').split('\n').filter((l: string) => l.trim().length > 0),
            };
          }
        }
      }
    } catch (err) {
      console.warn('Server OCR fallback failed:', err);
    }

    return localResult;
  }
}

// Global active OCR provider instance
export let activeOCRProvider: OCRProvider = new HybridOCRProvider();

export function setOCRProvider(provider: OCRProvider) {
  activeOCRProvider = provider;
}
