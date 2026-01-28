import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      minlength: 3,
      maxlength: 20
    },

    // bcrypt hash
    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true
    },

    name: { type: String, default: "", maxlength: 60 },
    location: { type: String, default: "", maxlength: 80 },

    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },

    isBanned: { type: Boolean, default: false, index: true },

    // used for chat “last seen” basic status
    lastSeenAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Important indexes
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isBanned: 1 });

export default mongoose.model("User", userSchema);
