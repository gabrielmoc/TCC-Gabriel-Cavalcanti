# Cache Validation Guide

Este documento descreve como ativar e validar o cenario com Redis no `Catalog Service`.

## Objetivo

Confirmar, de forma controlada, que:
- o cenario com cache pode ser ativado localmente;
- a resposta funcional continua igual ao baseline;
- a primeira leitura gera `MISS`;
- leituras subsequentes podem gerar `HIT`;
- se o Redis falhar, o `catalog` continua respondendo.

## Variaveis de ambiente relevantes

```text
CATALOG_CACHE_ENABLED=true
CATALOG_CACHE_TTL_SECONDS=60
CATALOG_REDIS_URL=redis://127.0.0.1:6379
```

## Subindo o Redis localmente

Se o Redis estiver instalado localmente:

```bash
redis-server --save "" --appendonly no
```

Esse comando sobe uma instancia simples, suficiente para validacao local do cenario com cache.

## Ativando o cache no Catalog Service

Com o Redis ativo, suba os servicos com:

```bash
CATALOG_CACHE_ENABLED=true npm start
```

No projeto completo, a ativacao deve ocorrer com a variavel presente no ambiente do `catalog`.

## O que validar

### 1. Rotas preservadas

As rotas publicas devem continuar sendo:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

### 2. Comportamento esperado

Primeira chamada de catalogo:
- resposta funcional normal;
- cabecalho `X-Cache: MISS`.

Chamadas seguintes para a mesma chave:
- resposta funcional igual;
- cabecalho `X-Cache: HIT`.

### 3. Fallback

Se o Redis for desligado:
- o `catalog` nao deve deixar de responder;
- o comportamento funcional deve permanecer valido;
- o servico deve operar sem cache.

## Validacao manual sugerida

Exemplos:

```bash
curl -i http://127.0.0.1:3000/api/catalog
curl -i http://127.0.0.1:3000/api/catalog
curl -i http://127.0.0.1:3000/api/catalog/10
curl -i http://127.0.0.1:3000/api/catalog/10
```

O esperado e observar `MISS` na primeira chamada e `HIT` nas repeticoes.

## Validacao automatizada

Ha tambem um smoke test dedicado ao cenario com cache em:

```text
node tests/smoke/catalog-cache-smoke.js
```

Esse teste sobe uma instancia local do Redis, inicializa os servicos e valida o comportamento basico do cache no `catalog`.
