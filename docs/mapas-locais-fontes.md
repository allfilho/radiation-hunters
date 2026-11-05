# Mapas das missões: fontes e esquema por local (B1) — 29/10/2026

Regra: só entra no mapa o que tem fonte; todo o resto é "simplificação de jogo" [H]. [V] = verificado na fonte citada (em 29/10/2026); a maior parte vem da Wikipédia (fonte secundária) e deve ser conferida em fonte primária antes de qualquer afirmação no jogo; onde há fonte primária (AIEA, chnpp.gov.ua) está indicado.

## Achado técnico (importa para o plano)
O jogo já aceita mapas maiores que a tela (`mapCols`/`mapRows` na missão; câmera segue o jogador) e já tem plantas fixas externas de investigação (`mapa/plantas-investigacao.js`, até 54×44 tiles, `externo: true`). Hoje as missões de caça usam 24×16 tiles gerados por tema. Proposta: reutilizar o mecanismo de plantas para as missões (exterior + prédios com portas num mapa contínuo maior, telhado some ao entrar), em vez de sub-mapas separados. Menos código, menos risco, mesmo efeito X-COM. Decisão pendente do Arnaldo.

## Goiânia (missão 2, setembro de 1987)
[V] (Wikipédia "Goiânia accident"; confirmar na AIEA, 1988): clínica IGR abandonada ~1 km a noroeste da Praça Cívica (prédio com vigia; a fonte foi retirada em 13/09/1987); casa de Roberto dos Santos na Rua 57; ferro-velho de Devair Ferreira na Rua 15A, bairro Aeroporto ("Junkyard I", até 1,5 Sv/h no meio do pátio); casa de Ivo Ferreira, Rua 6, nº 1F ("Junkyard II"), ferro-velho vizinho; "Junkyard III"; bairros afetados: Aeroporto, Central e Ferroviários; 42 casas e 14 carros contaminados.
Esquema de jogo [H]: exterior = quadra/rua do ferro-velho com portão e rua; prédios = casa com quintal, galpão do ferro-velho, a clínica abandonada. A missão atual já usa o tema "junkyard" com Cs-137 espalhado; manter e dar ruas, casas e portão.

## Radium Girls (missão 3, anos 1910–1920, EUA)
[V] (Wikipédia "United States Radium Corporation"): complexo em 422–432 Alden Street, Orange, Nova Jersey (Essex County), com prédio de aplicação de tinta e laboratório de cristalização de rádio; extração de rádio em Orange de 1917 a 1926; fábrica fechada em 1927; pintura de mostradores com Undark (rádio + sulfeto de zinco), pontas dos pincéis afinadas com os lábios; ~1 600 t de resíduos deixados no terreno; Superfund (EPA) em 1983; limpeza concluída em 2009. A página não descreve a planta interna: salas de trabalho são [H].
Esquema [H]: pátio da fábrica + dois prédios (ateliê de pintura, laboratório) + depósito.

## Chernobyl (missão 4, 26 de abril de 1986)
[V] (planta oficial, chnpp.gov.ua, "General Plant Layout"): prédio principal em blocos (reatores 1–4; água especial e circuito de gás; sala de turbinas com turbinas 1–8; oficina de equipamento "sujo"); galeria de pedestres para prédios administrativos; galeria de transporte de 150 m até a chaminé de ventilação; subestação externa 110/330/750 kV atrás do canal de admissão; lagoa de resfriamento de 22,9 km² e 98 milhões de m³, abastecida do rio Pripyat; zona de controle de 3 km ao redor da chaminé. [V] (Wikipédia "Chernobyl Nuclear Power Plant"): usina 16,5 km a noroeste da cidade de Chernobyl e ~100 km ao norte de Kiev; unidades 1–4 lado a lado; casa de máquinas de 600 m junto aos reatores; unidades 5 e 6 planejadas a ~1 km das quatro primeiras. Não encontrei na fonte oficial a distância usina–Pripyat (não declarar no jogo sem fonte).
Esquema [H]: exterior = pátio da usina com chaminé, subestação e lagoa; interior = galeria + casa de máquinas + bloco do reator 4.

