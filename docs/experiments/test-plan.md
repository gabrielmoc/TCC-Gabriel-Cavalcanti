# Plano Mestre de Testes

## Objetivo

Consolidar, em um único documento, todos os cenários de teste do TCC, desde os casos já executados até a bateria final prevista para a conclusão da parte prática.

Este plano tem quatro funções principais:
- mapear todos os cenários experimentais do trabalho;
- deixar explícito o status de cada etapa;
- padronizar métricas, saídas e critérios de comparação;
- servir como índice para os documentos detalhados de cada cenário.

## Escopo do Plano

Este plano cobre:
- validações funcionais do `baseline`;
- validações funcionais do cenário com `Redis`;
- baterias exploratórias e fortes já executadas;
- ampliação do dataset e da carga experimental;
- definição e teste do terceiro cenário otimizado;
- comparação consolidada entre todos os cenários até a versão final do TCC.

## Organização por Casos

Para manter a leitura acadêmica e operacional do TCC mais clara, os cenários deste plano estão agrupados em casos evolutivos:

- **Case 1 - Base funcional e primeira comparação experimental**
  - consolida o `baseline`;
  - introduz o `Redis` no `Catalog Service`;
  - executa as primeiras comparações sob carga;
  - já está concluído.
- **Case 2 - Escala, eficiência e uso de recursos**
  - reaproveita a mesma arquitetura e os mesmos cenários base;
  - amplia dataset e exigência de carga;
  - incorpora coleta de `CPU`, memória e sinais de eficiência;
  - constitui a próxima etapa prática do TCC.
- **Case 3 - Cenário otimizado final**
  - introduz a terceira estratégia de otimização;
  - fecha a comparação tripla do trabalho;
  - consolida a bateria final para a monografia.

## Princípios Metodológicos

Todos os cenários deste plano devem respeitar os seguintes princípios:
- manter equivalência funcional entre os cenários comparados;
- alterar apenas uma variável principal por vez, sempre que possível;
- reaproveitar o mesmo dataset da rodada comparada, salvo quando a ampliação do dataset for a própria variável do experimento;
- preservar o mesmo endpoint e o mesmo padrão de carga na comparação entre cenários;
- registrar evidências brutas em `results/`;
- registrar interpretação analítica em `docs/experiments/`.

## Estrutura da Documentação

O plano foi organizado em dois níveis:

- documento mestre:
  - `docs/experiments/test-plan.md`
- cenários detalhados:
  - `docs/experiments/scenarios/`

Cada cenário detalhado segue o mesmo padrão:
- objetivo;
- relação com a literatura;
- comparação prevista;
- endpoints;
- estratégia de carga;
- métricas;
- saídas esperadas;
- armazenamento;
- status.

## Matriz Geral dos Cenários

| ID | Cenário | Tipo | Status | Documento |
| --- | --- | --- | --- | --- |
| CT-01 | Validação funcional do `baseline` | Funcional | Concluído | `scenarios/01-validacao-baseline.md` |
| CT-02 | Validação funcional do `redis-cache` | Funcional | Concluído | `scenarios/02-validacao-redis.md` |
| CT-03 | Comparação exploratória `baseline` vs `redis-cache` | Carga inicial | Concluído | `scenarios/03-comparacao-exploratoria.md` |
| CT-04 | Comparação forte em `recommendations` e `catalog` | Carga forte | Concluído | `scenarios/04-comparacao-carga-forte.md` |
| CT-05 | Comparação com dataset ampliado | Carga + dataset | Concluído | `scenarios/05-comparacao-dataset-ampliado.md` |
| CT-06 | Comparação com observabilidade expandida | Observabilidade | Concluído | `scenarios/06-observabilidade-e-recursos.md` |
| CT-07 | Validação funcional do terceiro cenário otimizado | Funcional | Planejado | `scenarios/07-validacao-cenario-otimizado.md` |
| CT-08 | Comparação entre `baseline`, `redis-cache` e cenário otimizado | Carga comparativa | Planejado | `scenarios/08-comparacao-tripla.md` |
| CT-09 | Bateria final consolidada do TCC | Consolidação final | Planejado | `scenarios/09-bateria-final.md` |

## Enquadramento dos Cenários por Caso

| Caso | Escopo | Cenários |
| --- | --- | --- |
| **Case 1** | Base funcional e primeira comparação entre `baseline` e `redis-cache` | `CT-01`, `CT-02`, `CT-03`, `CT-04` |
| **Case 2** | Escala, eficiência e observabilidade expandida | `CT-05`, `CT-06` |
| **Case 3** | Cenário otimizado final e consolidação comparativa | `CT-07`, `CT-08`, `CT-09` |

## Cenários Já Executados

Até 31/08/2026, os seguintes cenários já foram efetivamente realizados:
- CT-01;
- CT-02;
- CT-03;
- CT-04.
- CT-05;
- CT-06.

Esses cenários já produziram:
- validação funcional do fluxo ponta a ponta;
- validação de `MISS`, `HIT` e `fallback` no `Catalog Service`;
- rodada exploratória inicial;
- bateria forte em `recommendations` e `catalog`;
- ampliação do dataset determinístico para `1500` itens de catálogo e `240` usuários;
- comparação em carga `moderada` e `forte` no `Case 2`;
- coleta de `CPU`, memória e origem dos dados por serviço;
- resultados brutos em `results/`;
- comparação inicial consolidada em `docs/experiments/first-comparison.md`;
- comparação do `Case 2` consolidada em `docs/experiments/case-2-comparison.md`.

