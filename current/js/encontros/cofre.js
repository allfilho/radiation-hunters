// ============================================
// COFRE DE TRANSPORTE (etapa 5e). Lógica pura, sem DOM e sem Phaser: roda em Node.
//
// 1) Regra de prateleira: a fonte vai para o tipo MAIS PENETRANTE (gama > beta > alfa) entre as emissões do próprio
//    nuclídeo com rendimento >= LIMIAR (50 por 100 decaimentos). Decisão de projeto [H] (docs/cofre-5e-plano.md); os
//    rendimentos vêm de js/data/emissoes.js (LNHB/DDEP) [V]. Qualquer limiar de 36 a 85 dá as mesmas prateleiras
//    para os isótopos do jogo; o Am-241 (gama de 59,5 keV em 35,9 por 100) é o que marca o limite inferior.
// 2) Estado do cofre e créditos (0 a 1 por item): acerto na 1ª tentativa = 1; na 2ª = 0,4; depois de dois erros o cofre
//    guarda a fonte e explica (0). Cada prateleira usada exige uma blindagem (créditos [H] na tabela BLINDAGEM).
// 3) Espessura de chumbo da ficha: feixe estreito, sem buildup, μ/ρ do NIST XCOM [V], energia efetiva da gama.
// 4) Registro no caderno: pseudo-encontros para aplicarResultado (motor.js).
// ============================================
import { EMISSOES, TIPOS, PENETRACAO, rendimentoPorTipo, linhaPrincipal, energiaGamaEfetiva } from '../data/emissoes.js';
import { DENSIDADE } from '../fisica/geiger.js';

export const TIPOS_COFRE = TIPOS;               // ['alfa', 'beta', 'gama']
export const LIMIAR = 50;                       // por 100 decaimentos [H]
export const CREDITOS_GUARDAR = [1, 0.4];       // 1ª e 2ª tentativa [H]; depois, 0
export const MATERIAIS = ['papel', 'acrilico', 'aluminio', 'chumbo', 'concreto'];
const NO_CLASSIFICAR = 'N04';                   // "Alfa, beta e gama" (conceitos.js)
const NO_BLINDAR = 'N09';                       // "Blindagem por tipo de radiação"

/** Prateleira de um nuclídeo: o tipo mais penetrante com rendimento >= limiar; sem entrada na tabela, usa `tipoJogo`. */
export function prateleiraDe(nome, limiar = LIMIAR, tipoJogo = null) {
    const r = rendimentoPorTipo(nome);
    if (!r) return TIPOS.includes(tipoJogo) ? tipoJogo : null;
    const ok = TIPOS.filter((t) => r[t] >= limiar).sort((a, b) => PENETRACAO[b] - PENETRACAO[a]);
    if (ok.length) return ok[0];
    return TIPOS.slice().sort((a, b) => r[b] - r[a])[0];   // nenhum atinge o limiar: o mais emitido
}

/** Por que `prat` não é a prateleira certa de `nome`: 'sem-emissao' | 'minoritaria' | 'menos-penetrante' | null (se é a certa). */
export function motivoDoErro(nome, prat, limiar = LIMIAR) {
    const certa = prateleiraDe(nome, limiar);
    if (prat === certa) return null;
    const y = (rendimentoPorTipo(nome) || {})[prat] || 0;
    if (y <= 0) return 'sem-emissao';
    if (y < limiar) return 'minoritaria';
    return 'menos-penetrante';
}

// ---------- itens da missão ----------
/** Agrupa as fontes da missão por isótopo: [{nome, n, prat}], ordenado por prateleira (alfa, beta, gama) e nome. */
export function itensDaMissao(fontes) {
    const mapa = new Map();
    for (const s of fontes || []) {
        if (!s || !s.name) continue;
        const m = mapa.get(s.name) || { nome: s.name, n: 0, prat: prateleiraDe(s.name, LIMIAR, s.type) };
        m.n += 1;
        mapa.set(s.name, m);
    }
    return [...mapa.values()].filter((i) => i.prat).sort((a, b) => PENETRACAO[a.prat] - PENETRACAO[b.prat] || a.nome.localeCompare(b.nome));
}
export const prateleirasUsadas = (itens) => TIPOS.filter((t) => itens.some((i) => i.prat === t));
/** Interações mínimas de um aluno (selecionar + guardar cada item, uma blindagem por prateleira, lacrar). */
export const interacoesMinimas = (itens) => itens.length * 2 + prateleirasUsadas(itens).length + 1;

