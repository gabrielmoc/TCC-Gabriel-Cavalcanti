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

- executar os três cases de carga na mesma rota pública;
- manter dataset de 1.500 itens e 240 usuários;
- aquecer o endpoint antes da medição;
- garantir igualdade funcional, igualdade de dataset e igualdade de protocolo;
- consolidar médias de três repetições por combinação.

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

```text
results/matriz-final-summary.json
docs/experiments/matriz-final-comparison.md
docs/experiments/figures/matriz-final-case-*.svg
```

## Status

```text
Concluído em 18/09/2026. A bateria final reuniu baseline, Redis e Solr nos cases de carga baixa, alta e variável, com resultados brutos, resumos agregados, tabelas e gráficos preservados no repositório.
```
