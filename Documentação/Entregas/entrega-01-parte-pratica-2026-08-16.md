# Entrega 01 - Parte Prática do TCC

**Data:** 16 de agosto de 2026  
**Aluno:** Gabriel Moura de Oliveira Cavalcanti  
**Curso:** Ciência da Computação  
**Instituição:** CESAR School  
**Orientador:** Matheus Garrido  
**Projeto:** Análise e Otimização de Desempenho em Sistemas de Streaming de Alta Escala

---

## 1. Objetivo desta entrega

Esta entrega tem como objetivo apresentar o estado atual da parte prática do TCC, mostrando:

- o que já foi implementado;
- como a arquitetura experimental foi estruturada;
- quais testes já foram realizados;
- onde estão os resultados;
- o que os resultados significam;
- quais são as limitações do estágio atual;
- quais serão os próximos passos metodológicos.

O foco desta primeira entrega prática não foi sofisticar o sistema desde o início, mas construir uma **base experimental funcional, controlada e reproduzível**, coerente com o escopo definido no Projeto de Pesquisa.

---

## 2. Resumo executivo

Até o momento, a primeira etapa prática do TCC foi concluída com sucesso.

Hoje o projeto já possui:

- uma arquitetura mínima funcional com `gateway`, `catalog`, `users` e `recommendations`;
- um cenário `baseline` implementado e validado;
- um segundo cenário com `Redis` aplicado ao `Catalog Service`;
- validação manual do comportamento de cache;
- observabilidade mínima com logs e cabeçalhos úteis para leitura experimental;
- testes de carga executados com `k6`;
- resultados salvos e organizados no repositório;
- uma primeira comparação experimental documentada, com tabelas, interpretação e gráficos.

Em termos metodológicos, a entrega de hoje permite afirmar que:

- o ambiente experimental já existe de forma concreta;
- os cenários comparados são funcionalmente equivalentes;
- a variável introduzida foi controlada;
- os testes já começaram a produzir evidências reais;
- a análise inicial já permite orientar as próximas decisões do TCC.

---

## 3. O que foi construído até agora

### 3.1 Arquitetura experimental implementada

Foi implementada uma arquitetura distribuída simplificada inspirada em sistemas de streaming, composta por quatro partes principais:

- `API Gateway`
- `Catalog Service`
- `Users Service`
- `Recommendations Service`

### 3.2 Responsabilidade de cada componente

#### API Gateway

Responsável por:

- ser o ponto de entrada externo da aplicação;
- receber as requisições;
- encaminhar para o serviço correto;
- preservar cabeçalhos relevantes de observação, como `X-Request-Id`, `X-Cache` e `X-Data-Source`.

#### Catalog Service

Responsável por:

- fornecer o catálogo de conteúdos;
- responder consultas ao catálogo completo ou por item;
- operar no baseline sem cache;
- operar no segundo cenário com cache Redis habilitável por ambiente.

#### Users Service

Responsável por:

- fornecer os dados mínimos dos usuários;
- disponibilizar preferências que serão usadas pelo serviço de recomendações.

#### Recommendations Service

Responsável por:

- consultar `users` e `catalog`;
- compor a resposta final de recomendações;
- representar o fluxo distribuído principal do experimento.

---

## 4. Rotas públicas atualmente implementadas

As rotas públicas consolidadas nesta etapa são:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

Essas rotas foram definidas para manter um contrato mínimo, suficiente para o baseline e para a comparação com o cenário com cache.

---

## 5. Estratégia metodológica adotada

A parte prática não foi construída de forma arbitrária.

O trabalho foi guiado por uma lógica metodológica compatível com o Projeto de Pesquisa:

1. primeiro foi estabelecido um **baseline funcional**;
2. depois foi introduzida uma única variável experimental controlada, que foi o cache com Redis no `Catalog Service`;
3. em seguida foram realizadas validações funcionais e testes de carga comparáveis;
4. por fim, os resultados foram registrados e analisados.

Essa estratégia foi escolhida para evitar que múltiplas mudanças acontecessem ao mesmo tempo e contaminassem a interpretação dos resultados.

