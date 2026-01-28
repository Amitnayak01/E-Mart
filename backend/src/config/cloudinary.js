import { v2 as cloudinary } from "cloudinary";

export const initCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
      "⚠️ Cloudinary env missing. If UPLOAD_DRIVER=cloudinary, uploads may fail."
    );
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });

  console.log("✅ Cloudinary configured");
};

export { cloudinary };
