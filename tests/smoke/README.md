# Testes de Fumaça

Este diretório concentra as verificações funcionais dos cenários baseline, Redis e Solr.

Script disponível:

```text
node tests/smoke/baseline-smoke.js
node tests/smoke/catalog-cache-smoke.js
node tests/smoke/catalog-cache-fallback-smoke.js
node tests/smoke/solr-smoke.js
scripts/run-smoke-suite.sh
```

O script:
- sobe `catalog`, `users`, `recommendations` e `gateway`;
- exercita as rotas públicas do gateway;
- verifica respostas básicas esperadas;
- valida IDs inválidos, recursos inexistentes, rota desconhecida e o contrato de erro público;
- encerra os processos ao final.

Rotas verificadas:

```text
GET /api/catalog
GET /api/catalog/10
GET /api/users/1
GET /api/recommendations/1
```

Os erros públicos possuem a estrutura abaixo, preservando o identificador de requisição para rastreabilidade:

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuário não encontrado.",
    "requestId": "..."
  }
}
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

No teste Solr:
- o catálogo é indexado no contêiner Solr;
- a resposta de recomendações é comparada ao contrato equivalente do baseline;
- o gateway deve expor `X-Data-Source: solr`.

A suíte completa exige `redis-server` e Docker Compose. Ela pode ser executada com:

```bash
scripts/run-smoke-suite.sh
```

Observação:
- ele foi preparado para execução local, usando `127.0.0.1`;
- em ambientes muito restritos de sandbox, chamadas HTTP locais podem falhar por permissão mesmo com os serviços corretos.
