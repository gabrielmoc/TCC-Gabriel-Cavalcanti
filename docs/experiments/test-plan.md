# Plano de Testes - Primeira Entrega Experimental

## Objetivo

Documentar o planejamento do primeiro caso experimental que sera apresentado ao orientador.

O foco desta primeira entrega e:
- deixar claro o caso experimental escolhido;
- mostrar sua relacao com a literatura;
- definir metricas e saidas esperadas;
- preparar a execucao comparativa entre `baseline` e `redis-cache`.

## Status Atual

Em 2026-08-16, esta primeira entrega ja passou de planejamento para execucao concluida:
- validacao manual do cenario com Redis concluida;
- rodada exploratoria inicial concluida;
- bateria forte em `recommendations` e `catalog` concluida;
- comparacao consolidada em `first-comparison.md`.

## Artigo de Referência

Artigo-base escolhido:

```text
[Artigo 1] Profiling and Performance Optimization
```

## Por Que Este Artigo

Este artigo foi escolhido como base do primeiro entregavel porque conversa diretamente com:
- analise de desempenho em APIs;
- identificacao de gargalos;
- observacao do comportamento entre servicos;
- uso de cache como estrategia de otimizacao;
- comparacao entre comportamento base e comportamento otimizado.

## Comparação Inicial

Comparacao principal desta etapa:

```text
baseline sem cache
vs
cenario com Redis no Catalog Service
```

## Caso Experimental

Endpoint principal:

```text
GET /api/recommendations/:userId
```

Endpoint secundario de apoio:

```text
GET /api/catalog
GET /api/catalog/:id
```

## Por Que Este Caso

O endpoint de recomendacoes foi escolhido como principal porque:
- representa melhor o fluxo distribuido da arquitetura;
- passa por `gateway`, `recommendations`, `users` e `catalog`;
- permite observar o efeito indireto do cache no sistema como um todo.

Os endpoints de catalogo entram como apoio para:
- mostrar o efeito direto do cache;
- ajudar na leitura dos resultados;
- diferenciar ganho local de ganho sistêmico.

## Estratégia de Carga

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

## Métricas Obrigatórias

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

## Saídas Esperadas

Saidas brutas:
- resultado do `k6`;
- logs principais do sistema;
- observacoes do cenario executado.

Saidas analiticas:
- tabela comparativa entre cenarios;
- pelo menos um grafico;
- interpretacao curta conectando o experimento ao artigo-base.

## Plano de Armazenamento Local

Resultados brutos:

```text
results/
```

Interpretacao e comparacao:

```text
docs/experiments/
```

## Convenção Inicial de Pastas

```text
results/{cenario}/{padrao}/run-{numero}
```

Exemplo:

```text
results/baseline/ramp/run-01
results/redis-cache/ramp/run-01
```

## O Que Ainda Precisa Ser Definido

- coleta sistematica de CPU e memoria;
- expansao do dataset para reduzir o efeito do custo quase nulo do JSON local;
- novas cargas em rampa mais agressivas;
- definicao do terceiro cenario otimizado.
