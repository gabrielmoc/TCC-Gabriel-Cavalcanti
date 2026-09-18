# Diretório de Resultados

Este diretório armazena:
- saídas brutas dos testes de carga;
- evidências auxiliares de execução;
- registros por cenário e por repeticao.

Estrutura atual:

```text
results/
  baseline/
  redis-cache/
  solr/
```

Convenção utilizada:
- separar por cenário;
- separar por padrão de carga;
- separar por repeticao;
- manter arquivos brutos e resumos organizados em pastas previsiveis.

Exemplos reais:

```text
results/
  baseline/
    ramp/
      run-01/
    ramp-strong/
      recommendations/
        run-01/
      catalog/
        run-01/
  redis-cache/
    manual-validation/
      run-01/
    ramp/
      run-01/
    ramp-strong/
      recommendations/
        run-01/
      catalog/
        run-01/
```

Situação atual:
- validação manual do Redis já registrada;
- rodada exploratória inicial já registrada;
- bateria forte já registrada e agregada.
- segunda leva histórica executada com dataset ampliado, carga moderada, carga forte e coleta de recursos;
- rodadas descartadas metodologicamente preservadas em diretórios próprios, sem uso na análise oficial.
- matriz final organizada por perfil de carga em `matriz-final/case-1`, `case-2` e `case-3`.

Os resultados de `ramp`, `ramp-strong` e `case-2` são evidências históricas das levas iniciais. A comparação final oficial utiliza:

```text
results/{baseline|redis-cache|solr}/matriz-final/{case-1|case-2|case-3}/recommendations/run-{01..03}/
```

Documentos de leitura histórica:

```text
docs/experiments/first-comparison.md
docs/experiments/case-2-comparison.md
```

Estrutura presente no repositório:

```text
results/
  README.md
  baseline/
    README.md
  redis-cache/
    README.md
  solr/
    matriz-final/
```

## Evidências brutas da matriz final

Os arquivos `k6-summary.json`, `metadata.json`, métricas antes/depois e `aggregate-summary.json` são versionados por serem os artefatos necessários para reproduzir a análise. Os arquivos de log por requisição e `k6-output.txt` são preservados localmente durante a execução, mas não são enviados ao GitHub devido ao volume elevado. A automação, os parâmetros e os resumos agregados permitem reexecutar e auditar a matriz sem inflar o repositório.
