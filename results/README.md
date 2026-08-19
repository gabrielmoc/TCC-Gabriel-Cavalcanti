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
  optimized/
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

Situacao atual:
- validação manual do Redis já registrada;
- rodada exploratória inicial já registrada;
- bateria forte já registrada e agregada.

Documento de leitura consolidada:

```text
docs/experiments/first-comparison.md
```

Estrutura presente no repositório:

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
