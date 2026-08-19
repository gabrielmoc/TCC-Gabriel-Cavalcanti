# Baseline Contract

Este documento formaliza o contrato inicial do baseline da parte prática do TCC.

## Objetivo

Definir a configuração mínima do sistema experimental antes da implementação do cenário com cache ou de outras otimizacoes.

No baseline:
- não há cache;
- não há banco de dados real;
- não há outras técnicas adicionais de otimização;
- os serviços usam dados locais determinísticos;
- o fluxo principal do experimento passa por comunicação real entre microsserviços.

## Rotas públicas do experimento

As rotas públicas expostas pelo gateway no baseline são:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

## Responsabilidades por serviço

### Gateway

Responsabilidade:
- atuar como unico ponto de entrada externo;
- receber as requisições da carga gerada pelo `k6`;
- encaminhar a requisição para o serviço correto;
- registrar informações básicas de tempo e status;
- não conter regra de negócio no baseline.

Rotas públicas:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

Mapeamento interno esperado:

```text
/api/catalog/*          -> catalog
/api/users/*            -> users
/api/recommendations/*  -> recommendations
```

### Catalog Service

Responsabilidade:
- representar o catálogo de conteúdos disponíveis na plataforma;
- fornecer dados deterministas locais para consulta;
- responder sem cache no baseline.

Rotas internas:

```text
GET /catalog
GET /catalog/:id
```

Exemplo mínimo de item:

```json
{
  "id": 1,
  "title": "Movie A",
  "genre": "action",
  "year": 2025
}
```

### Users Service

Responsabilidade:
- representar informações mínimas dos usuários necessarias para personalização;
- fornecer dados deterministas locais para consulta;
- não implementar autenticação, cadastro ou regras adicionais fora do escopo experimental.

Rota interna:

```text
GET /users/:id
```

Exemplo mínimo de usuario:

```json
{
  "id": 1,
  "name": "User 1",
  "preferredGenres": ["action", "sci-fi"]
}
```

### Recommendations Service

Responsabilidade:
- produzir uma recomendacao simplificada com base nos dados do usuario e do catálogo;
- consultar `users` e `catalog` durante o processamento;
- concentrar o fluxo principal de dependência entre serviços no baseline.

Rota interna:

```text
GET /recommendations/:userId
```

Fluxo esperado:

```text
request
  ->
recommendations
  ->
GET users /users/:userId
  ->
descobre preferredGenres
  ->
GET catalog /catalog
  ->
filtra itens compativeis
  ->
response
```

Exemplo mínimo de resposta:

```json
{
  "userId": 1,
  "recommendations": [
    {
      "id": 10,
      "title": "Movie X",
      "genre": "action"
    },
    {
      "id": 18,
      "title": "Movie Y",
      "genre": "sci-fi"
    }
  ]
}
```

## Definição formal do baseline

O baseline deve ser entendido como a configuração em que:
- todos os dados são obtidos diretamente pelos serviços responsaveis;
- não existe utilização de cache;
- o gateway atua exclusivamente como entrada e roteamento;
- o serviço de recomendações realiza chamadas sincronas a `users` e `catalog`;
- a resposta final depende da cadeia real de chamadas entre os serviços.

Representacao resumida:

```text
k6
  ->
gateway
  ->
recommendations
  ->
users
  ->
catalog
  ->
gateway
  ->
response
```

## Papel futuro do Redis

O Redis não faz parte do baseline.

No planejamento atual, seu primeiro uso previsto e no `catalog`, por ser o candidato mais natural a cache na primeira comparação experimental.

Dados potencialmente cacheaveis em etapas posteriores:

```text
catalog:all
catalog:{id}
```

Possivelmente depois:

```text
recommendations:{userId}
```

Esse segundo caso não faz parte da primeira versão com cache.

## Fonte de dados na primeira versão

Na primeira implementação, os serviços devem usar dados locais determinísticos, por exemplo:
- arquivos JSON;
- estruturas carregadas em memória.

Banco de dados real fica fora desta primeira versão para evitar introduzir uma variável adicional de desempenho antes da estabilizacao do baseline.
