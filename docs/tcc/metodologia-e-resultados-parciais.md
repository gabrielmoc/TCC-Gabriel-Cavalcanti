# Metodologia e Resultados Parciais dos Cases 1 e 2

> Texto acadêmico de apoio para transferência ao relatório técnico institucional. Atualizado em 09/09/2026. Esta versão cobre somente evidências já consolidadas; o terceiro cenário e as considerações finais permanecem pendentes.

## 3 Metodologia e Processo de Desenvolvimento

### 3.1 Caracterização da pesquisa

Esta pesquisa possui natureza aplicada, abordagem quantitativa e procedimento técnico experimental. É aplicada porque constrói e avalia um artefato computacional voltado ao estudo de desempenho de APIs em uma arquitetura distribuída. A abordagem é quantitativa porque compara cenários por meio de métricas numéricas. O estudo também possui caráter explicativo, pois busca identificar como alterações delimitadas na arquitetura influenciam o comportamento observado sob carga.

O experimento foi organizado para preservar o contrato funcional entre cenários e variar uma estratégia de otimização por vez. Dessa forma, resultados positivos, neutros ou negativos podem ser interpretados como evidências do contexto avaliado, sem pressupor que a adoção de uma tecnologia produz ganho automático.

### 3.2 Arquitetura experimental

O artefato é composto por quatro componentes implementados em Node.js com Express: um API Gateway, um Catalog Service, um Users Service e um Recommendations Service. O gateway é o ponto único de entrada externa e encaminha as requisições públicas aos serviços correspondentes. O Catalog Service fornece os dados de catálogo; o Users Service fornece preferências mínimas dos usuários; e o Recommendations Service consulta os dois serviços para produzir recomendações simplificadas.

As rotas públicas são `GET /api/catalog`, `GET /api/catalog/:id`, `GET /api/users/:id` e `GET /api/recommendations/:userId`. O endpoint de recomendações foi definido como fluxo principal do experimento, pois uma solicitação externa atravessa o gateway e gera chamadas internas aos serviços de usuários e catálogo. O endpoint de catálogo foi mantido como apoio para observar diretamente o efeito das configurações sobre o serviço em que o cache foi introduzido.

Os dados são armazenados em arquivos JSON locais e determinísticos. Essa decisão elimina, nas etapas iniciais, variáveis associadas a banco de dados, ORM, migrações e conexões externas. Assim, a comparação concentra-se na estratégia de obtenção dos dados de catálogo.

### 3.3 Cenários experimentais avaliados

Foram avaliados dois cenários nesta etapa:

1. **Baseline:** os dados são obtidos diretamente dos serviços responsáveis, sem mecanismo específico de otimização.
2. **Cache com Redis:** a arquitetura, as rotas, a lógica de recomendações e o dataset são mantidos; a única alteração é a inclusão de Redis como cache no Catalog Service.

No cenário com cache, as chaves `catalog:all` e `catalog:{id}` são utilizadas com TTL de 60 segundos. Em uma ausência de cache (`MISS`), o serviço consulta os dados locais e preenche o Redis; em um acerto (`HIT`), devolve o conteúdo armazenado. Se o Redis estiver indisponível, o serviço realiza fallback para os dados locais, preservando a resposta funcional.

O Case 1 corresponde à validação funcional e à primeira comparação entre baseline e Redis. O Case 2 não introduz uma nova tecnologia: ele amplia o dataset, a carga e a coleta de recursos para reavaliar a mesma estratégia em condições mais exigentes.

### 3.4 Variáveis e controle experimental

As variáveis independentes são o cenário experimental e o perfil de carga. As variáveis dependentes são latência média, percentil 95 de latência (p95), throughput, taxa de erro, uso de CPU, uso de memória RSS e, no cenário com Redis, eventos de `HIT` e `MISS`. Foram mantidos constantes, dentro de cada comparação, a arquitetura base, as rotas públicas, a regra de negócio, o dataset, a ferramenta de carga e os parâmetros do perfil executado.

