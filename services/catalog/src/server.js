const express = require("express");
const { randomUUID } = require("node:crypto");
const path = require("path");
const { createClient } = require("redis");
const {
  parsePositiveInteger,
  sendError,
  sendNotFound,
} = require("../../../shared/http/response");
const { createRuntimeMetrics } = require("../../../shared/runtime/metrics");

const app = express();
const port = Number(process.env.CATALOG_SERVICE_PORT || 3001);
const cacheEnabled = process.env.CATALOG_CACHE_ENABLED === "true";
const cacheTtlSeconds = Number(process.env.CATALOG_CACHE_TTL_SECONDS || 60);
const redisUrl = process.env.CATALOG_REDIS_URL || "redis://127.0.0.1:6379";
const catalog = require(path.resolve(
  __dirname,
  "../../../shared/datasets/catalog.json"
));
const metrics = createRuntimeMetrics("catalog", () => ({
  dataset: {
    catalogItems: catalog.length,
  },
  cache: {
    enabled: cacheEnabled,
    connected: cacheConnected,
    ttlSeconds: cacheTtlSeconds,
  },
}));

let redisClient;
let cacheConnected = false;

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();

  res.locals.startedAt = Date.now();
  res.locals.requestId = requestId;
  res.set("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - res.locals.startedAt;
    const cacheStatus = res.locals.cacheStatus || "BYPASS";
    const dataSource = res.locals.dataSource || "n/a";
    const cacheKey = res.locals.cacheKey || "n/a";
    const errorCode = res.locals.errorCode || "n/a";

    metrics.recordRequest(res.statusCode, durationMs);
    metrics.incrementCounter("cacheStatus", cacheStatus);
    metrics.incrementCounter("dataSource", dataSource);

    console.log(
      [
        "catalog request",
        `id=${requestId}`,
        `${req.method} ${req.originalUrl}`,
        `status=${res.statusCode}`,
        `durationMs=${durationMs}`,
        `cache=${cacheStatus}`,
        `source=${dataSource}`,
        `key=${cacheKey}`,
        `error=${errorCode}`,
      ].join(" | ")
    );
  });

  next();
});

async function connectRedis() {
  if (!cacheEnabled) {
    console.log("catalog cache disabled");
    return;
  }

  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false,
    },
  });

  redisClient.on("error", (error) => {
    cacheConnected = false;
    console.error(`catalog redis error: ${error.message}`);
  });

  try {
    await redisClient.connect();
    cacheConnected = true;
    console.log(`catalog redis connected at ${redisUrl}`);
  } catch (error) {
    cacheConnected = false;
    redisClient = undefined;
    console.error(`catalog redis unavailable: ${error.message}`);
  }
}

async function readCache(key) {
  if (!cacheEnabled || !cacheConnected || !redisClient) {
    return null;
  }

  try {
    const cachedValue = await redisClient.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  } catch (error) {
    console.error(`catalog cache read failed for ${key}: ${error.message}`);
    return null;
  }
}

async function writeCache(key, value) {
  if (!cacheEnabled || !cacheConnected || !redisClient) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: cacheTtlSeconds,
    });
  } catch (error) {
    console.error(`catalog cache write failed for ${key}: ${error.message}`);
  }
}

app.get("/catalog", async (_req, res) => {
  const cacheKey = "catalog:all";
  const cachedCatalog = await readCache(cacheKey);
  res.locals.cacheKey = cacheKey;

  if (cachedCatalog) {
    res.locals.cacheStatus = "HIT";
    res.locals.dataSource = "redis";

    return res
      .set("X-Cache", "HIT")
      .set("X-Data-Source", "redis")
      .json(cachedCatalog);
  }

  await writeCache(cacheKey, catalog);

  res.locals.cacheStatus = "MISS";
  res.locals.dataSource = "dataset";

  return res
    .set("X-Cache", "MISS")
    .set("X-Data-Source", "dataset")
    .json(catalog);
});

app.get("/catalog/:id", async (req, res) => {
  const itemId = parsePositiveInteger(req.params.id);

  if (!itemId) {
    res.locals.cacheStatus = "BYPASS";
    res.locals.dataSource = "n/a";
    return sendError(
      res,
      400,
      "INVALID_RESOURCE_ID",
      "O identificador do catálogo deve ser um inteiro positivo."
    );
  }

  const cacheKey = `catalog:${itemId}`;
  const cachedItem = await readCache(cacheKey);
  res.locals.cacheKey = cacheKey;

  if (cachedItem) {
    res.locals.cacheStatus = "HIT";
    res.locals.dataSource = "redis";

    return res
      .set("X-Cache", "HIT")
      .set("X-Data-Source", "redis")
      .json(cachedItem);
  }

  const item = catalog.find((entry) => entry.id === itemId);

  if (!item) {
    res.locals.cacheStatus = "MISS";
    res.locals.dataSource = "dataset";

    return sendError(
      res,
      404,
      "CATALOG_ITEM_NOT_FOUND",
      "Item de catálogo não encontrado."
    );
  }

  await writeCache(cacheKey, item);

  res.locals.cacheStatus = "MISS";
  res.locals.dataSource = "dataset";

  return res
    .set("X-Cache", "MISS")
    .set("X-Data-Source", "dataset")
    .json(item);
});

app.get("/health", (_req, res) => {
  res.json({
    service: "catalog",
    status: "ok",
    cache: {
      enabled: cacheEnabled,
      connected: cacheConnected,
      ttlSeconds: cacheTtlSeconds,
    },
  });
});

app.get("/metrics", (_req, res) => {
  res.json(metrics.snapshot());
});

app.use((_req, res) => sendNotFound(res));

async function startServer() {
  await connectRedis();

  app.listen(port, () => {
    console.log(`catalog listening on port ${port}`);
  });
}

startServer();
