# CT-06 - Observabilidade e Recursos Computacionais

## Objetivo

Incorporar coleta sistemática de CPU, memória e sinais de observabilidade para enriquecer a comparação experimental.

## Relação com a Literatura

Este cenário fortalece a discussão acadêmica, porque amplia a análise para além de latência e throughput, aproximando o experimento de uma leitura arquitetural mais completa.

## Comparação Prevista

```text
baseline instrumentado
vs
redis-cache instrumentado
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

## Estratégia de Execução

- manter o mesmo padrão de carga já adotado na comparação forte;
- coletar uso de CPU e memória durante cada repetição;
- consolidar logs por cenário e por endpoint.

## Métricas

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- CPU;
- memória;
- sinais de origem dos dados e comportamento do cache.

## Saídas Esperadas

- tabela técnica mais completa;
- base para discussão de custo x benefício da otimização;
- material visual para a monografia.

## Armazenamento

Sugestão de destino:

```text
results/baseline/observability/
results/redis-cache/observability/
```

## Status

```text
Planejado
```
