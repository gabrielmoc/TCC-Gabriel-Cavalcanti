# Análise Comparativa de Desempenho de Estratégias de Recuperação de Dados em uma Arquitetura de Microsserviços Inspirada em Plataformas de Streaming

<p align="center">
  Parte prática do Trabalho de Conclusão de Curso em Ciência da Computação<br />
  <strong>CESAR School</strong>
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/backend-Node.js-3c873a?style=flat-square&logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/framework-Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img alt="Redis" src="https://img.shields.io/badge/cache-Redis-d82c20?style=flat-square&logo=redis&logoColor=white" />
  <img alt="Apache Solr" src="https://img.shields.io/badge/search-Apache%20Solr-d9411e?style=flat-square" />
  <img alt="k6" src="https://img.shields.io/badge/load%20test-k6-6b46c1?style=flat-square&logo=k6&logoColor=white" />
</p>

## Visão geral

Este repositório contém a implementação, os protocolos e as evidências experimentais do TCC. O estudo compara estratégias de recuperação de catálogo em uma arquitetura local de microsserviços inspirada em plataformas de streaming, preservando o mesmo contrato público e um dataset determinístico.

O fluxo principal avaliado é `GET /api/recommendations/:userId`. A comparação é restrita ao ambiente local e não pretende reproduzir o desempenho de plataformas comerciais de streaming.

## Escopo consolidado

| Eixo | Definição |
| --- | --- |
| Cenários tecnológicos | `baseline`, `redis-cache` e `solr`. |
| Estratégia baseline | Recuperação do catálogo a partir de dados locais. |
| Estratégia Redis | Cache no `Catalog Service`. |
| Estratégia Solr | Recuperação indexada no fluxo de recomendações. |
| Cases de carga | Baixa controlada, alta sustentada e carga variável. |
| Matriz oficial | 27 rodadas: 3 cenários x 3 cases x 3 repetições. |
| Métricas principais | Latência média, p95, vazão e taxa de erro. |
| Evidências complementares | CPU e RSS dos processos Node.js, contadores de cache e coleta temporal do Case 3. |

Os parâmetros oficiais dos cases estão em [matriz-final.md](docs/experiments/matriz-final.md), e a justificativa de calibração está em [justificativa-parametros.md](docs/experiments/justificativa-parametros.md).

## Resultados e limites

A matriz final foi concluída e auditada. No ambiente avaliado, o baseline apresentou a menor latência média e a maior vazão nos três perfis; Redis apresentou o menor p95 médio no Case 1, mas sem evidência de ganho consistente nas demais métricas; Solr preservou a equivalência funcional, com custo adicional no fluxo local observado.

Esses resultados não isolam causalidade por componente e não permitem generalizações para outros ambientes. CPU e RSS abrangem somente os processos Node.js; as métricas do contêiner Solr permanecem como evidência complementar, em escopo distinto. A coleta temporal do Case 3 foi realizada posteriormente e não substitui a matriz oficial.

Documentos de apoio:

- [Comparação da matriz final](docs/experiments/matriz-final-comparison.md)
- [Auditoria das 27 rodadas oficiais](docs/experiments/matriz-final-auditoria.md)
- [Resultados temporais complementares do Case 3](docs/experiments/case-3-temporal-complement-results.md)
- [Limites e lacunas da evidência](docs/experiments/parecer-lacunas-melhorias.md)

## Arquitetura

A arquitetura é composta por um `API Gateway` e três microsserviços Node.js/Express:

- `Catalog Service`: fornece os itens do catálogo e, no cenário Redis, controla o cache;
- `Users Service`: fornece perfis e preferências dos usuários;
- `Recommendations Service`: combina preferências e catálogo para gerar recomendações;
- `API Gateway`: expõe as rotas públicas e encaminha as requisições.

No baseline e no Redis, o catálogo é recuperado pelo `Catalog Service`. No cenário Solr, o `Recommendations Service` consulta o índice. Diagramas e detalhes dos fluxos estão em [arquitetura-final.md](docs/arquitetura-final.md).

## Reprodução local

### Pré-requisitos

