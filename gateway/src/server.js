const express = require("express");
const { randomUUID } = require("node:crypto");

const app = express();
const port = Number(process.env.GATEWAY_PORT || 3000);
const catalogServiceUrl =
  process.env.CATALOG_SERVICE_URL || "http://localhost:3001";
const usersServiceUrl = process.env.USERS_SERVICE_URL || "http://localhost:3002";
const recommendationsServiceUrl =
  process.env.RECOMMENDATIONS_SERVICE_URL || "http://localhost:3003";

app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers["x-request-id"] || randomUUID();

  res.locals.requestId = requestId;
  res.set("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const upstreamService = res.locals.upstreamService || "n/a";
    const cacheStatus = res.locals.cacheStatus || "n/a";
    const dataSource = res.locals.dataSource || "n/a";

    console.log(
      [
        "gateway request",
        `id=${requestId}`,
        `${req.method} ${req.originalUrl}`,
        `status=${res.statusCode}`,
        `durationMs=${durationMs}`,
        `upstream=${upstreamService}`,
        `cache=${cacheStatus}`,
        `source=${dataSource}`,
      ].join(" | ")
    );
  });

  next();
});

async function proxyJson(req, res, targetUrl, upstreamService) {
  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        "x-request-id": res.locals.requestId,
      },
    });
    const payload = await upstreamResponse.json();

    const cacheHeader = upstreamResponse.headers.get("x-cache");
    const dataSourceHeader = upstreamResponse.headers.get("x-data-source");

    res.locals.upstreamService = upstreamService;
    res.locals.cacheStatus = cacheHeader || "n/a";
    res.locals.dataSource = dataSourceHeader || "n/a";

    if (cacheHeader) {
      res.set("X-Cache", cacheHeader);
    }

    if (dataSourceHeader) {
      res.set("X-Data-Source", dataSourceHeader);
    }

    return res.status(upstreamResponse.status).json(payload);
  } catch (error) {
    return res.status(502).json({
      message: "Gateway upstream error",
      error: error.message,
    });
  }
}

app.get("/api/catalog", async (_req, res) => {
  return proxyJson(_req, res, `${catalogServiceUrl}/catalog`, "catalog");
});

app.get("/api/catalog/:id", async (req, res) => {
  return proxyJson(req, res, `${catalogServiceUrl}/catalog/${req.params.id}`, "catalog");
});

app.get("/api/users/:id", async (req, res) => {
  return proxyJson(req, res, `${usersServiceUrl}/users/${req.params.id}`, "users");
});

app.get("/api/recommendations/:userId", async (req, res) => {
  return proxyJson(
    req,
    res,
    `${recommendationsServiceUrl}/recommendations/${req.params.userId}`,
    "recommendations"
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
