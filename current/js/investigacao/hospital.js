import {CAMPO_HOSPITAL} from './configuracoes-campo.js';
// ============================================
// INVESTIGAÇÃO 1 — "Hospital: de onde vem a imagem?" (protótipo para teste e revisão)
// Pergunta central: uma radiografia deixa material radioativo no corpo?
// Personagens e hospital são FICTÍCIOS. Não orienta pacientes, não simula decisão clínica e não opera equipamento.
//
// Rótulos das fontes: [V] verificado em página oficial aberta em 16/10/2026; [N] conhecimento de livro-texto,
// sem página oficial aberta; [H] escolha de projeto.
//   CDC, "What Causes Contamination versus Exposure" (cdc.gov/radiation-emergencies/causes/index.html) [V]:
//     o exemplo de raios X é dado como "exposto à radiação, mas não contaminado"; contaminação é material
//     radioativo depositado sobre ou dentro da pessoa.
//   ACR/RSNA RadiologyInfo, "Safety in X-ray, interventional radiology and nuclear medicine procedures"
//     (radiologyinfo.org/en/info/safety-radiation) [V]: CT e fluoroscopia entregam radiação "de fora", ao contrário
//     da medicina nuclear; ultrassom usa ondas sonoras e ressonância usa campos magnéticos e pulsos de rádio;
//     exames são feitos quando necessários, ponderando benefício e risco.
//   ACR/RSNA RadiologyInfo, "General Nuclear Medicine" (radiologyinfo.org/en/info/gennuclear) [V]: radiofármaco
//     administrado, acumula-se na região estudada e a gama-câmara detecta a energia emitida; a câmara não emite radiação.
//   IAEA, Safety Reports Series 13 (1999), seção 4.2, p. 28 [V, conferido em 16/10/2026]: distingue
//   equipamento energizado/em espera de geração de raios X. No esquema, o botão inicia/interrompe a emissão [H].
//   Revisão por físico médico: PENDENTE. Os testadores anotam observações na própria investigação.
// ============================================
const T = (pt, en) => ({ pt, en });

