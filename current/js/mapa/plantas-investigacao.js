// ============================================
// PLANTAS DAS INVESTIGAÇÕES: cada episódio tem o seu próprio edifício, desenhado à mão.
// A planta só descreve o MAPA (paredes, portas, pisos por sala, janelas/avisos e móveis). Movimento, colisão, câmera e
// controles continuam sendo os da GameScene. Tiles: 0 piso, 1 parede, 2 móvel.
//
//   cols/rows ..... tamanho do mapa em tiles
//   areas ......... retângulos de piso (o resto é parede, sempre com 1 tile de espessura entre áreas)
//   externo/blocos/internas/cercas ... campus: terreno aberto (zonas com `piso`), edifícios e muro/cerca (ver terreno.js)
//   portas ........ retângulos abertos nas paredes entre áreas (largura/altura de 2 tiles = passa o robô e o dedo)
//   zonas ......... tintas de piso por ambiente; vent = 0 pouca, 1 média, 2 muita ventilação (só visual)
//   decor ......... itens na face das paredes (janelas abertas/fechadas, quadros, cartazes, avisos)
//   moveis ........ [id, x, y]
// ============================================
const R = (x, y, w, h) => ({ x, y, w, h });
const J = (x, y, estado = 'fechada') => ({ tipo: 'janela', x, y, estado });

export function desenharPlanta(gen, p) {
    gen.map = Array.from({ length: gen.rows }, () => Array.from({ length: gen.cols }, () => 1));
    const preencher = (lista, v) => { for (const a of lista) for (let dy = 0; dy < a.h; dy++) for (let dx = 0; dx < a.w; dx++) gen.map[a.y + dy][a.x + dx] = v; };
    // Plantas com áreas externas (campus): `areas` = pátio/terreno, `blocos` = edifícios (paredes sólidas dentro do terreno),
    // `internas` = salas escavadas nos blocos. Plantas só de interior não usam blocos nem internas.
    preencher(p.areas, 0); preencher(p.mar || [], 1); preencher(p.cercas || [], 1); preencher(p.blocos || [], 1); preencher([...(p.internas || []), ...p.portas], 0);
    gen.playerStartFixo = { ...p.inicio };
    gen.specialZones = [];
}

