# Entrega 02 - Planejamento da Segunda Leva Experimental

**Data:** 31 de agosto de 2026  
**Aluno:** Gabriel Moura de Oliveira Cavalcanti  
**Curso:** Ciência da Computação  
**Instituição:** CESAR School  
**Orientador:** Matheus Garrido  
**Projeto:** Análise e Otimização de Desempenho em Sistemas de Streaming de Alta Escala

---

## 1. Objetivo desta entrega

Esta segunda entrega tem como objetivo registrar o fechamento metodológico da próxima etapa prática do TCC.

O foco agora não é apresentar uma nova arquitetura pronta, mas mostrar que:

- os cenários de teste já foram mapeados até o fim do projeto;
- o `Case 2` já foi definido de forma clara;
- o Artigo 2 foi revisto com cautela;
- já existe um recorte objetivo do que será reaproveitado;
- a próxima fase prática já está organizada para execução.

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

## 3. O que foi alinhado nesta entrega

Nesta entrega foi consolidado o seguinte:

- atualização do plano mestre de testes para cobrir todo o ciclo experimental do TCC;
- organização dos cenários em casos evolutivos;
- definição explícita do `Case 2`;
- revisão crítica do Artigo 2, separando o que cabe e o que não cabe no escopo do TCC;
- definição do que deverá ser implementado, medido, executado e documentado na próxima fase.

---

## 4. Leitura crítica do Artigo 2

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

### 4.1 O que faz sentido aproveitar

- comparação justa entre cenários sob a mesma carga funcional;
- avaliação em mais de uma condição de carga;
- foco em latência, throughput, taxa de erro e recursos;
- leitura do efeito da otimização no fluxo do sistema, e não só em um componente isolado;
- preocupação com eficiência operacional, além de rapidez.

### 4.2 O que não faz sentido aproveitar agora

- `reinforcement learning`;
- múltiplos datacenters;
- treinamento offline e online;
- métricas de negócio de plataforma de anúncios;
- otimização autônoma em produção;
- estrutura completa de decisão hierárquica do artigo.

---

## 5. Definição do Case 2

O `Case 2` será a evolução experimental do `Case 1`, sem trocar a arquitetura base do projeto.

Em vez de criar um sistema novo, ele vai reaproveitar:

- o `baseline`;
- o cenário com `Redis`;
- o fluxo principal de `recommendations`;
- o mesmo contrato funcional das APIs.

O que muda no `Case 2` é o nível de exigência experimental.

### 5.1 Objetivo do Case 2

Verificar se o impacto do cache se torna mais visível quando o experimento passa a operar com:

- dataset maior;
- mais requisições;
- maior pressão de carga;
- medição explícita de `CPU`, memória e sinais de eficiência.

### 5.2 Interpretação metodológica

O `Case 2` não é uma tecnologia nova.

Ele é uma nova fase de avaliação do que já foi implementado, com foco em:

- escala;
- eficiência;
- uso de recursos;
- redução de trabalho repetido.

---

## 6. O que precisará ser implementado na próxima fase

Para viabilizar o `Case 2`, a próxima etapa prática deverá incluir:

- ampliação do dataset determinístico;
- preparação de massa maior de catálogo e usuários;
- coleta sistemática de `CPU` e memória;
- preparação de novas rodadas com carga mais agressiva;
- organização específica dos resultados da segunda entrega;
- criação do documento comparativo próprio do `Case 2`.

Não será necessário implementar, nesta fase:

- nova arquitetura distribuída;
- múltiplos datacenters;
- aprendizado por reforço;
- escalonamento inteligente baseado em IA.

---

## 7. O que deverá ser medido

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

### 7.1 Sobre energia

Nesta etapa, energia não será tratada como medição elétrica direta.

Ela será abordada como **aproximação de eficiência operacional**, usando principalmente:

- `CPU`;
- memória;
- eficiência por requisição;
- redução de trabalho redundante.

---

## 8. Rodadas previstas para o Case 2

As rodadas previstas são:

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

## 9. Como a documentação foi organizada

Para manter o projeto com nível acadêmico mais forte, a organização ficou assim:

### 9.1 Plano mestre

- `docs/experiments/test-plan.md`

Agora esse documento cobre todo o ciclo experimental do TCC, e não apenas a primeira comparação.

### 9.2 Cenários detalhados

- `docs/experiments/scenarios/`

Cada cenário possui arquivo próprio, mantendo o mesmo padrão de documentação.

### 9.3 Comparações analíticas

- `docs/experiments/first-comparison.md`

Esse arquivo continua concentrando a leitura da primeira comparação já executada.

### 9.4 Resultados brutos

- `results/`

Os resultados das próximas rodadas continuarão sendo salvos por cenário, padrão de carga e execução.

### 9.5 Entregas ao orientador

- `Documentação/Entregas/`

Essa pasta passa a guardar formalmente as entregas de acompanhamento do TCC prático.

---

## 10. O que já está concluído desta nova etapa

Até este momento, já está concluído:

- levantamento de todos os cenários de teste até o fim do TCC;
- reorganização do plano de testes em formato mestre;
- separação dos cenários em documentos próprios;
- revisão crítica do Artigo 2;
- definição conceitual e metodológica do `Case 2`.

---

## 11. O que ainda falta executar

As próximas ações práticas da segunda leva são:

- ampliar o dataset determinístico;
- preparar coleta de `CPU` e memória;
- definir e ajustar as novas rodadas de carga;
- executar `baseline` e `redis-cache` no novo contexto;
- consolidar a comparação da segunda entrega;
- só depois avançar para a definição do terceiro cenário.

---

## 12. Resumo final desta entrega

Esta entrega não representa ainda a execução do `Case 2`, mas o seu **fechamento metodológico e organizacional**.

Em outras palavras:

- o projeto já sabe quais cenários precisará executar até o fim;
- já existe uma leitura madura do que o Artigo 2 pode inspirar;
- o `Case 2` já está definido sem extrapolar o escopo do TCC;
- a próxima fase prática pode começar de forma mais segura, controlada e coerente com a orientação recebida.
