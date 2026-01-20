import multer from "multer";
import path from "path";
import fs from "fs";

// 1️⃣ Make sure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2️⃣ Use diskStorage to save files with proper extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // save in uploads/
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // preserve .png/.jpg
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, filename);
  },
});

// 3️⃣ Export multer middleware
export default multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // optional: 10MB limit
  fileFilter: (req, file, cb) => {
    // only allow images
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});
