# Cache Scenario

Este documento formaliza a primeira versao do cenario com cache no ambiente experimental do TCC.

## Objetivo

Introduzir uma unica variavel de otimizacao em relacao ao baseline:
- uso de `Redis` no `Catalog Service`.

Neste cenario:
- as rotas publicas permanecem iguais ao baseline;
- a regra de negocio permanece igual ao baseline;
- apenas a origem de parte dos dados do `catalog` pode mudar;
- `users`, `recommendations` e `gateway` mantem o mesmo comportamento funcional.

## Escopo inicial do cache

O primeiro uso de cache fica restrito ao `Catalog Service`.

Rotas afetadas:

```text
GET /catalog
GET /catalog/:id
```

Rotas publicas preservadas pelo gateway:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

## Chaves iniciais

As chaves da primeira versao sao:

```text
catalog:all
catalog:{id}
```

## Estrategia inicial

Leitura:
- se houver `cache hit`, o `catalog` responde com o valor armazenado no Redis;
- se houver `cache miss`, o `catalog` consulta o dataset local, responde normalmente e grava o valor no Redis.

Escrita:
- como esta primeira versao usa dataset local deterministico e sem operacoes de escrita, nao ha rotina de atualizacao de dados na API;
- por isso, nesta etapa, a consistencia e mantida com TTL simples.

TTL inicial:

```text
60 segundos
```

## Estrategia inicial de invalidacao

Nesta primeira iteracao, a invalidacao e baseada em expiracao por TTL.

Nao ha:
- invalidacao ativa por evento;
- aquecimento antecipado obrigatorio;
- cache de recomendacoes.

## Comportamento em falha do Redis

Se o Redis estiver indisponivel:
- o `Catalog Service` continua respondendo com os dados locais;
- o experimento nao quebra funcionalmente;
- o servico opera como fallback sem cache.

Isso e importante para manter a comparacao metodologica clara entre:
- baseline sem cache;
- cenario com cache habilitado quando o Redis estiver disponivel.

## Ativacao e validacao

O procedimento operacional para ativar e validar esse cenario esta descrito em:

```text
docs/cache-validation.md
```

Esse material orienta:
- como subir o Redis localmente;
- como ativar `CATALOG_CACHE_ENABLED=true`;
- como validar `MISS`, `HIT` e fallback sem alterar o contrato funcional do experimento.
