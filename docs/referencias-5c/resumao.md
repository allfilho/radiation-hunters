# Banco de fichas "Mito x Fato" e fatos dos acidentes: fontes verificadas (etapa 5c)

Coleta em 14/10/2026 para o jogo Radiation Hunters. Três pesquisas em paralelo (conceitos, mitos e saúde, acidentes) com ~109 fichas brutas em `busca/`. Eu mesmo conferi nas páginas originais 14 itens (13%), todos confirmados (ver "Verificação"). Legenda: **V** = lido em página ou documento oficial/primário; **S** = só fonte secundária, derivada ou só metadado; **N** = não encontrado. **V\*** = conferido de novo por mim. Os IDs (C, M, A-) remetem às fichas brutas em `busca/` (trecho literal, página e observações).

**Limite de método que vale para tudo:** a leitura foi feita com WebFetch, que entrega trechos já extraídos por um modelo auxiliar; o acesso direto aos PDFs foi bloqueado pelo proxy (HTTP 403). Por isso nenhuma citação entre aspas deve ir para o jogo sem ser reaberta na fonte, e as fichas devem **parafrasear**, citando a fonte no texto, como já fazemos nas notas de campo.

## 1. O que muda no jogo agora (achados que afetam textos já publicados)

1. **Goiânia, brilho azul (V\*).** O relatório da AIEA (1988, Pub815) diz no resumo executivo que o material "glowed blue in the dark", que o brilho atraiu o interesse das pessoas e "afetou significativamente o curso do acidente" (seção 3.3, p. 29), e atribui o brilho, com cautela, a fluorescência ou radiação Cherenkov (p. 30; estudo adicional em Oak Ridge). Na etapa 4 eu tinha retirado o "brilho azul" por não ter conferido: **pode voltar**, dito como registro do relatório e sem generalizar ("nem todo material radioativo brilha"). A cor **verde** não aparece no relatório.
2. **Fundo natural mundial: 2,4 x ~3,0 mSv/ano.** OMS (26/10/2020), UNSCEAR (FAQ) e AIEA (1989, 1993) dão 2,4 mSv (V\* na OMS). O ARPANSA (regulador australiano, 25/02/2026) afirma que o relatório mais recente do UNSCEAR estima ~3,0 mSv e que a diferença reflete dados e métodos melhores, não aumento real (V\* na página do ARPANSA; **S** para o número do UNSCEAR, porque não consegui abrir o relatório). Se o jogo disser "2,4 mSv", dizer "cerca de 2,4 a 3 mSv por ano, conforme a edição".
3. **Mayapuri: o Co-60 continua sem atividade em qualquer fonte (10 lidas).** O ano de compra diverge: 1967, 1968, 1969 ou 1970 conforme a fonte. Manter "fim da década de 1960" e não citar atividade.
4. **Radium Girls:** os artigos de 1925 (Hoffman; Martland, Conlon e Knef) só foram confirmados por listas de referências (S); o mecanismo (rádio vai ao osso como o cálcio) está no perfil toxicológico da ATSDR (V\*). Data de lei: não confirmada.
5. **Chernobyl:** não misturar números de relatórios diferentes (ver seção 4).

## 2. Conceitos e mitos: fatos prontos para ficha

Redação segura em linguagem de aluno do ensino médio; o número entre colchetes é a ficha bruta.

### Decaimento e meia-vida
- Meia-vida é o tempo para a atividade (ou o número de átomos radioativos) cair à metade; cada radioisótopo tem a sua [C1.1, V: NRC; DOE-HDBK-1122-99].
- Temperatura e pressão não mudam a meia-vida; a química praticamente não muda (exceção minúscula na captura eletrônica, ex. Be-7, 0,1%) [C1.2, V]. Escrever "praticamente não depende".
- Cada decaimento é aleatório; só se prevê o comportamento estatístico do conjunto [C1.3, V]. Depois de 7 meias-vidas resta menos de 1% [C1.4, V: NRC; conta: 0,5⁷ = 0,78%].

