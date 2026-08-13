const express = require("express");
const path = require("path");
const { createClient } = require("redis");

const app = express();
const port = Number(process.env.CATALOG_SERVICE_PORT || 3001);
const cacheEnabled = process.env.CATALOG_CACHE_ENABLED === "true";
const cacheTtlSeconds = Number(process.env.CATALOG_CACHE_TTL_SECONDS || 60);
const redisUrl = process.env.CATALOG_REDIS_URL || "redis://127.0.0.1:6379";
const catalog = require(path.resolve(
  __dirname,
  "../../../shared/datasets/catalog.json"
));

let redisClient;
let cacheConnected = false;

async function connectRedis() {
  if (!cacheEnabled) {
    console.log("catalog cache disabled");
    return;
  }

  redisClient = createClient({
    url: redisUrl,
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

  if (cachedCatalog) {
    return res.set("X-Cache", "HIT").json(cachedCatalog);
  }

  await writeCache(cacheKey, catalog);

  return res.set("X-Cache", "MISS").json(catalog);
});

app.get("/catalog/:id", async (req, res) => {
  const itemId = Number(req.params.id);
  const cacheKey = `catalog:${itemId}`;
  const cachedItem = await readCache(cacheKey);

  if (cachedItem) {
    return res.set("X-Cache", "HIT").json(cachedItem);
  }

  const item = catalog.find((entry) => entry.id === itemId);

  if (!item) {
    return res.status(404).json({
      message: "Catalog item not found",
    });
  }

  await writeCache(cacheKey, item);

  return res.set("X-Cache", "MISS").json(item);
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

async function startServer() {
  await connectRedis();

  app.listen(port, () => {
    console.log(`catalog listening on port ${port}`);
  });
}

startServer();
