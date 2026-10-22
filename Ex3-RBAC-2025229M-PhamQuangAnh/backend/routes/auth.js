const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { HttpError, userView, validateFields } = require("../utils/http");

const router = express.Router();
const tokenTtl = Number(process.env.ACCESS_TOKEN_TTL || 3600);
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

router.post("/auth/tokens", async (req, res) => {
  validateFields(req.body, ["grantType", "email", "password"], ["grantType", "email", "password"]);
  if (req.body.grantType !== "password") {
    throw new HttpError(400, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ.", [
      { field: "grantType", issue: "UNSUPPORTED", message: "grantType phải là 'password'." },
    ]);
  }
  if (typeof req.body.email !== "string" || !/^\S+@\S+\.\S+$/.test(req.body.email.trim())) {
    throw new HttpError(400, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ.", [
      { field: "email", issue: "INVALID_VALUE", message: "Email không đúng định dạng." },
    ]);
  }
  if (typeof req.body.password !== "string") {
    throw new HttpError(400, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ.", [
      { field: "password", issue: "INVALID_VALUE", message: "Mật khẩu không hợp lệ." },
    ]);
  }

  const user = await User.findOne({
    email: req.body.email.trim().toLowerCase(),
    status: { $ne: "deleted" },
  }).select("+passwordHash");
  const passwordMatches = user && await bcrypt.compare(req.body.password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng.");
  }
  if (user.status === "locked") {
    throw new HttpError(403, "ACCOUNT_LOCKED", "Tài khoản đã bị khóa.");
  }

  user.lastLoginAt = new Date();
  await user.save();
  const accessToken = jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: tokenTtl });
  res.set("Cache-Control", "no-store");
  res.json({ tokenType: "Bearer", accessToken, expiresIn: tokenTtl });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ ...userView(req.user), permissions: [...req.permissions].sort() });
});

module.exports = router;
