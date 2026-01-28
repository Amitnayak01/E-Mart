import multer from "multer";
import path from "path";
import fs from "fs";

const ensureUploadsDir = () => {
  const dir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  return dir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ensureUploadsDir()),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files allowed"));
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024 }
});
