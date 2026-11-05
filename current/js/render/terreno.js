// ============================================
// TERRENO: piso, paredes e acessórios pintados uma vez numa textura (etapa 5)
// ---------------------------------------------
// Antes, cada ladrilho virava vários objetos do Phaser (centenas por mapa) e os detalhes usavam
// Math.random, então o aspecto mudava a cada partida. Agora o mapa inteiro é desenhado num canvas
// 2D com um gerador pseudoaleatório SEMEADO (mesma missão = mesmo aspecto) e vira uma única imagem.
// Os acessórios de chão (manchas, rachaduras, folhas, entulho) são só visuais: não bloqueiam e não
// alteram nada na física (as fontes continuam dentro dos móveis).
// ============================================

/** gerador pseudoaleatório pequeno (mulberry32) */
export function semente(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const hash = (...n) => n.reduce((h, v) => Math.imul(h ^ (v | 0), 0x45d9f3b) ^ (h >>> 13), 0x9e3779b9) >>> 0;

const rgb = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
function cor(n, f = 1, a = 1) {
    const [r, g, b] = rgb(n);
    const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
    return a >= 1 ? `rgb(${c(r)},${c(g)},${c(b)})` : `rgba(${c(r)},${c(g)},${c(b)},${a})`;
}

// Paletas por tema (cores base em hexadecimal; o resto sai por sombreamento)
const PAL = {
    lab:      { piso: 0x7d93ab, piso2: 0x728aa3, junta: 0x4a5d74, parede: 0xd7dde4, faixa: 0x3b6ea5, base: 0x8e9aa8 },
    junkyard: { piso: 0x6a5c4c, piso2: 0x5a4e40, junta: 0x3d352c, ferro: [0x7d6d5d, 0x6b5b4a, 0x8a5a3c, 0x5b6770, 0x7a4a34], pneu: 0x1c1c1e },
    hospital: { piso: 0x8fa08a, piso2: 0x7f917b, junta: 0x55645a, parede: 0xb5c2b0, rodape: 0x5d6b5f, mancha: 0x2b362c },
    factory:  { piso: 0x6b4f35, piso2: 0x5f4630, junta: 0x2f2217, tijolo: 0x8a4b38, argamassa: 0x3a2a22 },
    nuclear:  { piso: 0x5c6468, piso2: 0x535b5f, junta: 0x2a2f31, parede: 0x3a4044, rachadura: 0x151718 },
    bunker:   { grama: [0x3d5a3d, 0x4d6a4d, 0x355235], tronco: 0x4b3523, copa: [0x2d5a2d, 0x3d7a3d, 0x25492a] },
};

/** pinta o mapa todo. Devolve um canvas (largura = colunas*T*S). */
export function pintarTerreno({ map, themeName, theme, specialZones = [], furniture = [], missao = 0, semente: base = 1, planta = null }, T = 32, S = 2) {
    if(theme?.hospitalAtivo)themeName='lab'; // mesma rotina de tiles, com acabamento conservado
    const rows = map.length, cols = map[0].length, ts = T * S;
    const cv = document.createElement('canvas');
    cv.width = cols * ts; cv.height = rows * ts;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    const P = { ...(PAL[themeName] || PAL.lab), ...(planta?.paleta || {}) };
    const ehParede = (x, y) => (map[y]?.[x] ?? 1) === 1;
    const rng = (x, y, k = 0) => semente(hash(base, x, y, k));
    const ext = planta?.externo ? extPlanta(planta) : null;   // campus: terreno aberto + edifícios (só visual)
    const fora = (x, y) => !!ext && !ext.emBloco(x, y);

    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const t = map[y][x], ox = x * ts, oy = y * ts;
        if (fora(x, y)) {
            if (t === 1 && ext.mar(x, y)) pintarAgua(g, x, y, ox, oy, ts, rng(x, y, 3), S);
            else if (t === 1) pintarBorda(g, P, x, y, ox, oy, ts, rng(x, y, 1), S, ext.cerca(x, y));
            else pintarExterior(g, ext.piso(x, y), P, x, y, ox, oy, ts, rng(x, y, 2), S);
        } else if (t === 1) pintarParede(g, themeName, P, x, y, ox, oy, ts, ehParede, rng(x, y, 1), S);
        else pintarPiso(g, themeName, P, x, y, ox, oy, ts, rng(x, y, 2), S, t);
    }
    if (planta) zonasPlanta(g, planta, ts, S);
    // sombras de contato e janelas depois que todo o piso existe
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const t = map[y][x], ox = x * ts, oy = y * ts;
        if (t === 1) continue;
        if (themeName !== 'bunker') {
            if (ehParede(x, y - 1) && (!fora(x, y) || ext.emBloco(x, y - 1))) { const gr = g.createLinearGradient(0, oy, 0, oy + ts * 0.3); gr.addColorStop(0, 'rgba(0,0,0,0.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(ox, oy, ts, ts * 0.3); }
            if (ehParede(x - 1, y) && (!fora(x, y) || ext.emBloco(x - 1, y))) { const gr = g.createLinearGradient(ox, 0, ox + ts * 0.2, 0); gr.addColorStop(0, 'rgba(0,0,0,0.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(ox, oy, ts * 0.2, ts); }
        }
        if (t === 3) pintarJanela(g, x, y, ox, oy, ts, map, themeName);
    }
    acessorios(g, { map, themeName, P, ts, S, rng, ehParede, specialZones, fora });
    // etapa 5b: itens nas paredes, sombras dos móveis, luzes, identidade da missão e vinheta (tudo só visual)
    const ctx = { map, themeName, P, ts, S, rng, ehParede, rows, cols, W: cv.width, H: cv.height, fora };
    if (planta) decorPlanta(g, ctx, planta); else decorarParedes(g, ctx);
    sombrasMoveis(g, ctx, furniture);
    luzes(g, ctx);
    identidade(g, ctx, missao);
    vinheta(g, ctx);
    return cv;
}

// ------------------------------------------------------------------ campus (áreas externas, só visual)
const PAL_EXT = { grama: [0x4f8a45, 0x57934c, 0x498040], asfalto: 0x4a4d52, calcada: 0xcfc9b6, calcada2: 0xc2bba6, terra: 0x6b4a2f, quadra: 0x3f7f6b, quadra2: 0x3a7664, junta: 0x9a947f };
function extPlanta(planta) {
    const dentro = (lista, x, y) => lista.some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
    return {
        emBloco: (x, y) => dentro(planta.blocos || [], x, y),
        cerca: (x, y) => dentro(planta.cercas || [], x, y),
        mar: (x, y) => dentro(planta.mar || [], x, y),
        piso: (x, y) => { for (const z of planta.zonas || []) if (z.piso && dentro([z], x, y)) return z.piso; return 'grama'; },
    };
}
function pintarExterior(g, piso, P, x, y, ox, oy, ts, r, S) {
    const E = { ...PAL_EXT, ...(P.exterior || {}) }, xadrez = (x + y) % 2 === 0;
    if (piso === 'asfalto') {
        g.fillStyle = cor(E.asfalto, 0.92 + r() * 0.16); g.fillRect(ox, oy, ts, ts);
        for (let i = 0; i < 18; i++) { g.fillStyle = r() > 0.5 ? cor(0x8a8d90, 0.8) : cor(0x1c1e20, 1, 0.5); g.fillRect(ox + r() * ts, oy + r() * ts, S, S); }
        if (x % 4 === 0) { g.fillStyle = 'rgba(240,240,230,0.55)'; g.fillRect(ox, oy, S * 1.5, ts); }                  // faixa de vaga
    } else if (piso === 'calcada') {
        g.fillStyle = cor(xadrez ? E.calcada : E.calcada2, 0.96 + r() * 0.08); g.fillRect(ox, oy, ts, ts);
        g.fillStyle = cor(E.junta, 1, 0.8); g.fillRect(ox, oy, ts, S); g.fillRect(ox, oy, S, ts);
        g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(ox + S, oy + S, ts - 2 * S, S * 2);
    } else if (piso === 'terra') {
        g.fillStyle = cor(E.terra, 0.88 + r() * 0.2); g.fillRect(ox, oy, ts, ts);
        for (let i = 0; i < 20; i++) { g.fillStyle = r() > 0.5 ? cor(0x3a2616, 1, 0.5) : cor(0x8a6a48, 0.9, 0.6); g.fillRect(ox + r() * ts, oy + r() * ts, S * (1 + (r() > 0.7)), S); }
    } else if (piso === 'quadra') {
        g.fillStyle = cor(xadrez ? E.quadra : E.quadra2, 0.96 + r() * 0.06); g.fillRect(ox, oy, ts, ts);
        g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(ox, oy, ts, S);
    } else {                                                                                                  // grama
        const base = E.grama[(x * 7 + y * 13 + Math.floor(r() * 3)) % 3];
        g.fillStyle = cor(base); g.fillRect(ox, oy, ts, ts);
        for (let i = 0; i < 22; i++) { g.fillStyle = r() > 0.85 ? cor(0xd9d36a, 0.9) : cor(base, 0.8 + r() * 0.5); g.fillRect(ox + r() * ts, oy + r() * ts, S * (1 + (r() > 0.6)), S); }
    }
}
/** borda do terreno: muro com cerca (lado da rua) ou mata fechada */
function pintarBorda(g, P, x, y, ox, oy, ts, r, S, cerca) {
    const E = { ...PAL_EXT, ...(P.exterior || {}) }, base = E.grama[(x + y) % 3];
    g.fillStyle = cor(base, 0.7); g.fillRect(ox, oy, ts, ts);
    if (cerca) {
        g.fillStyle = cor(0x9a8f7c); g.fillRect(ox, oy + ts * 0.25, ts, ts * 0.5);
        g.fillStyle = cor(0x7d7260); g.fillRect(ox, oy + ts * 0.7, ts, ts * 0.12);
        g.fillStyle = cor(0xb8ad98); g.fillRect(ox, oy + ts * 0.25, ts, S * 2);
        g.fillStyle = cor(0x6a604f); for (let k = 0; k < 3; k++) g.fillRect(ox + k * ts / 3 + ts / 6, oy + ts * 0.3, S, ts * 0.4);
        return;
    }
    const cx = ox + ts / 2, cy = oy + ts * 0.55;
    g.fillStyle = 'rgba(0,0,0,0.30)'; g.beginPath(); g.ellipse(cx + S * 2, cy + ts * 0.3, ts * 0.38, ts * 0.14, 0, 0, 7); g.fill();
    g.fillStyle = cor(0x5a3d22); g.fillRect(cx - S * 3, cy, S * 6, ts * 0.38);
    for (const [dx, dy, k, c] of [[0, -0.1, 0.4, 0x2e6230], [-0.18, 0.02, 0.3, 0x3f7d3a], [0.2, -0.05, 0.28, 0x4f9448]]) { g.fillStyle = cor(c); g.beginPath(); g.arc(cx + dx * ts, cy + dy * ts - ts * 0.1, ts * (k + r() * 0.04), 0, 7); g.fill(); }
}
/** marcações da quadra: contorno, linha de meio e círculo central */
function marcasQuadra(g, z, ts, S) {
    const x0 = z.x * ts + ts * 0.5, y0 = z.y * ts + ts * 0.5, w = z.w * ts - ts, h = z.h * ts - ts;
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = S * 1.5;
    g.strokeRect(x0, y0, w, h);
    g.beginPath(); g.moveTo(x0, y0 + h / 2); g.lineTo(x0 + w, y0 + h / 2); g.stroke();
    g.beginPath(); g.arc(x0 + w / 2, y0 + h / 2, ts * 1.4, 0, 7); g.stroke();
    g.strokeRect(x0 + w * 0.25, y0, w * 0.5, ts * 2.4); g.strokeRect(x0 + w * 0.25, y0 + h - ts * 2.4, w * 0.5, ts * 2.4);
}

// ------------------------------------------------------------------ piso
function pintarPiso(g, tema, P, x, y, ox, oy, ts, r, S, t) {
    const xadrez = (x + y) % 2 === 0;
    if (tema === 'bunker') {
        const base = P.grama[(x * 7 + y * 13 + Math.floor(r() * 3)) % 3];
        g.fillStyle = cor(base); g.fillRect(ox, oy, ts, ts);
        for (let i = 0; i < 26; i++) {           // pontos de grama e folhas secas
            g.fillStyle = r() > 0.8 ? cor(0x6b5a34, 0.9 + r() * 0.3) : cor(base, 0.8 + r() * 0.5);
            g.fillRect(ox + r() * ts, oy + r() * ts, S * (1 + (r() > 0.6)), S);
        }
        return;
    }
    if (tema === 'junkyard') {
        g.fillStyle = cor(xadrez ? P.piso : P.piso2, 0.9 + r() * 0.25); g.fillRect(ox, oy, ts, ts);
        for (let i = 0; i < 30; i++) {            // cascalho
            g.fillStyle = r() > 0.5 ? cor(0x8a8478, 0.7 + r() * 0.4) : cor(0x2e2822, 1);
            g.fillRect(ox + r() * ts, oy + r() * ts, S * (1 + (r() > 0.7)), S);
        }
        return;
    }
    if (tema === 'factory') {                      // tábuas de madeira, com juntas desencontradas
        g.fillStyle = cor(xadrez ? P.piso : P.piso2, 0.92 + r() * 0.16); g.fillRect(ox, oy, ts, ts);
        g.fillStyle = cor(P.junta, 1);
        for (let k = 0; k < 4; k++) g.fillRect(ox, oy + k * ts / 4, ts, S);
        const j = Math.floor(r() * ts * 0.8);
        g.fillRect(ox + j, oy + Math.floor(r() * 4) * ts / 4, S, ts / 4);
        for (let i = 0; i < 6; i++) { g.fillStyle = cor(0x2a1d12, 1, 0.35); g.fillRect(ox + r() * ts, oy + r() * ts, ts * 0.3, S / 2 + 1); }
        return;
    }
    if (tema === 'nuclear') {                      // lajes de concreto com junta de dilatação
        g.fillStyle = cor(xadrez ? P.piso : P.piso2, 0.9 + r() * 0.2); g.fillRect(ox, oy, ts, ts);
        g.fillStyle = cor(P.junta); g.fillRect(ox, oy, ts, S); g.fillRect(ox, oy, S, ts);
        for (let i = 0; i < 20; i++) { g.fillStyle = cor(0x000000, 1, 0.12 + r() * 0.12); g.fillRect(ox + r() * ts, oy + r() * ts, S * 2, S); }
        return;
    }
    if (tema === 'hospital') {                     // linóleo xadrez, desgastado
        g.fillStyle = cor(xadrez ? P.piso : P.piso2, 0.85 + r() * 0.2); g.fillRect(ox, oy, ts, ts);
        g.strokeStyle = cor(P.junta, 1, 0.55); g.lineWidth = S; g.strokeRect(ox + S / 2, oy + S / 2, ts - S, ts - S);
        for (let i = 0; i < 8; i++) { g.fillStyle = cor(0xffffff, 1, 0.05); g.fillRect(ox + r() * ts, oy + r() * ts, S * 3, S); }
        return;
    }
    // lab: piso vinílico claro com junta fina
    g.fillStyle = cor(xadrez ? P.piso : P.piso2, 0.95 + r() * 0.08); g.fillRect(ox, oy, ts, ts);
    g.fillStyle = cor(P.junta, 1, 0.7); g.fillRect(ox, oy, ts, S); g.fillRect(ox, oy, S, ts);
    g.fillStyle = cor(0xffffff, 1, 0.07); g.fillRect(ox + S, oy + S, ts - 2 * S, S * 2);
}

// ------------------------------------------------------------------ parede
function pintarParede(g, tema, P, x, y, ox, oy, ts, ehParede, r, S) {
    const abaixoLivre = !ehParede(x, y + 1);       // há piso abaixo: mostra a face frontal
    const alt = abaixoLivre ? ts * 0.62 : ts;      // altura do topo
    if (tema === 'bunker') {                       // árvore: chão + tronco + copa
        const base = P.grama[(x + y) % 3];
        g.fillStyle = cor(base, 0.7); g.fillRect(ox, oy, ts, ts);
        const cx = ox + ts / 2, cy = oy + ts * 0.55;
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(cx + S * 2, cy + ts * 0.3, ts * 0.38, ts * 0.14, 0, 0, 7); g.fill();
        g.fillStyle = cor(P.tronco); g.fillRect(cx - S * 3, cy, S * 6, ts * 0.38);
        const raio = ts * (0.36 + r() * 0.06);
        P.copa.forEach((c, i) => { g.fillStyle = cor(c, 1); g.beginPath(); g.arc(cx + (i - 1) * S * 3, cy - ts * 0.12 - i * S * 2, raio - i * S * 2, 0, 7); g.fill(); });
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(cx - S * 5, cy - ts * 0.3, raio * 0.35, 0, 7); g.fill();
        return;
    }
    if (tema === 'junkyard') { sucata(g, P, ox, oy, ts, r, S); return; }
    let topo, frente;
    if (tema === 'factory') { topo = P.tijolo; frente = P.tijolo; }
    else if (tema === 'nuclear') { topo = P.parede; frente = P.parede; }
    else if (tema === 'hospital') { topo = P.parede; frente = P.parede; }
    else { topo = P.parede; frente = P.parede; }
    // topo
    g.fillStyle = cor(topo, 1.05); g.fillRect(ox, oy, ts, alt);
    // face frontal
    if (abaixoLivre) {
        g.fillStyle = cor(frente, 0.72); g.fillRect(ox, oy + alt, ts, ts - alt);
        g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(ox, oy + ts - S * 2, ts, S * 2);
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(ox, oy + alt, ts, S);
    }
    if (tema === 'factory') {                      // tijolos
        g.fillStyle = cor(P.argamassa);
        const linhas = abaixoLivre ? 5 : 4;
        for (let k = 1; k < linhas; k++) g.fillRect(ox, oy + k * ts / linhas, ts, S);
        for (let k = 0; k < linhas; k++) { const off = (k % 2) * ts / 4; g.fillRect(ox + off + ts / 4, oy + k * ts / linhas, S, ts / linhas); g.fillRect(ox + off + 3 * ts / 4 - ts / 2 * (off ? 1 : 0) , oy + k * ts / linhas, S, ts / linhas); }
        for (let i = 0; i < 6; i++) { g.fillStyle = cor(0x000000, 1, 0.1 + r() * 0.12); g.fillRect(ox + r() * ts, oy + r() * ts, ts * 0.2, ts * 0.12); }
    } else if (tema === 'nuclear') {               // concreto danificado
        for (let i = 0; i < 14; i++) { g.fillStyle = cor(0x000000, 1, 0.12 + r() * 0.1); g.fillRect(ox + r() * ts, oy + r() * ts, S * 3, S * 2); }
        if (r() > 0.55) { g.strokeStyle = cor(P.rachadura); g.lineWidth = S; g.beginPath(); let px = ox + r() * ts, py = oy; g.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * ts * 0.4; py += ts * 0.2; g.lineTo(px, py); } g.stroke(); }
        if (r() > 0.8) { g.strokeStyle = cor(0x7a4a2a); g.lineWidth = S; const px = ox + r() * ts; g.beginPath(); g.moveTo(px, oy + ts * 0.5); g.lineTo(px + S * 3, oy + alt); g.stroke(); } // vergalhão exposto
    } else if (tema === 'hospital') {              // pintura descascando e rodapé escuro
        g.fillStyle = cor(P.rodape); g.fillRect(ox, oy + alt - S * 3, ts, S * 3);
        for (let i = 0; i < 3; i++) if (r() > 0.5) { g.fillStyle = cor(P.mancha, 1, 0.45); g.fillRect(ox + r() * ts * 0.7, oy + r() * alt * 0.7, ts * (0.1 + r() * 0.25), ts * (0.08 + r() * 0.2)); }
    } else {                                        // lab: painel com faixa azul
        g.fillStyle = cor(P.faixa); g.fillRect(ox, oy + alt * 0.55, ts, S * 3);
        g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(ox, oy + alt - S, ts, S);
        g.fillRect(ox + ts - S, oy, S, alt);
    }
    // bordas laterais onde a parede encontra piso
    if (!ehParede(x - 1, y)) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(ox, oy, S, ts); }
    if (!ehParede(x + 1, y)) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(ox + ts - S, oy, S, ts); }
    if (!ehParede(x, y - 1)) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(ox, oy, ts, S); }
}

