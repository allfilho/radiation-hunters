// ============================================
// MISSÕES RÁPIDAS (v3.10): chamados de cidadãos. Como as interceptações do X-COM, enchem o intervalo entre as missões grandes da história:
// uma região pequena, mapa aleatório baseado no BIOMA do lugar, de 1 a 3 fontes, prazo curto e prêmio menor.
// Lógica PURA (sem DOM, sem Phaser): roda em Node. TUDO sai da semente: o estado guarda só o id `q<semente>`, e o alerta, o texto,
// a região e o mapa são recalculados quando precisa (assim o salvamento fica pequeno e o mesmo chamado gera sempre o mesmo mapa).
// Os relatos são FICTÍCIOS (treino): as regiões são só pontos do mapa-múndi, nenhum evento real é descrito [H].
// ============================================
import { ALERTAS } from './dados.js';
import { gerarPlantaRapida, prng } from '../mapa/plantas-rapidas.js';
import { CASOS_FALSO } from '../investigacao/falso-alarme.js';
import { AMBE } from '../data/isotopes.js';

const T = (pt, en) => ({ pt, en });

/** Regiões do mapa-múndi onde os chamados podem surgir (coordenadas aproximadas, só para o pino) e o bioma da cena [H]. */
export const REGIOES = [
    { id: 'mg', lat: -19.9, lon: -44.0, bioma: 'rural', nome: T('interior de Minas Gerais, Brasil', 'rural Minas Gerais, Brazil') },
    { id: 'ba', lat: -34.6, lon: -58.4, bioma: 'urbano', nome: T('Grande Buenos Aires, Argentina', 'Greater Buenos Aires, Argentina') },
    { id: 'cdmx', lat: 19.4, lon: -99.1, bioma: 'urbano', nome: T('Cidade do México, México', 'Mexico City, Mexico') },
    { id: 'tx', lat: 31.0, lon: -97.5, bioma: 'industrial', nome: T('Texas, Estados Unidos', 'Texas, United States') },
    { id: 'on', lat: 44.0, lon: -79.5, bioma: 'rural', nome: T('Ontário, Canadá', 'Ontario, Canada') },
    { id: 'am', lat: -3.1, lon: -60.0, bioma: 'floresta', nome: T('Amazônia, Brasil', 'Amazon, Brazil') },
    { id: 'ruhr', lat: 51.5, lon: 7.0, bioma: 'industrial', nome: T('região do Ruhr, Alemanha', 'Ruhr region, Germany') },
    { id: 'and', lat: 37.4, lon: -5.9, bioma: 'rural', nome: T('Andaluzia, Espanha', 'Andalusia, Spain') },
    { id: 'sue', lat: 65.0, lon: 20.0, bioma: 'floresta', nome: T('norte da Suécia', 'northern Sweden') },
    { id: 'lag', lat: 6.5, lon: 3.4, bioma: 'costa', nome: T('Lagos, Nigéria', 'Lagos, Nigeria') },
    { id: 'cpt', lat: -33.9, lon: 18.4, bioma: 'costa', nome: T('Cidade do Cabo, África do Sul', 'Cape Town, South Africa') },
    { id: 'mum', lat: 19.1, lon: 72.9, bioma: 'costa', nome: T('Mumbai, Índia', 'Mumbai, India') },
    { id: 'kz', lat: 47.0, lon: 68.0, bioma: 'rural', nome: T('estepe do Cazaquistão', 'Kazakh steppe') },
    { id: 'sib', lat: 56.0, lon: 92.0, bioma: 'floresta', nome: T('Sibéria, Rússia', 'Siberia, Russia') },
    { id: 'aus', lat: -23.7, lon: 133.9, bioma: 'industrial', nome: T('interior da Austrália', 'Australian outback') },
    { id: 'osa', lat: 34.7, lon: 135.5, bioma: 'urbano', nome: T('Osaka, Japão', 'Osaka, Japan') },
    { id: 'val', lat: -33.0, lon: -71.6, bioma: 'costa', nome: T('litoral do Chile', 'coast of Chile') },
    { id: 'lyo', lat: 45.8, lon: 4.8, bioma: 'clinica', nome: T('Lyon, França', 'Lyon, France') },
    { id: 'nai', lat: -1.3, lon: 36.8, bioma: 'clinica', nome: T('Nairóbi, Quênia', 'Nairobi, Kenya') },
    { id: 'tor', lat: 43.7, lon: -79.4, bioma: 'clinica', nome: T('Toronto, Canadá', 'Toronto, Canada') },
];

