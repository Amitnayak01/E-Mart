import User from "../models/User.js";
import Product from "../models/Product.js";
import Report from "../models/Report.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

export const getAnalytics = asyncHandler(async (req, res) => {
  const [users, products, reports] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Report.countDocuments()
  ]);

  res.json(
    new ApiResponse({
      message: "Analytics fetched",
      data: { totalUsers: users, totalProducts: products, totalReports: reports }
    })
  );
});

export const listUsers = asyncHandler(async (req, res) => {
  const items = await User.find().sort({ createdAt: -1 }).select("-password");
  res.json(new ApiResponse({ message: "Users fetched", data: { items } }));
});

export const banUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid user id");

  const user = await User.findByIdAndUpdate(id, { isBanned: true }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  res.json(new ApiResponse({ message: "User banned", data: { user } }));
});

export const unbanUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid user id");

  const user = await User.findByIdAndUpdate(id, { isBanned: false }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  res.json(new ApiResponse({ message: "User unbanned", data: { user } }));
});

export const listProductsAdmin = asyncHandler(async (req, res) => {
  const items = await Product.find()
    .sort({ createdAt: -1 })
    .populate("seller", "username name location isBanned");
  res.json(new ApiResponse({ message: "Products fetched", data: { items } }));
});

export const deleteProductAdmin = asyncHandler(async (req, res) => {
  // reuse product controller logic in frontend later; here direct delete
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid product id");

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, "Product not found");

  res.json(new ApiResponse({ message: "Product deleted by admin" }));
});
