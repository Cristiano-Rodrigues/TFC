import { GoogleGenAI } from "@google/genai";

// Ensure the SDK is only instantiated if the API key is present
const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Helper to get the correct Gemini model.
 * Basic Text Tasks should use 'gemini-3.5-flash' as per guidelines.
 */
export const GEMINI_MODEL = 'gemini-3.5-flash';
