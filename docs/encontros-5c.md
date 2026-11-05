# Encontros de aprendizado: documento de design (etapa 5c)

Rascunho revisado em 14/10/2026 com as decisões de Arnaldo (seção 11). **Nada disto está implementado.** Os fatos vêm de `docs/referencias-5c/resumao.md`; um fato só entra numa pergunta se tiver status V ali. Chave de status usada abaixo: **V** = o fato está em fonte oficial lida; **C** = cálculo do projeto sobre fato V; **R** = raciocínio do projeto a partir de fatos V (marcado, para não parecer citação).

## 1. Ideia em uma frase

Durante a missão, o jogador encontra "fichas de campo": perguntas curtas, de dois formatos (**Mito x Fato** e **pergunta de tema**), ligadas ao que está acontecendo na missão. O jogo escolhe a próxima pergunta com base numa **árvore de conceitos**: se o jogador erra, recebe uma pergunta mais simples sobre o conceito-base; se acerta, avança para uma mais aplicada. Cada ficha vira um registro no **caderno de campo permanente** do jogador.

## 2. Princípios (decisões já tomadas com Arnaldo)

1. O tempo **pausa** durante o encontro; o acerto contribui para o **aproveitamento (0 a 100%)** da missão, sem alterar as estrelas nem o tempo.
2. Erro **não pune** de forma severa (sem perda de vida ou de tempo); o aprendizado pesa só 25% do aproveitamento e o erro leva a uma ficha de reforço.
3. O tom é narrativo e desmistificador, sem violência e sem monstros: o "adversário" é a desinformação e o risco.
4. Uma missão = o mesmo conjunto de pontos de encontro para todos os alunos (semeado pelo número da missão), para a sala ser comparável; a pergunta servida depende das respostas de cada um.
5. Medir ganho de aprendizado é um objetivo futuro; esta etapa só registra localmente o que o aluno viu e acertou.

## 3. Quando um encontro acontece

**Pontos de encontro** (de 2 a 3 por missão; recomendo 3): casas de piso alcançáveis, longe do ponto de partida e de móveis com fonte, escolhidas com o gerador semeado (mesmo mecanismo do terreno). São invisíveis até o jogador pisar a casa. Aí aparece um balão "?" por meio segundo (ao estilo Zelda), um som curto, e abre-se o modal. Cada ponto dispara uma vez por partida. Intervalo mínimo entre encontros: 40 s de jogo; nenhum encontro com modal de identificação aberto.

**Gatilhos físicos** (opcionais, no máximo 1 por missão, contam dentro dos 3): (a) primeira vez que a taxa do Geiger passa de 3 vezes o fundo, a ficha trata do que a leitura significa; (b) entrar numa zona especial (reator, zona contaminada), a ficha trata de proteção. Servem para ligar a pergunta ao que o jogador acabou de ver.

**Pular:** botão "Pular" sem penalidade e sem bônus. **Desligar:** opção nas configurações ("Encontros de aprendizado"), útil para quem só quer jogar ou para a primeira partida de um professor. Com os encontros desligados o jogo se comporta como hoje.

## 4. Os dois formatos

- **Mito x Fato:** mostra uma frase de senso comum ("Quem fez um raio X ficou radioativo"). O jogador escolhe MITO ou FATO. Depois aparece a explicação curta e a fonte. A frase pode ser verdadeira ou falsa, para não condicionar ao "tudo é mito".
- **Pergunta de tema:** enunciado ligado à missão e três alternativas (A, B, C), uma correta, sem "pegadinha" de redação. Alguns itens usam números do próprio jogo (leitura do Geiger, distância) para o aluno aplicar o conceito.

Duração-alvo: 20 a 40 s por pergunta; no máximo 3 perguntas por encontro (1 principal e até 2 de reforço).

## 5. A árvore de conceitos

É um grafo dirigido sem ciclos (DAG): cada **nó** é um conceito; a seta A → B quer dizer "para entender B é bom já ter entendido A". Cada nó tem perguntas em até três **níveis**: **L1** (ideia básica, normalmente Mito x Fato), **L2** (conceito, normalmente alternativas), **L3** (aplicação com números ou cenário).

