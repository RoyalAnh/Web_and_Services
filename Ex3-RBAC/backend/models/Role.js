const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-z][a-z0-9-]{2,49}$/,
      immutable: true,
    },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, default: null, trim: true },
    isSystem: { type: Boolean, default: false, immutable: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
