// ============================================
// FICHA DA FONTE NO COFRE (etapa 5e-D). Dados puros (sem DOM, sem Phaser): roda em Node.
// Monta, para um isótopo do jogo: nome, meia-vida, energias, barras de emissão (LNHB/DDEP via emissoes.js), tabela do
// "que o Geiger mostra" (fração do sinal que passa em cada blindagem, calculada com o MESMO modelo do jogo: fisica/geiger.js)
// e a história/contexto da missão. Fatos históricos só os de docs/fatos-historicos-3e.md; sem fato conferido, a linha diz
// que a fonte é ficção do jogo. Nenhuma atividade em Bq é mostrada por fonte (a escala do jogo é didática).
// ============================================
import { EMISSOES, TIPOS } from '../data/emissoes.js';
import { SHIELDS } from '../data/shields.js';
import { transmissaoGama, transmissaoBeta } from '../fisica/geiger.js';
import { componentesDe } from '../fisica/componentes.js';
import { prateleiraDe, espessuraChumbo } from './cofre.js';

const ELEMENTO = {
    U: ['Urânio', 'Uranium'], Am: ['Amerício', 'Americium'], Po: ['Polônio', 'Polonium'], Ra: ['Rádio', 'Radium'],
    Sr: ['Estrôncio', 'Strontium'], P: ['Fósforo', 'Phosphorus'], I: ['Iodo', 'Iodine'], Tc: ['Tecnécio', 'Technetium'],
    Cs: ['Césio', 'Cesium'], Ir: ['Irídio', 'Iridium'], Co: ['Cobalto', 'Cobalt'],
};
export const simboloDe = (nome) => String(nome).split('-')[0];
export function nomeCompleto(nome, lang = 'pt') {
    const e = ELEMENTO[simboloDe(nome)];
    return e ? `${e[lang === 'en' ? 1 : 0]}-${String(nome).split('-')[1]}` : nome;
}

const num = (x, lang, casas = 4) => {
    const s = String(Number(Number(x).toPrecision(casas)));
    return lang === 'en' ? s : s.replace('.', ',');
};

/** Meia-vida legível (anos, dias ou horas), a partir de halfLifeS de isotopes.js [V: LNHB]. */
export function meiaVidaTexto(segundos, lang = 'pt') {
    const L = lang === 'en' ? 'en' : 'pt', ano = 365.2422 * 86400;
    if (!(segundos > 0)) return '';
    if (segundos >= 1e8 * ano) return `${num(segundos / ano / 1e9, L, 4)} ${L === 'pt' ? 'bilhões de anos' : 'billion years'}`;
    if (segundos >= ano) return `${num(segundos / ano, L, 4)} ${L === 'pt' ? 'anos' : 'years'}`;
    if (segundos >= 86400) return `${num(segundos / 86400, L, 4)} ${L === 'pt' ? 'dias' : 'days'}`;
    return `${num(segundos / 3600, L, 4)} ${L === 'pt' ? 'horas' : 'hours'}`;
}

const SIGLA = { alfa: 'α', beta: 'β', gama: 'γ' };
const keV = (x, L) => `${num(x, L, x >= 1000 ? 4 : 4)} keV`;

/** Barras de emissão por tipo: soma dos rendimentos do tipo (barra limitada a 100), texto e linhas principais. */
export function emissoesDa(nome, lang = 'pt') {
    const d = EMISSOES[nome], L = lang === 'en' ? 'en' : 'pt';
    if (!d) return [];
    const prat = prateleiraDe(nome);
    return TIPOS.filter((t) => d.linhas.some((l) => l.tipo === t)).map((t) => {
        const ls = d.linhas.filter((l) => l.tipo === t).sort((a, b) => b.y - a.y);
        const soma = ls.reduce((s, l) => s + l.y, 0);
        const principais = ls.filter((l) => l.y >= 1);
        const sufixo = t === 'beta' ? (L === 'pt' ? ' máx.' : ' max.') : '';
        return {
            tipo: t, sigla: SIGLA[t], y: soma, barra: Math.min(100, soma), decide: t === prat,
            texto: soma >= 99.5 && soma <= 100.5 ? '100' : soma > 100.5 ? `≈ ${Math.round(soma)}` : num(soma, L, 3),
            energias: (principais.length ? principais : ls.slice(0, 1)).map((l) => `${keV(l.keV, L)}${sufixo} (${num(l.y, L, 3)})`).join('; '),
        };
    });
}

