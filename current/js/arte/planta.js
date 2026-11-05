// ============================================
// KIT DE ARTE · PLANTA (v3.12). Blocos da Base vistos DE CIMA (planta), cada um 120×120, desenhados do zero em SVG.
// Cada bloco tem parede com bisel, piso próprio, corredores que se ligam aos blocos vizinhos e objetos com sombra projetada
// (para baixo e à direita: a luz vem de cima à esquerda). Funções devolvem TEXTO SVG; não usam DOM nem sorteio (só prng com semente).
//   planta(tipo, { obra, viz, naves, pessoas, semente })
//     viz     = { n, s, l, o } (true se há bloco construído vizinho) para abrir as portas de corredor
//     naves   = tipos das naves estacionadas (só o hangar usa)
//     pessoas = [{ cor: 'verde'|'amarelo'|'vermelho', i }] figuras vistas de cima, colocadas nos pontos de PONTOS[tipo]
// Receita para criar um bloco novo: docs/skills/arte-radhunter/SKILL.md.
// ============================================
import { P, tom, prng } from './paleta.js';
import { r, poli, lin, grupo, bisel, parafuso, led, ledFixo, zebra, trevo } from './primitivas.js';

export const T = 120; // lado do bloco
const SOMBRA = (x, y, w, h, o = 0.38) => r(x + 2, y + 2, w, h, '#000', `opacity="${o}"`);
/** Móvel visto de cima: sombra + tampo biselado. */
const movel = (x, y, w, h, cor = P.aco4) => SOMBRA(x, y, w, h) + bisel(x, y, w, h, cor);
const disco = (cx, cy, rr, cor, ex = '') => `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${cor}"${ex ? ' ' + ex : ''}/>`;
const cadeiraTopo = (cx, cy, cor = P.aco5) => `<circle cx="${cx + 1}" cy="${cy + 1.5}" r="4" fill="#000" opacity=".35"/>` + disco(cx, cy, 4, cor) + disco(cx, cy, 2.2, tom(cor, .3));
const tela = (x, y, w, h, cor = P.verde) => r(x, y, w, h, '#031012') + r(x, y, w, 1, cor, 'opacity=".5"') + `<polyline class="ag-varre" fill="none" stroke="${cor}" stroke-width="1" points="${Array.from({ length: 6 }, (_, k) => `${x + 2 + k * ((w - 4) / 5)},${y + h / 2 + (k % 2 ? -1 : 1) * Math.min(3, h / 3)}`).join(' ')}"/>`;

/** Moldura do bloco: parede, piso e portas de corredor. */
function casco(cor, viz = {}, pisoDetalhe = true) {
    let s = bisel(0, 0, T, T, P.aco3) + r(5, 5, T - 10, T - 10, P.aco0) + r(6, 6, T - 12, T - 12, cor);
    if (pisoDetalhe) for (let k = 24; k < T - 6; k += 18) s += r(k, 6, 1, T - 12, tom(cor, -.28), 'opacity=".8"') + r(6, k, T - 12, 1, tom(cor, -.28), 'opacity=".8"');
    s += r(6, 6, T - 12, 3, '#000', 'opacity=".3"') + r(6, 6, 3, T - 12, '#000', 'opacity=".22"');            // sombra interna da parede
    for (const [x, y] of [[2, 2], [T - 4, 2], [2, T - 4], [T - 4, T - 4]]) s += parafuso(x, y);
    // corredores: abertura de 16 px no centro de cada lado com vizinho
    const porta = (x, y, w, h, horiz) => r(x, y, w, h, P.aco2) + (horiz ? r(x, y, w, 1, P.ambar) + r(x, y + h - 1, w, 1, P.ambar) + r(x + w / 2 - 1, y, 2, h, P.ambarEsc, 'opacity=".6"') : r(x, y, 1, h, P.ambar) + r(x + w - 1, y, 1, h, P.ambar) + r(x, y + h / 2 - 1, w, 2, P.ambarEsc, 'opacity=".6"'));
    if (viz.n) s += porta(52, 0, 16, 7, false);
    if (viz.s) s += porta(52, T - 7, 16, 7, false);
    if (viz.o) s += porta(0, 52, 7, 16, true);
    if (viz.l) s += porta(T - 7, 52, 7, 16, true);
    return s;
}

