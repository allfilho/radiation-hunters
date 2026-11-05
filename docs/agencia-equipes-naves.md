# Agência · equipes, naves, hangar e dose (v1.0, implementada na v3.6.0, 28/10/2026)

Estado: **implementado na v3.6.0** (decisões do Arnaldo de 28/10/2026 na seção 6; ver tabela de implementação ao fim). Marcas: [V] verificado em fonte consultada em 28/10/2026; [C] calculado; [H] hipótese/valor de jogo a calibrar.

## 1. O que foi pedido
1. Cada cientista leva uma caneta dosimétrica; quem recebe muita radiação fica em tratamento.
2. Mais de um cientista por voo; novos cientistas chegam ao longo do tempo (microgestão no estilo X-COM).
3. Hangar abre uma tela própria, onde se compram novos "slots" com novas naves.
4. Dois tipos de nave: **tripulação** e **resgate do material radioativo**. Fluxo da fonte: achar → organizar → levar a um ponto marcado no mapa → enviar a nave de resgate para coletar.
5. Terceiro tipo: **nave de levantamento aéreo** (gama no ar), como em Goiânia; as fontes ficam pré-localizadas no minimapa. Só é liberada depois de pesquisa e recursos.

## 2. O que o X-COM faz (pesquisa de 28/10/2026)
- [V] O Skyranger é o transporte de tropas: leva até 14 soldados, custa US$ 500 000 e é "o único jeito" de levar a equipe às missões e de recuperar artefatos (UFOpaedia, *Skyranger*). Tropa e nave são recursos separados: a nave é escolhida e a tropa é designada a ela.
- [V] Soldado ferido sai da nave; a licença é sorteada entre 0,5× e 1,5× a vida perdida, em dias, contada à meia-noite. Quando cura, volta ao serviço mas **precisa ser designado de novo** a uma nave (UFOpaedia, *Recovery time*). [Não confirmei efeito do hospital nessa página.]
- [V] A base é uma grade 6×6; hangar ocupa 4 casas; cientistas e engenheiros precisam de cama (alojamento) e de laboratório/oficina para trabalhar; todos recebem salário mensal; radar pequeno tem alcance curto (UFOpaedia, *X-COM Base*). Valores de cada instalação não estão nessa página.
- [V] (já pesquisado) relógio do Geoscape, calendário de missões e avaliação mensal do conselho.
- [Não verificado] custo/tempo de construção por instalação, quantas naves cabem por hangar, tempos de pesquisa e fabricação. Nada será copiado; só a estrutura geral (pessoas, naves, instalações, pesquisa, dinheiro).

