# Verificações diretas da etapa 5d-3 (14/10/2026)

Método: WebFetch com pergunta literal sobre a página original. Limite declarado: a ferramenta devolve extração feita por um modelo pequeno sobre o texto da página; os trechos entre aspas são os devolvidos por ela, não conferidos contra o HTML bruto nem contra PDFs. Status V = afirmação encontrada em página oficial lida nesta etapa.

### V5D3.1 Definição de fonte órfã
- **Afirmação:** Fonte órfã é uma fonte radioativa que não está sob controle regulatório, seja porque nunca esteve, seja porque foi abandonada, perdida, extraviada, roubada ou transferida sem autorização adequada.
- **Fonte:** IAEA, fev/2004, IAEA-TECDOC-1388, Seção 1.5 (Definições), p. 7, que atribui o texto ao Code of Conduct. https://www-pub.iaea.org/MTCD/publications/PDF/te_1388_web.pdf . Confere com ICRPaedia, "Orphan source" (maio/2019), que atribui a definição ao IAEA Safety Glossary (2016): https://icrpaedia.org/Orphan_source
- **Trecho:** "A radioactive source which is not under regulatory control, either because it has never been under regulatory control" / "or because it has been abandoned, lost, misplaced, stolen or transferred without proper authorization"
- **Status:** V

### V5D3.2 Tirar a camada externa de roupa remove até 90%
- **Afirmação:** Tirar a camada externa de roupa pode remover até 90% do material radioativo.
- **Fonte:** CDC, "Frequently Asked Questions about Radiation Emergencies", https://www.cdc.gov/radiation-emergencies/faq/ (a frase aparece duas vezes na página). A página "What Causes Contamination versus Exposure" manda remover a camada externa, mas **não** traz a porcentagem; citar a página de perguntas frequentes.
- **Trecho:** "Even just removing your outer layer of clothing can remove up to 90% of radioactive material."
- **Status:** V

### V5D3.3 Lia: três moradores juntando lenha
- **Afirmação:** Três moradores de Lia (Geórgia) acharam dois objetos metálicos na floresta enquanto juntavam lenha; o acidente é de 2/12/2001.
- **Fonte:** IAEA, 2014, *The Radiological Accident in Lia, Georgia* (STI/PUB/1660), Prefácio e Seção 2.3 (p. 6). https://www-pub.iaea.org/MTCD/publications/PDF/Pub1660web-81061875.pdf
- **Trecho:** "found two metal objects in the forest while collecting firewood" (Prefácio); "by chance while carrying out their usual task of collecting firewood" (Seção 2.3).
- **Status:** V

### V5D3.4 Releituras que confirmaram o banco (sem divergência)
- Banana: EPA, "Natural Radioactivity in Food": "would deliver a total dose of 0.01 millirem (0.1 microsieverts)"; "these foods do not pose a radiation risk."
- OMS, 2023: "the dose threshold for acute radiation syndrome is about 1 Sv (1000 mSv)"; radônio "is the main source of natural radiation"; aumento significativo de risco de câncer acima de 100 mSv (estudos recentes sugerem possível aumento entre 50 e 100 mSv em exposição de crianças a TC).
- OMS, Fukushima: "There were no acute radiation injuries or deaths among the workers or the public due to exposure ... to radiation resulting from the FDNPS accident."
- AIEA, Goiânia (1988), Resumo executivo: "some 112 000 persons were monitored, of whom 249 were contaminated either internally or externally"; "the source material glowed blue in the dark."
- **Status:** V

## Verificações da etapa 5d-5 (14/10/2026, a pedido do Arnaldo)

Limite declarado: igual ao acima. As páginas foram lidas por extração (WebFetch); o PDF da AERB não foi aberto diretamente, só a cópia hospedada pela associação de radiografistas, e a numeração de slides pode estar deslocada em um.

