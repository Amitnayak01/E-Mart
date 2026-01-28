import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { validateMessagePayload } from "../utils/validators.js";

const onlineUsers = new Map(); // userId -> Set<socketId>

export const initSocket = (io) => {

  /* ================= AUTH ================= */
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.isBanned) return next(new Error("Unauthorized"));

      socket.userId = user._id.toString();
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", async (socket) => {
    const userId = socket.userId;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeenAt: new Date()
    });

    socket.join(userId); // personal room



    /* ================= JOIN CONVERSATION ================= */
    socket.on("chat:join", ({ conversationId }) => {
      socket.join(conversationId);
    });



    /* ================= TYPING ================= */
    socket.on("chat:typing", ({ conversationId }) => {
      socket.to(conversationId).emit("chat:typing", { userId });
    });



    /* ================= SEND MESSAGE ================= */
    socket.on("chat:sendMessage", async ({ conversationId, text }) => {
      try {
        const { errors, sanitized } = validateMessagePayload({ text });
        if (errors.length)
          return socket.emit("chat:error", { message: "Validation error", errors });

        const convo = await Conversation.findById(conversationId);
        if (!convo) return;

        const receiverId = convo.participants.find(p => p.toString() !== userId);

        const msg = await Message.create({
          conversation: conversationId,
          sender: userId,
          receiver: receiverId,
          text: sanitized.text
        });

        // update conversation
        convo.lastMessage = msg._id;
        convo.lastMessageText = sanitized.text;
        convo.lastMessageAt = msg.createdAt;
        convo.incrementUnread(receiverId);
        await convo.save();

        // DELIVERY CHECK
        if (onlineUsers.has(receiverId.toString())) {
          msg.delivered = true;
          msg.deliveredAt = new Date();
          await msg.save();
        }

        io.to(conversationId).emit("chat:newMessage", msg);
        io.to(receiverId).emit("chat:unreadUpdate");

      } catch (e) {
        socket.emit("chat:error", { message: e.message });
      }
    });



    /* ================= READ RECEIPTS ================= */
    socket.on("chat:read", async ({ conversationId }) => {
      const messages = await Message.find({
        conversation: conversationId,
        receiver: userId,
        read: false
      });

      for (const m of messages) {
        m.read = true;
        m.readAt = new Date();
        await m.save();
      }

      await Conversation.findByIdAndUpdate(conversationId, {
        [`unread.${userId}`]: 0
      });

      io.to(conversationId).emit("chat:messagesRead", { conversationId });
    });



    /* ================= DELETE CHAT ================= */
    socket.on("chat:deleteConversation", async ({ conversationId }) => {
      await Conversation.findByIdAndUpdate(conversationId, {
        $addToSet: { deletedBy: userId }
      });

      socket.emit("chat:conversationDeleted", { conversationId });
    });



    /* ================= DISCONNECT ================= */
    socket.on("disconnect", async () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) onlineUsers.delete(userId);
      }

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeenAt: new Date()
      });
    });
  });
};
