export const pt = {
    agenciaAria: 'Agência', equipeCampoAria: 'Equipe em campo', incertezaAria: 'incerteza',
        // Menu
        newGame: "Novo Jogo",
        continue: "Continuar",
        missions: "Missões",
        modoProfessor: "Missões avulsas (professor)",
        howToPlay: "Como Jogar",
        settings: "Configurações",
        back: "Voltar",
        selectMission: "Selecionar Missão",
        tabMissoes: "Missões",
        tabInvestigacoes: "Investigações",
        
        // Story
        continueStory: "Continuar →",
        
        // Game HUD
        score: "Pontos",
        
        // Modals
        identifySource: "Identificar a Fonte",
        selectIsotope: "Selecione o isótopo baseado nas suas leituras:",
        ok: "OK",
        cancel: "Cancelar",
        paused: "PAUSADO",
        resume: "Continuar",
        restart: "Reiniciar Missão",
        quitMission: "Voltar ao Menu",
        missionComplete: "MISSÃO COMPLETA!",
        timeElapsed: "Tempo",
        accuracy: "Precisão",
        scoreLabel: "Pontuação",
        nextMission: "Próxima Missão",
        backToBase: "Voltar à Base",
        sourcesCollected: "Fontes coletadas",
        replay: "Repetir",
        backToMenu: "Menu",
        
        // How to Play
        howToPlayTitle: "Como Jogar",
        movement: "Movimento",
        movementDesc: "Use as setas ou WASD para mover. Segure SHIFT para correr (usa stamina).",
        geiger: "Contador Geiger",
        geigerDesc: "Pressione G para ligar o contador Geiger. Ele detecta radiação ionizante através de ionização de gás - cada 'clique' representa uma detecção!",
        shields: "Blindagens",
        shieldsDesc: "Pressione 1-4 para trocar blindagem (1 = nenhuma, 4 = chumbo); em missão com equipe, 7, 8, 9 e 0 trocam o cientista em campo. Diferentes tipos de radiação são bloqueados por diferentes materiais:",
        alphaDesc: "α (Alfa): Núcleos de hélio pesados. Bloqueados por poucos centímetros de ar, uma folha de papel ou a camada externa da pele. Perigosos se inalados ou ingeridos!",
        betaDesc: "β (Beta): Elétrons rápidos. Reduzidos por alumínio e acrílico; só os betas de baixa energia são totalmente bloqueados por alguns mm.",
        gammaDesc: "γ (Gama): Fótons de alta energia. Requer materiais densos como chumbo para atenuação significativa.",
        identify: "Identificação",
        identifyDesc: "Aproxime-se e pressione Q para identificar. Compare leituras COM e SEM blindagem para determinar o tipo!",
        
        // Educational tips
        eduTipTitle: "📚 Você sabia?",
        
        // Settings
        settingsTitle: "Configurações",
        musicOn: "Música ligada",
        soundOn: "Efeitos sonoros ligados",
        soundVolume: "Volume dos Sons",
        musicVolume: "Volume da Música",
        showHints: "Mostrar dicas educativas",
        screenShake: "Efeitos de tremor de tela",
        
        // Notifications
        tooFar: "Muito longe da fonte! Aproxime-se.",
        lowSignal: "Sinal muito baixo. Aproxime-se e verifique suas leituras.",
        wrongIsotope: "Isótopo errado! Verifique suas leituras com blindagem novamente.",
        correctIsotope: "Correto! Fonte identificada!",
        allFound: "Todas as fontes encontradas!",
        
        // Educational hints by type
        alphaHint: "Partículas α são NÚCLEOS DE HÉLIO (2 prótons + 2 nêutrons). Muito ionizantes, mas não atravessam nem uma folha de papel!",
        betaHint: "Partículas β são ELÉTRONS DE ALTA VELOCIDADE. Atravessam a pele, mas as de baixa energia são paradas por alguns mm de alumínio; as de alta energia (Sr-90/Y-90) só são reduzidas.",
        gammaHint: "Raios γ são FÓTONS DE ALTA ENERGIA. Requerem materiais densos como chumbo - mesmo assim, só atenuados, nunca totalmente parados!",
        betaGammaHint: "Esta fonte emite {0}. Meça sem escudo e depois com uma placa de alumínio ou acrílico: o que desaparece é a beta. Depois meça com chumbo: o que ainda sobra é a gama. Se, com o chumbo, a leitura cai até o fundo (cerca de 5 cps), não há gama: era só beta (a beta muito energética, como a do Y-90 do Sr-90, atravessa parte das placas finas). Entre fontes com beta e gama, a de gama mais energética perde menos no chumbo. Compare as leituras.",
        emissionsLabel: "Emissões",
        radiumHint: "💡 Tinta com rádio era luminosa (o rádio excita um fósforo, sulfeto de zinco). Procure potes de tinta e pincéis contaminados. Chegue BEM PERTO: no jogo o alfa só é medido a menos de 50 cm (na vida real, são poucos centímetros).",
        pularAcademia: "Já conheço o básico: pular a Academia",
        inventory: "Inventário",
        corAzul: "azul",
        corVermelha: "vermelha",
        chavePegou: "🔑 Você pegou a chave {cor}!",
        portaTrancada: "🔒 Porta trancada: procure a chave {cor}.",
        portaAberta: "🔓 Porta aberta com a chave {cor}!",
        assistAlfa: "🔧 Detector mais sensível: o alcance do alfa aumentou para 75 cm. Continue varrendo os móveis!",
        assistAlfaFim: "Assistência do detector (alfa) ativada",
        
        // NEW: Real accident-based missions
        tutorialTitle: "Primeiros passos",
        tutorialDesc: "Três fontes, três lições rápidas: Geiger, blindagem e proteção. Cerca de 5 minutos.",
        tutorialStory: "Bem-vindo à Agência Chronos. Você já está com o contador Geiger na mão e há três fontes escondidas nesta sala. Ligue o Geiger (G), ande devagar e siga os cliques. Cada fonte identificada traz uma lição de poucos segundos.",
        mission1Title: "Academia do Caçador",
        mission1Desc: "Laboratório de 8 salas com 5 fontes escondidas (salas 4 a 8). Aprenda o básico de detecção no seu ritmo (pode ser pulada).",
        mission2Title: "Ferro Velho de Goiânia",
        mission2Desc: "1987, Brasil. Encontre fragmentos de Cs-137 espalhados no ferro velho.",
        mission3Title: "Radium Girls",
        mission3Desc: "Fábrica de relógios dos anos 1920. Ra-226 era usado para pintar mostradores luminosos.",
        mission4Title: "Exclusão de Chernobyl",
        mission4Desc: "1986, URSS. O pior desastre nuclear. Fontes próximas ao reator apenas.",
        mission5Title: "Caso Lia",
        mission5Desc: "Geórgia, 2001. Fontes órfãs encontradas na floresta por lenhadores.",
        
        // Additional UI
        findSources: "Encontrar {0} fontes",
        mission: "Missão",
        
        // NEW: Educational stories based on real accidents
        story1: `ACADEMIA DO CAÇADOR - UNIVERSIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bem-vindo ao treinamento de Caçador de Radiação. Antes de ir a campo, você pratica num laboratório universitário de radioisótopos, onde nada é segredo e tudo é medido.

📚 LIÇÃO: como funciona um contador Geiger

O tubo Geiger-Müller guarda um gás que se ioniza quando uma partícula passa. Cada ionização vira um clique: quanto mais radiação, mais cliques por segundo (cps).

CONCEITOS-CHAVE
• Radiação de fundo: sempre existe (raios cósmicos, rochas, o próprio ar). No jogo ela vale cerca de 5 cps; num detector real o valor depende da sonda.
• Inverso do quadrado: ao dobrar a distância de uma fonte pequena, a taxa cai para um quarto.
• Os cliques são aleatórios (processo de Poisson). Por isso o painel mostra a média dos últimos 3 s e a incerteza (±): fonte fraca exige paciência.
• Alfa só é medido com a sonda quase encostada. Beta alcança alguns metros. Gama atravessa quase tudo.
• A sonda enxerga melhor à frente: aponte-a para o que você quer medir.

Sua missão: percorrer as 8 salas do laboratório e, em cada uma, ler uma lição curta. As 5 fontes radioativas ficam nas salas 4 a 8. As salas 4 e 8 estão trancadas e escondidas: procure as chaves coloridas. Compare a leitura COM e SEM blindagem para descobrir o tipo de radiação.

Fonte: parâmetros físicos do jogo (NIST XCOM; tabelas do LNHB).`,

        story2: `GOIÂNIA, BRASIL - SETEMBRO DE 1987
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UMA HISTÓRIA REAL que mudou a segurança radiológica no mundo.

Em 13 de setembro de 1987, duas pessoas entraram na clínica abandonada do antigo Instituto Goiano de Radioterapia e retiraram da unidade de radioterapia o conjunto da fonte de césio-137, achando que valia como sucata. A peça foi vendida a um ferro-velho. Em 18 de setembro, a janela da cápsula foi perfurada e o cloreto de césio em pó se espalhou: 93 g, com 50,9 TBq de atividade.

📚 LIÇÃO: como a contaminação se espalhou
• O pó passou de mão em mão e chegou a várias casas.
• Uma menina de seis anos comeu com as mãos contaminadas pelo pó. Ela morreu: dose estimada de 6 Gy.
• Quatro pessoas morreram em cerca de um mês.

📊 O ACIDENTE EM NÚMEROS (relatório da AIEA, 1988)
• ~112.000 pessoas monitoradas; 249 contaminadas por dentro ou por fora
• 85 casas com contaminação significativa; 200 pessoas retiradas de 41 delas; 7 casas demolidas
• 3.500 m³ de rejeito, guardado num depósito provisório a 20 km da cidade

🎮 NO JOGO: os 5 fragmentos de césio-137 estão espalhados no ferro-velho. Emitem beta e GAMA: a beta cai com alguns mm de alumínio, mas só um material denso, como o chumbo, atenua bem a gama.

Fonte: AIEA, "The Radiological Accident in Goiânia" (1988).`,

        story3: `FÁBRICA DE MOSTRADORES - ESTADOS UNIDOS, DÉCADAS DE 1910-1920
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

As "RADIUM GIRLS": moças que pintavam mostradores de relógio com tinta luminosa à base de rádio.

Na fábrica da U.S. Radium, em Orange (Nova Jersey), as pintoras ajeitavam a ponta do pincel com os lábios. Grace Fryer, que entrou em 1917, calculava ter feito isso cerca de seis vezes por mostrador. Em 1927 ela e outras quatro mulheres processaram a empresa; o acordo, em junho de 1928, pagou 10 mil dólares a cada uma, mais uma renda anual de 600 dólares enquanto vivessem.

📚 LIÇÃO: rádio-226 (Ra-226)
• Meia-vida: 1.600 anos
• Emite partículas alfa de 4,78 MeV
• Imita o cálcio: deposita-se nos OSSOS, onde a radiação alfa fica dentro do tecido
• Algumas fábricas passaram a usar também mesotório (Ra-228, meia-vida de 5,8 anos) por volta de 1919; o jogo simplifica para Ra-226
• A literatura médica da época já falava em "necrose por rádio (mesotório)" em 1925

⚠️ DESAFIO DO ALFA
• No ar, a alfa percorre só poucos centímetros: é preciso encostar a sonda
• No jogo o alcance foi ampliado para cerca de 50 cm, para ficar jogável
• Qualquer anteparo, até uma folha, barra a alfa

🎮 NO JOGO: todas as fontes são rádio-226 em tinta contaminada. Procure bancadas, potes e pincéis.

Fonte: environmentalhistory.org (resumo do caso); USTUR/Washington State University, "The Saga of the Radium Dial Painters" (Ra-226/Ra-228).`,

        story4: `CHERNOBYL, URSS - 26 DE ABRIL DE 1986
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O reator 4 da usina de Chernobyl explodiu durante um experimento com a alimentação elétrica independente da usina, e o incêndio durou dias. As liberações importantes continuaram por dez dias. Segundo o INSAG-7 (AIEA, 1992), a causa principal foi o comportamento físico instável do reator, agravado por mudanças não aprovadas no procedimento do teste e por uma cultura de segurança deficiente; o relatório admite que não se sabe com certeza o que deu início ao aumento de potência.

Cerca de 50.000 moradores de Pripyat saíram em 40 horas. Ao todo, 116.000 pessoas foram retiradas da área mais afetada na primavera e no verão de 1986.

📚 LIÇÃO: os isótopos do reator
• Iodo-131: meia-vida de 8 dias, acumula-se na tireoide; mais de 4.000 casos de câncer de tireoide em quem era criança ou adolescente na época (diagnosticados até 2002)
• Césio-137: meia-vida de 30 anos, contamina o solo por décadas
• Estrôncio-90: meia-vida de 28,8 anos, imita o cálcio; importa mais perto do reator
• Entre os trabalhadores de emergência, 134 tiveram síndrome aguda de radiação e 28 morreram em 1986

🎮 NO JOGO: as fontes se concentram perto do reator danificado. O cobalto-60 que existia nesta missão foi retirado: não é um dos radionuclídeos principais do acidente.

Fonte: AIEA, INSAG-7 (1992); Fórum Chernobyl (AIEA/OMS/PNUD), 2005.`,

        story5: `LIA, GEÓRGIA - DEZEMBRO DE 2001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Em 2 de dezembro de 2001, três homens da vila de Lia foram buscar lenha numa floresta nas montanhas, abaixo da represa de Enguri. Acharam dois cilindros metálicos e os levaram para o acampamento: serviram de aquecedor durante a noite, a cerca de 10 cm das costas deles.

Eram núcleos de geradores termoelétricos de radioisótopos (RTG, modelo Beta-M, fabricados em 1983), movidos a estrôncio-90, com cerca de 1.300 TBq cada (1.480 TBq de projeto). A 1 m, a taxa de dose chegava a cerca de 1 Sv/h. Construídos na União Soviética, ficaram sem supervisão nem controle.

📚 LIÇÃO: fontes órfãs
• Sr-90: emissor beta; o calor vem do próprio decaimento
• Os três foram internados em 22 de dezembro, em Zugdidi, com síndrome aguda de radiação, e transferidos no dia seguinte para Tbilisi
• A recuperação foi feita em 2 e 3 de fevereiro de 2002 por uma operação coordenada pela AIEA, com um contêiner blindado de chumbo (cerca de 25 cm de espessura; o relatório cita também 27 cm)
• Um dos três faleceu em 13 de maio de 2004

🎮 NO JOGO: a área tem outras fontes órfãs fictícias (Cs-137, Co-60 e Am-241), para treinar todos os tipos de radiação.

Fonte: AIEA, "The Radiological Accident in Lia, Georgia" (2014).`,

        story6: `ZARAGOZA, ESPANHA - DEZEMBRO DE 1990
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O que de fato aconteceu: no Hospital Clínico Universitário de Zaragoza, um acelerador linear de elétrons (modelo Sagittaire) quebrou em 5 de dezembro. O técnico de manutenção deixou o equipamento em modo manual, com os elétrons sempre a 36 MeV, qualquer que fosse a energia escolhida. Os tratamentos recomeçaram em 10 de dezembro e foram suspensos em 20 de dezembro. Foram 27 pacientes tratados nesse período; segundo a AIEA, 15 morreram por causa da sobredose e, em outros 2, a radiação foi um fator importante.

📚 LIÇÃO: acelerador não é fonte radioativa
• O acelerador só emite radiação quando está ligado: nenhum isótopo estava envolvido
• A causa foi um erro de manutenção seguido de procedimentos não cumpridos, segundo o Conselho de Segurança Nuclear espanhol (CSN)
• Nenhum trabalhador nem pessoa do público foi afetado

🎮 NO JOGO (ficção): corre o boato de que o hospital perdeu uma fonte radioativa, como em Goiânia. Você faz um levantamento com o Geiger e acha fontes de MEDICINA NUCLEAR (radiofármacos de exame, como Tc-99m e I-131), não de radioterapia. Elas não são a causa do acidente. Depois, uma investigação com a equipe do hospital resolve o mistério.

Fonte: CSN (Espanha), monografia sobre o acidente (2022); AIEA, Radiation Protection of Patients (equipamento e número de pacientes).`,

        story7: `MAYAPURI, NOVA DÉLHI, ÍNDIA - ABRIL DE 2010
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Um irradiador gama do departamento de Química da Universidade de Délhi, adquirido do Canadá no fim dos anos 1960 e parado desde 1985, foi vendido como sucata. Num ferro-velho de Mayapuri, o equipamento foi aberto e a blindagem de chumbo, cortada.

📚 LIÇÃO: cobalto-60
• Meia-vida de 5,27 anos; emite gama de 1,17 e 1,33 MeV
• Segundo o governo indiano, o equipamento tinha 16 canetas (pencils) de Co-60, cada uma com 7 pastilhas: 112 pastilhas, todas recuperadas depois
• Sete pessoas foram internadas com lesões por radiação; uma morreu em 26 de abril de 2010
• A recuperação das fontes aconteceu entre 8 e 15 de abril

🎮 NO JOGO: as fontes são fragmentos de Co-60 espalhados no ferro-velho. O alcance e a atividade são escolhas didáticas, não os valores do acidente.

Fonte: declaração do governo da Índia no Parlamento (Lok Sabha); AERB e registro INIS/AIEA; artigo médico sobre o caso (2013). Atividade do Co-60 (slides da AERB): 147,186 TBq em 1969 e cerca de 688 GBq em abril de 2010.`,

        story8: `FUKUSHIMA DAIICHI, JAPÃO - 11 DE MARÇO DE 2011
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O terremoto e o tsunami de Tōhoku atingiram a usina. Os reatores 1, 2 e 3 sofreram fusão do núcleo; houve explosões de hidrogênio nos prédios dos reatores 1, 3 e 4.

📚 LIÇÃO: o legado radiológico
• Nível 7 na escala INES, o mesmo de Chernobyl
• Principais radionuclídeos liberados: iodo-131 e césio-137
• Cerca de 110.000 pessoas foram retiradas por causa da situação radiológica (no total, cerca de 165.000 deslocadas na província); no fim de 2020, cerca de 37.000 ainda não tinham voltado
• O descomissionamento é estimado em 30 a 40 anos

🎮 NO JOGO: missão final, com vários isótopos e leituras fortes. O cobalto-60 foi retirado desta missão: não é um dos principais isótopos do acidente.

Fonte: BASE (Alemanha), "Fukushima ten years later"; AIEA, Fukushima Daiichi Accident Report (2015).`,

        // New mission titles and descriptions
        mission6Title: "Zaragoza",
        mission6Desc: "1990, Espanha. Acidente real com acelerador médico, sem isótopo. Aqui, um levantamento fictício no hospital: o Geiger acha fontes de exames (medicina nuclear), e uma investigação depois resolve o mistério.",
        mission7Title: "Ferro Velho Mayapuri",
        mission7Desc: "2010, Índia. Irradiador de Co-60 desmontado por trabalhadores desavisados.",
        mission8Title: "Zona Fukushima",
        mission8Desc: "2011, Japão. Triplo derretimento - o desafio definitivo.",

        // Blindagens, conclusão, tempo-meta, toque
        shieldNone: "Sem blindagem",
        shieldAlu: "Alumínio (3 mm)",
        shieldAcr: "Acrílico (5 mm)",
        shieldPb: "Chumbo (1 cm)",
        completeExceptional: "Trabalho excepcional, Caçador! Você tem faro para isso.",
        completeGreat: "Muito bem! Sua leitura de radiação está cada vez mais afiada.",
        completeGood: "Bom esforço. Treinar é o que leva à precisão!",
        completeBase: "Missão cumprida. Continue treinando para melhorar a precisão.",
        perfectHunter: "Caçador Perfeito!",
        achievementUnlocked: "Conquista desbloqueada!",
        timeGoal: "Meta",
        timeGoalMet: "Dentro da meta de tempo",
        timeGoalMissed: "Acima da meta de tempo",
        touchRun: "Correr",
        touchGeiger: "Geiger",
        touchIdentify: "Identificar",
        pauseBtn: "Pausar",
        // Notas de campo (etapa 4): aparecem ao identificar a 1ª, 2ª, 3ª e 4ª fonte
        fact1_1: "Parabéns: você achou a primeira fonte. Repare como a leitura sobe suavemente com a aproximação: é o inverso do quadrado.",
        fact1_2: "Um bom roteiro: ligue o Geiger, ande devagar, espere a média de 3 s estabilizar, e só então compare COM e SEM blindagem.",
        fact1_3: "Alfa some com qualquer blindagem; beta é reduzido ou barrado por alumínio e acrílico; gama quase não muda, só o chumbo derruba bastante.",
        fact1_4: "Atividade é o número de decaimentos por segundo (becquerel). O que o detector conta é só uma fração deles: depende da distância, da blindagem e do tipo de radiação.",
        fact2_1: "Cs-137 emite beta e gama: o gama de 662 keV (na verdade emitido pelo Ba-137m, seu filho) é o que o Geiger detecta de longe. Meia-vida de 30,018 anos (tabela LNHB).",
        fact2_2: "A dose estimada para a menina de seis anos foi de 6 Gy; para outras vítimas fatais, entre 4,5 e 5,7 Gy (AIEA, 1988). Gray (Gy) mede energia absorvida por quilo de tecido.",
        fact2_3: "Se aquela fonte estivesse intacta hoje, em 2026, restariam cerca de 21 TBq dos 50,9 TBq originais: perde-se metade a cada 30 anos.",
        fact2_4: "Um físico local foi quem primeiro avaliou a extensão do acidente, medindo. Sem medir, ninguém sabia o que estava contaminado.",
        fact3_1: "Já em 1925 a literatura médica descrevia a necrose causada por rádio: Hoffman (JAMA) relatou cerca de 5 mortes e 12 casos vivos entre pintoras de mostradores.",
        fact3_2: "A radiação alfa de 4,78 MeV tem alcance de poucos centímetros no ar, mas dentro dos ossos ela deposita toda a energia em tecido vivo.",
        fact3_3: "Em 1929 o Departamento do Trabalho dos EUA proibiu a prática de afinar o pincel com a boca. Antes, em 20 de dezembro de 1928, o Cirurgião-Geral dos EUA reuniu uma conferência que criou dois comitês: um para investigar as condições de trabalho, outro para recomendar medidas de proteção. Em declaração à imprensa, Marie Curie considerou imperativo mudar o método de usar o rádio.",
        fact3_4: "Marie Curie declarou à imprensa que não havia meio de destruir o rádio depois que ele entra no corpo. Com meia-vida de 1.600 anos, a contaminação interna não diminui na escala de uma vida.",
        fact4_1: "Em Chernobyl, o iodo radioativo (I-131, meia-vida de 8 dias) está associado aos mais de 4.000 casos de câncer de tireoide em quem era jovem na época; o césio-137 (30 anos) é o que dura na paisagem.",
        fact4_2: "O estrôncio-90 (28,8 anos) imita o cálcio e se fixa nos ossos; importa principalmente perto do reator.",
        fact4_3: "A zona de exclusão tem 30 km de raio. As fontes mais fortes ficam perto do reator: vá com cuidado e use o Geiger para decidir por onde entrar.",
        fact4_4: "Dos trabalhadores de emergência, 134 tiveram síndrome aguda de radiação e 28 morreram em 1986.",
        fact5_1: "Cada núcleo do RTG tinha cerca de 1.300 TBq de Sr-90 pelo certificado (1.480 TBq de projeto): mais de 1 PBq, ou seja, mais de um milhão de bilhões de decaimentos por segundo. A 1 m, o certificado dava cerca de 1 Sv/h e as medidas no local deram cerca de 670 e 580 mSv/h.",
        fact5_2: "Sr-90 emite beta, mas também gera radiação de freamento (bremsstrahlung) no metal, que são raios X e atravessam mais que os elétrons.",
        fact5_3: "Fonte órfã é a que está fora de controle regulatório, por abandono, perda ou roubo. Nem sempre há aviso: o símbolo de radiação pode ter desaparecido.",
        fact5_4: "Dois dos homens ficaram a cerca de 10 cm dos cilindros por 1 a 1,5 h cada. O calor que eles procuravam vinha do próprio decaimento do Sr-90.",
        fact6_1: "Um acelerador de elétrons não tem isótopo: ao ser desligado, a radiação cessa. Por isso o perigo ali é a dose do tratamento, e não a contaminação.",
        fact6_2: "A falha começou num curto-circuito nos transistores que regulam o desvio do feixe; o técnico fixou a energia em 36 MeV (CSN).",
        fact6_3: "Com a energia errada, a dose aumentava cerca de 7 vezes a 7 MeV, 5 vezes a 10 MeV e 3 vezes a 13 MeV (simulação do CSN, 5/1/1991); a AIEA cita cerca de 9 vezes a 7 MeV.",
        fact6_4: "O relatório do CSN aponta erro da equipe de manutenção do fornecedor e descumprimento de procedimentos no hospital, por falta de coordenação entre os serviços.",
        fact7_1: "O irradiador veio do Canadá no fim dos anos 1960 (Parlamento e AERB dizem 1969; um artigo médico, 1968) e a autorização de operação saiu em janeiro de 1970; na Índia, uma fonte antiga assim é chamada de 'legacy'.",
        fact7_2: "O Co-60 tem meia-vida de 5,27 anos: de 1969 a 2010 (41 anos), restava cerca de 0,5% da atividade original, ainda muito perigosa.",
        fact7_3: "Segundo uma declaração do governo indiano, o aparelho estava sem uso havia mais de 15 anos (outra declaração diz mais de 20) quando foi leiloado como sucata. Uma fonte esquecida continua radioativa.",
        fact7_4: "O trabalhador que morreu, um homem, foi o que desmontou o equipamento e tocou nas fontes. A dose calculada pelo BARC foi de 3,1 Gy; a autópsia indicou choque por septicemia após exposição aguda. A AERB notificou a universidade em 29 de abril de 2010.",
        fact8_1: "Iodo-131 liberado em Fukushima superou temporariamente os limites de água potável para crianças pequenas em Tóquio (BASE).",
        fact8_2: "O relatório da AIEA (2015) foi elaborado com cerca de 180 especialistas de 42 países.",
        fact8_3: "O descomissionamento deve levar de 30 a 40 anos; vem sendo revisado por missões internacionais da AIEA desde 2013.",
        fact8_4: "Evacuar também tem custo: a AIEA observa que decisões conservadoras de proteção geraram restrições prolongadas e dificuldades.",
        fieldNote: "Nota de campo",
        encCounter: "Encontro {0} de {1}",
        encReinforce: "Ficha de reforço: uma pergunta mais simples",
        encSureMyth: "Com certeza é mito",
        encProbMyth: "Quase certeza de que é mito",
        encDunno: "Não sei",
        encProbFact: "Quase certeza de que é fato",
        encSureFact: "Com certeza é fato",
        encDunnoBack: "Sem problema: veja a resposta.",
        encMyth: "Mito",
        encFact: "Fato",
        encSkip: "Pular (conta 0% neste encontro)",
        encRight: "Certo!",
        encWrong: "Ainda não.",
        encAnswer: "Resposta",
        encSource: "Fonte",
        encContinue: "Continuar",
        encSimpler: "Tentar uma pergunta mais simples",
        encSkipped: "Encontro pulado: 0% neste encontro",
        encFullCredit: "Acertou de primeira!",
        encPartialCredit: "Acertou com a ajuda da ficha",
        encTeach: "Vamos ver as respostas juntos",
        encSolutions: "Respostas, da mais simples à original:",
        encCredit: "Crédito neste encontro: {0}%",
        encBackToField: "Voltar ao campo",
        encTheme_natureza: "Natureza",
        encTheme_decaimento: "Decaimento",
        encTheme_protecao: "Proteção",
        encTheme_dose: "Dose",
        encTheme_fontes: "Fontes",
        encTheme_historias: "Histórias",
        notebook: "Caderno de campo",
        notebookLocked: "Ainda não descoberto",
        notebookWhere: "Pode aparecer em: {0}",
        notebookMastery: "Progresso nos encontros",
        notebookAnswered: "{0} acertos em {1} respostas",
        notebookCount: "{0} de {1} conceitos descobertos",
        notebookEmpty: "Nada por aqui ainda.",
        usage: "Aproveitamento",
        usageDetail: "Fontes {0} + tempo {1} + encontros {2} + cofre {3}",
        usageStudy: "modo estudo: o tempo não conta e os demais pesos foram reescalados",
        studyMode: "Modo estudo (sem peso de tempo)",
        evidNoShield: "leitura sem placa",
        evidWithShield: "leitura com placa",
        needMoreData: "Ainda não dá para concluir",
        useSpectro: "Usar o espectrômetro", spectroGamma: "Espectrômetro: linha(s) gama em {0}.", spectroNoGamma: "Espectrômetro: nenhuma linha gama; a fonte não emite gama.", spectroNoData: "Espectrômetro: sem dados de emissão para esta fonte.", wrongIdDose: "A demora junto à fonte custou {0} mSv ao cientista.",
        moreDataMissing: "Boa decisão: ainda faltam dados. Meça a mesma fonte, à mesma distância, sem placa e com alumínio, acrílico e chumbo, e compare.",
        moreDataEnough: "Você já tem leituras sem placa e com placa. Compare as quedas, elimine os candidatos incompatíveis e decida.",
        methodNote: "Nota de método: você identificou sem comparar leituras com e sem placa. Aqui a escolha é entre candidatos conhecidos; no mundo real, uma leitura isolada do Geiger não identifica a fonte.",
        usageMax: "máximo possível {0}%",
        usageDica: "dicas de localização: {0} (−{1} pontos)",
        dicaBtn: "Dica",
        dicaAviso: "Dica: fontes que faltam em vermelho no mapa (−2 pontos no aproveitamento).",
        dicaMiniAviso: "Demorando? As fontes que faltam piscam em vermelho no minimapa.",
        encountersToggle: "Encontros de aprendizado e cofre",
        encountersWarn: "Sem encontros nem cofre, o aproveitamento máximo é 75%.",
        reviewMode: "Modo de revisão (para revisores)",
        reviewModeHint: "Mostra campos de observação, rótulos de fonte e avisos de versão nas investigações. Desligado por padrão.",
        closeNotebook: "Fechar o caderno",
        notebookReset: "Apagar o progresso do caderno",
        notebookResetConfirm: "Clique de novo para confirmar (apaga as fichas e os selos)",
        notebookResetDone: "Caderno apagado.",
    };
