# Plantas próprias das investigações (2.6)

Os três episódios novos deixaram de reaproveitar a planta do hospital. Cada um tem um edifício desenhado à mão em `current/js/mapa/plantas-investigacao.js`. O hospital original mantém a sua planta.

| Episódio | Mapa | Ambientes |
| --- | --- | --- |
| O ar da escola (radônio) | 36 × 22, corredor central largo | Secretaria, Sala A, Sala B, professores, biblioteca, sala de análise, conselho escolar |
| Arquivo do tempo | 34 × 22, salão de preparo aberto no centro | Recepção de amostras, arquivo de amostras, microscopia (sala escura), salão de preparo, isótopos, discussão |
| Medicina nuclear | 28 × 26, corredor vertical | Comunicação, equipe, acolhimento, radiofármacos (didático), aquisição didática, sala de conversa |

## Ventilação na escola (só ambientação)

Sala A: janelas fechadas e ar parado (poeira). Sala B: janelas abertas, exaustor e setas de ar. Secretaria, professores, biblioteca, sala de análise e conselho têm condições intermediárias. Os rótulos dizem “pouca/média/muita ventilação”. **Isso é cenário:** nenhum valor numérico novo foi criado, as medições continuam sendo os dados sintéticos de `modelos.js`, e o jogo não afirma que a ventilação explica a diferença entre as salas. Uma leitura por sala (valores próprios) exigiria novos dados sintéticos e validação de conteúdo.

## Como funciona

- `desenharPlanta(gen, planta)` preenche o mapa de paredes e abre áreas e portas; `MapGenerator` usa isso quando `investigacaoCampo.planta` existe. Movimento, colisão, câmera e controles são os da GameScene.
- `render/terreno.js` aceita `planta`: paleta própria, tinta por ambiente, janelas (aberta, entreaberta, fechada), grade de ventilação, quadros, cartazes e placas, tudo só visual.
- `configuracoes-campo.js` mantém os pontos de interação, os rótulos de sala e o painel; o mapa vem de `planta`.
- Teste novo: `tests/31-plantas-investigacao.test.mjs` (plantas distintas, móveis todos colocados, pontos e ambientes alcançáveis, ventilação visual).

## Limites

Conferido por teste automatizado e por imagem; não por jogador humano em celular real. Cartazes de radiação e saúde são pictogramas genéricos.

## Laboratório de cronologia: cinco laboratórios (atualização)

Descrição dada pelo responsável do laboratório, reproduzida no mapa 40 × 24 (corredor central, recepção e sala do laudo):

| Lab | Função | O que aparece no mapa |
| --- | --- | --- |
| 1 | polimento, corte e montagem de amostras | serras de corte, politrizes, bancadas de montagem, pia, microscópio e computador de conferência |
| 2 | tratamento térmico (apatitas, zircões e outros minerais, para o método de traços de fissão) | fornos, bancadas, armários e exaustão; Caio (o evento registrado) |
| 3 | ataque químico de minerais e de CR-39 (traços em zircão e monitoramento de radônio) | capelas, banhos de ataque, bancadas de CR-39, reagentes e descarte |
| 4 | armazenamento de fontes radioativas | cofre de amostras irradiadas, U e Th naturais para fabricar dosímetros, armário de fontes experimentais (amerício, etc.), placas de radiação |
| 5 | microscopia: análise de imagem e contagem manual (minerais e plásticos atacados; datação e histórias térmicas; radônio em ambientes) | estações de microscópio com monitor e contador manual, computador de dados; penumbra |

Os equipamentos são esquemáticos: sem valores de temperatura, tempo ou dose, sem marca ou modelo. O ponto “Estação de dados U-Pb” foi renomeado (antes “Estação isotópica”) para não sugerir um laboratório isotópico que a descrição não menciona; o conteúdo das cenas não mudou. Nove tipos de móveis novos em `render/mobiliario-cronologia.js`.

### Equipamentos inspirados no site do grupo (v2.6)
Com base na página pública "Laboratórios disponíveis" do grupo de Cronologia (sites.ifi.unicamp.br/cronologia), foram acrescentados, só como desenho esquemático (sem marcas, modelos ou valores): limpador ultrassônico e lupa (Lab 1), forno tubular e bomba de vácuo (Lab 2), balança (Lab 3). Observação: a lista de laboratórios do site (preparação, ataque químico, microscopia, tratamento térmico, instrumentação) difere da estrutura pedida (Lab 4 = fontes; sem laboratório de instrumentação). Foi mantida a estrutura pedida pelo autor; um canto de "Instrumentação" fica como opção.

### Arquivo do tempo, versão com Lab 5 ampliado (v2.7)
Mapa 40×37 em três faixas: laboratórios 1 a 3; Lab 4, vestiário e EPI e recepção; Lab 5 com três zonas (microscopia e contagem manual; eletrônica básica para construção de equipamentos, com banho automatizado e braço robótico; impressão 3D). O vestiário e EPI (armários, lava-olhos, chuveiro de emergência, extintor e primeiros socorros) é uma proposta didática do mapa, não uma cópia de uma planta real. Todos os equipamentos são desenhos esquemáticos, sem marcas, valores ou comandos reais.
