# Primeira Comparação - Baseline vs Redis Cache

## Status

```text
Comparacao consolidada em 2026-08-16 com validacao manual, rodada exploratoria inicial e bateria forte em dois endpoints.
```

## Resumo Executivo

Esta primeira entrega experimental ja permite afirmar com seguranca que:
- o `baseline` esta funcional e reproduzivel;
- o cenario com `Redis` no `Catalog Service` esta funcionalmente equivalente ao baseline;
- o comportamento de `MISS`, `HIT` e fallback ja foi validado;
- a arquitetura permaneceu estavel nas baterias executadas;
- o ganho de desempenho ainda nao apareceu de forma relevante no ambiente atual.

Em outras palavras: o cache funciona tecnicamente, mas ainda nao gerou melhoria expressiva nas metricas de latencia e throughput dentro do escopo atual de dados deterministicos locais e dataset reduzido.

## Objetivo

Registrar de forma visual e metodologicamente clara a primeira comparacao experimental entre:
- `baseline` sem cache;
- `redis-cache` no `Catalog Service`.

## Artigo de Referência

```text
[Artigo 1] Profiling and Performance Optimization
```

## Escopo Experimental

Endpoint principal:

```text
GET /api/recommendations/:userId
```

Endpoint de apoio:

```text
GET /api/catalog
```

Justificativa:
- `recommendations` representa melhor o fluxo distribuido completo;
- `catalog` ajuda a observar o efeito direto do cache sem o ruido da composicao do endpoint principal.

## Validação Já Concluída

Antes da bateria forte, ja estavam concluidos:
- validacao manual do Redis pelas rotas publicas do `gateway`;
- confirmacao de `MISS` na primeira chamada e `HIT` na segunda;
- confirmacao de `X-Cache` e `X-Data-Source`;
- confirmacao de fallback quando o Redis esta indisponivel;
- rodada exploratoria inicial em `GET /api/recommendations/:userId`.

As evidencias dessa etapa estao em:

```text
results/redis-cache/manual-validation/run-01
results/baseline/ramp/
results/redis-cache/ramp/
```

## Rodada Exploratória

A primeira rodada exploratoria foi importante para:
- confirmar a estabilidade funcional do ambiente;
- validar a organizacao inicial dos resultados;
- mostrar que o efeito indireto do cache em `recommendations` nao aparecia de forma clara com carga moderada.

Parametros da rodada exploratoria:

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

Resumo exploratorio:

| Metrica | Baseline | Redis Cache | Diferenca |
|---|---:|---:|---:|
| Latencia media | 4.57 ms | 4.66 ms | +0.09 ms |
| Latencia p95 | 7.35 ms | 7.78 ms | +0.43 ms |
| Throughput | 21.75 req/s | 21.75 req/s | -0.01 req/s |
| Taxa de erro | 0 | 0 | 0 |

Essa rodada permaneceu util como referencia inicial, mas foi insuficiente para uma leitura mais convincente.

## Bateria Forte Consolidada

Data:

```text
2026-08-16
```

Padrao de carga:

```text
ramp-strong
```

Parametros escolhidos:

```text
startVUs=5
targetVUs=60
rampUp=30s
sustain=60s
rampDown=20s
sleep=0.1s
repeticoes=3 por cenario e por endpoint
```

Justificativa da escolha:
- e claramente mais forte que a rodada exploratoria;
- continua viavel e reproduzivel em ambiente local;
- gera volume suficiente para leitura comparativa sem introduzir outro tipo de carga ainda nao consolidado no protocolo;
- aproxima melhor a entrega do perfil de comparacao esperado pelo orientador.

## Recommendations - Bateria Forte

### Tabela de Métricas

| Metrica | Baseline | Redis Cache | Diferenca |
|---|---:|---:|---:|
| Latencia media | 3.44 ms | 3.41 ms | -0.04 ms |
| Latencia p95 | 8.97 ms | 8.70 ms | -0.27 ms |
| Throughput | 452.73 req/s | 452.78 req/s | +0.06 req/s |
| Taxa de erro | 0 | 0 | 0 |
| Requisicoes medias por run | 49,827.67 | 49,833.67 | +6.00 |

### Visual

![Comparacao forte em recommendations](./figures/recommendations-ramp-strong.svg)

### Leitura

- O cache apresentou uma melhora muito pequena em `recommendations`.
- A latencia media caiu aproximadamente `1.02%`.
- O `p95` caiu aproximadamente `3.06%`.
- O throughput ficou praticamente identico.
- Como a diferenca e pequena, a leitura mais honesta e que o sistema ficou estavel, mas sem ganho relevante ainda.

