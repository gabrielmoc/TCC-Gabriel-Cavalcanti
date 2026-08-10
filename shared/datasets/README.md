# Datasets Deterministicos

Este diretorio concentra os dados locais deterministicos usados pela primeira versao do baseline.

Objetivo:
- permitir reproducao simples do ambiente;
- evitar introduzir banco de dados real na primeira iteracao;
- manter a mesma base funcional entre baseline e cenarios posteriores.

Arquivos:
- `catalog.json`: itens do catalogo usados pelo `catalog service`;
- `users.json`: usuarios e generos preferidos usados pelo `users service`.

O `recommendations service` deve derivar sua resposta a partir desses dados, consultando os servicos correspondentes em vez de manter um dataset independente.