---

## 6. Organização prática do repositório

A estrutura principal do projeto hoje está organizada da seguinte forma:

```text
gateway/
services/
  catalog/
  users/
  recommendations/
shared/
  datasets/
tests/
  smoke/
  load/
results/
docs/
  experiments/
Documentação/
  Entregas/
```

### 6.1 Onde está cada tipo de material

#### Implementação

- `gateway/`
- `services/catalog/`
- `services/users/`
- `services/recommendations/`

#### Datasets determinísticos

- `shared/datasets/catalog.json`
- `shared/datasets/users.json`

#### Testes funcionais

- `tests/smoke/`

#### Testes de carga

- `tests/load/`

#### Resultados brutos

- `results/`

#### Documentação analítica e comparativa

- `docs/experiments/`

#### Entregas para acompanhamento com o orientador

- `Documentação/Entregas/`

---

## 7. Datasets utilizados nesta etapa

Nesta primeira versão da parte prática, foi adotado um dataset **determinístico e local**, baseado em arquivos JSON.

Essa decisão foi tomada para:

- reduzir variáveis externas;
- evitar introduzir banco de dados real antes da estabilização do baseline;
- garantir repetibilidade;
- manter comparabilidade entre cenários.

Atualmente os arquivos utilizados são:

- `shared/datasets/catalog.json`
- `shared/datasets/users.json`

Isso significa que, nesta etapa, cada cenário processa essencialmente a mesma carga funcional e a mesma base de dados, variando apenas a presença ou ausência do cache.

---

## 8. Cenários experimentais tratados nesta entrega

### 8.1 Cenário 1 - Baseline

Neste cenário:

- não há cache;
- os serviços consultam diretamente os dados locais;
- o `gateway` apenas roteia;
- o `recommendations` consulta `users` e `catalog` para compor a resposta.

Esse é o cenário de referência para comparação.

### 8.2 Cenário 2 - Redis Cache no Catalog Service

Neste cenário:

- o `Redis` foi integrado ao `Catalog Service`;
- o cache pode ser ativado ou desativado por variável de ambiente;
- foram definidas chaves iniciais:

```text
catalog:all
catalog:{id}
```

- foi definido TTL inicial;
- foi implementado fallback se o Redis estiver indisponível;
- o contrato funcional do sistema foi mantido.

O objetivo deste segundo cenário foi introduzir a primeira variável experimental de otimização sem modificar o restante da arquitetura.

---

## 9. O que foi validado funcionalmente

Antes da execução dos testes de carga, foi feita uma validação funcional do sistema.

### 9.1 Baseline

Foi validado que:

- as rotas públicas respondem corretamente;
- o fluxo ponta a ponta funciona;
- `recommendations` consulta `users` e `catalog`;
- o baseline está funcionando sem cache.

### 9.2 Cenário com Redis

Foi validado que:

- a primeira chamada ao catálogo gera `MISS`;
- chamadas seguintes geram `HIT`;
- os headers `X-Cache` e `X-Data-Source` são retornados corretamente;
- a resposta funcional permanece idêntica à do baseline;
- o sistema continua respondendo mesmo quando o Redis está indisponível.

### 9.3 Onde estão essas evidências

As evidências da validação manual do Redis estão em:

```text
results/redis-cache/manual-validation/run-01
```

Ali estão salvos:

- headers das requisições;
- corpos de resposta;
- logs dos serviços;
- evidências de `MISS` e `HIT`.

---

## 10. Testes automatizados e scripts preparados

### 10.1 Smoke tests

Foram preparados testes funcionais iniciais em:

```text
tests/smoke/
```

Arquivos principais:

- `tests/smoke/baseline-smoke.js`
- `tests/smoke/catalog-cache-smoke.js`
- `tests/smoke/catalog-cache-fallback-smoke.js`

Esses testes ajudaram a validar a funcionalidade básica dos cenários.

### 10.2 Scripts de carga com k6

Foram preparados scripts de carga em:

```text
tests/load/
```

