// Foto do jornal: DESENHO do jogo em tons de sépia com trama de pontos (sem fotografia real, sem arte de terceiros).
// Módulo PURO: devolve texto SVG determinístico por cena.
import { prng } from '../arte/paleta.js';

const W = 360, H = 200;
const S = { c0: '#1c150e', c1: '#3a2c1d', c2: '#5e4a32', c3: '#8a7050', c4: '#b89d74', c5: '#e0cba3', c6: '#f4e8cc' };
const rc = (x, y, w, h, f, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${ex}/>`;
const po = (pts, f) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${f}"/>`;
const janelas = (x, y, cols, lin, dx, dy, w, h, f, rnd) => { let s = ''; for (let j = 0; j < lin; j++) for (let i = 0; i < cols; i++) s += rc(x + i * dx, y + j * dy, w, h, rnd && rnd() < 0.25 ? S.c2 : f); return s; };
const ceu = (a = S.c5, b = S.c4) => `<defs><linearGradient id="jc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>` + rc(0, 0, W, H, 'url(#jc)');
const chao = (y, f = S.c2) => rc(0, y, W, H - y, f);

const CENAS = {
    ferrovelho(r) {
        let s = ceu() + chao(150, S.c3) + rc(0, 120, W, 30, S.c2);
        s += rc(20, 90, 110, 62, S.c1) + po([[14, 92], [75, 62], [136, 92]], S.c0) + janelas(32, 108, 4, 1, 24, 0, 14, 18, S.c5);   // casa
        for (let i = 0; i < 9; i++) s += rc(150 + i * 22, 112 + (i % 2) * 4, 20, 40 - (i % 2) * 4, i % 3 ? S.c1 : S.c2);        // cerca de chapas
        for (let i = 0; i < 7; i++) s += rc(170 + r() * 150, 140 + r() * 40, 18 + r() * 26, 10 + r() * 12, r() < 0.5 ? S.c1 : S.c3);   // sucata
        s += rc(300, 100, 3, 60, S.c0) + rc(280, 96, 44, 18, S.c0) + rc(284, 100, 36, 10, S.c5);                                // placa
        return s;
    },
    fabrica(r) {
        let s = ceu(S.c5, S.c4) + chao(160, S.c1);
        s += rc(30, 80, 190, 82, S.c2) + rc(230, 60, 90, 102, S.c1) + rc(250, 20, 16, 42, S.c0) + po([[30, 80], [125, 52], [220, 80]], S.c0);
        s += janelas(44, 96, 7, 2, 25, 28, 14, 18, S.c5, r) + janelas(244, 78, 3, 3, 26, 26, 14, 16, S.c5, r);
        s += rc(0, 168, W, 6, S.c3);
        for (let i = 0; i < 4; i++) s += rc(60 + i * 60, 176, 40, 4, S.c3) + `<circle cx="${80 + i * 60}" cy="172" r="4" fill="${S.c6}"/>`;
        return s;
    },
    reator(r) {
        let s = ceu(S.c4, S.c3) + chao(165, S.c1);
        s += rc(150, 20, 22, 145, S.c5);
        for (let i = 0; i < 5; i++) s += rc(150, 26 + i * 28, 22, 12, S.c2);                                            // listras da chaminé
        s += rc(40, 110, 100, 55, S.c2) + rc(180, 95, 130, 70, S.c2) + po([[180, 95], [245, 70], [310, 95]], S.c1) + janelas(50, 124, 5, 1, 18, 0, 10, 14, S.c4, r);
        for (let i = 0; i < 5; i++) s += `<circle cx="${190 + i * 16 + r() * 8}" cy="${50 - i * 8}" r="${10 + i * 5}" fill="${S.c1}" opacity="${0.55 - i * 0.07}"/>`;     // fumaça
        return s;
    },
    montanha(r) {
        let s = ceu(S.c6, S.c5) + po([[0, 150], [60, 70], [110, 120], [170, 50], [240, 130], [300, 80], [360, 140], [360, 200], [0, 200]], S.c3);
        s += po([[170, 50], [150, 78], [170, 70], [186, 80]], S.c6) + po([[60, 70], [46, 92], [62, 86], [74, 94]], S.c6) + chao(150, S.c5);
        s += `<path d="M160 200 Q 200 170 250 150 T 360 130" stroke="${S.c2}" stroke-width="8" fill="none"/>`;       // trilha
        for (let i = 0; i < 8; i++) s += `<circle cx="${40 + i * 38 + r() * 12}" cy="${158 + r() * 30}" r="${6 + r() * 8}" fill="${i % 2 ? S.c2 : S.c1}"/>`;   // pedras
        for (let i = 0; i < 40; i++) s += `<circle cx="${r() * W}" cy="${r() * H}" r="1.4" fill="${S.c6}"/>`;          // neve
        return s;
    },
    hospital(r) {
        let s = ceu() + chao(165, S.c2) + rc(60, 40, 240, 125, S.c4) + rc(40, 70, 40, 95, S.c3) + rc(280, 70, 40, 95, S.c3);
        s += janelas(76, 56, 8, 3, 28, 30, 16, 20, S.c6, r) + rc(160, 120, 40, 45, S.c1) + rc(166, 126, 28, 39, S.c5);
        s += rc(172, 14, 16, 36, S.c0) + rc(162, 24, 36, 16, S.c0) + rc(176, 18, 8, 28, S.c6) + rc(166, 28, 28, 8, S.c6);         // cruz
        return s;
    },
    mercado(r) {
        let s = ceu(S.c5, S.c3) + chao(140, S.c2);
        for (let i = 0; i < 4; i++) { const x = 20 + i * 85; s += rc(x, 80, 75, 70, S.c1) + po([[x - 6, 82], [x + 37, 56], [x + 81, 82]], i % 2 ? S.c3 : S.c4) + rc(x + 8, 110, 59, 40, S.c0); }
        for (let i = 0; i < 12; i++) s += rc(10 + r() * 320, 150 + r() * 40, 16 + r() * 28, 8 + r() * 14, r() < 0.5 ? S.c1 : S.c3);
        s += `<path d="M0 60 Q 90 80 180 62 T 360 66" stroke="${S.c0}" stroke-width="2" fill="none"/>`;                         // fios
        return s;
    },
    costa(r) {
        let s = ceu(S.c6, S.c5) + rc(0, 110, W, 90, S.c3);
        for (let i = 0; i < 6; i++) s += `<path d="M${-20 + i * 70} ${120 + (i % 2) * 6} q 20 -16 40 0 t 40 0" stroke="${S.c5}" stroke-width="3" fill="none"/>`;
        s += po([[0, 150], [120, 120], [240, 100], [360, 90], [360, 200], [0, 200]], S.c2);                                       // onda grande
        for (let i = 0; i < 4; i++) s += rc(200 + i * 36, 100, 30, 36, S.c1) + rc(200 + i * 36, 90, 30, 10, S.c0);
        s += rc(196, 40, 8, 60, S.c0) + rc(236, 40, 8, 60, S.c0);
        return s;
    },
};

export function fotoSvg(cena = 'ferrovelho') {
    const f = CENAS[cena] || CENAS.ferrovelho, r = prng(cena.length * 977 + cena.charCodeAt(0));
    return `<svg class="jornal-foto-svg" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`
        + f(r) + `<defs><pattern id="jt" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.8" fill="${S.c0}" opacity=".35"/></pattern></defs>`
        + `<rect width="${W}" height="${H}" fill="url(#jt)"/></svg>`;
}