// ------------------------------------------------------------------ ESCOLA (radônio) · CAMPUS
// Terreno aberto com cinco construções separadas, pátio, estacionamento, horta e quadra:
//   Prédio antigo (noroeste): secretaria, Sala A (janelas fechadas), Sala B (janelas abertas) e corredor
//   Bloco administrativo (nordeste): sala dos professores e conselho escolar
//   Biblioteca e Pavilhão de análise (sul), horta (sul, centro) e quadra (sudeste)
export const PLANTA_ESCOLA = {
    cols: 54, rows: 44, inicio: { x: 5, y: 19 }, externo: true,
    paleta: { piso: 0xd8c9a0, piso2: 0xcdbd92, junta: 0x9a8a62, parede: 0xece4c8, faixa: 0x4f9a6b, base: 0xa09878 },
    areas: [R(1, 1, 52, 42)],
    blocos: [R(3, 2, 29, 14), R(34, 2, 17, 14), R(3, 30, 13, 11), R(18, 30, 14, 11)],
    internas: [R(4, 3, 7, 8), R(12, 3, 9, 8), R(22, 3, 9, 8), R(4, 12, 27, 3), R(35, 3, 6, 12), R(42, 3, 8, 12), R(4, 31, 11, 9), R(19, 31, 12, 9)],
    portas: [R(6, 11, 2, 1), R(15, 11, 2, 1), R(25, 11, 2, 1), R(16, 15, 2, 1), R(37, 15, 2, 1), R(45, 15, 2, 1), R(9, 30, 2, 1), R(24, 30, 2, 1)],
    cercas: [R(0, 0, 54, 1), R(0, 43, 54, 1), R(0, 0, 1, 44), R(53, 0, 1, 44)],
    zonas: [
        // salas (ventilação: 0 pouca, 1 média, 2 muita; só visual)
        { ...R(4, 3, 7, 8), tint: '#f2c14e', a: 0.10, vent: 1 },
        { ...R(12, 3, 9, 8), tint: '#8fa3b8', a: 0.16, vent: 0 },     // Sala A: janelas fechadas, ar parado
        { ...R(22, 3, 9, 8), tint: '#9fd6a0', a: 0.14, vent: 2 },     // Sala B: janelas abertas e exaustor
        { ...R(4, 12, 27, 3), tint: '#b9b9a8', a: 0.14, vent: 1 },
        { ...R(35, 3, 6, 12), tint: '#d9a066', a: 0.10, vent: 2 },
        { ...R(42, 3, 8, 12), tint: '#b79ad9', a: 0.09, vent: 0 },
        { ...R(4, 31, 11, 9), tint: '#b88a5a', a: 0.12, vent: 0 },
        { ...R(19, 31, 12, 9), tint: '#7fb6d9', a: 0.10, vent: 1 },
        // áreas externas: o tipo de piso (`piso`) escolhe a pintura; a tinta só ajusta o tom
        { ...R(42, 27, 9, 14), piso: 'quadra', tint: '#ffffff', a: 0.0 },
        { ...R(36, 28, 4, 6), piso: 'terra', tint: '#000000', a: 0.0 },
        { ...R(35, 17, 16, 8), piso: 'asfalto', tint: '#000000', a: 0.0 },
        { ...R(4, 17, 27, 9), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(1, 18, 3, 3), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(4, 16, 27, 1), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(34, 16, 17, 1), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(9, 26, 2, 4), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(24, 26, 2, 4), piso: 'calcada', tint: '#ffffff', a: 0.0 },
    ],
    decor: [
        J(5, 2, 'entreaberta'), J(9, 2, 'entreaberta'),
        J(13, 2), J(14, 2), J(19, 2), J(20, 2), { tipo: 'quadro', x: 16, y: 2, w: 3 },
        J(23, 2), J(24, 2), J(29, 2), J(30, 2), { tipo: 'quadro', x: 26, y: 2, w: 3 },
        J(36, 2, 'aberta'), J(38, 2, 'aberta'), J(40, 2, 'aberta'),
        J(44, 2), J(48, 2),
        { tipo: 'placa', x: 5, y: 11, texto: 'Sec.' }, { tipo: 'placa', x: 14, y: 11, texto: 'A', estado: 'fechada' }, { tipo: 'placa', x: 24, y: 11, texto: 'B', estado: 'aberta' },
        { tipo: 'cartaz', x: 10, y: 11, simbolo: 'livro' }, { tipo: 'cartaz', x: 19, y: 11, simbolo: 'Rn' }, { tipo: 'cartaz', x: 21, y: 11, simbolo: 'Rn' }, { tipo: 'quadro', x: 28, y: 11, w: 2 },
        { tipo: 'placa', x: 36, y: 15, texto: 'Prof.' }, { tipo: 'placa', x: 44, y: 15, texto: 'Cons.' },
        { tipo: 'placa', x: 8, y: 30, texto: 'Bibl.' }, { tipo: 'placa', x: 23, y: 30, texto: 'Anál.' },
    ],
    moveis: [
        // secretaria
        ['reception_desk', 4, 3], ['school_mural', 7, 3], ['cabinet', 10, 3], ['waiting_seats', 4, 9],
        // Sala A (janelas conforme a estação; no mapa, o período frio: fechadas)
        ['school_desk', 13, 5], ['school_desk', 16, 5], ['school_desk', 13, 7], ['school_desk', 16, 7], ['radon_detector', 20, 3], ['computer', 18, 9],
        // Sala B (ventilação mecânica programada; janelas fechadas)
        ['school_desk', 23, 5], ['school_desk', 26, 5], ['school_desk', 23, 7], ['school_desk', 26, 7], ['radon_detector', 30, 3], ['work_table', 28, 9],
        // sala dos professores
        ['cabinet', 35, 3], ['cabinet', 36, 3], ['computer', 39, 3], ['work_table', 37, 7], ['work_table', 37, 10], ['bookcase', 35, 12],
        // conselho escolar
        ['school_mural', 44, 3], ['work_table', 43, 7], ['work_table', 47, 7], ['work_table', 43, 10], ['work_table', 47, 10], ['waiting_seats', 44, 13],
        // biblioteca
        ['bookcase', 4, 31], ['bookcase', 5, 31], ['bookcase', 6, 31], ['bookcase', 11, 31], ['bookcase', 12, 31], ['bookcase', 13, 31],
        ['work_table', 7, 34], ['work_table', 10, 34], ['bookcase', 4, 36], ['bookcase', 5, 36], ['bookcase', 14, 36],
        // pavilhão de análise
        ['sample_tray', 20, 31], ['sample_tray', 21, 33], ['radon_detector', 27, 31], ['computer', 20, 35], ['learning_board', 24, 36], ['work_table', 28, 35],
        // pátio, entrada e estacionamento
        ['sign', 1, 16], ['flagpole', 17, 20], ['yard_bench', 8, 19], ['yard_bench', 8, 23], ['yard_bench', 24, 19], ['yard_bench', 24, 23], ['bike_rack', 12, 17],
        ['parked_car', 36, 18], ['parked_car', 40, 18], ['parked_car', 44, 18], ['parked_car', 48, 18], ['parked_car', 37, 22], ['parked_car', 45, 22], ['bike_rack', 32, 18],
        // horta e quadra
        ['garden_bed', 36, 29], ['garden_bed', 36, 31], ['garden_bed', 36, 33], ['goal', 45, 27], ['goal', 45, 40],
        // árvores: entre os prédios, nos cantos do terreno e ao longo da rua
        ['tree', 32, 4], ['tree', 33, 8], ['tree', 32, 12], ['tree', 6, 28], ['tree', 14, 28], ['tree', 21, 28], ['tree', 29, 28], ['tree', 34, 27], ['tree', 34, 36], ['tree', 40, 38],
        ['tree', 2, 8], ['tree', 2, 13], ['tree', 2, 25], ['tree', 2, 33], ['tree', 2, 40], ['tree', 10, 41], ['tree', 17, 41], ['tree', 25, 41], ['tree', 33, 41], ['tree', 38, 41], ['tree', 52, 24], ['tree', 52, 16], ['tree', 52, 8],
    ],
};

