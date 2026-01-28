import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateMessagePayload, sanitizeText, validatePagination } from "../utils/validators.js";

/* ================= HELPER ================= */

const normalizeParticipants = (a, b) => {
  const ids = [
    new mongoose.Types.ObjectId(a),
    new mongoose.Types.ObjectId(b)
  ];
  return ids.sort((x, y) => x.toString().localeCompare(y.toString()));
};


/* ================= DELETE CONVERSATION ================= */

export const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid conversation id");

  const convo = await Conversation.findById(id);
  if (!convo) throw new ApiError(404, "Conversation not found");

  if (!convo.participants.map(p => p.toString()).includes(userId))
    throw new ApiError(403, "Not allowed");

  await Message.deleteMany({ conversation: id });
  await convo.deleteOne();

  res.json(new ApiResponse({ message: "Conversation deleted" }));
});


/* ================= GET CONVERSATIONS ================= */

export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id; // ObjectId

  const conversations = await Conversation.find({
    participants: { $in: [userId] }
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "username name avatar lastSeenAt isOnline")
    .populate("lastMessage");

  const items = conversations.map((c) => ({
    ...c.toObject(),
    unreadCount: c.unread.get(userId.toString()) || 0
  }));

  res.json(new ApiResponse({ message: "Conversations fetched", data: { items } }));
});


/* ================= CREATE OR GET CONVERSATION ================= */

export const createOrGetConversation = asyncHandler(async (req, res) => {
  const otherUserId = sanitizeText(req.body.otherUserId);
  const productId = req.body.productId || null;

  if (!mongoose.Types.ObjectId.isValid(otherUserId))
    throw new ApiError(400, "Invalid otherUserId");

  if (otherUserId === req.user._id.toString())
    throw new ApiError(400, "Cannot chat with yourself");

  const other = await User.findById(otherUserId);
  if (!other) throw new ApiError(404, "User not found");

  const participantsSorted = normalizeParticipants(req.user._id, otherUserId);

  let convo = await Conversation.findOne({
    participants: { $all: participantsSorted, $size: 2 },
    product: productId
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: participantsSorted,
      product: productId,
      unread: {
        [req.user._id.toString()]: 0,
        [otherUserId.toString()]: 0
      }
    });
  }

  convo = await Conversation.findById(convo._id)
    .populate("participants", "username name avatar lastSeenAt isOnline")
    .populate("lastMessage");

  res.status(201).json(
    new ApiResponse({ message: "Conversation ready", data: { conversation: convo } })
  );
});


/* ================= GET MESSAGES ================= */

export const getMessages = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;

  if (!mongoose.Types.ObjectId.isValid(conversationId))
    throw new ApiError(400, "Invalid conversation id");

  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new ApiError(404, "Conversation not found");

  const userId = req.user._id.toString();
  if (!convo.participants.map(p => p.toString()).includes(userId))
    throw new ApiError(403, "Not allowed");

  const { page, limit, skip } = validatePagination(req.query);

  const [items, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversation: conversationId })
  ]);

 await Message.updateMany(
  { conversation: conversationId, receiver: req.user._id, read: false },
  { delivered: true, deliveredAt: new Date(), read: true, readAt: new Date() }
);


  convo.unread.set(userId, 0);
  await convo.save();

  res.json(
    new ApiResponse({
      message: "Messages fetched",
      data: {
        items: items.reverse(),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  );
});


/* ================= SEND MESSAGE ================= */

export const sendMessageHttp = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;

  if (!mongoose.Types.ObjectId.isValid(conversationId))
    throw new ApiError(400, "Invalid conversation id");

  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new ApiError(404, "Conversation not found");

  const userId = req.user._id.toString();
  if (!convo.participants.map(p => p.toString()).includes(userId))
    throw new ApiError(403, "Not allowed");

  const receiverId = convo.participants.find(p => p.toString() !== userId);

  const { errors, sanitized } = validateMessagePayload(req.body);
  if (errors.length) throw new ApiError(400, "Validation error", errors);

  const msg = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    receiver: receiverId,
    text: sanitized.text
  });

  convo.lastMessage = msg._id;
  convo.lastMessageText = sanitized.text;
  convo.lastMessageAt = msg.createdAt;
  convo.unread.set(receiverId.toString(), (convo.unread.get(receiverId.toString()) || 0) + 1);

  await convo.save();

  res.status(201).json(new ApiResponse({ message: "Message sent", data: { message: msg } }));
});
