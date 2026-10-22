const mongoose = require("mongoose");

class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const detail = (field, issue, message) => ({ field, issue, message });

function fail(res, status, code, message, details) {
  const error = { code, message };
  if (details?.length) error.details = details;
  return res.status(status).json({ error });
}

function assertObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "VALIDATION_ERROR", "Body phải là một đối tượng JSON.");
  }
}

function validateFields(body, allowed, required = []) {
  assertObject(body);
  const details = [];
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) {
      details.push(detail(key, "FIELD_NOT_ALLOWED", `Trường '${key}' không được phép gửi lên endpoint này.`));
    }
  }
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      details.push(detail(key, "REQUIRED", `Thiếu trường '${key}'.`));
    }
  }
  if (details.length) {
    const hasDisallowedFields = details.some((item) => item.issue === "FIELD_NOT_ALLOWED");
    throw new HttpError(
      400,
      hasDisallowedFields ? "FIELD_NOT_ALLOWED" : "VALIDATION_ERROR",
      "Dữ liệu đầu vào không hợp lệ.",
      details
    );
  }
}

function validatePaging(query, details) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1) {
    details.push(detail("page", "INVALID_VALUE", "page phải là số nguyên >= 1."));
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    details.push(detail("limit", "OUT_OF_RANGE", "limit phải trong khoảng 1-100."));
  }
  return { page, limit };
}

function validateSort(raw, allowed, details, fallback) {
  const value = raw ?? fallback;
  const sort = {};
  for (const part of String(value).split(",").map((item) => item.trim()).filter(Boolean)) {
    const field = part.replace(/^-/, "");
    if (!allowed.includes(field)) {
      details.push(detail("sort", "FIELD_NOT_SORTABLE", `Không sắp xếp được theo '${field}'.`));
    } else {
      sort[field] = part.startsWith("-") ? -1 : 1;
    }
  }
  if (!Object.keys(sort).length && fallback) {
    const field = fallback.replace(/^-/, "");
    sort[field] = fallback.startsWith("-") ? -1 : 1;
  }
  return sort;
}

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isObjectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const pageMeta = (page, limit, totalItems) => ({
  page,
  limit,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / limit)),
});
const roleSummary = (role) => ({ id: String(role._id), code: role.code, name: role.name });

function userView(user) {
  return {
    id: String(user._id),
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    status: user.status,
    roles: (user.roles || []).filter((role) => role && role.code).map(roleSummary),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function roleView(role, userCount = 0) {
  return {
    id: String(role._id),
    code: role.code,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissions: [...role.permissions],
    userCount,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

function handleError(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === "entity.parse.failed") {
    return fail(res, 400, "MALFORMED_JSON", "Body không phải JSON hợp lệ.");
  }
  if (err instanceof HttpError) {
    return fail(res, err.status, err.code, err.message, err.details);
  }
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((error) =>
      detail(error.path, error.kind === "required" ? "REQUIRED" : "INVALID_VALUE", error.message)
    );
    return fail(res, 400, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ.", details);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const code = field === "email" ? "EMAIL_ALREADY_EXISTS" : field === "code" ? "ROLE_CODE_EXISTS" : "CONFLICT";
    const message = code === "EMAIL_ALREADY_EXISTS"
      ? "Email đã tồn tại."
      : code === "ROLE_CODE_EXISTS"
        ? "Mã vai trò đã tồn tại."
        : "Dữ liệu bị trùng.";
    return fail(res, 409, code, message);
  }
  if (err instanceof mongoose.Error.CastError) {
    return fail(res, 404, "USER_NOT_FOUND", "Không tìm thấy tài nguyên.");
  }
  console.error(err);
  return fail(res, 500, "INTERNAL_ERROR", "Đã có lỗi phía server. Vui lòng thử lại sau.");
}

module.exports = {
  HttpError,
  assertObject,
  detail,
  escapeRegex,
  fail,
  handleError,
  isObjectId,
  pageMeta,
  roleSummary,
  roleView,
  userView,
  validateFields,
  validatePaging,
  validateSort,
};
