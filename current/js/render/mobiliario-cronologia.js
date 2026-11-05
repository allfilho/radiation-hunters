// Equipamentos do laboratório de cronologia (cinco laboratórios), no mesmo pincel RPG do jogo.
// Desenhos esquemáticos: não representam o aparelho de uma marca nem comandos reais, e não mostram valores de temperatura, tempo ou dose.
import { pincel, paleta, tom, T } from './estilo-rpg.js';

export const MOVEIS_CRONOLOGIA = [
    ['polisher', 1, 1, 'Politriz (polimento de amostras)', 'Polishing wheel (sample polishing)', 0x8a97a3],
    ['saw', 2, 1, 'Serra de corte de amostras', 'Sample cutting saw', 0x6f8794],
    ['furnace', 2, 1, 'Forno mufla (tratamento térmico)', 'Muffle furnace (heat treatment)', 0x6b6f78],
    ['fume_hood', 2, 1, 'Capela de ataque químico', 'Chemical etching hood', 0x8fa8a2],
    ['etch_bath', 1, 1, 'Banho de ataque químico (CR-39)', 'Chemical etching bath (CR-39)', 0x7e98a3],
    ['safe', 1, 2, 'Cofre de amostras irradiadas', 'Safe for irradiated samples', 0x59616b],
    ['source_cabinet', 1, 2, 'Armário de fontes experimentais (amerício, etc.)', 'Experimental source cabinet (americium, etc.)', 0x6e7378],
    ['dosimeter_rack', 2, 1, 'U e Th naturais para fabricar dosímetros', 'Natural U and Th for making dosimeters', 0x9a8760],
    ['ultrasonic', 1, 1, 'Limpeza ultrassônica', 'Ultrasonic cleaner', 0x8fa3b0],
    ['loupe', 1, 1, 'Lupa de bancada', 'Bench magnifier', 0x6c7a86],
    ['vacuum_pump', 1, 1, 'Bomba mecânica de vácuo', 'Mechanical vacuum pump', 0x58636e],
    ['tube_furnace', 2, 1, 'Forno tubular', 'Tube furnace', 0x6b6f78],
    ['balance', 1, 1, 'Balança de precisão', 'Precision balance', 0xcfd6dc],
    ['image_station', 2, 1, 'Microscópio óptico com análise de imagem e contagem manual', 'Optical microscope with image analysis and manual counting', 0x546e7a],
    ['elec_bench', 2, 1, 'Bancada de eletrônica básica', 'Basic electronics bench', 0x6a8a74],
    ['oscilloscope', 1, 1, 'Osciloscópio', 'Oscilloscope', 0x5f6c78],
    ['soldering_station', 1, 1, 'Estação de solda com exaustão', 'Soldering station with fume extraction', 0x6e6a78],
    ['power_supply', 1, 1, 'Fonte de bancada', 'Bench power supply', 0x66727c],
    ['microcontroller_kit', 1, 1, 'Placas Arduino e Raspberry Pi', 'Arduino and Raspberry Pi boards', 0x5e8a6c],
    ['parts_cabinet', 1, 1, 'Gaveteiro de componentes', 'Component drawers', 0x8a7f66],
    ['robot_arm_bath', 2, 1, 'Banho automatizado com braço robótico', 'Automated bath with robotic arm', 0x7a8c98],
    ['printer3d', 1, 1, 'Impressora 3D', '3D printer', 0x5c6a76],
    ['filament_shelf', 2, 1, 'Filamentos e peças impressas', 'Filaments and printed parts', 0x8a7a64],
    ['locker', 1, 1, 'Armário de EPI (jalecos, óculos, luvas)', 'PPE locker (lab coats, goggles, gloves)', 0x5f7f9c],
    ['eyewash', 1, 1, 'Lava-olhos de emergência', 'Emergency eyewash', 0x6fae8f],
    ['safety_shower', 1, 1, 'Chuveiro de emergência', 'Emergency shower', 0x6fae8f],
    ['extinguisher', 1, 1, 'Extintor de incêndio', 'Fire extinguisher', 0xb04a42],
    ['first_aid', 1, 1, 'Armário de primeiros socorros', 'First-aid cabinet', 0xd8e2e0],
].map(([id, width, height, pt, en, color]) => ({ id, width, height, pt, en, name: en, color }));

