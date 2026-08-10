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

const endpoints = [
  {
    url: "http://127.0.0.1:3000/api/catalog",
    expectedStatus: 200,
    assert: (body) => Array.isArray(body) && body.length > 0,
  },
  {
    url: "http://127.0.0.1:3000/api/catalog/10",
    expectedStatus: 200,
    assert: (body) => body.id === 10,
  },
  {
    url: "http://127.0.0.1:3000/api/users/1",
    expectedStatus: 200,
    assert: (body) => body.id === 1 && Array.isArray(body.preferredGenres),
  },
  {
    url: "http://127.0.0.1:3000/api/recommendations/1",
    expectedStatus: 200,
    assert: (body) =>
      body.userId === 1 && Array.isArray(body.recommendations) && body.recommendations.length > 0,
  },
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

  await sleep(300);
}

async function run() {
  startServices();
  await sleep(1500);

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint.url);
    const body = await response.json();

    if (response.status !== endpoint.expectedStatus) {
      throw new Error(
        `Unexpected status for ${endpoint.url}: ${response.status}`
      );
    }

    if (!endpoint.assert(body)) {
      throw new Error(`Unexpected body for ${endpoint.url}`);
    }

    console.log(`OK ${endpoint.url}`);
  }

  console.log("Baseline smoke test completed successfully.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await stopServices();
  });
