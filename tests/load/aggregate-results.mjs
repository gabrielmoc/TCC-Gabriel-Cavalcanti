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

const runs = [];

for (const runDirectory of runDirectories) {
  const runPath = path.join(absoluteDirectory, runDirectory);
  const metadata = JSON.parse(
    await readFile(path.join(runPath, "metadata.json"), "utf8")
  );
  const summary = JSON.parse(
    await readFile(path.join(runPath, "k6-summary.json"), "utf8")
  );

  runs.push({
    run: metadata.run,
    metadata,
    latencyAvgMs: summary.metrics.http_req_duration.avg,
    latencyP95Ms: summary.metrics.http_req_duration["p(95)"],
    throughputRps: summary.metrics.http_reqs.rate,
    errorRate: summary.metrics.http_req_failed.value,
    requestCount: summary.metrics.http_reqs.count,
  });
}

const aggregateSummary = {
  scenario: runs[0].metadata.scenario,
  endpoint: runs[0].metadata.endpoint,
  loadProfile: runs[0].metadata.load_profile,
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