/** pilha de sucata para o ferro-velho (cada ladrilho de "parede" vira uma pilha diferente) */
function sucata(g, P, ox, oy, ts, r, S) {
    g.fillStyle = cor(P.piso2, 0.8); g.fillRect(ox, oy, ts, ts);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(ox + ts / 2, oy + ts * 0.85, ts * 0.45, ts * 0.12, 0, 0, 7); g.fill();
    const tipo = Math.floor(r() * 4);
    if (tipo === 0) {                              // pilha de pneus
        for (let i = 0; i < 3; i++) {
            const cx = ox + ts * (0.3 + 0.4 * (i % 2)) + (r() - 0.5) * S * 3, cy = oy + ts * (0.35 + 0.25 * i);
            g.fillStyle = cor(P.pneu); g.beginPath(); g.arc(cx, cy, ts * 0.22, 0, 7); g.fill();
            g.fillStyle = cor(0x4a4a4e); g.beginPath(); g.arc(cx, cy, ts * 0.1, 0, 7); g.fill();
        }
    } else if (tipo === 1) {                       // chapas onduladas empilhadas
        const c = P.ferro[Math.floor(r() * P.ferro.length)];
        for (let k = 0; k < 3; k++) { const yy = oy + ts * (0.18 + 0.24 * k); g.fillStyle = cor(c, 0.8 + 0.15 * k); g.fillRect(ox + ts * 0.08 + k * S, yy, ts * 0.84, ts * 0.2);
            g.fillStyle = 'rgba(0,0,0,0.25)'; for (let s = 0; s < 8; s++) g.fillRect(ox + ts * 0.1 + s * ts * 0.1, yy, S, ts * 0.2); }
    } else if (tipo === 2) {                       // carcaça de carro amassada
        const c = P.ferro[Math.floor(r() * P.ferro.length)];
        g.fillStyle = cor(c); g.fillRect(ox + ts * 0.08, oy + ts * 0.3, ts * 0.84, ts * 0.45);
        g.fillStyle = cor(c, 0.75); g.fillRect(ox + ts * 0.25, oy + ts * 0.14, ts * 0.5, ts * 0.22);
        g.fillStyle = 'rgba(120,170,200,0.5)'; g.fillRect(ox + ts * 0.3, oy + ts * 0.18, ts * 0.18, ts * 0.14);
        g.fillStyle = cor(P.pneu); g.beginPath(); g.arc(ox + ts * 0.27, oy + ts * 0.78, ts * 0.11, 0, 7); g.arc(ox + ts * 0.73, oy + ts * 0.78, ts * 0.11, 0, 7); g.fill();
    } else {                                       // barris enferrujados
        for (let i = 0; i < 2; i++) { const cx = ox + ts * (0.3 + 0.4 * i), cy = oy + ts * (0.45 + 0.1 * i); g.fillStyle = cor(P.ferro[(i + 2) % 5]); g.fillRect(cx - ts * 0.16, cy - ts * 0.22, ts * 0.32, ts * 0.44);
            g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(cx - ts * 0.16, cy - ts * 0.08, ts * 0.32, S); g.fillRect(cx - ts * 0.16, cy + ts * 0.08, ts * 0.32, S); }
    }
    for (let i = 0; i < 5; i++) { g.fillStyle = cor(0x8b4513, 1, 0.5); g.fillRect(ox + r() * ts, oy + r() * ts, S * 2, S * 2); }  // ferrugem
}

