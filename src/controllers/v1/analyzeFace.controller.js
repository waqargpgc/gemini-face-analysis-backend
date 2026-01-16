import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are a dermatologist AI.
You MUST respond with valid JSON ONLY.
NO markdown.
NO explanations.
NO extra text.

If no face is detected, return:
{
  "face_detected": false,
  "reason": "no_face_detected"
}

Analyze the uploaded image and return a JSON object with the following structure and fields:

{
  "face_detected": boolean,
  "skin_type": string,
  "acne_level": string,
  "oiliness": string,
  "dryness": string,
  "redness": string,
  "dark_circles": string,
  "fine_lines": string,
  "pores": string,
  "overall_skin_health": string,
  "confidence_scores": number,
  "concerns": [{ "key": string, "score": number }],
  "skincare_advice": [string],
  "recommended_products": [
    {
      "id": number,
      "name": string,
      "brand": string,
      "type": string,
      "reason": string
    }
  ],
  "avoidTags": [string]
}

Output JSON ONLY.
`;

export async function analyzeFaceV1(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  try {
    console.log(req.file,"req.file ---------------------------->v1")
    const imageBase64 = req.file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: imageBase64,
          },
        },
        { text: SYSTEM_PROMPT },
      ],
      maxOutputTokens: 800,
    });

    const rawText = response.text || "";
    const analysis = safeParseJSON(rawText);

    if (!analysis) {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw: rawText,
      });
    }

    return res.json({ success: true, analysis });

  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ success: false, error: "Analysis failed" });
  }
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
