# CT-02 - Validação Funcional do Cenário com Redis

## Objetivo

Confirmar que o `Redis` foi introduzido corretamente no `Catalog Service`, incluindo comportamento de `MISS`, `HIT` e `fallback`.

## Relação com a Literatura

Este cenário valida a primeira estratégia de otimização do TCC em um contexto controlado, antes da comparação quantitativa sob carga.

## Comparação Prevista

```text
baseline funcional
vs
redis-cache funcional
```

## Endpoints

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/recommendations/:userId
```

## Estratégia de Execução

- ativação local do `Redis`;
- chamadas repetidas para observar `MISS` seguido de `HIT`;
- desligamento do `Redis` para validar `fallback`.

## Métricas

- equivalência funcional da resposta;
- presença dos cabeçalhos de observabilidade;
- continuidade da resposta quando o `Redis` estiver indisponível.

## Saídas Esperadas

- validação manual do cenário com cache;
- validação manual do fallback;
- rastreabilidade do caminho interno dos dados.

## Armazenamento

- resultados: `results/redis-cache/manual-validation/`;
- procedimento: `docs/cache-validation.md`.

## Status

```text
Concluído
```
