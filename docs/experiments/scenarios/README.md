# Cenários de Teste

Esta pasta detalha todos os cenários de teste do TCC, seguindo um padrão único de documentação.

Ela complementa o [Plano Mestre de Testes](../test-plan.md), que funciona como visão geral e índice principal.

## Organização

Cada arquivo desta pasta representa um cenário ou bloco de cenários com:
- objetivo;
- relação com a literatura;
- comparação prevista;
- endpoints;
- estratégia de carga;
- métricas;
- saídas esperadas;
- armazenamento;
- status.

## Arquivos

- [01-validacao-baseline.md](./01-validacao-baseline.md): validação funcional do cenário base.
- [02-validacao-redis.md](./02-validacao-redis.md): validação funcional do cenário com cache e fallback.
- [03-comparacao-exploratoria.md](./03-comparacao-exploratoria.md): primeira comparação sob carga moderada.
- [04-comparacao-carga-forte.md](./04-comparacao-carga-forte.md): bateria forte em `recommendations` e `catalog`.
- [05-comparacao-dataset-ampliado.md](./05-comparacao-dataset-ampliado.md): repetição da comparação com dataset maior.
- [06-observabilidade-e-recursos.md](./06-observabilidade-e-recursos.md): coleta de CPU, memória e sinais de observabilidade.
- [07-validacao-cenario-otimizado.md](./07-validacao-cenario-otimizado.md): validação do cenário de indexação com Apache Solr.
- [08-comparacao-tripla.md](./08-comparacao-tripla.md): comparação entre os três cenários experimentais.
- [09-bateria-final.md](./09-bateria-final.md): consolidação final do plano experimental.

## Documento Analítico Complementar

- [../case-2-comparison.md](../case-2-comparison.md): leitura consolidada da segunda leva experimental.