Arquivos principais:

- `recommendations-constant.js`
- `recommendations-ramp.js`
- `recommendations-ramp-strong.js`
- `recommendations-spike.js`
- `catalog-ramp.js`
- `run-strong-battery.sh`
- `aggregate-results.mjs`

Esses scripts permitem:

- aplicar diferentes perfis de carga;
- manter equivalência funcional entre cenários;
- automatizar a coleta da bateria forte;
- consolidar resultados agregados.

---

## 11. Como os testes de carga foram realizados

Nesta entrega foram executadas duas rodadas principais de teste.

### 11.1 Rodada exploratória inicial

Objetivo:

- validar a estabilidade inicial do ambiente;
- testar a estrutura de coleta;
- obter uma primeira leitura comparativa entre baseline e cache.

Configuração:

```text
Endpoint principal: GET /api/recommendations/:userId
Script: tests/load/recommendations-ramp.js
startVUs=1
targetVUs=15
rampUp=15s
sustain=20s
rampDown=10s
sleep=0.5s
repeticoes=3 por cenario
```

### 11.2 Bateria forte consolidada

Objetivo:

- gerar uma comparação mais forte e mais representativa;
- testar não apenas o endpoint principal, mas também o endpoint de apoio;
- produzir material mais consistente para apresentação ao orientador.

Configuração:

```text
Padrao: ramp-strong
startVUs=5
targetVUs=60
rampUp=30s
sustain=60s
rampDown=20s
sleep=0.1s
repeticoes=3 por cenario e por endpoint
```

Endpoints medidos:

- `GET /api/recommendations/:userId`
- `GET /api/catalog`

Justificativa:

- `recommendations` representa melhor o fluxo distribuído principal;
- `catalog` ajuda a enxergar o efeito direto do cache.

---

## 12. Onde estão os resultados

### 12.1 Rodada exploratória inicial

Baseline:

```text
results/baseline/ramp/
```

Redis cache:

```text
results/redis-cache/ramp/
```

Arquivos agregados:

- `results/baseline/ramp/aggregate-summary.json`
- `results/redis-cache/ramp/aggregate-summary.json`

### 12.2 Bateria forte - Recommendations

Baseline:

```text
results/baseline/ramp-strong/recommendations/
```

Redis cache:

```text
results/redis-cache/ramp-strong/recommendations/
```

Arquivos agregados:

- `results/baseline/ramp-strong/recommendations/aggregate-summary.json`
- `results/redis-cache/ramp-strong/recommendations/aggregate-summary.json`

### 12.3 Bateria forte - Catalog

Baseline:

```text
results/baseline/ramp-strong/catalog/
```

Redis cache:

```text
results/redis-cache/ramp-strong/catalog/
```

Arquivos agregados:

- `results/baseline/ramp-strong/catalog/aggregate-summary.json`
- `results/redis-cache/ramp-strong/catalog/aggregate-summary.json`

### 12.4 O que existe dentro dessas pastas

Dentro de cada execução há:

- `metadata.json`
- `k6-summary.json`
- `k6-output.txt`
- logs do `gateway`
- logs do `catalog`
- logs do `users`
- logs do `recommendations`
- no cenário com cache, também `redis.log`

---

## 13. Documento comparativo principal

O documento analítico principal desta entrega é:

```text
docs/experiments/first-comparison.md
```

Esse arquivo consolida:

- escopo do experimento;
- artigo-base escolhido;
- parâmetros das execuções;
- tabela da rodada exploratória;
- tabela da bateria forte;
- interpretação dos resultados;
- limitações;
- relação com a literatura;
- indicação dos caminhos dos resultados brutos.

Esse é o documento mais importante para leitura direta do orientador.

---

## 14. Gráficos e materiais visuais

Foram preparados gráficos e resumo visual em:

```text
docs/experiments/figures/
```

Arquivos:

- `recommendations-ramp-strong.svg`
- `catalog-ramp-strong.svg`
- `first-delivery-summary.svg`

Esses arquivos servem para:

