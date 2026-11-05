// ============================================
// PLANTAS DAS MISSÕES DE CAÇA (v3.8): mapa contínuo maior, com exterior aberto (ruas, quintais, pátios) e edifícios com porta.
// Mesmo formato das plantas das investigações (ver plantas-investigacao.js). Tiles: 0 piso, 1 parede, 2 móvel.
// IMPORTANTE (fidelidade): só o essencial vem de fonte (ver docs/mapas-locais-fontes.md); distâncias, ruas e plantas internas
// são simplificação de jogo [H]. O ponto "H" (heliponto, onde a nave pousa) é o início e o ponto de coleta.
// ============================================
const R = (x, y, w, h) => ({ x, y, w, h });
const J = (x, y, estado = 'fechada') => ({ tipo: 'janela', x, y, estado });

// ------------------------------------------------------------------ GOIÂNIA (missão 2, setembro de 1987)
// Fontes do esquema (docs/mapas-locais-fontes.md): ferro-velho I (Devair, bairro Aeroporto), casa de Ivo (Rua 6), clínica IGR
// abandonada, casa de Roberto (Rua 57) e ferro-velho III. A posição relativa entre eles NÃO é a real.
export const PLANTA_GOIANIA = {
    cols: 60, rows: 40, inicio: { x: 4, y: 19 }, externo: true,
    paleta: { piso: 0x8a7a5a, piso2: 0x7f7050, junta: 0x5a4c34, parede: 0xb9a98a, faixa: 0xa0522d, base: 0x6b5b3a },
    areas: [R(1, 1, 58, 38)],
    cercas: [
        R(0, 0, 60, 1), R(0, 39, 60, 1), R(0, 0, 1, 40), R(59, 0, 1, 40),
        R(2, 2, 27, 1), R(2, 2, 1, 14), R(28, 2, 1, 14), R(2, 15, 12, 1), R(16, 15, 13, 1),          // ferro-velho I (portão em x 14–15)
        R(40, 25, 7, 1), R(49, 25, 9, 1), R(40, 25, 1, 13), R(57, 25, 1, 13), R(40, 37, 18, 1),      // ferro-velho III (portão em x 47–48)
    ],
    blocos: [R(18, 4, 9, 7), R(32, 3, 13, 8), R(48, 3, 10, 9), R(5, 26, 12, 9)],
    internas: [R(19, 5, 7, 5), R(33, 4, 5, 6), R(39, 4, 5, 6), R(49, 4, 4, 7), R(54, 4, 3, 7), R(6, 27, 5, 7), R(12, 27, 4, 7)],
    portas: [R(21, 10, 2, 1), R(38, 6, 1, 2), R(35, 10, 2, 1), R(53, 6, 1, 2), R(50, 11, 2, 1), R(11, 29, 1, 2), R(7, 26, 2, 1)],
    zonas: [
        { ...R(1, 18, 58, 4), piso: 'asfalto', tint: '#000000', a: 0 },
        { ...R(1, 16, 58, 2), piso: 'calcada', tint: '#ffffff', a: 0 },
        { ...R(1, 22, 58, 2), piso: 'calcada', tint: '#ffffff', a: 0 },
        { ...R(3, 3, 25, 12), piso: 'terra', tint: '#000000', a: 0 },
        { ...R(41, 26, 16, 11), piso: 'terra', tint: '#000000', a: 0 },
        { ...R(19, 5, 7, 5), tint: '#b08850', a: 0.10, vent: 1 },
        { ...R(33, 4, 5, 6), tint: '#d9b27a', a: 0.10, vent: 1 }, { ...R(39, 4, 5, 6), tint: '#d9b27a', a: 0.10, vent: 1 },
        { ...R(49, 4, 4, 7), tint: '#9fb5c4', a: 0.14, vent: 0 }, { ...R(54, 4, 3, 7), tint: '#9fb5c4', a: 0.14, vent: 0 },
        { ...R(6, 27, 5, 7), tint: '#d9b27a', a: 0.10, vent: 1 }, { ...R(12, 27, 4, 7), tint: '#d9b27a', a: 0.10, vent: 1 },
    ],
    decor: [
        { tipo: 'heliponto', x: 2, y: 18, w: 5, h: 4 },
        J(34, 3), J(41, 3), J(50, 3), J(55, 3), J(20, 4, 'entreaberta'), J(24, 4, 'entreaberta'),
        { tipo: 'placa', x: 19, y: 10, texto: 'Galpão' }, { tipo: 'placa', x: 33, y: 10, texto: 'Casa' }, { tipo: 'placa', x: 49, y: 11, texto: 'Clínica' },
    ],
    moveis: [
        // ferro-velho I: pátio de terra (corredores livres nas linhas y 6–7 e perto do portão em x 14–15)
        ['car', 4, 4], ['car', 9, 4], ['scrap', 14, 4], ['car', 4, 8], ['scrap', 9, 8], ['tire', 14, 9], ['tire', 15, 9],
        ['barrel', 13, 12], ['barrel', 16, 12], ['fridge', 5, 12], ['washer', 8, 12], ['metal', 10, 12], ['engine', 24, 12], ['barrel', 26, 13],
        // galpão
        ['bench', 19, 5], ['machine', 23, 5], ['engine', 20, 8], ['barrel', 25, 8], ['stove', 24, 8],
        // casa de Ivo
        ['sofa', 33, 4], ['tv', 36, 4], ['stove', 33, 8], ['fridge', 39, 4], ['washer', 42, 4], ['bench', 40, 8],
        // clínica abandonada
        ['machine', 49, 4], ['bench', 51, 8], ['fridge', 54, 4], ['metal', 55, 8],
        // casa de Roberto
        ['sofa', 9, 27], ['tv', 6, 32], ['stove', 8, 32], ['washer', 10, 31], ['fridge', 12, 27], ['bench', 13, 31],
        // ferro-velho III
        ['car', 42, 27], ['car', 51, 27], ['scrap', 42, 31], ['scrap', 46, 32], ['tire', 50, 31], ['tire', 51, 31], ['barrel', 54, 33],
        ['metal', 43, 35], ['engine', 48, 34], ['fridge', 55, 28], ['bench', 52, 34], ['washer', 45, 35],
        // rua, quintais e árvores
        ['parked_car', 30, 19], ['lamp_post', 12, 17], ['lamp_post', 36, 17], ['lamp_post', 52, 17],
        ['tree', 30, 4], ['tree', 30, 10], ['tree', 46, 13], ['tree', 56, 13], ['tree', 3, 25], ['tree', 20, 26], ['tree', 24, 30], ['tree', 34, 28], ['tree', 36, 33], ['tree', 30, 36], ['tree', 19, 36], ['tree', 3, 36],
    ],
};

