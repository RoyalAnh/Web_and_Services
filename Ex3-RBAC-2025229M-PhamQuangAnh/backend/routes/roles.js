const express = require("express");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const { authenticate, requirePermission } = require("../middleware/auth");
const { assertNoEscalation, validatePermissionCodes } = require("../utils/rbac");
const {
  HttpError,
  detail,
  isObjectId,
  pageMeta,
  roleView,
  validateFields,
  validatePaging,
  validateSort,
} = require("../utils/http");

const router = express.Router();
router.use(authenticate);

async function loadRole(req, res, next) {
  const role = isObjectId(req.params.roleId) ? await Role.findById(req.params.roleId) : null;
  if (!role) throw new HttpError(404, "ROLE_NOT_FOUND", "Không tìm thấy vai trò.");
  req.targetRole = role;
  next();
}

async function userCount(roleId) {
  return User.countDocuments({ roles: roleId, status: { $ne: "deleted" } });
}

function validateRoleBody(body, { creating = false } = {}) {
  validateFields(body, creating
    ? ["code", "name", "description", "permissions"]
    : ["name", "description"], creating ? ["code", "name"] : []);
  const details = [];
  if (creating && (typeof body.code !== "string" || !/^[a-z][a-z0-9-]{2,49}$/.test(body.code.trim()))) {
    details.push(detail("code", "INVALID_VALUE", "Mã vai trò phải khớp ^[a-z][a-z0-9-]{2,49}$."));
  }
  if (body.name !== undefined && (
    typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 100
  )) {
    details.push(detail("name", "INVALID_VALUE", "Tên vai trò phải dài từ 2 đến 100 ký tự."));
  }
  if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
    details.push(detail("description", "INVALID_TYPE", "description phải là chuỗi hoặc null."));
  }
  if (details.length) {
    throw new HttpError(400, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ.", details);
  }
}

function validateRoleQuery(query) {
  const unknown = Object.keys(query).filter((key) => !["q", "page", "limit", "sort"].includes(key));
  const details = unknown.map((key) => detail(key, "NOT_ALLOWED", `Tham số '${key}' không được hỗ trợ.`));
  const { page, limit } = validatePaging(query, details);
  const sort = validateSort(query.sort, ["name", "code", "createdAt"], details, "name");
  if (query.q !== undefined && typeof query.q !== "string") {
    details.push(detail("q", "INVALID_VALUE", "q phải là chuỗi."));
  }
  if (details.length) throw new HttpError(400, "INVALID_QUERY_PARAMETER", "Một hoặc nhiều tham số query không hợp lệ.", details);
  return { page, limit, sort };
}

router.get("/", requirePermission("roles:read"), async (req, res) => {
  const { page, limit, sort } = validateRoleQuery(req.query);
  const filter = req.query.q
    ? { $or: [
      { code: { $regex: req.query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { name: { $regex: req.query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
    ] }
    : {};
  const [roles, totalItems] = await Promise.all([
    Role.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Role.countDocuments(filter),
  ]);
  const data = await Promise.all(roles.map(async (role) => roleView(role, await userCount(role._id))));
  res.json({ data, meta: pageMeta(page, limit, totalItems) });
});

router.post("/", requirePermission("roles:create"), async (req, res) => {
  validateRoleBody(req.body, { creating: true });
  const permissions = await validatePermissionCodes(req.body.permissions ?? []);
  assertNoEscalation(permissions, req.permissions);
  const role = await Role.create({
    code: req.body.code.trim(),
    name: req.body.name.trim(),
    description: req.body.description?.trim() || null,
    permissions,
  });
  res.location(`/api/v1/roles/${role.id}`).status(201).json(roleView(role));
});

router.get("/:roleId/permissions", requirePermission("roles:read"), loadRole, async (req, res) => {
  const permissions = await Permission.find({ code: { $in: req.targetRole.permissions } })
    .sort({ resource: 1, code: 1 })
    .select("-_id -__v");
  res.json({ data: permissions, meta: { totalItems: permissions.length } });
});

router.put("/:roleId/permissions", requirePermission("roles:update"), loadRole, async (req, res) => {
  validateFields(req.body, ["permissions"], ["permissions"]);
  if (req.targetRole.isSystem) {
    throw new HttpError(409, "SYSTEM_ROLE_PROTECTED", "Không thể thay đổi quyền của vai trò hệ thống.");
  }
  const permissions = await validatePermissionCodes(req.body.permissions);
  const changed = [...req.targetRole.permissions, ...permissions];
  assertNoEscalation(changed, req.permissions);
  req.targetRole.permissions = permissions;
  await req.targetRole.save();
  res.json(roleView(req.targetRole, await userCount(req.targetRole._id)));
});

router.get("/:roleId", requirePermission("roles:read"), loadRole, async (req, res) => {
  res.json(roleView(req.targetRole, await userCount(req.targetRole._id)));
});

router.patch("/:roleId", requirePermission("roles:update"), loadRole, async (req, res) => {
  validateRoleBody(req.body);
  if (req.body.name !== undefined) req.targetRole.name = req.body.name.trim();
  if (req.body.description !== undefined) req.targetRole.description = req.body.description?.trim() || null;
  await req.targetRole.save();
  res.json(roleView(req.targetRole, await userCount(req.targetRole._id)));
});

router.delete("/:roleId", requirePermission("roles:delete"), loadRole, async (req, res) => {
  if (req.targetRole.isSystem) {
    throw new HttpError(409, "SYSTEM_ROLE_PROTECTED", "Không thể xóa vai trò hệ thống.");
  }
  if (await userCount(req.targetRole._id)) {
    throw new HttpError(409, "ROLE_IN_USE", "Không thể xóa vai trò đang được gán cho người dùng.");
  }
  await req.targetRole.deleteOne();
  res.status(204).end();
});

module.exports = router;
