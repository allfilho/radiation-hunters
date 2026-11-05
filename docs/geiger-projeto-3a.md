# Projeto do Geiger (Etapa 3a)

Documento de projeto para revisão do Arnaldo, escrito em 13/10/2026. **Nenhuma linha do jogo foi alterada.** A implementação só começa na etapa 3b, depois da sua aprovação.

Convenção usada em todo o documento:

- **[V]** verificado em fonte citada na seção 9, com o valor lido nesta sessão.
- **[V-sec]** consta numa fonte secundária (nota de curso, página de fabricante); serve, mas deve ser conferido na fonte primária antes de virar referência do jogo.
- **[H]** hipótese ou escolha de projeto de jogo, sem fonte. Não é fato físico; está aí para o jogo ser jogável e pode ser mudada.
- **[P]** pendente: falta fonte, e por isso o item fica fora do modelo até alguém confirmar.

## 1. O que o modelo precisa fazer

Objetivo que você definiu: um Geiger fisicamente razoável, simplificado, que mantenha o jogo divertido. Decisões já fechadas (suas, de 13/10/2026):

1. Fonte isotrópica; o cone representa a aceitação angular do detector.
2. Gama sem blindagem cai com 1/d². Com blindagem, usa as propriedades do material.
3. Alfa é barrada pelo ar, não segue 1/d². Fonte fraca (alfa) é difícil de achar; gama e beta fortes são fáceis.
4. Cada sala está em escala real (cm por pixel); a escala é didática.
5. Paredes de concreto atenuam gama (talvez bloqueiem) e bloqueiam alfa e beta.
6. Atividade constante durante a missão.

Sobre o item 6, os números confirmam a aproximação (seção 7): a maior perda é a do Tc-99m, 1,1% em 6 minutos de missão e 10,9% em uma hora; para todos os outros isótopos do jogo fica abaixo de 0,04% em 6 minutos. Só o Tc-99m merece uma frase na tela de ajuda, e mesmo assim não vale a complexidade de modelar.

## 2. Modelo proposto

Taxa de contagem esperada na sonda, em contagens por segundo:

    R = R_fundo + Σ_i  S_i · G_i(d_i) · T_ar,i(d_i) · T_mat,i · f_i(θ_i)

Para cada fonte i (cada fonte tem um único tipo de radiação no jogo):

| Termo | Significado | Gama | Beta | Alfa |
|---|---|---|---|---|
| S | taxa a uma distância de referência | a 1 m | a 0,5 m | em contato |
| G(d) | geometria | (d_ref/d)² | (d_ref/d)² | ver 2.3 |
| T_ar(d) | transmissão no ar | exp(−μ_ar·d) | corte por alcance (2.2) | zero além do alcance (2.3) |
| T_mat | blindagens e paredes | exp(−Σ μ_k·x_k) | corte por alcance em g/cm² | zero para qualquer anteparo |
| f(θ) | aceitação do detector | piso alto | estreita | estreita |

A contagem em cada janela de 200 ms é Poisson com média R·0,2 s (o jogo já tem `poissonRandom`). O sinal e o fundo são somados *antes* de sortear, de modo que a variância é igual à média, como num contador real. Hoje o jogo arredonda cada fonte e sorteia só o fundo; isso muda.

### 2.1 Gama

- Lei do inverso do quadrado para fonte pontual isotrópica: geometria, sem fonte necessária. Vale para d bem maior que o tamanho da fonte e da sonda.
- Distância mínima: d_min = 0,25 m [H]. Justificativa física simples: a fonte está dentro de um móvel de pelo menos 1 tile, então a sonda nunca chega ao centro da fonte. Isso evita a divergência do 1/d² sem inventar um limite arbitrário.
- Atenuação no ar: o coeficiente linear é da ordem de 1e-4 por cm (seção 4), o que dá comprimento de 1/e entre 60 e 146 m. Na escala de uma sala (≤ 12 m) a transmissão fica entre 0,8 e 0,9 e pode ser incluída (custa uma exponencial) ou ignorada. **Proposta: incluir**, porque assim o termo existe e é testável.
- Atenuação em material: feixe estreito, exp(−μ·x), com μ = (μ/ρ)·ρ. Valores na seção 4.
- Limite do modelo: feixe estreito ignora o espalhamento (buildup). Numa parede grossa, o buildup faz passar mais radiação do que o exponencial puro. O efeito não foi quantificado aqui [P]. A consequência para o jogo é conservadora: a parede bloqueia um pouco mais no jogo do que na realidade. A norma ANSI/ANS-6.4.3 é candidata a fonte para fatores de buildup, mas não foi consultada nesta sessão.

### 2.2 Beta

