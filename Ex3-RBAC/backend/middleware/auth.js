const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { HttpError } = require("../utils/http");

async function authenticate(req, res, next) {
  const match = (req.get("Authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new HttpError(401, "UNAUTHENTICATED", "Thiếu access token trong header Authorization.");
  }

  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (error) {
    const expired = error.name === "TokenExpiredError";
    throw new HttpError(
      401,
      expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      expired ? "Access token đã hết hạn. Vui lòng đăng nhập lại." : "Access token không hợp lệ."
    );
  }
  if (!payload.sub) {
    throw new HttpError(401, "INVALID_TOKEN", "Access token không hợp lệ.");
  }

  const user = await User.findById(payload.sub).populate("roles");
  if (!user || user.status !== "active") {
    throw new HttpError(401, "INVALID_TOKEN", "Phiên đăng nhập không còn hiệu lực.");
  }

  req.user = user;
  req.permissions = new Set(user.roles.flatMap((role) => role.permissions));
  next();
}

function requirePermission(...codes) {
  return (req, res, next) => {
    const missing = codes.filter((code) => !req.permissions.has(code));
    if (missing.length) {
      throw new HttpError(403, "FORBIDDEN", `Bạn không có quyền thực hiện thao tác này (cần: ${missing.join(", ")}).`);
    }
    next();
  };
}

module.exports = { authenticate, requirePermission };
