# Cenário de Cache

Este documento formaliza a primeira versão do cenário com cache no ambiente experimental do TCC.

## Objetivo

Introduzir uma única variável de otimização em relação ao baseline:
- uso de `Redis` no `Catalog Service`.

Neste cenário:
- as rotas públicas permanecem iguais ao baseline;
- a regra de negócio permanece igual ao baseline;
- apenas a origem de parte dos dados do `catalog` pode mudar;
- `users`, `recommendations` e `gateway` mantém o mesmo comportamento funcional.

## Escopo inicial do cache

O primeiro uso de cache fica restrito ao `Catalog Service`.

Rotas afetadas:

```text
GET /catalog
GET /catalog/:id
```

Rotas públicas preservadas pelo gateway:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

## Chaves iniciais

As chaves da primeira versão são:

```text
catalog:all
catalog:{id}
```

## Estratégia inicial

Leitura:
- se houver `cache hit`, o `catalog` responde com o valor armazenado no Redis;
- se houver `cache miss`, o `catalog` consulta o dataset local, responde normalmente e grava o valor no Redis.

Escrita:
- como esta primeira versão usa dataset local determinístico e sem operações de escrita, não há rotina de atualização de dados na API;
- por isso, nesta etapa, a consistência é mantida com TTL simples.

TTL inicial:

```text
60 segundos
```

## Estratégia inicial de invalidação

Nesta primeira iteração, a invalidação é baseada em expiração por TTL.

Não há:
- invalidação ativa por evento;
- aquecimento antecipado obrigatório;
- cache de recomendações.

## Comportamento em falha do Redis

Se o Redis estiver indisponível:
- o `Catalog Service` continua respondendo com os dados locais;
- o experimento não quebra funcionalmente;
- o serviço opera como fallback sem cache.

Isso é importante para manter a comparação metodológica clara entre:
- baseline sem cache;
- cenário com cache habilitado quando o Redis estiver disponível.

## Ativação e validação

O procedimento operacional para ativar e validar esse cenário está descrito em:

```text
docs/cache-validation.md
```

Esse material orienta:
- como subir o Redis localmente;
- como ativar `CATALOG_CACHE_ENABLED=true`;
- como validar `MISS`, `HIT` e fallback sem alterar o contrato funcional do experimento.
