# Datasets Determinísticos

Este diretório concentra os dados locais determinísticos usados pela primeira versão do baseline.

Objetivo:
- permitir reproducao simples do ambiente;
- evitar introduzir banco de dados real na primeira iteração;
- manter a mesma base funcional entre baseline e cenários posteriores.

Arquivos:
- `catalog.json`: itens do catálogo usados pelo `catalog service`;
- `users.json`: usuários e gêneros preferidos usados pelo `users service`.

O `recommendations service` deve derivar sua resposta a partir desses dados, consultando os serviços correspondentes em vez de manter um dataset independente.
