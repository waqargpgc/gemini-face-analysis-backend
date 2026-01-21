import express from "express";
import upload from "../../middlewares/upload.middleware.js";
import { analyzeFaceUnified } from "../../controllers/v2/analyzeFaceUnified.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), analyzeFaceUnified);

export default router;
