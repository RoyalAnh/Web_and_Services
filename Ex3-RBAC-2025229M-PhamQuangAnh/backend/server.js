const path = require("node:path");
require("dotenv").config({ path: process.env.ENV_FILE || path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { createApp } = require("./app");

const port = Number(process.env.PORT || 3001);

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const server = createApp().listen(port, () => {
    console.log(`RBAC API listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Unable to start RBAC API:", error.message);
  process.exitCode = 1;
});
