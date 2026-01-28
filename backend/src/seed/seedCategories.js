import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db.js";

/**
 * Categories are used as string values stored in Product.category
 * In a real system, categories might be a separate collection.
 * For now we seed them via console output (Frontend can use same list).
 */

const categories = [
  "Mobiles",
  "Electronics",
  "Cars",
  "Bikes",
  "Furniture",
  "Fashion",
  "Books",
  "Sports",
  "Real Estate",
  "Jobs",
  "Services"
];

const run = async () => {
  try {
    await connectDB();
    console.log("✅ Categories seed list (use in frontend):");
    console.log(categories);
    process.exit(0);
  } catch (e) {
    console.error("❌ seedCategories failed:", e);
    process.exit(1);
  }
};

run();