```
N01 Radiação existe na natureza ──┐
N02 Radiação é invisível; instrumentos ──┬──> N10 Geiger conta e flutua
N03 Decaimento e meia-vida (N01) ────────┘        (requer N02, N03)
N03 ──> N05 Unidades: Bq, Gy, Sv ──> N11 Dose, tempo e efeito ──┐
N04 Tipos: alfa, beta, gama ──┐                                  ├──> N12 ALARA e limites (N07, N11)
N07 Tempo, distância, blindagem ──┬──> N08 Inverso do quadrado   │
                                  └──> N09 Blindagem por tipo (N04, N07)
N06 Exposição x contaminação ──┐
N02 ───────────────────────────┴──> N13 Fonte desconhecida: o que fazer
N14 Usos benéficos (raiz)

Nós de história (um por acidente), cada um com pré-requisitos de conceito:
E-GOI (N02, N06, N13)   E-RAD (N06)   E-CHE (N03, N11)   E-LIA (N04, N09)
E-ZAR (N11, N12)        E-MAY (N13)   E-FUK (N03, N12)
```

Arestas completas: N03←N01; N05←N03; N10←N02,N03; N08←N07; N09←N04,N07; N11←N05; N12←N07,N11; N13←N02,N06.

### 5.1 Estado do aluno

Para cada nó, um nível de domínio de 0 a 4: 0 não visto; 1 visto; 2 acertou L1; 3 acertou L2; 4 acertou L3 ("dominado", gera o selo do conceito). Também se guarda, por nó, número de acertos e erros e o último resultado. Fica no `localStorage` (sanitizado, como o progresso das missões), com botão "zerar caderno". Nada sai do navegador e não há identificação pessoal.

### 5.2 Como a próxima pergunta é escolhida

**Candidatas:** perguntas ainda não vistas nesta partida, de nós cujos pré-requisitos têm domínio ≥ 2 (nós-raiz sempre passam) e cujo nível L seja o domínio atual do nó + 1 (um nó com domínio 0 ou 1 oferece L1).

**Pontuação de cada candidata** (maior = primeiro):

`prioridade = 4 × relevância da missão + 3 × reforço + 2 × adequação + 1 × variedade`

- *relevância da missão* (0 ou 1): o nó está na lista da missão (tabela 5.4);
- *reforço* (0 a 1): 1 se o aluno errou esse nó e ainda não acertou depois;
- *adequação* (0 ou 1): 1 se L = domínio + 1 (nem fácil nem difícil demais);
- *variedade* (0 ou 1): 1 se o formato é diferente do último servido.

Empates se resolvem com o gerador semeado (missão + número do encontro + respostas até ali), então a mesma sequência de respostas gera a mesma sequência de perguntas (útil para o professor reproduzir e para os testes).

**Regra de reforço em cadeia (decidida com Arnaldo).** Errou uma vez, entra a ficha de reforço: o aluno **não** fica tentando a mesma pergunta.
1. Errou a pergunta original P0 (nó n, nível L): o jogo mostra uma **ficha de reforço** curta e serve uma pergunta mais simples P1: (n, L−1) se L > 1; se L = 1, a L1 do pré-requisito mais fraco (domínio < 2); se não houver pré-requisito fraco, outra L1 do mesmo nó. Nunca repete a pergunta errada.
2. Acertou P1: a explicação de P1 aparece e, em seguida, o jogo **mostra a solução da pergunta original P0** (resposta certa e explicação com fonte), sem pedir que responda de novo. O aluno aprendeu o degrau e vê como se chega ao topo.
3. Errou P1: serve P2, ainda mais simples que P1 (mesma regra aplicada a P1), se existir; se não existir, vai direto ao passo 5.
4. Acertou P2: mostra a solução de P1 e depois a de P0, em ordem.
5. Errou P2 (ou não há P2): o jogo **ensina** as três em sequência, **da mais simples para a original**: cada uma com resposta, explicação curta e fonte, sem novas perguntas. O nó fica "reforço pendente" e ganha prioridade em encontros futuros, quando o aluno poderá mostrar o que aprendeu.
**Limite de profundidade: 3 perguntas por encontro (P0, P1, P2).** Minha recomendação é parar em 3, e não encadear mais fichas, por três motivos: a árvore já tem no máximo 3 níveis por nó e um pré-requisito, então a quarta pergunta seria quase sempre de outro conceito; mais de ~2 minutos paralisam a aventura; e o que falta de base é retomado no encontro seguinte (prioridade de reforço), em vez de virar uma sessão de aula dentro da missão. Se a base continuar faltando, o caderno (seção 6) tem a ficha de cada degrau para reler com calma.

