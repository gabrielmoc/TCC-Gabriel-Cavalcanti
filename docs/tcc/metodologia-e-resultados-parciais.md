# Metodologia e Resultados Parciais da Matriz Final

> Texto acadêmico de apoio para o artigo científico. Atualizado em 18/09/2026. Os resultados históricos de baseline e Redis são preservados como evidência piloto; a matriz final é a base da comparação conclusiva.

## 3 Metodologia

### 3.1 Caracterização da pesquisa

Esta pesquisa possui natureza aplicada, abordagem quantitativa e procedimento técnico experimental. Ela constrói e avalia um artefato computacional para investigar o desempenho de uma API distribuída em condições de carga controladas. A análise quantitativa compara métricas numéricas entre configurações funcionalmente equivalentes, sem pressupor que uma tecnologia de otimização resulte automaticamente em ganho.

### 3.2 Arquitetura e fluxo avaliado

O artefato possui um API Gateway, Catalog Service, Users Service e Recommendations Service, implementados em Node.js com Express. O gateway recebe as requisições públicas; catálogo e usuários fornecem os dados necessários; recomendações combina preferências do usuário e itens compatíveis.

O fluxo oficial é `GET /api/recommendations/:userId`. Ele foi escolhido porque atravessa o gateway e aciona os componentes internos, representando uma operação mais próxima de uma consulta composta. O contrato público, a regra de recomendação e o payload são preservados em todos os cenários.

### 3.3 Dados determinísticos

O experimento usa arquivos JSON locais com 1.500 itens de catálogo e 240 usuários. A massa é determinística para garantir que cada repetição execute a mesma carga funcional. A escolha evita que banco de dados, ORM, migrações ou fontes externas confundam o efeito das estratégias de recuperação do catálogo.

### 3.4 Cenários tecnológicos

Três cenários são comparados:

| Cenário | Obtenção do catálogo | Alteração em relação ao baseline |
| --- | --- | --- |
| Baseline | Catalog Service com dataset local | Nenhuma estratégia adicional. |
| Redis | Catalog Service com cache Redis | Cache `catalog:all`, TTL de 60 s, com `HIT`, `MISS` e fallback. |
| Solr | Recommendations Service consulta índice Apache Solr | Recuperação indexada dos itens compatíveis, preservando a resposta pública. |

No Redis, uma ausência de cache consulta o dataset e preenche a chave; um acerto retorna o valor armazenado; se o Redis estiver indisponível, o serviço usa os dados locais. No Solr, o catálogo determinístico é indexado antes da rodada e o Recommendations Service consulta os documentos filtrados pelas preferências do usuário.

### 3.5 Cases por perfil de carga

Os cases representam perfis de carga, e não tecnologias. Cada perfil é executado nos três cenários tecnológicos, com três repetições por combinação.

| Case | Perfil | Configuração |
| --- | --- | --- |
| Case 1 | Baixa controlada | 1 a 5 usuários virtuais; 10 s de subida; 60 s de sustentação; 10 s de descida. |
| Case 2 | Alta sustentada | 10 a 90 usuários virtuais; 40 s de subida; 120 s de sustentação; 30 s de descida. |
| Case 3 | Variável | Estágios determinísticos entre 5, 30, 10 e 70 usuários virtuais durante 195 s. |

O desenho resulta em 27 rodadas: três cenários, três cases e três repetições. Antes de cada medição ocorre aquecimento do endpoint; assim, a primeira população do cache Redis não integra a janela de carga medida.

### 3.6 Métricas, observabilidade e validade

As métricas principais são latência média, percentil 95 de latência (p95), throughput e taxa de erro. Logs por requisição, cabeçalhos de origem e métricas dos serviços apoiam a validação funcional. Também são registrados snapshots de CPU e memória RSS antes e depois das rodadas como indicadores de custo computacional; não se afirma medição elétrica direta de consumo energético.

Uma execução é inválida quando ocorre falha de infraestrutura, serviço indisponível, desvio funcional ou erro de configuração. Resultados brutos, metadados e logs são salvos em `results/{cenario}/matriz-final/{case}/recommendations/run-{n}/`. As médias agregadas das três repetições sustentam as tabelas, gráficos e discussão final.

## 4 Resultados e Discussão [Parcial]

### 4.1 Evidências históricas e amadurecimento experimental

As rodadas anteriores de baseline e Redis validaram o contrato funcional, os comportamentos de `MISS`, `HIT` e fallback, além da instrumentação de CPU e memória. Elas também evidenciaram que o efeito do cache não foi uniforme: em dataset local de baixo custo, Redis pode não produzir ganho consistente e pode introduzir custo adicional.

Essas evidências motivaram a matriz final com dataset ampliado, endpoint único, três tecnologias e três perfis de carga. Os resultados históricos permanecem rastreáveis em `docs/experiments/first-comparison.md` e `docs/experiments/case-2-comparison.md`, mas não serão usados como comparação conclusiva sob a nova nomenclatura de cases.

### 4.2 Matriz final por perfil de carga

As 27 rodadas da matriz final estão sendo executadas sob condições controladas. A consolidação deve apresentar uma subseção para cada case, contendo configuração, tabela de médias, gráfico e interpretação comparativa entre baseline, Redis e Solr.

| Case | Situação | Artefato de resultados |
| --- | --- | --- |
| Case 1 - baixa controlada | Em execução | `results/{cenario}/matriz-final/case-1/` |
| Case 2 - alta sustentada | Em execução | `results/{cenario}/matriz-final/case-2/` |
| Case 3 - variável | Em execução | `results/{cenario}/matriz-final/case-3/` |

Após a conclusão das execuções válidas, a comparação consolidada será registrada em `docs/experiments/matriz-final-comparison.md`, com tabelas e gráficos gerados a partir dos resumos agregados.

### 4.3 Limitações parciais

Os testes são locais, usam dados determinísticos e não reproduzem uma plataforma comercial de streaming. Portanto, os achados devem ser interpretados no contexto do ambiente, da massa de dados, dos perfis de carga e dos recursos disponíveis. CPU e memória são indicadores operacionais, não substitutos de medição elétrica direta.
