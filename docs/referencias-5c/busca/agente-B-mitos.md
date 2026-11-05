# Banco de fichas "Mito x Fato" – Radiation Hunters (Agente B)

Data da coleta: 2026-10-14. Método: WebSearch + WebFetch. Nada foi preenchido de memória.

## Avisos de método (leia antes de usar)

1. **Trechos literais**: o WebFetch devolve extrações feitas por um modelo pequeno sobre o texto da página. Os trechos entre aspas abaixo são os que essa ferramenta devolveu entre aspas. Não consegui conferi-los contra o HTML bruto, porque o curl é bloqueado pelo proxy (HTTP 403). Por isso o "Nível de leitura" máximo usado é **trecho lido**. Nenhum item é "texto completo". Antes de publicar no jogo, convém conferir cada trecho na página original.
2. **Legenda de Status**: V = confirmado em página/documento oficial lido. S = só fonte secundária, ou oficial mas derivada (slides, wiki, relato de terceiros sobre o relatório). N = não confirmado.
3. **Datas**: quando a página mostra "última revisão" em 2026, registrei como aparece. Quando a página não mostra data, escrevi "sem data na leitura".
4. **Fontes que NÃO consegui abrir** (falha de fetch): texto integral do IAEA GSR Part 3 (Pub1578), UNSCEAR 2024 Vol. I, UNSCEAR 2000 Vol. I, UNIS/ONU 2026, WHO IRIS 10665/39463. Itens que dependem delas estão marcados.
5. O NN 3.01 que li é a revisão de 2024 (Resolução CNEN 323/24), com o título "Requisitos Básicos de Radioproteção e Segurança Radiológica de Fontes de Radiação". O pedido citava "Diretrizes Básicas" (versão de 2014). A versão de 2014 **não** foi lida.

---

## TEMA 1 – "Qualquer quantidade de radiação mata / é sempre perigosa"

### M1.1
- **Mito**: Qualquer exposição à radiação provoca doença aguda ou morte.
- **Fato**: A síndrome aguda da radiação exige dose alta, de radiação penetrante, recebida em tempo muito curto. A fonte indica dose acima de ~0,7 Gy. Sintomas leves podem aparecer a partir de 0,3 Gy.
- **Fonte**: CDC (EUA), Radiation Emergencies, 23/04/2024, "Acute Radiation Syndrome: Information for Clinicians". URL lida: https://www.cdc.gov/nceh/radiation/emergencies/arsphysicianfactsheet.htm. A busca também listou a URL https://cdc.gov/radiation-emergencies/hcp/clinical-guidance/ars.html, que não abri.
- **Trecho**: "The radiation dose must be large (i.e., greater than 0.7 Gray (Gy)" / "Mild symptoms may be observed with doses as low as 0.3 Gy or 30 rads."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: O CDC dá ~0,7 Gy e o WHO dá ~1 Sv (M1.2). Registrar as duas faixas. O CDC define ARS como causada por "a high dose of penetrating radiation in a very short period of time", o que cobre o argumento de taxa de dose e tempo.

### M1.2
- **Mito**: (mesmo de M1.1)
- **Fato**: Segundo a OMS, o limiar de dose para a síndrome aguda da radiação é cerca de 1 Sv (1000 mSv). O risco de câncer cresce com a dose, e há aumento significativo em estudos acima de 100 mSv.
- **Fonte**: WHO, 27/07/2023, "Ionizing radiation and health effects" (fact sheet). https://www.who.int/news-room/fact-sheets/detail/ionizing-radiation-and-health-effects
- **Trecho**: "the dose threshold for acute radiation syndrome is about 1 Sv (1000 mSv)." / "a significant increase of cancer risk at doses above 100 mSv."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Diverge em número do CDC (0,7 Gy). Sv e Gy são numericamente equivalentes para radiação gama/X, mas a OMS fala em "Sv". Registrar as duas fontes.

### M1.3
- **Mito**: (mesmo de M1.1)
- **Fato**: A menor dose que pode causar síndrome aguda é 100 rem (1000 mSv). Doses típicas do cotidiano ficam muito abaixo disso.
- **Fonte**: CDC, "Radiation Thermometer", 02/01/2024. https://www.cdc.gov/radiation-emergencies/causes/radiation-thermometer.html
- **Trecho**: "The lowest dose that could cause acute radiation syndrome is 100 rem / 1000 mSv."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Consistente com o WHO (1 Sv). Diverge do próprio CDC em M1.1 (0,7 Gy, mais "leve a partir de 0,3 Gy"). A ficha deve dizer "da ordem de 1 Sv".

### M1.4
- **Mito**: (mesmo de M1.1)
- **Fato**: Doses muito altas (acima de 500 mSv) tendem a matar células. Uma dose de corpo inteiro de 3.500 a 5.000 mSv mata metade das pessoas em 30 dias. Doses baixas espalhadas por longo tempo não causam problema imediato.
- **Fonte**: U.S. NRC, "Backgrounder on Biological Effects of Radiation", jun/2024 (revisão exibida: 11/08/2026). https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/bio-effects-radiation
- **Trecho**: "High radiation doses (greater than 50,000 mrem, or 500 mSv) tend to kill cells." / "Low doses spread out over a long period would not cause an immediate problem."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A letalidade (~50% em 30 dias com 350.000–500.000 mrem = 3.500–5.000 mSv) está na mesma página: "50 percent of people would die within thirty days...". A página usa mrem/mSv, não Gy. Isto responde ao eixo "taxa de dose e tempo".

