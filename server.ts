import express, { Request, Response } from 'express';
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

// Body parser with 50mb limit for screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
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

// Resilient high-speed model execution: prioritize ultra-fast gemini-3.1-flash-lite
async function generateContentWithFallback(params: any): Promise<any> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || JSON.stringify(err) || '');
      console.warn(`[SnapAction] Model ${model} response issue: ${msg.substring(0, 120)}...`);

      // If quota is exhausted, immediately switch to next model with no delay
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded') || msg.includes('429')) {
        continue;
      }

      // For 503 transient spikes, brief 400ms retry before switching
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
        try {
          await new Promise((r) => setTimeout(r, 400));
          const retryRes = await ai.models.generateContent({
            ...params,
            model,
          });
          return retryRes;
        } catch (retryErr) {
          lastError = retryErr;
          continue;
        }
      }
    }
  }

  throw lastError;
}

// Low-cost / Local OCR endpoint (Uses Tesseract.js in Node, ZERO Gemini tokens!)
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

// Fallback Analyze Screenshot (Only if client explicitly requests remote fallback)
app.post('/api/analyze-screenshot', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const { data: cleanedData, mimeType: cleanedMime } = stripBase64(imageBase64);

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const systemInstruction = `You are SnapAction AI. Analyze this screenshot semantically. Return JSON conforming to schema.`;

    const response = await generateContentWithFallback({
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
    console.error('Error analyzing screenshot:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze screenshot.',
    });
  }
});

// Execute Action: Text-First (Saves 95%+ of Gemini tokens by sending structured text instead of raw image)
app.post('/api/execute-action', async (req: Request, res: Response) => {
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
      });
    }

    const parts: any[] = [];

    // ONLY send image if no extracted text or markdown context is available
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
- If a message or reply: Write an authentic, polished draft ready to send. Include greeting/sign-off if appropriate.
- If a job pitch or cover letter: Write a tailored, persuasive letter matching the extracted skills and requirements.
- If CV Keywords, ATS Keywords, or Resume Sentences is requested: Generate a complete CV/resume optimization kit:
  1. ATS Keyword & Skill Extraction Table:
     | ATS Keyword / Skill | Category (Core / Technical / Tool / Soft) | Recommended Similar / Adjacent Skills | Ready-to-Paste CV Sentence (XYZ Formula) |
     | :--- | :--- | :--- | :--- |
  2. Recommended Similar & Adjacent Skills: Suggest 3-5 in-demand complementary tools and industry frameworks that recruiters expect alongside these keywords to make the CV stand out.
  3. Ready-to-Integrate Resume Sections:
     - Keyword-Dense Professional Summary / Headline (2-3 punchy sentences)
     - Core Competencies Keyword Matrix (categorized for ATS scanners)
     - High-Impact Work Experience Bullets (using strong action verbs like Spearheaded, Engineered, Accelerated, with quantifiable metrics)
- If a financial/stock note: Summarize key levels, changes, takeaways, and add a brief disclaimer without speculative trading advice.
- If a calendar or event: Structure the title, date/time, location, and brief agenda.
- If a table or tabular data is requested (e.g. 'Convert into Table', 'Format as Table', 'Structured Table'): Output a clean, valid Markdown table with column headers:
| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| Data | Data | Data |
- If SEO or keywords is requested: Generate:
  1. Primary Focus Keyword & Search Intent (Informational, Transactional, Navigational)
  2. Secondary & LSI Long-tail Keywords (with search intent & relevance)
  3. Optimized Meta Title (strictly under 60 characters, high CTR)
  4. Optimized Meta Description (strictly under 160 characters, with hook & CTA)
  5. Recommended URL slug and H1/H2 Heading architecture
  6. Content Keyword Density & Placement Recommendations
- If Title, Caption, or Hashtags is requested: Generate:
  1. 3 High-Converting Titles / Hooks (curious, benefit-driven, clickable)
  2. Engaging Social Media Caption (formatted with storytelling hook, bullet points, emojis, and clear Call to Action)
- If Image JSON Prompt is requested: Output a developer-ready Image Generation JSON Prompt specification formatted in a clean json code block containing:
  model_target (Flux.1-Dev / Midjourney v6 / Imagen 3 / DALL-E 3),
  prompt (ultra-detailed descriptive prompt specifying composition, textures, artistic style, camera angle, and lighting based on the screenshot),
  negative_prompt (unwanted artifacts, blur, bad anatomy, text, distortions),
  technical_attributes (camera_lens, lighting_style, color_palette, resolution),
  parameters (aspect_ratio, cfg_scale, steps, sampler, seed),
  and api_request_payload (standard ready-to-call REST API payload format).
- If Video JSON Prompt is requested: Output a developer-ready Video Generation JSON Prompt specification formatted in a clean json code block containing:
  model_target (Sora / Runway Gen-3 Alpha / Kling 1.5 / Luma Dream Machine),
  scene_description (detailed cinematic scenario and subject kinematics based on the screenshot),
  camera_motion (pan, tilt, zoom, dolly, tracking speed, lens focal length),
  motion_pacing (tempo, velocity, physical dynamics),
  parameters (duration_seconds, fps, aspect_ratio, resolution, motion_intensity),
  timeline_keyframes (0s, 2.5s, 5s breakdown describing evolution),
  audio_prompt (sound design and atmosphere),
  and api_request_payload (standard ready-to-call REST API payload format).
- If JSON Prompt Script or developer payload is requested: Output a developer-ready JSON Prompt Script configuration formatted in a clean json code block containing:
  prompt_name, version, target_model, system_instruction, task_definition, input_variables, output_format, response_schema, few_shot_examples, recommended_parameters (temperature, max_tokens), curl_test_snippet, and developer_notes.
- If code/troubleshooting: Explain the root cause in simple terms and provide the corrected code snippet.
- If an article/summary: Provide structured key takeaways and actionable notes.
- If an AI prompt: Provide a well-engineered prompt ready to paste into an LLM or image generator.

Output clean Markdown directly with no unnecessary filler preamble.`;
    }

    parts.push({ text: promptText });

    const response = await generateContentWithFallback({
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction:
          'You are SnapAction AI. You produce ready-to-use, pristine action items from screenshots. Write clean, natural, formatted text. Do not wrap everything in unnecessary introductory chatter.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });

    const resultText = response.text || '';
    return res.json({ result: resultText });
  } catch (error: any) {
    console.error('Error executing action:', error);
    const msg = error?.message || '';
    const userFriendlyMessage =
      msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')
        ? 'The AI model is experiencing a temporary spike in traffic. Please tap Try Again.'
        : msg || 'Failed to execute action';

    return res.status(503).json({
      error: userFriendlyMessage,
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
    app.get('*', (req: Request, res: Response) => {
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