/**
 * Fração (0 a 1) do sinal de cada componente que passa por: sem blindagem, Al 3 mm, acrílico 5 mm, Pb 1 cm.
 * Mesmas funções e espessuras do Geiger do jogo (transmissaoGama/transmissaoBeta, shields.js). Alfa: só por contato.
 */
export function tabelaGeiger(fonte) {
    const comps = componentesDe(fonte);
    return {
        colunas: SHIELDS.map((s) => ({ key: s.key, material: s.material, cm: s.cm })),
        linhas: comps.map((c) => {
            if (c.tipo === 'alfa') return { tipo: 'alfa', sigla: 'α', contato: true, valores: null };
            const valores = SHIELDS.map((s) => {
                const camadas = s.material ? [{ material: s.material, cm: s.cm }] : [];
                return c.tipo === 'gama' ? transmissaoGama(camadas, c.energyMeV ?? 0.66) : transmissaoBeta(camadas, c.betaRangeMgCm2 ?? 500);
            });
            return { tipo: c.tipo, sigla: SIGLA[c.tipo], contato: false, valores };
        }),
    };
}

// ---------- história e contexto (só de docs/fatos-historicos-3e.md; [V] = lido em fonte oficial/primária) ----------
const F = (pt, en) => ({ kind: 'fato', pt, en });
const HISTORIA = [
    { mis: [2], iso: ['Cs-137'], f: F('Em Goiânia (fonte removida em 13/09/1987), a fonte de césio-137 de um aparelho de radioterapia tinha 50,9 TBq; houve quatro mortes em cerca de quatro semanas após a internação (AIEA, 1988).',
        'In Goiânia (source removed on 13 Sept 1987), the cesium-137 source of a radiotherapy unit had 50.9 TBq; four people died within about four weeks of admission (IAEA, 1988).') },
    { mis: [4], iso: ['Cs-137', 'I-131'], f: F('O Fórum Chernobyl (2005) cita o I-131 (meia-vida de 8 dias) e o Cs-137 (30 anos) entre os radionuclídeos do acidente de 26/04/1986.',
        'The Chernobyl Forum (2005) lists I-131 (8-day half-life) and Cs-137 (30 years) among the radionuclides of the 26 April 1986 accident.') },
    { mis: [4], iso: ['Sr-90'], f: F('Perto do reator de Chernobyl, o Sr-90 é um radionuclídeo importante (Fórum Chernobyl, 2005).',
        'Close to the Chernobyl reactor, Sr-90 is an important radionuclide (Chernobyl Forum, 2005).') },
    { mis: [5], iso: ['Sr-90'], f: F('Em 02/12/2001, três moradores de Lia (Geórgia) que juntavam lenha encontraram fontes de Sr-90 de geradores do tipo RTG Beta-M (AIEA, 2014).',
        'On 2 Dec 2001, three residents of Lia (Georgia) gathering firewood found Sr-90 sources from RTG Beta-M generators (IAEA, 2014).') },
    { mis: [7], iso: ['Co-60'], f: F('Em Mayapuri (Délhi), em 2010, 16 canetas com 7 pastilhas cada (112 pastilhas) de um irradiador de pesquisa saíram de controle; houve uma morte, em 26/04/2010 (Lok Sabha; AERB).',
        'In Mayapuri (Delhi), in 2010, 16 pens with 7 pellets each (112 pellets) from a research irradiator went out of control; one person died, on 26 April 2010 (Lok Sabha; AERB).') },
    { mis: [8], iso: ['Cs-137', 'I-131'], f: F('Em Fukushima (11/03/2011), I-131 e Cs-137 foram os principais radionuclídeos; o I-131 passou do limite para água de crianças em Tóquio, a cerca de 250 km (BASE; AIEA).',
        'At Fukushima (11 March 2011), I-131 and Cs-137 were the main radionuclides; I-131 exceeded the limit for children’s drinking water in Tokyo, about 250 km away (BASE; IAEA).') },
    { mis: [3], iso: ['Ra-226'], f: F('Algumas tintas luminosas da época usavam também Ra-228 (mesotório, desde cerca de 1919); o jogo simplifica para Ra-226 (USTUR).',
        'Some luminous paints of the time also used Ra-228 (mesothorium, from about 1919); the game simplifies to Ra-226 (USTUR).') },
];
const FICCAO = { kind: 'jogo',
    pt: 'Nesta missão, esta fonte é uma peça do jogo: não está entre os fatos conferidos do caso real.',
    en: 'In this mission, this source is a game element: it is not among the verified facts of the real case.' };

