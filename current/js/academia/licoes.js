// ============================================
// ACADEMIA: lições lineares (uma por sala) e textos de interface.
// Currículo: docs (rascunho "Academia do Caçador — currículo linear"). Cada lição = painel curto + 1 a 2 perguntas.
// Rótulos dos fatos: [V] verificado em página oficial aberta (EPA "Radiation Basics"; NRC "Unit 1: Radiation"),
// [H] escolha/simplificação de jogo. Nada aqui é número de dose do jogo; não há valor de energia da fronteira ionizante.
// Estrutura de uma pergunta: { q, opcoes[], certa (índice), porque }.
// ============================================

const FONTE_EPA = 'EPA, Radiation Basics (epa.gov/radiation/radiation-basics)';
const FONTE_NRC = 'NRC, Unit 1: Radiation (nrc.gov)';

export const LICOES = [
    { // Sala 1
        pt: {
            titulo: '1 · Radioatividade',
            paragrafos: [
                'Alguns átomos são instáveis. Quando um deles se transforma (decai) rumo a um estado mais estável, libera o excesso de energia na forma de raios ou partículas. Isso é radioatividade.',
                'Cada isótopo radioativo decai no seu próprio ritmo; mais adiante você verá como esse ritmo é medido.',
            ],
            fonte: FONTE_EPA + '; ' + FONTE_NRC + ' [V]. Aqui "radioatividade" e "decaimento radioativo" são tratados como a mesma ideia [H].',
            perguntas: [{
                q: 'O que torna um átomo radioativo?',
                opcoes: ["Ele brilha no escuro", "Ele é instável e libera energia ao decair", "Ele está sempre quente"],
                certa: 1,
                porque: 'Átomos instáveis liberam energia ao se transformar rumo a um estado mais estável. Brilho e calor não definem radioatividade.',
            }],
        },
        en: {
            titulo: '1 · Radioactivity',
            paragrafos: [
                'Some atoms are unstable. When one of them transforms (decays) toward a more stable state, it releases the excess energy as rays or particles. That is radioactivity.',
                'Each radioactive isotope decays at its own pace; later you will see how that pace is measured.',
            ],
            fonte: FONTE_EPA + '; ' + FONTE_NRC + ' [V]. Here "radioactivity" and "radioactive decay" are treated as the same idea [H].',
            perguntas: [{
                q: 'What makes an atom radioactive?',
                opcoes: ["It glows in the dark", "It is unstable and releases energy when it decays", "It is always hot"],
                certa: 1,
                porque: 'Unstable atoms release energy as they transform toward a more stable state. Glow and heat do not define radioactivity.',
            }],
        },
    },
    { // Sala 2
        pt: {
            titulo: '2 · Radiação',
            paragrafos: [
                'Radiação é energia que sai de uma fonte, viajando como ondas de energia ou como partículas energizadas. Ela vem de átomos instáveis ou de máquinas.',
                'Exemplos de ondas: luz visível, micro-ondas, ondas de rádio, raios X e raios gama. Exemplos de partículas: alfa (dois prótons e dois nêutrons) e beta.',
            ],
            fonte: FONTE_EPA + '; ' + FONTE_NRC + ' [V]. Raios X e gama como radiação eletromagnética de alta energia: CDC, O espectro eletromagnético (cdc.gov/radiation-health/about/electromagnetic-spectrum.html) [V].',
            perguntas: [{
                q: 'Qual destes é radiação em forma de partícula?',
                opcoes: ["Luz visível", "Micro-ondas", "Partículas alfa"],
                certa: 2,
                porque: 'A partícula alfa tem dois prótons e dois nêutrons. Luz visível e micro-ondas são ondas.',
            }],
        },
        en: {
            titulo: '2 · Radiation',
            paragrafos: [
                'Radiation is energy that leaves a source, traveling as energy waves or as energized particles. It comes from unstable atoms or from machines.',
                'Wave examples: visible light, microwaves, radio waves, X-rays and gamma rays. Particle examples: alpha (two protons and two neutrons) and beta.',
            ],
            fonte: FONTE_EPA + '; ' + FONTE_NRC + ' [V]. X-rays and gamma as high-energy electromagnetic radiation: CDC, The Electromagnetic Spectrum (cdc.gov/radiation-health/about/electromagnetic-spectrum.html) [V].',
            perguntas: [{
                q: 'Which of these is radiation in particle form?',
                opcoes: ["Visible light", "Microwaves", "Alpha particles"],
                certa: 2,
                porque: 'An alpha particle has two protons and two neutrons. Visible light and microwaves are waves.',
            }],
        },
    },
    { // Sala 3
        pt: {
            titulo: '3 · Ionizante e não ionizante',
            paragrafos: [
                'Radiação ionizante tem energia suficiente para arrancar elétrons dos átomos. Por isso pode danificar tecidos e DNA. Alfa, beta, gama e raios X são ionizantes.',
                'Radiação não ionizante tem energia para fazer os átomos de uma molécula se mover ou vibrar, mas não para arrancar elétrons. Rádio, luz visível e micro-ondas são exemplos.',
                'A fronteira na prática: o ultravioleta (UV). Ele se divide em UV-A (315 a 400 nm), UV-B (280 a 315 nm) e UV-C (100 a 280 nm); quanto menor o comprimento de onda, maior a energia. O UV é classificado como não ionizante, mas fica ao lado da região ionizante no espectro: o UV-C é o mais próximo dela. O UV-C do Sol é totalmente filtrado pela atmosfera.',
                'O Geiger que você vai encontrar responde à radiação ionizante.',
            ],
            fonte: FONTE_EPA + ' e ' + FONTE_NRC + ' [V]. Faixas do UV e UV-C filtrado pela atmosfera: OMS (who.int, perguntas e respostas sobre radiação UV) e ICNIRP (icnirp.org, faixa UV) [V]; "UV fica ao lado da radiação ionizante": ICNIRP [V]. O valor exato da fronteira em energia não aparece nessas páginas e não é usado no jogo [N]. Raios X e gama são ionizantes; comprimento de onda maior = energia menor: CDC, O espectro eletromagnético [V]. Que o Geiger responde à radiação ionizante: NRC, What is a Geiger Counter (nrc.gov) [V].',
            perguntas: [
                {
                    q: 'O que define a radiação ionizante?',
                    opcoes: ["Energia suficiente para arrancar elétrons dos átomos", "Ser sempre visível", "Vir somente do Sol"],
                    certa: 0,
                    porque: 'Ionizar é arrancar elétrons de átomos. A cor ou a origem não definem isso.',
                },
                {
                    q: 'Qual destes é radiação NÃO ionizante?',
                    opcoes: ["Raio gama", "Partícula alfa", "Micro-ondas"],
                    certa: 2,
                    porque: 'Micro-ondas fazem moléculas vibrarem, mas não arrancam elétrons. Gama e alfa são ionizantes.',
                },
                {
                    q: 'Entre UV-A, UV-B e UV-C, qual tem o menor comprimento de onda (e, portanto, a maior energia)?',
                    opcoes: ["UV-A", "UV-C", "UV-B"],
                    certa: 1,
                    porque: 'O UV-C vai de 100 a 280 nm: é a faixa de menor comprimento de onda, a mais próxima da região ionizante.',
                },
            ],
        },
        en: {
            titulo: '3 · Ionizing and non-ionizing',
            paragrafos: [
                'Ionizing radiation has enough energy to knock electrons out of atoms. That is why it can damage tissue and DNA. Alpha, beta, gamma and X-rays are ionizing.',
                'Non-ionizing radiation has enough energy to make the atoms of a molecule move or vibrate, but not to remove electrons. Radio, visible light and microwaves are examples.',
                'The boundary in practice: ultraviolet (UV). It splits into UV-A (315 to 400 nm), UV-B (280 to 315 nm) and UV-C (100 to 280 nm); the shorter the wavelength, the higher the energy. UV is classed as non-ionizing, but it sits next to the ionizing region in the spectrum: UV-C is the closest to it. Solar UV-C is completely filtered by the atmosphere.',
                'The Geiger counter you are about to find responds to ionizing radiation.',
            ],
            fonte: FONTE_EPA + ' and ' + FONTE_NRC + ' [V]. UV bands and UV-C filtered by the atmosphere: WHO (who.int, UV radiation Q&A) and ICNIRP (icnirp.org, UV range) [V]; "UV lies next to ionizing radiation": ICNIRP [V]. The exact energy value of the boundary is not on those pages and is not used in the game [N]. X-rays and gamma are ionizing; longer wavelength = lower energy: CDC, The Electromagnetic Spectrum [V]. That the Geiger responds to ionizing radiation: NRC, What is a Geiger Counter (nrc.gov) [V].',
            perguntas: [
                {
                    q: 'What defines ionizing radiation?',
                    opcoes: ["Enough energy to knock electrons out of atoms", "Always being visible", "Coming only from the Sun"],
                    certa: 0,
                    porque: 'To ionize is to remove electrons from atoms. Color or origin do not define it.',
                },
                {
                    q: 'Which of these is NON-ionizing radiation?',
                    opcoes: ["Gamma ray", "Alpha particle", "Microwaves"],
                    certa: 2,
                    porque: 'Microwaves make molecules vibrate but do not remove electrons. Gamma and alpha are ionizing.',
                },
                {
                    q: 'Among UV-A, UV-B and UV-C, which has the shortest wavelength (and so the highest energy)?',
                    opcoes: ["UV-A", "UV-C", "UV-B"],
                    certa: 1,
                    porque: 'UV-C spans 100 to 280 nm: the shortest wavelengths, closest to the ionizing region.',
                },
            ],
        },
    },
    { // Sala 4
        pt: {
            titulo: '4 · O Geiger e a radiação de fundo',
            paragrafos: [
                'O contador Geiger registra eventos de radiação ionizante e mostra quantos por segundo (cps). Ligue-o com G (ou o botão) e ouça os cliques.',
                'Um Geiger só conta eventos de ionização no gás do tubo: sozinho, ele não revela a fonte, o tipo nem a energia de algo totalmente desconhecido. No jogo você sabe quais isótopos são candidatos e qual tipo de radiação cada um emite; cada medida (taxa, distância, blindagem) é uma pista que elimina candidatos, até sobrar um. Isso você pratica na sala 6.',
                'Mesmo sem nenhuma fonte por perto, há uma taxa de fundo: a radiação natural do ambiente. Meça o fundo longe das fontes antes de procurar qualquer coisa, para saber o que é sinal.',
                'Uma lanterna ou um forno de micro-ondas emitem radiação não ionizante, e o Geiger não reage a eles.',
            ],
            fonte: 'Como o Geiger funciona e que sozinho ele não identifica fonte, tipo nem energia de uma fonte desconhecida; contagem normalmente em contagens por minuto: NRC, What is a Geiger Counter [V]; o jogo mostra cps [H]. Fundo natural: o NRC cita cerca de 300 millirem por ano, metade da exposição média total [V]; é dose, não cps, e não é usado no jogo. Taxa de fundo do jogo é escolha de projeto [H].',
            perguntas: [{
                q: 'Por que o Geiger não reage à luz de uma lanterna?',
                opcoes: ["A luz visível é não ionizante", "O Geiger só reage a ondas de rádio", "O Geiger só funciona no escuro"],
                certa: 0,
                porque: 'O Geiger detecta radiação ionizante; a luz visível é não ionizante.',
            }],
        },
        en: {
            titulo: '4 · The Geiger and background radiation',
            paragrafos: [
                'The Geiger counter registers ionizing-radiation events and shows how many per second (cps). Switch it on with G (or the button) and listen for the clicks.',
                'A Geiger only counts ionization events in the tube gas: by itself it does not reveal the source, type or energy of something completely unknown. In the game you know which isotopes are candidates and which type of radiation each one emits; each measurement (rate, distance, shielding) is a clue that rules out candidates until one is left. You practice this in room 6.',
                'Even with no source nearby there is a background rate: the natural radiation of the environment. Measure the background away from sources before looking for anything, so you know what counts as signal.',
                'A flashlight or a microwave oven emit non-ionizing radiation, and the Geiger does not respond to them.',
            ],
            fonte: 'How the Geiger works and that by itself it does not identify the source, type or energy of an unknown source; counts usually given per minute: NRC, What is a Geiger Counter [V]; the game shows cps [H]. Natural background: the NRC cites about 300 millirem per year, half of the average total exposure [V]; that is dose, not cps, and is not used in the game. The game background rate is a design choice [H].',
            perguntas: [{
                q: 'Why does the Geiger not react to flashlight light?',
                opcoes: ["Visible light is non-ionizing", "The Geiger only reacts to radio waves", "The Geiger only works in the dark"],
                certa: 0,
                porque: 'The Geiger detects ionizing radiation; visible light is non-ionizing.',
            }],
        },
    },
    { // Sala 5
        pt: {
            titulo: '5 · Distância',
            paragrafos: [
                'Quanto mais longe da fonte, menor a taxa medida. Para uma fonte gama pequena, dobrar a distância reduz a taxa a um quarto (lei do inverso do quadrado).',
                'Na prática: para achar uma fonte, siga a direção em que a taxa sobe; para se proteger, afaste-se.',
                'No jogo, o beta usa um modelo próprio de queda com a distância, e o alfa só é medido muito perto da superfície do objeto.',
            ],
            fonte: 'Fontes pequenas: a taxa de dose cai com o inverso do quadrado da distância; de 1 pé a 2 pés, cai a um quarto: NRC, SART cap. 4 (nrc.gov/docs/ML1117/ML111720212.pdf), slide 16 [V]; vale para fonte pequena e taxa de dose. Alcance do alfa no ar de 1 a 2 polegadas: NRC [V]; o alcance usado no jogo é simplificação [H].',
            perguntas: [{
                q: 'Você dobra a distância de uma pequena fonte gama. O que acontece com a taxa?',
                opcoes: ["Cai pela metade", "Cai para um quarto", "Fica igual"],
                certa: 1,
                porque: 'No inverso do quadrado, o dobro da distância dá um quarto da taxa.',
            }],
        },
        en: {
            titulo: '5 · Distance',
            paragrafos: [
                'The farther from the source, the lower the measured rate. For a small gamma source, doubling the distance cuts the rate to a quarter (inverse-square law).',
                'In practice: to find a source, follow the direction in which the rate rises; to protect yourself, step back.',
                'In the game, beta uses its own fall-off model with distance, and alpha is only measured very close to the surface of the object.',
            ],
            fonte: 'Small sources: dose rate falls with the inverse of the square of the distance; from 1 ft to 2 ft it drops to a quarter: NRC, SART ch. 4 (nrc.gov/docs/ML1117/ML111720212.pdf), slide 16 [V]; applies to small sources and dose rate. Alpha range in air of 1 to 2 inches: NRC [V]; the range used in the game is a simplification [H].',
            perguntas: [{
                q: 'You double the distance from a small gamma source. What happens to the rate?',
                opcoes: ["It drops by half", "It drops to a quarter", "It stays the same"],
                certa: 1,
                porque: 'With the inverse square, double the distance gives a quarter of the rate.',
            }],
        },
    },
    { // Sala 6
        pt: {
            titulo: '6 · Blindagem: que tipo de radiação é?',
            paragrafos: [
                'Alfa, beta e gama são barradas por coisas diferentes. Alfa: uma folha de papel ou a camada externa da pele. Beta: roupas ou uma folha fina de metal ou plástico (a EPA cita alumínio). Gama: material denso e espesso, como chumbo ou concreto.',
                'Roteiro com o Geiger: (1) meça o fundo; (2) meça a fonte a uma distância fixa, sem placa; (3) repita na mesma distância e pelo mesmo tempo com alumínio, acrílico e chumbo (botões de blindagem); (4) compare, descontando o fundo.',
                'Leia assim: some com qualquer placa e só aparece muito perto = alfa. Cai muito com alumínio ou acrílico (o alumínio, mais) e o chumbo a leva a quase nada = beta de alta energia (caso do Sr-90). Quase não muda com alumínio ou acrílico e cai com chumbo = gama. Cai um pouco com alumínio ou acrílico, mas sobra um patamar que só o chumbo reduz bem = beta + gama (caso do Cs-137). Placa nenhuma zera a leitura: compare sempre com o fundo.',
                'Fechando o diagnóstico: olhe a lista de isótopos candidatos e o tipo de emissão de cada um. O padrão de queda com as placas elimina os candidatos incompatíveis (por exemplo, um emissor só alfa some com qualquer placa; um com gama persiste atrás do alumínio). Cada pista isolada é fraca; juntas, elas apontam a fonte. Se dois candidatos têm o mesmo rótulo (por exemplo, γ+β), compare a energia da gama que aparece no botão: com chumbo, quanto mais energética a gama, menos o sinal cai (no jogo, o I-131 cai mais que o Cs-137, e o Cs-137 cai mais que o Co-60).',
            ],
            fonte: 'O que barra cada tipo: EPA e NRC [V]. Placas do jogo: alumínio 3 mm, acrílico 5 mm, chumbo 10 mm [H]. Sr-90 no jogo é tratado como emissor beta; na prática vem com o filho Y-90, que só é descontado se a amostra for recém-separada [H]. O NRC diz que o Geiger sozinho não identifica uma fonte desconhecida [V]; no jogo as candidatas são conhecidas, e a pista vem de comparar leituras com e sem placa e eliminar candidatos [H]. Contagem é aleatória: diferenças pequenas não valem como queda. No mundo real, o chumbo reduz o gama sem zerá-lo.',
            perguntas: [
                {
                    q: 'A leitura quase não muda com alumínio ou acrílico, mas cai com o chumbo. Qual o tipo?',
                    opcoes: ["Alfa", "Beta", "Gama"],
                    certa: 2,
                    porque: 'Só material denso e espesso barra bem o gama; alumínio fino e acrílico mal o afetam.',
                },
                {
                    q: 'A leitura some com qualquer placa e só aparece quase encostado no objeto. Qual o tipo?',
                    opcoes: ["Alfa", "Gama", "Nenhum, é não ionizante"],
                    certa: 0,
                    porque: 'A alfa tem alcance curtíssimo e é barrada até por uma folha de papel.',
                },
            ],
        },
        en: {
            titulo: '6 · Shielding: which kind of radiation?',
            paragrafos: [
                'Alpha, beta and gamma are stopped by different things. Alpha: a sheet of paper or the outer layer of skin. Beta: clothing or a thin sheet of metal or plastic (the EPA cites aluminum). Gamma: dense, thick material such as lead or concrete.',
                'Geiger routine: (1) measure the background; (2) measure the source at a fixed distance without a plate; (3) repeat at the same distance and for the same time with aluminum, acrylic and lead (shield buttons); (4) compare, subtracting the background.',
                'Read it like this: it vanishes with any plate and shows only very close = alpha. It drops a lot with aluminum or acrylic (aluminum more) and lead takes it to almost nothing = high-energy beta (the Sr-90 case). It barely changes with aluminum or acrylic and drops with lead = gamma. It drops a little with aluminum or acrylic, but a plateau remains that only lead reduces well = beta + gamma (the Cs-137 case). No plate brings the reading exactly to zero: always compare with the background.',
                'Closing the diagnosis: look at the list of candidate isotopes and the emission type of each. The drop pattern with the plates rules out incompatible candidates (for example, an alpha-only emitter vanishes with any plate; one with gamma persists behind aluminum). Each clue alone is weak; together they point to the source. If two candidates have the same label (for example, γ+β), compare the gamma energy shown on the button: with lead, the more energetic the gamma, the less the signal drops (in the game, I-131 drops more than Cs-137, and Cs-137 drops more than Co-60).',
            ],
            fonte: 'What stops each type: EPA and NRC [V]. Game plates: aluminum 3 mm, acrylic 5 mm, lead 10 mm [H]. The NRC says a Geiger alone does not identify an unknown source [V]; in the game the candidates are known, and the clue comes from comparing readings with and without a plate and ruling out candidates [H]. Counting is random: small differences do not count as a drop. In the real world, lead reduces gamma without zeroing it.',
            perguntas: [
                {
                    q: 'The reading barely changes with aluminum or acrylic but drops with lead. Which type?',
                    opcoes: ["Alpha", "Beta", "Gamma"],
                    certa: 2,
                    porque: 'Only dense, thick material stops gamma well; thin aluminum and acrylic hardly affect it.',
                },
                {
                    q: 'The reading vanishes with any plate and only appears almost touching the object. Which type?',
                    opcoes: ["Alpha", "Gamma", "None, it is non-ionizing"],
                    certa: 0,
                    porque: 'Alpha has a very short range and is stopped even by a sheet of paper.',
                },
            ],
        },
    },
    { // Sala 7
        demo: 'meiavida',
        pt: {
            titulo: '7 · Meia-vida',
            paragrafos: [
                'Meia-vida é o tempo para metade dos átomos de um material radioativo decair para outra forma nuclear. Depois de uma meia-vida resta metade; depois de duas, um quarto; depois de três, um oitavo. Com 100 átomos: 50, 25, 12, 6, 3, 1. Após sete meias-vidas resta menos de 1% da radioatividade original.',
                'Cada isótopo tem a sua meia-vida, e ela varia muito: o Tc-99m, usado em medicina nuclear, tem 6 horas (cai mais de 90% em 24 h); o U-238 tem quase 4,5 bilhões de anos. No jogo: Sr-90 cerca de 28,8 anos, Cs-137 cerca de 30 anos, Am-241 cerca de 433 anos. Fontes de meia-vida longa mudam pouco durante uma vida; as de meia-vida curta somem depressa.',
                'Teste abaixo: cada clique passa uma meia-vida em 64 átomos. Em cada passo, cada átomo tem 50% de chance de decair, ao acaso. O total tende à metade, mas quase nunca é exatamente a metade; com poucos átomos o acaso pesa mais, com muitos o resultado fica cada vez mais próximo do esperado.',
            ],
            fonte: 'Definição de meia-vida, faixa de valores (de milionésimos de segundo a bilhões de anos): NRC, glossário (nrc.gov) [V]. Exemplo de 100 átomos (50, 25, 12, 6, 3, 1), menos de 1% após sete meias-vidas, Tc-99m 6 h e U-238 cerca de 4,5 bilhões de anos: CDC, Propriedades de isótopos radioativos (cdc.gov/nceh/radiation/isotopes.html) [V]. Am-241, Sr-90 e Cs-137: tabela LNE-LNHB usada no projeto [V]. Que cada átomo decai ao acaso e só o conjunto é previsível: não consta nas páginas oficiais abertas [N]; a demonstração é um modelo de jogo (50% por passo) [H]. O jogo ainda não faz a fonte decair ao longo da partida [H].',
            perguntas: [
                {
                    q: 'Depois de duas meias-vidas, quanto da radioatividade resta?',
                    opcoes: ["Metade", "Nada", "Um quarto"],
                    certa: 2,
                    porque: 'A cada meia-vida cai pela metade: metade da metade é um quarto.',
                },
                {
                    q: 'Uma fonte tem meia-vida de 6 horas e outra de 30 anos. Qual perde radioatividade mais depressa?',
                    opcoes: ["A de 6 horas", "A de 30 anos", "As duas igual"],
                    certa: 0,
                    porque: 'Quanto menor a meia-vida, mais rápido metade dos átomos decai.',
                },
                {
                    q: 'Uma amostra tem meia-vida de 6 horas. Quanto resta depois de 12 horas?',
                    opcoes: ["Metade", "Um quarto", "Um oitavo"],
                    certa: 1,
                    porque: '12 horas são duas meias-vidas de 6 horas: resta um quarto.',
                },
            ],
        },
        en: {
            titulo: '7 · Half-life',
            paragrafos: [
                'Half-life is the time it takes for half of the atoms of a radioactive material to decay into another nuclear form. After one half-life, half remains; after two, a quarter; after three, an eighth. With 100 atoms: 50, 25, 12, 6, 3, 1. After seven half-lives, less than 1% of the original radioactivity is left.',
                'Each isotope has its own half-life, and it varies enormously: Tc-99m, used in nuclear medicine, has 6 hours (it drops more than 90% in 24 h); U-238 has almost 4.5 billion years. In the game: Sr-90 about 28.8 years, Cs-137 about 30 years, Am-241 about 433 years. Long half-life sources change little over a lifetime; short half-life ones vanish fast.',
                'Try it below: each click advances one half-life in 64 atoms. At each step, each atom has a 50% chance of decaying, at random. The total tends toward half, but is almost never exactly half; with few atoms chance weighs more, with many the result gets closer and closer to the expected value.',
            ],
            fonte: 'Definition of half-life, range of values (from millionths of a second to billions of years): NRC, glossary (nrc.gov) [V]. The 100-atom example (50, 25, 12, 6, 3, 1), less than 1% after seven half-lives, Tc-99m 6 h and U-238 about 4.5 billion years: CDC, Properties of Radioactive Isotopes (cdc.gov/nceh/radiation/isotopes.html) [V]. Am-241, Sr-90 and Cs-137: LNE-LNHB table used in the project [V]. That each atom decays at random and only the whole is predictable: not stated on the official pages opened [N]; the demo is a game model (50% per step) [H]. The game does not yet make the source decay during play [H].',
            perguntas: [
                {
                    q: 'After two half-lives, how much of the radioactivity remains?',
                    opcoes: ["Half", "None", "A quarter"],
                    certa: 2,
                    porque: 'It halves each half-life: half of a half is a quarter.',
                },
                {
                    q: 'One source has a 6-hour half-life and another 30 years. Which loses radioactivity faster?',
                    opcoes: ["The 6-hour one", "The 30-year one", "Both the same"],
                    certa: 0,
                    porque: 'The shorter the half-life, the faster half of the atoms decay.',
                },
                {
                    q: 'A sample has a 6-hour half-life. How much remains after 12 hours?',
                    opcoes: ["Half", "A quarter", "An eighth"],
                    certa: 1,
                    porque: '12 hours is two half-lives of 6 hours: a quarter remains.',
                },
            ],
        },
    },
    { // Sala 8
        pt: {
            titulo: '8 · Prova final: proteção',
            paragrafos: [
                'Três formas práticas de reduzir a exposição: ficar o mínimo de tempo, manter distância e usar blindagem adequada ao tipo de radiação.',
                'Aqui, identifique a fonte restante: meça o fundo, aproxime-se, afaste-se, teste as placas e só então use a identificação.',
            ],
            fonte: 'Tempo, distância e blindagem como princípios de proteção: limitar o tempo perto da fonte, aumentar a distância e colocar uma barreira: EPA, RadTown, Atividade 2 de proteção (epa.gov/radtown) [V].',
            perguntas: [{
                q: 'Qual conjunto reduz a exposição a uma fonte?',
                opcoes: ["Mais tempo e mais perto, para medir melhor", "Só usar o Geiger ligado", "Menos tempo, mais distância e blindagem adequada"],
                certa: 2,
                porque: 'Tempo, distância e blindagem são as três alavancas práticas de proteção.',
            }],
        },
        en: {
            titulo: '8 · Final exam: protection',
            paragrafos: [
                'Three practical ways to reduce exposure: spend as little time as possible, keep your distance, and use shielding suited to the type of radiation.',
                'Here, identify the remaining source: measure the background, approach, step back, test the plates and only then use identification.',
            ],
            fonte: 'Time, distance and shielding as protection principles: limit the time near a source, increase the distance and place a barrier: EPA, RadTown, Protection Activity 2 (epa.gov/radtown) [V].',
            perguntas: [{
                q: 'Which set reduces exposure to a source?',
                opcoes: ["More time and closer, to measure better", "Just keep the Geiger on", "Less time, more distance and suitable shielding"],
                certa: 2,
                porque: 'Time, distance and shielding are the three practical levers of protection.',
            }],
        },
    },
];