// ---------- estado ----------
const clonar = (o) => JSON.parse(JSON.stringify(o));
export function novoCofre(fontes) {
    return { itens: itensDaMissao(fontes).map((i) => ({ ...i, guardada: null, tent: 0, cred: null })), blind: {}, credBlind: {} };
}

/**
 * Tenta guardar o isótopo `nome` na prateleira `prat`.
 * @returns {{estado, ok:boolean, revelou:boolean, credito:number|null, motivo:string|null, invalido?:string}}
 *  ok = a prateleira estava certa; revelou = dois erros: o cofre guardou na prateleira certa e o crédito é 0.
 */
export function guardar(estado, nome, prat) {
    const e = clonar(estado);
    const it = e.itens.find((i) => i.nome === nome);
    if (!it || !TIPOS.includes(prat)) return { estado, ok: false, revelou: false, credito: null, motivo: null, invalido: 'item-ou-prateleira' };
    if (it.guardada) return { estado, ok: false, revelou: false, credito: null, motivo: null, invalido: 'ja-guardada' };
    it.tent += 1;
    if (prat === it.prat) {
        it.guardada = prat; it.cred = CREDITOS_GUARDAR[it.tent - 1] ?? 0;
        return { estado: e, ok: true, revelou: false, credito: it.cred, motivo: null };
    }
    const motivo = motivoDoErro(nome, prat);
    if (it.tent >= 2) {
        it.guardada = it.prat; it.cred = 0;
        return { estado: e, ok: false, revelou: true, credito: 0, motivo };
    }
    return { estado: e, ok: false, revelou: false, credito: null, motivo };
}

/** Créditos [H] da blindagem por prateleira e material. */
export const BLINDAGEM = {
    alfa: { papel: 1, acrilico: 0.7, aluminio: 0.7, chumbo: 0.4, concreto: 0.4 },
    beta: { acrilico: 1, aluminio: 1, chumbo: 0.4, papel: 0, concreto: 0.4 },
    gama: { chumbo: 1, concreto: 1, papel: 0, acrilico: 0, aluminio: 0 },
};
/** Só se escolhe a blindagem de uma prateleira que já recebeu uma fonte, e só uma vez. */
export function escolherBlindagem(estado, prat, material) {
    if (!TIPOS.includes(prat) || !MATERIAIS.includes(material)) return { estado, credito: null, invalido: 'prateleira-ou-material' };
    if (!estado.itens.some((i) => i.guardada === prat)) return { estado, credito: null, invalido: 'prateleira-vazia' };
    if (estado.blind[prat]) return { estado, credito: null, invalido: 'ja-escolhida' };
    const e = clonar(estado);
    e.blind[prat] = material; e.credBlind[prat] = BLINDAGEM[prat][material];
    return { estado: e, credito: e.credBlind[prat] };
}

export const completo = (estado) => estado.itens.every((i) => i.guardada)
    && prateleirasUsadas(estado.itens).every((t) => estado.blind[t]);

/** Créditos de todos os itens (isótopos e blindagens das prateleiras usadas); o que ficou por fazer vale 0. */
export function creditos(estado) {
    return [
        ...estado.itens.map((i) => i.cred ?? 0),
        ...prateleirasUsadas(estado.itens).map((t) => estado.credBlind[t] ?? 0),
    ];
}
/** Média dos créditos (0 a 1); é o que entra em aproveitamento({cofre: creditos(estado)}). */
export function nota(estado) {
    const c = creditos(estado);
    return c.length ? c.reduce((a, x) => a + x, 0) / c.length : 0;
}

