# Histórico de versões

Novas entradas entram no TOPO desta lista (logo abaixo do marcador). O histórico completo também está no Git (`git log`) e nos tags `vX.Y.Z`.

<!-- HISTORICO-INICIO -->
## v3.45.0 — 2026-11-10 — Uma regra visual (aço e papel) e movimento
- **Regra única em toda a Agência:** aço para aparelhos e comandos (barra, mapa-múndi, interior da nave, HUD, modais de sistema); **papel para documentos e notícias**. Todos os cartões de conteúdo das salas da Base (Laboratório, Oficina, Dep. médico, Academia, Cofre, Biblioteca, Hangar, Centro de comando, Alojamento) e o detalhe do alerta passam a ser papel com tinta escura, títulos em serifa e botões de papel (o principal em tinta cheia).
- **Alertas como recortes de notícia** (faixa colorida por tipo), avisos como bilhetes, cientistas do preparo como mini-fichas.
- **Movimento:** entrada curta e escalonada dos documentos ao trocar de vista ou de sala (nunca a cada clique), detalhe do alerta sobe ao selecionar, resposta ao passar e ao tocar em alertas, cartas e fichas, transição suave entre telas. Tudo desligado com "reduzir movimento" do sistema.
- **Correção:** as opções do plano de dose vazavam da ficha no computador (defeito da v3.42).
- **Testes:** novo 92 (auditoria automática de contraste ≥ 4,5 de todo texto em papel, em 9 salas, lista e detalhe, desktop e celular; plano sem vazar; regras do movimento).

## v3.44.0 — 2026-11-10 — Dossiês em papel, Hangar em papel e símbolos desenhados
- **Dossiês dos cientistas** (Alojamento e Dep. médico) como pasta de arquivo em papel manila: tinta escura, cores da caneta e do moral escurecidas para leitura no papel (contraste testado), botões em papel.
- **Hangar** como "Quadro de operações" e coleta como "Ordem de serviço", em papel.
- **Símbolos desenhados** (SVG, traço dourado) no lugar dos emojis nas cartas de campo e nos arcanos: satélite, cronômetro, vento, setas, prédio, radar, escudo, pegadas, ampulheta, estrela (`js/arte/arcanos.js`).
- Roteiro de calibração: seção 13 (arcanos e semente da turma).
- **Testes:** novo 91 (4 subtestes: símbolos sem emoji, contraste do dossiê em desktop e celular, Hangar em papel, arcanos em campo).

## v3.43.0 — 2026-11-10 — Arcanos no meio da missão e semente da turma (modo professor)
- **Arcanos de campo** (tarô de Cult of the Lamb): ao achar a 1ª e a 3ª fonte, aparece um painel com 2 arcanos; o jogador escolhe 1 (ou deixa passar; some em 20 s) e o efeito vale até o fim da missão. Não pausa o jogo. Vale nas missões avulsas e nas da Agência. Arcanos [H]: Radar (a fonte mais próxima pisca no minimapa por 25 s), Fôlego (correr gasta metade), Escudo (o próximo erro de identificação não custa dose nem quebra o combo), Passos leves (+10 % de velocidade), Ampulheta (+30 s na meta de tempo), Estrela (+50 % de pontos nas próximas fontes).
- **Semente da turma** nas Missões avulsas (modo professor): quem digita a mesma semente joga a mesma corrida (mesma posição e força das fontes, mesmos arcanos oferecidos), para comparar resultados na aula. Sem semente, cada partida é diferente. Na Agência, os arcanos seguem o alerta e o dia.
- Código: `js/corridas.js` (lógica pura); `util.js` com gerador de acaso trocável (`usarAleatorio`); ganchos em `GameScene` (oferta ao achar fonte, velocidade, fôlego, meta de tempo, pontos, escudo, radar no minimapa) e `ui.js` (painel e formulário da semente). Configuração salva: `settings.sementeTurma`. i18n +24 chaves (253).
- **Testes:** novo 90 (7 subtestes: oferta, determinismo da semente em duas partidas, telas pt/en em desktop e celular, efeitos); 01 ajustado.

## v3.42.0 — 2026-11-10 — Identidade de jornal em todo o jogo e briefing fácil no começo
- **Caderno de campo** virou "Arquivo de recortes": papel claro, tinta escura, abas como seções de jornal, cada conceito como recorte colado com fita; os não descobertos aparecem como recorte riscado. Corrige um defeito de contraste: o estilo de aço dos modais cobria o papel e deixava texto marrom sobre azul-escuro (ilegível).
- **Briefing do dia** como "Boletim da manhã" da Gazeta Chronos (mês e dia de jogo). **Mais fácil no começo** [H]: até o dia 15 só "fato ou mito" de nível 1 dos conceitos de base; até o dia 40, nível 1; depois, nível 1 ou 2. O assunto da pergunta passa a entrar no Caderno de campo.
- **Relatório de volta** como "Edição extra": a primeira frase vira manchete; o resto, texto em colunas quando cabe.
- **Preparo do voo:** plano de dose como "Ficha de dosimetria" em papel; cartas de campo como arcanos (numeral, símbolo, moldura dourada); proposta do cliente como telegrama.
- **Centro de comando:** Políticas no "Diário Oficial da Agência"; Mural como coluna de Homenagem; confiança pública como Pesquisa de opinião.
- **Mesa de dados:** feltro verde, dados desenhados em cada rodada, rodada da metade em destaque; aviso no painel do mapa ("Mesa de jogos aberta hoje") com botão que leva ao Alojamento.
- i18n +1 chave (229). **Testes:** novo 89 (5 subtestes: contraste do caderno ≥ 7 em desktop e celular, briefing fácil, jornal na Agência pt/en); 01 ajustado.

## v3.41.0 — 2026-11-10 — Moral, confiança pública, dados do decaimento, ajuda escondida e ícones de recompensa
- **Moral da equipe** (fé dos seguidores de Cult of the Lamb): de 0 a 100, começa em 70. Cai 6 a cada saída e mais 6 se o cientista voltar com a caneta amarela ou vermelha; sobe com dia de folga (+3), promoção (+10), briefing certo (+4 para todos) e partida de dados ganha (+3). Animado (≥ 80) anda 3 % mais rápido; desanimado (< 40) 5 % mais devagar (< 20: 10 %) [H]. Aparece no dossiê, com pensamento próprio quando está baixo.
- **Confiança pública por região** (pânico das nações do X-COM): 6 regiões do mapa, começam em 60; alerta concluído +5, alerta vencido −10. A média muda a verba mensal: 1 com 60, entre 0,7 e 1,2 [H]. Painel no Centro de comando.
- **Mesa de jogos do Alojamento: dados do decaimento** (no lugar do Knucklebones): 30 dados, sai quem tira 6; o jogador aposta em qual rodada restará a metade. Uma partida por dia; acerto exato +40 créditos e moral. A resposta mostra a rolagem e explica a meia-vida média de cerca de 3,8 rodadas (ln 2 ÷ ln 6/5) [C].
- **Ajuda escondida** (Cult of the Lamb): depois de muito tempo sem achar fonte (60 s ou 35 % da meta), um pulso fraco aparece no minimapa no bloco aproximado da fonte mais próxima, sem aviso.
- **Ícones de recompensa** nos alertas (lista e detalhe): prêmio, bônus, proposta do cliente, prazo curto e região com confiança baixa.
- Código: `js/agencia/base-viva.js` (lógica pura) e `js/agencia/ui-base-viva.js` (telas); save com `moral`, `confianca` e `dados`. Simulador de um ano: Base completa no dia 240 (antes 244). Roteiro de calibração: seção 12.
- **Testes:** novo 88 (10 subtestes, pt/en, desktop e celular).

## v3.40.0 — 2026-11-10 — Políticas da Agência, cartas de campo e propostas do cliente
- **Políticas da Agência** (doutrinas de Cult of the Lamb): no Centro de comando, escolhas permanentes de 1 de 2, abertas com 3, 8 e 15 alertas concluídos [H]. Dose da equipe: Revezamento obrigatório (bônus do plano de dose ×1,5) ou Produção (prêmio das missões de campo ×1,1, sem bônus do plano). Informação: Mapa prévio (toda missão de campo chega com as fontes gama marcadas, prêmio ×0,85) ou Resposta rápida (+4 dias de prazo nos alertas novos). Pessoal: Folga garantida (alta 5 pontos antes, um chamado rápido a menos) ou Plantão (um chamado a mais, alta 5 pontos depois). Aviso no painel do mapa quando há política para escolher.
- **Cartas de campo** (tarô de Cult of the Lamb + equipamento do X-COM): no preparo, 3 de 5 cartas por alerta e dia; escolher uma ou nenhuma. Levantamento emprestado, Pressa do cliente (+25 % de prêmio, meta de tempo 25 % menor), Fôlego (correr gasta metade), Segunda chance (o 1º erro de identificação não custa dose), Patrocínio (+100 créditos ao concluir) [H].
- **Propostas do cliente** (tentar sem forçar): cerca de 30 % dos alertas de campo trazem uma oferta: +40 % se for só um cientista, ou +30 % se a equipe for sem objetivo de dose. Aceitar é opcional; o extra só sai se a condição for cumprida e a missão concluída. Se a exposição ficar alta (caneta de quem foi sozinho a 75 % do limite, ou alguém acima de 1 mSv sem plano), a Direção registra exposição desnecessária: −1 de nota [H]. Perícias e falsos alarmes não têm proposta.
- Código: `js/agencia/decisoes.js` (lógica pura), `js/agencia/ui-decisoes.js` (telas); ganchos no prêmio (`simulacao.concluir`), prazos e vagas de chamados, limite de alta (`frota.limiteRetorno`), bônus do plano, levantamento, meta de tempo, fôlego e dose do erro (`GameScene`). Save com `politicas`. i18n +1 chave (228). Roteiro de calibração: seção 11.
- **Testes:** novo 87 (8 subtestes, pt/en, desktop e celular); 01 ajustado.

## v3.39.0 — 2026-11-10 — Carreira dos cientistas, Mural da Agência e briefing do dia
- **Carreira** (ideia de Cult of the Lamb + X-COM): cada missão ou investigação concluída soma uma missão a quem estava na saída. Postos: Iniciante (0), Especialista (3), Sênior (8), Referência da Agência (15) [H]. A cada promoção o jogador escolhe no Alojamento 1 de 2 bônus permanentes: Agilidade (+8 % de velocidade em campo), Manuseio (−30 % de dose na coleta), Precisão (metade da dose extra do erro de identificação), Recuperação (alta 5 pontos antes) [H]. Os bônus se multiplicam com os da especialidade.
- **Pensamento** no dossiê de cada cientista, a partir do estado: tratamento, caneta amarela ou vermelha, muitos dias seguidos em campo, novato, veterano, promoção pendente.
- **Aposentadoria e Mural da Agência:** quem chega a Referência com 20 missões pode se aposentar com homenagem; vai ao Mural (Centro de comando), libera a cama e dá +1 de nota. Sem morte de personagens.
- **Briefing do dia:** no painel do mapa, uma pergunta dos Encontros por dia de jogo (nível 1 ou 2, sem repetir as 30 últimas); acerto rende 30 créditos [H].
- **Correção:** o dossiê do cientista vazava à direita no Alojamento e no Dep. médico (a coluna de texto crescia com botões).
- Código: `js/agencia/carreira.js` (lógica pura), `js/agencia/ui-gente.js` (telas); save da Agência com `missoes`, `escolhas`, `mural` e `briefing` (saves antigos começam do zero). Roteiro de calibração: seção 10.
- **Testes:** novo 86 (10 subtestes, pt/en, desktop e celular).

## v3.38.0 — 2026-11-10 — Fase F: plano de dose antes da missão
- **Plano de dose no preparo** (missões de campo e chamados rápidos): mostra a margem de cada cientista embarcado até o limite das Normas (janela mais restritiva de 1, 7 ou 30 dias) e pede o objetivo de dose individual da saída: 0,25 / 0,5 / 0,75 / 1,0 mSv ou sem objetivo. Sugestão automática (o maior objetivo que cabe na menor margem) até o jogador escolher; aviso se alguém embarcado tem margem menor que o objetivo.
- **Dosímetro em campo:** linha no HUD com a dose da saída de quem está à frente e o objetivo; com a câmara de ionização, também o tempo estimado até o objetivo na taxa atual (tempo = dose ÷ taxa). Ao atingir o objetivo, alarme (três bipes e aviso) uma vez por cientista, sugerindo trocar quem vai à frente (7 a 0) ou terminar. Nada é forçado.
- **Relatório:** missão concluída com todos dentro do objetivo paga bônus de 20 / 15 / 10 / 5 % do prêmio. Quem passar o objetivo em mais de 25 % provoca a revisão pós-trabalho: a equipe fica 1 dia a mais ocupada, sem bônus. Base real: OECD/NEA, *Work Management* (NEA 6399, 2009) [V]; valores do jogo [H] (docs/calibracao-fases-b-d.md, seção 9).
- **Lição N17 "Planejar a dose"** (4 perguntas; fatos em docs/referencias-5c/busca/plano-dose-v3-38.md: NEA 6399 e 10 CFR 34.47 [V], cálculo tempo = dose ÷ taxa [C]).
- **Na-24:** linhas gama confirmadas na tabela 3 de padrões da IAEA-NDS (1368,626 e 2754,007 keV) [V].
- Código: `js/agencia/plano-dose.js` (lógica pura); preparo em `ui-base.js`; relatório, bônus e revisão em `ui-agencia.js`; HUD e alarme em `GameScene.js`, `ui.js`, `audio.js`; textos pt/en.
- **Testes:** novo 85 (12 subtestes: lógica, preparo em desktop e celular pt/en, HUD, alarme, bônus, revisão); 84 com identificação errada e linhas do Na-24; 09 (24 conceitos).

## v3.37.1 · 2026-11-09 — Correções do teste no site publicado (Perícia de Laboratório)

- Ato 1 e Ato 2 passam a mostrar na tela do chamado o aviso do bônus opcional e o prêmio (Ato 1: bônus de 2500 créditos ao final; Ato 2: 2500 com 2 estrelas, até 3250 com 3). pt/en.
- Cartão da pesquisa "Geocronologia" no Laboratório: texto próprio ("Disponível: a pesquisa anterior abriu esta linha"), sem dizer que "o material coletado abriu esta linha" (nós sem `descoberta`).
- Teste 84: +2 subtestes de tela (pt/en). Suíte: 84/84.
- Pendente (decisão do usuário): tema do mapa do Ato 1 (hoje rua/`factory`).

## v3.37.0 — 2026-11-09 — Perícia de Laboratório (Ato 1 + bônus da datação)
- **Nova categoria "Perícia de Laboratório"** no mapa da Agência: a investigação do Laboratório de Cronologia deixa de ser sorteada sozinha (`soPericia`) e passa a ser o **Ato 2, um bônus**, que só abre depois do Ato 1.
- **Pesquisa "Geocronologia: o decaimento como relógio"** (1800 créditos, 10 dias, exige o espectrômetro concluído, sem equipamento): é ela que libera as Perícias [H].
- **Ato 1 (chamado de perícia, semente fixa `q980000001`):** um pacote de vidro vulcânico voltou do reator de pesquisa com atividade induzida. A equipe identifica o que ativou (**Na-24**, meia-vida de cerca de 15 h, gamas de 1,37 e 2,75 MeV; distratores Co-60 e Cs-137) e isola as 2 fontes. Prêmio 500 créditos. Se vencer, volta a ser oferecido.
- **Ato 2 (a datação, bônus):** prêmio de **2500 créditos** (investigação comum paga 600), prazo de 30 dias que se renova sem punir; só uma vez. Enredo e física do reator seguem a investigação existente (a irradiação com nêutrons térmicos em reator de pesquisa; a fonte Am-Be não é usada, o fluxo seria incomparável).
- **Na-24** entra como `NA24` em `data/isotopes.js` (fora de `ISOTOPES`, via `addIsotope`). Meia-vida da tabela D-1 da IAEA-NDS [V]; linhas gama e força de jogo [H].
- **Lição N16 "O decaimento como relógio"** (4 perguntas, fatos em docs/referencias-5c/busca/pericia-v3-37.md). Ficha e dica de campo do Na-24 em pt/en.
- **Reserva de sementes:** os chamados comuns agora ficam abaixo de 980.000.000 (a faixa 980.000.000–989.999.999 é da perícia; 990.000.000 em diante, de poço). Antes, cerca de 1 % dos sorteios comuns caía na faixa de poço.
- **Saves antigos:** `est.pericia` {feita, ato2} entra com valores neutros; `i-tempo` ativo ou concluído continua válido.
- **Testes:** novo 84 (9 subtestes, com o campo em pt/en); 09 (23 conceitos) e 69 (prêmios) ajustados. Suíte completa: 84 arquivos verdes.
- Pendente: calibração em sala (docs/calibracao-fases-b-d.md, seção 8); confirmar as linhas gama do Na-24 no LNHB; revisão do Arnaldo sobre os isótopos de ativação e a espera de amostras irradiadas.


## v3.36.0 — 2026-11-06 — Fase E (parte 2): chamados de poço de petróleo e lição de nêutrons
- **Chamados de poço:** depois de concluir a pesquisa do espectrômetro, 30 % dos chamados rápidos novos (hipótese de jogo) são de pátio de campo de petróleo, com 1 ou 2 fontes **Am-241/Be**. Relato, manchete e fala fictícios, três regiões (Texas, interior da Austrália, estepe do Cazaquistão), mapa industrial. Distratores: Tc-99m, Sr-90 e Am-241. Sem a pesquisa nenhum sorteio novo é feito, então o fluxo antigo e os saves não mudam.
- **Sementes de poço** são as de `q990000000` em diante (`POCO_MIN`). Um erro do sorteio (o `find` consumia o gerador) foi pego pela suíte; o teste 83 varre 3000 sementes.
- **Em campo:** dica de erro própria para nêutrons (pt/en), ficha do Am-241/Be, rótulo do candidato. O primeiro Am-241/Be coletado libera a pesquisa do detector de nêutrons.
- **Lição N15 "Nêutrons pedem outro escudo":** 4 perguntas e 3 fatos novos em docs/referencias-5c/busca/neutrons-v3-36.md (Fermilab TM-1834, Health Physics Society, SPE). "Chumbo não barra nêutrons como barra gama" é raciocínio do projeto (V+R).
- **Testes:** novo 83 (6 subtestes); 01 (222 chaves) e 09 (22 conceitos) ajustados. Suíte completa: 83 arquivos verdes.
- Pendente: revisão de físico dos valores de nêutrons; calibração em sala (seção 7); dose de nêutrons fora do modelo.


## v3.35.0 — 2026-11-06 — Fase E (parte 1): nêutrons, detector e placa de polietileno
- **Fonte Am-241/Be** (`AMBE` em `js/data/isotopes.js`, fora de `ISOTOPES`): nêutrons + gama de 4,44 MeV com peso 0,75; espectrômetro lista as linhas 60 e 4440 keV. Dados em claude/radhunter-fase-e-neutrons.md.
- **O Geiger não conta nêutrons** (hipótese de jogo [H], a confirmar): a fonte só aparece pelo gama de 4,44 MeV. Novo `taxaNeutronsEsperada` (1/d², paredes, placa) e `transmissaoNeutron`; Σ de remoção por material é [H] (polietileno 0,20 por cm; chumbo 0,005).
- **Placa 5 de polietileno** (5 cm, 0,92 g/cm³ [V]), à parte de `SHIELDS` para não mexer no cofre; atenua nêutrons e pouco o gama. Só aparece em campo da Agência depois da pesquisa do detector.
- **Pesquisa e Oficina:** `detectorNeutrons` exige espectrometria concluída e Am-241/Be coletado; 2400 créditos e 14 dias; equipamento 1000 e 7 dias [H]. Entra no inventário individual. Nomes de isótopo com barra (`Am-241/Be`) aceitos no save.
- **HUD:** mostrador "Nêutrons: X cps" para quem leva o detector (com o Geiger ligado, tecla G); botão e tecla 5 da placa.
- **Testes:** novo 82 (8 subtestes); 01 (221 chaves), 59 e 75 ajustados. Suíte completa: 82 arquivos verdes.
- Sem dose de nêutrons no modelo. Valores e limites em docs/calibracao-fases-b-d.md (seção 7).


## v3.34.0 — 2026-11-06 — Fase D (parte 3): retratos dos engenheiros
- **Retratos próprios:** engenheiros e candidatos a engenheiro aparecem com capacete amarelo e colete refletivo laranja (`retratoSvg(npc, expressao, { engenheiro: true })`), para se distinguirem dos cientistas à primeira vista no Alojamento. Cientistas ficam como antes; o retrato sem a opção é idêntico ao anterior.
- **Teste novo 81:** a opção só liga capacete e colete para engenheiros, o SVG continua bem formado para todos os personagens, e o Alojamento mostra o capacete só nos engenheiros (contratado e candidato). A suíte pegou um conflito de nome de atributo (`data-engenheiro`) com o teste 75 e foi corrigido (`data-retrato-eng`). Suíte completa: 81 arquivos verdes.
- **Com isso a Fase D está completa** (especialidades, inventário individual e retratos). Pendente: calibração em sala (roteiro em docs/calibracao-fases-b-d.md).


## v3.33.0 — 2026-11-06 — Fase D (parte 2): inventário individual
- **Cada cientista leva 1 equipamento.** O que a Oficina fabrica vai para o estoque da Base; no Alojamento, cada ficha tem botões para entregar, trocar ou devolver (mostram quantos restam no estoque; sem estoque o botão fica desabilitado). Trocar devolve o item anterior ao estoque.
- **Em campo vale o equipamento de quem está com o controle** (espectrômetro, câmara de ionização ou sonda alfa); as teclas 7, 8, 9, 0 trocam de cientista e, junto, de equipamento. Isso dá peso à escolha da equipe e às especialidades.
- **Saves antigos:** os itens já fabricados ficam no estoque, sem dono; é preciso entregá-los na nova tela. Entregas além do total ou com item inválido são corrigidas ao carregar.
- Oficina: a lista de equipamentos mostra o total e quantos estão no estoque; nota explica a regra (pt/en).
- **Teste novo 80** (lógica de entrega, saneamento do save, telas pt/en); testes 76, 77 e 78 passam a dar o item a cada cientista. Suíte completa: 80 arquivos verdes.
- Pendente: retratos próprios dos engenheiros; calibração em sala.


## v3.32.0 — 2026-11-06 — Fase D (parte 1): especialidades dos cientistas
- **Especialidades:** cada cientista tem uma de três: Campo (manuseia a fonte na coleta com metade da dose), Física (identificar errado custa metade da dose extra de 0,3 mSv) e Medicina (volta ao serviço com 5 pontos percentuais a mais no limite de retorno). Todos os valores são hipóteses de jogo [H], a calibrar em sala.
- **Equipe inicial e candidatos:** a equipe inicial tem Campo, Física, Medicina e Campo; candidatos novos sorteiam uma especialidade. O alojamento e os cartões de candidato mostram a especialidade e o bônus (pt/en).
- **Saves antigos:** quem não tem especialidade recebe uma derivada do id, sempre a mesma; valores inválidos são corrigidos.
- **Teste novo 79** (5 subtestes: migração, medicina, campo, física, telas pt/en). Suíte completa: 79 arquivos verdes.
- Engenheiros continuam separados e o equipamento continua valendo para a Base toda. Pendente: tela de inventário individual, retratos de engenheiros e calibração em sala.



## v3.31.0 — 2026-11-06 — Fase C (parte 3): sonda alfa no campo
- **Sonda alfa:** com uma sonda de cintilação para alfa fabricada na Oficina (`est.equipamentos.sondaAlfa`), a leitura de fontes alfa na missão de campo da Agência fica 3 vezes mais forte (`SONDA_ALFA_FATOR`, hipótese de jogo). O alcance continua de contato e o fundo, gama e beta não mudam: o ganho é de sensibilidade, não de distância.
- **Teste novo 78:** a física triplica só a parte alfa (razão 3; gama igual; fundo igual) e o jogo liga a sonda só em missão de campo com a sonda no inventário. Suíte completa: 78 arquivos verdes.
- **Executor de testes:** quando um arquivo falha, o `rodar-testes.sh` tenta uma segunda vez isolado e registra a oscilação (`.log1`). O teste 22 (lições em celular deitado) falhou uma vez sob carga e passou isolado.
- **Com isso a Fase C está completa** (espectrômetro, erro de identificação, câmara e sonda). Pendente: calibrar os valores em sala (0,3 mSv, fator 3) e registrar as fichas técnicas dos instrumentos reais.

## v3.30.0 — 2026-11-06 — Fase C (parte 2): câmara de ionização no campo
- **Câmara de ionização:** com uma câmara fabricada na Oficina (`est.equipamentos.camaraIonizacao`), o HUD de missão de campo da Agência mostra a taxa de dose de quem está à frente (mSv/h) e ela sobe junto à fonte. O valor sai do modelo de dose do jogo (`fisica/dose.js`, hipótese de jogo), por isso o texto diz "estimativa de jogo". Sem a câmara, o painel não aparece.
- **Não incluído:** a sonda alfa ainda não tem efeito em campo. Mexer na força do alfa afeta a verificação de acessibilidade das fontes e pede decisão sobre o quanto a sonda melhora a detecção.
- **Teste novo 77:** painel em pt e en, valor maior perto da fonte, ausência sem a câmara. Teste 01 passa a esperar 218 chaves de idioma. Suíte completa: 77 arquivos verdes.

## v3.29.0 — 2026-11-06 — Fase C (parte 1): espectrômetro e dose por erro de identificação
- **Espectrômetro no campo:** com um espectrômetro gama fabricado na Oficina (`est.equipamentos.espectrometro`), o modal de identificação ganha o botão "Usar o espectrômetro". Ele mostra as linhas gama da fonte à frente, com os dados LNHB de `data/emissoes.js` (ex.: Cs-137, 661,7 keV; Co-60, 1173,2 e 1332,5 keV). Fonte só alfa ou beta: avisa que não há linha gama. Só vale em missão de campo da Agência.
- **Erro de identificação:** em missão de campo da Agência, identificar errado custa 0,3 mSv ao cientista à frente (hipótese de jogo: 20 % do limite diário de 1,5 mSv) e a mensagem informa o valor. A perda de estrela já vinha da taxa de acertos.
- **Sem mudança de física:** as placas continuam separando cada isótopo dos distratores (testes 36 e 53); o espectrômetro é um atalho exato, que reduz o tempo junto da fonte. As missões e a progressão de fontes (Cs-137 e Co-60 juntos) ficam como estavam; a primeira entrega dos dois já abre a pesquisa de espectrometria (v3.28).
- **Teste novo 76:** linhas gama em pt/en, botão e leitura em missão real (pt e en), dose extra no erro, sem dose ao acertar, sem botão sem espectrômetro. Teste 01 passa a esperar 216 chaves de idioma.
- **Pendente:** efeitos da sonda alfa e da câmara de ionização em campo; calibrar a dose de 0,3 mSv em sala; fichas técnicas dos instrumentos reais.

## v3.28.0 — 2026-11-05 — Fase B: pesquisa em árvore, engenheiros e Oficina
- **Pedido:** a pesquisa nasce das fontes coletadas (Cs-137 e Co-60 coletados → espectrometria gama) e engenheiros fabricam os equipamentos na Oficina.
- **Inventário de materiais:** a coleta agora guarda quais isótopos foram entregues (antes só a contagem). Ao chegar a nave de resgate, os isótopos entram em `est.colhidas`. Missões antigas sem lista continuam válidas.
- **Árvore de pesquisa** (`js/agencia/ciencia.js`): espectrometria gama (exige Cs-137 e Co-60), sonda de cintilação para alfa (qualquer fonte alfa), câmara de ionização (Co-60 ou Ir-192) e detector de nêutrons (reservado, sem fonte de nêutrons no jogo). Uma pesquisa por vez, no Laboratório. Custos e dias são hipóteses de jogo. O detector aéreo continua como era.
- **Engenheiros:** nova lista própria (não vão a campo, não recebem dose), contratados como candidatos no alojamento, ocupam cama. No fim do mês, se não há engenheiro, um dos dois novos candidatos é engenheiro.
- **Oficina:** deixa de ser "em breve". Lista os equipamentos pesquisados, tem fila de produção (um item por engenheiro livre) e inventário. Os equipamentos prontos só ficam no inventário; o efeito em missão vem na Fase C.
- **Save v3:** `colhidas`, `ciencia`, `engenheiros`, `fila`, `equipamentos`; saves v2 abrem sem perda; lixo é saneado.
- **Correção:** janelas longas da Base no celular (390×844) não rolavam e o botão ficava fora da tela; agora rolam.
- **Teste novo 75** (10 casos): isótopos na entrega, gatilhos, pesquisa por dia, engenheiros e fila (1 e 2 em paralelo), cama e créditos, save v2→v3 e lixo, telas em 1280×720 e 390×844, em português e inglês.
- **Testes ajustados:** 01 (211 chaves de idioma, desde a v3.27.1), 42 (texto da Oficina), 46 (um candidato do mês é engenheiro: agora chegam 3), 55 (rótulo das naves segue o idioma). Suíte completa: 75 arquivos verdes.
- **Pendente:** retratos próprios para engenheiros (usam os retratos existentes), calibrar custos em sala, revisar com especialista a redação dos nós (fichas técnicas dos instrumentos reais ainda a registrar em `docs/parametros-fisicos.json`).

## Licenças — 2026-11-05
- **Código:** MIT (`LICENSE`), copyright do Grupo de Cronologia (IFGW/Unicamp) e Arnaldo Filho.
- **Conteúdo educacional:** CC BY-NC-SA 4.0 (`LICENSE-CONTEUDO.md`), com escopo por pastas; nomes "Radiation Hunters" e "Agência Chronos" fora das duas licenças; Phaser e fontes mantêm as licenças originais.
- Escolha a confirmar com a Inova Unicamp (propriedade intelectual).

