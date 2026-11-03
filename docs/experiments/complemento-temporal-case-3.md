# Complemento Temporal do Case 3

## Objetivo

Este complemento repete exclusivamente as nove combinações do Case 3 (três cenários por três repetições) com exportação temporal do k6. Ele não substitui a matriz final original: seus artefatos ficam em `results/{cenario}/complementar-temporal-2026-11/` e devem ser apresentados como evidência complementar, produzida posteriormente.

## Instrumentação

O script `run-case3-temporal-complement.sh` chama o protocolo já utilizado na matriz final, preservando dataset, endpoint, cenários, aquecimento, VUs, estágios e duração. A única adição é o output JSON do k6 em `k6-samples.ndjson`, analisado por `analyze-case3-temporal.mjs`.

Os intervalos reportados são os estágios reais do executor `ramping-vus`:

| Estágio | Intervalo | VUs | Tipo |
| --- | --- | --- | --- |
| S1 | 0–20 s | 5→30 | Rampa |
| S2 | 20–50 s | 30 | Patamar |
| S3 | 50–70 s | 30→10 | Rampa |
| S4 | 70–100 s | 10 | Patamar |
| S5 | 100–130 s | 10→70 | Rampa |
| S6 | 130–175 s | 70 | Patamar |
| S7 | 175–195 s | 70→0 | Rampa |

Os estágios de rampa não devem ser descritos como concorrência fixa. Para cada intervalo, o resumo registra quantidade de requisições, latência média, p95, vazão observada e taxa de erro.