// ------------------------------------------------------------------ janela (fábrica)
function pintarJanela(g, x, y, ox, oy, ts, map, tema) {
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(ox, oy, ts, ts);
    const gr = g.createLinearGradient(0, oy + ts * 0.15, 0, oy + ts * 0.55);
    gr.addColorStop(0, 'rgba(180,220,240,0.85)'); gr.addColorStop(1, 'rgba(110,160,190,0.7)');
    g.fillStyle = gr; g.fillRect(ox + ts * 0.1, oy + ts * 0.15, ts * 0.8, ts * 0.4);
    g.strokeStyle = 'rgba(200,200,200,0.9)'; g.lineWidth = 2; g.strokeRect(ox + ts * 0.1, oy + ts * 0.15, ts * 0.8, ts * 0.4);
    g.beginPath(); g.moveTo(ox + ts / 2, oy + ts * 0.15); g.lineTo(ox + ts / 2, oy + ts * 0.55); g.stroke();
    // luz entrando no piso
    const luz = g.createLinearGradient(0, oy + ts * 0.6, 0, oy + ts * 1.6);
    luz.addColorStop(0, 'rgba(255,240,190,0.22)'); luz.addColorStop(1, 'rgba(255,240,190,0)');
    g.fillStyle = luz; g.fillRect(ox + ts * 0.1, oy + ts * 0.6, ts * 0.8, ts);
}

