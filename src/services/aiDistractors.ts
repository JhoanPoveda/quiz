import { GoogleGenAI, Type } from '@google/genai';
import { generateCzechDistractors } from './czechGrammar';

/**
 * Uses Gemini AI if available to produce 3 grammatically tricky Czech distractors
 * tailored to the exact sentence context.
 * Falls back seamlessly to the Czech rule engine.
 */
export async function generateSmartDistractors(
  correctAnswer: string,
  question: string
): Promise<{ distractors: string[]; explanation?: string }> {
  // Check if API key is present
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;

  if (!apiKey) {
    // Instant linguistic engine
    return {
      distractors: generateCzechDistractors(correctAnswer, question),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert Czech language professor preparing a multiple-choice quiz.
Question sentence: "${question}"
The single correct answer is: "${correctAnswer}"

Generate exactly 3 plausible, tricky Czech distractors (incorrect choices) that test Czech grammar (such as gender agreement, case endings, aspect, verbal prefixes, or diacritics).
CRITICAL RULES:
1. Do NOT include the correct answer "${correctAnswer}" in the 3 distractors.
2. The 3 distractors must be distinct from each other.
3. Keep the same casing (capitalized if "${correctAnswer}" is capitalized).
4. Return pure JSON with an array "distractors" of 3 strings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distractors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of exactly 3 Czech distractors',
            },
          },
          required: ['distractors'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (Array.isArray(parsed.distractors) && parsed.distractors.length >= 3) {
      const filtered = parsed.distractors
        .filter((d: string) => d.trim().toLowerCase() !== correctAnswer.trim().toLowerCase())
        .slice(0, 3);
      if (filtered.length === 3) {
        return { distractors: filtered };
      }
    }
  } catch (err) {
    console.warn('Gemini distractor generation fallback to linguistic engine:', err);
  }

  return {
    distractors: generateCzechDistractors(correctAnswer, question),
  };
}