// ------------------------------------------------------------------ CHERNOBYL (missão 4, 26 de abril de 1986)
// Esquema do essencial verificado (docs/mapas-locais-fontes.md): prédio principal com blocos de reator e sala de turbinas
// comprida, galeria de transporte ligando o depósito de rejeitos ao prédio principal, subestação externa, prédio
// administrativo. Escala, posições e dimensões NÃO são reais [H]. Largura máxima 64 tiles (textura do terreno ≤ 4096 px).
export const PLANTA_CHERNOBYL = {
    cols: 64, rows: 42, inicio: { x: 4, y: 20 }, externo: true,
    reator: { x: 53, y: 24, width: 4, height: 4 },
    paleta: { piso: 0x6a6f74, piso2: 0x62676c, junta: 0x44494d, parede: 0xa3a9ae, faixa: 0xc4a000, base: 0x50565b },
    areas: [R(1, 1, 62, 40)],
    cercas: [
        R(0, 0, 64, 1), R(0, 41, 64, 1), R(0, 0, 1, 42), R(63, 0, 1, 42),
        R(28, 3, 20, 1), R(28, 3, 1, 8), R(47, 3, 1, 8), R(28, 10, 8, 1), R(38, 10, 10, 1),          // subestação externa (portão em x 36–37)
    ],
    blocos: [R(10, 5, 13, 9), R(26, 13, 34, 7), R(46, 20, 16, 13), R(6, 27, 13, 10), R(19, 27, 27, 6)],
    internas: [R(11, 6, 11, 7), R(27, 14, 32, 5), R(47, 21, 14, 11), R(7, 28, 11, 8), R(20, 28, 25, 4)],
    portas: [R(15, 13, 2, 1), R(33, 19, 2, 1), R(40, 19, 2, 1), R(54, 19, 2, 2), R(12, 27, 2, 1), R(18, 29, 2, 2), R(45, 29, 2, 2)],
    zonas: [
        { ...R(1, 20, 45, 4), piso: 'asfalto', tint: '#000000', a: 0 },
        { ...R(1, 24, 45, 2), piso: 'calcada', tint: '#ffffff', a: 0 },
        { ...R(29, 4, 18, 6), piso: 'terra', tint: '#000000', a: 0 },
        { ...R(11, 6, 11, 7), tint: '#9fb5c4', a: 0.12, vent: 1 },
        { ...R(27, 14, 32, 5), tint: '#c4a000', a: 0.07, vent: 1 },
        { ...R(47, 21, 14, 11), tint: '#ff5a3a', a: 0.12, vent: 0 },
        { ...R(7, 28, 11, 8), tint: '#d9c34a', a: 0.10, vent: 0 },
        { ...R(20, 28, 25, 4), tint: '#8a949c', a: 0.12, vent: 0 },
    ],
    decor: [
        { tipo: 'heliponto', x: 2, y: 19, w: 5, h: 4 },
        { tipo: 'placa', x: 14, y: 13, texto: 'Controle' }, { tipo: 'placa', x: 36, y: 19, texto: 'Turbinas' }, { tipo: 'placa', x: 9, y: 27, texto: 'Rejeitos' },
        { tipo: 'cartaz', x: 18, y: 6, simbolo: 'trifolio' }, { tipo: 'cartaz', x: 50, y: 21, simbolo: 'trifolio' }, { tipo: 'cartaz', x: 58, y: 21, simbolo: 'trifolio' },
    ],
    moveis: [
        // prédio administrativo / sala de controle
        ['console', 11, 6], ['console', 15, 6], ['console', 18, 6], ['dosimeter', 12, 10], ['suit', 20, 10], ['panel', 11, 9],
        // subestação externa
        ['panel', 30, 4], ['panel', 33, 4], ['panel', 36, 4], ['panel', 39, 4], ['panel', 42, 4], ['panel', 45, 4],
        ['pipe', 31, 8], ['pipe', 33, 8], ['tank', 40, 8], ['machine', 43, 7], ['machine', 30, 6],
        // sala de turbinas
        ['machine', 28, 14], ['machine', 32, 14], ['machine', 37, 14], ['machine', 42, 14], ['machine', 47, 14], ['machine', 52, 14],
        ['crane', 29, 17], ['crane', 38, 17], ['crane', 48, 17], ['pipe', 45, 17], ['pipe', 56, 17],
        // bloco do reator
        ['reactor', 53, 24], ['lead_door', 49, 22], ['lead_door', 49, 26], ['lead_door', 59, 22], ['lead_door', 59, 26],
        ['container', 49, 28], ['container', 51, 30], ['container', 57, 30], ['container', 60, 29], ['console', 55, 21],
        // galeria de transporte
        ['container', 24, 28], ['container', 30, 31], ['container', 36, 28], ['pipe', 27, 31], ['pipe', 33, 28], ['pipe', 40, 31],
        // depósito de rejeitos
        ['container', 8, 31], ['container', 10, 31], ['container', 14, 31], ['container', 16, 33], ['container', 9, 34], ['tank', 11, 34], ['machine', 14, 34], ['suit', 8, 29], ['dosimeter', 16, 29],
        // pátio
        ['ambulance', 8, 24], ['generator_unit', 6, 16], ['lamp_post', 12, 24], ['lamp_post', 30, 24], ['lamp_post', 44, 24], ['waste_container', 23, 25],
        ['tree', 3, 5], ['tree', 3, 10], ['tree', 3, 36], ['tree', 24, 38], ['tree', 40, 38], ['tree', 60, 38], ['tree', 62, 6], ['tree', 25, 8], ['tree', 52, 38],
    ],
};