// ------------------------------------------------------------------ acessórios (só visuais)
function acessorios(g, { map, themeName, P, ts, S, rng, ehParede, specialZones, fora }) {
    const rows = map.length, cols = map[0].length;
    for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) {
        if (map[y][x] !== 0 && map[y][x] !== 2) continue;
        if (fora && fora(x, y)) continue;
        const r = rng(x, y, 77), ox = x * ts, oy = y * ts;
        const p = r();
        if (themeName === 'lab') {
            if (p < 0.05) { g.fillStyle = 'rgba(40,60,80,0.35)'; g.fillRect(ox + r() * ts * 0.5, oy + ts * 0.9, ts * 0.5, S); }                     // cabo
            else if (p < 0.08) mancha(g, ox + ts * 0.5, oy + ts * 0.5, ts * 0.15, r, 'rgba(50,70,90,0.25)');
        } else if (themeName === 'junkyard') {
            if (p < 0.06) mancha(g, ox + ts * 0.5, oy + ts * 0.5, ts * 0.2, r, 'rgba(15,10,8,0.5)');                                                  // óleo
            else if (p < 0.1) { g.fillStyle = 'rgba(30,25,20,0.35)'; g.fillRect(ox, oy + ts * 0.3, ts, S * 3); g.fillRect(ox, oy + ts * 0.7, ts, S * 3); } // marca de pneu
            else if (p < 0.14) { g.fillStyle = cor(0x5d7a3d, 1, 0.8); for (let i = 0; i < 4; i++) g.fillRect(ox + r() * ts, oy + r() * ts, S, S * 3); } // mato
        } else if (themeName === 'hospital') {
            if (p < 0.07) mancha(g, ox + ts * 0.5, oy + ts * 0.5, ts * 0.22, r, 'rgba(25,40,30,0.4)');                                                // infiltração
            else if (p < 0.11) { g.strokeStyle = 'rgba(20,30,22,0.6)'; g.lineWidth = S; g.beginPath(); let px = ox + r() * ts, py = oy + r() * ts * 0.3; g.moveTo(px, py); for (let k = 0; k < 3; k++) { px += (r() - 0.3) * ts * 0.3; py += ts * 0.25; g.lineTo(px, py); } g.stroke(); } // rachadura
            else if (p < 0.14) { g.fillStyle = 'rgba(230,230,220,0.55)'; g.fillRect(ox + r() * ts * 0.7, oy + r() * ts * 0.7, ts * 0.18, ts * 0.12); }   // papel
        } else if (themeName === 'factory') {
            if (p < 0.05) mancha(g, ox + ts * 0.5, oy + ts * 0.5, ts * 0.17, r, 'rgba(20,12,6,0.4)');
            else if (p < 0.09) { g.fillStyle = 'rgba(30,20,10,0.5)'; g.fillRect(ox + r() * ts * 0.6, oy + r() * ts, ts * 0.25, S * 1.5); }                // lasca
        } else if (themeName === 'nuclear') {
            if (p < 0.09) { g.fillStyle = cor(0x1a1c1d, 1, 0.8); for (let i = 0; i < 5; i++) g.fillRect(ox + r() * ts, oy + r() * ts, S * (1 + r() * 3), S * (1 + r() * 2)); } // entulho
            else if (p < 0.13) { g.strokeStyle = cor(P.rachadura); g.lineWidth = S; g.beginPath(); let px = ox + r() * ts, py = oy; g.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * ts * 0.4; py += ts * 0.25; g.lineTo(px, py); } g.stroke(); }
        } else if (themeName === 'bunker') {
            if (p < 0.05) { g.fillStyle = cor(0x7a7a72); g.beginPath(); g.ellipse(ox + ts * 0.5, oy + ts * 0.6, ts * 0.14, ts * 0.1, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(ox + ts * 0.42, oy + ts * 0.52, S * 3, S * 2); } // pedra
            else if (p < 0.1) { g.fillStyle = cor(0x2d4a2a); for (let i = 0; i < 5; i++) { g.save(); g.translate(ox + ts * 0.5, oy + ts * 0.7); g.rotate(-1.2 + i * 0.55); g.fillRect(0, 0, S, ts * 0.22); g.restore(); } } // samambaia
            else if (p < 0.14) { g.fillStyle = cor(0x7d5a32, 1, 0.8); for (let i = 0; i < 4; i++) g.fillRect(ox + r() * ts, oy + r() * ts, S * 2, S * 2); } // folhas
        }
    }
    // marcação de perigo na zona do reator (faixas amarelo e preto no piso)
    for (const z of specialZones) {
        if (z.type !== 'reactor') continue;
        const x0 = z.x * ts, y0 = z.y * ts, w = z.width * ts, h = z.height * ts;
        g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
        g.strokeStyle = 'rgba(255,204,0,0.20)'; g.lineWidth = S * 3;
        for (let d = -h; d < w; d += S * 12) { g.beginPath(); g.moveTo(x0 + d, y0 + h); g.lineTo(x0 + d + h, y0); g.stroke(); }
        g.restore();
        g.strokeStyle = 'rgba(255,204,0,0.55)'; g.lineWidth = S * 2; g.strokeRect(x0 + S, y0 + S, w - 2 * S, h - 2 * S);
    }
}
function mancha(g, cx, cy, raio, r, c) {
    g.fillStyle = c;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(cx + (r() - 0.5) * raio, cy + (r() - 0.5) * raio, raio * (0.5 + r() * 0.5), raio * (0.35 + r() * 0.4), r() * 3, 0, 7); g.fill(); }
}


