# Load Test Base

Este diretorio contem a base inicial dos testes de carga com `k6`.

## Objetivo desta etapa

Preparar scripts comparaveis entre:
- baseline;
- cenario com Redis no `Catalog Service`.

O endpoint principal escolhido nesta fase e:

```text
GET /api/recommendations/:userId
```

## Scripts disponiveis

```text
tests/load/recommendations-constant.js
tests/load/recommendations-ramp.js
tests/load/recommendations-spike.js
```

## Pre-requisito

O `k6` precisa estar instalado localmente para executar esses arquivos.

Os scripts deste diretorio ja foram usados na primeira bateria controlada comparando:
- `baseline`;
- `redis-cache`.

## Como executar

Exemplos para o baseline:

```bash
SCENARIO_LABEL=baseline BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-constant.js
SCENARIO_LABEL=baseline BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-ramp.js
SCENARIO_LABEL=baseline BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-spike.js
```

Exemplos para o cenario com Redis:

```bash
SCENARIO_LABEL=redis-cache BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-constant.js
SCENARIO_LABEL=redis-cache BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-ramp.js
SCENARIO_LABEL=redis-cache BASE_URL=http://127.0.0.1:3000 k6 run tests/load/recommendations-spike.js
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
repeticoes=3 por cenario
```

Os resultados brutos dessa bateria estao em:

```text
results/baseline/ramp/
results/redis-cache/ramp/
```

## Carga funcional equivalente

Os scripts foram preparados para usar a mesma rota e a mesma logica funcional nos diferentes cenarios.

Assim, a diferenca observada deve vir do comportamento interno da arquitetura, e nao da mudanca da carga aplicada.

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
