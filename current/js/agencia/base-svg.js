// ============================================
// BASE da Agência (v3.12): corte lateral de base subterrânea, desenhado do zero em SVG com o kit js/arte/ (nenhuma arte de terceiros).
// Só decoração: os botões acessíveis são sobrepostos pelo ui-base.js. Cada módulo é um desenho 200×120 
// com o mesmo teto, piso e portas laterais, de modo que as salas lado a lado formam um complexo contínuo.
// Para criar um módulo novo: siga docs/skills/arte-radhunter/SKILL.md (adicione a função aqui, registre em DESENHO e, se precisar de largura diferente, em LARGURA).
// ============================================
import { P, tom, prng } from '../arte/paleta.js';
import { currentLang } from '../i18n/index.js';
import { r, poli, lin, grupo, bisel, parafusos, led, ledFixo, lampada, tubo, veneziana, zebra, trevo, monitor, bancada, cadeira, casco } from '../arte/primitivas.js';
import { naveSvg } from '../arte/nave.js';
import { pessoaSvg } from '../arte/pessoa.js';

export { pessoaSvg };
const PISO = 98; // y do chão dentro de qualquer módulo (120 de altura)
const LARGURA = {}; // todos os módulos ocupam uma célula 200×120
const txt = (x, y, s, cls = 'ag-svg-rot', ex = '') => `<text x="${x}" y="${y}" class="${cls}"${ex ? ' ' + ex : ''}>${s}</text>`;

function hangar(w) {
    const guias = Array.from({ length: 9 }, (_, i) => r(8 + i * 22, PISO + 5, 10, 3, P.ambar, `${i % 2 ? 'opacity=".3"' : 'class="ag-pisca" style="animation-delay:' + (i * 0.2).toFixed(1) + 's"'}`)).join('');
    // portal do hangar: painéis verticais
    let portal = r(10, 14, 180, 70, P.aco1) + r(10, 14, 180, 2, P.aco4);
    for (let x = 10; x < 190; x += 18) portal += r(x, 16, 1, 68, P.aco3) + r(x + 1, 16, 1, 68, P.aco0);
    const ponte = bisel(6, 13, 188, 3, P.aco4) + bisel(138, 16, 18, 6, P.aco5) + lin(147, 22, 147, 38, P.aco5, 1) + r(143, 38, 8, 5, P.ambar) + r(144, 43, 6, 2, P.ambarEsc);
    const tanque = bisel(168, 62, 26, 34, '#6a7d8b') + r(170, 68, 22, 3, P.ambar) + r(170, 84, 22, 3, P.ambar) + r(174, 58, 8, 4, P.aco4) + grupo(181, 78, trevo(4)) + r(168, 62, 3, 34, tom('#6a7d8b', .3));
    const carrinho = bisel(6, 78, 22, 20, P.laranja) + r(8, 84, 18, 1, '#7a2f12') + r(8, 90, 18, 1, '#7a2f12') + r(10, 80, 4, 2, P.aco6) + r(20, 80, 4, 2, P.aco6) + r(8, 98, 4, 2, '#111') + r(22, 98, 4, 2, '#111');
    return casco(w, 120, { luzes: [50, 100, 150] }) + portal + zebra(0, 88, w, 6) + ponte + carrinho + tanque
        + `<ellipse cx="98" cy="${PISO + 1}" rx="66" ry="3" fill="#000" opacity=".4"/>` + grupo(98, PISO - 19, naveSvg('tripulacao', { fogo: false }), 0.7) + guias
        + txt(120, 34, 'HANGAR 01') + led(160, 22, P.verde, 1) + led(166, 22, P.ambar, 3);
}

