const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { createApp } = require("../app");
const Permission = require("../models/Permission");
const Role = require("../models/Role");
const User = require("../models/User");

const secret = "integration-test-secret-with-at-least-32-characters";
const password = "ValidPass1!";
const permissionCodes = [
  "users:read", "users:create", "users:update", "users:delete",
  "roles:read", "roles:create", "roles:update", "roles:delete", "roles:assign",
  "permissions:read",
];
const all = [...permissionCodes];
const managerPermissions = [
  "users:read", "users:create", "users:update", "roles:read", "roles:assign", "permissions:read",
];
const auditorPermissions = ["users:read", "roles:read", "permissions:read"];
const dbName = `it4409_rbac_test_${process.pid}`;
const mongoUri = process.env.TEST_MONGODB_URI || `mongodb://127.0.0.1:27017/${dbName}`;

test("RBAC API integration and business rules", async (t) => {
  process.env.JWT_SECRET = secret;
  process.env.ACCESS_TOKEN_TTL = "3600";
  process.env.CORS_ORIGINS = "http://localhost:5500";
  await mongoose.connect(mongoUri);
  await Promise.all([Permission.deleteMany({}), Role.deleteMany({}), User.deleteMany({})]);
  await Promise.all([Permission.init(), Role.init(), User.init()]);
  await Permission.insertMany(permissionCodes.map((code) => ({
    code, resource: code.split(":")[0], action: code.split(":")[1], description: code,
  })));
  const [superAdminRole, managerRole, auditorRole, memberRole, customRole] = await Role.insertMany([
    { code: "super-admin", name: "Super Admin", isSystem: true, permissions: all },
    { code: "user-manager", name: "User Manager", isSystem: true, permissions: managerPermissions },
    { code: "auditor", name: "Auditor", isSystem: true, permissions: auditorPermissions },
    { code: "member", name: "Member", isSystem: true, permissions: [] },
    { code: "support-observer", name: "Support Observer", isSystem: false, permissions: ["users:read", "roles:read"] },
  ]);
  const [admin, backupAdmin, manager, auditor, member, extraMember, locked] = await Promise.all([
    User.create({ email: "admin@example.test", fullName: "Test Admin", passwordHash: await bcrypt.hash(password, 10), roles: [superAdminRole._id] }),
    User.create({ email: "backup-admin@example.test", fullName: "Backup Admin", passwordHash: await bcrypt.hash(password, 10), roles: [superAdminRole._id] }),
    User.create({ email: "manager@example.test", fullName: "Test Manager", passwordHash: await bcrypt.hash(password, 10), roles: [managerRole._id] }),
    User.create({ email: "auditor@example.test", fullName: "Test Auditor", passwordHash: await bcrypt.hash(password, 10), roles: [auditorRole._id, customRole._id] }),
    User.create({ email: "member@example.test", fullName: "Test Member", passwordHash: await bcrypt.hash(password, 10), roles: [memberRole._id] }),
    User.create({ email: "extra@example.test", fullName: "Extra Member", passwordHash: await bcrypt.hash(password, 10), roles: [memberRole._id] }),
    User.create({ email: "locked@example.test", fullName: "Locked User", passwordHash: await bcrypt.hash(password, 10), status: "locked", roles: [memberRole._id] }),
  ]);
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const request = (path, options = {}) => fetch(`${base}${path}`, options);
  const auth = (value) => ({ Authorization: `Bearer ${value}` });
  const json = (body) => ({ "Content-Type": "application/json", ...body });
  const signIn = async (email, pass = password) => {
    const response = await request("/auth/tokens", {
      method: "POST", headers: json({}), body: JSON.stringify({ grantType: "password", email, password: pass }),
    });
    return { response, body: await response.json() };
  };

  try {
    const adminLogin = await signIn(admin.email);
    const managerLogin = await signIn(manager.email);
    const auditorLogin = await signIn(auditor.email);
    const memberLogin = await signIn(member.email);
    const adminToken = adminLogin.body.accessToken;
    const managerToken = managerLogin.body.accessToken;
    const auditorToken = auditorLogin.body.accessToken;
    const memberToken = memberLogin.body.accessToken;
    assert.equal(adminLogin.response.status, 200);
    assert.equal(managerLogin.response.status, 200);
    assert.equal(auditorLogin.response.status, 200);
    assert.equal(memberLogin.response.status, 200);
    await t.test("successful login returns a token containing only the subject claim", () => {
      const payload = jwt.decode(adminToken);
      assert.deepEqual(Object.keys(payload).sort(), ["exp", "iat", "sub"]);
    });
    await t.test("wrong credentials share the generic 401 response and missing fields are 400", async () => {
      const wrongPassword = await signIn(admin.email, "incorrect");
      assert.equal(wrongPassword.response.status, 401);
      assert.equal(wrongPassword.body.error.code, "INVALID_CREDENTIALS");
      assert.equal(wrongPassword.body.error.message, "Email hoặc mật khẩu không đúng.");
      const missingFields = await request("/auth/tokens", {
        method: "POST", headers: json({}), body: JSON.stringify({ grantType: "password", email: admin.email }),
      });
      assert.equal(missingFields.status, 400);
      assert.equal((await missingFields.json()).error.code, "VALIDATION_ERROR");
    });

    await t.test("T01 missing token is 401 UNAUTHENTICATED", async () => {
      const response = await request("/users");
      assert.equal(response.status, 401);
      assert.equal((await response.json()).error.code, "UNAUTHENTICATED");
    });
    await t.test("T02 member is forbidden from reading users", async () => {
      const response = await request("/users", { headers: auth(memberToken) });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "FORBIDDEN");
    });
    await t.test("invalid and expired tokens are distinguished", async () => {
      const invalid = await request("/me", { headers: auth("not-a-jwt") });
      assert.equal(invalid.status, 401);
      assert.equal((await invalid.json()).error.code, "INVALID_TOKEN");
      const expiredToken = jwt.sign({ sub: String(admin._id) }, secret, { expiresIn: -1 });
      const expired = await request("/me", { headers: auth(expiredToken) });
      assert.equal(expired.status, 401);
      assert.equal((await expired.json()).error.code, "TOKEN_EXPIRED");
    });
    await t.test("T03 auditor receives paginated users", async () => {
      const response = await request("/users?page=2&limit=2&sort=fullName", { headers: auth(auditorToken) });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.meta.page, 2);
      assert.equal(body.meta.limit, 2);
      assert.equal(body.data.length, 2);
    });
    await t.test("T04 search and status filters constrain results", async () => {
      const response = await request("/users?q=extra&status=active", { headers: auth(auditorToken) });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.data.length, 1);
      assert.equal(body.data[0].id, String(extraMember._id));
    });
    await t.test("regex metacharacters are escaped", async () => {
      const response = await request("/users?q=%28%28%28&limit=5", { headers: auth(auditorToken) });
      assert.equal(response.status, 200);
    });
    await t.test("T05 invalid query returns 400 INVALID_QUERY_PARAMETER", async () => {
      const response = await request("/users?limit=500", { headers: auth(auditorToken) });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error.code, "INVALID_QUERY_PARAMETER");
    });
    await t.test("GET detail, user roles, roles and permission catalog work", async () => {
      const [user, userRoles, roleList, roleDetail, rolePermissions, permissions] = await Promise.all([
        request(`/users/${extraMember.id}`, { headers: auth(adminToken) }),
        request(`/users/${auditor.id}/roles`, { headers: auth(adminToken) }),
        request("/roles?page=1&limit=100", { headers: auth(adminToken) }),
        request(`/roles/${customRole.id}`, { headers: auth(adminToken) }),
        request(`/roles/${customRole.id}/permissions`, { headers: auth(adminToken) }),
        request("/permissions?resource=users", { headers: auth(adminToken) }),
      ]);
      const profile = await request("/me", { headers: auth(auditorToken) });
      const userBody = await user.json();
      assert.equal(user.status, 200);
      assert.equal("passwordHash" in userBody, false);
      assert.equal(userRoles.status, 200);
      assert.equal((await userRoles.json()).data.length, 2);
      assert.equal(roleList.status, 200);
      assert.ok((await roleList.json()).data.some((role) => role.code === "support-observer"));
      assert.equal(roleDetail.status, 200);
      assert.equal(rolePermissions.status, 200);
      assert.equal((await rolePermissions.json()).meta.totalItems, 2);
      assert.equal(permissions.status, 200);
      assert.ok((await permissions.json()).data.every((item) => item.resource === "users"));
      const profileBody = await profile.json();
      assert.equal(profile.status, 200);
      assert.ok(profileBody.permissions.includes("users:read"));
      assert.equal("passwordHash" in profileBody, false);
    });
    let createdUserId;
    await t.test("T06 create returns 201, Location and excludes passwordHash", async () => {
      const response = await request("/users", {
        method: "POST", headers: json(auth(managerToken)),
        body: JSON.stringify({
          email: "created@example.test", fullName: "Created User", phone: "+84911222333",
          password, roleIds: [String(memberRole._id)],
        }),
      });
      const body = await response.json();
      createdUserId = body.id;
      assert.equal(response.status, 201);
      assert.equal(response.headers.get("location"), `/api/v1/users/${createdUserId}`);
      assert.equal("passwordHash" in body, false);
    });
    await t.test("T07 duplicate email returns 409 EMAIL_ALREADY_EXISTS", async () => {
      const response = await request("/users", {
        method: "POST", headers: json(auth(managerToken)),
        body: JSON.stringify({ email: "created@example.test", fullName: "Duplicate", password }),
      });
      assert.equal(response.status, 409);
      assert.equal((await response.json()).error.code, "EMAIL_ALREADY_EXISTS");
    });
    await t.test("T08 weak password reports WEAK_PASSWORD", async () => {
      const response = await request("/users", {
        method: "POST", headers: json(auth(managerToken)),
        body: JSON.stringify({ email: "weak@example.test", fullName: "Weak Password", password: "123" }),
      });
      const error = (await response.json()).error;
      assert.equal(response.status, 400);
      assert.ok(error.details.some((item) => item.issue === "WEAK_PASSWORD"));
    });
    await t.test("T09 role assignment cannot escalate privileges", async () => {
      const response = await request("/users", {
        method: "POST", headers: json(auth(managerToken)),
        body: JSON.stringify({ email: "escalation@example.test", fullName: "Escalation", password, roleIds: [String(superAdminRole._id)] }),
      });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "PRIVILEGE_ESCALATION");
    });
    await t.test("T10 PATCH changes only submitted fields", async () => {
      const response = await request(`/users/${createdUserId}`, {
        method: "PATCH", headers: json(auth(managerToken)),
        body: JSON.stringify({ phone: "+84911222334" }),
      });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.fullName, "Created User");
      assert.equal(body.phone, "+84911222334");
    });
    await t.test("T11 PATCH rejects mass assignment", async () => {
      const response = await request(`/users/${createdUserId}`, {
        method: "PATCH", headers: json(auth(managerToken)), body: JSON.stringify({ roles: [] }),
      });
      const body = await response.json();
      assert.equal(response.status, 400);
      assert.equal(body.error.code, "FIELD_NOT_ALLOWED");
      assert.ok(body.error.details.some((item) => item.issue === "FIELD_NOT_ALLOWED"));
    });
    await t.test("T12 self-lock is forbidden", async () => {
      const response = await request(`/users/${manager.id}`, {
        method: "PATCH", headers: json(auth(managerToken)), body: JSON.stringify({ status: "locked" }),
      });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "SELF_ACTION_FORBIDDEN");
    });
    await t.test("BR-03 prevents self-deletion", async () => {
      const response = await request(`/users/${admin.id}`, { method: "DELETE", headers: auth(adminToken) });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "SELF_ACTION_FORBIDDEN");
    });
    await t.test("BR-03 prevents users from removing their own role", async () => {
      const response = await request(`/users/${manager.id}/roles/${managerRole.id}`, {
        method: "DELETE", headers: auth(managerToken),
      });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "SELF_ACTION_FORBIDDEN");
    });
    await t.test("BR-04 permits one super-admin to be locked but protects the last one", async () => {
      const [lockAdmin, lockBackup] = await Promise.all([
        request(`/users/${admin.id}`, {
          method: "PATCH", headers: json(auth(managerToken)), body: JSON.stringify({ status: "locked" }),
        }),
        request(`/users/${backupAdmin.id}`, {
          method: "PATCH", headers: json(auth(managerToken)), body: JSON.stringify({ status: "locked" }),
        }),
      ]);
      const results = await Promise.all([lockAdmin, lockBackup].map(async (response) => ({
        status: response.status,
        body: response.status === 409 ? await response.json() : null,
      })));
      assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
      assert.equal(results.find((result) => result.status === 409).body.error.code, "LAST_SUPER_ADMIN");
      for (const account of [admin, backupAdmin]) {
        const current = await User.findById(account.id).select("status");
        if (current.status === "locked") {
          const unlock = await request(`/users/${account.id}`, {
            method: "PATCH", headers: json(auth(managerToken)), body: JSON.stringify({ status: "active" }),
          });
          assert.equal(unlock.status, 200);
        }
      }
    });
    await t.test("T13 role assignment is idempotent", async () => {
      const path = `/users/${createdUserId}/roles/${auditorRole.id}`;
      const first = await request(path, { method: "PUT", headers: auth(managerToken) });
      const second = await request(path, { method: "PUT", headers: auth(managerToken) });
      assert.equal(first.status, 204);
      assert.equal(second.status, 204);
      const user = await User.findById(createdUserId);
      assert.equal(user.roles.filter((id) => String(id) === String(auditorRole._id)).length, 1);
    });
    await t.test("T14 role assignment cannot grant super-admin", async () => {
      const response = await request(`/users/${createdUserId}/roles/${superAdminRole.id}`, {
        method: "PUT", headers: auth(managerToken),
      });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "PRIVILEGE_ESCALATION");
    });
    await t.test("role and user creation/update/delete endpoints have contract responses", async () => {
      const createRole = await request("/roles", {
        method: "POST", headers: json(auth(adminToken)),
        body: JSON.stringify({ code: "project-reader", name: "Project Reader", description: "Read only", permissions: ["users:read"] }),
      });
      const roleBody = await createRole.json();
      assert.equal(createRole.status, 201);
      assert.ok(createRole.headers.get("location").endsWith(roleBody.id));
      const patchRole = await request(`/roles/${roleBody.id}`, {
        method: "PATCH", headers: json(auth(adminToken)), body: JSON.stringify({ name: "Project Reader Updated" }),
      });
      assert.equal(patchRole.status, 200);
      const replacePermissions = await request(`/roles/${roleBody.id}/permissions`, {
        method: "PUT", headers: json(auth(adminToken)), body: JSON.stringify({ permissions: ["users:read", "users:update"] }),
      });
      assert.equal(replacePermissions.status, 200);
      const deleteRole = await request(`/roles/${roleBody.id}`, { method: "DELETE", headers: auth(adminToken) });
      assert.equal(deleteRole.status, 204);
      const patchStatus = await request(`/users/${createdUserId}`, {
        method: "PATCH", headers: json(auth(adminToken)), body: JSON.stringify({ status: "locked" }),
      });
      assert.equal(patchStatus.status, 200);
      const unlock = await request(`/users/${createdUserId}`, {
        method: "PATCH", headers: json(auth(adminToken)), body: JSON.stringify({ status: "active" }),
      });
      assert.equal(unlock.status, 200);
    });
    await t.test("T16 manager cannot delete users", async () => {
      const response = await request(`/users/${createdUserId}`, { method: "DELETE", headers: auth(managerToken) });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "FORBIDDEN");
    });
    await t.test("T17 soft deletion hides user and blocks login", async () => {
      const response = await request(`/users/${extraMember.id}`, { method: "DELETE", headers: auth(adminToken) });
      assert.equal(response.status, 204);
      const missing = await request(`/users/${extraMember.id}`, { headers: auth(adminToken) });
      assert.equal(missing.status, 404);
      const login = await signIn(extraMember.email);
      assert.equal(login.response.status, 401);
      assert.equal(login.body.error.code, "INVALID_CREDENTIALS");
      const recreate = await request("/users", {
        method: "POST", headers: json(auth(managerToken)),
        body: JSON.stringify({ email: extraMember.email, fullName: "Reused Deleted Email", password }),
      });
      assert.equal(recreate.status, 409);
      assert.equal((await recreate.json()).error.code, "EMAIL_ALREADY_EXISTS");
    });
    await t.test("T18 malformed user ID returns 404 rather than 500", async () => {
      const response = await request("/users/abc", { headers: auth(adminToken) });
      assert.equal(response.status, 404);
      assert.equal((await response.json()).error.code, "USER_NOT_FOUND");
    });
    await t.test("T19 duplicate role code is a conflict", async () => {
      const response = await request("/roles", {
        method: "POST", headers: json(auth(adminToken)),
        body: JSON.stringify({ code: "support-observer", name: "Another Role", permissions: [] }),
      });
      assert.equal(response.status, 409);
      assert.equal((await response.json()).error.code, "ROLE_CODE_EXISTS");
    });
    await t.test("T20 system role permissions are protected", async () => {
      const response = await request(`/roles/${memberRole.id}/permissions`, {
        method: "PUT", headers: json(auth(adminToken)), body: JSON.stringify({ permissions: [] }),
      });
      assert.equal(response.status, 409);
      assert.equal((await response.json()).error.code, "SYSTEM_ROLE_PROTECTED");
      const deleteSystemRole = await request(`/roles/${memberRole.id}`, {
        method: "DELETE", headers: auth(adminToken),
      });
      assert.equal(deleteSystemRole.status, 409);
      assert.equal((await deleteSystemRole.json()).error.code, "SYSTEM_ROLE_PROTECTED");
    });
    await t.test("T21 assigned role cannot be deleted", async () => {
      const response = await request(`/roles/${customRole.id}`, { method: "DELETE", headers: auth(adminToken) });
      assert.equal(response.status, 409);
      assert.equal((await response.json()).error.code, "ROLE_IN_USE");
    });
    await t.test("T22 unknown permission codes are rejected", async () => {
      const response = await request(`/roles/${customRole.id}/permissions`, {
        method: "PUT", headers: json(auth(adminToken)), body: JSON.stringify({ permissions: ["users:fly"] }),
      });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error.code, "PERMISSION_NOT_FOUND");
    });
    await t.test("T23 client-supplied role header grants no access", async () => {
      const response = await request("/users", { headers: { ...auth(memberToken), "X-User-Role": "super-admin" } });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).error.code, "FORBIDDEN");
    });
    await t.test("T24 malformed JSON returns a normalized error", async () => {
      const response = await request("/auth/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error.code, "MALFORMED_JSON");
    });
    await t.test("BR-07 revoked permissions affect an already-issued token immediately", async () => {
      const removed = await request(`/users/${manager.id}/roles/${managerRole.id}`, {
        method: "DELETE", headers: auth(adminToken),
      });
      assert.equal(removed.status, 204);
      const next = await request("/users", { headers: auth(managerToken) });
      assert.equal(next.status, 403);
      assert.equal((await next.json()).error.code, "FORBIDDEN");
    });
    await t.test("locked account login returns 403 ACCOUNT_LOCKED", async () => {
      const response = await signIn(locked.email);
      assert.equal(response.response.status, 403);
      assert.equal(response.body.error.code, "ACCOUNT_LOCKED");
    });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
