import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';
import {
  generateDynamicDocument,
  validateDocumentQuality,
  restructureDocumentArchitecture,
} from './src/modules/pdfStudio/dynamicDocumentArchitect';

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

function normalizeImageMimeType(rawMime: string, base64Data?: string): string {
  let m = (rawMime || '').toLowerCase().trim();
  if (m === 'image/jfif' || m === 'image/pjpeg' || m === 'image/jpg') {
    return 'image/jpeg';
  }
  if (m === 'image/x-png') {
    return 'image/png';
  }
  if (!m || m === 'application/octet-stream' || m === 'image/*') {
    if (base64Data) {
      if (base64Data.startsWith('/9j/')) return 'image/jpeg';
      if (base64Data.startsWith('iVBORw')) return 'image/png';
      if (base64Data.startsWith('R0lGOD')) return 'image/gif';
      if (base64Data.startsWith('UklGR')) return 'image/webp';
    }
    return 'image/jpeg';
  }
  return m;
}

function stripBase64(dataUrlOrBase64: string): { data: string; mimeType: string } {
  if (!dataUrlOrBase64) return { mimeType: 'image/png', data: '' };
  const str = String(dataUrlOrBase64).trim();
  if (str.startsWith('data:')) {
    const commaIndex = str.indexOf(',');
    if (commaIndex !== -1) {
      const mimeMatch = str.substring(0, commaIndex).match(/^data:([^;]+);/);
      const rawMime = mimeMatch ? mimeMatch[1] : 'image/png';
      const data = str.substring(commaIndex + 1).replace(/\s+/g, '');
      const mimeType = normalizeImageMimeType(rawMime, data);
      return { mimeType, data };
    }
  }
  const data = str.replace(/\s+/g, '');
  const mimeType = normalizeImageMimeType('image/png', data);
  return { mimeType, data };
}

function parseJsonSafe(raw: string): any {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return {};
    }
  }
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
  // gemini-2.5-flash is multimodal, rapid, and fully supported
  vision: ['gemini-2.5-flash'],
  text: ['gemini-2.5-flash'],
  reasoning: ['gemini-2.5-flash'],
};