/** Linhas de contexto para a ficha: [{kind: 'fato'|'jogo', texto}] */
export function historiaDe(nome, missaoId, lang = 'pt') {
    const L = lang === 'en' ? 'en' : 'pt';
    const achados = HISTORIA.filter((h) => h.iso.includes(nome) && h.mis.includes(missaoId)).map((h) => ({ kind: h.f.kind, texto: h.f[L] }));
    return achados.length ? achados : [{ kind: FICCAO.kind, texto: FICCAO[L] }];
}

const NOTA_EN = {
    'U-238': 'No gamma from U-238 itself (the 49.55 and 113.5 keV gammas belong to the daughter Th-234).',
    'Ra-226': 'In a sealed, old source the radon daughters (Pb-214, Bi-214) build up; Bi-214 emits a 609.3 keV gamma in 45.49 per 100 (same data sheet). Outside the rule: only the nuclide itself counts.',
    'Tc-99m': 'Isomeric transition; beta branches are negligible (< 0.003 per 100).',
    'Cs-137': 'The 661.7 keV gamma comes from Ba-137m (the daughter of Cs-137), which LNHB lists on the Cs-137 data sheet itself.',
    'Ir-192': 'It also decays by electron capture (4.87 per 100).',
};
function notaDe(nome, L) {
    const d = EMISSOES[nome];
    if (!d) return '';
    const partes = [];
    if (d.nota) partes.push(L === 'en' ? (NOTA_EN[nome] || '') : nome === 'Cs-137' ? 'A gama de 661,7 keV vem do Ba-137m (filho do Cs-137), que o LNHB lista na ficha do próprio Cs-137.' : d.nota);
    if (d.filho) {
        const f = d.filho, bmax = f.linhas.filter((l) => l.tipo === 'beta').sort((a, b) => b.y - a.y)[0];
        partes.push(L === 'pt'
            ? `Filho ${f.nome} (meia-vida ${num(f.meiaVidaDias, L, 3)} dias): beta de até ${Math.round(bmax.keV)} keV, só informativo (não entra na regra da prateleira).`
            : `Daughter ${f.nome} (half-life ${num(f.meiaVidaDias, L, 3)} days): beta up to ${Math.round(bmax.keV)} keV, informative only (not part of the shelf rule).`);
    }
    return partes.filter(Boolean).join(' ');
}

/** Ficha completa de uma fonte do jogo. `fonte` = objeto da missão ({name, color, halfLifeS, type, ...}). */
export function fichaDe(fonte, missaoId, lang = 'pt', n = 1) {
    const L = lang === 'en' ? 'en' : 'pt', nome = fonte.name, d = EMISSOES[nome];
    const prat = prateleiraDe(nome, undefined, fonte.type);
    const pb = prat === 'gama' ? espessuraChumbo(nome) : null;
    return {
        nome, nomeCompleto: nomeCompleto(nome, L), simbolo: simboloDe(nome), cor: fonte.color, n, prat,
        meiaVida: meiaVidaTexto(fonte.halfLifeS, L),
        emissoes: emissoesDa(nome, L),
        geiger: tabelaGeiger(fonte),
        historia: historiaDe(nome, missaoId, L),
        nota: notaDe(nome, L),
        chumbo: pb ? { energiaKeV: pb.energiaMeV * 1000, hvlCm: pb.hvlCm, milCm: pb.milCm } : null,
        fonteDados: d ? d.fonte : '',
    };
}