### Distância, tempo e blindagem
- Dobrar a distância de uma fonte pontual divide a taxa de exposição por quatro [C2.1, **V\***: NRC, slides de proteção em terapia, sem data]. Vale para fonte pontual sem atenuação [C2.2, V: HPS (sociedade profissional)].
- Os três princípios: tempo, distância, blindagem [C2.3 e M9.1, V: EPA RadTown; NRC].
- Alfa: barrada por uma folha de papel ou pela pele [C3.1, V]; **mas** é perigosa se inalada ou ingerida (isto é conhecimento geral que a ficha deve sustentar com fonte antes de afirmar; a ATSDR e a REAC/TS dão base, não li passagem específica).
- Beta: barrada por camadas finas de metal leve ou plástico; "raramente mais de 5 a 10 mm" [C3.2, V: NRC]. Chumbo gera raios X de freamento: para beta prefere-se baixo Z [C3.5, V].
- Gama: materiais densos (chumbo, concreto); a intensidade cai exponencialmente e a camada semirredutora reduz à metade [C3.3, C3.4, V: NRC; NIST].
- **Observação:** os números do jogo (Al 3 mm, acrílico 5 mm, Pb 1 cm, concreto 30 cm) são escolhas didáticas do projeto 3a, com cálculo próprio, e não saem destas fontes; as fichas não devem citar essas espessuras como fato das agências.

### ALARA
- Definição regulatória (10 CFR 20.1003, NRC): esforço razoável para manter as exposições tão abaixo dos limites quanto praticável, considerando tecnologia e economia [C4.1, V]. A lógica: como se assume que qualquer exposição pode trazer algum risco, convém mantê-la o mais baixa razoavelmente possível [C4.3, V]. A redação "as low as reasonably achievable" já aparece na Pub. 26 da ICRP (1977); a ICRP não diz quem criou a sigla [C4.2, V]. Definição literal da AIEA: N.

### Radiação natural
- Média mundial 2,4 mSv/ano (OMS 2020) ou ~3,0 (relatório mais recente do UNSCEAR via ARPANSA), com variação regional grande (UNSCEAR FAQ: faixa típica de 1 a 13 mSv) [C5.1, V\*; M2.5]. O radônio é a maior parcela [C5.2, M4.2, V]. O corpo tem K-40; a banana dá ~0,1 µSv [C5.3, M2.3, V: EPA]. Valor médio **brasileiro**: N (a página da INB dá 2,8 mSv somando natural e artificial; não serve).
- Contexto de dose: raio X de tórax ~0,1 mSv; voo costa a costa nos EUA ~0,035 mSv; tomografia de corpo inteiro ~10 mSv [M2.1, M2.2, M2.4, V: NRC, CDC, EPA]. Limites: público 1 mSv/ano; trabalhador 20 mSv/ano em média de 5 anos, máximo 50 mSv em um ano, CNEN NN 3.01 (2024), art. 52 [M2.6, **V\***], ICRP/AIEA idem [M2.7, M2.8, S]; a NRC usa 50 mSv/ano [M2.9, V] (divergência de regulação, não de ciência).

### Exposição x contaminação
- Estar exposto não é estar contaminado; contaminação é material radioativo sobre ou dentro do corpo [C6.1, M3.1, V: CDC]. Uma pessoa irradiada externamente não fica radioativa nem espalha contaminação [C6.2, **V\***: REAC/TS; M3.2, V: REMM]. A NRC põe a ressalva "exceto em circunstâncias muito específicas" [M3.3, V]. Quem tem contaminação externa pode contaminar outros; tirar a roupa externa remove até 90% [M3.4, V: CDC].

### "Radioativo brilha"
- A radiação ionizante não se vê, ouve, cheira nem sente [C7.1, V: NRC]. Luz azul na água de reatores é radiação Cherenkov [C7.2, V: AIEA]. Tintas antigas brilham por radioluminescência de um material fosforescente (S: museu da ORAU; a EPA só diz que faziam o mostrador brilhar) [C7.3]. Em Goiânia o brilho azul foi registrado pelo relatório, com explicação provisória [A-GOI.1, A-GOI.2, V\*]. **A ficha correta não é "radioativo nunca brilha", e sim "brilhar não é sinal de dose, e a ausência de brilho não é sinal de segurança".** A segunda metade é raciocínio nosso, não frase de fonte: marcar como tal.

