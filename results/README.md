# Diretório de Resultados

Este diretorio armazena:
- saidas brutas dos testes de carga;
- evidencias auxiliares de execucao;
- registros por cenario e por repeticao.

Estrutura atual:

```text
results/
  baseline/
  redis-cache/
  optimized/
```

Convencao utilizada:
- separar por cenario;
- separar por padrao de carga;
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

Situacao atual:
- validacao manual do Redis ja registrada;
- rodada exploratoria inicial ja registrada;
- bateria forte ja registrada e agregada.

Documento de leitura consolidada:

```text
docs/experiments/first-comparison.md
```

Estrutura presente no repositorio:

```text
results/
  README.md
  baseline/
    README.md
  redis-cache/
    README.md
  optimized/
    README.md
```
