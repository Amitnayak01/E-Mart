import fs from "fs";
import path from "path";
import { cloudinary } from "../config/cloudinary.js";

export const uploadImage = async (file) => {
  const driver = process.env.UPLOAD_DRIVER || "cloudinary";
  if (driver === "local") {
    return { url: `/uploads/${path.basename(file.path)}`, publicId: "" };
  }
  const folder = process.env.CLOUDINARY_FOLDER || "emart";
  const res = await cloudinary.uploader.upload(file.path, { folder, resource_type: "image" });
  try { fs.unlinkSync(file.path); } catch {}
  return { url: res.secure_url, publicId: res.public_id };
};

export const deleteImage = async (publicId) => {
  const driver = process.env.UPLOAD_DRIVER || "cloudinary";
  if (driver === "local" || !publicId) return;
  try { await cloudinary.uploader.destroy(publicId); } catch {}
};