- Node.js na versão definida em [`.nvmrc`](.nvmrc);
- Redis (`redis-server`);
- Docker e Docker Compose, para o Solr;
- k6, para os testes de carga.

Prepare as dependências e valide primeiro a sintaxe dos serviços e, em seguida, os cenários funcionais:

```bash
scripts/bootstrap.sh
npm test
npm run test:smoke
```

`npm test` executa validação sintática dos quatro serviços. A suíte `test:smoke` inicia os componentes necessários e valida os fluxos baseline, Redis, fallback e Solr. Os comandos `npm run test:matrix` e `npm run test:case3-temporal` existem para reexecutar, respectivamente, a matriz oficial e a coleta complementar do Case 3; eles sobrescrevem artefatos de resultado e não devem ser usados apenas para consulta.

Para iniciar os serviços manualmente:

```bash
npm --prefix services/catalog start
npm --prefix services/users start
npm --prefix services/recommendations start
npm --prefix gateway start
```

Para o Redis, defina `CATALOG_CACHE_ENABLED=true` e inicie `redis-server`. Para o Solr, execute `docker compose up -d solr`, indexe o catálogo com `node services/solr/index-catalog.mjs` e defina `CATALOG_RETRIEVAL_MODE=solr` antes de iniciar o `Recommendations Service`.

Os procedimentos da matriz e da coleta complementar estão documentados em [matriz-final.md](docs/experiments/matriz-final.md) e [complemento-temporal-case-3.md](docs/experiments/complemento-temporal-case-3.md).

## Organização do repositório

```text
.
├── gateway/                 # API Gateway
├── services/                # Catalog, Users, Recommendations e Solr
├── shared/                  # Dataset, utilitários HTTP e métricas de runtime
├── scripts/                 # Bootstrap e suíte smoke
├── tests/
│   ├── load/                # Scripts k6 e consolidação dos resultados
│   └── smoke/               # Validação funcional dos cenários
├── results/                 # Evidências da matriz e da coleta complementar
├── docs/
│   ├── arquitetura-final.md
│   ├── experiments/         # Protocolos, auditoria, comparações e figuras
│   └── tcc/                 # Síntese metodológica e de resultados
└── README.md
```

## Rastreabilidade

Os artefatos são organizados por cenário, case e repetição. A matriz oficial preserva metadados, resumos do k6, logs e métricas de runtime das 27 rodadas utilizadas no artigo. Rodadas exploratórias e execuções anteriores à padronização do isolamento de processos foram mantidas apenas como histórico e não integram a comparação final.

## Referências centrais

- APACHE SOFTWARE FOUNDATION. *Apache Solr Reference Guide*. 2026.
- BASS, Len; CLEMENTS, Paul; KAZMAN, Rick. *Software Architecture in Practice*. 4. ed. 2021.
- DEAN, Jeffrey; BARROSO, Luiz André. The tail at scale. *Communications of the ACM*, 2013.
- JI, et al. Estudo de gerenciamento de tráfego e condições de demanda. 2025.
- KAMAU, Peter; MYLLYNEN, Jari. Estudo de autoescalabilidade preditiva em microsserviços. 2025.
- NEWMAN, Sam. *Building Microservices*. 2. ed. 2021.
- RICHARDSON, Chris. *Microservices Patterns*. 2018.
- SIGELMAN, Benjamin H. et al. Dapper, a Large-Scale Distributed Systems Tracing Infrastructure. 2010.
- SMIRNOV, Anton. Estudo de profiling, testes de carga e análise de gargalos. 2025.
- THATIKONDA, Prasanth. Estudo de cache e métricas de desempenho. 2025.

As referências bibliográficas completas constam do artigo final. Este README lista apenas as fontes diretamente associadas ao desenho experimental e à interpretação da implementação.

## Contexto acadêmico

| | |
| --- | --- |
| Instituição | CESAR School |
| Curso | Ciência da Computação |
| Natureza | Trabalho de Conclusão de Curso |
| Área | Sistemas Distribuídos e Engenharia de Software |
| Autor | Gabriel Moura de Oliveira Cavalcanti |
| Orientador | Matheus Garrido |
