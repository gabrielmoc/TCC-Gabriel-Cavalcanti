const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const solrUrl = process.env.SOLR_URL || "http://127.0.0.1:8983/solr/catalog";
const catalog = require(path.join(root, "shared/datasets/catalog.json"));
const users = require(path.join(root, "shared/datasets/users.json"));

const env = {
  ...process.env,
  GATEWAY_PORT: "3000",
  CATALOG_SERVICE_PORT: "3001",
  USERS_SERVICE_PORT: "3002",
  RECOMMENDATIONS_SERVICE_PORT: "3003",
  CATALOG_RETRIEVAL_MODE: "solr",
  SOLR_URL: solrUrl,
  CATALOG_SERVICE_URL: "http://127.0.0.1:3001",
  USERS_SERVICE_URL: "http://127.0.0.1:3002",
  RECOMMENDATIONS_SERVICE_URL: "http://127.0.0.1:3003",
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
  for (const child of children) {
    child.kill("SIGTERM");
  }

  await sleep(400);
}

async function indexCatalog() {
  const documents = catalog.map((item) => ({
    ...item,
    sortOrder_i: item.id,
  }));
  const response = await fetch(`${solrUrl}/update?commit=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(documents),
  });

  if (!response.ok) {
    throw new Error(`Solr indexation failed with HTTP ${response.status}`);
  }
}

function expectedRecommendations(userId) {
  const user = users.find((entry) => entry.id === userId);

  return catalog.filter((item) => user.preferredGenres.includes(item.genre));
}

async function run() {
  const ping = await fetch(`${solrUrl}/admin/ping`);
  if (!ping.ok) {
    throw new Error("Solr is not available. Start it with docker compose up -d solr.");
  }

  await indexCatalog();
  startServices();
  await sleep(1800);

  const response = await fetch("http://127.0.0.1:3000/api/recommendations/1");
  const body = await response.json();
  const expected = expectedRecommendations(1);

  if (response.status !== 200) {
    throw new Error(`Expected HTTP 200, received ${response.status}`);
  }

  if (response.headers.get("x-data-source") !== "solr") {
    throw new Error("Expected the gateway to expose X-Data-Source: solr");
  }

  if (JSON.stringify(body.recommendations) !== JSON.stringify(expected)) {
    throw new Error("Solr recommendations differ from the baseline functional contract");
  }

  console.log("Solr smoke test completed successfully.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await stopServices();
  });
