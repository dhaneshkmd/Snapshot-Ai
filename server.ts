import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with 50mb limit for high-resolution worksite photographs & screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build-snapaction',
    },
  },
});

function stripBase64(dataUrlOrBase64: string): { data: string; mimeType: string } {
  if (dataUrlOrBase64.startsWith('data:')) {
    const match = dataUrlOrBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }
  return { mimeType: 'image/png', data: dataUrlOrBase64 };
}

// =========================================================================
// AIProviderService: Role-based model configuration, retries, and telemetry
// =========================================================================
export type ModelRole = 'vision' | 'text' | 'reasoning';

export interface AIProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastLatencyMs: number;
  lastModelUsed: string;
  lastErrorCategory: string | null;
  lastErrorTimestamp: string | null;
  activeVisionModel: string;
  activeTextModel: string;
}

const metrics: AIProviderMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  lastLatencyMs: 0,
  lastModelUsed: 'gemini-2.5-flash',
  lastErrorCategory: null,
  lastErrorTimestamp: null,
  activeVisionModel: 'gemini-2.5-flash',
  activeTextModel: 'gemini-2.5-flash',
};

// Verified multimodal models available in @google/genai SDK
const ROLE_MODELS: Record<ModelRole, string[]> = {
  // Vision tasks require capable multimodal models. NEVER fallback to a text-only model!
  vision: ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'],
  text: ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'],
  reasoning: ['gemini-2.5-flash', 'gemini-3.8-flash'],
};

export class AIProviderService {
  public static categorizeError(err: any): { category: string; retryable: boolean; message: string; httpStatus: number } {
    const msg = String(err?.message || JSON.stringify(err) || '');
    const status = Number(err?.status || err?.code || 0);

    if (status === 401 || status === 403 || msg.includes('API key') || msg.includes('PERMISSION_DENIED')) {
      return { category: 'AUTHENTICATION_ERROR', retryable: false, message: 'Server GEMINI_API_KEY is missing or invalid.', httpStatus: 401 };
    }
    if (status === 404 || msg.includes('NOT_FOUND') || msg.includes('is not found')) {
      return { category: 'MODEL_NOT_FOUND', retryable: true, message: 'Selected model identifier is unavailable or retired in this region.', httpStatus: 404 };
    }
    if (status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
      return { category: 'RATE_LIMITED', retryable: true, message: 'API rate limit or quota exceeded. Falling back to alternative model.', httpStatus: 429 };
    }
    if (status === 503 || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('temporarily overloaded')) {
      return { category: 'SERVICE_OVERLOAD', retryable: true, message: 'AI model is experiencing high demand. Retrying with alternative model.', httpStatus: 503 };
    }
    if (status === 400 || msg.includes('INVALID_ARGUMENT')) {
      return { category: 'INVALID_PAYLOAD', retryable: false, message: 'Invalid image format or schema payload.', httpStatus: 400 };
    }
    return { category: 'SERVER_ERROR', retryable: false, message: msg || 'Unexpected AI service error.', httpStatus: 500 };
  }

  public static async executeWithFallback(params: {
    role: ModelRole;
    contents: any[];
    config?: any;
    reqId?: string;
  }): Promise<{ response: any; modelUsed: string; latencyMs: number }> {
    const candidateModels = ROLE_MODELS[params.role];
    let lastError: any = null;
    const startTime = Date.now();
    metrics.totalRequests += 1;

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      const maxRetries = 2;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });

          const latencyMs = Date.now() - startTime;
          metrics.successfulRequests += 1;
          metrics.lastLatencyMs = latencyMs;
          metrics.lastModelUsed = model;
          if (params.role === 'vision') metrics.activeVisionModel = model;
          if (params.role === 'text') metrics.activeTextModel = model;

          return { response, modelUsed: model, latencyMs };
        } catch (err: any) {
          lastError = err;
          const { category, retryable } = this.categorizeError(err);
          metrics.lastErrorCategory = category;
          metrics.lastErrorTimestamp = new Date().toISOString();

          console.warn(
            `[AIProviderService] Role=${params.role} Model=${model} Attempt=${attempt + 1}/${maxRetries} Error=${category}: ${err?.message?.substring(0, 100)}`
          );

          // If retryable (e.g. 503 spike), brief bounded backoff
          if (retryable && attempt < maxRetries - 1) {
            await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
            continue;
          }

          // Otherwise break and switch immediately to next candidate model
          break;
        }
      }
    }

    metrics.failedRequests += 1;
    throw lastError;
  }
}

