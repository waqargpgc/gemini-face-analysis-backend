import express from "express";
import upload from "../../middlewares/upload.middleware.js";
import { analyzeFaceV1 } from "../../controllers/v1/analyzeFace.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), analyzeFaceV1);

export default router;