// ---------- registro no caderno (aplicarResultado, motor.js) ----------
const pseudo = (no, id, ok, pulou, credito, ficha) => ({
    no, cadeia: [{ id, no }], passo: 0, resultados: [{ id, ok, pulou }],
    fim: { credito, pulou, ensino: [], ficha: ficha ? no : null },
});
/** Agrega créditos de um nó: certo se menos da metade dos itens feitos foi "ruim"; sem nenhum item feito, pulado. */
function agregado(no, id, creditos, ehRuim) {
    const feitos = creditos.filter((c) => c !== null && c !== undefined);
    const ruins = feitos.filter(ehRuim).length;
    const pulou = feitos.length === 0;
    const credito = pulou ? 0 : feitos.reduce((a, c) => a + c, 0) / feitos.length;
    return pseudo(no, id, !pulou && ruins * 2 < feitos.length, pulou, credito, ruins > 0);
}
/**
 * Dois registros no caderno (um por nó), para não saturar o domínio com 6 a 9 acertos num só encontro.
 * N04: "ruim" = item errado nas duas tentativas (crédito 0). Acertar na 2ª tentativa (0,4) conta como acerto
 *      e não abre a ficha: o jogador se corrigiu, a dinâmica da 2ª tentativa não é punida.
 * N09: "ruim" = blindagem com crédito < 0,7 (ver BLINDAGEM). Itens não feitos (saída antecipada) não contam.
 * Ficha do nó só se houve ao menos um item "ruim" (a ficha foi mostrada pelo cofre).
 */
export function registros(estado) {
    const r = [agregado(NO_CLASSIFICAR, 'COFRE-N04', estado.itens.map((i) => i.cred), (c) => c === 0)];
    const usadas = prateleirasUsadas(estado.itens);
    if (usadas.length) r.push(agregado(NO_BLINDAR, 'COFRE-N09', usadas.map((t) => estado.credBlind[t]), (c) => c < 0.7));
    return r;
}

// ---------- chumbo: espessura para a gama da ficha ----------
// μ/ρ do chumbo (cm²/g), NIST XCOM / X-Ray Mass Attenuation Coefficients, Z = 82,
// https://physics.nist.gov/PhysRefData/XrayMassCoef/ElemTab/z82.html (consulta de 14/10/2026) [V].
// Duas faixas, porque a borda K (88,0045 keV) é descontínua; dentro de cada faixa a interpolação é log-log.
const PB_ABAIXO_K = [[0.03, 30.32], [0.04, 14.36], [0.05, 8.041], [0.06, 5.021], [0.08, 2.419], [0.0880045, 1.910]];
const PB_ACIMA_K = [[0.0880045, 7.683], [0.1, 5.549], [0.15, 2.014], [0.2, 0.9985], [0.3, 0.4031], [0.4, 0.2323], [0.5, 0.1614],
    [0.6, 0.1248], [0.8, 0.0887], [1.0, 0.07102], [1.25, 0.05876], [1.5, 0.05222]];
export const FAIXA_PB_MEV = [0.03, 1.5];

export function muRhoChumbo(E) {
    if (!(E >= FAIXA_PB_MEV[0] && E <= FAIXA_PB_MEV[1])) return null;
    const tab = E < 0.0880045 ? PB_ABAIXO_K : PB_ACIMA_K;
    for (let i = 0; i < tab.length - 1; i++) {
        const [e0, m0] = tab[i], [e1, m1] = tab[i + 1];
        if (E >= e0 && E <= e1) return Math.exp(Math.log(m0) + (Math.log(E) - Math.log(e0)) / (Math.log(e1) - Math.log(e0)) * (Math.log(m1) - Math.log(m0)));
    }
    return null;
}

export { energiaGamaEfetiva };

/** Camada semirredutora e espessura para reduzir a 1/1000 em chumbo (cm); feixe estreito, sem buildup (aproximação). */
export function espessuraChumbo(nome) {
    const E = energiaGamaEfetiva(nome);
    const mu = E === null ? null : muRhoChumbo(E);
    if (mu === null) return null;
    const lin = mu * DENSIDADE.chumbo;
    return { energiaMeV: E, hvlCm: Math.LN2 / lin, milCm: Math.log(1000) / lin };
}

