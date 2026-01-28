import mongoose from "mongoose";
import Report from "../models/Report.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateReportPayload } from "../utils/validators.js";

export const createReport = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const { errors, sanitized } = validateReportPayload(req.body);
  if (errors.length) throw new ApiError(400, "Validation error", errors);

  const report = await Report.create({
    reporter: req.user._id,
    product: productId,
    reason: sanitized.reason,
    description: sanitized.description,
    status: "open"
  });

  res.status(201).json(new ApiResponse({ message: "Report submitted", data: { report } }));
});

export const listReportsAdmin = asyncHandler(async (req, res) => {
  const items = await Report.find()
    .sort({ createdAt: -1 })
    .populate("reporter", "username name")
    .populate("product", "title price category location status");

  res.json(new ApiResponse({ message: "Reports fetched", data: { items } }));
});

export const deleteReportAdmin = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid report id");
  }

  const report = await Report.findByIdAndDelete(id);
  if (!report) throw new ApiError(404, "Report not found");

  res.json(new ApiResponse({ message: "Report deleted" }));
});