## v3.27.1 — 2026-11-05 — Inglês completo
- **Pedido:** com o inglês escolhido, nada pode aparecer em português.
- **Auditoria:** 4 varreduras automáticas (dados `pt`/`en`, chaves faltando, textos gerados pelos jornais e casos, telas navegando em inglês). Os dados e jornais estavam limpos; os vazamentos eram pontos fixos do código.
- **Corrigido:** rótulos dentro das ilustrações da Base e da superfície (`LIMITE: 3 PESSOAS`, `DESCON.`, `RESGATE`, `LEV.`, `EM VOO` agora seguem o idioma: `LIMIT: 3 PEOPLE`, `DECON.`, `RESCUE`, `SURVEY`, `IN FLIGHT`); descrições de acessibilidade "Agência", "Equipe em campo" e "incerteza" (novo atributo `data-i18n-aria` + chaves `agenciaAria`, `equipeCampoAria`, `incertezaAria`); botão "← Voltar" do HTML agora "← Back" por padrão.
- **Teste novo 73:** nenhum texto `en` dos módulos contém português (referências bibliográficas ficam de fora); menu, Base e todas as salas em inglês sem português (inclui rótulos SVG e atributos de acessibilidade); rótulos da ilustração mudam com o idioma. Teste 26 ajustado (investigação do menu abre em reportagem).
- **Teste novo 74 (troca de idioma):** na mesma página, pt → en → pt → en pelos botões do menu; em cada idioma percorre menu, missões, investigações, Agência (alertas), Base (todas as salas), história e jogo da missão 2, texto do mapa, pausa e reportagem de investigação, e falha se aparecer texto (ou descrição de acessibilidade) visível no idioma errado, nas duas direções. Passou sem vazamentos nas telas visíveis.
- **Limite honesto:** a varredura automática cobre o menu, a Agência, a Base, os alertas, os jornais e as investigações; telas muito profundas (encontros no meio de uma missão, cofre, caderno) foram verificadas só pelos dados `pt`/`en`. Se aparecer português em outro lugar, o teste 73 é o ponto para acrescentar a tela.

## v3.27.0 — 2026-11-05 — Departamento médico (Fase A do plano de ciência e equipamentos)
- **Novo módulo `medico`** (construível, único, 1100 créditos, 4 dias de obra) com arte em corte lateral (`base-svg.js`: armário com cruz, maca, monitor, portal de descontaminação) e em planta (`arte/planta.js`: três macas e cruz no piso); retrato novo da Dra. Cecília (`cecilia` em `retratos.js`).
- **Regra [H]:** com o módulo pronto, a alta de quem está em tratamento sai com dose relativa < 85 % (`NORMAS.retornoMedico`) em vez de 75 %; `limiteRetorno(est)`/`temMedico(est)` em `frota.js`; `verificarRetorno` e `diasParaVoltar` ganharam o parâmetro `limite`. Atenção: o plano original falava em "60 %", mas um limite menor atrasaria a alta; adotei 85 % para acelerar. Sem o módulo nada muda, e saves antigos continuam válidos.
- **Interface:** botão "Departamento médico" no menu da Base (desabilitado até construir); sala com a fala da Dra. Cecília, lista de quem está em tratamento (ficha com dose e dias para a alta) e a regra em vigor; quem está em tratamento aparece na sala médica (antes, no alojamento); o alojamento sugere construir o médico enquanto não existe. Rótulo curto "Dep. médico" nas células da planta.
- **Testes:** novo 72 (construção, alta antecipada, arte, interface em 1280×720 e 390×844); ajustado 50 (menu com 14 botões).
- **Ainda pendente do plano:** Fase B (banco de pesquisa + engenheiros), Fase C (progressão de fontes: Cs-137 e Co-60 separados no início), Fase D (tipos de cientista e inventário).

## v3.26.0 — 2026-11-05 — Investigações do menu abrem como reportagem
- **Pedido:** a abertura de toda missão deve ter o tema de jornal/TV; faltavam as investigações abertas pela aba "Investigações" do menu.
- **Mudança:** `ui.abrirInvestigacao(id, leitura, relato)`; os cartões, o "Sortear" e os 4 problemas de pesquisa passam `relato=true` e `main.js` mostra `jornalInvestigacao` antes do mapa. Links diretos por URL (`?investigacao=`, modo leitura) continuam abrindo direto, para o professor.
- **Testes:** novo 71; ajustados 25, 30, 34 e 35 (passam pela reportagem antes do mapa).
- **Validação:** suíte completa rodada na v3.25.0; na v3.26.0 rodaram os testes 25, 27, 30, 34, 35 e 71 (todos verdes). Nova suíte completa recomendada antes do deploy.

## v3.25.0 — 2026-11-05 — Nave de transporte (embarque e cabine)
- **Pedido:** nave em que a equipe "entra de verdade", inspirada na ideia de transporte de esquadrão de jogos táticos (arte original, sem copiar nenhum jogo).
- **Arte (`js/arte/transporte.js`, novo):** transporte desenhado em pixel-art com rampa traseira, cabine do piloto, bancos laterais, rotores e fogo; `transporteSvg`, `interiorSvg` (equipe sentada), `cenaEmbarqueSvg` (fila de embarque), `posicoesEmbarque`. `nave.js` usa o transporte para o tipo "tripulação"; `planta.js` ganhou `transportePlanta` (vista de cima no Hangar da Base).
- **Jogo (`ui-agencia.js`):** ao decolar, a equipe caminha até a rampa e embarca; durante o voo mostra-se a cabine com a equipe sentada; na chegada há animação de desembarque (pulada com movimento reduzido). Sem exploração livre.
- **Testes:** novo 70 (posições de embarque, arte, cabine no jogo).
- **Pendente:** investigações abertas pelo menu "Investigações" ainda não abrem como reportagem.

## v3.24.0 — 2026-11-05 — Dinheiro, falso alarme em mapa sorteado, saída única, aberturas em reportagem
- **Relato do Arnaldo:** dinheiro por missão pequeno; falso alarme (detector de fumaça) sempre no hospital; saída com muitos botões e "baixar JSON"; aberturas e finais sem a temática de jornal/TV.
- **Dinheiro:** prêmios dobrados (rápida 180, fácil 400, normal 600, difícil 900, extremo 1400, investigação 600) e coleta a 60 por fonte; custos iguais. Recalibrado com `tests/ferramentas/calibrar-economia.mjs` (200 simulações): laboratório ~dia 14 (antes 30), 2º hangar ~60 (antes 90), Base completa ~251 (antes 360).
- **Falso alarme:** agora num mapa sorteado do bioma do chamado (rua, quintal, depósito, costa...), com as mesmas 5 cenas; `prepararFalso(semente, bioma)` na chegada da Agência; sem sorteio (acesso pelo menu) vale a planta antiga do hospital. Os 5 pontos se ajustam aos tiles alcançáveis do mapa gerado.
- **Saída:** o final de toda investigação é uma "edição extra" (TV, rádio ou jornal, conforme o caso) com a mensagem da equipe, as evidências e o que ficou em aberto; **um único botão** "Voltar à Base" (ou "Voltar ao menu" fora da Agência); o caderno completo fica recolhido e "Baixar .json / Copiar resumo" ficam em "Para professores e revisores", também recolhido. "Sair" e "Voltar ao cenário" só aparecem com a investigação em andamento ou no modo revisão.
- **Abertura:** investigações pela Agência abrem como reportagem (jornal/TV/rádio) antes do mapa (`jornalInvestigacao`). Pelo menu "Investigações" ainda abrem direto (decisão para não quebrar o fluxo do professor; pode virar reportagem também).
- **Testes:** novo 69; ajustados 25, 27, 30, 34, 44, 65 (botão de saída, exportação recolhida, abertura em jornal, prêmio 180).
- **Suíte:** 496 testes; na rodada completa 493 passaram e 3 falharam só por expectativas antigas (prêmios 300/390 → 600/780; investigação pela Agência agora passa pela abertura em jornal). Testes 42, 43 e 53 ajustados e reexecutados: 28/28 passaram.

## v3.23.1 — 2026-11-05 — Revisão final dos 7 mitos regionais
- Cada mito conferido na fonte primária (AIEA Pub815, ATSDR, INSAG-7, AIEA Pub1660, CSN, Lok Sabha, BASE). Confirmados sem mudança: E-GOI-M, E-CHE-M, E-MAY-M (ressalva >15 x >20 anos). Ajustados: E-LIA-M (datas separadas e queimaduras), E-RAD-M (afinidade pelo osso atribuída à semelhança com o cálcio; sarcomas ósseos e tumores de cabeça), E-ZAR-M (o CSN não diz "nenhum isótopo"; agora "nenhuma fonte radioativa perdida" e 36 MeV só como o que o CSN mediu), E-FUK-M (fatos citados a BASE; frase de física geral marcada [C]).
- A mesma troca "nenhum isótopo" foi feita nas opções da investigação de Zaragoza e no jornal da missão 6.
- Relatório completo: `claude/radhunter-revisao-mitos-regionais.md` no projeto. Teste 66 ajustado (/Nenhuma fonte radioativa/). Suíte completa: 492 testes, 492 passaram.

## v3.23.0 — 2026-11-04 — Jornal antes e depois das missões; fundos pretos dos quizzes
- **Pedido:** ainda havia fundo preto/neon misturado ao jornal nos quizzes; os textos antes e depois das missões deveriam ser de jornal, inclusive um relato de sucesso ao concluir.
- **Depois da missão:** o balanço virou uma **"EDIÇÃO EXTRA"** do jornal da missão (ou da Gazeta dos Caçadores): manchete conforme as estrelas (cumprida/concluída/"há o que melhorar"), subtítulo e texto só com os números do desempenho (fontes, tempo, precisão, aproveitamento), a mensagem final e o placar em quadro de papel. Todos os ids do balanço continuam (`complete-time`, `complete-fontes`, …). Novo módulo puro `js/jornal/reportagens.js` (`reportagemFim`, `jornalRapida`) e `htmlFimJornal` em `jornal.js`. Texto de jogo, fictício; sem fato histórico novo.
- **Antes da missão:** os chamados rápidos abrem como **PLANTÃO** (TV, rádio ou jornal, conforme o veículo sorteado) com manchete, a fala e a cena do bioma; ui.js e main.js.
- **Fundos pretos:** o encerramento do encontro (acerto, respostas, crédito) agora tem o mastro com a seção "Edição fechada", faixa, "Resposta:", crédito e botão "Voltar ao campo" em papel e tinta; o "reforço" também.
- **Não alterado de propósito:** cofre de transporte e telas de investigação (consoles de jogo, não quizzes); se quiser, vira etapa própria.
- **Testes:** novo 68 (edição extra PT/EN e ids; plantão do chamado rápido). Suíte completa: 492 testes, 492 passaram.

## v3.22.2 — 2026-11-03 — Correção: relógio da Agência após o tutorial + abertura do tutorial em jornal
- **Relato:** depois do tutorial, os botões de avançar dias e o play não respondiam (o relógio parecia pausado para sempre).
- **Causa:** o aviso "Correto! Fonte identificada!" (`#notification`) fica invisível (opacity 0) mas deslocado para o topo-centro da tela, e tinha `pointer-events` ativo: cobria exatamente os botões play, ▶▶ e +1 dia da Agência e engolia os cliques. O relógio em si estava certo (confirmado: sem o aviso por cima, play e +1 dia funcionam).
- **Correção:** `pointer-events: none` em `.notification` e `.achievement-popup` (styles.css). Vale para o jogo todo.
- **Tutorial em jornal:** a tela de abertura do tutorial agora é a primeira página da "Gazeta dos Caçadores" (edição de boas-vindas, texto fictício do jogo, sem fatos históricos, rótulos próprios). `JORNAIS.tutorial`; `ui.js` e `main.js` passam 'tutorial'. A Academia completa (missão 1) segue sem jornal.
- **Testes:** novo 67 (jornal do tutorial em PT/EN; nenhum aviso cobre os botões do relógio, visível ou escondido; play e +1 dia avançam). Verificado que o 67 falha sem a correção. Ajustado 63 (chave 'tutorial').
- Suíte completa: 489 testes, 489 passaram.

## v3.22.1 — 2026-11-03 — Um mito por região
- **Problema:** os encontros de nível 1 de cada região (E-GOI a E-FUK) eram todos "fato": o jogador aprendia que pergunta de região = sempre fato.
- **Mudança:** 7 perguntas novas "mito" (ids `E-GOI-M`, `E-RAD-M`, `E-CHE-M`, `E-LIA-M`, `E-ZAR-M`, `E-MAY-M`, `E-FUK-M`), cada uma contrariando um equívoco comum com fato já conferido [V] em `docs/fatos-historicos-3e.md` (clínica abandonada em Goiânia; rádio no osso, não só no pulmão; Chernobyl não foi só erro de operador (INSAG-7); Lia teve feridos e demora de semanas; Zaragoza sem isótopo, alinhado à investigação da v3.21; Mayapuri sem uso por mais de 15 anos; Fukushima = explosões de hidrogênio, não nucleares).
- **Pendente:** revisão final dos 7 textos (lista em `claude/radhunter-revisao-mitos-regionais.md` no projeto). Motor inalterado.
- **Testes:** 66 ampliado (mito e fato por região); 08 aceita `F3E-FUK`. Suíte 487/487 na época.

## v3.22.0 — 2026-11-03 — Quizzes, mitos e fatos com cara de jornal
- **Pedido:** todos os quizzes (inclusive mitos e fatos de cada região) com cara de jornal.
- **Encontros (mito/fato e alternativas):** a janela vira uma coluna de jornal em papel: mastro com o nome do jornal da missão (A Gazeta do Cerrado, Pripyat Herald, El Eco del Ebro etc.) e a data da edição, seção ("Mito ou fato?", "Pergunta do leitor", "Errata e reforço") e a resposta vem como "Resposta da redação". Missões sem jornal (tutorial, chamados rápidos, investigações) usam a "Gazeta dos Caçadores". Função pura `mastro()` em `js/jornal/jornal.js`; rótulos em `jornal/textos.js`; `gerenciador.js` passa `info.jornal`; `ui-encontro.js` desenha o mastro.
- **Lições e quizzes da Academia:** mesma moldura, seção "Ciência em foco" (`ui-licao.js`).
- **CSS:** bloco `.enc-jornal` (papel, serifa, cores de certo/errado legíveis sobre papel).
- **O que NÃO mudou:** o banco de perguntas (`perguntas.js`) e o motor dos encontros são os mesmos; ainda não há mitos/fatos novos escritos por região (pendente, e exige conferência de fatos).
- **Testes:** novo 66; 08, 09 e 62 reexecutados.
- Suíte completa: 486 testes, 486 passaram.
 

## v3.21.1 — 2026-11-03 — Chamados rápidos como notícia e falsos alarmes (parte 2 da v3.21)
- **Pedido:** chamados rápidos vindos de reportagens de TV/rádio/jornal sobre "situações suspeitas", inclusive sem radiação: a equipe mede, conversa com o NPC e tranquiliza.
- **Notícia:** todo chamado rápido ganha veículo (Telejornal, Rádio ou Jornal), manchete e a fala de alguém com receio, mostrados num cartão na Agência (`htmlBoletim`, CSS `.ag-boletim`). Sorteios novos entram no FIM da semente (`rapidas.js`), então mapas e fontes dos chamados antigos não mudam.
- **Falso alarme (~30%, `PROB_FALSO`):** sem fonte perdida (n = 0). Ao chegar, abre uma investigação curta de 5 cenas (receio de Helena → medir longe e junto ao objeto → explicação com André → mensagem com Lúcia, que tranquiliza sem prometer risco zero → limites). Quatro casos em `js/investigacao/falso-alarme.js`: bancada de granito, sacos de fertilizante (K-40), caixa de detectores de fumaça (Am-241 selada: "não é nada" seria falso), vaso de vidro de urânio. Episódios montados sob demanda (`falsoAlarmePorId`), fora da lista de investigações. Campo `CAMPO_FALSO` (número 21, mapa do hospital reaproveitado; trilha 2).
- Novo modelo de atividade `objeto` (Geiger longe/junto ao objeto). Prêmio = o do chamado rápido (2 estrelas); `ui.voltarAgencia` trata o caso.
- **Marcação:** personagens/lugares fictícios [H]; fatos gerais (granito, K-40 0,012%, Am-241 selada, vidro de urânio) [C], pendentes de revisão por especialista em proteção radiológica.
- **Limitação:** o mapa dos falsos alarmes ainda é o do hospital; um mapa neutro (casa/loja) fica para depois.
- **Testes:** novo 65 (proporção e notícia, 4 episódios, percurso completo, caminho pela Agência); ajustados 53 e 60 (n pode ser 0).
- Suíte completa: 484 testes, 484 passaram.

## v3.21.0 — 2026-11-03 — Zaragoza como mistério (parte 1 da v3.21)
- **Pedido:** a missão de Zaragoza deve ser um mistério com NPCs, sem fonte perdida; se houver fonte, que seja de medicina nuclear (exame), não radioterapia; incluir "receio" dos NPCs e comparação com Goiânia.
- **Missão 6 (levantamento):** fontes possíveis agora só Tc-99m e I-131 (exames); Cs-137/Co-60 ficam como candidatos que o jogador descarta (`candidatosExtras`).
- **Nova investigação** `zaragoza-acelerador` ("Zaragoza: o mistério do acelerador"), liberada depois da m6 (`depois: 'm6'` em `ALERTAS`, `sortear` respeita pré-requisito). Cenas: boato (receio de Helena), medicina nuclear (Tc-99m ~6 h), bunker (atividade `feixe` ligado/desligado), manutenção (avaria 5/dez, 36 MeV, 27 pacientes, CSN), comparação Goiânia × Zaragoza (cartões, 3 generalizações erradas), mensagem à imprensa (Lúcia), fecho.
- Novo modelo de atividade `feixe` (modelos.js/atividades.js); campo `CAMPO_ZARAGOZA` (numero 20) ; trilha 6 por alias.
- **Marcação:** partes fictícias [H]; ativação do acelerador [C]; revisão por físico médico PENDENTE.
- **Testes:** novo 64; ajustados 01, 14, 25, 30, 31, 34, 35, 42, 43, 53.
- **Estado:** falta a 2ª parte da v3.21 (chamados rápidos como notícias de TV/rádio, incluindo casos sem radiação).
- Testes 01 e 11 ajustados (missão 6 agora Tc-99m+I-131; texto de blindagem da gama continua só para Cs-137/Co-60/I-131). Suíte completa: 480 testes, 478 passaram + 2 ajustados e reexecutados.

## v3.20.0 — 03/11/2026 — jornal de abertura das missões
- Pedido: as missões começavam com muito texto; um jornal com foto e texto jornalístico, imitando época e região, seria mais dinâmico.
- Missões 2 a 8 abrem com a primeira página de um jornal FICTÍCIO em "edição especial de retrospectiva" (assim os dados posteriores ao fato não são anacrônicos): nome do jornal, data/local, manchete, subtítulo, "foto", 3 parágrafos curtos, "Sua missão" e fonte. O texto longo anterior fica em "Saiba mais".
- Fatos: só os já conferidos nos textos das missões (AIEA, INSAG-7, CSN etc., citados no rodapé). Nenhum fato novo foi acrescentado; os nomes dos jornais são inventados [H]. A "foto" é um DESENHO do jogo em sépia com trama de pontos (js/jornal/foto.js), não fotografia real, e a legenda diz isso.
- Código: js/jornal/{textos,foto,jornal}.js; ui.js `mostrarHistoria(texto, jornalId)`; main.js (override de startMission); CSS no fim de styles.css; PT e EN. O tutorial "Primeiros passos" não usa jornal.
- Teste novo 63; teste da paginação (22) segue passando, pois só as missões sem jornal paginam.

## v3.19.0 — 03/11/2026 — tutorial novo "Primeiros passos"
- Pedido: o tutorial estava longo e chato; começar com o Geiger e quase sem quiz.
- Novo treinamento da Agência (id 1, `js/data/missoes/00-primeiros-passos.js`): sala pequena de laboratório (32×22), Geiger na mão desde o início, 3 fontes de tipos diferentes (Cs-137 gama, Sr-90 beta, Am-241 alfa). Objetivo no HUD passo a passo (ligar o Geiger, procurar, comparar placas 1–4, última fonte).
- Cada fonte identificada abre UMA lição de um parágrafo e UMA pergunta (`js/tutorial/tutorial.js`, painel da Academia reutilizado): 1 Geiger e distância; 2 Blindagem; 3 Tempo, distância, blindagem. Sem encontros nem cofre no fim; concluir libera a missão 2 e a Agência como antes (cerca de 5 minutos).
- A Academia de 8 salas continua inteira: botão "Academia completa (opcional, 8 salas)" no módulo Academia da Base e em Missões avulsas (professor).
- Textos: 3 chaves novas em pt/en (208). Fontes: EPA e NRC como nas lições da Academia [V]; a regra "tempo, distância, blindagem" está marcada [C] para conferir.
- Teste novo 62 (objetivo, Agência, ponta a ponta com as 3 lições); teste 01 ajustado (208 chaves).

## v3.18.0 — 03/11/2026 — ritmo e recursos (jogabilidade)
- Pedido: histórias apareciam rápido demais e os recursos pareciam poucos para o jogo fluir.
- Alertas da história: a cada 10–16 dias (antes 5–9); o primeiro no dia 5. Chamados rápidos: o primeiro no dia 2, depois a cada 4–7 dias, então o jogador começa por um caso simples.
- Economia [H]: verba mensal 1000 → 1500; créditos iniciais 400 → 800; prêmios fácil/normal/difícil/insano/investigação/rápido = 200/300/450/700/300/90 (antes 100/150/250/400/150/60); valor da coleta por fonte 15 → 30.
- Calibração (tests/ferramentas/calibrar-economia.mjs, 200 partidas simuladas, jogador que atende 85 %): laboratório dia 30, 2º alojamento dia 58, pesquisa dia 60, 2º hangar dia 90, nave de levantamento dia 125, Base completa dia ~351 (antes ~mês 17). A ferramenta foi corrigida para ignorar chamados rápidos.
- Testes 42, 43 e 53 ajustados aos novos valores.

## v3.17.2 — 29/10/2026 — chamados rápidos voltam e a história começa pelo fácil
- Pedido: "as missões aleatórias não estão aparecendo… apareceu hospital e Zaragoza em 9 dias". Eu havia lido "Zaragoza" como chamado rápido; é a missão 6 da história (nível normal).
- Chamados rápidos: 1º no dia 4, depois a cada 4–7 dias (antes mais raros), prazo 10 dias; continuam sem parar o relógio.
- Alertas da história: sorteio por nível — fácil, investigação, normal, difícil, insano; dentro do nível, ao acaso. Zaragoza passa a vir depois de Goiânia, hospital e a missão 3.
- Teste 43 ajustado (m6 não é mais exigida no 1º mês; a 8 só sai depois das demais).
- Testes: 43, 53, 60, 42, 45 (direcionados; suíte completa não repetida por ser ajuste de ritmo).

## 2026-10-29 — Barra de espaço pausa e retoma o relógio (v3.17.1)
**Pedido:** rodada rápida de pequenas melhorias.
**Mudou:** na Agência, a barra de espaço pausa e retoma o relógio (1 dia a cada 1,6 s), sem agir quando o foco está num botão, campo de texto ou janela aberta, nem durante o voo. Teste novo em `60-ritmo-do-relogio`.
**Verificado:** testes 40, 42, 45 e 60 (só os da área; a suíte completa roda uma vez por versão maior). Não verificado em aparelhos reais.

## 2026-10-29 — Balanço final, voo de volta e ponto H nas missões aleatórias (v3.17.0)
**Pedido:** (1) ao terminar a missão não faz sentido "repetir / nova missão / menu inicial": só um balanço (por exemplo, fontes coletadas) e voltar à Base, com a nave fazendo o caminho de volta; só se envia outra equipe se houver outra nave; (2) nas missões aleatórias faltava levar as fontes ao ponto H; (3) depois, departamento médico (próxima versão).
**Mudou:**
- Balanço final (`#complete-modal`): linha nova "Fontes coletadas n/total". Quando a missão veio da Agência, só aparece o botão "Voltar à Base" (os de repetir e menu ficam ocultos; fora da Agência, o modo professor continua igual).
- Voo de volta: `retornar()` põe a equipe de volta no jato; o mapa anima a rota ao contrário (barra, "Pular viagem", "Pousar na Base") e o relatório da missão aparece ao lado. `frota.js`: `diasDeVolta(horas)` (1 dia a cada 12 h de jato, mínimo 1 [H]) e `registrarRetorno()`: a nave de tripulação e os cientistas ficam ocupados (`missao.tipo = 'retorno'`, `ocupadoAte`) até o pouso; sem outra nave livre não dá para decolar de novo. Evento "pouso" no relógio (`evPouso`); `sanear()` aceita a viagem de retorno. O Hangar e o mapa mostram a nave em viagem de volta.
- Ponto H nas missões aleatórias: `precisaColeta()` vale também para `tipo === 'rapida'`; as fontes entram na fila de coleta (nave de resgate), como nas missões da história. Correção junto: `sanear()` descartava coletas, levantamentos e viagens de chamados rápidos ao salvar e carregar (usava só os ids da história); agora usa `idValido`.
- Todos os cientistas da saída aparecem no mapa (pedido do Arnaldo): os não selecionados ficam parados, com o número da tecla (7, 8, 9, 0); ao selecionar um, o controle e a câmera vão para ele e o anterior fica parado onde estava (`criarEquipeCampo`, `trocarCientista` em `GameScene.js`). Dose por lugar: cada cientista recebe a dose do ponto onde está (`q.exato`); no fim vale a dose exata de cada um, sem a fração de apoio (esta continua só como reserva quando a dose não passou pelo registro de campo). [H] modelo de jogo simplificado.
- Testes: novo `61-balanco-e-volta`; `59-equipe-em-campo` ampliado (sprites, troca de posição, dose por lugar); `53-missoes-rapidas` agora leva as fontes ao ponto H; `01-dados` conta 205 chaves de idioma.
**Anotado (próximo):** departamento médico (fase A do plano em claude/radhunter-plano-ciencia-equipamentos.md).
**Estado:** conferido por fotos (balanço e voo de volta, desktop). Não verificado em celular real, Safari/Firefox.

## 2026-10-29 — Blindagens 1–4 e cientistas em campo 7, 8, 9, 0 (v3.16.0)
**Pedido:** (1) trocar as teclas das blindagens para 1, 2, 3, 4 (1 = sem blindagem, 4 = chumbo), em vez de 0–3; (2) vários cientistas selecionáveis em missão, com 7, 8, 9, 0 para os 4 assentos da nave; ideia futura: tipos de cientista com inventário, como no X-COM.
**Mudou:**
- Blindagens: teclas 1, 2, 3, 4 (também no teclado numérico); rótulos dos botões do HUD e texto de "Como jogar" (PT/EN). Os ids internos continuam 0–3, então física, testes e saves não mudam.
- Cientistas: em missão aberta pela Agência, 7, 8, 9 e 0 escolhem o 1º ao 4º assento como cientista em campo (também por clique no retrato). Painel `#hud-equipe` no HUD, com retrato, tecla e cor da caneta; só aparece com 2 ou mais a bordo. A caneta mostra quem está em campo.
- Dose: `equipeSaida` ganhou `ativo` e `acum` (dose recebida enquanto cada um esteve à frente). `distribuirDoseMissao(..., acum)` dá a fração de líder (1,0) pelo trecho em campo e a de apoio (0,4) pelo resto; sem `acum`, vale a regra antiga. [H] a divisão é simplificação de jogo, não dosimetria real.
- Testes: novo `59-equipe-em-campo` (distribuição de dose, teclas 1–4 e 7/8/9/0, clique no retrato).
**Relógio e chamados rápidos (relato: "os botões de tempo param de funcionar" e "Zaragoza aparece muito rápido"):** reproduzi no navegador: não havia botão quebrado, o relógio PARAVA a cada 1 a 4 dias por causa de eventos (alerta novo, vencimento, chamado rápido a cada 3–6 dias). Mudou (valores [H], a calibrar em sala): chamados rápidos começam no dia 10 (era 3), a cada 7–12 dias (era 3–6), prazo 10 dias (era 7); alertas da história a cada 5–9 dias (era 3–6); o relógio não para mais pela chegada ou vencimento de chamado rápido nem pela volta de cientista (só avisa e segue); progressão de dificuldade: com menos de 3 chamados concluídos só vêm de 1 fonte, até o 6º no máximo 2, depois até 3 (`PARAMETROS.rapidas.facilAte/medioAte`, `novaSemente(rand, emUso, nMax)`). Teste novo `60-ritmo-do-relogio`.
**Anotado, não feito (pedido do Arnaldo):** (a) depois da missão, em vez de "repetir / nova missão / menu inicial", mostrar só um balanço final (fontes coletadas) e voltar à Base com a nave fazendo o caminho de volta, só enviando outra missão se houver outra nave livre; (b) missão aleatória: faltou levar as fontes ao ponto H; (c) tipos de cientista com inventário, estilo X-COM; (d) Cs-137 e Co-60 sempre como fontes gama indistinguíveis só com Geiger: no início do jogo não aparecerem os dois juntos, introduzir aos poucos para incentivar a compra de equipamento (espectrômetro, detector de nêutrons), e identificar errado poderia custar dose extra ao cientista (plano em claude/radhunter-plano-ciencia-equipamentos.md: departamento médico, banco de dados de pesquisa, engenheiros, tiers de fontes). A versão de fluidez e desempenho passa para a v3.17.0.
**Estado:** conferido por foto do HUD (desktop). Não verificado em celular real (as teclas 7–0 não existem no toque; o painel de retratos é clicável), Safari/Firefox.

## 2026-10-29 — Vida na Base: pessoas andando e sons de clique (v3.15.0)
**Pedido:** seguir melhorando o jogo, uma frente por versão (esta: vida na Base).
**Mudou:**
- `js/arte/planta.js`: cada pessoa vista de cima agora fica num grupo `.ag-anda` que anda um trecho do corredor e para (CSS `ag-anda`; deslocamento e ritmo calculados do id da pessoa, sem sorteio; desligado em `prefers-reduced-motion`).
- `js/audio.js`: novo `playClique(tipo)` com 'menu' (bip), 'sala' (dois tons) e 'obra' (batida grave); respeita o volume e a chave de efeitos das Configurações e é mudo sem contexto de áudio.
- `js/agencia/ui-agencia.js`: todo botão da Agência toca o clique (célula da Base = 'sala'; os demais = 'menu').
- Teste novo `58-vida-na-base`. Luzes piscantes e radar já existiam desde a v3.12 e continuam.
**Não feito (decisão):** decolagem da nave a partir da planta e som ambiente contínuo ficam fora desta versão: o primeiro depende do fluxo de envio da missão e o segundo disputa com a música; avaliar na v3.16.
**Estado:** conferido que o deslocamento muda ao longo do tempo (medição no navegador). Som não ouvido por mim (só testado em código). Não verificado em aparelhos reais, Safari/Firefox.
**Próximo:** v3.16.0 fluidez e desempenho.