- Geometria 1/d² a partir de d_ref = 0,5 m [H] (o valor de d_ref é só um ponto de referência da escala).
- Alcance finito. Para cada isótopo existe uma energia máxima. A relação de Katz e Penfold (1952) dá o alcance em densidade superficial (mg/cm²) e vale entre 0,01 e 2,5 MeV: R = 412·E^(1,265 − 0,0954·ln E). **[V]** a forma da relação (confere com o P-32: 791 mg/cm² calculados contra 790 mg/cm² que a Ionactive cita). A tabela da seção 5 aplica essa relação.
- Como entra no jogo: o alcance em densidade superficial é "gasto" pelo ar e pelas blindagens: x_total = Σ ρ_k·espessura_k. A transmissão é T = max(0, 1 − x_total/R_máx) [H]. O corte em R_máx é físico; a forma linear entre 0 e R_máx é a hipótese mais simples e pode ser trocada por uma curva de absorção medida quando houver fonte [P].
- Observação importante: para o Sr-90/Y-90 vale o alcance do Y-90 (Emax = 2,28 MeV, ~9,1 m no ar e ~1,1 g/cm²), porque as duas espécies estão em equilíbrio numa fonte velha. O Sr-90 sozinho (Emax 0,546 MeV) alcança só 1,5 m. Escolher o primeiro é uma decisão do jogo [H]; a frase de ajuda deve citar "Sr-90/Y-90".
- Chumbo e beta: o chumbo para os elétrons (0,2 a 1 mm), mas gera radiação de freamento (bremsstrahlung). A fração depende de Z e E; não consegui fonte nesta sessão [P]. O jogo mantém β_Pb = 0 como hoje e a ajuda diz isso de forma explícita ("o chumbo para a beta, mas a beta no chumbo gera um pouco de raios X, e é por isso que se usa plástico antes do chumbo").

### 2.3 Alfa

- Alcance no ar: a relação empírica R(cm) = 1,24·E − 2,62 para 4 < E < 8 MeV (e 0,56·E abaixo de 4 MeV) aparece numa nota de curso da Oregon State [V-sec]. Resultados: Am-241 (5,486 MeV) 4,2 cm; Po-210 (5,304 MeV) 4,0 cm; Ra-226 (4,784 MeV) 3,3 cm; U-238 (4,198 MeV) 2,6 cm. A Ionactive diz 4 cm (Am-241) e 3,5 cm (Po-210) [V-sec] e recomenda 1 a 3 cm em ambiente real. Os valores concordam dentro de ~15% e servem; o alcance de projeto fica em **3 cm no máximo, 1 a 2 cm úteis** [H].
- A janela do detector também absorve alfa. A Ludlum 44-9 tem janela de mica de 2,0 ± 0,3 mg/cm² [V] (datasheet do fabricante), mas o datasheet não dá a eficiência para alfa de 5 MeV (só cita Pu-239 em 15% para 4π) [V]. Quanto o alcance cai por causa da janela fica [P].
- Em jogo: a fonte alfa fica *dentro* de um móvel. A leitura só sobe quando a ponta da sonda encosta nele (regra de contato, decisão D1 na seção 8). Qualquer anteparo (papel, acrílico, alumínio, parede) zera. Dentro do alcance: R = S·(1 − d/R_ef), com R_ef = 2 cm [H].

### 2.4 Aceitação angular (o "cone")

- Alfa e beta entram pela janela fina: aceitação estreita. Proposta: f = cos²(θ) para θ < 45°, zero fora [H].
- Gama atravessa a carcaça: aceitação ampla. Proposta: f = 1 dentro do cone e f = 0,3 fora [H]. Hoje o jogo ignora gama fora do cone, e há um teste `todo` sobre isso. Decisão D3.
- Sem fonte citável para o formato de f(θ). O que existe de fato é a resposta direcional medida de cada sonda, que não consultei. Fica [P] e é um parâmetro, não uma verdade.

### 2.5 Paredes

Hoje: uma linha de visada booleana (Bresenham) contra os tiles de parede. Proposta: percorrer o raio fonte→sonda e somar o comprimento percorrido dentro de tiles de parede; a transmissão gama é exp(−μ_concreto·espessura_total), e alfa e beta são zerados se o comprimento for maior que zero.

A espessura física é um parâmetro do tema [H], separado do desenho do tile. Resultados para concreto comum (ρ = 2,30 g/cm³, NIST) [V]:

| Espessura | Cs-137 (0,662 MeV) | Co-60 (1,25 MeV) | Ir-192 (~0,37 MeV) | Tc-99m (0,14 MeV) |
|---|---|---|---|---|
| 10 cm | 0,16 | 0,26 | 0,099 | 0,032 |
| 20 cm | 0,027 | 0,069 | 0,0098 | 0,0010 |
| 30 cm | 0,0043 | 0,018 | 0,00097 | 3e-5 |
| 50 cm | 1,2e-4 | 1,3e-3 | 9e-6 | ~0 |

Com 1 tile = 50 cm, uma parede de um tile bloqueia praticamente toda a gama, o que combina com o que você sugeriu ("talvez até bloqueiem"). Com paredes mais finas (20 a 30 cm), a gama forte do Co-60 ainda vaza 2 a 7%, o que dá um jogo interessante: dá para detectar o Co-60 do outro lado de uma parede, mas não o Tc-99m.

