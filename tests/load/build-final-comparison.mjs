import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scenarios = ["baseline", "redis-cache", "solr"];
const cases = ["case-1", "case-2", "case-3"];
const labels = {
  baseline: "Baseline",
  "redis-cache": "Redis",
  solr: "Solr",
  "case-1": "Case 1 — carga baixa controlada",
  "case-2": "Case 2 — carga alta sustentada",
  "case-3": "Case 3 — carga variável",
};

function format(value, digits = 2) {
  return Number(value).toFixed(digits).replace(".", ",");
}

function relativeChange(entry, baseline, key, smallerIsBetter) {
  const rawChange = (entry[key] - baseline[key]) / baseline[key];
  return (smallerIsBetter ? -rawChange : rawChange) * 100;
}

function symmetricExtent(values) {
  const maximum = Math.max(...values.map((value) => Math.abs(value)), 1);
  return Math.ceil((maximum * 1.2) / 10) * 10;
}

function relativePlotPanel(metric, rows, x, width, height, showLabels = true) {
  const extent = symmetricExtent(rows.map((row) => row[metric.key]));
  const left = x + (showLabels ? 104 : 22);
  const right = x + width - 20;
  const center = (left + right) / 2;
  const plotWidth = right - left;
  const top = 68;
  const bottom = height - 54;
  const step = rows.length === 2 ? 60 : 48;
  const firstY = rows.length === 2 ? 112 : 96;
  const color = { "redis-cache": "#3977ad", solr: "#0b416d" };
  const points = rows
    .map((row, index) => {
      const value = row[metric.key];
      const pointX = center + (value / extent) * (plotWidth / 2);
      const y = firstY + index * step;
      const sign = value > 0 ? "+" : "";
      const anchor = value >= 0 ? "start" : "end";
      const labelX = value >= 0 ? pointX + 10 : pointX - 10;
      const label = row.label ?? labels[row.scenario];
      return `${showLabels ? `<text x="${left - 12}" y="${y + 5}" text-anchor="end" class="row">${label}</text>` : ""}<line x1="${center}" y1="${y}" x2="${pointX}" y2="${y}" stroke="${color[row.scenario]}" stroke-opacity="0.38" stroke-width="3"/><circle cx="${pointX}" cy="${y}" r="7" fill="${color[row.scenario]}"/><text x="${labelX}" y="${y + 5}" text-anchor="${anchor}" class="value">${sign}${format(value, 1)}%</text>`;
    })
    .join("");
  return `<g><text x="${x + width / 2}" y="34" text-anchor="middle" class="metric">${metric.label}</text><line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#9eb8d0" stroke-width="1"/><line x1="${center}" y1="${top}" x2="${center}" y2="${bottom}" stroke="#52799c" stroke-width="1.5"/><text x="${left}" y="${bottom + 22}" text-anchor="middle" class="axis">-${format(extent, 0)}%</text><text x="${center}" y="${bottom + 22}" text-anchor="middle" class="axis">0%</text><text x="${right}" y="${bottom + 22}" text-anchor="middle" class="axis">+${format(extent, 0)}%</text>${points}</g>`;
}