## Lia, Geórgia (missão 5, dezembro de 2001)
[V] (AIEA, publicação 1660): duas fontes de Sr-90 (geradores Beta-M) encontradas em área despovoada, numa depressão ao lado de uma trilha de terra, sob uma grande pedra e cercadas por pilha de rochas e terra; últimos 400 m bloqueados por deslizamento; aldeia mais próxima (Photskhoetseri) a 18 km pela trilha e 4–5 km em linha reta, com cume, represa e reservatório no meio; achadas em 2/12/2001 por três moradores de Lia, que as usaram como aquecedor à noite; recuperação em 2–3/02/2002 com contêiner de chumbo (~5,5 t) e limite de ~2 minutos por trabalhador. **Divergência na própria fonte:** a distância a Lia aparece como 28 km (seção 4.1) e como 45–50 km (seção 2.3); não usar número no jogo.
Esquema [H]: sem prédios; floresta/montanha grandes, trilha, pedra com depressão, deslizamento; neve na versão de inverno.

## Zaragoza (missão 6, dezembro de 1990)
[V] (Wikipédia "Clinic of Zaragoza radiotherapy accident"; confirmar no relatório do CSN): 10–20/12/1990, Hospital Clínico Universitário Lozano Blesa, Zaragoza; ao menos 27 pacientes lesados; acelerador de elétrons com 14 anos de uso; reparo em 7/12/1990, volta em 10/12; pacientes tratados a ~40 MeV em vez de 7 MeV; parado em 20/12/1990. **Atenção:** o jogo chama o local de "Clínica Zaragoza"; as fontes consultadas dizem Hospital Clínico Universitário Lozano Blesa. Decisão do Arnaldo se o nome muda.
Esquema [H]: hospital em corte (recepção, corredor, bunker do acelerador, sala de comando).

## Mayapuri (missão 7, abril de 2010)
[V] (World Nuclear News, 20/05/2010): mercado de sucata Mayapuri, Delhi; fragmentos de Co-60 de um "gamma cell" do Departamento de Química da Universidade de Delhi, descartado indevidamente; 7/04 comerciante hospitalizado; 26/04 morte do primeiro paciente; 14/05 levantamento do Greenpeace com pontos de 200–500 µSv/h; 15–16/05 remoção de resíduos pela AERB; nível 4 da escala INES. A fonte não descreve a planta do mercado.
Esquema [H]: ruelas do mercado, galpões de sucata, ferro-velho.

## Fukushima Daiichi (missão 8, 11 de março de 2011)
[V] (Wikipédia "Fukushima I"): terraço costeiro nas cidades de Ōkuma e Futaba, 350 ha; terreno originalmente a 35 m, rebaixado em 25 m (~10 m, cálculo); base de projeto de tsunami 5,7 m; ondas de até 14 m ultrapassaram a usina; seis reatores BWR (1–5 Mark I, 6 Mark II); vistos do oceano, as unidades 4, 3, 2, 1 formam o grupo da esquerda e 5, 6 o da direita; geradores diesel e baterias nos subsolos dos prédios de turbinas. [V] (UCS): chaminés de exaustão compartilhadas (1–2 e 3–4), prédio de offgas comum, tomadas de água do mar e descarga comum ao Pacífico.
Esquema [H]: costa a leste, fileira de prédios de reator/turbina, pátio, canal, subestação.

## Lacunas e próximos passos
Plantas detalhadas (ruas reais, dimensões) NÃO foram verificadas; o plano é esquema fiel só ao essencial acima. Fontes primárias a obter: relatório da AIEA sobre Goiânia (1988), relatório do CSN sobre Zaragoza, relatório da AERB/AIEA sobre Mayapuri. Próximo: B2 (decisão sobre mapa contínuo vs. sub-mapas e escolha das dimensões).