// ------------------------------------------------------------------ ESCOLA · 1º ANDAR DO PRÉDIO ANTIGO (radônio, piso 2)
// Mapa próprio (não empilhado no campus): Sala C, Sala D e depósito sobre o corredor; a escada fica no extremo leste.
export const PLANTA_ESCOLA_ANDAR1 = {
    cols: 32, rows: 16, inicio: { x: 27, y: 11 },
    paleta: { piso: 0xd8c9a0, piso2: 0xcdbd92, junta: 0x9a8a62, parede: 0xece4c8, faixa: 0x4f9a6b, base: 0xa09878 },
    areas: [R(1, 1, 10, 8), R(12, 1, 10, 8), R(23, 1, 8, 8), R(1, 10, 30, 4)],
    portas: [R(5, 9, 2, 1), R(16, 9, 2, 1), R(26, 9, 2, 1)],
    zonas: [
        { ...R(1, 1, 10, 8), tint: '#8fa3b8', a: 0.14, vent: 1 },
        { ...R(12, 1, 10, 8), tint: '#9fd6a0', a: 0.12, vent: 2 },
        { ...R(23, 1, 8, 8), tint: '#b88a5a', a: 0.14, vent: 0 },
        { ...R(1, 10, 30, 4), tint: '#b9b9a8', a: 0.14, vent: 1 },
    ],
    decor: [
        J(3, 0, 'entreaberta'), J(8, 0, 'entreaberta'), J(14, 0, 'aberta'), J(15, 0, 'aberta'), J(19, 0, 'aberta'), J(20, 0, 'aberta'),
        { tipo: 'placa', x: 5, y: 9, texto: 'C' }, { tipo: 'placa', x: 16, y: 9, texto: 'D' }, { tipo: 'placa', x: 26, y: 9, texto: 'Dep.' },
        { tipo: 'cartaz', x: 9, y: 9, simbolo: 'Rn' },
    ],
    moveis: [
        // Sala C: o terminal dos registros
        ['school_desk', 3, 5], ['school_desk', 6, 5], ['school_desk', 3, 7], ['computer', 8, 2], ['radon_detector', 10, 2],
        // Sala D
        ['school_desk', 14, 5], ['school_desk', 17, 5], ['school_desk', 14, 7], ['school_desk', 17, 7], ['work_table', 20, 6],
        // depósito
        ['cabinet', 24, 2], ['cabinet', 25, 2], ['cabinet', 29, 2], ['work_table', 28, 6],
    ],
};

// ------------------------------------------------------------------ ESCOLA · PORÃO (radônio, piso -1)
// Mapa próprio: porão sem janelas (piso encostado no solo), depósito do porão e corredor; a escada sobe no extremo oeste do corredor.
export const PLANTA_ESCOLA_PORAO = {
    cols: 32, rows: 16, inicio: { x: 4, y: 12 },
    paleta: { piso: 0xa9a393, piso2: 0x9d9686, junta: 0x6f6a5c, parede: 0xc9c4b4, faixa: 0x5a6f7c, base: 0x7d786a },
    areas: [R(1, 1, 20, 8), R(22, 1, 9, 8), R(1, 10, 30, 4)],
    portas: [R(9, 9, 2, 1), R(25, 9, 2, 1)],
    zonas: [
        { ...R(1, 1, 20, 8), tint: '#6f86a0', a: 0.20, vent: 0 },
        { ...R(22, 1, 9, 8), tint: '#8a7a60', a: 0.18, vent: 0 },
        { ...R(1, 10, 30, 4), tint: '#9a9a8c', a: 0.16, vent: 0 },
    ],
    decor: [
        { tipo: 'placa', x: 9, y: 9, texto: 'Porão' }, { tipo: 'placa', x: 25, y: 9, texto: 'Dep.' },
        { tipo: 'cartaz', x: 12, y: 9, simbolo: 'Rn' },
    ],
    moveis: [
        // porão: o detector e a bancada de registro
        ['work_table', 5, 3], ['radon_detector', 7, 2], ['computer', 8, 2], ['cabinet', 15, 2], ['cabinet', 16, 2], ['cabinet', 18, 2],
        ['cabinet', 3, 6], ['work_table', 14, 6],
        // depósito
        ['cabinet', 23, 2], ['cabinet', 24, 2], ['cabinet', 29, 2], ['work_table', 27, 6],
    ],
};

