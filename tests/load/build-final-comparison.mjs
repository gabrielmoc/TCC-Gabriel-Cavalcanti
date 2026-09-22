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

function relativeMetricPanel(title, entries, key, smallerIsBetter) {
  const baseline = entries.find((entry) => entry.scenario === "baseline");
  const comparisons = entries.filter((entry) => entry.scenario !== "baseline");
  const changes = comparisons.map((entry) => relativeChange(entry, baseline, key, smallerIsBetter));
  const extent = Math.max(10, Math.ceil(Math.max(...changes.map((change) => Math.abs(change))) / 10) * 10);
  const center = 185;
  const scale = 130 / extent;
  const rows = comparisons
    .map((entry, index) => {
      const change = changes[index];
      const width = Math.abs(change) * scale;
      const x = change >= 0 ? center : center - width;
      const color = change >= 0 ? "#0b5fa5" : "#93a4b5";
      const sign = change > 0 ? "+" : "";
      const valueX = change >= 0 ? Math.min(center + width + 9, 344) : Math.max(center - width - 9, 26);
      const anchor = change >= 0 ? "start" : "end";
      const rowY = 106 + index * 54;
      return `<text x="26" y="${rowY - 12}" class="label">${labels[entry.scenario]}</text><rect x="${x}" y="${rowY}" width="${width}" height="18" rx="4" fill="${color}"/><text x="${valueX}" y="${rowY + 15}" text-anchor="${anchor}" class="value">${sign}${format(change, 1)}%</text>`;
    })
    .join("");
  const direction = smallerIsBetter ? "redução de latência" : "aumento de vazão";

  return `<g><rect x="0" y="0" width="370" height="220" rx="12" fill="#f8fbff" stroke="#c9daed" stroke-width="1.5"/><text x="26" y="36" class="title">${title}</text><text x="26" y="61" class="subtitle">Impacto relativo: ${direction}</text><line x1="${center}" y1="82" x2="${center}" y2="184" stroke="#315376" stroke-width="1.5"/><text x="${center}" y="202" text-anchor="middle" class="axis">0% (baseline)</text>${rows}</g>`;
}

function chartSvg(caseId, entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="310" viewBox="0 0 1180 310">
  <style>
    .header { font: 700 22px Arial, sans-serif; fill: #17395f; }
    .title { font: 700 20px Arial, sans-serif; fill: #17395f; }
    .subtitle { font: 400 14px Arial, sans-serif; fill: #53718f; }
    .label { font: 600 14px Arial, sans-serif; fill: #315376; }
    .value { font: 700 14px Arial, sans-serif; fill: #17395f; }
    .axis { font: 400 12px Arial, sans-serif; fill: #53718f; }
  </style>
  <rect width="1180" height="310" fill="#ffffff"/>
  <text x="20" y="30" class="header">${labels[caseId]} — variação relativa em relação ao baseline</text>
  <text x="20" y="54" class="subtitle">Azul: melhora relativa. Cinza-azulado: piora relativa. Os valores absolutos estão no quadro do Case.</text>
  <g transform="translate(20 72)">${relativeMetricPanel("Latência média", entries, "latencyAvgMs", true)}</g>
  <g transform="translate(405 72)">${relativeMetricPanel("Latência p95", entries, "latencyP95Ms", true)}</g>
  <g transform="translate(790 72)">${relativeMetricPanel("Vazão", entries, "throughputRps", false)}</g>
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
  const cells = rows
    .flatMap((row, rowIndex) =>
      metrics.map((metric, metricIndex) => {
        const change = relativeChange(row.entry, row.baseline, metric.key, metric.smallerIsBetter);
        const magnitude = Math.min(Math.abs(change) / 110, 1);
        const fill = change >= 0
          ? `rgb(${Math.round(220 - magnitude * 185)}, ${Math.round(236 - magnitude * 130)}, ${Math.round(249 - magnitude * 75)})`
          : `rgb(${Math.round(235 - magnitude * 65)}, ${Math.round(240 - magnitude * 70)}, ${Math.round(245 - magnitude * 70)})`;
        const textFill = magnitude > 0.58 ? "#ffffff" : "#17395f";
        const sign = change > 0 ? "+" : "";
        return `<rect x="${285 + metricIndex * 255}" y="${105 + rowIndex * 58}" width="235" height="46" rx="6" fill="${fill}"/><text x="${402 + metricIndex * 255}" y="${134 + rowIndex * 58}" text-anchor="middle" class="cell" fill="${textFill}">${sign}${format(change, 1)}%</text>`;
      })
    )
    .join("");
  const rowLabels = rows
    .map((row, index) => `<text x="260" y="${134 + index * 58}" text-anchor="end" class="row">${labels[row.caseId]} — ${labels[row.scenario]}</text>`)
    .join("");
  const columnLabels = metrics
    .map((metric, index) => `<text x="${402 + index * 255}" y="86" text-anchor="middle" class="column">${metric.label}</text>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="485" viewBox="0 0 1080 485">
  <style>
    .header { font: 700 22px Arial, sans-serif; fill: #17395f; }
    .subtitle { font: 400 14px Arial, sans-serif; fill: #53718f; }
    .column { font: 700 15px Arial, sans-serif; fill: #315376; }
    .row { font: 600 14px Arial, sans-serif; fill: #315376; }
    .cell { font: 700 15px Arial, sans-serif; }
    .legend { font: 400 13px Arial, sans-serif; fill: #53718f; }
  </style>
  <rect width="1080" height="485" fill="#ffffff"/>
  <text x="20" y="32" class="header">Síntese das variações relativas em relação ao baseline</text>
  <text x="20" y="56" class="subtitle">Percentual de melhora ou piora por métrica; valores positivos representam melhor desempenho.</text>
  ${columnLabels}
  ${rowLabels}
  ${cells}
  <rect x="285" y="430" width="90" height="14" rx="4" fill="#0b5fa5"/><text x="385" y="442" class="legend">melhora relativa</text>
  <rect x="535" y="430" width="90" height="14" rx="4" fill="#a4b3c0"/><text x="635" y="442" class="legend">piora relativa</text>
  <text x="20" y="473" class="legend">Referência: baseline = 0%. A intensidade da cor representa a magnitude da variação.</text>
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
