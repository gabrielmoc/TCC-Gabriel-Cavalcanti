# CT-07 - Validação Funcional do Cenário Otimizado

## Objetivo

Validar funcionalmente o terceiro cenário do TCC antes de submetê-lo às comparações quantitativas.

O terceiro cenário definido é a indexação do catálogo com Apache Solr para o fluxo de recomendações. A especificação completa está em [`docs/optimized-scenario.md`](../../optimized-scenario.md).

## Relação com a Literatura

Este cenário garante que a nova estratégia de otimização entre no experimento de forma metodologicamente controlada, sem confundir erro funcional com melhoria ou regressão de desempenho.

## Comparação Prevista

```text
Sem comparação de desempenho nesta etapa.
Foco em integridade funcional.
```

## Endpoints

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

## Estratégia de Execução

- subir o terceiro cenário isoladamente;
- indexar integralmente o dataset determinístico;
- validar resposta, ordenação e fluxo distribuído;
- garantir equivalência funcional com os cenários anteriores.

## Métricas

- sucesso funcional;
- ausência de erro inesperado;
- equivalência de payload;
- coerência do comportamento interno esperado.
- quantidade de documentos indexados;
- consultas e falhas de consulta ao Solr.

## Saídas Esperadas

- validação de prontidão para os testes de carga;
- registro claro da variável de otimização introduzida.

## Armazenamento

```text
tests/smoke/solr-smoke.js
services/solr/index-catalog.mjs
```

## Status

```text
Concluído em 18/09/2026. O teste automatizado confirmou índice disponível, indexação do dataset determinístico, cabeçalho `X-Data-Source: solr` e equivalência integral do payload da rota pública de recomendações.
```