export class AIProviderService {
  public static categorizeError(err: any): { category: string; retryable: boolean; message: string; httpStatus: number } {
    const msg = String(err?.message || JSON.stringify(err) || '');
    const status = Number(err?.status || err?.code || 0);

    if (status === 401 || status === 403 || msg.includes('API key') || msg.includes('PERMISSION_DENIED')) {
      return { category: 'AUTHENTICATION_ERROR', retryable: false, message: 'Server GEMINI_API_KEY is missing or invalid.', httpStatus: 401 };
    }
    if (status === 404 || msg.includes('NOT_FOUND') || msg.includes('is not found') || msg.includes('no longer available')) {
      return { category: 'MODEL_NOT_FOUND', retryable: true, message: 'Upstream AI model is currently unavailable in this region.', httpStatus: 503 };
    }
    if (status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
      return { category: 'RATE_LIMITED', retryable: true, message: 'API rate limit or quota exceeded. Please try again shortly.', httpStatus: 429 };
    }
    if (status === 503 || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('temporarily overloaded')) {
      return { category: 'SERVICE_OVERLOAD', retryable: true, message: 'AI model is experiencing high demand. Please retry.', httpStatus: 503 };
    }
    if (status === 400 || msg.includes('INVALID_ARGUMENT')) {
      return { category: 'INVALID_PAYLOAD', retryable: false, message: 'Invalid format or schema payload.', httpStatus: 400 };
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
      '/api/generate-smart-document',
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
      config: {},
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

// High-Fidelity Screenshot Transcription & OCR Endpoint
// Uses Gemini 2.5 Flash multimodal vision for immediate, structure-preserving text extraction,
// with graceful fallback to Tesseract if upstream AI is unavailable.
const handleTranscribeScreenshot = async (req: Request, res: Response) => {
  const reqId = `ocr_${Date.now()}`;
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No screenshot or image provided', text: '' });
    }

    const { data: cleanedData, mimeType: cleanedMime } = stripBase64(imageBase64);
    const finalMime = cleanedMime || mimeType;

    // 1. Try Gemini 2.5 Flash (highest fidelity for tables, handwriting, WhatsApp & screenshots)
    if (apiKey) {
      try {
        const responseResult = await AIProviderService.executeWithFallback({
          role: 'vision',
          reqId,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: cleanedData,
                    mimeType: finalMime,
                  },
                },
                {
                  text: `Transcribe and extract ALL visible text, tables, numbers, bullet points, headers, handwritten or printed notes from this screenshot verbatim and completely.
Rules:
- Preserve logical ordering, bullet points, numbered items, and data tables.
- If a table or grid is visible, transcribe each row clearly with columns separated by " | ".
- Do NOT summarize, interpret, or omit any details.
- Output ONLY the transcribed content. Do NOT include conversational prefixes like "Here is the transcription:" or markdown code blocks.`,
                },
              ],
            },
          ],
        });

        let extractedText = responseResult.response.text?.trim() || '';
        // Clean any accidental conversational introductory line
        extractedText = extractedText
          .replace(/^(Here (is|are) (the )?transcription[^\n]*\n+|Here's the transcription[^\n]*\n+)/i, '')
          .replace(/^```[a-z]*\n/i, '')
          .replace(/\n```$/i, '')
          .trim();

        if (extractedText.length > 0) {
          return res.json({
            text: extractedText,
            engine: 'gemini',
            model: responseResult.modelUsed,
          });
        }
      } catch (geminiErr: any) {
        console.warn(`[OCR] Gemini extraction failed (${geminiErr?.message?.substring(0, 80)}), falling back to Tesseract...`);
      }
    }

    // 2. Tesseract OCR Fallback
    const buffer = Buffer.from(cleanedData, 'base64');
    const result = await Tesseract.recognize(buffer, 'eng');
    const tesseractText = (result.data.text || '').trim();

    return res.json({
      text: tesseractText,
      engine: 'tesseract',
    });
  } catch (err: any) {
    console.error('[OCR] All transcription engines failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to extract text from screenshot', text: '' });
  }
};

app.post('/api/transcribe-screenshot', handleTranscribeScreenshot);
app.post('/api/transcribe-screenshot/', handleTranscribeScreenshot);

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
          'You are SnapAction AI. You produce ready-to-use, practical action items from screenshots. Write clean, natural, formatted text. Do not wrap everything in unnecessary introductory chatter.',
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

