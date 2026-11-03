# Auditoria da Matriz Final

## Escopo

Esta auditoria cobre exclusivamente as 27 rodadas oficiais localizadas em
`results/{cenario}/matriz-final/{case}/recommendations/run-{01,02,03}/`.
Diretorios historicos, incluindo `case-2-descartado-pre-correcao`, nao fazem
parte da comparacao conclusiva.

Cada rodada foi conferida quanto a `metadata.json`, `k6-summary.json`,
`runtime-metrics-before.json`, `runtime-metrics-after.json` e
`warmup-response.json`. As nove rodadas do Solr tambem possuem
`solr-runtime-metrics.json`. Os metadados de cenario, case, endpoint e numero
da rodada correspondem ao caminho de cada artefato.

## Inventario dos Resultados Individuais

Os valores abaixo foram extraidos diretamente de `k6-summary.json`: latencia
media e p95 de `http_req_duration`, vazao e quantidade de requisicoes de
`http_reqs` e taxa de erro de `http_req_failed`. A fonte de cada linha e o
caminho indicado pela combinacao de suas tres primeiras colunas.

O resumo do k6 nao armazena um campo explicito de duracao total da rodada. A
divisao entre quantidade de requisicoes e vazao produz estimativas proximas de
80 s para o Case 1, 190 s para o Case 2 e 195 s para o Case 3, coerentes com o
protocolo configurado. Essa estimativa serve somente para a verificacao da
execucao e nao sera tratada como metrica primaria de desempenho no artigo.

| Case | Cenario | Rodada | Latencia media (ms) | p95 (ms) | Vazao (req/s) | Taxa de erro | Requisicoes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| case-1 | baseline | 01 | 8.953 | 27.541 | 26.889 | 0.00% | 2154 |
| case-1 | baseline | 02 | 8.575 | 19.493 | 27.004 | 0.00% | 2164 |
| case-1 | baseline | 03 | 7.295 | 12.287 | 27.382 | 0.00% | 2191 |
| case-1 | redis-cache | 01 | 9.249 | 14.642 | 26.782 | 0.00% | 2143 |
| case-1 | redis-cache | 02 | 8.897 | 14.241 | 26.858 | 0.00% | 2151 |
| case-1 | redis-cache | 03 | 10.068 | 15.455 | 26.557 | 0.00% | 2125 |
| case-1 | solr | 01 | 16.183 | 23.874 | 25.562 | 0.00% | 2046 |
| case-1 | solr | 02 | 17.293 | 25.015 | 25.325 | 0.00% | 2029 |
| case-1 | solr | 03 | 17.825 | 27.600 | 25.239 | 0.00% | 2024 |
| case-2 | baseline | 01 | 34.391 | 101.489 | 524.225 | 0.00% | 99643 |
| case-2 | baseline | 02 | 20.912 | 48.537 | 584.598 | 0.00% | 111143 |
| case-2 | baseline | 03 | 18.106 | 35.936 | 598.592 | 0.00% | 113780 |
| case-2 | redis-cache | 01 | 23.705 | 51.239 | 575.034 | 0.00% | 109283 |
| case-2 | redis-cache | 02 | 30.830 | 62.359 | 542.207 | 0.00% | 103045 |
| case-2 | redis-cache | 03 | 33.061 | 70.956 | 533.121 | 0.00% | 101328 |
| case-2 | solr | 01 | 41.642 | 87.924 | 494.933 | 0.00% | 94091 |
| case-2 | solr | 02 | 39.719 | 86.381 | 501.275 | 0.00% | 95310 |
| case-2 | solr | 03 | 76.047 | 213.339 | 395.003 | 0.00% | 75086 |
| case-3 | baseline | 01 | 5.299 | 12.289 | 328.614 | 0.00% | 64091 |
| case-3 | baseline | 02 | 4.985 | 10.193 | 329.526 | 0.00% | 64279 |
| case-3 | baseline | 03 | 4.470 | 8.986 | 331.700 | 0.00% | 64698 |
| case-3 | redis-cache | 01 | 8.176 | 17.955 | 319.071 | 0.00% | 62275 |
| case-3 | redis-cache | 02 | 13.683 | 51.566 | 302.789 | 0.00% | 59057 |
| case-3 | redis-cache | 03 | 7.381 | 16.003 | 322.189 | 0.00% | 62865 |
| case-3 | solr | 01 | 16.587 | 38.971 | 293.825 | 0.00% | 57309 |
| case-3 | solr | 02 | 30.934 | 78.481 | 261.739 | 0.00% | 51057 |
| case-3 | solr | 03 | 12.150 | 27.415 | 306.703 | 0.00% | 59822 |

## Conferencia com o Artigo Atual

As medias aritmeticas das tres rodadas de cada combinacao reproduzem os valores
dos Quadros 8, 9 e 10 do artigo, respeitado o arredondamento para duas casas
decimais. Nenhuma divergencia foi identificada entre as medias calculadas a
partir dos 27 resumos do k6 e os valores apresentados nesses quadros.

## Decisao de Uso

Os 27 resumos do k6, seus metadados e as metricas de runtime correspondentes
fundamentam a analise do artigo. A variabilidade entre repeticoes foi calculada
no Quadro 12, sem substituir as medias validadas e sem usar rodadas historicas
ou descartadas.