### V5D3.5 Atividade do Co-60 de Mayapuri (corrige A-MAY.1, que estava "NÃO ENCONTRADO")
- **Afirmação:** O irradiador era um Gamma Cell GC 220 (AECL), comprado em 1969 por um departamento da Universidade de Délhi, com 112 pastilhas (16 canetas x 7). Atividade total do conteúdo: 147,186 TBq (3978 Ci) em ago-set/1969; estimada em 688,2 GBq (18,6 Ci) em abril de 2010. Categoria I.
- **Fonte:** Rajoo Kumar (AERB), slides "Lessons learned from Mayapuri accident", cópia em https://www.radiographers.org/downloads/Lessons-learned-from-Mayapuri-Accident.pdf (extração; números de slide podem estar deslocados). Meia-vida do Co-60: CDC, "Cobalt-60", https://www.cdc.gov/radiation-emergencies/hcp/isotopes/cobalt-60.html : "5.27 years". Usos (mesma página): "used medically for radiation therapy as implants and as an external source", "Co-60 also is used for food irradiation, a sterilization process".
- **Conta do projeto (V+C):** de ago-set/1969 a abril/2010 são ~40,6 anos = 7,7 meias-vidas; 2^-7,7 = 0,0048 (0,48%); 147,186 TBq x 0,0048 = ~0,71 TBq, contra 0,688 TBq do relatório (diferença ~3%, compatível com a data aproximada). Em ~8 meias-vidas resta ~0,4%.
- **Observações:** (1) A ordem de grandeza de TBq que o Arnaldo sugeriu confere para a origem (centenas de TBq no total, 1969). (2) O equipamento era de pesquisa (irradiador de câmara, Departamento de Química), não uma unidade de teleterapia; a fonte da AERB não diz a finalidade. (3) O valor "~60 TBq" que aparece em versão anterior de fatos-historicos-3e.md NÃO tem fonte e não deve ser usado. (4) Ano de compra segue divergente (1968/1969/1970 em fontes diferentes).
- **Status:** V+C

### V5D3.6 Estatística de contagem: Poisson
- **Afirmação:** O número de contagens num intervalo fixo, para decaimento com taxa constante, segue a distribuição de Poisson; a média é λ e o desvio padrão é a raiz de λ. Ela surge como limite da binomial quando há muitos núcleos, cada um com probabilidade muito pequena de decair no intervalo e decaindo de forma independente (por isso "eventos raros").
- **Fontes:** NIST/SEMATECH e-Handbook of Statistical Methods, seção Poisson ("number of events occurring within a given time interval"; média λ, desvio padrão raiz de λ), https://www.itl.nist.gov/div898/handbook/ ; PhysicsOpenLab, "Statistics of Radiation Counting" (material didático): processo de decaimento como situação típica, condições acima, sigma = raiz de mu; Klouda, Currie e Eijgenhuijsen, 1998, "On the Validity of the Poisson Hypothesis for Low-Level Counting...", Radiocarbon 40(1-2) (resumo no NIST: a resposta teórica "seems to be, Yes", com cautela para componentes do fundo que não seguem a lei de decaimento).
- **Status:** V (definição e propriedades); a ligação "binomial com p pequeno" vem do material didático citado.

### V5D3.7 Fundo do Geiger em contagens por segundo
- **Afirmação:** O fundo típico de um contador Geiger vai de cerca de 5 a 60 contagens por minuto ou mais (0,08 a 1 contagem por segundo), dependendo do detector e do local. O valor 0,5 a 1 cps sugerido pelo Arnaldo está dentro dessa faixa para sondas pequenas.
- **Fonte:** US NRC, "What is a Geiger Counter?": "five to 60 counts per minute or more" (já em C8.1). HPS, Ask the Experts, G. Chabot, 26/01/2017: sondas "pancake" respondem a cerca de 300 a 350 cpm por uSv/h (ordem de 0,5 cps para 0,1 uSv/h; extração, conferir na fonte). Variação regional da dose natural: C5.1.
- **Observação do projeto:** O jogo usa fundo de 5 cps (CONFIG.BG_RADIATION) numa escala didática [H] (docs/geiger-projeto-3a.md); é cerca de 5 a 10 vezes o valor real típico. Mudar exige recalibrar limiares e testes: decisão do Arnaldo.
- **Status:** V (faixa); V+C na conversão.