export const HOSPITAL = {
    id: 'hospital-imagem', atalho:'hospital', campo:CAMPO_HOSPITAL,
    versao: '0.4-teste',
    cenaHipotese: 'recepcao',
    cenaDecisao: 'mural',
    cenaLimite: 'retomada',
    observacoesObrigatorias: ['equipamento','frasco'],
    transferenciaObrigatoria: true,
    pt: {
        titulo: 'Hospital: de onde vem a imagem?',
        descricao: 'Investigação curta (10 a 15 min) num hospital em funcionamento: uma radiografia deixa material radioativo no corpo?',
        nota: 'Hospital e personagens fictícios. Conteúdo educativo; não é orientação para pacientes.',
        aviso: 'Versão de teste. Hospital e personagens são fictícios; o conteúdo ainda será revisado por especialista em Física Médica. Não é orientação para pacientes. Use o campo "Observação" para anotar o que estiver errado ou confuso.',
    },
    en: {
        titulo: 'Hospital: where does the image come from?',
        descricao: 'Short investigation (10 to 15 min) in a working hospital: does an X-ray leave radioactive material in the body?',
        nota: 'Fictional hospital and characters. Educational content; not advice for patients.',
        aviso: 'Test version. The hospital and characters are fictional; the content will still be reviewed by a Medical Physics specialist. This is not advice for patients. Use the "Note" field to write down anything wrong or confusing.',
    },
    cenas: [
        {
            id: 'recepcao', reacoes:[{aposCena:'equipamento',incluirHipotese:true,texto:T('Helena: “Você comparou o modelo com e sem emissão. Como isso ajuda a responder à minha pergunta?”','Helena: “You compared the model with and without emission. How does that help answer my question?”')}], tipo: 'registro', visual: 'recepcao',
            titulo: T('1 · A pergunta na recepção', '1 · The question at reception'),
            texto: T(
                'O Hospital Santa Aurora (fictício) funciona normalmente. Você acompanha a técnica em radiologia Rita numa visita educativa, para preparar um cartaz para o mural da escola. Na recepção, Helena espera para fazer uma radiografia e comenta: "Ouvi falar do acidente com o césio, em Goiânia. Depois da radiografia, vou ficar radioativa e contaminar minha família?"',
                'Santa Aurora Hospital (fictional) is working normally. You are shadowing radiology technologist Rita on an educational visit to prepare a poster for the school bulletin board. At reception, Helena is waiting for an X-ray and says: "I heard about the cesium accident in Goiânia. After the X-ray, will I become radioactive and contaminate my family?"'),
            pergunta: T('Antes de investigar: qual é a sua explicação inicial? (Pode dizer que não sabe; nada é cobrado agora.)', 'Before investigating: what is your first explanation? (You may say you do not know; nothing is graded now.)'),
            opcoes: [
                { id: 'a', compativel: false, txt: T('Sim: depois do exame a pessoa continua emitindo radiação por algumas horas.', 'Yes: after the exam the person keeps emitting radiation for a few hours.') },
                { id: 'b', compativel: true, txt: T('Não: radiografia é diferente de ter material radioativo no corpo.', 'No: an X-ray is different from having radioactive material in the body.') },
                { id: 'c', naoSei: true, txt: T('Ainda não sei.', 'I do not know yet.') },
            ],
            retornoRegistro: T('Registrado. Vamos investigar e, no fim, você compara com esta resposta.', 'Recorded. We will investigate and, at the end, you compare with this answer.'),
        },
        {
            id: 'equipamento', tipo: 'escolha', visual: 'equipamento',
            titulo: T('2 · O equipamento e a paciente', '2 · The equipment and the patient'),
            texto: T(
                'Rita mostra o esquema da sala. Use o modelo para iniciar e interromper a emissão. Registre os dois estados no caderno e só então proponha uma explicação.',
                'Rita shows the room diagram. Use the model to start and stop emission. Record both states in the notebook before proposing an explanation.'),
            pergunta: T('De onde parte a radiação X numa radiografia?', 'Where does the X radiation come from in an X-ray exam?'),
            opcoes: [
                { id: 'tubo', ok: true, txt: T('Do tubo de raios X, dentro do equipamento.', 'From the X-ray tube inside the equipment.'),
                  retorno: T('Isso: no esquema, o feixe sai do tubo e só existe com o equipamento ligado.', 'Right: in the diagram the beam leaves the tube and exists only while the equipment is on.') },
                { id: 'corpo', txt: T('Do corpo da paciente, que devolve a radiação.', 'From the patient\'s body, which returns the radiation.'),
                  retorno: T('O corpo recebe parte da radiação e absorve uma parte dela, mas não é a origem do feixe. Observe de novo o esquema ligado e desligado.', 'The body receives the radiation and absorbs part of it, but it is not the origin of the beam. Look at the diagram on and off again.') },
                { id: 'detector', txt: T('Do detector, que produz a radiação da imagem.', 'From the detector, which makes the radiation for the image.'),
                  retorno: T('O detector registra o que chega até ele; ele não produz o feixe. Observe de novo.', 'The detector records what reaches it; it does not produce the beam. Look again.') },
            ],
            evidencia: {
                pergunta: T('Que observação sustenta a sua resposta?', 'Which observation supports your answer?'),
                opcoes: [
                    { id: 'liga', ok: true, txt: T('No esquema, o feixe só aparece quando o equipamento está ligado.', 'In the diagram, the beam only appears when the equipment is on.'),
                      retorno: T('Boa evidência: ela liga a radiação ao equipamento e ao estado ligado/desligado.', 'Good evidence: it ties the radiation to the equipment and to its on/off state.') },
                    { id: 'osso', txt: T('Na imagem final, os ossos aparecem mais claros que o resto.', 'In the final image, the bones look lighter than the rest.'),
                      retorno: T('Isso descreve a imagem formada, não a origem do feixe. Escolha uma observação sobre de onde a radiação parte.', 'That describes the image formed, not where the beam originates. Pick an observation about where the radiation comes from.') },
                    { id: 'nome', txt: T('O exame se chama "radiografia", e o nome já indica a origem.', 'The exam is called "radiography", and the name already shows the origin.'),
                      retorno: T('O nome do exame não diz de onde a radiação parte. Procure no esquema.', 'The name of the exam does not say where the radiation comes from. Look in the diagram.') },
                ],
            },
            explica: T('Fonte: tubo do equipamento. Neste esquema, ligar significa iniciar a emissão. Um aparelho real pode estar ligado e em espera, sem produzir raios X [V IAEA, Safety Reports Series 13, seção 4.2].', 'Source: the equipment tube. In this diagram, switching on means starting emission. Real equipment can be powered on and on standby without producing X-rays [V IAEA, Safety Reports Series 13, section 4.2].'),
        },
        {
            id: 'caminho', tipo: 'escolha', visual: 'caminho',
            titulo: T('3 · O caminho da radiação', '3 · The path of the radiation'),
            texto: T(
                'No esquema há três elementos: o tubo (fonte da radiação), a paciente e o detector, que forma a imagem.',
                'The diagram has three elements: the tube (source of the radiation), the patient and the detector, which forms the image.'),
            pergunta: T('O que atravessa o corpo e chega ao detector?', 'What passes through the body and reaches the detector?'),
            opcoes: [
                { id: 'rx', ok: true, txt: T('Radiação X (energia): o corpo absorve parte e o resto chega ao detector.', 'X radiation (energy): the body absorbs part and the rest reaches the detector.'),
                  retorno: T('Isso. É a radiação vinda de fora do corpo, entregue pelo equipamento.', 'Right. It is radiation coming from outside the body, delivered by the equipment.') },
                { id: 'material', txt: T('Material radioativo que entra no corpo do paciente e permanece lá depois do exame.', 'Radioactive material that enters the body and stays there after the exam.'),
                  retorno: T('Na radiografia nenhum material radioativo é administrado: a radiação vem de fora. Esse é o caso da medicina nuclear, que veremos no fim.', 'In an X-ray no radioactive material is given: the radiation comes from outside. That is the case in nuclear medicine, which we will see at the end.') },
                { id: 'luz', txt: T('Luz visível comum, que atravessa o corpo e sensibiliza o detector.', 'Ordinary visible light, which passes through the body and exposes the detector.'),
                  retorno: T('Raios X não são luz visível: são radiação ionizante, bem mais energética. Releia a pergunta.', 'X-rays are not visible light: they are ionizing radiation, much more energetic. Read the question again.') },
            ],
            evidencia: {
                pergunta: T('Que parte do esquema mostra isso?', 'Which part of the diagram shows this?'),
                opcoes: [
                    { id: 'seta', ok: true, txt: T('A seta do tubo, passando pela paciente, até o detector.', 'The arrow from the tube, through the patient, to the detector.'),
                      retorno: T('Isso: o esquema mostra a energia passando de fora para dentro e chegando ao detector.', 'Right: the diagram shows energy going from outside, through, to the detector.') },
                    { id: 'sala', txt: T('O desenho da sala em volta, com paredes, porta e uma janela.', 'The drawing of the room around it, with walls, a door and a window.'),
                      retorno: T('A sala é o cenário; ela não mostra o que atravessa o corpo.', 'The room is the setting; it does not show what passes through the body.') },
                    { id: 'legenda', txt: T('A legenda com o nome do hospital e a data do exame, no canto.', 'The caption with the hospital name and the exam date, in the corner.'),
                      retorno: T('O nome do hospital não diz nada sobre o caminho da radiação.', 'The hospital name says nothing about the path of the radiation.') },
                ],
            },
            explica: T('CT e fluoroscopia "entregam radiação de fora" [V RadiologyInfo]; o mesmo vale para a radiografia.', 'CT and fluoroscopy "deliver radiation from the outside" [V RadiologyInfo]; the same applies to X-ray.'),
        },
        {
            id: 'frasco', tipo: 'escolha', visual: 'comparacao',
            titulo: T('4 · A comparação com um frasco', '4 · Comparing with a vial'),
            texto: T(
                'Rita mostra, ao lado, uma ilustração de outro contexto: um frasco blindado com material radioativo (como o césio de que Helena ouviu falar). À esquerda, o equipamento de raios X.',
                'Next to it, Rita shows an illustration from another context: a shielded vial with radioactive material (like the cesium Helena heard about). On the left, the X-ray equipment.'),
            pergunta: T('Por que o equipamento de raios X e o frasco não funcionam do mesmo jeito?', 'Why do the X-ray equipment and the vial not work the same way?'),
            opcoes: [
                { id: 'dif', ok: true, txt: T('O equipamento só produz raios X ligado e não a torna radioativa; o material radioativo emite sempre, sem botão.', 'The equipment makes X-rays only when on and does not make the patient radioactive; radioactive material always emits.'),
                  retorno: T('Isso: um é uma máquina que se liga e desliga; o outro é matéria instável que emite o tempo todo.', 'Right: one is a machine that switches on and off; the other is unstable matter that emits all the time.') },
                { id: 'igual', txt: T('São equivalentes: os dois emitem por conta própria e deixam material no corpo de quem foi exposto.', 'They are equivalent: both emit on their own and leave material in the body of whoever was exposed to them.'),
                  retorno: T('Não são: raios X são produzidos por um equipamento; material radioativo emite por si mesmo. Observe os dois lados.', 'They are not: X-rays are produced by equipment; radioactive material emits by itself. Look at both sides.') },
                { id: 'horas', txt: T('Os raios X deixam a paciente radioativa por algumas horas depois do exame, do mesmo jeito que o material do frasco deixaria.', 'X-rays leave the patient radioactive for a few hours, in the same way that the material in the vial would.'),
                  retorno: T('A fonte oficial usa a radiografia como exemplo de pessoa exposta, mas não contaminada [V CDC]. Receber radiação de fora não é ter material radioativo no corpo.', 'The official source uses X-ray as an example of a person exposed but not contaminated [V CDC]. Receiving radiation from outside is not having radioactive material in the body.') },
            ],
            evidencia: {
                pergunta: T('Que observação sustenta isso?', 'Which observation supports this?'),
                opcoes: [
                    { id: 'estado', ok: true, txt: T('O equipamento tem estados ligado e desligado no esquema; o frasco, não.', 'The equipment has on and off states in the diagram; the vial does not.'),
                      retorno: T('Boa evidência: só o equipamento tem botão de ligar/desligar.', 'Good evidence: only the equipment has an on/off switch.') },
                    { id: 'hosp', txt: T('Os dois aparecem no mesmo hospital, na mesma visita guiada pela técnica.', 'Both appear in the same hospital, during the same visit with the technologist.'),
                      retorno: T('Estarem no mesmo lugar não diz como cada um funciona.', 'Being in the same place does not say how each one works.') },
                    { id: 'tam', txt: T('O frasco aparece desenhado menor que o equipamento na ilustração da comparação.', 'The vial is drawn smaller than the equipment in the comparison illustration.'),
                      retorno: T('O tamanho do desenho não diz como cada um produz radiação.', 'The size of the drawing does not say how each produces radiation.') },
                ],
            },
            explica: T('Exposição não é contaminação: contaminação é a presença indesejada de material radioativo sobre ou dentro da pessoa [V CDC].', 'Exposure is not contamination: contamination is the unwanted presence of radioactive material on or inside the person [V CDC].'),
        },
        {
            id: 'cartaz', registrarMural:true, tipo: 'cartoes', visual: null,
            titulo: T('5 · O que vai para o mural', '5 · What goes on the bulletin board'),
            texto: T('Rita pede ajuda para escolher as frases do cartaz. Marque as que estão corretas e deixe de fora as generalizações.', 'Rita asks for help choosing the poster sentences. Tick the correct ones and leave out the overgeneralizations.'),
            pergunta: T('Marque todas as frases que podem ir ao mural.', 'Tick every sentence that can go on the board.'),
            cartoes: [
                { id: 'c1', ok: true, txt: T('A radiografia usa raios X produzidos pelo tubo durante a exposição; estar apenas ligado à tomada não significa emitir raios X.', 'An X-ray uses X-rays generated by the tube during exposure; being connected to power alone does not mean X-rays are being emitted.'),
                  retorno: T('Correta.', 'Correct.') },
                { id: 'c2', ok: true, txt: T('Depois de uma radiografia, a pessoa não fica radioativa nem contamina outras.', 'After an X-ray, the person is not radioactive and does not contaminate others.'),
                  retorno: T('Correta: raios X são o exemplo de exposição sem contaminação [V CDC].', 'Correct: X-rays are the example of exposure without contamination [V CDC].') },
                { id: 'c3', ok: true, txt: T('Ultrassom e ressonância magnética não usam radiação ionizante (som e campos magnéticos com pulsos de rádio).', 'Ultrasound and MRI do not use ionizing radiation (sound, and magnetic fields with radio pulses).'),
                  retorno: T('Correta [V RadiologyInfo].', 'Correct [V RadiologyInfo].') },
                { id: 'c4', ok: true, txt: T('A radiografia expõe a pessoa a uma pequena dose, por isso o exame é feito quando há necessidade médica.', 'An X-ray exposes the person to a small dose, so the exam is done when there is a medical need.'),
                  retorno: T('Correta: exames são feitos quando necessários, ponderando benefício e risco [V RadiologyInfo].', 'Correct: exams are done when needed, weighing benefit and risk [V RadiologyInfo].') },
                { id: 'g1', txt: T('Todo exame de imagem usa radiação ionizante.', 'Every imaging exam uses ionizing radiation.'),
                  retorno: T('Generalização: ultrassom e ressonância não usam radiação ionizante.', 'Overgeneralization: ultrasound and MRI do not use ionizing radiation.') },
                { id: 'g2', txt: T('Todo uso médico de radiação coloca material radioativo dentro do paciente.', 'Every medical use of radiation puts radioactive material inside the patient.'),
                  retorno: T('Generalização: na radiografia a radiação vem de fora; já na medicina nuclear se administra um material radioativo [V RadiologyInfo].', 'Overgeneralization: in X-ray the radiation comes from outside; in nuclear medicine a radioactive material is given [V RadiologyInfo].') },
                { id: 'g3', txt: T('Ter sido exposto à radiação sempre significa estar contaminado.', 'Having been exposed to radiation always means being contaminated.'),
                  retorno: T('Generalização: exposição (receber radiação) e contaminação (material sobre ou dentro do corpo) são coisas diferentes [V CDC].', 'Overgeneralization: exposure (receiving radiation) and contamination (material on or inside the body) are different things [V CDC].') },
            ],
        },
        {
            id: 'mural', muralDaCena:'cartaz', tipo: 'escolha', visual: null,
            titulo: T('6 · A mensagem do cartaz', '6 · The poster message'),
            texto: T('Falta a frase central do cartaz, para quem passar correndo pelo mural.', 'The central sentence of the poster is still missing, for people hurrying past the board.'),
            pergunta: T('Qual destas frases você escreve como mensagem central?', 'Which of these do you write as the central message?'),
            opcoes: [
                { id: 'ok', ok: true, txt: T('Raios X vêm do equipamento ligado e quem faz radiografia não fica radioativo; nem todo exame usa radiação ionizante, e a equipe pondera benefício e risco.', 'X-rays come from the equipment while on, and X-ray patients do not become radioactive; not every exam uses ionizing radiation, and the team weighs benefit and risk.'),
                  retorno: T('Mensagem completa e sem generalizar.', 'Complete message, with no overgeneralization.') },
                { id: 'medo', txt: T('Qualquer radiação usada em exame é perigosa demais e deve ser evitada sempre, mesmo quando o médico a indica por necessidade clínica.', 'Any radiation used in an exam is far too dangerous and must always be avoided, even when the doctor orders it because it is needed.'),
                  retorno: T('Isso apaga o equilíbrio entre benefício e risco: quando o exame é necessário, o benefício costuma superar o risco [V RadiologyInfo].', 'That erases the balance between benefit and risk: when an exam is needed, the benefit usually outweighs the risk [V RadiologyInfo].') },
                { id: 'horas', txt: T('Depois de qualquer exame que use radiação, a pessoa fica radioativa por algum tempo e deve se afastar dos outros, inclusive da família.', 'After any exam that uses radiation, the person stays radioactive for some time and should keep away from other people, including family.'),
                  retorno: T('Depende do exame: na radiografia não; na medicina nuclear há material radioativo administrado. A frase generaliza.', 'It depends on the exam: not in X-ray; in nuclear medicine a radioactive material is given. The sentence overgeneralizes.') },
                { id: 'zero', txt: T('Exames com raios X são totalmente seguros porque não entregam nenhuma dose de radiação ao paciente examinado.', 'X-ray exams are completely safe because they deliver no radiation dose at all to the patient being examined.'),
                  retorno: T('Há dose, em geral pequena; por isso o exame é feito quando há necessidade.', 'There is a dose, usually small; that is why the exam is done when needed.') },
            ],
        },
        {
            id: 'retomada', reacoes:[
                {erroNaCena:'mural',texto:T('Helena: “Sua primeira mensagem precisava de revisão. Agora ela distingue não ficar radioativa de não existir risco. E o exame do meu primo?”','Helena: “Your first message needed revision. It now separates not becoming radioactive from having no risk. What about my cousin’s exam?”')},
                {semErroNaCena:'mural',texto:T('Helena: “O mural distingue receber radiação de ter material radioativo no corpo. Essa explicação serve para qualquer exame?”','Helena: “The board distinguishes receiving radiation from having radioactive material in the body. Does that explanation fit every exam?”')}
            ], explicacaoPrevia:T('Antes de ver as alternativas, explique com suas palavras: a radiação vem do aparelho ou do material administrado? O que ainda seria necessário saber para orientar o primo de Helena?','Before seeing the options, explain in your own words: does radiation come from the machine or the administered material? What else would you need to know to advise Helena’s cousin?'), tipo: 'escolha', visual: null,
            titulo: T('7 · A retomada', '7 · Back to Helena'),
            texto: T(
                'Helena volta com uma nova pergunta: "Meu primo fez uma cintilografia (medicina nuclear) e disse que teve cuidados especiais por um tempo. É igual à radiografia?"',
                'Helena returns with another question: "My cousin had a scintigraphy (nuclear medicine) and said he had to take special precautions for a while. Is it the same as an X-ray?"'),
            pergunta: T('O que você pode responder, e o que deve encaminhar à equipe?', 'What can you answer, and what should you pass on to the team?'),
            opcoes: [
                { id: 'ok', ok: true, txt: T('É outro tipo de exame: na medicina nuclear se administra um material radioativo; os cuidados do primo e os dela, quem explica é a equipe.', 'It is a different kind of exam: nuclear medicine gives a radioactive material; precautions for her cousin and for her are for the team to explain.'),
                  retorno: T('Boa resposta: você separa o que dá para explicar (a diferença de mecanismo) do que depende do exame e do paciente.', 'Good answer: you separate what can be explained (the difference in mechanism) from what depends on the exam and the patient.') },
                { id: 'igual', txt: T('É igual: só o aparelho emite radiação, então não existe nenhum cuidado depois do exame, seja qual for o caso, o tipo de exame ou o paciente.', 'It is the same: only the machine emits radiation, so no precautions exist after the exam, whatever the case, the exam or the patient.'),
                  retorno: T('Não: em medicina nuclear o material radioativo é administrado, acumula-se na região estudada e a gama-câmara detecta a energia emitida; a câmara em si não emite radiação [V RadiologyInfo].', 'No: in nuclear medicine the radioactive material is given, accumulates in the area studied, and the gamma camera detects the energy emitted; the camera itself does not emit radiation [V RadiologyInfo].') },
                { id: 'tempo', txt: T('Posso garantir por quantos dias o primo deve ficar longe de crianças, porque todo mundo faz o mesmo exame do mesmo jeito.', 'I can guarantee for how many days the cousin must stay away from children, because everyone has the same exam in exactly the same way.'),
                  retorno: T('Não: orientações individuais dependem do exame e do paciente. Elas são da equipe, não do cartaz.', 'No: individual instructions depend on the exam and the patient. They belong to the team, not to the poster.') },
            ],
        },
    ],
    fontesPublicas: T(
        'CDC, What Causes Contamination versus Exposure (cdc.gov/radiation-emergencies/causes); ACR/RSNA RadiologyInfo, Safety in X-ray, interventional radiology and nuclear medicine procedures (radiologyinfo.org/en/info/safety-radiation) e General Nuclear Medicine (radiologyinfo.org/en/info/gennuclear); IAEA, Safety Reports Series 13, seção 4.2 (pub.iaea.org/MTCD/Publications/PDF/P066_scr.pdf).',
        'CDC, What Causes Contamination versus Exposure (cdc.gov/radiation-emergencies/causes); ACR/RSNA RadiologyInfo, Safety in X-ray, interventional radiology and nuclear medicine procedures (radiologyinfo.org/en/info/safety-radiation) and General Nuclear Medicine (radiologyinfo.org/en/info/gennuclear); IAEA, Safety Reports Series 13, section 4.2 (pub.iaea.org/MTCD/Publications/PDF/P066_scr.pdf).'),
    fontes: T(
        'CDC, What Causes Contamination versus Exposure (cdc.gov/radiation-emergencies/causes) [V]; ACR/RSNA RadiologyInfo, Safety in X-ray, interventional radiology and nuclear medicine procedures (radiologyinfo.org/en/info/safety-radiation) [V] e General Nuclear Medicine (radiologyinfo.org/en/info/gennuclear) [V]. AIEA, Radiation Protection and Safety in Industrial Radiography, Safety Reports Series 13 (1999), seção 4.2, p. 28: distingue energizado/em espera de geração de raios X [V]. No esquema, ligar inicia a emissão [H]. Cenas, personagens e redação: escolha de projeto, em revisão [H].',
        'CDC, What Causes Contamination versus Exposure (cdc.gov/radiation-emergencies/causes) [V]; ACR/RSNA RadiologyInfo, Safety in X-ray, interventional radiology and nuclear medicine procedures (radiologyinfo.org/en/info/safety-radiation) [V] and General Nuclear Medicine (radiologyinfo.org/en/info/gennuclear) [V]. IAEA, Radiation Protection and Safety in Industrial Radiography, Safety Reports Series 13 (1999), section 4.2, p. 28: distinguishes powered/standby from X-ray generation [V]. In the diagram, switching on starts emission [H]. Scenes, characters and wording: project choice, under review [H].'),
};
