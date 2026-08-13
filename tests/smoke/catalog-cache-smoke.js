const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const redisPort = process.env.CATALOG_TEST_REDIS_PORT || "6380";
const redisDir = fs.mkdtempSync(path.join(os.tmpdir(), "tcc-redis-"));

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
  CATALOG_REDIS_URL: `redis://127.0.0.1:${redisPort}`,
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

function startProcess(name, command, args, cwd, childEnv = process.env) {
  const child = spawn(command, args, {
    cwd,
    env: childEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => process.stdout.write(`[${name}] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[${name}] ${data}`));

  children.push(child);
  return child;
}

function startRedis() {
  startProcess(
    "redis",
    "redis-server",
    ["--save", "", "--appendonly", "no", "--port", String(redisPort), "--dir", redisDir],
    root
  );
}

function startServices() {
  for (const service of services) {
    startProcess(service.name, "node", ["src/server.js"], service.cwd, env);
  }
}

async function stopProcesses() {
  for (const child of children.reverse()) {
    child.kill("SIGTERM");
  }

  await sleep(400);
  fs.rmSync(redisDir, { recursive: true, force: true });
}

async function fetchJson(url) {
  const response = await fetch(url);
  const body = await response.json();

  return {
    status: response.status,
    body,
    cacheHeader: response.headers.get("x-cache"),
  };
}

async function run() {
  startRedis();
  await sleep(600);

  startServices();
  await sleep(1800);

  const firstCatalog = await fetchJson("http://127.0.0.1:3001/catalog");
  const secondCatalog = await fetchJson("http://127.0.0.1:3001/catalog");
  const firstItem = await fetchJson("http://127.0.0.1:3001/catalog/10");
  const secondItem = await fetchJson("http://127.0.0.1:3001/catalog/10");
  const recommendations = await fetchJson(
    "http://127.0.0.1:3000/api/recommendations/1"
  );

  if (firstCatalog.status !== 200 || secondCatalog.status !== 200) {
    throw new Error("Catalog list endpoint failed under cache scenario");
  }

  if (firstItem.status !== 200 || secondItem.status !== 200) {
    throw new Error("Catalog item endpoint failed under cache scenario");
  }

  if (recommendations.status !== 200) {
    throw new Error("Recommendations endpoint failed under cache scenario");
  }

  if (firstCatalog.cacheHeader !== "MISS") {
    throw new Error("Expected first catalog request to return X-Cache MISS");
  }

  if (secondCatalog.cacheHeader !== "HIT") {
    throw new Error("Expected second catalog request to return X-Cache HIT");
  }

  if (firstItem.cacheHeader !== "MISS") {
    throw new Error("Expected first catalog item request to return X-Cache MISS");
  }

  if (secondItem.cacheHeader !== "HIT") {
    throw new Error("Expected second catalog item request to return X-Cache HIT");
  }

  if (!Array.isArray(firstCatalog.body) || firstCatalog.body.length === 0) {
    throw new Error("Unexpected catalog list payload under cache scenario");
  }

  if (firstItem.body.id !== 10 || secondItem.body.id !== 10) {
    throw new Error("Unexpected catalog item payload under cache scenario");
  }

  if (
    recommendations.body.userId !== 1 ||
    !Array.isArray(recommendations.body.recommendations) ||
    recommendations.body.recommendations.length === 0
  ) {
    throw new Error("Unexpected recommendations payload under cache scenario");
  }

  console.log("Catalog cache smoke test completed successfully.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await stopProcesses();
  });
