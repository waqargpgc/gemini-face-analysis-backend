import express from "express";
import upload from "../../middlewares/upload.middleware.js";
import { analyzeFaceV2 } from "../../controllers/v2/analyzeFace.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), analyzeFaceV2);

export default router;
