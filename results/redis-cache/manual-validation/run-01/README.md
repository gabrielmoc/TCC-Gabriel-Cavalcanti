# Validação Manual - Redis Cache

Data:

```text
16/08/2026
```

Objetivo:
- validar pelas rotas públicas do `gateway` o comportamento de `MISS` e `HIT`;
- confirmar a exposição dos headers `X-Cache` e `X-Data-Source`;
- confirmar que o endpoint de recomendações continua respondendo corretamente.

Arquivos gerados:
- `catalog-01.headers.txt`
- `catalog-02.headers.txt`
- `catalog-item-01.headers.txt`
- `catalog-item-02.headers.txt`
- `recommendations-01.headers.txt`

Resumo observado:
- primeira chamada em `/api/catalog`: `X-Cache: MISS` e `X-Data-Source: dataset`
- segunda chamada em `/api/catalog`: `X-Cache: HIT` e `X-Data-Source: redis`
- primeira chamada em `/api/catalog/10`: `X-Cache: MISS` e `X-Data-Source: dataset`
- segunda chamada em `/api/catalog/10`: `X-Cache: HIT` e `X-Data-Source: redis`
- chamada em `/api/recommendations/1`: resposta `200 OK`
