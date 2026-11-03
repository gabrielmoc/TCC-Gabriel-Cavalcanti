# Resultados Temporais Complementares do Case 3

A coleta complementar foi executada posteriormente à matriz oficial e não a substitui. Cada valor abaixo é a média aritmética das três repetições temporais do cenário; o p95 é a média dos p95 calculados separadamente em cada repetição e estágio.

| Estágio | Intervalo | VUs | Cenário | Latência média (ms) | p95 (ms) | Vazão (req/s) | Taxa de erro |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| S1 | 0-20 s | 5→30 | Baseline | 4,95 | 12,81 | 156,95 | 0,00% |
| S1 | 0-20 s | 5→30 | Redis | 7,77 | 22,67 | 153,05 | 0,00% |
| S1 | 0-20 s | 5→30 | Solr | 11,50 | 31,95 | 147,80 | 0,00% |
| S2 | 20-50 s | 30 | Baseline | 7,58 | 28,11 | 268,69 | 0,00% |
| S2 | 20-50 s | 30 | Redis | 6,84 | 16,95 | 270,36 | 0,00% |
| S2 | 20-50 s | 30 | Solr | 11,42 | 28,59 | 259,22 | 0,00% |
| S3 | 50-70 s | 30→10 | Baseline | 4,17 | 8,00 | 190,10 | 0,00% |
| S3 | 50-70 s | 30→10 | Redis | 7,97 | 25,76 | 182,65 | 0,00% |
| S3 | 50-70 s | 30→10 | Solr | 9,16 | 18,24 | 179,97 | 0,00% |
| S4 | 70-100 s | 10 | Baseline | 5,23 | 10,72 | 91,06 | 0,00% |
| S4 | 70-100 s | 10 | Redis | 6,04 | 10,60 | 90,44 | 0,00% |
| S4 | 70-100 s | 10 | Solr | 11,54 | 20,16 | 85,44 | 0,00% |
| S5 | 100-130 s | 10→70 | Baseline | 7,47 | 29,83 | 355,07 | 0,00% |
| S5 | 100-130 s | 10→70 | Redis | 9,34 | 31,93 | 348,87 | 0,00% |
| S5 | 100-130 s | 10→70 | Solr | 11,97 | 28,32 | 341,06 | 0,00% |
| S6 | 130-175 s | 70 | Baseline | 14,04 | 53,46 | 587,57 | 0,00% |
| S6 | 130-175 s | 70 | Redis | 18,55 | 57,57 | 566,01 | 0,00% |
| S6 | 130-175 s | 70 | Solr | 26,75 | 84,86 | 537,60 | 0,00% |
| S7 | 175-195 s | 70→0 | Baseline | 8,17 | 30,02 | 315,38 | 0,00% |
| S7 | 175-195 s | 70→0 | Redis | 9,95 | 36,41 | 310,90 | 0,00% |
| S7 | 175-195 s | 70→0 | Solr | 13,29 | 41,92 | 300,88 | 0,00% |

Fonte: Elaborado pelo Autor (2026), a partir de `temporal-summary.json` das nove rodadas complementares.