// ---------- textos PT/EN (a interface usa estes e as chaves de i18n dos rótulos) ----------
export const NOME_TIPO = { alfa: { pt: 'alfa', en: 'alpha' }, beta: { pt: 'beta', en: 'beta' }, gama: { pt: 'gama', en: 'gamma' } };
export const NOME_MATERIAL = {
    papel: { pt: 'Papel / embalagem', en: 'Paper / packaging' }, acrilico: { pt: 'Acrílico', en: 'Acrylic' },
    aluminio: { pt: 'Alumínio', en: 'Aluminum' }, chumbo: { pt: 'Chumbo', en: 'Lead' }, concreto: { pt: 'Concreto', en: 'Concrete' },
};
/** Fatos do banco de referências que sustentam as explicações de cada prateleira (docs/referencias-5c/busca). */
export const FATOS_PRATELEIRA = { alfa: ['C3.1', 'C6.3'], beta: ['C3.2', 'C3.5'], gama: ['C3.3', 'C3.4'] };
/**
 * Citação curta de cada fato que a ficha mostra depois de guardar ("Regra de blindagem: ..."); mesmas fontes de C3.1 a C3.5
 * em docs/referencias-5c/busca/agente-A-conceitos.md [V]. C6.3 (PDF da OMS sem título nem data no registro) fica de fora de propósito.
 */
export const CITACOES_REGRA = {
    'C3.1': 'US NRC, Radiation Basics; US NRC, Reactor Concepts Manual, p. 5-7',
    'C3.2': 'US NRC, Reactor Concepts Manual, p. 5-8',
    'C3.3': 'US NRC, Reactor Concepts Manual, p. 5-9',
    'C3.4': 'NIST, X-Ray Mass Attenuation Coefficients (sec. 2); US NRC, Shielding Radiation (2011), slide 55',
    'C3.5': 'US NRC, Shielding Radiation (2011), slides 16-17',
};
/** Citações visíveis da regra de blindagem de uma prateleira, juntas por "; " (só as que têm texto em CITACOES_REGRA). */
export const citacaoDaRegra = (prat) => (FATOS_PRATELEIRA[prat] || []).map((id) => CITACOES_REGRA[id]).filter(Boolean).join('; ');

const fmt = (y, lang) => {
    const s = y >= 1 ? y.toFixed(1) : Number(y.toPrecision(2)).toString();
    return lang === 'pt' ? s.replace('.', ',') : s;
};

/** Explicação depois de guardar: o tipo, o rendimento e, se houver, a emissão mais penetrante que ficou abaixo do limiar. */
export function explicarPrateleira(nome, lang = 'pt') {
    const prat = prateleiraDe(nome), r = rendimentoPorTipo(nome);
    if (!prat || !r) return '';
    const L = lang === 'en' ? 'en' : 'pt', tipo = NOME_TIPO[prat][L], y = fmt(r[prat], L);
    const mais = r[prat] > 100.5;   // mais de uma partícula/fóton do tipo por decaimento (ex.: as duas gamas do Co-60)
    const por = fmt(Math.round(r[prat]) / 100, L);
    let s = mais
        ? (L === 'pt'
            ? `Cada decaimento do ${nome} emite cerca de ${por} fótons ${tipo} (${y} por 100 decaimentos): a radiação ${tipo} é a mais penetrante entre as que passam de ${LIMIAR}.`
            : `Each ${nome} decay emits about ${por} ${tipo} photons (${y} per 100 decays): ${tipo} radiation is the most penetrating among those above ${LIMIAR}.`)
        : (L === 'pt'
            ? `A radiação ${tipo} sai em ${y} de cada 100 decaimentos do ${nome} e é a mais penetrante entre as que passam de ${LIMIAR}.`
            : `${nome} emits ${tipo} radiation in ${y} of every 100 decays, the most penetrating among those above ${LIMIAR}.`);
    const menor = TIPOS.filter((t) => PENETRACAO[t] > PENETRACAO[prat] && r[t] > 0).sort((a, b) => PENETRACAO[b] - PENETRACAO[a])[0];
    if (menor) s += L === 'pt'
        ? ` Há também ${NOME_TIPO[menor].pt} (${fmt(r[menor], L)} por 100), abaixo de ${LIMIAR}: não decide a prateleira.`
        : ` There is also ${NOME_TIPO[menor].en} (${fmt(r[menor], L)} per 100), below ${LIMIAR}: it does not decide the shelf.`;
    return s;
}