### M1.5
- **Mito**: Existe uma dose "segura" abaixo da qual a radiação é inofensiva (ou, ao contrário, que qualquer dose é igualmente perigosa).
- **Fato**: Os padrões de proteção partem do modelo linear sem limiar (LNT): não se assume dose totalmente segura. A NRC reconhece que o modelo é conservador e pode superestimar o risco, e que não há dados firmes ligando câncer a doses abaixo de ~100 mSv.
- **Fonte**: U.S. NRC, mesma página de M1.4.
- **Trecho**: "there is no threshold below which radiation doses are safe." / "This means the model may overestimate risk." / "no data to establish a firm link between cancer and doses below about 10,000 mrem"
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: 10.000 mrem = 100 mSv. Há **divergência científica** real: ver M1.7 (UNSCEAR) e M1.8 (HPS). A ficha deve apresentar o LNT como pressuposto de proteção, não como fato medido a baixas doses.

### M1.6
- **Mito**: (mesmo de M1.5; efeitos determinísticos x estocásticos)
- **Fato**: Na ICRP, efeito determinístico é lesão em populações de células "caracterizada por uma dose-limiar". O LNT é um modelo que assume que, na faixa de baixas doses, qualquer dose acima de zero aumenta o risco de câncer.
- **Fonte**: ICRP, 2007, "The 2007 Recommendations of the ICRP", ICRP Publication 103 (Ann. ICRP 37(2-4)), **extrato gratuito (glossário e sumário executivo)**. https://www.icrp.org/docs/ICRP_Publication_103-Annals_of_the_ICRP_37(2-4)-Free_extract.pdf
- **Trecho**: "Injury in populations of cells, characterised by a threshold dose" (glossário, "Deterministic effect") / LNT: "A dose-response model which is based on the assumption that, in the low dose range, radiation doses greater than zero will increase the risk of excess cancer."
- **Nível de leitura**: trecho lido (somente extrato; o documento integral não foi lido)
- **Status**: V
- **Obs.**: O extrato não contém a Tabela 6 nem comentário sobre incerteza específica a baixas doses. Disse apenas: "The Commission is aware of uncertainties and lack of precision of the models and parameter values."

### M1.7
- **Mito**: (mesmo de M1.5)
- **Fato**: O UNSCEAR afirma que, por causa das grandes incertezas nas estimativas de risco a doses muito baixas, não recomenda multiplicar doses muito baixas por grandes números de pessoas para estimar efeitos.
- **Fonte**: UNSCEAR (fala do presidente Wolfgang Weiss), Conferência Ministerial de Fukushima, 15-17/12/2012 (fala sem data própria). https://www-pub.iaea.org/iaeameetings/Fukushima/UNSCEAR_Statement.pdf
- **Trecho**: "Because of the great uncertainties in risk estimates at very low doses" / "does not recommend multiplying very low doses by large numbers of individuals"
- **Nível de leitura**: trecho lido
- **Status**: V (declaração oficial do UNSCEAR, hospedada pela IAEA)
- **Obs.**: O texto lido não menciona o LNT explicitamente. É uma declaração de conferência, não o relatório científico do UNSCEAR.

### M1.8
- **Mito**: (mesmo de M1.5)
- **Fato**: Uma sociedade profissional (HPS) afirma que, abaixo de ~100 mSv acima do fundo, os efeitos observados em pessoas não são estatisticamente diferentes de zero, e que o LNT não permite projeções confiáveis de câncer a partir de exposições de baixo nível.
- **Fonte**: Health Physics Society, "Radiation Risk in Perspective", Position Statement PS010-4, revisão 2019 (original jan/1996). https://hps.org/wp-content/uploads/2024/12/radiationrisk.pdf
- **Trecho**: "the observed radiation effects in people are not statistically different from zero." / "the LNT hypothesis cannot provide reliable projections of future cancer incidence from low-level radiation exposures."
- **Nível de leitura**: trecho lido
- **Status**: S (sociedade profissional, não órgão oficial/regulador)
- **Obs.**: Serve só para documentar a divergência com a NRC/ICRP. Não usar como "fonte oficial" na ficha.

---

## TEMA 2 – Doses de referência

### M2.1 Radiografia de tórax
- **Mito**: (opcional) "Um raio-X de tórax é muito perigoso."
- **Fato**: Um raio-X de tórax típico dá cerca de 0,01 rem (10 mrem), isto é, 0,1 mSv.
- **Fonte A**: U.S. NRC, "Doses in Our Daily Lives". https://www.nrc.gov/facilities-safety/radiation-protection/radiation-all-around-us/doses-in-our-daily-lives . **Fonte B**: CDC, "Radiation Thermometer", 02/01/2024 (URL em M1.3).
- **Trecho**: NRC: "a chest x-ray typically gives a dose of about 0.01 rem (10 millirem)". CDC: "0.01 rem / 0.1 mSv"
- **Nível de leitura**: trecho lido (ambas)
- **Status**: V
- **Obs.**: As duas fontes concordam (10 mrem = 0,1 mSv). A NRC não mostra data na leitura.

### M2.2 Voo
- **Mito**: "Voar expõe a perigosas doses de radiação."
- **Fato**: Um voo de costa a costa nos EUA expõe a cerca de 0,035 mSv de radiação cósmica. Duas viagens transcontinentais equivalem a um raio-X de tórax.
- **Fonte A**: CDC, "Facts About Radiation from Air Travel", 15/07/2026. https://www.cdc.gov/radiation-health/data-research/facts-stats/air-travel.html . **Fonte B**: CDC, "Radiation Thermometer" (voo NY–LA: 0,0035 rem / 0,035 mSv).
- **Trecho**: "You would be exposed to about 0.035 mSv (3.5 mrem) of cosmic radiation" / "Two transcontinental trips is about equal to the radiation dose from a single chest x-ray."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Dose depende de altitude e latitude (a página diz que sobe com a altitude e com a distância do equador). A página não dá valor por hora. A NRC "Doses in Our Daily Lives" **não** traz voo.

