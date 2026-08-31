# CT-08 - Comparação Tripla entre os Cenários

## Objetivo

Comparar `baseline`, `redis-cache` e o terceiro cenário otimizado sob a mesma carga funcional.

## Relação com a Literatura

Este cenário representa a transição da análise parcial para a comparação central do TCC, permitindo discutir qual estratégia produz melhor equilíbrio entre desempenho e custo operacional.

## Comparação Prevista

```text
baseline
vs
redis-cache
vs
cenário otimizado
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

- repetir o mesmo padrão de carga da bateria forte;
- ampliar a intensidade se houver estabilidade suficiente;
- executar o mesmo número de repetições nos três cenários.

## Métricas

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- CPU;
- memória.

## Saídas Esperadas

- tabela comparativa tripla;
- gráficos consolidados;
- leitura metodológica sobre o melhor cenário para o escopo do TCC.

## Armazenamento

Sugestão:

```text
results/baseline/final-comparison/
results/redis-cache/final-comparison/
results/optimized/final-comparison/
```

## Status

```text
Planejado
```
