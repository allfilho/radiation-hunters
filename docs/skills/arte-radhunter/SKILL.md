---
name: arte-radhunter
description: Cria arte para o jogo Radiation Hunters (salas da Base, naves, pessoas, cenários, ícones) em SVG/pixel art vetorial, desenhada do zero em código com o kit js/arte/, com estilo consistente (corte lateral, luz fria, painéis âmbar/verde). Use ao criar ou alterar qualquer imagem do jogo.
---

# Arte do Radiation Hunters (kit `js/arte/`)

Guia para qualquer pessoa (ou qualquer Claude) produzir arte **parecida com a que já existe**, sem arte de terceiros.
Introduzido na v3.12.0 com a nova Base da Agência. Lição do projeto: na primeira tentativa a Base foi redesenhada como corte lateral só com pintura nova e o usuário recusou ("não mudou na essência"); a referência pedia planta vista de cima + menu lateral. Primeiro confirme a estrutura olhando as referências de verdade (imagens/vídeo), depois pinte.

## Regras que não mudam

1. **Tudo é desenhado do zero em código** (SVG como texto em JS). Não copiar arte, personagens, logotipos, telas ou naves de X-COM, OpenXcom, mods, filmes ou outros jogos. Inspiração é o *gênero* (base em corte lateral, interface de console, pixel art), nunca uma obra específica. Se um desenho lembrar demais uma obra conhecida, redesenhe.
2. **Cores só da paleta** (`js/arte/paleta.js`, objeto `P`). Para sombrear/iluminar use `tom(cor, k)` (k > 0 clareia, k < 0 escurece). Nada de hexadecimais soltos novos, exceto cores de objeto que a paleta não cobre (ex.: laranja de um carrinho); nesses casos, derive com `tom`.
3. **Luz vem de cima, à esquerda**: realce em cima/esquerda, sombra embaixo/direita (`bisel()` já faz isso).
4. **Pixel art vetorial**: coordenadas inteiras, `shape-rendering="crispEdges"` no `<svg>`, sem `filter`, sem `<pattern>` repetido com mesmo id e conteúdos diferentes, sem fontes externas. O SVG precisa funcionar offline.
5. **Determinismo**: nada de `Math.random()` na arte. Use `prng(semente)`; a mesma entrada produz sempre o mesmo desenho (testável e estável entre partidas).
6. **Acessibilidade**: SVG decorativo leva `aria-hidden="true" focusable="false"`; quem é clicável é um `<button>` HTML por cima, com `aria-label` (ver `ui-base.js`). Alvos de toque ≥ 44 px.
7. **Movimento é opcional**: animações são classes CSS e todas param com `prefers-reduced-motion` (já cobertas em `styles.css`).
8. **Simplificação**: a arte é ilustrativa, não científica. Não afirmar nada físico que o desenho não represente (ex.: o histograma do laboratório é um "espectro" ilustrativo, sem valores reais).

## Estilo visual (a "linguagem" da Base)