## Catalog - Bateria Forte

### Tabela de Métricas

| Metrica | Baseline | Redis Cache | Diferenca |
|---|---:|---:|---:|
| Latencia media | 2.65 ms | 2.69 ms | +0.05 ms |
| Latencia p95 | 7.05 ms | 7.13 ms | +0.08 ms |
| Throughput | 456.52 req/s | 456.15 req/s | -0.37 req/s |
| Taxa de erro | 0 | 0 | 0 |
| Requisicoes medias por run | 50,241.00 | 50,193.67 | -47.33 |

### Visual

![Comparacao forte em catalog](./figures/catalog-ramp-strong.svg)

### Leitura

- No `catalog`, o cache tambem nao entregou ganho mensuravel nesta bateria.
- A latencia media aumentou aproximadamente `1.78%`.
- O `p95` aumentou aproximadamente `1.16%`.
- O throughput permaneceu praticamente no mesmo patamar.
- Isso sugere que, neste ambiente, o custo adicional de serializacao e acesso ao Redis pode ter neutralizado qualquer beneficio esperado.

## Visão Geral Visual

![Resumo visual da primeira entrega experimental](./figures/first-delivery-summary.svg)

## Interpretação

Os resultados desta comparacao dizem o seguinte:

1. A intervencao experimental foi aplicada corretamente.
   O cenario com Redis esta implementado, observavel e funcionalmente equivalente ao baseline.

2. O ambiente esta estavel.
   Todas as rodadas ficaram com taxa de erro zero e throughput consistente.

3. O cache ainda nao trouxe ganho expressivo.
   Nem o endpoint principal de `recommendations` nem o endpoint de apoio `catalog` apresentaram melhoria forte o suficiente para sustentar, por enquanto, a afirmacao de otimizacao efetiva.

4. Isso nao invalida a entrega.
   Pelo contrario, mostra que o experimento esta sendo conduzido com honestidade metodologica: a estrategia foi aplicada, medida e interpretada sem forcar um resultado positivo artificial.

## Por Que o Ganho Ainda Não Apareceu

As explicacoes mais plausiveis no estado atual do projeto sao:
- o dataset ainda e pequeno;
- o acesso ao catalogo local em JSON ja e muito barato;
- o endpoint principal depende tambem de `users` e da composicao da resposta;
- o Redis foi introduzido apenas no `Catalog Service`, nao em todo o fluxo;
- em ambiente local simples, o overhead adicional do cache pode competir com o custo muito baixo da fonte original.

## Relação com a Literatura

Esta primeira entrega se relaciona bem com o artigo-base porque:
- compara o comportamento antes e depois de uma intervencao controlada;
- mantem a mesma carga funcional entre os cenarios;
- trata a observacao de desempenho como evidencia empirica, e nao como suposicao;
- mostra que a simples introducao de cache nao garante melhoria automatica fora do contexto adequado.

Esse ultimo ponto e importante para o TCC, porque aproxima a discussao de uma leitura mais madura: otimizar arquitetura distribuida nao significa apenas adicionar mecanismos conhecidos, mas entender quando eles efetivamente alteram o comportamento observado.

## Limitações Desta Primeira Entrega

A entrega ainda nao contempla:
- coleta sistematica de CPU e memoria;
- dataset expandido;
- graficos temporais mais detalhados;
- comparacao com rampas ainda maiores;
- terceiro cenario otimizado.

Mesmo assim, ela ja e suficiente para:
- mostrar implementacao pratica concreta;
- demonstrar reproducibilidade;
- apresentar comparacao entre cenarios;
- justificar os proximos passos com base em evidencias reais.

## Próximo Movimento Recomendado

Com base no que foi medido, o proximo movimento metodologicamente mais forte e:
- expandir o dataset mantendo determinismo;
- testar novas cargas mais agressivas;
- observar CPU e memoria;
- definir um terceiro cenario cuja mudanca tenha mais chance de aparecer no endpoint principal.

## Resultados Brutos

Rodada exploratoria:

```text
results/baseline/ramp/
results/redis-cache/ramp/
```

Validacao manual:

```text
results/redis-cache/manual-validation/run-01
```

Bateria forte consolidada:

```text
results/baseline/ramp-strong/recommendations/
results/redis-cache/ramp-strong/recommendations/
results/baseline/ramp-strong/catalog/
results/redis-cache/ramp-strong/catalog/
```