## 2026-10-29 — Moldura de console em todas as telas (v3.14.0)
**Pedido:** seguir melhorando o jogo, uma frente por versão (esta: moldura de console).
**Mudou:**
- Menu principal: cena noturna decorativa atrás dos botões (`#menu-cena`, desenhada por `superficieSvg` do kit de arte: céu, montanhas, pista com 3 naves, torre, radar, lua). `aria-hidden`, sem cliques, sem imagens externas; esmaece em janela baixa.
- Botões (`.menu-btn`), janelas (`.modal-content`, com parafusos nos cantos), cartões (`.slot-card`, `.ag-cartao`) e barra da Agência (`.ag-barra`) ganharam acabamento de aço com chanfro e luz vinda de cima à esquerda. É só CSS no fim de `styles.css`; nenhum alvo de toque ficou abaixo de 44 px.
- `js/main.js` injeta a cena no início de `iniciar()` (cabeçalho de autoria intacto; só a linha "Version" foi atualizada).
- Teste novo `57-moldura-console`.
**Estado:** cena e moldura conferidas em fotos (desktop 1280×720 e celular 390×844). Não verificado em aparelhos reais, Safari/Firefox.
**Próximo:** v3.15.0 vida na Base (pessoas andando, luzes, som); v3.16.0 fluidez e desempenho.

## 2026-10-29 — Retratos e ficha de pessoal em dossiê (v3.13.0)
**Pedido:** seguir melhorando o jogo, uma frente por versão (retratos e pessoal, moldura de console, vida na Base, fluidez).
**Mudou:**
- `js/investigacao/retratos.js` reescrito: os 18 personagens agora são bustos vetoriais 96×96 com cabelo (curto, longo, cacheado, coque, calvo, ondulado, trança), óculos, barba/bigode, jaleco, luz e sombra, e **4 expressões** (`retratoSvg(npc, expressao)`: neutro, sorriso, preocupado, surpreso). A API antiga (`retratoSvg(npc)`) continua válida (neutro).
- Expressão ligada ao jogo: em `ui-base.js`, `expressaoDe(cor, mot)` (verde = sorriso, amarela = neutro, vermelha ou em tratamento = preocupado); a Marta fica preocupada quando há alerta ativo e sorri quando não há; candidatos a contratação sorriem; assentos da nave e cartões do elenco usam a expressão da dose.
- **Ficha em dossiê** (`.ag-dossie`): foto de 70 px com faixa "FICHA nn" (EN: "FILE nn"), moldura na cor da caneta, escurecida em tratamento ou viagem.
- Skill `docs/skills/arte-radhunter/SKILL.md` ganhou a seção de retratos.
**Testes:** novo `56-retratos` (18 personagens × 4 expressões bem formados, determinísticos e distintos; ids de gradiente únicos; dossiê no alojamento; Marta preocupada só com alerta); `39`, `47`, `50` e `55` passam; ferramenta `tests/ferramentas/galeria-retratos.mjs`.
**Limites:** os rostos são genéricos e fictícios (nenhuma pessoa real); expressões são 4; verificação visual por captura.
**Próxima versão (3.14.0):** moldura de console em todas as telas.

## 2026-10-29 — Nova Base da Agência (planta vista de cima) e kit de arte (v3.12.0)
**Pedido:** deixar a interface (começando pela Base) mais próxima de um jogo de gerenciamento de base, "bonito, elaborado" e menos "amador"; arte desenhada do zero em código; skill de arte reutilizável junto do código-fonte. O mapa-múndi foi aprovado como está.
**Primeira tentativa (descartada pelo usuário):** Base redesenhada como CORTE LATERAL só com pintura nova — "não mudou na essência". **Causa:** eu não tinha visto as referências (só título/miniatura); ao abrir as páginas e o vídeo vi que a Base de referência é uma PLANTA vista de cima, em terra, com um bloco de arte própria por instalação, corredores e uma coluna de menu à direita.
**Mudou (versão final):**
- **Tela da Base = planta de cima** (`js/arte/planta.js`, blocos 120×120): hangar com a nave vista de cima, comando com mapa e consoles, academia com quadro e carteiras, cofre com escotilha circular e gavetas, alojamento com camas, oficina, biblioteca, laboratório, escavação e obra; corredores abrem sozinhos entre blocos vizinhos; pessoas vistas de cima com a caneta dosimétrica (verde/amarelo/vermelho). Só se mostra a terra que dá para escavar em seguida (5×3 em vez de 6×3 fixo).
- **Coluna de menu à direita** (`htmlConsole`): cabeçalho (agência, dia, créditos) e botões Pessoal, Hangar e naves, Pesquisa, Comando, Treinamento, Arquivo (cofre), Biblioteca, Oficina, Construir, Escavar coluna/linha, Normas e Mapa; no celular vira grade de 2 colunas abaixo da planta.
- **Janela da sala** com a ilustração em corte lateral (as salas desenhadas na primeira tentativa viraram a imagem do interior, com pessoas em pé); a planta encolhe para a janela não cobrir os blocos.
- **Kit de arte** em `js/arte/` (paleta `P`/`tom`/`prng`, primitivas, nave, pessoa, planta); `base-svg.js` guarda as salas em corte e a terra; removidos `baseSvg`/`SALAS`; superfície e elevador deixaram de aparecer na tela da Base.
- **Skill:** `docs/skills/arte-radhunter/SKILL.md` (regras, estilo, receitas, lição aprendida, checklist).
**Testes:** `55-arte-kit` (novo: SVG bem formado, determinismo, planta, sem sorteio); `50-base-cena`, `42` e `47` adaptados à planta (`.ag-planta`, menu); ferramentas `foto-base.mjs` e `galeria-arte.mjs`.
**Limites:** retratos do pessoal, ficha de equipe, NPCs e a moldura das demais telas continuam no estilo antigo; no celular a planta rola na horizontal quando há muitas colunas; verificação visual por captura (sem comparação de pixels); referências foram consultadas só para a estrutura da tela, sem copiar arte.
**Pendente:** retratos de funcionários e NPCs com expressões, ficha de pessoal em dossiê, moldura de console nas demais telas, corredor ligando ao elevador de acesso.

## 2026-10-29 — Vagas de save e correção do "Novo jogo" (v3.11.0)
**Problema relatado:** o botão "Novo jogo" não funcionava como deveria. **Causa:** "Novo jogo" e "Continuar" faziam a mesma coisa (abrir a Agência com o save existente), então nunca começava um jogo do zero; e "Continuar" só aparecia depois de concluir uma missão. **Pedido:** vagas de save.
**Mudou:** novo `js/slots.js` (puro, armazenamento injetável): 3 vagas independentes. As duas chaves de sempre (`radiationHunters`, `radiationHuntersAgencia`) continuam sendo lidas e gravadas por todo o jogo e são sempre os dados da vaga ativa; ao trocar de vaga o conteúdo vivo é guardado em `radiationHuntersSlot<N>` e o da vaga escolhida é copiado para as chaves vivas (nenhum outro módulo precisou mudar). Por vaga: missões liberadas, estrelas, aprendizado (caderno) e Agência (dia, créditos, equipe, naves, Base, alertas). Globais: configurações e idioma. Save antigo (ou progresso feito no modo professor) vira a vaga 1 automaticamente; índice em `radiationHuntersSlots`. Nova janela `js/ui-slots.js` (3 cartões com resumo: mês/dia, créditos, cientistas, missões com estrelas, última vez): "Novo jogo" abre as vagas (vazia = começa do zero; ocupada = Continuar, Recomeçar ou Apagar, com confirmação no próprio cartão); "Continuar" entra direto se há uma vaga e pergunta qual se há mais; aparece sempre que houver uma vaga ocupada. Esc fecha a janela; alvos ≥ 44 px; PT/EN.
**Testes:** novo `54-vagas-de-save` (migração, isolamento entre vagas, configurações globais, apagar, interface completa, celular 360×640 em inglês); helper `novoJogo(pg)` em `tests/helpers/navegador.mjs` (testes 42, 47, 49, 50 e 53 passaram a usá-lo).
**Limites conhecidos:** as vagas ficam no localStorage deste navegador (não há exportar/importar nem nuvem); limpar os dados do site apaga todas; o modo professor ("Missões avulsas") usa o progresso da vaga ativa.
**Pendente:** exportar/importar vagas em arquivo; nome editável da vaga; testar em aparelho real.

## 2026-10-29 — Missões rápidas: chamados de cidadãos (v3.10.0)
**Pedido:** módulo de missões rápidas, como as interceptações do X-COM: a nave pousa numa região pequena, mapa aleatório baseado na região do mapa, de 1 a 3 fontes, para alongar o jogo e quebrar a monotonia enquanto as missões grandes da história não aparecem; são cidadãos que reportam e a equipe vai investigar. Também: usar "Zaragoza" como nome da missão 6.
**Mudou:** novo `js/agencia/rapidas.js` (puro): 20 regiões do mapa-múndi com bioma, 6 perfis de fonte (isótopo real + 3 distratores separáveis pelas placas), relatos fictícios PT/EN por bioma, `alertaRapida(semente)` e `missaoRapida(semente, idioma)`. O estado guarda só o id `q<semente>`; tudo o mais é recalculado da semente (save pequeno; mesmo chamado = mesmo mapa). Novo `js/mapa/plantas-rapidas.js` (puro): gerador de planta por semente e bioma (cidade com rua e prédios com porta, pátio industrial cercado, fazenda, mata com clareira/cabana/acampamento, cais com mar, clínica com corredor), garante início livre, portas livres e móveis alcançáveis. `simulacao.js`: calendário próprio (primeiro chamado no dia 3, depois a cada 3–6 dias; máx. 2 ativos; prazo 7 dias; vence com −1 de nota; prêmio base 60 × estrelas 0,7/1/1,3; concluir dá +1 de nota; contador `rapidasFeitas`; não ocupam as 3 vagas das missões da história). A Agência trata `tipo 'rapida'` como missão de campo (equipe, dose, caneta, relatório); sem coleta, sem levantamento aéreo, sem encontros nem cofre (missão curta); não desbloqueia missões nem guarda melhor nota (`registrarConclusao` ignora id ≥ 100). Interface: pino âmbar, rótulo "Chamado de cidadão", nota "Relato fictício de treino". Missão 6 agora se chama "Zaragoza" (PT e EN). Valores de calendário, prazo e prêmio são [H] a calibrar em sala; as regiões são só pontos de referência e nenhum evento real é descrito.
**Testes:** novo `53-missoes-rapidas` (plantas em todos os biomas × 40 sementes, alertas, perfis de fonte × placas, simulação e save, fluxo completo na Agência com o robô, inglês no celular); ferramenta `tests/ferramentas/foto-rapidas.mjs` (capturas por bioma; VP=m para celular).
**Pendente:** recalibrar K da dose com os mapas grandes; testar em celular real; ajustar a frequência dos chamados com jogadores; ideias: chamados com fonte em movimento, missão rápida pela nave de levantamento, relatos com mais variações.

## 2026-10-29 — Mapas grandes das missões 3 a 8 (v3.9.0)
**Pedido:** estender a todas as missões o mapa contínuo (exterior aberto + edifícios, nave no H) que funcionou em Goiânia ("mapa funcionou").
**Mudou:** `js/mapa/plantas-missoes.js` agora tem as 7 plantas: `PLANTA_RADIUM` (56×36, estúdio, lavatório, laboratório, depósito, escritório), `PLANTA_LIA` (64×44, mata, trilha, clareiras, cabana, geradores RTG), `PLANTA_ZARAGOZA` (60×40, hospital com corredor, 5 salas de cada lado, bunker do acelerador, estacionamento), `PLANTA_MAYAPURI` (60×42, lojas), `PLANTA_CHERNOBYL` (64×42, reator `{53,24,4,4}`, `raioConcentracao` 16), `PLANTA_FUKUSHIMA` (64×44, unidades, mar à direita, muro, `raioConcentracao` 20). Todas ≤ 64 colunas/linhas (limite de textura WebGL 4096 px). Plantas e posições são esquemas [H]; o que for fato verificável está em `docs/mapas-locais-fontes.md`.
**Correções de colocação:** Radium Girls `dial_tray` colidia com o relógio (movido); Zaragoza `monitor`/`oxygen` da última sala (6 de largura) caíam fora da sala.
**Testes:** novo `52-mapas-grandes` (missões 2–8: tamanho, início livre, alcance por inundação a partir do H, móveis ≥ 2× fontes, reator presente nas missões com planta de reator); robô `06-jogabilidade` 11/11; capturas de tela de todas as missões sem erros de console. Ferramenta `tests/ferramentas/foto-mapas.mjs` (VP=m para celular).
**Não alterado:** metas de tempo (`timeLimit`) — são meta de estrelas, não derrota [H: revisar com testes reais]. Cabeçalho de autoria intacto.
**Pendente:** recalibrar a dose (K) com os mapas grandes (`medir-dose-robo.mjs`, `calibrar-economia.mjs`); testar em celular real; decisão do nome "Clínica Zaragoza".

## 2026-10-29 — Mapas das missões: piloto Goiânia (v3.8.0)
**Pedido:** mapas maiores e mais dinâmicos, estilo X-COM (parte aberta + entrar em construções), nave no ponto H, micro reproduções dos locais reais. Pesquisa de fontes em `docs/mapas-locais-fontes.md` (B1).
**Decisão (padrão adotado, Arnaldo não objetou):** mapa contínuo grande com exterior e edifícios com porta (reaproveita o sistema de plantas das investigações), não sub-mapas; nome "Clínica Zaragoza" mantido por ora (as fontes dizem Hospital Clínico Universitário Lozano Blesa).
**Mudou:** novo `js/mapa/plantas-missoes.js` com `PLANTA_GOIANIA` (60×40: rua, calçadas, heliponto H com jato, ferro-velho I e III com portão, galpão, casa de Ivo, clínica abandonada, casa de Roberto, árvores, postes); `gerador.js` e `GameScene.js` aceitam `missao.planta` (como as investigações); `terreno.js` desenha o heliponto (decor `heliponto`); fontes nunca caem em móveis externos (árvore, poste, carro de rua). Missão 2 usa `planta`, `mapCols` 60 e `mapRows` 40. Posições relativas e plantas internas são simplificação [H], não a geografia real.
**Testes:** novo 51; robô de jogabilidade e `medir-dose-robo` agora usam `mapCols/mapRows` da cena; teste 07 lê o tamanho da missão. **Suíte completa: 433 testes; 431 passaram e as 2 falhas (robô e tamanho fixo 24×16) foram corrigidas e passaram isoladas.**
**Pendente:** missões 3 a 8 ainda no mapa antigo 24×16; recalibrar a dose (K) quando todos os mapas estiverem prontos, porque o tempo de caminhada muda.

## 2026-10-29 — Agência gráfica: Base em cena e nave com fuselagem (v3.7.0)
**Pedido:** a Agência parecia "texto com caixas"; queria interface gráfica estilo X-COM, nível dos mapas. Design em `claude/radhunter-agencia-grafica-design.md` (protótipo estático aprovado por Arnaldo).
**Base (`ui-base.js`, `base-svg.js`, `styles.css`):** cena única: superfície com céu, heliponto "H" por baia e as naves estacionadas (contorno tracejado se em voo), poço do elevador, grade fixa 6×3 com rocha hachurada onde ainda não se escavou (botões "escavar" dentro da rocha), salas desenhadas e cientistas circulando pelas salas (a cada dia mudam de sala; em tratamento ficam no alojamento; ponto da caneta com a cor da dose). O painel lateral virou janela flutuante (folha inferior no celular, botão ✕ 44 px) e a Marta fica numa barra inferior com resumo e botão "Normas da Agência". No celular a cena rola na horizontal.
**Nave:** montagem da equipe em sobreposição larga (fuselagem com janelinhas, nariz, assentos com encosto).
**Testes:** 42 e 47 ajustados (`.ag-grade` → `.ag-subsolo`); novo 50. **Limites:** desenho ainda de formas simples; sem animação de caminhada; nave em voo só como contorno na superfície.
**Suíte completa (29/10/2026): 431/431.**

## 2026-10-29 — Nave com assentos, verba por missão e menus do celular (v3.6.3)
**Pedido:** (a) a nave deve mostrar os cientistas escolhidos, estilo X-COM, com troca quando um recebe muita dose; (b) verba também ao concluir uma missão; (c) menus no celular (cofre sem rolagem livre, botão de lacrar inacessível).
**(a) Interior da nave** (`ui-base.js`, `styles.css`): assentos em fila (frente = líder, recebe 100 % da dose; demais 40 %), elenco abaixo com dose relativa e cor da caneta. Toque num assento e depois num cientista do elenco para trocar; "Tirar da nave", "Passar para a frente" (vira líder) e "Sugerir equipe" (menores doses). Padrão: 2 a bordo. Teste novo 49; testes 42 e 47 ajustados.
**(b) Verba por missão** (`simulacao.js`, `concluir`): prêmio base por nível (fácil 100, normal 150, difícil 250, extremo 400, investigação 150) × 0,7 / 1 / 1,3 para 1/2/3 estrelas. Valores [H]. Recalibração (200 jogos de 720 dias, K 5e-5, FT 1,5): Base completa na mediana do dia 434 (antes ~528); 5,8 tratamentos por jogo. Teste 43 ajustado.
**(c) Celular:** cofre com 100dvh, rodapé "Lacrar" fixo e rolagem livre, fonte sem arrastar por toque (toque na fonte e depois num botão de guardar); modais com dvh. Testes 14 e 48. NÃO testado em aparelho real (iOS Safari inferido de dvh).
**Verificação:** ver linha da suíte completa abaixo. Versão 3.6.3; cabeçalho de autoria intacto.
**Suíte completa (29/10/2026):** 429 testes; 427 passaram na primeira rodada e as 2 falhas (42, valores de prêmio) foram ajustadas e o teste 42 passou em seguida (12/12); testes 47 e 49 passaram após o último ajuste visual (casco por CSS, rótulo "Embarcado"). Os testes 42 e 49 foram rerodados isolados, não a suíte inteira de novo.

## 2026-10-28 — Calibração da dose e da economia (v3.6.2)
**Pedido:** calibrar custos e dose e também o ganho de capital. **Método:** (1) um robô percorre as missões 2 a 8 no navegador e mede cps·s gama por saída; (2) `tests/ferramentas/calibrar-economia.mjs` simula 200 jogos de 720 dias. Detalhes e tabelas em `docs/calibracao-agencia.md`.
**Mudou:** K da dose 1e-4 → **5e-5** mSv/(cps·s); custos ×2,5 a ×3 (nave 1 000/750/1 500; hangar 1 900; alojamento 1 000; laboratório 1 250; escavar 750/1 000; contratar 500; pesquisa 1 500); coleta 40 → **15** créditos por fonte; verba mensal e prêmio por estrela inalterados (1 000 e 50). Marcos simulados: laboratório dia 30, pesquisa dia 60, 2º hangar dia 120, nave de levantamento dia 150, Base completa ~mês 17. Testes 46 ajustado.
**Verificação:** testes 42, 43, 45, 46 e 47 passaram; suíte completa NÃO rodada nesta mudança (v3.6.0: 423/423). Valores continuam [H]: sem dados de jogadores.

## 2026-10-28 — Naves em viagem no mapa (v3.6.1)
**Contexto:** o Arnaldo informou que a v3.6.0 foi publicada por ele. **Pedido:** continuar (primeiro item pendente: animar os voos de resgate e de levantamento).
**Mudou:** as naves de resgate (verde) e de levantamento (laranja) em viagem aparecem no mapa-múndi como um avião sobre o arco Base→local, na posição proporcional aos dias já corridos (avança quando o relógio avança), e há uma lista "Naves em viagem" no painel (equivalente em texto). `frota.js` e `simulacao.js` guardam `saiuEm` na viagem; `ui-agencia.js` desenha. Teste 47 ampliado.
**Verificação:** testes 42, 43, 46 e 47 passaram; a suíte completa NÃO foi rodada nesta mudança (a v3.6.0 passou 423/423). Não é animação em tempo real: o avião muda de posição a cada dia de jogo.

## 2026-10-28 — Agência: equipe, dose, naves, hangar, Base em grade, pesquisa e coleta (v3.6.0)
**Pedido (Arnaldo):** cientistas com caneta dosimétrica indo em mais de um por nave; quem recebe muita dose fica em "tratamento" até a dose relativa cair e pode voltar; novos cientistas chegam (começa com 4, contrata mais); gerenciamento no estilo X-COM; hangar com tela própria para comprar naves; três tipos de nave (tripulação, resgate, levantamento aéreo); fluxo da fonte: achar, organizar, levar a um ponto de coleta e enviar a nave; Base mostrando a área atual e deixando comprar mais.
**Decisões:** nome Agência Chronos; 6 camas por alojamento; limites de dose (operacionais de Goiânia, slide 22 da AIEA): 1,5 mSv/dia, 5 mSv/semana, 15 mSv/mês; atenção (caneta amarela) a 50 % do limite, tratamento ao atingir 100 %, retorno quando a razão dose/limite cai abaixo de 75 % (as doses antigas saem das janelas). Todos os valores de jogo (custos, prazos, 40 % de dose para o apoio, K da dose em campo) são [H], a calibrar.
**Novos:** `js/agencia/equipe.js` (cientistas, janelas de dose, vida, tratamento), `js/agencia/frota.js` (naves, hangar, módulos, pesquisa, contratação, coleta), `js/agencia/ui-base.js` (Base em grade, hangar, laboratório, alojamento, montagem da equipe), `js/fisica/dose.js` (dose gama em campo), testes 45, 46, 47.
**Mudou:** `simulacao.js` (estado v2, eventos de retorno, obra, pesquisa, entrega e coleta vencida; +400 créditos na abertura), `ui-agencia.js` (escolha da equipe antes do voo, dose no retorno), `base-svg.js` (miniatura por módulo, laboratório), `GameScene.js` (dose por 250 ms, caneta no HUD, ponto de coleta "H" no fim da missão, marcas do levantamento aéreo no minimapa, só gama), `ui.js`, `index.html`, `styles.css`, `textos.js`. Teste 42 ajustado (grade e "Decolar").
**Limites conhecidos:** a dose em campo considera só gama (alfa e beta desprezadas, simplificação); voos de resgate e levantamento são mostrados como prazo em dias e estado das naves, sem animação no mapa; o fundo do cálculo de dose é omnidirecional e sem blindagem do corpo. Os limites vêm de slides da AIEA que não citam quem os fixou; no jogo aparecem como "Normas da Agência".
**Ajuste final (28/10/2026):** a interface não fala mais em "vida": cada cientista mostra a dose relativa (percentual do limite da janela mais restritiva: dia, semana ou mês), a barra enche conforme a dose sobe, e ele só volta ao serviço abaixo de 75 %. A suíte completa (423 testes) passou antes deste ajuste de texto; depois dele rodei os testes 42, 45, 46 e 47.

## 2026-10-28 · v3.5.1 · Nome da Agência: Chronos
- Decisão do Arnaldo: "Agência Chronos" / "Chronos Agency" (mesmo nome nos dois idiomas; sem busca de marca no INPI). Constante `NOME_AGENCIA` em js/agencia/textos.js.
- docs/agencia-equipes-naves.md atualizado: 4 cientistas no começo; janela semanal com limites operacionais de Goiânia (1,5 mSv/dia, 5 mSv/semana, 15 mSv/mês, segundo slides de treinamento da AIEA); levantamento aéreo só com fontes gama; resgate de fontes já separadas; 6 camas no Alojamento; Base como grade de módulos que cresce por compra (§4.6).

## 2026-10-28 · v3.5.0 · Investigações em campo: sem texto livre, NPCs que andam, encerramento no jato
- Pedido (teste do hospital): (1) a pergunta dissertativa final não deixava digitar algumas letras; evitar respostas dissertativas e usar só testes; (2) o mesmo NPC não aparece em duas salas; o NPC anda e, ao resolver a etapa, vai ao outro lugar; (3) ao terminar a investigação, voltar ao avião e encerrar lá.
- Causa do bug das letras: o Phaser capturava W, A, S, D e espaço (preventDefault) mesmo com o teclado do jogo desligado. Correção: `travarTeclasDoJogo()` usa `disableGlobalCapture()` ao abrir telas de leitura e `enableGlobalCapture()` ao voltar ao mapa. Vale também para o campo de observações do modo revisão.
- Sem texto livre: removida a etapa `explicacaoPrevia` (caixa de texto) de todas as investigações; `montarFicha` não exige mais `transferencia` (campo continua `null` na ficha). O campo de observações do revisor (só no modo revisão) continua.
- NPCs: um ator por personagem (`criarAtores`, `sincronizarAtores`, `moverAtores` em `investigacao/campo.js`). O ator fica no primeiro ponto ainda pendente dele; ao resolver a etapa, caminha por um mapa de distâncias (BFS, 4 vizinhos) até o ponto seguinte, e parado dá passos curtos por perto. Outro andar: aparece direto. Se o jogador tenta conversar antes de ele chegar, aparece "ainda está a caminho". `visivelDe/visivelAte` deixam de valer para pontos de NPC.
- Jato (ou "Saída" no modo professor): objeto novo no mapa, perto do início; ao concluir a última etapa, o HUD pede "volte ao jato e pressione E"; a ficha final só abre ali (o botão Caderno continua abrindo a ficha parcial). Tecla E agora usa `handleIdentify` (conversa também com instrutores, como Q).
- Testes: novo `44-campo-npcs-jato` (4); `helpers/jato.mjs`; testes 25, 27, 28, 30, 34 ajustados (sem texto livre; encerramento no jato).
- Proposta (não implementada): docs/agencia-equipes-naves.md (equipes com caneta dosimétrica, dose na janela móvel, tratamento, hangar com naves de tripulação, resgate e levantamento aéreo).
- Versão: 3.5.0 (modo.js e linha 3 de main.js; autoria intacta).

## 2026-10-28 · v3.4.1 · Agência: jato pousado no local
- Pedido: faltava a aeronave pousada no local da missão.
- Mudou: o jato agora é uma silhueta SVG que gira conforme a rota, "cresce" na decolagem e "encolhe" no pouso; ao chegar fica pousado ao lado do pino com uma pista pulsando (parada com movimento reduzido); o texto vira "O jato pousou: {local}" e o botão "Desembarcar". Sem voo, um jato fica estacionado ao lado da Base no mapa.
- Arquivos: js/agencia/ui-agencia.js, js/agencia/textos.js, styles.css, js/modo.js (3.4.1), js/main.js (linha 3; autoria intacta), tests/42-agencia.test.mjs.
- Decisão aberta: nome da Agência ("Agência Limiar" provisório; sugestão em estudo: "Agência Becquerel", pendente de busca no INPI).

## 2026-10-28 · v3.4.0 (revisada) · Agência como Geoscape: mapa-múndi sempre à vista, relógio, alertas que surgem e vencem, Base em corte
- Retorno do Arnaldo: a primeira Agência (todos os alertas abertos, Base em cartões, "Novo jogo" levando ao menu antigo) estava ruim. Pesquisado o microcontrole do X-COM na UFOpaedia (tempo que para em contato novo; sorteio mensal sem repetir; nota e verba mensais). Respostas dele: relógio pausado com velocidades; alerta vencido derruba nota e verba até um piso; alertas = missões e investigações atuais sorteadas com dificuldade crescente.
- Novo: `js/agencia/simulacao.js` (lógica pura: relógio, sorteio, prazos, nota, verba, saneamento), `base-svg.js` (corte da Base), `mapa-mundi.js`, `dados.js` (liberaMes/nivel), `textos.js`, `ui-agencia.js` (reescrito).
- Menu: "Novo jogo" e "Continuar" entram na Agência; o antigo menu virou "Missões avulsas (professor)" (id btn-missions, comportamento igual ao anterior).
- Salvamento novo: chave `radiationHuntersAgencia` (v:1) com sanear(); não mexe no save antigo.
- `progresso.js`: registrarConclusao guarda GameState.ultimaConclusao (para pagar o alerta); `ui-investigacao.js`: this.ficha = null ao abrir; `ui.js`: voltarAgencia(concluida), pararTudo ao sair da tela.
- Valores [H] a calibrar em sala de aula: 1 alerta a cada 3 a 6 dias, máx. 3 ativos, prazos 10 a 21 dias, 50 créditos por ponto, verba 1000/mês, nota ≥ 5 feliz e ≤ 0 infeliz, piso 50 % e teto 150 %. Sem game over.
- Testes: 42-agencia (12), 43-agencia-simulacao (10); testes antigos que clicavam "Novo jogo" para abrir as missões passaram a clicar `#btn-missions`; 01-dados (203 chaves).
- Docs: docs/agencia-design-minimo.md v0.4 (§13 pesquisa, §14 ciclo, §15 estado).
- Não verificado: Safari/Firefox, leitor de tela e toque em aparelho real; equilíbrio do ritmo com alunos.
- Próximo: loja de equipamentos com créditos (ZnS, NaI, câmara de ionização) e preparar a bolsa; alertas curtos gerados.

## 2026-10-28 · v3.4.0 · Agência, etapa 2 (Base, mapa de alertas, voo)
- Pedido: criar a "cola" do jogo (Agência), por cima das missões e investigações, sem alterá-las.
- Novo: `js/agencia/` (dados.js, mapa-mundi.js, textos.js, ui-agencia.js); botão "Agência" no menu inicial (primeiro); Base com Centro de alertas, Academia, Cofre, Equipe e Oficina (em breve); mapa-múndi SVG desenhado à mão; 11 alertas (missões 2 a 8 + 4 investigações); regra do treinamento (alertas só depois da missão 1, ordem livre); voo do jato com "Pular viagem" e movimento reduzido; retorno à Base com relatório; 4 retratos novos (Marta, Téo, Yara, Otávio; nomes provisórios).
- Alterado: `ui.js` (origem 'agencia', voltarDaMissao/voltarAgencia), `scenes/GameScene.js` (quitToMenu usa ui.voltarDaMissao), `index.html`, `styles.css`, `i18n/pt.js` e `en.js` (+1 chave: agenciaEntrar), `investigacao/retratos.js`, `modo.js`/`main.js` (3.4.0; linha de autoria intacta).
- Decisões [H]: Base numa ilha fictícia do Atlântico equatorial; nome provisório "Agência Limiar / Threshold Agency" (sem busca de marca); velocidade do jato 900 km/h (fictícia); distância por haversine [C].
- Sem novo salvamento nesta etapa. Cofre da Base derivado das missões concluídas.
- Testes: novo 42-agencia (8); 01-dados ajustado (203 chaves de idioma). Suíte completa 389/389 na cópia de trabalho.
- Não verificado: Safari/Firefox, leitor de tela e toque em aparelho real na Base e no mapa.
- Doc: docs/agencia-design-minimo.md v0.3 (§13 = estado).
- Próximo: etapa 3 (créditos, bolsa, loja ZnS/NaI/câmara de ionização, save).