### 2.6 Eficiência e unidades

O Ludlum 44-9 tem sensibilidade típica de 3300 cpm por mR/h para Cs-137 [V], isto é, 55 cps por mR/h. Isso ancora a unidade de "cps" a uma grandeza física: os valores de S da seção 6 (gama, 90 a 285 cps a 1 m) correspondem, se a sonda respondesse como ao Cs-137, a algo como 1,6 a 5 mR/h só para a fonte. Esse mapeamento é útil para o texto educativo, mas **não** quer dizer que o jogo reproduza a resposta real (a sensibilidade depende da energia e eu não tenho essa curva [P]). O jogo mostra cps (não mR/h) e o fundo continua sendo 5 cps [H]. O fundo real de uma sonda pancake não foi consultado [P].

Tempo morto do GM: não incluído; sem fonte [P]. A distância mínima de 25 cm mantém as taxas máximas em ~1,6 mil cps para S = 100 cps a 1 m, abaixo da região onde o tempo morto importaria, mas isso é uma estimativa e não uma verificação.

## 3. Escala das salas (decisão D2)

O mapa tem 24 × 16 tiles de 32 px (768 × 512 px). O que cada tile vale:

| Escala | cm/pixel | Sala | Observação |
|---|---|---|---|
| 1 tile = 25 cm | 0,78 | 6 × 4 m | cabe num laboratório pequeno, mas o gama de 3 a 5 m cobre a sala inteira |
| **1 tile = 50 cm** | **1,56** | **12 × 8 m** | **recomendada**: detecção de 3 a 5 m cobre um terço da sala, e a parede de 1 tile atenua |
| 1 tile = 100 cm | 3,1 | 24 × 16 m | galpão; tira a graça do alfa e do beta |

Recomendação: **50 cm por tile** como padrão, com `cmPorPixel` por missão (o Chernobyl e o Fukushima podem ter salas maiores). A espessura física de parede é um parâmetro separado: o tile de parede é desenhado largo por razões visuais.

## 4. Coeficientes de atenuação gama (NIST XCOM)

Coeficientes de atenuação mássicos μ/ρ (cm²/g) lidos em 13/10/2026 nas tabelas do NIST; densidades da Tabela 1 (elementos) e da Tabela 2 (compostos) do mesmo site. Ver `parametros-fisicos.json` para os valores completos.

| Material | ρ (g/cm³) | μ/ρ a 0,5 MeV | a 1,0 MeV | a 1,5 MeV |
|---|---|---|---|---|
| Chumbo | 11,35 | 0,1614 | 0,07102 | 0,05222 |
| Alumínio | 2,699 | 0,08445 | 0,06146 | 0,05006 |
| Concreto comum | 2,30 | 0,08915 | 0,06495 | 0,05288 |
| PMMA (acrílico) | 1,19 | 0,0941 | 0,0687 | 0,05591 |
| Ar seco | 1,205e-3 | 0,08712 | 0,06358 | 0,05175 |

Coeficientes lineares e camadas semi-redutoras (HVL) calculados com interpolação log-log entre os pontos tabelados (script `calc-parametros-3a.py`). Para o Cs-137 (0,662 MeV) e o Tc-99m (0,1405 MeV) a energia cai entre dois pontos da tabela; o resultado é aproximado e sem o ponto exato do NIST. Para o chumbo a 0,14 MeV há a borda K em 88 keV abaixo, o que torna a interpolação mais segura nesse trecho, mas o valor ainda deve ser lido diretamente na tabela do NIST antes de valer como referência [P].

| Radiação | Energia usada | HVL Pb | HVL concreto | HVL Al | HVL PMMA |
|---|---|---|---|---|---|
| Tc-99m | 0,1405 MeV (γ 140,5 keV, 88,5%) | 0,26 mm | 2,0 cm | 1,8 cm | 3,9 cm |
| Ir-192 | ~0,37 MeV (média ponderada pela intensidade das 9 linhas principais) | 2,2 mm | 3,0 cm | 2,7 cm | 5,5 cm |
| Cs-137 | 0,662 MeV (85,01%) | 5,5 mm | 3,8 cm | 3,4 cm | 7,0 cm |
| Co-60 | 1,25 MeV (média das linhas de 1173 e 1332 keV) | 10 mm | 5,2 cm | 4,7 cm | 9,5 cm |

Nota: as camadas do jogo (alumínio, acrílico, chumbo) hoje são fatores fixos: gama 0,90 (Al), 0,95 (acrílico) e 0,10 (Pb) com a mesma espessura para qualquer isótopo. O modelo novo troca isso por espessura × μ(E). Falta decidir as espessuras das camadas do jogo (D4).

## 5. Alcance beta e alfa

