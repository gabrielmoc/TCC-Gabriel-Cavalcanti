# Baseline Smoke Test

Este diretório contem uma verificacao funcional mínima do baseline.

Script disponível:

```text
node tests/smoke/baseline-smoke.js
node tests/smoke/catalog-cache-smoke.js
node tests/smoke/catalog-cache-fallback-smoke.js
```

O script:
- sobe `catalog`, `users`, `recommendations` e `gateway`;
- exercita as rotas públicas do gateway;
- verifica respostas básicas esperadas;
- encerra os processos ao final.

Rotas verificadas:

```text
GET /api/catalog
GET /api/catalog/10
GET /api/users/1
GET /api/recommendations/1
```

No teste de cache:
- uma instância local de `redis-server` e iniciada automaticamente;
- o `Catalog Service` e iniciado com cache habilitado;
- `GET /api/catalog` e `GET /api/catalog/10` são chamados duas vezes;
- o teste valida `X-Cache: MISS` na primeira chamada e `X-Cache: HIT` na seguinte.

No teste de fallback:
- o `Catalog Service` e iniciado com cache habilitado e Redis indisponivel;
- o `gateway` continua respondendo pelas rotas públicas;
- o teste valida que o serviço responde com `MISS` e `X-Data-Source: dataset`;
- o fluxo funcional do endpoint de recomendações permanece valido.

Observação:
- ele foi preparado para execução local, usando `127.0.0.1`;
- em ambientes muito restritos de sandbox, chamadas HTTP locais podem falhar por permissão mesmo com os serviços corretos.
