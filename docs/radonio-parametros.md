# Radônio na escola v2: parâmetros e fontes (etapa 1, 27/10/2026)

Rótulos: **[V]** verificado em fonte aberta nesta rodada; **[C]** cálculo meu a partir de [V]; **[H]** hipótese de ensino (valor escolhido para o jogo, sem fonte direta); **[N]** não encontrado.

## 1. O modelo, com duas fontes de entrada
dC/dt = (S_solo + S_mat)/V − (λv + λ)·C + λv·C0
- **S_solo**: gás do solo que entra pela laje, trincas, ralos e passagens de tubulação, por diferença de pressão (efeito chaminé, vento, desbalanço de ventilação). Decresce com a altura do piso em relação ao solo.
- **S_mat** = E · A: exalação das superfícies (paredes, piso, forro) × área. **Não depende do andar**, só do material e da área. Vale também para o sótão e para qualquer depósito.
- **λv**: troca de ar (1/h). **λ**: constante de decaimento do Rn-222. **C0**: concentração externa.
- Regime permanente: C∞ = (S/V + λv·C0)/(λv + λ). Constante de tempo: τ = 1/(λv + λ).

## 2. Valores verificados
| Grandeza | Valor | Rótulo | Fonte |
|---|---|---|---|
| Meia-vida do Rn-222 | 3,8232 (8) d | [V] | IAEA/LNHB, https://www-nds.iaea.org/act_ddl/data/Rn-222_com.pdf |
| λ | 0,007554 1/h (τ = 5,52 d) | [C] | ln 2 / meia-vida |
| Com λv = 0,5 1/h a concentração fica em 1,5 % do valor sem ventilação | 1,49 % | [C] confere com [V] | Jonassen (c. 1980, ano não impresso na página), "Indoor Radon Concentrations and Building Materials", Univ. Técnica da Dinamarca, https://www.aivc.org/sites/default/files/airbase_640.pdf: "a ventilation rate of 0.5 h⁻¹ will lower the radon concentration to 1.5% of the unventilated value". Meu cálculo λ/(λv+λ) dá 1,49 %. |
| Exalação superficial de materiais de construção (Jacarta) | cimento 0,72 a 2,52 (média 1,44); tijolo 0,14 a 2,88 (média 1,08); areia 0,36 a 2,16 (média 0,72); concreto celular autoclavado 0,25 a 7,2 (média 2,16) Bq m⁻² h⁻¹ | [V] | Nugraha et al. (2025), *Frontiers in Public Health* 13:1539957, https://doi.org/10.3389/fpubh.2025.1539957 (81 amostras; valores convertidos de mBq m⁻² s⁻¹ por ×3,6 pelo meu leitor automático; o artigo traz 1,3 para o tijolo em outra tabela, então há inconsistência interna) |
| Ra-226 nesses materiais | cimento média 49; tijolo 35; areia 31 Bq/kg; média geral 34, perto de 32 da UNSCEAR citada | [V] | mesma fonte |
| Contribuição dos materiais ao radônio interno | ~28 Bq/m³ (estimativa deles); média mundial citada 40 Bq/m³ | [V] (do artigo) | mesma fonte |
| Média mundial interna ponderada pela população: 39 Bq/m³, com ~10 Bq/m³ dos materiais | citação de segunda mão | [V] só como "citado" | Ferreira (2025), tese de doutorado, UFRJ/COPPE, https://www.nuclear.ufrj.br/images/Tese_-_Paulo_Roberto_Rocha_Ferreira.pdf |
| Efeito do andar e da ventilação em escolas | radônio diminui com o andar; maior acúmulo com ventilação desligada fora da aula; pico ~6 h; salas sem janela acumulam mais; mais concreto, mais acúmulo; máximos 38, 162, 25 Bq/m³ | [V] | Shirazi (2025), dissertação de mestrado, Aalto Univ., https://aaltodoc.aalto.fi/items/656ea8cd-09b0-4247-a956-b70b5850bcc4 (não revisada por pares; clima finlandês) |
| Ventilação programada: média nas horas ocupadas ≈ 1/3 do período todo (0,33 ± 0,23) | [V] | Rönnqvist (Radonova), AARST 2023, https://aarst.org/wp-content/uploads/2024/03/09_05_SR_TUE_Ronnqvist_RADON-LEVELS-DURING-WORKING-HOURS.pdf (apresentação de congresso) |
| Trocas de ar de projeto em sala de aula ocupada | 4,6 a 6,5 1/h (cálculo, não medição) | [V] | Calama-González et al. (2019), *Energies* 12(24):4607, https://doi.org/10.3390/en12244607 |
| Residência: λv ≈ 0,55 1/h (aquecimento), C0 = 9 Bq/m³ | exemplo americano de 1987 | [V] como exemplo, não escolar | Fisk & Mowris, LBL-23136 |
| Níveis de referência | 100 Bq/m³ (OMS), máximo 300 | [V] | WHO Handbook on Indoor Radon (2009), https://www.who.int/publications/i/item/9789241547673 |

