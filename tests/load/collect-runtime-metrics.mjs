import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outputArgIndex = process.argv.indexOf("--output");
const outputPath =
  outputArgIndex >= 0 ? process.argv[outputArgIndex + 1] : undefined;

if (!outputPath) {
  console.error(
    "usage: node tests/load/collect-runtime-metrics.mjs --output <path>"
  );
  process.exit(1);
}

const services = [
  {
    name: "gateway",
    url: process.env.GATEWAY_METRICS_URL || "http://127.0.0.1:3000/metrics",
  },
  {
    name: "catalog",
    url: process.env.CATALOG_METRICS_URL || "http://127.0.0.1:3001/metrics",
  },
  {
    name: "users",
    url: process.env.USERS_METRICS_URL || "http://127.0.0.1:3002/metrics",
  },
  {
    name: "recommendations",
    url:
      process.env.RECOMMENDATIONS_METRICS_URL || "http://127.0.0.1:3003/metrics",
  },
];

async function collectServiceMetrics(service) {
  try {
    const response = await fetch(service.url);

    if (!response.ok) {
      return {
        service: service.name,
        url: service.url,
        ok: false,
        status: response.status,
        error: `HTTP ${response.status}`,
      };
    }

    return {
      service: service.name,
      url: service.url,
      ok: true,
      metrics: await response.json(),
    };
  } catch (error) {
    return {
      service: service.name,
      url: service.url,
      ok: false,
      error: error.message,
    };
  }
}

const snapshots = await Promise.all(services.map(collectServiceMetrics));

const payload = {
  collectedAt: new Date().toISOString(),
  services: snapshots,
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`runtime metrics saved to ${outputPath}`);
