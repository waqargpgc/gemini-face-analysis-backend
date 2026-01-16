import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeFaceWithGemini({ base64, mimeType }) {
  const SYSTEM_PROMPT = `
Return VALID JSON ONLY.
{
  "face_detected": boolean,
  "features": {
    "acne": number,
    "oiliness": number,
    "dryness": number,
    "redness": number,
    "dark_circles": number,
    "fine_lines": number,
    "pores": number
  },
  "image_quality": number
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      { text: SYSTEM_PROMPT },
    ],
    maxOutputTokens: 300,
  });

  return response.text;
}
