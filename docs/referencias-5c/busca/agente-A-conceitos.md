# Fichas Mito x Fato - Radiation Hunters - Fatos conceituais (Agente A)

Data da coleta: 2026-10-14. Regra: so consta o que foi lido via WebFetch nesta sessao; o que nao foi encontrado esta marcado "NAO ENCONTRADO".

## Limitacoes metodologicas (leia antes de usar)

1. O WebFetch devolve o texto ja processado por um modelo intermediario, que entrega trechos de ate ~125 caracteres. Os "trechos literais" abaixo sao os devolvidos por essa ferramenta, nao copiados por mim de um PDF/HTML cru. Antes de imprimir uma citacao na ficha final, vale conferir visualmente os itens marcados com (*) na fonte.
2. Acesso direto (curl) a hosts como www-pub.iaea.org e nrc.gov foi negado pela politica de egress; nao contornei. Todas as leituras foram via WebFetch.
3. Paginas oficiais (NRC, EPA, CDC, WHO, UNSCEAR) em geral nao exibem data de publicacao; usei "s.d." (sem data visivel) nesses casos.
4. Nao consegui abrir: UNSCEAR 2008 Vol. I (PDF, erro de fetch), IAEA Safety Glossary, IAEA Pub1118 (erro), IAEA PRTM-1r1 (robots), NIST SI derived units (erro), livro CNEN/Tauhata (robots), cnen.gov.br (redirect/robots), EPA RadTown "Radiation sources and doses" em /radtown/ (erro; usei a versao /radiation/).
5. Legenda Status: V = confirmado em fonte oficial/primaria lida; S = so fonte secundaria; N = nao confirmado. Nivel de leitura: "texto completo" = pagina curta lida inteira; "trecho lido" = parte relevante de PDF/pagina longa; "so resumo de busca" = apenas titulo/snippet de busca (nenhum fato abaixo depende apenas disso).

---

## Topico 1 - Decaimento e meia-vida

### C1.1
- Afirmacao: A meia-vida e o tempo necessario para que metade dos atomos de um radioisotopo se transforme (decaia) em outro isotopo; cada radioisotopo tem a sua meia-vida caracteristica.
- Fonte: US NRC, glossario, "Half-life (radiological)", s.d. https://www.nrc.gov/education-regulatory-research/glossary/half-life-radiological
- Trecho: "The time required for half the atoms of a particular radioisotope to decay into another isotope."
- Nivel de leitura: texto completo (verbete curto; lido em duas URLs NRC equivalentes)
- Status: V
- Obs: Segunda fonte, formulada em termos de atividade: US DOE, DOE-HDBK-1122-99, Module 1.06, p. 1.06-27, 1999: "This time that is required for the activity present to be reduced to one-half we call the half-life." (trecho lido; ano inferido do numero do handbook). Tambem: EPA RadTown Activity 5: "Every radioactive isotope has a specific half-life." (s.d.) https://www.epa.gov/radtown/radtown-radioactive-atom-activity-5-half-life . As duas formulacoes (atomos x atividade) sao equivalentes; para o jogo, "atividade cai pela metade" e suportado pelo DOE.

### C1.2
- Afirmacao: A taxa de decaimento (meia-vida) de um nuclideo nao depende de temperatura nem de pressao e, em geral, nao depende do estado quimico do atomo.
- Fonte: US DOE, DOE-HDBK-1122-99, Module 1.06 "Radioactivity and Radioactive Decay" Study Guide, p. 1.06-2, 1999. https://www.energy.gov/documents/doe-hdbk-1122-99studyguidemodule106pdf
- Trecho: "These transformations are independent of extra-nuclear considerations such as temperature or chemical status of the atom."
- Nivel de leitura: trecho lido (PDF; p. 1.06-27 tambem lista "temperature, pressure, dissolution, or combination" como agentes sem efeito conhecido)
- Status: V
- Obs/divergencia: US NRC, "Decay Rates" (slides, 25/10/2010), slide 15 https://www.nrc.gov/docs/ML1122/ML11229A687.pdf : "In general, the decay constant (or half-life) of a radionuclide is not affected by time, space, pressure, temperature" e ressalva que a forma quimica pode afetar nuclideos que decaem por captura eletronica (Be-7: diferenca de 0,1% entre Be metalico e BeF2). Ou seja, "nao depende de quimica" e verdadeiro para fins de ensino medio, mas a regra estrita tem excecao minuscula (captura eletronica). Recomendo redacao "praticamente nao depende" ou restringir a "temperatura e pressao". (*) conferir o trecho NRC na fonte (extracao do slide veio truncada).

