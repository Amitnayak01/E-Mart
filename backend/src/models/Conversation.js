import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Exactly 2 participants (buyer & seller)
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        }
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Conversation must have exactly 2 participants"
      }
    },

    // Link chat to product listing (important for marketplace)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null
    },

    lastMessageText: {
      type: String,
      trim: true
    },

    lastMessageAt: {
      type: Date,
      default: null
    },

    // Unread message counters per user
    unread: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);



/* ================= INDEXES ================= */

// Fetch "my conversations" fast
conversationSchema.index({ participants: 1 });

// Sort recent chats fast
conversationSchema.index({ lastMessageAt: -1 });

// Prevent duplicate chat threads for same users + same product
conversationSchema.index(
  { participants: 1, product: 1 },
  { unique: true }
);



/* ================= NORMALIZATION ================= */

// Sort participant IDs so [A,B] and [B,A] are identical
conversationSchema.pre("save", function (next) {
  this.participants.sort((a, b) => a.toString().localeCompare(b.toString()));
  next();
});



/* ================= METHODS ================= */

conversationSchema.methods.incrementUnread = function (userId) {
  const key = userId.toString();
  this.unread.set(key, (this.unread.get(key) || 0) + 1);
};

conversationSchema.methods.resetUnread = function (userId) {
  this.unread.set(userId.toString(), 0);
};



export default mongoose.model("Conversation", conversationSchema);
