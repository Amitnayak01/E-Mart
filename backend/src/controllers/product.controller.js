import mongoose from "mongoose";
import Product from "../models/Product.js";
import Favorite from "../models/Favorite.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sanitizeSort,
  sanitizeText,
  validatePagination,
  validateProductPayload
} from "../utils/validators.js";
import { uploadImage, deleteImage } from "../services/cloudinary.service.js";

/* =========================================================
   CREATE PRODUCT
========================================================= */
export const createProduct = asyncHandler(async (req, res) => {
  const { errors, sanitized } = validateProductPayload(req.body);
  if (errors.length) throw new ApiError(400, "Validation error", errors);

  const files = req.files || [];
  if (!files.length) throw new ApiError(400, "At least one image is required");

  const images = [];
  for (const file of files) {
    const uploaded = await uploadImage(file);
    images.push(uploaded);
  }

  const product = await Product.create({
    seller: req.user._id,
    ...sanitized,
    status: "Available",
    images
  });

  res.status(201).json(
    new ApiResponse({
      message: "Product created",
      data: { product }
    })
  );
});

/* =========================================================
   UPDATE PRODUCT
========================================================= */
export const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid product id");

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.seller.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not allowed");

  const { errors, sanitized } = validateProductPayload({
    ...product.toObject(),
    ...req.body
  });

  if (errors.length) throw new ApiError(400, "Validation error", errors);

  // Replace images if new files uploaded
  const files = req.files || [];
  if (files.length) {
    for (const img of product.images) {
      if (img.publicId) await deleteImage(img.publicId);
    }

    const newImages = [];
    for (const file of files) {
      const uploaded = await uploadImage(file);
      newImages.push(uploaded);
    }
    product.images = newImages;
  }

  // Optional status update
  const status = sanitizeText(req.body.status);
  if (status && ["Available", "Reserved", "Sold"].includes(status)) {
    product.status = status;
  }

  product.title = sanitized.title;
  product.price = sanitized.price;
  product.category = sanitized.category;
  product.condition = sanitized.condition;
  product.description = sanitized.description;
  product.location = sanitized.location;

  await product.save();

  res.json(
    new ApiResponse({
      message: "Product updated",
      data: { product }
    })
  );
});

/* =========================================================
   DELETE PRODUCT
========================================================= */
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid product id");

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  const isOwner = product.seller.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin)
    throw new ApiError(403, "Not allowed");

  for (const img of product.images) {
    if (img.publicId) await deleteImage(img.publicId);
  }

  await Favorite.deleteMany({ product: product._id });
  await Product.findByIdAndDelete(product._id);

  res.json(new ApiResponse({ message: "Product deleted" }));
});

/* =========================================================
   GET PRODUCT BY ID
========================================================= */
export const getProductById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid product id");

  const product = await Product.findById(id)
    .populate("seller", "username name location avatar lastSeenAt");

  if (!product) throw new ApiError(404, "Product not found");

  res.json(
    new ApiResponse({
      message: "Product fetched",
      data: { product }
    })
  );
});

/* =========================================================
   LIST PRODUCTS (PUBLIC MARKETPLACE)
========================================================= */
export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = validatePagination(req.query);

  const q = sanitizeText(req.query.q);
  const category = sanitizeText(req.query.category);
  const condition = sanitizeText(req.query.condition);
  const location = sanitizeText(req.query.location);
  const status = sanitizeText(req.query.status);

  const minPrice =
    req.query.minPrice !== undefined
      ? Number(req.query.minPrice)
      : undefined;

  const maxPrice =
    req.query.maxPrice !== undefined
      ? Number(req.query.maxPrice)
      : undefined;

  const sort = sanitizeSort(req.query.sort);

  /* 🔒 PUBLIC RULE: ALWAYS SHOW AVAILABLE PRODUCTS */
  const filter = {
    status: "Available"
  };

  if (category) filter.category = category;
  if (condition && ["new", "used"].includes(condition))
    filter.condition = condition;
  if (location) filter.location = location;

  if (status && ["Available", "Reserved", "Sold"].includes(status)) {
    filter.status = status;
  }

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filter.price = {};
    if (Number.isFinite(minPrice)) filter.price.$gte = minPrice;
    if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice;

    if (Object.keys(filter.price).length === 0) {
      delete filter.price;
    }
  }

  if (q) {
    filter.$text = { $search: q };
  }

  let sortObj = { createdAt: -1 };
  if (sort === "price_asc") sortObj = { price: 1 };
  if (sort === "price_desc") sortObj = { price: -1 };
  if (sort === "popular")
    sortObj = { favoritesCount: -1, viewsCount: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("seller", "username name location avatar lastSeenAt"),

    Product.countDocuments(filter)
  ]);

  res.json(
    new ApiResponse({
      message: "Products fetched",
      data: {
        items,
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

/* =========================================================
   LIST MY LISTINGS (DASHBOARD)
========================================================= */
export const listMyListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = validatePagination(req.query);

  const [items, total] = await Promise.all([
    Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Product.countDocuments({ seller: req.user._id })
  ]);

  res.json(
    new ApiResponse({
      message: "My listings fetched",
      data: {
        items,
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

/* =========================================================
   INCREMENT VIEW COUNT
========================================================= */
export const incrementView = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid product id");

  await Product.findByIdAndUpdate(id, {
    $inc: { viewsCount: 1 }
  });

  res.json(new ApiResponse({ message: "View updated" }));
});



export const bulkExists = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

  const validIds = ids.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  const products = await Product.find({
    _id: { $in: validIds }
  })
    .populate("seller", "username name location avatar lastSeenAt")
    .lean();

  res.json(
    new ApiResponse({
      message: "Valid products fetched",
      data: { items: products }
    })
  );
});

