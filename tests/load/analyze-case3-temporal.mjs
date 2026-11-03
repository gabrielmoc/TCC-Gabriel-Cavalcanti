import { readFile, writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const input = valueFor("--input");
const output = valueFor("--output");
if (!input || !output) {
  throw new Error("uso: node analyze-case3-temporal.mjs --input <k6-samples.ndjson> --output <temporal-summary.json>");
}

// Cada intervalo corresponde a um estágio real do executor ramping-vus.
const stages = [
  { id: "s1-rampa-5-30", startSeconds: 0, endSeconds: 20, vus: "5→30", type: "rampa" },
  { id: "s2-patamar-30", startSeconds: 20, endSeconds: 50, vus: "30", type: "patamar" },
  { id: "s3-reducao-30-10", startSeconds: 50, endSeconds: 70, vus: "30→10", type: "rampa" },
  { id: "s4-patamar-10", startSeconds: 70, endSeconds: 100, vus: "10", type: "patamar" },
  { id: "s5-rampa-10-70", startSeconds: 100, endSeconds: 130, vus: "10→70", type: "rampa" },
  { id: "s6-patamar-70", startSeconds: 130, endSeconds: 175, vus: "70", type: "patamar" },
  { id: "s7-descida-70-0", startSeconds: 175, endSeconds: 195, vus: "70→0", type: "rampa" },
].map((stage) => ({ ...stage, durations: [], requests: 0, failures: 0 }));

const percentile = (values, ratio) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(ratio * sorted.length) - 1)];
};

const lines = (await readFile(input, "utf8")).trim().split("\n").filter(Boolean);
let firstTimestamp;

for (const line of lines) {
  const event = JSON.parse(line);
  if (event.type !== "Point" || !event.data?.time) continue;

  const timestamp = new Date(event.data.time).getTime();
  if (!Number.isFinite(timestamp)) continue;
  firstTimestamp ??= timestamp;

  const elapsedSeconds = (timestamp - firstTimestamp) / 1000;
  const stage = stages.find(({ startSeconds, endSeconds }) =>
    elapsedSeconds >= startSeconds && elapsedSeconds < endSeconds
  );
  if (!stage) continue;

  if (event.metric === "http_req_duration") stage.durations.push(event.data.value);
  if (event.metric === "http_reqs") stage.requests += 1;
  if (event.metric === "http_req_failed" && event.data.value > 0) stage.failures += 1;
}

const result = {
  source: input,
  method: "Amostras temporais do output JSON do k6; p95 calculado sobre as durações HTTP de cada estágio.",
  stages: stages.map(({ durations, requests, failures, ...stage }) => ({
    ...stage,
    requestCount: requests,
    averageLatencyMs: durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null,
    p95LatencyMs: percentile(durations, 0.95),
    throughputReqPerSecond: requests / (stage.endSeconds - stage.startSeconds),
    errorRate: requests ? failures / requests : null,
  })),
};

await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
