# Estrutura de pastas, plano revisado e modelo do Geiger

Texto técnico que estava no README até a v3.27.1, guardado aqui para consulta. Algumas partes descrevem etapas antigas do projeto.

Jogo educativo do Grupo de Cronologia (IFGW/Unicamp). Site estático (HTML + CSS +
JS puro, sem backend e sem bundler), publicado em radiationhunters.netlify.app e
embutido por iframe no LabCronoVirtualRPG.

## Estrutura de pastas

    apps/radhunter/
      current/   versão atual do jogo  <- é isto que se publica
        index.html, styles.css
        js/main.js            ponto de entrada (cabeçalho de autoria, inicialização, globais p/ testes)
        js/i18n/{en,pt,index}.js     textos e t()/setLang()/updateTexts()
        js/data/{config,isotopes,shields,moveis}.js e js/data/missoes/01..08-*.js + index.js
        js/estado.js          GameState
        js/util.js            randomRange, shuffleArray, distance, formatTime
        js/fisica/{geiger,poisson,linha-de-visao}.js   geiger.js = modelo físico puro (roda em Node)
        js/progresso.js       localStorage com saneamento, estrelas, Continue
        js/mapa/{gerador,temas}.js
        js/render/moveis.js   FurnitureRenderer (móveis)
        js/render/terreno.js  pintarTerreno: piso, paredes e acessórios pintados num canvas, com semente fixa
        js/encontros/{motor,aproveitamento}.js   encontros de aprendizado: motor puro (Node) e aproveitamento 55/20/25
        js/encontros/{gerenciador,ui-encontro,caderno}.js   pontos fixos e gatilho do Geiger, modal do encontro (DOM) e caderno de campo
        js/data/encontros/{conceitos,perguntas}.js   árvore de 21 nós e banco de 60 perguntas PT/EN com fonte
        js/audio.js, js/ui.js, js/scenes/GameScene.js
      archive/   versões anteriores (no máximo 5)
      tests/     suíte de testes (node:test + Chromium headless); sondas/ = auditoria inicial; ferramentas/ = comparação entre versões
      docs/      documentos de projeto (fatos-historicos-3e.md, geiger-projeto-3a.md, parametros-fisicos.json, calc-parametros-3a.py, encontros-5c.md, referencias-5c/)
      tools/     dividir-modulos.mjs (recorta o game.js em módulos) e verificar-fatiamento.mjs (audita o recorte)
      README.md  este arquivo (changelog corrido)
    apps/radhunter.zip   original recebido; NÃO mexer (há cópia em archive/)

Regra de versionamento: só a versão atual em `current/`, sempre com os mesmos nomes
de arquivo; versões anteriores em `archive/`, no máximo 5.

## Como testar localmente

    cd apps/radhunter/current && python3 -m http.server 8000
    # abrir http://localhost:8000
    # Desde a etapa 2 o jogo usa ES modules: abrir o index.html direto (file://) NÃO funciona;
    # é preciso um servidor local. No Netlify funciona normalmente.

Testes: `cd tests && npm install && npm test` (ver `tests/README.md`).
Sondas exploratórias da auditoria inicial: `tests/sondas/README.md`.

## Publicação (feita por você, pelo GitHub; nada é publicado por mim)

Repositório: https://github.com/allfilho/radiation-hunters. O Netlify (site `radiationhunters`) está ligado a ele: **cada push na branch `main` publica a pasta `current/`** (ver `netlify.toml`).

Rotina de cada versão (os comandos são seus; ver `COMO-CRIAR-O-REPOSITORIO.md`):

    git switch desenvolvimento
    git add -A && git commit -m "vX.Y.Z: o que mudou"
    git push
    git switch main && git merge desenvolvimento && git push     # isto publica
    git tag vX.Y.Z && git push --tags
    git switch desenvolvimento

Publicação manual (só se precisar, sem passar pelo GitHub): `netlify deploy --dir=apps/radhunter/current --site=<ID-do-site> --prod`.

## Plano revisado (aguarda autorização a cada etapa)