- mostrar rapidamente a comparação visual entre os cenários;
- facilitar leitura em reunião;
- já criar uma base visual para futura adaptação ao texto do TCC.

---

## 15. Principais resultados obtidos

### 15.1 Rodada exploratória inicial

No endpoint `GET /api/recommendations/:userId`:

| Métrica | Baseline | Redis Cache |
| --- | ---: | ---: |
| Latência média | 4.57 ms | 4.66 ms |
| Latência p95 | 7.35 ms | 7.78 ms |
| Throughput | 21.75 req/s | 21.75 req/s |
| Taxa de erro | 0 | 0 |

Leitura:

- o sistema estava estável;
- o cache ainda não mostrava ganho perceptível;
- a rodada serviu principalmente como evidência exploratória inicial.

### 15.2 Bateria forte - Recommendations

| Métrica | Baseline | Redis Cache |
| --- | ---: | ---: |
| Latência média | 3.44 ms | 3.41 ms |
| Latência p95 | 8.97 ms | 8.70 ms |
| Throughput | 452.73 req/s | 452.78 req/s |
| Taxa de erro | 0 | 0 |

Leitura:

- houve melhora muito pequena na latência;
- o throughput permaneceu praticamente igual;
- o sistema ficou estável;
- o ganho ainda não é forte o suficiente para ser tratado como melhoria expressiva.

### 15.3 Bateria forte - Catalog

| Métrica | Baseline | Redis Cache |
| --- | ---: | ---: |
| Latência média | 2.65 ms | 2.69 ms |
| Latência p95 | 7.05 ms | 7.13 ms |
| Throughput | 456.52 req/s | 456.15 req/s |
| Taxa de erro | 0 | 0 |

Leitura:

- o cache não apresentou ganho mensurável;
- houve leve piora nas métricas, ainda dentro de um comportamento bastante próximo;
- o resultado sugere que, no ambiente atual, o custo adicional do cache pode estar neutralizando seus benefícios.

---

## 16. O que esses resultados significam

O principal significado dos resultados desta entrega é o seguinte:

### 16.1 A implementação está correta

O experimento não ficou apenas “planejado”; ele foi efetivamente implementado e executado.

Hoje já existe:

- sistema funcionando;
- cenário base definido;
- cenário com cache definido;
- observabilidade mínima;
- resultado medido;
- documentação comparativa pronta.

### 16.2 O sistema está estável

As execuções mantiveram:

- taxa de erro zero;
- throughput consistente;
- comportamento reprodutível entre as repetições.

### 16.3 O cache funciona tecnicamente, mas ainda não gerou ganho expressivo

Isso é um achado importante.

O experimento mostra que:

- introduzir cache não significa automaticamente melhorar desempenho;
- o contexto importa;
- dataset, custo da fonte original e estrutura do fluxo influenciam diretamente o efeito observado.

### 16.4 Esse resultado é metodologicamente válido

Mesmo sem ganho expressivo nesta etapa, a entrega continua forte porque:

- a comparação foi feita de forma controlada;
- a interpretação foi honesta;
- não houve manipulação artificial para forçar um resultado positivo;
- o experimento já ajuda a direcionar as próximas decisões.

---

## 17. Explicações prováveis para o ganho não ter aparecido ainda

As hipóteses mais plausíveis neste estágio são:

- o dataset ainda é pequeno;
- o acesso ao catálogo local via JSON é muito barato;
- o endpoint principal de recomendações depende também do `Users Service`;
- o `Recommendations Service` ainda precisa montar a resposta final, o que reduz o impacto isolado do cache;
- em ambiente local simples, o overhead adicional do Redis pode competir com o custo muito baixo da fonte de dados original.

Essas hipóteses ajudam a justificar por que a próxima etapa metodológica precisa evoluir o ambiente experimental antes de esperar ganhos mais nítidos.

---

## 18. Relação com a literatura

Esta primeira entrega foi conectada ao artigo-base:

```text
[Artigo 1] Profiling and Performance Optimization
```

A relação com a literatura aparece nos seguintes pontos:

