# Experimental Protocol

Este documento consolida as decisoes metodologicas da proxima etapa experimental do TCC.

## Objetivo desta fase

Fechar a comparacao inicial entre:
- baseline sem cache;
- cenario com Redis no `Catalog Service`.

Antes de introduzir o terceiro cenario otimizado, o foco e garantir que baseline e cache estejam:
- funcionalmente equivalentes;
- observaveis;
- comparaveis sob a mesma carga;
- reproduziveis.

## Endpoint principal do experimento

O endpoint principal da proxima etapa sera:

```text
GET /api/recommendations/:userId
```

Justificativa:
- representa melhor o fluxo distribuido da arquitetura;
- depende de multiplos servicos;
- tende a refletir mais claramente latencia, encadeamento e efeito indireto do cache.

Endpoints secundarios de apoio:

```text
GET /api/catalog
GET /api/catalog/:id
```

Esses endpoints ajudam a observar o efeito direto do Redis sobre o `Catalog Service`.

## Metricas obrigatorias

As metricas obrigatorias da fase experimental mais ampla serao:
- latencia;
- throughput;
- taxa de erro;
- uso de CPU;
- uso de memoria.

Na primeira bateria inicial ja executada, o foco ficou em:
- latencia media;
- latencia `p95`;
- throughput;
- taxa de erro.

## Criterios de comparacao

Para a comparacao entre baseline e cenario com cache ser valida:
- as rotas publicas devem permanecer identicas;
- o dataset deve permanecer identico;
- a logica de negocio deve permanecer identica;
- a carga funcional deve ser a mesma entre cenarios;
- a variavel principal introduzida deve ser apenas o cache no `catalog`.

## Repeticoes por cenario

Na primeira bateria formal, cada cenario deve ser executado pelo menos:

```text
3 repeticoes por padrao de carga
```

Se houver alta variacao entre resultados, o numero de repeticoes deve ser ampliado.

## Tratamento de execucoes inconsistentes

Uma execucao pode ser marcada como inconsistente se houver:
- falha evidente de infraestrutura local;
- indisponibilidade nao planejada de servicos;
- desvio funcional do comportamento esperado;
- erro de configuracao do cenario.

Execucoes descartadas devem ser registradas como descartadas, e nao apagadas sem anotacao.

## Estrutura inicial para salvar resultados

Os resultados devem ser organizados em `results/`, com uma estrutura como:

```text
results/
  baseline/
  redis-cache/
  optimized/
```

Dentro de cada cenario, a ideia e separar por padrao de carga e repeticao.

## Convencao inicial para nomear execucoes

Sugestao inicial:

```text
{cenario}/{padrao-carga}/run-{numero}
```

Exemplos:

```text
baseline/constant/run-01
redis-cache/ramp/run-02
```

## Estado atual da primeira entrega

Ja foi concluido:
- validacao manual do cenario com Redis pelas rotas publicas do `gateway`;
- primeira bateria controlada no `baseline`;
- primeira bateria controlada no `redis-cache`;
- consolidacao da comparacao inicial em `docs/experiments/first-comparison.md`.

## Proximo limite metodologico

O terceiro cenario otimizado ainda nao deve ser implementado nesta etapa.

Antes disso, precisamos:
- estabilizar baseline e cache;
- fechar observabilidade minima;
- preparar carga comparavel;
- executar a comparacao inicial com rigor.
