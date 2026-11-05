# Simulação de jogabilidade do Geiger (etapa 3a)

Mede, sobre os mapas reais do jogo, o quanto o modelo atual e o proposto (ver
`../../docs/geiger-projeto-3a.md`, seção 12) deixam o jogo jogável. **Não altera o jogo.**
O robô é um *proxy* simples (varredura sistemática, mira perfeita ao achar sinal); os tempos
servem para comparar modelos e achar problemas, não para prever o tempo de um aluno.

## Como rodar

    cd apps/radhunter/tests            # npm install já feito (precisa de playwright-core e phaser)
    export CHROMIUM_PATH=/caminho/do/chromium   # se necessário; RH_ROOT padrão = ../current
    node simulacao/extrair-mapas.mjs    # gera simulacao/mapas.json (48 mapas: 8 missões x 6 sementes)
    node simulacao/sim.mjs reps=6 fixid=1 kg=0.3 kb=1.0      # tempos para achar todas as fontes
    node simulacao/cobertura.mjs        # fração do piso em que cada tipo é audível / gradiente legível
    node simulacao/diag.mjs             # fontes cuja distância ao centro do móvel excede IDENTIFY_DISTANCE
    node simulacao/alcanc.mjs           # fontes inalcançáveis por conectividade do mapa

Só `extrair-mapas.mjs` usa o navegador; os demais leem `mapas.json` (já incluído, gerado em 13/10/2026).

## Parâmetros de `sim.mjs` (chave=valor)

`tile` (m por tile, 0,5), `wall` (cm de concreto por tile de parede, 30), `piso` (fração do gama fora do cone, 0,3),
`kg` (S gama = kg x base, a 1 m), `kb` (S beta = kb x base, a 0,5 m), `alfar` (alcance do alfa em tiles da superfície, 1),
`fixid=1` (identificação pela distância à superfície <= 1 tile; sem isso vale a regra atual, que torna o
"Damaged Core" 3x3 inidentificável), `reps` (repetições do robô), `resumo=rótulo` (uma linha por modelo), `so=atual|novo`,
`falt=novo` (lista as fontes não achadas).

## Arquivos

`lib.mjs` modelo atual (cópia fiel de `GameScene.measureRadiation`), modelo proposto, robô e utilitários (RNG semeado).
`sim.mjs`, `cobertura.mjs`, `diag.mjs`, `alcanc.mjs`, `extrair-mapas.mjs`, `mapas.json`.

## Hipóteses embutidas no robô (todas [H])

Velocidade efetiva 0,8 x 4,7 tiles/s; varredura de 4 direções x 0,5 s em cada ponto; gatilho = fundo + 3σ; subida de
gradiente com passos de 1 tile e 1 s de medida; 3 s para identificar; limite de 900 s.
