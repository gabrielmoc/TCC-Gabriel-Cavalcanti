const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

const env = {
  ...process.env,
  GATEWAY_PORT: process.env.GATEWAY_PORT || "3000",
  CATALOG_SERVICE_PORT: process.env.CATALOG_SERVICE_PORT || "3001",
  USERS_SERVICE_PORT: process.env.USERS_SERVICE_PORT || "3002",
  RECOMMENDATIONS_SERVICE_PORT:
    process.env.RECOMMENDATIONS_SERVICE_PORT || "3003",
  CATALOG_SERVICE_URL:
    process.env.CATALOG_SERVICE_URL || "http://127.0.0.1:3001",
  USERS_SERVICE_URL:
    process.env.USERS_SERVICE_URL || "http://127.0.0.1:3002",
  RECOMMENDATIONS_SERVICE_URL:
    process.env.RECOMMENDATIONS_SERVICE_URL || "http://127.0.0.1:3003",
  CATALOG_CACHE_ENABLED: "true",
  CATALOG_CACHE_TTL_SECONDS: process.env.CATALOG_CACHE_TTL_SECONDS || "60",
  CATALOG_REDIS_URL:
    process.env.CATALOG_REDIS_URL || "redis://127.0.0.1:6399",
};

const services = [
  { name: "catalog", cwd: path.join(root, "services/catalog") },
  { name: "users", cwd: path.join(root, "services/users") },
  {
    name: "recommendations",
    cwd: path.join(root, "services/recommendations"),
  },
  { name: "gateway", cwd: path.join(root, "gateway") },
];

const children = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startServices() {
  for (const service of services) {
    const child = spawn("node", ["src/server.js"], {
      cwd: service.cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (data) => process.stdout.write(`[${service.name}] ${data}`));
    child.stderr.on("data", (data) => process.stderr.write(`[${service.name}] ${data}`));

    children.push(child);
  }
}

async function stopServices() {
  for (const child of children.reverse()) {
    child.kill("SIGTERM");
  }

  await sleep(300);
}

async function fetchJson(url) {
  const response = await fetch(url);
  const body = await response.json();

  return {
    status: response.status,
    body,
    cacheHeader: response.headers.get("x-cache"),
    dataSourceHeader: response.headers.get("x-data-source"),
  };
}

async function run() {
  startServices();
  await sleep(1800);

  const catalog = await fetchJson("http://127.0.0.1:3000/api/catalog");
  const catalogItem = await fetchJson("http://127.0.0.1:3000/api/catalog/10");
  const recommendations = await fetchJson(
    "http://127.0.0.1:3000/api/recommendations/1"
  );

  if (catalog.status !== 200 || catalogItem.status !== 200) {
    throw new Error("Catalog endpoints failed during Redis fallback scenario");
  }

  if (recommendations.status !== 200) {
    throw new Error("Recommendations endpoint failed during Redis fallback scenario");
  }

  if (catalog.cacheHeader !== "MISS" || catalogItem.cacheHeader !== "MISS") {
    throw new Error("Expected fallback catalog responses to expose X-Cache MISS");
  }

  if (
    catalog.dataSourceHeader !== "dataset" ||
    catalogItem.dataSourceHeader !== "dataset"
  ) {
    throw new Error(
      "Expected fallback catalog responses to expose X-Data-Source dataset"
    );
  }

  if (
    recommendations.body.userId !== 1 ||
    !Array.isArray(recommendations.body.recommendations) ||
    recommendations.body.recommendations.length === 0
  ) {
    throw new Error("Unexpected recommendations payload during Redis fallback");
  }

  console.log("Catalog cache fallback smoke test completed successfully.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await stopServices();
  });
