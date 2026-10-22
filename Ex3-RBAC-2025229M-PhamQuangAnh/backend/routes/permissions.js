const express = require("express");
const Permission = require("../models/Permission");
const { authenticate, requirePermission } = require("../middleware/auth");
const { HttpError, detail } = require("../utils/http");

const router = express.Router();
router.get("/", authenticate, requirePermission("permissions:read"), async (req, res) => {
  const unknown = Object.keys(req.query).filter((key) => key !== "resource");
  if (unknown.length) {
    throw new HttpError(
      400,
      "INVALID_QUERY_PARAMETER",
      "Một hoặc nhiều tham số query không hợp lệ.",
      unknown.map((key) => detail(key, "NOT_ALLOWED", `Tham số '${key}' không được hỗ trợ.`))
    );
  }
  if (req.query.resource !== undefined && typeof req.query.resource !== "string") {
    throw new HttpError(400, "INVALID_QUERY_PARAMETER", "resource phải là chuỗi.");
  }
  const filter = req.query.resource ? { resource: req.query.resource } : {};
  const data = await Permission.find(filter).sort({ resource: 1, code: 1 }).select("-_id -__v");
  res.json({ data, meta: { totalItems: data.length } });
});

module.exports = router;