/** Isótopo da missão e distratores da identificação. Os pares (real × distrator) são conferidos pelo teste 53 com as placas do jogo. */
export const PERFIS_FONTE = [
    { iso: 'Cs-137', extras: ['Co-60', 'Sr-90', 'Am-241'], biomas: ['urbano', 'industrial', 'rural', 'costa'] },
    { iso: 'Co-60', extras: ['Cs-137', 'Sr-90', 'Am-241'], biomas: ['industrial', 'costa', 'urbano'] },
    { iso: 'Ir-192', extras: ['Co-60', 'Sr-90', 'Am-241'], biomas: ['industrial', 'costa', 'urbano'] },
    { iso: 'Sr-90', extras: ['Cs-137', 'Co-60', 'Am-241'], biomas: ['floresta', 'rural'] },
    { iso: 'I-131', extras: ['Tc-99m', 'Co-60', 'Am-241'], biomas: ['clinica'] },
    { iso: 'Tc-99m', extras: ['I-131', 'Co-60', 'Am-241'], biomas: ['clinica'] },
];

const RELATOS = {
    urbano: [
        T('Um morador ligou para a Agência: uma peça metálica pesada, achada numa obra abandonada perto de casa, está guardada em algum imóvel da rua e ninguém sabe ao certo o que é. A vizinhança foi afastada. Procure a origem entre as casas e as lojas antes que alguém mexa nela de novo.', 'A resident phoned the Agency: a heavy metal part found at an abandoned building site near home is stored in one of the buildings on the street and nobody knows what it is. The neighbourhood was moved back. Search the houses and shops for the source before anyone handles it again.'),
        T('Uma lojista contou que o detector da portaria de um depósito apitou quando um caminhão de sucata passou pela rua. O caminhão seguiu viagem, mas pode ter deixado algo num dos prédios. Varra a rua e os imóveis, começando pelo mais próximo da calçada.', 'A shopkeeper said the gate detector of a warehouse alarmed when a scrap truck drove down the street. The truck moved on, but it may have left something in one of the buildings. Sweep the street and the buildings, starting with the one closest to the pavement.'),
    ],
    industrial: [
        T('O vigia de um pátio industrial desativado notou uma caixa lacrada, com um símbolo de trevo, que não estava lá na semana passada. A empresa que operava o local foi à falência. Verifique os galpões e o pátio com cuidado.', 'The watchman of a disused industrial yard noticed a sealed box with a trefoil symbol that was not there last week. The company that ran the site went bankrupt. Check the sheds and the yard carefully.'),
        T('Um sucateiro desconfiou de um equipamento pesado que chegou misturado a uma carga de metal. A balança acusou peso a mais e o leitor de portaria apitou. Procure entre as máquinas, os barris e o material do pátio.', 'A scrap dealer grew suspicious of a heavy device that arrived mixed into a load of metal. The scale showed extra weight and the gate reader beeped. Search among the machines, barrels and yard material.'),
    ],
    rural: [
        T('Um fazendeiro encontrou, ao limpar um galpão antigo, um recipiente metálico com marcas desbotadas. Ele o deixou onde estava e ligou para a Agência. Confira a casa, o galpão e o terreno em volta.', 'A farmer found a metal container with faded markings while clearing out an old shed. He left it where it was and phoned the Agency. Check the house, the barn and the surrounding land.'),
        T('Uma cooperativa rural pediu ajuda: um trabalhador diz ter achado, perto da estrada de terra, uma peça de aparelho que "pesa demais para o tamanho". Ninguém quer chegar perto. Varra a propriedade com o Geiger.', 'A rural cooperative asked for help: a worker says he found a piece of equipment near the dirt road that is "too heavy for its size". Nobody wants to get close. Sweep the property with the Geiger counter.'),
    ],
    floresta: [
        T('Madeireiros que atravessavam a mata acharam um acampamento abandonado, com caixas e um objeto metálico fechado que eles preferiram não tocar. Siga a trilha a partir da pista de pouso e examine a clareira.', 'Loggers crossing the woods came upon an abandoned camp with crates and a closed metal object they chose not to touch. Follow the trail from the landing strip and examine the clearing.'),
        T('Um guarda-florestal reportou uma cabana de caça fora de uso e equipamento velho espalhado ao redor. O detector portátil dele apitou perto de uma das caixas. Procure na cabana e na clareira.', 'A forest ranger reported a disused hunting cabin and old equipment scattered around it. His handheld detector beeped near one of the crates. Search the cabin and the clearing.'),
    ],
    costa: [
        T('A guarda portuária parou um contêiner sem documentos num cais pequeno, depois que um detector de rotina apitou. A carga foi espalhada entre os armazéns. Procure nos armazéns e no cais, e atenção ao vento do mar.', 'The harbour guard stopped an undocumented container on a small quay after a routine detector beeped. The cargo was spread among the warehouses. Search the warehouses and the quay, and mind the sea wind.'),
        T('Pescadores arrastaram uma caixa pesada e lacrada na rede e a deixaram num galpão do cais. Eles ficaram preocupados com um símbolo na tampa e ligaram para a Agência. Verifique o cais e os armazéns.', 'Fishermen dragged a heavy sealed box up in their net and left it in a shed on the quay. They worried about a symbol on the lid and phoned the Agency. Check the quay and the warehouses.'),
    ],
    clinica: [
        T('Uma pequena clínica mudou de endereço e deixou para trás material de uso médico sem a identificação do rejeito. Um faxineiro percebeu um frasco com etiqueta apagada. Procure nas salas e no corredor, sem mexer no que não conhecer.', 'A small clinic moved and left behind medical material without the waste labelling. A cleaner noticed a vial with a worn-out label. Search the rooms and the corridor without touching anything you do not know.'),
        T('A administração de um ambulatório pediu avaliação: depois de uma troca de equipamentos, sobrou uma fonte de calibração que não consta do inventário. Verifique salas, armários e a ambulância estacionada.', 'The management of an outpatient clinic asked for an assessment: after a change of equipment, a calibration source is left over that is not in the inventory. Check the rooms, cabinets and the parked ambulance.'),
    ],
};


