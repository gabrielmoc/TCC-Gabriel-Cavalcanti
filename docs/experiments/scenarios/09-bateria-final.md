# CT-09 - Bateria Final Consolidada

## Objetivo

Produzir a rodada final de testes e a consolidação visual que sustentará a análise final do TCC.

## Relação com a Literatura

Este cenário materializa a evidência comparativa final do trabalho, permitindo dialogar diretamente com os artigos de referência e com as decisões arquiteturais adotadas.

## Comparação Prevista

```text
Todos os cenários definitivos do TCC
```

## Endpoints

Principal:

```text
GET /api/recommendations/:userId
```

Secundários:

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
```

## Estratégia de Carga

- repetir a bateria principal em todos os cenários;
- incluir a configuração de carga mais representativa definida ao longo do trabalho;
- garantir igualdade funcional, igualdade de dataset e igualdade de protocolo.

## Métricas

- latência média;
- latência `p95`;
- throughput;
- taxa de erro;
- CPU;
- memória;
- estabilidade entre repetições;
- comportamento do cache, quando aplicável.

## Saídas Esperadas

- resultados brutos finais;
- tabelas consolidadas;
- gráficos finais;
- discussão comparativa pronta para a monografia;
- síntese de limitações e ameaças à validade.

## Armazenamento

Sugestão:

```text
results/final/
docs/experiments/
docs/experiments/figures/
```

## Status

```text
Planejado
```
