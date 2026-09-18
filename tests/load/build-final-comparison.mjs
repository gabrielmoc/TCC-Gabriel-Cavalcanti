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

function metricCard(title, entries, key, suffix, smallerIsBetter) {
  const values = entries.map((entry) => entry[key]);
  const maximum = Math.max(...values, 0.0001);
  const colors = ["#9bbddd", "#3671ad", "#0b416d"];
  const rows = entries
    .map((entry, index) => {
      const width = Math.max(10, (entry[key] / maximum) * 250);
      return `<text x="34" y="${100 + index * 46}" class="label">${labels[entry.scenario]}</text><rect x="34" y="${110 + index * 46}" width="250" height="16" rx="5" fill="#dce9f6"/><rect x="34" y="${110 + index * 46}" width="${width}" height="16" rx="5" fill="${colors[index]}"/><text x="300" y="124" class="value" transform="translate(0 ${index * 46})">${format(entry[key])} ${suffix}</text>`;
    })
    .join("");
  const direction = smallerIsBetter ? "Menor valor é melhor" : "Maior valor é melhor";

  return `<g><rect x="0" y="0" width="390" height="270" rx="18" fill="#f8fbff" stroke="#c9daed" stroke-width="2"/><text x="34" y="48" class="title">${title}</text><text x="34" y="74" class="subtitle">${direction}</text>${rows}</g>`;
}

function chartSvg(caseId, entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="330" viewBox="0 0 1240 330">
  <style>
    .title { font: 700 23px Arial, sans-serif; fill: #17395f; }
    .subtitle { font: 400 15px Arial, sans-serif; fill: #53718f; }
    .label { font: 600 15px Arial, sans-serif; fill: #315376; }
    .value { font: 700 15px Arial, sans-serif; fill: #17395f; }
  </style>
  <rect width="1240" height="330" fill="#ffffff"/>
  <text x="20" y="30" class="title">${labels[caseId]} — comparação entre cenários</text>
  <g transform="translate(20 45)">${metricCard("Latência média (ms)", entries, "latencyAvgMs", "ms", true)}</g>
  <g transform="translate(425 45)">${metricCard("Latência p95 (ms)", entries, "latencyP95Ms", "ms", true)}</g>
  <g transform="translate(830 45)">${metricCard("Vazão (req/s)", entries, "throughputRps", "req/s", false)}</g>
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

markdown += `## Síntese comparativa\n\nA matriz não encontrou uma estratégia dominante em todas as métricas e perfis. O baseline obteve a menor latência média e a maior vazão nos três cases; Redis apresentou o menor p95 no Case 1 e uma diferença marginal de p95 no Case 2, mas não superou o baseline nas demais métricas; Solr preservou a equivalência funcional, porém acrescentou custo no ambiente local avaliado. Esses resultados não generalizam para plataformas comerciais de streaming, mas sustentam a conclusão de que cache e indexação devem ser avaliados empiricamente, considerando carga, dados e recursos.\n\n## Limites de interpretação\n\nA comparação é válida para o ambiente local, dataset determinístico, endpoint e perfis de carga descritos no plano mestre. CPU e memória RSS dos serviços Node.js estão nos resumos agregados; as métricas do contêiner Solr são registradas por rodada como evidência complementar e não devem ser comparadas diretamente com o contador de CPU dos processos Node.js.\n`;

await writeFile(
  path.join(root, "docs", "experiments", "matriz-final-comparison.md"),
  markdown
);

console.log("Comparação final e gráficos gerados com sucesso.");