/** v3.21: todo chamado chega como NOTÍCIA (TV, rádio ou jornal) com manchete e a fala de alguém com receio. Texto fictício [H]. */
export const VEICULOS = [
    { id: 'tv', nome: T('Telejornal', 'TV news') },
    { id: 'radio', nome: T('Rádio', 'Radio') },
    { id: 'jornal', nome: T('Jornal', 'Newspaper') },
];
const MANCHETES = {
    urbano: T('Peça metálica misteriosa deixa moradores em alerta', 'Mysterious metal part puts residents on alert'),
    industrial: T('Caixa com símbolo de radiação é achada em pátio abandonado', 'Box with a radiation symbol found in abandoned yard'),
    rural: T('Fazendeiro acha recipiente estranho em galpão e chama as autoridades', 'Farmer finds strange container in a barn and calls the authorities'),
    floresta: T('Madeireiros evitam objeto metálico achado na mata', 'Loggers avoid metal object found in the woods'),
    costa: T('Contêiner sem documentos é retido no cais depois que detector apitou', 'Undocumented container held at the quay after detector beeped'),
    clinica: T('Frasco sem identificação preocupa funcionários de clínica', 'Unlabelled vial worries clinic staff'),
};
const FALAS = [
    T('"Ninguém sabe o que é. As crianças brincam aqui perto e eu estou com medo."', '"Nobody knows what it is. Children play near here and I am afraid."'),
    T('"Eu não toquei em nada, só chamei vocês. Será que já estamos expostos?"', '"I did not touch anything, I just called you. Could we already be exposed?"'),
    T('"Disseram na TV que podia ser radioativo. Por favor, venham logo."', '"They said on TV it could be radioactive. Please come quickly."'),
];

const TIPO_LOCAL = {
    urbano: T('bairro', 'district'), industrial: T('pátio industrial', 'industrial yard'), rural: T('propriedade rural', 'rural property'),
    floresta: T('mata', 'woodland'), costa: T('cais', 'quay'), clinica: T('clínica', 'clinic'),
};

/** Parte dos chamados é falso alarme (sem fonte perdida): a equipe mede, conversa e tranquiliza. [H] */
export const PROB_FALSO = 0.3;
export const ehRapida = (id) => typeof id === 'string' && /^q\d{1,9}$/.test(id);
export const semDe = (id) => Number(id.slice(1));