### Geiger e unidades
- O Geiger indica quando se forma um par de íons, sem dizer tipo ou energia [C8.1, V: NRC]; as leituras flutuam por estatística de contagem [C8.2, V: HPS]; a palavra "Poisson" não aparece nas fontes lidas (N; o modelo do jogo é Poisson por projeto, `docs/geiger-projeto-3a.md`).
- 1 Bq = 1 decaimento por segundo [C9.1, V]; 1 Gy = 1 J/kg [C9.2, V: EPA, BIPM]; o sievert corrige pelo efeito biológico, 1 Sv = 100 rem [C9.3, V]. **Atenção:** a leitura do Reactor Concepts Manual da NRC devolveu "1 Gy = 0,1 J/kg", incompatível com o SI; não usar essa passagem.

### Dose e efeito (equilíbrio entre desmistificar e não minimizar)
- A síndrome aguda exige dose alta, penetrante e rápida: CDC cita acima de ~0,7 Gy (sintomas leves desde 0,3 Gy) [M1.1]; OMS e CDC (termômetro) citam cerca de 1 Sv [M1.2, M1.3, V]. Registrar as duas faixas. NRC: doses acima de 500 mSv tendem a matar células; 3.500 a 5.000 mSv em corpo inteiro matam metade em 30 dias; doses baixas espalhadas no tempo não causam problema imediato [M1.4, V].
- Risco de câncer cresce com a dose; sem dado firme abaixo de ~100 mSv [M1.2, M1.5]. **Divergência real:** NRC e ICRP adotam o modelo linear sem limiar como hipótese de proteção; UNSCEAR desaconselha multiplicar doses muito baixas por muita gente; a HPS (S) contesta o uso do LNT para projeções [M1.5 a M1.8]. A ficha deve dizer "por precaução, a proteção assume que não há dose totalmente sem risco" e não "qualquer dose é perigosa" nem "doses baixas são inofensivas".

### Outros mitos
- Usinas: o enriquecimento de reator é de 3 a 5% de U-235; armas usam mais de 90% (DOE) [M5.2, M5.3, V]. **Não afirmar "Chernobyl não foi explosão nuclear"** (N): a NRC descreve só "um aumento súbito de potência" que destruiu a Unidade 4 [M5.4].
- Alimento irradiado não fica radioativo [M6.1 a M6.3, V: EPA, CDC, AIEA]; OMS/FAO: N.
- Usos: Tc-99m em diagnóstico; cerca de um terço dos pacientes internados usa radiação ou radiomateriais [M7.1, V: NRC]; cerca de metade dos pacientes com câncer precisa de radioterapia [M7.2, V: AIEA]; mais de 40% dos dispositivos médicos descartáveis são esterilizados por gama [M7.3, V]. Não usar o "80%" de imagem (a leitura não o liga ao Tc-99m) [M7.4].
- Objeto suspeito: afastar-se, não tocar e chamar as autoridades, como a polícia [M8.1, **V\***: AIEA]; fonte órfã = fonte fora do controle regulatório. A CNEN (nota de 2024) pede só que CNEN e polícia sejam avisadas; "não tocar" pela CNEN: N. Não pôr telefones no jogo.
- Símbolo: o símbolo suplementar ISO 21482 (2007) complementa o trifólio e avisa leigos para "ficarem longe" [M9.2, M9.3, V e S]. Significado oficial do trifólio (ISO 361): N.

## 3. Acidentes: fatos adicionais para as fichas

