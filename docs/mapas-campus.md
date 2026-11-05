# Mapas com áreas externas (campus)

Criado em 2026-10-26 para a escola do radônio (investigação 12) e estendido ao hospital (9) e à medicina nuclear (10). Só visual e de layout: movimento, colisão e câmera continuam os da `GameScene`.

## Como descrever uma planta de campus (`js/mapa/plantas-investigacao.js`)

| Campo | Função |
|---|---|
| `externo: true` | liga a pintura de terreno aberto em `render/terreno.js` |
| `areas` | terreno percorrível (aqui, um único retângulo grande) |
| `blocos` | edifícios: retângulos preenchidos com parede **depois** das áreas |
| `internas` | salas escavadas dentro dos blocos |
| `portas` | aberturas (2 tiles) entre sala e corredor, ou entre prédio e terreno |
| `cercas` | retângulos de parede pintados como muro/cerca: limite do terreno e pátios cercados (aberturas = vãos entre retângulos) |
| `zonas[].piso` | tipo de piso de uma zona externa: `grama` (padrão), `calcada`, `asfalto`, `terra`, `quadra` |
| `paleta.exterior` | (opcional) sobrescreve as cores externas |

Regras que o motor impõe e os testes verificam:

- Um corredor de **1 tile** entre prédio e borda é tratado pelo gerador como "porta" e bloqueia móveis; deixe pelo menos 2 tiles livres.
- Nenhum móvel pode tapar uma porta (o gerador recusa e o jogo não abre).
- Todo tile livre precisa ser alcançável a partir do ponto inicial.

## Móveis externos (`render/mobiliario-externo.js`)

`tree`, `yard_bench`, `flagpole`, `garden_bed`, `goal`, `parked_car`, `bike_rack`, `sign`, `ambulance`, `waste_container`, `planter`, `lamp_post`, `generator_unit`, `bus_shelter`, `lead_container`, desenhados com o mesmo pincel RPG dos demais móveis.

Cuidado com os ids: `bench` e `car` já existem no ferro-velho; usar o mesmo id faria a missão antiga ser redesenhada. Um teste (`tests/31`) falha se um id novo repetir o de outra missão.

## Plantas

| Investigação | Planta | Ideia |
|---|---|---|
| Hospital (9) | `PLANTA_HOSPITAL` 52×40 | complexo em "H": duas alas ligadas por um saguão, jardins internos, baia de ambulâncias, área de resíduos cercada |
| Medicina nuclear (10) | `PLANTA_NUCLEAR` 52×40 | bloco clínico + bloco técnico ligados por passarela, pátio de armazenamento cercado, baia de embarque |
| Cronologia (11) | `PLANTA_CRONOLOGIA` 40×37 | laboratório fechado (mantido) |
| Escola do radônio (12) | `PLANTA_ESCOLA` 54×44 | campus com cinco construções, pátio, estacionamento, horta e quadra |

## Ferramenta de revisão visual

`node tests/ferramentas/captura-mapa.mjs radonio-escola /tmp/escola.png 0.5`