Alcance beta pela relação de Katz–Penfold (aplicada à energia máxima; exige 0,01 ≤ E ≤ 2,5 MeV; as energias abaixo vêm das tabelas LNHB):

| Isótopo | Emax (MeV) | R (mg/cm²) | Ar | Acrílico | Alumínio | Chumbo |
|---|---|---|---|---|---|---|
| P-32 | 1,711 | 791 | 6,6 m | 6,6 mm | 2,9 mm | 0,70 mm |
| Sr-90 (sozinho) | 0,546 | 185 | 1,5 m | 1,6 mm | 0,69 mm | 0,16 mm |
| Y-90 (filho do Sr-90) | 2,28 | 1095 | 9,1 m | 9,2 mm | 4,1 mm | 0,97 mm |
| I-131 (ramo principal) | 0,606 | 214 | 1,8 m | 1,8 mm | 0,79 mm | 0,19 mm |
| Cs-137 (ramo principal) | 0,514 | 170 | 1,4 m | 1,4 mm | 0,63 mm | 0,15 mm |
| Ir-192 (ramo principal) | 0,675 | 247 | 2,1 m | 2,1 mm | 0,92 mm | 0,22 mm |

Os alcances em alumínio, acrílico e chumbo dividem a densidade superficial pela densidade do material; a relação despreza a dependência com Z (a própria nota da OSU diz isso), então chumbo e alumínio têm erro maior que o ar ou o acrílico. A energia do Y-90 vem do conhecimento geral (2,28 MeV) e **não** foi lida na tabela do LNHB nesta sessão; confira [P].

Alcance alfa no ar (seção 2.3): 2,6 a 4,2 cm. Além do ar, folha de papel, 2 cm de ar ou a janela do detector já zeram o sinal.

## 6. Parâmetros de força das fontes e metas de jogabilidade

Os valores de força absolutos são decisões de jogo [H]: não existe "força física" no jogo, porque as atividades das fontes não vieram de nenhum acidente real documentado aqui. O que é físico é a *forma* da dependência. Metas de projeto:

- Gama: detectável a 3 a 6 m em campo livre, com sinal 3σ acima do fundo (limiar de ~6,7 cps com fundo de 5 cps).
- Beta: detectável a 1,5 a 3 m.
- Alfa: só por contato (≤ 2 cm).

Mapeamento proposto dos valores atuais para os novos (gama: `S = 0,3 × base` a 1 m; beta: `S = 1,0 × base` a 0,5 m; alfa: `S = base` no ponto de contato). Estes fatores foram **revisados depois da simulação da seção 12**: os primeiros candidatos (0,2 e 0,35) deixavam o beta audível em só 6% do piso, pouco para uma fonte que você descreveu como fácil de achar.

| Isótopo | Tipo | base atual | S nova | Alcance de detecção |
|---|---|---|---|---|
| U-238 | α | 40–90 | 40–90 em contato | contato |
| Am-241 | α | 80–160 | 80–160 em contato | contato |
| Po-210 | α | 70–120 | 70–120 em contato | contato |
| Ra-226 (missão 3) | α | 60–140 | 60–140 em contato | contato |
| Sr-90 | β | 170–300 | 170–300 a 0,5 m | 2,5–3,3 m |
| P-32 | β | 220–400 | 220–400 a 0,5 m | 2,9–3,9 m |
| I-131 | γ (primária desde 27/10/2026; antes β) + β secundária | 220–420 | 220–420 a 0,5 m | até 1,8 m para a beta (o alcance no ar corta antes); a gama segue com 1/d² |
| Tc-99m | γ | 300–620 | 90–186 a 1 m | 3,7–5,3 m |
| Cs-137 | γ | 360–720 | 108–216 a 1 m | 4,0–5,7 m |
| Ir-192 | γ | 380–820 | 114–246 a 1 m | 4,1–6,1 m |
| Co-60 | γ | 500–950 | 150–285 a 1 m | 4,7–6,5 m |

Alcance de detecção = d tal que o sinal é igual a 3·√fundo = 6,7 cps (cálculo direto, em campo livre, sem blindagem nem atenuação no ar). Nos mapas reais o que limita é a parede: as salas têm ~3 × 2 m a 50 cm por tile (seção 12). Ajuste fino definitivo só com gente jogando (3b/3c).

Duas observações sobre o conteúdo físico dos isótopos no jogo (para a etapa 3e, não para o Geiger):

- O U-238 do jogo emite só alfa. Os filhos (Th-234, Pa-234m) emitem beta em fontes antigas; o Pa-234m não foi consultado nesta sessão [P].
- O Ra-226 do jogo (missão 3) emite só alfa. Na fonte real, os descendentes do radônio emitem gama e beta, e o Ra-226 mesmo emite um gama de 186 keV com 3,6% [V]. O jogo hoje não mostra nada disso.

## 7. Atividade constante: verificação numérica

Fração do isótopo que decai em 6 minutos e em 1 hora (meias-vidas da seção 9):

