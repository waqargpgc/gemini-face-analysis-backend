import fs from "fs/promises";
import axios from "axios";
import { level, skinType, skinHealth } from "../../helpers/analysis.helpers.js";

/**
 * analyzeFaceUnified
 * Provider: facepp | epiderm
 * Default: facepp
 */
export async function analyzeFaceUnified(req, res) {
  try {
    if (!req.file) {
      return res.json({
        success: true,
        provider: null,
        analysis: { face_detected: false },
        uploaded_file_url: null,
      });
    }

    const provider = req.query.provider || "facepp";

    // 1️⃣ Read image
    const buffer = await fs.readFile(req.file.path);
    const base64 = buffer.toString("base64");

    let features;
    let providerRaw;

    /* =========================
       FACE++ PROVIDER
    ========================= */
    if (provider === "facepp") {
      const r = await axios.post(
        "https://api-us.faceplusplus.com/facepp/v3/face/analyze",
        null,
        {
          params: {
            api_key: process.env.FACEPP_KEY,
            api_secret: process.env.FACEPP_SECRET,
            image_base64: base64,
            return_attributes: "skinstatus",
          },
        }
      );

      if (!r.data.faces?.length) {
        return res.json({
          success: true,
          provider,
          analysis: { face_detected: false },
          uploaded_file_url: `/uploads/${req.file.filename}`,
        });
      }

      const s = r.data.faces[0].attributes.skinstatus;

      features = {
        acne: s.acne,
        oiliness: s.health < 50 ? 70 : 30,
        dryness: 100 - s.health,
        redness: s.stain,
        dark_circles: s.dark_circle,
        fine_lines: s.health < 60 ? 60 : 30,
        pores: s.pore,
      };

      providerRaw = s;
    }

    /* =========================
       EPIDERM PROVIDER
    ========================= */
    else if (provider === "epiderm") {
      const r = await axios.post(
        "https://api.epiderm.app/analyze",
        { image: base64 },
        {
          headers: {
            Authorization: `Bearer ${process.env.EPIDERM_KEY}`,
          },
        }
      );

      if (!r.data?.features) {
        return res.json({
          success: true,
          provider,
          analysis: { face_detected: false },
          uploaded_file_url: `/uploads/${req.file.filename}`,
        });
      }

      features = {
        acne: r.data.features.acne,
        oiliness: r.data.features.oiliness,
        dryness: r.data.features.dryness,
        redness: r.data.features.redness,
        dark_circles: r.data.features.dark_circles,
        fine_lines: r.data.features.fine_lines,
        pores: r.data.features.pores,
      };

      providerRaw = r.data.features;
    }

    /* =========================
       UNKNOWN PROVIDER
    ========================= */
    else {
      return res.status(400).json({
        success: false,
        error: "Invalid provider (use facepp or epiderm)",
      });
    }

    // 2️⃣ Normalize
    const type = skinType(features);

    return res.json({
      success: true,
      provider,
      analysis: {
        face_detected: true,
        skin_type: type,
        acne_level: level(features.acne),
        oiliness: level(features.oiliness),
        dryness: level(features.dryness),
        redness: level(features.redness),
        dark_circles: level(features.dark_circles),
        fine_lines: level(features.fine_lines),
        pores: level(features.pores),
        overall_skin_health: skinHealth(features),
        raw_features: features,
        provider_raw: providerRaw,
        uploaded_file_url: `/uploads/${req.file.filename}`,
      },
    });
  } catch (err) {
    console.error("Unified skin analysis error:", err.message);

    return res.json({
      success: true,
      analysis: { face_detected: false },
      uploaded_file_url: req.file ? `/uploads/${req.file.filename}` : null,
    });
  }
}
