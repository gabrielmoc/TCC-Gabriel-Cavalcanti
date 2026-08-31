# Entrega 02 - Planejamento e Consolidação da Segunda Leva Experimental

**Data:** 31 de agosto de 2026  
**Aluno:** Gabriel Moura de Oliveira Cavalcanti  
**Curso:** Ciência da Computação  
**Instituição:** CESAR School  
**Orientador:** Matheus Garrido  
**Projeto:** Análise e Otimização de Desempenho em Sistemas de Streaming de Alta Escala

---

## 1. Objetivo desta entrega

Esta segunda entrega passou a registrar tanto o fechamento metodológico quanto a consolidação prática da segunda leva experimental do TCC.

O foco desta etapa foi mostrar que:

- os cenários de teste já foram mapeados até o fim do projeto;
- o `Case 2` já foi definido de forma clara;
- o Artigo 2 foi revisto com cautela;
- já existe um recorte objetivo do que será reaproveitado;
- a execução prática do `Case 2` foi concluída e documentada.

---

## 2. Síntese do momento atual

Ao final da primeira entrega experimental, o projeto já havia consolidado:

- `baseline` funcional;
- cenário com `Redis` no `Catalog Service`;
- validação funcional do cache;
- testes de carga iniciais;
- primeira comparação entre `baseline` e `redis-cache`.

O principal aprendizado daquela etapa foi:

- o cache funcionou tecnicamente;
- a arquitetura ficou estável e reproduzível;
- o ganho de desempenho ainda não apareceu de forma forte;
- isso indicou que o experimento precisava amadurecer em escala, dataset e uso de recursos.

Essa constatação motivou a preparação da segunda leva experimental.

---

## 3. Resumo técnico da semana

Nesta semana, a frente prática do TCC avançou em dois eixos ao mesmo tempo:

- consolidação metodológica do plano experimental;
- execução prática da segunda leva de testes.

Na parte de organização, o plano mestre de testes foi ampliado para cobrir todo o ciclo do TCC, e os cenários passaram a ficar documentados de forma estruturada em:

- `docs/experiments/test-plan.md`;
- `docs/experiments/scenarios/`.

Com isso, o projeto deixou de ter apenas um plano focado na primeira comparação e passou a ter um mapeamento completo dos casos até a etapa final do trabalho.

Na parte prática, o `Case 2` foi executado e consolidado. Esse caso reaproveita a mesma arquitetura do `Case 1`, mas eleva a exigência experimental por meio de:

- ampliação do dataset determinístico;
- aumento de carga;
- coleta de `CPU`, memória e sinais de cache;
- comparação controlada entre `baseline` e `redis-cache`.

Também foi identificado e corrigido um problema metodológico nas primeiras execuções do `Case 2`, relacionado ao isolamento das rodadas. As rodadas anteriores foram preservadas apenas como histórico de descarte metodológico, e a bateria oficial foi refeita do zero. Isso fortalece a confiabilidade da análise final.

---

## 4. O que foi alinhado nesta entrega

Nesta entrega foi consolidado o seguinte:

- atualização do plano mestre de testes para cobrir todo o ciclo experimental do TCC;
- organização dos cenários em casos evolutivos;
- definição explícita do `Case 2`;
- revisão crítica do Artigo 2, separando o que cabe e o que não cabe no escopo do TCC;
- definição do que deveria ser implementado, medido, executado e documentado na próxima fase;
- execução efetiva das rodadas do `Case 2`;
- consolidação dos resultados da segunda comparação experimental.

---

## 5. Leitura crítica do Artigo 2

O Artigo 2 apresenta uma solução de altíssima complexidade, baseada em:

- `hierarchical reinforcement learning`;
- múltiplos níveis de decisão;
- grande volume de telemetria histórica;
- ambiente de produção em larga escala;
- otimização simultânea de latência, throughput, valor de negócio e consumo energético.

Pela complexidade, o Artigo 2 não deve ser tratado como blueprint de implementação do TCC.

A leitura metodologicamente mais segura é:

- **não** reproduzir a solução técnica do artigo;
- **aproveitar** sua lógica de avaliação, comparação e análise.

### 5.1 Resumo do artigo

O artigo trata de otimização de tráfego de APIs em um ambiente de larga escala, com foco não apenas em rapidez, mas também em eficiência operacional. A proposta do artigo é muito mais ampla do que uma simples otimização local: ele considera decisões complexas sobre como distribuir melhor o tráfego e reduzir desperdícios em um sistema de produção altamente dinâmico.

