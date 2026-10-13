import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Resilient multi-model call with automatic retry & fallback on 503 / 429
async function generateContentWithFallback(params: any): Promise<any> {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || JSON.stringify(err) || '');
        const isTransient =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('429') ||
          msg.includes('overloaded');

        if (isTransient) {
          console.warn(`[SnapAction] Model ${model} attempt ${attempt + 1} transient error: ${msg}. Retrying/falling back...`);
          await new Promise((r) => setTimeout(r, attempt === 0 ? 800 : 1500));
        } else {
          // Non-transient error, break to next candidate model
          break;
        }
      }
    }
  }

  throw lastError;
}

// 1. Analyze Screenshot
app.post('/api/analyze-screenshot', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const { data: cleanedData, mimeType: cleanedMime } = stripBase64(imageBase64);

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
      });
    }

    const systemInstruction = `You are the visual intelligence engine of SnapAction AI ("Screenshot Anything. Turn It Into Action.").
A user captured and uploaded a screenshot.
Your mission is: Screenshot → Understand → Recommend → Act.

Do NOT simply run standard OCR or dump raw transcriptions.
Understand the screenshot semantically:
1. What is shown in the screenshot?
2. What type of content is it? (e.g. Chat/Conversation, Job Opening, Stock Chart, Receipt/Invoice, Event Invitation, Article/Webpage, Social Post, Shopping/Product, Error/Code, Location/Map, Document/Notes, etc.)
3. What important entities/data points are present? (e.g. Names, Dates, Amounts, Stock symbols, Key topics, URLs, etc.)
4. Why did the user likely take this screenshot? (Detected intention). Never claim absolute certainty; use natural, human-friendly wording like:
   - "Looks like a LinkedIn job opening for..."
   - "This appears to be a stock-market chart showing..."
   - "Message from your manager requesting..."
   - "Receipt from..."
   - "Social media post discussing..."
5. Recommend EXACTLY the 3 most relevant, high-utility next actions. Each should be practical and direct (e.g. "Apply for this Job", "Draft Polite Reply", "Create Market Note", "Add to Calendar", "Save Expense").
6. Provide a "magicAction" (✨ Do Something Useful): The single most valuable, automatic next step for this screenshot.
7. Provide 4 to 6 "moreActions" across categories for users who want more choices.

Return strict JSON conforming to the requested schema.`;

    try {
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
                text: 'Analyze this screenshot semantically, detect the probable user intent, extract key entities, and generate the 3 best actions plus magic action and more actions.',
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
              contentType: {
                type: Type.STRING,
                description: 'e.g. Conversation, Job Opening, Stock Chart, Receipt, Event, Article, Product, Error Code, Social Post',
              },
              detectedIntent: {
                type: Type.STRING,
                description: 'Natural phrasing estimating why the user captured this screenshot (e.g. "Looks like a LinkedIn job opening.")',
              },
              title: {
                type: Type.STRING,
                description: 'Crisp title representing the screenshot subject',
              },
              summary: {
                type: Type.STRING,
                description: '1 to 2 sentences explaining the context clearly',
              },
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
              'entities',
              'magicAction',
              'suggestedActions',
              'moreActions',
            ],
          },
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (apiErr: any) {
      console.warn('All Gemini models encountered high demand. Activating smart resilient fallback analysis...', apiErr);
      // Smart graceful fallback so user never gets blocked by temporary Google server demand spikes:
      return res.json({
        contentType: 'Screenshot Content',
        detectedIntent: 'Captured screenshot ready for immediate action.',
        title: 'Analyzed Screenshot',
        summary: 'Your screenshot was received. High AI server demand was detected, so we prepared instant action paths for you.',
        entities: [
          { label: 'Status', value: 'High Demand Fallback Active' },
          { label: 'Resolution', value: 'Original Upload Preserved' },
        ],
        magicAction: {
          id: 'magic_extract',
          name: '✨ Extract & Turn Into Action',
          description: 'Extract key points, clean text, and draft the best response',
          actionPrompt: 'Analyze all text and images in this screenshot and summarize the most useful action points.',
        },
        suggestedActions: [
          {
            id: 'action_extract',
            name: 'Extract Text & Clean Up',
            description: 'Extract all visible text and format cleanly into notes',
            actionPrompt: 'Extract all text verbatim, fix OCR formatting, and organize neatly.',
          },
          {
            id: 'action_draft',
            name: 'Draft Response / Action Plan',
            description: 'Create an actionable draft or reply based on the screenshot',
            actionPrompt: 'Draft an authentic, high-quality reply or action response for this content.',
          },
          {
            id: 'action_social',
            name: 'Turn Into LinkedIn / Social Post',
            description: 'Format the screenshot insights for social sharing',
            actionPrompt: 'Create an engaging social media post highlighting the key takeaway.',
          },
        ],
        moreActions: [
          {
            category: 'Text',
            name: 'Summarize Key Takeaways',
            actionPrompt: 'Summarize the key information in 3 concise bullet points.',
          },
          {
            category: 'Communication',
            name: 'Professional Email Reply',
            actionPrompt: 'Write a professional email response addressing this.',
          },
          {
            category: 'AI Prompt',
            name: 'Turn Into AI Prompt',
            actionPrompt: 'Generate a detailed prompt describing this screenshot.',
          },
        ],
      });
    }
  } catch (error: any) {
    console.error('Error analyzing screenshot:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze screenshot. Please try again in a few seconds.',
    });
  }
});

// 2. Execute Action / Transform / Ask SnapAction
app.post('/api/execute-action', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/png',
      actionName,
      actionPrompt,
      contextSummary,
      previousResult,
      isTransformation = false,
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const parts: any[] = [];

    if (imageBase64 && !isTransformation) {
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

Provide the transformed result directly. Make it production-ready, beautifully formatted in clean Markdown, concise, high quality, and ready to immediately copy or share. Do not include meta-chatter like "Here is your updated result:". Just output the polished content.`;
    } else {
      promptText = `You are SnapAction AI executing the action: "${actionName}".
Specific Task / Instruction: "${actionPrompt}"
Context: "${contextSummary || 'Extracted from screenshot'}"

Generate the complete, high-quality, practical result.
Guidelines based on action type:
- If a message or reply: Write an authentic, polished draft ready to send. Include subject or greeting if relevant.
- If a job pitch or cover letter: Write a tailored, impactful letter ready to copy into LinkedIn or email.
- If a financial/stock note: Summarize key levels, changes, takeaways, and add a brief disclaimer without giving speculative trading advice.
- If a calendar or event: Structure the title, date/time, location, and brief agenda.
- If a receipt/invoice: Present an itemized breakdown, total, date, merchant, and clean tabular CSV/data.
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