// ------------------------------------------------------------------ ESCOLA · SÓTÃO (radônio, piso 3)
// Mapa próprio: sótão sob o telhado (madeira e telha), arquivo de caixas e corredor; a escada desce no extremo oeste do corredor.
export const PLANTA_ESCOLA_SOTAO = {
    cols: 32, rows: 16, inicio: { x: 4, y: 12 },
    paleta: { piso: 0xb48f5e, piso2: 0xa6824f, junta: 0x6e5532, parede: 0xd9c7a2, faixa: 0x8a5a3a, base: 0x8a6a45 },
    areas: [R(1, 1, 20, 8), R(22, 1, 9, 8), R(1, 10, 30, 4)],
    portas: [R(9, 9, 2, 1), R(25, 9, 2, 1)],
    zonas: [
        { ...R(1, 1, 20, 8), tint: '#c9a46a', a: 0.14, vent: 1 },
        { ...R(22, 1, 9, 8), tint: '#b88a5a', a: 0.16, vent: 1 },
        { ...R(1, 10, 30, 4), tint: '#c4b08a', a: 0.14, vent: 1 },
    ],
    decor: [
        { tipo: 'placa', x: 9, y: 9, texto: 'Sótão' }, { tipo: 'placa', x: 25, y: 9, texto: 'Arq.' },
        { tipo: 'cartaz', x: 12, y: 9, simbolo: 'Rn' },
    ],
    moveis: [
        // sótão: caixas guardadas, bancada e um detector
        ['cabinet', 3, 2], ['cabinet', 4, 2], ['cabinet', 6, 2], ['work_table', 5, 6], ['radon_detector', 9, 2], ['work_table', 15, 6], ['cabinet', 17, 2], ['cabinet', 18, 2],
        // arquivo
        ['cabinet', 23, 2], ['cabinet', 24, 2], ['cabinet', 28, 2], ['work_table', 27, 6],
    ],
};

