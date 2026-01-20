import fs from "fs/promises"; // use promises version
import safeParseJSON from "../../utils/safeParseJSON.js";
import { analyzeFaceWithGemini } from "../../services/gemini.service.js";
import { level, skinType, skinHealth, confidence } from "../../helpers/analysis.helpers.js";
import { getAvoidTags } from "../../services/ingredient.service.js";
import { matchProducts } from "../../services/product.service.js";

/**
 * Controller: analyzeFaceV2
 * Handles uploaded image, stores it, sends to Gemini, and returns analysis.
 */
export async function analyzeFaceV2(req, res) {
  try {
    // 1️⃣ Check if a file was uploaded
    if (!req.file) {
      return res.json({
        success: true,
        analysis: { face_detected: false },
        uploaded_file_url: null,
      });
    }

    // 2️⃣ Read the saved file from disk
    // Multer diskStorage ensures req.file.path exists
    const buffer = await fs.readFile(req.file.path);
    const base64 = buffer.toString("base64");

    let raw;
    try {
      // 3️⃣ Send image to Gemini API
      raw = await analyzeFaceWithGemini({
        base64,
        mimeType: req.file.mimetype,
      });
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError.message);

      // ✅ Return uploaded image URL even if API key missing or API fails
      return res.json({
        success: true,
        analysis: { face_detected: false },
        uploaded_file_url: `/uploads/${req.file.filename}`,
      });
    }

    // 4️⃣ Parse Gemini response safely
    const vision = safeParseJSON(raw);

    if (!vision || vision.face_detected === false) {
      return res.json({
        success: true,
        analysis: { face_detected: false },
        uploaded_file_url: `/uploads/${req.file.filename}`,
      });
    }

    // 5️⃣ Extract features
    const f = vision.features;
    const type = skinType(f);
    const avoidTags = getAvoidTags(type);

    const concerns = Object.entries(f)
      .map(([key, score]) => ({ key, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // 6️⃣ Respond with analysis + uploaded file URL
    res.json({
      success: true,
      analysis: {
        face_detected: true,
        skin_type: type,
        acne_level: level(f.acne),
        oiliness: level(f.oiliness),
        dryness: level(f.dryness),
        redness: level(f.redness),
        dark_circles: level(f.dark_circles),
        fine_lines: level(f.fine_lines),
        pores: level(f.pores),
        overall_skin_health: skinHealth(f),
        confidence_scores: confidence(vision.image_quality, f),
        concerns,
        skincare_advice: ["Use sunscreen daily", "Cleanse gently"],
        recommended_products: matchProducts(avoidTags),
        avoidTags,
        uploaded_file_url: `/uploads/${req.file.filename}`, // ✅ important for showing uploaded image
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);

    // 7️⃣ Always return valid JSON
    return res.json({
      success: true,
      analysis: { face_detected: false },
      uploaded_file_url: req.file ? `/uploads/${req.file.filename}` : null,
    });
  }
}
