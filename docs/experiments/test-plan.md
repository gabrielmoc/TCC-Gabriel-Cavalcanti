# Plano Mestre de Testes

**Status:** matriz experimental final concluída em 18/09/2026.

## 1. Objetivo

Comparar o comportamento de três cenários tecnológicos em uma API de recomendações sob três perfis de carga. O objetivo não é assumir que cache ou indexação melhoram o desempenho, mas medir seus efeitos com contrato funcional, dados, endpoint e protocolo constantes.

## 2. Delimitação experimental

### 2.1 Cenários tecnológicos

| Cenário | Recuperação do catálogo | Situação |
| --- | --- | --- |
| `baseline` | Catalog Service com dataset local | Concluído |
| `redis-cache` | Catalog Service com Redis e fallback local | Concluído |
| `solr` | Recommendations Service consulta índice Apache Solr | Concluído |

### 2.2 Cases por perfil de carga

| Case | Perfil | Parâmetros | Finalidade |
| --- | --- | --- | --- |
| Case 1 | Baixa controlada | 1 a 5 VUs; 10 s de subida; 60 s de sustentação; 10 s de descida | Medir o custo base em demanda estável. |
| Case 2 | Alta sustentada | 10 a 90 VUs; 40 s de subida; 120 s de sustentação; 30 s de descida | Avaliar desempenho sob pressão prolongada. |
| Case 3 | Variável | Estágios de 5, 30, 10 e 70 VUs; 195 s totais | Observar picos e reduções de demanda. |

`Case` identifica exclusivamente o perfil de carga. `baseline`, `redis-cache` e `solr` são cenários tecnológicos comparados dentro de cada case.

## 3. Controle e validade

As 27 rodadas usam o mesmo endpoint (`GET /api/recommendations/:userId`), usuário de teste, regra de recomendação, dataset de 1.500 itens e 240 usuários, ferramenta k6 e três repetições por combinação. O endpoint é aquecido antes da medição; assim, a primeira população do Redis não compõe a janela de carga.

As métricas obrigatórias são latência média, p95, vazão e taxa de erro. Logs, cabeçalhos de origem, métricas dos serviços, CPU e memória RSS apoiam a inspeção operacional. Uma rodada seria descartada se apresentasse falha de infraestrutura, desvio funcional ou erro de configuração.

## 4. Execução e resultados

| Atividade | Situação | Evidência |
| --- | --- | --- |
| Validação funcional do baseline e Redis | Concluído | Testes de fumaça e validação de `HIT`, `MISS` e fallback. |
| Validação funcional do Solr | Concluído | `tests/smoke/solr-smoke.js`. |
| Case 1 nos três cenários | Concluído | `results/{cenario}/matriz-final/case-1/`. |
| Case 2 nos três cenários | Concluído | `results/{cenario}/matriz-final/case-2/`. |
| Case 3 nos três cenários | Concluído | `results/{cenario}/matriz-final/case-3/`. |
| Consolidação visual e interpretativa | Concluído | [matriz-final-comparison.md](matriz-final-comparison.md). |

O executor reproduzível está em `tests/load/run-final-matrix-suite.sh`. Os resumos agregados, metadados e métricas por rodada são versionados; logs por requisição são preservados localmente e ignorados pelo Git devido ao volume.

## 5. Evidências históricas

As primeiras comparações entre baseline e Redis foram úteis para validar o cache, ampliar o dataset e amadurecer a observabilidade. Elas não usam a nomenclatura oficial atual dos cases e não integram a comparação conclusiva:

- [first-comparison.md](first-comparison.md): primeira rodada exploratória;
- [case-2-comparison.md](case-2-comparison.md): rodada histórica com dataset ampliado e coleta de recursos.

Esses documentos são mantidos por rastreabilidade metodológica, não como plano ativo de execução.
