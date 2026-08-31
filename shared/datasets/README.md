# Datasets Determinísticos

Este diretório concentra os dados locais determinísticos usados pela parte prática do TCC.

## Objetivo

- permitir reprodução simples do ambiente;
- evitar introduzir banco de dados real prematuramente;
- manter a mesma base funcional entre `baseline` e cenários posteriores;
- possibilitar ampliação controlada do experimento sem perder determinismo.

## Arquivos

- `catalog.json`: itens do catálogo usados pelo `Catalog Service`;
- `users.json`: usuários e gêneros preferidos usados pelo `Users Service`;
- `generate-case2-datasets.mjs`: gerador determinístico do dataset ampliado do `Case 2`.

## Case 2

Para a segunda leva experimental, o dataset deixou de ser apenas uma massa mínima ilustrativa.

Agora ele passa a ser:
- maior;
- determinístico;
- regenerável;
- adequado para testes mais exigentes de carga e eficiência.

## Regeneração

Se for necessário recriar o dataset ampliado:

```bash
node shared/datasets/generate-case2-datasets.mjs
```

O `Recommendations Service` deve continuar derivando sua resposta a partir desses dados, consultando os serviços correspondentes em vez de manter um dataset independente.
