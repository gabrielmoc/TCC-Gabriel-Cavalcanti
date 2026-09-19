const express = require("express");
const { randomUUID } = require("node:crypto");
const path = require("path");
const {
  parsePositiveInteger,
  sendError,
  sendNotFound,
} = require("../../../shared/http/response");
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
    const errorCode = res.locals.errorCode || "n/a";

    metrics.recordRequest(res.statusCode, durationMs);

    console.log(
      [
        "users request",
        `id=${requestId}`,
        `${req.method} ${req.originalUrl}`,
        `status=${res.statusCode}`,
        `durationMs=${durationMs}`,
        `error=${errorCode}`,
      ].join(" | ")
    );
  });

  next();
});

app.get("/users/:id", (req, res) => {
  const userId = parsePositiveInteger(req.params.id);

  if (!userId) {
    return sendError(
      res,
      400,
      "INVALID_RESOURCE_ID",
      "O identificador do usuário deve ser um inteiro positivo."
    );
  }

  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    return sendError(
      res,
      404,
      "USER_NOT_FOUND",
      "Usuário não encontrado."
    );
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

app.use((_req, res) => sendNotFound(res));

app.listen(port, () => {
  console.log(`users listening on port ${port}`);
});