| Etapa | Conteúdo | Modelo / esforço |
|---|---|---|
| 0 | Organização de pastas e README. **Feita em 13/10/2026.** | Haiku, baixo |
| 1 | **Feita em 13/10/2026.** Suíte de testes que trava o comportamento atual e registra os bugs conhecidos como falhas esperadas (`todo`). Ver `tests/README.md` | Sonnet, médio |
| 2 | **Feita em 13/10/2026.** Reestruturar em ES modules, sem mudar lógica (ver changelog). O Geiger ainda mora em `GameScene.measureRadiation`; o módulo `js/fisica/geiger.js` nasce na etapa 3b | Sonnet, médio |
| 3a | **Feita em 13/10/2026; D1 a D8 aprovadas por Arnaldo (D4: chumbo de 1 cm).** Projeto do Geiger: modelo físico simplificado, tabela de parâmetros com fonte citável, metas de jogabilidade. Ver `docs/geiger-projeto-3a.md` | Modelo maior, alto, com pesquisa (NIST XCOM/ESTAR/ASTAR, ENSDF) |
| 3b | **Feita em 14/10/2026.** Implementar o Geiger como função pura e testável em Node (sem Phaser): contagem Poisson, 1/d², atenuação exponencial, alcance finito para alfa e beta, eficiência por tipo. Testes estatísticos (variância = média, inclinação -2 em log-log, blindagem) | Sonnet, médio/alto |
| 3c | **Feita em 14/10/2026.** Interface do Geiger: janela de integração e cps coerentes, cliques como processo de Poisson, texto educativo alinhado ao modelo | Sonnet, médio |
| 3d | **Feita em 14/10/2026 (jogo concluível nas 8 missões, verificado no Chromium).** Bugs funcionais: **identificação de fonte em móvel 3x3 (Chernobyl e Fukushima não concluem)**, velocidade presa à taxa de quadros, Continue/salvamento, configurações, `timeLimit` (calibrar antes), modais empilhados, saída ao menu, localStorage | Sonnet, médio |
| 3e | **Feita em 14/10/2026, com pendências menores** (ver `docs/fatos-historicos-3e.md`). Meias-vidas, missões e fatos históricos conferidos em fonte primária (AIEA, NNDC) | Modelo maior, alto, com pesquisa |
| 4 | **Feita em 14/10/2026** (histórias reescritas, notas de campo, fontes no texto). **Storytelling:** melhorar as histórias reais (revisão contra fonte primária), mais informação durante as missões (contexto, curiosidades, fatos do acidente à medida que o jogador avança), textos fluentes que misturem realidade e narrativa | Modelo maior, alto, com pesquisa; Sonnet para a redação final |
| 5a | **Feita em 14/10/2026.** Terreno pintado com semente fixa, paredes por tema, acessórios de chão, zoom 1,25 | Sonnet, médio/alto |
| 5b | **Feita em 14/10/2026.** Sombras nos móveis, ícones nas paredes (placas, quadros, extintores, painéis, luzes de alarme), poças de luz, tom de cor e adereços por missão, vinheta | Sonnet, médio/alto |
| 5c | **Documento de design escrito em 14/10/2026 (`docs/encontros-5c.md`), aprovado pelo Arnaldo com as decisões da seção 11.** Encontros de aprendizado: Mito x Fato e perguntas de tema, árvore de conceitos com reforço, pontos de aprendizado, caderno de campo; banco inicial de 40 perguntas com fonte | Modelo maior, alto, com pesquisa |
| 5d | **Feita em 14/10/2026: 5d-1 (motor, dados, testes), 5d-2 (modal, gatilhos, caderno, aproveitamento), 5d-3 (conferência das perguntas nas fontes) e 5d-4 (revisão crítica e testes de robustez). Falta só a opcional 5e (cofre) e a releitura dos textos na etapa 6.** Implementar os encontros, o caderno de campo (fichas) e os testes (o robô das 8 missões deve continuar concluindo) | Sonnet, médio/alto |
| 6 | Acessibilidade (teclado, contraste, alvos de toque, movimento reduzido, projetor), toque no celular, idiomas e revisão dos textos | Sonnet, médio |
| 7 | Revisão final crítica | Modelo maior, alto |

### Direção de narrativa e encontros de aprendizado (definida com Arnaldo em 14/10/2026; implementada nas etapas 5d-1 e 5d-2; redação final das perguntas na 5d-3)

- **Narrativa principal:** o jogador é um Caçador de Radiação que recolhe as fontes radioativas espalhadas para guardá-las em segurança (como numa "cobrinha" que coleta itens, mas aqui o objetivo é a segurança, não o combate). O "inimigo" é o risco e a desinformação, não um monstro. Possível etapa de guarda segura no fim da missão (cofre blindado), ligada à blindagem e ao ALARA.
- **Encontros:** surpresas curtas e narrativas, de 2 a 3 por missão, em pontos **semeados por missão** (iguais para todos os alunos) ou ligados a gatilhos físicos (primeiro pico no Geiger, entrada em zona contaminada). **Não são aleatórios puros**, para não punir quem tem azar nem distorcer as estrelas em sala de aula.
- **Regras:** relógio pausado durante o encontro; o acerto rende **pontos bônus extras** (não mexe no tempo); erro só mostra a explicação, sem perda; tudo por teclado e toque; interruptor nas configurações para desligar.
- **Formato preferido:** ficha de aprendizado em duelo "Mito x Fato", com a fonte citada; o conteúdo só usa fatos já verificados (`docs/fatos-historicos-3e.md`) e física já testada. O que não tem fonte lida fica de fora.
- **Medir o ganho de aprendizado** com o jogo é um objetivo futuro, fora do escopo atual.

