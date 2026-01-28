import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, default: "" } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, index: true },
    category: { type: String, required: true, index: true },
    condition: { type: String, enum: ["new", "used"], required: true, index: true },
    description: { type: String, required: true },
    location: { type: String, required: true, index: true },
    images: { type: [imageSchema], default: [] },
    status: { type: String, enum: ["Available", "Reserved", "Sold"], default: "Available", index: true },
    viewsCount: { type: Number, default: 0, index: true },
    favoritesCount: { type: Number, default: 0, index: true }
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, status: 1, createdAt: -1 });
productSchema.index({ location: 1, category: 1, price: 1 });

export default mongoose.model("Product", productSchema);
