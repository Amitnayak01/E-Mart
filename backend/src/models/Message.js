import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* ================= MESSAGE CONTENT ================= */

    text: {
      type: String,
      maxlength: 1000,
      trim: true
    },

    media: {
      url: String,
      publicId: String
    },

    offer: {
      price: Number,
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
      }
    },

    location: {
      lat: Number,
      lng: Number
    },

    /* ================= DELIVERY PIPELINE ================= */

    delivered: { type: Boolean, default: false },
    deliveredAt: Date,

    read: { type: Boolean, default: false },   // ✅ REQUIRED
    readAt: Date,

    /* Soft delete */
    deletedForEveryone: { type: Boolean, default: false },
    editedAt: Date
  },
  { timestamps: true }
);

/* ================= INDEX STRATEGY ================= */

// Fast message loading per chat
messageSchema.index({ conversation: 1, createdAt: 1 });

// Delivery/read tracking
messageSchema.index({ receiver: 1, read: 1, createdAt: -1 });

/* ================= METHODS ================= */

messageSchema.methods.markDelivered = function () {
  this.delivered = true;
  this.deliveredAt = new Date();
};

messageSchema.methods.markRead = function () {
  this.read = true;
  this.readAt = new Date();
};

export default mongoose.model("Message", messageSchema);
