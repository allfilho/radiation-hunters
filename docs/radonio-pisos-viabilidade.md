# Pisos nas investigações: estudo de viabilidade e protótipo (etapa 3b, 27/10/2026)

**Pergunta:** a escola pode ter porão, térreo, 1º andar e sótão, com um mapa por piso e escadas, ao estilo de jogos de aventura?
**Resposta:** sim, com custo moderado, e o protótipo funciona na cópia de trabalho (não publicado).

## O que foi medido e lido
- A cena das investigações (`InvestigacaoScene`) herda a `GameScene` e trabalha sobre **um** mapa: colisão, câmera, minimapa, móveis e pontos vêm dele [lido no código].
- O motor usa `Phaser.CANVAS` (`main.js`) e pinta o terreno num único canvas de colunas×linhas×64 px: o campus (54 × 44 tiles) já usa **3456 × 2816 px (9,7 milhões de pixels)** [medido pelo código]. Empilhar mais pisos no mesmo mapa passaria de 4096 px de altura e do limite de área de canvas de vários celulares [limite exato por aparelho: **não verificado**; o Chromium de teste informa 8192 de textura máxima, que não representa um celular]. Por isso **um mapa por piso**, trocado por reinício da cena.
- Tempo de um reinício da cena do campus: **0,4 a 0,8 s** no Chromium de teste, sem GPU, sem erros de console (3 repetições). Em celular de entrada deve ser maior: **não medido**; a transição usa fade de 220 ms antes e depois.

## O que o protótipo faz (`js/investigacao/pisos.js`, `campo.js`, `configuracoes-campo.js`, `plantas-investigacao.js`)
- `campo.pisos`: cada piso tem planta, salas, escadas e `nivel`; o térreo usa a planta do campus. Sem `pisos`, nada muda (os outros episódios não são afetados).
- Escada: ladrilho com degraus e seta (▲ sobe, ▼ desce) e o nome do piso de destino; pisar nela leva ao outro mapa, na posição `chegada`, a ≥ 2 tiles da escada de volta, e só destrava depois de o jogador se afastar (sem vaivém).
- Pontos de investigação têm `piso`; os de outros pisos ficam "fora" (invisíveis) e o objetivo aponta para a **escada** certa (busca em largura sobre os pisos). O HUD diz "Próximo: … · 1º andar".
- O progresso da investigação mora fora da cena (`ui.investigacao.sessao`) e se manteve entre pisos. A música não reinicia (mesma trilha, `audio.js` compara o id) [lido no código; não ouvido].
- Minimapa e câmera seguem o piso (proporção 32 × 16 conferida).
- Protótipo de dados: 1º andar do prédio antigo (Sala C, Sala D com muita ventilação, depósito com pouca) com a etapa "Ler a campanha fictícia" lá em cima.

## Custo real
| Item | Tamanho |
|---|---|
| Código novo do motor | `pisos.js` (≈ 90 linhas, puro) e ≈ 50 linhas em `campo.js` |
| Dados por piso novo | uma planta (mapa, zonas, janelas, móveis) + salas + escadas |
| Testes | `38-pisos.test.mjs` (5 testes) + ajuste do 31 (pontos de outros pisos) |

## Problemas encontrados e resolvidos
1. A cena é **reaproveitada** no `restart` do Phaser: propriedades criadas na primeira criação (por exemplo `painelCampo`) sobrevivem e quebravam o piso sem painel. Corrigido zerando-as no `init`. Vale para qualquer campo novo.
2. A missão chega ao primeiro `init` pelo **construtor** (`main.js`), não pelos dados da cena; o protótipo guarda a missão-base na primeira vez e a reenvia em cada troca.

## Ainda não verificado
Celular real (toque nas escadas, tempo de reinício), Safari/Firefox, o botão de pausa "Reiniciar" dentro de um piso diferente do térreo (volta ao início da investigação; comportamento esperado, não testado), mais de dois pisos e a escada do porão e do sótão.

## Recomendação
Seguir com **quatro pisos** (porão, térreo, 1º andar, sótão) usando este mecanismo; começar pela comparação "mesma sala em andares diferentes", que é o ponto de ensino. Se a medição em celular de entrada passar de ~1,5 s por troca, reduzir o tamanho dos mapas dos pisos superiores.
