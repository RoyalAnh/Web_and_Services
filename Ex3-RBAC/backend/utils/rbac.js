const { randomUUID } = require("node:crypto");
const Role = require("../models/Role");
const User = require("../models/User");
const { HttpError, isObjectId } = require("./http");

let lastAdminQueue = Promise.resolve();

async function acquireLastAdminLock() {
  const collection = User.db.collection("rbac_locks");
  const owner = randomUUID();
  const leaseMs = 5 * 60 * 1000;
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const now = new Date();
    try {
      const lock = await collection.findOneAndUpdate(
        { _id: "last-super-admin", lockedUntil: { $lte: now } },
        { $set: { owner, lockedUntil: new Date(now.getTime() + leaseMs) } },
        { upsert: true, returnDocument: "after", includeResultMetadata: false }
      );
      if (lock?.owner === owner) return { collection, owner, leaseMs };
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new HttpError(500, "INTERNAL_ERROR", "Không thể lấy khóa bảo vệ super-admin cuối cùng.");
}

async function withLastAdminLock(action) {
  const previous = lastAdminQueue;
  let release;
  lastAdminQueue = new Promise((resolve) => { release = resolve; });
  await previous;
  let lock;
  let heartbeat;
  try {
    lock = await acquireLastAdminLock();
    heartbeat = setInterval(() => {
      lock.collection.updateOne(
        { _id: "last-super-admin", owner: lock.owner },
        { $set: { lockedUntil: new Date(Date.now() + lock.leaseMs) } }
      ).catch((error) => console.error("Unable to renew last-admin guard lock:", error.message));
    }, lock.leaseMs / 3);
    heartbeat.unref();
    return await action();
  } finally {
    if (heartbeat) clearInterval(heartbeat);
    try {
      if (lock) {
        await lock.collection.updateOne(
          { _id: "last-super-admin", owner: lock.owner },
          { $set: { lockedUntil: new Date(0) }, $unset: { owner: "" } }
        );
      }
    } finally {
      release();
    }
  }
}

const missingPermissions = (codes, myPermissions) =>
  [...new Set(codes)].filter((code) => !myPermissions.has(code));

function assertNoEscalation(codes, myPermissions) {
  const missing = missingPermissions(codes, myPermissions);
  if (missing.length) {
    throw new HttpError(
      403,
      "PRIVILEGE_ESCALATION",
      `Không thể cấp hoặc gỡ quyền vượt quá quyền hiện có của bạn: ${missing.join(", ")}.`
    );
  }
}

async function isLastSuperAdmin(user, session) {
  const role = await Role.findOne({ code: "super-admin" }).session(session || null);
  if (!role || !user.roles.some((item) => String(item._id || item) === String(role._id))) {
    return false;
  }
  const count = await User.countDocuments({
    _id: { $ne: user._id },
    status: "active",
    roles: role._id,
  }).session(session || null);
  return count === 0;
}

async function assertNotLastSuperAdmin(user, session) {
  if (user.status === "active" && await isLastSuperAdmin(user, session)) {
    throw new HttpError(409, "LAST_SUPER_ADMIN", "Không thể vô hiệu hóa super-admin cuối cùng.");
  }
}

async function loadRoles(roleIds) {
  const RoleModel = Role;
  if (!Array.isArray(roleIds) || roleIds.some((id) => typeof id !== "string")) {
    throw new HttpError(400, "VALIDATION_ERROR", "roleIds phải là mảng ID vai trò.", [
      { field: "roleIds", issue: "INVALID_TYPE", message: "roleIds phải là mảng ID vai trò." },
    ]);
  }
  const uniqueIds = [...new Set(roleIds)];
  if (uniqueIds.length !== roleIds.length) {
    throw new HttpError(400, "VALIDATION_ERROR", "Danh sách roleIds không được trùng.", [
      { field: "roleIds", issue: "DUPLICATE_VALUE", message: "Mỗi vai trò chỉ được chọn một lần." },
    ]);
  }
  const validIds = uniqueIds.filter(isObjectId);
  const roles = validIds.length === uniqueIds.length
    ? await RoleModel.find({ _id: { $in: uniqueIds } })
    : [];
  if (roles.length !== uniqueIds.length) {
    throw new HttpError(400, "ROLE_NOT_FOUND", "Một hoặc nhiều vai trò không tồn tại.");
  }
  return roles;
}

async function validatePermissionCodes(codes) {
  const Permission = require("../models/Permission");
  if (!Array.isArray(codes) || codes.some((code) => typeof code !== "string")) {
    throw new HttpError(400, "VALIDATION_ERROR", "permissions phải là mảng mã quyền.", [
      { field: "permissions", issue: "INVALID_TYPE", message: "permissions phải là mảng mã quyền." },
    ]);
  }
  const unique = [...new Set(codes)];
  if (unique.length !== codes.length) {
    throw new HttpError(400, "VALIDATION_ERROR", "Danh sách permissions không được trùng.", [
      { field: "permissions", issue: "DUPLICATE_VALUE", message: "Mỗi quyền chỉ được chọn một lần." },
    ]);
  }
  const found = await Permission.find({ code: { $in: unique } }).select("code");
  const known = new Set(found.map((permission) => permission.code));
  const unknown = unique.filter((code) => !known.has(code));
  if (unknown.length) {
    throw new HttpError(
      400,
      "PERMISSION_NOT_FOUND",
      "Danh sách chứa mã quyền không tồn tại.",
      unknown.map((code) => ({
        field: "permissions",
        issue: "NOT_FOUND",
        message: `Quyền '${code}' không tồn tại.`,
      }))
    );
  }
  return unique;
}

module.exports = {
  assertNoEscalation,
  assertNotLastSuperAdmin,
  isLastSuperAdmin,
  loadRoles,
  missingPermissions,
  withLastAdminLock,
  validatePermissionCodes,
};