- **Tela da Base (essência)**: **planta vista de cima** (como as telas de base dos jogos de gerenciamento em grade): terra escavada ao fundo, um **bloco quadrado por instalação** com arte própria e detalhada, **corredores** que ligam blocos vizinhos, **cabeçalho + coluna de menu à direita** (Pessoal, Hangar, Pesquisa, Comando, Treinamento, Arquivo, Biblioteca, Oficina, Construir, Escavar, Normas, Mapa). Cada instalação é reconhecível só pelos objetos (nave vista de cima no hangar, porta circular no cofre, camas no alojamento, bancadas no laboratório). Ao abrir uma instalação, a janela mostra **a mesma sala em corte lateral** (`moduloSvg`) com as pessoas em pé: planta para navegar, corte para "entrar".
- **Planta (blocos 120×120)**: `js/arte/planta.js`, `planta(tipo, { obra, viz, naves, pessoas })`. Parede com bisel e parafusos, piso próprio, sombra projetada para baixo/direita, portas de 16 px no centro dos lados que têm vizinho (`viz`), pessoas vistas de cima nos pontos de `PONTOS[tipo]`. **Nunca** desenhe uma instalação só com retângulos vazios: cada bloco precisa de um objeto grande e de 3–5 objetos de apoio.
- **Corte lateral (opcional, janela da sala)**: corte lateral de base subterrânea. Cada sala é um quadro 200×120: laje de teto (y 0–10) com tubulação, parede em painéis, piso de grade a partir de y = 98 (`PISO`), **portas laterais** nas bordas (para o corredor) e 2–3 luminárias com cones de luz. Tudo isso vem de `casco(w, h, {luzes, cor})`; o miolo da sala é desenhado entre y = 12 e y = 98.
- **Paleta**: aço azulado (`aco0…aco6`) para estrutura; rocha marrom (`rocha0…rocha4`) para fora das salas; **verde** (`verde`) e **âmbar** (`ambar`) para telas, LEDs e sinalização; laranja para alerta; ciano para vidro e luz fria. Cada sala deve ter **um ponto de luz/cor** (tela, LED, vidro) e **um objeto grande reconhecível** (a nave, a porta do cofre, o quadro, a estante).
- **Densidade**: preencher o quadro com objetos de tamanhos variados (grande, médio, pequeno), nunca só retângulos vazios. Sombra de contato (`<ellipse opacity=".4">`) sob objetos grandes.
- **Pessoas**: 24×40, `pessoaSvg(corCaneta, jaleco, i)`; `i` (número ou texto) escolhe pele/cabelo de forma fixa. A cor da caneta dosimétrica no bolso é regra de jogo (verde/amarelo/vermelho).
- **Naves**: uma só silhueta para hangar e superfície (`naveSvg(tipo)`), tipos `tripulacao`, `resgate`, `levantamento` (faixa colorida diferente).

## O kit

| Arquivo | O que oferece |
|---|---|
| `js/arte/paleta.js` | `P` (cores), `tom(cor,k)`, `prng(semente)` |
| `js/arte/primitivas.js` | `r`, `poli`, `lin`, `grupo`, `bisel`, `parafuso(s)`, `led`/`ledFixo`, `lampada`, `tubo`, `veneziana`, `zebra`, `trevo`, `monitor`, `bancada`, `cadeira`, `casco` |
| `js/arte/nave.js` | `naveSvg(tipo, {fogo})`, `COR_NAVE` |
| `js/arte/pessoa.js` | `pessoaSvg(corCaneta, jaleco, i)` (de frente, usada na janela da sala) |
| `js/arte/planta.js` | `planta(tipo, opções)` (blocos vistos de cima), `pessoaTopo`, `PONTOS`, `T` |
| `js/agencia/base-svg.js` | salas em corte (`moduloSvg(tipo, emObra)`), `rochaSvg()` (terra), `superficieSvg` (céu/heliponto, hoje sem uso na tela da Base) |
| `js/agencia/ui-base.js` | `htmlBase` (planta + terra), `htmlConsole` (menu à direita), `htmlInterior` (corte na janela) |
| `styles.css` | animações: `ag-pisca`, `ag-pulsa`, `ag-varre`, `ag-bolha`; planta (`ag-planta`, `ag-cel`), console (`ag-console`, `ag-menu-bt`), janela (`ag-janela`, `ag-interior`) |

Todas as funções devolvem **texto SVG** (sem DOM), então rodam em Node e são testadas em `tests/55-arte-kit.test.mjs`.

## Retratos (v3.13.0)

