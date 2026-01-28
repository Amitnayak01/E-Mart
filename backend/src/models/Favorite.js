import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

/**
 * Prevent duplicates:
 * a user can favorite a product only once.
 */
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

/**
 * Favorites listing page:
 * GET /favorites shows latest favorites first
 */
favoriteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Favorite", favoriteSchema);
