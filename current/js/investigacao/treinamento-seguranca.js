// ============================================
// TREINAMENTO DE SEGURANÇA DO LABORATÓRIO DE CRONOLOGIA (rascunho educativo).
// Cada laboratório tem um instrutor (NPC fictício). O treino tem 4 passos e uma pergunta de verificação.
// No jogo o treino é tratado como real (guia, sem o rótulo de rascunho). O texto é GERAL (boas práticas comuns de laboratório) e NÃO substitui as normas, fichas de segurança e
// orientações do próprio laboratório. Não traz números, limites, normas ou marcas. Estado: [H] até revisão do Grupo.
// O treino orienta e avisa; nunca impede o uso de um equipamento no jogo.
// ============================================
const CHAVE = 'rh_treinos_seguranca_v1';
const T = (pt, en) => ({ pt, en });
const O = (pt, en, correta, porquePt, porqueEn) => ({ txt: T(pt, en), correta, porque: T(porquePt, porqueEn) });

export const AVISO_TREINO = T('Guia de segurança do laboratório. É uma orientação geral e não substitui as normas e fichas de segurança do seu laboratório.', 'Laboratory safety guide. It is general guidance and does not replace your own laboratory’s rules and safety data sheets.');

export const TREINOS = [
    {
        id: 'lab1', npc: 'bia', area: 0, x: 3.5, y: 8.5, lab: T('Lab 1 · Polimento, corte e montagem', 'Lab 1 · Polishing, cutting and mounting'),
        passos: [
            T('Antes de ligar a serra ou a politriz, prenda cabelos longos, retire colares e pulseiras e evite mangas soltas. Peças giratórias puxam o que estiver solto.', 'Before switching on the saw or polisher, tie back long hair, remove necklaces and bracelets and avoid loose sleeves. Rotating parts pull in anything loose.'),
            T('Use óculos de proteção e, conforme o procedimento, luvas ou avental. Mantenha as proteções no lugar e não abra a tampa com a peça girando.', 'Wear safety glasses and, as the procedure requires, gloves or an apron. Keep guards in place and never open the cover while the part is spinning.'),
            T('Resinas, solventes e pós: leia o rótulo e a ficha de segurança, trabalhe com boa ventilação e use a proteção indicada. Lave as mãos ao terminar.', 'Resins, solvents and dust: read the label and safety data sheet, work with good ventilation and use the protection indicated. Wash your hands when finished.'),
            T('Na limpeza ultrassônica, não ponha as mãos no líquido com o aparelho ligado. Ao terminar, desligue, limpe a bancada e devolva as amostras ao lugar identificado.', 'With the ultrasonic cleaner, do not put your hands in the liquid while it is on. When finished, switch off, clean the bench and return samples to their labelled place.'),
        ],
        pergunta: T('Você vai cortar uma amostra na serra. Qual é a preparação mais segura?', 'You are about to cut a sample on the saw. What is the safest preparation?'),
        opcoes: [
            O('Prender o cabelo, usar óculos, fixar a amostra no grampo e fechar a proteção antes de ligar.', 'Tie back hair, wear glasses, clamp the sample and close the guard before switching on.', true, 'Corpo, olhos e peça ficam protegidos antes de qualquer movimento.', 'Body, eyes and workpiece are protected before anything moves.'),
            O('Segurar a amostra com a mão para ela não se mexer enquanto a lâmina gira.', 'Hold the sample by hand so it does not move while the blade spins.', false, 'A mão perto da lâmina é o principal risco; use o grampo ou suporte do equipamento.', 'A hand near the blade is the main hazard; use the clamp or holder.'),
            O('Abrir a proteção para enxergar melhor o corte enquanto a serra funciona.', 'Open the guard to see the cut better while the saw is running.', false, 'A proteção só se abre com a lâmina parada.', 'The guard is only opened with the blade stopped.'),
        ],
    },
    {
        id: 'lab2', npc: 'otto', area: 1, x: 19.5, y: 8.5, lab: T('Lab 2 · Tratamento térmico', 'Lab 2 · Heat treatment'),
        passos: [
            T('Fornos continuam quentes por muito tempo depois de desligados. Considere quente tudo o que estiver perto até confirmar que esfriou.', 'Furnaces stay hot for a long time after being switched off. Treat everything nearby as hot until you confirm it has cooled.'),
            T('Use luvas térmicas e pinças próprias para colocar e retirar amostras. Mantenha papéis, plásticos e líquidos inflamáveis longe do forno.', 'Use heat-resistant gloves and proper tongs to load and remove samples. Keep paper, plastics and flammable liquids away from the furnace.'),
            T('Forno tubular e bomba de vácuo: não abra um sistema que esteja quente ou sob vácuo. Siga a ordem de operação do procedimento do laboratório.', 'Tube furnace and vacuum pump: do not open a system that is hot or under vacuum. Follow the operating sequence in your laboratory procedure.'),
            T('Registre o uso, não deixe um forno funcionando sem autorização do responsável e sinalize que há aquecimento em andamento.', 'Log the use, do not leave a furnace running without the supervisor’s authorisation and signal that heating is in progress.'),
            T('Experimentos de annealing podem durar dezenas ou centenas de horas. Antes de deixar um forno em aquecimento prolongado, registre início, temperatura, duração prevista e responsável, e sinalize o equipamento.', 'Annealing experiments can last tens or hundreds of hours. Before leaving a furnace on a long heating, record the start, temperature, expected duration and person in charge, and label the equipment.'),
        ],
        pergunta: T('O forno foi desligado há pouco e você precisa retirar uma amostra. O que fazer?', 'The furnace was switched off a short while ago and you need to take out a sample. What should you do?'),
        opcoes: [
            O('Considerar que ainda está quente, usar luva térmica e pinça e esperar o tempo definido no procedimento.', 'Assume it is still hot, use heat-resistant gloves and tongs and wait as the procedure says.', true, 'Desligado não significa frio.', 'Switched off does not mean cold.'),
            O('Retirar com luva comum, porque o forno está desligado.', 'Take it out with ordinary gloves because the furnace is off.', false, 'Luva comum não protege de superfícies muito quentes.', 'Ordinary gloves do not protect against very hot surfaces.'),
            O('Abrir o sistema de vácuo para o forno esfriar mais depressa.', 'Open the vacuum system so the furnace cools faster.', false, 'Sistemas quentes ou sob vácuo não devem ser abertos fora do procedimento.', 'Hot systems or systems under vacuum must not be opened outside the procedure.'),
        ],
    },
    {
        id: 'lab3', npc: 'nina', area: 2, x: 31.5, y: 4.5, lab: T('Lab 3 · Ataque químico', 'Lab 3 · Chemical etching'),
        passos: [
            T('Antes de começar, leia o rótulo e a ficha de segurança do reagente. Use óculos, luvas adequadas ao reagente, avental e sapato fechado.', 'Before starting, read the reagent label and safety data sheet. Wear glasses, gloves suited to the reagent, an apron and closed shoes.'),
            T('Manipule reagentes na capela, com a exaustão ligada. Nunca pipete com a boca e não leve alimentos ou bebidas para o laboratório.', 'Handle reagents in the fume hood with the extraction on. Never pipette by mouth and do not bring food or drink into the laboratory.'),
            T('Rotule todo recipiente com conteúdo e data. Descarte cada resíduo no frasco indicado; não despeje reagentes na pia sem autorização do procedimento.', 'Label every container with contents and date. Put each waste in its designated bottle; do not pour reagents down the sink unless the procedure allows it.'),
            T('Se houver respingo na pele ou nos olhos, use imediatamente o chuveiro ou o lava-olhos com água abundante e avise o responsável. Comunique também qualquer derramamento.', 'If there is a splash on skin or eyes, use the emergency shower or eyewash immediately with plenty of water and tell your supervisor. Report any spill too.'),
            T('Ácido fluorídrico (HF), usado para atacar mica, exige cuidado específico: só com treino próprio, na capela, com luvas e proteção indicadas na ficha de segurança e com o procedimento de emergência da instituição conhecido de antemão. Qualquer contato com a pele deve ser comunicado na hora, mesmo sem dor.', 'Hydrofluoric acid (HF), used to etch mica, needs specific care: only with its own training, in the fume hood, with the gloves and protection named in the safety data sheet and with your institution’s emergency procedure known in advance. Any skin contact must be reported at once, even without pain.'),
        ],
        pergunta: T('Um pouco de reagente respingou na sua luva. O que é mais adequado?', 'A little reagent splashed on your glove. What is most appropriate?'),
        opcoes: [
            O('Afastar-se, retirar a luva com cuidado, lavar as mãos, avisar o responsável e limpar conforme o procedimento.', 'Step back, remove the glove carefully, wash your hands, tell the supervisor and clean up as the procedure says.', true, 'Interrompe o contato e registra o incidente.', 'It stops the contact and reports the incident.'),
            O('Continuar o trabalho com a mesma luva para não perder o banho.', 'Carry on with the same glove so the bath is not wasted.', false, 'A luva contaminada pode levar o reagente à pele ou a outras superfícies.', 'A contaminated glove can carry the reagent to skin or other surfaces.'),
            O('Enxugar a luva no avental e seguir.', 'Wipe the glove on your apron and carry on.', false, 'Isso espalha o reagente para a roupa.', 'That spreads the reagent onto your clothing.'),
        ],
    },
    {
        id: 'lab4', npc: 'davi', area: 4, x: 6.5, y: 17.5, lab: T('Lab 4 · Fontes radioativas', 'Lab 4 · Radioactive sources'),
        passos: [
            T('Fontes radioativas só são manuseadas com autorização, registro de uso e acompanhamento do responsável. Quem está em treinamento nunca as manuseia sozinho.', 'Radioactive sources are handled only with authorisation, a usage record and the supervisor’s oversight. Someone in training never handles them alone.'),
            T('Para reduzir a exposição, combine três ideias: menos tempo perto da fonte, mais distância e uma blindagem adequada ao tipo de radiação.', 'To reduce exposure, combine three ideas: less time near the source, more distance and shielding suited to the type of radiation.'),
            T('Use o dosímetro pessoal quando exigido, respeite a sinalização do trifólio e mantenha cofres e armários trancados depois do uso.', 'Wear your personal dosimeter when required, respect the trefoil signs and keep safes and cabinets locked after use.'),
            T('Não coma, beba nem aplique cosméticos na área. Lave as mãos ao sair e avise o responsável sobre qualquer incidente. O princípio é manter a exposição tão baixa quanto razoavelmente possível (ALARA).', 'Do not eat, drink or apply cosmetics in the area. Wash your hands on leaving and tell the supervisor about any incident. The principle is to keep exposure as low as reasonably achievable (ALARA).'),
            T('Amostras que voltam de um reator de pesquisa podem estar radioativas. Só as manuseie depois da liberação e da medição feitas conforme o procedimento da instalação, e guarde-as no local autorizado.', 'Samples returning from a research reactor can be radioactive. Handle them only after release and measurement done according to the facility’s procedure, and store them in the authorised place.'),
        ],
        pergunta: T('Qual combinação reduz a exposição a uma fonte?', 'Which combination reduces exposure to a source?'),
        opcoes: [
            O('Ficar o menor tempo possível, manter distância e usar blindagem adequada.', 'Spend as little time as possible, keep your distance and use suitable shielding.', true, 'Tempo, distância e blindagem atuam juntos.', 'Time, distance and shielding work together.'),
            O('Aproximar-se para terminar mais rápido, sem blindagem.', 'Get close to finish faster, without shielding.', false, 'Ficar mais perto aumenta a exposição; ser rápido não compensa tudo.', 'Being closer increases exposure; being quick does not make up for it.'),
            O('Deixar o cofre aberto durante o trabalho para ganhar tempo.', 'Leave the safe open during the work to save time.', false, 'Cofres e armários ficam fechados e trancados quando não estão em uso direto.', 'Safes and cabinets stay closed and locked when not in direct use.'),
        ],
    },
    {
        id: 'lab5a', npc: 'lea', area: 8, x: 6.5, y: 30.5, lab: T('Lab 5 · Microscopia e contagem', 'Lab 5 · Microscopy and counting'),
        passos: [
            T('Mantenha líquidos longe de microscópios e computadores e não puxe cabos. Lâmpadas e fontes de luz esquentam; espere esfriar antes de trocar.', 'Keep liquids away from microscopes and computers and do not pull on cables. Lamps and light sources get hot; let them cool before changing them.'),
            T('Lâminas de vidro e peças atacadas podem ter bordas cortantes. Use pinça e descarte vidro quebrado em recipiente próprio.', 'Glass slides and etched pieces may have sharp edges. Use tweezers and put broken glass in a proper container.'),
            T('Ajuste a altura da cadeira e do monitor e faça pausas na contagem manual para descansar a vista e os pulsos.', 'Adjust chair and monitor height and take breaks from manual counting to rest your eyes and wrists.'),
            T('Identifique cada amostra e guarde-a no arquivo depois da análise. Para amostras que tenham sido expostas ou irradiadas, siga a orientação do responsável.', 'Label each sample and file it after analysis. For samples that were exposed or irradiated, follow your supervisor’s instructions.'),
        ],
        pergunta: T('Uma lâmina de vidro trincou durante a análise. O que fazer?', 'A glass slide cracked during analysis. What should you do?'),
        opcoes: [
            O('Não recolher com a mão; usar pinça ou pá, descartar no recipiente para vidro e avisar o responsável.', 'Do not pick it up by hand; use tweezers or a pan, put it in the glass container and tell the supervisor.', true, 'Evita cortes e mantém o descarte correto.', 'It avoids cuts and keeps disposal correct.'),
            O('Recolher rápido com a mão e jogar no lixo comum.', 'Quickly pick it up by hand and throw it in the normal bin.', false, 'Vidro no lixo comum machuca quem recolhe o lixo.', 'Glass in the normal bin hurts the person who handles the waste.'),
            O('Deixar na bancada para resolver depois.', 'Leave it on the bench to sort out later.', false, 'Vidro quebrado largado causa acidentes.', 'Broken glass left out causes accidents.'),
        ],
    },
    {
        id: 'lab5b', npc: 'teo', area: 9, x: 20.5, y: 33.5, lab: T('Lab 5 · Eletrônica básica', 'Lab 5 · Basic electronics'),
        passos: [
            T('Antes de mexer num circuito, desligue a fonte e desconecte a alimentação. Só volte a ligar depois de conferir as conexões.', 'Before touching a circuit, switch off the supply and unplug the power. Switch it back on only after checking the connections.'),
            T('O ferro de solda esquenta muito: use sempre o suporte, nunca o deixe ligado sem supervisão, mantenha a exaustão da fumaça ligada e use óculos de proteção.', 'The soldering iron gets very hot: always use the stand, never leave it on unattended, keep the fume extraction on and wear safety glasses.'),
            T('Lave as mãos depois de soldar e de manipular componentes e fios. Guarde componentes e ferramentas nos gaveteiros.', 'Wash your hands after soldering and handling components and wires. Store components and tools in the drawers.'),
            T('Em osciloscópio e fonte de bancada, verifique cabos e isolamento antes de usar e não improvise com fios danificados. No banho automatizado com braço robótico, mantenha as mãos fora da área de movimento enquanto estiver ligado.', 'With the oscilloscope and bench supply, check cables and insulation before use and do not improvise with damaged wires. At the automated bath with the robotic arm, keep your hands out of the moving area while it is on.'),
        ],
        pergunta: T('Você vai trocar um componente no circuito. Qual é o primeiro passo?', 'You are going to replace a component in the circuit. What is the first step?'),
        opcoes: [
            O('Desligar a fonte e desconectar a alimentação.', 'Switch off the supply and unplug the power.', true, 'Sem alimentação, o circuito não pode causar choque nem dano.', 'Without power, the circuit cannot cause a shock or damage.'),
            O('Trocar com o circuito ligado, para testar na hora.', 'Swap it with the circuit on, to test straight away.', false, 'Alterar um circuito energizado é arriscado para você e para o equipamento.', 'Changing a live circuit is risky for you and the equipment.'),
            O('Pegar o ferro de solda e procurar o suporte depois.', 'Pick up the soldering iron and look for the stand later.', false, 'O ferro quente deve ter sempre um lugar seguro para repousar.', 'A hot iron always needs a safe place to rest.'),
        ],
    },
    {
        id: 'lab5c', npc: 'iris', area: 10, x: 33.5, y: 33.5, lab: T('Lab 5 · Impressão 3D', 'Lab 5 · 3D printing'),
        passos: [
            T('A mesa e o bico da impressora ficam muito quentes. Não toque nessas partes durante a impressão nem logo depois.', 'The printer bed and nozzle get very hot. Do not touch them during printing or right after.'),
            T('Não abra nem mexa na impressora enquanto ela se move. Partes móveis podem prender dedos e cabelos.', 'Do not open or reach into the printer while it is moving. Moving parts can trap fingers and hair.'),
            T('Deixe a peça esfriar antes de retirar. Use espátula ou ferramenta própria, não os dedos, e óculos ao remover suportes.', 'Let the part cool before removing it. Use a scraper or proper tool, not your fingers, and wear glasses when removing supports.'),
            T('Ventile o ambiente, registre a impressão e não deixe a impressora funcionando sem supervisão se o laboratório não autorizar. Guarde filamentos longe de umidade e calor.', 'Ventilate the room, log the print and do not leave the printer running unattended unless the laboratory allows it. Store filaments away from moisture and heat.'),
        ],
        pergunta: T('A impressão terminou. Como retirar a peça?', 'The print has finished. How do you remove the part?'),
        opcoes: [
            O('Esperar esfriar e soltar com a espátula, com a impressora parada.', 'Wait for it to cool and release it with the scraper, with the printer stopped.', true, 'Evita queimaduras e prende-mãos em partes móveis.', 'It avoids burns and pinching in moving parts.'),
            O('Puxar com a mão na hora, porque a peça solta mais fácil quente.', 'Pull it off by hand right away because it comes off easier hot.', false, 'A mesa e a peça podem estar quentes.', 'The bed and the part may be hot.'),
            O('Aproximar a mão do bico para ajudar a soltar.', 'Put a hand near the nozzle to help it come loose.', false, 'O bico é uma das partes mais quentes.', 'The nozzle is one of the hottest parts.'),
        ],
    },
];

