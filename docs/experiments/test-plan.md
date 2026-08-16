# Test Plan - First Experimental Delivery

## Objective

Documentar o planejamento do primeiro caso experimental que sera apresentado ao orientador.

O foco desta primeira entrega e:
- deixar claro o caso experimental escolhido;
- mostrar sua relacao com a literatura;
- definir metricas e saidas esperadas;
- preparar a execucao comparativa entre `baseline` e `redis-cache`.

## Reference Article

Artigo-base escolhido:

```text
[Artigo 1] Profiling and Performance Optimization
```

## Why This Article

Este artigo foi escolhido como base do primeiro entregavel porque conversa diretamente com:
- analise de desempenho em APIs;
- identificacao de gargalos;
- observacao do comportamento entre servicos;
- uso de cache como estrategia de otimizacao;
- comparacao entre comportamento base e comportamento otimizado.

## Initial Comparison

Comparacao principal desta etapa:

```text
baseline sem cache
vs
cenario com Redis no Catalog Service
```

## Experimental Case

Endpoint principal:

```text
GET /api/recommendations/:userId
```

Endpoint secundario de apoio:

```text
GET /api/catalog
GET /api/catalog/:id
```

## Why This Case

O endpoint de recomendacoes foi escolhido como principal porque:
- representa melhor o fluxo distribuido da arquitetura;
- passa por `gateway`, `recommendations`, `users` e `catalog`;
- permite observar o efeito indireto do cache no sistema como um todo.

Os endpoints de catalogo entram como apoio para:
- mostrar o efeito direto do cache;
- ajudar na leitura dos resultados;
- diferenciar ganho local de ganho sistêmico.

## Load Strategy

Padrao inicial:

```text
rampa
```

A carga sera aplicada no mesmo endpoint e com a mesma logica funcional em todos os cenarios.

Valores exatos da primeira rodada:
- script principal: `tests/load/recommendations-ramp.js`;
- `startVUs=1`;
- `targetVUs=15`;
- `ramp up = 15s`;
- `sustain = 20s`;
- `ramp down = 10s`;
- `sleep = 0.5s`;
- `3 repeticoes por cenario`.

Justificativa desta escolha:
- e uma carga moderada para a primeira entrega;
- suficiente para gerar comparacao inicial;
- preserva o mesmo endpoint principal entre os cenarios;
- funciona como primeiro ponto de uma progressao maior que podera evoluir para volumes mais altos.

## Mandatory Metrics

Para a primeira entrega, as metricas prioritarias sao:
- latencia media;
- latencia p95;
- throughput;
- taxa de erro.

Metricas complementares, se disponiveis com baixo atrito:
- CPU;
- memoria.

Decisao para esta primeira entrega:
- CPU e memoria nao entram como obrigatorias;
- o foco sera em latencia media, p95, throughput e taxa de erro.

## Expected Outputs

Saidas brutas:
- resultado do `k6`;
- logs principais do sistema;
- observacoes do cenario executado.

Saidas analiticas:
- tabela comparativa entre cenarios;
- pelo menos um grafico;
- interpretacao curta conectando o experimento ao artigo-base.

## Local Storage Plan

Resultados brutos:

```text
results/
```

Interpretacao e comparacao:

```text
docs/experiments/
```

## Initial Folder Convention

```text
results/{cenario}/{padrao}/run-{numero}
```

Exemplo:

```text
results/baseline/ramp/run-01
results/redis-cache/ramp/run-01
```

## What Still Needs To Be Defined

- formato final dos arquivos exportados pelo `k6`;
- estrategia minima para salvar evidencias complementares;
- como evoluir da primeira rampa moderada para casos mais fortes nas proximas rodadas.
