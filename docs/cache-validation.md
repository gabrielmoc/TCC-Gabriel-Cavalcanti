# Cache Validation Guide

Este documento descreve como ativar e validar o cenário com Redis no `Catalog Service`.

## Objetivo

Confirmar, de forma controlada, que:
- o cenário com cache pode ser ativado localmente;
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

Esse comando sobe uma instância simples, suficiente para validação local do cenário com cache.

## Ativando o cache no Catalog Service

Com o Redis ativo, suba os serviços com:

```bash
CATALOG_CACHE_ENABLED=true npm start
```

No projeto completo, a ativação deve ocorrer com a variável presente no ambiente do `catalog`.

## O que validar

### 1. Rotas preservadas

As rotas públicas devem continuar sendo:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

### 2. Comportamento esperado

Primeira chamada de catálogo:
- resposta funcional normal;
- cabecalho `X-Cache: MISS`.

Chamadas seguintes para a mesma chave:
- resposta funcional igual;
- cabecalho `X-Cache: HIT`.

### 3. Fallback

Se o Redis for desligado:
- o `catalog` não deve deixar de responder;
- o comportamento funcional deve permanecer valido;
- o serviço deve operar sem cache.

Na prática, isso significa que o `gateway` deve continuar entregando as respostas públicas esperadas, com:
- `X-Cache: MISS`;
- `X-Data-Source: dataset`.

## Validação manual sugerida

Exemplos:

```bash
curl -i http://127.0.0.1:3000/api/catalog
curl -i http://127.0.0.1:3000/api/catalog
curl -i http://127.0.0.1:3000/api/catalog/10
curl -i http://127.0.0.1:3000/api/catalog/10
```

O esperado e observar `MISS` na primeira chamada e `HIT` nas repetições.

Também e esperado observar:
- `X-Data-Source: dataset` na primeira resposta;
- `X-Data-Source: redis` nas repetições cacheadas.

Para validar o fallback, a sugestao e subir os serviços com:

```bash
CATALOG_CACHE_ENABLED=true
CATALOG_REDIS_URL=redis://127.0.0.1:6399
```

Sem iniciar nenhum Redis nessa porta. O esperado e que o sistema continue respondendo com `MISS` e `X-Data-Source: dataset`.

## Validação automatizada

Há também um smoke test dedicado ao cenário com cache em:

```text
node tests/smoke/catalog-cache-smoke.js
node tests/smoke/catalog-cache-fallback-smoke.js
```

O primeiro teste sobe uma instância local do Redis, inicializa os serviços e valida o comportamento básico do cache no `catalog`.

O segundo teste valida explicitamente o comportamento de fallback quando o Redis está indisponivel.