function chartSvg(caseId, entries) {
  const metrics = [
    { key: "latencyAvgMs", label: "Latência média", smallerIsBetter: true },
    { key: "latencyP95Ms", label: "Latência p95", smallerIsBetter: true },
    { key: "throughputRps", label: "Vazão", smallerIsBetter: false },
  ];
  const baseline = entries.find((entry) => entry.scenario === "baseline");
  const rows = entries
    .filter((entry) => entry.scenario !== "baseline")
    .map((entry) => ({
      ...entry,
      latencyAvgMs: relativeChange(entry, baseline, "latencyAvgMs", true),
      latencyP95Ms: relativeChange(entry, baseline, "latencyP95Ms", true),
      throughputRps: relativeChange(entry, baseline, "throughputRps", false),
    }));
  const panels = metrics
    .map((metric, index) => relativePlotPanel(metric, rows, 18 + index * 372, 350, 246))
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1135" height="285" viewBox="0 0 1135 285">
  <style>
    .metric { font: 700 18px Arial, sans-serif; fill: #17395f; }
    .row { font: 700 15px Arial, sans-serif; fill: #315376; }
    .value { font: 700 15px Arial, sans-serif; fill: #17395f; }
    .axis { font: 400 12px Arial, sans-serif; fill: #53718f; }
    .legend { font: 400 13px Arial, sans-serif; fill: #53718f; }
  </style>
  <rect width="1135" height="285" fill="#ffffff"/>
  <line x1="385" y1="18" x2="385" y2="248" stroke="#d8e3ee" stroke-width="1"/>
  <line x1="757" y1="18" x2="757" y2="248" stroke="#d8e3ee" stroke-width="1"/>
  ${panels}
  <circle cx="24" cy="268" r="5" fill="#3977ad"/><text x="36" y="272" class="legend">Redis</text>
  <circle cx="94" cy="268" r="5" fill="#0b416d"/><text x="106" y="272" class="legend">Solr</text>
  <text x="567" y="272" text-anchor="middle" class="legend">← piora relativa | melhora relativa →</text>
  <text x="1115" y="272" text-anchor="end" class="legend">baseline = 0%</text>
</svg>`;
}

function consolidatedHeatmapSvg(summaries) {
  const metrics = [
    { key: "latencyAvgMs", label: "Latência média", smallerIsBetter: true },
    { key: "latencyP95Ms", label: "Latência p95", smallerIsBetter: true },
    { key: "throughputRps", label: "Vazão", smallerIsBetter: false },
  ];
  const rows = cases.flatMap((caseId) =>
    scenarios
      .filter((scenario) => scenario !== "baseline")
      .map((scenario) => ({
        caseId,
        scenario,
        entry: summaries.find((entry) => entry.case === caseId && entry.scenario === scenario),
        baseline: summaries.find((entry) => entry.case === caseId && entry.scenario === "baseline"),
      }))
  );
  const plottedRows = rows.map((row) => ({
    scenario: row.scenario,
    label: `C${row.caseId.at(-1)} · ${labels[row.scenario]}`,
    latencyAvgMs: relativeChange(row.entry, row.baseline, "latencyAvgMs", true),
    latencyP95Ms: relativeChange(row.entry, row.baseline, "latencyP95Ms", true),
    throughputRps: relativeChange(row.entry, row.baseline, "throughputRps", false),
  }));
  const panels = metrics
    .map((metric, index) => relativePlotPanel(metric, plottedRows, 18 + index * 372, 350, 415, index === 0))
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1135" height="455" viewBox="0 0 1135 455">
  <style>
    .metric { font: 700 18px Arial, sans-serif; fill: #17395f; }
    .row { font: 700 14px Arial, sans-serif; fill: #315376; }
    .value { font: 700 14px Arial, sans-serif; fill: #17395f; }
    .axis { font: 400 12px Arial, sans-serif; fill: #53718f; }
    .legend { font: 400 13px Arial, sans-serif; fill: #53718f; }
  </style>
  <rect width="1135" height="455" fill="#ffffff"/>
  <line x1="385" y1="18" x2="385" y2="415" stroke="#d8e3ee" stroke-width="1"/>
  <line x1="757" y1="18" x2="757" y2="415" stroke="#d8e3ee" stroke-width="1"/>
  ${panels}
  <circle cx="24" cy="438" r="5" fill="#3977ad"/><text x="36" y="442" class="legend">Redis</text>
  <circle cx="94" cy="438" r="5" fill="#0b416d"/><text x="106" y="442" class="legend">Solr</text>
  <text x="567" y="442" text-anchor="middle" class="legend">← piora relativa | melhora relativa →</text>
  <text x="1115" y="442" text-anchor="end" class="legend">baseline = 0%</text>
</svg>`;
}

function winner(entries, key, smallerIsBetter) {
  return [...entries].sort((left, right) =>
    smallerIsBetter ? left[key] - right[key] : right[key] - left[key]
  )[0];
}

function interpretation(caseId, entries) {
  const average = winner(entries, "latencyAvgMs", true);
  const p95 = winner(entries, "latencyP95Ms", true);
  const throughput = winner(entries, "throughputRps", false);
  const allZeroErrors = entries.every((entry) => entry.errorRate === 0);

  return `No ${labels[caseId]}, o menor valor de latência média foi observado no ${labels[average.scenario]} (${format(average.latencyAvgMs)} ms), o menor p95 no ${labels[p95.scenario]} (${format(p95.latencyP95Ms)} ms) e a maior vazão no ${labels[throughput.scenario]} (${format(throughput.throughputRps)} req/s). ${allZeroErrors ? "Todos os cenários mantiveram taxa de erro igual a zero." : "Foram observadas taxas de erro diferentes de zero; a leitura deve considerar essa instabilidade."} O resultado deve ser interpretado no contexto do dataset local determinístico: a estratégia adicional pode introduzir custo de comunicação, serialização ou consulta sem necessariamente superar a recuperação direta.`;
}

const summaries = [];
for (const caseId of cases) {
  for (const scenario of scenarios) {
    const summaryPath = path.join(
      root,
      "results",
      scenario,
      "matriz-final",
      caseId,
      "recommendations",
      "aggregate-summary.json"
    );
    const summary = JSON.parse(await readFile(summaryPath, "utf8"));
    summaries.push({
      scenario,
      case: caseId,
      profile: summary.loadProfile,
      repetitions: summary.repetitions,
      latencyAvgMs: summary.latencyAvgMs,
      latencyP95Ms: summary.latencyP95Ms,
      throughputRps: summary.throughputRps,
      errorRate: summary.errorRate,
      requestCountTotal: summary.requestCountTotal,
      runtimeAverages: summary.runtimeAverages,
    });
  }
}

const resultsPath = path.join(root, "results", "matriz-final-summary.json");
await writeFile(resultsPath, `${JSON.stringify(summaries, null, 2)}\n`);

const figuresDirectory = path.join(root, "docs", "experiments", "figures");
await mkdir(figuresDirectory, { recursive: true });
for (const caseId of cases) {
  const entries = summaries.filter((entry) => entry.case === caseId);
  await writeFile(
    path.join(figuresDirectory, `matriz-final-${caseId}.svg`),
    chartSvg(caseId, entries)
  );
}
await writeFile(
  path.join(figuresDirectory, "matriz-final-visao-consolidada.svg"),
  consolidatedHeatmapSvg(summaries)
);

let markdown = `# Comparação Final por Perfil de Carga\n\n`;
markdown += `Este documento consolida a matriz final entre baseline, Redis e Solr. Cada valor é a média de três repetições do endpoint \`GET /api/recommendations/:userId\`. Os resultados históricos permanecem documentados separadamente e não são usados nesta comparação.\n\n`;

for (const caseId of cases) {
  const entries = summaries.filter((entry) => entry.case === caseId);
  markdown += `## ${labels[caseId]}\n\n`;
  markdown += `| Cenário | Latência média | p95 | Vazão | Taxa de erro | Repetições |\n`;
  markdown += `| --- | ---: | ---: | ---: | ---: | ---: |\n`;
  for (const entry of entries) {
    markdown += `| ${labels[entry.scenario]} | ${format(entry.latencyAvgMs)} ms | ${format(entry.latencyP95Ms)} ms | ${format(entry.throughputRps)} req/s | ${format(entry.errorRate * 100)}% | ${entry.repetitions} |\n`;
  }
  markdown += `\n![Figura - ${labels[caseId]}](figures/matriz-final-${caseId}.svg)\n\n`;
  markdown += `**Fonte:** elaborado pelo autor (2026), a partir dos resultados brutos da matriz final.\n\n`;
  markdown += `### Leitura do case\n\n${interpretation(caseId, entries)}\n\n`;
}

markdown += `## Síntese comparativa\n\n![Figura - síntese das variações relativas](figures/matriz-final-visao-consolidada.svg)\n\n**Fonte:** elaborado pelo autor (2026), a partir das médias da matriz final.\n\nA matriz não encontrou uma estratégia dominante em todas as métricas e perfis. O baseline obteve a menor latência média e a maior vazão nos três cases; Redis apresentou o menor p95 no Case 1 e uma diferença marginal de p95 no Case 2, mas não superou o baseline nas demais métricas; Solr preservou a equivalência funcional, porém acrescentou custo no ambiente local avaliado. Esses resultados não generalizam para plataformas comerciais de streaming, mas sustentam a conclusão de que cache e indexação devem ser avaliados empiricamente, considerando carga, dados e recursos.\n\n## Limites de interpretação\n\nA comparação é válida para o ambiente local, dataset determinístico, endpoint e perfis de carga descritos no plano mestre. CPU e memória RSS dos serviços Node.js estão nos resumos agregados; as métricas do contêiner Solr são registradas por rodada como evidência complementar e não devem ser comparadas diretamente com o contador de CPU dos processos Node.js.\n`;

await writeFile(
  path.join(root, "docs", "experiments", "matriz-final-comparison.md"),
  markdown
);

console.log("Comparação final e gráficos gerados com sucesso.");