| Isótopo | T½ | 6 min | 1 h |
|---|---|---|---|
| Tc-99m | 6,0067 h | 1,15% | 10,9% |
| I-131 | 8,0233 d | 0,036% | 0,36% |
| P-32 | 14,273 d | 0,020% | 0,20% |
| Ir-192 | 73,827 d | 0,0039% | 0,039% |
| Po-210 | 138,38 d | 0,0021% | 0,021% |
| Co-60 | 5,2711 a | 0,0002% | 0,0015% |
| Cs-137 | 30,018 a | ~0 | 0,0003% |
| Sr-90 | 28,80 a | ~0 | 0,0003% |

A aproximação de atividade constante está confirmada para todos os isótopos do jogo; o Tc-99m é o único que deixa de ser desprezível em sessões longas. Um teste automático em 3b vai registrar isso.

## 8. Decisões que preciso de você

Para cada uma deixo minha recomendação.

- **D1. Alfa por contato.** A 1,56 cm/pixel, o alcance real do alfa (2 a 3 cm) é de 1 a 2 pixels, impossível de jogar. Recomendo a regra de contato: a fonte alfa fica dentro de um móvel e conta quando a sonda toca o móvel (ou está a no máximo 1 tile dele). É um exagero didático declarado, e a tela de ajuda explica que, na vida real, a sonda tem de ficar a poucos centímetros.
- **D2. Escala.** Recomendo 50 cm por tile (seção 3).
- **D3. Gama fora do cone.** Recomendo piso de 0,3: o gama é detectado, mais fraco, mesmo fora do cone; alfa e beta só dentro do cone.
- **D4. Espessuras das blindagens.** Proposta [H]: alumínio 3 mm, acrílico 5 mm, chumbo 2 mm (placas finas, como as de laboratório). Com isso, o chumbo de 2 mm para a beta (alcance de 0,16 a 0,97 mm) mas reduz o gama do Cs-137 só para exp(−1,26 × 0,2) = 0,78; o jogador precisa trocar de blindagem conforme o tipo, que é o objetivo pedagógico. Alternativa: placas mais grossas (chumbo de 1 cm, atenuação do Cs-137 em 0,28). Prefiro a primeira.
- **D5. Parede.** 1 tile de parede = concreto de 30 cm [H], com atenuação do Cs-137 por 0,004 e do Co-60 por 0,018. Alternativa: 50 cm, parede opaca para gama.
- **D6. Integração.** Mostrar a leitura como média móvel de **3 s** (a simulação da seção 12 mostra que 1 s deixa o gradiente ilegível em quase metade da área audível) e estimar a incerteza pela raiz do número de contagens; o som de clique continua a ser o sinal principal. Detalhes na etapa 3c.
- **D7. Regra de identificação (bug que impede concluir duas missões).** Trocar "distância ao centro do móvel ≤ 1,5 tile" por "distância à superfície do móvel ≤ 1 tile". Recomendo sim; sem isso, Chernobyl e Fukushima não têm como ser concluídas (seção 12).
- **D8. Tempo limite.** Não aplicar os `timeLimit` atuais (180 a 360 s) como derrota; usá-los como meta de estrelas até haver teste com jogadores (seção 12).

## 9. Fontes (consultadas em 13/10/2026)

Dados nucleares (LNE-LNHB/CEA, Table de Radionucléides, consulta feita nas tabelas em PDF):

- Cs-137: http://www.lnhb.fr/nuclides/Cs-137_tables.pdf — T½ = 30,018 (22) a; γ de 661,655 keV, 85,01 (20)%; avaliação de S. Leblond; citação recomendada: X. Mougeot et al., Metrologia 62 (2025) 029002.
- Co-60: http://www.lnhb.fr/nuclides/Co-60_tables.pdf — T½ = 5,2711 (8) a; γ 1173,228 keV (99,85%) e 1332,492 keV (99,9826%); R. G. Helmer.
- Am-241: http://www.lnhb.fr/nuclides/Am-241_tables.pdf — T½ = 432,6 (6) a; α 5485,56 keV (84,45%), 5442,86 keV (13,23%); γ 59,54 keV (35,92%); V. P. Chechev e N. K. Kuzmenko.
- Sr-90: http://www.lnhb.fr/nuclides/Sr-90_tables.pdf — T½ = 28,80 (7) a; Y-90 2,6684 (13) d; β Emax 545,9 (14) keV, média 196 (1) keV; V. Chisté.
- Ra-226: http://www.lnhb.fr/nuclides/Ra-226_tables.pdf — T½ = 1600 (7) a; α 4784,34 keV (94,038%) e 4601 keV (5,95%); γ 186 keV, 3,555%; Rn-222 T½ 3,8232 (8) d.
- Ir-192: http://www.lnhb.fr/nuclides/Ir-192_tables.pdf — T½ = 73,827 (13) d; 9 linhas γ principais (316,51 keV, 82,75% etc.); E. Browne (LBNL).
- I-131: http://www.lnhb.fr/nuclides/I-131_tables.pdf — T½ = 8,0233 (19) d; β Emax 606,3 keV (89,4%); γ 364,5 keV (81,2%).
- P-32: http://www.lnhb.fr/nuclides/P-32_tables.pdf — T½ = 14,273 (7) d; β Emax 1710,661 (40) keV, média 693,306 (18) keV; M. C. Lépy.
- Po-210: http://www.lnhb.fr/nuclides/Po-210_tables.pdf — T½ = 138,3763 (17) d; α ao estado fundamental do Pb-206 em 99,99876% (energia 5304,33 keV, que bate com o valor comum).
- U-238: http://www.lnhb.fr/nuclides/U-238_tables.pdf — T½ = 4,468 (5)×10⁹ a; ramos α 77,54% e 22,33%; a própria tabela traz duas listas de energias (4198/4151 keV numa seção e 4269,7/4220,2 keV em outra, esta última ligada ao valor Q); usei 4,198 MeV, que é a energia da alfa emitida [conferir no PDF].
- Tc-99m: http://www.lnhb.fr/nuclides/Tc-99m_tables.pdf — T½ = 6,0067 (10) h; γ 140,511 keV, ~88,5%.