function comando(w) {
    const continente = (pts) => poli(pts, '#0e4a35', `stroke="${P.verdeEsc}" stroke-width=".8"`);
    let mapa = r(22, 22, 156, 42, '#031012');
    for (let x = 22; x <= 178; x += 13) mapa += r(x, 22, 1, 42, P.verde, 'opacity=".1"');
    for (let y = 22; y <= 64; y += 10) mapa += r(22, y, 156, 1, P.verde, 'opacity=".1"');
    mapa += continente([[30, 30], [50, 26], [66, 32], [60, 46], [48, 58], [38, 48]]) + continente([[84, 28], [112, 26], [126, 34], [112, 44], [100, 58], [90, 44]]) + continente([[136, 34], [160, 30], [172, 42], [150, 54], [140, 46]]);
    const pinos = [[52, 38, P.laranja], [104, 36, P.ambar], [150, 44, P.laranja]].map(([x, y, c], i) => `<circle class="ag-pulsa" style="animation-delay:${i * 0.6}s" cx="${x}" cy="${y}" r="3.4" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="1.4" fill="${c}"/>`).join('');
    const tela = bisel(16, 16, 168, 54, P.aco3) + mapa + pinos + `<rect x="22" y="22" width="156" height="42" fill="none" stroke="${P.aco5}" stroke-width=".8" opacity=".6"/>` + parafusos(16, 16, 168, 54, 1);
    const leds = Array.from({ length: 8 }, (_, i) => led(24 + i * 7, 10, i % 3 ? P.verde : P.ambar, i)).join('');
    return casco(w, 120, { luzes: [50, 150] }) + tela + leds
        + bancada(14, 78, 74, 20) + monitor(22, 66, 20, 10, 8, P.verde, 1) + monitor(50, 66, 20, 10, 7, P.ciano, 4) + r(76, 72, 6, 6, P.laranja)
        + bancada(112, 78, 74, 20) + monitor(120, 66, 20, 10, 9, P.ambar, 2) + monitor(148, 66, 20, 10, 6, P.verde, 5) + r(174, 72, 6, 6, P.aco6)
        + cadeira(94, 96) + cadeira(190, 96, P.aco3);
}

function academia(w) {
    const curva = Array.from({ length: 12 }, (_, i) => `${18 + i * 6.8},${(60 - 34 * Math.exp(-i * 0.32)).toFixed(1)}`).join(' '); // decaimento: a atividade cai ao longo do tempo
    const quadro = bisel(8, 14, 92, 58, '#7b5a33') + r(12, 18, 84, 50, '#12392a') + r(12, 18, 84, 2, tom('#12392a', -.4))
        + lin(18, 24, 18, 62, '#e6f5ec', 1, 'opacity=".8"') + lin(18, 62, 92, 62, '#e6f5ec', 1, 'opacity=".8"')
        + `<polyline fill="none" stroke="#e6f5ec" stroke-width="1.4" points="${curva}"/>`
        + r(56, 26, 34, 1, '#e6f5ec', 'opacity=".6"') + r(56, 31, 28, 1, '#e6f5ec', 'opacity=".5"') + r(56, 36, 30, 1, '#e6f5ec', 'opacity=".5"') + r(8, 72, 92, 3, '#5b4426') + r(30, 70, 6, 2, '#e6f5ec');
    const cartaz = r(108, 20, 28, 38, '#ece5d2') + r(108, 20, 28, 2, '#b9b19a') + grupo(122, 35, trevo(8)) + r(112, 48, 20, 1, '#7a7466') + r(112, 52, 14, 1, '#7a7466');
    const carteira = bancada(106, 82, 40, 16) + r(112, 78, 10, 4, P.aco5) + r(128, 79, 8, 3, '#e6f5ec');
    const geiger = grupo(160, 44, bisel(0, 0, 22, 28, P.ambar) + r(4, 4, 14, 9, '#04110b') + `<polyline class="ag-varre" fill="none" stroke="${P.verde}" points="6,10 9,6 12,11 15,5 17,9"/>` + `<circle cx="11" cy="20" r="4" fill="${P.aco0}" stroke="${P.ambarEsc}"/>`) + lin(171, 72, 171, 98, P.aco4, 2) + `<path d="M171 70 q-12 10 -22 16 t-8 12" stroke="${P.aco0}" stroke-width="2" fill="none"/>` + bisel(176, 86, 16, 12, '#78838c') + r(180, 82, 8, 4, '#59636b');
    return casco(w, 120, { luzes: [50, 150] }) + quadro + cartaz + carteira + geiger + cadeira(98, 96, P.aco3);
}

