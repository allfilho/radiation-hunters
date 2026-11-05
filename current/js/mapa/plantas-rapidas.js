// ============================================
// PLANTAS DAS MISSÕES RÁPIDAS (v3.10): mapas pequenos e ALEATÓRIOS (por semente), no mesmo formato das plantas das
// missões de caça (ver plantas-missoes.js). A semente decide tamanho, posição dos edifícios, portas e móveis; o BIOMA (que vem
// da região do mapa-múndi) decide o tipo de cena: urbano, industrial, rural, floresta, costa ou clínica.
// Lógica PURA (sem Phaser nem DOM): roda em Node. O mesmo (semente, bioma) dá sempre a mesma planta.
// Garantias verificadas pelo teste 53: início livre, todos os móveis alcançáveis, 40 ≤ colunas·linhas e ≤ 64, portas livres.
// Tudo é esquema de jogo [H]: não representa um lugar real.
// ============================================
import { desenharPlanta } from './plantas-investigacao.js';
import { FURNITURE_TYPES } from '../data/moveis.js';
import { MOVEIS_INVESTIGACAO } from '../render/mobiliario-investigacao.js';
import { ehMovelExterno } from '../render/mobiliario-externo.js';

export const BIOMAS = ['urbano', 'industrial', 'rural', 'floresta', 'costa', 'clinica'];
export const TEMA_DO_BIOMA = { urbano: 'factory', industrial: 'junkyard', rural: 'bunker', floresta: 'bunker', costa: 'factory', clinica: 'hospital' };

const PALETAS = {
    urbano: { piso: 0x8d8f93, piso2: 0x83858a, junta: 0x5d5f63, parede: 0xc9c3b8, faixa: 0xb5523b, base: 0x6a6c70 },
    industrial: { piso: 0x8a7a5a, piso2: 0x7f7050, junta: 0x5a4c34, parede: 0xa8a69c, faixa: 0xc9a227, base: 0x6b5b3a },
    rural: { piso: 0x7d9a5a, piso2: 0x738f52, junta: 0x4f6638, parede: 0xd7c4a0, faixa: 0x9c4a32, base: 0x5f7a43 },
    floresta: { piso: 0x5f8a4a, piso2: 0x567f43, junta: 0x3d5a30, parede: 0x8a6b4a, faixa: 0x5a3d22, base: 0x486b38 },
    costa: { piso: 0xb5a77f, piso2: 0xab9d75, junta: 0x7d7255, parede: 0xbfb8a8, faixa: 0x2f6f8f, base: 0x8d8160 },
    clinica: { piso: 0x9aa9a2, piso2: 0x909f98, junta: 0x65736c, parede: 0xe3ebe6, faixa: 0xc0392b, base: 0x6f7d76 },
};

const R = (x, y, w, h) => ({ x, y, w, h });
const J = (x, y, estado = 'fechada') => ({ tipo: 'janela', x, y, estado });

