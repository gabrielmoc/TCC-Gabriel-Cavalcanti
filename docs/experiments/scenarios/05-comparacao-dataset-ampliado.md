# CT-05 - Comparação com Dataset Ampliado

## Objetivo

Repetir a comparação entre `baseline` e `redis-cache` após ampliar o volume do dataset, mantendo determinismo e equivalência funcional.

## Relação com a Literatura

Este cenário busca aumentar a sensibilidade do experimento, reduzindo o efeito do custo quase nulo do dataset pequeno e criando melhores condições para observar impacto do cache.

## Comparação Prevista

```text
baseline com dataset ampliado
vs
redis-cache com dataset ampliado
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

- repetir a bateria forte já estabelecida;
- manter o mesmo padrão funcional para permitir comparação com a rodada anterior;
- ampliar a carga se o ambiente continuar muito estável.

## Métricas

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- taxa de `cache hit` e `cache miss`.

## Saídas Esperadas

- nova tabela comparativa;
- gráficos atualizados;
- análise sobre o efeito da ampliação do dataset na utilidade do cache.

## Armazenamento

Sugestão de destino:

```text
results/baseline/dataset-large/
results/redis-cache/dataset-large/
```

Documentação analítica:

```text
docs/experiments/
```

## Status

```text
Planejado
```