// ------------------------------------------------------------------ FUKUSHIMA DAIICHI (missão 8, 11 de março de 2011)
// Do essencial verificado: terraço costeiro, fileira de reatores 1–4 com prédios de turbinas, geradores a diesel nos subsolos
// dos prédios de turbinas, tomadas de água e descarga comum ao mar (docs/mapas-locais-fontes.md). Unidades 5 e 6, chaminés, tanques,
// posição dos prédios de turbina (aqui do lado do mar) e escala são simplificação [H]. O mar fica a leste (intransponível).
const unidadesFuku = (() => {
    const blocos = [], internas = [], portas = [], zonas = [], moveis = [], decor = [];
    [3, 12, 21, 30].forEach((y0, i) => {
        blocos.push(R(24, y0, 10, 7), R(35, y0, 12, 7));
        internas.push(R(25, y0 + 1, 8, 5), R(36, y0 + 1, 10, 5));
        portas.push(R(24, y0 + 2, 1, 2), R(33, y0 + 2, 3, 2), R(46, y0 + 2, 1, 2));
        zonas.push({ ...R(25, y0 + 1, 8, 5), tint: '#ff5a3a', a: 0.08, vent: 0 }, { ...R(36, y0 + 1, 10, 5), tint: '#6aa0c8', a: 0.10, vent: 1 });
        decor.push({ tipo: 'placa', x: 28, y: y0 + 6 + 0, texto: 'U' + (i + 1) }, J(28, y0), J(30, y0));
        // prédio do reator (a unidade 2 leva o núcleo marcado) e prédio de turbinas
        if (i === 1) moveis.push(['reactor', 27, y0 + 1]); else moveis.push(['console', 26, y0 + 1], ['lead_door', 29, y0 + 1]);
        moveis.push(['container', 26, y0 + 4], ['dosimeter', 30, y0 + 4], ['suit', 31, y0 + 1]);
        moveis.push(['machine', 37, y0 + 1], ['machine', 40, y0 + 1], ['panel', 43, y0 + 1], ['pipe', 38, y0 + 4], ['pipe', 42, y0 + 4], ['crane', 40, y0 + 4]);
        moveis.push(['tank', 49, y0 + 2], ['pipe', 51, y0 + 3]);   // tomadas e canos de água do mar
    });
    return { blocos, internas, portas, zonas, moveis, decor };
})();
export const PLANTA_FUKUSHIMA = {
    cols: 64, rows: 44, inicio: { x: 4, y: 21 }, externo: true,
    reator: { x: 27, y: 13, width: 4, height: 4 },
    paleta: { piso: 0x70767c, piso2: 0x686e74, junta: 0x474c51, parede: 0xb0b5ba, faixa: 0x3f7fa6, base: 0x555b61 },
    areas: [R(1, 1, 52, 42)],
    mar: [R(54, 1, 9, 42)],
    cercas: [R(0, 0, 64, 1), R(0, 43, 64, 1), R(0, 0, 1, 44), R(63, 0, 1, 44), R(53, 1, 1, 42)],            // a última é o quebra-mar
    blocos: unidadesFuku.blocos, internas: unidadesFuku.internas, portas: unidadesFuku.portas,
    zonas: [
        { ...R(1, 20, 22, 4), piso: 'asfalto', tint: '#000000', a: 0 }, { ...R(47, 1, 6, 42), piso: 'asfalto', tint: '#000000', a: 0 },
        { ...R(1, 24, 22, 2), piso: 'calcada', tint: '#ffffff', a: 0 }, ...unidadesFuku.zonas,
    ],
    decor: [{ tipo: 'heliponto', x: 2, y: 20, w: 5, h: 4 }, ...unidadesFuku.decor.filter((d) => d.tipo === 'janela')],
    moveis: [
        ...unidadesFuku.moveis,
        ['ambulance', 9, 25], ['generator_unit', 10, 17], ['lamp_post', 14, 24], ['lamp_post', 20, 24], ['waste_container', 4, 25],
        ['tree', 3, 5], ['tree', 3, 10], ['tree', 6, 8], ['tree', 12, 4], ['tree', 17, 8], ['tree', 4, 36], ['tree', 12, 38], ['tree', 20, 35], ['tree', 3, 31],
    ],
};