Em outras palavras, o artigo mostra que melhorar desempenho em sistemas distribuídos não é só reduzir latência isoladamente. Também é preciso observar custo, comportamento sob carga, aproveitamento de recursos e efeito global da intervenção na arquitetura.

### 5.2 O que faz sentido aproveitar

- comparação justa entre cenários sob a mesma carga funcional;
- avaliação em mais de uma condição de carga;
- foco em latência, throughput, taxa de erro e recursos;
- leitura do efeito da otimização no fluxo do sistema, e não só em um componente isolado;
- preocupação com eficiência operacional, além de rapidez.

### 5.3 O que não faz sentido aproveitar agora

- `reinforcement learning`;
- múltiplos datacenters;
- treinamento offline e online;
- métricas de negócio de plataforma de anúncios;
- otimização autônoma em produção;
- estrutura completa de decisão hierárquica do artigo.

---

## 6. Definição do Case 2

O `Case 2` será a evolução experimental do `Case 1`, sem trocar a arquitetura base do projeto.

Em vez de criar um sistema novo, ele vai reaproveitar:

- o `baseline`;
- o cenário com `Redis`;
- o fluxo principal de `recommendations`;
- o mesmo contrato funcional das APIs.

O que muda no `Case 2` é o nível de exigência experimental.

### 6.1 Objetivo do Case 2

Verificar se o impacto do cache se torna mais visível quando o experimento passa a operar com:

- dataset maior;
- mais requisições;
- maior pressão de carga;
- medição explícita de `CPU`, memória e sinais de eficiência.

### 6.2 Interpretação metodológica

O `Case 2` não é uma tecnologia nova.

Ele é uma nova fase de avaliação do que já foi implementado, com foco em:

- escala;
- eficiência;
- uso de recursos;
- redução de trabalho repetido.

---

## 7. O que foi implementado e executado

Para viabilizar o `Case 2`, foram implementados e executados os seguintes pontos:

- ampliação do dataset determinístico;
- preparação de massa maior de catálogo e usuários;
- coleta sistemática de `CPU` e memória;
- coleta de `HIT`, `MISS` e origem dos dados no `Catalog Service`;
- preparação de rodadas moderadas e fortes com `k6`;
- execução de `baseline` e `redis-cache` nos dois perfis de carga;
- organização específica dos resultados da segunda entrega;
- criação do documento comparativo próprio do `Case 2`.

Implementações objetivas desta semana:

- `catalog.json` ampliado para `1500` itens;
- `users.json` ampliado para `240` usuários;
- instrumentação de métricas por serviço;
- snapshots antes e depois das rodadas;
- consolidação dos resultados válidos em `aggregate-summary.json`.

---

## 8. O que foi medido

As métricas centrais do `Case 2` serão:

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- uso de `CPU`;
- uso de memória;
- `cache hit`;
- `cache miss`.

Além disso, a análise deverá observar:

- se houve redução de acessos repetidos à fonte local;
- se o serviço passou a responder com menor esforço computacional;
- se houve indício de menor ociosidade e melhor aproveitamento dos recursos.

### 8.1 Sobre energia

Nesta etapa, energia não será tratada como medição elétrica direta.

Ela será abordada como **aproximação de eficiência operacional**, usando principalmente:

- `CPU`;
- memória;
- eficiência por requisição;
- redução de trabalho redundante.

---

## 9. Rodadas executadas no Case 2

As rodadas executadas foram:

1. `Baseline + dataset ampliado + carga moderada`
2. `Redis + dataset ampliado + carga moderada`
3. `Baseline + dataset ampliado + carga forte`
4. `Redis + dataset ampliado + carga forte`
5. rodada principal em `GET /api/recommendations/:userId`
6. rodada de apoio em `GET /api/catalog`

Essas rodadas deverão:

- usar a mesma lógica funcional entre os cenários;
- manter o mesmo endpoint principal na comparação;
- ser repetidas de forma padronizada;
- gerar saídas brutas e leitura analítica.

---

## 10. Principais resultados do Case 2

### 10.1 Endpoint principal - Recommendations

Na carga moderada, o cenário com `Redis` apresentou melhora no endpoint principal:

- latência média caiu de `74,03 ms` para `65,42 ms`;
- latência `p95` caiu de `216,64 ms` para `146,32 ms`;
- throughput subiu de `167,32 req/s` para `176,70 req/s`.