**Se acerta:** o domínio sobe; se o nó chegou a 4, o selo aparece; no encontro seguinte, a preferência vai para nós liberados pelo avanço (cujos pré-requisitos acabaram de passar de 2).

### 5.3 Mapa do fluxo de um encontro

Gatilho → balão "?" → P0 (escolhida pela prioridade) → resposta.
- **Acertou P0:** explicação curta com fonte, crédito integral, selo se houver, volta ao jogo.
- **Errou P0:** ficha de reforço → P1 (mais simples). Acertou P1: mostra a solução de P0, crédito parcial. Errou P1: P2 (mais simples) se existir. Acertou P2: mostra P1 e P0. Errou P2, ou sem P2: ensina P2, P1 e P0 em ordem, sem novas perguntas, e volta ao jogo.
- Em todos os casos o encontro tem no máximo 3 perguntas e termina com o jogador de volta ao ponto onde estava, com o relógio retomado.

### 5.4 Foco de conceitos por missão

| Missão | Nós priorizados (relevância = 1) | Gancho narrativo |
|---|---|---|
| 1 Treinamento | N02, N07, N08, N10 | primeira leitura do Geiger e distância |
| 2 Goiânia | N13, N06, N02, E-GOI | pó de césio, brilho azul, triagem no estádio |
| 3 Radium Girls | N06, N05, E-RAD | tinta com rádio, ingestão, osso como o cálcio |
| 4 Chernobyl | N03, N11, E-CHE | I-131 (8 dias) x Cs-137 (30 anos), síndrome aguda |
| 5 Lia | N04, N09, N08, E-LIA | fonte de Sr-90, beta e blindagem |
| 6 Zaragoza | N11, N12, E-ZAR | dose, controle de qualidade, uso médico (N14) |
| 7 Mayapuri | N13, N09, N07, E-MAY | fonte órfã de Co-60 em ferro-velho |
| 8 Fukushima | N03, N12, N06, E-FUK | fatos x mitos sobre os efeitos, defesa em profundidade |

## 6. Pontuação e caderno de campo

### 6.1 Pontuação relativa a um máximo (decidido com Arnaldo)

Em vez de somar "pontos de aprendizado" soltos, a missão passa a ter um **aproveitamento de 0 a 100%**: 100% = fez tudo sem deslize; cada deslize desconta. O aprendizado entra como **uma parte menor**, para não competir com a busca e a identificação das fontes, que continuam sendo o centro do jogo.

| Componente | Peso | Como é calculado | Desconta quando |
|---|---|---|---|
| Busca e identificação | 55% | acertos na identificação ÷ tentativas, ponderado pela fração de fontes achadas | erra a identificação (cada tentativa errada reduz a fração) |
| Tempo | 20% | 100% dentro da meta da missão; cai linearmente até 0% em 2 vezes a meta | passa da meta de tempo |
| Aprendizado | 25% | média, sobre os encontros respondidos, do crédito de cada encontro | erra a pergunta original |

**Crédito de um encontro:** 100% se acerta P0 de primeira; **40%** se precisa de P1 e acerta; **15%** se precisa de P2 e acerta (créditos menores que o rascunho de 50% e 25%, por decisão de Arnaldo em 14/10/2026; ainda a calibrar); 0% se erra todas (o jogo ensina) ou pula. **Desligar os encontros nas configurações é permitido, mas custa os 25%:** o componente de aprendizado fica em 0% e os outros dois **não são reescalados**, então o máximo possível passa a ser 75%. Isso fecha a brecha de desligar para chegar a 100% e dá ao jogador um motivo para ligar (decisão de Arnaldo). A tela de configurações diz isso com clareza ("Sem encontros, o aproveitamento máximo é 75%"). **Pular** um encontro específico também conta 0% naquele encontro. As estrelas não são afetadas.