## Modelo do Geiger — proposta a validar (etapa 3a; nenhum valor é definitivo)

Princípios, a partir das suas indicações:

- Taxa esperada de uma fonte: `R = A · G(d) · T_ar(d) · T_blindagem`, mais o fundo.
- **Gama:** `G = 1/d²` (com uma distância mínima, para não divergir), atenuação
  no ar desprezível na escala do jogo e blindagem `exp(-μ·x)`, com μ dependente do
  material e da energia (Tc-99m, Cs-137 e Co-60 não podem ter o mesmo fator).
- **Beta:** também `1/d²`, mas com alcance finito no ar; blindagem pelo alcance do
  beta no material (alumínio e acrílico bloqueiam; chumbo também, com a ressalva
  da radiação de freamento).
- **Alfa:** não segue `1/d²` na prática, porque o ar a bloqueia em poucos
  centímetros. A taxa é aproximadamente constante até perto do alcance e cai
  rapidamente; qualquer folha a bloqueia. Na escala do jogo isso vira "só no
  contato".
- **Estatística:** o número de contagens na janela é Poisson de média
  `(R + fundo)·Δt`; os cliques sonoros também. Fonte fraca perto do fundo exige
  integrar por mais tempo, o que dá a dificuldade de busca que você descreveu.
- Parâmetros a conferir antes de usar: μ de cada blindagem por energia (NIST
  XCOM), alcance de beta e de alfa no ar e nos materiais (NIST ESTAR e ASTAR),
  energias de emissão e meias-vidas (ENSDF/NNDC; tabela do BIPM).

Decisões tomadas (Arnaldo, 13/10/2026):

1. **Escala didática, por sala.** Cada missão tem salas desenhadas em escala
   física; a conversão é `cmPorPixel` por tema/missão (a definir; ex.: 1 px = 1 cm
   daria um mapa de 24x16 tiles de 32 px = cerca de 7,7 m x 5,1 m). A distância
   fonte-detector passa a ser calculada em cm. A sonda (ponta do detector) terá
   posição própria à frente do jogador; o alcance da alfa (poucos cm) só é
   atingível trazendo a ponta até a fonte.
2. **Paredes de concreto atenuam a gama (exp(-mu x) pela espessura atravessada) e
   bloqueiam alfa e beta.** Em vez do teste de linha de visão sim/não, o raio
   fonte-sonda acumula a espessura de parede atravessada. Quanto a gama atravessa
   depende da energia e da espessura (a conferir em NIST XCOM / NCRP 147; Tc-99m
   de 140 keV deve ser bem mais barrado que Co-60).
3. **Cone = aceitação angular do detector, não emissão da fonte.** A fonte é
   isotrópica. A sonda GM tem janela fina, direcional para alfa e beta; para gama
   a resposta é pouco direcional. Proposta: função de aceitação `f(theta)`
   íngreme para alfa/beta e suave (com piso) para gama, parâmetros a conferir na
   ficha de uma sonda real. O cone visual do jogador fica separado do cone de
   aceitação do detector.
4. **Atividade constante durante a missão.** Aproximação válida. Fração decaída em
   um tempo t: `1 - 2^(-t/T1/2)`. Para o isótopo de meia-vida mais curta do jogo
   (Tc-99m, cerca de 6 h, valor a confirmar na ENSDF), uma missão de 6 min perde
   cerca de 1,1%; uma hora perderia cerca de 11%. Um teste automático verificará,
   para cada isótopo, que a perda no tempo máximo de missão fica abaixo de um
   limite declarado. A meia-vida continua entrando no jogo como informação
   (lambda = ln2/T1/2 nos cartões educativos), não como dinâmica.

Pendências derivadas: (a) faixa dinâmica (1/d2 entre 10 cm e 8 m cobre mais de
três ordens de grandeza; o mostrador precisa de escala logarítmica e o som vira a
pista principal); (b) espessura e material das paredes por tema; (c) mobiliário
como atenuador (adiado); (d) fontes dentro de blindagem/contêiner (adiado).

