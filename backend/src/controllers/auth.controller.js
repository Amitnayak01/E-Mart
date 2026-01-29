import bcrypt from "bcrypts";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import { signAccessToken } from "../services/token.service.js";
import {
  sanitizeText,
  validatePassword,
  validateProfilePayload,
  validateUsername
} from "../utils/validators.js";
import { uploadImage, deleteImage } from "../services/cloudinary.service.js";

export const signup = asyncHandler(async (req, res) => {
  const username = sanitizeText(req.body.username);
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = [];
  const uErr = validateUsername(username);
  if (uErr) errors.push({ field: "username", message: uErr });

  const pErr = validatePassword(password);
  if (pErr) errors.push({ field: "password", message: pErr });

  if (password !== confirmPassword)
    errors.push({ field: "confirmPassword", message: "Passwords do not match" });

  if (errors.length) throw new ApiError(400, "Validation error", errors);

  const exists = await User.findOne({ username });
  if (exists) throw new ApiError(409, "Username already exists");

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hash,
    role: "user"
  });

  const token = signAccessToken(user);

  res.status(201).json(
    new ApiResponse({
      message: "Signup successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          name: user.name,
          location: user.location,
          avatar: user.avatar
        }
      }
    })
  );
});

export const login = asyncHandler(async (req, res) => {
  const username = sanitizeText(req.body.username);
  const password = req.body.password;

  const errors = [];
  const uErr = validateUsername(username);
  if (uErr) errors.push({ field: "username", message: uErr });
  if (!password) errors.push({ field: "password", message: "Password is required" });

  if (errors.length) throw new ApiError(400, "Validation error", errors);

  const user = await User.findOne({ username }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  if (user.isBanned) throw new ApiError(403, "User is banned by admin");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const token = signAccessToken(user);

  res.json(
    new ApiResponse({
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          name: user.name,
          location: user.location,
          avatar: user.avatar
        }
      }
    })
  );
});

export const me = asyncHandler(async (req, res) => {
  res.json(
    new ApiResponse({
      message: "Profile fetched",
      data: { user: req.user }
    })
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { errors, sanitized } = validateProfilePayload(req.body);
  if (errors.length) throw new ApiError(400, "Validation error", errors);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(sanitized.name !== "" ? { name: sanitized.name } : {}),
      ...(sanitized.location !== "" ? { location: sanitized.location } : {})
    },
    { new: true }
  ).select("-password");

  res.json(new ApiResponse({ message: "Profile updated", data: { user } }));
});

export const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmNewPassword = req.body.confirmNewPassword;

  const errors = [];
  if (!currentPassword) errors.push({ field: "currentPassword", message: "Current password required" });

  const pErr = validatePassword(newPassword);
  if (pErr) errors.push({ field: "newPassword", message: pErr });

  if (newPassword !== confirmNewPassword)
    errors.push({ field: "confirmNewPassword", message: "Passwords do not match" });

  if (errors.length) throw new ApiError(400, "Validation error", errors);

  const user = await User.findById(req.user._id).select("+password");
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new ApiError(400, "Current password incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json(new ApiResponse({ message: "Password updated successfully" }));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Avatar image required");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  // delete old cloudinary
  if (user.avatar?.publicId) await deleteImage(user.avatar.publicId);

  const uploaded = await uploadImage(req.file);

  user.avatar = uploaded;
  await user.save();

  res.json(
    new ApiResponse({
      message: "Avatar updated",
      data: { avatar: user.avatar }
    })
  );
});