**As estrelas ficam como hoje** (precisão ≥ 80% dentro da meta = 3 estrelas, ≥ 60% = 2, senão 1) e **não dependem do aprendizado**, para não mudar o equilíbrio que já foi testado. O aproveitamento em % é um número a mais na tela final, mais fácil de entender ("fez 92%") e, no futuro, base natural para um modo competição.

**Calibragem:** os pesos acima são ponto de partida. Na 5d vou calibrar com a simulação que já temos (jogadores sintéticos com diferentes taxas de acerto e velocidades) para checar três coisas: quem faz tudo certo chega a 100%; um bom caçador que erra todas as perguntas continua com mais de ~75% (a busca não é anulada); e um aluno que responde tudo certo mas é lento e erra identificações não ganha mais que o caçador preciso. Se alguma falhar, os pesos mudam antes de qualquer tela ser feita.

### 6.2 Caderno de campo (notebook) permanente

O caderno é **do jogador e vale para todas as missões**: guarda o domínio dos conceitos, as fichas e os selos entre partidas e sessões, no navegador, com botão "zerar caderno" (com confirmação). Acesso pelo menu principal, pelo menu de pausa e ao fim de cada missão.

**Design (a ser refinado na 5d-2 com capturas de tela):** um caderno de campo de laboratório, aberto, com capa e marcador de página:
- **Páginas de papel** quadriculado levemente envelhecido, margem vermelha, furos de espiral à esquerda, sombra e leve curvatura; fonte manuscrita legível para os títulos (a fonte do corpo continua legível para leitura e acessibilidade; nada de texto fino sobre textura).
- **Abas laterais por tema** (Natureza e detecção; Decaimento; Proteção; Dose e efeito; Fontes e segurança; Histórias) e um **índice** com o progresso por conceito (anel de 0 a 4 e o selo ao dominar).
- **Fichas coladas** como cartões presos com fita: título, duas frases, "Para saber mais" com a fonte; as fichas de reforço têm uma tarja diferente. Cada ficha mostra de que missão veio.
- **Selos de conceito** como carimbos coloridos (um por nó) e uma página de **história**, em que cada acidente tem sua página com os fatos aprendidos.
- Páginas ainda não descobertas aparecem em branco com um "?" (curiosidade), nunca como lista de pontos perdidos.
- Funciona com teclado (setas e Tab), toque e leitor de tela; contraste mínimo 4,5:1; animação de virar a página desligada com movimento reduzido.

## 7. Acessibilidade, sala de aula e i18n

Tudo por teclado (1, 2, 3 ou Tab e Enter; M e F para Mito/Fato; Esc = pular antes de responder e continuar depois) e por toque (botões grandes, ≥ 48 px). Sem limite de tempo dentro do encontro; leitores de tela recebem o texto num `aria-live`; movimento reduzido remove o balão animado. PT e EN no lançamento (as perguntas ficam nos arquivos de dados com campos `pt` e `en`, e um teste exige paridade); espanhol depois. Opção de professor: um parâmetro `?turma=CODIGO` na URL muda a semente dos pontos de encontro (turmas diferentes não copiam posição) e é opcional.

## 8. Dados, código e testes (plano para a 5d)

