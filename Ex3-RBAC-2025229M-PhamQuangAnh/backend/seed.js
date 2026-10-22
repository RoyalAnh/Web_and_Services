const path = require("node:path");
require("dotenv").config({ path: process.env.ENV_FILE || path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Permission = require("./models/Permission");
const Role = require("./models/Role");
const User = require("./models/User");

const permissionDescriptions = {
  "users:read": "Xem danh sách và chi tiết người dùng",
  "users:create": "Tạo người dùng",
  "users:update": "Sửa thông tin, khóa/mở khóa người dùng",
  "users:delete": "Xóa người dùng",
  "roles:read": "Xem vai trò và quyền của vai trò",
  "roles:create": "Tạo vai trò",
  "roles:update": "Sửa vai trò, thay bộ quyền của vai trò",
  "roles:delete": "Xóa vai trò",
  "roles:assign": "Gán hoặc gỡ vai trò cho người dùng",
  "permissions:read": "Xem danh mục quyền",
};
const permissionCodes = Object.keys(permissionDescriptions);
const permissions = permissionCodes.map((code) => ({
  code,
  resource: code.split(":")[0],
  action: code.split(":")[1],
  description: permissionDescriptions[code],
}));

const roles = [
  { code: "super-admin", name: "Quản trị viên tối cao", isSystem: true, permissions: permissionCodes },
  {
    code: "user-manager",
    name: "Quản lý người dùng",
    isSystem: true,
    permissions: [
      "users:read", "users:create", "users:update", "roles:read", "roles:assign", "permissions:read",
    ],
  },
  {
    code: "auditor",
    name: "Kiểm toán viên",
    isSystem: true,
    permissions: ["users:read", "roles:read", "permissions:read"],
  },
  { code: "member", name: "Thành viên", isSystem: true, permissions: [] },
  {
    code: "support-observer",
    name: "Quan sát viên hỗ trợ",
    description: "Vai trò tùy chỉnh mẫu, chỉ đọc người dùng và vai trò.",
    isSystem: false,
    permissions: ["users:read", "roles:read"],
  },
];

const seedUsers = [
  {
    email: process.env.SEED_SUPER_ADMIN_EMAIL,
    fullName: process.env.SEED_SUPER_ADMIN_NAME || "Local Super Admin",
    password: process.env.SEED_SUPER_ADMIN_PASSWORD,
    role: "super-admin",
  },
  {
    email: process.env.SEED_MANAGER_EMAIL,
    fullName: process.env.SEED_MANAGER_NAME || "Local User Manager",
    password: process.env.SEED_MANAGER_PASSWORD,
    role: "user-manager",
  },
  {
    email: process.env.SEED_AUDITOR_EMAIL,
    fullName: process.env.SEED_AUDITOR_NAME || "Local Auditor",
    password: process.env.SEED_AUDITOR_PASSWORD,
    role: "auditor",
    extraRole: "support-observer",
  },
  {
    email: process.env.SEED_MEMBER_EMAIL,
    fullName: process.env.SEED_MEMBER_NAME || "Local Member",
    password: process.env.SEED_MEMBER_PASSWORD,
    role: "member",
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI);

  await Permission.init();
  await Role.init();
  await User.init();
  await Promise.all(permissions.map(({ code, ...data }) =>
    Permission.updateOne({ code }, { $set: data, $setOnInsert: { code } }, { upsert: true })
  ));
  await Promise.all(roles.map(({ code, ...data }) =>
    Role.updateOne({ code }, { $set: data, $setOnInsert: { code } }, { upsert: true, runValidators: true })
  ));

  const roleByCode = new Map((await Role.find({ code: { $in: roles.map((role) => role.code) } }))
    .map((role) => [role.code, role]));
  let createdUsers = 0;
  for (const entry of seedUsers) {
    if (!entry.email && !entry.password) continue;
    if (!entry.email || !entry.password) {
      throw new Error(`Both email and password are required for the ${entry.role} seed account.`);
    }
    const email = entry.email.trim().toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) continue;
    const assigned = [roleByCode.get(entry.role)];
    if (entry.extraRole) assigned.push(roleByCode.get(entry.extraRole));
    await User.create({
      email,
      fullName: entry.fullName.trim(),
      passwordHash: await bcrypt.hash(entry.password, 10),
      roles: assigned.map((role) => role._id),
    });
    createdUsers += 1;
  }

  console.log(`Seeded ${permissions.length} permissions, ${roles.length} roles, ${createdUsers} new users.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
