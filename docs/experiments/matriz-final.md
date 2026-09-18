# Matriz Experimental Final

## Decisão metodológica

Os cases do experimento passam a representar perfis de carga, conforme orientação do orientador. As tecnologias avaliadas são tratadas como cenários independentes: `baseline`, `redis-cache` e `solr`.

Essa separação evita comparar variáveis de natureza diferente. O perfil de carga define o case; a estratégia de recuperação do catálogo define o cenário tecnológico comparado em cada case.

Os perfis foram definidos com base na lógica de tráfego normal, de pico e variável discutida por Ji et al. (2025). Os valores de usuários virtuais e duração, por outro lado, foram calibrados no ambiente local após rodadas exploratórias; não são reproduções numéricas do artigo de referência. A justificativa completa está em [justificativa-parametros.md](justificativa-parametros.md).

## Matriz de comparação

| Case | Perfil de carga | Baseline | Redis | Solr | Repetições |
| --- | --- | --- | --- | --- | ---: |
| Case 1 | Baixa controlada | Sim | Sim | Sim | 3 |
| Case 2 | Alta sustentada | Sim | Sim | Sim | 3 |
| Case 3 | Variável | Sim | Sim | Sim | 3 |

O endpoint principal é `GET /api/recommendations/:userId`. Ele atravessa mais componentes e é o único afetado diretamente pelas três estratégias avaliadas.

## Perfis de carga

| Case | Parâmetros | Finalidade |
| --- | --- | --- |
| Case 1 — baixa controlada | 1 a 5 usuários virtuais; 10 s de subida; 60 s de sustentação; 10 s de descida | Observar o custo base de cada cenário em demanda estável e reduzida. |
| Case 2 — alta sustentada | 10 a 90 usuários virtuais; 40 s de subida; 120 s de sustentação; 30 s de descida | Submeter o fluxo principal a pressão prolongada e observar capacidade, latência de cauda e uso de recursos. |
| Case 3 — variável | 5 VUs iniciais; 30, 10 e 70 VUs em estágios determinísticos; 195 s no total | Observar estabilidade durante crescimento, redução e novo pico controlado de demanda na mesma rodada. |

Todos os perfis aplicam o mesmo usuário de teste, dataset de 1.500 itens e 240 usuários, contrato HTTP e regra de recomendação.

## Cenários tecnológicos

| Cenário | Recuperação de itens no fluxo de recomendações | Estado |
| --- | --- | --- |
| `baseline` | Consulta ao `Catalog Service`, que responde a partir do dataset local. | Implementado e avaliado. |
| `redis-cache` | Consulta ao `Catalog Service` com Redis habilitado e cache aquecido antes da medição. | Implementado e avaliado. |
| `solr` | Consulta direta ao índice Apache Solr, ordenada pelo identificador numérico do catálogo. | Implementado e validado funcionalmente. |

No cenário Solr, a rota pública e o payload não mudam. O `Recommendations Service` consulta o `Users Service` e recupera documentos indexados por gênero no Solr. A validação automatizada confirma equivalência de conteúdo e ordem em relação ao baseline.

## Protocolo de execução

1. Subir serviços em portas isoladas e verificar os endpoints de saúde.
2. Subir Redis ou Solr apenas quando exigido pelo cenário.
3. Indexar o catálogo determinístico antes de cada rodada Solr.
4. Aquecer o endpoint de recomendações antes da janela medida; no Redis, isso exclui o custo do primeiro preenchimento do cache.
5. Executar o k6 pelo gateway.
6. Coletar snapshots de métricas antes e depois da carga; no Solr, registrar também `docker stats`.
7. Salvar logs, metadados, saída do k6 e resumo JSON em `results/`.
8. Repetir três vezes cada combinação entre case e cenário.

## Métricas e evidências

As métricas primárias são latência média, p95, throughput e taxa de erro. CPU acumulada e memória RSS dos serviços Node.js são métricas complementares de custo computacional, e não medição elétrica direta. Para o Solr, as estatísticas do contêiner são preservadas como evidência complementar, pois sua execução ocorre em processo separado.

Os resultados oficiais são armazenados em:

```text
results/{cenario}/matriz-final/{case}/recommendations/run-{01..03}/
```

Cada case produz `aggregate-summary.json` após as três repetições. Os resultados anteriores permanecem em `results/*/ramp*` e `results/*/case-2/` como evidências históricas, sem serem apagados ou confundidos com esta matriz final.

Uma rodada só integra a comparação quando todos os serviços iniciam corretamente, o endpoint é funcionalmente válido, a taxa de erro não excede o limite do k6 e todos os arquivos de saída são gravados. Execuções inválidas são preservadas e excluídas da média oficial.