- `js/data/encontros/conceitos.js`: nós, arestas, pré-requisitos, missões que priorizam, ficha de reforço (PT/EN) com fonte.
- `js/data/encontros/perguntas.js`: id, nó, nível, formato, enunciado, alternativas, resposta, explicação, `fatos` (IDs do banco de referências), `status` (V, C ou R).
- `js/encontros/motor.js`: funções puras (seleção, reforço, domínio, validação do grafo), rodam em Node sem Phaser.
- `GameScene`: pontos de encontro semeados, gatilho, pausa com `GameState.paused` e `modalAberto`; `ui.js`: modal reutilizando o do modo de identificação; `progresso.js`: campo `aprendizado` com saneamento.
- **Testes novos:** grafo sem ciclos e com todo pré-requisito existente; todo nó com pelo menos uma pergunta L1; ids únicos; resposta dentro do intervalo; PT e EN presentes; explicação ≤ 280 caracteres; toda pergunta com `status` e `fatos` válidos no índice de referências; o motor com sequência de respostas conhecida (erro em L2 → serve L1 do mesmo nó; erro em L1 → serve o pré-requisito; mesma sequência → mesmas perguntas); a pausa congela o relógio; as 8 missões continuam concluíveis com os encontros ligados (o robô que teletransporta passa por casas de gatilho: os encontros disparam só por movimento contínuo ou o robô os responde por função); o jogo sem encontros é idêntico ao atual.
- **Esforço recomendado:** 5d-1 motor, dados e testes (Sonnet, médio/alto); 5d-2 modal, gatilhos e caderno (Sonnet, médio/alto); 5d-3 redação final das perguntas em PT e EN com checagem das fontes (modelo maior, alto); 5d-4 revisão crítica (modelo maior, alto).

## 9. Banco inicial de perguntas (rascunho; 55 itens no código)

Redação concisa de trabalho; a versão final de cada texto será revista na 5d-3, com cada trecho reaberto na fonte. "Resp." é a resposta certa; a explicação vem entre colchetes e o ID entre parênteses remete ao banco bruto.

**N01 Radiação existe na natureza**
- N01-1 · L1 · Mito x Fato. "A radioatividade só existe por causa de usinas e bombas." → MITO. [O radônio vem do urânio e do tório de solos e rochas, e o corpo tem potássio-40.] (M4.1, C5.3) V
- N01-2 · L2 · Tema. "Qual é, em média, a maior fonte de radiação natural?" Resp.: o radônio, gás natural que sai de rochas e solo. Outras: raios cósmicos; potássio-40 do corpo. (M4.2, C5.2) V
- N01-3 · L2 · Tema. "Comer uma banana (potássio-40 natural) dá uma dose da ordem de:" Resp.: 0,1 microsievert. Outras: 0,1 mSv; 100 mSv. [Muito pequena; não é risco.] (M2.3) V

**N02 Radiação é invisível; instrumentos**
- N02-1 · L1 · Mito x Fato. "Dá para ver ou sentir a radiação ionizante." → MITO. [Não se vê, ouve, cheira, prova nem sente; por isso se usam instrumentos.] (C7.1) V
- N02-2 · L2 · Tema (Goiânia). "O relatório da AIEA registra que o pó de césio brilhava em azul no escuro. O que isso ensina?" Resp.: o brilho atraiu as pessoas, mas a luz não mede a dose, e a falta de brilho não prova segurança. Outras: que todo material radioativo brilha; que o brilho azul significa dose baixa. [O relatório diz que o interesse pelo brilho afetou o curso do acidente e atribui a luz, com cautela, a fluorescência ou radiação Cherenkov.] (A-GOI.1, A-GOI.2) V + R

**N03 Decaimento e meia-vida**
- N03-1 · L1 · Mito x Fato. "Esquentar ou comprimir uma fonte radioativa faz ela decair mais rápido." → MITO. [Temperatura e pressão não mudam a meia-vida.] (C1.2) V
- N03-2 · L2 · Mito x Fato. "Dá para prever qual átomo decai e quando." → MITO. [Cada decaimento é aleatório; só se prevê o comportamento do conjunto.] (C1.3) V
- N03-3 · L2 · Tema. "Depois de 2 meias-vidas, que fração da atividade original resta?" Resp.: 1/4. Outras: 1/2; zero. [Metade a cada meia-vida: 1/2 × 1/2.] (C1.1, C1.4) V + C
- N03-4 · L3 · Tema (Chernobyl). "O I-131 tem meia-vida de ~8 dias e o Cs-137, ~30 anos. Meses depois do acidente, qual preocupa mais?" Resp.: o Cs-137. [Em 80 dias o I-131 passa por ~10 meias-vidas e resta cerca de 0,1%.] (Fórum 2005 via fatos 3e; C1.4) V + C

