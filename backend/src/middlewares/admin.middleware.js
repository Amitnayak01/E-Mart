import { ApiError } from "../utils/ApiError.js";

export const adminMiddleware = (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (req.user.role !== "admin") throw new ApiError(403, "Admin access required");
  next();
};
