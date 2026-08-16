const express = require("express");
const { randomUUID } = require("node:crypto");
const path = require("path");

const app = express();
const port = Number(process.env.USERS_SERVICE_PORT || 3002);
const users = require(path.resolve(
  __dirname,
  "../../../shared/datasets/users.json"
));

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.set("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;

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

app.listen(port, () => {
  console.log(`users listening on port ${port}`);
});