// ------------------------------------------------------------------ etapa 5b
// Tudo abaixo é só visual: não bloqueia, não muda a física e não afirma fatos históricos.
// Os símbolos nas paredes são ícones genéricos (sem texto, para não depender do idioma).

/** itens presos na face frontal das paredes (onde há piso logo abaixo) */
function decorarParedes(g, { map, themeName, P, ts, S, rng, ehParede, rows, cols }) {
    if (themeName === 'junkyard' || themeName === 'bunker') return;
    const alt = ts * 0.62;
    let anterior = -9;
    for (let y = 0; y < rows - 1; y++) {
        anterior = -9;
        for (let x = 1; x < cols - 1; x++) {
            if (map[y][x] !== 1 || ehParede(x, y + 1) || (map[y + 1]?.[x] ?? 1) === 1) continue;
            const r = rng(x, y, 301);
            if (r() > 0.42 || x - anterior < 2) continue;
            anterior = x;
            const ox = x * ts, fy = y * ts + alt + S * 2, h = ts - alt - S * 4, cx = ox + ts / 2;
            const tipos = { lab: 5, hospital: 4, factory: 3, nuclear: 4 }[themeName] || 3;
            const k = Math.floor(r() * tipos);
            if (themeName === 'lab') {
                if (k === 0) { g.fillStyle = cor(0xf2c200); g.fillRect(cx - S * 4, fy, S * 8, h); g.fillStyle = cor(0x111111); g.beginPath(); g.arc(cx, fy + h / 2, S * 1.5, 0, 7); g.fill(); }          // placa de radiação (ícone)
                else if (k === 1) { g.fillStyle = cor(0xf4f6f8); g.fillRect(cx - S * 6, fy - S, S * 12, h + S); g.fillStyle = cor(0x3b6ea5); g.fillRect(cx - S * 5, fy + S, S * 6, S); g.fillRect(cx - S * 5, fy + S * 3, S * 9, S); }  // quadro
                else if (k === 2) { g.fillStyle = cor(0x6f7b88); g.fillRect(cx - S * 5, fy, S * 10, h); g.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = 1; i < 4; i++) g.fillRect(cx - S * 5, fy + i * h / 4, S * 10, S / 2 + 1); }  // grade de ventilação
                else if (k === 3) { g.fillStyle = cor(0xc0392b); g.fillRect(cx - S * 2, fy - S, S * 4, h + S); g.fillStyle = cor(0x222222); g.fillRect(cx - S, fy - S * 2, S * 2, S); }       // extintor
                else { g.fillStyle = cor(0xf4f6f8); g.beginPath(); g.arc(cx, fy + h / 2, h * 0.55, 0, 7); g.fill(); g.strokeStyle = cor(0x333333); g.lineWidth = S / 2 + 1; g.beginPath(); g.moveTo(cx, fy + h / 2); g.lineTo(cx, fy + h * 0.15); g.moveTo(cx, fy + h / 2); g.lineTo(cx + S * 2, fy + h / 2); g.stroke(); }  // relógio
            } else if (themeName === 'hospital') {
                if (k === 0) { g.fillStyle = cor(0xe8efe8); g.fillRect(cx - S * 4, fy - S, S * 8, h + S); g.fillStyle = cor(0x2e8b57); g.fillRect(cx - S, fy - S, S * 2, h + S); g.fillRect(cx - S * 3, fy + h / 2 - S, S * 6, S * 2); }   // cruz
                else if (k === 1) { g.fillStyle = cor(0x9c7a4a); g.fillRect(cx - S * 6, fy - S, S * 12, h + S); g.fillStyle = cor(0xf0efe6); g.fillRect(cx - S * 4, fy, S * 3, S * 4); g.fillRect(cx + S, fy + S, S * 3, S * 4); }                 // mural de avisos
                else if (k === 2) { g.fillStyle = cor(0x7f8c85); g.fillRect(cx - S * 5, fy, S * 10, h); g.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 1; i < 4; i++) g.fillRect(cx - S * 5, fy + i * h / 4, S * 10, S / 2 + 1); }
                else { g.fillStyle = cor(0xd9dfd6); g.fillRect(ox, fy + h * 0.45, ts, S * 2); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(ox, fy + h * 0.45 + S * 2, ts, S / 2 + 1); }          // corrimão
            } else if (themeName === 'factory') {
                if (k === 0) { g.fillStyle = cor(0x4b4f52); g.fillRect(ox, fy, ts, S * 3); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(ox, fy, ts, S); g.fillStyle = cor(0x2c2f31); g.fillRect(ox + ts - S * 3, fy - S, S * 3, S * 5); }  // tubo
                else if (k === 1) { g.fillStyle = cor(0xd8d2c0); g.beginPath(); g.arc(cx, fy + h / 2, h * 0.55, 0, 7); g.fill(); g.strokeStyle = cor(0x222222); g.lineWidth = S / 2 + 1; g.beginPath(); g.moveTo(cx, fy + h / 2); g.lineTo(cx + S * 2, fy + h * 0.2); g.stroke(); }  // manômetro
                else { g.fillStyle = cor(0x2c2f31); g.fillRect(cx - S * 4, fy - S, S * 8, S * 2); g.fillStyle = cor(0xffd27a); g.fillRect(cx - S * 3, fy + S, S * 6, S * 2); }                    // luminária
            } else {                                                   // nuclear
                if (k === 0) { g.fillStyle = cor(0xf2c200); g.beginPath(); g.moveTo(cx, fy - S); g.lineTo(cx + S * 5, fy + h); g.lineTo(cx - S * 5, fy + h); g.closePath(); g.fill(); g.fillStyle = cor(0x111111); g.fillRect(cx - S / 2, fy + h * 0.35, S, h * 0.35); }  // triângulo de perigo
                else if (k === 1) { g.fillStyle = cor(0x2a2f31); g.fillRect(ox, fy, ts, S * 4); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(ox, fy, ts, S); }                          // eletroduto
                else if (k === 2) { g.fillStyle = cor(0x5a2020); g.beginPath(); g.arc(cx, fy + h / 2, S * 2.5, 0, 7); g.fill(); g.fillStyle = cor(0xff4a3a); g.beginPath(); g.arc(cx, fy + h / 2, S * 1.5, 0, 7); g.fill(); }  // luz de alarme
                else { g.fillStyle = cor(0x1f2427); g.fillRect(cx - S * 5, fy, S * 10, h); g.fillStyle = cor(0x38d26a); g.fillRect(cx - S * 4, fy + S, S * 2, S * 2); g.fillStyle = cor(0xf2c200); g.fillRect(cx - S, fy + S, S * 2, S * 2); g.fillStyle = cor(0xff4a3a); g.fillRect(cx + S * 2, fy + S, S * 2, S * 2); }  // painel de LEDs
            }
        }
    }
}