**N04 Tipos de radiação**
- N04-1 · L1 · Tema. "Qual destas é barrada por uma folha de papel?" Resp.: a radiação alfa. Outras: beta; gama. (C3.1) V
- N04-2 · L2 · Tema. "Qual das três atravessa mais matéria?" Resp.: a gama (exige material denso como chumbo ou concreto). Outras: alfa; beta. (C3.3) V

**N05 Unidades**
- N05-1 · L1 · Tema. "1 becquerel (Bq) é:" Resp.: um decaimento por segundo. Outras: 1 joule por quilo; 1 sievert por hora. (C9.1) V
- N05-2 · L2 · Mito x Fato. "O becquerel mede quanta radiação o corpo absorveu." → MITO. [Bq mede a atividade da fonte; a dose absorvida é em gray (1 Gy = 1 J/kg) e o efeito biológico em sievert.] (C9.1, C9.2, C9.3) V

**N06 Exposição x contaminação**
- N06-1 · L1 · Mito x Fato. "Quem fez um raio X ficou radioativo." → MITO. [Foi exposto, não contaminado; uma pessoa irradiada externamente não fica radioativa nem espalha contaminação.] (C6.1, C6.2) V
- N06-2 · L2 · Tema. "Alguém está com contaminação externa. Qual ação reduz mais o material radioativo?" Resp.: tirar a camada externa de roupa (pode remover até 90%). Outras: esperar o material decair sozinho; tomar um remédio qualquer. (M3.4) V
- N06-3 · L3 · Tema (Goiânia). "Cenário A: fazer um raio X. Cenário B: passar pó de cloreto de césio na pele. Qual envolve contaminação?" Resp.: só o B. [O relatório registra pessoas que passaram o pó na pele; no raio X há exposição, sem material sobre o corpo.] (C6.1, A-GOI.4) V

**N07 Tempo, distância, blindagem**
- N07-1 · L1 · Mito x Fato. "Contra a radiação não há o que fazer." → MITO. [Três princípios: menos tempo, mais distância e blindagem.] (C2.3) V
- N07-2 · L2 · Tema. "Você precisa passar perto de uma fonte. O que reduz mais a dose?" Resp.: ficar menos tempo, mais longe e com uma barreira. Outras: correr de olhos fechados; só ficar parado. (C2.3) V

**N08 Inverso do quadrado**
- N08-1 · L2 · Tema. "Para uma fonte pontual, dobrar a distância faz a taxa cair para:" Resp.: um quarto. Outras: metade; a mesma. (C2.1) V
- N08-2 · L3 · Tema. "A 1 m o Geiger marca 400 cps acima do fundo. A 4 m, sem blindagem, esperamos cerca de:" Resp.: 25 cps. Outras: 100; 200. [4 vezes mais longe: 1/16.] (C2.1) V + C

**N09 Blindagem por tipo**
- N09-1 · L1 · Tema. "Qual material barra bem a radiação beta?" Resp.: plástico ou metal leve fino (alumínio). Outras: papel de seda; nada barra. (C3.2) V
- N09-2 · L2 · Tema. "Qual blindagem é mais eficaz contra gama?" Resp.: material denso e espesso, como chumbo ou concreto. Outras: uma folha de papel; uma camada de ar de 1 cm. (C3.3) V
- N09-3 · L3 · Mito x Fato. "Chumbo é a melhor blindagem para qualquer radiação." → MITO. [Para beta, o chumbo gera raios X de freamento; preferem-se materiais de baixo número atômico, como plástico.] (C3.5) V

**N10 Geiger conta e flutua**
- N10-1 · L1 · Mito x Fato. "O Geiger diz a dose e o tipo da radiação." → MITO. [Ele indica eventos de ionização, sem dizer tipo nem energia.] (C8.1) V
- N10-2 · L2 · Tema. "Com a sonda parada, o painel mostra 8, 11, 9, 14 cps. Isso significa:" Resp.: uma flutuação estatística normal. Outras: a fonte está se movendo; o aparelho quebrou. (C8.2) V

