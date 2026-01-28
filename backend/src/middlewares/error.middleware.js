import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

export const notFound = (req, res) => {
  res.status(404).json(new ApiResponse({ success: false, message: "Route not found" }));
};

export const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";
  let errors = err.errors || [];

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation error";
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid id";
    errors = [{ field: err.path, message: "Invalid object id" }];
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (!isProd) console.error("❌ Error:", err);

  res.status(statusCode).json(
    new ApiResponse({
      success: false,
      message,
      data: null,
      errors: errors.length ? errors : undefined
    })
  );
};