/** Estado salvo (armazenamento pode estar bloqueado: segue só em memória). */
let feitos = null;
export function treinosFeitos() {
    if (feitos) return feitos;
    feitos = new Set();
    try { const v = JSON.parse(localStorage.getItem(CHAVE) || '[]'); if (Array.isArray(v)) for (const id of v) if (TREINOS.some((t) => t.id === id)) feitos.add(id); } catch (e) { /* sem armazenamento */ }
    return feitos;
}
export function treinoFeito(id) { return treinosFeitos().has(id); }
export function registrarTreino(id) {
    treinosFeitos().add(id);
    try { localStorage.setItem(CHAVE, JSON.stringify([...feitos])); } catch (e) { /* sem armazenamento */ }
}
export function reiniciarTreinos() { feitos = new Set(); try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ } }

/** Qual treino cobre um ponto (tile) do mapa, pela área da planta. */
export function treinoDaArea(planta, x, y) {
    const i = planta.areas.findIndex((a) => x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h);
    return i < 0 ? null : TREINOS.find((t) => t.area === i) || null;
}

/** Modal do treino. Resolve com {concluido} quando o jogador fecha. */
export function abrirTreino(treino, lang, aoFechar) {
    let m = document.getElementById('treino-modal');
    if (!m) {
        m = document.createElement('div'); m.id = 'treino-modal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
        m.innerHTML = '<div class="modal-content licao-content treino-content"></div>';
        document.body.appendChild(m);
    }
    const box = m.querySelector('.treino-content');
    const L = lang === 'pt'
        ? { titulo: 'Treino de segurança', passo: 'Passo', de: 'de', prox: 'Próximo', teste: 'Verificação', ok: 'OK', sair: 'Sair', tente: 'Tente de novo.', certo: 'Correto.', fim: 'Treino concluído. Você pode usar os equipamentos deste laboratório com mais segurança.', jaFeito: 'Treino já concluído antes. Você pode revê-lo.' }
        : { titulo: 'Safety training', passo: 'Step', de: 'of', prox: 'Next', teste: 'Check', ok: 'OK', sair: 'Leave', tente: 'Try again.', certo: 'Correct.', fim: 'Training complete. You can use this laboratory’s equipment more safely.', jaFeito: 'Training already completed before. You can review it.' };
    const jaFeito = treinoFeito(treino.id);
    let passo = 0, concluido = false;
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
    const fechar = () => { m.classList.remove('active'); document.removeEventListener('keydown', teclas, true); aoFechar({ concluido }); };
    const teclas = (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fechar(); } };
    const cabecalho = (extra) => {
        box.replaceChildren();
        box.appendChild(el('div', 'enc-selo', L.titulo + ' · ' + treino.lab[lang]));
        if (extra) box.appendChild(el('p', 'enc-contador', extra));
    };
    const aviso = () => box.appendChild(el('p', 'enc-contador', AVISO_TREINO[lang]));
    const mostrarPasso = () => {
        cabecalho(`${L.passo} ${passo + 1} ${L.de} ${treino.passos.length}` + (jaFeito && passo === 0 ? ' · ' + L.jaFeito : ''));
        box.appendChild(el('p', 'enc-enunciado', treino.passos[passo][lang]));
        const b = el('button', 'modal-btn licao-primario', L.prox); b.type = 'button';
        b.addEventListener('click', () => { passo++; if (passo < treino.passos.length) mostrarPasso(); else mostrarPergunta(); });
        const s = el('button', 'modal-btn cancel-btn', L.sair); s.type = 'button'; s.addEventListener('click', fechar);
        box.append(b, s); aviso(); b.focus();
    };
    const mostrarPergunta = () => {
        cabecalho(L.teste);
        box.appendChild(el('p', 'enc-enunciado', treino.pergunta[lang]));
        const fb = el('p', 'enc-reforco', ''); fb.hidden = true; fb.setAttribute('aria-live', 'polite');
        const lista = el('div', 'enc-opcoes');
        treino.opcoes.forEach((o) => {
            const b = el('button', 'modal-btn licao-opcao', o.txt[lang]); b.type = 'button';
            b.addEventListener('click', () => {
                fb.hidden = false;
                if (o.correta) {
                    concluido = true; registrarTreino(treino.id);
                    cabecalho(L.certo); box.appendChild(el('p', 'enc-enunciado', o.porque[lang])); box.appendChild(el('p', 'enc-enunciado', L.fim));
                    const ok = el('button', 'modal-btn ok-btn', L.ok); ok.type = 'button'; ok.addEventListener('click', fechar); box.appendChild(ok); aviso(); ok.focus();
                } else { fb.textContent = L.tente + ' ' + o.porque[lang]; b.disabled = true; }
            });
            lista.appendChild(b);
        });
        box.append(lista, fb);
        const s = el('button', 'modal-btn cancel-btn', L.sair); s.type = 'button'; s.addEventListener('click', fechar); box.appendChild(s); aviso();
    };
    document.addEventListener('keydown', teclas, true);
    mostrarPasso(); m.classList.add('active');
}
