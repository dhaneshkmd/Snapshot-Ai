import { GoogleGenAI, Type } from '@google/genai';

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
          msg.includes('429');

        if (isTransient) {
          console.warn(`[SnapAction Vercel] Model ${model} transient error: ${msg}. Retrying/falling back...`);
          await new Promise((r) => setTimeout(r, attempt === 0 ? 800 : 1500));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType = 'image/png' } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const { data: cleanedData, mimeType: cleanedMime } = stripBase64(imageBase64);

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Environment Variables in Vercel.',
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
                description: 'Natural phrasing estimating why the user captured this screenshot',
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
      return res.status(200).json(parsed);
    } catch (apiErr) {
      console.warn('API fallback activated for analyze-screenshot on Vercel', apiErr);
      return res.status(200).json({
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
      error: error?.message || 'Failed to analyze screenshot',
    });
  }
}