### V5D3.8 Emissões por isótopo (para o cofre; 14/10/2026)
- **Fonte de todas as linhas:** LNHB/DDEP (Laboratoire National Henri Becquerel), fichas "<Nuclídeo>_tables.pdf" em http://www.lnhb.fr/nuclides/ (leitura por extração; valores entre parênteses = incerteza). Probabilidades são por 100 decaimentos do pai (no Sr-90 e no Y-90, cada um por 100 decaimentos do próprio nuclídeo).
- **Cs-137:** beta- 513,97 keV (Emax) 94,57%; 1175,63 keV 5,43%; gama de 661,655 keV (Ba-137m) 85,01(20)%.
- **Co-60:** beta- 317,32 keV 99,88%; 1490,56 keV 0,12%; gamas 1173,228 keV 99,85% e 1332,492 keV 99,9826%. (A ficha tem pequena inconsistência interna nas energias; conferir na avaliação original antes de citar casas decimais.)
- **I-131:** beta- 606,3 keV 89,4%; 333,8 keV 7,20%; 247,9 keV 2,13%; gamas 364,489 keV 81,2%; 636,989 keV 7,12%; 284,305 keV 6,14%; 722,911 keV 1,79%; 80,185 keV 2,61%.
- **Sr-90:** beta- 545,9 keV 100%, sem gama; meia-vida 28,80 a. **Y-90 (filho, 2,6684 d):** beta- 2278,7 keV 99,983%; gama 1760,7 keV 0,017%.
- **P-32:** beta- 1710,661 keV 100%, sem gama (só raios X e elétrons Auger atômicos).
- **Ir-192:** beta- 675,1 keV 47,9%; 538,8 keV 41,4%; 258,7 keV 5,59%; captura eletrônica 4,87%; gamas 316,506 keV 82,75%; 468,069 keV 47,81%; 308,455 keV 29,68%; 295,957 keV 28,72%; 604,411 keV 8,20%; 612,462 keV 5,34%.
- **Tc-99m:** transição isomérica; gama 140,511 keV 88,5(2)%; gama+conversão 99,0%; ramos beta- desprezíveis (<0,003%).
- **Am-241:** alfa principal 84,45(10)% (energia de partícula ~5,486 MeV; ver nota), alfa ~13,23% (~5,443 MeV); gama 59,5409 keV 35,92(17)%.
- **Po-210:** alfa 99,99876% (5304,33 keV, Seção 4); gama 803,052 keV 0,00124%.
- **U-238:** alfa 4198 keV 77,54%; 4151 keV 22,33%; 4038 keV 0,13% (Seção 4); sem gama do próprio U-238 (gamas de 49,55 e 113,5 keV pertencem ao filho Th-234, 0,07% e 0,02%).
- **Cuidado:** em Am-241, Po-210 e U-238 a ficha traz duas listas de energias para as mesmas transições (Seção 2.1 = energia de transição; Seção 4 = energia da partícula alfa). Usar a da partícula alfa (Po-210 5,304 MeV e U-238 4,198 MeV batem com `isotopes.js`). Para o Am-241 o valor ~5,486 MeV é o do jogo; a extração não devolveu a lista da Seção 4, conferir.
- **Status:** V (probabilidades, lidas na ficha oficial por extração); a regra "prateleira = radiação mais penetrante com rendimento significativo" é decisão de projeto, não fato.

### V5E.1 Emissões do Ra-226 (para o cofre; 14/10/2026)
- **Fonte:** LNHB/DDEP, comentários da avaliação do Ra-226, V. Chisté e M. M. Bé (LNHB), dez. 2006, atualizada em jan. 2007; cópia na AIEA: https://www-nds.iaea.org/act_ddl/data/Ra-226_com.pdf (leitura por extração).
- **Ra-226:** meia-vida 1600 (7) a; alfa 4784,34 keV 94,038%; 4601 keV 5,950%; 4340 keV 0,0066%; gama 186,211 keV 3,555 (19)%; 262,27 keV 0,0055%. A intensidade absoluta da gama de 186 keV está normalizada pela linha de 609,3 keV do Bi-214 (45,49 (19)%).
- **Uso no jogo:** pela regra do cofre (só o próprio nuclídeo, limiar de 50 por 100), o Ra-226 vai para a prateleira alfa. A meia-vida de 1600 a confere com `addIsotope` da missão 3.
- **Status:** V (extração do PDF; conferir casas decimais no PDF original antes de citar fora do jogo).

### V5E.2 Am-241 e Co-60 (conferência das energias; 14/10/2026)
Fonte: tabelas LNHB/DDEP (CEA, Laboratoire National Henri Becquerel), PDFs de Am-241 e Co-60, lidos por WebFetch (resumo da página: nível de extração, não citação literal).
- Am-241: alfa 5485,56 keV (84,45), 5442,86 (13,23), 5388,25 (1,66); gama 59,5409 keV (35,92) por 100 decaimentos. O jogo tinha as duas primeiras e a gama; adicionado o alfa de 5388,25 (1,66), o que muda o total alfa exibido de 97,7 para 99,3 por 100.
- Co-60: beta 317,32 keV (99,88) e 1490,56 (0,12) (Emax); gama 1173,228 (99,85) e 1332,492 (99,9826); T½ = 5,2711 a. Já coincidia com `emissoes.js`.
- Observação: o próprio documento LNHB apresenta pequenas diferenças entre seções (1 vs 4; 2.2 vs 5.2) que não afetam os valores acima; não foram investigadas além disso.