const trifolio = (d, cx, cy, r, cor, fundo) => {
    d.disco(cx, cy, r, fundo).anel(cx, cy, r, cor);
    for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 3; d.poli([[cx, cy], [cx + Math.cos(a - 0.5) * r * 0.85, cy + Math.sin(a - 0.5) * r * 0.85], [cx + Math.cos(a + 0.5) * r * 0.85, cy + Math.sin(a + 0.5) * r * 0.85]], cor); }
    d.disco(cx, cy, r * 0.2, fundo);
};

const DESENHOS = {
    // Politriz: caixa com prato giratório (anéis), tubo de água e tampa articulada.
    polisher(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(3, 4, w - 6, h - 8, 9, m);
        d.disco(16, 14, 11, m.fundo).disco(16, 14, 10, 0xcfd6dc).anel(16, 14, 10, m.contorno);
        d.anel(16, 14, 7, 0x9aa7b2).anel(16, 14, 4, 0x9aa7b2).disco(16, 14, 1.8, 0x5d6b78);
        d.rect(21, 8, 3, 3, 0x2b2f36);                                                      // amostra no suporte
        d.linha(6, 6, 12, 12, 0x4f8be0, 2);                                                // água
        d.rect(5, h - 11, 6, 3, 0xe0584f);
    },
    // Serra de corte: lâmina circular sob proteção, grampo da amostra e bandeja de refrigeração.
    saw(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 3, w - 4, h - 7, 11, m);
        d.rect(5, 6, w - 10, 10, 0x2c353c).borda(5, 6, w - 10, 10, 0x0d1317);
        d.disco(22, 11, 8, 0xdfe6ea).anel(22, 11, 8, 0x20262e).disco(22, 11, 2, 0x20262e);   // lâmina
        d.poli([[14, 11], [22, 3], [30, 11], [22, 8]], 0xaab4bd, 0x20262e, 0.8);              // proteção
        d.rect(38, 8, 14, 5, 0xc9a227).borda(38, 8, 14, 5, 0x4a3a08);                        // grampo
        d.rect(w - 16, 6, 8, 5, 0x20262e).rect(w - 14, 7, 4, 3, 0x5fe38a);
        d.rect(6, h - 13, 20, 3, 0x7fb5d6);
    },
    // Forno: dois módulos de aquecimento com porta, vigia incandescente e indicadores de estado.
    furnace(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 3, w - 4, h - 7, 14, m);
        for (const x of [5, 36]) {
            d.rect(x, 6, 24, 11, tom(m.base, -0.25)).borda(x, 6, 24, 11, m.contorno);
            d.rect(x + 3, 9, 18, 5, 0xe8731f).rect(x + 3, 9, 18, 2, 0xffc15a);            // vigia incandescente
            d.rect(x + 2, h - 12, 8, 4, 0x10181d).rect(x + 3, h - 11, 6, 2, 0xe0584f);    // painel (sem números)
            d.disco(x + 16, h - 10, 2, 0xcfd6dc).disco(x + 21, h - 10, 2, 0xcfd6dc);
        }
        d.rect(30, 4, 4, 6, 0x20262e);
    },
    // Capela: estrutura com vidro corrediço, frascos de reagente e saída de exaustão.
    fume_hood(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 2, w - 4, h - 5, 10, m);
        d.rect(5, 5, w - 10, h - 16, 0x1d3a3a);
        d.rect(5, 5, w - 10, h - 16, 0x9fe0d6, 0.35);                                       // vidro
        d.rect(7, 6, 6, 3, 0xffffff, 0.4);
        const cores = [0xe8c14a, 0x58c777, 0xe0584f, 0x4f8be0];
        for (let i = 0; i < 4; i++) { const x = 8 + i * 12; d.rect(x, 10, 6, 9, cores[i]).borda(x, 10, 6, 9, m.contorno).rect(x + 1, 8, 4, 2, 0xe9edf0); }
        d.rect(5, h - 14, w - 10, 2, m.luz);
        d.rect(w - 14, h - 11, 8, 4, 0x20262e).rect(w - 12, h - 10, 4, 2, 0x5fe38a);
    },
    // Banho termostatizado: tanque com tampa, suporte com pastilhas e indicador.
    etch_bath(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 4, w - 6, h - 8, 9, m);
        d.rect(6, 7, w - 12, 11, 0x4f8fb0).borda(6, 7, w - 12, 11, m.contorno);              // água
        d.rect(8, 8, w - 16, 3, 0x9fd3f2);
        for (let i = 0; i < 3; i++) d.rect(10 + i * 5, 10, 3, 6, 0xeef3f6).borda(10 + i * 5, 10, 3, 6, 0x5d6b78);   // pastilhas de plástico
        d.rect(6, h - 11, 8, 4, 0x10181d).rect(7, h - 10, 5, 2, 0xe8c14a);
        d.disco(w - 9, h - 9, 2, 0xcfd6dc);
    },
    // Cofre: porta de aço, disco giratório, maçaneta e etiqueta de radiação.
    safe(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 5, 6, m);
        d.rect(6, 5, w - 12, h - 14, m.sombra).borda(6, 5, w - 12, h - 14, m.contorno);
        d.disco(16, 24, 7, 0xaab4bd).anel(16, 24, 7, m.contorno, 2);
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d.rect(16 + Math.cos(a) * 5 - 0.5, 24 + Math.sin(a) * 5 - 0.5, 1, 1, 0x20262e); }
        d.linha(16, 24, 19, 21, 0x20262e, 2);
        d.rect(w - 11, 36, 3, 8, 0xd9dde2).borda(w - 11, 36, 3, 8, 0x20262e);
        trifolio(d, 16, 12, 4.4, 0x1b1b1b, 0xe8c14a);
        d.rect(5, h - 11, 3, 4, 0x20262e).rect(w - 8, h - 11, 3, 4, 0x20262e);
    },
    // Armário de fontes: chumbo cinza escuro, duas portas, trifólio e cadeado.
    source_cabinet(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 5, 6, m);
        d.rect(5, 4, w - 10, 3, m.luz);
        d.linha(w / 2, 9, w / 2, h - 10, m.contorno, 2);
        trifolio(d, w / 2, 20, 5, 0x1b1b1b, 0xe8c14a);
        d.rect(w / 2 - 5, 33, 3, 6, 0xcfd6dc).borda(w / 2 - 5, 33, 3, 6, 0x20262e).rect(w / 2 + 2, 33, 3, 6, 0xcfd6dc).borda(w / 2 + 2, 33, 3, 6, 0x20262e);
        d.rect(w / 2 - 2, 41, 4, 5, 0xc9a227).borda(w / 2 - 2, 41, 4, 5, 0x4a3a08);
        d.rect(8, 50, w - 16, 5, 0xefe9d2, 0.9).rect(10, 52, w - 20, 1, 0x7a6e4a);
    },
    // Estante de dosímetros: bandejas com pastilhas de plástico organizadas em fileiras e etiquetas U / Th.
    dosimeter_rack(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 5, 8, m);
        d.rect(4, 5, w - 8, 9, tom(m.fundo, -0.05));
        for (let k = 0; k < 7; k++) { const x = 6 + k * 8; d.rect(x, 7, 6, 6, 0xeef3f6).borda(x, 7, 6, 6, m.contorno); }
        d.rect(3, 15, w - 6, 2, m.luz);
        for (let k = 0; k < 2; k++) { const x = 8 + k * 26; d.rect(x, 18, 22, 6, 0xefe9d2).borda(x, 18, 22, 6, 0x5b5646); d.rect(x + 2, 20, k ? 7 : 4, 2, 0x35566e).rect(x + 13, 20, 6, 2, 0x8a5a3a); }
    },
    // Cuba de limpeza ultrassônica: tanque com tampa, visor de tempo (sem números) e ondas.
    ultrasonic(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 4, w - 6, h - 8, 9, m);
        d.rect(6, 7, w - 12, 10, 0x9fd3f2).borda(6, 7, w - 12, 10, m.contorno);
        for (let i = 0; i < 3; i++) d.linha(9 + i * 6, 15, 12 + i * 6, 9, 0xffffff, 1);
        d.rect(6, h - 11, 9, 4, 0x10181d).rect(7, h - 10, 5, 2, 0x5fe38a); d.disco(w - 9, h - 9, 2, 0xe0584f);
    },
    // Lupa de bancada: braço articulado com lente redonda sobre a amostra.
    loupe(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 6, w - 6, 6);
        d.caixa(5, 15, w - 10, 11, 5, m);
        d.rect(8, 18, 8, 5, 0xefe9d2).borda(8, 18, 8, 5, 0x5b5646);
        d.linha(22, 17, 20, 7, 0x20262e, 2);
        d.disco(14, 9, 7, 0x20262e).disco(14, 9, 5.5, 0xcfeaf2, 0.85).anel(14, 9, 5.5, 0xaab4bd).rect(11, 7, 3, 2, 0xffffff, 0.7);
    },
    // Bomba mecânica de vácuo: corpo com motor, mangueira e manômetro.
    vacuum_pump(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 6, w - 6, h - 10, 9, m);
        d.rect(6, 8, 12, 9, m.luz).borda(6, 8, 12, 9, m.contorno);
        d.disco(23, 12, 4.5, 0xf1f4f2).anel(23, 12, 4.5, 0x20262e).linha(23, 12, 25, 9, 0xe0584f);
        d.linha(8, 8, 4, 2, 0x20262e, 3);
        d.rect(6, h - 11, 20, 2, m.fundo);
    },
    // Forno tubular: tubo horizontal de cerâmica atravessando a carcaça, com extremidades e suporte.
    tube_furnace(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(6, 5, w - 12, h - 10, 12, m);
        d.rect(1, 11, w - 2, 6, 0xdfe6ea).borda(1, 11, w - 2, 6, 0x5d6b78);                     // tubo
        d.rect(14, 8, w - 28, 12, tom(m.base, -0.2)).rect(14, 11, w - 28, 6, 0xe8731f, 0.55);
        d.rect(8, h - 11, 8, 4, 0x10181d).rect(9, h - 10, 5, 2, 0xe0584f);
        d.rect(w - 12, 3, 4, 4, 0x20262e);
    },
    // Balança de precisão: base, prato redondo, protetor de vento transparente e visor.
    balance(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(4, h - 5, w - 6, 5);
        d.caixa(4, 12, w - 8, h - 16, 6, m);
        d.rect(7, 4, w - 14, 11, 0xcfeaf2, 0.5).borda(7, 4, w - 14, 11, 0x8aa5b2);
        d.disco(16, 11, 4, 0xaab4bd).anel(16, 11, 4, 0x20262e);
        d.rect(8, h - 12, 10, 4, 0x10181d).rect(9, h - 11, 6, 2, 0x5fe38a);
    },
    // Estação de microscopia: microscópio, monitor com a imagem (marcas), contador manual e bancada.
    image_station(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 6, w - 4, h - 10, 8, m);
        d.rect(5, 2, 22, 15, 0x20262e).borda(5, 2, 22, 15, 0x05090b);                           // monitor
        d.rect(7, 4, 18, 11, 0x1d3f4e);
        for (const [x, y] of [[10, 7], [14, 11], [18, 6], [21, 10], [12, 9], [17, 13], [22, 7]]) d.rect(x, y, 2, 2, 0xe9f2c9);   // marcas contadas
        d.rect(14, 17, 4, 2, 0x20262e);
        d.rect(32, 6, 6, 10, m.luz).borda(32, 6, 6, 10, m.contorno);                             // microscópio
        d.rect(30, 3, 4, 5, 0x20262e).rect(34, 15, 9, 3, 0xcfd6dc).borda(34, 15, 9, 3, 0x20262e);
        d.rect(46, 18, 12, 6, 0xdfe6ea).borda(46, 18, 12, 6, 0x3a4048).rect(48, 19, 8, 2, 0x10181d).disco(w - 4, 21, 1.4, 0xe0584f);   // contador manual
        d.rect(8, 21, 22, 4, 0xdde2e6).borda(8, 21, 22, 4, 0x3a4048);                             // teclado
    },

    // Bancada de eletrônica: protoboard, multímetro (sem valores), cabos coloridos e organizador de componentes.
    elec_bench(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 6, w - 4, h - 10, 8, m);
        d.rect(6, 8, 22, 10, 0xe9eee6).borda(6, 8, 22, 10, 0x3a4048);
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) d.rect(8 + i * 3.4, 10 + j * 4, 1.4, 1.4, 0x5d6b78);
        d.rect(10, 12, 5, 2, 0x20262e).rect(18, 10, 3, 3, 0xe0584f);
        d.rect(34, 6, 11, 14, 0xe8c14a).borda(34, 6, 11, 14, 0x4a3a08); d.rect(36, 8, 7, 4, 0x9fb7a6); d.disco(40, 16, 2, 0x20262e);
        d.linha(30, 20, 34, 12, 0xe0584f, 1.5).linha(31, 20, 36, 22, 0x20262e, 1.5);
        for (let i = 0; i < 4; i++) d.rect(50 + (i % 2) * 6, 8 + Math.floor(i / 2) * 6, 5, 5, [0x58c777, 0x4f8be0, 0xe8c14a, 0xe0584f][i]).borda(50 + (i % 2) * 6, 8 + Math.floor(i / 2) * 6, 5, 5, 0x20262e);
    },
    // Osciloscópio: tela com onda (sem escala) e botões.
    oscilloscope(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 5, w - 6, h - 9, 7, m);
        d.rect(6, 8, 15, 12, 0x0f2a24).borda(6, 8, 15, 12, 0x05090b);
        d.linha(7, 14, 10, 10, 0x6bff9a, 1).linha(10, 10, 13, 18, 0x6bff9a, 1).linha(13, 18, 16, 10, 0x6bff9a, 1).linha(16, 10, 20, 14, 0x6bff9a, 1);
        d.disco(25, 11, 2.2, 0xcfd6dc).disco(25, 18, 2.2, 0xcfd6dc).rect(6, 22, 20, 2, m.luz);
    },
    // Estação de solda: base com suporte do ferro, esponja, ferro e braço de exaustão.
    soldering_station(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 10, w - 6, h - 14, 6, m);
        d.rect(6, 13, 10, 6, 0x20262e).rect(7, 14, 8, 2, 0xe0584f);
        d.disco(23, 17, 3, 0xe8c14a).anel(23, 17, 3, 0x20262e);
        d.linha(10, 12, 24, 5, 0x20262e, 2.5).disco(24, 5, 1.6, 0xe0584f);
        d.rect(4, 3, 8, 3, 0x9aa7b2).borda(4, 3, 8, 3, 0x3a4048); d.linha(8, 6, 8, 11, 0x9aa7b2, 2);
    },
    // Fonte de bancada: caixa com visores apagados (sem números), bornes e botões.
    power_supply(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 6, w - 6, h - 10, 7, m);
        d.rect(6, 9, 20, 6, 0x10181d); d.rect(8, 11, 4, 2, 0x5fe38a); d.rect(16, 11, 4, 2, 0x5fe38a);
        d.disco(10, 21, 2, 0xcfd6dc).disco(18, 21, 2, 0xcfd6dc);
        d.disco(24, 21, 1.6, 0xe0584f).disco(28, 21, 1.6, 0x20262e);
    },
    // Kit de microcontroladores: duas placas pequenas sobre a bancada, com cabos.
    microcontroller_kit(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 9, w - 6, h - 13, 6, tom(m.base, -0.3));
        d.rect(6, 11, 13, 9, 0x1f7a6a).borda(6, 11, 13, 9, 0x0d3a33); d.rect(8, 12, 4, 3, 0xcfd6dc); d.rect(14, 14, 3, 4, 0x20262e);
        d.rect(21, 12, 8, 8, 0x2c5f3a).borda(21, 12, 8, 8, 0x0d3a33); d.rect(23, 14, 4, 4, 0x20262e);
        d.linha(12, 20, 8, 24, 0xe8c14a, 1.5).linha(24, 20, 27, 25, 0x4f8be0, 1.5);
    },
    // Gaveteiro de componentes: pequenas gavetas com etiquetas.
    parts_cabinet(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 3, w - 6, h - 7, 6, m);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
            const x = 6 + j * 8, y = 6 + i * 7; d.rect(x, y, 7, 6, tom(m.base, 0.1)).borda(x, y, 7, 6, m.contorno); d.rect(x + 2, y + 2, 3, 1.5, 0xefe9d2);
        }
    },
    // Banho automatizado com braço robótico: tanque, braço articulado com garra e painel.
    robot_arm_bath(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 6, w - 4, 7);
        d.caixa(2, 8, w - 4, h - 12, 8, m);
        d.rect(5, 12, 26, 11, 0x4f8fb0).borda(5, 12, 26, 11, m.contorno); d.rect(7, 13, 22, 3, 0x9fd3f2);
        d.rect(36, 10, 8, 14, 0x20262e).rect(37, 12, 6, 3, 0x5fe38a);
        d.disco(50, 20, 5, 0xcfd6dc).anel(50, 20, 5, 0x20262e);
        d.linha(50, 20, 42, 9, 0x9aa7b2, 3).linha(42, 9, 24, 8, 0x9aa7b2, 3).disco(42, 9, 2, 0x20262e);
        d.linha(24, 8, 22, 14, 0x20262e, 2).linha(24, 8, 26, 14, 0x20262e, 2);
    },
    // Impressora 3D: estrutura com cabeçote, mesa e peça em construção.
    printer3d(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.rect(5, 4, 3, 20, m.contorno).rect(24, 4, 3, 20, m.contorno).rect(5, 3, 22, 3, m.contorno);
        d.rect(8, 6, 16, 14, 0x1d2a33, 0.55);
        d.rect(10, 8, 12, 3, 0x9aa7b2).rect(14, 10, 4, 4, 0xe08a3f);
        d.rect(8, 21, 16, 3, 0x20262e);
        d.rect(12, 16, 8, 5, 0x58c777).borda(12, 16, 8, 5, 0x20262e);
    },
    // Estante de filamentos e peças impressas: carretéis coloridos e algumas peças.
    filament_shelf(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 5, 8, m);
        const cores = [0xe0584f, 0x4f8be0, 0xe8c14a, 0x58c777, 0xffffff];
        for (let i = 0; i < 5; i++) { d.disco(10 + i * 11, 10, 5, cores[i]).anel(10 + i * 11, 10, 5, 0x20262e).disco(10 + i * 11, 10, 1.6, 0x20262e); }
        d.rect(4, 18, w - 8, 2, m.luz);
        d.rect(8, 21, 7, 5, 0x58c777).borda(8, 21, 7, 5, 0x20262e).rect(20, 22, 6, 4, 0xe08a3f).borda(20, 22, 6, 4, 0x20262e);
    },
    // Armário de EPI: portas com ventilação, jaleco e óculos pendurados.
    locker(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(4, 2, w - 8, h - 5, 6, m);
        d.rect(8, 5, w - 16, 4, tom(m.base, -0.3));
        for (let i = 0; i < 3; i++) d.rect(10, 6 + i * 1.2, w - 20, 0.6, m.luz);
        d.linha(w / 2, 10, w / 2, h - 8, m.contorno, 1.5);
        d.rect(w / 2 - 4, 16, 2, 5, 0xd9dde2).rect(w / 2 + 2, 16, 2, 5, 0xd9dde2);
        d.rect(9, 22, 6, 3, 0xcfeaf2, 0.8).anel(10.5, 23.5, 1.4, 0x20262e);
    },
    // Lava-olhos: bacia com dois jatos e placa de sinalização verde.
    eyewash(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.rect(13, 3, 6, 14, 0x2a6b4a); d.rect(14, 5, 4, 3, 0xffffff);
        d.caixa(4, 17, w - 8, 8, 5, m);
        d.disco(11, 20, 3, 0xe9eee6).disco(21, 20, 3, 0xe9eee6);
        d.linha(11, 18, 13, 12, 0x9fd3f2, 1.5).linha(21, 18, 19, 12, 0x9fd3f2, 1.5);
        d.rect(14, 22, 4, 2, 0xe8c14a);
    },
    // Chuveiro de emergência: tubo com cabeça e alavanca triangular.
    safety_shower(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.rect(15, 4, 3, h - 10, 0x9aa7b2).borda(15, 4, 3, h - 10, 0x3a4048);
        d.poli([[8, 5], [26, 5], [24, 9], [10, 9]], 0xcfd6dc, 0x3a4048, 0.8);
        for (let i = 0; i < 4; i++) d.linha(11 + i * 4, 10, 11 + i * 4, 14, 0x9fd3f2, 1);
        d.linha(18, 16, 28, 20, 0xe0584f, 1.5).disco(28, 21, 2, 0xe0584f);
        d.rect(10, h - 9, 12, 4, 0x2a6b4a).rect(14, h - 8, 4, 2, 0xffffff);
    },
    // Extintor: cilindro vermelho com mangueira, manômetro e suporte de parede.
    extinguisher(d, w, h, cor) {
        d.sombra(5, h - 5, w - 8, 5);
        d.rect(12, 8, 9, 18, 0xc0392b).borda(12, 8, 9, 18, 0x4a1a14);
        d.rect(14, 5, 5, 4, 0x20262e).rect(13, 3, 7, 3, 0xcfd6dc);
        d.linha(20, 5, 26, 12, 0x20262e, 2).disco(16, 12, 2, 0xf1f4f2).anel(16, 12, 2, 0x20262e);
        d.rect(13, 18, 7, 4, 0xefe9d2);
        d.rect(10, 14, 13, 1.6, 0x4a4a4a);
    },
    // Armário de primeiros socorros: caixa branca com cruz.
    first_aid(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(4, 5, w - 8, h - 10, 6, m);
        d.rect(13, 9, 6, 14, 0x2a8a5a).rect(9, 13, 14, 6, 0x2a8a5a);
        d.rect(14, 11, 4, 10, 0xffffff).rect(11, 14, 10, 4, 0xffffff);
        d.rect(14, 5, 4, 3, 0x9aa7b2);
    },
};

export function desenharMovelCronologia(scene, f) {
    const fn = DESENHOS[f.type.id];
    if (!fn || !MOVEIS_CRONOLOGIA.some((m) => m.id === f.type.id)) return null;
    const g = scene.add.graphics().setDepth(2);
    fn(pincel(g, f.x * T, f.y * T), f.type.width * T, f.type.height * T, f.type.color);
    return g;
}
