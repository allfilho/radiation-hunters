# Radiation Hunters — inventário de autoria para registro de software (INPI)

Levantamento feito em 23/10/2026 sobre `apps/radhunter/current/` (versão 2.2 em melhoria).
Objetivo: reunir o que a Inova Unicamp deve pedir para o registro de programa de computador.
Não é parecer jurídico; a Inova confirma o procedimento.

## 1. Identificação

| Item | Valor |
|---|---|
| Título | Radiation Hunters — The Isotope Chronicles |
| Versão | 2.x (v2.0 recebida em 13/10/2026; melhorias desde então, ver changelog no README) |
| Autoria declarada no código | "By Grupo de Cronologia - IFGW - Arnaldo Filho" (topo de `js/main.js` e rodapé do menu em `index.html`) |
| Titular provável | Unicamp (Lei 9.609/1998, art. 4º: obra feita no vínculo de trabalho e com recursos da instituição). A confirmar com a Inova |
| Primeira publicação conhecida | radiationhunters.netlify.app — deploy de produção em 15/10/2026 (README). Data da primeira publicação da v1/v2.0: **a informar pelo Arnaldo** |
| Linguagens | JavaScript (ES modules), HTML, CSS |
| Tamanho | 79 arquivos .js próprios, cerca de 17 000 linhas (JS + HTML + CSS, sem `vendor/`) |
| Tipo de programa | jogo educativo / software de ensino (física das radiações) |

## 2. Elementos próprios (protegidos por direito autoral)

| Elemento | Onde | Observação |
|---|---|---|
| Código-fonte | `js/**`, `index.html`, `styles.css` | todo próprio, exceto `vendor/` |
| Gráficos | `js/render/*` (terreno, móveis, personagem, sombras) | **desenhados por código**; não há nenhum arquivo de imagem (.png, .jpg, .svg) no jogo |
| Som | `js/audio.js` | **sintetizado** com Web Audio (osciladores); nenhum arquivo de áudio |
| Missões, narrativa e textos | `js/data/missoes/*`, `js/i18n/*` (PT/EN) | obra literária |
| Encontros de aprendizado | `js/data/encontros/*` (árvore de conceitos e banco de perguntas com fonte) | obra literária; fatos científicos citados não são protegidos, a redação é |
| Modelo físico do Geiger | `js/fisica/*` | o código é protegido; o método e as fórmulas não (Lei 9.610/1998, art. 8º) |

## 3. Componentes de terceiros (não entram como autoria própria)

| Componente | Uso | Licença | Pendência |
|---|---|---|---|
| Phaser 3.60.0 (`vendor/phaser.min.js`) | motor gráfico | MIT (Photon Storm) | **resolvido em 23/10/2026:** `vendor/PHASER-LICENSE.md` com o texto original da tag v3.60.0; `phaser.min.js` conferido, idêntico ao do pacote oficial phaser@3.60.0 (SHA-256 d16aca3f…3455) |
| Google Fonts: Press Start 2P, Orbitron, Inter | tipografia (carregadas por link em `index.html`) | SIL Open Font License, segundo o catálogo do Google Fonts `[VERIFICAR na página de cada fonte]` | nenhuma, se confirmado (não são redistribuídas no pacote) |
| Dados de referência (NIST XCOM, LNHB, IAEA, OMS) | valores físicos e fatos citados | fatos não são protegidos | manter as citações |

## 4. Autoria e uso de IA

Posição do Arnaldo (23/10/2026): o autor é ele. A IA foi usada como ferramenta, sob direção dele,
e todo o resultado foi validado por ele; a IA comete erros graves e não pode ser autora.

Registro para a Inova: a lei brasileira só reconhece pessoa física como autora. Convém informar,
se o formulário perguntar, que houve uso de ferramenta de IA na escrita do código, com direção,
seleção e validação humanas. O changelog do README documenta cada decisão do autor, o que serve
de evidência dessa direção.

## 5. Pendências antes do pedido

1. Informar quem participou da v1/v2.0 (versão recebida em 13/10/2026) e se há outros coautores
   no Grupo de Cronologia.
2. Data da primeira publicação da v1/v2.0.
3. ~~Incluir o arquivo de licença do Phaser em `vendor/`.~~ Feito em 23/10/2026.
4. Confirmar a licença das três fontes na página do Google Fonts.
5. Definir a versão a registrar (o código ainda está mudando). O INPI recebe só o resumo
   criptográfico (hash) do código; gerar no dia do pedido, por exemplo:
   `cd apps/radhunter && zip -r radhunter-codigo.zip current -x '*/._*' '*/.netlify/*' && shasum -a 512 radhunter-codigo.zip`
   e guardar esse zip sem alterações, pois é a prova do que foi registrado.
6. Escolher a licença de uso pública (ex.: MIT para o código, CC BY 4.0 para textos).