/** sombra suave embaixo de cada móvel (deslocada para baixo e para a direita) */
function sombrasMoveis(g, { ts, S }, furniture) {
    for (const f of furniture) {
        const w = f.type.width * ts, h = f.type.height * ts;
        const cx = (f.x) * ts + w / 2 + S * 2, cy = (f.y) * ts + h * 0.88 + S * 2;
        g.save(); g.translate(cx, cy); g.scale(1, 0.32);
        const rad = w * 0.62;
        const gr = g.createRadialGradient(0, 0, rad * 0.25, 0, 0, rad);
        gr.addColorStop(0, 'rgba(0,0,0,0.34)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rad, 0, 7); g.fill();
        g.restore();
    }
}

/** poças de luz no piso (lâmpadas do teto, luminárias) e brilho das luzes de alarme nas paredes */
function luzes(g, { map, themeName, ts, S, rng, ehParede, rows, cols, fora }) {
    const cor_ = { lab: '255,255,245', hospital: '235,255,235', factory: '255,214,140', nuclear: '255,70,50' }[themeName];
    if (!cor_) return;
    const a = themeName === 'nuclear' ? 0.10 : 0.12;
    for (let y = 1; y < rows - 1; y += 3) for (let x = 1; x < cols - 1; x += 4) {
        const r = rng(x, y, 401), px = x + Math.floor(r() * 3), py = y + Math.floor(r() * 2);
        if ((map[py]?.[px] ?? 1) === 1 || (fora && fora(px, py)) || (themeName === 'nuclear' && r() > 0.5)) continue;
        const cx = (px + 0.5) * ts, cy = (py + 0.5) * ts, rad = ts * 1.7;
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
        gr.addColorStop(0, `rgba(${cor_},${a})`); gr.addColorStop(1, `rgba(${cor_},0)`);
        g.fillStyle = gr; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    }
}

/** identidade visual de cada missão: tonalidade e adereços (só estética; sem afirmar fatos) */
function identidade(g, { map, themeName, P, ts, S, rng, ehParede, rows, cols, W, H }, missao) {
    const tons = { 1: ['120,170,255', 0.05], 2: ['210,160,90', 0.07], 3: ['255,170,70', 0.07], 4: ['110,150,120', 0.09],
        5: ['40,110,60', 0.06], 6: ['120,200,170', 0.06], 7: ['230,140,70', 0.07], 8: ['80,120,170', 0.10] };
    const tom = tons[missao];
    if (tom) { g.fillStyle = `rgba(${tom[0]},${tom[1]})`; g.fillRect(0, 0, W, H); }
    const livre = (x, y) => (map[y]?.[x] ?? 1) !== 1;
    for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) {
        if (!livre(x, y)) continue;
        const r = rng(x, y, 501), p = r(), ox = x * ts, oy = y * ts;
        if (missao === 8 && p < 0.07) {                      // poças d'água com reflexo
            g.fillStyle = 'rgba(40,70,100,0.45)'; g.beginPath(); g.ellipse(ox + ts / 2, oy + ts * 0.6, ts * (0.25 + r() * 0.2), ts * 0.14, 0, 0, 7); g.fill();
            g.fillStyle = 'rgba(210,235,255,0.35)'; g.fillRect(ox + ts * 0.35, oy + ts * 0.56, ts * 0.18, S);
        } else if (missao === 5 && p < 0.05) {               // troncos caídos e lenha solta
            g.fillStyle = cor(0x5a3d22); g.fillRect(ox + ts * 0.1, oy + ts * 0.55, ts * 0.75, S * 3);
            g.fillStyle = cor(0x8a6a44); g.beginPath(); g.arc(ox + ts * 0.85, oy + ts * 0.55 + S * 1.5, S * 2, 0, 7); g.fill();
        } else if ((missao === 2 || missao === 7) && p < 0.06) {   // lixo e fardos de sucata (chão)
            const c = [0x7d6d5d, 0x5b6770, 0x8a5a3c, 0xb0a090][Math.floor(r() * 4)];
            g.fillStyle = cor(c); g.fillRect(ox + ts * 0.25, oy + ts * 0.4, ts * 0.3, ts * 0.2);
            g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(ox + ts * 0.25, oy + ts * 0.58, ts * 0.3, S);
        } else if (missao === 3 && p < 0.05) {               // serragem e pó claro no chão da fábrica
            g.fillStyle = 'rgba(235,225,200,0.28)'; for (let i = 0; i < 6; i++) g.fillRect(ox + r() * ts, oy + r() * ts, S * 2, S);
        } else if (missao === 6 && p < 0.04) {               // marcas de maca no piso
            g.fillStyle = 'rgba(20,25,20,0.3)'; g.fillRect(ox + ts * 0.2, oy + ts * 0.3, S * 2, ts * 0.4); g.fillRect(ox + ts * 0.7, oy + ts * 0.3, S * 2, ts * 0.4);
        } else if (missao === 1 && p < 0.03) {               // fita de segurança no chão
            g.fillStyle = cor(0xf2c200, 1, 0.55); g.fillRect(ox, oy + ts * 0.45, ts, S * 2);
            g.fillStyle = 'rgba(0,0,0,0.55)'; for (let i = 0; i < 8; i++) g.fillRect(ox + i * ts / 8, oy + ts * 0.45, ts / 16, S * 2);
        }
    }
}