// ------------------------------------------------------------------ MAYAPURI (missão 7, abril de 2010)
// Do essencial verificado: mercado de sucata em Delhi, fragmentos de Co-60 numa loja de sucateiro e na área em volta, pontos quentes
// no chão do mercado. Ruelas, lojas e pátios são esquema [H].
const lojasMayapuri = (() => {
    const blocos = [], internas = [], portas = [], zonas = [], moveis = [], decor = [];
    [4, 15, 26, 37, 48].forEach((x, i) => {
        blocos.push(R(x, 9, 9, 8), R(x, 25, 9, 8));
        internas.push(R(x + 1, 10, 7, 6), R(x + 1, 26, 7, 6));
        portas.push(R(x + 3, 16, 2, 1), R(x + 3, 25, 2, 1));
        zonas.push({ ...R(x + 1, 10, 7, 6), tint: '#d9b27a', a: 0.10, vent: 2 }, { ...R(x + 1, 26, 7, 6), tint: '#b08850', a: 0.10, vent: 2 });
        decor.push({ tipo: 'placa', x: x + 2, y: 16, texto: 'Loja' }, { tipo: 'placa', x: x + 2, y: 32, texto: 'Sucata' });
        // norte: lojas de sucata; sul: ferragens e oficinas (portas em x+3..x+4, y 15 e y 26 ficam livres)
        moveis.push(['scrap', x + 1, 10], ['metal', x + 4, 10], ['barrel', x + 7, 10], ['bench', x + 5, 13], ['tire', x + 1, 13], ['engine', x + 7, 14]);
        moveis.push(['machine', x + 1, 29], ['fridge', x + 4, 28], ['washer', x + 6, 29], ['stove', x + 7, 31], ['barrel', x + 1, 31], ['tv', x + 5, 31]);
    });
    return { blocos, internas, portas, zonas, moveis, decor };
})();
export const PLANTA_MAYAPURI = {
    cols: 60, rows: 42, inicio: { x: 4, y: 20 }, externo: true,
    paleta: { piso: 0x8a7a5a, piso2: 0x7f7050, junta: 0x5a4c34, parede: 0xc9b48a, faixa: 0xb5651d, base: 0x6b5b3a },
    areas: [R(1, 1, 58, 40)],
    cercas: [R(0, 0, 60, 1), R(0, 41, 60, 1), R(0, 0, 1, 42), R(59, 0, 1, 42)],
    blocos: lojasMayapuri.blocos, internas: lojasMayapuri.internas, portas: lojasMayapuri.portas,
    zonas: [
        { ...R(1, 19, 58, 4), piso: 'asfalto', tint: '#000000', a: 0 }, { ...R(1, 17, 58, 2), piso: 'calcada', tint: '#ffffff', a: 0 }, { ...R(1, 23, 58, 2), piso: 'calcada', tint: '#ffffff', a: 0 },
        { ...R(1, 1, 58, 8), piso: 'terra', tint: '#000000', a: 0 }, { ...R(1, 33, 58, 7), piso: 'terra', tint: '#000000', a: 0 }, ...lojasMayapuri.zonas,
    ],
    decor: [{ tipo: 'heliponto', x: 2, y: 19, w: 5, h: 4 }, ...lojasMayapuri.decor],
    moveis: [
        ...lojasMayapuri.moveis,
        // pátios de sucata atrás das lojas (as ruelas em x 13–14, 24–25, 35–36, 46–47 ficam livres)
        ['car', 6, 3], ['car', 18, 4], ['scrap', 28, 3], ['scrap', 40, 5], ['tire', 10, 7], ['tire', 11, 7], ['metal', 20, 7], ['barrel', 31, 6], ['engine', 44, 3], ['scrap', 51, 4], ['bench', 54, 7],
        ['car', 6, 35], ['car', 19, 36], ['scrap', 29, 35], ['scrap', 40, 36], ['tire', 9, 38], ['barrel', 22, 38], ['metal', 32, 38], ['machine', 52, 35], ['fridge', 55, 37],
        // rua do mercado
        ['parked_car', 22, 20], ['parked_car', 40, 21], ['lamp_post', 10, 24], ['lamp_post', 30, 24], ['lamp_post', 50, 24], ['tree', 2, 6], ['tree', 57, 6], ['tree', 2, 36], ['tree', 57, 38],
    ],
};