### C1.3
- Afirmacao: O decaimento radioativo de cada atomo e aleatorio; so se pode prever estatisticamente quantos atomos decaem, nao qual nem quando.
- Fonte: US DOE, DOE-HDBK-1122-99, Module 1.06, p. 1.06-15 e 1.06-7, 1999 (mesma URL de C1.2).
- Trecho: "Such disintegrations are spontaneous and random."  (p. 1.06-7: "These emissions occur randomly as each atom tries to achieve a more stable nuclear configuration.")
- Nivel de leitura: trecho lido
- Status: V
- Obs: US NRC "Decay Rates" 2010, slide 3: "Because decay is a random process, it is impossible to say..." (frase truncada na extracao; so confirma o tema). "Estatistico" no sentido de Poisson: ver C8.2 e nota la.

### C1.4
- Afirmacao: Apos sete meias-vidas resta menos de 1% da atividade inicial.
- Fonte: US NRC, Reactor Concepts Manual, "Radiation Terminology", USNRC Technical Training Center, p. 5-5 (rodape "0703", provavelmente 2003). https://www.nrc.gov/reading-rm/basic-ref/students/for-educators/05.pdf
- Trecho: "after seven half lives have passed, there is less than 1 percent of the initial activity remaining."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Checagem aritmetica minha: (1/2)^7 = 0,78%, consistente. Data do documento inferida do rodape, nao impressa explicitamente.

---

## Topico 2 - Inverso do quadrado e distancia/tempo/blindagem

