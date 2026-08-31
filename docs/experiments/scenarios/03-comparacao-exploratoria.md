# CT-03 - Comparação Exploratória entre Baseline e Redis

## Objetivo

Executar a primeira comparação sob carga moderada entre `baseline` e `redis-cache`.

## Relação com a Literatura

Este cenário funciona como primeiro ensaio comparativo, útil para observar se a estratégia de cache altera o comportamento do sistema sem exigir ainda uma bateria final mais pesada.

## Comparação Prevista

```text
baseline sem cache
vs
redis-cache no Catalog Service
```

## Endpoint Principal

```text
GET /api/recommendations/:userId
```

## Endpoints de Apoio

```text
GET /api/catalog
GET /api/catalog/:id
```

## Estratégia de Carga

- padrão em rampa moderada;
- mesma carga funcional para os dois cenários;
- três repetições por cenário.

## Métricas

- latência média;
- latência `p95`;
- throughput;
- taxa de erro.

## Saídas Esperadas

- primeira tabela comparativa;
- leitura preliminar do efeito do cache;
- base para decidir a próxima bateria.

## Armazenamento

- `results/baseline/ramp/`
- `results/redis-cache/ramp/`
- interpretação consolidada em `docs/experiments/first-comparison.md`

## Status

```text
Concluído
```