**N11 Dose, tempo e efeito**
- N11-1 · L1 · Mito x Fato. "Qualquer exposição à radiação causa doença aguda." → MITO. [A síndrome aguda exige dose alta, penetrante e rápida, da ordem de 1 Sv; a literatura dá também ~0,7 Gy.] (M1.1 a M1.3) V
- N11-2 · L2 · Tema. "O mesmo total de dose, recebido de uma vez ou espalhado por anos, tem o mesmo efeito?" Resp.: em geral não: doses altas e rápidas podem causar síndrome aguda; doses baixas espalhadas não causam problema imediato. (M1.4) V

**N12 ALARA e limites**
- N12-1 · L1 · Tema. "ALARA significa:" Resp.: manter a exposição tão baixa quanto razoavelmente exequível. (C4.1) V
- N12-2 · L2 · Mito x Fato. "Se a dose está abaixo do limite, não precisa reduzi-la." → MITO. [A proteção parte da hipótese de que qualquer exposição pode trazer algum risco; por isso se mantém o mais baixo razoável.] (C4.3) V
- N12-3 · L2 · Tema. "No Brasil, o limite anual de dose para o público é:" Resp.: 1 mSv. Outras: 20 mSv; 100 mSv. (M2.6) V

**N13 Fonte desconhecida: o que fazer**
- N13-1 · L1 · Tema. "Você acha um objeto com o símbolo de radiação num terreno baldio. O que fazer?" Resp.: afastar-se, não tocar e chamar as autoridades. Outras: levar para casa; abrir para ver o que é. (M8.1) V
- N13-2 · L2 · Tema (Goiânia). "Qual lição o relatório da AIEA tira sobre fontes fora do local licenciado?" Resp.: podem ser um grande risco, e a responsabilidade de quem responde por elas não acaba. (A-GOI.7) V

**N14 Usos benéficos**
- N14-1 · L1 · Mito x Fato. "A radiação só faz mal." → MITO. [O Tc-99m é usado em diagnóstico; cerca de metade dos pacientes com câncer precisa de radioterapia.] (M7.1, M7.2) V

**Nós de história**
- E-GOI-1 · L2 · Tema. "Em Goiânia, quantas pessoas foram monitoradas e quantas estavam contaminadas?" Resp.: cerca de 112.000 e 249. (A-GOI.6) V
- E-RAD-1 · L2 · Tema. "Por que o rádio da tinta dos mostradores ia parar nos ossos?" Resp.: porque o rádio se comporta como o cálcio e se deposita no osso. (A-RAD.7) V
- E-CHE-1 · L2 · Tema. "Quantas pessoas morreram de síndrome aguda de radiação em 1986, segundo o UNSCEAR e o Fórum de Chernobyl?" Resp.: 28. (A-CHE.1) V
- E-LIA-1 · L2 · Tema. "As fontes encontradas em Lia eram geradores termoelétricos com qual radioisótopo?" Resp.: estrôncio-90. (A-LIA.1) V
- E-ZAR-1 · L2 · Tema. "O que falhou no acelerador de Zaragoza e que lição a AIEA aponta?" Resp.: um transistor em curto deixou a energia no máximo; depois de um reparo, verificar o feixe com a equipe de Física. (A-ZAR.1, A-ZAR.3) V
- E-MAY-1 · L2 · Tema. "Qual a origem do material do acidente de Mayapuri?" Resp.: um irradiador de cobalto-60 de um laboratório universitário, sem uso, leiloado e desmontado num ferro-velho. (A-MAY.3) V
- E-FUK-1 · L2 · Tema. "Segundo a OMS, houve mortes por radiação aguda entre trabalhadores ou público em Fukushima?" Resp.: não houve lesões nem mortes por radiação aguda (as mortes do tsunami são outra categoria). (A-FUK.5) V

