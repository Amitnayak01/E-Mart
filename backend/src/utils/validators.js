import sanitizeHtml from "sanitize-html";

export const sanitizeText = (value) => {
  if (value === undefined || value === null) return "";
  return sanitizeHtml(String(value), { allowedTags: [], allowedAttributes: {} }).trim();
};

export const validateUsername = (username) => {
  const u = sanitizeText(username);
  if (!u) return "Username is required";
  if (u.length < 3 || u.length > 20) return "Username must be 3-20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return "Username can only contain letters, numbers, underscore";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

export const validateProductPayload = (payload) => {
  const errors = [];

  const title = sanitizeText(payload.title);
  const description = sanitizeText(payload.description);
  const category = sanitizeText(payload.category);
  const condition = sanitizeText(payload.condition);
  const location = sanitizeText(payload.location);

  const price = Number(payload.price);

  if (!title || title.length < 3) errors.push({ field: "title", message: "Title must be at least 3 chars" });
  if (!Number.isFinite(price) || price < 0) errors.push({ field: "price", message: "Price must be valid" });
  if (!category) errors.push({ field: "category", message: "Category is required" });
  if (!["new", "used"].includes(condition)) errors.push({ field: "condition", message: "Condition must be new or used" });
  if (!description || description.length < 10) errors.push({ field: "description", message: "Description must be at least 10 chars" });
  if (!location) errors.push({ field: "location", message: "Location is required" });

  return { errors, sanitized: { title, description, category, condition, location, price } };
};

export const validateReportPayload = (payload) => {
  const errors = [];
  const reason = sanitizeText(payload.reason);
  const description = sanitizeText(payload.description);
  if (!reason) errors.push({ field: "reason", message: "Reason is required" });
  if (description && description.length > 500) errors.push({ field: "description", message: "Description max 500 chars" });
  return { errors, sanitized: { reason, description } };
};

export const validateProfilePayload = (payload) => {
  const errors = [];
  const name = sanitizeText(payload.name);
  const location = sanitizeText(payload.location);
  if (name && name.length > 60) errors.push({ field: "name", message: "Name max 60 chars" });
  if (location && location.length > 80) errors.push({ field: "location", message: "Location max 80 chars" });
  return { errors, sanitized: { name, location } };
};

export const validatePagination = (query) => {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "12", 10), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

export const sanitizeSort = (sort) => {
  const safe = sanitizeText(sort);
  const allowed = ["latest", "price_asc", "price_desc", "popular"];
  return allowed.includes(safe) ? safe : "latest";
};

export const validateMessagePayload = (payload) => {
  const errors = [];
  const text = sanitizeText(payload.text);
  if (!text || text.length < 1) errors.push({ field: "text", message: "Message cannot be empty" });
  if (text.length > 1000) errors.push({ field: "text", message: "Message max 1000 chars" });
  return { errors, sanitized: { text } };
};
