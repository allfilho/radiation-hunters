// ============================================
// ACADEMIA: próximo objetivo e caminho até ele. Funções puras (rodam em Node).
// Ordem linear: lição 1 > chave azul (sala 1) > lições 2 e 3 > porta azul > Geiger (sala 4) > lição 4 > chave vermelha
// (sala 4) > lições 5 a 7 > porta vermelha > lição 8 > fontes que faltam. O jogador pode sair da ordem; o objetivo
// sempre recalcula a partir do que já foi feito.
// ============================================

/**
 * @param e { licoes:number[] (índices feitos 0-7), temGeiger, tenho:{azul,vermelha}, portaAberta:{azul,vermelha},
 *            chavePos:{azul,vermelha} (null se já pegou), geigerPos|null, portaPos:{azul,vermelha},
 *            painel:[{x,y}] x8, salaCentro:[{x,y}] x8, salasComFonteRestante:number[] (índices de sala), achadas, total }
 * @returns { id, n?, cor?, sala?, alvo:{x,y}|null }
 */
export function proximoObjetivo(e) {
    const L = new Set(e.licoes);
    const licao = (i) => ({ id: 'licao', n: i + 1, sala: i + 1, alvo: e.painel[i] || null });
    const chave = (cor) => ({ id: 'chave', cor, alvo: e.chavePos[cor] || null });
    const porta = (cor) => ({ id: 'porta', cor, alvo: e.portaPos[cor] || null });

    if (!L.has(0)) return licao(0);
    if (!e.tenho.azul && e.chavePos.azul && !e.portaAberta.azul) return chave('azul');
    for (const i of [1, 2]) if (!L.has(i)) return licao(i);
    if (!e.portaAberta.azul) return e.tenho.azul ? porta('azul') : (e.chavePos.azul ? chave('azul') : porta('azul'));
    if (!e.temGeiger) return { id: 'geiger', alvo: e.geigerPos || null };
    if (!L.has(3)) return licao(3);
    if (!e.tenho.vermelha && e.chavePos.vermelha && !e.portaAberta.vermelha) return chave('vermelha');
    for (const i of [4, 5, 6]) if (!L.has(i)) return licao(i);
    if (!e.portaAberta.vermelha) return e.tenho.vermelha ? porta('vermelha') : (e.chavePos.vermelha ? chave('vermelha') : porta('vermelha'));
    if (!L.has(7)) return licao(7);
    if (e.achadas < e.total) {
        const sala = (e.salasComFonteRestante || [])[0];
        return { id: 'fontes', sala: sala === undefined ? null : sala + 1, alvo: sala === undefined ? null : (e.salaCentro[sala] || null) };
    }
    return { id: 'fim', alvo: null };
}

export const OBJ_TXT = {
    pt: {
        licao: (o) => `Lição ${o.n}: painel da sala ${o.sala}`,
        chave: (o, nomeCor) => `Pegue a chave ${nomeCor}`,
        porta: (o, nomeCor) => `Abra a porta ${nomeCor}`,
        geiger: () => 'Pegue o Geiger (sala 4)',
        fontes: (o) => o.sala ? `Ache as fontes com o Geiger (sala ${o.sala})` : 'Ache as fontes com o Geiger',
        fim: () => 'Academia concluída!',
        rotulo: 'Próximo', progresso: (l, a, t) => `Lições ${l}/8 · Fontes ${a}/${t}`,
    },
    en: {
        licao: (o) => `Lesson ${o.n}: panel in room ${o.sala}`,
        chave: (o, nomeCor) => `Pick up the ${nomeCor} key`,
        porta: (o, nomeCor) => `Open the ${nomeCor} door`,
        geiger: () => 'Pick up the Geiger (room 4)',
        fontes: (o) => o.sala ? `Find the sources with the Geiger (room ${o.sala})` : 'Find the sources with the Geiger',
        fim: () => 'Academy complete!',
        rotulo: 'Next', progresso: (l, a, t) => `Lessons ${l}/8 · Sources ${a}/${t}`,
    },
};

/**
 * Mapa de distâncias (em passos de 4 vizinhos) de todos os tiles até o alvo, sobre pisos (0) e portas (3).
 * `bloqueados` = Set 'x,y' de móveis. Tiles inalcançáveis ficam sem entrada.
 */
export function mapaDeDistancias(map, bloqueados, alvo) {
    const H = map.length, W = map[0].length, dist = new Map();
    const k = (x, y) => y * W + x;
    const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H && (map[y][x] === 0 || map[y][x] === 3) && !bloqueados.has(x + ',' + y);
    const a = { x: Math.floor(alvo.x), y: Math.floor(alvo.y) };
    if (!ok(a.x, a.y)) return { dist, W, H };
    dist.set(k(a.x, a.y), 0);
    const q = [a];
    for (let i = 0; i < q.length; i++) {
        const c = q[i], d = dist.get(k(c.x, c.y));
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const x = c.x + dx, y = c.y + dy;
            if (ok(x, y) && !dist.has(k(x, y))) { dist.set(k(x, y), d + 1); q.push({ x, y }); }
        }
    }
    return { dist, W, H };
}

/** Ponto (em tiles) a `passos` passos da descida do mapa de distâncias, a partir de (px, py). null se sem caminho. */
export function pontoAdiante(md, px, py, passos = 3) {
    const k = (x, y) => y * md.W + x;
    let x = Math.floor(px), y = Math.floor(py);
    let d = md.dist.get(k(x, y));
    if (d === undefined) return null;
    for (let s = 0; s < passos && d > 0; s++) {
        let melhor = null;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const v = md.dist.get(k(x + dx, y + dy));
            if (v !== undefined && v < d && (melhor === null || v < melhor.v)) melhor = { x: x + dx, y: y + dy, v };
        }
        if (!melhor) break;
        x = melhor.x; y = melhor.y; d = melhor.v;
    }
    return { x: x + 0.5, y: y + 0.5 };
}