// ---------- chamados de poço de petróleo (v3.36, Fase E parte 2) ----------
// Fonte Am-241/Be de perfilagem (porosidade por nêutrons: ~16 a 20 Ci em ferramentas reais, apresentação SPE [V]). Só são sorteados depois da pesquisa do espectrômetro (simulacao.js).
// Para não mexer nas sementes antigas, uma semente >= POCO_MIN é um chamado de poço; as demais seguem a regra de sempre. Relatos fictícios (treino) [H].
export const POCO_MIN = 990000000;
export const PROB_POCO = 0.3;   // [H] chance de um chamado novo ser de poço, depois da pesquisa do espectrômetro
export const ehPoco = (sem) => Number(sem) >= POCO_MIN;
const IDS_REGIAO_POCO = ['tx', 'aus', 'kz'];
const RELATOS_POCO = [
    T('Uma empresa de perfilagem de poços perdeu o contato com uma unidade de serviço depois de uma tempestade. Na carga havia uma ferramenta com fonte de nêutrons e outra com fonte de densidade. O pátio da base foi isolado. Procure no pátio, nos galpões e nos contêineres, com o Geiger e as placas.', 'An oil-well logging company lost contact with a service unit after a storm. The load held a tool with a neutron source and another with a density source. The base yard was cordoned off. Search the yard, the sheds and the containers with the Geiger counter and the plates.'),
    T('Um sucateiro comprou ferramentas velhas de um campo de petróleo desativado. A balança acusou peso a mais e o detector da portaria apitou baixo, mas de um jeito estranho. Verifique as máquinas, os tambores e os galpões do pátio.', 'A scrap dealer bought old tools from a disused oil field. The scale showed extra weight and the gate detector beeped low, but in an odd way. Check the machines, the drums and the sheds in the yard.'),
];
const MANCHETE_POCO = T('Ferramenta de poço de petróleo some depois de tempestade', 'Oil-well tool goes missing after storm');
const FALAS_POCO = [
    T('"A ferramenta vem numa caixa de aço, mas ninguém achou. Dizem que tem fonte lá dentro. Por favor, venham."', '"The tool comes in a steel case, but nobody found it. They say there is a source inside. Please come."'),
    T('"Os operários foram afastados do pátio. Ninguém sabe se há risco. A empresa só diz que a fonte é selada."', '"The workers were moved away from the yard. Nobody knows if there is a risk. The company only says the source is sealed."'),
];
function alertaPoco(sem) {
    const r = prng(sem * 40503 + 11);
    const idReg = IDS_REGIAO_POCO[Math.floor(r() * IDS_REGIAO_POCO.length)], reg = REGIOES.find((x) => x.id === idReg);
    const n = r() < 0.6 ? 1 : 2;
    const relato = RELATOS_POCO[Math.floor(r() * RELATOS_POCO.length)];
    const lat = Math.max(-55, Math.min(80, reg.lat + (r() - 0.5) * 3)), lon = reg.lon + (r() - 0.5) * 3;
    const veiculo = VEICULOS[Math.floor(r() * VEICULOS.length)], fala = FALAS_POCO[Math.floor(r() * FALAS_POCO.length)];
    return {
        id: 'q' + sem, tipo: 'rapida', nivel: 'rapida', missaoId: 100, liberaMes: 0, regional: true, ficticio: true, lat, lon, poco: true,
        local: T(`pátio de campo de petróleo · ${reg.nome.pt}`, `oil-field yard · ${reg.nome.en}`),
        titulo: T(`Chamado: ${reg.nome.pt}`, `Call: ${reg.nome.en}`),
        relato, bioma: 'industrial', noticia: { veiculo, manchete: MANCHETE_POCO, fala },
        n, iso: AMBE.name, extras: ['Tc-99m', 'Sr-90', 'Am-241'],   // distratores separáveis só com Geiger e placas: gama de energia muito alta × gama baixa × beta × alfa
    };
}

