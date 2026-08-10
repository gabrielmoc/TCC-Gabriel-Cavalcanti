const express = require("express");

const app = express();
const port = Number(process.env.GATEWAY_PORT || 3000);
const catalogServiceUrl =
  process.env.CATALOG_SERVICE_URL || "http://localhost:3001";
const usersServiceUrl = process.env.USERS_SERVICE_URL || "http://localhost:3002";
const recommendationsServiceUrl =
  process.env.RECOMMENDATIONS_SERVICE_URL || "http://localhost:3003";

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`
    );
  });

  next();
});

async function proxyJson(res, targetUrl) {
  try {
    const upstreamResponse = await fetch(targetUrl);
    const payload = await upstreamResponse.json();

    return res.status(upstreamResponse.status).json(payload);
  } catch (error) {
    return res.status(502).json({
      message: "Gateway upstream error",
      error: error.message,
    });
  }
}

app.get("/api/catalog", async (_req, res) => {
  return proxyJson(res, `${catalogServiceUrl}/catalog`);
});

app.get("/api/catalog/:id", async (req, res) => {
  return proxyJson(res, `${catalogServiceUrl}/catalog/${req.params.id}`);
});

app.get("/api/users/:id", async (req, res) => {
  return proxyJson(res, `${usersServiceUrl}/users/${req.params.id}`);
});

app.get("/api/recommendations/:userId", async (req, res) => {
  return proxyJson(
    res,
    `${recommendationsServiceUrl}/recommendations/${req.params.userId}`
  );
});

app.get("/health", (_req, res) => {
  res.json({
    service: "gateway",
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`gateway listening on port ${port}`);
});