// ------------------------------------------------------------------ LABORATÓRIO DE CRONOLOGIA (Arquivo do tempo)
// Cinco laboratórios ao longo de um corredor central, mais a recepção:
//   Lab 1 polimento, corte e montagem de amostras | Lab 2 tratamento térmico (fornos) | Lab 3 ataque químico (minerais e CR-39)
//   Lab 4 armazenamento de fontes (cofre, U e Th naturais, fontes experimentais) | Lab 5 microscopia, contagem manual e análise de imagem
export const PLANTA_CRONOLOGIA = {
    cols: 40, rows: 37, inicio: { x: 36, y: 12 },
    paleta: { piso: 0x8fa3b5, piso2: 0x859aad, junta: 0x4d6178, parede: 0xdde3ea, faixa: 0x2f6f8f, base: 0x8e9aa8 },
    // 0 Lab 1 · 1 Lab 2 · 2 Lab 3 · 3 corredor norte · 4 Lab 4 · 5 vestiário e EPI · 6 recepção · 7 corredor sul · 8 Lab 5 microscopia · 9 Lab 5 eletrônica · 10 Lab 5 impressão 3D
    areas: [R(1, 1, 12, 9), R(14, 1, 11, 9), R(26, 1, 13, 9), R(1, 11, 38, 3), R(1, 15, 13, 8), R(15, 15, 14, 8), R(30, 15, 9, 8), R(1, 24, 38, 3), R(1, 28, 13, 8), R(15, 28, 12, 8), R(28, 28, 11, 8)],
    portas: [R(6, 10, 2, 1), R(18, 10, 2, 1), R(31, 10, 2, 1), R(7, 14, 2, 1), R(21, 14, 2, 1), R(34, 14, 2, 1), R(7, 23, 2, 1), R(21, 23, 2, 1), R(34, 23, 2, 1), R(7, 27, 2, 1), R(20, 27, 2, 1), R(33, 27, 2, 1), R(14, 31, 1, 2), R(27, 31, 1, 2)],
    zonas: [
        { ...R(1, 1, 12, 9), tint: '#c9b99a', a: 0.10 },             // Lab 1
        { ...R(14, 1, 11, 9), tint: '#d9774a', a: 0.10 },            // Lab 2: fornos
        { ...R(26, 1, 13, 9), tint: '#8fd68f', a: 0.10 },            // Lab 3: ataque químico
        { ...R(1, 11, 38, 3), tint: '#b0bec5', a: 0.10 },
        { ...R(1, 15, 13, 8), tint: '#e0c040', a: 0.12 },            // Lab 4: fontes (área controlada)
        { ...R(15, 15, 14, 8), tint: '#6fae8f', a: 0.12 },           // vestiário e EPI
        { ...R(30, 15, 9, 8), tint: '#9bb6c9', a: 0.08 },
        { ...R(1, 24, 38, 3), tint: '#b0bec5', a: 0.10 },
        { ...R(1, 28, 13, 8), tint: '#1f2748', a: 0.28 },            // Lab 5: microscopia (penumbra)
        { ...R(15, 28, 12, 8), tint: '#2e7d6b', a: 0.12 },           // Lab 5: eletrônica básica
        { ...R(28, 28, 11, 8), tint: '#c28b3c', a: 0.09 },           // Lab 5: impressão 3D
    ],
    decor: [
        J(3, 0), J(6, 0), J(9, 0), J(11, 0),
        { tipo: 'grade', x: 16, y: 0, estado: 'aberta' }, { tipo: 'grade', x: 19, y: 0, estado: 'aberta' }, { tipo: 'grade', x: 22, y: 0, estado: 'aberta' },
        { tipo: 'grade', x: 28, y: 0, estado: 'aberta' }, { tipo: 'grade', x: 31, y: 0, estado: 'aberta' }, { tipo: 'grade', x: 34, y: 0, estado: 'aberta' }, J(37, 0),
        { tipo: 'placa', x: 5, y: 10, texto: 'Lab 1' }, { tipo: 'placa', x: 17, y: 10, texto: 'Lab 2' }, { tipo: 'placa', x: 30, y: 10, texto: 'Lab 3' },
        { tipo: 'placa', x: 6, y: 14, texto: 'Lab 4' }, { tipo: 'placa', x: 20, y: 14, texto: 'EPI' }, { tipo: 'placa', x: 33, y: 14, texto: 'Recep.' },
        { tipo: 'cartaz', x: 3, y: 14, simbolo: 'trifolio' }, { tipo: 'cartaz', x: 11, y: 14, simbolo: 'trifolio' },
        { tipo: 'cartaz', x: 17, y: 14, simbolo: 'cruz' }, { tipo: 'cartaz', x: 25, y: 14, simbolo: 'cruz' },
        { tipo: 'cartaz', x: 31, y: 14, simbolo: 'livro' }, { tipo: 'quadro', x: 36, y: 14, w: 3 },
        { tipo: 'placa', x: 6, y: 27, texto: 'Lab 5' }, { tipo: 'placa', x: 19, y: 27, texto: 'Lab 5' }, { tipo: 'placa', x: 32, y: 27, texto: 'Lab 5' },
        { tipo: 'cartaz', x: 3, y: 27, simbolo: 'lupa' }, { tipo: 'cartaz', x: 11, y: 27, simbolo: 'Rn' }, { tipo: 'cartaz', x: 17, y: 27, simbolo: 'cruz' }, { tipo: 'cartaz', x: 24, y: 27, simbolo: 'cruz' },
        { tipo: 'cartaz', x: 29, y: 27, simbolo: 'cruz' }, { tipo: 'cartaz', x: 37, y: 27, simbolo: 'livro' },
    ],
    moveis: [
        // Lab 1: polimento, corte e montagem
        ['saw', 1, 1], ['saw', 4, 1], ['polisher', 7, 1], ['polisher', 9, 1], ['sink', 11, 1], ['ultrasonic', 12, 1], ['loupe', 6, 3],
        ['sample_tray', 3, 5], ['sample_tray', 5, 5], ['sample_tray', 8, 5], ['sample_tray', 3, 7], ['sample_tray', 5, 7], ['cabinet', 1, 4], ['cabinet', 1, 7], ['shelf', 10, 7], ['microscope', 8, 3], ['computer', 10, 4], ['biohazard', 12, 6],
        // Lab 2: tratamento térmico
        ['furnace', 15, 1], ['furnace', 18, 1], ['furnace', 21, 1], ['work_table', 16, 5], ['work_table', 20, 5], ['cabinet', 24, 3], ['cabinet', 24, 6], ['sample_tray', 22, 8], ['computer', 15, 3], ['tube_furnace', 21, 3], ['vacuum_pump', 24, 1],
        // Lab 3: ataque químico (minerais e CR-39)
        ['fume_hood', 27, 1], ['fume_hood', 30, 1], ['fume_hood', 33, 1], ['sink', 36, 1], ['biohazard', 37, 3],
        ['etch_bath', 27, 5], ['etch_bath', 36, 6], ['sample_tray', 29, 5], ['dosimeter_rack', 33, 5], ['cabinet', 38, 5], ['etch_bath', 27, 7], ['etch_bath', 28, 7], ['fridge', 38, 2], ['work_table', 29, 8], ['balance', 34, 8],
        // Lab 4: fontes radioativas
        ['safe', 1, 15], ['safe', 2, 15], ['dosimeter_rack', 4, 15], ['source_cabinet', 11, 15], ['source_cabinet', 12, 15],
        ['work_table', 3, 20], ['sample_tray', 7, 20], ['shelf', 11, 20], ['computer', 4, 18], ['dosimeter_rack', 1, 18], ['desk', 8, 19],
        // vestiário e EPI (segurança): armários, lava-olhos, chuveiro, extintor e primeiros socorros
        ['locker', 15, 15], ['locker', 16, 15], ['locker', 17, 15], ['locker', 18, 15], ['locker', 19, 15], ['extinguisher', 24, 15], ['first_aid', 26, 15], ['eyewash', 28, 17], ['safety_shower', 28, 20],
        ['learning_board', 16, 22], ['work_table', 17, 19], ['waiting_seats', 24, 22],
        // recepção e sala do laudo
        ['reception_desk', 30, 15], ['waiting_seats', 36, 15], ['work_table', 34, 19], ['learning_board', 30, 22], ['school_mural', 35, 22], ['bookcase', 38, 18], ['bookcase', 38, 20],
        // Lab 5 · microscopia: análise de imagem e contagem manual
        ['image_station', 1, 28], ['image_station', 3, 28], ['image_station', 10, 28], ['image_station', 12, 28], ['image_station', 1, 31], ['image_station', 1, 34], ['image_station', 4, 31],
        ['microscope', 11, 31], ['microscope', 3, 33], ['microscope', 9, 30], ['computer', 9, 34], ['work_table', 6, 33], ['sample_drawer', 12, 33],
        // Lab 5 · eletrônica básica: construção de equipamentos
        ['elec_bench', 15, 28], ['elec_bench', 17, 28], ['microcontroller_kit', 19, 28], ['oscilloscope', 22, 28], ['power_supply', 23, 28], ['soldering_station', 24, 28], ['parts_cabinet', 26, 28],
        ['robot_arm_bath', 17, 31], ['elec_bench', 22, 31], ['elec_bench', 15, 35], ['elec_bench', 18, 35], ['soldering_station', 21, 35], ['oscilloscope', 22, 35], ['parts_cabinet', 24, 35], ['computer', 25, 34],
        // Lab 5 · impressão 3D
        ['printer3d', 29, 28], ['printer3d', 30, 28], ['printer3d', 31, 28], ['filament_shelf', 36, 28], ['work_table', 31, 31], ['work_table', 35, 31], ['computer', 36, 34], ['printer3d', 30, 35], ['printer3d', 32, 35], ['shelf', 34, 35], ['filament_shelf', 29, 32],
    ],
};

