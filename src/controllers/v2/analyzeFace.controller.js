import fs from "fs";
import safeParseJSON from "../../utils/safeParseJSON.js";
import { analyzeFaceWithGemini } from "../../services/gemini.service.js";
import { level, skinType, skinHealth, confidence } from "../../helpers/analysis.helpers.js";
import { getAvoidTags } from "../../services/ingredient.service.js";
import { matchProducts } from "../../services/product.service.js";

export async function analyzeFaceV2(req, res) {
  console.log(req.file,"req.file ---------------------------->v2")
  const buffer = fs.readFileSync(req.file.path);
  const base64 = buffer.toString("base64");

  const raw = await analyzeFaceWithGemini({
    base64,
    mimeType: req.file.mimetype,
  });

  const vision = safeParseJSON(raw);
  if (!vision || vision.face_detected === false) {
    return res.json({ success: true, analysis: { face_detected: false } });
  }

  const f = vision.features;
  console.log(f,"------------------------------->features")
  const type = skinType(f);
  const avoidTags = getAvoidTags(type);

  const concerns = Object.entries(f)
    .map(([key, score]) => ({ key, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

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
    },
  });
}