**Aviso sobre um erro que quase entrou:** o leitor automático converteu "380 átomos m⁻² s⁻¹" (concreto do porão, Jonassen) em 1,4 × 10⁶ Bq m⁻² h⁻¹ tratando 1 átomo/s como 1 Bq. Está errado: a atividade é λ × número de átomos, então 380 átomos m⁻² s⁻¹ ≈ **2,9 Bq m⁻² h⁻¹** [C], o que concorda com os 1 a 3 de Jacarta. Não usar a conversão do leitor.

## 3. O que a conta mostra sobre os materiais (sala de 8 × 6 × 3,75 m: V = 180 m³, A ≈ 201 m²) [C]
| E (Bq m⁻² h⁻¹) | λv = 0 (só decaimento) | 0,05 1/h | 0,5 1/h | 3 1/h |
|---|---|---|---|---|
| 1,08 (tijolo, média) | 160 Bq/m³ | 21 | 2,4 | 0,4 |
| 1,44 (cimento, média) | 213 | 28 | 3,2 | 0,5 |
| 2,88 (tijolo, máx.) | 426 | 56 | 6,3 | 1,1 |
Constantes de tempo: 132 h com λv = 0 (5,5 dias); 17 h com 0,05; 2,0 h com 0,5; 0,3 h com 3.
**Leitura:** só pelos materiais, uma sala ventilada fica em poucos Bq/m³; uma sala quase hermética (depósito sem janela, fechado por um fim de semana de 60 h, τ ≈ 17 h) chega a dezenas de Bq/m³ e, hermética de verdade, a centenas. Isso apoia o argumento de Arnaldo: **sótão e depósito de cima também acumulam por causa dos materiais**, e a ventilação decide o quanto. Os números dependem da área e do material assumidos [H para o prédio; V para a faixa de E].

## 4. Parâmetros do jogo por tipo de ambiente: tudo [H], a calibrar contra faixas [V]
Não encontrei fonte com S_solo por tipo de ambiente ([N]). Para o jogo, o S_solo será definido por um **índice de contato com o solo** (0 a 1) e calibrado para que os resultados caiam nas faixas observadas em escolas ([V]: de ~0 a 162 Bq/m³ nas finlandesas; média interna mundial 39 Bq/m³). Os valores finais saem da calibração e serão listados aqui com o rótulo [H].
| Ambiente | Contato com o solo | Material (área/E) | λv típico | Observação didática |
|---|---|---|---|---|
| Porão | alto | concreto enterrado | baixo | candidato ao maior valor |
| Depósito fechado no térreo | médio | concreto | muito baixo | acumula por ventilação baixa e por contato |
| Sala de aula no térreo | médio | alvenaria | médio a alto, conforme janelas e uso | muda muito entre aula e fim de semana |
| Sala de aula no 1º andar | baixo | alvenaria | idem | cai pelo andar, mas não zera (materiais) |
| Sótão / depósito alto | muito baixo | telhado, laje, alvenaria | baixo se fechado | acumula só pelos materiais; é o caso que distingue as duas fontes |
| Corredor, biblioteca, secretaria | por piso | por piso | médio | referência |