| Evento | Fato novo com fonte | Status |
|---|---|---|
| Goiânia (1987) | Brilho azul e sua explicação provisória (ver seção 1). A fonte foi retirada em 13/09/1987 (V\*). Cápsula com janela de 1 mm perfurada a chave de fenda em 18/09; grãos "do tamanho de grãos de arroz" que viraram pó; pessoas passaram o pó na pele [A-GOI.4]. A paciente que ligou a doença ao pó levou os restos à vigilância sanitária; um físico local foi o primeiro a medir a escala em 28-29/09 [A-GOI.5]. Triagem no Estádio Olímpico: ~112.000 monitorados, 249 contaminados, 129 com contaminação interna [A-GOI.6]. Lição da AIEA: fonte retirada do local licenciado pode ser grande risco e a responsabilidade do licenciado não se extingue [A-GOI.7]. O relatório de 1988 não usa o termo "órfã". | V (seção 3.3 V\*) |
| Radium Girls | Marca da tinta "Undark" (NJ HPO). Acordo: US$ 10.000 mais US$ 600 por ano, vitalícios, para cada uma das cinco (NJ HPO, S). Mecanismo: Ra no osso como o cálcio; a tinta tinha Ra-226 e Ra-228 (ATSDR, V\*). Hoffman 1925 e Martland et al. 1925/1929: só referência bibliográfica (S). Origem do nome e lei: N. | V / S |
| Chernobyl (1986) | 28 mortes por síndrome aguda em 1986 nas duas fontes; 134 casos confirmados (UNSCEAR 2008, §49, V\*; Fórum 2005). Evacuados em 1986: 116.000 (Fórum) x 115.000 (UNSCEAR §21, V\*). UNSCEAR 2008: fora a tireoide, sem aumento mensurável de câncer na população geral; a grande maioria "não precisa viver com medo" de consequências graves (§100, V\*). | V |
| Lia (2001) | RTG tipo Beta M com Sr-90; 1480 TBq de projeto e 1295 TBq nas fontes do acidente; fabricadas em 1983; 8 unidades chegaram à Geórgia no início dos anos 1980. Não existe folheto resumido da AIEA, só o relatório completo (2014). | V |
| Zaragoza (1990) | Um transistor em curto no sistema de deflexão do feixe: o acelerador recebeu sempre corrente máxima e a energia ficou fixa em 36 MeV; 27 pacientes tratados em 10 dias de operação defeituosa, 15 mortos (AIEA, V\*). Lição da AIEA: verificar o feixe com a Física depois de reparo. Divergência de dose a 7 MeV: ~9x (AIEA) x 7x (CSN). | V |
| Mayapuri (2010) | 16 "pencils" de Co-60 com 7 "slugs" cada (112 pedaços, todos contabilizados); leilão em fev/2010; 1 morte em 26/04/2010. Atividade: N. Ano de compra: 1967 a 1970, ver seção 1. | V / N |
| Fukushima (2011) | Terremoto M 9,0 e tsunami de 11/03/2011; perda de energia externa e interna; INES 7; liberação estimada pelo NISA em 2011: I-131 ~1,3E17 Bq e Cs-137 ~6,1E15 Bq; a AIEA (2015) dá faixas de ~100 a 400 PBq e ~7 a 20 PBq, "bem menores" que as de Chernobyl. Nenhuma lesão ou morte por radiação aguda entre trabalhadores ou público (OMS, página de 10/03/2016, "não atualizada", V\*; AIEA); UNSCEAR 2021: efeitos futuros provavelmente indistinguíveis. Mortes do tsunami são outra categoria. Lição da AIEA: a defesa em profundidade continua válida, mas precisa ser reforçada; avaliação de riscos naturais "suficientemente conservadora". | V |

## 4. Divergências que o jogo não deve esconder

- **Tireoide em Chernobyl:** ~4.000 casos e 9 mortes (Fórum 2005); ~6.000 casos e 15 fatais até 2005 (UNSCEAR 2008); ~20.000 casos registrados em 1991-2015, 1 em 4 atribuível à radiação (UNSCEAR 2018, só pela nota de imprensa, S). A diferença vem de período e definição; escolher **uma** fonte por ficha e dizer o ano.
- **Liquidators:** ~200.000 (1986-87) a 600.000 registrados (Fórum); 530.000 (UNSCEAR 2008); ~400.000 nos registros (OECD/NEA).
- **Limite ocupacional:** 20 mSv/ano médio em 5 anos (CNEN, ICRP, AIEA) x 50 mSv/ano (NRC).
- **Síndrome aguda:** ~0,7 Gy (CDC) x ~1 Sv (OMS, CDC).
- **Mayapuri, ano de compra** e **Zaragoza, múltiplo de dose** (acima). **Fundo natural:** 2,4 x ~3,0 mSv.