/** Figura de pessoa vista de cima: sombra, ombros (jaleco), cabeça e a caneta dosimétrica. */
export function pessoaTopo(cx, cy, cor = 'verde', i = 0) {
    const k = typeof i === 'string' ? [...i].reduce((a, c) => a + c.charCodeAt(0), 0) : Math.abs(i | 0);
    const cab = P.cabelos[(k * 3 + 1) % P.cabelos.length], pele = P.peles[k % P.peles.length];
    const pen = { verde: '#00e07a', amarelo: '#ffcc00', vermelho: '#ff5a4a' }[cor] || '#00e07a';
    // vida (v3.15): a pessoa anda ao longo do corredor e para; deslocamento e ritmo vêm de k (sem sorteio, sempre igual)
    const dx = (k % 2 ? -1 : 1) * (6 + (k % 3) * 2), dur = 9 + (k % 4) * 2, atraso = -((k * 1.7) % dur);
    return `<g class="ag-pessoa" transform="translate(${cx} ${cy})"><g class="ag-anda" style="--ag-dx:${dx}px;animation-duration:${dur}s;animation-delay:${atraso.toFixed(1)}s"><ellipse cx="1.5" cy="2" rx="7" ry="4.6" fill="#000" opacity=".4"/><ellipse rx="7" ry="4.4" fill="#e8f0f5"/><ellipse rx="7" ry="4.4" fill="none" stroke="#9fb6c6" stroke-width=".8"/>`
        + `<circle cx="0" cy="-.4" r="3.3" fill="${pele}"/><path d="M-3.3 -.4 A3.3 3.3 0 0 1 3.3 -.4 L2.2 .6 Q0 -1.6 -2.2 .6Z" fill="${cab}"/><circle cx="5" cy="1.4" r="1.4" fill="${pen}"/></g></g>`;
}

// ---------- blocos ----------
function hangar(o) {
    const base = P.concreto, naves = o.naves || [];
    const baia = (y, nave) => {
        let s = r(12, y, 96, 46, tom(base, -.1)) + r(12, y, 96, 1, P.ambar, 'opacity=".8"') + r(12, y + 45, 96, 1, P.ambar, 'opacity=".8"') + r(12, y, 1, 46, P.ambar, 'opacity=".8"') + r(107, y, 1, 46, P.ambar, 'opacity=".8"');
        s += r(14, y + 2, 14, 42, tom(base, -.28), 'opacity=".45"') + `<text x="21" y="${y + 28}" text-anchor="middle" class="ag-svg-h" font-size="13">H</text>`;
        if (nave) s += navePlanta(nave, 66, y + 23);
        return s;
    };
    return casco(tom(base, -.05), o.viz) + baia(12, naves[0]) + baia(62, naves[1])
        + zebra(8, 58, 104, 4, 5) + r(110, 12, 4, 96, P.aco1) + [14, 38, 62, 86].map((y) => r(110, y, 4, 20, P.aco4)).join('') + led(104, 9, P.verde, 1) + led(104, 109, P.ambar, 2);
}

/** Nave vista de cima, nariz para a direita, centrada em (cx,cy), ~84 de comprimento. */
/** v3.25: transporte de equipe visto de cima (nariz à direita): fuselagem larga, vidro da cabine, rampa traseira aberta, duas nacelas com hélices nas asas curtas. Desenho próprio. */
function transportePlanta(cx, cy) {
    const c = ['#dfe8ee', '#a9bac7', '#3f86c5'], esc = tom(c[1], -.4), disco = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#cfe3ee" opacity=".16"/><circle class="ag-gira" style="transform-box:fill-box;transform-origin:center" cx="${x}" cy="${y}" r="9" fill="none" stroke="#6f8696" stroke-width="1" stroke-dasharray="6 5" opacity=".9"/>${r(x - 1, y - 1, 2, 2, '#14191e')}`;
    const pod = (y) => r(-18, y - 5, 22, 10, c[1]) + r(-18, y - 5, 22, 2, tom(c[1], .3)) + r(-20, y - 3, 3, 6, esc) + disco(-8, y) + disco(14, y);
    const rampa = poli([[-40, -6], [-52, -7], [-52, 7], [-40, 6]], tom(c[1], -.25)) + Array.from({ length: 4 }, (_, i) => r(-51 + i * 3, -6, 1, 12, P.ambar, 'opacity=".8"')).join('');
    return grupo(cx, cy, `<ellipse cx="2" cy="4" rx="46" ry="19" fill="#000" opacity=".32"/>`
        + poli([[-6, -8], [-10, -20], [8, -20], [10, -8]], c[1]) + poli([[-6, 8], [-10, 20], [8, 20], [10, 8]], c[1]) + pod(-20) + pod(20)
        + rampa
        + `<path d="M-40 -8 L22 -9 Q46 -7 47 0 Q46 7 22 9 L-40 8Z" fill="${c[0]}" stroke="${tom(c[1], -.3)}" stroke-width=".8"/>`
        + r(-40, -1, 70, 2, c[2]) + r(-34, -6, 9, 12, tom(c[0], -.12)) + r(-20, -6, 9, 12, tom(c[0], -.12)) + r(-6, -6, 9, 12, tom(c[0], -.12))
        + `<path d="M26 -6 Q41 -5 43 0 Q41 5 26 6Z" fill="${P.ciano}"/><path d="M28 -5 Q36 -4 40 -1Z" fill="#fff" opacity=".5"/>` + r(46, -1, 2, 2, P.vermelho));
}

