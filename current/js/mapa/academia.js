// ============================================
// ACADEMIA: mapa grande, desenhado à mão, com CORREDOR CENTRAL e 8 salas (57 x 33 tiles).
//
//   +-----+-----+-----+-----+
//   |  1  |  2  |  3  | [4] |     salas 1-4 (fileira de cima), 4 = trancada (chave azul)
//   +--v--+--v--+--v--+-----+
//   ====== corredor central ======
//   +--^--+--^--+--^--+-----+
//   |  5  |  6  |  7  | [8] |     salas 5-8 (fileira de baixo), 8 = trancada (chave vermelha)
//   +-----+-----+-----+-----+
//
// As salas 1-3 e 5-7 abrem para o corredor e se ligam às vizinhas por portas abertas. As salas 4 e 8 não
// têm porta para o corredor: só se entra por uma porta trancada na sala ao lado (3 -> 4 e 7 -> 8), o que
// as deixa "escondidas". A chave azul fica na sala 1 e abre a 4; a chave vermelha fica dentro da 4 e abre a 8.
// Tiles do mapa: 0 piso, 1 parede, 2 móvel, 3 porta trancada (vira 0 quando aberta).
// Função pura sobre o gerador: preenche map, salas, portas, chavesSpec e o ponto inicial.
// ============================================
export const ACADEMIA = { LARG: 13, ALT: 12, CORREDOR: 5 };
export const ACADEMIA_COLUNAS = 57;   // 1 + 4 * (13 + 1)
export const ACADEMIA_LINHAS = 33;    // 1 + 12 + 1 + 5 + 1 + 12 + 1

const PAREDE_TOPO = 0, PAREDE_CORREDOR_CIMA = 13, PAREDE_CORREDOR_BAIXO = 19, PAREDE_FUNDO = 32;
export const SALAS_TRANCADAS = [3, 7];   // índices (0-based) das salas 4 e 8

export function sala(i) {
    const baixo = i >= 4, c = i % 4;
    return { indice: i, x: 1 + c * 14, y: baixo ? 20 : 1, w: ACADEMIA.LARG, h: ACADEMIA.ALT, col: c, linha: baixo ? 1 : 0 };
}

export function desenharAcademia(gen) {
    const L = (x, y, v) => { if (y >= 0 && y < gen.rows && x >= 0 && x < gen.cols) gen.map[y][x] = v; };
    // paredes verticais entre colunas de salas (só nas fileiras de salas) e as molduras
    for (const x of [0, 14, 28, 42, 56]) {
        for (let y = 0; y <= PAREDE_CORREDOR_CIMA; y++) L(x, y, 1);
        for (let y = PAREDE_CORREDOR_BAIXO; y <= PAREDE_FUNDO; y++) L(x, y, 1);
    }
    for (const x of [0, 56]) for (let y = 0; y < gen.rows; y++) L(x, y, 1);
    // paredes horizontais: topo, fundo e as duas que separam as salas do corredor
    for (const y of [PAREDE_TOPO, PAREDE_CORREDOR_CIMA, PAREDE_CORREDOR_BAIXO, PAREDE_FUNDO]) for (let x = 0; x < gen.cols; x++) L(x, y, 1);

    gen.salas = Array.from({ length: 8 }, (_, i) => sala(i));
    const aberta = (x, y, w, h, v = 0) => { for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) L(x + dx, y + dy, v); };
    // portas das salas 1-3 e 5-7 para o corredor (2 tiles de largura)
    for (const i of [0, 1, 2]) aberta(gen.salas[i].x + 6, PAREDE_CORREDOR_CIMA, 2, 1);
    for (const i of [4, 5, 6]) aberta(gen.salas[i].x + 6, PAREDE_CORREDOR_BAIXO, 2, 1);
    // portas abertas entre salas vizinhas: 1-2, 2-3, 5-6, 6-7 (2 tiles de altura)
    for (const [a, x] of [[0, 14], [1, 28], [4, 14], [5, 28]]) aberta(x, gen.salas[a].y + 5, 1, 2);
    // portas TRANCADAS: 3 -> 4 (azul) e 7 -> 8 (vermelha)
    gen.portas = [
        { cor: 'azul', entre: [2, 3], rect: { x: 42, y: gen.salas[2].y + 5, w: 1, h: 2 } },
        { cor: 'vermelha', entre: [6, 7], rect: { x: 42, y: gen.salas[6].y + 5, w: 1, h: 2 } },
    ];
    for (const p of gen.portas) aberta(p.rect.x, p.rect.y, p.rect.w, p.rect.h, 3);
    // chaves: a azul na sala 1, a vermelha dentro da sala 4 (só depois de abrir a azul)
    gen.chavesSpec = [{ cor: 'azul', sala: 0, abre: 'azul' }, { cor: 'vermelha', sala: 3, abre: 'vermelha' }];

    gen.playerStartFixo = { x: gen.salas[0].x + 6, y: gen.salas[0].y + 5 };
    gen.specialZones.push({ x: 1, y: 14, width: 55, height: 5, type: 'corredor', name: 'Corredor central' });
    gen.specialZones.push(...gen.salas.map(s => ({ x: s.x, y: s.y, width: s.w, height: s.h, type: 'sala', name: 'Sala ' + (s.indice + 1) })));
}

/** Móveis: peças de 2 tiles nos cantos (longe das faixas das portas), itens junto às paredes laterais e uma ilha pequena */
export function mobiliarAcademia(gen, tipos) {
    const T = (id) => tipos.find(f => f.id === id) || tipos[0];
    const baixos = ['desk', 'computer', 'shelf'];                      // 2x1
    const unit = ['microscope', 'centrifuge', 'sink', 'biohazard'];     // 1x1
    const altos = ['cabinet', 'fridge'];                               // 1x2
    gen.salas.forEach((s, k) => {
        const rx = s.x, ry = s.y;
        const b = (n) => T(baixos[(k + n) % baixos.length]);
        const u = (n) => T(unit[(k + n) % unit.length]);
        const a = (n) => T(altos[(k + n) % altos.length]);
        gen.tryPlace(b(0), rx + 1, ry);                    // cantos superiores
        gen.tryPlace(b(1), rx + 9, ry);
        gen.tryPlace(b(2), rx + 1, ry + s.h - 1);          // cantos inferiores
        gen.tryPlace(b(3), rx + 9, ry + s.h - 1);
        gen.tryPlace(a(0), rx, ry + 2);                    // paredes laterais, fora das linhas 5-6 (portas)
        gen.tryPlace(a(1), rx + 12, ry + 8);
        gen.tryPlace(u(0), rx + 4, ry + 3);                // ilha pequena
        gen.tryPlace(u(1), rx + 8, ry + 7);
        if (k % 2 === 0) gen.tryPlace(T('machine'), rx + 4, ry + 8);
    });
}
