import express from "express";
import { bulkExists } from "../controllers/product.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  listProducts,
  listMyListings,
  incrementView
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/my", authMiddleware, listMyListings);

router.post("/bulk-exists", bulkExists);

router.post("/", authMiddleware, upload.array("images", 6), createProduct);
router.get("/:id", getProductById);
router.put("/:id", authMiddleware, upload.array("images", 6), updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

router.post("/:id/view", incrementView);

export default router;
