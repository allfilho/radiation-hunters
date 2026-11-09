// ============================================
// ENCONTROS DE APRENDIZADO: árvore de conceitos (etapa 5d-1; ver docs/encontros-5c.md)
// ---------------------------------------------
// Cada nó é um conceito. `prereq` = nós a entender antes (grafo sem ciclos). `missoes` = missões em que
// o nó é priorizado. `historia` = nó de um acidente (só aparece na própria missão). `gatilhos` = tipos de
// gatilho que o favorecem. `ficha` = ficha de reforço (2 frases, com fonte), em PT e EN.
// Fatos: docs/referencias-5c/resumao.md. Nada aqui é afirmado sem fonte lida (status V no banco).
// ============================================
export const CONCEITOS = [
    {
        id: 'N01', tema: 'natureza', prereq: [], missoes: [3], gatilhos: [],
        pt: { titulo: 'A radiação existe na natureza', ficha: 'A radioatividade existe na natureza: o radônio vem do urânio e do tório de solos e rochas, e o nosso corpo tem potássio-40.', fonte: 'EPA, RadTown; OMS, 2023' },
        en: { titulo: 'Radiation exists in nature', ficha: 'Radioactivity exists in nature: radon comes from the uranium and thorium in soils and rocks, and our own bodies contain potassium-40.', fonte: 'EPA, RadTown; WHO, 2023' },
    },
    {
        id: 'N02', tema: 'natureza', prereq: [], missoes: [1, 2], gatilhos: ['geiger'],
        pt: { titulo: 'A radiação é invisível', ficha: 'A radiação ionizante não se vê, não se ouve, não tem cheiro nem gosto e não se sente. Por isso usamos instrumentos, como o contador Geiger.', fonte: 'US NRC, Detecting Radiation' },
        en: { titulo: 'Radiation is invisible', ficha: 'Ionizing radiation cannot be seen, heard, smelled, tasted or felt. That is why we use instruments, such as the Geiger counter.', fonte: 'US NRC, Detecting Radiation' },
    },
    {
        id: 'N03', tema: 'decaimento', prereq: ['N01'], missoes: [4, 8], gatilhos: [],
        pt: { titulo: 'Decaimento e meia-vida', ficha: 'A meia-vida é o tempo para a atividade cair à metade, e cada radioisótopo tem a sua. Temperatura e pressão não a mudam, e cada decaimento é aleatório: só se prevê o comportamento do conjunto.', fonte: 'US NRC; US DOE, DOE-HDBK-1122-99' },
        en: { titulo: 'Decay and half-life', ficha: 'The half-life is the time for the activity to fall to one half, and each radioisotope has its own. Temperature and pressure do not change it, and each decay is random: only the behavior of the whole group can be predicted.', fonte: 'US NRC; US DOE, DOE-HDBK-1122-99' },
    },
    {
        id: 'N04', tema: 'protecao', prereq: [], missoes: [5], gatilhos: [],
        pt: { titulo: 'Alfa, beta e gama', ficha: 'A radiação alfa é barrada por uma folha de papel ou pela pele; a beta, por camadas finas de plástico ou de metal leve; a gama exige material denso, como chumbo ou concreto.', fonte: 'US NRC, Radiation Basics; Reactor Concepts Manual' },
        en: { titulo: 'Alpha, beta and gamma', ficha: 'Alpha radiation is stopped by a sheet of paper or by skin; beta, by thin layers of plastic or light metal; gamma needs dense material, such as lead or concrete.', fonte: 'US NRC, Radiation Basics; Reactor Concepts Manual' },
    },
    {
        id: 'N05', tema: 'decaimento', prereq: ['N03'], missoes: [3], gatilhos: [],
        pt: { titulo: 'Becquerel, gray e sievert', ficha: 'O becquerel (Bq) expressa a atividade: o número médio de decaimentos por segundo na fonte. O gray (Gy) mede a energia absorvida por quilo (1 J/kg). O sievert (Sv) é a unidade das grandezas usadas em proteção radiológica, que incluem fatores de ponderação; ele não mede diretamente uma lesão. Uma contagem do Geiger, sozinha, não dá nenhuma dessas doses.', fonte: 'US NRC; US EPA, Radiation Terms and Units; BIPM, SI Brochure' },
        en: { titulo: 'Becquerel, gray and sievert', ficha: 'The becquerel (Bq) expresses activity: the mean number of decays per second in a source. The gray (Gy) measures the energy absorbed per kilogram (1 J/kg). The sievert (Sv) is the unit of the quantities used in radiological protection, which include weighting factors; it does not directly measure an injury. A Geiger count alone gives none of these doses.', fonte: 'US NRC; US EPA, Radiation Terms and Units; BIPM, SI Brochure' },
    },
    {
        id: 'N06', tema: 'fontes', prereq: [], missoes: [2, 3, 8], gatilhos: [],
        pt: { titulo: 'Exposição x contaminação', ficha: 'Exposição é receber radiação, de uma fonte externa ou de material radioativo incorporado. Contaminação é a presença indesejada de material radioativo sobre ou dentro do corpo. Uma radiografia não transfere material radioativo ao paciente nem o torna radioativo. A administração controlada de um radiofármaco é outro contexto, diferente de uma contaminação acidental.', fonte: 'CDC, Radiation Emergencies; REAC/TS (ORAU)' },
        en: { titulo: 'Exposure vs. contamination', ficha: 'Exposure means receiving radiation, from an external source or from radioactive material taken into the body. Contamination is the unwanted presence of radioactive material on or inside the body. An X-ray does not transfer radioactive material to the patient or make the patient radioactive. The controlled administration of a radiopharmaceutical is a different context from accidental contamination.', fonte: 'CDC, Radiation Emergencies; REAC/TS (ORAU)' },
    },
    {
        id: 'N07', tema: 'protecao', prereq: [], missoes: [1, 7], gatilhos: ['geiger'],
        pt: { titulo: 'Tempo, distância e blindagem', ficha: 'Para se proteger: fique menos tempo perto da fonte, mantenha distância e ponha uma barreira (blindagem) entre você e ela.', fonte: 'US EPA, RadTown; US NRC' },
        en: { titulo: 'Time, distance and shielding', ficha: 'To protect yourself: spend less time near the source, keep your distance and put a barrier (shielding) between you and it.', fonte: 'US EPA, RadTown; US NRC' },
    },
    {
        id: 'N08', tema: 'protecao', prereq: ['N07'], missoes: [1, 5], gatilhos: ['geiger'],
        pt: { titulo: 'Inverso do quadrado', ficha: 'Para uma fonte pontual, dobrar a distância reduz a taxa de exposição a um quarto (1/d²). Por isso afastar-se é tão eficaz.', fonte: 'US NRC, Clinical Radiation Safety/ALARA Program' },
        en: { titulo: 'Inverse-square law', ficha: 'For a point source, doubling the distance reduces the exposure rate to one fourth (1/d²). That is why moving away is so effective.', fonte: 'US NRC, Clinical Radiation Safety/ALARA Program' },
    },
    {
        id: 'N09', tema: 'protecao', prereq: ['N04', 'N07'], missoes: [2, 5, 7], gatilhos: [],
        pt: { titulo: 'Blindagem por tipo de radiação', ficha: 'A blindagem depende do tipo: papel para alfa, plástico fino para beta, chumbo ou concreto para gama. Chumbo em beta gera raios X de freamento, por isso se prefere material leve.', fonte: 'US NRC, Shielding Radiation (2011)' },
        en: { titulo: 'Shielding by radiation type', ficha: 'Shielding depends on the type: paper for alpha, thin plastic for beta, lead or concrete for gamma. Lead on beta produces bremsstrahlung X-rays, so a light material is preferred.', fonte: 'US NRC, Shielding Radiation (2011)' },
    },
    {
        id: 'N10', tema: 'natureza', prereq: ['N02', 'N03'], missoes: [1], gatilhos: ['geiger'],
        pt: { titulo: 'O que o Geiger mede', ficha: 'O Geiger conta eventos de ionização, sem dizer o tipo nem a energia da radiação. A contagem oscila por estatística, mesmo com a fonte parada, e contar por mais tempo reduz a incerteza relativa.', fonte: 'US NRC, What is a Geiger Counter?; HPS, Ask the Experts' },
        en: { titulo: 'What the Geiger measures', ficha: 'The Geiger counts ionization events, without telling the type or the energy of the radiation. The count fluctuates by statistics even with the source at rest, and counting for longer reduces the relative uncertainty.', fonte: 'US NRC, What is a Geiger Counter?; HPS, Ask the Experts' },
    },
    {
        id: 'N11', tema: 'dose', prereq: ['N05'], missoes: [4, 6], gatilhos: [],
        pt: { titulo: 'Dose, tempo e efeito', ficha: 'A síndrome aguda da radiação pode ocorrer quando todo o corpo, ou grande parte dele, recebe uma dose absorvida alta de radiação penetrante em pouco tempo. Ela é discutida em gray (Gy). Região irradiada, distribuição da dose e tempo de exposição importam; o sievert não deve ser convertido automaticamente em uma previsão de lesão individual.', fonte: 'CDC, Acute Radiation Syndrome: Information for Clinicians (2024), cdc.gov/radiation-emergencies/hcp/clinical-guidance/ars.html' },
        en: { titulo: 'Dose, time and effect', ficha: 'Acute radiation syndrome can occur when the whole body, or a large part of it, receives a high absorbed dose of penetrating radiation in a short time. It is discussed in gray (Gy). The irradiated region, dose distribution and exposure time matter; sieverts must not be automatically converted into a prediction of individual injury.', fonte: 'CDC, Acute Radiation Syndrome: Information for Clinicians (2024), cdc.gov/radiation-emergencies/hcp/clinical-guidance/ars.html' },
    },
    {
        id: 'N12', tema: 'dose', prereq: ['N07', 'N11'], missoes: [6, 8], gatilhos: [],
        pt: { titulo: 'ALARA e limites de dose', ficha: 'ALARA: manter a exposição tão baixa quanto razoavelmente exequível, porque se assume que qualquer exposição pode trazer algum risco. Em situações de exposição planejada no âmbito da Norma ANSN 3.01, o limite anual de dose efetiva para o público é de 1 mSv, com condições especiais previstas na norma. Ele vale para a exposição do público: trabalhadores têm limite próprio, e a exposição médica de pacientes segue os princípios de justificação e otimização, sem esse teto.', fonte: 'US NRC (10 CFR 20.1003); ANSN 3.01 (Resolução CNEN 344/25), arts. 51–54' },
        en: { titulo: 'ALARA and dose limits', ficha: 'ALARA: keep exposure as low as reasonably achievable, because any exposure is assumed to carry some risk. For planned exposure situations within the scope of ANSN Standard 3.01, the annual effective dose limit for the public is 1 mSv, with special conditions specified in the standard. It applies to public exposure: workers have their own limit, and the medical exposure of patients follows the principles of justification and optimization, without this ceiling.', fonte: 'US NRC (10 CFR 20.1003); ANSN 3.01 (Resolução CNEN 344/25), arts. 51–54' },
    },
    {
        id: 'N13', tema: 'fontes', prereq: ['N02', 'N06'], missoes: [2, 7], gatilhos: [],
        pt: { titulo: 'Achei uma fonte: o que fazer', ficha: 'Achou um objeto com o símbolo de radiação? Afaste-se, não toque nele e chame as autoridades, como a polícia. Fonte órfã é a que está fora do controle regulatório.', fonte: 'AIEA, What are Radioactive Sources?' },
        en: { titulo: 'I found a source: what to do', ficha: 'Found an object with the radiation symbol? Stay away, do not touch it and call the authorities, such as the police. An orphan source is one outside regulatory control.', fonte: 'IAEA, What are Radioactive Sources?' },
    },
    {
        id: 'N14', tema: 'fontes', prereq: [], missoes: [6], gatilhos: [],
        pt: { titulo: 'A radiação também ajuda', ficha: 'A radiação também ajuda: o tecnécio-99m é usado em diagnóstico por imagem, e cerca de metade dos pacientes com câncer precisa de radioterapia em algum momento.', fonte: 'US NRC, Medical Use of Radioactive Materials; AIEA' },
        en: { titulo: 'Radiation also helps', ficha: 'Radiation also helps: technetium-99m is used in diagnostic imaging, and about half of all cancer patients need radiotherapy at some point.', fonte: 'US NRC, Medical Use of Radioactive Materials; IAEA' },
    },
    {
        id: 'N15', tema: 'protecao', prereq: ['N04'], missoes: [], gatilhos: [],
        pt: { titulo: 'Nêutrons pedem outro escudo', ficha: 'Nêutrons não se barram como o gama: o chumbo é escudo de fótons, e material rico em hidrogênio, como o polietileno, é muito eficaz contra nêutrons. A fonte Am-Be, de poços de petróleo, emite nêutrons e um gama de 4,4 MeV.', fonte: 'Fermilab, TM-1834, cap. 6; Health Physics Society (q12136); SPE' },
        en: { titulo: 'Neutrons need a different shield', ficha: 'Neutrons are not stopped like gamma rays: lead is a photon shield, and hydrogen-rich material such as polyethylene is very effective against neutrons. The Am-Be source, used in oil wells, emits neutrons and a 4.4 MeV gamma ray.', fonte: 'Fermilab, TM-1834, ch. 6; Health Physics Society (q12136); SPE' },
    },
    {
        id: 'N16', tema: 'decaimento', prereq: ['N03'], missoes: [], gatilhos: [],
        pt: { titulo: 'O decaimento como relógio', ficha: 'A meia-vida é característica de cada nuclídeo e, em geral, não muda com temperatura ou pressão; por isso o decaimento funciona como relógio. Uma amostra ativada em reator, como o Na-24 (meia-vida de cerca de 15 horas), perde metade da atividade a cada meia-vida: esperar protege. Em datação, a mesma lógica vira idade, como no método do traço de fissão, que conta o dano deixado pela fissão espontânea do urânio-238 acumulada ao longo do tempo.', fonte: 'US NRC, glossário "Half-life"; US DOE, DOE-HDBK-1122-99; IAEA Nuclear Data Section, tabela D-1' },
        en: { titulo: 'Decay as a clock', ficha: 'The half-life is characteristic of each nuclide and, in general, does not change with temperature or pressure; that is why decay works as a clock. A sample activated in a reactor, such as Na-24 (half-life of about 15 hours), loses half its activity every half-life: waiting protects. In dating, the same logic becomes an age, as in the fission-track method, which counts the damage left by spontaneous fission of uranium-238 accumulated over time.', fonte: 'US NRC, glossary "Half-life"; US DOE, DOE-HDBK-1122-99; IAEA Nuclear Data Section, table D-1' },
    },
    // ---------- nós de história (um por acidente) ----------
    {
        id: 'E-GOI', tema: 'historias', historia: true, prereq: ['N02', 'N06', 'N13'], missoes: [2], gatilhos: [],
        pt: { titulo: 'Goiânia, 1987', ficha: 'Em Goiânia, uma fonte de césio-137 de um aparelho de radioterapia abandonado foi aberta e o pó se espalhou. Cerca de 112.000 pessoas foram monitoradas e 249 estavam contaminadas.', fonte: 'AIEA, The Radiological Accident in Goiânia, 1988' },
        en: { titulo: 'Goiânia, 1987', ficha: 'In Goiânia, a cesium-137 source from an abandoned radiotherapy unit was opened and the powder spread. About 112,000 people were monitored and 249 were contaminated.', fonte: 'IAEA, The Radiological Accident in Goiânia, 1988' },
    },
    {
        id: 'E-RAD', tema: 'historias', historia: true, prereq: ['N06'], missoes: [3], gatilhos: [],
        pt: { titulo: 'As Radium Girls', ficha: 'As pintoras de mostradores apontavam o pincel com os lábios e engoliam rádio. Parecido com o cálcio, o rádio se deposita nos ossos.', fonte: 'USTUR/WSU; ATSDR, Toxicological Profile for Radium' },
        en: { titulo: 'The Radium Girls', ficha: 'The dial painters pointed their brushes with their lips and swallowed radium. Similar to calcium, radium is deposited in the bones.', fonte: 'USTUR/WSU; ATSDR, Toxicological Profile for Radium' },
    },
    {
        id: 'E-CHE', tema: 'historias', historia: true, prereq: ['N03', 'N11'], missoes: [4], gatilhos: [],
        pt: { titulo: 'Chernobyl, 1986', ficha: 'Em Chernobyl, 28 pessoas morreram de síndrome aguda de radiação ainda em 1986, número que o UNSCEAR (2008) e o Fórum de Chernobyl (2005) apresentam.', fonte: 'UNSCEAR 2008, Anexo D; Chernobyl Forum, 2005' },
        en: { titulo: 'Chernobyl, 1986', ficha: 'At Chernobyl, 28 people died of acute radiation syndrome in 1986 itself, a figure given by UNSCEAR (2008) and by the Chernobyl Forum (2005).', fonte: 'UNSCEAR 2008, Annex D; Chernobyl Forum, 2005' },
    },
    {
        id: 'E-LIA', tema: 'historias', historia: true, prereq: ['N04', 'N09'], missoes: [5], gatilhos: [],
        pt: { titulo: 'Lia, Geórgia, 2001', ficha: 'Em Lia, três moradores que juntavam lenha acharam fontes de estrôncio-90 de geradores termoelétricos (RTG); foram internados em 22/12/2001.', fonte: 'AIEA, The Radiological Accident in Lia, Georgia, 2014' },
        en: { titulo: 'Lia, Georgia, 2001', ficha: 'In Lia, three villagers gathering firewood found strontium-90 sources from thermoelectric generators (RTGs); they were hospitalised on 22 December 2001.', fonte: 'IAEA, The Radiological Accident in Lia, Georgia, 2014' },
    },
    {
        id: 'E-ZAR', tema: 'historias', historia: true, prereq: ['N11', 'N12'], missoes: [6], gatilhos: [],
        pt: { titulo: 'Zaragoza, 1990', ficha: 'Em Zaragoza, um transistor em curto deixou um acelerador médico com a energia no máximo. A lição da AIEA: depois de um reparo, verificar o feixe com a equipe de Física.', fonte: 'AIEA, RPOP; CSN (Espanha), 2022' },
        en: { titulo: 'Zaragoza, 1990', ficha: 'In Zaragoza, a short-circuited transistor left a medical accelerator at maximum energy. The IAEA lesson: after a repair, verify the beam with the Physics team.', fonte: 'IAEA, RPOP; CSN (Spain), 2022' },
    },
    {
        id: 'E-MAY', tema: 'historias', historia: true, prereq: ['N13'], missoes: [7], gatilhos: [],
        pt: { titulo: 'Mayapuri, 2010', ficha: 'Em Mayapuri, um irradiador de cobalto-60 de uma universidade, sem uso havia mais de 15 anos, foi leiloado e desmontado num ferro-velho.', fonte: 'Lok Sabha; AERB' },
        en: { titulo: 'Mayapuri, 2010', ficha: 'In Mayapuri, a cobalt-60 irradiator from a university, unused for over 15 years, was auctioned and dismantled in a scrapyard.', fonte: 'Lok Sabha; AERB' },
    },
    {
        id: 'E-FUK', tema: 'historias', historia: true, prereq: ['N03', 'N12'], missoes: [8], gatilhos: [],
        pt: { titulo: 'Fukushima, 2011', ficha: 'Em Fukushima, um terremoto e um tsunami causaram perda de energia na usina. A AIEA (2015) informa que nenhuma morte foi atribuída às liberações radiológicas e que não houve efeitos precoces da radiação entre os trabalhadores; as mortes do tsunami são outra categoria.', fonte: 'AIEA, 2015' },
        en: { titulo: 'Fukushima, 2011', ficha: 'At Fukushima, an earthquake and a tsunami caused loss of power at the plant. The IAEA (2015) reports that no loss of life was attributed to the radiological releases and no early radiation effects were observed among workers; the tsunami deaths are a separate category.', fonte: 'IAEA, 2015' },
    },
];

export const TEMAS = ['natureza', 'decaimento', 'protecao', 'dose', 'fontes', 'historias'];