/** O alerta completo (mesmo formato dos de ALERTAS) calculado da semente. Puro e determinístico. */
export function alertaRapida(sem) {
    if (ehPoco(sem)) return alertaPoco(sem);
    const r = prng(sem * 40503 + 7);
    const reg = REGIOES[Math.floor(r() * REGIOES.length)];
    const x = r();
    const n = x < 0.4 ? 1 : x < 0.8 ? 2 : 3;
    const perfis = PERFIS_FONTE.filter((p) => p.biomas.includes(reg.bioma)), perfil = perfis[Math.floor(r() * perfis.length)];
    const relato = RELATOS[reg.bioma][Math.floor(r() * RELATOS[reg.bioma].length)];
    const lat = Math.max(-55, Math.min(80, reg.lat + (r() - 0.5) * 3)), lon = reg.lon + (r() - 0.5) * 3;
    const tl = TIPO_LOCAL[reg.bioma];
    // v3.21 (sorteios NOVOS no fim, para não mudar o que as sementes antigas já geravam): veículo, fala e chance de ser falso alarme
    const rv = r(), rf = r(), rfala = r(), rcaso = r();
    const veiculo = VEICULOS[Math.floor(rv * VEICULOS.length)];
    const casos = CASOS_FALSO.filter((c) => c.biomas.includes(reg.bioma)), caso = rf < PROB_FALSO && casos.length ? casos[Math.floor(rcaso * casos.length)] : null;
    const noticia = caso ? { veiculo, manchete: caso.manchete, fala: caso.fala } : { veiculo, manchete: MANCHETES[reg.bioma], fala: FALAS[Math.floor(rfala * FALAS.length)] };
    return {
        id: 'q' + sem, tipo: 'rapida', nivel: 'rapida', missaoId: 100, liberaMes: 0, regional: true, ficticio: true, lat, lon,
        local: T(`${tl.pt} · ${reg.nome.pt}`, `${tl.en} · ${reg.nome.en}`),
        titulo: T(`Chamado: ${reg.nome.pt}`, `Call: ${reg.nome.en}`),
        relato: caso ? caso.relato : relato, bioma: reg.bioma, noticia,
        ...(caso ? { falso: caso.id, n: 0, iso: null, extras: [] } : { n, iso: perfil.iso, extras: perfil.extras }),
    };
}

const cache = new Map();
/** Procura um alerta por id: os da história (ALERTAS) ou um chamado rápido calculado da semente. */
export function alertaPorId(id) {
    const f = ALERTAS.find((a) => a.id === id); if (f) return f;
    if (!ehRapida(id)) return undefined;
    if (!cache.has(id)) { if (cache.size > 200) cache.clear(); cache.set(id, alertaRapida(semDe(id))); }
    return cache.get(id);
}

/** Missão (formato de data/missoes) do chamado `sem`, no idioma `lang`. O mapa é gerado da semente e do bioma. */
export function missaoRapida(sem, lang = 'pt') {
    const a = alertaRapida(sem), L = lang === 'en' ? 'en' : 'pt', g = gerarPlantaRapida(sem, a.bioma);
    return {
        id: 100, rapida: true, semente: sem, trilha: 2, titulo: a.titulo[L], storyText: a.relato[L], descText: a.local[L],
        difficulty: 'easy', numSources: a.n, timeLimit: 90 + 60 * a.n, mapTheme: g.mapTheme, planta: g.planta, mapCols: g.cols, mapRows: g.rows,
        unlocked: true, allowedIsotopes: a.iso ? [a.iso] : [], allSameIsotope: true, candidatosExtras: a.extras, bioma: a.bioma,
        ...(a.poco ? { addIsotope: AMBE, allowedIsotopes: [] } : {}),   // v3.36: Am-241/Be entra por `addIsotope` (como o Ra-226)
    };
}

/** Sorteia uma semente nova que não esteja em uso. `nMax` limita o número de fontes do chamado (v3.16: os primeiros são mais fáceis). */
export function novaSemente(rand, emUso = [], nMax = 3, poco = false) {
    if (poco) { for (let i = 0; i < 400; i++) { const s = POCO_MIN + Math.floor(rand() * (999999998 - POCO_MIN)); if (!emUso.includes('q' + s) && alertaRapida(s).n <= nMax) return s; } return POCO_MIN + Math.floor(rand() * (999999998 - POCO_MIN)); }   // v3.36: semente de poço (se nenhuma couber em nMax, aceita uma de 2 fontes)
    for (let i = 0; i < 400; i++) { const s = 1 + Math.floor(rand() * 999999998); if (!emUso.includes('q' + s) && alertaRapida(s).n <= nMax) return s; }
    return 1 + Math.floor(rand() * 999999998);
}
