# Investigações 2.5 — três novos episódios

Implementação local em 19/10/2026. Fonte funcional: `current/`. O hospital original foi mantido e a coleção agora tem quatro episódios.

## Acesso

Execute na pasta do aplicativo:

```sh
python3 tools/preview.py --port 8770
```

O servidor atende apenas `127.0.0.1` e envia `Cache-Control: no-store`, evitando módulos antigos durante a autoria. Ele não publica o jogo.

- Coleção: [menu local](http://127.0.0.1:8770/) → Missões → Investigações.
- Hospital original: [hospital](http://127.0.0.1:8770/?investigacao=hospital).
- Investigação 2: [medicina nuclear](http://127.0.0.1:8770/?investigacao=nuclear).
- Investigação 3: [Arquivo do tempo](http://127.0.0.1:8770/?investigacao=tempo).
- Investigação 4: [radônio na escola](http://127.0.0.1:8770/?investigacao=radonio).

Os IDs completos também funcionam. Acrescentar `&leitura=1` abre a alternativa de leitura. Pelo campo, conversas e objetos continuam acessíveis por E/Q, botão de interação e clique/toque próximo.

## O que cada episódio acrescenta

| Episódio | Percurso | Atividades |
| --- | --- | --- |
| Medicina nuclear: seguindo o sinal | 6 etapas | Comparar aquisição ativa/pausada; distinguir emissão de registro; comparar duas distribuições fictícias com 24 eventos cada; produzir uma explicação; reconhecer falta de informação para orientar um caso individual. |
| Arquivo do tempo: o que a amostra registra? | 7 etapas | Examinar carvão, zircão e apatita; relacionar material, método e evento; reconhecer que urânio isolado não fornece idade U-Pb; comparar preservação e modificação térmica dos traços; delimitar o que uma foto não permite inferir. |
| O ar da escola: investigar o radônio | 6 etapas | Definir radônio e a unidade Bq/m³; comparar janelas de uma campanha sintética; conferir protocolos; comunicar uma conclusão limitada aos dados; identificar informações ausentes num novo caso. |

Cada episódio conserva hipótese inicial, observações, tentativas, cartões selecionados, conclusão e explicação escrita antes dos retornos. Não há nota automática para o texto livre. “Dados insuficientes” permite avançar quando é a conclusão justificada.

## Estrutura preservada

`InvestigacaoScene extends GameScene` usa os mesmos métodos de `drawMap`, `createPlayer`, `handleMovement`, `isBlocked`, `ajustarCamera` e `setupInput`. Não há outro motor, controlador de movimento ou gerador paralelo.

As plantas hospitalar e laboratorial do `MapGenerator` foram reutilizadas. Cada configuração fornece pontos, salas, móveis e personagens. O hospital mantém suas portas, disposição original e sete etapas. Os outros episódios variam o ambiente e o conteúdo dentro da mesma estrutura. Não há coleta de fontes em um hospital em funcionamento ou numa visita escolar.

- `investigacao/campo.js`: cena comum e resolução da missão pelo ID.
- `investigacao/configuracoes-campo.js`: disposição, salas, pontos, painéis e visibilidade de NPCs por episódio.
- `investigacao/index.js`: cadastro e aliases.
- `investigacao/hospital-campo.js`: compatibilidade com a entrada antiga.
- `investigacao/autoria.js`: estruturas comuns para hipótese, escolhas, evidências e cartões.
- `investigacao/atividades.js`: controles acessíveis dos modelos, figuras e tabela.
- `investigacao/modelos.js`: estados, observações canônicas e dados sintéticos.
- `investigacao/motor.js`: validação das observações requeridas e montagem da ficha.
- `render/mobiliario-investigacao.js`: sete novos tipos de móveis com o mesmo pincel/paleta RPG: bancada de amostras, arquivo, detector integrador, carteiras, terminal de aquisição, bancada de modelos de radiofármacos e estante de biblioteca.
- `render/npcs-hospital.js`: mantém Rita/Helena e acrescenta perfis fictícios para os episódios.

O carregador recebe o ID selecionado; os totais vêm do conteúdo. As regras de explicação prévia, apresentação do mural e reações foram deslocadas dos nomes das cenas para metadados. O hospital original permanece compatível com suas entradas e inspeções anteriores.

## Modelos e dados: limites explícitos

- **Aquisição:** a pausa produz `novosDados: false` e `leitura: null`. Não produz atividade zero. A representação da fonte continua emitindo. Não representa comandos de um equipamento real.
- **Distribuição:** A e B têm o mesmo total fictício de 24 eventos. Os padrões espaciais foram construídos para discutir distribuição; não são exames, imagens diagnósticas ou modelos fisiológicos quantitativos.
- **Traços:** os estados de 12 e 4 marcas ilustram preservação, encurtamento e perda. São escolhas qualitativas de projeto; não há equação de annealing, escala temporal, calibração térmica ou idade calculada. O conteúdo de urânio é mantido no modelo para isolar a modificação do registro.
- **U-Pb:** fichas com dados e contexto; nenhum resultado numérico de idade é inventado a partir da presença de urânio.
- **C-14:** candidato para o carvão de origem biológica apresentado, com contexto, contaminação e calibração explícitos. O episódio não calcula uma idade de calendário.
- **Radônio:** 12 períodos iguais de 30 dias, somando 360 dias. Dados de autoria do jogo, não de uma escola. Primeiro período: A = 60 e B = 140 Bq/m³. Campanha completa: A = 140 e B = 111,666… Bq/m³. A média aritmética se aplica porque os períodos têm igual duração. Não se chama esse período de um ano completo nem se classifica segurança a partir de um limiar.

Os dados de radônio estão também em [dados-radonio-sinteticos.csv](dados-radonio-sinteticos.csv), exportados de `modelos.js`. O JS é a fonte de verdade. A série aparece em tabela: os novos episódios não ligam pontos de observações por segmentos de reta.

No fechamento do Arquivo do tempo há um link ao catálogo do Laboratório Virtual do Grupo de Cronologia, para exploração com o professor. É um link de continuação, não uma incorporação ou validação automática dos aplicativos externos.

## Verificação

**273/273 testes passaram**, sem falhas, cancelamentos ou testes ignorados, em **464,1 s**, exit code 0. Log integral: [testes-completos.log](testes-completos.log).

Os dez testes novos em `tests/30-episodios-investigacao.test.mjs` verificam:

- Cadastro PT/EN, IDs, pontos e números de etapas diferentes.
- Distinções físicas dos modelos e médias dos dados sintéticos.
- Acertos guiados sem observações/explicação não bastam para concluir.
- Percurso completo de cada episódio em PT/desktop e EN/360 × 640.
- Observações sem duplicação, tentativas erradas e explicação antes das alternativas.
- Download e leitura efetiva do JSON, com o ID e idioma corretos.
- Reinício no mesmo episódio, troca entre os quatro e retorno a missão comum sem botões/estilos residuais.
- Mesmos métodos do framework e pontos de interação livres.

A suíte completa inclui as missões e a Academia anteriores. Os testes de campo posicionam o robô junto aos pontos para encurtar o deslocamento, depois usam E e os controles reais. Movimento por teclado/toque e colisões também são verificados nos testes existentes; isso não equivale a um participante humano percorrendo cada trajeto.

Inspeção manual no navegador: coleção, cenários dos três episódios, entrada por NPC, aquisição ativa/pausada, amostras, fichas U-Pb, traços, registros de radônio e tabela em viewport de 360 × 640. Capturas em [capturas/](capturas/). As ações de laboratório foram examinadas pela opção Leitura depois da entrada pelo mapa. A inspeção manual não percorreu todos os fechamentos; os seis percursos automatizados verificam essa parte.

Ambiente usado: Node 25.9.0, Playwright Core 1.56.1, Phaser local 3.60.0 e Chromium do ambiente de testes. Comando da suíte, a partir da pasta do aplicativo:

```sh
CHROMIUM_PATH='/Users/allfilho/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' npm --prefix tests test
```

## Referências e estado de revisão

- [ACR/RSNA — General Nuclear Medicine](https://www.radiologyinfo.org/en/info/gennuclear): distinção entre radiofármaco, distribuição e detecção pela gama-câmara; texto oficial examinado no contexto da revisão.
- [OMS — Radon and health](https://www.who.int/news-room/fact-sheets/detail/radon-and-health): origem natural, variabilidade temporal/espacial, detectores passivos, unidade e importância de protocolos. Página aberta nesta implementação. O jogo não transforma a campanha fictícia em avaliação sanitária.
- [Historic England — Radiocarbon Dating](https://historicengland.org.uk/images-books/publications/radiocarbon-dating-chronological-modelling/radiocarbon-dating/): seções de princípios, preparação e calibração abertas nesta implementação.
- [Oxford Radiocarbon Accelerator Unit](https://www.radiocarbon.org.uk/dating.html): referência adicional localizada; a abertura direta falhou por timeout.
- [USGS — Geochron](https://pubs.usgs.gov/publication/dr1227/full) e [USGS Bulletin 2142](https://pubs.usgs.gov/dds/dds-54/Report/Bull2142.pdf): referências localizadas em resultados oficiais, incluindo a relação com termocronologia e annealing. As tentativas de abertura direta retornaram 403; não se afirma leitura integral desses documentos. O modelo qualitativo precisa da revisão do grupo antes de qualquer interpretação quantitativa.

Os novos conteúdos estão em versão **0.1-teste**. Não houve piloto com professores, teste em celular físico ou revisão independente de Física Médica, geocronologia e radônio. Os testes verificam implementação; não demonstram aprendizagem.

As sessões continuam em memória e não são restauradas após recarregar; a ficha pode ser exportada. O modo Leitura é uma alternativa e pode avançar no conteúdo sem percorrer o campo. Não foram alteradas a pontuação ou a política de dicas da campanha original. Não houve publicação.

## Recuperação

Backup antes das mudanças: `archive/2026-10-19_pre-tres-investigacoes.tar.gz`, com os arquivos de fonte/testes e README; dependências inalteradas não foram duplicadas. Backups anteriores foram preservados, sem exclusão automática. Lista de arquivos e hashes: [alteracoes.json](alteracoes.json).