## 5. Lacunas (N) e o que fazer

Atividade do Co-60 de Mayapuri; textos primários de Hoffman e Martland (JAMA bloqueou o acesso, Europe PMC respondeu 429); origem do nome "Radium Girls" e data de lei; definição literal de ALARA pela AIEA; valor brasileiro de fundo natural (CNEN/IRD); ICRP 103 e AIEA GSR Part 3 integrais (limites vieram do extrato, da ICRPaedia e de slides); OMS/FAO sobre alimento irradiado; significado oficial do trifólio; "Poisson" em fonte oficial; relatório UNSCEAR com 3,0 mSv aberto diretamente. Cada fato com N **fica fora das fichas** até ser fechado; se o Arnaldo tiver acesso institucional (CAPES), os artigos do JAMA e o relatório do UNSCEAR são os mais valiosos.

## 6. Verificação (feita por mim, nas páginas originais, em 14/10/2026)

14 itens de ~109 (13%), todos confirmados: C2.1 (NRC, "double your distance... factor of four"), C5.1 (OMS, 2,4 mSv, 26/10/2020), C6.2 (REAC/TS), A-GOI.1/A-GOI.2 e data de remoção (Pub815, p. 11, 29, 30), M2.6 (CNEN NN 3.01, art. 52, 20 mSv e nota de 5 anos/50 mSv), M2.5 (ARPANSA, ~3,0 mSv, 25/02/2026), A-FUK.5 (OMS, 10/03/2016), A-ZAR.1 (AIEA, 27 pacientes e 15 mortes; transistor), M8.1 (AIEA, não tocar e chamar a polícia), A-RAD.7 (ATSDR, cálcio e Ra-226/Ra-228), A-CHE.1, A-CHE.3 e A-CHE.5 (UNSCEAR 2008 §§49, 21, 100). Sem discrepância de conteúdo. Todos os trechos continuam sendo extrações do WebFetch: **conferir a frase na fonte antes de citar entre aspas**.

## 7. Referências (por ordem de uso; URL como lida)

Organizações sem data visível seguem como "s.d.".

