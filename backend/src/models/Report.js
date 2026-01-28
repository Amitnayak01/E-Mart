import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
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
    },

    reason: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 500 },

    status: {
      type: String,
      enum: ["open", "reviewed"],
      default: "open",
      index: true
    }
  },
  { timestamps: true }
);

/**
 * Admin panel sorting and filtering:
 * - newest reports
 * - by product
 * - by reporter
 */
reportSchema.index({ createdAt: -1 });
reportSchema.index({ product: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
