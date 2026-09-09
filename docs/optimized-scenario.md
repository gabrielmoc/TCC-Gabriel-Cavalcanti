# Cenário Otimizado - Indexação de Catálogo com Apache Solr

**Status:** definido metodologicamente em 09/09/2026; pendente de implementação e validação.

## Decisão

O terceiro cenário experimental do TCC será uma estratégia de **indexação do catálogo com Apache Solr**, consumida pelo `Recommendations Service` para recuperar itens compatíveis com as preferências do usuário.

Essa escolha não é uma extensão do cache com Redis. Ela representa uma intervenção distinta no fluxo principal: em vez de obter o catálogo completo e filtrar os itens na aplicação, o serviço de recomendações delegará a seleção ao mecanismo de busca indexada.

## Justificativa

Os Cases 1 e 2 demonstraram que Redis funciona corretamente como cache, mas não oferece ganho consistente no ambiente atual. Em especial, a fonte local de dados possui baixo custo e o cache adiciona custos de serialização, desserialização, comunicação e uso de recursos.

O fluxo de recomendações é o caminho mais representativo da arquitetura distribuída, pois combina preferências de usuários e dados de catálogo. A indexação permite avaliar uma otimização que atua diretamente sobre a recuperação e a filtragem desses itens. A escolha também está alinhada à orientação recebida para explorar indexação no processo de recomendação, sem tentar reproduzir soluções de alta complexidade, como aprendizagem por reforço hierárquico ou auto-scaling preditivo.

## Arquitetura prevista

```text
k6
 |
 v
API Gateway
 |
 v
Recommendations Service
 |                 |
 |                 +--> Users Service
 |
 +--> Apache Solr (índice do catálogo)
```

O `Catalog Service` continuará existindo e atendendo suas rotas públicas. No fluxo do endpoint `GET /api/recommendations/:userId`, o `Recommendations Service` consultará o Solr em vez de solicitar o catálogo completo ao `Catalog Service`.

## O que permanece constante

- rotas públicas e formato das respostas;
- lógica de identificação das preferências do usuário;
- dataset determinístico de 1.500 itens e 240 usuários;
- campos retornados em cada recomendação: `id`, `title`, `genre` e `year`;
- ferramenta de carga, ambiente local, perfis de carga e número de repetições;
- endpoint principal: `GET /api/recommendations/:userId`.

Para preservar comparabilidade funcional, a consulta ao índice deverá ordenar os resultados por `id` em ordem crescente e retornar os mesmos itens compatíveis que seriam produzidos pela filtragem atual para os usuários de teste.

## O que muda em relação aos outros cenários

| Elemento | Baseline | Redis | Solr indexado |
| --- | --- | --- | --- |
| Fonte do catálogo em recomendações | `Catalog Service` com dados locais | `Catalog Service` com cache opcional | Índice Apache Solr |
| Seleção por gênero | Aplicação | Aplicação | Consulta indexada |
| Variável experimental | Nenhuma otimização | Cache no catálogo | Indexação para o fluxo de recomendações |
| Contrato público | Igual | Igual | Igual |

## Hipóteses

- **H1:** o cenário indexado poderá reduzir a latência e melhorar o throughput do endpoint de recomendações em ao menos um perfil de carga, ao transferir a filtragem de catálogo para uma estrutura de busca indexada.
- **H2:** o ganho de desempenho, se ocorrer, será acompanhado de trade-offs de CPU e memória associados ao serviço de indexação.
- **H3:** a taxa de erro e o payload funcional devem permanecer equivalentes aos cenários anteriores.

As hipóteses são previsões a serem avaliadas, e não resultados antecipados.

## Implementação planejada

1. Preparar uma coleção Solr com os campos `id`, `title`, `genre` e `year`.
2. Criar um processo determinístico de indexação a partir de `shared/datasets/catalog.json`.
3. Fazer o `Recommendations Service` consultar preferências no `Users Service` e itens compatíveis no Solr.
4. Garantir ordenação estável e equivalência do payload em relação aos cenários anteriores.
5. Registrar métricas do Solr e do Recommendations Service.
6. Validar funcionalmente o cenário antes dos testes de carga.

A forma de execução local do Solr será decidida durante a implementação. Nenhuma ferramenta de conteinerização é presumida por este documento.

## Protocolo de validação

Antes de qualquer bateria de carga, devem ser confirmados:

- indexação completa do dataset de teste;
- retorno correto para usuários existentes e inexistentes;
- equivalência do payload de recomendações;
- ordenação determinística;
- indisponibilidade do Solr registrada de maneira explícita, sem mascarar erro de infraestrutura como resultado de desempenho;
- observabilidade suficiente para distinguir consultas ao índice das consultas ao catálogo nos cenários anteriores.

## Métricas e rodadas

As métricas obrigatórias serão latência média, p95, throughput, taxa de erro, CPU e memória RSS. Devem ser registrados também contadores de documentos indexados, consultas ao Solr e falhas de consulta.

O cenário será executado com três repetições nos perfis moderado e forte já adotados no Case 2. Depois de sua validação individual, uma comparação tripla aplicará exatamente o mesmo protocolo a baseline, Redis e Solr indexado.

## Limites do cenário

Este cenário não implementa aprendizado por reforço, auto-scaling, previsão de tráfego, otimização energética direta ou busca distribuída em múltiplos datacenters. CPU e memória serão utilizados como indicadores de custo computacional; não será feita medição elétrica direta de energia.

## Evidências futuras

```text
results/optimized/manual-validation/
results/optimized/case-3/moderado/recommendations/
results/optimized/case-3/forte/recommendations/
results/optimized/final-comparison/
```
