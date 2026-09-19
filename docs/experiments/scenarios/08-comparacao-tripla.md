# CT-08 - Comparação Tripla entre os Cenários

## Objetivo

Comparar `baseline`, `redis-cache` e `solr` sob a mesma carga funcional.

## Relação com a Literatura

Este cenário representa a transição das rodadas exploratórias para a comparação central do TCC, permitindo discutir qual estratégia produz melhor equilíbrio entre desempenho e custo operacional.

## Comparação Prevista

```text
baseline
vs
redis-cache
vs
indexação com Apache Solr
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

- Case 1: baixa controlada, de 1 a 5 usuários virtuais;
- Case 2: alta sustentada, de 10 a 90 usuários virtuais;
- Case 3: carga variável com estágios entre 10, 30 e 70 usuários virtuais;
- três repetições para cada cenário e case.

## Métricas

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- CPU;
- memória.
- consultas e falhas do índice, para o cenário Solr.

## Saídas Esperadas

- tabela comparativa tripla;
- gráficos consolidados;
- leitura metodológica sobre o melhor cenário para o escopo do TCC.

## Armazenamento

```text
results/{baseline,redis-cache,solr}/matriz-final/{case}/recommendations/
docs/experiments/matriz-final-comparison.md
```

## Status

```text
Concluído em 18/09/2026. Foram executadas 27 rodadas, com taxa de erro igual a zero em todas as combinações. A comparação consolidada está em `docs/experiments/matriz-final-comparison.md`.
```
