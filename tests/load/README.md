# Testes de Carga e Consolidação

Este diretório reúne os scripts `k6`, a automação da matriz final e os utilitários de consolidação das evidências.

O endpoint principal avaliado é:

```text
GET /api/recommendations/:userId
```

## Execuções Oficiais

A matriz final compara `baseline`, `redis-cache` e `solr` nos três perfis de carga (`case-1`, `case-2` e `case-3`), com três repetições por combinação. Os resultados que fundamentam o artigo estão em `results/{cenario}/matriz-final/`.

```bash
npm run test:matrix
```

O comando reexecuta a matriz e sobrescreve seus artefatos. Para executar apenas uma rodada:

```bash
tests/load/run-final-matrix.sh baseline case-1 01
tests/load/run-final-matrix.sh redis-cache case-2 02
tests/load/run-final-matrix.sh solr case-3 03
```

## Coleta Complementar do Case 3

A coleta temporal complementar é separada da matriz oficial. Ela preserva os sete estágios do `ramping-vus` e apoia a análise temporal de p95.

```bash
npm run test:case3-temporal
```

## Scripts Principais

```text
tests/load/catalog-ramp.js
tests/load/collect-runtime-metrics.mjs
tests/load/recommendations-constant.js
tests/load/recommendations-ramp.js
tests/load/recommendations-ramp-strong.js
tests/load/recommendations-spike.js
tests/load/aggregate-results.mjs
tests/load/run-final-matrix.sh
tests/load/run-final-matrix-suite.sh
tests/load/run-case3-temporal-complement.sh
tests/load/run-case3-temporal-suite.sh
tests/load/analyze-case3-temporal.mjs
tests/load/build-final-comparison.mjs
```

## Pre-requisito

O `k6` precisa estar instalado localmente para executar esses arquivos.

## Scripts Históricos

Os scripts `recommendations-constant.js`, `recommendations-ramp.js`, `recommendations-ramp-strong.js`, `recommendations-spike.js`, `catalog-ramp.js`, `run-case2-battery.sh` e `run-strong-battery.sh` foram preservados como evidência das levas exploratórias. Eles não devem ser usados para substituir ou recalcular a matriz oficial.

## Referência de Execução Histórica

Exemplos para o baseline:

```bash
SCENARIO_LABEL=baseline BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-constant.js
SCENARIO_LABEL=baseline BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-ramp.js
SCENARIO_LABEL=baseline BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-spike.js
SCENARIO_LABEL=baseline BASE_URL=http://127.0.0.1:3000 k6 run tests/load/catalog-ramp.js
```

Exemplos para o cenário com Redis:

```bash
SCENARIO_LABEL=redis-cache BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-constant.js
SCENARIO_LABEL=redis-cache BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-ramp.js
SCENARIO_LABEL=redis-cache BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-spike.js
SCENARIO_LABEL=redis-cache BASE_URL=http://127.0.0.1:3000 k6 run tests/load/catalog-ramp.js
```

## Primeira bateria executada

Na primeira rodada controlada do projeto foram usados:

```text
script: tests/load/recommendations-ramp.js
startVUs=1
targetVUs=15
rampUp=15s
sustain=20s
rampDown=10s
sleep=0.5s
repetições=3 por cenário
```

Os resultados brutos dessa bateria estão em:

```text
results/baseline/ramp/
results/redis-cache/ramp/
```

## Agregacao dos resultados

Para consolidar os `k6-summary.json` de uma bateria com repetições:

```bash
node tests/load/aggregate-results.mjs results/baseline/ramp-strong/recommendations
node tests/load/aggregate-results.mjs results/redis-cache/ramp-strong/recommendations
node tests/load/aggregate-results.mjs results/baseline/ramp-strong/catalog
node tests/load/aggregate-results.mjs results/redis-cache/ramp-strong/catalog
```

## Execução automatizada da bateria forte

Exemplos:

```bash
tests/load/run-strong-battery.sh baseline recommendations 01
tests/load/run-strong-battery.sh redis-cache recommendations 01
tests/load/run-strong-battery.sh baseline catalog 01
tests/load/run-strong-battery.sh redis-cache catalog 01
```

## Preparação do Case 2

Para a segunda leva experimental, o diretório também passa a contar com:

- `collect-runtime-metrics.mjs`: coleta snapshots de `CPU`, memória e contadores dos serviços;
- `run-case2-battery.sh`: executa rodadas padronizadas do `Case 2` e salva métricas antes e depois da carga.

Exemplos:

```bash
tests/load/run-case2-battery.sh baseline moderado recommendations 01
tests/load/run-case2-battery.sh redis-cache moderado recommendations 01
tests/load/run-case2-battery.sh baseline forte catalog 01
tests/load/run-case2-battery.sh redis-cache forte catalog 01
```

Resultados esperados do `Case 2`:

```text
results/{cenario}/case-2/{perfil}/{endpoint}/run-{numero}
```

## Carga funcional equivalente

Os scripts foram preparados para usar a mesma rota e a mesma lógica funcional nos diferentes cenários.

Assim, a diferença observada deve vir do comportamento interno da arquitetura, e não da mudanca da carga aplicada.

## Variaveis uteis

```text
BASE_URL
USER_ID
SCENARIO_LABEL
VUS
DURATION
SLEEP_SECONDS
START_VUS
RAMP_TARGET_VUS
RAMP_UP_DURATION
SUSTAIN_DURATION
RAMP_DOWN_DURATION
SPIKE_TARGET_VUS
SPIKE_UP_DURATION
SPIKE_HOLD_DURATION
SPIKE_DOWN_DURATION
```
