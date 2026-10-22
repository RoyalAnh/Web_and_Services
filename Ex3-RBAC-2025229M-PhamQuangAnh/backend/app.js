const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roleRoutes = require("./routes/roles");
const permissionRoutes = require("./routes/permissions");
const { fail, handleError } = require("./utils/http");

function createApp() {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable("x-powered-by");
  app.use(cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    exposedHeaders: ["Location"],
    maxAge: 600,
  }));
  app.use(express.json({ limit: "100kb", strict: true }));

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api/v1", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/roles", roleRoutes);
  app.use("/api/v1/permissions", permissionRoutes);
  app.use((req, res) => fail(res, 404, "ENDPOINT_NOT_FOUND", `Không có endpoint ${req.method} ${req.path}.`));
  app.use(handleError);
  return app;
}

module.exports = { createApp };
