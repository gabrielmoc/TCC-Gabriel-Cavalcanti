# Protocolo Experimental

Este documento consolida as decisões metodológicas da proxima etapa experimental do TCC.

## Objetivo desta fase

Fechar a comparação inicial entre:
- baseline sem cache;
- cenário com Redis no `Catalog Service`.

Antes de introduzir o terceiro cenário otimizado, o foco é garantir que baseline e cache estejam:
- funcionalmente equivalentes;
- observaveis;
- comparáveis sob a mesma carga;
- reproduziveis.

## Endpoint principal do experimento

O endpoint principal da proxima etapa será:

```text
GET /api/recommendations/:userId
```

Justificativa:
- representa melhor o fluxo distribuído da arquitetura;
- depende de múltiplos serviços;
- tende a refletir mais claramente latência, encadeamento e efeito indireto do cache.

Endpoints secundarios de apoio:

```text
GET /api/catalog
GET /api/catalog/:id
```

Esses endpoints ajudam a observar o efeito direto do Redis sobre o `Catalog Service`.

## Métricas obrigatórias

As métricas obrigatórias da fase experimental mais ampla serão:
- latência;
- throughput;
- taxa de erro;
- uso de CPU;
- uso de memória.

Na primeira bateria inicial já executada, o foco ficou em:
- latência média;
- latência `p95`;
- throughput;
- taxa de erro.

## Critérios de comparação

Para a comparação entre baseline e cenário com cache ser valida:
- as rotas públicas devem permanecer idênticas;
- o dataset deve permanecer idêntico;
- a lógica de negócio deve permanecer identica;
- a carga funcional deve ser a mesma entre cenários;
- a variável principal introduzida deve ser apenas o cache no `catalog`.

## Repetições por cenário

Na primeira bateria formal, cada cenário deve ser executado pelo menos:

```text
3 repetições por padrão de carga
```

Se houver alta variacao entre resultados, o número de repetições deve ser ampliado.

## Tratamento de execuções inconsistentes

Uma execução pode ser marcada como inconsistente se houver:
- falha evidente de infraestrutura local;
- indisponibilidade não planejada de serviços;
- desvio funcional do comportamento esperado;
- erro de configuração do cenário.

Execuções descartadas devem ser registradas como descartadas, e não apagadas sem anotacao.

## Estrutura inicial para salvar resultados

Os resultados devem ser organizados em `results/`, com uma estrutura como:

```text
results/
  baseline/
  redis-cache/
  optimized/
```

Dentro de cada cenário, a ideia e separar por padrão de carga e repeticao.

## Convenção inicial para nomear execuções

Sugestao inicial:

```text
{cenário}/{padrão-carga}/run-{número}
```

Exemplos:

```text
baseline/constant/run-01
redis-cache/ramp/run-02
```

## Estado atual da primeira entrega

Já foi concluído:
- validação manual do cenário com Redis pelas rotas públicas do `gateway`;
- primeira bateria controlada no `baseline`;
- primeira bateria controlada no `redis-cache`;
- bateria forte em `recommendations` e `catalog` com tres repetições por cenário;
- consolidação da comparação inicial em `docs/experiments/first-comparison.md`.

## Próximo limite metodologico

O terceiro cenário otimizado ainda não deve ser implementado nesta etapa.

Antes disso, precisamos:
- ampliar o dataset mantendo determinismo;
- introduzir monitoramento de CPU e memória;
- decidir o terceiro cenário com base metodológica e potencial de impacto real;
- continuar expandindo os testes de carga de forma controlada.