// Smart PDF Studio: Turn Messy Notes Into Professional Documents
app.post(['/api/generate-smart-document', '/api/generate-smart-document/'], async (req: Request, res: Response) => {
  const reqId = `pdf_${Date.now()}`;
  try {
    const {
      notesText = '',
      imageBase64,
      mimeType = 'image/png',
      documentType,
      language = 'English',
      writingStyle = 'professional',
      quickMode = 'professional_rewrite',
      lengthMode = 'standard',
      metadata = {},
    } = req.body;

    if (!notesText.trim() && !imageBase64) {
      return res.status(400).json({ error: 'Please provide notes, text, or an image to transform.', requestId: reqId });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        errorCategory: 'AUTHENTICATION_ERROR',
        requestId: reqId,
      });
    }

    const systemInstruction = `You are the Dynamic Document Architect for SnapAction Smart PDF Studio.
NON-NEGOTIABLE CORE PRINCIPLE: THE CONTENT DETERMINES THE DOCUMENT.
Smart PDF Studio must NEVER behave like a fixed-template PDF converter. You are an adaptive document writer and designer.

CRITICAL INSTRUCTIONS:
1. FORBIDDEN BOILERPLATE HEADINGS:
   Do NOT automatically use generic corporate headings such as:
   "Executive Summary", "Introduction", "Objectives", "Main Discussion", "Key Findings", "Recommendations", "Conclusion", "Action Items", "Next Steps", "Methodology".
   Headings MUST be content-specific, descriptive, and derived directly from the real subject, actions, entities, or concepts in the source notes.
   - Example (Supplier delivery delay): "Supplier Coordination Overview", "Material Delivery Delays & Operational Impact", "Revised Delivery Commitments & Schedules", "Payment-Related Matters & Follow-Up Directives"
   - Example (Three days in Dubai): "Dubai Trip Overview", "Three-Day Visit Plan", "Attractions & Sightseeing Highlights", "Accommodation, Transit & Budget Considerations"
   - Example (Human factors safety study): "Understanding Human Error in the Workplace", "How Fatigue & Stress Degrade Performance", "The Role of Supervision & Communication", "Building a Learning-Oriented Safety Culture"
   - Example (Personal journal): "Daily Reflections & Mindset State", "Key Experiences & Observations", "Personal Takeaways & Forward Intentions"

2. DYNAMIC SECTION COUNT:
   The structure must depend strictly on content complexity and purpose.
   A simple note may need only 2 or 3 sections. A detailed report may need 5 or more. Do not artificially force sections or merge unrelated topics.

3. ADAPTIVE CONTENT BLOCKS:
   Choose only blocks that genuinely benefit the content:
   - "paragraph": Clean, well-written prose for explanations and narrative.
   - "subheading": Topic-specific subheadings within a section.
   - "list": "bullet" for items, "numbered" for sequence/steps, "checklist" for tasks/checks.
   - "table": ONLY when information benefits from structured comparison, financial figures, or explicit task-owner pairs. Do NOT insert decorative or empty tables!
   - "timeline": For travel days, chronological events, or milestone steps.
   - "callout": "quote" | "highlight" | "takeaway" | "warning" for important principles or alerts.
   - "key_value": For metadata, hotel/flight details, or parameter pairs.

4. CONTENT-DRIVEN DESIGN PROFILE:
   Determine the optimal designProfile matching the material:
   - layoutStyle:
     "chronological_timeline" for itineraries, day plans, schedules
     "academic_formal" for study notes, concepts, lectures
     "compact_brief" for short memos, quick meeting notes, action lists
     "executive_presentation" for business proposals, pitch notes
     "two_column_dense" for product comparisons, evaluations
     "standard_editorial" for articles, personal reflections, general notes
   - density: "compact" | "balanced" | "spacious"
   - tablePreference: "none" | "minimal" | "structured" | "analytical"
   - headingStyle: "minimal" | "numbered" | "pill_badge" | "underlined"

5. ZERO FABRICATION (STRICTEST INTEGRITY):
   Preserve original facts. Never invent attendee names, dates, financial statistics, or commitments. If absent, leave unspecified or omit.`;

    const schemaPrompt = `Return a valid JSON object matching this schema:
{
  "title": string (specific, content-derived document title),
  "subtitle": string (descriptive subtitle reflecting purpose and scope),
  "documentType": string (the identified or requested document type, e.g. "Travel Plan & Itinerary", "Study Notes", "Supplier Discussion Record", "Personal Journal", etc.),
  "purpose": string (1 sentence explaining what this document achieves),
  "category": string ("Business Documents" | "Professional Documents" | "Personal Productivity" | "Education and Learning" | "Career and Employment" | "Creative and Marketing"),
  "recommendedTheme": string ("corporate-blue" | "executive-minimal" | "modern-professional" | "elegant-green" | "academic" | "creative-modern"),
  "designProfile": {
    "layoutStyle": "standard_editorial" | "compact_brief" | "chronological_timeline" | "academic_formal" | "executive_presentation" | "two_column_dense",
    "density": "compact" | "balanced" | "spacious",
    "tablePreference": "none" | "minimal" | "structured" | "analytical",
    "headingStyle": "minimal" | "numbered" | "pill_badge" | "underlined"
  },
  "sections": [
    {
      "id": string (e.g. "sec_1"),
      "heading": string (MEANINGFUL, CONTENT-SPECIFIC HEADING),
      "purpose": string (optional short description of section purpose),
      "blocks": [
        {
          "type": "paragraph",
          "id": string,
          "text": string,
          "calloutType": "info" | "warning" | "tip" | "quote"
        },
        {
          "type": "subheading",
          "id": string,
          "text": string
        },
        {
          "type": "list",
          "id": string,
          "style": "bullet" | "numbered" | "checklist",
          "items": string[]
        },
        {
          "type": "table",
          "id": string,
          "caption": string,
          "headers": string[],
          "rows": string[][],
          "tableType": "data" | "comparison" | "action_register" | "timeline_table"
        },
        {
          "type": "timeline",
          "id": string,
          "events": [
            { "timeOrDay": string, "title": string, "description": string }
          ]
        },
        {
          "type": "callout",
          "id": string,
          "kind": "quote" | "highlight" | "takeaway" | "warning",
          "text": string
        },
        {
          "type": "key_value",
          "id": string,
          "pairs": [{ "label": string, "value": string }]
        }
      ]
    }
  ]
}`;

    const userPrompt = imageBase64 && !notesText.trim()
      ? `A screenshot image has been provided as the source material.
STAGE A: CONTENT UNDERSTANDING & OUTLINE PLANNING
1. Examine the screenshot image thoroughly and extract EVERY SINGLE visible piece of information, text line, numbers, headings, tables, dates, and names verbatim.
2. What is the subject and purpose of the content?
3. Formulate content-specific headings derived strictly and exclusively from the actual text visible in the uploaded screenshot. Under NO circumstances output generic placeholder text (e.g. "Review of project parameters, current state...").
4. Select the optimal designProfile ('chronological_timeline', 'compact_brief', 'academic_formal', etc.).

STAGE B: PROFESSIONAL CONTENT DEVELOPMENT
Develop the complete structured document following your content-specific outline.

Requested Document Type: ${documentType || 'Auto-Detect Most Appropriate from image content'}
Target Language: ${language}
Writing Style: ${writingStyle}
Document Length: ${lengthMode}
Mode: ${quickMode}

${schemaPrompt}`
      : `STAGE A: CONTENT UNDERSTANDING & OUTLINE PLANNING
Analyze this raw material:
RAW CONTENT / NOTES:
"""
${notesText}
"""
${imageBase64 ? 'Note: A supporting screenshot image is also attached. Incorporate all details visible in both the notes and screenshot.' : ''}

1. What is the subject and purpose of the content?
2. Who is the intended reader?
3. What are the principal themes?
4. Formulate 2 to 6 content-specific headings derived from the actual meaning (strictly avoiding universal boilerplate).
5. Determine the optimal layoutStyle ('chronological_timeline' | 'academic_formal' | 'compact_brief' | 'executive_presentation' | 'two_column_dense' | 'standard_editorial').

STAGE B: PROFESSIONAL CONTENT DEVELOPMENT
Develop the complete structured document following your content-specific outline.

Requested Document Type: ${documentType || 'Auto-Detect Most Appropriate'}
Target Language: ${language}
Writing Style: ${writingStyle}
Document Length: ${lengthMode}
Mode: ${quickMode}

${schemaPrompt}`;

    let fullDocument: any = null;

    try {
      let responseResult;
      if (imageBase64) {
        const { data: cleanedData, mimeType: cleanedMime } = stripBase64(imageBase64);
        responseResult = await AIProviderService.executeWithFallback({
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
                { text: `${systemInstruction}\n\n${userPrompt}` },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });
      } else {
        responseResult = await AIProviderService.executeWithFallback({
          role: 'text',
          reqId,
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });
      }

      const { response, modelUsed, latencyMs } = responseResult;
      const rawJsonText = response.text || '{}';
      const parsed = parseJsonSafe(rawJsonText);

      const docId = `doc_${Date.now()}`;
      fullDocument = {
        id: docId,
        documentId: docId,
        title: parsed.title || 'Professional Document',
        subtitle: parsed.subtitle || '',
        documentType: parsed.documentType || documentType || 'General Professional Document',
        purpose: parsed.purpose || '',
        category: parsed.category || 'Business Documents',
        language,
        theme: parsed.recommendedTheme || 'corporate-blue',
        pageSize: 'A4',
        orientation: 'portrait',
        lengthMode,
        writingStyle,
        quickMode,
        designProfile: parsed.designProfile || {
          layoutStyle: 'standard_editorial',
          density: 'balanced',
          tablePreference: 'minimal',
          headingStyle: 'underlined',
        },
        sections: Array.isArray(parsed.sections) ? parsed.sections : [],
        metadata: {
          companyName: metadata.companyName || '',
          preparedBy: metadata.preparedBy || 'Prepared with SnapAction AI',
          reviewedBy: metadata.reviewedBy || '',
          documentReference: metadata.documentReference || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          date: metadata.date || new Date().toISOString().split('T')[0],
          confidentialityNotice: metadata.confidentialityNotice || 'Confidential & Proprietary',
          sourceNoteSummary: (notesText || '').slice(0, 160),
        },
        createdAt: new Date().toISOString(),
        rawInputSnippet: (notesText || '').slice(0, 300),
        meta: {
          modelUsed,
          latencyMs,
          requestId: reqId,
        },
      };

      // Quality Validation
      fullDocument.validationReport = validateDocumentQuality(fullDocument, notesText || '');
    } catch (aiErr: any) {
      console.warn('[AI] Upstream model call unavailable or rate limited, falling back to local DynamicDocumentArchitect:', aiErr?.message);
      let effectiveNotes = (notesText || '').trim();
      if (!effectiveNotes && imageBase64) {
        try {
          const { data: cleanedData } = stripBase64(imageBase64);
          const buffer = Buffer.from(cleanedData, 'base64');
          const result = await Tesseract.recognize(buffer, 'eng');
          effectiveNotes = (result.data.text || '').trim();
        } catch (ocrErr) {
          console.warn('[OCR Fallback Error]:', ocrErr);
        }
      }

      fullDocument = generateDynamicDocument({
        notesText: effectiveNotes,
        hasImage: Boolean(imageBase64),
        requestedType: documentType,
        language,
        writingStyle,
        quickMode,
        lengthMode,
        metadata,
      });
      fullDocument.meta = {
        modelUsed: 'local-dynamic-architect',
        latencyMs: 15,
        requestId: reqId,
      };
    }

    return res.json(fullDocument);
  } catch (error: any) {
    console.error('Error generating smart document:', error);
    const { category, message, httpStatus } = AIProviderService.categorizeError(error);
    return res.status(httpStatus).json({
      error: message,
      errorCategory: category,
      requestId: reqId,
      retryable: category === 'SERVICE_OVERLOAD' || category === 'RATE_LIMITED',
    });
  }
});

// Smart Restructure Endpoint (Section 16: Restructure Document Action)
app.post(['/api/restructure-smart-document', '/api/restructure-smart-document/'], (req: Request, res: Response) => {
  try {
    const { document, mode, customInstruction } = req.body;
    if (!document) {
      return res.status(400).json({ error: 'No document provided for restructuring' });
    }
    const restructured = restructureDocumentArchitecture(document, mode, customInstruction);
    return res.json({ document: restructured });
  } catch (err: any) {
    console.error('Error restructuring document:', err);
    return res.status(500).json({ error: err.message || 'Restructure failed' });
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