### M2.3 Banana (K-40)
- **Mito**: "Alimentos são sempre livres de radioatividade" (ou "banana é perigosa").
- **Fato**: Uma banana dá dose de ~0,01 mrem (0,1 microSv). Seria preciso comer cerca de 100 bananas para igualar a exposição natural diária média nos EUA.
- **Fonte**: U.S. EPA, "Natural Radioactivity in Food" (publ. 27/11/2018; atualizada 09/07/2026). https://www.epa.gov/radtown/natural-radioactivity-food
- **Trecho**: "Consuming one banana would deliver a total dose of 0.01 millirem (0.1 microsieverts) of radiation." / "Because the amount of radiation is very small, these foods do not pose a radiation risk."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A NRC "Doses in Our Daily Lives" **não** dá dose para banana (só 3.520 pCi/kg de K-40 na tabela de atividades). A "equivalência de 100 bananas" é paráfrase da leitura (a frase exata foi só parcialmente devolvida: "you would need to eat about 100 bananas"). Reconferir a redação antes de citar.

### M2.4 Tomografia
- **Mito**: "Tomografia é como um raio-X comum."
- **Fato**: Uma tomografia de corpo inteiro dá cerca de 1 rem (10 mSv). A NRC lista 700 mrem (7 mSv) para tomografia de tórax e 200 mrem (2 mSv) para a de cabeça.
- **Fonte A**: NRC, "Doses in Our Daily Lives". **Fonte B**: CDC "Radiation Thermometer" ("CT scan: 1 rem / 10 mSv"). **Fonte C**: EPA, "Radiation Sources and Doses" (publ. 15/04/2015; atualizada 29/09/2026), https://www.epa.gov/radiation/radiation-sources-and-doses ("one whole body CT = 10 mSv").
- **Trecho**: NRC: "a full-body CT gives a dose of 1 rem (1,000 mrem)".
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Três fontes concordam em 10 mSv para CT de corpo inteiro. A EPA informa que a medicina responde por 48% da dose média anual do americano ("Another 48 percent...").