No Case 1 foi utilizada uma massa local mínima. No Case 2, o dataset foi ampliado para 1.500 itens de catálogo e 240 usuários, mantendo determinismo e compatibilidade com os exemplos funcionais existentes. Esse aumento buscou tornar a avaliação mais representativa sem introduzir uma fonte externa de dados.

### 3.5 Execução dos testes

Os testes foram executados com k6. Cada combinação de cenário, endpoint e perfil de carga foi repetida três vezes. Uma execução é considerada inválida quando apresenta falha de infraestrutura, indisponibilidade não planejada de serviço, desvio funcional ou erro de configuração. Execuções inválidas foram preservadas como histórico de descarte e não foram utilizadas na análise oficial.

No Case 1, foi aplicada uma rampa de 5 a 60 usuários virtuais, com 30 segundos de subida, 60 segundos de sustentação e 20 segundos de descida. No Case 2, foram utilizados os seguintes perfis:

| Perfil | Usuários virtuais | Subida | Sustentação | Descida |
| --- | --- | ---: | ---: | ---: |
| Moderado | 5 a 50 | 20 s | 45 s | 15 s |
| Forte | 10 a 90 | 40 s | 120 s | 30 s |

Foram avaliados `GET /api/recommendations/:userId` e `GET /api/catalog`. Os resultados brutos foram armazenados por cenário, perfil, endpoint e repetição em `results/`. Os documentos comparativos registram agregações, tabelas, gráficos e interpretação dos resultados.

### 3.6 Observabilidade e análise

O gateway e os serviços registram informações de requisição, status e tempo de resposta. O Catalog Service também expõe a origem dos dados e o comportamento do cache, permitindo verificar `HIT`, `MISS` e fallback. No Case 2, foram coletados snapshots de CPU e memória RSS por serviço antes e depois das rodadas.

As métricas de CPU e memória são tratadas como indicadores de custo computacional e eficiência operacional. Não foi realizada medição elétrica direta de energia. A análise considera os resultados agregados das três repetições e evita atribuir causalidade a uma execução isolada.

## 3.7 Resultados Parciais e Discussão

### 3.7.1 Case 1 - Comparação inicial entre baseline e Redis

O primeiro caso validou que a introdução do Redis não alterou o contrato funcional do sistema. As rotas públicas retornaram os mesmos dados esperados nos cenários baseline e cache. Também foram confirmados os comportamentos de `MISS`, `HIT` e fallback: a primeira consulta sem entrada armazenada acessa os dados locais e preenche o cache; consultas subsequentes retornam a entrada armazenada; e a indisponibilidade do Redis não impede a resposta do serviço.

Na primeira bateria de carga, realizada com o mesmo perfil funcional nos dois cenários, não foi observado ganho expressivo e consistente nas métricas de latência e throughput. Esse resultado motivou a segunda leva experimental, que ampliou a massa de dados, introduziu perfis de carga moderado e forte e passou a observar CPU e memória. A ausência de ganho expressivo no primeiro caso não invalida o experimento; ela indica que a fonte local inicial possui custo reduzido e que o custo adicional do cache precisa ser avaliado em condições mais representativas.

Os dados detalhados da primeira comparação estão documentados em `docs/experiments/first-comparison.md`.

### 3.7.2 Case 2 - Dataset ampliado, carga e recursos

O segundo caso preservou os dois cenários anteriores e ampliou o dataset para 1.500 itens de catálogo e 240 usuários. Foram executadas três repetições para cada combinação de cenário, perfil de carga e endpoint. As rodadas oficiais mantiveram taxa de erro igual a zero e confirmaram que o Redis estava conectado, habilitado e predominantemente atendendo consultas por `HIT` após o aquecimento inicial.

#### 3.7.2.1 Endpoint de recomendações

Na carga moderada, o cenário com Redis apresentou menor latência média e p95, além de maior throughput. Na carga forte, porém, apresentou aumento de latência e redução de throughput. Em ambos os perfis, o custo de CPU e memória RSS do Catalog Service foi maior no cenário com cache.

