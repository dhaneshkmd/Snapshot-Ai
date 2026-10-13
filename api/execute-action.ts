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
      isTransformation = false,
    } = req.body || {};

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Environment Variables in Vercel.',
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
    return res.status(500).json({
      error: error?.message || 'Failed to execute action',
    });
  }
}