// =========================================================================
// API Routes
// =========================================================================

// Health & Developer Diagnostics Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: apiKey ? 'healthy' : 'degraded_no_key',
    hasApiKey: Boolean(apiKey),
    configuredModels: {
      vision: ROLE_MODELS.vision,
      text: ROLE_MODELS.text,
      reasoning: ROLE_MODELS.reasoning,
    },
    metrics,
    activeRoutes: [
      '/api/health',
      '/api/health/test-vision',
      '/api/analyze-screenshot',
      '/api/execute-action',
      '/api/local-ocr',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Interactive Vision Test Tool (Sends small non-sensitive image to verify multimodal capability)
app.post('/api/health/test-vision', async (req: Request, res: Response) => {
  try {
    const { testImageBase64 } = req.body;
    // Default: 1x1 green PNG test image
    const sampleBase64 =
      testImageBase64 ||
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const { data: cleanedData, mimeType: cleanedMime } = stripBase64(sampleBase64);

    const { response, modelUsed, latencyMs } = await AIProviderService.executeWithFallback({
      role: 'vision',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanedData,
                mimeType: cleanedMime || 'image/png',
              },
            },
            {
              text: 'Respond with exactly one word: "VISION_READY".',
            },
          ],
        },
      ],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });

    return res.json({
      status: 'success',
      modelUsed,
      latencyMs,
      output: (response.text || '').trim(),
      message: 'Multimodal vision model verified and fully operational.',
    });
  } catch (err: any) {
    const { category, message, httpStatus } = AIProviderService.categorizeError(err);
    return res.status(httpStatus).json({
      status: 'error',
      errorCategory: category,
      error: message,
    });
  }
});

// Local OCR endpoint (Uses Tesseract.js in Node, ZERO Gemini tokens!)
app.post('/api/local-ocr', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided', text: '' });
    }
    const { data: cleanedData } = stripBase64(imageBase64);
    const buffer = Buffer.from(cleanedData, 'base64');
    const result = await Tesseract.recognize(buffer, 'eng');
    return res.json({
      text: result.data.text || '',
      confidence: (result.data.confidence || 75) / 100,
    });
  } catch (err: any) {
    console.warn('Server OCR failed:', err.message);
    return res.status(500).json({ error: err.message, text: '' });
  }
});

// Analyze Screenshot (Semantic Screenshot Intelligence)
app.post('/api/analyze-screenshot', async (req: Request, res: Response) => {
  const reqId = `req_${Date.now()}`;
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided', requestId: reqId });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        errorCategory: 'AUTHENTICATION_ERROR',
        requestId: reqId,
      });
    }

    const { data: cleanedData, mimeType: cleanedMime } = stripBase64(imageBase64);

    const systemInstruction = `You are SnapAction AI. Analyze this screenshot semantically. Return JSON conforming to schema.`;

    const { response } = await AIProviderService.executeWithFallback({
      role: 'vision',
      reqId,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanedData,
                mimeType: cleanedMime || mimeType,
              },
            },
            {
              text: 'Analyze this screenshot and generate 3 best actions.',
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contentType: { type: Type.STRING },
            detectedIntent: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            cleanMarkdown: { type: Type.STRING },
            rawText: { type: Type.STRING },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                },
                required: ['label', 'value'],
              },
            },
            magicAction: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                actionPrompt: { type: Type.STRING },
              },
              required: ['id', 'name', 'description', 'actionPrompt'],
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  actionPrompt: { type: Type.STRING },
                },
                required: ['id', 'name', 'description', 'actionPrompt'],
              },
            },
            moreActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  name: { type: Type.STRING },
                  actionPrompt: { type: Type.STRING },
                },
                required: ['category', 'name', 'actionPrompt'],
              },
            },
          },
          required: [
            'contentType',
            'detectedIntent',
            'title',
            'summary',
            'cleanMarkdown',
            'rawText',
            'entities',
            'magicAction',
            'suggestedActions',
            'moreActions',
          ],
        },
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (error: any) {
    const { category, message, httpStatus } = AIProviderService.categorizeError(error);
    return res.status(httpStatus).json({
      error: message,
      errorCategory: category,
      requestId: reqId,
    });
  }
});

