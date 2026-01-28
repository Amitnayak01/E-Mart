import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import {
  getAnalytics,
  listUsers,
  banUser,
  unbanUser,
  listProductsAdmin,
  deleteProductAdmin
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/analytics", getAnalytics);

router.get("/users", listUsers);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);

router.get("/products", listProductsAdmin);
router.delete("/products/:id", deleteProductAdmin);

export default router;
