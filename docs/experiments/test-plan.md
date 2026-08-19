# Plano de Testes - Primeira Entrega Experimental

## Objetivo

Documentar o planejamento do primeiro caso experimental que será apresentado ao orientador.

O foco desta primeira entrega é:
- deixar claro o caso experimental escolhido;
- mostrar sua relação com a literatura;
- definir métricas e saídas esperadas;
- preparar a execução comparativa entre `baseline` e `redis-cache`.

## Status Atual

Em 16/08/2026, esta primeira entrega já passou de planejamento para execução concluída:
- validação manual do cenário com Redis concluída;
- rodada exploratória inicial concluída;
- bateria forte em `recommendations` e `catalog` concluída;
- comparação consolidada em `first-comparison.md`.

## Artigo de Referência

Artigo-base escolhido:

```text
[Artigo 1] Profiling and Performance Optimization
```

## Por Que Este Artigo

Este artigo foi escolhido como base do primeiro entregável porque conversa diretamente com:
- análise de desempenho em APIs;
- identificação de gargalos;
- observação do comportamento entre serviços;
- uso de cache como estratégia de otimização;
- comparação entre comportamento base e comportamento otimizado.

## Comparação Inicial

Comparação principal desta etapa:

```text
baseline sem cache
vs
cenário com Redis no Catalog Service
```

## Caso Experimental

Endpoint principal:

```text
GET /api/recommendations/:userId
```

Endpoint secundário de apoio:

```text
GET /api/catalog
GET /api/catalog/:id
```

## Por Que Este Caso

O endpoint de recomendações foi escolhido como principal porque:
- representa melhor o fluxo distribuído da arquitetura;
- passa por `gateway`, `recommendations`, `users` e `catalog`;
- permite observar o efeito indireto do cache no sistema como um todo.

Os endpoints de catálogo entram como apoio para:
- mostrar o efeito direto do cache;
- ajudar na leitura dos resultados;
- diferenciar ganho local de ganho sistêmico.

## Estratégia de Carga

Padrão inicial:

```text
rampa
```

A carga será aplicada no mesmo endpoint e com a mesma lógica funcional em todos os cenários.

Valores exatos da primeira rodada:
- script principal: `tests/load/recommendations-ramp.js`;
- `startVUs=1`;
- `targetVUs=15`;
- `ramp up = 15s`;
- `sustain = 20s`;
- `ramp down = 10s`;
- `sleep = 0.5s`;
- `3 repetições por cenário`.

Justificativa desta escolha:
- é uma carga moderada para a primeira entrega;
- suficiente para gerar comparação inicial;
- preserva o mesmo endpoint principal entre os cenários;
- funciona como primeiro ponto de uma progressão maior que poderá evoluir para volumes mais altos.

## Métricas Obrigatórias

Para a primeira entrega, as métricas prioritárias são:
- latência média;
- latência p95;
- throughput;
- taxa de erro.

Métricas complementares, se disponíveis com baixo atrito:
- CPU;
- memória.

Decisão para esta primeira entrega:
- CPU e memória não entram como obrigatórias;
- o foco será em latência média, p95, throughput e taxa de erro.

## Saídas Esperadas

Saídas brutas:
- resultado do `k6`;
- logs principais do sistema;
- observações do cenário executado.

Saídas analíticas:
- tabela comparativa entre cenários;
- pelo menos um gráfico;
- interpretação curta conectando o experimento ao artigo-base.

## Plano de Armazenamento Local

Resultados brutos:

```text
results/
```

Interpretação e comparação:

```text
docs/experiments/
```

## Convenção Inicial de Pastas

```text
results/{cenário}/{padrão}/run-{número}
```

Exemplo:

```text
results/baseline/ramp/run-01
results/redis-cache/ramp/run-01
```

## O Que Ainda Precisa Ser Definido

- coleta sistemática de CPU e memória;
- expansão do dataset para reduzir o efeito do custo quase nulo do JSON local;
- novas cargas em rampa mais agressivas;
- definição do terceiro cenário otimizado.
