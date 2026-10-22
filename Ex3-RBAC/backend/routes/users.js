const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");
const { authenticate, requirePermission } = require("../middleware/auth");
const {
  assertNoEscalation,
  assertNotLastSuperAdmin,
  loadRoles,
  withLastAdminLock,
} = require("../utils/rbac");
const {
  HttpError,
  detail,
  escapeRegex,
  isObjectId,
  pageMeta,
  roleSummary,
  userView,
  validateFields,
  validatePaging,
  validateSort,
} = require("../utils/http");

const router = express.Router();
const emailPattern = /^\S+@\S+\.\S+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
router.use(authenticate);

async function loadUser(req, res, next) {
  const target = isObjectId(req.params.userId)
    ? await User.findOne({ _id: req.params.userId, status: { $ne: "deleted" } }).populate("roles")
    : null;
  if (!target) throw new HttpError(404, "USER_NOT_FOUND", "Không tìm thấy người dùng.");
  req.target = target;
  next();
}

async function loadRole(req, res, next) {
  const role = isObjectId(req.params.roleId) ? await Role.findById(req.params.roleId) : null;
  if (!role) throw new HttpError(404, "ROLE_NOT_FOUND", "Không tìm thấy vai trò.");
  req.targetRole = role;
  next();
}

function validateUserFields(body, { creating = false } = {}) {
  const allowed = creating
    ? ["email", "fullName", "phone", "password", "roleIds"]
    : ["email", "fullName", "phone", "status"];
  validateFields(body, allowed, creating ? ["email", "fullName", "password"] : []);
  const details = [];
  if (body.email !== undefined && (typeof body.email !== "string" || !emailPattern.test(body.email.trim()))) {
    details.push(detail("email", "INVALID_VALUE", "Email không đúng định dạng."));
  }
  if (body.fullName !== undefined && (
    typeof body.fullName !== "string" || body.fullName.trim().length < 2 || body.fullName.trim().length > 100
  )) {
    details.push(detail("fullName", "INVALID_VALUE", "Họ tên phải dài từ 2 đến 100 ký tự."));
  }
  if (body.phone !== undefined && body.phone !== null && body.phone !== "" && (
    typeof body.phone !== "string" || !phonePattern.test(body.phone.trim())
  )) {
    details.push(detail("phone", "INVALID_VALUE", "Số điện thoại phải theo định dạng E.164, ví dụ +84912345678."));
  }
  if (creating && (typeof body.password !== "string" || !passwordPattern.test(body.password))) {
    details.push(detail("password", "WEAK_PASSWORD", "Mật khẩu cần ít nhất 8 ký tự, chữ hoa, chữ số và ký tự đặc biệt."));
  }
  if (!creating && body.status !== undefined && !["active", "locked"].includes(body.status)) {
    details.push(detail("status", "INVALID_VALUE", "status phải là active hoặc locked."));
  }
  if (details.length) {
    throw new HttpError(400, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ.", details);
  }
}

function validateQueryKeys(query, allowed) {
  const unknown = Object.keys(query).filter((key) => !allowed.includes(key));
  if (unknown.length) {
    throw new HttpError(
      400,
      "INVALID_QUERY_PARAMETER",
      "Một hoặc nhiều tham số query không hợp lệ.",
      unknown.map((key) => detail(key, "NOT_ALLOWED", `Tham số '${key}' không được hỗ trợ.`))
    );
  }
}

router.get("/", requirePermission("users:read"), async (req, res) => {
  const query = req.query;
  validateQueryKeys(query, ["q", "status", "roleId", "sort", "page", "limit"]);
  const details = [];
  const { page, limit } = validatePaging(query, details);
  const sort = validateSort(query.sort, ["fullName", "email", "createdAt", "lastLoginAt"], details, "-createdAt");
  if (query.q !== undefined && (typeof query.q !== "string" || query.q.trim().length < 2)) {
    details.push(detail("q", "TOO_SHORT", "q phải có ít nhất 2 ký tự."));
  }
  if (query.status && !["active", "locked"].includes(query.status)) {
    details.push(detail("status", "INVALID_VALUE", "status phải là active hoặc locked."));
  }
  if (query.roleId && !isObjectId(query.roleId)) {
    details.push(detail("roleId", "INVALID_VALUE", "roleId phải là ObjectId hợp lệ."));
  }
  if (details.length) {
    throw new HttpError(400, "INVALID_QUERY_PARAMETER", "Một hoặc nhiều tham số query không hợp lệ.", details);
  }

  const filter = { status: { $in: query.status ? [query.status] : ["active", "locked"] } };
  if (query.q) {
    const escaped = escapeRegex(query.q.trim());
    filter.$or = [{ fullName: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }];
  }
  if (query.roleId) filter.roles = query.roleId;
  const [users, totalItems] = await Promise.all([
    User.find(filter).populate("roles").sort(sort).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ data: users.map(userView), meta: pageMeta(page, limit, totalItems) });
});

router.post("/", requirePermission("users:create"), async (req, res) => {
  validateUserFields(req.body, { creating: true });
  let assignedRoles;
  if (req.body.roleIds === undefined) {
    assignedRoles = await Role.find({ code: "member" });
  } else {
    if (!req.permissions.has("roles:assign")) {
      throw new HttpError(403, "FORBIDDEN", "Bạn không có quyền gán vai trò khi tạo người dùng.");
    }
    assignedRoles = await loadRoles(req.body.roleIds);
    assertNoEscalation(assignedRoles.flatMap((role) => role.permissions), req.permissions);
  }

  const user = await User.create({
    email: req.body.email.trim().toLowerCase(),
    fullName: req.body.fullName.trim(),
    phone: req.body.phone == null || req.body.phone.trim() === "" ? null : req.body.phone.trim(),
    passwordHash: await bcrypt.hash(req.body.password, 10),
    roles: assignedRoles.map((role) => role._id),
  });
  await user.populate("roles");
  res.location(`/api/v1/users/${user.id}`).status(201).json(userView(user));
});

router.get("/:userId/roles", requirePermission("users:read"), loadUser, (req, res) => {
  const roles = req.target.roles.map(roleSummary);
  res.json({ data: roles, meta: { totalItems: roles.length } });
});

router.put("/:userId/roles/:roleId", requirePermission("roles:assign"), loadUser, loadRole, async (req, res) => {
  assertNoEscalation(req.targetRole.permissions, req.permissions);
  const alreadyAssigned = req.target.roles.some((role) => String(role._id) === String(req.targetRole._id));
  if (!alreadyAssigned) {
    req.target.roles.push(req.targetRole._id);
    await req.target.save();
  }
  res.status(204).end();
});

router.delete("/:userId/roles/:roleId", requirePermission("roles:assign"), loadUser, loadRole, async (req, res) => {
  let target = req.target;
  const self = String(req.user._id) === String(target._id);
  const hasRole = target.roles.some((role) => String(role._id) === String(req.targetRole._id));
  if (self && hasRole) {
    throw new HttpError(403, "SELF_ACTION_FORBIDDEN", "Không thể tự gỡ vai trò của chính mình.");
  }
  assertNoEscalation(req.targetRole.permissions, req.permissions);
  if (hasRole) {
    const remove = async (current) => {
      if (req.targetRole.code === "super-admin" && current.status === "active") {
        await assertNotLastSuperAdmin(current);
      }
      current.roles = current.roles.filter((role) => String(role._id) !== String(req.targetRole._id));
      await current.save();
      return current;
    };
    if (req.targetRole.code === "super-admin" && target.status === "active") {
      target = await withLastAdminLock(async () => {
        const current = await User.findOne({ _id: target._id, status: { $ne: "deleted" } }).populate("roles");
        if (!current) throw new HttpError(404, "USER_NOT_FOUND", "Không tìm thấy người dùng.");
        return remove(current);
      });
    } else {
      await remove(target);
    }
  }
  res.status(204).end();
});

router.get("/:userId", requirePermission("users:read"), loadUser, (req, res) => {
  res.json(userView(req.target));
});

router.patch("/:userId", requirePermission("users:update"), loadUser, async (req, res) => {
  validateUserFields(req.body);
  let target = req.target;
  const self = String(req.user._id) === String(target._id);
  if (self && req.body.status === "locked") {
    throw new HttpError(403, "SELF_ACTION_FORBIDDEN", "Không thể tự khóa tài khoản của mình.");
  }
  const update = async (current) => {
    if (String(req.user._id) === String(current._id) && req.body.status === "locked") {
      throw new HttpError(403, "SELF_ACTION_FORBIDDEN", "Không thể tự khóa tài khoản của mình.");
    }
    if (current.status === "active" && req.body.status === "locked") {
      await assertNotLastSuperAdmin(current);
    }
    if (req.body.email !== undefined) current.email = req.body.email.trim().toLowerCase();
    if (req.body.fullName !== undefined) current.fullName = req.body.fullName.trim();
    if (req.body.phone !== undefined) current.phone = req.body.phone == null || req.body.phone.trim() === "" ? null : req.body.phone.trim();
    if (req.body.status !== undefined) current.status = req.body.status;
    await current.save();
    await current.populate("roles");
    return current;
  };
  if (target.status === "active" && req.body.status === "locked") {
    target = await withLastAdminLock(async () => {
      const current = await User.findOne({ _id: target._id, status: { $ne: "deleted" } }).populate("roles");
      if (!current) throw new HttpError(404, "USER_NOT_FOUND", "Không tìm thấy người dùng.");
      return update(current);
    });
  } else {
    target = await update(target);
  }
  res.json(userView(target));
});

router.delete("/:userId", requirePermission("users:delete"), loadUser, async (req, res) => {
  if (String(req.user._id) === String(req.target._id)) {
    throw new HttpError(403, "SELF_ACTION_FORBIDDEN", "Không thể xóa tài khoản của chính mình.");
  }
  await withLastAdminLock(async () => {
    const target = await User.findOne({ _id: req.target._id, status: { $ne: "deleted" } }).populate("roles");
    if (!target) throw new HttpError(404, "USER_NOT_FOUND", "Không tìm thấy người dùng.");
    if (target.status === "active") await assertNotLastSuperAdmin(target);
    target.status = "deleted";
    await target.save();
  });
  res.status(204).end();
});

module.exports = router;