## Cenários Ainda Necessários Até o Fim do TCC

Os cenários ainda previstos para fechar o trabalho são:
- CT-07: validar funcionalmente o terceiro cenário otimizado;
- CT-08: executar comparação tripla com a mesma carga funcional;
- CT-09: consolidar a bateria final com tabelas, gráficos e leitura comparativa completa.

## Definição Operacional do Case 2

O `Case 2` será tratado como a segunda grande leva experimental do projeto.

Seu objetivo é validar se o cenário com `Redis` passa a produzir diferença mais visível quando o experimento deixa de ser apenas funcional e passa a ser mais exigente em escala e eficiência.

Na prática, o `Case 2` envolve:
- ampliação do dataset determinístico;
- aumento do volume de requisições e da severidade da carga;
- manutenção do endpoint `GET /api/recommendations/:userId` como fluxo principal;
- uso de `GET /api/catalog` e `GET /api/catalog/:id` como apoio;
- coleta obrigatória de `CPU`, memória e `cache hit/miss`;
- comparação entre `baseline` e `redis-cache` sob o mesmo protocolo.

O `Case 2` **não** introduz uma nova arquitetura.

Ele é uma evolução experimental do `Case 1`, inspirada na lógica metodológica do Artigo 2, mas adaptada ao escopo real do TCC.

## Endpoints Prioritários

Endpoint principal do experimento:

```text
GET /api/recommendations/:userId
```

Endpoints secundários de apoio:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
```

Justificativa:
- `recommendations` representa melhor o fluxo distribuído;
- `catalog` evidencia o efeito direto do cache;
- `users` ajuda a verificar estabilidade do serviço auxiliar e a separar gargalos.

## Métricas Obrigatórias Até a Entrega Final

As métricas que devem estar presentes na versão final do experimento são:
- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- uso de CPU;
- uso de memória;
- taxa de `cache hit` e `cache miss`, quando aplicável.

Métricas complementares desejáveis:
- tempo mínimo e máximo por requisição;
- estabilidade entre repetições;
- comportamento sob crescimento gradual de carga.

## Padrões de Carga Previstos

Os padrões de carga previstos ao longo do TCC são:
- validação manual funcional;
- carga exploratória moderada;
- carga forte em rampa;
- carga forte com dataset ampliado;
- bateria comparativa final com todos os cenários.

O padrão exato de cada caso ficará documentado no arquivo do cenário correspondente.

## Saídas Obrigatórias

Cada cenário deve gerar, quando aplicável:

Saídas brutas:
- relatórios do `k6`;
- registros de execução;
- logs relevantes da aplicação;
- observações operacionais da rodada.

Saídas analíticas:
- tabela comparativa;
- gráfico ou visualização equivalente;
- interpretação objetiva dos resultados;
- decisão metodológica sobre o próximo passo.

## Convenção de Armazenamento

Resultados brutos:

```text
results/{cenario}/{padrao}/{execucao}
```

Interpretação e documentos:

```text
docs/experiments/
docs/experiments/scenarios/
docs/experiments/figures/
```

Exemplos:

```text
results/baseline/ramp/run-01
results/redis-cache/ramp-strong/recommendations/run-02
docs/experiments/first-comparison.md
docs/experiments/scenarios/04-comparacao-carga-forte.md
```

## Critérios Para Considerar um Cenário Concluído

Um cenário só deve ser marcado como concluído quando houver:
- execução funcional ou experimental finalizada;
- resultados salvos no local correto;
- interpretação documentada;
- decisão registrada sobre continuidade, repetição ou descarte.

## Ordem Recomendada de Execução Até o Final

1. Consolidar o `Case 2` como base metodológica já encerrada.
2. Definir formalmente o terceiro cenário otimizado.
3. Validar funcionalmente o terceiro cenário.
4. Executar comparação tripla sob a mesma carga funcional.
5. Consolidar a bateria final com leitura comparativa e visual.

## Relação com a Literatura

Este plano existe para garantir que os experimentos do TCC não sejam apenas implementações soltas, mas comparações metodologicamente orientadas por literatura e por critérios reproduzíveis.

Na prática, isso significa que:
- nem todo teste serve apenas para “ver se funciona”;
- parte dos cenários existe para validar a arquitetura experimental;
- parte existe para medir impacto real de otimização;
- parte existe para gerar evidência suficiente para discussão acadêmica.

## Índice dos Cenários Detalhados

- [01-validacao-baseline.md](./scenarios/01-validacao-baseline.md)
- [02-validacao-redis.md](./scenarios/02-validacao-redis.md)
- [03-comparacao-exploratoria.md](./scenarios/03-comparacao-exploratoria.md)
- [04-comparacao-carga-forte.md](./scenarios/04-comparacao-carga-forte.md)
- [05-comparacao-dataset-ampliado.md](./scenarios/05-comparacao-dataset-ampliado.md)
- [case-2-comparison.md](./case-2-comparison.md)
- [06-observabilidade-e-recursos.md](./scenarios/06-observabilidade-e-recursos.md)
- [07-validacao-cenario-otimizado.md](./scenarios/07-validacao-cenario-otimizado.md)
- [08-comparacao-tripla.md](./scenarios/08-comparacao-tripla.md)
- [09-bateria-final.md](./scenarios/09-bateria-final.md)
