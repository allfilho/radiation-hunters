# Revisão crítica do cofre (etapa 5e-E), 14/10/2026

Feita em duas camadas: (1) minha autoverificação (Sonnet 5.5, quem escreveu o código) e (2) uma revisão independente, só de leitura, por um agente Opus que recebeu o código e os docs, sem as minhas conclusões. Os achados da camada 2 que não eram óbvios na camada 1 estão marcados com (R).

## Corrigido nesta etapa
| # | Categoria | Achado | Correção | Teste |
|---|---|---|---|---|
| 1 (R) | Conteúdo/física | O texto "alumínio fino barra a beta" e o crédito 1 contradiziam a tabela da ficha: com o alcance do Y-90 (filho do Sr-90, Katz-Penfold), 3 mm de Al deixam passar 26% e 5 mm de acrílico 46%. | Textos da blindagem beta dizem "em espessura suficiente" e remetem à tabela; a legenda da tabela avisa que são as placas finas do Geiger e que, no cofre, supõe-se a espessura necessária. Créditos (hipótese [H]) não mudaram. | 13: coerência texto x tabela |
| 2 (R) | Conteúdo | "199,8 de cada 100 decaimentos" (Co-60, Ir-192): a soma de rendimentos de várias linhas passa de 100. | Explicação passa a dizer "cerca de 2,0 fótons gama por decaimento (199,8 por 100)". | 13 |
| 3 (R) | Acessibilidade | O foco caía no `<body>` depois de guardar, escolher blindagem, Esc e alça da ficha (desenhar() recria os botões). | Foco inicial na 1ª fonte; chave do elemento focado é guardada e devolvida depois de redesenhar. | 14: foco |
| 4 (R) | Acessibilidade | Tab saía do cofre no celular (botões escondidos da ficha contavam como focáveis). | Filtro por `visibility`. | 14: Tab 40x |
| 5 (R) | Acessibilidade | Região `role=status` recriada já preenchida: leitores de tela podem não anunciar. | Nó único e persistente; só o texto muda. | (sem teste automático; leitor de tela real não testado) |
| 6 | Interface | Fantasma do arrasto órfão se o cofre fechava no meio; botões de blindagem escolhidos ficavam `disabled` e sumiam do Tab. | `fechar()` remove fantasmas; escolhida fica focável com `aria-disabled`. | 14 |
| 7 | Interface | Cabeçalhos da tabela do Geiger fixos, ignorando as colunas do modelo; contraste de `td.z` 3,9:1. | Cabeçalhos vêm de `colunas`; cor mais escura. | 13 |
| 8 | Movimento | Hover com `transform` e entrada de 300 ms apesar de `prefers-reduced-motion`/meta de 250 ms. | Hover sem transform sob reduced-motion; entrada 200 ms. | — |
| 9 | Docs | Plano dizia limiar equivalente de 35,9 a 81,2; o correto, por varredura, é 36 a 85. | Plano corrigido. | 11 (já fixava 36 a 85) |
| 10 | Testes | Teste de arrastar prometia o que não verificava; teste de blindagem tinha `if (gama)` que podia passar vazio; faltavam testes de foco, Tab, reinício com o cofre aberto. | Reescritos/adicionados. | 14 |

## Registrado e NÃO corrigido (decisão sua)
- (R) **N04 satura rápido no caderno: CORRIGIDO (14/10/2026).** O cofre agora gera um registro agregado por nó (N04 e N09, `registros` em cofre.js). Acerto na 2ª tentativa conta como acerto e não abre ficha; a ficha só abre se algum item foi revelado (crédito 0) ou a blindagem teve crédito < 0,7; "erro" do nó = mais da metade dos itens feitos ruins. Cofre perfeito soma 1 acerto por nó. Testes em 11-cofre.
- (R) **Dados [V] com ressalva do próprio registro:** energias alfa do Am-241 (Seção 4 não devolvida na extração do PDF do LNHB) e inconsistência apontada nas energias do Co-60 em V5D3.8: conferir no PDF original. Ir-192: `energyMeV` 0,372 (isotopes.js, Geiger) x 0,350 (energia efetiva do chumbo, emissoes.js): duas definições de "energia efetiva"; a diferença não muda nenhuma prateleira.
- (R) **Docs com inconsistência interna:** `fatos-historicos-3e.md` diz que a AERB dá 147,186 TBq para Mayapuri (V5D3.5) e, em outro trecho, que a atividade do Co-60 "não consta" ([N]); **CORRIGIDO (14/10/2026): fatos-historicos-3e.md agora traz 147,186 TBq (1969) e ~688,2 GBq (abr/2010); a ficha não cita atividade.** O comentário em `03-radium-girls.js` ("ONLY Ra-226") contradiz o fato do Ra-228 que a ficha exibe.
- `FATOS_PRATELEIRA` (C3.x) existe mas a interface não o usa; o teste 11 só confere que os IDs existem no banco, não o conteúdo.
- Rótulo `role=radio` sem navegação por setas (padrão ARIA de radiogroup): hoje cada botão entra no Tab.

## Limites do que foi verificado
Sem leitor de tela real (NVDA/VoiceOver), sem toque em aparelho físico (só Pointer Events em Chromium), contraste medido só em 4 pares pelo revisor e por mim; valores LNHB/NIST conferidos contra o registro em `docs/`, não contra as fontes originais nesta etapa; créditos das blindagens e limiar 50 por 100 são hipóteses [H].
