const express = require("express");
const { randomUUID } = require("node:crypto");
const path = require("path");
const { createRuntimeMetrics } = require("../../../shared/runtime/metrics");

const app = express();
const port = Number(process.env.USERS_SERVICE_PORT || 3002);
const users = require(path.resolve(
  __dirname,
  "../../../shared/datasets/users.json"
));
const metrics = createRuntimeMetrics("users", () => ({
  dataset: {
    users: users.length,
  },
}));

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.set("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;

    metrics.recordRequest(res.statusCode, durationMs);

    console.log(
      [
        "users request",
        `id=${requestId}`,
        `${req.method} ${req.originalUrl}`,
        `status=${res.statusCode}`,
        `durationMs=${durationMs}`,
      ].join(" | ")
    );
  });

  next();
});

app.get("/users/:id", (req, res) => {
  const userId = Number(req.params.id);
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.json(user);
});

app.get("/health", (_req, res) => {
  res.json({
    service: "users",
    status: "ok",
  });
});

app.get("/metrics", (_req, res) => {
  res.json(metrics.snapshot());
});

app.listen(port, () => {
  console.log(`users listening on port ${port}`);
});
