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
  matriz-final-auditoria.md
  matriz-final-comparison.md
  complemento-temporal-case-3.md
  case-3-temporal-complement-results.md
  parecer-lacunas-melhorias.md
  scenarios/
  figures/
```

## Regra Prática

- `results/` guarda evidência bruta;
- `docs/experiments/` guarda leitura, comparação e apresentação;
- `docs/experiments/scenarios/` guarda o detalhamento individual dos cenários de teste.

## Documentos Oficiais

- `matriz-final.md`: desenho e critérios da matriz final por perfil de carga.
- `justificativa-parametros.md`: relação entre literatura, perfis de carga, métricas e calibração local dos parâmetros.
- `matriz-final-auditoria.md`: origem e validação dos valores das 27 rodadas oficiais.
- `matriz-final-comparison.md`: consolidação comparativa da matriz final.
- `complemento-temporal-case-3.md`: protocolo da coleta temporal complementar do Case 3.
- `case-3-temporal-complement-results.md`: resultados dessa coleta complementar, mantida separada da matriz oficial.
- `parecer-lacunas-melhorias.md`: limites da evidência e decisões metodológicas registradas antes da versão final.

## Matriz Final

- `Case 1`: carga baixa controlada.
- `Case 2`: carga alta sustentada.
- `Case 3`: carga variável.

Em todos os cases, os cenários tecnológicos comparados são `baseline`, `redis-cache` e `solr`. A matriz final compreende 27 rodadas: três cenários, três cases e três repetições por combinação.

Os valores de usuários virtuais, durações e repetições não foram copiados literalmente de um artigo. A literatura sustenta o uso de perfis normal, de pico e variável e das métricas observadas; os números foram calibrados no ambiente local e registrados para permitir reprodução.

## Documentos Históricos

- `first-comparison.md` e `case-2-comparison.md`: levas iniciais preservadas para rastreabilidade; não sustentam os resultados finais.
- `scenarios/` e `test-plan.md`: planejamento e validações anteriores, úteis para acompanhar a evolução do experimento.

## Artefatos Visuais Atuais

- `figures/arquitetura-experimental.png`
- `figures/fluxo-setup-experimental.svg`
- `figures/matriz-final-case-{1,2,3}.svg`
- `figures/matriz-final-visao-consolidada.svg`
- `figures/dispersao-{latencia-media,latencia-p95,vazao}.png`
- `figures/case-3-temporal-p95-complementar.png`