### C2.1
- Afirmacao: Para uma fonte puntual, dobrar a distancia reduz a taxa de exposicao (dose) a um quarto (fator 4).
- Fonte: US NRC, "Clinical Radiation Safety/ALARA Program in Therapy" (slides 11 e 13), s.d. https://www.nrc.gov/docs/ML1201/ML12010A158.pdf
- Trecho: "if you double your distance from a radiation source, you reduce the exposure rate by a factor of four."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Mesma fonte, slide 11: "Doubling the distance drops the exposure rate by one fourth". Documento sem data visivel. Formula: OSHA, "Ionizing Radiation Equations", s.d.: I2 = I1 [d1/d2]^2 (https://www.osha.gov/ionizing-radiation/introduction/ionizing-radiation-equations), agencia federal, nao NRC.

### C2.2
- Afirmacao: A lei do inverso do quadrado vale para fonte puntual (isotropica) e quando a atenuacao no meio e desprezivel; na pratica, distancia e blindagem atuam juntas.
- Fonte: Health Physics Society (HPS), "Ask the Experts" (resposta de George Chabot, PhD, CHP, 2 set. 2011), "Why do we use both distance and attenuation to calculate reduction in photon dose rate?" https://hps.org/publicinformation/ate/q9866/
- Trecho: "The inverse square dependence of photon fluence rate or dose rate on distance from a source applies to the primary photons"
- Nivel de leitura: trecho lido (resposta curta)
- Status: V (sociedade profissional, nao agencia; para "oficial" usar junto com C2.1)
- Obs: Titulo da pagina nao vinha no texto; o titulo acima e o do resultado de busca. A ressalva "ponto isotropico / sem atenuacao significativa" veio em parafrase/trecho da ferramenta: (*) conferir.

### C2.3
- Afirmacao: Os tres principios de protecao radiologica sao tempo (menos tempo perto da fonte), distancia (mais longe) e blindagem (barreira entre voce e a fonte).
- Fonte: US EPA, RadTown "Radiation Protection Activity 2: Time, Distance and Shielding", s.d. https://www.epa.gov/radtown/radtown-radiation-protection-activity-2-time-distance-and-shielding
- Trecho: "The three principles of radiation protection are time, distance and shielding."
- Nivel de leitura: trecho lido
- Status: V
- Obs: A pagina NAO traz a lei do inverso do quadrado nem formula (confirmado). Complemento: EPA, "Protecting Yourself from Radiation", s.d. https://www.epa.gov/radiation/protecting-yourself-radiation : "limiting or minimizing the exposure time reduces the dose from the radiation source." e "The dose of radiation decreases dramatically as you increase your distance from the source" (tambem sem formula).

---

## Topico 3 - Blindagem

### C3.1
- Afirmacao: A radiacao alfa e barrada por uma folha de papel ou pela camada externa da pele.
- Fonte: US NRC, "Radiation Basics", s.d. https://www.nrc.gov/facilities-safety/radiation-protection/radiation-and-its-health-effects/radiation-basics
- Trecho: "can be blocked by a sheet of paper, skin, or even a few inches of air."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Confirmado por NRC Reactor Concepts Manual, p. 5-7: "Alpha particles are easily shielded (or stopped) by a thin sheet of paper or the body's outer layer of skin." Cuidado de redacao: alfa e barrada externamente, mas e perigosa se inalada/ingerida (nao li fonte sobre isso nesta sessao; nao afirmar sem fonte).

### C3.2
- Afirmacao: A radiacao beta e barrada por camadas finas de metal leve (aluminio) ou plastico.
- Fonte: US NRC, Reactor Concepts Manual "Radiation Terminology", p. 5-8 (c. 2003). https://www.nrc.gov/reading-rm/basic-ref/students/for-educators/05.pdf
- Trecho: "Beta particles are best shielded by thin layers of light metals (such as aluminum or copper) and plastics."
- Nivel de leitura: trecho lido
- Status: V
- Obs/divergencia: NRC "Radiation Basics": "a thin sheet of metal or plastic or a block of wood can stop beta particles." NRC "Shielding Radiation: Alphas, Betas, Gammas and Neutrons" (slides, capa 05/07/2011), slide 14: betas podem ser completamente barradas; "It rarely requires more than 5- 10 mm of material to do so." https://www.nrc.gov/docs/ml1122/ML11229A721.pdf . Portanto "poucos mm" nao aparece literalmente: a fonte diz "camadas finas" e "raramente mais que 5-10 mm", e o alcance depende da energia (regra de Feather, slide 15). Evitar numero exato "3 mm" sem fonte. "Acrilico" nao aparece; fontes dizem "plastics". Aluminio e citado (Reactor Concepts Manual). NIST ESTAR existe (https://physics.nist.gov/PhysRefData/Star/Text/ESTAR.html, so resumo de busca), nao lido.

### C3.3
- Afirmacao: Para radiacao gama sao melhores materiais densos, como chumbo e concreto; a gama nao e "parada" por uma folha fina, so atenuada.
- Fonte: US NRC, Reactor Concepts Manual, p. 5-9. https://www.nrc.gov/reading-rm/basic-ref/students/for-educators/05.pdf
- Trecho: "The best shielding materials for gamma rays are very dense materials such as lead, concrete, and uranium."
- Nivel de leitura: trecho lido
- Status: V
- Obs: NRC "Radiation Basics": "Several feet of concrete or a few inches of dense material (such as lead) are able to block these types of radiation." EPA "Protecting Yourself from Radiation": "Barriers of lead, concrete or water provide protection from penetrating gamma rays". NRC slide 9 (deck 2011): "For photons (x-rays, gamma rays) the lower the atomic number of the shield, the thicker it must be."

### C3.4
- Afirmacao: A gama atenua exponencialmente com a espessura do material; a camada semirredutora (HVL) e a espessura que reduz a intensidade pela metade.
- Fonte (exponencial): NIST, "X-Ray Mass Attenuation Coefficients - Section 2", s.d. https://physics.nist.gov/PhysRefData/XrayMassCoef/chap2.html . Fonte (HVL): US NRC "Shielding Radiation..." slide 55 (URL em C3.2).
- Trecho NIST: "exponential attenuation law" (feixe estreito monoenergetico; I/I0 = exp[-(mu/rho)x]). Trecho NRC: "A half value layer is the thickness of material that reduces the radiation intensity by one-half."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Lei exponencial vale para feixe estreito monoenergetico; em geometria larga ha espalhamento (nao li fonte sobre fator de build-up). NIST descreve base de dados 1 keV-20 MeV (https://www.nist.gov/pml/x-ray-mass-attenuation-coefficients). XCOM em si nao foi lido.

### C3.5
- Afirmacao: Blindar beta com material de numero atomico alto (chumbo) gera bremsstrahlung (raios X penetrantes); por isso se prefere material de baixo Z (plastico) para beta.
- Fonte: US NRC, "Shielding Radiation: Alphas, Betas, Gammas and Neutrons", slides 16-17 (capa 05/07/2011). https://www.nrc.gov/docs/ml1122/ML11229A721.pdf
- Trecho: "A good shielding material for betas minimizes bremsstrahlung i.e., low Z material such as plastic."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Slide 16: "the very act of doing so produces bremsstrahlung, a more penetrating type of radiation." Segunda fonte: HPS, Ask the Experts, George Chabot, 14 jun. 2017, https://hps.org/publicinformation/ate/q12014/ : "so it is often preferable to use lower atomic number materials (such as plastic) to shield against beta radiation." (HPS tambem diz que o chumbo para betas com espessuras menores, mas a frequencia da interacao de bremsstrahlung cresce com Z.)

---

## Topico 4 - ALARA

### C4.1
- Afirmacao: ALARA significa "tao baixo quanto razoavelmente exequivel": fazer todo esforco razoavel para manter as exposicoes o mais abaixo possivel dos limites de dose, considerando tecnologia, economia e interesse publico.
- Fonte: US NRC, glossario "ALARA", s.d. https://www.nrc.gov/reading-rm/basic-ref/glossary/alara.html (citando 10 CFR 20.1003); conferido tambem em eCFR 10 CFR 20.1003 https://www.ecfr.gov/current/title-10/chapter-I/part-20/subpart-A/section-20.1003
- Trecho (eCFR): "ALARA (acronym for 'as low as is reasonably achievable') means making every reasonable effort to maintain exposures to radiation as far below the dose limits"
- Nivel de leitura: texto completo (verbete)
- Status: V
- Obs: Definicao completa e longa (cont.: "...as is practical consistent with the purpose for which the licensed activity is undertaken, taking into account the state of technology, the economics of improvements..."). Para a ficha, usar a parte curta acima. Redacao do NRC (eCFR) usa "as is reasonably achievable"; outras fontes usam "as reasonably achievable". Definicao IAEA literal: NAO ENCONTRADO (Safety Glossary e Pub1118 nao abriram).

### C4.2
- Afirmacao: O conceito vem das recomendacoes da ICRP: em 1954 pedia-se o "nivel mais baixo possivel"; em 1958 (Pub. 1) "tao baixo quanto praticavel"; a redacao "as low as reasonably achievable" aparece na Pub. 26 (1977).
- Fonte: R.H. Clarke e J. Valentin, "The History of ICRP and the Evolution of its Policies", ICRP Publication 109 (Ann. ICRP 39(1)), 2009, pp. 89-96. https://www.icrp.org/docs/The%20History%20of%20ICRP%20and%20the%20Evolution%20of%20its%20Policies.pdf
- Trecho: "all exposures shall be kept as low as reasonably achievable, economic and social factors being taken into account." (Pub. 26, 1977, par. 74)
- Nivel de leitura: trecho lido
- Status: V
- Obs: O documento nao diz quem cunhou a sigla "ALARA" nem quando foi usada pela primeira vez (explicitamente). Nao afirmar "inventada pela ICRP em 1977"; afirmar apenas que a formulacao "as low as reasonably achievable" consta na Pub. 26 (1977). Pub. 9 (1966): "as low as is readily achievable".

### C4.3
- Afirmacao: A logica do ALARA e que se assume que qualquer exposicao pode trazer algum risco, entao e sensato manter doses o mais baixas razoavelmente possivel.
- Fonte: US NRC, "Backgrounder on Tritium, Radiation Protection Limits, and Drinking Water Standards", s.d. https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/tritium-radiation-fs
- Trecho: "Since it is assumed that any exposure to radiation could pose some health risk, it makes sense to keep radiation doses as low as reasonably achievable"
- Nivel de leitura: trecho lido
- Status: V
- Obs: A pagina tambem diz "ALARA (as low as reasonably achievable) is a radiation safety principle for minimizing doses and releases". Cuidado: a frase fala de pressuposto regulatorio ("it is assumed"), nao afirma que toda dose cause dano.

---

## Topico 5 - Radiacao natural de fundo

### C5.1
- Afirmacao: A dose anual media mundial devida a fontes naturais e de cerca de 2,4 mSv por ano (com variacao regional grande).
- Fonte: WHO, "Radiation: Ionizing radiation" (Q&A), 26 out. 2020. https://www.who.int/news-room/questions-and-answers/item/radiation-ionizing-radiation
- Trecho: "Each person is exposed to an average of 2.4 mSv per year of ionizing radiation from natural sources."
- Nivel de leitura: trecho lido
- Status: V
- Obs/divergencias: (a) UNSCEAR FAQ (pagina oficial, sem ano visivel; nao cita edicao do relatorio) https://www.unscear.org/unscear/en/areas-of-work/radiation-faq.html : tabela com total natural 2,4 mSv e faixa tipica 1-13 mSv; tambem "Sizeable population groups receive 10-20 mSv annually." (b) WHO: "In some areas around the world the natural radiation dose may be 5 to 10-times higher for large number of people." (c) IAEA Bulletin 2/1989 (Gonzalez e Anderer, "Radiation versus radiation: Nuclear energy in perspective"), fonte principal UNSCEAR 1988: "The average annual dose from natural sources is some 2.4 millisievert (mSv)." (d) B.G. Bennett (UNSCEAR), 1993, IAEA, "Natural background radiation exposures world-wide": "assessed by UNSCEAR to be 2.4 mSv per year" (abstract via INIS). O valor 2,4 mSv e estavel de 1988 a 2020. Nao consegui abrir o UNSCEAR 2008 Vol. I nem UNSCEAR 2020/21 diretamente: a atribuicao "UNSCEAR 2008" especifica fica N; "UNSCEAR (varias edicoes)" e V.

### C5.2
- Afirmacao: A dose natural media mundial divide-se, aproximadamente, em radonio inalado (maior parcela, ~1,26 mSv), radiacao terrestre externa (~0,48), raios cosmicos (~0,39) e ingestao de alimentos/agua (~0,29).
- Fonte: UNSCEAR, pagina de FAQ "Answers to frequently asked questions about radiation" (url acima), s.d.
- Trecho: "The inert radioactive gas, radon, is created by the uranium and thorium in the soil;"  (a tabela numerica foi extraida pela ferramenta, sem trecho literal de frase)
- Nivel de leitura: trecho lido
- Status: V (numeros da tabela) (*) conferir tabela na pagina; soma 1,26+0,48+0,29+0,39 = 2,42, coerente com 2,4.
- Obs: IAEA Bulletin 1989 usa outra repartição (c. 2,0 mSv terrestre + 0,4 cosmica = 2,4), com radonio dentro de "terrestre" e fonte UNSCEAR 1988. A pagina UNSCEAR nao menciona K-40.

### C5.3
- Afirmacao: O proprio corpo humano contem material radioativo natural, principalmente potassio-40; alem disso ha radonio, raios cosmicos e radiacao do solo.
- Fonte: US EPA, "Radiation Sources and Doses", s.d. https://www.epa.gov/radiation/radiation-sources-and-doses
- Trecho: "Traces of radioactive materials can be found in the body, mainly naturally occurring potassium-40."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Mesma pagina: "The radioactive gases radon and thoron, which are created when other naturally occurring elements undergo radioactive decay." Complemento: EPA "Background Radiation" (https://www.epa.gov/radtown/background-radiation): "The natural radionuclide radon ... is the largest natural source of exposure." US NRC "Doses in Our Daily Lives" (s.d.) cita dose interna media ~30 mrem/ano (K-40, Ra-226).

### C5.4 (valor brasileiro)
- Afirmacao: dose anual media natural do Brasil.
- Fonte: NAO ENCONTRADO. Nenhuma pagina CNEN/IRD lida traz valor medio nacional de fundo em mSv/ano. Paginas lidas: IRD/CPRM noticia (05/10/2021) so cita "estimativa de dose natural da população" sem numero e areas de radioatividade natural elevada; CNEN/INCA informe 030 (09/11/2011) sem numero.
- Status: N
- Obs: A pagina da INB (empresa, nao orgao regulador) "Quanta radiacao natural uma pessoa recebe por ano?" (https://www.inb.gov.br/Contato/Perguntas-Frequentes/Pergunta/Conteudo/quanta-radiacao-natural-uma-pessoa-recebe-por-ano) diz: "A dose média desses dois tipos de radiação que uma pessoa recebe por ano é de 2,8 mSv" (natural + artificial combinadas, sem separar; sem ano). Status S e quantidade diferente: nao usar como "fundo natural brasileiro". Recomendo ficha usar so o valor mundial (2,4 mSv) e dizer "varia de lugar para lugar".

### C5.5 (divergencia EUA, para nao misturar numeros)
- Afirmacao: Nos EUA a dose media total (natural + medica etc.) e maior que a media natural mundial.
- Fonte: US EPA "Radiation Sources and Doses": "the average annual radiation dose per person in the U.S. is 6.2 millisieverts." (citando NCRP). US NRC "Doses in Our Daily Lives": "Half of this dose comes from natural background radiation." (~0,62 rem total).
- Status: V
- Obs: Nao confundir 6,2 mSv (EUA, todas as fontes) com 2,4 mSv (mundial, so natural). O "metade natural" do NRC e ~3,1 mSv, valor derivado, nao impresso.

---

## Topico 6 - Contaminacao x irradiacao

### C6.1
- Afirmacao: Estar exposto a radiacao nao significa estar contaminado; contaminacao exige material radioativo sobre ou dentro do corpo (ex.: um raio X expoe, mas nao contamina).
- Fonte: CDC, "Radiation Contamination Versus Exposure | Radiation Emergencies", s.d. https://www.cdc.gov/radiation-emergencies/infographic/contamination-versus-exposure.html
- Trecho: "For a person to be contaminated, radioactive material must be on or inside of his or her body."
- Nivel de leitura: texto completo (infografico curto)
- Status: V
- Obs: Mesma pagina: "A person exposed to radiation is not necessarily contaminated with radioactive material." e "When a person has an x-ray, he or she is exposed to radiation but is not contaminated." CDC "What Causes Contamination versus Exposure" (https://www.cdc.gov/radiation-emergencies/causes/index.html): "Radioactive contamination occurs when radioactive material is deposited on or in an object or a person." A CDC nao diz literalmente "pessoa irradiada nao fica radioativa" (so implica); para isso, C6.2.

### C6.2
- Afirmacao: Uma pessoa irradiada externamente nao fica radioativa e nao espalha contaminacao.
- Fonte: REAC/TS (ORAU/ORISE, Radiation Emergency Assistance Center/Training Site), "Types of Radiation Exposure", s.d. https://orise.orau.gov/reacts/resources/guide/types-of-radiation-exposure.html
- Trecho: "Following irradiation, an individual is not radioactive, cannot spread radioactive contamination."
- Nivel de leitura: trecho lido
- Status: V (centro de referencia do DOE; operado por ORAU)
- Obs: Mesma pagina: "Irradiation occurs when all or part of the body is exposed to penetrating radiation from an external source." e "Contamination means that radioactive materials are spread to an unintended location."

### C6.3
- Afirmacao: A contaminacao externa (na pele, cabelo, roupa) pode ser removida tirando a roupa e lavando; a interna (engolida/inalada) exige tratamento medico.
- Fonte: WHO, material de treinamento "Contamination vs exposure" (PDF, sem titulo/data visiveis; URL https://cdn.who.int/media/docs/default-source/radiation/4_contamination-vs-exposure_final.pdf?sfvrsn=a24a40da_3)
- Trecho: "A person can get exposed externally without being actually contaminated. For example, when we get X-ray or CT-scan."
- Nivel de leitura: texto completo
- Status: V (WHO), mas sem data/autor identificaveis
- Obs: Mesmo doc: contaminacao externa "can be removed simply by taking off the clothes, washing, or wiping." (*) conferir; a ferramenta nao conseguiu identificar titulo/data.

---

## Topico 7 - Mito "radioativo brilha verde"

### C7.1
- Afirmacao: A radiacao ionizante nao e percebida pelos sentidos humanos (nao se ve, ouve, cheira, prova nem sente); por isso se usam instrumentos.
- Fonte: US NRC, "Detecting Radiation", s.d. https://www.nrc.gov/about-nrc/radiation/health-effects/detection-radiation
- Trecho: "It cannot be seen, heard, smelled, tasted, or felt."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Tambem: "simple visual inspection is insufficient to identify radioactive materials". Ressalva (honestidade): em doses muito altas pode haver sensacoes/luz em alguns contextos (ex.: flashes visuais em astronautas/pacientes); nao li fonte nesta sessao, entao nao afirmar.

### C7.2
- Afirmacao: A luz azul em agua de reatores e radiacao Cherenkov (particulas carregadas mais rapidas que a luz naquele meio), nao a "radioatividade brilhando"; cor tipica azul/violeta.
- Fonte: IAEA, "What is Cherenkov Radiation?", s.d. https://www.iaea.org/newscenter/news/what-is-cherenkov-radiation
- Trecho: "Cherenkov radiation is present, among others, in the water that surrounds the fuel in nuclear reactors."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Mesma pagina: "Whenever that happens, a blue or violet glow occurs." A pagina NAO afirma explicitamente que Cherenkov "nao e radioatividade"; diz que "usually occurs in radioactive materials immersed in water". Segunda fonte nao lida (DOE "Cherenkov Radiation, Explained", so resumo de busca).

### C7.3
- Afirmacao: Tintas luminosas antigas (ex.: mostradores com radio) brilham porque a energia da radiacao excita um material luminescente (fosforo, como sulfeto de zinco); o brilho vem do fosforo, nao da radiacao em si.
- Fonte: Museum of Radiation and Radioactivity (ORAU), "Radioluminescent Items", s.d. https://www.orau.org/health-physics-museum/collection/radioluminescent/index.html
- Trecho: "The light emitted by the paint is due to the radiation energy deposited in the luminescent crystals"
- Nivel de leitura: trecho lido
- Status: S (museu de entidade academica, nao agencia oficial)
- Obs: Mesma pagina: "Zinc sulfide powder has been the most widely used luminescent material." e radio-226 foi o primeiro radionuclideo usado. Fonte oficial para sustentar: US EPA RadTown "Radioactivity in Antiques" (s.d.) https://www.epa.gov/radtown/radioactivity-antiques : "These paints were used on the dials of clocks and watches to make them glow-in-the-dark." (a EPA descreve radioluminescencia, sem detalhar o mecanismo). Nome tecnico "fosforescencia" (usado no pedido): a fonte ORAU usa "luminescent/radioluminescent"; para as tintas radioativas o termo correto e radioluminescencia; nao li fonte que as chame de fosforescencia.

### C7.4 (Goiania; leitura do relatorio IAEA)
- Afirmacao: No acidente de Goiania (1987), o po de cloreto de cesio-137 foi descrito no relatorio da AIEA como brilhando em azul no escuro; o relatorio sugere "fluorescencia ou radiacao Cerenkov" ligada a absorcao de umidade, sem determinar a causa. Nao ha mencao a cor verde.
- Fonte: IAEA, "The Radiological Accident in Goiania", Vienna, 1988 (Pub815). https://www-pub.iaea.org/MTCD/Publications/PDF/Pub815_web.pdf
- Trechos (Resumo Executivo, p. 1): "He noticed that the source material glowed blue in the dark."  (Sec. 3.3, p. 30): "This glow is thought to be associated with fluorescence or Cerenkov radiation" / "due to the absorption of moisture by the source."
- Nivel de leitura: trecho lido (c. 100 mil dos ~117 mil caracteres, e o final tambem consultado em segunda chamada; buscas por "green", "luminous", "sparkl" nao retornaram ocorrencias; "glitter" aparece na tabela II, p. 24, sobre pessoas passando o po na pele "as with the glitter used at carnival time")
- Status: V
- Obs: Numeracao de paginas e inferida de marcadores do texto OCR (pode haver erro de +-1). Mesmo relatorio: o interesse pelo brilho azul influenciou o curso do acidente (Sec. 3.3, p. 29: "the interest aroused by the blue glow that emanated from the radioactive caesium chloride"). Corroboracao: IAEA Bulletin 4/1988, "Radiation sources: Lessons from Goiania" repete "glowed blue in the dark" (https://iaea.org/sites/default/files/publications/magazines/bulletin/bull30-4/30402781017.pdf). Implicacao para o mito: nao e "luz verde"; o brilho azul de Goiania existiu, mas o relatorio so oferece hipotese (fluorescencia ou Cerenkov), e NAO deve ser apresentado como regra geral de que "material radioativo brilha". Nem toda fonte brilha.

---

## Topico 8 - Geiger-Muller

### C8.1
- Afirmacao: O Geiger detecta ionizacao no gas do tubo e mostra contagens (por minuto/segundo); ele nao diz o tipo nem a energia da radiacao e, por si so, nao mede dose.
- Fonte: US NRC, "What is a Geiger Counter?", s.d. https://www.nrc.gov/reading-rm/basic-ref/students/science-101/what-is-a-geiger-counter
- Trecho: "indicates when an ion pair is created, but nothing about the type of radiation or its energy."
- Nivel de leitura: trecho lido
- Status: V
- Obs: Mesma pagina: leituras em "counts per minute"; fundo tipico "five to 60 counts per minute or more"; "it clicks every time an ion pair is created." Taxa de exposicao em mR/h exige instrumento "calibrated to read a particular type of radiation". "Nao mede dose diretamente" e inferencia coerente (cpm vs mR/h), nao frase literal da NRC. HPS: GM e "A radiation detection and measuring instrument" com tubo de gas e pulsos de corrente (https://hps.org/publicinformation/radterms/geiger-mueller-counter/).

### C8.2
- Afirmacao: A leitura do Geiger flutua de forma aleatoria porque a emissao de radiacao e um processo estatistico; flutuacoes normais sao esperadas mesmo com taxa constante.
- Fonte: HPS, Ask the Experts, "Are these reading spikes on the GM a concern?", George Chabot, PhD, CHP, 4 jun. 2012. https://hps.org/publicinformation/ate/q10281/
- Trecho: "Much of this variability is a natural result of the normal statistical fluctuations"
- Nivel de leitura: trecho lido
- Status: V (sociedade profissional)
- Obs: Mesma pagina: erro varia inversamente com a raiz quadrada da taxa de contagem; maioria das leituras dentro de ~3 desvios-padrao. A palavra "Poisson" NAO apareceu em nenhuma fonte lida; o slide da IAEA (Nuclear Medicine Handbook, Cap. 5) nao abriu (robots). Para "Poisson" explicito: N (nao confirmado). Pode-se usar "estatistica de contagem" sem citar a distribuicao.

### C8.3
- Afirmacao: A resposta do Geiger depende do tipo e da energia da radiacao (instrumento "dependente de energia"); detecta alfa, beta e gama, sem distinguir energias.
- Fonte: US NRC, "Chapter 5: Instrumentation" (slides, sem data). https://www.nrc.gov/docs/ML1117/ML111711278.pdf
- Trecho: "GM detectors are not able to determine the type/energy level of the radiation (cannot differentiate energies)." (slide 9); tabela slide 16: "Energy dependent"
- Nivel de leitura: trecho lido
- Status: V
- Obs: (*) tabela do slide 16 veio achatada pela extracao; a linha "Detects" sugere alfa, beta e gama para GM (inferencia da leitura de colunas, conferir). HPS "How to Detect Radiation" menciona so "energy-compensated GM tubes may be employed for exposure measurements" (https://hps.org/ate_faq/radiationdetection/). Fabricante: nao consultado.

---

## Topico 9 - Unidades

### C9.1
- Afirmacao: O becquerel (Bq) mede atividade: 1 Bq = 1 desintegracao por segundo.
- Fonte: US NRC, Reactor Concepts Manual, p. 5-24. https://www.nrc.gov/reading-rm/basic-ref/students/for-educators/05.pdf
- Trecho: "The SI unit for activity is the becquerel. It is equal to one disintegration per second."
- Nivel de leitura: trecho lido
- Status: V
- Obs: EPA, "Radiation Terms and Units", s.d. https://www.epa.gov/radiation/radiation-terms-and-units : "One becquerel (Bq) is equal to one radioactive decay per second." BIPM, SI Brochure 9a ed., Tabela 4, p. 134: Bq em unidades de base = s^-1 (grandeza "activity referred to a radionuclide"); nota (d) da tabela restringe o uso do Bq a processos estocasticos (https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-EN.pdf). Conversao: 1 Ci = 37 bilhoes de Bq (NRC p. 5-25).

### C9.2
- Afirmacao: O gray (Gy) mede dose absorvida: 1 Gy = 1 joule de energia absorvida por quilograma de material.
- Fonte: US EPA, "Radiation Terms and Units", s.d. (URL em C9.1).
- Trecho: "1 gray (Gy) = 1 joule(J)/kilogram(kg)."  (e "Absorbed dose describes the amount of energy deposited per unit mass in an object or person.")
- Nivel de leitura: trecho lido
- Status: V
- Obs/divergencia: ATENCAO, a leitura do NRC Reactor Concepts Manual p. 5-25 (via WebFetch) devolveu "A Gray is equal to 0.1 Joule of energy deposited in one kilogram of matter.", inconsistente com o SI (1 Gy = 1 J/kg) e com o proprio manual (1 Gy = 100 rad; 1 rad = 0,01 J/kg). Pode ser erro do manual ou da extracao; nao verificado. Divergencia registrada; NAO usar o valor 0,1 J/kg. Fontes consistentes com 1 J/kg: EPA; BIPM SI Brochure 9a ed. (p. 134, Tab. 4: Gy = J/kg, "absorbed dose, kerma"; p. 137: "The ratio of deposited energy to mass is termed absorbed dose D."); IAEA ORPNET (slides): "The SI unit of absorbed dose is the joule per kilogram (J/kg), termed the gray (Gy)". (*) Se for citar o manual NRC, avisar o erro; preferir EPA/BIPM.

### C9.3
- Afirmacao: O sievert (Sv) mede dose equivalente/efetiva, que leva em conta o tipo de radiacao e a sensibilidade dos tecidos; tambem vale 1 J/kg, mas e usado para efeito biologico, 1 Sv = 100 rem.
- Fonte: US NRC, glossario "Sievert (Sv)", s.d. https://www.nrc.gov/reading-rm/basic-ref/glossary/sievert-sv
- Trecho: "The international system (SI) unit for dose equivalent equal to 1 Joule/kilogram. 1 sievert = 100 rem."
- Nivel de leitura: texto completo (verbete)
- Status: V
- Obs: BIPM SI Brochure 9a ed., p. 134 e 137: Sv, grandeza "dose equivalent", base m^2 s^-2 = J/kg; "the quantity dose equivalent H = Q D is the product of the absorbed dose D and a numerical quality factor Q"; "The SI units gray and sievert are used for absorbed dose and dose equivalent, respectively, rather than joule per kilogram." IAEA ORPNET (slides) para dose efetiva: "special name for the unit of equivalent dose is sievert (Sv)". A parte "sensibilidade dos tecidos" (fator de ponderacao tecidual) NAO foi lida em fonte nesta sessao; a ficha deve se restringir a "dose equivalente/efetiva e seu fator de qualidade Q" (BIPM) ou omitir. Em ensino medio: Gy e energia/kg; Sv corrige pelo efeito biologico.

---

## Resumo de contagem e lacunas

| Topico | Fatos | Lacunas |
|---|---|---|
| 1 Meia-vida | 4 (C1.1-C1.4) | "Estatistico" ok; nao achei LNHB/NIST; ressalva captura eletronica (C1.2) |
| 2 Inverso do quadrado | 3 (C2.1-C2.3) | Fonte IAEA/CDC/EPA com "dobrar distancia = 1/4" literal: nao achei (so NRC e OSHA formula) |
| 3 Blindagem | 5 (C3.1-C3.5) | "poucos mm" nao literal; acrilico nao citado; XCOM/ESTAR/ASTAR nao lidos |
| 4 ALARA | 3 (C4.1-C4.3) | Definicao IAEA literal: NAO ENCONTRADO; criador da sigla nao identificado |
| 5 Fundo natural | 5 (C5.1-C5.5), dos quais C5.4 = N | Valor brasileiro: NAO ENCONTRADO; UNSCEAR 2008/2020 PDF nao aberto |
| 6 Contaminacao x irradiacao | 3 (C6.1-C6.3) | CDC nao diz literalmente "nao fica radioativa"; REAC/TS diz |
| 7 Brilho | 4 (C7.1-C7.4) | C7.3 so fonte secundaria (ORAU museu); termo "fosforescencia" nao confirmado |
| 8 Geiger | 3 (C8.1-C8.3) | "Poisson" explicito: N; fabricante nao consultado |
| 9 Unidades | 3 (C9.1-C9.3) | Erro no manual NRC (Gy = 0,1 J/kg); fator de ponderacao tecidual nao lido |
