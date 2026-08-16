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

Neste ambiente atual, a base foi preparada, mas a execucao nao foi realizada aqui porque o binario ainda nao esta disponivel.

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
