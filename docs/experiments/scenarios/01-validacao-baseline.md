# CT-01 - Validação Funcional do Baseline

## Objetivo

Confirmar que a arquitetura mínima do `baseline` responde corretamente antes da introdução de qualquer otimização.

## Relação com a Literatura

Este cenário sustenta a ideia metodológica de que a comparação experimental precisa partir de um estado base estável, reproduzível e funcionalmente consistente.

## Comparação Prevista

```text
Sem comparação direta.
Este cenário valida o ponto de partida.
```

## Endpoints

```text
GET /api/catalog
GET /api/catalog/:id
GET /api/users/:id
GET /api/recommendations/:userId
```

## Estratégia de Execução

- subida local dos quatro serviços;
- chamadas manuais pelas rotas públicas do `gateway`;
- verificação de resposta, estrutura JSON e encadeamento funcional.

## Métricas

- sucesso funcional da resposta;
- ausência de erro HTTP inesperado;
- coerência do payload retornado.

## Saídas Esperadas

- confirmação de que o fluxo ponta a ponta está íntegro;
- registro simples das validações executadas.

## Armazenamento

- evidências operacionais: documentação local do projeto;
- relação conceitual: `docs/baseline-contract.md`.

## Status

```text
Concluído
```
