// ============================================
// PARTITURA: transforma a descrição de uma trilha em eventos (funções puras, sem áudio, testáveis em Node).
// Notação da melodia: cada compasso é uma string com um símbolo por colcheia ("passo"):
//   nota (ex.: C5, F#4, Bb3) = começa a nota; "-" = continua a nota anterior; "." = pausa.
// Acordes ("C", "Am", "G7") geram baixo, harmonia e percussão por estilos pré-definidos.
// Todas as músicas são composições originais deste projeto, geradas por código (sem amostras de terceiros).
// ============================================
export const INSTRUMENTOS = ['quadrada', 'pulso25', 'triangulo', 'serra', 'seno'];
export const ESTILOS_BAIXO = ['pedal', 'raiz-quinta', 'pulso', 'valsa'];
export const ESTILOS_HARMONIA = ['pad', 'arpejo', 'arpejo-lento', 'stab', 'valsa'];
export const ESTILOS_PERCUSSAO = ['nenhuma', 'suave', 'pulso', 'batida', 'relogio', 'valsa'];

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const ESCALAS = { maior: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10] };
const QUALIDADES = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10] };

/** "C#5" -> 73. Devolve null se o texto não for uma nota. */
export function notaMidi(txt) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(txt);
    if (!m) return null;
    return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
export const frequencia = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
export const classe = (midi) => ((midi % 12) + 12) % 12;

