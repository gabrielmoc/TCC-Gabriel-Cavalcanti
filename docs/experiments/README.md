# Documentação dos Experimentos

Este diretório concentra a parte analítica e apresentável dos experimentos do TCC.

Aqui devem ficar:
- plano mestre de testes;
- cenários detalhados;
- comparações entre cenários;
- tabelas e interpretações;
- referências aos resultados brutos salvos em `results/`;
- figuras exportadas para uso no TCC.

## Estrutura Atual

```text
docs/experiments/
  README.md
  test-plan.md
  first-comparison.md
  case-2-comparison.md
  scenarios/
  figures/
```

## Regra Prática

- `results/` guarda evidência bruta;
- `docs/experiments/` guarda leitura, comparação e apresentação;
- `docs/experiments/scenarios/` guarda o detalhamento individual dos cenários de teste.

## Documentos Principais

- `test-plan.md`: plano mestre com todos os cenários até o fim do TCC.
- `first-comparison.md`: comparação consolidada da primeira entrega experimental.
- `case-2-comparison.md`: comparação consolidada da segunda leva experimental.
- `scenarios/`: documentação detalhada de cada cenário de teste.

## Casos Evolutivos

- `Case 1`: baseline, Redis e primeira comparação experimental já concluída.
- `Case 2`: escala, eficiência e uso de recursos, executado e consolidado.
- `Case 3`: cenário otimizado final e consolidação comparativa do TCC.

## Artefatos Visuais Atuais

- `figures/recommendations-ramp-strong.svg`
- `figures/catalog-ramp-strong.svg`
- `figures/first-delivery-summary.svg`
- `figures/case-2-recommendations.svg`
