# Justificativa Bibliográfica dos Parâmetros Experimentais

## Objetivo

Este documento explicita a origem das escolhas da matriz final. Ele separa o que foi extraído da literatura do que foi calibrado no ambiente local. Essa distinção evita atribuir aos artigos valores de usuários virtuais ou durações que eles não propõem.

## Síntese da decisão

Os três cases representam perfis de tráfego, não tecnologias:

| Case | Perfil adotado | Base conceitual | Papel no experimento |
| --- | --- | --- | --- |
| Case 1 | Carga baixa controlada | Tráfego normal ou estável. | Estabelecer o custo-base de cada cenário. |
| Case 2 | Carga alta sustentada | Períodos de pico com pressão prolongada. | Observar latência de cauda, vazão e estabilidade sob estresse. |
| Case 3 | Carga variável | Crescimento, redução e novo pico de demanda. | Observar adaptação dos cenários à mudança de demanda na mesma rodada. |

Ji et al. (2025) avaliam tráfego normal, picos diários e semanais e condições anômalas. O trabalho também mede recuperação após anomalias de tráfego. O presente experimento reutiliza essa **lógica de diversidade de perfis**, mas não tenta reproduzir sua escala de produção, sua aprendizagem por reforço ou sua infraestrutura distribuída.

## O que cada referência fundamenta

| Referência | Contribuição aproveitada | Limite de reutilização |
| --- | --- | --- |
| Ji et al. (2025) | Comparar alternativas sob condições normal, de pico e variável; observar latência média e de cauda, vazão, erros e recursos. | Não fornece valores transferíveis de VUs ou duração para um ambiente local; opera em produção com mais de 2,5 milhões de requisições por segundo. |
| Smirnov (2025) | Combinar profiling, observabilidade e testes de carga para identificar gargalos; acompanhar tempo de resposta, requisições por segundo, erros, CPU e memória. | O texto apoia as métricas e o método de observação, não uma receita numérica de carga. |
| Thatikonda (2025) | Avaliar cache com métricas de acerto, latência de cauda, tempo médio, vazão, memória e carga do servidor. | Trata de gerenciamento de cache em infraestrutura cloud e aprendizagem de máquina, fora do escopo do artefato local. |
| Gbenle et al. (2025) | Relacionar variação de demanda à necessidade de avaliar desempenho, uso de CPU, memória e vazão em microsserviços. | Propõe autoescalabilidade preditiva; essa técnica não é implementada neste trabalho. |

## Origem dos valores numéricos

Os valores abaixo são uma **calibração operacional local**, realizada após as rodadas exploratórias iniciais. Eles foram escolhidos para produzir três condições distinguíveis sem ultrapassar a capacidade do ambiente e sem introduzir erros que invalidassem a comparação.

| Elemento | Valor final | Justificativa local |
| --- | --- | --- |
| Dataset | 1.500 itens e 240 usuários | Amplia a massa inicial preservando dados determinísticos e respostas comparáveis. Não representa um catálogo comercial. |
| Case 1 | 1 a 5 VUs; 10 s de subida; 60 s de sustentação; 10 s de descida | Produz uma janela estável de baixa concorrência para medir o custo-base. |
| Case 2 | 10 a 90 VUs; 40 s de subida; 120 s de sustentação; 30 s de descida | Produz pressão sustentada suficiente para expor diferença de vazão e latência, mantendo todas as execuções válidas. |
| Case 3 | 5 VUs iniciais; estágios de 30, 10 e 70 VUs; 195 s totais | Representa variação controlada por patamares: crescimento, redução e novo pico. Não deve ser descrito como injeção instantânea de anomalia. |
| Intervalo entre iterações | 0,15 s no Case 1; 0,10 s nos Cases 2 e 3 | Mantém comportamento de cliente determinístico e torna a carga mais intensa nos perfis de maior pressão. |
| Repetições | 3 por combinação | Reduz o impacto de oscilações pontuais do ambiente local e permite calcular médias; é um compromisso de viabilidade, não um número copiado dos artigos. |
| Aquecimento | Antes de cada execução medida | Evita que a primeira população do Redis seja confundida com desempenho em regime de cache aquecido. |

Portanto, não se afirma que “Ji et al. definiram 90 VUs” ou que “a literatura determina três repetições”. A redação correta é: **os perfis de carga e as métricas foram inspirados pela literatura; as intensidades e durações foram calibradas no ambiente experimental local e documentadas para reprodução.**

## Métricas

| Métrica | Motivo de uso | Referências de apoio |
| --- | --- | --- |
| Latência média | Resume o custo típico da requisição. | Ji et al. (2025); Smirnov (2025); Thatikonda (2025). |
| p95 | Evidencia degradação nas respostas mais lentas, que a média pode ocultar. | Ji et al. (2025); Thatikonda (2025). |
| Vazão | Mede requisições concluídas por segundo sob o mesmo perfil. | Ji et al. (2025); Smirnov (2025); Gbenle et al. (2025). |
| Taxa de erro | Verifica se eventual melhora de latência ocorre sem perda de estabilidade funcional. | Ji et al. (2025); Smirnov (2025). |
| CPU e memória RSS | Apoiam a leitura do custo computacional; não constituem medição direta de energia. | Ji et al. (2025); Smirnov (2025); Gbenle et al. (2025). |
| `HIT`, `MISS` e fallback | Confirmam o comportamento interno do cache Redis antes de interpretar desempenho. | Thatikonda (2025). |

## Relação com a matriz já executada

A matriz de 27 rodadas permanece válida: três cenários tecnológicos, três perfis e três repetições. Este documento não altera números ou resultados após a execução. Ele torna explícito o raciocínio que orientou o desenho e delimita corretamente as conclusões.

O Case 3 deve ser chamado de **carga variável com pico controlado**. Embora Ji et al. também estudem anomalias súbitas, o perfil local não injeta um salto instantâneo de 200%; ele aplica transições determinísticas entre patamares. Uma futura extensão poderia avaliar picos abruptos e tempo de recuperação como experimento adicional, mas isso não integra a matriz concluída.

## Como citar no artigo

Na metodologia, citar Ji et al. (2025) ao introduzir a necessidade de comparar condições normal, de pico e variável. Citar Smirnov (2025) e Thatikonda (2025) ao justificar o conjunto de métricas e a validação do cache. Em seguida, informar explicitamente que os valores numéricos foram calibrados no ambiente local após rodadas exploratórias e estão registrados em `docs/experiments/matriz-final.md`.

## Referências utilizadas nesta justificativa

GBENLE, Peter et al. *A Predictive Auto-Scaling Framework for Microservices in Distributed Systems: A Cost-Performance Optimization Approach for U.S. Enterprises*. International Journal of Academic Management Science Research, v. 9, n. 4, p. 364-388, 2025.

JI, Enkai; WANG, Yihan; XING, Suchuan; JIN, Jianian. *Hierarchical Reinforcement Learning for Energy-Efficient API Traffic Optimization in Large-Scale Advertising Systems*. IEEE Access, v. 13, p. 142493-142515, 2025. DOI: 10.1109/ACCESS.2025.3598712.

SMIRNOV, Andrei. *Methods for Detecting and Resolving Issues in API: Profiling and Performance Optimization*. 2025.

THATIKONDA, Kalyan Chakravarthy. *Methods and Processes for Optimization of Cloud API Performance Through AI Based Machine Learning Ensemble Cache Management*. International Journal of Advanced Research in Engineering and Technology, 2025.