/** Dica depois de um erro (ainda com nova tentativa): não revela a prateleira certa, só o motivo. */
export function dicaDoErro(nome, prat, lang = 'pt') {
    const m = motivoDoErro(nome, prat);
    if (!m) return '';
    const L = lang === 'en' ? 'en' : 'pt', tipo = NOME_TIPO[prat][L], y = fmt((rendimentoPorTipo(nome) || {})[prat] || 0, L);
    if (m === 'sem-emissao') return L === 'pt' ? `O ${nome} não emite radiação ${tipo}. Veja as barras da ficha.` : `${nome} does not emit ${tipo} radiation. See the bars on the card.`;
    if (m === 'minoritaria') return L === 'pt' ? `O ${nome} emite ${tipo}, mas só em ${y} de cada 100 decaimentos (menos de ${LIMIAR}).` : `${nome} emits ${tipo}, but in only ${y} of every 100 decays (less than ${LIMIAR}).`;
    return L === 'pt' ? `O ${nome} emite ${tipo} na maioria dos decaimentos, mas emite também uma radiação mais penetrante acima de ${LIMIAR}.`
        : `${nome} emits ${tipo} in most decays, but also a more penetrating radiation above ${LIMIAR}.`;
}

// Os intervalos de transmissão do texto da gama (92% a 96% em 3 mm de alumínio; 94% a 96% em 5 mm de acrílico) valem para
// Cs-137, Co-60 e I-131 (NIST XCOM); um teste confere isso com as espessuras de shields.js.
const TX = (pt, en) => ({ pt, en });
const TEXTO_BLINDAGEM = {
    alfa: {
        papel: TX('Certo: papel ou a embalagem fechada já barram a alfa.', 'Correct: paper or the closed package already stops alpha.'),
        acrilico: TX('Funciona, mas é mais do que o necessário: papel já barra a alfa.', 'It works, but it is more than needed: paper already stops alpha.'),
        aluminio: TX('Funciona, mas é mais do que o necessário: papel já barra a alfa.', 'It works, but it is more than needed: paper already stops alpha.'),
        chumbo: TX('Barra, mas é pesado e desnecessário para a alfa.', 'It stops it, but it is heavy and unnecessary for alpha.'),
        concreto: TX('Barra, mas é pesado e desnecessário para a alfa.', 'It stops it, but it is heavy and unnecessary for alpha.'),
    },
    beta: {
        acrilico: TX('Certo: material leve barra a beta, em espessura suficiente, sem gerar muito raio X de freamento. As placas finas do Geiger deixam passar parte da beta mais energética (veja a tabela da ficha).', 'Correct: a light material stops beta, in sufficient thickness, without producing much bremsstrahlung X-ray. The thin Geiger plates let part of the most energetic beta through (see the card table).'),
        aluminio: TX('Certo: alumínio barra a beta, em espessura suficiente. As placas finas do Geiger deixam passar parte da beta mais energética (veja a tabela da ficha).', 'Correct: aluminum stops beta, in sufficient thickness. The thin Geiger plates let part of the most energetic beta through (see the card table).'),
        chumbo: TX('Barra a beta, mas o chumbo sozinho gera raios X de freamento, mais penetrantes; por isso, para a beta, prefere-se material leve. Em fontes beta muito intensas, como os RTG de Lia (cerca de 1.300 TBq de Sr-90), esses raios X também precisam de blindagem: o contêiner de recuperação era de chumbo.', 'It stops beta, but lead alone produces bremsstrahlung X-rays, which are more penetrating; so, for beta, a light material is preferred. For very intense beta sources, such as Lia\'s RTGs (about 1,300 TBq of Sr-90), those X-rays also need shielding: the recovery container was made of lead.'),
        papel: TX('Papel é fino demais: a beta de centenas de keV percorre milímetros de plástico.', 'Paper is too thin: beta of hundreds of keV travels millimeters in plastic.'),
        concreto: TX('Barra, mas é excessivo: um material leve resolve.', 'It stops it, but it is excessive: a light material is enough.'),
    },
    gama: {
        chumbo: TX('Certo: a gama só é atenuada, e o chumbo, por ser denso, atenua em pouca espessura.', 'Correct: gamma is only attenuated, and dense lead does it in a small thickness.'),
        concreto: TX('Certo: concreto espesso também atenua a gama (precisa de mais espessura que o chumbo).', 'Correct: thick concrete also attenuates gamma (it needs more thickness than lead).'),
        papel: TX('A gama atravessa o papel quase sem perda.', 'Gamma goes through paper almost unchanged.'),
        acrilico: TX('5 mm de acrílico deixam passar de 94% a 96% da gama (Cs-137, Co-60 e I-131; cálculo com NIST XCOM).', '5 mm of acrylic lets 94% to 96% of the gamma through (Cs-137, Co-60 and I-131; NIST XCOM calculation).'),
        aluminio: TX('3 mm de alumínio deixam passar de 92% a 96% da gama (Cs-137, Co-60 e I-131; cálculo com NIST XCOM).', '3 mm of aluminum lets 92% to 96% of the gamma through (Cs-137, Co-60 and I-131; NIST XCOM calculation).'),
    },
};
/**
 * Explicação da blindagem escolhida. `nomesNaPrateleira` (opcional): nuclídeos guardados nessa prateleira; com papel na prateleira
 * alfa, o Am-241 e o Ra-226 ganham uma frase sobre a gama que o papel não barra (o crédito do papel continua 1).
 */
