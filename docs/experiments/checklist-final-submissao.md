# Checklist Final de Submissao

## Conferencias realizadas

| Item | Situacao | Evidencia ou decisao |
| --- | --- | --- |
| Matriz oficial | Conforme | As 27 rodadas em `results/{cenario}/matriz-final/{case}/recommendations/run-{01,02,03}/` possuem metadados e resumo do k6. |
| Valores dos resultados | Conforme | As medias dos Quadros 8, 9 e 10, as rodadas do Quadro 11 e as estatisticas do Quadro 12 correspondem aos resumos oficiais do k6. |
| Unidades e arredondamento | Conforme | Latencias em ms, vazao em req/s, CPU acumulada em s, RSS em MiB e taxas de erro em %. Medias do artigo usam duas casas; artefatos e quadros individuais preservam tres casas quando necessario. |
| Nomes e escopo | Conforme | Cases: baixa controlada, alta sustentada e carga variavel. Cenarios: baseline, Redis e Solr. Comparacoes quantitativas sao internas a cada case. |
| Redis e recursos | Conforme, com delimitacao | O Quadro 13 usa contadores `HIT` e `MISS` da janela medida; o Quadro 14 soma somente os quatro processos Node.js. Redis e Solr nao entram em uma comparacao homogenia de custo total. |
| Figuras e quadros | Conforme | As Figuras 1 a 6 e os Quadros 1 a 14 possuem legenda; as referencias textuais foram revisadas no rascunho. |
| Citacoes e referencias | Conforme para correspondencia | Todas as referencias listadas sao citadas no texto e todas as citacoes autor-data possuem entrada na lista de referencias. |
| Coerencia do repositorio | Conforme | README, protocolo, auditoria e rascunho descrevem a mesma matriz final de tres cases, tres cenarios e tres repeticoes. |

## Ajustes editoriais aplicados nesta revisao

- A Subseção 3.6.2 agora separa validade experimental de limiares operacionais: ultrapassar um limiar isoladamente nao invalida uma rodada com protocolo e evidencias validos.
- A Subseção 4.2 explicita que valores absolutos de cases distintos nao devem ser comparados diretamente, porque VUs, duracoes e intervalos entre iteracoes variam por perfil.
- As Subseções 3.3 e 3.5 passaram a chamar explicitamente os Quadros 3 e 4.
- O README foi alinhado ao titulo atual, ao encerramento da matriz e a uma leitura sem atribuicao causal indevida.

## Pendencias manuais antes da entrega

1. Conferir no Google Docs se todas as legendas, fontes, espacamentos, quebras de pagina e numeracao automatica de titulos permanecem corretos apos a transferencia final.
2. Revisar metadados bibliograficos contra os arquivos ou paginas oficiais das fontes, em especial DOI, volume, numero e paginas quando aplicaveis. Esta e uma conferencia editorial; nao afeta a correspondencia atual entre citacoes e lista de referencias.
3. Manter explicitamente no artigo as limitacoes registradas: a série temporal do Case 3 é complementar e posterior à matriz oficial, há três repetições sem inferência estatística e as versões históricas de Docker, Docker Compose e k6 permanecem incompletas.
4. Nao substituir a matriz final por rodadas historicas, nem executar novas coletas sem decisao metodologica expressa do orientador.
