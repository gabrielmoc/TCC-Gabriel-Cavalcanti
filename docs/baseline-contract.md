# Baseline Contract

Este documento formaliza o contrato inicial do baseline da parte pratica do TCC.

## Objetivo

Definir a configuracao minima do sistema experimental antes da implementacao do cenario com cache ou de outras otimizacoes.

No baseline:
- nao ha cache;
- nao ha banco de dados real;
- nao ha outras tecnicas adicionais de otimizacao;
- os servicos usam dados locais deterministicos;
- o fluxo principal do experimento passa por comunicacao real entre microsservicos.

## Rotas publicas do experimento

As rotas publicas expostas pelo gateway no baseline sao:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

## Responsabilidades por servico

### Gateway

Responsabilidade:
- atuar como unico ponto de entrada externo;
- receber as requisicoes da carga gerada pelo `k6`;
- encaminhar a requisicao para o servico correto;
- registrar informacoes basicas de tempo e status;
- nao conter regra de negocio no baseline.

Rotas publicas:

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
- representar o catalogo de conteudos disponiveis na plataforma;
- fornecer dados deterministas locais para consulta;
- responder sem cache no baseline.

Rotas internas:

```text
GET /catalog
GET /catalog/:id
```

Exemplo minimo de item:

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
- representar informacoes minimas dos usuarios necessarias para personalizacao;
- fornecer dados deterministas locais para consulta;
- nao implementar autenticacao, cadastro ou regras adicionais fora do escopo experimental.

Rota interna:

```text
GET /users/:id
```

Exemplo minimo de usuario:

```json
{
  "id": 1,
  "name": "User 1",
  "preferredGenres": ["action", "sci-fi"]
}
```

### Recommendations Service

Responsabilidade:
- produzir uma recomendacao simplificada com base nos dados do usuario e do catalogo;
- consultar `users` e `catalog` durante o processamento;
- concentrar o fluxo principal de dependencia entre servicos no baseline.

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

Exemplo minimo de resposta:

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

## Definicao formal do baseline

O baseline deve ser entendido como a configuracao em que:
- todos os dados sao obtidos diretamente pelos servicos responsaveis;
- nao existe utilizacao de cache;
- o gateway atua exclusivamente como entrada e roteamento;
- o servico de recomendacoes realiza chamadas sincronas a `users` e `catalog`;
- a resposta final depende da cadeia real de chamadas entre os servicos.

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

O Redis nao faz parte do baseline.

No planejamento atual, seu primeiro uso previsto e no `catalog`, por ser o candidato mais natural a cache na primeira comparacao experimental.

Dados potencialmente cacheaveis em etapas posteriores:

```text
catalog:all
catalog:{id}
```

Possivelmente depois:

```text
recommendations:{userId}
```

Esse segundo caso nao faz parte da primeira versao com cache.

## Fonte de dados na primeira versao

Na primeira implementacao, os servicos devem usar dados locais deterministicos, por exemplo:
- arquivos JSON;
- estruturas carregadas em memoria.

Banco de dados real fica fora desta primeira versao para evitar introduzir uma variavel adicional de desempenho antes da estabilizacao do baseline.
