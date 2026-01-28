import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessageHttp,
  deleteConversation   // ✅ ADD THIS
} from "../controllers/chat.controller.js";


const router = express.Router();

// Protect all chat routes
router.use(authMiddleware);

router.delete("/conversations/:id", authMiddleware, deleteConversation);

router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/conversations", createOrGetConversation);
router.post("/messages/:conversationId", sendMessageHttp);

export default router;