// ------------------------------------------------------------------ ZARAGOZA (missão 6, dezembro de 1990)
// Do essencial verificado: hospital (Hospital Clínico Universitário Lozano Blesa, segundo as fontes; o jogo diz "Zaragoza"),
// acelerador de elétrons reparado em 7/12/1990. A planta do hospital é esquema [H]: corredor central, salas de cada lado, bunker do
// acelerador, recepção com a entrada principal ao sul e estacionamento.
const hospital = (() => {
    const internas = [R(11, 14, 38, 3)], portas = [], zonas = [{ ...R(11, 14, 38, 3), tint: '#cfe3ea', a: 0.12, vent: 1 }], moveis = [], decor = [];
    const xs = [11, 19, 27, 35, 43];
    xs.forEach((x, i) => {
        const w = i === 4 ? 6 : 7;
        internas.push(R(x, 5, w, 8), R(x, 18, w, 9));
        portas.push(R(x + 3, 13, 2, 1), R(x + 3, 17, 2, 1));
        zonas.push({ ...R(x, 5, w, 8), tint: i === 3 ? '#ff9f80' : '#9fd6c4', a: 0.10, vent: 1 }, { ...R(x, 18, w, 9), tint: '#cfe3ea', a: 0.08, vent: 1 });
        decor.push(J(x + 2, 4), { tipo: 'cartaz', x: x + 1, y: 13, simbolo: i === 3 ? 'trifolio' : 'cruz' });
    });
    portas.push(R(29, 27, 2, 1));   // entrada principal (recepção, sul)
    // portas ficam livres: (x+3..x+4) nos andares y 12/13 e y 17/18
    xs.forEach((x, i) => {
        if (i === 3) { moveis.push(['machine', x + 1, 6], ['monitor', x + 5, 6], ['cabinet', x + 1, 10], ['table', x + 3, 10], ['oxygen', x + (i === 4 ? 5 : 6), 11]); }
        else moveis.push(['bed', x + 1, 6], ['iv_stand', x + 4, 6], ['monitor', x + (i === 4 ? 5 : 6), 6], ['cart', x + 1, 11], ['cabinet', x + 5, 11]);
    });
    // sul: sala 1 consultórios, sala 2 internação, sala 3 recepção (entrada), sala 4 exames, sala 5 depósito
    moveis.push(['table', 12, 19], ['cabinet', 16, 19], ['cart', 12, 24], ['wheelchair', 15, 25]);
    moveis.push(['bed', 20, 19], ['bed', 23, 19], ['bed', 20, 23], ['iv_stand', 24, 25], ['monitor', 25, 22]);
    moveis.push(['wheelchair', 28, 24], ['locker', 32, 19], ['cart', 28, 20], ['defibrillator', 33, 24]);
    moveis.push(['machine', 36, 19], ['table', 39, 24], ['monitor', 36, 25], ['oxygen', 40, 20]);
    moveis.push(['locker', 44, 19], ['locker', 46, 19], ['cabinet', 44, 24], ['oxygen', 47, 25]);
    // corredor
    moveis.push(['wheelchair', 13, 15], ['cart', 22, 16], ['wheelchair', 37, 15], ['cart', 46, 14]);
    return { internas, portas, zonas, moveis, decor };
})();
export const PLANTA_ZARAGOZA = {
    cols: 60, rows: 40, inicio: { x: 4, y: 30 }, externo: true,
    paleta: { piso: 0xcfd8dc, piso2: 0xc5cfd4, junta: 0x9aa7ad, parede: 0xe9eef0, faixa: 0x4fa3a5, base: 0x90a4ae },
    areas: [R(1, 1, 58, 38)],
    cercas: [R(0, 0, 60, 1), R(0, 39, 60, 1), R(0, 0, 1, 40), R(59, 0, 1, 40)],
    blocos: [R(10, 4, 40, 24)], internas: hospital.internas, portas: hospital.portas,
    zonas: [{ ...R(1, 29, 58, 4), piso: 'asfalto', tint: '#000000', a: 0 }, { ...R(1, 28, 58, 1), piso: 'calcada', tint: '#ffffff', a: 0 }, ...hospital.zonas],
    decor: [{ tipo: 'heliponto', x: 2, y: 29, w: 5, h: 4 }, { tipo: 'placa', x: 28, y: 27, texto: 'Entrada' }, ...hospital.decor],
    moveis: [
        ...hospital.moveis,
        ['ambulance', 12, 30], ['parked_car', 38, 30], ['parked_car', 44, 30], ['parked_car', 50, 30], ['lamp_post', 20, 28], ['lamp_post', 46, 28],
        ['tree', 3, 5], ['tree', 3, 12], ['tree', 55, 6], ['tree', 55, 14], ['tree', 6, 36], ['tree', 20, 36], ['tree', 34, 36], ['tree', 52, 36],
    ],
};