export function explicarBlindagem(prat, material, lang = 'pt', nomesNaPrateleira = []) {
    const t = TEXTO_BLINDAGEM[prat] && TEXTO_BLINDAGEM[prat][material];
    if (!t) return '';
    const L = lang === 'en' ? 'en' : 'pt';
    let s = t[L];
    if (prat === 'alfa' && material === 'papel') {
        if (nomesNaPrateleira.includes('Am-241')) {
            const hvl = espessuraChumbo('Am-241'), y = (rendimentoPorTipo('Am-241') || {}).gama;
            if (hvl && y) s += L === 'pt'
                ? ` O Am-241 também emite uma gama fraca de 59,5 keV (${fmt(y, L)} em cada 100 decaimentos) que o papel não barra; uma camada de chumbo de cerca de ${fmt(hvl.hvlCm * 10, L)} mm já reduz essa gama à metade.`
                : ` Am-241 also emits a weak 59.5 keV gamma (${fmt(y, L)} in every 100 decays) that paper does not stop; a lead layer of about ${fmt(hvl.hvlCm * 10, L)} mm already cuts that gamma in half.`;
        }
        if (nomesNaPrateleira.includes('Ra-226')) s += L === 'pt'
            ? ' Para o próprio Ra-226, o papel basta. Numa fonte antiga e selada, porém, os filhos do radônio se acumulam e o Bi-214 emite gama de 609,3 keV (45,49 em 100 decaimentos); aí seria preciso chumbo também.'
            : ' For Ra-226 itself, paper is enough. In an old sealed source, though, the radon daughters build up and Bi-214 emits a 609.3 keV gamma (45.49 per 100 decays); then lead would be needed too.';
    }
    return s;
}
export { TEXTO_BLINDAGEM, NO_CLASSIFICAR, NO_BLINDAR, linhaPrincipal as linhaPrincipalDe };
