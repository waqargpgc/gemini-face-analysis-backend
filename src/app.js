import express from "express";
import cors from "cors";

import analyzeFaceV1 from "./routes/v1/analyzeFace.route.js";
import analyzeFaceV2 from "./routes/v2/analyzeFace.route.js";
import rateLimiter from "./middlewares/rateLimiter.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.get("/", (_, res) => {
  res.send("Gemini Face Analysis API running");
});

app.use("/api/v1/analyze-face", analyzeFaceV1);
app.use("/api/v2/analyze-face", analyzeFaceV2);

export default app;