/** escurece levemente as bordas (foco no centro, ambiente mais denso) */
function vinheta(g, { W, H }) {
    const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.52);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.30)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------------ plantas das investigações (só visual)
/** tinta de piso por ambiente + sinais de ventilação: setas de ar sob janelas abertas, poeira parada onde há pouca ventilação */
function zonasPlanta(g, planta, ts, S) {
    for (const z of planta.zonas || []) {
        g.fillStyle = z.tint; g.globalAlpha = z.a; g.fillRect(z.x * ts, z.y * ts, z.w * ts, z.h * ts); g.globalAlpha = 1;
        if (z.piso === 'quadra') marcasQuadra(g, z, ts, S);
        if (z.vent === undefined) continue;
        const janelas = (planta.decor || []).filter((d) => (d.tipo === 'janela' || d.tipo === 'grade') && d.estado === 'aberta' && d.x >= z.x && d.x < z.x + z.w && d.y === z.y - 1);
        if (z.vent === 2) for (const j of janelas) {                      // setas descendo da janela aberta
            for (let k = 0; k < 3; k++) {
                const cx = j.x * ts + ts / 2, cy = (z.y + 0.6 + k * 1.1) * ts;
                g.strokeStyle = 'rgba(255,255,255,0.30)'; g.lineWidth = S * 1.6; g.lineCap = 'round'; g.lineJoin = 'round';
                g.beginPath(); g.moveTo(cx - ts * 0.16, cy - ts * 0.08); g.lineTo(cx, cy + ts * 0.1); g.lineTo(cx + ts * 0.16, cy - ts * 0.08); g.stroke();
            }
        }
        if (z.vent === 0) {                                                // ar parado: pontos de poeira
            const r = semente((z.x * 131 + z.y * 17) | 0);
            g.fillStyle = 'rgba(70,60,40,0.20)';
            for (let i = 0; i < z.w * z.h * 0.9; i++) g.fillRect((z.x + r() * z.w) * ts, (z.y + r() * z.h) * ts, S * 1.4, S * 1.4);
        }
    }
}