function cofre(w) {
    const parafusosAnel = Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<circle cx="${(Math.cos(a) * 35).toFixed(1)}" cy="${(Math.sin(a) * 35).toFixed(1)}" r="2.4" fill="#8da0af" stroke="#2c373f" stroke-width=".8"/>`; }).join('');
    const raios = [0, 45, 90, 135].map((a) => `<line x1="-24" y1="0" x2="24" y2="0" stroke="#b9c8d3" stroke-width="3.4" transform="rotate(${a})"/>`).join('');
    const porta = grupo(62, 54, `<circle r="42" fill="#3a444d" stroke="#0e1317" stroke-width="2"/><circle r="40" fill="#68798a" stroke="#a9b9c6" stroke-width="2"/>${parafusosAnel}<circle r="29" fill="#4a5662" stroke="#a9b9c6" stroke-width="1.4"/><circle r="26" fill="#56636f" opacity=".7"/>${raios}<circle r="8" fill="#b9c8d3" stroke="#2c373f" stroke-width="2"/><circle r="3" fill="#2c373f"/>`
        + `<path d="M-32 -26 A41 41 0 0 1 -6 -40" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/>`) + r(14, 36, 6, 10, P.aco4) + r(14, 62, 6, 10, P.aco4) + ledFixo(112, 24, P.verde) + led(112, 32, P.ambar, 2);
    let gavetas = '';
    for (let c = 0; c < 3; c++) for (let l = 0; l < 4; l++) {
        const x = 124 + c * 24, y = 16 + l * 20;
        gavetas += bisel(x, y, 22, 18, '#3b464f') + r(x + 7, y + 12, 8, 2, '#9aa9b5') + r(x + 3, y + 3, 6, 4, '#0e1317') + ((c + l) % 3 === 0 ? grupo(x + 15, y + 7, trevo(4)) : '');
    }
    return casco(w, 120, { luzes: [55, 160], cor: tom(P.aco2, -.15) }) + porta + gavetas + zebra(20, PISO + 3, 94, 5) + txt(122, 112, (currentLang === 'en' ? 'LIMIT: 3 PEOPLE' : 'LIMITE: 3 PESSOAS'), 'ag-svg-mini');
}

function alojamento(w) {
    const beliche = (x, cobA, cobB) => {
        let s = r(x, 28, 3, 70, P.aco5) + r(x + 59, 28, 3, 70, P.aco5) + r(x, 28, 62, 2, P.aco4)
            + bisel(x + 3, 46, 56, 6, '#8fa6bb') + r(x + 5, 40, 22, 6, '#f1f5f8') + r(x + 5, 40, 22, 1, '#fff') + r(x + 28, 40, 30, 6, cobA) + r(x + 28, 40, 30, 1, tom(cobA, .3))
            + bisel(x + 3, 78, 56, 6, '#8fa6bb') + r(x + 5, 72, 22, 6, '#f1f5f8') + r(x + 5, 72, 22, 1, '#fff') + r(x + 28, 72, 30, 6, cobB) + r(x + 28, 72, 30, 1, tom(cobB, .3))
            + r(x + 56, 48, 2, 4, P.aco1);
        for (let y = 52; y < 96; y += 7) s += r(x + 59, y, 5, 1, P.aco4); // escada
        return s;
    };
    const armario = (x) => bisel(x, 36, 16, 62, '#43607a') + veneziana(x + 2, 40, 12, 8) + r(x + 2, 56, 12, 1, P.aco1) + r(x + 11, 64, 2, 5, P.aco6) + r(x + 2, 76, 12, 1, P.aco1);
    const relogio = `<circle cx="132" cy="30" r="8" fill="#e9eef2" stroke="${P.aco4}" stroke-width="2"/><line x1="132" y1="30" x2="132" y2="25" stroke="#111"/><line x1="132" y1="30" x2="136" y2="32" stroke="#111"/>`;
    return casco(w, 120, { luzes: [50, 150] }) + beliche(12, '#3f6f9a', '#a2503f') + beliche(78, '#5c8a4f', '#7a5aa0') + armario(150) + armario(170) + relogio
        + r(144, PISO - 4, 40, 4, '#1b2f44', 'opacity=".0"') + r(4, PISO + 3, 192, 2, '#000', 'opacity=".25"') + `<rect x="138" y="${PISO - 3}" width="8" height="3" fill="${P.aco6}" opacity=".0"/>`;
}

function medico(w) {
    const cruz = (x, y, k, cor) => r(x - k, y - 3 * k, 2 * k, 6 * k, cor) + r(x - 3 * k, y - k, 6 * k, 2 * k, cor);
    const maca = (x) => r(x + 4, 72, 3, 26, P.aco5) + r(x + 50, 72, 3, 26, P.aco5) + bisel(x, 66, 58, 7, '#dfe8ee') + r(x + 3, 62, 18, 5, '#f4f8fa') + r(x + 3, 62, 18, 1, '#fff') + r(x + 24, 66, 32, 2, '#7fb0c8') + r(x + 2, 98, 8, 2, '#111') + r(x + 46, 98, 8, 2, '#111');
    const armario = bisel(12, 22, 44, 62, '#dfe8ee') + r(14, 24, 40, 2, '#fff') + cruz(34, 40, 2, P.vermelho || '#c0392b') + [0, 1, 2].map((k) => r(18 + k * 12, 58, 10, 22, '#8fb3c8') + r(18 + k * 12, 58, 10, 1, '#fff')).join('');
    const monitorV = bisel(122, 34, 34, 24, '#26323b') + r(125, 37, 28, 18, '#0d2b22') + `<path d="M126 48 L132 48 L135 41 L139 53 L142 46 L151 46" stroke="${P.verde}" stroke-width="1.4" fill="none"/>` + r(136, 58, 6, 6, P.aco5) + r(128, 64, 22, 3, P.aco4);
    const portal = bisel(160, 26, 34, 72, '#3a5668') + r(164, 30, 26, 60, '#16313f') + `<path d="M170 34 Q177 44 184 34" stroke="#9fd2ea" fill="none"/>` + [0, 1, 2].map((k) => r(170 + k * 6, 46 + (k % 2) * 4, 2, 6, '#9fd2ea', 'opacity=".7"')).join('') + txt(177, 22, (currentLang === 'en' ? 'DECON.' : 'DESCON.'), 'ag-svg-mini');
    return casco(w, 120, { luzes: [50, 150], cor: tom(P.aco2, .05) }) + armario + maca(64) + monitorV + portal + zebra(0, PISO + 3, w, 3);
}

function oficina(w) {
    const furos = Array.from({ length: 36 }, (_, i) => r(18 + (i % 12) * 6, 22 + Math.floor(i / 12) * 14, 1, 1, '#241b0f')).join('');
    const painel = bisel(12, 16, 84, 46, '#7a6540') + furos
        + `<g stroke="${P.aco6}" stroke-width="2" fill="none"><path d="M20 26 L38 44"/><circle cx="19" cy="25" r="4"/></g>`
        + lin(46, 28, 46, 52, '#8a8f95', 3) + r(40, 26, 14, 5, '#444b52') + poli([[60, 30], [86, 30], [86, 36], [60, 46]], P.aco6) + lin(60, 46, 86, 36, '#222', 1);
    const bigorna = bisel(130, 78, 34, 8, '#59636b') + r(138, 86, 18, 12, '#444d55') + r(126, 80, 8, 3, '#59636b');
    const caixa = bisel(168, 62, 28, 36, '#a63a2b') + [0, 1, 2].map((i) => r(170, 66 + i * 11, 24, 1, '#5a1a12') + r(179, 70 + i * 11, 6, 2, P.aco6)).join('');
    const faiscas = [[104, 70, 0], [110, 66, 1], [100, 66, 2]].map(([x, y, i]) => `<rect class="ag-pisca" style="animation-delay:${i * 0.23}s" x="${x}" y="${y}" width="2" height="2" fill="${P.laranja}"/>`).join('');
    return casco(w, 120, { luzes: [55, 150] }) + painel + bancada(14, 76, 100, 22, '#3c566e') + bisel(30, 68, 10, 8, '#555') + r(34, 64, 2, 4, '#9aa') + r(96, 70, 8, 6, '#cdd') + faiscas
        + bigorna + caixa + zebra(0, 10, w, 3) + zebra(0, PISO + 3, w, 3);
}

function biblioteca(w) {
    const rng = prng(7), cores = ['#c85f4f', '#4f9bc8', '#e0b84f', '#6fc88a', '#9b7bd0', '#d8d8d0', '#b5653a'];
    let estantes = '';
    for (const y0 of [18, 44, 70]) {
        let x = 12;
        while (x < 128) {
            const largura = 3 + Math.floor(rng() * 4), altura = 15 + Math.floor(rng() * 8), cor = cores[Math.floor(rng() * cores.length)];
            if (rng() < 0.08) { x += 5; continue; }
            estantes += r(x, y0 + 24 - altura, largura, altura, cor) + r(x, y0 + 24 - altura, 1, altura, tom(cor, .3)) + r(x + largura - 1, y0 + 24 - altura, 1, altura, tom(cor, -.4));
            x += largura;
        }
        estantes += bisel(10, y0 + 24, 122, 3, '#6b5230');
    }
    const escada = lin(94, 12, 94, 98, '#8a6a3c', 2) + lin(104, 12, 104, 98, '#8a6a3c', 2) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => r(94, 24 + i * 10, 10, 2, '#a98450')).join('') + bisel(8, 13, 124, 3, P.aco4);
    const mesa = bancada(140, 78, 52, 20, '#6b5230') + r(150, 74, 22, 4, '#f1f5f8') + lin(161, 74, 161, 78, '#9aa', 1) + r(178, 68, 2, 10, P.aco5) + poli([[172, 62], [186, 62], [190, 68], [168, 68]], '#1f8a5a') + r(172, 68, 14, 1, P.ambar, 'opacity=".7"');
    const planta = r(184, 86, 8, 12, '#7a4a2a') + poli([[188, 86], [180, 70], [186, 74], [188, 64], [192, 74], [198, 70]], '#2f8a4a');
    return casco(w, 120, { luzes: [60, 160] }) + estantes + escada + monitor(144, 56, 20, 12, 5, P.ciano, 3) + mesa + planta;
}

function laboratorio(w) {
    // espectro gama: histograma com dois picos (ideia: cada isótopo tem a sua "impressão digital")
    const barras = Array.from({ length: 22 }, (_, i) => { const h = 3 + 26 * Math.exp(-Math.pow((i - 7) / 1.6, 2)) + 14 * Math.exp(-Math.pow((i - 15) / 1.3, 2)) + ((i * 7) % 4); return r(24 + i * 2.8, 58 - h, 2, h, P.verde, 'opacity=".85"'); }).join('');
    const espectro = bisel(18, 20, 76, 44, P.aco3) + r(22, 24, 68, 36, '#031012') + barras + r(22, 58, 68, 1, P.verde, 'opacity=".4"') + txt(26, 33, 'keV', 'ag-svg-mini');
    const erlen = `<path d="M26 66 L26 52 L22 40 L36 40 L32 52 L32 66Z" fill="#8fe0b0" opacity=".55" stroke="#d7f5e3" stroke-width="1"/><circle class="ag-bolha" cx="29" cy="60" r="1.2" fill="#fff"/><circle class="ag-bolha" style="animation-delay:.9s" cx="28" cy="56" r="1" fill="#fff"/>`;
    const tubos = [0, 1, 2, 3].map((i) => r(46 + i * 6, 54, 4, 12, ['#ff7b7b', '#7bb8ff', '#ffe27b', '#a6ff9a'][i], 'opacity=".75"') + r(46 + i * 6, 54, 4, 1, '#fff')).join('') + r(44, 66, 26, 2, P.aco5);
    const microscopio = r(78, 52, 4, 14, '#cfd8de') + r(72, 66, 16, 2, '#8a969e') + r(76, 48, 10, 4, '#9aa6ae') + lin(78, 50, 74, 42, '#cfd8de', 3);
    const centrifuga = grupo(100, 52, bisel(0, 0, 20, 14, '#6d7f8e') + r(2, -3, 16, 3, '#8fa3b3') + led(15, 5, P.verde, 2));
    const coifa = bisel(128, 24, 34, 74, P.aco4) + r(132, 30, 26, 52, P.ciano, 'opacity=".14"') + r(132, 30, 26, 1, P.ciano, 'opacity=".6"') + lin(132, 56, 158, 56, P.aco6, 1, 'opacity=".6"') + r(142, 74, 6, 8, '#9fe0ff', 'opacity=".7"') + veneziana(133, 14, 24, 8);
    const geladeira = bisel(168, 40, 26, 58, '#d4dde4') + r(170, 44, 22, 24, '#b6c4cf') + r(170, 72, 22, 22, '#b6c4cf') + r(188, 52, 2, 8, P.aco2) + r(188, 80, 2, 8, P.aco2) + grupo(181, 56, trevo(4)) + led(172, 41, P.verde, 1);
    return casco(w, 120, { luzes: [60, 150] }) + espectro + bancada(14, 68, 112, 30, '#3d556b') + erlen + tubos + microscopio + centrifuga + coifa + geladeira;
}

/** Cavidade escavada, ainda sem construção. */
function vazio(w) {
    const rng = prng(11);
    let s = r(0, 0, w, 120, P.rocha1) + r(0, 10, w, 88, P.rocha0);
    for (let i = 0; i < 28; i++) s += r(Math.floor(rng() * w), 4 + Math.floor(rng() * 110), 2 + Math.floor(rng() * 5), 2 + Math.floor(rng() * 3), [P.rocha2, P.rocha3, P.rocha4][i % 3], 'opacity=".75"');
    s += poli([[0, 0], [w, 0], [w, 14], [150, 18], [100, 11], [60, 17], [0, 12]], P.rocha2) + poli([[0, 98], [w, 98], [w, 120], [0, 120]], P.rocha2) + r(0, PISO, w, 2, P.rocha4) + r(0, 12, 8, 86, P.rocha1) + r(w - 8, 12, 8, 86, P.rocha1);
    // escoras de madeira e lâmpada pendurada
    s += r(40, 12, 4, 86, '#7a5a34') + r(w - 44, 12, 4, 86, '#7a5a34') + r(36, 12, w - 72, 4, '#8a6a40') + lin(44, 90, w - 44, 18, '#6b4e2c', 3, 'opacity=".5"');
    s += lin(w / 2, 14, w / 2, 32, P.aco5, 1) + poli([[w / 2 - 6, 40], [w / 2 + 6, 40], [w / 2 + 40, 98], [w / 2 - 40, 98]], P.luzQuente, 'opacity=".07"') + r(w / 2 - 4, 32, 8, 8, P.luzQuente) + r(w / 2 - 2, 34, 4, 4, '#fff');
    s += bisel(66, 84, 16, 14, '#8a6a40') + bisel(84, 90, 12, 8, '#7a5a34') + lin(150, 98, 168, 70, '#8a8f95', 2) + lin(160, 72, 174, 76, '#8a8f95', 2);
    return s;
}

function obra(w) {
    const bandeira = r(150, 54, 2, 44, P.aco5) + poli([[152, 54], [176, 60], [152, 66]], P.laranja);
    return vazio(w) + zebra(0, 12, w, 5) + zebra(0, PISO + 4, w, 5)
        + `<rect x="30" y="26" width="${w - 60}" height="70" fill="none" stroke="${P.ciano}" stroke-width="1" stroke-dasharray="4 3" opacity=".55"/>`
        + bandeira + `<rect class="ag-pisca" x="${w - 60}" y="46" width="8" height="6" fill="${P.ambar}"/><rect x="${w - 62}" y="52" width="12" height="4" fill="#2a2a2a"/>` + r(20, 56, 22, 8, P.ambar) + r(22, 58, 18, 4, '#1a1a1a');
}

const DESENHO = { hangar, comando, academia, cofre, alojamento, medico, oficina, biblioteca, laboratorio };

/** Miniatura SVG de UM módulo (célula da Base). `tipo` 'vazio' = cavidade escavada; `emObra` mostra a obra. */
export function moduloSvg(tipo, emObra = false) {
    const w = LARGURA[tipo] || 200;
    const miolo = tipo === 'vazio' ? vazio(w) : emObra ? obra(w) : (DESENHO[tipo] || vazio)(w);
    return `<svg class="ag-mod-svg" viewBox="0 0 ${w} 120" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${miolo}</svg>`;
}

/** Fundo de rocha com estratos, seixos e veios (padrão de azulejo, sem escala: o tamanho do "pixel" fica fixo). */
export function rochaSvg() {
    const rng = prng(2026);
    let t = r(0, 0, 112, 72, P.rocha2);
    for (let y = 0; y < 72; y += 12) t += r(0, y + Math.floor(rng() * 5), 112, 3, [P.rocha1, P.rocha3][(y / 12) % 2], 'opacity=".55"');
    for (let i = 0; i < 34; i++) t += r(Math.floor(rng() * 108), Math.floor(rng() * 68), 2 + Math.floor(rng() * 6), 2 + Math.floor(rng() * 4), [P.rocha0, P.rocha3, P.rocha4, P.rocha1][i % 4], 'opacity=".8"');
    for (let i = 0; i < 5; i++) t += r(Math.floor(rng() * 108), Math.floor(rng() * 68), 2, 2, '#2fbf7a', 'opacity=".35"');
    return `<svg class="ag-rocha-bg" width="100%" height="100%" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><defs><pattern id="ag-rochaP" width="112" height="72" patternUnits="userSpaceOnUse">${t}</pattern>`
        + `<linearGradient id="ag-rochaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#ag-rochaP)"/><rect width="100%" height="100%" fill="url(#ag-rochaG)"/></svg>`;
}

// ---------- Superfície: céu, montanhas, heliponto com naves, torre, radar, caminhão ----------
/** Superfície: `naves` = [{tipo, missao?}], `baias` = nº de heliportos desenhados. */
export function superficieSvg(naves, baias) {
    const rng = prng(5);
    const estrelas = Array.from({ length: 48 }, (_, i) => `<rect ${i % 7 === 0 ? 'class="ag-pisca" style="animation-delay:' + (i % 5) * 0.4 + 's" ' : ''}x="${Math.floor(rng() * 1280)}" y="${4 + Math.floor(rng() * 80)}" width="${i % 6 ? 1 : 2}" height="${i % 6 ? 1 : 2}" fill="#dff1ff" opacity="${(0.35 + (i % 4) * 0.15).toFixed(2)}"/>`).join('');
    const lua = `<circle cx="980" cy="44" r="26" fill="#cfe9ff" opacity=".08"/><circle cx="980" cy="44" r="14" fill="#e8f3fb"/><circle cx="975" cy="40" r="3" fill="#c3d6e4"/><circle cx="986" cy="49" r="2" fill="#c3d6e4"/>`;
    const n = Math.max(1, baias), passo = 220, x0 = 150;
    let pads = '', postes = '';
    for (let i = 0; i < n; i++) {
        const cx = x0 + i * passo, nv = naves[i];
        pads += `<rect x="${cx - 100}" y="154" width="200" height="16" fill="#0a131b"/>` + lin(cx - 70, 154, cx - 70, 170, P.aco3, 2) + lin(cx + 70, 154, cx + 70, 170, P.aco3, 2)
            + bisel(cx - 110, 146, 220, 8, P.concreto) + r(cx - 104, 148, 208, 1, P.concretoClaro) + r(cx - 108, 146, 6, 2, P.ambar, 'class="ag-pisca"') + r(cx + 102, 146, 6, 2, P.ambar, `class="ag-pisca" style="animation-delay:.5s"`)
            + `<text x="${cx + 78}" y="153" text-anchor="middle" class="ag-svg-h">H</text>`;
        postes += lin(cx + 112, 146, cx + 112, 96, '#6d8394', 2) + r(cx + 104, 92, 16, 4, '#9fb3c3') + poli([[cx + 105, 96], [cx + 119, 96], [cx + 140, 146], [cx + 84, 146]], P.luzQuente, 'opacity=".05"');
        if (nv && nv.missao) {
            pads += `<g transform="translate(${cx - 10} 128)" opacity=".85"><rect x="-76" y="-26" width="152" height="40" rx="3" fill="none" stroke="#7fb4d6" stroke-dasharray="5 5"/><text x="0" y="-4" text-anchor="middle" class="ag-svg-rot">${nv.tipo === 'resgate' ? (currentLang === 'en' ? 'RESCUE' : 'RESGATE') : nv.tipo === 'levantamento' ? (currentLang === 'en' ? 'SURVEY' : 'LEV.') : (currentLang === 'en' ? 'IN FLIGHT' : 'EM VOO')}</text></g>`;
        } else if (nv) pads += `<ellipse cx="${cx - 8}" cy="147" rx="64" ry="2.4" fill="#000" opacity=".45"/>` + grupo(cx - 8, 147 - 27 * 0.78, naveSvg(nv.tipo, { fogo: false }), 0.78);
    }
    const torre = lin(1110, 150, 1126, 52, '#9bb3c6', 2) + lin(1142, 150, 1126, 52, '#9bb3c6', 2) + [[130, 1115, 1137], [110, 1118, 1134], [88, 1120, 1132], [70, 1122, 1130]].map(([y, a, b]) => lin(a, y, b, y, '#9bb3c6', 2)).join('') + `<rect class="ag-luz" x="1123" y="46" width="6" height="6" fill="${P.vermelho}"/>`;
    const predio = bisel(930, 112, 90, 38, '#2c4660') + r(930, 108, 90, 4, '#1b2e42') + [0, 1, 2, 3].map((i) => r(940 + i * 20, 122, 12, 8, i === 1 ? P.luzQuente : '#0d1b26')).join('') + r(996, 128, 14, 22, '#0b1722')
        + lin(1000, 108, 1000, 90, '#9bb3c6', 2) + `<path d="M988 90 Q1000 78 1012 90" stroke="#9bb3c6" stroke-width="2" fill="none"/><path class="ag-pulsa" d="M984 84 Q1000 68 1016 84" stroke="${P.ciano}" stroke-width="1" fill="none"/>`;
    const biruta = lin(880, 150, 880, 116, '#8fa6b8', 2) + poli([[881, 116], [906, 120], [906, 128], [881, 126]], P.laranja);
    return `<svg class="ag-sup-svg" viewBox="0 0 1280 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
<defs><linearGradient id="ag-ceu2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b14"/><stop offset=".55" stop-color="#103a54"/><stop offset="1" stop-color="#e09a5e"/></linearGradient></defs>
<rect width="1280" height="170" fill="url(#ag-ceu2)"/>${estrelas}${lua}
<path d="M0 110 L90 70 L190 104 L300 58 L420 100 L560 66 L700 104 L840 62 L980 100 L1120 70 L1280 98 L1280 170 L0 170Z" fill="#12374a" opacity=".8"/>
<path d="M0 126 L140 92 L260 120 L400 88 L560 122 L720 94 L880 124 L1040 92 L1180 120 L1280 100 L1280 170 L0 170Z" fill="#0b2431"/>
${predio}${torre}${biruta}
<rect y="150" width="1280" height="20" fill="#2f4a3a"/><rect y="150" width="1280" height="3" fill="#6fa27a"/><rect y="153" width="1280" height="1" fill="#1d3226"/>
${Array.from({ length: 22 }, (_, i) => r(i * 61 + 8, 151, 2, 2, '#8fc79a', 'opacity=".6"')).join('')}${postes}${pads}
<g transform="translate(1196 128)"><rect width="58" height="18" fill="#6b7f4a"/><rect x="38" y="-9" width="20" height="13" fill="#8a9e66"/><rect x="42" y="-6" width="12" height="7" fill="${P.ciano}" opacity=".7"/><circle cx="12" cy="19" r="5" fill="#111"/><circle cx="46" cy="19" r="5" fill="#111"/></g>
</svg>`;
}
