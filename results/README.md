# Results Directory

Este diretorio sera usado para armazenar:
- saidas brutas dos testes de carga;
- evidencias auxiliares de execucao;
- registros por cenario e por repeticao.

Estrutura inicial sugerida:

```text
results/
  baseline/
  redis-cache/
  optimized/
```

Convencao sugerida:
- separar por cenario;
- separar por padrao de carga;
- separar por repeticao;
- manter arquivos brutos e resumos organizados em pastas previsiveis.

Exemplo:

```text
results/
  baseline/
    constant/
      run-01/
  redis-cache/
    constant/
      run-01/
```

Nesta fase, o diretorio ainda nao contem resultados experimentais consolidados.