## 5. Pendente
- [N] S_solo por tipo de ambiente: buscar (Nazaroff, "Radon transport from soil to air"; Gadgil, "Models of radon entry", LBL; relatórios da EPA sobre escolas) ou assumir [H] e declarar.
- [N] Troca de ar medida com portas e janelas fechadas em escolas (infiltração) e com janelas abertas.
- [N] Dados brasileiros de exalação por material (a tese da UFRJ trata de rochas ornamentais "Café Bahia" e não deu valores de exalação legíveis; a tese da USP de Ferreira 2013 não abriu). Usar Jacarta só como faixa, declarando a origem.
- [N] C0 externo no Brasil: a tese da UFRJ cita 0,6 a 28 Bq/m³ de ar externo, de segunda mão.

## 6. Calibração dos parâmetros do jogo (etapa 2, `js/fisica/radonio.js`), todos [H] salvo indicação
Valores globais: C0 = 8 Bq/m³; S_solo de referência = 112 Bq/h por m² de piso com contato 1; infiltração fechada 0,15 1/h; janela aberta +1,5 1/h cada; porta aberta +0,5 1/h; ventilação mecânica +3,0 1/h (os cenários de projeto de sala ocupada em Calama-González et al. 2019 somam 4,6 a 6,5 [V, cálculo]); aula seg a sex, 8 a 17 h.
Resultado com tudo fechado (só infiltração), em regime permanente [C]:
| Ambiente | S_solo (Bq/h) | S_mat (Bq/h) | C fechado (Bq/m³) |
|---|---|---|---|
| Porão | 4480 | 380 | 309 |
| Depósito do térreo (sem janela, λv 0,05) | 896 | 130 | 452 |
| Sala de aula, térreo | 2688 | 217 | 110 |
| Sala de aula, 1º andar | 645 | 217 | 38 |
| Sótão (λv 0,30) | 134 | 230 | 18 |
| Corredor | 4480 | 454 | 87 |
**Leitura:** o depósito sem janela passa o porão porque o que decide é entrada **e** ventilação. O sótão fica baixo com λv = 0,30, mas com λv = 0,05 e sem solo os materiais sozinhos levam a ~40 Bq/m³ (teste 37).
**Verificação do realismo (sala de aula do térreo, ventilação mecânica programada, semana de 7 dias) [C]:** média das horas de aula 13 Bq/m³ contra 63 Bq/m³ no período todo, fator ocupado/total **0,21**, dentro de uma dispersão da faixa 0,33 ± 0,23 de Rönnqvist (AARST 2023) [V]; o fim de semana passa a noite de semana (108 contra 75 Bq/m³); o pico é na manhã de segunda, depois do fim de semana. **Isto não prova que os valores de S estão certos**: confere o comportamento, não a escala.

## 7. Campanha de 12 períodos (cena 2 do episódio) — [H]
Gerada por `campanha12()` em `js/fisica/radonio.js`: dois anos simulados, passo de 1 h, devolve o segundo ano; média de todas as horas de cada período de 30 dias (como um dispositivo passivo). `PERIODOS_FRIOS` = períodos 4 a 8; `FATOR_SOLO_FRIO` = 2,0 aplicado só à entrada do solo. O fator é um valor de jogo, escolhido para que a ordem das salas se inverta entre o 1º período e o ano; não está calibrado em medidas de escola. Mecanismo plausível citado na literatura geral (diferença de pressão entre dentro e fora no frio, efeito chaminé), mas NÃO verificado aqui em fonte; por isso o texto do jogo diz "valor de jogo" e "não demonstra o mecanismo real".
Sala A: janelas (2) e porta abertas na aula e 1 janela aberta o tempo todo na época quente; fechada no frio. Sala B: ventilação mecânica programada o ano todo. Valores arredondados para inteiros: A = 16 no 1º período e média 94,6 no ano; B = 62 no 1º período e média 84,5.
