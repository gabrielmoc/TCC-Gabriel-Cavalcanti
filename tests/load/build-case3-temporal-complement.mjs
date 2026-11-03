import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const outputDirectory = path.join(root, "results", "complementar-temporal-2026-11");
const scenarios = [
  { id: "baseline", label: "Baseline", color: "#1d4ed8" },
  { id: "redis-cache", label: "Redis", color: "#0f766e" },
  { id: "solr", label: "Solr", color: "#b45309" },
];

const round = (value, digits = 3) => Number(value.toFixed(digits));
const format = (value, digits = 2) => value.toFixed(digits).replace(".", ",");

const runsByScenario = await Promise.all(
  scenarios.map(async ({ id }) => ({
    id,
    runs: await Promise.all(
      ["01", "02", "03"].map(async (run) => {
        const file = path.join(root, "results", id, "complementar-temporal-2026-11", "case-3", "recommendations", `run-${run}`, "temporal-summary.json");
        return JSON.parse(await readFile(file, "utf8"));
      })
    ),
  }))
);

const stages = runsByScenario[0].runs[0].stages.map((stage, index) => {
  const values = {};
  for (const { id, runs } of runsByScenario) {
    const measurements = runs.map((run) => run.stages[index]);
    values[id] = {
      averageLatencyMs: round(measurements.reduce((sum, value) => sum + value.averageLatencyMs, 0) / measurements.length),
      p95LatencyMs: round(measurements.reduce((sum, value) => sum + value.p95LatencyMs, 0) / measurements.length),
      throughputReqPerSecond: round(measurements.reduce((sum, value) => sum + value.throughputReqPerSecond, 0) / measurements.length),
      errorRate: round(measurements.reduce((sum, value) => sum + value.errorRate, 0) / measurements.length, 4),
    };
  }
  return {
    id: stage.id,
    interval: `${stage.startSeconds}-${stage.endSeconds} s`,
    vus: stage.vus,
    type: stage.type,
    values,
  };
});

const consolidated = {
  scope: "Evidência complementar posterior à matriz final: Case 3 repetido com saída temporal do k6.",
  repetitionsPerScenario: 3,
  stages,
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "case-3-temporal-consolidated.json"), `${JSON.stringify(consolidated, null, 2)}\n`);

const markdownRows = stages.flatMap((stage, index) =>
  scenarios.map(({ id, label }) => {
    const value = stage.values[id];
    return `| S${index + 1} | ${stage.interval} | ${stage.vus} | ${label} | ${format(value.averageLatencyMs)} | ${format(value.p95LatencyMs)} | ${format(value.throughputReqPerSecond)} | ${format(value.errorRate * 100)}% |`;
  })
).join("\n");

await writeFile(
  path.join(root, "docs", "experiments", "case-3-temporal-complement-results.md"),
  `# Resultados Temporais Complementares do Case 3\n\n` +
    `A coleta complementar foi executada posteriormente à matriz oficial e não a substitui. Cada valor abaixo é a média aritmética das três repetições temporais do cenário; o p95 é a média dos p95 calculados separadamente em cada repetição e estágio.\n\n` +
    `| Estágio | Intervalo | VUs | Cenário | Latência média (ms) | p95 (ms) | Vazão (req/s) | Taxa de erro |\n` +
    `| --- | --- | --- | --- | ---: | ---: | ---: | ---: |\n${markdownRows}\n\n` +
    `Fonte: Elaborado pelo Autor (2026), a partir de \`temporal-summary.json\` das nove rodadas complementares.\n`
);

const width = 1080;
const height = 480;
const plot = { left: 95, right: 1010, top: 55, bottom: 385 };
const maxP95 = Math.ceil(Math.max(...stages.flatMap((stage) => scenarios.map(({ id }) => stage.values[id].p95LatencyMs))) / 20) * 20;
const x = (index) => plot.left + (index * (plot.right - plot.left)) / (stages.length - 1);
const y = (value) => plot.bottom - (value / maxP95) * (plot.bottom - plot.top);
const polyline = (id) => stages.map((stage, index) => `${x(index)},${y(stage.values[id].p95LatencyMs)}`).join(" ");
const grid = Array.from({ length: 5 }, (_, index) => {
  const value = (maxP95 / 4) * index;
  const position = y(value);
  return `<line x1="${plot.left}" y1="${position}" x2="${plot.right}" y2="${position}" stroke="#dbe7f3"/><text x="${plot.left - 12}" y="${position + 4}" text-anchor="end" class="tick">${value.toFixed(0)}</text>`;
}).join("");
const labels = stages.map((stage, index) => `<text x="${x(index)}" y="${plot.bottom + 28}" text-anchor="middle" class="tick">S${index + 1}</text><text x="${x(index)}" y="${plot.bottom + 46}" text-anchor="middle" class="subtick">${stage.vus} VUs</text>`).join("");
const series = scenarios.map(({ id, label, color }) => `<polyline points="${polyline(id)}" fill="none" stroke="${color}" stroke-width="3"/>${stages.map((stage, index) => `<circle cx="${x(index)}" cy="${y(stage.values[id].p95LatencyMs)}" r="4.5" fill="${color}"/>`).join("")}<g transform="translate(${plot.left + scenarios.indexOf(scenarios.find((item) => item.id === id)) * 155},430)"><circle cx="0" cy="0" r="5" fill="${color}"/><text x="12" y="5" class="legend">${label}</text></g>`).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><style>.axis{stroke:#5f7f9f;stroke-width:1.2}.tick{font:13px Arial,sans-serif;fill:#496b8d}.subtick{font:12px Arial,sans-serif;fill:#6d849d}.legend{font:15px Arial,sans-serif;fill:#24476d}.label{font:15px Arial,sans-serif;fill:#24476d;font-weight:bold}</style><rect width="100%" height="100%" fill="white"/>${grid}<line x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.bottom}" class="axis"/><line x1="${plot.left}" y1="${plot.bottom}" x2="${plot.right}" y2="${plot.bottom}" class="axis"/><text x="24" y="${(plot.top + plot.bottom) / 2}" transform="rotate(-90 24 ${(plot.top + plot.bottom) / 2})" class="label">p95 (ms)</text>${labels}${series}</svg>`;

await writeFile(path.join(root, "docs", "experiments", "figures", "case-3-temporal-p95.svg"), svg);