| Perfil | Métrica | Baseline | Redis | Diferença Redis - Baseline |
| --- | --- | ---: | ---: | ---: |
| Moderado | Latência média | 74,03 ms | 65,42 ms | -8,61 ms |
| Moderado | Latência p95 | 216,64 ms | 146,32 ms | -70,32 ms |
| Moderado | Throughput | 167,32 req/s | 176,70 req/s | +9,38 req/s |
| Forte | Latência média | 210,69 ms | 268,95 ms | +58,26 ms |
| Forte | Latência p95 | 323,50 ms | 443,22 ms | +119,72 ms |
| Forte | Throughput | 235,00 req/s | 198,29 req/s | -36,71 req/s |

#### 3.7.2.2 Endpoint de catálogo

No endpoint de catálogo, o cenário com Redis foi mais lento e apresentou menor throughput tanto na carga moderada quanto na forte. Esse resultado é coerente com o custo adicional de serialização, desserialização e comunicação com o Redis quando a fonte original é um arquivo local de baixo custo.

| Perfil | Métrica | Baseline | Redis | Diferença Redis - Baseline |
| --- | --- | ---: | ---: | ---: |
| Moderado | Latência média | 71,11 ms | 87,23 ms | +16,12 ms |
| Moderado | Latência p95 | 139,30 ms | 169,17 ms | +29,87 ms |
| Moderado | Throughput | 167,46 req/s | 155,60 req/s | -11,86 req/s |
| Forte | Latência média | 305,78 ms | 342,64 ms | +36,87 ms |
| Forte | Latência p95 | 490,39 ms | 588,68 ms | +98,28 ms |
| Forte | Throughput | 174,64 req/s | 158,54 req/s | -16,10 req/s |

#### 3.7.2.3 Discussão dos resultados parciais

Os resultados demonstram que o Redis funcionou tecnicamente e preservou a funcionalidade da aplicação, mas seu efeito não foi uniforme. Houve melhora no fluxo de recomendações sob carga moderada, enquanto a configuração apresentou desempenho inferior sob carga forte e no endpoint direto de catálogo. A taxa de erro permaneceu igual a zero, de modo que a diferença observada está relacionada ao comportamento de desempenho e de recursos, e não a falhas funcionais.

Esse resultado reforça que cache não deve ser tratado como uma otimização universal. No ambiente avaliado, a fonte local determinística é barata, enquanto Redis introduz custos adicionais. A leitura está alinhada metodologicamente a Ji et al. (2025): em vez de reproduzir a solução de aprendizagem por reforço hierárquico proposta pelos autores, o presente trabalho adotou o princípio de comparar cenários equivalentes sob mais de uma intensidade de carga e observar recursos junto às métricas de desempenho.

Os dados completos, inclusive CPU, memória RSS, `HIT` e `MISS`, estão em `docs/experiments/case-2-comparison.md`. Os resultados brutos oficiais estão em `results/baseline/case-2/` e `results/redis-cache/case-2/`.

### 3.7.3 Limitações e estado atual

Os Cases 1 e 2 foram executados localmente, com dataset determinístico e fonte de dados em arquivos JSON. Portanto, seus resultados não devem ser generalizados diretamente para plataformas comerciais de streaming ou ambientes distribuídos de larga escala. CPU e memória representam indicadores de custo computacional, mas não substituem medição elétrica de consumo energético. Além disso, o terceiro cenário ainda não foi implementado, o que impede uma conclusão definitiva sobre qual estratégia oferece o melhor equilíbrio para o escopo deste TCC.

### 3.7.4 Resultados do terceiro cenário

> Seção reservada. Preencher somente após a implementação, validação funcional e execução das rodadas oficiais do terceiro cenário.

### 3.7.5 Comparação final entre os cenários

> Seção reservada. Preencher somente após a bateria final, mantendo o mesmo protocolo funcional para baseline, Redis e o cenário de indexação.