function navePlanta(tipo, cx, cy) {
    if (tipo === 'tripulacao') return transportePlanta(cx, cy);
    const c = { tripulacao: ['#dfe8ee', '#a9bac7', '#3f86c5'], resgate: ['#f3d2c4', '#d99a84', '#ff6b35'], levantamento: ['#cfe8f7', '#8fb6d0', '#26b6a3'] }[tipo] || ['#dfe8ee', '#a9bac7', '#3f86c5'];
    return grupo(cx, cy, `<ellipse cx="3" cy="4" rx="42" ry="9" fill="#000" opacity=".35"/>`
        + poli([[-8, -3], [-24, -22], [-14, -22], [10, -3]], c[1]) + poli([[-8, 3], [-24, 22], [-14, 22], [10, 3]], c[1])
        + poli([[-34, -2], [-42, -12], [-37, -12], [-26, -2]], c[1]) + poli([[-34, 2], [-42, 12], [-37, 12], [-26, 2]], c[1])
        + `<path d="M-40 -3 Q-10 -8 28 -5 Q46 -2 46 0 Q46 2 28 5 Q-10 8 -40 3Z" fill="${c[0]}" stroke="${tom(c[1], -.3)}" stroke-width=".8"/>`
        + `<path d="M24 -5 Q40 -3 42 0 Q40 3 24 5Z" fill="${P.ciano}"/><path d="M26 -4 Q36 -3 38 -1Z" fill="#fff" opacity=".5"/>` + r(-34, -1, 56, 2, c[2]) + r(-40, -5, 5, 3, '#2a3139') + r(-40, 2, 5, 3, '#2a3139')
        + `<path class="ag-pulsa" d="M-40 -3 L-48 -2 L-48 2 L-40 3Z" fill="${P.laranja}"/>`);
}

function comando(o) {
    const mapa = r(14, 10, 92, 20, '#031012') + [20, 44, 70, 92].map((x) => poli([[x, 14], [x + 14, 12], [x + 20, 20], [x + 8, 27], [x - 2, 22]], '#0e4a35', `stroke="${P.verdeEsc}" stroke-width=".6"`)).join('')
        + `<circle class="ag-pulsa" cx="40" cy="20" r="3" fill="none" stroke="${P.laranja}"/><circle class="ag-pulsa" style="animation-delay:.8s" cx="84" cy="22" r="3" fill="none" stroke="${P.ambar}"/>` + `<rect x="14" y="10" width="92" height="20" fill="none" stroke="${P.aco5}"/>`;
    const mesa = (x, y, w) => movel(x, y, w, 12, P.aco4) + tela(x + 3, y + 2, 12, 8) + tela(x + w - 15, y + 2, 12, 8, P.ciano);
    return casco(tom(P.aco2, -.2), o.viz) + mapa + mesa(14, 42, 40) + mesa(66, 42, 40) + mesa(14, 70, 40) + mesa(66, 70, 40)
        + cadeiraTopo(34, 62) + cadeiraTopo(86, 62) + cadeiraTopo(34, 90) + cadeiraTopo(86, 90)
        + `<circle cx="60" cy="86" r="11" fill="${P.ciano}" opacity=".18"/><circle class="ag-pulsa" cx="60" cy="86" r="7" fill="none" stroke="${P.ciano}" stroke-width="1.2"/>` + led(100, 104, P.verde, 1);
}

