import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  getFavoriteStatus
} from "../controllers/favorite.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getFavorites);

// ✅ must be above "/:productId"
router.get("/status/:productId", authMiddleware, getFavoriteStatus);

router.post("/:productId", authMiddleware, addFavorite);
router.delete("/:productId", authMiddleware, removeFavorite);

export default router;
