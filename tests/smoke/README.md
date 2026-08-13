# Baseline Smoke Test

Este diretorio contem uma verificacao funcional minima do baseline.

Script disponivel:

```text
node tests/smoke/baseline-smoke.js
node tests/smoke/catalog-cache-smoke.js
```

O script:
- sobe `catalog`, `users`, `recommendations` e `gateway`;
- exercita as rotas publicas do gateway;
- verifica respostas basicas esperadas;
- encerra os processos ao final.

Rotas verificadas:

```text
GET /api/catalog
GET /api/catalog/10
GET /api/users/1
GET /api/recommendations/1
```

No teste de cache:
- uma instancia local de `redis-server` e iniciada automaticamente;
- o `Catalog Service` e iniciado com cache habilitado;
- `GET /api/catalog` e `GET /api/catalog/10` sao chamados duas vezes;
- o teste valida `X-Cache: MISS` na primeira chamada e `X-Cache: HIT` na seguinte.

Observacao:
- ele foi preparado para execucao local, usando `127.0.0.1`;
- em ambientes muito restritos de sandbox, chamadas HTTP locais podem falhar por permissao mesmo com os servicos corretos.