### M2.5 Radiação de fundo anual
- **Mito**: "Só a tecnologia humana nos expõe à radiação."
- **Fato**: A dose anual média nos EUA é ~0,62 rem (6,2 mSv), metade vinda do fundo natural. O CDC cita 310 mrem de fundo natural. A estimativa mundial do UNSCEAR para fontes naturais subiu de 2,4 mSv (2008) para ~3,0 mSv no relatório mais recente.
- **Fonte A**: NRC, "Doses in Our Daily Lives" ("about 0.62 rem (620 millirem) each year"; "Half of this dose comes from natural background radiation."). **Fonte B**: CDC "Radiation Thermometer" ("naturally occurring background radiation – 310 mrem"). **Fonte C**: EPA "Radiation Sources and Doses" (6,2 mSv). **Fonte D (UNSCEAR via terceiro)**: ARPANSA (regulador australiano), 25/02/2026, "Australian experts contribute to global radiation report", https://www.arpansa.gov.au/australian-experts-contribute-global-radiation-report
- **Trecho**: ARPANSA, citando redatora do relatório: "the worldwide average annual effective dose from natural sources is approximately 3.0 millisieverts (mSv)."
- **Nível de leitura**: trecho lido
- **Status**: V (NRC, CDC, EPA para EUA); **S** para o número UNSCEAR 3,0 mSv (via ARPANSA, não li o relatório do UNSCEAR)
- **Obs.**: **Divergência de números**: global 2,4 mSv (UNSCEAR 2008, citado pela ARPANSA como valor anterior) x ~3,0 mSv (relatório mais recente, segundo ARPANSA). A ARPANSA diz que a diferença reflete melhores dados e métodos, não aumento real. O texto do UNSCEAR 2024 Vol. II (Anexo B, resumo do site) só confirma que "natural sources ... remain by far the most significant contributors to public exposure worldwide" (https://www.unscear.org/unscear/en/publications/2024_2.html), sem dar média numérica. O valor americano (3,1 mSv natural; 6,2 mSv total) não é global.

### M2.6 Limites de dose – CNEN (Brasil)
- **Mito**: "Existe um limite que separa 'seguro' de 'mortal'." (para contextualizar que limite regulatório é nível de restrição de risco, não limiar de dano)
- **Fato**: No Brasil, o limite anual de dose efetiva para trabalhadores (IOE) é 20 mSv, que pode ser tomado como média em 5 anos consecutivos desde que não passe de 50 mSv em nenhum ano. Para indivíduo do público, o limite é 1 mSv por ano.
- **Fonte**: CNEN, Norma CNEN NN 3.01 "Requisitos Básicos de Radioproteção e Segurança Radiológica de Fontes de Radiação", Resolução CNEN 323/24, DOU 18/04/2024, Cap. V, Seção III, Subseção III, Art. 52, tabela "Limites de Dose Anuais". https://www.gov.br/cnen/pt-br/acesso-rapido/normas/grupo-3/NormaCNENNN3.01.pdf
- **Trecho**: "Dose efetiva Corpo inteiro 20 mSv [b] 1 mSv [c]" / nota [b]: "ser a média aritmética em 5 anos consecutivos, desde que não exceda 50 mSv em qualquer ano."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Nota [c]: a CNEN poderá autorizar até 5 mSv em um ano para o público, se a média em 5 anos não passar de 1 mSv/ano (leitura do resumo da ferramenta; trecho literal da nota [c] veio cortado: "Se a CNEN considerar pertinente poderá autorizar um valor de dose efetiva de até 5 mSv em um ano,"). Versão de 2014 (Diretrizes Básicas, Res. 164/2014) **não lida**.

### M2.7 Limites de dose – ICRP 103
- **Fato**: A ICRP recomenda 20 mSv por ano (média em períodos de 5 anos, sem passar de 50 mSv em um único ano) para trabalhadores, e 1 mSv em um ano para o público.
- **Fonte**: ICRPaedia (wiki educativa da ICRP), "Dose limits", citando ICRP Publication 103, Tabela 6. https://www.icrpaedia.org/Dose_limits
- **Trecho**: "20 mSv per year, averaged over defined periods of 5 years, with no single year exceeding 50 mSv" / "1 mSv in a year"
- **Nível de leitura**: trecho lido (página do ICRPaedia; a Tabela 6 da Pub. 103 **não foi lida diretamente**, pois o extrato gratuito não a inclui)
- **Status**: S (derivada de ICRP, via ICRPaedia)
- **Obs.**: Para promover a V, abrir a Pub. 103 integral (Tabela 6).

### M2.8 Limites de dose – IAEA GSR Part 3
- **Fato**: O GSR Part 3 (publicado em 2014) estabelece, pelos slides de treinamento da IAEA, 20 mSv/ano em média de 5 anos consecutivos, sem passar de 50 mSv em nenhum ano (trabalhadores), e 1 mSv/ano para o público, com possibilidade de valor maior em um ano se a média de 5 anos não passar de 1 mSv/ano.
- **Fonte**: IAEA, slides de treinamento de 2025 sobre GSR Part 3 (Requirement 12, slide 23), hospedados em https://www.u-tokai.ac.jp/uploads/2025/04/2025_04_GSR-Part-3.pdf . A página de catálogo da IAEA (https://www.iaea.org/node/114810) descreve a edição interina de 2011 e não traz limites.
- **Trecho**: "The government or the regulatory body shall establish dose limits for occupational exposure and public exposure." (Requirement 12, segundo a leitura)
- **Nível de leitura**: só resumo para o documento original (Pub1578 não abriu); trecho lido para os slides
- **Status**: S
- **Obs.**: O texto integral do GSR Part 3 (Schedule III) **NÃO ENCONTRADO/NÃO LIDO**. Os slides são material IAEA de terceiros hospedado numa universidade japonesa.

### M2.9 Limites de dose – NRC (EUA)
- **Fato**: A NRC limita a exposição de adultos que trabalham com material radioativo a 5.000 mrem (50 mSv) por ano, e a do público a 100 mrem (1 mSv) por ano acima do fundo.
- **Fonte**: NRC, "Backgrounder on Biological Effects of Radiation" (URL em M1.4).
- **Trecho**: "Exposure to adults working with radioactive materials must be below 5,000 mrem (50 mSv) per year."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: **Divergência de limite ocupacional**: NRC (EUA) = 50 mSv/ano; ICRP/IAEA/CNEN = 20 mSv/ano em média de 5 anos (máx. 50 mSv em um ano). O limite público é 1 mSv nas quatro. A página "Doses in Our Daily Lives" **não** traz os limites; a página de FAQ da NRC também não.

---

## TEMA 3 – "Pessoa exposta fica radioativa / contagia"

### M3.1
- **Mito**: Quem foi exposto à radiação fica radioativo.
- **Fato**: Estar exposto não é o mesmo que estar contaminado. Um raio-X expõe a pessoa à radiação, mas não a contamina.
- **Fonte**: CDC, "Radiation Contamination Versus Exposure", 17/04/2024. https://www.cdc.gov/radiation-emergencies/infographic/contamination-versus-exposure.html
- **Trecho**: "A person exposed to radiation is not necessarily contaminated with radioactive material." / "Another word for radiation exposure is irradiation."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: O CDC usa "not necessarily". A página **não** diz que a pessoa exposta é "não radioativa" nem se pode contaminar outros.

### M3.2
- **Mito**: (mesmo)
- **Fato**: Uma pessoa exposta apenas a uma fonte externa NÃO fica radioativa nem contaminada e pode ser abordada com segurança. A radiação é absorvida sem tornar o corpo radioativo, ou atravessa o corpo.
- **Fonte**: REMM (Radiation Emergency Medical Management, domínio remm.hhs.gov, órgão do HHS dos EUA), "Differences Between Contamination and Exposure"; a página não declara emissor nem data na leitura. https://remm.hhs.gov/diff_contam_exp.htm
- **Trecho**: "An individual exposed only to an external source of radiation, as shown above, is NOT radioactive or contaminated."
- **Nível de leitura**: trecho lido
- **Status**: V (o emissor é inferido do domínio hhs.gov)
- **Obs.**: Mesma página: exposição interna é diferente e só termina "if the radionuclide is totally eliminated from the body" (trecho curto, parte da frase).

### M3.3
- **Mito**: (mesmo)
- **Fato**: A NRC diz que ser exposto à radiação não torna a pessoa radioativa, "exceto em circunstâncias muito específicas". Trabalhadores de usinas não são mais radioativos que ninguém.
- **Fonte**: U.S. NRC, "Frequently Asked Questions (FAQ) About Radiation Protection", revisão 08/06/2020. https://www.nrc.gov/about-nrc/radiation/related-info/faq
- **Trecho**: "being exposed to radiation does not make one radioactive, except in very specific circumstances."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A "exceção" (por exemplo, ativação por nêutrons) não é explicada na leitura. A ficha deve registrá-la como ressalva, sem inventar o detalhe.

### M3.4 (equilíbrio de risco: contaminação é diferente)
- **Mito**: "Quem foi contaminado não oferece nenhum risco a outros."
- **Fato**: Uma pessoa contaminada externamente pode contaminar outras pessoas ou superfícies que toque. Tirar a camada externa de roupa pode remover até 90% do material radioativo.
- **Fonte**: CDC, "What Causes Contamination versus Exposure", 10/04/2024, https://www.cdc.gov/radiation-emergencies/causes/index.html ; e CDC, "Frequently Asked Questions about Radiation Emergencies", 12/04/2024, https://www.cdc.gov/radiation-emergencies/faq/index.html
- **Trecho**: "If you are externally contaminated, you can contaminate other people or surfaces that you touch." / "Even just removing your outer layer of clothing can remove up to 90% of radioactive material."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: IAEA e OMS: **NÃO ENCONTRADO** (não busquei página específica de contaminação nessas organizações).

---

## TEMA 4 – "Radioatividade só existe por causa humana"

### M4.1 Radônio
- **Mito**: A radioatividade é invenção humana.
- **Fato**: O radônio vem da decomposição de elementos radioativos naturais, como urânio e tório, em solos e rochas.
- **Fonte**: U.S. EPA, "Where does radon gas come from?" (snapshot de 19/01/2021). https://19january2021snapshot.epa.gov/radiation/where-does-radon-gas-come_.html
- **Trecho**: "Radon comes from the breakdown of naturally-occurring radioactive elements (such as uranium and thorium) in soils and rocks."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: É um snapshot arquivado da EPA, não a página atual.

### M4.2 Fontes naturais (OMS)
- **Fato**: Há mais de 60 materiais radioativos naturais no solo, na água e no ar, e o radônio, gás natural que emana de rocha e solo, é a principal fonte de radiação natural.
- **Fonte**: WHO, 27/07/2023, "Ionizing radiation and health effects" (URL em M1.2).
- **Trecho**: "Radon, a naturally-occurring gas, emanates from rock and soil and is the main source of natural radiation."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Outro trecho: "more than 60 naturally-occurring radioactive materials found in soil, water and air."

### M4.3 K-40 e C-14 no corpo e nos seres vivos
- **Fato**: Toda matéria orgânica (planta e animal) contém carbono e potássio radioativos. As pessoas têm potássio-40 e carbono-14 no corpo desde o nascimento.
- **Fonte**: U.S. NRC, FAQ (URL em M3.3); EPA "Radiation Sources and Doses" (URL em M2.4): "Traces of radioactive materials can be found in the body, mainly naturally occurring potassium-40."
- **Trecho**: NRC: "all organic matter (both plant and animal) contains radioactive carbon and potassium."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A afirmação "desde o nascimento" é do resumo da ferramenta, sem aspas. Conferir a redação.

### M4.4 Datação radiométrica
- **Fato**: O decaimento radioativo é um processo espontâneo em que um isótopo-pai perde partículas do núcleo. A datação de rochas usa esses "relógios" radioativos. O carbono-14 é produzido continuamente na atmosfera superior.
- **Fonte**: USGS, série General Interest Publication, página "radiometric" (título, autor e ano **não exibidos** na leitura). https://pubs.usgs.gov/gip/geotime/radiometric.html
- **Trecho**: "Radioactive decay is a spontaneous process in which an isotope (the parent) loses particles from its nucleus" / "Carbon-14 is produced continuously in the Earth's upper atmosphere"
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Título, autoria e ano **NÃO ENCONTRADOS** na leitura. Para citar em bibliografia, abrir a página e capturar os metadados.

### M4.5 Radiação desde a formação da Terra
- **Fato**: A radiação está presente no ambiente desde a formação da Terra, vem do espaço, do solo e do corpo humano e está no ar, nos alimentos, na água e nos materiais de construção.
- **Fonte**: NRC, "Backgrounder on Biological Effects of Radiation" (URL em M1.4).
- **Trecho**: "Radiation is all around us. It is in our environment and has been since the Earth was formed."
- **Nível de leitura**: trecho lido
- **Status**: V

---

## TEMA 5 – "Usinas nucleares podem explodir como bomba"

### M5.1
- **Mito**: Uma usina nuclear pode explodir como uma bomba atômica.
- **Fato**: Segundo a NRC, o reator não explode: libera energia de forma gradual e controlada.
- **Fonte**: NRC, FAQ (URL em M3.3).
- **Trecho**: "Even a nuclear reactor does not explode." (segundo a leitura da ferramenta)
- **Nível de leitura**: trecho lido
- **Status**: V (com ressalva)
- **Obs.**: A frase é curta e absoluta. Reconferir na página antes de citar, porque acidentes reais (M5.4) destruíram reatores por outras causas.

### M5.2 Enriquecimento do combustível
- **Fato**: Para fazer combustível de reator, o urânio natural é enriquecido para 3 a 5% de U-235.
- **Fonte**: NRC, "Backgrounder on Uranium Enrichment", dez/2020. https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/enrichment
- **Trecho**: "To make fuel for reactors, this natural uranium is "enriched" to increase the U235 to between 3 and 5 percent."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A página também menciona HALEU, "between 5 and 20 percent U235", para reatores avançados. **Não** traz o percentual de armas nem diz que o combustível não pode explodir como bomba.

### M5.3 Projeto e enriquecimento: reator x bomba
- **Fato**: O reator comercial usa urânio pouco enriquecido (cerca de 3 a 5%), enquanto armas usam urânio acima de 90%. O reator é projetado para liberação estável e controlada de calor, o oposto de uma bomba.
- **Fonte**: U.S. Department of Energy, Office of Nuclear Energy, 02/08/2023, "Beyond Oppenheimer: How Nuclear Weapons and Nuclear Reactors are Different". https://www.energy.gov/ne/articles/beyond-oppenheimer-how-nuclear-weapons-and-nuclear-reactors-are-different
- **Trecho**: "A commercial nuclear reactor's function is precisely the opposite." / "Nuclear weapons, on the other hand, use much higher quantities of enriched uranium (over 90 percent)"
- **Nível de leitura**: trecho lido
- **Status**: V (fonte oficial do governo dos EUA, mas **não** NRC/IAEA como pedido)
- **Obs.**: A leitura informa que o artigo não diz literalmente "reatores não explodem como bombas". IAEA: **NÃO ENCONTRADO** (pesquisei, sem página utilizável).

### M5.4 (equilíbrio de risco)
- **Mito**: "Se não é bomba, então não há risco."
- **Fato**: Acidentes graves existiram. A NRC descreve o de Chernobyl (um aumento súbito de potência durante um teste destruiu a Unidade 4) e atribui a diferença para os reatores dos EUA a projeto, desligamento seguro e estruturas que retêm material radioativo.
- **Fonte**: NRC, "Backgrounder on Chernobyl Nuclear Power Plant Accident", mar/2024 (revisão exibida: 14/09/2026). https://www.nrc.gov/regulations-legislation/fact-sheets-brochures/backgrounder-on-chernobyl-nuclear-power-plant-accident
- **Trecho**: "a sudden surge of power during a reactor systems test destroyed Unit 4."
- **Nível de leitura**: trecho lido
- **Status**: V para o trecho; **N** para a distinção "explosão de vapor/hidrogênio x explosão nuclear" (a página lida **não** diz isso)
- **Obs.**: A tese "Chernobyl não foi uma explosão nuclear" **NÃO ENCONTRADO** em fonte oficial lida. Não afirmar na ficha sem fonte.

---

## TEMA 6 – "Alimentos irradiados ficam radioativos"

### M6.1
- **Mito**: Alimento irradiado fica radioativo.
- **Fato**: A irradiação de alimentos usa radiação para controlar pragas e microrganismos e evitar deterioração, e não torna o alimento radioativo.
- **Fonte**: U.S. EPA, "What is food irradiation?" (snapshot de 19/01/2021). https://19january2021snapshot.epa.gov/radiation/what-food-irradiation_.html
- **Trecho**: "Irradiation does not make the food radioactive, nor does it change the taste, texture, or appearance of the food."
- **Nível de leitura**: trecho lido
- **Status**: V (EPA; **não** é OMS/FAO/IAEA como pedido)
- **Obs.**: Snapshot arquivado.

### M6.2
- **Fato**: Alimentos irradiados não ficam radioativos, isto é, não emitem radiação, e comê-los não expõe nem contamina a pessoa.
- **Fonte**: CDC, "How Food Irradiation Works", 23/07/2026. https://www.cdc.gov/radiation-health/food-irradiation/index.html
- **Trecho**: "Irradiated foods do not become radioactive, meaning they do not give off radiation."
- **Nível de leitura**: trecho lido
- **Status**: V (CDC)

### M6.3 IAEA
- **Fato**: A IAEA afirma que a irradiação não aumenta os níveis de radioatividade do alimento nem o torna perigoso ao consumo.
- **Fonte**: IAEA (Food and Environmental Subprogramme, Joint FAO/IAEA Division), "Food Irradiation: A Powerful Nuclear Tool for Food Safety" (ano **não exibido**; a leitura infere ~2007, o que é inferência). https://iaea.org/sites/default/files/21/07/nafa-fep-food-irrad-tool0807.pdf
- **Trecho**: "irradiation does not increase radioactivity levels in food or otherwise make it dangerous for human consumption."
- **Nível de leitura**: trecho lido
- **Status**: V (IAEA), com ano não confirmado
- **Obs.**: **OMS e FAO/Codex: NÃO ENCONTRADO como texto lido.** Itens apenas listados em busca (só resumo): WHO IRIS "Safety and nutritional adequacy of irradiated food" (https://iris.who.int/handle/10665/39463, fetch falhou) e Codex CXS 106 (https://www.fao.org/input/download/standards/16/CXS_106e.pdf, não aberto). A página IAEA "What is Food Irradiation and Why is it Important?" (https://www.iaea.org/newscenter/news/what-is-food-irradiation-and-why-is-it-important) foi lida, mas **não** afirma que o alimento não fica radioativo.

---

## TEMA 7 – "Radiação só faz mal" (usos médicos e benefícios)

### M7.1
- **Mito**: Radiação só faz mal.
- **Fato**: Na medicina nuclear, uma pequena quantidade de material é injetada, inalada ou engolida para diagnóstico. O tecnécio-99m é usado para diagnosticar problemas de osso, coração e outros órgãos. Em terapia, materiais radioativos matam tecido canceroso, reduzem tumores ou aliviam dor.
- **Fonte**: U.S. NRC, "Backgrounder on Medical Use of Radioactive Materials", set/2020 (revisão exibida: 27/08/2026). https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/med-use-radioactive-materials
- **Trecho**: "For example, technetium-99m is used to diagnose bone, heart or other organ problems." / "About one-third of all patients admitted to hospitals are diagnosed or treated using radiation or radioactive materials."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A página não traz contagens anuais de procedimentos.

### M7.2 Radioterapia (IAEA)
- **Fato**: Cerca de metade dos pacientes com câncer precisa de radioterapia em algum momento da doença.
- **Fonte**: IAEA, "What is Radiation Therapy?" (título não exibido na leitura; título tomado do resultado de busca; sem data). https://www.iaea.org/newscenter/news/what-is-radiation-therapy
- **Trecho**: "with around half of all patients requiring radiotherapy at some point during the course of the disease."
- **Nível de leitura**: trecho lido
- **Status**: V

### M7.3 Esterilização
- **Fato**: Mais de 40% dos dispositivos médicos descartáveis do mundo são esterilizados com irradiação gama, e a vantagem é poder esterilizar produtos já embalados.
- **Fonte**: IAEA, "Medical sterilization" (sem data na leitura). https://www.iaea.org/topics/medical-sterilization
- **Trecho**: "More than 40 per cent of all single-use medical devices produced worldwide are sterilized with gamma irradiation."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A página não diz se o produto fica radioativo. Para essa pergunta: **NÃO ENCONTRADO** na IAEA.

### M7.4 Imagem diagnóstica e tecnécio-99m (IAEA)
- **Fato**: A IAEA relaciona o diagnóstico por imagem com radiofármacos que contêm o radioisótopo tecnécio-99m.
- **Fonte**: IAEA, "How Research Reactors Help Make Medical Imaging Possible" (sem data na leitura). https://www.iaea.org/newscenter/news/how-research-reactors-help-make-medical-imaging-possible
- **Trecho**: "These radiopharmaceuticals contain the radioisotope technetium-99m (99mTc )"
- **Nível de leitura**: trecho lido
- **Status**: V (com ressalva)
- **Obs.**: O trecho "More than 80% of the medical imaging used each year to diagnose diseases like cancer" veio incompleto, e a leitura diz que ele se refere a radiofármacos em geral, **não** especificamente ao Tc-99m. Não usar o "80%" na ficha sem reabrir a frase completa.

### M7.5 Benefícios gerais (OMS)
- **Fato**: A radiação ionizante tem muitas aplicações benéficas, em medicina, indústria, agricultura e pesquisa.
- **Fonte**: WHO, 27/07/2023 (URL em M1.2).
- **Trecho**: "Ionizing radiation has many beneficial applications, including uses in medicine, industry, agriculture and research."
- **Nível de leitura**: trecho lido
- **Status**: V

---

## TEMA 8 – Fontes órfãs / o que fazer ao achar objeto suspeito

### M8.1
- **Mito**: "Um objeto radioativo abandonado é só sucata (ou 'brilha bonito', então é inofensivo)."
- **Fato**: Ao achar objeto com etiqueta de radiação, afaste-se e não toque nele. Chame as autoridades (como a polícia) imediatamente. Se passar mal, procure um médico e avise que esteve perto de possível fonte de radiação.
- **Fonte**: IAEA, "What are Radioactive Sources?" (Nuclear Explained), sem data na leitura. https://www.iaea.org/newscenter/news/what-are-radioactive-sources
- **Trecho**: "Stay away from objects with a radiation label, and do not touch them." / "Contact the authorities, such as the police, immediately."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: Mesma página define fonte órfã: "A radioactive source that is not under regulatory control."

### M8.2 Caso Goiânia
- **Fato**: Em Goiânia, uma cápsula de césio-137 de um aparelho de teleterapia abandonado foi aberta por catadores. O césio era um sal "highly soluble and readily dispersible". Cerca de 112.000 pessoas foram monitoradas, 249 foram encontradas contaminadas, e 4 morreram.
- **Fonte**: IAEA, 1988, "The Radiological Accident in Goiânia" (arquivo "Pub815"). https://www-pub.iaea.org/MTCD/Publications/PDF/Pub815_web.pdf
- **Trecho**: "The radioactive source was in the form of caesium chloride salt, which is highly soluble and readily dispersible." / "Fragments of the source the size of rice grains were distributed to several families."
- **Nível de leitura**: trecho lido (leitura cobriu os primeiros 100.000 de 117.541 caracteres)
- **Status**: V
- **Obs.**: O ano do acidente **não** veio nos trechos devolvidos (a leitura traz apenas "1988" como ano do relatório). Confirmar o ano e o número de série da publicação antes de citar.

### M8.3 Risco de coletar fontes (IAEA TECDOC)
- **Fato**: Fontes órfãs parecem itens curiosos e podem ser facilmente pegas e levadas para casa.
- **Fonte**: IAEA, fev/2004, IAEA-TECDOC-1388, "Strengthening control over radioactive sources in authorized use and regaining control over orphan sources: National strategies". https://www-pub.iaea.org/MTCD/publications/PDF/te_1388_web.pdf
- **Trecho**: "they look like intriguing items and can easily be picked up and carried back to the family home."
- **Nível de leitura**: trecho lido (primeiros 100.000 de 128.050 caracteres)
- **Status**: V
- **Obs.**: O documento é dirigido a autoridades regulatórias e **não** traz instruções ao público (segundo a leitura).

### M8.4 Orientação da CNEN (Brasil)
- **Fato**: Em comunicado de 2024 sobre material radioativo furtado, a CNEN pede que, se a fonte for encontrada, a CNEN e a polícia sejam informadas imediatamente.
- **Fonte**: CNEN, "Nota à sociedade: esclarecimento sobre o veículo furtado contendo material radioativo", publ. 05/07/2024, atual. 07/07/2024. https://www.gov.br/cnen/pt-br/assunto/ultimas-noticias/nota-a-sociedade-esclarecimento-sobre-o-veiculo-furtado-contendo-material-radioativo
- **Trecho**: "caso a fonte seja encontrada/localizada, imediatamente seja informada a CNEN pelos telefones"
- **Nível de leitura**: trecho lido
- **Status**: V para "avisar CNEN e polícia"; **N** para "não tocar/afastar-se" pela CNEN
- **Obs.**: A nota **não** traz "não tocar" nem "afastar-se". Outra nota CNEN de 2023 (https://www.gov.br/cnen/pt-br/assunto/ultimas-noticias/cnen-e-acionada-por-suspeita-de-furto-de-fontes-radioativas) também não traz orientação ao público. Guia/folheto de fontes órfãs da IAEA ("Orphan sources leaflet"): **NÃO ENCONTRADO**. Os números de telefone da CNEN estão na nota, mas são de 2024 e podem mudar; não replicar no jogo.

---

## TEMA 9 – Radioproteção prática e símbolos

### M9.1 Tempo, distância, blindagem
- **Mito**: "Contra a radiação não há o que fazer."
- **Fato**: Os três princípios de proteção são tempo (ficar pouco perto da fonte), distância (afastar-se) e blindagem (pôr uma barreira, como parede de concreto).
- **Fonte A**: U.S. EPA, "RadTown Radiation Protection Activity 2: Time, Distance and Shielding" (publ. 20/12/2018; modif. 21/05/2026). https://www.epa.gov/radtown/radtown-radiation-protection-activity-2-time-distance-and-shielding . **Fonte B**: U.S. NRC, "Minimize Your Exposure" (revisão exibida: 14/09/2026). https://www.nrc.gov/about-nrc/radiation/protects-you/protection-principles
- **Trecho**: EPA: "The three principles of radiation protection are time, distance and shielding." NRC: "the intensity and dose of radiation decreases dramatically as you increase your distance from the source."
- **Nível de leitura**: trecho lido
- **Status**: V
- **Obs.**: A página da EPA **não** menciona a lei do inverso do quadrado. Esse detalhe (dobrar a distância reduz a ¼): **NÃO ENCONTRADO** em fonte oficial lida; não incluir como "fato com fonte". A NRC descreve o ALARA em palavras ("as low as reasonably achievable"), não pela sigla.

### M9.2 Símbolo suplementar ISO 21482
- **Mito**: "O trifólio sozinho já diz tudo / todo mundo sabe o que significa."
- **Fato**: O símbolo suplementar ISO 21482 avisa da presença de nível perigoso de radiação ionizante em fonte selada de alta atividade e da necessidade de leigos "ficarem longe". Complementa o símbolo básico (ISO 361), não o substitui. É recomendado para fontes IAEA de Categoria 1, 2 e 3.
- **Fonte**: ISO, "ISO 21482:2007 – Ionizing-radiation warning – Supplementary symbol", edição 1, fev/2007, confirmada em 2026. https://www.iso.org/standard/40264.html
- **Trecho**: "This symbol is not intended to replace the basic ionizing radiation symbol (ISO 361), but to supplement it"
- **Nível de leitura**: trecho lido (resumo/abstract da página ISO; a norma em si, paga, **não foi lida**)
- **Status**: V (para o escopo declarado na página ISO)

### M9.3 Símbolo – IAEA/IRPA
- **Fato**: IAEA e ISO lançaram o símbolo como suplemento ao trifólio, com a mensagem "Danger – Stay Away". Segundo a IRPA, o trifólio "has no inherent meaning" sem educação prévia, e o símbolo novo vai no corpo do aparelho que abriga a fonte, não em portas nem em contêineres de transporte.
- **Fonte A**: IAEA, "New Symbol Launched to Warn Public About Radiation Dangers" (sem data na leitura). https://www.iaea.org/node/5282 . **Fonte B**: IRPA, "New ISO Standard – Supplementary Ionizing-Radiation Warning Symbol" (sem data). https://irpa.net/page.asp?id=54380
- **Trecho**: IAEA: "supplement the traditional international symbol for radiation, the three cornered trefoil." IRPA: "has no inherent meaning"
- **Nível de leitura**: trecho lido
- **Status**: V (IAEA); S (IRPA, associação profissional)
- **Obs.**: A IAEA lista "a skull and crossbones and a running person" como elementos, mas a página lida **não** explica o significado de cada um. O significado individual dos elementos: **NÃO ENCONTRADO**. O significado oficial do trifólio (ISO 361): **NÃO ENCONTRADO** como texto lido. O ISO 361 só apareceu como título em resultado de busca (**só resumo**: https://www.iso.org/standard/4327.html).

---

## Resumo de contagem

| Tema | Fichas | V | S | N parcial |
|---|---|---|---|---|
| 1 Dose/limiar/LNT | 8 (M1.1–M1.8) | 7 | 1 (M1.8) | 0 |
| 2 Doses de referência | 9 (M2.1–M2.9) | 7 | 2 (M2.7, M2.8) | M2.5 número UNSCEAR é S |
| 3 Exposição x contaminação | 4 | 4 | 0 | 0 |
| 4 Origens naturais | 5 | 5 | 0 | 0 |
| 5 Usinas x bomba | 4 | 3 (+1 com ressalva) | 0 | M5.4: "Chernobyl não foi nuclear" = N |
| 6 Alimentos irradiados | 3 | 3 | 0 | OMS/FAO = N |
| 7 Usos médicos | 5 | 5 | 0 | M7.4 (80%) ressalva |
| 8 Fontes órfãs | 4 | 4 | 0 | M8.4 CNEN "não tocar" = N |
| 9 Radioproteção/símbolo | 3 | 2 | 1 (parte IRPA) | significado do trifólio e dos elementos = N |

## Lacunas principais (NÃO ENCONTRADO)

- Texto integral da ICRP Pub. 103 (Tabela 6) e do IAEA GSR Part 3 (Schedule III). Os números vieram de ICRPaedia e de slides IAEA (S).
- UNSCEAR com número global de fundo natural lido diretamente. O 2,4 mSv (2008) e o ~3,0 mSv (mais recente) vieram só via ARPANSA (S).
- OMS e FAO/Codex sobre alimento irradiado não ficar radioativo. A IAEA e a EPA/CDC cobrem o ponto.
- IAEA sobre reator "não explode como bomba". Coberto por NRC (frase curta) e DOE (enriquecimento).
- Folheto IAEA de fontes órfãs para o público e orientação "não tocar" da CNEN. Coberto por IAEA "What are Radioactive Sources?" (M8.1).
- Lei do inverso do quadrado em fonte oficial lida.
- Significado oficial do trifólio e de cada elemento do símbolo ISO 21482.
- Título, autoria e ano da página USGS (M4.4).
- Versão 2014 do NN 3.01 (Diretrizes Básicas, Res. 164/2014).
