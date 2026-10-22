const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, immutable: true },
    resource: { type: String, required: true, immutable: true },
    action: { type: String, required: true, immutable: true },
    description: { type: String, default: "", immutable: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Permission", permissionSchema);
