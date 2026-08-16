# First Comparison - Baseline vs Redis Cache

## Status

```text
Template preparado - preenchimento pendente apos a primeira execucao formal.
```

## Objective

Registrar de forma visual e objetiva a primeira comparacao experimental entre:
- `baseline` sem cache;
- `redis-cache` no `Catalog Service`.

## Reference Article

```text
[Artigo 1] Profiling and Performance Optimization
```

## Experimental Case

Endpoint principal:

```text
GET /api/recommendations/:userId
```

Endpoint de apoio:

```text
GET /api/catalog
```

Padrao de carga:

```text
rampa
```

## Scenario Description

### Baseline

- sem cache;
- dados obtidos diretamente pelos servicos responsaveis;
- mesma logica funcional do experimento.

### Redis Cache

- cache habilitado no `Catalog Service`;
- mesma rota publica;
- mesma logica funcional;
- mesma carga aplicada.

## Execution Summary

Preencher apos a execucao:

| Campo | Baseline | Redis Cache |
|---|---|---|
| Data da execucao |  |  |
| Script utilizado |  |  |
| Padrao de carga |  |  |
| Repeticao |  |  |
| Observacoes |  |  |

## Metrics Table

| Metrica | Baseline | Redis Cache | Diferenca |
|---|---|---|---|
| Latencia media |  |  |  |
| Latencia p95 |  |  |  |
| Throughput |  |  |  |
| Taxa de erro |  |  |  |
| CPU |  |  |  |
| Memoria |  |  |  |

## Visuals

Inserir ou referenciar figuras em:

```text
docs/experiments/figures/
```

Sugestoes iniciais:
- grafico de barras para latencia media;
- grafico de barras para throughput;
- grafico simples comparando baseline e cache.

## Initial Interpretation

Preencher apos a execucao:

- O que mudou do baseline para o cache?
- O ganho foi direto apenas no catalogo ou refletiu no endpoint principal?
- Houve impacto perceptivel em latencia ou throughput?
- O resultado conversa com a expectativa derivada do artigo-base?

## Relation to the Literature

Preencher apos a execucao:

- qual aspecto do artigo-base esta sendo observado aqui;
- em que medida o experimento segue a mesma logica;
- em que medida o caso foi adaptado ao escopo do TCC.

## Raw Results

Referenciar os caminhos reais apos a execucao:

```text
results/baseline/...
results/redis-cache/...
```