Observação sobre a consulta: o conteúdo dos PDFs foi lido por extração automática de texto e resumida por uma ferramenta de leitura, não por mim na página; as páginas também têm pequenas inconsistências internas (datas de avaliação, Po-210 e U-238 com duas listas de energias). Antes de publicar qualquer número como definitivo, vale abrir os PDFs.

Atenuação gama (NIST):

- NIST, *X-Ray Mass Attenuation Coefficients* (Hubbell e Seltzer é a autoria usual dessa base; autoria, versão e número do banco de dados não foram conferidos nesta sessão, só os valores das tabelas). https://physics.nist.gov/PhysRefData/XrayMassCoef/ — páginas usadas: chumbo (ElemTab/z82), alumínio (ElemTab/z13), concreto comum (ComTab/concrete), PMMA (ComTab/pmma), ar seco (ComTab/air), Tabela 1 (densidades elementares) e Tabela 2 (densidades de compostos).

Alcance beta e alfa:

- Katz, L.; Penfold, A. S. Range-Energy Relations for Electrons and the Determination of Beta-Ray End-Point Energies by Absorption. *Rev. Mod. Phys.* 24, 28 (1952). DOI 10.1103/RevModPhys.24.28 (a existência e o título foram confirmados em busca; a fórmula usada vem da nota da OSU e foi conferida com o P-32 contra a Ionactive).
- Oregon State University, Extended Campus, NE 581, módulo 3: https://courses.ecampus.oregonstate.edu/ne581/three/index3.htm — fórmulas empíricas para alcance alfa no ar e beta [V-sec].
- Ionactive, "Distance travelled by Alpha Particles in air and other materials" e "...Beta Particles...": https://ionactive.co.uk/resource-hub/guidance/ [V-sec].
- NIST ASTAR/ESTAR (https://physics.nist.gov/PhysRefData/Star/Text/ASTAR.html): confirmado que fornecem alcances CSDA de íons de hélio em ar seco; as tabelas dependem de formulário e não foram geradas aqui. **Pendente:** gerar as tabelas ASTAR (alfa no ar) e ESTAR (elétrons) e conferir contra as relações empíricas acima.

Sonda:

- Ludlum Measurements, Model 44-9 data sheet: https://ludlums.com/images/data_sheets/M44-9-18.pdf — janela de mica 2,0 ± 0,3 mg/cm², área ativa 15,51 cm², sensibilidade a Cs-137 típica de 3300 cpm/(mR/h), eficiência beta 4π típica de 22% (Sr-90/Y-90), 32% (P-32).

## 10. O que não foi possível confirmar

- Tabelas ASTAR e ESTAR (formulário dinâmico), API do LiveChart da AIEA (não acessível daqui), valor exato do NIST para 0,662 MeV e 0,1405 MeV (interpolei), energia máxima do Y-90, curva de resposta angular da sonda, tempo morto, fundo típico de uma sonda pancake, bremsstrahlung no chumbo, fatores de buildup, atenuação da janela de mica para alfa.
- Todo número marcado [H] é escolha de jogo.

## 11. Testes previstos para a etapa 3b

Modelo implementado como função pura (Node, sem Phaser), com estes testes estatísticos e determinísticos: inclinação −2 em log-log para gama em campo livre; variância ≈ média da contagem (índice de dispersão ≈ 1); transmissão gama por material igual a exp(−μx) com os μ da tabela; corte de alcance para beta; zero de alfa a partir de R_ef; paredes que zeram alfa e beta e atenuam gama; atividade constante (perda < 1,2% em 6 min); regressão: as 4 leituras de caracterização que hoje passam serão reescritas de propósito, com motivo no changelog.

## 12. Verificação de jogabilidade (simulação, 13/10/2026)

Pedido: conferir se o modelo é prático e jogável. Método: extraí os 8 mapas reais do jogo rodando em Chromium (6 sorteios de fontes por missão, 48 mapas), e rodei um jogador-robô sobre eles, com o modelo atual (cópia fiel de `measureRadiation`) e com o proposto. Scripts em `tests/simulacao/` (README lá). **Limite do método:** o robô não é uma pessoa. Ele varre o mapa de modo sistemático, mira perfeitamente quando acha sinal e gasta 0,5 s por direção; os tempos servem para *comparar* os modelos e achar problemas, não para prever quanto tempo um aluno leva.

### 12.1 Resultado de tempo (mediana / p90, segundos, 6 repetições, identificação corrigida)

| Missão | Fontes | Limite declarado | Atual | Proposto (kG 0,3; kB 1,0) |
|---|---|---|---|---|
| 1 Treinamento | 2 | sem | 155 / 267 | 124 / 181 |
| 2 Goiânia (Cs-137) | 5 | sem | 194 / 222 | 178 / 205 |
| 3 Radium Girls (só alfa) | 4 | 180 | 188 / 232 | 161 / 205 |
| 4 Chernobyl | 5 | 240 | 262 / 309 | 219 / 255 |
| 5 Lia, Geórgia | 6 | 300 | 337 / 388 | 283 / 341 |
| 6 Zaragoza | 4 | 200 | 184 / 248 | 181 / 223 |
| 7 Mayapuri | 5 | 250 | 187 / 238 | 176 / 210 |
| 8 Fukushima | 8 | 360 | 283 / 340 | 247 / 284 |

O modelo proposto não deixa nenhuma missão mais lenta que a atual, e cai nos mesmos 2 a 5 minutos. Na missão 3 (só alfa), o robô achou as 4 fontes em 22 móveis em ~160 s: a regra de contato do alfa é praticável, porque o jogador tem de olhar móvel por móvel e o clique do contador indica quando acertou.

A insensibilidade é uma conclusão por si só. Variando a escala (25, 50 e 100 cm por tile), a espessura de parede (15, 30 e 50 cm), o piso do gama fora do cone (0, 0,3 e 1), a força das fontes (metade e dobro) e o alcance do alfa (0,5, 1 e 1,5 tile), o tempo médio ficou entre 185 e 200 s e a pior missão entre 255 e 291 s. Ou seja, o tempo é dominado pela varredura e não por um parâmetro delicado do modelo: errar um pouco nos valores [H] não estraga o jogo.

### 12.2 O que o jogador "ouve": fração do piso em que cada tipo é detectável

Posição olhando para a fonte; detectável = contagem esperada na janela ≥ fundo + 3σ. Média sobre os 48 mapas.

| Tipo | Atual | Proposto (janela 1 s) | Proposto (janela 3 s) |
|---|---|---|---|
| gama | 19,8% | 18,4% | 19,6% |
| beta | 34,6% (**fisicamente errado**: o modelo atual dá 10% da força a qualquer distância em linha de visada) | 10,4% | 14,4% |
| alfa | 1,2% | 2,5% | 2,5% |

- O gama continua com a mesma facilidade de achar, agora limitado por parede e por 1/d² em vez de um decaimento linear. Cs-137 atrás de uma parede de 30 cm cai a 0,4% e some.
- O beta fica menos "onipresente" que hoje (o ganho de realismo), mas continua audível numa área razoável. Com os fatores iniciais (0,35) era só 6% do piso, por isso subi para 1,0.
- Dos pontos audíveis, o gradiente (a leitura sobe ao dar um passo de 50 cm em direção à fonte) é legível em ~65% (gama) e ~50% (beta) com janela de 3 s, e em ~53% e ~44% com 1 s. É daí que vem a recomendação D6 (janela de 3 s) e o papel do som.

### 12.3 Bugs do jogo atual encontrados nesta verificação (independentes do Geiger)

1. **Missões 4 e 8 não podem ser concluídas.** O móvel "Damaged Core" (3 × 3 tiles) sempre recebe fonte (6 de 6 sorteios em cada missão). A identificação exige distância ≤ 1,5 tile do centro do móvel; a colisão (raio de 10 px) impede o jogador de chegar a menos de 1,813 tile. Confirmado no jogo real, com o jogador posicionado no ponto legal mais próximo e `handleIdentify()` chamado com leitura 9999: nenhum modal de identificação abriu. Registrado como teste `todo` em `02-fluxo`. Correção proposta (D7): medir a distância até a superfície do móvel.
2. **Velocidade depende da taxa de quadros.** `handleMovement` soma `speed` fixo por quadro (2,5 px; corrida 4,5 px) e não usa o `delta`. Em monitor de 120 ou 144 Hz o personagem anda 2 a 2,4 vezes mais rápido que em 60 Hz. Identificado por leitura do código; **não testei** em tela de alta taxa. Correção na 3d.
3. **`timeLimit` não é aplicado**, e em 4 das 6 missões que declaram limite (3, 4, 5 e 6) o valor fica abaixo do p90 do robô; nelas o robô cumpre o limite em 58% a 83% das corridas. Se alguém implementar o limite como derrota sem recalibrar, boa parte das partidas termina em derrota. Recomendação D8.
4. **A identificação exige leitura instantânea > 10 cps** (`currentReading <= 2 × fundo`) numa amostra de 200 ms. Com contagem Poisson de verdade, essa amostra oscila e pode bloquear a identificação por azar. Na 3c, usar a média de 3 s.

### 12.4 O que a simulação não responde

- Se é divertido para um aluno do ensino médio. Pede teste com gente (a RadSchool seria uma ocasião natural; é decisão sua).
- Aceitação angular real da sonda e o efeito do jogador "mirar" com as setas: no robô a mira é perfeita; para um aluno, o cone de 90° para alfa e beta pode frustrar. Se os testes com alunos mostrarem isso, alargar o cone do alfa e do beta (parâmetro).
- Tempo morto, saturação do contador em altas taxas, buildup: fora do modelo (seção 10).

## 13. Implementação (3b/3c/3d, 14/10/2026)

- Decisões D1 a D8 aprovadas por Arnaldo ("a recomendação está boa").
- **Desvio declarado em D4:** o chumbo ficou com **1 cm** (escolha minha, [H]); a transmissão usa o μ do
  NIST para cada energia (em 1 cm de chumbo: Cs-137 ≈ 0,28; Co-60 ≈ 0,51; Ir-192 ≈ 0,05; Tc-99m ≈ 0, valores calculados com os μ do NIST). Al 3 mm e acrílico 5 mm como previsto.
- Código: `current/js/fisica/geiger.js`; constantes de jogo em `current/js/data/config.js`
  (`TILE_M` 0,5; `PAREDE_CM` 30; `GEIGER_JANELA_S` 3; `GEIGER_PASSO_MS` 200; `IDENTIFY_DISTANCE` 1,0 e
  `OBSERVE_DISTANCE` 2,0, medidas da superfície do móvel).
- Testes: `tests/05-geiger-modelo.test.mjs` (modelo puro) e `tests/04-geiger.test.mjs` (na cena).
- Continuam [P] (sem fonte conferida): tabelas ASTAR/ESTAR, Emax do Y-90, tempo morto, resposta angular real
  da sonda, bremsstrahlung e fator de acúmulo (buildup).

## Decisão registrada em 2026-10-27: fundo do Geiger mantido em 5 cps (escolha didática [H])
**Pergunta:** trocar o fundo de 5 cps por ~0,5–1 cps (valor que o autor considera convencional; não verificado em fonte nesta sessão).
**Experimento:** com `fundoCps: 0,8` rodamos os testes de física: 8 falhas (fundo Poisson, escala S/d², queda 1/d², alfa por contato, blindagem, cone, parede, taxa total), todas por constantes calibradas para 5 cps.
**Efeitos além dos testes:** (1) a identificação exige leitura > 2 × `CONFIG.BG_RADIATION`; com 0,8 cps o limiar cai para 1,6 cps e a leitura exibida (inteiro em janela de 200 ms) oscila entre 0, 1 e 2; (2) o alcance de detecção (3σ acima do fundo) aumenta, mudando a cobertura medida em `tests/simulacao`; (3) uma exibição em cps com fundo baixo ficaria mais legível em cpm (ex.: 48 cpm).
**Decisão:** manter 5 cps. Para adotar um fundo realista é preciso um pacote próprio: exibir cpm ou média móvel, recalibrar S e o limiar de identificação, refazer a simulação de cobertura e atualizar os testes. Não foi feito.

## 2026-10-27 — I-131 passa a ter `type: "gama"` (revisão do cofre, etapa 1)

Decisão de Arnaldo (aprovada em 27/10/2026, a partir da recomendação do Opus). Em `js/data/isotopes.js` o I-131 passou de `type: "beta"` para `type: "gama"` (`symbol: "γ"`, `energyMeV: 0.3645`), de modo que a prateleira do cofre (gama) e o `type` do jogo coincidam. O alcance beta (`betaRangeMgCm2: 214`) ficou no isótopo e a beta entra como componente secundária (peso 98,73/98,86 = 0,9987; alcance Katz-Penfold 213,6 mg/cm²). A física do Geiger muda no máximo ~0,15% (verificado pelo Opus; reconferido pelos testes 04, 05 e 12). A regra "componente primária = `type`" continua valendo; só o I-131 mudou de lado.
Testes ajustados por premissa: 01 (linha do I-131), 04 (a fonte 'gama' da missão 4 passa a poder ser o I-131; a transmissão do chumbo é medida a 4 tiles, fora do alcance beta de 1,78 m), 05 (`fonte(..., {nome})` procura pelo nome) e 12 (ordem `gama+beta`, peso da beta, texto das emissões).