function academia(o) {
    const quadro = bisel(12, 9, 96, 12, '#7b5a33') + r(15, 11, 90, 8, '#12392a') + `<polyline fill="none" stroke="#e6f5ec" stroke-width="1" points="${Array.from({ length: 10 }, (_, k) => `${20 + k * 8},${(18 - 6 * Math.exp(-k * 0.35)).toFixed(1)}`).join(' ')}"/>`;
    let s = casco(P.aco2, o.viz) + quadro + movel(40, 28, 40, 8, '#6b5230') + cadeiraTopo(60, 42, P.aco4);
    for (let l = 0; l < 2; l++) for (let c = 0; c < 3; c++) s += movel(14 + c * 32, 56 + l * 24, 24, 9, '#8a6a3c') + cadeiraTopo(26 + c * 32, 72 + l * 24 - 4, P.aco5);
    return s + bisel(96, 28, 10, 14, P.ambar) + r(98, 30, 6, 4, '#04110b') + led(100, 38, P.verde, 2) + grupo(100, 104, trevo(5));
}

function cofre(o) {
    const aneis = `<circle cx="60" cy="62" r="38" fill="#2a343c" stroke="#0e1317" stroke-width="2"/><circle cx="60" cy="62" r="35" fill="#68798a" stroke="#a9b9c6" stroke-width="1.6"/>`
        + Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6; return `<circle cx="${(60 + Math.cos(a) * 31).toFixed(1)}" cy="${(62 + Math.sin(a) * 31).toFixed(1)}" r="2" fill="#8da0af" stroke="#2c373f" stroke-width=".7"/>`; }).join('')
        + `<circle cx="60" cy="62" r="23" fill="#4a5662" stroke="#a9b9c6"/>` + [0, 45, 90, 135].map((a) => `<line x1="38" y1="62" x2="82" y2="62" stroke="#b9c8d3" stroke-width="3" transform="rotate(${a} 60 62)"/>`).join('') + `<circle cx="60" cy="62" r="6" fill="#b9c8d3" stroke="#2c373f" stroke-width="2"/>`;
    const gav = (x) => Array.from({ length: 4 }, (_, k) => bisel(x, 12 + k * 24, 10, 20, '#3b464f') + r(x + 3, 20 + k * 24, 4, 2, '#9aa9b5')).join('');
    return casco(tom(P.aco2, -.25), o.viz) + gav(9) + gav(101) + `<ellipse cx="62" cy="64" rx="38" ry="38" fill="#000" opacity=".25"/>` + aneis + zebra(24, 106, 72, 4, 5) + ledFixo(26, 14, P.verde) + led(30, 14, P.ambar, 2);
}

function alojamento(o) {
    const cores = ['#3f6f9a', '#a2503f', '#5c8a4f', '#7a5aa0'];
    const cama = (x, y, k) => SOMBRA(x, y, 22, 32) + bisel(x, y, 22, 32, '#8fa6bb') + r(x + 3, y + 3, 16, 7, '#f1f5f8') + r(x + 3, y + 3, 16, 1, '#fff') + r(x + 2, y + 12, 18, 18, cores[k]) + r(x + 2, y + 12, 18, 1, tom(cores[k], .35)) + r(x + 2, y + 20, 18, 1, tom(cores[k], -.3));
    let s = casco(tom(P.aco2, .05), o.viz) + r(34, 52, 52, 34, '#1d3a52', 'opacity=".7"') + r(36, 54, 48, 30, '#27506f', 'opacity=".6"');
    s += cama(12, 12, 0) + cama(40, 12, 1) + cama(68, 12, 2) + cama(94, 12, 3).replace(/x="94"/g, 'x="94"');
    for (let k = 0; k < 5; k++) s += bisel(12 + k * 19, 96, 16, 12, '#43607a') + r(14 + k * 19, 99, 12, 1, P.aco1) + r(25 + k * 19, 101, 2, 3, P.aco6);
    return s + movel(44, 60, 32, 14, '#6b5230') + disco(54, 67, 3, '#e8e2d0') + disco(66, 67, 3, '#e8e2d0') + led(106, 52, P.verde, 3);
}