Na carga forte, porém, o comportamento se inverteu:

- latência média subiu de `210,69 ms` para `268,95 ms`;
- latência `p95` subiu de `323,50 ms` para `443,22 ms`;
- throughput caiu de `235,00 req/s` para `198,29 req/s`.

Leitura:

- o cache ajudou parcialmente em uma condição moderada;
- mas não sustentou ganho consistente quando a pressão aumentou.

### 10.2 Endpoint de apoio - Catalog

No endpoint `catalog`, o cenário com `Redis` não trouxe benefício nas rodadas oficiais:

- na carga moderada, a latência média subiu de `71,11 ms` para `87,23 ms`;
- na carga forte, subiu de `305,78 ms` para `342,64 ms`;
- o throughput também ficou inferior ao `baseline` nas duas situações.

Além disso, o custo de `CPU` e memória do `Catalog Service` ficou maior no cenário com `Redis`.

### 10.3 Interpretação técnica

O principal achado desta semana foi:

- o cache funciona tecnicamente;
- o `Redis` ficou ativo e com predominância clara de `HIT`;
- porém, no ambiente atual, o ganho de desempenho não foi consistente;
- em vários casos, o cenário com cache ficou mais pesado do que o `baseline`.

Isso sugere que:

- a fonte local determinística ainda é relativamente barata;
- o custo adicional de serialização, desserialização e acesso ao Redis pesa no ambiente atual;
- o TCC agora já tem evidência empírica suficiente para discutir custo x benefício da otimização, e não apenas seu funcionamento.

---

## 11. Como a documentação foi organizada

Para manter o projeto com nível acadêmico mais forte, a organização ficou assim:

### 11.1 Plano mestre

- `docs/experiments/test-plan.md`

Agora esse documento cobre todo o ciclo experimental do TCC, e não apenas a primeira comparação.

### 11.2 Cenários detalhados

- `docs/experiments/scenarios/`

Cada cenário possui arquivo próprio, mantendo o mesmo padrão de documentação.

### 11.3 Comparações analíticas

- `docs/experiments/first-comparison.md`
- `docs/experiments/case-2-comparison.md`

Esses documentos concentram a leitura consolidada do `Case 1` e do `Case 2`.

### 11.4 Resultados brutos

- `results/`

Os resultados das próximas rodadas continuarão sendo salvos por cenário, padrão de carga e execução.

### 11.5 Entregas ao orientador

- `Documentação/Entregas/`

Essa pasta passa a guardar formalmente as entregas de acompanhamento do TCC prático.

---

## 12. O que já está concluído desta nova etapa

Até este momento, já está concluído:

- levantamento de todos os cenários de teste até o fim do TCC;
- reorganização do plano de testes em formato mestre;
- separação dos cenários em documentos próprios;
- revisão crítica do Artigo 2;
- definição conceitual e metodológica do `Case 2`;
- ampliação do dataset determinístico;
- coleta de `CPU` e memória por serviço;
- execução das rodadas moderadas e fortes;
- consolidação da comparação entre `baseline` e `redis-cache`.

---

## 13. O que ainda falta executar

Com o `Case 2` encerrado, as próximas ações passam a ser:

- definir formalmente o terceiro cenário otimizado;
- implementar esse terceiro cenário;
- validar funcionalmente a nova configuração;
- preparar a comparação tripla final do TCC;
- consolidar a bateria final com tabelas, gráficos e interpretação comparativa.

---

## 14. Onde está a consolidação prática

Os principais artefatos finais desta entrega estão em:

- `docs/experiments/case-2-comparison.md`;
- `docs/experiments/test-plan.md`;
- `docs/experiments/scenarios/05-comparacao-dataset-ampliado.md`;
- `docs/experiments/scenarios/06-observabilidade-e-recursos.md`;
- `results/baseline/case-2/`;
- `results/redis-cache/case-2/`.

---

## 12. Resumo final desta entrega

Esta entrega não representa ainda a execução do `Case 2`, mas o seu **fechamento metodológico e organizacional**.

Em outras palavras:

- o projeto já sabe quais cenários precisará executar até o fim;
- já existe uma leitura madura do que o Artigo 2 pode inspirar;
- o `Case 2` já está definido sem extrapolar o escopo do TCC;
- a próxima fase prática pode começar de forma mais segura, controlada e coerente com a orientação recebida.
