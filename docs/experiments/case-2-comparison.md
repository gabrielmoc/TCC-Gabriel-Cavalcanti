# Comparação do Case 2 - Dataset Ampliado, Escala e Recursos

## Status

```text
Comparação consolidada em 31/08/2026 com dataset ampliado, carga moderada, carga forte e coleta de CPU, memória e sinais de cache.
```

## Resumo Executivo

O `Case 2` confirmou quatro pontos importantes para o TCC:

- o experimento escalou para um dataset maior sem quebrar a arquitetura;
- a instrumentação de CPU, memória e origem dos dados passou a funcionar de forma reproduzível;
- o `Redis` permaneceu tecnicamente ativo, com predominância clara de `HIT` nas rodadas cacheadas;
- mesmo assim, o ganho de desempenho ainda não apareceu de forma consistente no ambiente local atual.

Em termos metodológicos, isso é um resultado útil. O trabalho deixou de ser apenas uma validação funcional e passou a produzir evidência comparativa mais madura sobre escala, custo operacional e comportamento interno da otimização.

## Objetivo

Registrar a segunda leva experimental do TCC, comparando:

- `baseline` com dataset ampliado;
- `redis-cache` com dataset ampliado;
- carga `moderada` e `forte`;
- latência, throughput, CPU, memória e sinais de cache.

## Artigo de Referência

```text
[Artigo 2] Efficient API Traffic Optimization in Large-Scale Advertising Systems
```

## Escopo Experimental

Endpoint principal:

```text
GET /api/recommendations/:userId
```

Endpoint de apoio:

```text
GET /api/catalog
```

Dataset determinístico utilizado:

- `catalog.json` com `1500` itens;
- `users.json` com `240` usuários.

## Metodologia Aplicada

Perfis de carga executados:

- `moderado`: `5 -> 50` usuários virtuais, `20s` de subida, `45s` sustentando carga, `15s` de descida;
- `forte`: `10 -> 90` usuários virtuais, `40s` de subida, `120s` sustentando carga, `30s` de descida.

Repetições:

- `3` execuções por cenário;
- `3` execuções por endpoint;
- equivalência funcional preservada entre `baseline` e `redis-cache`.

Instrumentação coletada:

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- `CPU`;
- memória `RSS`;
- `cache HIT`;
- `cache MISS`;
- origem dos dados.

## Ajuste Metodológico Importante

Antes da consolidação final, houve uma primeira bateria que foi preservada apenas como histórico de descarte:

```text
results/baseline/case-2-descartado-pre-correcao/
results/redis-cache/case-2-descartado-pre-correcao/
```

Essas rodadas não devem ser usadas na análise oficial, porque foram executadas antes do ajuste de isolamento completo dos processos.

A bateria válida e oficial do `Case 2` é a seguinte:

```text
results/baseline/case-2/
results/redis-cache/case-2/
```

## Resultados - Recommendations

### Carga Moderada

| Métrica | Baseline | Redis Cache | Diferença |
| --- | ---: | ---: | ---: |
| Latência média | 74,03 ms | 65,42 ms | -8,61 ms |
| Latência p95 | 216,64 ms | 146,32 ms | -70,32 ms |
| Throughput | 167,32 req/s | 176,70 req/s | +9,38 req/s |
| Taxa de erro | 0 | 0 | 0 |
| CPU do Catalog | 20,32 Mµs | 41,63 Mµs | +21,31 Mµs |
| Memória RSS do Catalog | 72,05 MB | 167,46 MB | +95,41 MB |

Leitura:

- no endpoint principal, o cache ajudou na carga moderada;
- houve melhora de latência média e `p95`;
- o throughput também subiu;
- em contrapartida, o custo em `CPU` e memória do `Catalog Service` aumentou.

### Carga Forte

| Métrica | Baseline | Redis Cache | Diferença |
| --- | ---: | ---: | ---: |
| Latência média | 210,69 ms | 268,95 ms | +58,26 ms |
| Latência p95 | 323,50 ms | 443,22 ms | +119,72 ms |
| Throughput | 235,00 req/s | 198,29 req/s | -36,71 req/s |
| Taxa de erro | 0 | 0 | 0 |
| CPU do Catalog | 63,78 Mµs | 106,61 Mµs | +42,83 Mµs |
| Memória RSS do Catalog | 69,11 MB | 156,54 MB | +87,43 MB |

Leitura:

- na carga forte, o cache piorou o desempenho do fluxo principal;
- a latência subiu de forma relevante;
- o throughput caiu;
- o custo computacional do `Catalog Service` continuou maior no cenário com `Redis`.

## Resultados - Catalog