## 2026-10-28 · Design da Agência v0.2 (somente documento)
- Incorporadas as respostas do Arnaldo: Agência = organização e grande construção com a Academia dentro; após o treinamento, alertas em ordem livre; NPCs de treinamento na Base e NPCs públicos nos locais; mapa-múndi estilizado desenhado à mão.
- Equipamentos: escada baseada em instrumentos reais (GM de janela fina, ZnS alfa, NaI, analisador multicanal, câmara de ionização, nêutrons BF3/He-3 no futuro), com fontes consultadas (Colorado CSP; HPS ATE FAQ). Corrigida a sugestão anterior de "alfa a maior distância" (não fiel: ZnS exige proximidade).
- Estado: nenhuma alteração em current/ (continua v3.3.8). Pendente: nome da Agência, NPCs novos, aprovação dos 3 primeiros equipamentos.

## 2026-10-28 · Design mínimo da Agência (somente documento, sem código)
- Pedido: criar a "cola" do jogo (Agência: base, mapa de alertas, voo de jato fictício, cofre na base, economia simples), inspirada em jogos de base, sem copiar nada.
- Feito: docs/agencia-design-minimo.md v0.1 (proposta; tudo rotulado [V]/[C]/[H]). Missões e investigações atuais permanecem intactas; menu atual vira Modo Atalho.
- Decisões do Arnaldo: financiamento fictício coletivo das nações; missões aleatórias e perda de financiamento ficam para a fase 2; primeiro a cola (Agência).
- Estado: nenhuma alteração em current/ (continua v3.3.8). Próximo passo: Arnaldo responde às perguntas abertas do §12; depois etapa 2 (hub, mapa, voo).

## 2026-10-26 — Hospital e medicina nuclear em complexos próprios (v3.2.0)
**Pedido:** mapas e móveis próprios para o hospital e a medicina nuclear (as investigações pareciam iguais).
**Hospital (9):** complexo em "H" 52×40, duas alas (radiografia/laudos/recepção e educativa/apoio/mural/medicina nuclear) ligadas por saguão, dois jardins internos, baia de ambulâncias e estacionamento na frente, área de resíduos cercada com gerador. Antes: mapa gerado 24×16.
**Medicina nuclear (10):** bloco clínico (comunicação, equipe, acolhimento, conversa) e bloco técnico (radiofármacos didático, controle, aquisição) ligados por passarela; pátio de armazenamento cercado com contêineres blindados (esquemáticos), baia de embarque, jardim. Antes: um prédio com corredor.
**Móveis novos:** `ambulance`, `waste_container`, `planter`, `lamp_post`, `generator_unit`, `bus_shelter`, `lead_container`. **Correção:** `bench` → `yard_bench` e `car` → `parked_car` (ids repetiam os do ferro-velho e redesenhariam as missões 2 e 7); teste novo contra ids repetidos.
**Motor:** `cercas` agora também são paredes (muros e pátios cercados com vãos).
**Testes:** `tests/27` (mapa 52×40), `tests/31` (todas as plantas, hospital incluído, ids únicos, plantas distintas). Suíte completa 311/311.
**Pendente:** decisão sobre o aviso "versão de teste".
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-27 — Celular, fundo do Geiger e ferramentas de revisão
**Pedido:** próximas etapas (decisão do fundo do Geiger; acessibilidade e celular com os mapas grandes).
**Celular:** escola, nos formatos 844×390 e 390×844, sem erros; o minimapa cobria o ponto inicial na paisagem, então `PLANTA_ESCOLA.inicio` passou de (2,19) para (5,19). Varredura de telas (menu, missões, investigações, campo, pausa e configurações; PT e EN; 360×740 e 740×360): sem rolagem horizontal, sem botões sem rótulo, sem alvos de toque pequenos.
**Fundo do Geiger:** mantido em 5 cps; experimento e motivos em `docs/geiger-projeto-3a.md` (8 testes dependem do valor; identificação usa 2× o fundo).
**Ferramentas:** `tests/ferramentas/captura-celular.mjs` e `tests/ferramentas/varredura-celular.mjs`.
**Pendente:** cofre definitivo (chat próprio com o Opus), classificação do I-131, aviso "versão de teste", revisão crítica final.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-27 — Carros mais legíveis, decisões registradas para o cofre
**Pedido:** seguir as próximas etapas.
**Mudança:** `parked_car` redesenhado (carroceria, cabine em vidro, rodas, faróis e lanternas) com cor variada por posição; `tests/ferramentas/captura-mapa.mjs` aceita um ponto (`... <zoom> <x> <y>`) para capturar perto de um lugar.
**Decisões registradas em `docs/prompt-cofre-opus.md`:** fundo do Geiger mantido em 5 cps; I-131 recomendado na prateleira gama (a validar no chat do cofre); aviso "versão de teste" mantido (aparece só no modo de revisão e é verdadeiro).
**Pendente:** cofre definitivo (chat próprio com o Opus) e, depois, a revisão crítica final.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-27 — Revisão do cofre pelo Opus (só leitura)
**Pedido:** rodar o prompt do cofre no Opus (esforço alto).
**Mudança:** `docs/prompt-cofre-opus.md` reescrito para refletir o estado real (cofre interativo já implementado em 14/10); versão antiga em `docs/_historico/prompt-cofre-opus_2026-10-14.md`. Nada alterado em `current/`, `tests/` nem `archive/`.
**Resultado:** `docs/revisao-cofre-2026-10-27/plano-opus.md` (plano por etapas; I-131 → `type` "gama" a aprovar; correções de celular no cofre; lista de candidatos sem repetição no botão de identificação; recomendação para as 6 decisões pendentes), 20 capturas + `metricas.json` em `capturas/` (feitas numa cópia na nuvem; fontes do Google não carregaram) e os scripts `captura-cofre.mjs` e `sonda-identificar.mjs`.
**Pendente:** sua aprovação do plano, sobretudo da troca do `type` do I-131.

### 2026-10-27 — Revisão do cofre (plano do Opus), etapas 0 e 1
**Pedido:** executar o plano `claude/radhunter-plano-cofre-opus-2026-10-27.md`. **Etapa 0:** backup `archive/2026-10-27_pre-cofre-opus.tar.gz` (removido o mais antigo, `2026-10-20_pre-aviso-guia`; 5 no archive).
**Etapa 1 (aprovada por Arnaldo):** I-131 `type: "gama"` (`symbol: "γ"`, `energyMeV: 0.3645`); beta vira componente secundária. Testes ajustados: 01, 04, 05, 12. Docs: `geiger-projeto-3a.md`, `cofre-5e-plano.md`, comentário em `fisica/componentes.js`. Suíte completa só ao fim das etapas 2 a 5.

### 2026-10-27 — Revisão do cofre, etapas 2, 3 e 5 (UX, textos, caderno)
**Etapa 2 (cofre, UX):** no celular (≤ 860 px) a ficha fecha depois de guardar ou errar, para o retorno e as prateleiras ficarem à vista; alça de fechar 96×44 px; blindagem com `role="group"` + `aria-pressed` (no lugar de `role="radio"`), opções não escolhidas apagadas e nota fixa "Escolha feita: não dá para trocar"; ficha com `position: sticky` e rolagem própria no desktop; os 5 materiais numa linha em 960×640 (a linha de blindagem ocupa a largura da prateleira); atalhos de teclado e teclas 1/2/3 só em tela sem toque, com a frase "arrastar" no toque. Achado: `.cofre-content button { font: inherit }` vence qualquer classe única de botão, por isso `.cf-mat` precisa de `.cofre-content .cf-mat` para o tamanho da fonte valer. 4 testes novos em `14`.
**Etapa 3 (textos):** papel na prateleira alfa com Am-241 ou Ra-226 ganha a frase da gama que o papel não barra (crédito do papel segue 1; HVL do chumbo calculada com `espessuraChumbo`: ≈ 0,12 mm); `beta.chumbo` liga o chumbo sozinho aos raios X de freamento e ao contêiner de chumbo de Lia (~1.300 TBq de Sr-90, já registrado em `fact5_1`; crédito segue 0,4; a frase "material leve por dentro e chumbo por fora" continua [P] e não entrou); `betaGammaHint` ganhou o teste do chumbo (o Sr-90 mantém 22% com Al e 42% com acrílico no modelo); linha "Regra de blindagem" com as citações NRC/NIST de C3.1 a C3.5 na ficha da fonte guardada (`CITACOES_REGRA` em `cofre.js`; C6.3 fora de propósito). Decisões 2 e 5 fechadas (já decididas em 14/10). Testes novos em `11` e `14`.
**Etapa 5 (caderno e contraste):** botão fechar do caderno 44×44 com nome pelo i18n (`closeNotebook`, 202 chaves por idioma); abas com `id`, `aria-controls`, `aria-label` com o nome do tema e folha com `role="tabpanel"`; cores alfa `#8a5d00` e beta `#1f63b0` na ficha (contraste 5,54 e 5,82:1 no papel); `.cf-retorno` com 64 px mínimos; baia vazia tracejada; selo "!" virou "2ª" com `title` e nome acessível ("Acerto na 2ª tentativa"). Testes em `09` e `14`.
**Estado:** testes 01, 04, 05, 09, 10, 11, 12, 13, 14 e 16 passando na cópia de trabalho; suíte completa só ao fim da etapa 4. Etapa 4 (candidatos fixos na identificação) a seguir.

### 2026-10-27 — Revisão do cofre, etapas 4 e 6 (v3.3.0)
**Etapa 4 (identificação):** lista **fixa** de candidatos por missão, sem nomes repetidos (`js/data/candidatos.js`): os isótopos distintos das fontes da missão, achadas ou não, mais `candidatosExtras` do arquivo da missão, em ordem alfabética (a posição não entrega a resposta). M2 (Cs-137): + Co-60, Sr-90, Am-241. M7 (Co-60): + Cs-137, Sr-90, Am-241. M3 (Ra-226): + Sr-90, Cs-137 (sem Am-241, porque no Geiger do jogo ele e o Ra-226 são alfa só por contato e não se distinguem por medida). O rótulo do tipo sai no idioma do jogo (EN: "α alpha"; antes "α alfa"). A missão 6 segue com os 2 reais (Co-60, Cs-137). Teste novo `36-identificacao.test.mjs` (7 testes): sem repetição, distratores presentes, par real × distrator separável por pelo menos uma placa (≥ 10 pontos percentuais) ou alfa só por contato, rótulos em EN, lista estável depois de achar uma fonte.
**Etapa 6:** `docs/roteiro-voiceover-cofre.md` (14 passos, ~15 min) para você rodar no Mac com VoiceOver + Safari; repetir os passos 1, 5, 8 e 11 no NVDA + Firefox se possível. **Não foi executado por mim: leitor de tela continua não testado.**
**Versão:** `VERSAO` passou a `3.3.0 · 2026-10-27` (aparece sob o subtítulo).
**Suíte completa na cópia de trabalho:** 329 de 329 (antes 311; +18 testes novos nas etapas 2 a 5 e 36; a conta fecha porque `01`, `04`, `05` e `12` foram só ajustados). Ainda não rodada no seu Mac (o Chromium não baixa lá).
**Não verificado:** leitor de tela; toque em aparelho real; fontes reais (Orbitron, Inter) nas capturas; Safari e Firefox.
**Pendente:** etapa 7 (revisão crítica final, chat novo em Opus, esforço alto) e a execução do roteiro de VoiceOver.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-27 — Prompt da revisão crítica final (etapa 7)
**Pedido:** preparar o prompt. **Feito:** `docs/prompt-revisao-final-opus.md` (também no Projeto, `claude/radhunter-prompt-revisao-final-opus.md`). Para colar num chat novo em Opus, esforço alto; revisão só de leitura, saída em `docs/revisao-final-2026-10-28/`.

### 2026-10-27 — Revisão crítica final da v3.3.0 (etapa 7, Opus, só leitura)
**Pedido:** rodar `docs/prompt-revisao-final-opus.md` (revisão completa, sem alterar `current/`, `tests/` nem `archive/`, sem deploy).
**Feito:** suíte completa numa cópia idêntica (hash de `current/` conferido): **329/329** (1ª passada 327/329; as 2 falhas eram `docs/referencias-5c/` ausente na cópia; passaram depois de copiá-la). Sem erros de console no menu, nas 8 missões nem nas 4 investigações. Capturas novas do cofre em PT/EN, 960×640 e 390×844 com toque, comparadas com as de 27/10. Fontes primárias reabertas (LNHB: Am-241, Ra-226, I-131, Cs-137, Co-60; NIST para o chumbo; AIEA Lia 2014): conferem.
**Decisão recomendada:** corrigir antes de publicar (v3.3.1, Haiku, cerca de 30 min): (1) ✓ aparece em qualquer blindagem escolhida, inclusive na errada (novo na 3.3.0); (2) botão "Ainda não dá para concluir" sem estilo (19 px); (3) rótulo γ da identificação com contraste de 2,31:1. Depois, suíte e deploy.
**Outros achados:** pares γ+β com o mesmo rótulo nas missões 4, 6 e 8 (falta a regra da energia da gama); região `role=status` do cofre removida e reinserida no DOM a cada desenho (risco para o VoiceOver; não testado com leitor de tela); a diferença de física do I-131 é 0,195 %, não ≤ 0,15 % (erro do plano de 27/10); entrada duplicada neste README ("2026-10-27 — Celular, fundo do Geiger…", segunda cópia).
**Saída:** `docs/revisao-final-2026-10-28/relatorio.md`, `capturas/`, `sondas/`, `scripts/`, `logs/`. Os `.tar.gz` em `_transferencia/` podem ser apagados.
**Pendente:** as correções da v3.3.1; rodar o roteiro de VoiceOver (passos 5, 6, 8 e 11 são os de maior risco).
**Para publicar (depois da v3.3.1):** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-27 — v3.3.1: correções da revisão crítica final
**Pedido:** executar todas as correções da rodada do Opus (`docs/revisao-final-2026-10-28/relatorio.md`, itens 1 a 14).
**Backup:** `archive/2026-10-27_pre-revisao-final.tar.gz` (5 no archive).
**Cofre:** selo da blindagem por crédito (✓ certa, ≈ parcial, × errada; `aria-description`), antes o ✓ aparecia em qualquer escolha; botões do cofre agora obedecem às próprias classes (`:where(.cofre-content) button`, antes uma regra de especificidade 0,1,1 anulava `font`/`color`); retorno do cofre vira região `role=status` **persistente** (nó estável, só o texto muda; o redesenho refaz apenas topo e base); botão Lacrar fixo (sticky) e visível em 960×640; alvos de 44 px no celular; primeira célula da tabela do Geiger é `th scope=row`; "Voltar ao campo" com `aria-describedby` do resumo; no celular o retorno rola até a vista.
**Identificação:** `rotuloDoCandidato` (`js/data/candidatos.js`) mostra a energia gama no botão ("γ+β gama e beta · γ ≈ 0,36 MeV"), separando pares γ+β com o mesmo tipo nas missões 4, 6 e 8; botão "Ainda não dá para concluir" com estilo e 44 px; cor do rótulo γ com contraste ≥ 4,5:1. Lição 6 e dica `betaGammaHint` explicam a regra da energia.
**Textos/comentários:** "Aluminum" em inglês, `fact5_1` "pelo certificado", comentários de `geiger.js` e `isotopes.js` (Emax do Y-90 = 2278,7 keV, LNHB [V]).
**Docs:** README corrigido (entrada duplicada de 27/10 removida; títulos `###` uniformes; "0,15 %" → "0,2 %" (medido 0,195 %) no README e nos docs; nota da exceção do I-131 na regra "componente primária = type"); `docs/roteiro-voiceover-cofre.md` ganhou o passo de blindagem errada (8b), o de iOS (15), o pré-requisito do menu Desenvolver e os resultados esperados novos.
**Testes:** 10, 11 e 13 passam a pular (skip) quando `docs/` de referência falta; 14 e 36 ganharam testes (selo por crédito, nó estável, Lacrar a 960×640, `th scope`, alvos de 44 px, rótulos distintos em todas as missões, contraste). **Suíte completa na cópia de trabalho: 338 de 338** (antes 329). Não rodada no seu Mac.
**Versão:** `VERSAO` = `3.3.1 · 2026-10-27`. Cabeçalho de autoria **não** alterado.
**Não verificado:** leitor de tela (VoiceOver/NVDA), toque em aparelho real, Safari e Firefox, fontes reais (Orbitron, Inter), a suíte no Mac. **Item 14 (fontes Google hospedadas localmente):** não feito; opcional e exige baixar as fontes (OFL). **Pendente (F5):** "Version 2.0" em `js/main.js`, não alterado sem sua confirmação.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-27 — v3.3.1: fontes hospedadas localmente e versão no main.js
**Pedido:** Arnaldo aprovou (a) hospedar as fontes e (b) atualizar "Version 2.0" em `js/main.js`.
**Fontes:** Orbitron (400, 700), Inter (400, 600) e Press Start 2P (400), subconjunto latino (português e inglês), em `current/vendor/fonts/` com `fonts.css` e as licenças OFL (`LICENSE-*.txt`), obtidas do pacote `@fontsource` (npm). `index.html` deixou de chamar `fonts.googleapis.com`. Verificado em Chromium: as 5 faces carregam e não há requisição externa. Os símbolos gregos (α, β, γ) não fazem parte do subconjunto latino e seguem na fonte de reserva, como antes.
**main.js:** só a linha 3 ("Version 2.0" → "Version 3.3.1"); a linha de autoria ("By Grupo de Cronologia - IFGW - Arnaldo Filho") não foi alterada.
**Testes:** como o helper dos testes respondia vazio ao Google, as medidas anteriores usavam a fonte de reserva; com as fontes reais a **suíte completa passou: 338 de 338**.
**Não verificado:** Safari e Firefox; aparência em aparelho real.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-27 — v3.3.1 publicada
**Publicação:** feita por Arnaldo; a linha de versão do site (radiationhunters.netlify.app) mostra 3.3.1. Não verifiquei o site por rede (o proxy do meu ambiente bloqueia); a confirmação é dele.
**Pendente:** roteiro de VoiceOver (`docs/roteiro-voiceover-cofre.md`, 16 passos); conferir no DevTools (Network) que o site publicado não pede nada ao Google Fonts; Safari, Firefox e aparelho real.

### 2026-10-27 — Radônio na escola v2: plano e parâmetros (etapas 0 e 1, só documentação)
**Pedido:** tornar o episódio do radônio mais realista (ventilação, tipo de sala, pisos), com simulação física controlada pelo aluno, nível Ensino Médio, mantendo as lições.
**Etapa 0:** backup `archive/2026-10-27_pre-radonio-v2.tar.gz` (removido o mais antigo, `2026-10-20_pre-lab-pesquisa-v29`; 5 no archive).
**Etapa 1:** `docs/radonio-escola-v2-plano.md` (plano, critérios de aceite, hipóteses) e `docs/radonio-parametros.md` (parâmetros com fontes e rótulos [V]/[C]/[H]/[N]). Nada em `current/` nem em `tests/` foi alterado.
**Decisões de Arnaldo:** S depende da construção e do tipo de ambiente; a escola terá pisos (porão, térreo, 1º andar, sótão) com um mapa por piso; o sótão também recebe radônio dos materiais de construção (corrigiu uma simplificação minha). O modelo ficou com S = S_solo + S_mat e λv separado.
**Verificado:** meia-vida do Rn-222 (IAEA/LNHB); 1,5 % do valor sem ventilação com λv = 0,5 1/h (Jonassen; confere com meu cálculo); exalação de cimento, tijolo e areia (Jacarta, 2025). **Não encontrado:** S_solo por tipo de ambiente; infiltração medida em escolas; exalação de materiais brasileiros; C0 no Brasil.
**Erro evitado:** o leitor automático converteu átomos/m²s em Bq/m²h sem o fator λ (1,4 × 10⁶ em vez de 2,9 Bq m⁻² h⁻¹); registrado em `radonio-parametros.md`.
**Pendente:** busca de S_solo e infiltração; estudo de viabilidade de pisos (etapa 3b); módulo `fisica/radonio.js`.

### 2026-10-27 — Radônio na escola v2, etapa 2: módulo da física (ainda não ligado ao jogo)
**Feito:** `current/js/fisica/radonio.js` (puro, roda em Node): balanço de massa de uma caixa com S = S_solo + S_mat, troca de ar λv (infiltração, janelas, portas, ventilação mecânica), decaimento λ do Rn-222 (3,8232 d [V]) e ar externo; solução exata por passo (sem integração numérica); agenda escolar (aula seg a sex, 8 a 17 h; fim de semana fechado; ventilação nenhuma, programada, só na aula ou contínua); `simular`, `resumo` (média, média nas horas ocupadas, fator ocupado/total, pico); seis ambientes (porão, depósito do térreo, sala do térreo, sala do 1º andar, sótão, corredor).
**Testes:** `tests/37-radonio.test.mjs`, 17 de 17: λ e meia-vida; 1,5 % a 0,5 1/h (Jonassen); solução exata contra Runge-Kutta; composição de passos; limites e sem ultrapassar o regime permanente; constante de tempo ao abrir a janela; S_mat independente do andar; ordem fechada dos ambientes; sótão só com materiais; agenda; fim de semana acima da noite de semana; sala aberta e fechada; determinismo.
**Parâmetros [H]:** `docs/radonio-parametros.md` §6 (calibração e leitura). Com ventilação programada, a sala do térreo dá fator ocupado/total de 0,21, dentro de uma dispersão de 0,33 ± 0,23 (Rönnqvist, AARST 2023). **Confere o comportamento, não a escala de S.**
**Não alterado:** `current/` fora do módulo novo, a versão (3.3.1) e o jogo; nada a publicar ainda.
**Pendente:** etapa 3b (protótipo de pisos), etapa 3 (atividade interativa), cenas.

### 2026-10-27 — v3.3.2: pisos nas investigações (etapa 3b do radônio v2, protótipo)
**Pedido:** a escola com porão, sótão e andares, um mapa por piso, como nos jogos de aventura.
**Decisão técnica (medida):** um mapa por piso, trocado por reinício da cena com fade (0,4 a 0,8 s no Chromium de teste), porque o terreno é pintado num canvas só (campus: 3456 × 2816 px, 9,7 milhões de pixels; `Phaser.CANVAS`) e empilhar pisos passaria dos limites de celulares. Estudo completo: `docs/radonio-pisos-viabilidade.md`.
**Código:** `js/investigacao/pisos.js` (novo, puro: `campoDoPiso`, `missaoDoPiso`, `proximaEscada`, `escadaSobre`, `validarPisos`); `js/investigacao/campo.js` (piso atual, escadas com seta e nome do destino, pontos de outros pisos "fora", objetivo que aponta para a escada, minimapa e HUD por piso; `createPlayer` e `handleMovement` continuam herdados da GameScene); `js/investigacao/configuracoes-campo.js` (`pisos` do radônio) e `js/mapa/plantas-investigacao.js` (`PLANTA_ESCOLA_ANDAR1`, 32 × 16: Sala C, Sala D, depósito e corredor).
**Efeito no jogo:** no episódio do radônio, "Ler a campanha fictícia" agora fica no 1º andar do prédio antigo (escada no extremo leste do corredor do térreo). O resto do roteiro não mudou.
**Armadilha registrada:** o Phaser reaproveita a instância da cena no `restart`; propriedades da criação anterior (como `painelCampo`) sobrevivem e são zeradas no `init`.
**Testes:** `tests/38-pisos.test.mjs` (5), ajustes em `30-episodios-investigacao` (sobe a escada até o ponto do 1º andar e ignora pontos "fora" na checagem de colisão) e `31-plantas-investigacao` (pontos só do piso). Suíte completa na cópia de trabalho: **360 de 360** (338 + 17 do módulo de radônio + 5 de pisos).
**Versão:** `VERSAO` e linha 3 do `main.js` ("Version 3.3.2"); a linha de autoria não foi alterada.
**Não verificado:** celular real (toque nas escadas, tempo de reinício), Safari e Firefox, o botão de pausa "Reiniciar" fora do térreo, porão e sótão.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado). A publicação já leva o 1º andar do radônio.

### 2026-10-27 — v3.3.3: sala de radônio interativa, retratos e aviso de andar (radônio v2, etapa 3)
**Pedido:** terminar a etapa 3 usando as ideias de interface (retratos nos diálogos, aviso de andar, gráfico animado, revisão em celular).
**Mudança:** nova atividade `sala-radon` (`modelos.js`, `atividades.js`) ligada a `fisica/radonio.js`: três cenários (tudo fechado; 2 janelas + porta na aula; ventilação mecânica programada), uma semana simulada (segunda semana de uma simulação de 14 dias, sem artefato de partida), gráfico SVG animado (linha traçada; sem animação com `prefers-reduced-motion`), faixas de horas de aula, linhas de 100 e 300 Bq/m³ (OMS), quatro leituras e texto PT/EN rotulado como hipótese de ensino. Nova cena `ventilacao` (3ª do episódio; títulos renumerados 1–7; ponto da Inês no térreo). `investigacao/retratos.js`: bustos SVG originais (paletas do jogo) exibidos ao lado do nome do personagem nas cenas com NPC (`ui-investigacao.js`); `campo.js`: faixa com o nome do andar ao subir/descer. CSS no fim de `styles.css`. `VERSAO` 3.3.3 e cabeçalho de `main.js` "Version 3.3.3" (autoria inalterada).
**Verificação:** suíte completa 365/365 (novo `tests/39-sala-radon.test.mjs`, 5 testes; `30-episodios` ajustado para 7 cenas). Conferido em captura a 360×640: sem rolagem horizontal. NÃO verificado: celular real, Safari/Firefox, leitor de tela na nova atividade. Valores de S e trocas de ar continuam [H] (hipóteses de ensino).
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-28 — v3.3.4: porão da escola (radônio v2, etapa 3c)
**Pedido:** continuar o plano: criar o porão como piso próprio. **Decisão:** porão e subsolo são um só piso (nível −1); sótão fica para depois.
**Mudança:** `PLANTA_ESCOLA_PORAO` (32×16: porão sem janelas, depósito do porão e corredor) em `mapa/plantas-investigacao.js`; piso `porao` em `CAMPO_RADON` com escada de ida (corredor do térreo, x6 y13) e de volta; nova cena `porao-ar` (4ª; títulos renumerados 1–8) com a atividade `ambiente-radon` (`modelos.js`, `atividades.js`): sala de aula, depósito sem janelas e porão, cada um fechado (linha pontilhada) e com ventilação mecânica programada (linha colorida), com a fração da entrada vinda do solo. O eixo do gráfico agora se ajusta ao maior valor. Todos os valores são hipóteses de ensino ([H]).
**Verificação:** suíte completa 368/368 (3 testes novos em `39-sala-radon.test.mjs`; `30-episodios` ajustado para 8 cenas). Captura conferida do mapa do porão e do gráfico. NÃO verificado: celular real, Safari/Firefox, leitor de tela. Sótão ainda não existe como mapa.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-28 — v3.3.5: sótão da escola (radônio v2, etapa 3d)
**Pedido:** continuar o plano: sótão como piso próprio. **Mudança:** `PLANTA_ESCOLA_SOTAO` (32×16) em `mapa/plantas-investigacao.js`; piso `sotao` (nível 2) em `CAMPO_RADON`, escada a partir do corredor do 1º andar (x3 y12) e de volta; nova cena `sotao-ar` (5ª; títulos 1–9) com a atividade `ambiente-radon` comparando sala do 1º andar e sótão: o sótão fechado fica menor que a sala do 1º andar, mas não zero, e a maior parte da entrada vem dos materiais da construção (a correção do Arnaldo ao modelo). O texto de `ambiente-radon` passou a informar a fração do solo e a dos materiais. Teste 30 passou a percorrer escadas em vários saltos (`proximaEscada`).
**Verificação:** suíte completa 368/369; a falha foi `14-cofre-ui` ("celular: guardar… retorno dentro da tela"), que passou 3 vezes seguidas quando rodada sozinha (teste de layout sensível à carga; sem relação com o radônio, mas não investigada a fundo). Testes novos: 1 em `39-sala-radon.test.mjs` (agora 10). Capturas do mapa e do gráfico conferidas. NÃO verificado: celular real, Safari/Firefox, leitor de tela. Valores [H] (hipóteses de ensino).
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-28 — v3.3.6: campanha A × B gerada pelo modelo e cenas antigas refeitas (radônio v2, etapa 4)
**Pedido:** continuar o plano (refazer a base de dados e as cenas antigas sobre o modelo). **Mudança:** `fisica/radonio.js` ganhou `janelasFora` em `agenda()` e `campanha12()` (12 médias de 30 dias, 2º de 2 anos simulados; `PERIODOS_FRIOS`, `FATOR_SOLO_FRIO = 2,0` [H]). As constantes digitadas `RADON_A/B` (modelos.js) agora vêm do modelo: sala A (térreo, janelas abertas na época quente, fechada no frio) × sala B (térreo, ventilação mecânica programada o ano todo). Resultado: A = 16 e B = 62 no 1º período; A = 94,6 e B = 84,5 no ano (a ordem se inverte). Textos e opção de evidência da cena 2 calculados, não digitados; mapa: Sala A "janelas conforme a estação", Sala B "ventilação mecânica programada" (janelas desenhadas fechadas). Cenas de protocolo, comunicação (novo cartão sobre tipo de ambiente, andar e ventilação) e transferência (foto sem andar, tipo de ambiente e ventilação) passaram a citar o que o modelo ensina. `docs/radonio-parametros.md` §7 e plano com status.
**Atenção (hipótese):** a inversão da ordem das salas depende do fator de solo no frio (valor de jogo, sem fonte); o mecanismo plausível (diferença de pressão no frio) NÃO foi verificado em fonte. Sem o fator, a sala A fica abaixo da B o ano todo.
**Verificação:** suíte completa 370/370 (teste novo em `37-radonio`; 30, 31 ajustados). NÃO verificado: celular real, Safari/Firefox, leitor de tela.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-28 — v3.3.7: tela inicial em janelas baixas (bug relatado pelo Arnaldo no Opera)
**Problema:** em janelas de pouca altura a tela inicial não rolava (`#main-menu` com `overflow:hidden` e conteúdo centralizado) e o crédito ("By Grupo de Cronologia…", `position:absolute; bottom:20px`) ficava por cima dos botões PT/EN.
**Mudança (só CSS, no fim de `styles.css`):** `#main-menu` rola na vertical (`overflow-y:auto`), o conteúdo se centraliza com `margin:auto` (centra quando cabe e rola quando não cabe, sem cortar o topo), o crédito entra no fluxo (`position:static`) e há versões compactas do logotipo, botões e espaços para alturas ≤ 760 px e ≤ 520 px. Texto de autoria e de versão inalterados.
**Verificação:** novo `tests/40-menu-janela-baixa.test.mjs` (1280×800, 1366×600, 1024×500, 800×420, 360×640): falha 5/5 com o CSS antigo e passa 5/5 com o novo; testes 02, 16, 22 e 23 passam (41 testes no total). A suíte completa NÃO foi rodada nesta mudança (só CSS da tela inicial). Capturas conferidas a 1024×500. Reproduzido no Chromium; NÃO testado no Opera, Firefox, Safari nem celular real.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