- comparação entre cenário base e cenário otimizado;
- observação empírica do comportamento sob carga;
- uso de métricas como latência, `p95`, throughput e taxa de erro;
- preocupação com controle metodológico da variável introduzida.

Além disso, a entrega já aponta uma leitura importante: otimizações arquiteturais não devem ser assumidas como benéficas por definição; elas precisam ser medidas no contexto específico em que foram aplicadas.

---

## 19. O que já está 100% concluído nesta entrega

Está concluído:

- estruturação inicial do repositório;
- definição da arquitetura mínima;
- implementação do baseline;
- implementação do cenário com Redis no `Catalog Service`;
- validação funcional do baseline;
- validação funcional do cenário com Redis;
- observabilidade mínima;
- preparação dos testes de carga;
- execução da rodada exploratória inicial;
- execução da bateria forte;
- organização dos resultados;
- consolidação da comparação inicial;
- produção de gráficos e resumo visual.

Em outras palavras:

**a primeira entrega experimental da parte prática está concluída.**

---

## 20. O que ainda não está concluído no TCC como um todo

Apesar da entrega de hoje estar fechada, o TCC completo ainda possui etapas futuras relevantes, entre elas:

- expansão do dataset mantendo determinismo;
- coleta sistemática de CPU e memória;
- refinamento do protocolo experimental;
- definição e implementação do terceiro cenário otimizado;
- comparação entre três cenários;
- aprofundamento da análise técnica;
- incorporação dos resultados ao texto final do TCC.

Ou seja:

- a **entrega de hoje** está concluída;
- o **projeto inteiro** ainda continuará evoluindo nas próximas semanas.

---

## 21. Próximos passos sugeridos

Com base nos resultados obtidos, os próximos passos mais naturais são:

1. expandir o dataset sem perder determinismo;
2. começar a coletar CPU e memória;
3. executar cargas mais agressivas;
4. definir o terceiro cenário otimizado com base metodológica;
5. repetir a comparação com um ambiente mais exigente.

Esses passos são importantes porque a tendência atual é que o cache só passe a mostrar diferença mais clara quando o ambiente experimental estiver mais exigente.

---

## 22. Sugestão de fala curta para apresentação

Uma forma simples de apresentar esta entrega ao orientador é:

> “Professor, nesta primeira etapa prática eu priorizei montar uma base experimental funcional e reproduzível. Hoje eu já tenho a arquitetura mínima implementada com gateway, catalog, users e recommendations, um baseline funcionando, um segundo cenário com Redis no Catalog Service, validações manuais do comportamento de cache e duas rodadas de testes de carga executadas com k6. Os resultados já estão organizados, comparados e documentados. O principal achado até agora é que o cache foi implementado corretamente e o sistema ficou estável, mas o ganho de desempenho ainda não apareceu de forma relevante no ambiente atual, o que indica que a próxima evolução metodológica deve passar por expansão do dataset, coleta de CPU e memória e preparação do terceiro cenário otimizado.” 

---

## 23. Arquivos mais importantes para leitura do orientador

### Visão geral

- `README.md`

### Contrato do baseline

- `docs/baseline-contract.md`

### Cenário com Redis

- `docs/cache-scenario.md`

### Validação do Redis

- `docs/cache-validation.md`

### Protocolo experimental

- `docs/experimental-protocol.md`

### Planejamento experimental

- `docs/experiments/test-plan.md`

### Comparação principal

- `docs/experiments/first-comparison.md`

### Resultados brutos

- `results/`

### Gráficos

- `docs/experiments/figures/`

---

## 24. Conclusão

Esta entrega representa o fechamento da **primeira entrega experimental da parte prática do TCC**.

O projeto já saiu da fase puramente conceitual e agora possui:

- implementação prática;
- organização experimental;
- resultados medidos;
- documentação comparativa;
- interpretação inicial baseada em evidência.

O principal valor desta etapa está em ter estabelecido uma base metodologicamente limpa e tecnicamente funcional, a partir da qual os próximos cenários e análises poderão ser construídos com maior rigor.

