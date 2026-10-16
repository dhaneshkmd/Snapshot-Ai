import { GoogleGenAI } from '@google/genai';

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
      console.warn(`[SnapAction Vercel] Model ${model} response issue: ${msg.substring(0, 120)}...`);

      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded') || msg.includes('429')) {
        continue;
      }

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    } = req.body || {};

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Environment Variables in Vercel.',
      });
    }

    const parts: any[] = [];
    const hasTextContext = Boolean(
      (extractedText && extractedText.trim().length > 10) ||
      (cleanMarkdown && cleanMarkdown.trim().length > 10)
    );

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
If a table or tabular data is requested (e.g. 'Convert into Table', 'Format as Table', 'Structured Table'): Output a clean, valid Markdown table with column headers:
| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| Data | Data | Data |
Ensure proper pipe separators and line breaks so it parses as a standard table.
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
  3. 20 Curated Hashtags categorized into High-Volume (#...), Niche Specific (#...), and Trending/Community (#...)
- If JSON Prompt Script or developer payload is requested: Output a developer-ready JSON Prompt Script configuration formatted in a clean json code block containing:
  prompt_name, version, target_model, system_instruction, task_definition, input_variables, output_format, response_schema, few_shot_examples, recommended_parameters (temperature, max_tokens), curl_test_snippet, and developer_notes.
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
    return res.status(200).json({ result: resultText });
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
}
