import express from "express";
import { bulkExists } from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import {
  createReport,
  listReportsAdmin,
  deleteReportAdmin
} from "../controllers/report.controller.js";

const router = express.Router();
router.post("/bulk-exists", bulkExists);
router.post("/:productId", authMiddleware, createReport);
router.get("/", authMiddleware, adminMiddleware, listReportsAdmin);
router.delete("/:id", authMiddleware, adminMiddleware, deleteReportAdmin);

export default router;