// ------------------------------------------------------------------ HOSPITAL · COMPLEXO EM "H"
// Duas alas ligadas por um saguão central, com jardins internos, baia de ambulâncias na frente e área de resíduos cercada:
//   Ala oeste: radiografia, sala de laudos, corredor e recepção (entrada pela frente)
//   Ala leste: sala educativa, apoio, mural da escola e medicina nuclear
export const PLANTA_HOSPITAL = {
    cols: 52, rows: 40, inicio: { x: 6, y: 27 }, externo: true,
    paleta: { piso: 0xdbe8e3, piso2: 0xcfe0da, junta: 0x8fa8a0, parede: 0xeef5f2, faixa: 0x4aa3a8, base: 0xa9bdb7 },
    areas: [R(1, 1, 50, 38)],
    blocos: [R(3, 2, 17, 22), R(19, 11, 12, 5), R(30, 2, 17, 22)],
    internas: [R(4, 3, 9, 8), R(14, 3, 5, 8), R(4, 12, 15, 3), R(4, 16, 15, 7), R(20, 12, 10, 3), R(31, 3, 7, 8), R(39, 3, 7, 8), R(31, 12, 15, 3), R(31, 16, 7, 7), R(39, 16, 7, 7)],
    portas: [R(7, 11, 2, 1), R(15, 11, 2, 1), R(10, 15, 2, 1), R(10, 23, 2, 1), R(19, 12, 1, 2), R(30, 12, 1, 2), R(24, 11, 2, 1), R(24, 15, 2, 1), R(33, 11, 2, 1), R(41, 11, 2, 1), R(33, 15, 2, 1), R(41, 15, 2, 1)],
    cercas: [R(0, 0, 52, 1), R(0, 39, 52, 1), R(0, 0, 1, 40), R(51, 0, 1, 40),
        R(38, 27, 10, 1), R(38, 34, 10, 1), R(47, 27, 1, 8), R(38, 28, 1, 2), R(38, 32, 1, 2)],
    zonas: [
        { ...R(4, 3, 9, 8), tint: '#8fb7c9', a: 0.10 },        // radiografia
        { ...R(14, 3, 5, 8), tint: '#9fb4c2', a: 0.10 },       // laudos
        { ...R(4, 12, 15, 3), tint: '#b7c9c2', a: 0.12 },
        { ...R(4, 16, 15, 7), tint: '#e0c88a', a: 0.10 },      // recepção
        { ...R(20, 12, 10, 3), tint: '#c9d8d2', a: 0.12 },     // saguão
        { ...R(31, 3, 7, 8), tint: '#b9d3a8', a: 0.10 },       // sala educativa
        { ...R(39, 3, 7, 8), tint: '#c9b2d9', a: 0.09 },       // apoio
        { ...R(31, 12, 15, 3), tint: '#b7c9c2', a: 0.12 },
        { ...R(31, 16, 7, 7), tint: '#d9b28a', a: 0.10 },      // mural da escola
        { ...R(39, 16, 7, 7), tint: '#9fd0c4', a: 0.14 },      // medicina nuclear
        { ...R(1, 25, 35, 8), piso: 'asfalto', tint: '#000000', a: 0.0 },
        { ...R(3, 24, 17, 1), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(30, 24, 17, 1), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(39, 28, 8, 6), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(20, 2, 10, 6), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(20, 16, 10, 8), piso: 'calcada', tint: '#ffffff', a: 0.0 },
    ],
    decor: [
        { tipo: 'cartaz', x: 6, y: 3, simbolo: 'trifolio' }, { tipo: 'cartaz', x: 10, y: 3, simbolo: 'cruz' }, J(16, 2), J(18, 2),
        { tipo: 'placa', x: 6, y: 11, texto: 'RX' }, { tipo: 'placa', x: 14, y: 11, texto: 'Laudos' },
        J(33, 2, 'aberta'), J(36, 2, 'aberta'), { tipo: 'quadro', x: 34, y: 2, w: 2 }, J(41, 2), J(44, 2),
        { tipo: 'placa', x: 32, y: 11, texto: 'Educ.' }, { tipo: 'placa', x: 40, y: 11, texto: 'Apoio' },
        { tipo: 'cartaz', x: 6, y: 15, simbolo: 'cruz' }, { tipo: 'cartaz', x: 14, y: 15, simbolo: 'cruz' }, { tipo: 'cartaz', x: 33, y: 15, simbolo: 'livro' },
        { tipo: 'placa', x: 40, y: 15, texto: 'NM' }, { tipo: 'cartaz', x: 44, y: 15, simbolo: 'trifolio' },
        J(5, 16), J(8, 16), J(14, 16), J(17, 16), { tipo: 'cartaz', x: 21, y: 11, simbolo: 'cruz' }, { tipo: 'cartaz', x: 28, y: 11, simbolo: 'cruz' },
    ],
    moveis: [
        // radiografia e laudos
        ['xray_unit', 6, 4], ['wall_detector', 12, 4], ['image_console', 5, 9], ['monitor', 11, 9], ['locker', 4, 3],
        ['image_console', 15, 3], ['display_case', 15, 6], ['monitor', 18, 9],
        // corredor oeste e recepção
        ['wheelchair', 5, 12], ['cart', 12, 12], ['iv_stand', 17, 12],
        ['reception_desk', 6, 17], ['waiting_seats', 4, 21], ['waiting_seats', 14, 21], ['wheelchair', 17, 17], ['display_case', 13, 17],
        // saguão
        ['waiting_seats', 21, 12], ['planter', 27, 12],
        // sala educativa, apoio, corredor leste, mural, medicina nuclear
        ['learning_board', 32, 3], ['display_case', 36, 3], ['work_table', 33, 7], ['display_case', 31, 9],
        ['staff_sink', 39, 3], ['locker', 42, 3], ['bed', 44, 3], ['cabinet', 39, 6], ['work_table', 42, 7],
        ['cart', 36, 12], ['wheelchair', 44, 12],
        ['school_mural', 32, 17], ['work_table', 32, 20], ['work_table', 35, 20], ['learning_board', 35, 17],
        ['gamma_camera', 40, 18], ['image_console', 39, 21], ['image_console', 44, 17],
        // jardins internos
        ['planter', 21, 3], ['planter', 26, 3], ['yard_bench', 23, 5], ['tree', 28, 6], ['tree', 21, 6],
        ['yard_bench', 21, 19], ['yard_bench', 26, 19], ['planter', 22, 17], ['planter', 26, 17], ['tree', 28, 22], ['tree', 21, 22], ['lamp_post', 24, 21],
        // frente: baia de ambulâncias, estacionamento, ponto de ônibus
        ['sign', 4, 24], ['ambulance', 14, 27], ['ambulance', 18, 27], ['parked_car', 22, 27], ['parked_car', 26, 27], ['parked_car', 30, 27], ['parked_car', 22, 30], ['parked_car', 30, 30],
        ['bus_shelter', 4, 28], ['lamp_post', 9, 26], ['lamp_post', 13, 25], ['lamp_post', 34, 26],
        // área de resíduos e gerador
        ['waste_container', 40, 29], ['waste_container', 43, 29], ['waste_container', 40, 32], ['waste_container', 43, 32], ['generator_unit', 45, 30], ['lamp_post', 37, 31],
        // árvores ao redor
        ['tree', 2, 6], ['tree', 2, 14], ['tree', 2, 20], ['tree', 48, 6], ['tree', 49, 14], ['tree', 49, 22], ['tree', 12, 36], ['tree', 22, 36], ['tree', 32, 36], ['tree', 42, 37], ['tree', 3, 36], ['tree', 49, 36], ['tree', 36, 28],
    ],
};

