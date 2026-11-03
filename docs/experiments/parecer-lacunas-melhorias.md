# Parecer de Lacunas da Revisao Final

## Objetivo e escopo

Este parecer confronta as orientacoes de `Documentação/Melhorias.pdf` com os
artefatos e a redacao atuais do TCC. Ele considera exclusivamente a matriz
final de 27 rodadas validas, localizada em
`results/{cenario}/matriz-final/{case}/recommendations/run-{01,02,03}/`.

Os status usados sao:

| Status | Significado |
| --- | --- |
| Atendida | A recomendacao esta coberta por dados rastreaveis e texto compativel. |
| Atendida com ressalva | A recomendacao foi atendida, mas a evidencia possui limite explicitado. |
| Nao atendida por ausencia de evidencia | Os artefatos existentes nao permitem a analise solicitada. |

Nenhum resultado ilustrativo do PDF de orientacao foi incorporado a este
parecer ou ao artigo.

## Classificacao das recomendacoes

| Recomendacao de `Melhorias.pdf` | Status | Evidencia atual | Decisao |
| --- | --- | --- | --- |
| Identificar e auditar as 27 rodadas, com metricas individuais e origem rastreavel. | Atendida | `matriz-final-auditoria.md`, Quadro 11 e os 27 `k6-summary.json`. | Manter como matriz oficial. |
| Calcular media, minimo, maximo, desvio padrao amostral e CV por combinacao. | Atendida | Quadro 12, calculado das tres repeticoes de cada combinacao. | Manter analise descritiva, sem significancia estatistica. |
| Explorar o Case 3 por estagio se existirem series temporais. | Atendida com ressalva | As 27 rodadas oficiais continuam agregadas; uma coleta complementar posterior de nove rodadas passou a registrar amostras temporais por estágio. | Apresentar o Quadro 15 e a Figura 7 como evidência complementar, sem recalcular ou substituir a matriz oficial. |
| Quantificar `HIT` e `MISS` do Redis quando os contadores forem comprovados. | Atendida | Quadro 13, calculado pela diferenca dos contadores antes e depois da janela medida. | Manter taxa de acerto e sua definicao no artigo. |
| Comparar latencia de operacoes classificadas como `HIT` e `MISS`. | Nao atendida por ausencia de evidencia | Nao ha registro por requisicao que una classificacao de cache e duracao comparavel. | Declarar limitacao; instrumentar e repetir apenas as rodadas Redis se o orientador considerar essencial. |
| Incorporar CPU e RSS somente sob definicoes comparaveis. | Atendida com ressalva | Quadro 14 soma os quatro processos Node.js; o Solr possui `docker stats` em escopo diferente. | Manter CPU/RSS como evidencia complementar e nao comparar diretamente com Redis ou Solr. |
| Distinguir validade experimental de desempenho observado. | Atendida | A Secao 3.6.2 separa os limiares operacionais dos critérios de validade e informa que ultrapassá-los isoladamente não invalida uma rodada com protocolo e registros válidos. | Manter. |
| Explicar executor `ramping-vus`, VUs, requisicoes, vazao e taxa de erro. | Atendida | Secao 3.6 e scripts oficiais `recommendations-ramp-strong.js` e `recommendations-variable.js`. | Manter. |
| Documentar infraestrutura, versoes e localizacao do gerador de carga. | Atendida com ressalva | Quadro 3 documenta host atual verificavel, Node.js, Redis, Solr, Docker e execucao local do k6. Versoes historicas de k6, Docker e Docker Compose nao foram registradas por rodada. | Declarar a limitacao historica; nao repetir, pois uma nova versao nao recupera o ambiente original. |
| Investigar por que Case 1 e Case 3 possuem valores absolutos diferentes. | Atendida | Metadados mostram protocolos distintos: Case 1 usa 1 a 5 VUs, 80 s e `sleepSeconds` de 0,15; Case 3 usa estagios de 195 s e `sleepSeconds` de 0,10. A Secao 4.2 impede comparação direta de valores absolutos entre cases. | Manter. |
| Reorganizar resultados, manter valores absolutos e explicitar a direcao favoravel das variacoes. | Atendida | Secao 4, Quadros 8 a 14 e Figuras 3 a 6. | Manter estrutura atual. |
| Usar figuras apenas sustentadas por dados existentes. | Atendida | Figuras de comparação usam médias e variações dos Quadros 8 a 10; a Figura 7 usa exclusivamente as nove séries temporais complementares. | Manter a separação entre matriz oficial e complemento temporal. |
| Discutir em tres camadas e relacionar a literatura sem equivalencia com producao. | Atendida | Secao 5.1, com observacao, interpretacao compativel e limitacao da evidencia. | Manter. |
| Limitar titulo, resumo, abstract e conclusoes ao ambiente local. | Atendida | Titulo e resumos revisados; Secao 5.2 delimita escopo local. | Manter. |
| Conferir autoria, veiculo e DOI das referencias usadas. | Nao atendida por ausencia de verificacao consolidada | As referencias estao listadas no artigo, mas ainda nao ha auditoria bibliografica referencia a referencia contra os PDFs originais. | Recuperar dos PDFs locais e das paginas oficiais dos veiculos, sem necessidade de nova rodada experimental. |

