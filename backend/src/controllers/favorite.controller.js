import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addFavorite = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.Types.ObjectId.isValid(productId))
    throw new ApiError(400, "Invalid product id");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  try {
    await Favorite.create({ user: req.user._id, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: 1 } });
  } catch (e) {
    // duplicate favorite - ignore
  }

  res.json(new ApiResponse({ message: "Added to favorites" }));
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.Types.ObjectId.isValid(productId))
    throw new ApiError(400, "Invalid product id");

  const del = await Favorite.findOneAndDelete({
    user: req.user._id,
    product: productId
  });

  if (del) {
    await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: -1 } });
  }

  res.json(new ApiResponse({ message: "Removed from favorites" }));
});

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "product",
      populate: { path: "seller", select: "username name location avatar lastSeenAt" }
    });

  const items = favorites.map((f) => f.product).filter(Boolean);

  res.json(
    new ApiResponse({
      message: "Favorites fetched",
      data: { items }
    })
  );
});

// ✅ NEW: favorite status
export const getFavoriteStatus = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.Types.ObjectId.isValid(productId))
    throw new ApiError(400, "Invalid product id");

  const exists = await Favorite.exists({
    user: req.user._id,
    product: productId
  });

  res.json(
    new ApiResponse({
      message: "Favorite status fetched",
      data: { isFavorite: !!exists }
    })
  );
});