// ------------------------------------------------------------------ SERVIÇO DE MEDICINA NUCLEAR · COMPLEXO
// Bloco clínico (comunicação, equipe, corredor, acolhimento e sala de conversa) e, do outro lado de uma passarela,
// o bloco técnico (radiofármacos didático, controle e sala de aquisição). Pátio de armazenamento cercado e baia de embarque.
export const PLANTA_NUCLEAR = {
    cols: 52, rows: 40, inicio: { x: 8, y: 30 }, externo: true,
    paleta: { piso: 0xa3bcb5, piso2: 0x97b1aa, junta: 0x5f7a73, parede: 0xe6efeb, faixa: 0x2e8b8b, base: 0x8aa09a },
    areas: [R(1, 1, 50, 38)],
    blocos: [R(3, 2, 22, 26), R(30, 6, 20, 16)],
    internas: [R(4, 3, 9, 9), R(14, 3, 10, 9), R(4, 13, 20, 3), R(4, 17, 11, 10), R(16, 17, 8, 10), R(31, 7, 10, 6), R(42, 7, 7, 6), R(31, 14, 18, 7)],
    portas: [R(7, 12, 2, 1), R(18, 12, 2, 1), R(8, 16, 2, 1), R(19, 16, 2, 1), R(8, 27, 2, 1), R(24, 14, 1, 2), R(30, 14, 1, 2), R(34, 13, 2, 1), R(44, 13, 2, 1), R(38, 21, 2, 1)],
    cercas: [R(0, 0, 52, 1), R(0, 39, 52, 1), R(0, 0, 1, 40), R(51, 0, 1, 40),
        R(40, 26, 10, 1), R(40, 34, 10, 1), R(49, 26, 1, 8), R(40, 27, 1, 2), R(40, 31, 1, 3)],
    zonas: [
        { ...R(4, 3, 9, 9), tint: '#e0c88a', a: 0.10 },        // comunicação
        { ...R(14, 3, 10, 9), tint: '#9fb4c2', a: 0.10 },      // equipe
        { ...R(4, 13, 20, 3), tint: '#d8e4df', a: 0.14 },
        { ...R(4, 17, 11, 10), tint: '#9fd0c4', a: 0.12 },     // acolhimento
        { ...R(16, 17, 8, 10), tint: '#c9a9d9', a: 0.09 },     // conversa
        { ...R(31, 7, 10, 6), tint: '#d9b04a', a: 0.12 },      // radiofármacos: área controlada (amarelo)
        { ...R(42, 7, 7, 6), tint: '#8fb5d6', a: 0.10 },       // controle
        { ...R(31, 14, 18, 7), tint: '#9fd0c4', a: 0.10 },     // aquisição
        { ...R(1, 29, 36, 7), piso: 'asfalto', tint: '#000000', a: 0.0 },
        { ...R(7, 28, 4, 1), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(25, 14, 5, 2), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(37, 22, 4, 4), piso: 'calcada', tint: '#ffffff', a: 0.0 },
        { ...R(41, 27, 8, 6), piso: 'calcada', tint: '#ffffff', a: 0.0 },
    ],
    decor: [
        { tipo: 'quadro', x: 5, y: 3, w: 3 }, { tipo: 'cartaz', x: 11, y: 3, simbolo: 'livro' },
        J(16, 2), J(19, 2), J(22, 2),
        { tipo: 'placa', x: 6, y: 12, texto: 'Com.' }, { tipo: 'placa', x: 17, y: 12, texto: 'Eq.' },
        { tipo: 'cartaz', x: 12, y: 12, simbolo: 'lupa' }, { tipo: 'cartaz', x: 22, y: 12, simbolo: 'livro' },
        { tipo: 'placa', x: 7, y: 16, texto: 'Acolh.' }, { tipo: 'placa', x: 18, y: 16, texto: 'Conv.' },
        { tipo: 'cartaz', x: 12, y: 16, simbolo: 'cruz' }, { tipo: 'cartaz', x: 22, y: 16, simbolo: 'cruz' },
        { tipo: 'cartaz', x: 32, y: 7, simbolo: 'trifolio' }, { tipo: 'cartaz', x: 38, y: 7, simbolo: 'trifolio' }, { tipo: 'placa', x: 36, y: 7, texto: 'NM' },
        { tipo: 'cartaz', x: 43, y: 7, simbolo: 'lupa' }, { tipo: 'cartaz', x: 47, y: 7, simbolo: 'livro' },
        { tipo: 'cartaz', x: 32, y: 13, simbolo: 'cruz' }, { tipo: 'cartaz', x: 40, y: 13, simbolo: 'lupa' }, { tipo: 'cartaz', x: 47, y: 13, simbolo: 'cruz' },
    ],
    moveis: [
        // comunicação
        ['school_mural', 5, 4], ['learning_board', 9, 4], ['work_table', 5, 7], ['work_table', 9, 7],
        // equipe
        ['work_table', 15, 4], ['work_table', 19, 4], ['staff_sink', 15, 9], ['image_console', 20, 9], ['locker', 23, 3],
        // corredor
        ['wheelchair', 5, 13], ['waiting_seats', 12, 13], ['cart', 16, 15],
        // acolhimento
        ['reception_desk', 4, 18], ['display_case', 11, 18], ['waiting_seats', 7, 24], ['waiting_seats', 11, 24], ['wheelchair', 5, 23],
        // sala de conversa
        ['work_table', 17, 19], ['work_table', 21, 19], ['waiting_seats', 17, 24], ['display_case', 21, 24],
        // radiofármacos (didático), controle e aquisição
        ['tracer_bench', 32, 8], ['tracer_bench', 35, 8], ['display_case', 38, 8], ['staff_sink', 31, 11], ['lead_door', 40, 8], ['lead_container', 37, 11],
        ['image_console', 42, 8], ['image_console', 45, 8], ['work_table', 44, 11], ['acquisition_panel', 47, 8],
        ['gamma_camera', 38, 16], ['image_console', 35, 16], ['acquisition_panel', 42, 16], ['waiting_seats', 44, 19], ['lead_door', 33, 17],
        // exterior: baia de embarque, passarela e jardim
        ['sign', 5, 28], ['ambulance', 14, 31], ['ambulance', 18, 31], ['parked_car', 24, 31], ['parked_car', 28, 31], ['parked_car', 32, 31],
        ['bus_shelter', 3, 32], ['lamp_post', 11, 30], ['lamp_post', 22, 29], ['lamp_post', 36, 30], ['lamp_post', 27, 14],
        ['planter', 26, 18], ['planter', 26, 24], ['yard_bench', 27, 21], ['tree', 28, 18], ['tree', 28, 25], ['tree', 26, 27],
        // pátio de armazenamento cercado
        ['lead_container', 42, 28], ['lead_container', 45, 28], ['lead_container', 42, 31], ['lead_container', 45, 31], ['generator_unit', 46, 29],
        ['planter', 32, 23], ['planter', 44, 24],
        // árvores ao redor
        ['tree', 2, 6], ['tree', 2, 14], ['tree', 2, 22], ['tree', 27, 3], ['tree', 28, 8], ['tree', 27, 11], ['tree', 51 - 3, 4], ['tree', 50, 24], ['tree', 12, 37], ['tree', 22, 37], ['tree', 32, 37], ['tree', 42, 37], ['tree', 3, 37], ['tree', 49, 37], ['tree', 37, 3],
    ],
};