### Carga Moderada

| Métrica | Baseline | Redis Cache | Diferença |
| --- | ---: | ---: | ---: |
| Latência média | 71,11 ms | 87,23 ms | +16,12 ms |
| Latência p95 | 139,30 ms | 169,17 ms | +29,87 ms |
| Throughput | 167,46 req/s | 155,60 req/s | -11,86 req/s |
| Taxa de erro | 0 | 0 | 0 |
| CPU do Catalog | 19,14 Mµs | 34,54 Mµs | +15,40 Mµs |
| Memória RSS do Catalog | 76,64 MB | 141,09 MB | +64,45 MB |

### Carga Forte

| Métrica | Baseline | Redis Cache | Diferença |
| --- | ---: | ---: | ---: |
| Latência média | 305,78 ms | 342,64 ms | +36,87 ms |
| Latência p95 | 490,39 ms | 588,68 ms | +98,28 ms |
| Throughput | 174,64 req/s | 158,54 req/s | -16,10 req/s |
| Taxa de erro | 0 | 0 | 0 |
| CPU do Catalog | 49,12 Mµs | 91,68 Mµs | +42,55 Mµs |
| Memória RSS do Catalog | 82,14 MB | 161,01 MB | +78,87 MB |

Leitura:

- no endpoint de apoio, o cache não trouxe benefício nesta configuração;
- o cenário com `Redis` ficou mais pesado e mais lento;
- a diferença apareceu tanto na carga moderada quanto na forte.

## Comportamento do Cache

As rodadas válidas confirmaram:

- `cache.enabled=true`;
- `cache.connected=true`;
- predominância massiva de `HIT` após os primeiros acessos;
- baixo número de `MISS` em todas as execuções com `Redis`.

Exemplos consolidados:

- `recommendations` forte: média de `37.654,33` `HITs` e apenas `36,67` `MISS`;
- `catalog` forte: média de `30.126,33` `HITs` e apenas `9,67` `MISS`.

Isso mostra que o problema não foi “cache desligado”. O cache funcionou, mas não melhorou o desempenho neste ambiente.

## Interpretação Metodológica

O `Case 2` leva a uma conclusão mais madura do que a primeira entrega:

1. O `Redis` está implementado corretamente e sendo realmente utilizado.
2. O experimento agora já mede também custo computacional, e não só tempo de resposta.
3. No ambiente atual, o cache tende a aumentar consumo de memória e processamento no `Catalog Service`.
4. O ganho funcional do cache não se converteu em ganho global consistente de desempenho.

Isso sugere que, no escopo atual:

- a fonte local determinística ainda é barata demais;
- o custo de serialização, desserialização e acesso ao Redis pesa mais do que o benefício esperado;
- o próximo avanço do TCC não deve ser “insistir no Redis”, e sim introduzir um terceiro cenário de otimização com maior potencial arquitetural.

## Relação com o Artigo 2

O aproveitamento do Artigo 2 aconteceu do jeito metodologicamente correto para este TCC:

- não reproduzimos a solução complexa do artigo;
- reaproveitamos sua lógica de comparação sob múltiplas condições;
- ampliamos carga, dataset e leitura de recursos;
- observamos desempenho e custo ao mesmo tempo.

Assim, o `Case 2` conversa com a literatura pela forma de avaliar, e não por uma reprodução irreal da solução original.

## O Que Foi Concluído com o Case 2

- dataset ampliado e padronizado;
- coleta de CPU e memória funcionando;
- baterias moderadas e fortes executadas;
- comparação `baseline` vs `redis-cache` concluída;
- validação de `HIT` e `MISS` nas rodadas oficiais;
- evidências brutas organizadas por cenário, perfil e endpoint.

## Próximo Passo Recomendado

Com o `Case 2` fechado, o próximo passo mais forte para o TCC é:

- definir formalmente o terceiro cenário otimizado;
- escolher uma intervenção com maior chance de impactar o fluxo principal;
- repetir a comparação final com três cenários sob o mesmo protocolo.

## Resultados Brutos

Rodadas válidas do `Case 2`:

```text
results/baseline/case-2/moderado/recommendations/
results/redis-cache/case-2/moderado/recommendations/
results/baseline/case-2/moderado/catalog/
results/redis-cache/case-2/moderado/catalog/
results/baseline/case-2/forte/recommendations/
results/redis-cache/case-2/forte/recommendations/
results/baseline/case-2/forte/catalog/
results/redis-cache/case-2/forte/catalog/
```

Rodadas descartadas:

```text
results/baseline/case-2-descartado-pre-correcao/
results/redis-cache/case-2-descartado-pre-correcao/
```
