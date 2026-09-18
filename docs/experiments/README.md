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
  matriz-final.md
  justificativa-parametros.md
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
- `matriz-final.md`: desenho, critérios e evidências da comparação final por perfil de carga.
- `justificativa-parametros.md`: relação entre literatura, perfis de carga, métricas e calibração local dos parâmetros.
- `first-comparison.md`: comparação consolidada da primeira entrega experimental.
- `case-2-comparison.md`: comparação consolidada da segunda leva experimental.
- `scenarios/`: documentação detalhada de cada cenário de teste.

## Matriz Final

- `Case 1`: carga baixa controlada.
- `Case 2`: carga alta sustentada.
- `Case 3`: carga variável.

Em todos os cases, os cenários tecnológicos comparados são `baseline`, `redis-cache` e `solr`. As comparações antigas permanecem como evidências históricas.

Os valores de usuários virtuais, durações e repetições não foram copiados literalmente de um artigo. A literatura sustenta o uso de perfis normal, de pico e variável e das métricas observadas; os números foram calibrados no ambiente local e registrados para permitir reprodução.

## Artefatos Visuais Atuais

- `figures/recommendations-ramp-strong.svg`
- `figures/catalog-ramp-strong.svg`
- `figures/first-delivery-summary.svg`
- `figures/case-2-recommendations.svg`
