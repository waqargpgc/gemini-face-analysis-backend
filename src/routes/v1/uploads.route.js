import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads");

// ✅ GET /api/uploads - list all uploaded images
router.get("/", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads folder:", err);
      return res.status(500).json({ success: false, message: "Could not list files" });
    }

    // Only include images (png, jpg, jpeg, gif)
    const images = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));

    res.json({
      success: true,
      count: images.length,
      files: images,
    });
  });
});

// ✅ DELETE /api/uploads - delete all uploaded images
router.delete("/", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads folder:", err);
      return res.status(500).json({ success: false, message: "Could not access uploads folder" });
    }

    // Only delete image files
    const images = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));
    let deletedCount = 0;

    images.forEach(file => {
      const filePath = path.join(uploadDir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (err) {
        console.error("Error deleting file:", file, err);
      }
    });

    res.json({
      success: true,
      message: `Deleted ${deletedCount} images`,
    });
  });
});

export default router;
