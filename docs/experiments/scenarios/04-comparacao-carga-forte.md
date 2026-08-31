# CT-04 - Comparação em Carga Forte

## Objetivo

Aumentar a exigência experimental da comparação entre `baseline` e `redis-cache`, observando o endpoint principal e um endpoint de apoio direto.

## Relação com a Literatura

Este cenário aproxima o experimento de uma análise de desempenho mais robusta, permitindo observar estabilidade, latência e throughput sob maior pressão.

## Comparação Prevista

```text
baseline sem cache
vs
redis-cache no Catalog Service
```

## Endpoints

Principal:

```text
GET /api/recommendations/:userId
```

Apoio:

```text
GET /api/catalog
```

## Estratégia de Carga

- rampa forte de `5` a `60` usuários virtuais;
- `30s` de subida;
- `60s` de sustentação;
- `20s` de descida;
- `3` repetições por cenário e por endpoint.

## Métricas

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- estabilidade entre repetições.

## Saídas Esperadas

- tabela comparativa mais representativa;
- gráficos por endpoint;
- interpretação sobre ausência ou presença de ganho perceptível.

## Armazenamento

- `results/baseline/ramp-strong/recommendations/`
- `results/redis-cache/ramp-strong/recommendations/`
- `results/baseline/ramp-strong/catalog/`
- `results/redis-cache/ramp-strong/catalog/`
- `docs/experiments/figures/`
- `docs/experiments/first-comparison.md`

## Status

```text
Concluído
```