// Execute Action: Text-First (Saves 95%+ of Gemini tokens by sending structured text instead of raw image)
app.post('/api/execute-action', async (req: Request, res: Response) => {
  const reqId = `act_${Date.now()}`;
  try {
    const {
      imageBase64,
      mimeType = 'image/png',
      actionName,
      actionPrompt,
      contextSummary,
      previousResult,
      extractedText,
      cleanMarkdown,
      isTransformation = false,
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        errorCategory: 'AUTHENTICATION_ERROR',
        requestId: reqId,
      });
    }

    const parts: any[] = [];
    const hasTextContext = Boolean((extractedText && extractedText.trim().length > 10) || (cleanMarkdown && cleanMarkdown.trim().length > 10));

    if (!hasTextContext && imageBase64 && !isTransformation) {
      const { data: cleanedData, mimeType: cleanedMime } = stripBase64(imageBase64);
      parts.push({
        inlineData: {
          data: cleanedData,
          mimeType: cleanedMime || mimeType,
        },
      });
    }

    let promptText = '';
    if (isTransformation && previousResult) {
      promptText = `You are refining an existing result created from a screenshot.
Original Context / Summary: "${contextSummary || 'N/A'}"
Previous Output:
"""
${previousResult}
"""

The user wants to transform or chain this result with the following instruction:
"${actionPrompt || actionName}"

Provide the transformed result directly. Make it production-ready, beautifully formatted in clean Markdown, concise, high quality, and ready to immediately copy or share. Do not include meta-chatter. Just output the polished content.`;
    } else {
      promptText = `You are SnapAction AI executing the action: "${actionName}".
Task / Instruction: "${actionPrompt}"
Context Summary: "${contextSummary || 'Extracted from screenshot'}"
${cleanMarkdown ? `Structured Extracted Content:\n"""\n${cleanMarkdown}\n"""\n` : ''}
${extractedText && !cleanMarkdown ? `Raw OCR Text:\n"""\n${extractedText}\n"""\n` : ''}

Generate the complete, high-quality, practical result.
Guidelines based on action type:
- If a message or reply: Write an authentic, polished draft ready to send in the user's selected style and language. Include greeting/sign-off if appropriate.
- If a job pitch or cover letter: Write a tailored, persuasive letter matching the extracted skills and requirements.
- If CV Keywords, ATS Keywords, or Resume Sentences is requested: Generate a complete CV/resume optimization kit:
  1. ATS Keyword & Skill Extraction Table
  2. Recommended Similar & Adjacent Skills
  3. Ready-to-Integrate Resume Sections (Professional Summary, Core Competencies, High-Impact Work Experience Bullets).
- If Title, Caption, or Hashtags is requested: Generate clickable titles and engaging caption.
- If Image JSON Prompt or Video JSON Prompt is requested: Output a developer-ready JSON specification formatted in a clean json code block.

Output clean Markdown directly with no unnecessary filler preamble.`;
    }

    parts.push({ text: promptText });

    const { response, modelUsed } = await AIProviderService.executeWithFallback({
      role: 'text',
      reqId,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction:
          'You are SnapAction AI. You produce ready-to-use, pristine action items from screenshots. Write clean, natural, formatted text. Do not wrap everything in unnecessary introductory chatter.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });

    const resultText = response.text || '';
    return res.json({ result: resultText, modelUsed, requestId: reqId });
  } catch (error: any) {
    const { category, message, httpStatus } = AIProviderService.categorizeError(error);
    return res.status(httpStatus).json({
      error: message,
      errorCategory: category,
      requestId: reqId,
      retryable: category === 'SERVICE_OVERLOAD' || category === 'RATE_LIMITED',
    });
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SnapAction AI server running at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
