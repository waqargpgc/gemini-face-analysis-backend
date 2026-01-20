import express from "express";
import cors from "cors";
import path from "path";

import analyzeFaceV1 from "./routes/v1/analyzeFace.route.js";
import analyzeFaceV2 from "./routes/v2/analyzeFace.route.js";
import rateLimiter from "./middlewares/rateLimiter.js";
import uploadRoutes from "./routes/v1/uploads.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// ✅ Serve uploaded images
// This line makes files in "uploads/" accessible at /uploads/<filename>
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_, res) => {
  res.send("Gemini Face Analysis API running");
});

app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/analyze-face", analyzeFaceV1);
app.use("/api/v2/analyze-face", analyzeFaceV2);

export default app;