- US NRC. Glossário: Half-life (s.d.); ALARA (s.d.); Sievert (s.d.). nrc.gov/education-regulatory-research/glossary/ e nrc.gov/reading-rm/basic-ref/glossary/.
- US DOE. DOE-HDBK-1122-99, Module 1.06 *Radioactivity and Radioactive Decay*, 1999. energy.gov/documents/doe-hdbk-1122-99studyguidemodule106pdf.
- US NRC. *Reactor Concepts Manual*, cap. 5 "Radiation Terminology" (c. 2003). nrc.gov/reading-rm/basic-ref/students/for-educators/05.pdf. (Ver aviso sobre Gy.)
- US NRC. *Clinical Radiation Safety/ALARA Program in Therapy* (slides, s.d.). nrc.gov/docs/ML1201/ML12010A158.pdf. *Shielding Radiation* (slides, 2011). nrc.gov/docs/ml1122/ML11229A721.pdf. *Radiation Basics*; *Detecting Radiation*; *What is a Geiger Counter?*; *Doses in Our Daily Lives*; FAQ about Radiation Protection (08/06/2020); Backgrounders: *Biological Effects of Radiation* (2024), *Tritium...*, *Uranium Enrichment* (12/2020), *Medical Use of Radioactive Materials* (2020), *Chernobyl Nuclear Power Plant Accident* (2024). Todos em nrc.gov.
- US EPA. RadTown: *Time, Distance and Shielding*; *Natural Radioactivity in Food* (2018, atual. 2026); *Radiation Sources and Doses*; *Radiation Terms and Units*; *Protecting Yourself from Radiation*; snapshots 2021 de radônio e irradiação de alimentos. epa.gov.
- OSHA. *Ionizing Radiation Equations* (s.d.). osha.gov. HPS. *Ask the Experts* q9866 (Chabot, 2011), q10281 (Chabot, 2012), q12014 (Chabot, 2017); Position Statement PS010-4 (rev. 2019). hps.org.
- WHO. *Radiation: Ionizing radiation* (Q&A, 26/10/2020); *Ionizing radiation and health effects* (27/07/2023); *Health consequences of the Fukushima nuclear accident* (10/03/2016, não atualizada); *Chernobyl: the true scale of the accident* (05/09/2005). who.int.
- UNSCEAR. FAQ "Answers to frequently asked questions about radiation" (s.d.); Anexo D do relatório 2008 (Chernobyl), unscear.org/unscear/uploads/documents/publications/UNSCEAR_2008_Annex-D-CORR.pdf; declaração de W. Weiss, Conferência Ministerial de Fukushima, 2012; nota UNIS de 25/04/2018 e de 2021.
- ARPANSA. "Australian experts contribute to global radiation report", 25/02/2026. arpansa.gov.au.
- ICRP. Pub. 103 (2007), extrato gratuito; Clarke R.H.; Valentin J. *The History of ICRP and the Evolution of its Policies*, Pub. 109, Ann. ICRP 39(1), 2009; ICRPaedia, "Dose limits".
- CNEN. Norma CNEN NN 3.01 (Res. CNEN 323/24, DOU 18/04/2024); Nota à sociedade, 05/07/2024. gov.br/cnen.
- CDC. Radiation Emergencies: *Contamination Versus Exposure* (17/04/2024); *What Causes Contamination versus Exposure* (10/04/2024); *Radiation Thermometer* (02/01/2024); *Acute Radiation Syndrome: Information for Clinicians* (23/04/2024); *Facts About Radiation from Air Travel*; *How Food Irradiation Works*. cdc.gov.
- ORAU/REAC/TS. *Types of Radiation Exposure*. orise.orau.gov. REMM/HHS. *Differences Between Contamination and Exposure*. remm.hhs.gov. Museum of Radiation and Radioactivity (ORAU), *Radioluminescent Items*.
- BIPM. *The International System of Units (SI Brochure)*, 9ª ed. NIST. *X-Ray Mass Attenuation Coefficients*, cap. 2. ISO 21482:2007; IAEA, "New symbol launched..."; IRPA (S).
- DOE Office of Nuclear Energy. "Beyond Oppenheimer: How Nuclear Weapons and Nuclear Reactors are Different", 02/08/2023.
- IAEA. *The Radiological Accident in Goiânia* (STI/PUB/815), Viena, 1988; Bulletin 4/1988 "Lessons from Goiânia"; *The Radiological Accident in Lia, Georgia* (STI/PUB/1660), 2014; *Fukushima Daiichi Accident: Report by the Director General* (2015) e Volume Técnico 4; RPOP "Equipment malfunction" (Zaragoza); *What is Cherenkov Radiation?*; *What are Radioactive Sources?*; *What is Radiation Therapy?*; *Medical sterilization*; TECDOC-1388 (2004); *Food Irradiation: A Powerful Nuclear Tool for Food Safety* (ano não exibido).
- Chernobyl Forum (IAEA/WHO/UNDP et al.). *Chernobyl's Legacy* (2005), cópia em nrc.gov/docs/ML1209/ML12090A865.pdf; OECD/NEA, *Chernobyl: Assessment of Radiological and Health Impact*, cap. IV (2002).
- CSN (Espanha). Monografia/informe sobre o acidente de Zaragoza 1990 (23/12/2022). Lok Sabha, declaração do governo (eparlib.nic.in, docs 90950 e 2323); AERB TechTalk; INIS "Lessons Learned from the Radiological Accident in Mayapuri"; Singh S.R. et al. *J Indian Acad Forensic Med* 35(3), 2013.
- ATSDR. *Toxicological Profile for Radium*, cap. 2. USTUR/WSU. *Radium Studies*. NJ Historic Preservation Office. "Radium Girls" (nomeação ao registro). Gunderman R.B.; Gonda A. "Radium Girls". *Radiology* 274(2):314-318, 2015. Sharpe W.D. *Bull Hist Med* 52(4):560-570, 1979. Hoffman F.L. *JAMA* 85(13):961-965, 1925 e Martland H.S.; Conlon P.; Knef J.P. *JAMA* 85(23):1769-1776, 1925 (citações **S**, textos não lidos).
