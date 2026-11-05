// ============================================
// MÓVEIS RPG — AMBIENTES EXTERNOS E RUÍNAS: ferro-velho (junkyard:), usina nuclear (nuclear:) e abrigo/bunker (bunker:).
// Mesma convenção de moveis-rpg-interior.js. Efeitos especiais (brilho da cápsula, do reator e do RTG)
// continuam sendo desenhados pela GameScene por cima; aqui fica só o objeto.
// ============================================
import { tom, paleta } from './estilo-rpg.js';

const AMARELO = 0xe8c14a, FERRUGEM = 0x9a4a1e;

/** Símbolo de radiação (trifólio estilizado) centrado em (cx, cy). */
function trifolio(d, cx, cy, r, cor, fundo) {
    d.disco(cx, cy, r, fundo).anel(cx, cy, r, cor);
    for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / 3;
        d.poli([[cx, cy], [cx + Math.cos(a - 0.5) * r * 0.85, cy + Math.sin(a - 0.5) * r * 0.85], [cx + Math.cos(a + 0.5) * r * 0.85, cy + Math.sin(a + 0.5) * r * 0.85]], cor);
    }
    d.disco(cx, cy, r * 0.2, fundo);
}

export const RUINAS = {
    // ───────────── FERRO-VELHO ─────────────
    // Carro destruído (3×2): carroceria enferrujada, vidros trincados, capô aberto, uma roda faltando.
    'junkyard:car'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 7, w - 6, 8);
        d.rect(8, 4, 12, 6, 0x15110f).rect(w - 20, 4, 12, 6, 0x15110f).rect(w - 20, h - 12, 12, 7, 0x15110f);   // rodas (a 4ª faltando)
        d.caixa(5, 7, w - 10, h - 15, 14, m);
        d.rect(w - 30, 11, 24, h - 31, tom(m.base, -0.15)).borda(w - 30, 11, 24, h - 31, m.contorno);            // capô
        d.rect(30, 13, 22, h - 33, 0x6f8f99).borda(30, 13, 22, h - 33, 0x1d2a2e);                                // para-brisa
        d.linha(34, 15, 46, 26, 0xdff1f5).linha(40, 14, 38, 24, 0xdff1f5).linha(46, 16, 49, 24, 0xdff1f5);        // trincas
        d.rect(12, 13, 16, h - 33, tom(m.base, 0.05)).borda(12, 13, 16, h - 33, m.contorno);                      // teto
        d.rect(w - 9, 14, 3, 6, 0xe8d98a).rect(w - 9, h - 25, 3, 6, 0xe8d98a);                                    // faróis
        d.rect(6, 14, 3, 5, 0xb02a2a);
        d.rect(w - 28, 14, 8, 3, 0x2b2f36).rect(w - 26, 20, 4, 4, 0x55636e);                                      // motor exposto
    },
    // Pilha de sucata: chapas e peças amontoadas, com um canto amassado.
    'junkyard:scrap'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 8, w - 6, 9);
        d.poli([[4, h - 8], [10, 24], [26, 14], [44, 18], [w - 4, 30], [w - 5, h - 9]], m.sombra, m.contorno);
        d.poli([[8, 36], [14, 22], [28, 18], [38, 24], [34, 40]], m.base, m.contorno);
        d.poli([[34, 22], [50, 28], [w - 8, 38], [44, 44]], tom(m.base, 0.15), m.contorno);
        d.poli([[16, 14], [30, 8], [38, 16], [24, 20]], m.luz, m.contorno);
        d.linha(14, 28, 30, 26, m.fundo).linha(36, 30, 50, 36, m.fundo);
        d.rect(40, 12, 8, 8, 0x9a4a1e).borda(40, 12, 8, 8, 0x4a200a);
        d.disco(20, 44, 4, 0x20262e).anel(20, 44, 4, 0x55636e);
        d.rect(46, h - 20, 12, 3, 0x7d8a95).rect(10, h - 16, 3, 10, 0x7d8a95);
    },
    // Barril enferrujado visto de cima: tampa com aros, bocal e marcas de ferrugem.
    'junkyard:barrel'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(5, h - 7, w - 8, 6);
        d.caixa(5, 5, w - 10, h - 8, 8, m);
        d.rect(6, 5, w - 12, 12, m.base);
        d.disco(16, 11, 9, m.sombra).disco(16, 10, 8, m.base).anel(16, 10, 9, m.contorno).anel(16, 10, 5.5, m.fundo);
        d.disco(13, 8, 3, m.luz, 0.8);
        d.disco(19, 12, 1.8, 0x1d1d1d).anel(19, 12, 1.8, 0x6b6b6b);
        d.rect(6, 19, w - 12, 1, m.fundo).rect(6, 24, w - 12, 1, m.fundo);
        d.rect(11, 20, 4, 3, FERRUGEM, 0.85).rect(20, 25, 5, 2, FERRUGEM, 0.85);
    },
    // Geladeira velha: porta entreaberta, ferrugem, pés quebrados e prateleiras vazias à mostra.
    'junkyard:fridge'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(2, h - 5, w - 1, 6);
        d.caixa(3, 2, w - 6, h - 5, 40, m);
        d.rect(5, 5, w - 10, 3, m.brilho);
        d.linha(5, 22, w - 5, 22, m.contorno);
        d.rect(w - 11, 12, 3, 8, 0x8a97a3).borda(w - 11, 12, 3, 8, 0x2b2f36).rect(w - 11, 28, 3, 14, 0x8a97a3).borda(w - 11, 28, 3, 14, 0x2b2f36);
        d.poli([[5, 26], [14, 28], [14, 52], [5, 50]], tom(m.base, -0.3), m.contorno);                      // porta entreaberta
        d.rect(15, 26, 12, 26, 0x30302c).rect(15, 34, 12, 1, 0x6f6f66).rect(15, 44, 12, 1, 0x6f6f66);
        d.rect(8, 8, 8, 6, FERRUGEM, 0.8).rect(18, 40, 6, 8, FERRUGEM, 0.7);
    },
    // Máquina quebrada (2×2): carcaça de engrenagens expostas, fios soltos e fagulha.
    'junkyard:machine'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(3, 4, w - 6, h - 9, 16, m);
        d.rect(8, 9, 30, 24, 0x1a1210).borda(8, 9, 30, 24, 0x000000);
        d.disco(18, 20, 8, 0x8a97a3).anel(18, 20, 8, 0x20262e, 2).disco(18, 20, 3, 0x20262e);
        d.disco(32, 26, 5, 0xb08d57).anel(32, 26, 5, 0x4a3a08).disco(32, 26, 2, 0x20262e);
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d.rect(18 + Math.cos(a) * 9 - 1, 20 + Math.sin(a) * 9 - 1, 2, 2, 0x8a97a3); }
        d.rect(w - 18, 12, 10, 8, 0x20262e).rect(w - 16, 14, 6, 4, 0xe0584f, 0.7);
        d.linha(w - 12, 22, w - 6, 34, 0xd44a2a, 2).linha(w - 6, 34, w - 12, 42, 0x1b1b1b, 2);
        d.rect(w - 14, 30, 2, 2, 0xfff2a8).rect(w - 11, 33, 2, 2, 0xfff2a8);                                // fagulhas
        d.rect(10, h - 14, w - 20, 3, FERRUGEM, 0.8);
    },
    // Cápsula de chumbo: cilindro cinza escuro com tampa rosqueada e símbolo de radiação amarelo.
    'junkyard:capsule'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(5, h - 7, w - 8, 6);
        d.caixa(6, 6, w - 12, h - 10, 8, m);
        d.rect(6, 6, w - 12, 5, m.luz).rect(6, 11, w - 12, 1, m.fundo);
        d.disco(16, 14, 7, m.luz).anel(16, 14, 7, m.contorno, 2);
        trifolio(d, 16, 14, 5, AMARELO, 0x20262e);
        d.rect(6, h - 12, w - 12, 2, m.fundo);
    },
    // Pilha de pneus: anéis concêntricos, centro vazado, borracha gasta.
    'junkyard:tire'(d, w, h, cor) {
        d.sombra(4, h - 6, w - 6, 6);
        d.disco(16, 17, 13, 0x0a0a0a).disco(16, 15, 12.5, 0x1d1d1d).disco(15, 13, 8, 0x2b2b2b);
        d.anel(16, 15, 12.5, 0x000000).anel(16, 15, 9, 0x3a3a3a).anel(16, 15, 6, 0x3a3a3a);
        d.disco(16, 15, 4.5, 0x15110f).anel(16, 15, 4.5, 0x000000);
        for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; d.rect(16 + Math.cos(a) * 10.5 - 0.5, 15 + Math.sin(a) * 10.5 - 0.5, 1, 1, 0x4a4a4a); }
        d.disco(11, 9, 2.5, 0x4a4a4a, 0.6);
    },
    // Chapas de metal empilhadas (2×1): três chapas desalinhadas, ferrugem e furos.
    'junkyard:metal'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(4, 12, w - 10, h - 14, 6, paleta(tom(cor, -0.15)));
        d.caixa(2, 7, w - 12, h - 14, 6, paleta(cor));
        d.caixa(8, 3, w - 14, h - 14, 6, paleta(tom(cor, 0.1)));
        d.rect(10, 5, w - 20, 2, m.brilho);
        for (const [x, y] of [[12, 10], [w - 22, 10], [20, 18]]) d.disco(x, y, 1.3, 0x111111);
        d.rect(22, 6, 10, 5, FERRUGEM, 0.7).rect(w - 28, 18, 8, 4, FERRUGEM, 0.7);
    },
    // Bloco de motor: cabeçote com pistões, tampa de válvulas e correia.
    'junkyard:engine'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(3, 4, w - 6, h - 8, 10, m);
        for (let i = 0; i < 3; i++) { const x = 6 + i * 8; d.rect(x, 7, 6, 10, tom(m.base, 0.1)).borda(x, 7, 6, 10, m.contorno); d.disco(x + 3, 12, 1.8, 0x20262e); }
        d.rect(5, 18, w - 10, 3, 0xc9a227).borda(5, 18, w - 10, 3, 0x4a3a08);
        d.disco(w - 7, h - 12, 3.5, 0x20262e).anel(w - 7, h - 12, 3.5, 0x6b6b6b);
        d.rect(8, h - 11, 12, 2, 0x20262e);
        d.rect(6, 8, 5, 4, FERRUGEM, 0.7);
    },
    // Bancada de trabalho (2×1): madeira lascada, morsa, martelo e chave inglesa.
    'junkyard:bench'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.rect(5, h - 7, 4, 4, m.fundo).rect(w - 9, h - 7, 4, 4, m.fundo);
        d.caixa(2, 3, w - 4, h - 7, 9, m);
        for (let i = 0; i < 3; i++) d.linha(6 + i * 18, 8 + (i % 2) * 3, 18 + i * 18, 8 + (i % 2) * 3, m.luz);
        d.rect(w - 18, 6, 10, 8, 0x55636e).borda(w - 18, 6, 10, 8, 0x20262e).rect(w - 16, 8, 6, 2, 0x8a97a3);    // morsa
        d.rect(8, 8, 12, 3, 0x7d8a95).borda(8, 8, 12, 3, 0x20262e);                                             // chave
        d.rect(24, 7, 3, 9, 0x8a5a2b).rect(21, 6, 9, 4, 0x6b6b6b).borda(21, 6, 9, 4, 0x20262e);                   // martelo
        d.rect(34, 12, 6, 4, FERRUGEM, 0.8);
    },
    // Máquina de lavar velha: porta redonda com vidro quebrado, painel e dobradiça enferrujada.
    'junkyard:washer'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 4, 6, m);
        d.rect(5, 4, w - 10, 5, m.luz).disco(9, 6.5, 1.4, 0xe0584f).disco(14, 6.5, 1.4, 0x5fe38a).rect(w - 14, 5, 8, 3, 0x20262e);
        d.disco(16, 19, 9, m.fundo).anel(16, 19, 9, m.contorno, 2).disco(16, 19, 6.5, 0x3a4a52);
        d.linha(12, 16, 19, 23, 0xdff1f5).linha(19, 23, 14, 24, 0xdff1f5);
        d.rect(5, 18, 2, 6, 0x8a97a3).rect(8, h - 8, 8, 3, FERRUGEM, 0.8);
    },
    // Fogão quebrado: quatro bocas, grelhas, botões e forno com porta aberta.
    'junkyard:stove'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 4, 10, m);
        for (const [x, y] of [[9, 8], [23, 8], [9, 17], [23, 17]]) { d.disco(x, y, 4.5, 0x15110f).anel(x, y, 4.5, 0x6b6b6b).disco(x, y, 1.6, 0x6b6b6b); }
        d.rect(7, 4, 18, 1, 0x6b6b6b).rect(7, 23, 18, 1, 0x6b6b6b);
        for (let i = 0; i < 4; i++) d.disco(6 + i * 7, h - 4, 1.4, 0xcfd6dc);
        d.rect(8, h - 10, w - 16, 4, 0x15110f).rect(8, h - 11, w - 16, 1, 0x8a97a3);
        d.rect(21, 12, 5, 4, FERRUGEM, 0.8);
    },
    // Sofá apodrecido (2×1): tecido rasgado, molas à mostra, almofadas desiguais.
    'junkyard:sofa'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.rect(5, h - 7, 4, 4, 0x20150f).rect(w - 9, h - 7, 4, 4, 0x20150f);
        d.caixa(2, 3, w - 4, h - 6, 9, m);
        d.rect(4, 3, w - 8, 7, m.sombra).borda(4, 3, w - 8, 7, m.contorno);                                    // encosto
        d.rect(6, 11, 26, 11, m.base).borda(6, 11, 26, 11, m.contorno);                                        // almofadas
        d.rect(33, 11, 25, 11, tom(m.base, 0.08)).borda(33, 11, 25, 11, m.contorno);
        d.rect(2, 8, 5, 16, m.luz).borda(2, 8, 5, 16, m.contorno).rect(w - 7, 8, 5, 16, m.luz).borda(w - 7, 8, 5, 16, m.contorno);   // braços
        d.rect(14, 14, 8, 5, 0x3a2a1e); for (let i = 0; i < 4; i++) d.linha(15 + i * 2, 14, 15 + i * 2, 19, 0x9aa3ad);   // molas
        d.rect(42, 13, 10, 3, 0x2a1d14).rect(24, 12, 4, 2, 0x4a6a3a, 0.9);                                       // rasgo e mofo
    },
    // TV de tubo antiga: gabinete de madeira, tela convexa com chuvisco e antenas.
    'junkyard:tv'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.linha(12, 6, 7, 0, 0x9aa3ad).linha(20, 6, 25, 0, 0x9aa3ad);
        d.caixa(3, 5, w - 6, h - 8, 7, m);
        d.rect(6, 8, 17, 13, 0x15110f).borda(6, 8, 17, 13, 0x000000);
        d.rect(7, 9, 15, 11, 0x5b6a70);
        for (let i = 0; i < 12; i++) d.rect(8 + (i * 5) % 13, 10 + (i * 3) % 9, 2, 1, i % 2 ? 0xdfe6e9 : 0x20262e);   // estática
        d.disco(w - 7, 12, 2, 0xcfd6dc).disco(w - 7, 19, 2, 0xcfd6dc);
        d.linha(6, 8, 22, 20, 0xdff1f5, 1);                                                                    // tela trincada
    },

    // ───────────── USINA NUCLEAR ─────────────
    // Console de controle (3×1): painéis inclinados, telas, botões e alavancas, luzes de alarme.
    'nuclear:console'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 4, 6);
        d.caixa(2, 3, w - 4, h - 6, 11, m);
        for (let k = 0; k < 3; k++) {
            const x = 6 + k * 30;
            d.rect(x, 5, 24, 11, 0x0b1114).borda(x, 5, 24, 11, 0x000000);
            d.rect(x + 2, 7, 20, 7, 0x12343c);
            d.linha(x + 3, 12, x + 8, 9, 0x7be0c0).linha(x + 8, 9, x + 14, 11, 0x7be0c0).linha(x + 14, 11, x + 20, 8, 0x7be0c0);
            for (let i = 0; i < 4; i++) d.rect(x + 2 + i * 6, 19, 4, 3, [0xe0584f, 0xe8c14a, 0x5fe38a, 0x4f8be0][(i + k) % 4]).borda(x + 2 + i * 6, 19, 4, 3, m.contorno);
        }
        d.rect(w - 12, 4, 5, 3, 0xe0584f).rect(w - 20, 4, 5, 3, 0xe8c14a);
    },
    // Junção de tubulação: cotovelo grosso, flange parafusada e válvula de roda.
    'nuclear:pipe'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 6);
        d.rect(0, 10, 32, 10, m.base).rect(0, 10, 32, 3, m.luz).rect(0, 17, 32, 3, m.sombra).rect(0, 10, 32, 1, m.contorno).rect(0, 19, 32, 1, m.contorno);
        d.rect(10, 0, 10, 32, m.base).rect(10, 0, 3, 32, m.luz).rect(17, 0, 3, 32, m.sombra);
        d.rect(10, 10, 10, 10, m.base).disco(15, 15, 6, m.luz).anel(15, 15, 6, m.contorno);
        d.disco(15, 15, 3, m.fundo);
        for (const [x, y] of [[9, 9], [20, 9], [9, 20], [20, 20]]) d.disco(x, y, 1.2, 0xcfd6dc);
        d.rect(4, 8, 2, 14, 0xc9a227).rect(26, 8, 2, 14, 0xc9a227);                                            // flanges
    },
    // Contêiner de resíduo: tambor amarelo com símbolo de radiação, tampa selada.
    'nuclear:container'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(5, h - 7, w - 8, 6);
        d.caixa(5, 4, w - 10, h - 7, 10, m);
        d.rect(4, 4, w - 8, 6, m.luz).borda(4, 4, w - 8, 6, m.contorno);
        trifolio(d, 16, 19, 5, 0x1b1b1b, m.base);
        d.rect(6, 12, w - 12, 1, m.fundo).rect(6, 26, w - 12, 1, m.fundo);
        d.rect(w - 10, 5, 4, 3, 0x6b6b6b);
    },
    // Núcleo danificado (3×3): blindagem de concreto, anel de aço, barras de combustível e núcleo incandescente.
    'nuclear:reactor'(d, w, h, cor) {
        d.sombra(4, h - 8, w - 6, 9);
        d.caixa(2, 2, w - 4, h - 6, 12, paleta(0x55636e));
        d.disco(w / 2, h / 2 - 2, 38, 0x2b343b).anel(w / 2, h / 2 - 2, 38, 0x0e1317, 2);
        d.disco(w / 2, h / 2 - 2, 31, 0x3a464f).anel(w / 2, h / 2 - 2, 31, 0x0e1317);
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; d.rect(w / 2 + Math.cos(a) * 34 - 1.5, h / 2 - 2 + Math.sin(a) * 34 - 1.5, 3, 3, 0xcfd6dc); }
        d.disco(w / 2, h / 2 - 2, 22, 0x15110f).disco(w / 2, h / 2 - 2, 19, 0xc23a1a).disco(w / 2 - 2, h / 2 - 4, 13, 0xff7a2a).disco(w / 2 - 3, h / 2 - 5, 6, 0xffd34a);
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.4; d.linha(w / 2, h / 2 - 2, w / 2 + Math.cos(a) * 20, h / 2 - 2 + Math.sin(a) * 20, 0x3a0d05, 2); }
    },
    // Unidade de resfriamento (2×2): trocador de calor com ventoinhas grandes e tubos.
    'nuclear:machine'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 3, w - 4, h - 7, 14, m);
        for (const cx of [20, 44]) {
            d.disco(cx, 20, 11, 0x15110f).anel(cx, 20, 11, m.contorno, 2);
            for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; d.poli([[cx, 20], [cx + Math.cos(a - 0.5) * 9, 20 + Math.sin(a - 0.5) * 9], [cx + Math.cos(a + 0.5) * 9, 20 + Math.sin(a + 0.5) * 9]], 0x8a97a3, 0x20262e); }
            d.disco(cx, 20, 2.4, 0xcfd6dc);
        }
        d.rect(5, h - 20, w - 10, 3, 0x0097a7).rect(5, h - 20, w - 10, 1, 0x4dd0e1);                           // tubo de água
        d.rect(5, h - 15, w - 10, 7, m.sombra);
        for (let i = 0; i < 8; i++) d.rect(8 + i * 7, h - 14, 4, 1, m.fundo);
    },
    // Painel elétrico: gabinete alto com disjuntores, medidores e faixa de perigo.
    'nuclear:panel'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 5, 6, m);
        d.rect(6, 5, w - 12, 10, 0x0b1114).disco(11, 10, 3.5, 0xf1f4f2).anel(11, 10, 3.5, 0x20262e).linha(11, 10, 13, 8, 0xe0584f);
        d.disco(21, 10, 3.5, 0xf1f4f2).anel(21, 10, 3.5, 0x20262e).linha(21, 10, 20, 8, 0xe0584f);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) d.rect(7 + c * 5, 19 + r * 7, 3, 5, c % 2 ? 0xe0584f : 0xcfd6dc).borda(7 + c * 5, 19 + r * 7, 3, 5, m.contorno);
        d.rect(5, h - 16, w - 10, 4, AMARELO);
        for (let i = 0; i < 4; i++) d.poli([[5 + i * 6, h - 12], [8 + i * 6, h - 12], [11 + i * 6, h - 16], [8 + i * 6, h - 16]], 0x1b1b1b);
    },
    // Tanque de refrigerante (2×1): cilindro azul-petróleo com nível visível e tubulação.
    'nuclear:tank'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 4, w - 4, h - 7, 14, m);
        d.rect(4, 5, w - 8, 5, m.luz).rect(4, 10, w - 8, 1, m.fundo);
        d.rect(w - 14, 13, 8, 12, 0xcfeaf2).borda(w - 14, 13, 8, 12, m.contorno).rect(w - 13, 18, 6, 6, 0x4dd0e1);   // visor de nível
        for (const x of [14, 30, 46]) d.rect(x, 5, 2, h - 12, m.contorno, 0.6);                                   // cintas
        d.disco(8, 6, 2.2, 0xcfd6dc).anel(8, 6, 2.2, m.contorno);
    },
    // Ponte rolante (2×1): viga amarela, carro, cabo e gancho.
    'nuclear:crane'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(1, 4, w - 2, 9, 3, m);
        for (let i = 0; i < 4; i++) d.poli([[4 + i * 15, 4], [12 + i * 15, 4], [8 + i * 15, 11]], m.sombra, m.contorno);
        d.rect(24, 12, 16, 8, 0x55636e).borda(24, 12, 16, 8, 0x20262e).disco(27, 20, 2, 0x20262e).disco(37, 20, 2, 0x20262e);
        d.linha(32, 20, 32, 25, 0x20262e, 2);
        d.anel(32, 27, 3, 0xcfd6dc, 2); d.rect(31, 30, 2, 2, 0xcfd6dc);
        d.rect(3, 2, 6, 3, 0x20262e).rect(w - 9, 2, 6, 3, 0x20262e);
    },
    // Medidor de radiação: caixa com mostrador de ponteiro, escala verde-amarelo-vermelho e alça.
    'nuclear:dosimeter'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 5, w - 6, 5);
        d.caixa(5, 4, w - 10, h - 8, 8, m);
        d.rect(8, 7, 16, 11, 0xf1f4f2).borda(8, 7, 16, 11, 0x20262e);
        d.rect(9, 8, 5, 2, 0x5fe38a).rect(14, 8, 4, 2, 0xe8c14a).rect(18, 8, 5, 2, 0xe0584f);
        d.linha(16, 17, 20, 11, 0x1b1b1b).disco(16, 17, 1.2, 0x1b1b1b);
        d.disco(11, h - 11, 2, 0xe0584f).rect(15, h - 12, 9, 3, 0x20262e);
        d.rect(12, 1, 8, 3, 0x20262e);
    },
    // Traje de proteção pendurado, visto de cima: capuz, ombros, braços abertos e botas.
    'nuclear:suit'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 5, w - 6, 5);
        d.rect(3, 9, w - 6, 8, m.base).borda(3, 9, w - 6, 8, m.contorno).rect(4, 10, w - 8, 2, m.luz);      // braços
        d.rect(10, 8, 12, 17, m.base).borda(10, 8, 12, 17, m.contorno).rect(11, 9, 3, 15, m.luz);
        d.disco(16, 8, 6, m.luz).anel(16, 8, 6, m.contorno).rect(12, 6, 8, 4, 0x2c5a6a).rect(13, 6, 3, 1, 0x9fd0e2);     // visor
        d.rect(10, 25, 5, 4, 0x2b2f36).rect(17, 25, 5, 4, 0x2b2f36);
        d.rect(14, 14, 4, 4, 0x20262e).rect(15, 15, 2, 2, AMARELO);
    },
    // Porta/blindagem de chumbo: laje espessa com rebites, trifólio e dobradiças.
    'nuclear:lead_door'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 5, 6, m);
        d.rect(6, 5, w - 12, h - 14, m.sombra).borda(6, 5, w - 12, h - 14, m.contorno);
        for (const [x, y] of [[8, 7], [w - 10, 7], [8, h - 14], [w - 10, h - 14]]) d.disco(x, y, 1.3, m.brilho);
        trifolio(d, w / 2, h / 2 - 4, 6, AMARELO, 0x20262e);
        d.rect(w - 9, h / 2 + 4, 3, 8, 0xcfd6dc).borda(w - 9, h / 2 + 4, 3, 8, 0x20262e);
        d.rect(3, 9, 4, 5, 0x20262e).rect(3, h - 16, 4, 5, 0x20262e);
    },

    // ───────────── ABRIGO / BUNKER ─────────────
    // Caixote de suprimentos: tábuas, cantoneiras de ferro e carimbo.
    'bunker:crate'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 6, w - 6, 6);
        d.caixa(4, 4, w - 8, h - 7, 8, m);
        for (let i = 0; i < 3; i++) d.linha(6, 8 + i * 5, w - 6, 8 + i * 5, m.fundo);
        d.linha(5, 5, w - 5, h - 11, m.contorno).linha(w - 5, 5, 5, h - 11, m.contorno);
        for (const [x, y] of [[6, 6], [w - 9, 6], [6, h - 14], [w - 9, h - 14]]) d.rect(x, y, 3, 3, 0x55636e);
        d.rect(12, h - 12, 8, 4, 0xefe9d2, 0.85);
    },
    // Barril de combustível: azul-chumbo escuro, bocal, aros e bico.
    'bunker:barrel'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(5, h - 7, w - 8, 6);
        d.caixa(5, 5, w - 10, h - 8, 8, m);
        d.disco(16, 11, 9, m.sombra).disco(16, 10, 8, m.base).anel(16, 10, 9, m.contorno).anel(16, 10, 5.5, m.fundo);
        d.disco(13, 8, 3, m.luz, 0.8);
        d.disco(19, 12, 2, 0x1d1d1d).anel(19, 12, 2, 0xc9a227);
        d.rect(6, 19, w - 12, 1, m.fundo).rect(6, 24, w - 12, 1, m.fundo);
        d.rect(10, 20, 12, 3, AMARELO, 0.85).rect(12, 21, 8, 1, 0x1b1b1b);                                     // faixa de aviso
    },
    // Gerador radioisotópico (RTG, 2×1): cilindro com aletas de dissipação, base e terminais.
    'bunker:generator'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 5, w - 4, h - 8, 7, m);
        d.rect(4, 6, w - 8, 4, m.luz);
        for (let i = 0; i < 9; i++) d.rect(6 + i * 6, 5, 3, h - 14, i % 2 ? m.sombra : m.base).rect(6 + i * 6, 5, 3, 1, m.brilho);   // aletas
        d.rect(2, 8, 4, h - 16, 0x20262e).rect(w - 6, 8, 4, h - 16, 0x20262e);                                  // tampas
        d.rect(w / 2 - 6, 2, 12, 4, AMARELO).borda(w / 2 - 6, 2, 12, 4, 0x4a3a08);                              // terminal
        trifolio(d, w / 2, h - 12, 3.4, 0x1b1b1b, AMARELO);
        d.rect(8, h - 8, 3, 3, 0x20262e).rect(w - 11, h - 8, 3, 3, 0x20262e);
    },
    // Armário de equipamento: aço verde-oliva em duas folhas, cadeado.
    'bunker:cabinet'(d, w, h, cor) {
        const m = paleta(tom(cor, -0.05));
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 5, 6, m);
        d.rect(5, 4, w - 10, 3, m.luz);
        d.linha(w / 2, 8, w / 2, h - 10, m.contorno, 2);
        d.rect(w / 2 - 5, h / 2 - 4, 3, 6, 0xcfd6dc).borda(w / 2 - 5, h / 2 - 4, 3, 6, 0x20262e);
        d.rect(w / 2 + 2, h / 2 - 4, 3, 6, 0xcfd6dc).borda(w / 2 + 2, h / 2 - 4, 3, 6, 0x20262e);
        d.rect(w / 2 - 2, h / 2 + 3, 4, 5, 0xc9a227).borda(w / 2 - 2, h / 2 + 3, 4, 5, 0x4a3a08);              // cadeado
        d.rect(7, 12, w - 14, 5, 0xefe9d2, 0.9).rect(9, 14, w - 18, 1, 0x7a6e4a);
        d.poli([[w - 12, h - 18], [w - 8, h - 18], [w - 10, h - 13]], AMARELO);
    },
    // Mesa de acampamento (2×1): tampo de tábuas sobre cavaletes, caneca, mapa e lanterna.
    'bunker:table'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.rect(6, h - 7, 4, 5, m.fundo).rect(w - 10, h - 7, 4, 5, m.fundo);
        d.caixa(2, 3, w - 4, h - 7, 9, m);
        for (let i = 0; i < 4; i++) d.linha(3, 7 + i * 3, w - 3, 7 + i * 3, m.fundo);
        d.rect(6, 6, 18, 11, 0xe2d6a8).borda(6, 6, 18, 11, 0x6a5a2a); d.linha(8, 12, 16, 9, 0x8a6a3a).linha(16, 9, 22, 14, 0x8a6a3a);   // mapa
        d.disco(34, 10, 3.4, 0xcfd6dc).anel(34, 10, 3.4, 0x20262e).disco(34, 10, 2, 0x3b2a1a);
        d.rect(42, 7, 12, 5, 0x55636e).borda(42, 7, 12, 5, 0x20262e).rect(52, 8, 3, 3, 0xfff2a8);                // lanterna
    },
    // Pilha de entulho (2×1): blocos de concreto, vergalhão e tábuas.
    'bunker:debris'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.poli([[3, h - 6], [8, 12], [24, 6], [42, 9], [w - 4, 16], [w - 5, h - 6]], m.sombra, m.contorno);
        for (const [x, y, ww, hh, c] of [[8, 14, 14, 10, 0x8a8a84], [24, 9, 16, 11, 0x9a9a92], [40, 15, 16, 10, 0x7a7a74], [14, 20, 12, 8, 0x6e6e68]]) d.rect(x, y, ww, hh, c).borda(x, y, ww, hh, 0x2a2a28).rect(x + 1, y + 1, ww - 2, 2, tom(c, 0.2));
        d.linha(6, 12, 30, 22, 0x6a3a1e, 2).linha(30, 22, 52, 14, 0x55636e, 2);
        d.rect(44, 5, 10, 3, 0x8a5a2b);
    },
    // Tenda rasgada (2×2): lona em duas águas vista de cima, cumeeira, tirantes e rasgos.
    'bunker:tent'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 7, w - 4, 8);
        d.poli([[4, h - 8], [w / 2, 6], [w / 2, h - 12], [w - 4, h - 8]], m.sombra, m.contorno);
        d.poli([[4, h - 8], [w / 2, 6], [w / 2, h - 12]], m.base, m.contorno);
        d.poli([[w / 2, 6], [w - 4, h - 8], [w / 2, h - 12]], m.sombra, m.contorno);
        d.linha(w / 2, 6, w / 2, h - 12, m.luz, 2);
        d.poli([[16, 36], [26, 34], [24, 44], [18, 42]], 0x120d0a);                                           // rasgo
        d.poli([[w - 22, 30], [w - 12, 36], [w - 20, 40]], 0x120d0a);
        d.linha(4, h - 8, 0, h - 3, m.fundo).linha(w - 4, h - 8, w, h - 3, m.fundo);                          // tirantes
        d.disco(2, h - 3, 1.5, 0x8a97a3).disco(w - 2, h - 3, 1.5, 0x8a97a3);
    },
    // Fogueira apagada: anel de pedras, lenha carbonizada e cinzas.
    'bunker:campfire'(d, w, h, cor) {
        d.sombra(4, h - 6, w - 6, 6);
        d.disco(16, 17, 12, 0x2a2420).disco(16, 17, 9, 0x4a4540);                                            // cinzas
        for (let i = 0; i < 9; i++) { const a = i * 2 * Math.PI / 9; d.disco(16 + Math.cos(a) * 11, 17 + Math.sin(a) * 9.5, 3, i % 2 ? 0x8a8a84 : 0x6e6e68).anel(16 + Math.cos(a) * 11, 17 + Math.sin(a) * 9.5, 3, 0x2a2a28); }
        d.linha(9, 21, 23, 13, 0x1b1410, 3).linha(10, 13, 22, 22, 0x2b1d14, 3);
        d.rect(14, 15, 3, 2, 0xc2491f, 0.8);                                                                 // brasa
    },
    // Tronco caído (2×1): casca com veios, anéis na ponta e galhos.
    'bunker:log'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 7, w - 4, 7);
        d.caixa(4, 7, w - 12, 17, 5, m);
        for (let i = 0; i < 5; i++) d.linha(8 + i * 11, 10, 14 + i * 11, 20, m.fundo);
        d.rect(6, 9, w - 16, 2, m.luz);
        d.disco(w - 9, 15, 8, m.sombra).anel(w - 9, 15, 8, m.contorno).disco(w - 9, 15, 6, tom(0xc9a46a, 0)).anel(w - 9, 15, 4, 0x8a6a3a).anel(w - 9, 15, 2, 0x8a6a3a);
        d.linha(20, 8, 26, 2, m.fundo, 2).linha(36, 7, 40, 1, m.fundo, 2);
    },
    // Rocha grande: bloco facetado cinza com musgo.
    'bunker:rock'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 7, w - 4, 7);
        d.poli([[4, h - 8], [3, 15], [10, 6], [22, 4], [29, 12], [28, h - 8]], m.base, m.contorno);
        d.poli([[10, 6], [22, 4], [29, 12], [18, 14]], m.luz, m.contorno);
        d.poli([[4, h - 8], [3, 15], [14, 18], [12, h - 8]], m.sombra);
        d.linha(18, 14, 22, h - 8, m.fundo);
        d.rect(8, 9, 6, 3, 0x5a7a3a, 0.8).rect(20, 7, 4, 2, 0x5a7a3a, 0.8);
    },
    // Mochila abandonada: lona verde, abas, fivelas e bolso lateral.
    'bunker:backpack'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 6, w - 6, 6);
        d.caixa(6, 4, w - 12, h - 8, 12, m);
        d.rect(8, 6, w - 16, 9, m.luz).borda(8, 6, w - 16, 9, m.contorno);                                    // aba
        d.rect(13, 12, 6, 3, 0xc9a227).borda(13, 12, 6, 3, 0x4a3a08);                                          // fivela
        d.rect(4, 14, 4, 10, m.sombra).borda(4, 14, 4, 10, m.contorno).rect(w - 8, 14, 4, 10, m.sombra).borda(w - 8, 14, 4, 10, m.contorno);   // bolsos
        d.linha(10, 4, 8, 0, 0x20262e, 2).linha(w - 10, 4, w - 8, 0, 0x20262e, 2);
        d.rect(10, h - 11, 12, 2, m.fundo);
    },
    // Rolo de corda: espirais de fibra, ponta solta.
    'bunker:rope'(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 6, w - 6, 6);
        for (let r = 11; r >= 3; r -= 2.5) { d.disco(16, 15, r, r % 5 < 2.5 ? m.sombra : m.base); d.anel(16, 15, r, m.contorno); }
        d.disco(16, 15, 2, m.fundo);
        d.disco(12, 11, 3, m.luz, 0.6);
        d.linha(26, 20, 30, 27, m.base, 2).linha(30, 27, 24, 29, m.sombra, 2);
    },
};