export const TEXTOS = {
    pt: {
        iniciar: 'Ir para o quiz', fechar: 'Fechar', proxima: 'Próxima', concluir: 'Concluir lição', depois: 'Depois', certo: 'Certo!', errado: 'Não foi dessa vez.', respostaCerta: 'Resposta certa:',
        tente: 'Tentar de novo', fonteRotulo: 'Fontes e rótulos', painel: 'Painel de lição',
        bloqueadaAnterior: 'Conclua primeiro a lição da sala anterior.', bloqueadaGeiger: 'Pegue o Geiger na sala 4 antes desta lição.',
        concluida: 'Lição concluída.', geigerPegou: 'Você pegou o Geiger! Ligue com G ou pelo botão.', semGeiger: 'Você ainda não tem o Geiger. Ele está na sala 4.',
        portaLicoes: 'A porta só abre depois das lições das salas 1 a 3.', portaLicoes2: 'A porta só abre depois das lições das salas 4 a 7.',
        itemGeiger: 'Contador Geiger', demoPasso: 'Passar uma meia-vida', demoRecomecar: 'Recomeçar', demoTitulo: 'Demonstração: 64 átomos', demoRestam: 'Meias-vidas: {n} · Restam {r} de 64 · Esperado se fosse exato: {e}', faltamLicoes: 'Faltam lições para concluir a Academia.',
    },
    en: {
        iniciar: 'Go to the quiz', fechar: 'Close', proxima: 'Next', concluir: 'Finish lesson', depois: 'Later', certo: 'Correct!', errado: 'Not this time.', respostaCerta: 'Correct answer:',
        tente: 'Try again', fonteRotulo: 'Sources and labels', painel: 'Lesson panel',
        bloqueadaAnterior: 'Finish the previous room lesson first.', bloqueadaGeiger: 'Pick up the Geiger in room 4 before this lesson.',
        concluida: 'Lesson complete.', geigerPegou: 'You picked up the Geiger! Switch it on with G or the button.', semGeiger: 'You do not have the Geiger yet. It is in room 4.',
        portaLicoes: 'The door only opens after the lessons of rooms 1 to 3.', portaLicoes2: 'The door only opens after the lessons of rooms 4 to 7.',
        itemGeiger: 'Geiger counter', demoPasso: 'Advance one half-life', demoRecomecar: 'Restart', demoTitulo: 'Demo: 64 atoms', demoRestam: 'Half-lives: {n} · {r} of 64 remain · Expected if exact: {e}', faltamLicoes: 'Lessons are still missing to finish the Academy.',
    },
};

export const txt = (lang, k) => (TEXTOS[lang] || TEXTOS.en)[k];
