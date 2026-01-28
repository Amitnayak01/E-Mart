import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  signup,
  login,
  me,
  updateProfile,
  changePassword,
  uploadAvatar
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, me);

router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.put("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

export default router;
