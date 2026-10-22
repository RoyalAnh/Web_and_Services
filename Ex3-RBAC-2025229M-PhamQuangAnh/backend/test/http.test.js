const test = require("node:test");
const assert = require("node:assert/strict");
const {
  escapeRegex,
  isObjectId,
  pageMeta,
  validateSort,
} = require("../utils/http");

test("escapeRegex treats query input as a literal string", () => {
  assert.equal(escapeRegex("(a+b)"), "\\(a\\+b\\)");
  assert.equal(new RegExp(escapeRegex("(a+b)")).test("(a+b)"), true);
});

test("ObjectId guard accepts canonical hexadecimal IDs only", () => {
  assert.equal(isObjectId("6717a1c2e4b0a1b2c3d4e5f6"), true);
  assert.equal(isObjectId("abc"), false);
  assert.equal(isObjectId("abcdefghijkl"), false);
});

test("page metadata and sort parsing have stable output", () => {
  assert.deepEqual(pageMeta(2, 5, 11), { page: 2, limit: 5, totalItems: 11, totalPages: 3 });
  const details = [];
  assert.deepEqual(validateSort("-createdAt,name", ["createdAt", "name"], details, "-createdAt"), {
    createdAt: -1,
    name: 1,
  });
  assert.equal(details.length, 0);
  validateSort("password", ["createdAt", "name"], details, "-createdAt");
  assert.equal(details[0].issue, "FIELD_NOT_SORTABLE");
});