Cobertura (rascunho original): 40 perguntas, 14 nós de conceito e 7 de história; **o banco no código (`js/data/encontros/perguntas.js`) já tem 55 perguntas e todos os nós têm nível 1 (verificado por teste);** todos os nós têm L1 ou L2, e os nós N08, N09 e N03 têm L3. A 5d-3 deve completar L1 e L3 onde faltam (N04, N05 L3, N13 L3, N14 L2, nós de história L1 e L3) para a árvore de reforço funcionar em todos os ramos.

## 10. O que ficou de fora de propósito

- Fatos com status N (origem do nome "Radium Girls", data de lei, valor brasileiro de fundo natural, significado oficial do trifólio).
- Números de tireoide e de liquidators de Chernobyl (as fontes divergem; só entram se a pergunta citar a fonte e o ano).
- Pergunta "Chernobyl não foi explosão nuclear" (sem fonte oficial lida).
- Espessuras de blindagem do jogo como "fato das agências": são escolhas didáticas do projeto 3a.

## 11. Decisões

**Fechadas por Arnaldo em 14/10/2026:**
1. Encontros por missão: **3** (2 em pontos fixos semeados + 1 disparado pelo Geiger).
2. Pontuação **relativa ao máximo** (aproveitamento 0 a 100%), com o aprendizado como componente menor, equilibrado com busca e tempo (seção 6.1).
3. Errou 1 vez: **ficha de reforço**, sem repetir a mesma pergunta; encadeamento até 3 perguntas; no fim, as soluções são ensinadas uma a uma (seção 5.2).
4. Caderno **permanente**, para todas as missões, com design de caderno de campo (seção 6.2).
5. Código de turma na URL: **em aberto**. Modo competição: **só no futuro**.

**Ainda a confirmar (recomendação):**
- Limite de 3 perguntas por encontro (recomendo manter; motivos na seção 5.2). **Confirmado implicitamente; segue assim.**
- Pesos 55/20/25: **aprovados como ponto de partida** (a calibrar na 5d).
- **Pular um encontro = 0% naquele encontro; desligar os encontros = aprendizado 0%, máximo de 75% (sem reescalar).** Decidido por Arnaldo em 14/10/2026.
- **Regras de implementação (5d-1):** desempate da escolha de nó = menos vezes visto, depois sorteio semeado; nível 1 só entra com os pré-requisitos já vistos (nós de história são isentos); créditos 1 / 0,5 / 0,25 (pontos de partida, a calibrar); encontros ainda não disparados quando a missão termina são apresentados antes da tela de conclusão; nós de história da própria missão ganham prioridade (+5) e o mesmo nó não se repete na missão (−6).
- O cofre de guarda segura fica para uma etapa 5e curta.
- **Implementado na 5d-2 (14/10/2026):** os 2 pontos fixos são casas alcançáveis do mapa real (o mapa muda a cada partida, então o *sorteio* é fixo por missão, mas a casa depende do mapa); o gatilho do Geiger exige o detector ligado, sinal contínuo acima de 2x o fundo por 1,5 s e pelo menos 15 s de jogo; intervalo mínimo de 40 s de jogo entre encontros; durante o encontro o relógio fica parado e o botão de pausa não age; Esc pula (0%); o fim de missão apresenta os encontros que faltam antes da tela de conclusão; o caderno de campo abre pelo menu e pela pausa.

## 12. Atualizações da 5d-5 (14/10/2026)

- **Pesos:** fontes 55, tempo 20, encontros 15, cofre 10 (aprendizagem total 25). Encontros e cofre desligados: teto de 75%.
- **Mito x Fato com confiança:** certeza (crédito pleno), quase certeza (70%), não sei (erro sem penalidade); erro com certeza total reduz pela metade o crédito das chances seguintes.
- **Cofre (provisório):** uma pergunta de blindagem por tipo de radiação das fontes da missão (alfa, beta, gama), crédito 0 ou 1, registrada no caderno (alfa em N04; beta e gama em N09). Projeto definitivo: cofre interativo com prateleiras por tipo de radiação, fichas das fontes e blindagem característica (a definir com o Arnaldo).