### 2026-10-28 — v3.3.8: roteiro do radônio por andares, 5 personagens novos e lição extra da Academia (etapa 5)
**Pedido:** fazer a lição da Academia, colocar mais NPCs e rever a sequência do episódio ("um pouco confusa").
**Sequência:** as 9 cenas foram reordenadas por andares: 1 pergunta (térreo, Dora) → 2 ventilar a sala (térreo, Inês) → 3 porão (Nelson) → 4 sótão (Léo) → 5 campanha de 12 períodos (1º andar, Vera) → 6 protocolo (Paulo) → 7 comunicação (Tânia) → 8 conclusão (Inês) → 9 transferência (Dora). Antes eram 8 trocas de andar, com idas e vindas (térreo, 1º, térreo, porão, térreo, sótão, térreo); agora são 6, nunca mais de 3 escadas seguidas. A cena 1 traz o roteiro com os nomes; cada cena começa dizendo de onde você vem (por exemplo "Desça do sótão ao 1º andar"). O teste 41 fixa a ordem, as trocas e as dependências entre cenas.
**Personagens:** 5 novos (Nelson, zelador; Léo, monitor de ciências, o aluno que quer anunciar a frase da cena 1; Vera, professora do 1º andar; Paulo, técnico de medição; Tânia, diretora), com sprite no mapa (`render/npcs-hospital.js`), retrato (`retratos.js`) e nome (`campo.js`); 7 personagens diferentes no episódio (antes 2). Desenhos originais, sem arte de terceiros.
**Lição extra:** `academia/licoes-extra.js` (`radonio-equacao`): balanço dC/dt = S/V − (λv + λ)·C + λv·C0, equilíbrio, constante de tempo, números do mesmo módulo da atividade (110 Bq/m³ fechada, 13 com ventilação mecânica; τ ≈ 6,3 h e 19 min), limites e fontes rotuladas [V]/[C]/[H]. É leitura opcional, sem quiz e sem estrela, FORA das 8 lições lineares (a conclusão da Academia não muda); abre pelo botão "Leitura opcional" da cena 2, em modo de revisão (`LicaoUI.abrir(..., {revisao, licao})`). NÃO há painel dessa lição no mapa da Academia: decisão pendente do Arnaldo.
**Verificação:** suíte completa 381/381 (teste novo `41-sequencia-radonio.test.mjs`, 6; 38 e 39 ajustados à nova ordem). Capturas conferidas. NÃO verificado: celular real, Safari/Firefox, leitor de tela na lição extra.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