export function tonicaPc(txt) {
    const m = /^([A-G])([#b]?)$/.exec(txt);
    if (!m) return null;
    return classe(PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
}

/** "Am" -> {raiz: pc, tons: [pcs]}; null se inválido. */
export function acorde(txt) {
    const m = /^([A-G][#b]?)(m|7)?$/.exec(txt);
    if (!m) return null;
    const raiz = tonicaPc(m[1]);
    return { raiz, tons: QUALIDADES[m[2] || ''].map((i) => classe(raiz + i)), qual: m[2] || '' };
}

export function escalaDaTrilha(t) {
    const tp = tonicaPc(t.tonica);
    return new Set(ESCALAS[t.modo].map((i) => classe(tp + i)));
}

/** Notas da melodia como eventos {s, d, midi} (s e d em passos), validando a notação. */
export function compilarMelodia(compassos, passos) {
    const ev = [];
    let atual = null;
    compassos.forEach((barra, b) => {
        const toks = barra.trim().split(/\s+/);
        if (toks.length !== passos) throw new Error(`compasso ${b + 1}: ${toks.length} símbolos em vez de ${passos}`);
        toks.forEach((tk, i) => {
            const s = b * passos + i;
            if (tk === '.') { atual = null; return; }
            if (tk === '-') {
                if (!atual) throw new Error(`compasso ${b + 1}: "-" sem nota para continuar`);
                atual.d += 1; return;
            }
            const midi = notaMidi(tk);
            if (midi === null) throw new Error(`compasso ${b + 1}: nota inválida "${tk}"`);
            atual = { s, d: 1, midi };
            ev.push(atual);
        });
    });
    return ev;
}

const raizBaixo = (pc) => { let m = 36 + pc; if (m < 40) m += 12; return m; };       // E2..Eb3
const tons4 = (ac) => { const r = 60 + ac.raiz; return ac.tons.map((pc, i) => { let m = 60 + pc; if (m < r) m += 12; return m; }).sort((a, b) => a - b); };

function baixo(estilo, ac, passos, s0) {
    const r = raizBaixo(ac.raiz), q = r + 7, ev = [];
    if (estilo === 'pedal') ev.push({ s: s0, d: passos, midi: r, v: 0.8 });
    else if (estilo === 'raiz-quinta') for (let i = 0; i < passos; i += 2) ev.push({ s: s0 + i, d: 2, midi: (i / 2) % 2 ? q : r, v: 0.85 });
    else if (estilo === 'pulso') for (let i = 0; i < passos; i++) ev.push({ s: s0 + i, d: 1, midi: r, v: i % 2 ? 0.55 : 0.85 });
    else if (estilo === 'valsa') ev.push({ s: s0, d: 2, midi: r, v: 0.9 });
    return ev;
}

function harmonia(estilo, ac, passos, s0) {
    const t = tons4(ac), ev = [];
    if (estilo === 'pad') t.forEach((m) => ev.push({ s: s0, d: passos, midi: m, v: 0.5, ataque: 0.18 }));
    else if (estilo === 'arpejo' || estilo === 'arpejo-lento') {
        const seq = [t[0], t[1], t[2], t[0] + 12, t[2], t[1]];
        const passo = estilo === 'arpejo' ? 1 : 2;
        for (let i = 0, k = 0; i < passos; i += passo, k++) ev.push({ s: s0 + i, d: passo, midi: seq[k % seq.length], v: 0.6 });
    } else if (estilo === 'stab') for (let i = 1; i < passos; i += 2) t.forEach((m) => ev.push({ s: s0 + i, d: 1, midi: m, v: 0.5 }));
    else if (estilo === 'valsa') [2, 4].forEach((i) => t.forEach((m) => ev.push({ s: s0 + i, d: 1, midi: m, v: 0.5 })));
    return ev;
}

function percussao(estilo, passos, s0) {
    const ev = [];
    const p = (i, k, v) => ev.push({ s: s0 + i, k, v });
    if (estilo === 'suave') for (let i = 0; i < passos; i += 2) p(i, 'h', 0.4);
    else if (estilo === 'pulso') { p(0, 'k', 0.9); p(2, 'k', 0.5); }
    else if (estilo === 'batida' && passos === 8) { [0, 4].forEach((i) => p(i, 'k', 0.9)); [2, 6].forEach((i) => p(i, 's', 0.7)); [1, 3, 5, 7].forEach((i) => p(i, 'h', 0.4)); }
    else if (estilo === 'relogio') for (let i = 0; i < passos; i++) p(i, 'h', i % 2 ? 0.2 : 0.5);
    else if (estilo === 'valsa') { p(0, 'k', 0.8); p(2, 'h', 0.4); p(4, 'h', 0.4); }
    return ev;
}

/** Compila uma trilha em {passos, total, bpm, swing, melodia, baixo, harmonia, perc, porPasso}. Lança erro se algo estiver errado. */
export function compilar(trilha) {
    const passos = trilha.passos || 8;
    const melodia = [], graves = [], harm = [], perc = [];
    let barra = 0, todas = [];
    for (const sec of trilha.secoes) {
        if (sec.acordes.length !== sec.melodia.length) throw new Error(`seção com ${sec.acordes.length} acordes e ${sec.melodia.length} compassos de melodia`);
        sec.acordes.forEach((nome, i) => {
            const ac = acorde(nome);
            if (!ac) throw new Error('acorde inválido ' + nome);
            const s0 = (barra + i) * passos;
            graves.push(...baixo(sec.baixo, ac, passos, s0));
            harm.push(...harmonia(sec.harmonia, ac, passos, s0));
            perc.push(...percussao(sec.percussao, passos, s0));
        });
        todas = todas.concat(sec.melodia);
        barra += sec.acordes.length;
    }
    melodia.push(...compilarMelodia(todas, passos));
    return { id: trilha.id, passos, compassos: barra, total: barra * passos, bpm: trilha.bpm, swing: trilha.swing || 0, voz: trilha.voz, melodia, baixo: graves, harmonia: harm, perc };
}

/** Segundos de um passo (colcheia) e duração do ciclo completo. */
export const segundosPorPasso = (bpm) => 60 / bpm / 2;
export const duracaoDoCiclo = (c) => c.total * segundosPorPasso(c.bpm);

/** Lista de problemas de uma trilha (vazia = ok): notação, escala, tessitura, estilos e instrumentos. */
export function validarTrilha(t) {
    const erros = [];
    const passos = t.passos || 8;
    if (![6, 8].includes(passos)) erros.push('passos deve ser 6 ou 8');
    if (!(t.bpm >= 50 && t.bpm <= 160)) erros.push('bpm fora de 50–160');
    if (tonicaPc(t.tonica) === null || !ESCALAS[t.modo]) erros.push('tônica ou modo inválido');
    for (const k of ['lead', 'harm', 'bass']) if (!INSTRUMENTOS.includes(t.voz?.[k])) erros.push('instrumento inválido: ' + k);
    if (erros.length) return erros;
    const escala = escalaDaTrilha(t);
    let c;
    try { c = compilar(t); } catch (e) { return [e.message]; }
    for (const [i, sec] of t.secoes.entries()) {
        if (!ESTILOS_BAIXO.includes(sec.baixo)) erros.push(`seção ${i + 1}: estilo de baixo ${sec.baixo}`);
        if (!ESTILOS_HARMONIA.includes(sec.harmonia)) erros.push(`seção ${i + 1}: estilo de harmonia ${sec.harmonia}`);
        if (!ESTILOS_PERCUSSAO.includes(sec.percussao)) erros.push(`seção ${i + 1}: estilo de percussão ${sec.percussao}`);
        for (const nome of sec.acordes) {
            const a = acorde(nome);
            if (a && !a.tons.every((pc) => escala.has(pc))) erros.push(`acorde ${nome} sai da escala`);
        }
    }
    for (const n of c.melodia) {
        if (!escala.has(classe(n.midi))) erros.push(`nota ${n.midi} (passo ${n.s}) fora da escala`);
        if (n.midi < 55 || n.midi > 96) erros.push(`nota ${n.midi} fora da tessitura`);
    }
    return erros;
}