- `js/investigacao/retratos.js`: `retratoSvg(npc, expressao)`, busto 96×96 em pintura vetorial **suave** (sem `crispEdges`: rostos precisam de curvas), luz de cima à esquerda, gradiente de pele, sombra do lado direito, olhos com brilho, sobrancelhas que mudam com a expressão.
- Expressões: `neutro`, `sorriso`, `preocupado`, `surpreso` (`EXPRESSOES`). Ligue a expressão ao **estado do jogo**, não ao acaso: `expressaoDe(cor, mot)` em `ui-base.js` (verde = sorriso, amarela = neutro, vermelha ou em tratamento = preocupado); a Marta fica preocupada quando há alerta.
- Cada personagem é uma linha em `P`: `blusa`, `cabelo`, `pele`, `estilo` (`curto`, `longo`, `cacheado`, `coque`, `calvo`, `ondulado`, `trança`) e opcionais `oculos`, `barba`, `bigode`, `jaleco`. Para criar um personagem novo, acrescente a linha e o nome em `NOMES`; nada mais.
- O SVG precisa ter `aria-hidden`, ids de gradiente únicos por personagem e **nenhuma** URL (`http`, `href`, `<image>`): o teste 56 verifica.
- Ficha de pessoal (dossiê): `.ag-dossie` com foto 70 px, faixa "FICHA nn" e moldura na cor da caneta (verde/amarela/vermelha); escurecida (cinza) se a pessoa está em tratamento ou viagem.
- Conferência visual: `node ferramentas/galeria-retratos.mjs` (em `tests/`, com `RH_ROOT=../current`).

## Receita: criar uma instalação nova (ex.: "enfermaria")

Duas peças: o **bloco de planta** (o que se vê na Base) e a **sala em corte** (o que se vê na janela).
1. Em `js/arte/planta.js`: `function enfermaria(o) { return casco(piso, o.viz) + … }`; objeto grande (macas, mesa de exame), apoio (armário, pia, tela, `trevo`), sombras com `movel()`. Registre em `BLOCOS` e em `PONTOS` (4 pontos livres onde as pessoas ficam).
2. Em `js/agencia/base-svg.js`, escreva `function enfermaria(w) { return casco(w, 120, { luzes: [50, 150] }) + … }`.
2. Escolha **um objeto grande** (ex.: maca com monitor) e **dois ou três pequenos** (armário, cartaz com `trevo`/cruz, LED). Use `bancada`, `monitor`, `bisel`, `cadeira`. Posicione os objetos apoiados em `PISO` (98).
3. Registre em `DESENHO`; acrescente o tipo em `CONSTRUIVEIS`/textos (`frota.js`, `textos.js`: `sala`, `salaDesc`, `menuBase`) e uma entrada no menu (`htmlConsole` em `ui-base.js`) se for jogável.
4. Rode `node ferramentas/galeria-arte.mjs` (todos os blocos e salas numa imagem) e `node ferramentas/foto-base.mjs` (tela real; `VP=m` celular; `SALA=hangar` abre a janela), sempre em `tests/` com `RH_ROOT=../current`, e **olhe as imagens**. Ajuste sombras, escala e leitura (objeto principal reconhecível em 100 px de largura).
5. Rode `55-arte-kit.test.mjs` (SVG bem formado, sem `NaN`/`undefined`) e `50-base-cena.test.mjs`.

## Receita: criar outra peça (nave, cenário, ícone)

- Defina o **sistema de coordenadas** no topo do arquivo (origem, tamanho, onde o objeto toca o chão) e documente no comentário, como em `nave.js` e `pessoa.js`.
- Monte por camadas, do fundo para a frente: sombra → partes distantes (mais escuras) → corpo → realces → detalhes pequenos (LED, parafuso).
- Parametrize por **tipo/semente**, nunca por sorteio.
- Se precisar de gradiente, use `<linearGradient>` com id **único e fixo** (já existem `ag-ceu2`, `ag-rochaG`).

## Checklist antes de entregar

- [ ] Sem arte copiada; nada identificável de obra conhecida.
- [ ] Só cores de `P`/`tom`; luz de cima-esquerda.
- [ ] Determinístico (sem `Math.random`).
- [ ] `aria-hidden`; botões acessíveis por cima; alvo ≥ 44 px.
- [ ] Animações com `prefers-reduced-motion`.
- [ ] Foto em desktop (1280×720) **e** celular (390×844) conferida a olho.
- [ ] Testes 50 e 55 passam; README atualizado.
- [ ] A tela mostra a **estrutura** pedida (planta + menu), não só pintura nova: conferir com a referência visual descrita pelo usuário antes de polir detalhes.

## Limites conhecidos

- A verificação visual é feita por captura de tela (Playwright), não por comparação automática de pixels.
- A moldura geral (painéis, botões, janelas, menu principal) ainda é a antiga fora da Base; a próxima etapa é aplicar este estilo a elas.