## 2026-10-26 — Escola do radônio em campus, texto do radônio revisado (v3.1.0)
**Pedido:** conferir a consistência da missão do radônio; mapas das investigações muito parecidos → mapas e móveis diferentes, ampliados; escola com áreas livres, não um prédio só.
**Texto (radônio):** nota fictícia no registro (janelas da sala A fechadas nos períodos 4 a 8, sem afirmar causa) e frase de referência da OMS (100 Bq/m³; no máximo 300 se não for possível; fonte conferida: WHO, 21/09/2009, https://www.who.int/news/item/21-09-2009-who-calls-for-tighter-standards-on-indoor-radon). Aviso "versão de teste" mantido (decisão pendente).
**Motor:** `render/terreno.js` pinta terreno aberto (grama, calçada, asfalto, terra, quadra com marcações, borda de muro ou mata); `mapa/plantas-investigacao.js` aceita `externo`, `blocos`, `internas`, `cercas`, `zonas[].piso`. Novo `render/mobiliario-externo.js`: árvore, banco, mastro, canteiro, trave, carro, bicicletário, placa.
**Escola:** campus 54×44 com prédio antigo (secretaria, salas A e B, corredor), bloco administrativo (professores, conselho), biblioteca, pavilhão de análise, pátio, estacionamento, horta e quadra; pontos de investigação reposicionados; ventilação visual preservada.
**Pendente:** hospital e medicina nuclear ainda com o desenho anterior (segunda rodada); decisão sobre "versão de teste".
**Testes:** suíte completa 309/309; `tests/31` ganhou o teste do campus (alcançabilidade de todos os tiles e pontos). Ferramenta: `tests/ferramentas/captura-mapa.mjs`. Doc: `docs/mapas-campus.md`.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

## 2026-10-26 — Versão visível logo abaixo do subtítulo (v3.0.2)
**Pedido:** mostrar a versão do jogo no menu, abaixo do subtítulo.
**Mudança:** o parágrafo `#versao-jogo` saiu do fim do menu e foi para logo abaixo de "The Isotope Chronicles"; `VERSAO` em `js/modo.js` estava desatualizada (2.9) e passou a `3.0.2 · 2026-10-26`. Teste: `tests/23-modo-professor.test.mjs` (a versão aparece no menu).
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

## 2026-10-26 — Correção: menus que não respondiam + música em todas as investigações (v3.0.2)
**Pedido:** (1) depois da última publicação, "Missões" e demais menus pararam de funcionar; (2) havia investigação sem música.
**Causa provável (hipótese, não confirmada no navegador do usuário):** `index.html` antigo em cache com `ui.js` novo → `getElementById('music-on'/'sound-on'/'btn-settings-pausa')` devolvia `null` e o `addEventListener` lançava erro durante a montagem da interface, deixando os menus sem ação. Reproduzido em teste (página antiga simulada): sem a proteção o teste falha.
**Mudança:** `ui.js` e `main.js` tolerantes a elementos ausentes (`?.` e verificações de nulo). `musica/trilhas.js`: os 4 problemas do Laboratório de pesquisa (ids 13–16) usam a trilha 11 (laboratório de cronologia); outros ids continuam sem música.
**Testes:** `tests/35-trilhas.test.mjs` (12 testes: página antiga em cache; toda investigação, 4 cartões + 4 problemas, toca trilha); `tests/helpers/navegador.mjs` ganhou a opção `transformarHtml`.
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

## 2026-10-26 — Configurações durante a missão: música e efeitos ligáveis (v3.0.1)
**Pedido:** poder ligar e desligar música e áudio durante as missões.
**Mudança:** o menu de pausa (Esc) ganhou o botão **Configurações**, que abre a janela de configurações por cima da pausa (Esc fecha só ela). Novas chaves **Música ligada** e **Efeitos sonoros ligados**: desligar não perde o volume escolhido; os valores ficam salvos (`musicOn`, `soundOn`). Valores antigos ou inválidos voltam ao padrão (ligado). Testes: 305/305 (novos: configuração dentro da missão e persistência).
**Para publicar:** `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

## 2026-10-26 — Música não tocou após a publicação (reforço do desbloqueio de áudio)
**Relato do Arnaldo:** "não tocou". **Investigação:** em Chromium com a política de reprodução automática estrita (`--autoplay-policy=user-gesture-required`) a trilha toca: o contexto fica `running`, o relógio avança, o ganho é 0,15 e não há erro no console. Portanto a causa NÃO está confirmada; hipóteses: (a) a publicação não terminou (o primeiro `netlify deploy` falhou por caminho relativo); (b) cache do navegador com o `audio.js` antigo; (c) Safari, que mantém o áudio suspenso até um gesto; (d) volume da música em 0 nas Configurações salvas.
**Mudança:** `audio.js` ganhou `desbloquear()`: o contexto de áudio é retomado no próximo clique, toque ou tecla (importante no Safari); se a trilha falhar, o motivo vai para o console (`Trilha sonora indisponível`). Teste 35 e verificação com política estrita passam.

## 2026-10-26 — Trilha sonora: 12 composições originais (v3.0)
**Pedido:** criar uma trilha sonora que faça sentido para cada missão (referência: Zelda, Pokémon), "para todos".
**Mudança:** o drone ambiente (causa do zumbido, entrada anterior) foi **removido**. Novo módulo `js/musica/` (`partitura.js`, `trilhas.js`, `sequenciador.js`): 12 faixas originais, uma por missão (1 a 8 caça de fontes; 9 a 12 investigações), sintetizadas em tempo real (ondas quadrada, de pulso, triangular, senoidal e percussão por ruído), 16 compassos em duas seções, repetindo em ciclo; volume equalizado entre as faixas. `audio.js` chama `startMusic(idDaMissão)`. Nas missões de acidentes reais (Goiânia, Chernobyl, Lia, Fukushima) a música é sóbria de propósito. Detalhes, tabela e como editar: `docs/trilha-sonora.md`. Nova página `current/trilhas.html` para ouvir cada faixa (precisa de servidor local: `python3 -m http.server` em `current`).
**Verificação:** teste novo `35-trilhas` (notas na escala, acordes, tessitura, 16 compassos, faixas distintas; renderização offline: sem estourar, sem silêncio, nível equalizado; integração com o jogo). **Não foi verificado se a música soa boa:** depende do ouvido do Arnaldo; o texto de cada melodia é editável.
**Pendente do autor:** (1) ouvir as 12 faixas e dizer o que mudar; (2) decidir como constar a autoria da música (composição assistida por IA) no registro de software.
**Para publicar:** `netlify deploy --dir=apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

## 2026-10-26 — Zumbido de fundo nas missões de investigação
**Pedido:** investigar um ruído contínuo ("zummm") nas missões de investigação.
**Achado:** o único som contínuo do jogo é o drone ambiente de `audio.js` (`startMusic`): três ondas senoidais graves (55, 82,7 e 110,4 Hz) com filtro passa-baixa e modulação lenta, a 4% de ganho no volume de música padrão (50%). `InvestigacaoScene` herda de `GameScene`, cujo `create()` chamava `startMusic()` sempre; por isso o zumbido tocava também na leitura e no laboratório, onde não há ação que o justifique. Não ouvi o áudio (não tenho como ouvir daqui): a conclusão vem da leitura do código, a confirmar pelo Arnaldo.
**Mudança (v2.9.1):** em `GameScene.create()`, missões com `missionData.investigacao` não iniciam a música (e param qualquer drone ativo). Missões de caça de fontes não mudam. O controle de volume da música continua nas Configurações.
**Verificação:** sintaxe conferida com `node --check`; a suíte completa (296 testes) NÃO foi rodada nesta mudança. Backup: `archive/2026-10-26_pre-audio-investigacao.tar.gz` (o mais antigo foi removido, restam 5).
**Para publicar:** `netlify deploy --dir=apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod` (não executado).

## 2026-10-23 — Nome e inventário para registro de software
**Pedido:** decidir o nome do jogo e preparar o registro. **Decisão do Arnaldo:** manter "Radiation Hunters" (nenhuma marca igual ou parecida na WIPO Global Brand Database, consulta de 23/10/2026). Registrar o programa no INPI pela Inova; a marca fica para depois.
**Mudança:** novo `docs/inventario-autoria-registro.md` (identificação, elementos próprios, terceiros, autoria e IA, pendências). Nada em `current/` foi alterado.
**Achados:** não há imagem nem áudio de terceiros (gráficos desenhados por código, som sintetizado). Terceiros: Phaser 3.60.0 (MIT, falta o arquivo de licença em `vendor/`) e três Google Fonts.
**Complemento (23/10/2026):** incluído `current/vendor/PHASER-LICENSE.md`, cópia literal do LICENSE.md do Phaser na tag v3.60.0 (MIT, "Copyright (c) 2020 Richard Davey, Photon Storm Ltd."). O `phaser.min.js` em uso é idêntico ao do pacote oficial phaser@3.60.0 do npm (mesmo SHA-256). Para valer no site, falta publicar (`netlify deploy --dir=apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod`).

## 2026-10-20 — Laboratório de pesquisa: problemas sorteados (v2.9)
- Pedido: lista de problemas aleatórios para o laboratório de pesquisa, cada um com um subconjunto de salas, e etapas no Caderno; Lab 2 usável sozinho para conjuntos de annealing; problema 4 = datar + história térmica.
- Novo cartão "Laboratório de pesquisa" (Investigações): sortear ou escolher entre 4 problemas (datar apatita; conjunto de annealing; calibrar ζ; datar + história térmica).
- Novos: `problemas-pesquisa.js` (reaproveita as cenas do Arquivo do tempo + cenas próprias, respostas certas calculadas dos dados), `sorteio-fissao.js` (dados fictícios por semente; ζ calculado do padrão), `docs/laboratorio-pesquisa.md`. Endereço de teste: `?investigacao=pesquisa-datar&semente=3`.
- `observarAtividade(tipo, estado, dados)` aceita o conjunto de dados; novas atividades `annealing-medidas` e `zeta-verifica`; Caderno mostra etapas ○/✓ e o nº do sorteio; ficha exportada traz `sorteio`.
- Decisão a conferir: o problema de annealing inclui o Lab 3 (ataque químico revela os traços antes da medida), além dos Labs 2 e 5.
- Testes: 296/296 (novo 34; 25 ajustado para o 5º cartão). Backup: archive/2026-10-20_pre-lab-pesquisa-v29.tar.gz (mais antigo removido).
- Pendente: revisão científica dos textos novos; teste em celular real; mais problemas (ex.: radônio com CR-39) só após validação do autor.

## 2026-10-20 — Datação por traço de fissão (EDM) no Arquivo do tempo (v2.8)
- Pedido: ensinar todos os procedimentos (apatita + mica muscovita + nêutrons térmicos em reator de pesquisa + ataque com HF), com equação e dados fictícios declarados; Lab 2 = conjuntos de annealing (1 h, 10 h, 100 h, 1000 h) sem precisar dos outros labs.
- Episódio reescrito em 15 cenas (`js/investigacao/arquivo-tempo.js`); atividades novas em `atividades.js`/`modelos.js` (ataque, contagem, conjunto, mica, tabela, ζ, idade, annealing, comprimentos).
- Novos: `traco-fissao.js` (porte de ft_lib.py da skill; idade, χ², central, ζ, comprimentos), `dados-fissao.js` (dados fictícios; 12 grãos do exemplo da skill), `docs/traco-fissao-episodio.md`.
- 15 pontos de campo distribuídos nos 5 labs; treinos de segurança ganharam itens sobre HF, annealing prolongado e amostras vindas do reator (genéricos, sem números).
- Testes: 285/285 (novo 33; 30, 31, 32 ajustados). Backup: archive/2026-10-20_pre-fissao-v28.tar.gz (mais antigo removido).
- Pendente: revisão científica e de segurança por especialista; teste em celular real; banco de problemas aleatórios + etapas no caderno (proposta, aguarda validação do autor).

## 2026-10-20 — Aviso do treino de segurança como "guia" (v2.7)
- Pedido do autor: no jogo o treino é tratado como real; nada de "rascunho geral". Só enfatizar que é um guia.
- Novo aviso (PT/EN): "Guia de segurança do laboratório. É uma orientação geral e não substitui as normas e fichas de segurança do seu laboratório."
- Teste 32 e docs/treinamento-seguranca.md atualizados. Testes 31 e 32: 9/9. Backup: archive/2026-10-20_pre-aviso-guia.tar.gz.

## 2026-10-20 — Lab 5 ampliado, vestiário/EPI e NPCs de segurança (v2.7)
- Pedido: Lab 5 com microscopia + eletrônica básica + impressão 3D; um NPC por laboratório com treino de segurança específico.
- Mapa do Arquivo do tempo agora 40×37: Lab 5 em 3 zonas (microscopia/contagem manual; eletrônica básica com banho automatizado e braço robótico; impressão 3D) e novo vestiário e EPI (armários, lava-olhos, chuveiro, extintor, primeiros socorros — proposta didática).
- 13 móveis novos em `js/render/mobiliario-cronologia.js` (esquemáticos, sem marcas nem valores).
- Novo `js/investigacao/treinamento-seguranca.js`: 7 instrutores (Bia, Otto, Nina, Davi, Léa, Teo, Íris), 4 passos + pergunta cada, PT/EN. Aviso "⚠ treino pendente" perto de equipamentos, sem bloquear. Selos em localStorage `rh_treinos_seguranca_v1`; HUD "treinos n/7".
- Textos de segurança = [H] rascunho geral, a validar (ver `docs/treinamento-seguranca.md`).
- Lab 4 mantido como estava (decisão do autor); só a redação dos docs públicos deve evitar detalhes do cofre.
- Testes: 282/282 (novos: 31 itens 4–5, 32 com 4 testes). Backup: archive/2026-10-20_pre-lab5-treinamento.tar.gz (mais antigo removido).
- Pendente: revisão dos textos de segurança; teste em celular real.

## 2026-10-20 — Laboratório de Cronologia com 5 laboratórios (v2.6)
- Pedido: reprojetar o mapa "Arquivo do tempo" como o Laboratório de Cronologia real, com 5 laboratórios detalhados.
- Mapa 40×24: Lab 1 polimento/corte/montagem; Lab 2 tratamento térmico (fornos); Lab 3 ataque químico (capelas, banhos, CR-39); Lab 4 fontes radioativas (cofres, U/Th, fontes experimentais); Lab 5 microscopia e contagem; corredor e recepção/laudo.
- Novo `js/render/mobiliario-cronologia.js` (desenhos esquemáticos, sem marcas nem valores). Equipamentos adicionais inspirados no site do grupo: ultrassom, lupa, forno tubular, bomba de vácuo, balança.
- Pontos de interação reposicionados; "Estação isotópica" renomeada para "Estação de dados U-Pb".
- Testes: 277/277. Backup: archive/2026-10-20_pre-laboratorio-cronologia.tar.gz (arquivo mais antigo removido).
- Pendência: o site lista outros 5 labs (inclui Instrumentação); mantida a estrutura pedida. Testar em celular real.

## 2026-10-20 · Plantas próprias para as três investigações novas (2.6)
- Pedido: os mapas dos episódios novos eram cópia do hospital; cada um deve ser independente. Escola do radônio com várias salas, umas mais e outras menos ventiladas.
- Novo: `current/js/mapa/plantas-investigacao.js` (escola 36×22 com corredor central; laboratório de cronologia 34×22 com salão aberto e salas laterais, microscopia escura; serviço de medicina nuclear 28×26 em corredor vertical). `terreno.js` aceita `planta` (paleta própria, tinta por ambiente, janelas abertas/entreabertas/fechadas, grade de ventilação, quadros, cartazes, placas); `gerador.js` usa a planta; `configuracoes-campo.js` com pontos, rótulos e painéis novos. Hospital original sem alteração. Movimento, colisão, câmera e controles são os de sempre.
- Ventilação na escola é **só ambientação** (Sala A fechada e ar parado; Sala B aberta com exaustor e setas; rótulos "pouca/média/muita ventilação"). Nenhum dado numérico novo; o jogo não afirma relação causal com os dados sintéticos. Leitura por sala exigiria novos dados e validação.
- Testes: novo `31-plantas-investigacao` (plantas distintas, móveis todos colocados, pontos e ambientes alcançáveis, ventilação visual); suíte completa **276/276**. Imagens dos mapas conferidas na nuvem. Doc: `docs/plantas-investigacao.md`. Versão 2.6. Backup: `archive/2026-10-20_pre-plantas-proprias.tar.gz` (removidos os dois mais antigos; archive com 5). Sem publicação.

## 2026-10-19 · Verificação final da 2.5 antes de publicar
- Cópia da pasta `current/` (76 arquivos, 2,2 MB, sem testes/docs/backups/arquivos `._*`), conferida na nuvem: sintaxe de todos os módulos JS ok e suíte completa **273/273** (0 falhas, 0 cancelados, 0 ignorados) no Chromium.
- Não verificado: celular real (abas, dica, ícones de blindagem, móveis, botão OK, os três novos episódios) e revisão especializada dos conteúdos 0.1-teste. Sem publicação por mim; comando entregue ao usuário.

## 2026-10-19 · Três novos episódios no mesmo framework (2.5)

- Coleção com hospital original, medicina nuclear (6 etapas), Arquivo do tempo (7) e radônio na escola (6), em PT/EN.
- Cena de campo comum herda a GameScene; configurações por episódio mantêm mapas, movimento, câmera, controles e renderização existentes. ID selecionado governa cenário, ficha e reinício.
- Atividades: aquisição/distribuição do sinal, amostras e dados U-Pb, preservação qualitativa de traços, campanha sintética de radônio e comparação de protocolos. Hipótese, observações, tentativas e explicação anterior ao retorno são exportáveis; dados insuficientes podem ser a conclusão correta.
- Sete novos tipos de mobiliário com o pincel RPG e novos perfis de NPCs fictícios.
- **273/273 testes passaram**, sem falhas/cancelamentos/ignorados, em 464,1 s. Percursos completos dos novos episódios em PT/desktop e EN/360 × 640, com exportação e reinício.
- Detalhes, dados, limites e referências: [docs/episodios-2.5/README.md](docs/episodios-2.5/README.md). Conteúdos novos 0.1-teste; revisão especializada e piloto pedagógico pendentes. Sessões ainda não restauram após recarregar.
- Prévia local sem cache: `python3 tools/preview.py --port 8770`. Backup: `archive/2026-10-19_pre-tres-investigacoes.tar.gz`. Backups anteriores mantidos; sem publicação.

## 2026-10-19 · Botão "OK" após identificar a fonte (2.4)
- Pedido: depois de acertar a identificação, ficava só o botão "Cancelar"; o ideal é virar "OK".
- Mudança: ao acertar, o botão passa a "OK" (verde) e fecha a identificação na hora; se o jogador não clicar, o fechamento automático (8 s, ou 9 s na última fonte) continua, e os dois caminhos executam uma única vez (`fecharIdentificacao` em `GameScene.js`). Ao errar, continua "Cancelar"; ao reabrir o modal o rótulo é restaurado. Nova chave i18n `ok` (199 por idioma).
- Testes: novo teste em `02-fluxo`; suíte completa 263/263. Backup: `archive/2026-10-19_pre-botao-ok.tar.gz` (removido o mais antigo). Sem publicação.

## 2026-10-19 · Revisão da 2.4 e plano dos próximos episódios

- Revisão sem alterar os arquivos do jogo: diferenças de fonte, cobertura do mobiliário, entrada pelas abas, hospital, modelo/caderno, viewport 360 × 640, fábrica e dica manual.
- Suíte executada novamente: **262/262 testes passaram**, sem falhas/cancelamentos/ignorados, em 447,6 s.
- Relatório com capturas, limites e proposta dos episódios de medicina nuclear, datação e radônio: [docs/revisao-2026-10-19/revisao-e-proximos-episodios.md](docs/revisao-2026-10-19/revisao-e-proximos-episodios.md).
- Principal dependência de expansão: inicialização de campo, locais e regras de UI ainda específicos do hospital. Nenhum novo episódio implementado nesta revisão. Sem publicação.

## 2026-10-19 · Móveis em estilo RPG, todos os temas (2.4)
- Pedido: móveis com cara de RPG de cima (Zelda/Pokémon), adequados ao tema de cada missão (aprovados os 5 pilotos).
- Diagnóstico: os móveis antigos eram desenhados com 20 px por casa em vez de 32 (ocupavam ~60% da área de colisão). Agora cada móvel ocupa toda a sua área, com contorno escuro, 3 tons por material, luz de cima-esquerda e sombra no piso.
- Arquivos novos em `current/js/render/`: `estilo-rpg.js` (cores, pincel, desgaste determinístico), `moveis-rpg.js` (despacho por `tema:id` e desgaste por tema), `moveis-rpg-interior.js` (laboratório, hospital, fábrica), `moveis-rpg-ruinas.js` (ferro-velho, usina, abrigo). `moveis.js` chama o desenho novo primeiro; os brilhos da cápsula, do reator e do RTG continuam na GameScene.
- Cobertura: 5 pilotos + 52 tipos (ids repetidos, como machine/barrel/cabinet, mudam de aparência conforme o tema). Ferramenta de revisão: `RH_ROOT=<current> node tests/ferramentas/catalogo-moveis.mjs <pasta> 2.2 [temas]` gera uma folha PNG por tema.
- Testes: suíte completa 262/262. Backup: `archive/2026-10-19_pre-moveis-rpg.tar.gz` (removido o mais antigo). Sem publicação; testar no celular real.

## 2026-10-19 · Ícones das blindagens (2.4)
- Pedido: os símbolos das blindagens (emojis 🚫🔩🧊🧱) não faziam sentido ("parafuso"). Uma primeira versão com placas em 3D e siglas (Al/Acr/Pb) foi rejeitada: ficou feia e com elementos químicos no botão.
- Versão atual (SVG próprio, sem texto, em `index.html` + `styles.css`): sem blindagem = placa vazia tracejada; alumínio = folha prateada ondulada com dobra no canto; acrílico = painel transparente azulado com reflexos; chumbo = barra/lingote pesado e escuro. O nome e a espessura continuam no título do botão (Alumínio 3 mm, Acrílico 5 mm, Chumbo 1 cm).
- Testes: 15, 16, 01, 06 e 29 passam (59 testes nesses arquivos). Suíte completa não repetida: só HTML/CSS dos botões mudou.
- Backup: `archive/2026-10-19_pre-icones-blindagem.tar.gz` (só index.html e styles.css; removido `pre-hospital-mapa`, o mais antigo). Sem publicação.

## 2026-10-19 · Versão 2.4: abas Missões | Investigações e dica de localização das fontes
- Pedido (após teste no celular): (1) no celular as investigações apareciam mais em evidência que as missões; (2) fontes difíceis de achar saturam o jogador; (3) melhorar os móveis (etapa 3, ainda não iniciada no código).
- Abas "Missões | Investigações" em "Selecionar missão" (decisão minha: você não escolheu entre abas e tela com dois cartões). Missões é a aba padrão ao abrir pelo menu principal; ao sair de uma investigação volta-se à aba Investigações. Chaves i18n 192 → 198.
- Dica de localização (`js/encontros/dica.js`, valores [H]): sem progresso por 90 s, as fontes que faltam pulsam em vermelho no minimapa (grátis); aos 150 s, ou ao pedir (botão 📍 Dica / tecla H, 8 s), também no mapa, o que desconta 2 pontos do aproveitamento (uma cobrança por intervalo entre duas fontes achadas, teto de 6). "Progresso" = fonte identificada, lição concluída, chave ou Geiger pegos. Automática respeita "mostrar dicas"; o botão sempre vale. Uso aparece no resumo final. No celular o botão fica sob a pausa.
- O aviso da dica espera outra notificação (ex.: assistência do alfa) terminar.
- Versão no menu: 2.4 · 2026-10-19.
- Testes: 262/262 (novo `tests/29-dica-fontes.test.mjs`, 6 testes; ajustes em 01 e 25), rodada completa antes do ajuste de versão; teste 23 rodado de novo depois.
- Backup: `archive/2026-10-19_pre-abas-dica.tar.gz` (removido `pre-conferencia-codex`, o mais antigo). Sem publicação.

## 2026-10-16 · Ajuste de HUD do hospital no celular (2.3)
- Pedido: corrigir a sobreposição de textos apontada na verificação final.
- `styles.css`: no hospital, o contador central `#sources-tracker` fica oculto (o cabeçalho já mostra "Observações n/7"). Nada mais alterado.
- Testes executados após o ajuste: 25, 27, 28 (16/16), 15 e 16 (15/15). A suíte completa não foi repetida (mudança só de CSS escopada ao hospital).
- Limite conhecido: o botão Correr e os botões do canto podem cobrir, de passagem, rótulos do mapa; é sobreposição de controles sobre o cenário, não de textos do HUD entre si.
- Backup: `archive/2026-10-16_pre-ajuste-hud-hospital.tar.gz`. Arquivo mais antigo removido para respeitar o limite de 5 (foram apagados 5 backups de pastas antigas: pre-modo-revisao, pre-investigacao, pre-dados-insuficientes, pre-modo-professor, pre-sorteio).

## 2026-10-16 · Verificação final antes da publicação (2.3)
- Conferido sem alterar o jogo: sintaxe de todos os módulos, suíte completa (255 testes: 253 na rodada completa + 2 testes de documentação reexecutados com a pasta docs, que faltava na cópia de trabalho), citação AIEA SRS-13 seção 4.2 e inspeção visual do mapa em 360×640 e 640×360 (PT e EN).
- Observações visuais (não bloqueiam): no celular, o texto "Helena · recepção · E / Q" e o contador "0/7 observações" se sobrepõem no centro; o botão Correr cobre parte do rótulo "Mural"; o contador aparece também no cabeçalho.
- Pendente: teste em celular real; revisão por físico médico.

## 2026-10-16 · Hospital com observações e móveis próprios (2.3)

- Dois estados do modelo precisam ser registrados antes das perguntas; caderno acessível no mapa, com exportação das observações e da explicação escrita antes do retorno.
- Mural e falas retomam os registros da sessão. Móveis específicos para recepção, radiografia, sala educativa, apoio, mural e medicina nuclear, dentro do gerador/renderizador existentes.
- Detalhes e limites em [docs/hospital-2.3.md](docs/hospital-2.3.md). Não há validação de aprendizagem nem restauração da investigação após recarregar.
- Backup: `archive/2026-10-16_pre-hospital-evidencias-mobiliario.tar.gz`. Sem publicação.

Verificação 2.3: **255/255 testes passaram**, sem falhas ou testes ignorados, em 446,1 s. Log: `docs/conferencia-2026-10-16/testes-2.3.log`. Captura do mapa: `docs/conferencia-2026-10-16/hospital-mobiliario-2.3.png`.

## 2026-10-16 · Hospital integrado ao mesmo jogo (2.2)
- Requisito: manter estrutura, personagem, movimento, colisão, câmera, HUD e linguagem visual; novos NPCs/móveis podem ser acrescentados dentro dela.
- `HospitalScene` herda a `GameScene` existente. Usa `MapGenerator`/planta hospitalar e pintura/mobiliário existentes, com uma variante conservada e novas texturas de NPCs; nenhum gerador ou controlador paralelo permanece em current.
- Sete pontos contextuais; E/Q, toque/click próximo e botão de interação; minimapa/indicador existentes; retorno ao campo após conversa; hipótese/histórico preservados.
- Acesso: menu > investigação hospitalar; `?investigacao=hospital`. Alternativa de leitura pelo botão no campo ou `?investigacao=hospital&leitura=1`.
- Testes de integração em `tests/27-hospital-campo.test.mjs`; relatório atualizado em docs/conferencia-relatorio-2026-10-16.md. A 2.1.1 passou 249 testes antes desta integração; o resultado da 2.2 fica no relatório.
- Backup da consolidação: archive/2026-10-16_pre-hospital-mapa.tar.gz. Abordagem de mapa paralelo descartada: archive/2026-10-16_mapa-paralelo-descartado.tar.gz. Sem publicação.

Verificação consolidada 2.2: **252/252 testes passaram**, sem falhas, em 447,4 s. Log: `docs/conferencia-2026-10-16/testes-2.2.log`. Inspeção manual: aproximação com controles originais, conversa com Helena e retorno ao mesmo mapa; captura em `docs/conferencia-2026-10-16/hospital-mesma-estrutura-pt.png`.

## 2026-10-16 · Conferência do relatório e correções (2.1.1)
- Matriz de atendimento e limites em [docs/conferencia-relatorio-2026-10-16.md](docs/conferencia-relatorio-2026-10-16.md). A carteira de expansões não está inteiramente implementada.
- Investigação hospitalar 0.2-teste: hipótese preservada após sair da recepção; histórico de tentativas/retornos e cartões no JSON (esquema 2), versão do jogo e fontes; sessão parcial não afirma revisão final; notas corrompidas saneadas.
- Ajustes PT/EN: dose absorvida e efeitos agudos, exposição, referência ANSN 3.01 (Resolução CNEN 344/25), radiação ionizante no cartaz, aparelho energizado versus emissão. Fontes em docs/referencias-5c/busca/revisao-2026-10-16.md.
- Nova questão N10-7: insuficiência de informações para identificar radionuclídeo. A limitação da identificação por candidatos no mapa continua registrada.
- Foco de teclado e descrição do SVG melhorados; cartão hospitalar acionável por teclado. Caderno usa “Progresso nos encontros”, preservando as regras existentes.
- Testes 07/08 corrigidos para RH_ROOT opcional; regressões em tests/26-revisao-relatorio.test.mjs; leitura efetiva do JSON em tests/25-investigacao.test.mjs. Resultado consolidado no relatório de conferência.
- Backup: archive/2026-10-16_pre-conferencia-codex-134533.tar.gz. Nenhum arquivo morto excluído. Não publicado.

## 2026-10-16 · Modo de revisão opt-in (credibilidade do jogo)
- Pedido: o jogo não pode exibir observações para revisores; isso só deve existir se o revisor ligar um "modo de revisão" nas configurações.
- Configurações > "Modo de revisão" (`settings.revisao`, padrão desligado). Desligado: sem campo de observação, selo, aviso de protótipo nem rótulos [V]/[N]/[H] na investigação; aparece uma nota neutra (conteúdo fictício/educativo) e as fontes públicas. Ligado: selo, aviso, rótulos e campo de observação por cena (salvo em `radiationHuntersRevisao`, com "Baixar observações").
- Alternativas da investigação reequilibradas (a correta é a mais longa em 5/16 cenas; razão máx. 1,22).
- Chaves i18n 190 → 192. Testes: 243; 242 passaram na rodada completa e a única falha era a asserção antiga de `03-robustez` (sem `revisao:false`), corrigida e reexecutada (6/6).
- Backup: `archive/2026-10-16_pre-modo-revisao` (removido `pre-revisao`, o mais antigo).
- Pendente: ainda existem rótulos [V]/[H] visíveis nas lições da Academia (anterior a esta mudança) — decidir se também passam para o modo de revisão.

## 2026-10-16 · Investigação 1: "Hospital: de onde vem a imagem?" (protótipo 0.1-teste)
- Pedido: implementar o roteiro e deixar os humanos (João Vitor e outros) revisarem jogando.
- Novo tipo de missão sem mapa nem Geiger: `js/investigacao/` (motor puro, dados bilíngues, interface DOM). 7 cenas: hipótese inicial, equipamento liga/desliga, caminho da radiação, comparação com frasco (outro contexto), cartaz (cartões com generalizações), mensagem central, retomada (medicina nuclear). Cada alternativa errada tem retorno próprio; evidência escolhida por cartão (sem texto livre); alternativas e cartões embaralhados a cada exibição.
- Ficha final (hipótese inicial, evidências, decisão, revisão, limite, fontes) com exportação `.json` e resumo copiável; campo "Observação para os revisores" em cada cena entra na exportação.
- Acesso: menu > Selecionar missão > cartão "Investigação 1" (área própria sob as 8 missões), ou `?investigacao=hospital`. Sem pontuação, sem tempo, sem gravação de progresso.
- Fontes [V] abertas hoje: CDC (exposição x contaminação), RadiologyInfo (segurança; medicina nuclear). [N]: tubo só produz raios X quando ligado. Roteiro e pontos de revisão em `docs/roteiro-hospital-investigacao.md`.
- Testes: 240/240 (novo `tests/25-investigacao.test.mjs`; `tests/23` ajustado). Backup: `archive/2026-10-16_pre-investigacao` (removido `pre-paginacao`, o mais antigo).
- Pendente: revisão por físico médico; teste com professores; publicar.

## 2026-10-16 · Etapa 3: evidência na identificação e "Ainda não dá para concluir" (P0.5 do relatório)
- Pedido: continuar o plano derivado do relatório (opção de não concluir quando os dados não bastam).
- Modal de identificação: mostra a evidência reunida (○/✓ leitura sem placa, leitura com placa) e o botão "Ainda não dá para concluir". O botão não conta tentativa, não tira pontos nem combo; a orientação muda conforme haja ou não comparação (sem placa + com placa, com sinal acima do limiar).
- Acertar sem ter comparado placas mostra uma "nota de método" (no mundo real, uma leitura isolada não identifica a fonte); a pontuação NÃO muda. A evidência zera a cada fonte achada e a cada reinício.
- Decisão de projeto [H]: o jogo continua com lista fechada de candidatos; não há cenário em que "dados insuficientes" seja a única resposta correta (isso ficaria para a missão de investigação).
- Chaves i18n 184 → 190. Testes: 233/233 (novo `tests/24-dados-insuficientes.test.mjs`).
- Backup: `archive/2026-10-16_pre-dados-insuficientes` (removido `pre-objetivo`, o mais antigo).

## 2026-10-16 · Etapas 1 e 2 do relatório de análise (P0 conceitual + modo professor)
- Pedido: aplicar as etapas 1 e 2 do plano derivado do relatório `analise_radiation_hunters.md`.
- Etapa 1 (textos PT/EN): N05 (Bq/Gy/Sv; Sv não mede lesão; contagem do Geiger não dá dose), N06 (exposição inclui material incorporado; radiografia não transfere material), N11 e perguntas ligadas (efeito agudo em Gy; 1 Gy ≈ 1 Sv para raios X/gama é simplificação [H]), N12 e pergunta do limite (1 mSv vale para o público, não é teto de exame médico). Limite CNEN NN 3.01 ainda sem conferência na norma vigente [N].
- Etapa 2: Phaser 3.60.0 local em `current/vendor/phaser.min.js` (sem CDN de script); `js/modo.js` (versão 2.1 · 2026-10-16, `?missao=N`, `?estudo=1`); aproveitamento com `semTempo` (modo estudo reescala fontes/encontros/cofre para 100%); versão no menu; chaves i18n 182 → 184.
- Testes: 229/229 (novo `tests/23-modo-professor.test.mjs`; `tests/01-dados` atualizado para 184).
- Backup: `archive/2026-10-16_pre-modo-professor` (removido o mais antigo, `pre-alternativas`, pelo limite de 5).
- Pendente: publicar (draft, depois --prod) e testar em celular real com `?missao=2&estudo=1`; demais itens do relatório (identificação "dados insuficientes", missão de investigação/hospital) não iniciados.

## 2026-10-16 · Pente fino de textos, conceitos e perguntas (PT-BR/EN)
- Pedido: revisar ortografia PT-BR/EN, referências, clareza dos conceitos e correção/clareza das perguntas, com ciência justa (aproximações declaradas).
- EN padronizado em inglês americano (cesium, aluminum, millimeter, behavior, color, traveling); "Beta-M".
- story1/mission1Desc agora batem com o mapa (8 salas; 5 fontes nas salas 4–8; salas 4 e 8 trancadas).
- Descrições/dicas alfa e beta: alfa = poucos cm de ar/papel/camada externa da pele; beta de alta energia (Sr-90/Y-90) é só reduzida por Al/acrílico (coerente com a simulação das placas).
- Lição 6: regras de leitura corrigidas (Sr-90 cai muito mas não zera; Cs-137 = patamar de gama que só o chumbo reduz). Lição 4: alternativa errada absurda trocada. Lição 7: trecho enxugado.
- radiumHint sem "brilha verde" (fósforo ZnS; cor não verificada). fact2_1: gama do Cs-137 vem do Ba-137m. fact3_1: Hoffman/JAMA 1925 (~5 mortes, 12 casos), removido "Radium Dangers 1906" (não verificado). fact5_1: certificado ≈1 Sv/h vs medidas 670/580 mSv/h (IAEA Lia). fact8_1: removido "250 km" (não consta na fonte).
- Perguntas: N01-5 (2–3 mSv/ano), N11-1 (1 Sv ou mais), E-MAY-3 (2^-7,8 ≈ 0,5%).
- Testes: 225/225. Backup: archive/2026-10-16_pre-revisao (removido o mais antigo, o zip original, pelo limite de 5).
- Pendente (não verificado [N]): citações de Curie (segunda mão), ano de compra de Mayapuri, teste em celular real.

## 2026-10-16 — Quiz: ordem das alternativas sorteada
- Pedido: ainda parecia haver muita resposta certa na posição "1".
- Dados já estavam rebalanceados (1ª=4, 2ª=4, 3ª=5 de 13), então o relato pode vir de uma versão publicada antes do rebalanceamento; não consegui verificar o que está no ar.
- Mudança: `ui-licao.js` sorteia a ordem das alternativas toda vez que a pergunta é mostrada; a certa nunca repete a posição da pergunta anterior; teclas 1–9 e destaque seguem a ordem exibida. Dados em `licoes.js` inalterados (índice original).
- Testes: 19 (+1: 40 aberturas, certa aparece nas 3 posições, nunca repete, posição exibida coerente); 19/20/21/22 passam; suíte completa não repetida.
- Arquivo: `archive/2026-10-16_pre-sorteio` (removido `pre-licoes`; 5 itens). Encontros (perguntas.js) já embaralhavam.

## 2026-10-16 — Posição da alternativa certa no quiz
- Pedido: a resposta certa não deveria ser (quase) sempre a primeira. Verificado: das 13 perguntas, 12 tinham `certa: 0`.
- Mudança: alternativas reordenadas em `licoes.js` (pt e en idênticos). Posições da certa: 1ª=4, 2ª=4, 3ª=5, sem repetir 3 seguidas. Texto das alternativas e explicações inalterado.
- Testes: 19 agora exige certa fora da 1ª posição em ≤40% das perguntas, uso das 3 posições e pt/en coincidentes; teste de "resposta errada" escolhe uma alternativa que não é a certa. 19/20/21/22 passam (suíte completa não repetida: mudança só em dados de lição).
- Arquivo: `archive/2026-10-16_pre-alternativas` (removido `pre-licao7`; 5 itens).
- Observação: a alternativa certa costuma ser a mais longa em algumas perguntas (pista involuntária); não alterei o texto.

## 2026-10-16 — Celular: história e lições em partes
- Pedido: no celular a história inicial da missão estourava a tela e o botão ficava inacessível; textos longos (lições/quiz) deveriam aparecer em partes, como a história.
- Causa provável do estouro: altura em `100vh` (no celular inclui a barra do navegador). Agora o contêiner usa `100dvh` + `env(safe-area-inset-*)`, o texto rola dentro dele e a barra de botões fica fixa no rodapé. [V no Chromium headless com viewports 390×844, 360×640, 844×390, 667×375; NÃO verificado em celular real]
- História da missão: dividida em partes (`js/paginar.js`, limite de caracteres estimado pela área visível), botões Voltar / Próximo / Continuar e "Parte i de n".
- Lições: teoria em partes (Voltar/Próximo); demo da lição 7 em parte própria; fonte só na última parte; "Ir para o quiz" só na última; Esc continua adiando; barra de botões fixa (sticky) também no quiz.
- Testes: novo `22-paginacao` (5); helpers `passarHistoria` e `lerLicao`; testes 02/19/20/21 ajustados. Suíte: 224/224.
- Arquivo: `archive/2026-10-16_pre-paginacao` (removido o mais antigo, `2026-10-15_pre-personagem`; 5 itens).
- Não verificado: toque/desempenho em aparelho real, outros navegadores, leitor de tela.

## Academia: orientação no mapa grande e interface (2026-10-16) — rodada de verificação e melhorias
**Pedido:** nova rodada de verificação e melhorias de interface/jogabilidade, principalmente no multimapa (Academia).
**Auditoria (capturas desktop 1280x720 e celular 390x844, rota medida por BFS):** (1) botões do painel de lição sem estilo (branco padrão do navegador); (2) nada orientava o jogador num mapa 57x33; (3) a chave azul na sala 1 obrigava ~32 tiles de ida e volta depois da lição 3; (4) o cone de visão aparecia antes de o jogador ter o Geiger. Rota total de lições, chaves, Geiger e painéis: ~250 a 270 tiles em 6 sementes (a 2,5 tiles/s de caminhada [valor de `PLAYER_SPEED`, unidade não conferida] seria da ordem de 2 minutos só andando; a meta de 1200 s continua palpite [H]).
**Mudanças:**
- **Objetivo na tela** (`academia/objetivo.js`, puro): HUD mostra "Lições n/8 · Fontes a/5" e "Próximo: ..." na ordem linear lição 1 > chave azul > lições 2-3 > porta azul > Geiger > lição 4 > chave vermelha > lições 5-7 > porta vermelha > lição 8 > fontes (indica só a sala, nunca o móvel). Se o jogador sair da ordem, o objetivo recalcula.
- **Seta de caminho** em volta do jogador, apontando o próximo passo por BFS (contorna paredes; não é linha reta); some perto do alvo, com as dicas desligadas (Configurações) e durante modais.
- **Minimapa:** painéis (ciano pendente, verde feito), chaves, Geiger no chão e anel pulsante no alvo do objetivo.
- **Revisar lição:** tecla E perto de um painel concluído, ou toque/clique nele (até 2,2 tiles): só o texto, sem quiz, não conta de novo.
- **Painel de lição:** botões estilizados, alvos de toque de 44 px, "Ir para o quiz"; alternativas certa/errada coloridas.
- **Cone de visão** só depois de pegar o Geiger.
**Testes:** `20-objetivo` (5: ordem do objetivo, textos pt/en, BFS e pontoAdiante, 10 sementes com tudo alcançável e sem itens sobrepostos, HUD/seta/minimapa/revisão) e `21-academia-completa` (3 sementes: partida inteira seguindo só o objetivo da tela até concluir, 5 fontes identificadas pelo Geiger). Suíte completa: 216/216 antes de adicionar o 21; o 21 passa (3/3).
**Backup:** `archive/2026-10-16_pre-objetivo` (removido `2026-10-15_pre-chaves`; archive com 5 entradas).
**Não verificado:** celular real (toque no painel, tamanho da seta e dos alvos, desempenho do canvas com a seta); se a seta incomoda quem já conhece o mapa (hoje só desliga em Configurações > dicas); equilíbrio da meta de tempo.

## Academia: lições lineares, Geiger como item e travas (2026-10-16) — etapa 3 de 4
**Pedido:** aprendizado linear (radioatividade, radiação, ionizante x não ionizante, Geiger com blindagem para identificar o tipo). Currículo em rascunho no doc "Academia do Caçador — currículo linear"; decisões do usuário: ordem das salas aprovada; Sr-90 como beta (mesmo não puro, a menos que recém-separado); Geiger na sala 4; erro no quiz só explica (sem repetir, sem efeito nas estrelas); fronteira ionizante/não ionizante ensinada com UV-A, UV-B e UV-C.
**Mudanças:** (1) a Academia começa SEM Geiger: botões Geiger/Identificar ocultos, tecla G avisa; o Geiger é um item na sala 4 (pegar passando perto; aparece no inventário). (2) 8 painéis de lição, um por sala (`js/academia/licoes.js`, textos pt/en com rótulo [V]/[H]/[N] por lição; `js/academia/ui-licao.js`, modal). A lição abre ao chegar perto do painel; relógio e movimento param. Linear: lição i só abre depois da i-1; a da sala 4 exige o Geiger. (3) Portas: azul exige chave + lições 1 a 3; vermelha exige chave + lições 4 a 7. (4) Fontes só nas salas 4 a 8 (5 fontes): sala 4 Cs-137, sala 5 Cs-137, sala 6 Sr-90, sala 7 Am-241, sala 8 sorteada entre os 3. (5) Conclusão da Academia exige as 5 fontes E as 8 lições, em qualquer ordem. (6) Meta de tempo 1200 s [H] (palpite; o tempo de leitura não conta). (7) Lição 3 traz UV-A 315-400 nm, UV-B 280-315 nm, UV-C 100-280 nm [V: OMS e ICNIRP, páginas abertas]; UV é não ionizante e fica ao lado da região ionizante [V: ICNIRP]; o valor da fronteira em energia não consta nessas páginas e não é usado [N].
**Fontes abertas nesta etapa:** EPA Radiation Basics, NRC Unit 1, OMS UV Q&A, ICNIRP UV. Ainda [N] (física geral sem página aberta): raio X/gama como ondas eletromagnéticas, "menor comprimento de onda = maior energia", Geiger responde à ionizante, inverso do quadrado, princípio tempo-distância-blindagem.
**Testes:** novo `19-licoes.test.mjs` (5); `18-academia` atualizado (5 fontes, 3 vagas no inventário, porta exige lições); `11-cofre` (missão 1 agora tem alfa, beta e gama); helper `navegador.mjs` limpa os campos novos. Suíte: 210/210. Aprendizado: nos testes, não devolver o container do Phaser de `page.evaluate` (a serialização levava ~10 s).
**Backup:** `archive/2026-10-16_pre-licoes` (removido `2026-10-15_pre-academia`; archive com 5 entradas).
**Não feito (etapa 4):** a lição 7 não tem demonstração de decaimento; o painel de lição é só texto + quiz (sem arrastar cartões como no currículo); revisão dos textos pelo autor; sem etapa de publicação. Chave i18n: textos das lições ficam em `academia/licoes.js` (fora das 182 chaves).
**Não verificado:** celular real (painel de lição, toque nas alternativas), balanceamento do tamanho do mapa e da meta de 1200 s, se o jogador percebe os painéis como interativos.
**Publicar (não executado):** `netlify deploy --dir=apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f` (rascunho; testar em celular real, retrato e paisagem), depois com `--prod`.

### Academia, etapa 3 — revisão dos rótulos e lição 7 (2026-10-16)
**Pedido:** explicar os itens [N] e melhorar a lição 7.
**Verificação (páginas abertas hoje):** passaram a [V]: raios X e gama como radiação eletromagnética de alta energia e ionizante, e comprimento de onda maior = energia menor (CDC, espectro eletromagnético); Geiger detecta por ionização do gás (NRC, What is a Geiger Counter); inverso do quadrado para fonte pequena, 1 pé -> 2 pés = 1/4 da taxa de dose (NRC, SART cap. 4, slide 16); tempo, distância e blindagem (EPA RadTown, atividade 2); meia-vida, exemplo de 100 átomos, Tc-99m 6 h, U-238 ~4,5 bilhões de anos, <1% após 7 meias-vidas (NRC glossário; CDC isótopos). Continua [N]: que cada átomo decai ao acaso e só o conjunto é previsível (não consta nas páginas abertas). Achado que mudou o texto: o NRC diz que o Geiger NÃO identifica fonte, tipo nem energia; as lições 4 e 6 agora dizem que o tipo é só uma pista pela comparação de leituras com e sem blindagem.
**Lição 7:** texto reescrito (definição, 100 átomos, faixas de valores, meias-vidas do jogo Sr-90 28,8 a, Cs-137 30 a, Am-241 ~433 a), 3 perguntas e demonstração interativa de 64 átomos (a cada passo, 50% de chance por átomo; modelo de jogo [H]) em `ui-licao.js`. Estilos em `styles.css`.
**Testes:** `19-licoes` (6). Suíte parcial: 19 e 01-dados passam (suíte completa foi 210/210 antes desta revisão).
**Backup:** `archive/2026-10-16_pre-licao7` (removido `2026-10-15_pre-assistencia`; archive com 5 entradas).

### Correção de enquadramento do Geiger (2026-10-16)
**Feedback do usuário:** o desafio do jogo é discriminar entre candidatas CONHECIDAS (o jogador já vê isótopo e tipo de emissão de cada candidata); Geiger, distância e blindagem são pistas que eliminam candidatos até fechar o diagnóstico. A frase do NRC (Geiger não identifica fonte, tipo nem energia) vale para fonte DESCONHECIDA e não contradiz o jogo; eu a tinha apresentado como achado que afetava o jogo — foi leitura equivocada minha.
**Mudança:** lições 4 e 6 reescritas nesse sentido (nova seção "Fechando o diagnóstico" na 6; rótulos de fonte dizem "fonte desconhecida"). Só texto em `academia/licoes.js`; `19-licoes` passa (6/6). Sem novo backup (alteração de texto sobre `archive/2026-10-16_pre-licao7`).

## Academia: corredor central, portas trancadas, chaves e inventário (2026-10-15) — etapa 2 de 4
**Pedido:** corredor central e algumas salas fechadas e mais escondidas; chave na sala 1 abrindo outra sala; ~1/4 das salas fechadas. Regras aprovadas: pegar a chave só passando perto (sem botão), porta abre sozinha com a chave, inventário em barra de ícones, garantia contra jogo travado.
**Layout novo (`mapa/academia.js`, 57 x 33):** corredor central de 5 tiles entre duas fileiras de 4 salas (13 x 12). Salas 1-3 e 5-7 abrem para o corredor e se ligam às vizinhas por portas abertas. Salas 4 e 8 (25%) não têm porta para o corredor: só se entra por porta trancada na sala ao lado (3->4 azul, 7->8 vermelha). Chave azul na sala 1; chave vermelha dentro da sala 4.
**Código:** tile 3 = porta trancada (bloqueia e conta como parede; vira 0 ao abrir). `GameScene.criarPortasEChaves()` sorteia a posição de cada chave num piso alcançável com as portas anteriores já abertas (cadeia resolvida); `verificarPortasEChaves()` (pegar ao passar a < 0,8 tile; porta abre a < 1,0 tile com a chave; aviso sem chave a cada 4 s); inventário em `#inventory` (`ui.atualizarInventario`), minimapa mostra as portas em dourado. Textos pt/en (182 chaves de tradução). `GameState.inventario` zera a cada partida.
**Testes:** `18-academia.test.mjs` reescrito (8): geometria; 4 sementes verificando que as salas 4 e 8 são inalcançáveis sem chaves, a azul se pega sem nada, a vermelha só depois da azul, todas as salas ficam alcançáveis com as duas, uma fonte por sala e detectável; fluxo de jogo (aviso, pegar, inventário, porta abre); câmera; botão de pular. Suíte: 205/205.
**Backup:** `archive/2026-10-15_pre-chaves` (removido `pre-acessibilidade`; archive com 5 entradas).
**Não verificado:** celular real (tamanho dos alvos, inventário no canto), balanceamento do tamanho do mapa, ícones/sons definitivos das portas. Etapas 3 (Geiger como item e progressão) e 4 (lições e quizzes por sala) ainda não feitas.

## Academia: mapa grande de 8 salas (2026-10-15) — etapa 1 de 4
**Pedido:** ampliar o tutorial (missão 1), chamá-lo de Academia, e permitir pular. Plano em 4 etapas publicáveis: (1) mapa grande, (2) portas/itens/inventário/chaves, (3) progressão e Geiger achado, (4) conteúdo didático por sala. Esta entrada cobre só a etapa 1.
**Mudanças:** novo `js/mapa/academia.js` (57 x 33 tiles, 8 salas de 13 x 15 em serpentina 1->2->3->4->5->6->7->8, portas de 2 tiles entre salas consecutivas, móveis junto às paredes e faixas das portas livres). `MapGenerator` usa o layout quando a missão tem `layout: 'academia'`; `mapData.salas` expõe as salas. Missão 1: `numSources: 8`, `umaFontePorSala`, `timeLimit: 900` [H], isótopos Am-241 e Cs-137; título "Academia do Caçador" / "Hunter Academy", história ajustada (8 salas). `placeSources` põe uma fonte por sala, respeitando a acessibilidade. Botão "Pular a Academia" no cartão da missão 1 (`progresso.pularAcademia()` libera a missão 2 sem estrelas).
**Testes:** `18-academia.test.mjs` (6): geometria, uma fonte por sala e todas alcançáveis/detectáveis (3 sementes), câmera no mapa grande, botão de pular. Os testes de motor usam por padrão o laboratório compacto antigo (opção `academia: true` no helper liga a Academia). Suíte: 203 (202 + `01-dados` corrigido para 176 chaves).
**Backup:** `archive/2026-10-15_pre-academia` (removido `pre-camera`; archive com 5 entradas).
**Não feito (próximas etapas):** portas e chaves de verdade, itens, inventário, Geiger como item, quizzes por sala, conteúdo didático. As salas ainda não têm nome nem lição própria; as 8 fontes são Am-241/Cs-137 alternadas.
**Não verificado:** a meta de 900 s é palpite; jogo no celular real e a distância total a percorrer (mapa 4x maior que o antigo).

## Assistência do alfa por tempo (2026-10-15)
**Pedido:** ajudar o jogador frustrado na detecção do alfa (Radium Girls e Am-241), sem mudar o desafio inicial. Decisão do usuário: regra dupla.
**Regra [H, valores de jogo, não físicos]:** o alcance do alfa sobe de 1,0 para 1,5 tile (0,5 m -> 0,75 m) quando o tempo de jogo (sem pausa nem encontros) passa de 75% da meta da missão, ou de 50% da meta se ainda faltam mais da metade das fontes. Só liga se ainda houver fonte com componente alfa por achar. Aparece um aviso e a tela final registra "assistência ativada". A pontuação não mudou (o bônus de tempo já reflete a demora). Parâmetros em `data/config.js` (`ASSIST_*`).
**Código:** `GameScene.verificarAssistencia()`; `fisica/geiger.js` aceita `ctx.alfaAlcanceTiles`; textos `assistAlfa`/`assistAlfaFim` (pt/en, 175 chaves).
**Testes:** `17-assistencia.test.mjs` (5); `01-dados` atualizado (175 chaves). Suíte: 197/197.
**Backup:** `archive/2026-10-15_pre-assistencia` (removido `pre-verificacao`; archive com 5 entradas).
**Não verificado:** se 75%/50% são bons valores com jogadores reais; o identificar continua exigindo ≤ 1,0 tile (só a detecção foi ampliada).

## Acessibilidade das fontes (2026-10-15)
**Pedido:** a fonte da missão Radium Girls parecia muito difícil de detectar; verificar se todas as fontes ficam em lugares acessíveis e garantir isso no sorteio.
**Auditoria (antes de mudar):** em 25 mapas sorteados da missão 3 (100 fontes) e em amostras das demais missões, toda fonte já caía num móvel alcançável; a menor taxa líquida medível (melhor posição, mira em 8 direções) foi 40,6 cps na M3. Ou seja, não encontrei fonte presa ou inalcançável; a dificuldade vem da regra didática do alfa (só conta a ≤ 1 tile da superfície do móvel, de frente, sem parede no meio).
**Mudança (garantia):** novo `js/fisica/acessibilidade.js` (varredura das posições alcançáveis com a colisão real + melhor taxa por móvel). `GameScene.placeSources()` só sorteia móvel com taxa líquida >= 25 cps; se faltar, relaxa para 15, 8 e, por último, qualquer móvel. Física do Geiger inalterada.
**Testes:** `16-acessibilidade.test.mjs` (7 testes). Suíte: 192/192.
**Backup:** `archive/2026-10-15_pre-acessibilidade` (removido `pre-geiger-comp`; archive com 5 entradas).
**Em aberto (decisão do usuário):** tornar a M3 mais fácil mexendo no alcance do alfa (`alfaAlcanceTiles`, hoje 1,0) ou com pista visual; não alterei.

## Novo personagem (2026-10-15)
**Pedido:** personagem mais bonito e moderno, que se identifique com o jogo. Decisões: cientista de campo (jaqueta laranja de alta visibilidade com faixas refletivas, capuz branco com visor ciano, mochila com trifólio), desenhado por código, um personagem, 4 direções, parado/andar/correr.
**Mudanças:** novo `js/render/personagem.js` (texturas `cacador_<dir>_<n>`, 3 quadros por direção; direita = espelho da esquerda). `GameScene` usa o sprite; o detector Geiger gira em torno do personagem apontando à frente (ficando atrás do corpo ao andar para cima); ciclo de passos mais rápido ao correr. `geigerIndicator`/`geigerTip` mantidos (cores do Geiger inalteradas). Teste novo em `15-camera.test.mjs`. Suíte: 184/184 antes do teste novo; `15-camera` 8/8 depois.
**Backup:** `archive/2026-10-15_pre-personagem` (removido o mais antigo, `pre-caderno`; archive com 5 entradas).
**Não verificado:** aparência em celulares reais; correr/andar em ritmo real de dispositivo lento.

## Câmera, mapas grandes e interface de celular (2026-10-15)
**Pedido:** preparar a tela e o mapa para mapas maiores que a tela (inclusive no computador) e tornar o jogo jogável no celular, com botões visíveis e visual moderno. Decisões do usuário: só a capacidade (nenhuma missão foi ampliada), câmera que segue o jogador com suavização, joystick analógico flutuante, retrato e paisagem com layouts próprios.
**Mudanças:**
- Canvas agora acompanha o contêiner (`Scale.NONE`, resolução = tamanho × dpr, dpr limitado a 1,5; `ResizeObserver` + `orientationchange`).
- `GameScene.ajustarCamera()`: zoom adaptativo, mapa pequeno centralizado, mapa grande com `startFollow` (lerp 0,12) e limites; missões aceitam `mapCols/mapRows` opcionais (padrão 24×16). Minimapa proporcional ao mapa, com retângulo da vista.
- Joystick analógico flutuante (`#joy-zone`) substitui o direcional; botão Correr; HUD translúcido sobre o mapa no celular.
- Testes: `15-camera.test.mjs` (novo); `02`, `06`, `07` atualizados. Suíte completa: 184/184 (ambiente em nuvem, Chromium headless).
**Não verificado:** celulares reais (toque, desempenho do renderer Canvas em dpr 1,5), leitores de tela, outros navegadores.
**Estado:** não publicado. Backup anterior em `archive/2026-10-15_pre-camera`.

## 2026-10-15 — Publicação
Deploy de produção feito pelo usuário (sem rascunho prévio): `netlify deploy --dir=apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod`. Deploy ID 6ad0f2df79ea3c81f1397d96, 46 arquivos, https://radiationhunters.netlify.app. Para reverter: painel do Netlify > Deploys > deploy anterior > "Publish deploy". Site ID registrado aqui para próximos comandos.

## 2026-10-14 — Pesquisa histórica ampla + dica beta+gama
**Pedido:** (a) nota do usuário: o Geiger real não detecta a gama de 59,5 keV do Am-241 → o jogo fica como está (minha observação anterior estava errada); (b) melhorar a dica beta+gama; (c) pesquisa mais abrangente dos fatos históricos.
**Feito:** 4 pesquisas independentes (Curie/Radium Girls; Goiânia/Zaragoza; Chernobyl/Fukushima/CNEN; Lia/Mayapuri) com fontes abertas; resultado completo em `docs/fatos-historicos-3e.md` (seção "Verificação ampla de 14/10/2026", com V/N).
**Mudou nos textos:** story2 (retirada 13/09 e ruptura 18/09 separadas; "duas pessoas"; depósito provisório; beta e gama), story3 (Ra-228 em algumas fábricas desde ~1919; renda "enquanto vivessem"), story4 (116.000 "primavera e verão"; tireoide "até 2002"; gatilho exato desconhecido, INSAG-7), story5 (cilindros a ~10 cm; "sem supervisão nem controle" em vez de "deixou de ser soviética"; floresta abaixo da represa), fact3_3/3_4 (Curie = declaração à imprensa), fact6_3 (7× CSN vs ~9× AIEA), fact7_1/7_3/7_4 (1969 Parlamento/AERB; >15 anos com nota de >20; idade removida), fact8_2 (341 documentos removido), Fukushima/OMS → AIEA 2015 (pergunta N-FUK, ficha de conceito), Po-210 (Marie e Pierre Curie, 1898), Cs-137 "esteve no centro" do acidente, ficha do cofre do Ra-226. Dica `betaGammaHint` reescrita como procedimento: medir sem escudo, depois com Al/acrílico (o que some é a beta), o que sobra é a gama (só chumbo derruba).
**Não verificado / ainda [N]:** Hoffman 1925 e "Radium Dangers" 1906; INES 7, 110.000/165.000/37.000 e Tóquio 250 km (só BASE); 670/580 mSv/h; limiar de 1 Sv "segundo a OMS"; autorização jan/1970 e FIR 08/04 (Mayapuri); frase da OMS sobre ~50 mortes em Chernobyl (contexto). Leituras via WebFetch são resumos de página.
**Testes:** 177/177 no Chromium (cópia na nuvem). Arquivo anterior desta rodada: o `archive/2026-10-14_pre-verificacao` (anterior a ambas as rodadas de correção de texto); archive com 5 entradas.
**Estado:** pronto para upload; nada publicado. Comando (você executa):

    netlify deploy --dir=apps/radhunter/current --site=<ID-do-site> --prod

## 2026-10-14 — Nova verificação (dados, texto, história, jogabilidade)
**Pedido:** revisão antes do upload. Feita por mim + agente Opus independente (só leitura, com consulta a LNHB/NIST/AIEA/Lok Sabha etc.).
**Dados:** valores de Co-60, Cs-137, U-238, Tc-99m, I-131, Ir-192, Am-241, P-32 conferem com o LNHB; tabela do chumbo confere com o NIST XCOM. Sr-90/Y-90, Po-210 e Ra-226 só de memória do agente (não reabertos).
**Corrigido:** story7 PT/EN (atividade Mayapuri: 147,186 TBq em 1969, ~688 GBq em abr/2010, AERB V5D3.5); fact7_2 (12% em 16 anos → 0,5% em 41 anos); fact7_3 (">20 anos" → ">15 anos", compatível com as duas declarações do Lok Sabha); fact5_2 (bremsstrahlung = raios X, não gama); N04-3 (folha fina de Al → placa de alguns mm); 7,7 → 7,8 meias-vidas; "caçadores" → lenhadores (Lia); descrição da missão 6 deixa claro que a clínica é ficção; botão de identificação mostra "β+γ beta e gama" para fontes com 2 componentes (I-131, Cs-137, Co-60), em vez de só "β beta"; doc: "brilho azul" é [V] (AIEA).
**Não alterado (decisões de design suas, a decidir):** (1) Am-241/Ra-226: blindagem "papel certo" ignora a gama de 59,5 keV / 609 keV dos filhos; (2) regra do cofre conta só o próprio nuclídeo (Y-90, Bi-214 ficam de fora); (3) botão de identificação mostra o tipo e lista só fontes ainda não achadas (missões 2, 3, 7 têm 1 resposta possível); (4) beta + chumbo = crédito 0,4 vs. contêiner de chumbo da história de Lia; (5) Geiger ignora a gama do Am-241; (6) dica beta+gama generaliza para Sr-90/P-32.
**Fatos históricos sem fonte aberta (N):** frases de Marie Curie (fact3_3/3_4), Ra-228 na tinta, Grace Fryer/acordo de 1928, INSAG-7, contêiner de chumbo de Lia, fatores de dose 7×/5×/3× do CSN, BARC 3,1 Gy, Fukushima OMS/AIEA 2015, CNEN NN 3.01.
**Testes:** 177/177 no Chromium (cópia na nuvem, RH_ROOT definido). Arquivo anterior: `archive/2026-10-14_pre-verificacao` (apaguei `pre-cofre-ui`; 5 entradas).

## 2026-10-14 — Caderno do cofre, energias Am-241/Co-60, Mayapuri e conferência geral
**Pedido:** corrigir o registro do cofre no caderno sem comprometer a dinâmica da 2ª tentativa; conferir energias alfa do Am-241 e do Co-60; confirmar o valor final de Mayapuri; conferência geral antes do upload.
**Mudou:**
- `cofre.js` `registros`: agora 1 registro agregado por nó (N04 "Alfa, beta e gama"; N09 "Blindagem") em vez de um por item. Acertar na 2ª tentativa conta como acerto e NÃO abre a ficha; "ruim" em N04 = item errado nas duas tentativas; em N09 = blindagem com crédito < 0,7; erro do nó = mais da metade dos itens feitos ruins; ficha só se algum item foi ruim; nada feito = pulado. Cofre perfeito soma 1 acerto por nó (antes saturava).
- `emissoes.js`: Am-241 ganhou o alfa de 5388,25 keV (1,66/100); o total alfa exibido passa de 97,7 para 99,3 por 100 (teste 12 ajustado). Co-60 já coincidia com a tabela LNHB. Registro V5E.2 em `docs/referencias-5c/busca/agente-D-5d3.md` (nível de extração via resumo de página, não citação literal).
- Mayapuri: 147,186 TBq (3978 Ci) é a atividade de 1969; em abr/2010 ≈ 688,2 GBq (18,6 Ci), conforme slides da AERB (V5D3.5). Corrigidos `fatos-historicos-3e.md`, `encontros-5c.md`, `cofre-5e-plano.md`, `cofre-5e-revisao.md` (o "[N] não consta" estava desatualizado). A ficha do jogo continua sem citar atividade.
- Arquivo anterior: `archive/2026-10-14_pre-caderno`; apaguei `archive/2026-10-14_pre-cofre` (a mais antiga) para ficar com 5 entradas. Removidos `.rh-teste.tgz` e resíduos `._*` do macOS em `tests/`.
**Testes:** novos 4 em `11-cofre` (2ª tentativa sem erro/ficha, cofre perfeito ≤1 acerto/nó, todos revelados, saída antecipada); suíte completa no Chromium (cópia na nuvem, com `RH_ROOT`): 177/177.
**Não verificado:** leitor de tela e toque físico; LNHB lido por resumo, não literal; Mayapuri 2010 só via slides da AERB (relatório completo não lido).
**Estado:** pronto para upload. Nada publicado. Comando (você executa):

    netlify deploy --dir=apps/radhunter/current --site=<ID-do-site> --prod

## 2026-10-14 — Etapa 5e-E: revisão crítica, correções e comando de deploy
**Pedido:** revisão crítica do cofre e fechamento (docs, comando de deploy, sem executá-lo).
**Feito:** autoverificação + revisão independente por agente Opus (só leitura); 10 correções (texto da beta x tabela do Sr-90/Y-90, "fótons por decaimento" acima de 100, foco, Tab no celular, anúncio do retorno por leitor de tela, fantasma de arrasto, cabeçalhos da tabela, contraste, reduced-motion, docs) e testes novos. Detalhes, pendências e limites em `docs/cofre-5e-revisao.md`. Arquivo anterior: `archive/2026-10-14_pre-revisao-e` (apaguei `pre-5e`, a mais antiga pasta; o zip do original continua).
**Testes:** 173 no Chromium (cópia na nuvem), todos passam (172 na primeira rodada; o 173º era erro do meu teste: Playwright não clica em `aria-disabled`).
**Não verificado:** leitor de tela real, toque em aparelho físico, fontes originais LNHB/NIST nesta etapa.
**Estado:** etapas A–F concluídas; nada publicado. Para publicar (você decide e executa):

    netlify deploy --dir=apps/radhunter/current --site=<ID-do-site> --prod

## 2026-10-14 — Etapa 5e-D: cofre interativo integrado ao jogo
**Pedido:** trocar o cofre provisório (uma pergunta por tipo) pelo cofre definitivo do mockup aprovado: 3 prateleiras, fontes clicáveis com ficha, blindagem por prateleira usada, tempo congelado, Esc, pausa bloqueada, PT/EN, acessibilidade, registro no caderno, aproveitamento.
**Mudou:**
- Novos: `js/encontros/cofre-ui.js` (DOM: bandeja, prateleiras, ficha, blindagem, resumo; clique/toque, arrastar com Pointer Events, teclas ← → 1 2 3 Esc, Tab preso no cofre, `prefers-reduced-motion`), `cofre-ficha.js` (dados puros da ficha), `cofre-textos.js` (textos PT/EN da interface), modal `#cofre-modal` em `index.html`, bloco `.cf-*` em `styles.css`.
- Editados: `gerenciador.js` (`cofre()` usa `novoCofre`/`creditos`/`registros`; os créditos do cofre viram `cofreCreditos`, um por isótopo e um por prateleira usada), `ui.js` (registra `ui.cofre`, Esc global ignora o cofre, `hideAllModals` cancela), `GameScene.js` (`uiCofre`), `cofre.js` (seção provisória removida), i18n PT/EN (chave `vaultCounter` removida: 174 → 173 chaves).
- Arquivo anterior: `archive/2026-10-14_pre-cofre-ui`. Para manter no máximo 5 versões apaguei `archive/2026-10-14_pre-5d3` (a mais antiga das pastas) e **mantive** o zip do original `radhunter-original-2026-10-13.zip`, por ser a única cópia intacta da v2.0; avise se preferir o inverso.
**Decisões:**
- A ficha mostra: nome, meia-vida (LNHB via `isotopes.js`), barras de emissão por 100 decaimentos (LNHB/DDEP, `emissoes.js`), a regra da prateleira, a tabela "o que o Geiger mostra" (fração do sinal por blindagem, calculada com as MESMAS funções do jogo) e a espessura de chumbo (feixe estreito, sem buildup, NIST XCOM).
- História: só fatos de `docs/fatos-historicos-3e.md`, e só no par (missão, isótopo) onde o fato vale; sem fato conferido a ficha diz que a fonte é "peça do jogo". Nenhuma atividade em Bq por fonte. **Correção minha ao mockup:** ele dizia "cerca de 1300 TBq cada" para Lia; o registro só tem 1295 TBq (prefácio do relatório) sem dizer se é por fonte, então o número saiu.
- Sair do cofre pede confirmação; o que não foi guardado vale 0 e o caderno registra como pulado.
- Os textos da interface do cofre ficam em `cofre-textos.js` (e não em `i18n/pt.js`/`en.js`) para a lógica rodar em Node; o teste 13 confere paridade PT/EN e marcadores `{n}`.
**Testes:** novos `13-cofre-ficha` (8, Node) e `14-cofre-ui` (9, Chromium: tempo parado, Esc/pausa, 1-2-3 sem trocar a blindagem do Geiger, fluxo certo, erro 1º/2º, blindagem errada, arrastar, sair, inglês, 960×640 sem rolagem e celular 390×844 com ficha em painel inferior, missão 1 de ponta a ponta com o cofre real). Adaptados: `08` (testes do cofre provisório removidos; os do cofre novo estão em 11/13/14), `09` (robô resolve o cofre pela interface), `01` (173 chaves). Suíte completa no Chromium (cópia na nuvem): 167 testes, todos passam; os que leem `docs/` foram conferidos no dispositivo (13 passa lá).
**Limites (o que NÃO foi verificado):** sem teste em leitor de tela nem em aparelho de toque real (só emulação de viewport e Pointer Events em Chromium); contraste das cores não foi medido com ferramenta; os créditos das blindagens e o limiar 50 por 100 continuam [H]; as espessuras de chumbo são de feixe estreito (subestimam o necessário em geometria real).
**Estado:** etapas A, B, C, F, D concluídas. Falta E (revisão crítica completa, docs finais, comando de deploy — não executado).

## 2026-10-14 — Etapa 5e-F: Geiger com componentes (beta + gama)
**Pedido:** fontes com mais de uma emissão relevante (I-131, Cs-137, Co-60) devem mostrar as duas no Geiger, mantendo o jogo jogável.
**Mudou:** `js/fisica/componentes.js` (novo), `js/fisica/geiger.js` (soma sobre `fonte.componentes`), `GameScene.js` (linha de emissões no feedback; dica "beta e gama"), i18n PT/EN (+2 chaves, 172→174), `emissoes.js` (energia gama efetiva, alcance beta Katz-Penfold). Arquivo anterior: `archive/…_pre-geiger-comp`.
**Decisões:** componente primária = `type` de isotopes.js (inalterada; exceção desde 27/10/2026: I-131 passou a `gama`, com a beta como secundária); secundárias com rendimento ≥50/100 entram com peso = razão de rendimentos; `fatorForca` por tipo segue [H]. Componentes só somam sinal (nunca reduzem).
**Testes:** novo `12-geiger-componentes` (14); `04-geiger` e `01-dados` adaptados (distâncias gama 3–6 tiles; fonte "beta" pode ser I-131). Suíte completa no Chromium (cópia na nuvem): 153 testes, 150 passam; as 3 falhas são testes que leem `docs/` (ausente na cópia) — 10 e 11 passam no dispositivo; o de `08-encontros` (cofre provisório) não foi reexecutado lá.
**Limites:** Co-60 beta só até ~0,7 m; I-131 agora é achado de mais longe (gama); sem teste em aparelho real.
**Estado:** F concluída; próxima Etapa D (UI integrada).

## Changelog corrido — etapas 0 a 5 (arquivo antigo, mais antigo primeiro)

### 2026-10-13 — Auditoria inicial (jogo não modificado)
- Pedido: ler tudo, abrir em Chromium headless, listar achados por prioridade,
  mapear dependências e apresentar plano.
- Resultado: lista de achados entregue no chat. Sondas em `tests/sondas/`.
- Achados principais: Continue inexistente; três configurações sem efeito;
  `timeLimit` ignorado; Esc empilha modais; localStorage bloqueado ou com tipo
  errado derruba a inicialização; Geiger com sinal determinístico (só o fundo é
  Poisson); queda gama linear em vez de 1/d²; sem controles de toque; sem espanhol.

### 2026-10-13 — Etapa 0: organização
- `game.js`, `index.html`, `styles.css` movidos para `current/` (conteúdo
  idêntico; conferido com `node --check`).
- Cópia do original em `archive/radhunter-original-2026-10-13.zip` (idêntica ao
  `apps/radhunter.zip`, que ficou onde estava).
- Criadas `tests/` e `tests/sondas/` com as quatro sondas de auditoria.
- Nenhuma linha de código do jogo foi alterada. Cabeçalho de autoria intacto.
- Nenhuma referência por caminho foi encontrada no README do portal, nos testes
  nem em `vlabmain`; o portal aponta para a URL do Netlify.

### 2026-10-13 — Decisões de projeto do Geiger
- Registradas as quatro decisões acima (escala, paredes, aceitação angular,
  atividade constante). Nenhum código alterado. Aguarda autorização para a etapa 1.

### 2026-10-13 — Etapa 1: testes que travam o comportamento atual
- Criada a suíte em `tests/` (50 testes): dados (i18n, isótopos, blindagens,
  missões), fluxo (menus, 8 missões, pausa, reinício, identificação, conclusão,
  progresso), robustez (localStorage) e Geiger (modelo atual por tipo, distância,
  blindagem, cone, fundo).
- Resultado: **33 passam, 17 são `todo` (falhas conhecidas), 0 falham**; três
  execuções iguais. Cinco mutações manuais em uma cópia do jogo foram todas detectadas.
- Duas falhas da primeira rodada eram do teste, não do jogo: `scene.resume()` e
  `scene.restart()` são assíncronos no Phaser. Corrigido esperando a cena ativa.
- Os 17 `todo` documentam: Continue inexistente, salvamento só no `beforeunload`,
  Esc empilhando modais, canvas não destruído ao sair, três configurações sem efeito,
  `timeLimit` ignorado, sem controles de toque, localStorage bloqueado ou com tipo
  errado, três textos que não seguem o idioma, e quatro itens de física (sinal Poisson,
  1/d², gama fora do cone, tabela de meias-vidas).
- O jogo (`current/`) não foi alterado: md5 conferido igual ao do início.
- Observação: a segunda gravação deste README (decisões do Geiger) não aparecia no
  disco quando conferi; regravado nesta etapa.

### 2026-10-13 — Etapa 2: divisão em ES modules (só mover código)
- `game.js` (5.604 linhas) virou 26 módulos em `current/js/`; `index.html` troca
  `<script src="game.js">` por `<script type="module" src="js/main.js">` (única
  mudança nele). `styles.css` intacto. Phaser continua fixado em 3.60.0 (CDN).
- O recorte foi **mecânico**: `tools/dividir-modulos.mjs` copia o texto de cada
  declaração do original sem redigitar, e calcula os `import` por análise de escopo
  (eslint-scope). Fim de linha CRLF preservado. Mapa de dependências: acíclico
  (UIManager e GameScene só se falam por `window.gameScene`, como antes).
- Único texto de lógica alterado (equivalente): um módulo importador não pode
  reatribuir `currentLang`; as duas atribuições viraram `setLang(...)` (em `ui.js`
  e `main.js`), e `setLang` mora em `js/i18n/index.js`. Cola nova: imports/exports,
  `i18n = { en, pt }`, `MISSIONS = [...]` montado dos 8 arquivos, e em `main.js` a
  exposição de globais (`GameState`, `ui`, `CONFIG`, ...) que a suíte de testes lê.
- O cabeçalho de autoria foi **movido sem alteração** para o topo de `js/main.js`.
  Peço sua confirmação desse novo endereço (ver Pendências abaixo).
- `game`, `pendingMission` e a substituição de `UIManager.prototype.startMission`
  continuam em `main.js`, como no original. Ficam para a etapa 3d.
- Modo estrito: módulos são sempre estritos; análise de escopo não achou atribuição
  a variável não declarada, e as 8 missões rodam sem erro no console.
- Verificação: (1) `tools/verificar-fatiamento.mjs`: 39 declarações do original
  presentes uma vez, byte a byte, e só 16 linhas novas (a cola declarada acima);
  (2) suíte inalterada: **33 passam, 17 todo, 0 falhas**, mesmo conjunto de
  resultados de antes, em 2 rodadas; (3) `tests/ferramentas/comparar-versoes.mjs`:
  com a mesma semente, mapa, móveis, fontes e 4 leituras do Geiger por fonte são
  **idênticos nas 8 missões**; (4) pixels do canvas iguais nas missões sem animação
  dependente do tempo; nas demais, a própria versão antiga difere dela mesma entre
  duas execuções, então a prova de pixels ali é inconclusiva (a prova é o item 1).
- Versão anterior arquivada em `archive/2026-10-13_pre-modulos/` (game.js,
  index.html, styles.css). `archive/` tem 2 itens (limite: 5).
- Nada publicado. Para publicar, o diretório continua sendo `apps/radhunter/current`
  (agora com a subpasta `js/`; o Netlify serve módulos sem configuração extra).

### 2026-10-13 — Etapa 3a: projeto do Geiger (só documentos; o jogo não mudou)

- Pedido: projeto do modelo do Geiger com parâmetros de fonte citável; novas etapas 4
  (storytelling) e 5 (gráficos, mapas, tileset com acessórios); acessibilidade e revisão final
  passam a 6 e 7.
- Criados `docs/geiger-projeto-3a.md`, `docs/parametros-fisicos.json` e `docs/calc-parametros-3a.py`.
- Verificado nesta etapa (NIST XCOM, tabelas LNHB, datasheet Ludlum 44-9): coeficientes de
  atenuação e densidades do chumbo, alumínio, concreto, PMMA e ar; meias-vidas e emissões de 11
  isótopos; alcance beta (Katz-Penfold, conferido com o P-32). Escolhas de jogo estão marcadas [H] e o
  que falta fonte, [P] (ASTAR/ESTAR, tempo morto, resposta angular, bremsstrahlung, buildup).
- Decisões a tomar: D1 (alfa por contato), D2 (50 cm por tile), D3 (gama fora do cone com piso
  de 0,3), D4 (espessuras das blindagens), D5 (parede de 30 cm de concreto), D6 (integração de 3 s), D7 (identificar pela superfície do móvel), D8 (não aplicar os `timeLimit` atuais como derrota).

### 2026-10-13 — Etapa 3a (complemento): verificação de jogabilidade por simulação

- Pedido: conferir se o modelo proposto é prático e jogável.
- Feito: `tests/simulacao/` (extrai os 8 mapas reais, 6 sorteios cada; robô-jogador; modelo atual e proposto; cobertura de áudio/gradiente). Resultados na seção 12 de `docs/geiger-projeto-3a.md`.
- Resultado: o modelo proposto não deixa nenhuma missão mais lenta que a atual (medianas de 124 a 283 s no robô) e é insensível aos parâmetros [H] (escala, parede, piso do gama, força das fontes). Fatores de força revisados: gama 0,3 x base a 1 m; beta 1,0 x base a 0,5 m. Janela de exibição de 3 s (D6).
- **Bug do jogo atual achado e confirmado no jogo real:** o móvel "Damaged Core" (3x3) sempre recebe fonte nas missões 4 e 8 e a fonte não pode ser identificada (menor distância alcançável 1,813 tile; limite 1,5). Nada foi corrigido ainda (3d); novo teste `todo` em `02-fluxo`. Nova decisão D7.
- Também registrado (3d): velocidade independente de `delta` (por leitura do código, não testado em 120/144 Hz); `timeLimit` declarado e não aplicado, com valores abaixo do p90 do robô em 4 de 6 missões (D8).
- Limite: o robô não é uma pessoa; a pergunta "é divertido?" exige teste com jogadores.
- O jogo (`current/`) não foi modificado.

### 2026-10-14 — Etapas 3b, 3c e 3d: Geiger novo, interface e bugs funcionais

- Pedido: "corrigir os bugs e fazer o que for necessário para que o jogo fique totalmente jogável e as
  missões concluíveis". Decisões D1 a D8 do projeto 3a tratadas como aprovadas.
- **Geiger (3b/3c).** `js/fisica/geiger.js` (puro, sem Phaser): taxa = fundo + soma por fonte de
  `S·G(d)·T_ar·T_blindagem·T_parede·f(θ)`; gama 1/d² com exp(-μx) (NIST XCOM, interpolação log-log);
  beta 1/d² com corte linear no alcance (Katz-Penfold) e parede bloqueando; alfa só por contato
  (superfície a ≤ 1 tile); contagens Poisson; média móvel de 3 s com incerteza √N/T; painel em escala
  logarítmica; cliques sonoros no ritmo da contagem. Blindagens agora têm material e espessura reais
  (Al 3 mm, acrílico 5 mm, chumbo **1 cm**; o 1 cm é escolha minha dentro da D4, marcada [H]). Paredes:
  30 cm de concreto; 50 cm por tile. Meias-vidas e energias entram em `isotopes.js` (LNHB/NIST do 3a).
- **Identificar (D7).** Distância medida da superfície do móvel (`IDENTIFY_DISTANCE` 1,0 e
  `OBSERVE_DISTANCE` 2,0 tiles, agora da superfície, não do centro): corrige o bug do "Damaged Core" 3x3
  que impedia concluir as missões 4 e 8.
- **Bugs corrigidos (3d):** velocidade independente da taxa de quadros; pausa só por sinalizador
  (`scene.pause/resume` eram assíncronos); Esc no DOM (fecha painéis, fecha identificação, retoma ou
  pausa; nunca empilha); movimento congelado com o modal de identificação aberto; erro de identificação
  não trava mais os botões (voltam após a dica; o isótopo errado fica riscado; a fonte continua
  selecionada); temporizadores da cena (`this.time.delayedCall`) no lugar de `setTimeout`; relógio
  conta só o tempo jogado (sem pausa nem tela final); conclusão congela a cena; **progresso e estrelas
  gravados ao concluir** (`js/progresso.js`); botão **Continuar** (última missão desbloqueada); sair ao
  menu e voltar após concluir **destroem o Phaser**; configurações (dicas, tremor, música) funcionam e
  são gravadas; **música ambiente** sintetizada (`audio.js`, sem arquivos); `localStorage` bloqueado ou
  com lixo não derruba mais (saneamento de missões, estrelas e configurações); `<html lang>` e títulos
  das blindagens acompanham o idioma; mensagens de conclusão em i18n; **controles de toque**
  (direcional e correr; aparecem em tela estreita ou sem mouse).
- **`timeLimit` (D8):** vira **meta de tempo**, não derrota. HUD mostra tempo / meta; 3 estrelas pedem
  precisão ≥ 80% dentro da meta; missões sem `timeLimit` usam 240 s [H]. Bônus de tempo = 2 pontos por
  segundo abaixo da meta.
- **Testes:** 78 testes, todos passam (ver `tests/README.md`). Os 18 `todo` viraram testes normais. Novo
  `06-jogabilidade`: um robô conclui **as 8 missões** no jogo real (Chromium), mais movimento por teclado,
  toque e pausa. Limite declarado: o robô se teletransporta entre posições alcançáveis (inundação sobre
  `isBlocked`); a descoberta por gradiente está em `tests/simulacao/`.
- Arquivado: nada novo (a versão anterior já estava em `archive/2026-10-13_pre-geiger/`, idêntica ao
  `current/` anterior; conferido com `diff -r`).
- Ainda aberto: textos que citam CPM (história 1) e "alcance alfa ~4 cm" não batem com o painel em cps
  e com o alcance didático de 1 tile (vão para a revisão de textos, etapas 3e/4); conferência ASTAR/ESTAR
  e Emax do Y-90 ([P] do 3a); resposta em 120/144 Hz só por leitura do código.

### 2026-10-14 — Etapas 3e e 4 (primeira rodada): fatos históricos e storytelling

- Pedido: "depois pode seguir com melhoria das histórias e do storytelling". Pesquisa em documentos oficiais
  (AIEA, CSN, Fórum Chernobyl/OMS, BASE, Parlamento da Índia/AERB); tabela completa em `docs/fatos-historicos-3e.md`.
- **Erros factuais das histórias originais corrigidos:** Zaragoza (foi um acelerador linear de elétrons, sem
  isótopo; a missão virou ficção declarada), Lia (três homens buscando lenha, não "caçadores"; recuperação em
  fev/2002 pela AIEA), Mayapuri (números "15 g" e "~60 TBq" não verificados: removidos; 16 canetas x 7
  pastilhas, 1 morte, 7 internados), Goiânia (relações entre personagens removidas; números da AIEA 1988),
  Fukushima ("150.000+" trocado por ~110.000 evacuados / ~165.000 deslocados; 30 a 40 anos de
  descomissionamento), Chernobyl (causa não afirmada; números do Fórum Chernobyl).
- **Cobalto-60 retirado das missões 4 e 8** (não é radionuclídeo principal desses acidentes). Muda o conjunto de
  isótopos sorteados nessas missões; o robô ainda conclui as 8.
- **Histórias reescritas** (en e pt): fato real, "lição", número, linha "NO JOGO" que separa realidade de
  simplificação, e linha de **Fonte**. Textos antigos com "CPM" e "alcance alfa ~4 cm" corrigidos (cps; alcance
  didático de 50 cm explicado). Removidas alegações não verificadas ("brilha azul", "80% dos procedimentos").
- **Notas de campo:** 4 por missão (32 por idioma), exibidas ao identificar a 1ª a 4ª fonte, no modal de
  identificação (chaves `fact<missão>_<n>`). O modal fica 8 a 9 s no acerto para dar tempo de ler.
- **História:** texto aparece mais rápido (12 ms por passo, 3 caracteres) e clicar no texto mostra tudo;
  rolagem própria e alinhamento à esquerda.
- Testes: 80 (todos passam). Novos: notas e fontes em todas as missões; ausência das alegações removidas;
  Co-60 fora de 4 e 8.
- **Não verificado em fonte primária ([S] ou [N] em `docs/fatos-historicos-3e.md`):** relatório AIEA de Lia
  (usei resumo da Wikipédia), número de pacientes e mortes de Zaragoza (fontes divergem: 11 a 15), atividade do
  Co-60 de Mayapuri, causa de Chernobyl, textos de época das Radium Girls.

### 2026-10-14 — Etapas 3e e 4, segunda rodada: pendências de fonte primária fechadas

- **Lia:** relatório da AIEA (2014) lido: moradores buscando lenha em 2/12/2001; ~1.300 TBq por fonte (1.480 TBq de projeto); ~1 Sv/h a 1 m; internação em 22/12 (Zugdidi); um paciente morreu em 13/05/2004; recuperação em 2-3/02/2002, contêiner com 25 cm de chumbo (o relatório cita também 27 cm: inconsistência interna).
- **Zaragoza:** AIEA (RPOP): 27 pacientes, 15 mortes pela sobredose e 2 com contribuição importante. Substitui o "mais de dez" anterior (a Wikipédia dá 11).
- **Chernobyl:** INSAG-7 (AIEA, 1992): experimento com a alimentação elétrica independente; causa principal = comportamento instável do reator, mudanças não aprovadas no teste e cultura de segurança deficiente. A história agora cita isso.
- **Radium Girls:** USTUR/WSU confirma Ra-228 (mesotório, 5,8 a) na tinta real e a proibição de afinar o pincel com a boca em 1929.
- **Mayapuri:** segue sem valor de atividade do Co-60 em nenhuma fonte lida (Parlamento, AERB/INIS, artigo médico 2013, Wikipédia); o jogo não cita valor. Divergências registradas (1968 x 1969; 7 internados x 8 expostos).
- Testes: 80, todos passam (sem mudança de contagem).

### 2026-10-14 — Etapa 5: terreno, paredes e acessórios (gráficos)

- Novo `js/render/terreno.js`: o piso, as paredes e os acessórios de chão de cada mapa são pintados **uma vez** num canvas (2x a resolução, 1.536 x 1.024 px) com gerador pseudoaleatório semeado pelo número da missão (mulberry32). Antes, `GameScene.drawMap` criava centenas de objetos do Phaser por mapa e usava `Math.random`, então o aspecto mudava a cada partida. Agora: mesma missão = mesmo aspecto, menos objetos na cena.
- Por tema: laboratório (vinil com juntas, paredes claras com faixa azul), ferro-velho (terra e cascalho; paredes de pneus, chapas, carcaças e tambores), hospital (linóleo xadrez gasto; tinta descascada e rodapé), fábrica (tábuas; tijolos), nuclear (lajes de concreto; concreto rachado com vergalhão; faixa de perigo em volta do reator), bunker/floresta (grama em três tons; árvores). Acessórios de chão (manchas, cabos, rachaduras, folhas, pedras, samambaias, entulho, marcas de pneu) são **só visuais**: não bloqueiam e não mexem na física (as fontes continuam dentro dos móveis).
- Paredes com face frontal em pseudo-3D e sombra de contato no piso; janelas pintadas no tile 3.
- Câmera com zoom 1,25 centrada no mapa (768 x 512 vira 960 x 640): some a faixa preta ao lado do mapa. O texto do móvel (scrollFactor 0) foi compensado para ficar em (20, 82) da tela e do mesmo tamanho. A colisão não mudou (tile 1 bloqueia; móveis bloqueiam).
- Testes: 83 (todos passam). Novo `07-graficos`: sem `Math.random(` em `drawMap` e `terreno.js`; mesma missão gera o mesmo canvas e missões diferentes geram canvas diferentes; toda parede bloqueia; zoom e posição do texto.
- **Pendente nesta etapa (próximas rodadas, se Arnaldo quiser):** sombras e mais acessórios nos móveis, cartazes e placas nas paredes, mini-mapa que cobre o canto superior direito do mapa agora que o zoom preenche a tela (avaliar na etapa 6), conferir escala visual dos móveis. Arquivo anterior em `archive/2026-10-14_pre-graficos/`.

### 2026-10-14 — Etapa 5b: sombras, itens nas paredes, luzes e identidade por missão

- `terreno.js` ganhou, além do terreno: (1) **ícones nas paredes** (laboratório: placa de radiação, quadro, grade de ventilação, extintor, relógio; hospital: cruz, mural, grade, corrimão; fábrica: tubo, manômetro, luminária; nuclear: triângulo de perigo, eletroduto, luz de alarme, painel de LEDs), todos sem texto para não depender do idioma; (2) **sombras suaves** sob cada móvel; (3) **poças de luz** no piso (laboratório, hospital, fábrica, nuclear); (4) **identidade por missão**: tom de cor próprio e adereços (fita de segurança na 1, lixo e fardos na 2 e na 7, serragem na 3, marcas de maca na 6, troncos e lenha caídos na 5, poças d'água na 8); (5) **vinheta** nas bordas.
- Tudo é só visual e feito em tempo de pintura, com a mesma semente da missão: não muda colisão, nem física, nem a posição das fontes. Os adereços são liberdade artística genérica, **não afirmam fatos históricos**.
- Testes: 83, todos passam. Arquivo anterior em `archive/2026-10-14_pre-graficos-5b/`; para respeitar o limite de 5, foi removido `archive/2026-10-13_pre-geiger/` (o `.zip` original e as demais versões permanecem).

### 2026-10-14 — Etapa 5c, pesquisa de fontes (`docs/referencias-5c/`)

- Pesquisa com a skill de referências para o banco de fichas "Mito x Fato" e para fatos dos acidentes: ~109 fichas brutas em `busca/` e a síntese em `resumao.md` (fatos prontos para ficha, divergências, lacunas, referências). Fontes oficiais priorizadas (AIEA, OMS, UNSCEAR, NRC, EPA, CDC, CNEN, ICRP, CSN, ATSDR, USTUR).
- Conferi 14 itens (13%) nas páginas originais: todos confirmados. Limite: leitura por WebFetch, sem os PDFs; trechos entre aspas precisam ser reabertos na fonte.
- **Achados que afetam o jogo (nada foi alterado ainda):** (1) o relatório da AIEA sobre Goiânia registra que o material "brilhava em azul no escuro" e atribui o brilho, com cautela, a fluorescência ou radiação Cherenkov: o "brilho azul" que retirei na etapa 4 pode voltar com essa ressalva; (2) fundo natural mundial: 2,4 mSv/ano (OMS 2020, UNSCEAR FAQ) x ~3,0 mSv (relatório mais recente do UNSCEAR, via ARPANSA 2026); (3) Mayapuri: atividade do Co-60 segue não encontrada em 10 fontes, e o ano de compra diverge (1967 a 1970); (4) Chernobyl e liquidators: números diferem entre Fórum 2005, UNSCEAR 2008 e 2018.
- **Pendente:** documento de design dos encontros (5c), que usará este banco; fatos com status N ficam de fora das fichas.

### 2026-10-14 — Etapa 5c, documento de design dos encontros (`docs/encontros-5c.md`)

- Escrito a partir do pedido de Arnaldo: os dois formatos (**Mito x Fato** e **perguntas de tema**) e uma **árvore de ligação entre perguntas** para escolher a próxima com base num critério e, se o jogador errar, servir uma pergunta mais simples que ensine o conceito.
- Árvore: 14 nós de conceito e 7 de história (grafo sem ciclos, três níveis de pergunta por nó), estado de domínio de 0 a 4 por nó, prioridade = 4 × relevância da missão + 3 × reforço + 2 × adequação + 1 × variedade, regra de reforço (erro em L2 serve L1 do mesmo nó; erro em L1 serve o pré-requisito mais fraco com uma ficha de reforço), no máximo 3 perguntas por encontro, desempate semeado (mesma sequência de respostas, mesmas perguntas).
- Regras já combinadas: relógio pausado, bônus extra sem mexer nas estrelas, erro sem punição, pular e desligar nas configurações, 2 a 3 encontros por missão em pontos semeados.
- Banco inicial: 40 perguntas rascunhadas, todas com fato de status V no banco de referências (ou cálculo/raciocínio do projeto marcado). A redação final e a checagem de cada trecho na fonte ficam para a 5d-3.
- **Nada foi implementado.** Decisões a confirmar: seção 11 do documento.

### 2026-10-14 — Etapa 5c, documento de encontros revisado com as decisões de Arnaldo

- **Fechado:** 3 encontros por missão (2 fixos semeados + 1 disparado pelo Geiger); caderno de campo **permanente** em todas as missões, com design de caderno de laboratório (seção 6.2); código de turma na URL em aberto; modo competição só no futuro.
- **Pontuação relativa ao máximo:** aproveitamento de 0 a 100% = busca e identificação 55% + tempo 20% + aprendizado 25%; quem desliga os encontros tem os pesos reescalados (73/27) e continua podendo chegar a 100%. As estrelas não mudam. Pesos a calibrar na 5d com a simulação de jogadores sintéticos (o bom caçador que erra todas as perguntas deve manter mais de ~75%).
- **Reforço em cadeia:** errou uma vez → ficha de reforço e pergunta mais simples (sem repetir a errada); acertou → mostra a solução da original; errou → pergunta ainda mais simples; se errar de novo, o jogo ensina as três em ordem, da mais simples à original. Limite recomendado: 3 perguntas por encontro (a árvore tem no máximo 3 níveis por nó mais um pré-requisito; o resto é retomado nos encontros seguintes e no caderno).
- Pendente de confirmação: limite de 3, "pular conta 0% naquele encontro", pesos iniciais. Nada implementado.

### 2026-10-14 — Etapa 5d-1: motor dos encontros, banco de perguntas e aproveitamento (sem interface ainda)

- **Pedido:** implementar os encontros de aprendizado segundo `docs/encontros-5c.md`; esta parte cobre só a lógica, os dados e os testes. O jogo visível **não mudou**.
- **Dados:** `js/data/encontros/conceitos.js` (21 nós: 14 de conceito e 7 de história, com pré-requisitos sem ciclo, ficha de reforço PT/EN e fonte) e `perguntas.js` (55 perguntas Mito x Fato e de alternativas, PT/EN, cada uma ligada a IDs do banco de referências e com status V, V+C ou V+R). A redação ainda é rascunho; a conferência de cada trecho na fonte é a 5d-3.
- **Motor** (`js/encontros/motor.js`, funções puras, sem `Math.random`): escolhe o nó por prioridade (domínio baixo, missão, gatilho, história), desempata por menos visto e sorteio semeado; cadeia de reforço de no máximo 3 perguntas, sem repetir, do mais simples ao original; créditos 1 / 0,5 / 0,25; pular = 0.
- **Aproveitamento** (`js/encontros/aproveitamento.js`): 55% fontes + 20% tempo + 25% encontros. **Decisão de Arnaldo:** desligar os encontros zera os 25% e o teto vira 75%, sem reescalar.
- **Progresso:** `settings.encontros` (padrão ligado) e `aprendizado` (domínio por nó, vezes vista, fichas vistas) saneados em `progresso.js`; lixo no armazenamento é descartado.
- **Testes:** `tests/08-encontros.test.mjs` (15 testes, Node puro; suíte total 98 testes): grafo, ciclos, PT/EN, fatos existentes no banco, determinismo, cadeia, aproveitamento. Simulação de calibração em `tests/simulacao/encontros-sim.mjs` (`RH_ROOT=../current node simulacao/encontros-sim.mjs 300`).
- **Achado da simulação (a decidir):** com os créditos 1 / 0,5 / 0,25, um aluno que acerta só 30% das perguntas ainda recebe crédito médio de ~0,42 por encontro, porque a cadeia dá segundas chances; quem acerta tudo de primeira recebe 1,00. O caçador perfeito que erra tudo fica em 75%, como combinado. Sugiro avaliar créditos menores para a 2ª e a 3ª chance (por exemplo 1 / 0,4 / 0,15) na 5d-4; é um ponto de partida, não uma regra física.
- **Cobertura simulada:** 8 missões x 3 encontros usam ~18 dos 21 nós; repetição de pergunta cai a ~0 para quem acerta quase tudo; para quem erra muito há repetição porque o banco é de 55 perguntas (a 5d-3 deve ampliar L1 e L3).
- Arquivado: `archive/2026-10-14_pre-encontros`; removida a mais antiga (`2026-10-13_pre-modulos`) para manter o máximo de 5.

### 2026-10-14 — Etapa 5d-2: encontros no jogo, caderno de campo e aproveitamento na tela final

- **Pedido de Arnaldo:** usar créditos menores nas chances extras e seguir para as próximas etapas. Créditos agora **1 / 0,4 / 0,15** (eram 1 / 0,5 / 0,25).
- **Correção de uma afirmação minha na 5d-1:** eu disse que as segundas chances inflavam o crédito de quem acerta pouco. A simulação refeita com os novos créditos mostra que quem acerta 30% recebe 0,39 por encontro (antes 0,42): quase todo o crédito vem da **primeira tentativa**, e uma pergunta Mito x Fato dá 50% de acerto no chute. Créditos menores nas chances extras ajudam pouco; para reduzir o efeito do chute seria preciso ter mais perguntas de alternativas e menos binárias nos níveis 2 e 3 (a avaliar na 5d-3).
- **No jogo:** 2 pontos fixos por missão (casas alcançáveis do mapa real, longe da largada e das fontes, sorteio semeado pela missão) e 1 encontro disparado pelo Geiger (detector ligado, sinal contínuo acima de 2x o fundo por 1,5 s, depois de 15 s de jogo); intervalo mínimo de 40 s entre encontros; balão "?" de meio segundo antes do modal (sem animação com movimento reduzido).
- **Modal do encontro** (`js/encontros/ui-encontro.js` + `gerenciador.js`): pergunta, retorno com explicação, ficha de reforço (cartão de papel) ao errar, cadeia de até 3 perguntas, encerramento com as respostas do mais simples ao original e crédito. Teclado (1 a 3, M/F, Enter, Esc = pular) e toque; relógio e movimento parados; botão de pausa e Esc de pausa desativados durante o encontro; sair ou reiniciar a missão cancela o encontro.
- **Fim de missão:** os encontros que não aconteceram no caminho são apresentados antes da tela de conclusão (o relógio já está congelado).
- **Tela de conclusão:** mostra o **aproveitamento** (fontes + tempo + encontros) e, com os encontros desligados, o texto "máximo possível 75%". Configurações: interruptor "Encontros de aprendizado" com o aviso dos 75%.
- **Caderno de campo** (`js/encontros/caderno.js`): folha de caderno com 6 abas por tema, fichas dos conceitos já vistos (com fonte e selos de domínio de 0 a 4) e cartões trancados para o que ainda não apareceu; abre pelo menu e pela pausa; Esc fecha.
- **Testes:** `tests/09-encontros-jogo.test.mjs` (8 testes no Chromium: pontos determinísticos e alcançáveis, relógio parado, Esc, cadeia com 40%, gatilho do Geiger, missão 1 completa com encontros, encontros desligados com teto de 75%, configurações e caderno). O robô das missões foi movido para `tests/helpers/robo.mjs`; os testes antigos de conclusão de missão rodam com os encontros desligados (`semEncontros`), e o 09 cobre o fluxo com encontros ligados na missão 1.
- Arquivado: `archive/2026-10-14_pre-encontros-ui`.
- **Limites declarados:** a aparência foi verificada por capturas de tela no Chromium (desktop e celular 390x844), não em aparelhos reais; `?turma=` e o modo professor continuam fora; o aproveitamento ainda não é gravado por missão (só aparece na tela final).

### 2026-10-14 — Etapas 5d-3 e 5d-4: conferência das perguntas nas fontes e revisão crítica

- **Pedido:** seguir para as próximas etapas. Observação sobre o método: esta rodada rodou no modelo configurado da sessão (Sonnet), não no maior; o que exigiria julgamento de especialista fica sinalizado abaixo.
- **Auditoria das 55 perguntas contra o banco de referências** (cada pergunta e explicação lidas ao lado dos fatos citados) e **releitura direta em páginas originais** dos itens de maior risco. Detalhes e trechos em `docs/referencias-5c/busca/agente-D-5d3.md`. Limite declarado: a ferramenta de leitura devolve extrações feitas por um modelo pequeno, não o HTML nem os PDFs.
- **Confirmados sem divergência:** banana (EPA, 0,01 mrem = 0,1 µSv), limiar de 1 Sv e radônio (OMS 2023), 112.000 monitorados e 249 contaminados e "brilho azul" (AIEA 1988), Fukushima sem mortes por radiação aguda (OMS), Lia (três moradores juntando lenha, AIEA 2014).
- **Correções feitas:**
  1. **N06-3:** a pergunta dizia que o relatório de Goiânia registra "passar pó de césio na pele"; essa afirmação não estava em nenhuma fonte lida. Reescrita como cenário hipotético (pó de césio-137 cai sobre a pele e a roupa), sem atribuir ao relatório.
  2. **N13-3 (fonte órfã):** estava ligada a um fato que não definia o termo. Definição conferida na AIEA (TECDOC-1388, seção 1.5, p. 7; confere com o ICRPaedia, que cita o Glossário de Segurança da AIEA de 2016).
  3. **N06-2 (90% da roupa):** a porcentagem está na página de perguntas frequentes do CDC, não na de "causas"; a citação aponta agora para a página certa.
  4. **N03-1:** "Em geral, temperatura e pressão não mudam a meia-vida" (a fonte do NRC faz ressalva para a forma química em alguns nuclídeos).
  5. **N07-3 e N08-1:** a explicação "cai bastante" virou "dobrar a distância divide a taxa por quatro (fonte pontual)", com a fonte do fator 4.
  6. **N08-3:** o enunciado agora diz "fonte gama pontual" (a lei de 1/d² vale para esse caso).
  7. **N11-2:** a pergunta restringe-se a **efeitos imediatos** (antes, "só o total importa" podia ser defendido para risco de câncer).
  8. **N12-1 e N12-3:** ALARA com a definição do 10 CFR 20.1003; "dose efetiva" no limite de 1 mSv.
- **Acrescentadas 5 perguntas de alternativas e de fato (total 60):** 1 Sv = 100 rem (N05-4), limiar da síndrome aguda (N11-3), limite de trabalhadores com média em 5 anos, em cálculo (N12-4, V+C), fonte órfã parece item curioso (N13-4), metade dos pacientes com câncer faz radioterapia (N14-3).
- **Revisão crítica (5d-4):** testes novos de robustez (15 encontros com respostas, pulos e teclas aleatórios; reiniciar ou sair no meio de um encontro; apagar o caderno). Adicionado em Configurações o botão **"Apagar o progresso do caderno"** (dois cliques), pensado para computadores compartilhados em sala de aula. O teste de IDs de fatos agora exige o cabeçalho exato no banco de referências.
- **Pendências honestas:** (a) a redação em PT/EN foi conferida contra fonte, mas uma **revisão de especialista** sobre a adequação didática e a tradução continua recomendável antes de uso em turmas; (b) os níveis 3 dos nós de história e vários níveis 1 de uma só pergunta continuam escassos (a cadeia de reforço cai no pré-requisito ou numa pergunta do mesmo nível); (c) fatos ainda sem fonte lida (atividade do Co-60 de Mayapuri, fundo natural brasileiro, "Poisson" em fonte oficial) seguem fora do jogo; (d) o chute em perguntas Mito x Fato (50%) infla o crédito, mitigado pelas novas perguntas de alternativas.
- Arquivado: `archive/2026-10-14_pre-5d3`.

### 2026-10-14 — Etapa 5d-5 (escala de confiança, perguntas novas, fontes) e cofre provisório (5e, parte 1)

- **Pedido:** melhorar os 3 níveis; pesquisar a atividade do Co-60 de Mayapuri, o fundo do Geiger e o Poisson; escala de confiança no Mito x Fato; depois o cofre.
- **Mayapuri (corrige "NÃO ENCONTRADO"):** AERB, Gamma Cell GC 220 (AECL), 147,186 TBq (3978 Ci) em 1969 e 688,2 GBq (18,6 Ci) em abril de 2010; meia-vida do Co-60 = 5,27 anos (CDC). A conta de decaimento confere (~0,71 TBq previsto). Era irradiador de pesquisa, não de radioterapia. O "~60 TBq" de versões anteriores não tem fonte. Detalhes: `V5D3.5`.
- **Poisson e fundo:** `V5D3.6` e `V5D3.7`. A faixa típica de fundo é 5 a 60 cpm (0,08 a 1 cps); o jogo usa 5 cps (escala didática [H]). **Decisão pendente do Arnaldo:** recalibrar para ~0,5 a 1 cps muda limiares e testes.
- **Escala de confiança (Mito x Fato):** 5 botões (certeza mito, quase certeza mito, não sei, quase certeza fato, certeza fato; teclas 1 a 5, M e F valem como certeza). Acerto com "quase" vale 70% do crédito; erro com certeza total reduz pela metade o crédito das chances seguintes; "não sei" não tem penalidade.
- **Banco:** de 60 para 74 perguntas (níveis 3 em N01, N02, N04, N05, N07, N10, N11, E-MAY, E-RAD; mais níveis 1 e 2).
- **Cofre provisório:** ao fim da missão, uma pergunta de blindagem por tipo de radiação das fontes. Pesos: fontes 55 + tempo 20 + encontros 15 + cofre 10; desligado = teto de 75%. Será substituído pelo cofre interativo em prateleiras (ideia do Arnaldo), a desenhar.
- Testes: 115/115. Arquivado: `archive/2026-10-14_pre-5e`.
- **Emissões por isótopo (V5D3.8, LNHB/DDEP)** e **prompt para o design do cofre interativo** (Opus): `docs/prompt-cofre-opus.md`. Decisão do Arnaldo: 3 prateleiras (alfa, beta, gama); a fonte vai para a radiação mais penetrante com rendimento significativo; ficha clicável; visual no nível do caderno.

### 2026-10-14 — Etapa 5e, cofre interativo: leitura e plano (nada em `current/` alterado)

- **Pedido:** desenhar o cofre interativo em prateleiras (alfa, beta, gama) que substitui o cofre provisório; começar
  lendo o código e os documentos e apresentar plano e respostas às questões de projeto 1 a 5.
- **Feito:** `docs/cofre-5e-plano.md` (regra de prateleira, coerência com o Geiger, mecânica, ficha, escala, visual, decisões).
- **Achados:** só 6 isótopos são sorteados nas missões (Am-241, Cs-137, Ra-226, I-131, Sr-90, Co-60); o Ra-226 (M3) não
  está em V5D3.8; com a regra proposta a prateleira alfa quase não é usada (Am-241 cai em gama); I-131 e Am-241 têm, no
  Geiger, um só tipo que não corresponde à prateleira; na M5 só o Sr-90 é do acidente real.
- **Aguarda decisões D1 a D5** do plano. Archive e testes inalterados.
- **Revisão (observação do Arnaldo):** Am-241 fica na prateleira alfa; limiar da regra passa de 10 para 50 por 100 decaimentos (seção 2 do plano); D3 deixa de ser necessária.
- **Revisão 2:** Geiger alfa de Am-241 e Ra-226 aceito como coerente (fundo de 5 cps esconde gama fraca a distância); Ra-226 → alfa contando só as emissões do próprio nuclídeo (D2 resolvida); incoerência restante: I-131.
- **Revisão 3 (D5):** I-131 com beta + gama no Geiger, mostrado ao aluno; emissão dominante (alfa no Am-241 e no Ra-226) fica sozinha. A confirmar: mesmo tratamento para Cs-137 e Co-60.
- **Revisão 4:** Cs-137 e Co-60 também beta + gama (aprovado); D4 aprovada; requisito: nenhuma fonte impossível de identificar (testes de detectabilidade e distinção na etapa F). Ordem: A, B, C, F, D, E.

### 2026-10-14 — Etapa 5e-A: mockup visual do cofre (nada em `current/` alterado)

- **Pedido:** Arnaldo aprovou Cs-137 e Co-60 com beta + gama e a mecânica D4; lembrou que nenhuma fonte pode ficar impossível de
  identificar (requisito registrado no plano, revisão 4).
- **Feito:** `docs/cofre-mockup/index.html` (HTML estático, abre direto no navegador, dados da missão 5) e capturas em
  `docs/cofre-mockup/capturas/` (desktop 1280 px e celular 390 px, Chromium headless). Interação completa: selecionar, guardar
  (clique, toque, arrastar ou teclas 1/2/3), retorno imediato, crédito 1 / 0,4 / 0, blindagem por prateleira, ficha com barras de
  emissão e tabela "o que o seu Geiger mostrou", resumo ao lacrar.
- **Verificado:** fluxo completo por script no Chromium, sem erro de JavaScript (só as fontes do Google não carregam no ambiente de teste).
- **Não verificado:** aparelhos reais; leitor de tela; versão em inglês (fica para a etapa D). A tabela do Geiger é prévia do modelo da etapa F.

### 2026-10-14 — Etapa 5e-B: tabela de emissões com fonte

- **Pedido:** mockup aprovado; seguir para os dados.
- **Arquivado:** `current/` em `archive/2026-10-14_pre-cofre` (conferido com `diff -r`); removida a pasta mais antiga
  `archive/2026-10-14_pre-encontros` (o .zip original continua).
- **Novo `js/data/emissoes.js`:** linhas de emissão (tipo, energia, rendimento por 100 decaimentos) dos 11 isótopos do jogo
  (os 10 de `isotopes.js` e o Ra-226 da missão 3), com a fonte de cada um; filho Y-90 do Sr-90 como informação;
  funções `rendimentoPorTipo` e `linhaPrincipal`. Nenhum outro arquivo de `current/` mudou; o jogo ainda não usa a tabela.
- **Ra-226 (novo, V5E.1):** LNHB (Chisté e Bé, 2007): alfa 4784,34 keV 94,038% e 4601 keV 5,950%; gama 186,211 keV 3,555%.
  Prateleira alfa pela regra.
- **Testes:** novo `tests/10-emissoes.test.mjs` (7): cobertura de todos os isótopos, linhas válidas, alfa + beta ≤ 100 por
  decaimento, energias iguais às de `isotopes.js` (até 3%), alcance beta igual ao Katz-Penfold na Emax do LNHB (até 2%),
  rendimentos que decidem as prateleiras, registro das fontes. O script `npm test` agora usa `[0-9]*.test.mjs` (o padrão
  antigo `0*` não pegaria o arquivo 10). **Suíte: 122 testes, todos passam** (rodada numa cópia idêntica no Chromium headless
  da nuvem, porque a pasta `tests/` do seu disco não tem `node_modules`).
- **Limite:** os valores do LNHB foram lidos por extração de PDF; casas decimais devem ser conferidas no PDF antes de citar fora do jogo.

### 2026-10-14 — Etapa 5e-C: lógica pura do cofre (`cofre.js`)

- **Pedido:** "pode continuar" (etapa C, Sonnet, esforço médio).
- **Arquivo:** não arquivei de novo: `current/` difere de `archive/2026-10-14_pre-cofre` só pelo `js/data/emissoes.js` (conferido com `diff -rq`), então
  aquela cópia continua sendo um retorno válido e evitei apagar outra versão antiga à toa.
- **`js/encontros/cofre.js` (parte nova, sem DOM e sem Phaser):** `prateleiraDe` (tipo mais penetrante com rendimento ≥ 50 por 100, só o próprio nuclídeo),
  `motivoDoErro`, `itensDaMissao`, estado imutável (`novoCofre`, `guardar`, `escolherBlindagem`, `completo`, `creditos`, `nota`), `registros` (pseudo-encontros
  para o caderno: N04 por isótopo, N09 por blindagem), `espessuraChumbo` (camada semirredutora e espessura para 1/1000, feixe estreito, sem buildup),
  textos PT/EN (`explicarPrateleira`, `dicaDoErro`, `explicarBlindagem`). A parte do cofre provisório continua no fim do arquivo, marcada, porque
  `gerenciador.js` ainda a usa; sai na etapa D.
- **Regras fechadas:** crédito 1 na 1ª tentativa, 0,4 na 2ª, e depois de dois erros o cofre guarda e explica (0); só se escolhe a blindagem de uma
  prateleira que já recebeu fonte; créditos de blindagem [H] (alfa: papel 1, acrílico ou alumínio 0,7, chumbo ou concreto 0,4; beta: acrílico ou alumínio 1, chumbo e
  concreto 0,4, papel 0; gama: chumbo ou concreto 1, o resto 0); nota = média dos créditos de itens e blindagens, item não feito = 0, e entra em
  `aproveitamento({cofre: creditos(estado)})` (10 pontos).
- **Fonte nova (NIST XCOM, chumbo, Z = 82; consulta de 14/10/2026):** μ/ρ de 30 keV a 1,5 MeV com a borda K (88,0045 keV) tratada em duas faixas. Fecha o [P] do
  Pb a 60 keV: 5,021 cm²/g. Resultados (feixe estreito, energia efetiva, aproximação): Am-241 camada semirredutora ≈ 0,12 mm e 1/1000 em ≈ 1,2 mm; I-131 ≈ 2,2 mm e
  ≈ 21 mm; Cs-137 ≈ 5,5 mm e ≈ 55 mm; Co-60 ≈ 10 mm e ≈ 104 mm.
- **Conferências nos testes:** só 11 isótopos, prateleiras por missão iguais ao plano (M1 α γ; M2 γ; M3 α; M4 e M8 β γ; M5 α β γ; M6 e M7 γ);
  qualquer limiar de 36 a 85 dá o mesmo resultado e 35 move o Am-241 para gama; no máximo 12 interações mínimas por missão; as porcentagens do texto
  ("92% a 96%" em 3 mm de alumínio, "94% a 96%" em 5 mm de acrílico) são recalculadas com `shields.js` e `geiger.js` para Cs-137, Co-60 e I-131
  e só valem para essas fontes (o teste falha se uma missão passar a sortear outra fonte gama).
- **Testes:** novo `tests/11-cofre.test.mjs` (17). **Suíte completa: 139, todos passam** (rodada numa cópia no Chromium da nuvem). Quatro mutações manuais
  (limiar 30, crédito 0,5, ordem de penetração invertida, borda K apagada) foram detectadas.
- **Limites:** a espessura de chumbo é feixe estreito sem acúmulo (buildup): numa blindagem real seria maior; Ir-192 e Tc-99m não aparecem em nenhuma missão.
  Pb em 59,5 keV vem da interpolação log-log entre 50 e 60 keV (NIST), não de uma linha tabelada nesse valor.

### Pendências para confirmação do Arnaldo
- (Aceito por Arnaldo em 13/10/2026, "pode manter tudo do jeito como ficou") O cabeçalho de autoria saiu de `game.js` e está agora, com o
  mesmo texto, no topo de `current/js/main.js`. Um teste
  (`01-dados`) falha se o texto desaparecer de todos os `.js`.