// ------------------------------------------------------------------ LIA, GEÓRGIA (missão 5, dezembro de 2001)
// Do essencial verificado (AIEA, pub. 1660): duas fontes de Sr-90 numa depressão ao lado de uma trilha, sob uma grande pedra e
// cercadas por pilha de rochas e terra, em área despovoada de floresta; deslizamento bloqueando o trecho final. Distâncias a Lia
// divergem na própria fonte: não usadas. Trilha, clareiras e cabana são esquema [H]. O que não está em `areas` é mata fechada.
export const PLANTA_LIA = {
    cols: 64, rows: 44, inicio: { x: 4, y: 22 }, externo: true,
    paleta: { piso: 0x5a5a4a, piso2: 0x52523f, junta: 0x3b3b2d, parede: 0x8a8068, faixa: 0x3f7d3a, base: 0x4a4a3a },
    areas: [
        R(1, 18, 10, 9),                                  // clareira da base (heliponto)
        R(10, 21, 12, 3), R(19, 14, 3, 10), R(19, 14, 16, 3), R(32, 14, 3, 14), R(32, 25, 14, 3),   // trilha de terra
        R(24, 4, 12, 10),                                 // clareira da cabana (acampamento de lenhadores)
        R(42, 22, 20, 18),                                // clareira do acampamento e da pedra
        R(52, 8, 10, 14),                                 // depressão atrás da pilha de rochas
    ],
    cercas: [], blocos: [R(27, 6, 7, 5)], internas: [R(28, 7, 5, 3)], portas: [R(29, 10, 2, 1)],
    zonas: [
        { ...R(10, 21, 12, 3), piso: 'terra', tint: '#000000', a: 0 }, { ...R(19, 14, 3, 10), piso: 'terra', tint: '#000000', a: 0 }, { ...R(19, 14, 16, 3), piso: 'terra', tint: '#000000', a: 0 },
        { ...R(32, 14, 3, 14), piso: 'terra', tint: '#000000', a: 0 }, { ...R(32, 25, 14, 3), piso: 'terra', tint: '#000000', a: 0 },
        { ...R(42, 22, 20, 18), piso: 'terra', tint: '#000000', a: 0 }, { ...R(28, 7, 5, 3), tint: '#8a6a48', a: 0.12, vent: 1 },
    ],
    decor: [{ tipo: 'heliponto', x: 2, y: 20, w: 5, h: 4 }],
    moveis: [
        // cabana e clareira
        ['table', 28, 7], ['cabinet', 32, 7], ['crate', 29, 9], ['barrel', 25, 6], ['log', 25, 11], ['campfire', 30, 12], ['backpack', 26, 9],
        // deslizamento na trilha: pedras com passagem em y 15 (x 25–26)
        ['rock', 24, 14], ['rock', 24, 16], ['rock', 25, 16], ['rock', 28, 14], ['rock', 28, 16], ['debris', 29, 15],
        // acampamento e depressão
        ['tent', 44, 24], ['tent', 49, 24], ['campfire', 47, 27], ['table', 44, 29], ['crate', 50, 29], ['barrel', 52, 31], ['log', 55, 26], ['backpack', 45, 33], ['rope', 52, 34], ['debris', 56, 33],
        ['generator', 55, 11], ['generator', 55, 13], ['rock', 53, 9], ['rock', 54, 9], ['rock', 56, 9], ['rock', 57, 11], ['rock', 53, 15], ['rock', 58, 15], ['debris', 58, 12], ['rock', 60, 9], ['rock', 60, 17],
        // mata: árvores nas bordas das clareiras
        ['tree', 2, 19], ['tree', 9, 19], ['tree', 3, 26], ['tree', 8, 25], ['tree', 14, 21], ['tree', 20, 15], ['tree', 33, 18], ['tree', 26, 5], ['tree', 35, 5], ['tree', 35, 12],
        ['tree', 33, 26], ['tree', 40, 27], ['tree', 43, 23], ['tree', 60, 23], ['tree', 43, 38], ['tree', 60, 38], ['tree', 53, 21], ['tree', 61, 9], ['tree', 53, 8],
    ],
};