function medico(o) {
    const maca = (x, y) => SOMBRA(x, y, 20, 34) + bisel(x, y, 20, 34, '#dfe8ee') + r(x + 3, y + 3, 14, 7, '#f4f8fa') + r(x + 3, y + 12, 14, 18, '#8fb3c8') + r(x + 3, y + 12, 14, 1, '#d8eef7');
    const cruz = r(54, 52, 12, 36, '#c0392b', 'opacity=".85"') + r(42, 64, 36, 12, '#c0392b', 'opacity=".85"');
    let s = casco(tom(P.aco2, .12), o.viz) + r(34, 46, 52, 48, '#ecf3f6', 'opacity=".55"') + cruz;
    s += maca(10, 10) + maca(50, 10) + maca(90, 10);
    s += bisel(10, 98, 40, 12, '#43607a') + bisel(66, 98, 44, 12, '#3b6a58') + r(14, 101, 32, 1, P.aco1);
    return s + led(106, 56, P.verde, 3);
}

function oficina(o) {
    let s = casco(tom(P.aco2, -.1), o.viz) + movel(12, 11, 96, 10, '#3c566e');
    s += [18, 30, 42].map((x, k) => lin(x, 14, x + 6, 18, [P.aco6, '#cdd', P.ambar][k], 2)).join('') + disco(70, 16, 3, P.aco6) + r(84, 12, 14, 7, '#8a8f95');
    s += movel(40, 38, 40, 34, '#59636b') + r(48, 46, 24, 18, '#2a3139') + r(56, 42, 8, 6, P.laranja) + [[60, 56], [64, 60], [56, 62]].map(([x, y], k) => `<rect class="ag-pisca" style="animation-delay:${k * 0.2}s" x="${x}" y="${y}" width="2" height="2" fill="${P.ambar}"/>`).join('');
    s += movel(12, 40, 20, 28, '#a63a2b') + [0, 1, 2].map((k) => r(14, 44 + k * 8, 16, 1, '#5a1a12')).join('') + movel(88, 40, 20, 12, '#8a6a40') + movel(88, 56, 20, 12, '#7a5a34') + movel(14, 80, 26, 12, '#3c566e') + movel(78, 80, 28, 12, '#3c566e');
    return s + zebra(6, 104, 108, 5, 5);
}

function biblioteca(o) {
    const rng = prng(9), cores = ['#c85f4f', '#4f9bc8', '#e0b84f', '#6fc88a', '#9b7bd0', '#d8d8d0', '#b5653a'];
    let s = casco(tom(P.aco2, -.05), o.viz) + r(8, 8, 104, 104, '#5a3b2a', 'opacity=".22"');
    for (const y of [12, 28, 44]) {
        s += SOMBRA(12, y, 96, 10, .3) + r(12, y, 96, 10, '#6b5230');
        for (let x = 13; x < 107;) { const w = 2 + Math.floor(rng() * 3); s += r(x, y + 1, w, 8, cores[Math.floor(rng() * cores.length)]); x += w; }
    }
    s += movel(18, 70, 34, 14, '#6b5230') + r(24, 72, 10, 8, '#f1f5f8') + disco(46, 77, 3, P.verde, 'opacity=".85"') + `<circle cx="46" cy="77" r="9" fill="${P.ambar}" opacity=".14"/>`;
    s += movel(66, 70, 34, 14, '#6b5230') + r(72, 72, 10, 8, '#f1f5f8') + disco(94, 77, 3, P.verde, 'opacity=".85"') + cadeiraTopo(34, 92, P.aco4) + cadeiraTopo(82, 92, P.aco4);
    return s + disco(104, 104, 5, '#2f8a4a') + disco(104, 104, 2.5, '#4fbf6a');
}