/** Gerador pseudoaleatório pequeno e rápido (mulberry32), semeado. */
export function prng(semente) {
    let a = (semente | 0) || 1;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Móveis disponíveis: os do tema primeiro (como o gerador faz), depois os demais. */
const tiposDoTema = (tema) => [...(FURNITURE_TYPES[tema] || []), ...MOVEIS_INVESTIGACAO, ...Object.values(FURNITURE_TYPES).flat()];

// Móveis de interior e de pátio por bioma (ids que existem em data/moveis.js e render/mobiliario-investigacao.js).
const INTERIOR = {
    urbano: ['sofa', 'tv', 'stove', 'washer', 'fridge', 'bench', 'cabinet', 'table', 'bed', 'shelf'],
    industrial: ['machine', 'barrel', 'metal', 'engine', 'cabinet', 'shelf', 'table', 'fridge'],
    rural: ['table', 'cabinet', 'bed', 'stove', 'fridge', 'sofa', 'crate', 'barrel'],
    rural2: ['crate', 'barrel', 'generator', 'log', 'tire', 'machine', 'cabinet'],
    floresta: ['table', 'cabinet', 'crate', 'backpack', 'bed', 'barrel'],
    costa: ['crate', 'barrel', 'machine', 'metal', 'cabinet', 'shelf', 'engine'],
    clinica: ['bed', 'table', 'cart', 'locker', 'wheelchair', 'iv_stand', 'monitor', 'defibrillator', 'oxygen', 'cabinet'],
};
const PATIO = {
    urbano: ['waste_container', 'planter', 'barrel', 'tire'],
    industrial: ['barrel', 'tire', 'scrap', 'metal', 'engine', 'waste_container', 'generator_unit', 'car'],
    rural: ['log', 'crate', 'barrel', 'rock', 'garden_bed', 'yard_bench'],
    floresta: ['log', 'rock', 'crate', 'backpack', 'barrel'],
    costa: ['crate', 'barrel', 'scrap', 'tire', 'waste_container', 'container'],
    clinica: ['waste_container', 'planter', 'yard_bench'],
};

class Cena {
    constructor(sem, bioma) {
        this.rnd = prng(sem * 2654435761 + BIOMAS.indexOf(bioma) * 97 + 13);
        this.bioma = bioma; this.tema = TEMA_DO_BIOMA[bioma]; this.tipos = tiposDoTema(this.tema);
        this.cols = 34 + this.ri(0, 8); this.rows = 24 + this.ri(0, 6);
        this.iy = Math.floor(this.rows / 2);
        this.p = { areas: [R(1, 1, this.cols - 2, this.rows - 2)], cercas: [R(0, 0, this.cols, 1), R(0, this.rows - 1, this.cols, 1), R(0, 0, 1, this.rows), R(this.cols - 1, 0, 1, this.rows)], blocos: [], internas: [], portas: [], zonas: [], decor: [{ tipo: 'heliponto', x: 2, y: this.iy - 1, w: 5, h: 4 }], moveis: [] };
        this.salas = [];      // salas de edifício (para os móveis de interior)
        this.livres = [];     // cantos de piso livre que precisam continuar livres (frente das portas)
        this.ocupado = new Set();
    }
    ri(a, b) { return a + Math.floor(this.rnd() * (b - a + 1)); }
    pick(l) { return l[Math.floor(this.rnd() * l.length)]; }
    tipo(id) { return this.tipos.find((t) => t.id === id); }

    /** Edifício com porta no lado `lado` ('n','s','w','e'); `divide` separa em duas salas, cada uma com a sua porta para fora. */
    predio(x, y, w, h, lado, divide = false, tint = '#d9b27a') {
        const P = this.p; P.blocos.push(R(x, y, w, h));
        const ix = x + 1, iy = y + 1, iw = w - 2, ih = h - 2; let salas = [R(ix, iy, iw, ih)];
        if (divide && iw >= 9 && (lado === 's' || lado === 'n')) {
            const dx = ix + Math.floor(iw / 2);
            salas = [R(ix, iy, dx - ix, ih), R(dx + 1, iy, ix + iw - dx - 1, ih)];
            const dv = R(dx, iy + Math.floor(ih / 2) - 1, 1, 2); P.portas.push(dv); this.guardarPorta(dv);
        }
        for (const s of salas) {
            P.internas.push(s); this.salas.push(s);
            P.zonas.push({ ...s, tint, a: 0.10, vent: 1 });
            let d;
            if (lado === 's') d = R(s.x + Math.floor(s.w / 2) - 1, y + h - 1, 2, 1);
            else if (lado === 'n') d = R(s.x + Math.floor(s.w / 2) - 1, y, 2, 1);
            else if (lado === 'w') d = R(x, s.y + Math.floor(s.h / 2) - 1, 1, 2);
            else d = R(x + w - 1, s.y + Math.floor(s.h / 2) - 1, 1, 2);
            P.portas.push(d); this.guardarPorta(d);
            if (lado !== 'n' && s.w >= 5) P.decor.push(J(s.x + 1, y));
            if (lado !== 's' && s.w >= 5) P.decor.push(J(s.x + s.w - 2, y + h - 1));
        }
    }
    guardarPorta(d) { for (let dy = -1; dy <= d.h; dy++) for (let dx = -1; dx <= d.w; dx++) this.livres.push([d.x + dx, d.y + dy]); }

    // ---- grade e colocação de móveis ----
    montarGrade() { const g = { cols: this.cols, rows: this.rows }; desenharPlanta(g, { ...this.p, inicio: { x: 4, y: this.iy } }); this.grade = g.map; }
    livre(x, y) { return this.grade[y] && this.grade[y][x] === 0 && !this.ocupado.has(x + ',' + y); }
    alcance() {
        const ini = [4, this.iy], vis = new Set([ini.join(',')]), fila = [ini];
        while (fila.length) { const [x, y] = fila.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!vis.has(k) && this.livre(nx, ny)) { vis.add(k); fila.push([nx, ny]); } } }
        return vis;
    }
    /** Tenta pôr o móvel `id` em (x,y); mantém a frente das portas livre e tudo alcançável. */
    colocar(id, x, y) {
        const t = this.tipo(id); if (!t) return false;
        const cel = []; for (let dy = 0; dy < t.height; dy++) for (let dx = 0; dx < t.width; dx++) cel.push([x + dx, y + dy]);
        if (!cel.every(([cx, cy]) => this.livre(cx, cy))) return false;
        if (cel.some(([cx, cy]) => this.livres.some(([lx, ly]) => lx === cx && ly === cy))) return false;
        for (const [cx, cy] of cel) this.ocupado.add(cx + ',' + cy);
        this.p.moveis.push([id, x, y]);
        const vis = this.alcance();
        const ok = this.livres.every(([lx, ly]) => !this.grade[ly] || this.grade[ly][lx] !== 0 || this.ocupado.has(lx + ',' + ly) || vis.has(lx + ',' + ly))
            && this.p.moveis.every(([mid, mx, my]) => { const mt = this.tipo(mid); for (let dy = -1; dy <= mt.height; dy++) for (let dx = -1; dx <= mt.width; dx++) if (vis.has((mx + dx) + ',' + (my + dy))) return true; return false; });
        if (!ok) { for (const [cx, cy] of cel) this.ocupado.delete(cx + ',' + cy); this.p.moveis.pop(); return false; }
        return true;
    }
    espalhar(ids, r, n, tentativas = 40) {
        let feitos = 0;
        for (let i = 0; i < tentativas && feitos < n; i++) { const id = this.pick(ids), t = this.tipo(id); if (!t) continue; if (this.colocar(id, r.x + this.ri(0, Math.max(0, r.w - t.width)), r.y + this.ri(0, Math.max(0, r.h - t.height)))) feitos++; }
        return feitos;
    }
    interior(ids, porSala) { for (const s of this.salas) this.espalhar(ids, s, porSala ?? Math.max(2, Math.min(5, Math.round(s.w * s.h / 9)))); }
    /** Garante um mínimo de móveis que podem guardar fonte (não externos): completa as salas ou o pátio. */
    garantir(min) {
        const conta = () => this.p.moveis.filter(([id]) => !ehMovelExterno(id)).length;
        const ids = INTERIOR[this.bioma] || INTERIOR.urbano, alvos = this.salas.length ? this.salas : [R(8, 2, this.cols - 11, this.rows - 4)];
        for (let i = 0; i < 200 && conta() < min; i++) this.espalhar(ids, this.pick(alvos), 1, 6);
    }
    zona(r, piso) { this.p.zonas.push({ ...r, piso, tint: piso === 'calcada' ? '#ffffff' : '#000000', a: 0 }); }
    arvores(n, r) { this.espalhar(['tree'], r, n, n * 8); }

    // ---- biomas ----
    urbano() {
        const y0 = this.iy - 2;
        this.zona(R(1, y0, this.cols - 2, 4), 'asfalto'); this.zona(R(1, y0 - 1, this.cols - 2, 1), 'calcada'); this.zona(R(1, y0 + 4, this.cols - 2, 1), 'calcada');
        for (let x = 9; ;) { const w = this.ri(8, 11), h = this.ri(6, Math.min(9, y0 - 3)); if (x + w > this.cols - 3) break; this.predio(x, y0 - 1 - h, w, h, 's', w >= 10 && this.rnd() < 0.6); x += w + this.ri(2, 3); }
        for (let x = 10; ;) { const w = this.ri(8, 10), h = this.ri(5, Math.min(8, this.rows - 2 - (y0 + 5))); if (x + w > this.cols - 3) break; if (this.rnd() < 0.8) this.predio(x, y0 + 5, w, h, 'n', false, '#b08850'); x += w + this.ri(2, 4); }
        this.montarGrade();
        this.interior(INTERIOR.urbano);
        for (let x = 12; x < this.cols - 4; x += this.ri(7, 10)) this.colocar('lamp_post', x, y0 - 1);
        this.colocar('parked_car', this.ri(10, this.cols - 8), y0); this.colocar('parked_car', this.ri(10, this.cols - 8), y0 + 2);
        this.colocar('bus_shelter', this.ri(14, this.cols - 8), y0 + 4);
        this.espalhar(PATIO.urbano, R(8, 2, this.cols - 11, this.rows - 4), 6, 60);
        this.arvores(this.ri(4, 8), R(8, 2, this.cols - 11, this.rows - 4));
    }
    industrial() {
        const fx0 = 12, fx1 = this.cols - 3, fy0 = 3, fy1 = this.rows - 4, gy = this.iy - 1, P = this.p;
        P.cercas.push(R(fx0, fy0, fx1 - fx0 + 1, 1), R(fx0, fy1, fx1 - fx0 + 1, 1), R(fx1, fy0, 1, fy1 - fy0 + 1), R(fx0, fy0, 1, gy - fy0), R(fx0, gy + 3, 1, fy1 - (gy + 3) + 1));
        this.zona(R(fx0 + 1, fy0 + 1, fx1 - fx0 - 1, fy1 - fy0 - 1), 'terra');
        this.guardarPorta(R(fx0, gy, 1, 3));
        const w1 = this.ri(11, 13), h1 = this.ri(7, 8); this.predio(fx0 + 4, fy0 + 2, w1, h1, 's', false, '#9fb5c4');
        const x2 = fx0 + 4 + w1 + 3; if (x2 + 9 <= fx1 - 2) this.predio(x2, fy0 + 2, Math.min(11, fx1 - 2 - x2), h1 - 1, 's', false, '#d9b27a');
        this.montarGrade();
        this.interior(INTERIOR.industrial);
        this.espalhar(PATIO.industrial, R(fx0 + 2, fy0 + h1 + 4, fx1 - fx0 - 4, fy1 - fy0 - h1 - 6), this.ri(8, 12), 120);
        this.colocar('lamp_post', fx0 - 2, gy - 1); this.colocar('lamp_post', fx0 + 8, fy1 - 2);
        this.arvores(this.ri(3, 6), R(8, 2, fx0 - 9, this.rows - 4));
    }
    rural() {
        const hx = 13 + this.ri(0, 3), hy = 2 + this.ri(0, 2), bx = this.cols - 16 + this.ri(-1, 1), by = this.rows - 12;
        this.zona(R(7, this.iy, Math.max(4, hx - 7), 2), 'terra'); this.zona(R(7, hy + 4, 3, this.iy - hy - 3), 'terra'); this.zona(R(7, by + 3, Math.max(4, bx - 7), 2), 'terra');
        this.predio(hx, hy, 9, 7, 'w', false, '#d9b27a');
        this.predio(bx, by, 11, 8, 'w', false, '#b08850');
        this.montarGrade();
        this.espalhar(INTERIOR.rural, this.salas[0], 5); this.espalhar(INTERIOR.rural2, this.salas[1], 6);
        this.espalhar(PATIO.rural, R(8, 2, this.cols - 11, this.rows - 4), this.ri(6, 9), 100);
        this.arvores(this.ri(8, 14), R(8, 2, this.cols - 11, this.rows - 4));
    }
    floresta() {
        const P = this.p, iy = this.iy, cx = this.cols - 17 + this.ri(-1, 0), cy = Math.max(2, Math.min(this.rows - 14, iy - 6 + this.ri(-2, 2)));
        P.areas = [R(1, iy - 3, 12, 7), R(12, iy - 1, cx - 11, 3), R(cx, cy, 15, 12)];
        P.cercas = [];
        const cabine = this.rnd() < 0.5;
        if (cabine) this.predio(cx + 3, cy + 2, 7, 6, 'w', false, '#d9b27a');
        this.montarGrade();
        const clareira = R(cx + 1, cy + 1, 13, 10);
        if (cabine) { this.interior(INTERIOR.floresta, 4); this.espalhar(PATIO.floresta, clareira, this.ri(5, 8), 100); }
        else { this.espalhar(['tent'], clareira, 2, 60); this.colocar('campfire', cx + 7, cy + 6); this.espalhar(['crate', 'backpack', 'log', 'barrel', 'rock'], clareira, this.ri(7, 10), 160); }
        this.arvores(this.ri(6, 10), clareira); this.arvores(3, R(8, iy - 3, 4, 7));
    }
    costa() {
        const P = this.p, sx = this.cols - 10; P.mar = [R(sx, 1, this.cols - 1 - sx, this.rows - 2)];
        this.zona(R(sx - 3, 1, 3, this.rows - 2), 'calcada');
        const ax = 14 + this.ri(0, 3); this.predio(ax, 3, 12, 7, 's', false, '#b08850'); this.predio(ax + this.ri(-1, 2), this.rows - 11, 10, 8, 'n', false, '#d9b27a');
        this.montarGrade();
        this.interior(INTERIOR.costa, 5);
        this.espalhar(PATIO.costa, R(8, 2, sx - 11, this.rows - 4), this.ri(8, 12), 140);
        for (let y = 4; y < this.rows - 3; y += this.ri(6, 8)) this.colocar('lamp_post', sx - 2, y);
        this.colocar('parked_car', this.ri(9, 14), this.iy - 5);
        this.arvores(this.ri(2, 4), R(8, 2, sx - 11, this.rows - 4));
    }
    clinica() {
        const P = this.p, bx = 13 + this.ri(0, 3), by = this.iy - 6;
        P.blocos.push(R(bx, by, 17, 12));
        const salas = [R(bx + 1, by + 1, 7, 3), R(bx + 9, by + 1, 7, 3), R(bx + 1, by + 8, 7, 3), R(bx + 9, by + 8, 7, 3)], corr = R(bx + 1, by + 5, 15, 2);
        for (const s of salas) { P.internas.push(s); this.salas.push(s); P.zonas.push({ ...s, tint: '#9fd6c4', a: 0.10, vent: 1 }); const d = R(s.x + 2, s.y < by + 5 ? by + 4 : by + 7, 2, 1); P.portas.push(d); this.guardarPorta(d); }
        P.internas.push(corr); P.zonas.push({ ...corr, tint: '#cfe3ea', a: 0.10, vent: 1 });
        const entrada = R(bx, by + 5, 1, 2); P.portas.push(entrada); this.guardarPorta(entrada);
        for (const s of salas) P.decor.push(J(s.x + 2, s.y < by + 5 ? by : by + 11));
        this.montarGrade();
        for (const s of salas) this.espalhar(INTERIOR.clinica, s, 3, 30);
        this.espalhar(['wheelchair', 'cart', 'iv_stand'], corr, 2, 20);
        this.colocar('ambulance', 7, by + 12 - 2 > this.rows - 4 ? this.rows - 4 : by + 9); this.colocar('parked_car', 7, by - 1);
        this.espalhar(PATIO.clinica, R(8, 2, this.cols - 11, this.rows - 4), 4, 60);
        this.arvores(this.ri(4, 7), R(8, 2, this.cols - 11, this.rows - 4));
    }
}

/**
 * Gera a planta de uma missão rápida.
 * @returns {{ planta: object, cols: number, rows: number, mapTheme: string, bioma: string }}
 */
export function gerarPlantaRapida(semente, bioma) {
    if (!BIOMAS.includes(bioma)) throw new Error('Bioma desconhecido: ' + bioma);
    const S = new Cena(semente, bioma);
    S[bioma]();
    S.garantir(8);
    const p = {
        cols: S.cols, rows: S.rows, inicio: { x: 4, y: S.iy }, externo: true, paleta: PALETAS[bioma],
        areas: S.p.areas, cercas: S.p.cercas, blocos: S.p.blocos, internas: S.p.internas, portas: S.p.portas, zonas: S.p.zonas, decor: S.p.decor, moveis: S.p.moveis,
    };
    if (S.p.mar) p.mar = S.p.mar;
    return { planta: p, cols: S.cols, rows: S.rows, mapTheme: S.tema, bioma, fontesPossiveis: S.p.moveis.filter(([id]) => !ehMovelExterno(id)).length };
}