/** itens na face das paredes: janelas (aberta/entreaberta/fechada), grade de ventilação, quadro, cartazes, placas de sala */
function decorPlanta(g, { map, ts, S, ehParede }, planta) {
    const livreAbaixo = (x, y) => !ehParede(x, y + 1);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const d of planta.decor || []) {
        if (d.tipo === 'heliponto') { heliponto(g, d, ts, S); continue; }
        if (!livreAbaixo(d.x, d.y)) continue;
        const ox = d.x * ts, oy = d.y * ts, alt = ts * 0.62, cx = ox + ts / 2;
        if (d.tipo === 'janela') {
            const x0 = ox + ts * 0.12, y0 = oy + ts * 0.14, w = ts * 0.76, h = ts * 0.74;
            g.fillStyle = '#44505a'; g.fillRect(x0 - S, y0 - S, w + 2 * S, h + 2 * S);                       // moldura
            if (d.estado === 'aberta') {
                g.fillStyle = '#e9f6ff'; g.fillRect(x0, y0, w, h);                                           // vão aberto: luz e céu
                g.fillStyle = '#9fd3f2'; g.fillRect(x0, y0, w, h * 0.45);
                g.fillStyle = 'rgba(210,235,250,0.85)'; g.fillRect(x0, y0 + h * 0.5, w * 0.28, h * 0.5);       // folha empurrada para fora
                g.fillStyle = 'rgba(210,235,250,0.85)'; g.fillRect(x0 + w * 0.72, y0 + h * 0.5, w * 0.28, h * 0.5);
            } else if (d.estado === 'entreaberta') {
                g.fillStyle = '#7fb3d1'; g.fillRect(x0, y0, w, h);
                g.fillStyle = '#e9f6ff'; g.fillRect(x0 + w * 0.5, y0, w * 0.5, h * 0.35);                    // fresta
                g.strokeStyle = '#44505a'; g.lineWidth = S; g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx, y0 + h); g.stroke();
            } else {
                g.fillStyle = '#6f95ad'; g.fillRect(x0, y0, w, h);                                           // vidro fechado
                g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x0 + S, y0 + S, w * 0.3, h * 0.25);
                g.strokeStyle = '#2f3b44'; g.lineWidth = S * 1.4; g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx, y0 + h); g.moveTo(x0, y0 + h * 0.5); g.lineTo(x0 + w, y0 + h * 0.5); g.stroke();
                g.fillStyle = '#d9b34a'; g.fillRect(cx - S * 1.5, y0 + h * 0.5 - S * 3, S * 3, S * 6);        // trinco
            }
        } else if (d.tipo === 'grade') {
            const x0 = ox + ts * 0.14, y0 = oy + ts * 0.2, w = ts * 0.72, h = ts * 0.6;
            g.fillStyle = '#39434b'; g.fillRect(x0 - S, y0 - S, w + 2 * S, h + 2 * S);
            g.fillStyle = d.estado === 'aberta' ? '#b9c4cc' : '#8b969e'; g.fillRect(x0, y0, w, h);
            g.fillStyle = d.estado === 'aberta' ? '#1c2328' : '#69747c';
            for (let i = 1; i < 5; i++) g.fillRect(x0, y0 + (h * i) / 5, w, S * (d.estado === 'aberta' ? 1.6 : 0.8));
            if (d.estado === 'aberta') { g.fillStyle = '#d9fff0'; g.beginPath(); g.arc(cx, y0 + h / 2, S * 2.4, 0, 7); g.fill(); }  // pás do exaustor
        } else if (d.tipo === 'quadro') {
            const w = (d.w || 2) * ts, x0 = ox + ts * 0.08, y0 = oy + ts * 0.16, h = ts * 0.68;
            g.fillStyle = '#8a6a40'; g.fillRect(x0 - S, y0 - S, w - ts * 0.16 + 2 * S, h + 2 * S);
            g.fillStyle = '#2f5a45'; g.fillRect(x0, y0, w - ts * 0.16, h);
            g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = S; g.beginPath();
            for (let k = 0; k < 3; k++) { g.moveTo(x0 + ts * 0.2, y0 + h * (0.28 + k * 0.22)); g.lineTo(x0 + ts * (0.5 + 0.45 * ((k * 3 + 1) % 3)), y0 + h * (0.28 + k * 0.22)); }
            g.stroke();
            // o quadro cobre (d.w) tiles: as casas seguintes são só reservadas
        } else if (d.tipo === 'cartaz') {
            const w = ts * 0.56, h = ts * 0.66, x0 = cx - w / 2, y0 = oy + ts * 0.17;
            g.fillStyle = '#f3ecd5'; g.fillRect(x0, y0, w, h); g.strokeStyle = '#6b5b3a'; g.lineWidth = S; g.strokeRect(x0, y0, w, h);
            g.fillStyle = '#1f2b33'; g.strokeStyle = '#1f2b33'; g.font = `bold ${Math.round(ts * 0.3)}px sans-serif`;
            if (d.simbolo === 'Rn') g.fillText('Rn', cx, y0 + h / 2);
            else if (d.simbolo === 'trifolio') {
                g.fillStyle = '#d9a900'; g.beginPath(); g.arc(cx, y0 + h / 2, h * 0.36, 0, 7); g.fill();
                g.fillStyle = '#111'; for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2.0944; g.beginPath(); g.moveTo(cx, y0 + h / 2); g.arc(cx, y0 + h / 2, h * 0.3, a - 0.55, a + 0.55); g.closePath(); g.fill(); }
            } else if (d.simbolo === 'cruz') { g.fillStyle = '#c0392b'; g.fillRect(cx - S * 1.5, y0 + h * 0.2, S * 3, h * 0.6); g.fillRect(cx - h * 0.3, y0 + h / 2 - S * 1.5, h * 0.6, S * 3); }
            else if (d.simbolo === 'lupa') { g.lineWidth = S * 1.6; g.beginPath(); g.arc(cx - S * 1.5, y0 + h * 0.42, h * 0.2, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx + h * 0.1, y0 + h * 0.58); g.lineTo(cx + h * 0.28, y0 + h * 0.78); g.stroke(); }
            else { g.fillStyle = '#4b79a1'; g.fillRect(cx - w * 0.3, y0 + h * 0.22, w * 0.6, h * 0.56); g.fillStyle = '#f3ecd5'; g.fillRect(cx - S, y0 + h * 0.22, S * 2, h * 0.56); }   // livro
        } else if (d.tipo === 'placa') {
            const w = ts * 0.74, h = ts * 0.5, x0 = cx - w / 2, y0 = oy + ts * 0.24;
            g.fillStyle = d.estado === 'aberta' ? '#3f8f5f' : d.estado === 'fechada' ? '#8a5a3a' : '#35566e'; g.fillRect(x0, y0, w, h);
            g.strokeStyle = '#f3ecd5'; g.lineWidth = S; g.strokeRect(x0 + S, y0 + S, w - 2 * S, h - 2 * S);
            g.fillStyle = '#fff'; g.font = `bold ${Math.round(ts * (d.texto.length > 2 ? 0.2 : 0.3))}px sans-serif`; g.fillText(d.texto, cx, y0 + h / 2 + S);
        }
    }
}

/** Heliponto "H" no chão (ponto de pouso da nave, início e coleta da missão) com a silhueta do jato estacionado. */
function heliponto(g, d, ts, S) {
    const x0 = d.x * ts, y0 = d.y * ts, w = d.w * ts, h = d.h * ts, cx = x0 + w / 2, cy = y0 + h / 2;
    g.fillStyle = 'rgba(40,48,56,0.85)'; g.fillRect(x0, y0, w, h);
    g.strokeStyle = '#e6c200'; g.lineWidth = S * 2; g.strokeRect(x0 + S * 2, y0 + S * 2, w - S * 4, h - S * 4);
    g.fillStyle = '#e6c200'; g.font = `bold ${Math.round(ts * 1.1)}px monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', x0 + ts * 0.9, cy);
    g.fillStyle = '#dfe8ee'; g.strokeStyle = '#6f8797'; g.lineWidth = S;                       // jato visto de cima
    g.beginPath(); g.moveTo(cx - ts * 0.3, cy); g.lineTo(cx + ts * 1.6, cy - ts * 0.18); g.lineTo(cx + ts * 1.9, cy); g.lineTo(cx + ts * 1.6, cy + ts * 0.18); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx + ts * 0.7, cy - ts * 0.1); g.lineTo(cx + ts * 0.2, cy - ts * 0.95); g.lineTo(cx + ts * 0.5, cy - ts * 0.95); g.lineTo(cx + ts * 1.1, cy - ts * 0.1); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx + ts * 0.7, cy + ts * 0.1); g.lineTo(cx + ts * 0.2, cy + ts * 0.95); g.lineTo(cx + ts * 0.5, cy + ts * 0.95); g.lineTo(cx + ts * 1.1, cy + ts * 0.1); g.closePath(); g.fill(); g.stroke();
}

/** Mar (intransponível): azul com ondas, só visual. */
function pintarAgua(g, x, y, ox, oy, ts, r, S) {
    g.fillStyle = cor(0x2a6f9c, 0.9 + r() * 0.2); g.fillRect(ox, oy, ts, ts);
    g.fillStyle = 'rgba(255,255,255,0.22)';
    for (let i = 0; i < 3; i++) { const wx = ox + r() * ts * 0.6, wy = oy + (i + 0.5) * ts / 3; g.fillRect(wx, wy, ts * (0.2 + r() * 0.2), S); }
    g.fillStyle = 'rgba(10,40,70,0.18)'; g.fillRect(ox, oy, ts, ts * 0.5);
}