## 3. O que existe na vida real (e o jogo pode ensinar)
- [V] **Levantamento aéreo em Goiânia (1987).** O artigo do Instituto de Radioproteção e Dosimetria (Barretto e Fonseca, *Brazilian Journal of Radiation Sciences*) relata um sobrevoo a baixa altitude, feito poucos dias depois de a CNEN saber do acidente. Cobriu a área urbana, vizinhanças e dois córregos em dois dias, achou **um ponto de contaminação a mais** que as equipes de solo ainda não tinham identificado, não achou contaminação nas margens do córrego Capim Puba nem no rio Meia Ponte, e mostrou que a contaminação se limitava a poucos locais perto do ferro-velho. Testes sobre a área principal detectaram o gama do Cs-137 até 350 m de altura, contra 40 a 70 m nos sobrevoos. O artigo não informa a aeronave nem o detector na página consultada. Fonte: https://bjrs.org.br/revista/index.php/REVISTA/en/article/view/2231
- [V] **Caneta (dosímetro de bolso de leitura direta).** Usada no bolso como uma caneta-tinteiro, tem câmara de ionização, eletroscópio e lente; lê-se a sombra de uma fibra de quartzo numa escala, em geral de 0 a 200 mR (ou mrem); costuma-se levar duas. Fonte: ORAU Health Physics Museum, https://orau.org/health-physics-museum/collection/dosimeters/pocket/bendix-model-609.html
- [V] **Limite ocupacional**: 20 mSv por ano (valor da enciclopédia da Foratom/Euronuclear; não consultei a norma CNEN diretamente. Antes de citar no jogo como "norma brasileira", conferir a CNEN NN 3.01). Fonte: https://old.euronuclear.org/info/encyclopedia/d/doselimitvalue.htm
- [V] **Síndrome aguda da radiação (SAR):** exige dose alta, de corpo inteiro, de radiação penetrante em curto tempo; sintomas leves podem aparecer a partir de ~0,3 Gy; a síndrome hematopoiética completa ocorre em geral entre 0,7 e 10 Gy (CDC, https://www.cdc.gov/nceh/radiation/emergencies/arsphysicianfactsheet.htm). **Consequência de projeto:** o jogo é sobre exposição em campo; doses que internam de verdade são raras e graves. Para jogar, "tratamento" será por **dose de campo acumulada (mSv)**, com limiares de jogo bem abaixo da SAR, e o texto deve dizer que é uma simplificação.

## 4. Proposta de microgestão

### 4.1 Equipe
- Cada cientista tem: nome, **dose acumulada no período (mSv)**, estado (disponível / em voo / em tratamento até o dia X), e uma **caneta** (inclusa; não é item de loja).
- O time se **escolhe antes do voo**: lista com a dose de cada um e um aviso "perto do limite". Capacidade por nave (ver 4.3). Quem volta de tratamento precisa ser **designado de novo** (mecânica do X-COM [V]).
- **Começa com 4 cientistas** (decisão do Arnaldo) e dá para contratar mais.
- **Chegada de cientistas**: a cada mês, depois da avaliação, chega 0 a 2 candidatos conforme nota e verba (contratação paga com créditos; salário mensal [H]). Limite = camas do Alojamento (sala já existente). Alojamento passa a ter capacidade; o Hangar também.
- **Vida = dose.** A "vida" de cada cientista é uma função da **dose acumulada na janela** (ver 4.2): quanto mais dose recente, menos vida. Não há morte nem sofrimento gráfico; é um medidor didático.
- **Tratamento = aguardar.** Quem atinge o limite de dose da janela fica **em tratamento**, isto é, afastado de novas exposições, até que a dose da janela caia a um nível adequado às normas do jogo. Não é "cura" por dinheiro: a dose antiga sai da janela com o tempo, e o jogo mostra "volta em N dias" [C]. Enquanto isso, o jogador precisa de outros cientistas (contratar, revezar). Isso ensina por que o limite é por período e por que se reveza a equipe.

### 4.2 Caneta, dose, vida e normas do jogo
Tudo aqui é **simplificação** (ferramenta de ensino, não de dosimetria real). O jogo terá um quadro "Normas da Agência" com valores de jogo e a origem de cada número. Decisões do Arnaldo (28/10/2026): janela de 12 meses é longa demais para uma simulação; usar janela curta, **semanal**, como nos relatórios de Goiânia.
- **O que Goiânia usou [V].** Slides de treinamento da AIEA sobre o acidente (ORPNET, slide 22): como havia pontos quentes de dezenas de mSv/h, foram fixados **limites operacionais de 1,5 mSv por dia, 5,0 mSv por semana, 15 mSv por mês e 30 mSv por trimestre**; o slide 25 cita o limite anual de 50 mSv (nenhum dos 730 trabalhadores de descontaminação o excedeu); o slide 26 diz que a chuva dificultou manter o limite diário; o slide 23 diz que os filmes individuais eram trocados após um mês ou ao fim de cada período de trabalho; o slide 35 descreve eletrômetros de fibra de quartzo em pares (0–2 mGy e 0–50 mGy). O slide não diz quem fixou esses limites nem cita a fonte; trato como "limites operacionais usados na resposta, segundo material de treinamento da AIEA". O artigo do BJRS sobre as doses externas diz que 1 091 trabalhadores foram monitorados, que só uma dose passou de 20 mSv, que a média foi cerca de 1,0 mSv e que usavam filme individual e anéis TLD (IRD/CNEN); esse artigo não menciona limites semanais nem dosímetros de bolso.
- **Janelas do jogo** (decisão: semanal como base): `D1`, `D7` e `D30` são as doses somadas nos últimos 1, 7 e 30 dias de jogo. Limites de jogo [V origem, H uso]: `L1 = 1,5 mSv`, `L7 = 5 mSv`, `L30 = 15 mSv`. O trimestre e o limite anual ficam de fora (simulação).
- **Vida** `V = 100 · (1 − r)`, em que `r = max(D1/L1, D7/L7, D30/L30)` (a janela mais restritiva manda). Verde acima de 50 %, amarelo de 25 a 50 %, vermelho abaixo de 25 % (sempre com texto, não só cor). [H]
- **Nível de atenção** `r ≥ 0,5`: a caneta fica amarela e o jogo pergunta "por que a dose subiu?" (tempo, distância, blindagem). (O nível de investigação da CNEN 229/2018, 1 mSv em qualquer mês, é de outra natureza e não é usado.)
- **Tratamento** quando `r ≥ 1` (vida 0 %) ou, por escolha do jogador, a partir do nível de atenção. Sai quando `r < 0,75` [H], o que acontece quando as doses antigas saem das janelas. Tempo previsto [C] = menor `t` em que o `r` projetado, só com as doses ainda dentro de cada janela, fique abaixo de 0,75; mostrado como "volta em N dias". Com a janela semanal dominante, o afastamento típico é de alguns dias, e o de 30 dias só pesa em quem acumulou muito.
- **Caneta**: [V] caneta de bolso com câmara de ionização e fibra de quartzo, escala em geral 0 a 200 mR (ORAU); na AIEA/Goiânia, usada em pares. A do jogo mostra mSv da missão e a vida; HUD com escala, cor e texto.
- **Modelo de dose** (`js/fisica/dose.js`): hoje o jogo só tem taxa de contagem do Geiger. Dose = ∫ taxa de dose · dt com `taxa = Γ·A/d²` e atenuação pela blindagem. **Constantes Γ a buscar em fonte** (não escrevi valores). Alvo [H]: uma missão normal soma décimos de mSv por pessoa (abaixo de `L1`); descuido passa de `L1` e leva a tratamento. A síndrome aguda da radiação só ocorre a partir de ~0,3 Gy de corpo inteiro [V CDC]; o jogo não simula isso.
- **Ensino**: o jogador revê por que há limite diário, semanal e mensal, e as três proteções (tempo, distância, blindagem) viram decisões; revezar a equipe protege.

### 4.3 Naves e hangar
- **Hangar** vira tela própria (como a Base em corte, com slots numerados). Cada slot tem uma nave; slots extras se **compram** com créditos [H: custo crescente]; limite máximo [H] 4 a 6 slots.
- **Tripulação** (o jato atual): leva a equipe (capacidade [H] 4 no início). Única que pousa o time no local.
- **Resgate** (carga): leva uma equipe mínima de manejo (2) e **recolhe fontes** previamente organizadas e levadas a um ponto de coleta; volta à Base e entrega ao Cofre. Sem o resgate, a fonte não sai do local.
- **Levantamento aéreo** (detecção de radiação gama no ar, voando baixo): ao sobrevoar uma região, **revela no minimapa só as fontes emissoras de gama** (como em Goiânia, onde o sobrevoo achou um ponto a mais [V], e o gama do Cs-137 foi detectável até 350 m de altura [V]). **Fontes só alfa ou só beta não aparecem**: o alcance da alfa no ar é de poucos centímetros e o da beta, de metros [conhecimento geral de física de radiação, coerente com o modelo do Geiger do jogo; citar fonte antes de usar em texto de aluno], então o detector no ar não as vê. Isso também ensina que cada instrumento enxerga um tipo de radiação. Fontes com gama associada (por exemplo, beta+gama) aparecem pela componente gama. Sem pesquisa e crédito, a nave não existe. Alcance e altura por detector são dados de jogo [H].
- Naves têm **estado**: em voo, no hangar, em manutenção [H]. Duas naves podem estar em missões diferentes, daí a microgestão: o relógio corre durante voos longos.

### 4.4 Fluxo da fonte (novo)
1. Achar a fonte com o Geiger (já existe).
2. **Organizar**: identificar e colocar no recipiente blindado (Cofre/identificação já existentes, hoje no fim da missão).
3. **Levar a um ponto de coleta** marcado no mapa da missão (pátio, ponto de pouso); o jogador carrega a fonte (peso/dose em trânsito [H]).
4. Pedir a **nave de resgate** na Agência; ela vem em N horas; sem ela, a fonte fica sob guarda local e o prazo continua correndo.
5. A missão só se encerra com fonte recolhida (substitui o "terminar quando os cofres estão lacrados"). Estrelas, créditos e pontos entram aí.

### 4.5 Pesquisa e dinheiro
- Pesquisa na **Biblioteca** (sala já existente): projetos que custam créditos e tempo (dias de jogo) e dependem de cientistas livres. Primeiro projeto: detector aéreo. Depois: melhor caneta, melhor blindagem etc. [H]
- Orçamento mensal (já existe: nota × fator de verba) paga salários, manutenção das naves e pesquisa. Expirar alerta continua reduzindo nota e verba até o piso.
- Novos cientistas e naves custam créditos; a loja de instrumentos (GM → ZnS → NaI → câmara) já planejada passa a ser da **Oficina**.

### 4.6 Base como área que cresce (estilo X-COM)
- [V] No X-COM a base é uma grade 6×6; cada instalação ocupa uma casa, o hangar ocupa quatro, instalações custam dinheiro e levam tempo para ficar prontas, e cientistas e engenheiros precisam de cama e de laboratório/oficina (UFOpaedia, *X-COM Base*). Os valores de cada instalação não constam dessa página.
- No jogo: a Base em corte atual passa a ser uma **grade de módulos** (por exemplo, 6 colunas × 3 andares, [H]). A tela mostra a **área atual construída** e os **terrenos livres**, e o jogador **compra e constrói** módulos (custo em créditos e prazo em dias de jogo; durante a obra o módulo aparece "em construção", como a oficina "em breve" de hoje).
- Módulos [H]: Alojamento (6 camas, +6 por módulo), Hangar (1 slot de nave por módulo, 2 casas), Laboratório/Biblioteca (pesquisa), Oficina (loja de instrumentos e manutenção), Cofre (mais capacidade de fontes guardadas), Comando (alcance dos alertas no mapa), Academia (já existe). Enfermaria opcional: apenas mostra quem está em tratamento.
- Salas atuais viram o ponto de partida: Hangar, Comando, Academia, Cofre, Alojamento, Biblioteca prontos; Oficina "em breve" vira a primeira compra. Capacidade de cientistas = camas.
- O que isso ensina: planejar capacidade (pessoas, naves, fontes guardadas) com orçamento limitado.

## 5. Plano em etapas (modelo e esforço recomendados)
1. **Estado de equipe e naves, sem física nova** (Sonnet, médio): cientistas com nome, estado, seleção para o voo, hangar com 1 slot e a tripulação. Testes. Menor risco, já dá a microgestão.
2. **Tela do Hangar + compra de slots + nave de resgate** (Sonnet, médio) e o novo fim de missão com fonte levada ao ponto de coleta (Sonnet, alto: mexe no fluxo das 8 missões).
3. **Dose e caneta** (Opus, alto, só para a física e a revisão; Sonnet depois para a interface): constantes de Γ, modelo de dose, limiares; tratamento e chegada mensal.
4. **Pesquisa e nave de levantamento** (Sonnet, médio; revisão de física pelo Opus): projeto de pesquisa, minimapa com fontes pré-localizadas.
5. **Calibração com alunos e revisão de texto** (humano + Opus).
Troca de esforço: Sonnet médio nas etapas 1, 2 e 4; Opus alto na 3 e na revisão final.

## 6. Decisões
Decididas pelo Arnaldo (28/10/2026):
- Começa com **4 cientistas**, e dá para contratar mais.
- Janela de dose **semanal** (com limites diário e mensal de apoio, como em Goiânia), por ser simulação.
- Levantamento aéreo mostra **só fontes com gama**; alfa e beta não.
- **6 camas** no Alojamento no começo, ampliáveis por compra.
- A nave de resgate **pode ser enviada a fontes já separadas** (inclusive de missões antigas).
- Nome: **Agência Chronos / Chronos Agency** (o mesmo nome nos dois idiomas; sem busca de marca).
- **Base como grade de instalações**, no estilo X-COM: mostra a área atual, o que já existe e permite comprar mais (ver 4.6).
Em aberto:
- Limites operacionais de jogo 1,5 mSv/dia, 5 mSv/semana, 15 mSv/mês (Goiânia, slides AIEA) e retorno a 75 %: confirmar.
- Custos e tempos de construção das instalações (valores de jogo [H], a definir na etapa da Base).

## 7. Riscos
- Dose: sem Γ verificado não calibramos nada; as constantes entram só depois de fonte (NIST/IAEA/ICRP).
- Escopo: etapas 2 e 3 mudam o fim das missões; precisam de testes novos e de revisão didática para não punir iniciantes.
- Linguagem: tratar "dose" e "tratamento" como simplificação, sem sugerir que doses de campo comuns causam SAR [V CDC].


## 8. Implementação (v3.6.0)
| Parte | Onde | Valores de jogo [H] |
|---|---|---|
| Equipe, janelas de dose, vida, tratamento | `agencia/equipe.js` (testes 45) | 1,5/5/15 mSv (dia/semana/mês) [V Goiânia, slide 22 AIEA]; atenção 50 %; retorno < 75 %; líder 100 %, apoio 40 %; coleta 0,2×L1 por fonte |
| Naves, hangar (2 baias), módulos, grade 4×2 até 6×3, pesquisa, contratação, coleta | `agencia/frota.js` (testes 46) | nave 300/250/500; hangar 600, alojamento 300, laboratório 400; escavar coluna 300, linha 400; contratar 250; pesquisa detector aéreo 500 e 10 dias; coleta vale 40 por fonte, prazo 20 dias; +400 créditos iniciais |
| Relógio e eventos (retorno, obra, pesquisa, entrega, coleta vencida, candidatos no fim do mês) | `agencia/simulacao.js` v2 | 2 candidatos por mês, prazo 30 dias |
| Interface: Base em grade, hangar, laboratório, alojamento, montagem da equipe | `agencia/ui-base.js`, `ui-agencia.js` (testes 42, 47) | máx. 4 cientistas na tripulação, 2 no resgate |
| Dose em campo e caneta no HUD | `fisica/dose.js`, `GameScene.atualizarDose` | K = 1e-4 mSv por (cps·s); só gama, omnidirecional, sem blindagem do corpo |
| Ponto de coleta "H" e levantamento aéreo no minimapa | `GameScene` (`iniciarColeta`, `levantado`) | só fontes com componente gama aparecem marcadas |

Limites conhecidos: voos de resgate e levantamento aparecem como prazo e estado das naves, sem animação no mapa; equipamento da Oficina continua "em breve"; calibragem dos valores depende de teste em sala de aula.