function laboratorio(o) {
    const barras = Array.from({ length: 14 }, (_, k) => { const h = 2 + 7 * Math.exp(-Math.pow((k - 4) / 1.4, 2)) + 4 * Math.exp(-Math.pow((k - 10) / 1.2, 2)); return r(16 + k * 2.6, 26 - h, 2, h, P.verde, 'opacity=".85"'); }).join('');
    let s = casco('#2c4a62', o.viz, true) + bisel(12, 9, 40, 20, P.aco3) + r(14, 11, 36, 16, '#031012') + barras;
    s += bisel(60, 9, 30, 12, '#d4dde4') + bisel(94, 9, 14, 12, '#d4dde4') + grupo(101, 15, trevo(3.4));
    s += movel(14, 44, 92, 18, '#3d556b') + [[24, '#8fe0b0'], [38, '#ff7b7b'], [52, '#7bb8ff'], [64, '#ffe27b']].map(([x, c]) => disco(x, 53, 4.2, c, 'opacity=".75"') + disco(x, 53, 4.2, 'none', 'stroke="#d7f5e3" stroke-width=".8"')).join('')
        + `<circle class="ag-bolha" cx="24" cy="53" r="1.2" fill="#fff"/>` + r(76, 49, 8, 8, '#cfd8de') + disco(96, 53, 6, '#6d7f8e') + disco(96, 53, 3.2, '#9fb0bd') + led(95, 52, P.verde, 2);
    s += movel(14, 76, 36, 14, '#3d556b') + movel(60, 76, 46, 14, '#3d556b') + disco(30, 83, 3, '#9fe0ff', 'opacity=".8"') + disco(74, 83, 3, '#ff7b7b', 'opacity=".8"') + disco(90, 83, 3, '#a6ff9a', 'opacity=".8"');
    return s + bisel(12, 98, 24, 12, '#b6c4cf') + bisel(40, 98, 24, 12, '#b6c4cf') + r(14, 100, 20, 1, P.aco2) + led(100, 104, P.ambar, 1);
}

/** Cavidade escavada, sem construção. */
function vazio() {
    const rng = prng(13);
    let s = r(0, 0, T, T, P.rocha1) + r(6, 6, T - 12, T - 12, P.rocha0);
    for (let k = 0; k < 24; k++) s += r(8 + Math.floor(rng() * 100), 8 + Math.floor(rng() * 100), 2 + Math.floor(rng() * 5), 2 + Math.floor(rng() * 3), [P.rocha2, P.rocha3, P.rocha1][k % 3], 'opacity=".7"');
    for (const [x, y] of [[8, 8], [T - 16, 8], [8, T - 16], [T - 16, T - 16]]) s += r(x, y, 8, 8, '#7a5a34') + r(x, y, 8, 1, '#a98450');
    return s + r(8, 8, T - 16, 2, '#7a5a34', 'opacity=".5"') + `<rect x="14" y="14" width="${T - 28}" height="${T - 28}" fill="none" stroke="${P.ciano}" stroke-width="1" stroke-dasharray="4 4" opacity=".4"/>`;
}

function obra(o) {
    return vazio() + zebra(6, 6, T - 12, 6, 6) + zebra(6, T - 12, T - 12, 6, 6) + movel(18, 40, 26, 18, '#8a6a40') + movel(28, 64, 20, 14, '#7a5a34') + lin(70, 30, 104, 56, '#8a8f95', 3) + disco(104, 56, 4, P.ambar) + `<rect class="ag-pisca" x="84" y="84" width="14" height="10" fill="${P.ambar}"/><rect x="82" y="94" width="18" height="5" fill="#2a2a2a"/>`;
}

const BLOCOS = { hangar, comando, academia, cofre, alojamento, medico, oficina, biblioteca, laboratorio };
/** Pontos (x,y) onde as pessoas aparecem de cima em cada bloco (em pé nos corredores internos). */
export const PONTOS = {
    hangar: [[62, 58], [40, 58], [90, 58], [20, 58]], comando: [[60, 62], [34, 66], [86, 66], [60, 100]], academia: [[60, 24], [40, 50], [70, 52], [96, 60]],
    cofre: [[24, 62], [96, 62], [60, 106], [60, 18]], alojamento: [[30, 56], [90, 56], [60, 90], [20, 92]], medico: [[30, 56], [70, 56], [100, 56], [60, 100]], oficina: [[34, 74], [60, 76], [100, 74], [60, 98]],
    biblioteca: [[60, 64], [56, 92], [20, 62], [100, 64]], laboratorio: [[40, 70], [60, 70], [86, 70], [60, 92]],
};

/** SVG de um bloco da planta. `tipo` 'vazio' = escavado; `obra` desenha a construção. */
export function planta(tipo, { obra: emObra = false, viz = {}, naves = [], pessoas = [] } = {}) {
    const o = { viz, naves };
    const miolo = tipo === 'vazio' ? vazio() : emObra ? obra(o) : (BLOCOS[tipo] || vazio)(o);
    const pts = PONTOS[tipo] || [];
    const gente = tipo === 'vazio' || emObra ? '' : pessoas.slice(0, pts.length).map((p, k) => pessoaTopo(pts[k][0], pts[k][1], p.cor, p.i)).join('');
    return `<svg class="ag-mod-svg ag-planta-svg" viewBox="0 0 ${T} ${T}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${miolo}${gente}</svg>`;
}