// ------------------------------------------------------------------ RADIUM GIRLS (missão 3, anos 1910–1920)
// Do essencial verificado (HAER/EPA, Wikipédia): complexo em 422–432 Alden Street, Orange, Nova Jersey, com prédio de aplicação
// de tinta e laboratório de cristalização de rádio; pintura de mostradores com tinta de rádio e zinco. Salas internas e o
// escritório são esquema [H]. Alden Street aparece como a rua em frente.
export const PLANTA_RADIUM = {
    cols: 56, rows: 36, inicio: { x: 4, y: 22 }, externo: true,
    paleta: { piso: 0x9a8a6a, piso2: 0x8f7f60, junta: 0x6a5c42, parede: 0xc9a98a, faixa: 0x7a3a2a, base: 0x7a6a4a },
    areas: [R(1, 1, 54, 34)],
    cercas: [R(0, 0, 56, 1), R(0, 35, 56, 1), R(0, 0, 1, 36), R(55, 0, 1, 36)],
    blocos: [R(6, 6, 22, 14), R(32, 6, 16, 14), R(8, 26, 16, 8), R(30, 26, 12, 8)],
    internas: [R(7, 7, 13, 12), R(21, 7, 6, 12), R(33, 7, 14, 12), R(9, 27, 14, 6), R(31, 27, 10, 6)],
    portas: [R(20, 12, 1, 2), R(10, 19, 2, 1), R(23, 19, 2, 1), R(38, 19, 2, 1), R(14, 26, 2, 1), R(35, 26, 2, 1)],
    zonas: [
        { ...R(1, 21, 54, 4), piso: 'asfalto', tint: '#000000', a: 0 }, { ...R(1, 20, 54, 1), piso: 'calcada', tint: '#ffffff', a: 0 }, { ...R(1, 25, 54, 1), piso: 'calcada', tint: '#ffffff', a: 0 },
        { ...R(7, 7, 13, 12), tint: '#ffe08a', a: 0.10, vent: 0 }, { ...R(21, 7, 6, 12), tint: '#9fb5c4', a: 0.10, vent: 1 }, { ...R(33, 7, 14, 12), tint: '#9fd6a0', a: 0.12, vent: 0 },
        { ...R(9, 27, 14, 6), tint: '#b08850', a: 0.10, vent: 0 }, { ...R(31, 27, 10, 6), tint: '#d9b27a', a: 0.10, vent: 1 },
    ],
    decor: [
        { tipo: 'heliponto', x: 2, y: 21, w: 5, h: 4 }, J(9, 6), J(12, 6), J(15, 6), J(18, 6), J(35, 6), J(40, 6), J(44, 6),
        { tipo: 'placa', x: 9, y: 19, texto: 'Estúdio' }, { tipo: 'placa', x: 37, y: 19, texto: 'Lab' }, { tipo: 'placa', x: 13, y: 26, texto: 'Depósito' }, { tipo: 'placa', x: 34, y: 26, texto: 'Escrit.' },
    ],
    moveis: [
        // estúdio de pintura: bancadas com bancos, potes de tinta e pincéis (porta em x 10–11, y 18)
        ['bench', 8, 8], ['stool', 8, 9], ['bench', 12, 8], ['stool', 12, 9], ['bench', 16, 8], ['stool', 16, 9],
        ['bench', 8, 12], ['stool', 8, 13], ['bench', 12, 12], ['stool', 12, 13], ['bench', 16, 12], ['stool', 16, 13],
        ['paint_pot', 11, 10], ['paint_pot', 15, 10], ['brush_jar', 8, 10], ['brush_jar', 18, 10], ['dial_tray', 12, 16], ['dial_tray', 16, 16], ['lamp', 19, 8], ['clock', 7, 16],
        // lavatório e vestiário
        ['sink', 22, 8], ['sink', 24, 8], ['locker', 25, 10], ['locker', 25, 13], ['locker', 22, 14], ['fan', 24, 17],
        // laboratório de cristalização
        ['bench', 34, 8], ['bench', 40, 8], ['bench', 34, 12], ['paint_pot', 37, 10], ['paint_pot', 43, 10], ['cabinet', 45, 8], ['sink', 45, 13], ['shelf', 41, 14], ['fan', 44, 17], ['brush_jar', 35, 15],
        // depósito
        ['shelf', 10, 28], ['shelf', 13, 28], ['shelf', 17, 28], ['cabinet', 21, 28], ['dial_tray', 11, 31], ['dial_tray', 18, 31], ['locker', 22, 30],
        // escritório
        ['shelf', 31, 28], ['cabinet', 38, 28], ['clock', 33, 31], ['lamp', 39, 31], ['dial_tray', 35, 30],
        // rua
        ['parked_car', 22, 22], ['parked_car', 40, 23], ['lamp_post', 10, 25], ['lamp_post', 28, 25], ['lamp_post', 46, 25], ['tree', 3, 5], ['tree', 52, 5], ['tree', 3, 31], ['tree', 52, 31], ['tree', 50, 15], ['tree', 28, 33],
    ],
};
