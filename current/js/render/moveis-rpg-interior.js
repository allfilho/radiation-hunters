// ============================================
// MÓVEIS RPG — AMBIENTES INTERNOS: laboratório (lab:), hospital (hospital:) e fábrica de relógios (factory:).
// Chaves "tema:id" valem só naquele tema; as sem prefixo (em moveis-rpg.js) valem para qualquer tema.
// Assinatura: (d, w, h, cor) — d = pincel (estilo-rpg.js), w/h em px, cor = f.type.color.
// ============================================
import { tom, paleta } from './estilo-rpg.js';

const AMARELO = 0xe2c15a, VIDRO = 0xcfeaf2;

export const INTERIOR = {
    // ───────────── LABORATÓRIO ─────────────
    // Estante de amostras: dois andares de caixas e frascos etiquetados.
    'lab:shelf'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 5, 8, m);
        d.rect(4, 5, w - 8, 9, tom(m.fundo, -0.1)).rect(4, 5, w - 8, 1, m.contorno);
        const rotulos = [0x58c777, 0xe0584f, 0x4f8be0, 0xe8c14a];
        for (let k = 0; k < 7; k++) {
            const x = 5 + k * 8;
            d.rect(x, 7, 6, 7, k % 2 ? 0xe9edf0 : 0xcfd8dc).borda(x, 7, 6, 7, m.contorno).rect(x + 1, 9, 4, 2, rotulos[k % 4]);
        }
        d.rect(3, 15, w - 6, 2, m.luz);
        for (let k = 0; k < 6; k++) { const x = 6 + k * 9; d.rect(x, 18, 6, 6, tom(0xb0bec5, k % 2 ? 0 : -0.15)).borda(x, 18, 6, 6, m.contorno).rect(x + 1, 19, 4, 1, 0xffffff, 0.6); }
    },
    // Equipamento de análise: gabinete escuro com visor, botões, grade de ventilação e luzes de estado.
    'lab:machine'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 3, w - 4, h - 7, 20, m);
        d.rect(8, 8, 30, 20, 0x10181d).borda(8, 8, 30, 20, 0x05090b);                               // visor
        d.rect(10, 10, 26, 16, 0x15414a);
        d.linha(11, 22, 17, 17, 0x7be0c0).linha(17, 17, 22, 21, 0x7be0c0).linha(22, 21, 29, 13, 0x7be0c0).linha(29, 13, 34, 16, 0x7be0c0);
        for (let i = 0; i < 4; i++) d.disco(46 + (i % 2) * 8, 12 + Math.floor(i / 2) * 8, 2.4, [0x5fe38a, 0xe8c14a, 0xe0584f, 0x5fe38a][i]).anel(46 + (i % 2) * 8, 12 + Math.floor(i / 2) * 8, 2.4, m.contorno);
        for (let i = 0; i < 5; i++) d.rect(8, 33 + i * 3, 34, 1, m.fundo);                           // grade
        d.rect(46, 32, 12, 12, tom(m.base, -0.15)).borda(46, 32, 12, 12, m.contorno);               // porta de amostra
        d.disco(52, 38, 3, 0x20262e).anel(52, 38, 3, 0xaab4bd);
        d.rect(w - 12, 3, 5, 6, 0xcfd6dc).borda(w - 12, 3, 5, 6, m.contorno);                        // tubo no topo
        d.rect(3, h - 14, w - 6, 2, m.luz, 0.5);
    },
    // Freezer de amostras: porta branca com trinco, visor de temperatura e etiqueta de aviso.
    'lab:fridge'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(2, h - 5, w - 1, 6);
        d.caixa(3, 2, w - 6, h - 5, 40, m);
        d.rect(5, 5, w - 10, 3, m.brilho).rect(5, 8, w - 10, 1, m.sombra);
        d.rect(7, 12, 18, 6, 0x10181d).borda(7, 12, 18, 6, 0x05090b);
        d.rect(9, 13, 14, 4, 0x15414a).rect(10, 14, 3, 2, 0x7be0c0).rect(15, 14, 3, 2, 0x7be0c0);    // "-80"
        d.linha(5, 22, w - 5, 22, m.contorno);
        d.rect(w - 11, 26, 3, 14, 0xaab4bd).borda(w - 11, 26, 3, 14, 0x2b2f36);
        d.rect(8, 28, 11, 9, 0xfff3b0).borda(8, 28, 11, 9, 0x6a5a1a);
        d.poli([[13.5, 29], [18, 36], [9, 36]], 0xe0584f);
        d.rect(5, h - 12, w - 10, 3, m.fundo);
    },
    // Microscópio: base, braço curvo, tubo com ocular e lâmina sobre a platina.
    'lab:microscope'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 7, w - 6, 7);
        d.rect(4, 4, w - 8, h - 10, tom(0x37474f, 0)).borda(4, 4, w - 8, h - 10, 0x10181d);          // tapete/bancada
        d.rect(5, 5, w - 10, 2, tom(0x37474f, 0.28));
        d.rect(8, h - 14, 16, 6, m.sombra).borda(8, h - 14, 16, 6, m.contorno);                      // base
        d.rect(18, 9, 5, h - 20, m.base).borda(18, 9, 5, h - 20, m.contorno);                        // braço
        d.rect(10, 8, 9, 5, m.luz).borda(10, 8, 9, 5, m.contorno);                                   // tubo
        d.rect(11, 5, 4, 4, 0x20262e);                                                                // ocular
        d.rect(9, 14, 13, 2, 0xcfd6dc).rect(11, 16, 7, 3, 0x20262e);                                  // platina + objetiva
        d.rect(10, 13, 5, 2, 0xcfeaf2).borda(10, 13, 5, 2, 0x5d6b78);                                  // lâmina
        d.disco(25, 20, 2, 0xe0584f);
    },
    // Centrífuga: cuba redonda com tampa transparente, tubos radiais e painel frontal.
    'lab:centrifuge'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 4, 8, m);
        d.disco(16, 13, 10, m.fundo).disco(16, 13, 9, 0x2a323a);
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d.disco(16 + Math.cos(a) * 6, 13 + Math.sin(a) * 6, 1.8, i % 2 ? 0xe0584f : 0x4f8be0); }
        d.disco(16, 13, 2.6, 0xcfd6dc).anel(16, 13, 10, m.contorno).anel(16, 13, 8, 0xffffff, 1);
        d.rect(5, h - 9, 10, 4, 0x10181d).rect(6, h - 8, 6, 2, 0x7be0c0);
        d.disco(w - 10, h - 7, 2, 0xe0584f).anel(w - 10, h - 7, 2, m.contorno);
    },
    // Pia de bancada: tampo branco, cuba funda, torneira e registros.
    'lab:sink'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 3, w - 4, h - 5, 6, m);
        d.rect(6, 7, w - 12, h - 18, 0x9fb4bd).borda(6, 7, w - 12, h - 18, 0x44565f);
        d.rect(8, 9, w - 16, h - 22, 0x7e98a3).rect(8, 9, w - 16, 2, 0xb4c8d0);
        d.disco(w / 2, 14, 1.8, 0x1f2a30);
        d.rect(w / 2 - 1, 4, 3, 5, 0xcfd6dc).borda(w / 2 - 1, 4, 3, 5, 0x44565f);                      // torneira
        d.disco(8, 5, 1.6, 0x4f8be0).disco(w - 8, 5, 1.6, 0xe0584f);
    },
    // Contêiner de risco biológico: tambor laranja com tampa e símbolo de três anéis.
    'lab:biohazard'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 6, w - 6, 6);
        d.caixa(4, 3, w - 8, h - 6, 10, m);
        d.rect(3, 3, w - 6, 5, m.luz).borda(3, 3, w - 6, 5, m.contorno);                               // tampa
        const cx = w / 2, cy = 17;
        for (const [dx, dy] of [[0, -3.4], [-3.2, 2.2], [3.2, 2.2]]) d.anel(cx + dx, cy + dy, 3, 0x1b1b1b, 2);
        d.disco(cx, cy, 1.4, 0x1b1b1b);
        d.rect(w - 9, 4, 3, 2, 0x1b1b1b);
    },

    // ───────────── HOSPITAL (abandonado) ─────────────
    // Maca de exame: estofado, papel descartável e pés cromados.
    'hospital:table'(d, w, h, cor) {
        const m = paleta(cor), cr = paleta(0x9aa7b2);
        d.sombra(3, h - 6, w - 4, 7);
        d.rect(5, h - 7, 4, 4, cr.fundo).rect(w - 9, h - 7, 4, 4, cr.fundo);
        d.caixa(2, 3, w - 4, h - 7, 8, cr);
        d.rect(4, 5, w - 8, h - 14, 0x6f8f8c).borda(4, 5, w - 8, h - 14, 0x2e4543);                    // estofado
        d.rect(5, 6, w - 10, 2, 0x8fb0ad);
        d.rect(8, 7, w - 24, h - 17, 0xf1f4f2).borda(8, 7, w - 24, h - 17, 0xaab6b4);                  // papel
        d.linha(12, 12, w - 20, 12, 0xd2dad8).linha(12, 15, w - 24, 15, 0xd2dad8);
        d.rect(w - 15, 6, 10, h - 15, m.base).borda(w - 15, 6, 10, h - 15, m.contorno);                // encosto de cabeça
    },
    // Aparelho de raios X: coluna, braço articulado, cabeçote com colimador e detector no leito.
    'hospital:machine'(d, w, h, cor) {
        const m = paleta(cor), br = paleta(0xcfd6dc);
        d.sombra(3, h - 7, w - 4, 8);
        d.caixa(3, 28, w - 6, h - 32, 10, paleta(0x8a97a3));                                            // leito/detector
        d.rect(8, 32, w - 16, 12, 0x55636e).borda(8, 32, w - 16, 12, 0x20262e);
        d.rect(12, 35, w - 24, 6, 0x34424d);
        d.rect(5, 3, 8, 24, br.base).borda(5, 3, 8, 24, br.contorno);                                   // coluna
        d.rect(5, 3, 3, 24, br.luz);
        d.rect(12, 6, 30, 5, br.base).borda(12, 6, 30, 5, br.contorno);                                 // braço
        d.caixa(32, 9, 20, 16, 5, m);                                                                    // cabeçote
        d.rect(36, 20, 12, 3, 0x10181d).disco(42, 14, 3, 0xe8c14a).anel(42, 14, 3, m.contorno);
        d.rect(w - 14, 5, 8, 5, 0x10181d).rect(w - 13, 6, 3, 3, 0x7be0c0);
    },
    // Carrinho de medicação: três gavetas, bandeja com frascos e rodízios.
    'hospital:cart'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.rect(4, h - 5, 4, 3, 0x20262e).rect(w - 8, h - 5, 4, 3, 0x20262e);
        d.caixa(3, 3, w - 6, h - 7, 17, m);
        d.rect(6, 5, w - 12, 5, 0xdfe8ee).borda(6, 5, w - 12, 5, m.contorno);                           // bandeja
        d.rect(8, 6, 3, 3, 0xe0584f).rect(13, 6, 3, 3, 0x4f8be0).rect(18, 6, 4, 3, 0x58c777);
        for (let i = 0; i < 3; i++) { const y = 15 + i * 5; d.rect(6, y, w - 12, 4, m.base).borda(6, y, w - 12, 4, m.contorno); d.rect(w / 2 - 3, y + 1, 6, 1, AMARELO); }
    },
    // Cadeira de rodas vista de cima: assento, encosto, duas rodas grandes e apoios.
    'hospital:wheelchair'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 5, w - 7, 5);
        d.rect(3, 6, 5, 20, 0x20262e).rect(w - 8, 6, 5, 20, 0x20262e);                                 // rodas
        d.rect(4, 8, 3, 16, 0x5b646d).rect(w - 7, 8, 3, 16, 0x5b646d);
        d.rect(9, 8, w - 18, 17, m.base).borda(9, 8, w - 18, 17, m.contorno);                           // assento
        d.rect(9, 4, w - 18, 5, m.luz).borda(9, 4, w - 18, 5, m.contorno);                              // encosto
        d.rect(9, 4, 2, 2, 0xcfd6dc).rect(w - 11, 4, 2, 2, 0xcfd6dc);                                   // manoplas
        d.rect(11, 25, w - 22, 3, 0x8a97a3).borda(11, 25, w - 22, 3, m.contorno);                       // apoio de pés
    },
    // Suporte de soro visto de cima/3-4: base em estrela, haste e bolsa.
    'hospital:iv_stand'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(5, h - 8, w - 9, 6);
        const cx = w / 2, cy = h - 11;
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5 + 0.3; d.linha(cx, cy, cx + Math.cos(a) * 11, cy + Math.sin(a) * 6, m.sombra, 2); d.disco(cx + Math.cos(a) * 11, cy + Math.sin(a) * 6, 1.6, 0x20262e); }
        d.rect(cx - 1, 4, 3, cy - 4, m.luz).rect(cx + 1, 4, 1, cy - 4, m.contorno);                    // haste
        d.rect(cx - 6, 3, 13, 2, m.base);
        d.rect(cx - 7, 5, 7, 11, 0xe6f4f8).borda(cx - 7, 5, 7, 11, 0x5d7a85).rect(cx - 6, 10, 5, 5, 0x9fd0e2);
        d.linha(cx - 4, 16, cx - 1, 22, 0xcfeaf2);
    },
    // Monitor cardíaco: caixa com tela e traçado de ECG, botões e cabo.
    'hospital:monitor'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 3, w - 6, h - 6, 8, m);
        d.rect(6, 6, w - 12, 14, 0x0b1114).borda(6, 6, w - 12, 14, 0x000000);
        const pts = [[7, 14], [11, 14], [13, 9], [15, 17], [17, 14], [21, 14], [23, 11], [25, 14]];
        for (let i = 0; i < pts.length - 1; i++) d.linha(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0x5fe38a);
        d.rect(6, h - 10, 5, 3, 0xe0584f).rect(13, h - 10, 5, 3, 0xe8c14a).rect(20, h - 10, 5, 3, 0x5fe38a);
        d.linha(w - 5, 8, w - 2, h - 2, 0x20262e, 2);
    },
    // Desfibrilador: caixa vermelha com alça, tela, botão de choque e pás.
    'hospital:defibrillator'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.rect(10, 1, 12, 4, 0x20262e).borda(10, 1, 12, 4, 0x000000);                                   // alça
        d.caixa(3, 4, w - 6, h - 8, 10, m);
        d.rect(6, 7, 13, 8, 0x0b1114).borda(6, 7, 13, 8, 0x000000).linha(7, 12, 11, 12, 0x5fe38a).linha(11, 12, 13, 9, 0x5fe38a).linha(13, 9, 16, 13, 0x5fe38a);
        d.disco(w - 9, 11, 3.5, 0xf9e07a).anel(w - 9, 11, 3.5, m.contorno);                             // botão de choque
        d.rect(6, h - 11, 8, 4, 0xcfd6dc).borda(6, h - 11, 8, 4, 0x20262e);                              // pás
        d.rect(16, h - 11, 8, 4, 0xcfd6dc).borda(16, h - 11, 8, 4, 0x20262e);
        d.poli([[w - 9, h - 14], [w - 6, h - 9], [w - 12, h - 9]], 0xffffff);
    },
    // Cilindro de oxigênio com manômetro e válvula, preso a um suporte.
    'hospital:oxygen'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(6, h - 6, w - 10, 6);
        d.rect(5, h - 8, w - 10, 4, 0x55636e).borda(5, h - 8, w - 10, 4, 0x20262e);                     // base
        d.rect(8, 8, w - 16, h - 14, m.base).borda(8, 8, w - 16, h - 14, m.contorno);                   // corpo
        d.rect(10, 9, 4, h - 16, m.luz).rect(w - 13, 9, 3, h - 16, m.sombra);                           // volume
        d.rect(8, 8, w - 16, 6, 0xdfe6ea).borda(8, 8, w - 16, 6, m.contorno);                           // ombro
        d.rect(w / 2 - 2, 3, 5, 5, 0xc9a227).borda(w / 2 - 2, 3, 5, 5, 0x4a3a08);                       // válvula
        d.disco(w / 2 - 6, 6, 2.6, 0xf1f4f2).anel(w / 2 - 6, 6, 2.6, 0x20262e);                         // manômetro
        d.rect(10, 18, w - 20, 5, 0xf1f4f2).rect(12, 19, 6, 3, 0x2a8f4a);                               // etiqueta O2
    },

    // ───────────── FÁBRICA DE RELÓGIOS (anos 1920) ─────────────
    // Bancada de pintura (3×1): tampo de madeira, potes de tinta, pincéis e mostradores.
    'factory:bench'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.rect(5, h - 6, 4, 4, m.fundo).rect(w - 9, h - 6, 4, 4, m.fundo);
        d.caixa(2, 3, w - 4, h - 7, 9, m);
        for (let i = 0; i < 6; i++) d.linha(6 + i * 15, 8 + (i % 2) * 3, 18 + i * 15, 8 + (i % 2) * 3, m.luz);
        for (let k = 0; k < 3; k++) {                                                                      // 3 postos de trabalho
            const x = 6 + k * 30;
            d.disco(x + 6, 12, 5, 0xefe9d2).anel(x + 6, 12, 5, 0x5b5646);                                  // mostrador
            for (let t = 0; t < 12; t++) { const a = t * Math.PI / 6; d.rect(x + 6 + Math.cos(a) * 3.6 - 0.5, 12 + Math.sin(a) * 3.6 - 0.5, 1, 1, 0xa7f070); }
            d.rect(x + 14, 8, 6, 6, 0xc9a227).borda(x + 14, 8, 6, 6, 0x4a3a08).disco(x + 17, 10, 1.6, 0xa7f070);   // pote
            d.linha(x + 21, 17, x + 27, 12, 0x3b2a1a, 1).rect(x + 27, 11, 2, 2, 0xa7f070);                  // pincel
        }
    },
    // Armário de tintas: madeira com portas, latas e gotas escorrendo.
    'factory:cabinet'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 5, 6, m);
        d.rect(5, 6, w - 10, h - 18, tom(m.fundo, -0.05));
        for (let i = 0; i < 3; i++) {
            const y = 8 + i * 15;
            d.rect(5, y + 11, w - 10, 2, m.luz);
            d.rect(7, y + 3, 7, 8, 0xcfd6dc).borda(7, y + 3, 7, 8, 0x3a4048).rect(8, y + 5, 5, 2, [0xc9a227, 0xe0584f, 0x4f8be0][i]);   // lata
            d.rect(17, y + 5, 6, 6, 0xcfd6dc).borda(17, y + 5, 6, 6, 0x3a4048).rect(18, y + 7, 4, 2, 0xa7f070);
        }
        d.linha(w / 2, 6, w / 2, h - 12, m.contorno);
        d.rect(w / 2 - 3, h / 2, 2, 5, AMARELO).rect(w / 2 + 1, h / 2, 2, 5, AMARELO);
        d.rect(24, h - 14, 2, 5, 0xa7f070, 0.8);                                                         // gota de tinta
    },
    // Pote de pincéis: lata cheia de pincéis com pontas esverdeadas.
    'factory:brush_jar'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(5, h - 7, w - 8, 6);
        for (let i = 0; i < 6; i++) { const x = 9 + i * 2.5; d.linha(x, 17, x + (i - 2.5) * 1.6, 5, 0x3b2a1a, 2); d.rect(x + (i - 2.5) * 1.6 - 1, 3, 3, 3, i % 2 ? 0xa7f070 : 0xefe9d2); }
        d.caixa(8, 14, 16, 14, 7, paleta(0xb08d57));
        d.rect(8, 14, 16, 3, 0xd9b877).borda(8, 14, 16, 3, 0x4a3a08);
    },
    // Pote de tinta com rádio: lata dourada, tinta luminosa verde brilhando na borda.
    'factory:paint_pot'(d, w, h, cor) {
        d.sombra(5, h - 7, w - 8, 6);
        d.disco(16, 16, 12, 0xa7f070, 0.18).disco(16, 16, 9, 0xa7f070, 0.18);                            // brilho
        d.caixa(7, 10, 18, 18, 8, paleta(0xb08d57));
        d.rect(7, 10, 18, 4, 0xd9b877).borda(7, 10, 18, 4, 0x4a3a08);
        d.rect(10, 11, 12, 3, 0xa7f070).rect(11, 11, 4, 1, 0xe8ffc9);                                    // tinta
        d.rect(10, 20, 12, 5, 0xefe9d2).borda(10, 20, 12, 5, 0x5b5646).rect(12, 22, 8, 1, 0x9a8f6a);
        d.rect(24, 8, 2, 8, 0x3b2a1a);                                                                   // pincel
    },
    // Bandeja de mostradores: madeira com fileiras de mostradores pintados, números verde-luminosos.
    'factory:dial_tray'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 3, w - 4, h - 6, 5, m);
        d.rect(5, 6, w - 10, h - 14, tom(m.fundo, 0.05));
        for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
            const x = 9 + c * 9.5, y = 11 + r * 9;
            d.disco(x, y, 3.6, 0xefe9d2).anel(x, y, 3.6, 0x5b5646);
            d.rect(x - 0.5, y - 3, 1, 1, 0xa7f070).rect(x - 0.5, y + 2, 1, 1, 0xa7f070).rect(x - 3, y - 0.5, 1, 1, 0xa7f070).rect(x + 2, y - 0.5, 1, 1, 0xa7f070);
        }
    },
    // Estante de relógios prontos: madeira, relógios de pulso e de bolso em prateleiras.
    'factory:shelf'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 5, 8, m);
        d.rect(4, 5, w - 8, 9, tom(m.fundo, 0.0));
        for (let k = 0; k < 6; k++) { const x = 9 + k * 9.5; d.disco(x, 10, 3.6, 0xefe9d2).anel(x, 10, 3.6, 0x4a3a08); d.linha(x, 10, x, 8, 0x1b1b1b).linha(x, 10, x + 2, 10, 0x1b1b1b); }
        d.rect(3, 15, w - 6, 2, m.luz);
        for (let k = 0; k < 5; k++) { const x = 8 + k * 11; d.rect(x, 18, 8, 5, 0x3b2a1a).borda(x, 18, 8, 5, 0x120d07); d.disco(x + 4, 20.5, 1.8, 0xefe9d2); }
    },
    // Pia de lavagem: cuba de ferro esmaltado com mancha esverdeada de tinta.
    'factory:sink'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 3, w - 4, h - 5, 6, m);
        d.rect(6, 7, w - 12, h - 18, 0x93a3ab).borda(6, 7, w - 12, h - 18, 0x44565f);
        d.rect(8, 9, w - 16, h - 22, 0x76868e);
        d.rect(10, 11, 8, 4, 0xa7f070, 0.55);                                                            // tinta que escorreu
        d.rect(w / 2 - 1, 4, 3, 5, 0xc9a227).borda(w / 2 - 1, 4, 3, 5, 0x4a3a08);
    },
    // Armário do operário: madeira em tábuas, duas portas, fechadura de latão.
    'factory:locker'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 5, 6, m);
        for (let i = 0; i < 4; i++) d.linha(8 + i * 5, 5, 8 + i * 5, h - 12, m.fundo);                   // tábuas
        d.linha(w / 2, 4, w / 2, h - 11, m.contorno, 2);
        d.rect(w / 2 - 5, h / 2, 3, 4, AMARELO).rect(w / 2 + 2, h / 2, 3, 4, AMARELO);
        d.rect(w / 2 - 7, 8, 14, 7, 0xefe9d2).borda(w / 2 - 7, 8, 14, 7, 0x5b5646).rect(w / 2 - 5, 11, 10, 1, 0x7a6e4a);   // etiqueta
    },
    // Relógio de caixa/parede: caixa de madeira e mostrador grande com ponteiros.
    'factory:clock'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(5, h - 6, w - 8, 5);
        d.caixa(5, 3, w - 10, h - 7, 6, m);
        d.disco(16, 14, 9, 0xefe9d2).anel(16, 14, 9, 0x4a3a08, 2);
        for (let t = 0; t < 12; t++) { const a = t * Math.PI / 6; d.rect(16 + Math.cos(a) * 7 - 0.5, 14 + Math.sin(a) * 7 - 0.5, 1, 1, 0x1b1b1b); }
        d.linha(16, 14, 16, 8, 0x1b1b1b, 1).linha(16, 14, 21, 16, 0x1b1b1b, 1).disco(16, 14, 1.2, 0xc9a227);
        d.rect(12, h - 11, 8, 3, 0xc9a227);                                                              // pêndulo
    },
    // Luminária de trabalho: cúpula redonda vista de cima com halo amarelo.
    'factory:lamp'(d, w, h, cor) {
        d.sombra(6, h - 6, w - 10, 5);
        d.disco(16, 15, 14, 0xfff2a8, 0.18).disco(16, 15, 10, 0xfff2a8, 0.22);
        d.rect(13, h - 12, 6, 6, 0x4a3a2a).borda(13, h - 12, 6, 6, 0x120d07);                              // base
        d.disco(16, 13, 8, 0x3b4a3a).anel(16, 13, 8, 0x0e150e);                                           // cúpula
        d.disco(14, 11, 4, 0x5b7a5b).disco(16, 14, 3, 0xfff2a8).anel(16, 14, 3, 0xe8c14a);
    },
    // Banquinho: assento redondo de madeira e três pés.
    'factory:stool'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(6, h - 6, w - 10, 5);
        d.rect(8, h - 9, 3, 6, m.fundo).rect(w - 11, h - 9, 3, 6, m.fundo).rect(w / 2 - 1, h - 7, 3, 4, m.fundo);
        d.disco(16, 14, 11, m.fundo).disco(16, 13, 10, m.base).disco(15, 12, 7, m.luz, 0.7).anel(16, 13, 10, m.contorno);
        d.anel(16, 13, 6, m.sombra).anel(16, 13, 3, m.sombra);
    },
    // Ventilador/exaustor: carcaça quadrada com grade, pás e parafusos.
    'factory:fan'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 3, w - 6, h - 6, 4, m);
        d.disco(16, 15, 11, 0x20262e).anel(16, 15, 11, m.contorno);
        for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.5; d.poli([[16, 15], [16 + Math.cos(a - 0.4) * 9, 15 + Math.sin(a - 0.4) * 9], [16 + Math.cos(a + 0.4) * 9, 15 + Math.sin(a + 0.4) * 9]], 0x8f9ba5, 0x20262e); }
        d.disco(16, 15, 2.4, 0xcfd6dc);
        for (const [x, y] of [[6, 6], [w - 7, 6], [6, h - 11], [w - 7, h - 11]]) d.disco(x, y, 1, 0xcfd6dc);
    },
};
