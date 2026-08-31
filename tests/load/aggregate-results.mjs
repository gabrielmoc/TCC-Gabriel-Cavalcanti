import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const targetDirectory = process.argv[2];

if (!targetDirectory) {
  console.error("usage: node tests/load/aggregate-results.mjs <results-dir>");
  process.exit(1);
}

const absoluteDirectory = path.resolve(process.cwd(), targetDirectory);
const entries = await readdir(absoluteDirectory, { withFileTypes: true });
const runDirectories = entries
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("run-"))
  .map((entry) => entry.name)
  .sort();

if (runDirectories.length === 0) {
  console.error(`no run directories found in ${absoluteDirectory}`);
  process.exit(1);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function safeAverage(values) {
  return values.length > 0 ? average(values) : null;
}

function getMetricSnapshot(services, serviceName) {
  return services.find((service) => service.service === serviceName)?.metrics;
}

function flattenRuntimeMetrics(runtimeMetrics) {
  const services = runtimeMetrics?.services || [];
  const gateway = getMetricSnapshot(services, "gateway");
  const catalog = getMetricSnapshot(services, "catalog");
  const users = getMetricSnapshot(services, "users");
  const recommendations = getMetricSnapshot(services, "recommendations");

  return {
    gatewayCpuMicros: gateway?.resources?.cpuMicros?.total ?? null,
    gatewayRssBytes: gateway?.resources?.memoryBytes?.rss ?? null,
    catalogCpuMicros: catalog?.resources?.cpuMicros?.total ?? null,
    catalogRssBytes: catalog?.resources?.memoryBytes?.rss ?? null,
    catalogCacheHit:
      catalog?.counters?.cacheStatus?.HIT ??
      catalog?.counters?.cacheStatus?.hit ??
      null,
    catalogCacheMiss:
      catalog?.counters?.cacheStatus?.MISS ??
      catalog?.counters?.cacheStatus?.miss ??
      null,
    usersCpuMicros: users?.resources?.cpuMicros?.total ?? null,
    usersRssBytes: users?.resources?.memoryBytes?.rss ?? null,
    recommendationsCpuMicros:
      recommendations?.resources?.cpuMicros?.total ?? null,
    recommendationsRssBytes:
      recommendations?.resources?.memoryBytes?.rss ?? null,
  };
}

const runs = [];

for (const runDirectory of runDirectories) {
  const runPath = path.join(absoluteDirectory, runDirectory);
  const metadata = JSON.parse(
    await readFile(path.join(runPath, "metadata.json"), "utf8")
  );
  const summary = JSON.parse(
    await readFile(path.join(runPath, "k6-summary.json"), "utf8")
  );
  let runtimeMetricsAfter = null;

  try {
    runtimeMetricsAfter = JSON.parse(
      await readFile(path.join(runPath, "runtime-metrics-after.json"), "utf8")
    );
  } catch {}

  const runtimeSnapshot = flattenRuntimeMetrics(runtimeMetricsAfter);

  runs.push({
    run: metadata.run,
    metadata,
    latencyAvgMs: summary.metrics.http_req_duration.avg,
    latencyP95Ms: summary.metrics.http_req_duration["p(95)"],
    throughputRps: summary.metrics.http_reqs.rate,
    errorRate: summary.metrics.http_req_failed.value,
    requestCount: summary.metrics.http_reqs.count,
    runtime: runtimeSnapshot,
  });
}

const aggregateSummary = {
  scenario: runs[0].metadata.scenario,
  endpoint: runs[0].metadata.endpoint,
  loadProfile: runs[0].metadata.loadProfile ?? runs[0].metadata.profile ?? null,
  script: runs[0].metadata.script,
  startVUs: runs[0].metadata.startVUs,
  targetVUs: runs[0].metadata.targetVUs,
  rampUp: runs[0].metadata.rampUp,
  sustain: runs[0].metadata.sustain,
  rampDown: runs[0].metadata.rampDown,
  sleepSeconds: runs[0].metadata.sleepSeconds,
  repetitions: runs.length,
  latencyAvgMs: average(runs.map((run) => run.latencyAvgMs)),
  latencyP95Ms: average(runs.map((run) => run.latencyP95Ms)),
  throughputRps: average(runs.map((run) => run.throughputRps)),
  errorRate: average(runs.map((run) => run.errorRate)),
  requestCountAvg: average(runs.map((run) => run.requestCount)),
  runtimeAverages: {
    gatewayCpuMicros: safeAverage(
      runs
        .map((run) => run.runtime.gatewayCpuMicros)
        .filter((value) => value !== null)
    ),
    gatewayRssBytes: safeAverage(
      runs
        .map((run) => run.runtime.gatewayRssBytes)
        .filter((value) => value !== null)
    ),
    catalogCpuMicros: safeAverage(
      runs
        .map((run) => run.runtime.catalogCpuMicros)
        .filter((value) => value !== null)
    ),
    catalogRssBytes: safeAverage(
      runs
        .map((run) => run.runtime.catalogRssBytes)
        .filter((value) => value !== null)
    ),
    catalogCacheHit: safeAverage(
      runs
        .map((run) => run.runtime.catalogCacheHit)
        .filter((value) => value !== null)
    ),
    catalogCacheMiss: safeAverage(
      runs
        .map((run) => run.runtime.catalogCacheMiss)
        .filter((value) => value !== null)
    ),
    usersCpuMicros: safeAverage(
      runs
        .map((run) => run.runtime.usersCpuMicros)
        .filter((value) => value !== null)
    ),
    usersRssBytes: safeAverage(
      runs
        .map((run) => run.runtime.usersRssBytes)
        .filter((value) => value !== null)
    ),
    recommendationsCpuMicros: safeAverage(
      runs
        .map((run) => run.runtime.recommendationsCpuMicros)
        .filter((value) => value !== null)
    ),
    recommendationsRssBytes: safeAverage(
      runs
        .map((run) => run.runtime.recommendationsRssBytes)
        .filter((value) => value !== null)
    ),
  },
  requestCountTotal: sum(runs.map((run) => run.requestCount)),
  runs,
};

await writeFile(
  path.join(absoluteDirectory, "aggregate-summary.json"),
  `${JSON.stringify(aggregateSummary, null, 2)}\n`
);

console.log(
  `aggregate summary written to ${path.join(
    absoluteDirectory,
    "aggregate-summary.json"
  )}`
);