## Lacunas e decisao recomendada

| Pergunta cientifica ou metodologica | Evidencia ausente ou incompleta | Impacto no artigo | Recuperacao sem nova rodada | Risco de repetir | Decisao recomendada |
| --- | --- | --- | --- | --- | --- |
| Em qual estagio do Case 3 ocorreu cada variacao de latencia e vazao? | A matriz oficial não possui séries temporais; a coleta complementar registrou-as por estágio. | Impedia atribuir resultados da matriz oficial aos patamares de 30, 10 e 70 VUs. | Não para a matriz original; a lacuna foi complementada por nove novas rodadas separadas. | Executado de forma controlada, sem sobrescrever a matriz. | Usar Quadro 15 e Figura 7 apenas como evidência complementar posterior. |
| `HIT` foi mais rapido que `MISS` no Redis? | Duracao por requisicao associada ao estado do cache. | Impede explicar quantitativamente o efeito do cache. | Nao; os contadores existentes fornecem frequencia, nao tempo por evento. | Medio: instrumentacao no Catalog Service e nova bateria Redis podem alterar a carga observada. | Declarar limitacao. Instrumentar e repetir somente o cenario Redis se houver demanda explicita. |
| Qual foi o custo total de recursos de cada arquitetura? | Medidas equivalentes de host, Node.js, Redis e Solr durante o mesmo intervalo. | Impede comparar custo operacional total ou inferir energia. | Nao; `docker stats` do Solr e snapshots Node.js possuem escopos distintos. | Alto: requer desenho de coleta uniforme e nova matriz completa para preservar comparabilidade. | Manter recursos como evidencia complementar; nao repetir sem justificativa forte. |
| A diferenca de p95 do Redis e recorrente ou estatisticamente significativa? | Mais repeticoes independentes e plano estatistico predefinido. | Impede inferencia estatistica; nao impede descricao da matriz. | Nao; ha somente tres repeticoes por combinacao. | Medio/alto: exigiria ampliar todas as combinacoes comparadas e estabilizar o ambiente. | Declarar limitacao; nao repetir para transformar uma analise exploratoria local em teste inferencial. |
| Os ambientes historicos tinham exatamente as mesmas versoes de k6, Docker e Docker Compose? | Manifesto imutavel por rodada dessas versoes. | Limita reproducao bit a bit, nao a rastreabilidade dos numeros publicados. | Parcial: logs e configuracoes podem revelar detalhes adicionais, mas nao um manifesto ausente. | Alto e ineficaz: nova rodada nao reconstitui a versao historica. | Declarar limitacao e preservar as evidencias existentes. |
| Por que Case 1 e Case 3 nao devem ser comparados por valores absolutos? | A configuracao ja esta registrada, mas requer explicacao editorial integrada. | Evita leitura equivocada de que carga maior deveria sempre produzir latencia maior. | Sim: metadados e scripts definem VUs, duracao e `sleepSeconds` distintos. | Nao se aplica. | Recuperar dos artefatos e incluir explicacao na metodologia/discussao; nao repetir. |
| As referencias tem metadados bibliograficos corretos e completos? | Conferencia consolidada de autoria, ano, veiculo, paginas e DOI/URL. | Risco editorial, sem impacto nos resultados. | Sim: PDFs locais e fontes oficiais dos artigos. | Nao se aplica. | Executar auditoria bibliografica antes da entrega final. |

## Parecer para o orientador

A matriz experimental atual e suficiente para sustentar as conclusoes locais
ja redigidas: as 27 rodadas sao rastreaveis, as estatisticas descritivas foram
calculadas, o comportamento de cache foi quantificado por `HIT` e `MISS`, e as
evidencias de recursos foram delimitadas por escopo. Nao ha inconsistencia que
justifique refazer a matriz apenas para confirmar os resultados publicados.

As lacunas empiricas remanescentes sao a ausencia de latencia associada
individualmente a `HIT` e `MISS` e a ausencia de uma coleta uniforme de
recursos para toda a arquitetura. A lacuna temporal do Case 3 foi coberta por
uma coleta complementar de nove rodadas, com exportacao JSON do k6 por estágio.
Como essa coleta ocorreu posteriormente, ela permanece separada da matriz
oficial e não altera as médias nem a conclusão da comparação principal.

Permanece como ação sem novo experimento a auditoria das referências
bibliográficas contra seus PDFs e fontes oficiais. A redação sobre validade
experimental e a explicação de que Cases 1 e 3 possuem protocolos distintos
foram incorporadas ao texto do artigo.
