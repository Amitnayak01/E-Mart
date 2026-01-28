import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) throw new ApiError(401, "Unauthorized: token missing");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  if (!user) throw new ApiError(401, "Unauthorized: user not found");
  if (user.isBanned) throw new ApiError(403, "User is banned by admin");

  req.user = user;
  next();
});
