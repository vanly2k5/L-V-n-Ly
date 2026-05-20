import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

if (!process.env.VERCEL) {
  dotenv.config();
}

let genAI: any = null;

export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

export async function generateWithRetry(params: any, retries = 2) {
  const ai = getGenAI();
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      console.error(`Gemini Error (Attempt ${i + 1}):`, error.message);
      
      const isRetryable = error?.status === 503 || 
                         error?.message?.includes("503") || 
                         error?.message?.includes("high demand") ||
                         error?.status === 429;
      
      if (isRetryable && i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  return null;
}
