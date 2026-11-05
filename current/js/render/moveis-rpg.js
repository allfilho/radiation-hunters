// ============================================
// MÓVEIS NO ESTILO RPG (ver estilo-rpg.js). Pilotos: desk, cabinet, bed, computer, locker.
// Cada função usa a cor do tipo (f.type.color) como material principal, então o mesmo móvel muda de aparência por tema.
// Devolve o Graphics ou null (o chamador cai no desenho antigo para os tipos ainda não refeitos).
// ============================================
import { T, tom, paleta, pincel, aleatorio } from './estilo-rpg.js';
import { INTERIOR } from './moveis-rpg-interior.js';
import { RUINAS } from './moveis-rpg-ruinas.js';

const DESENHOS = {
    // Mesa: tampo com veio, gavetas na frente, pés, e objetos em cima (papel, caneta, bécher).
    desk(d, w, h, cor) {
        const m = paleta(cor), ferro = paleta(0x6c7a86);
        d.sombra(3, h - 7, w - 4, 8);
        d.rect(4, h - 5, 4, 4, ferro.fundo).rect(w - 8, h - 5, 4, 4, ferro.fundo);              // pés
        d.caixa(2, 4, w - 4, h - 8, 10, m);                                                    // tampo + frente
        for (let i = 0; i < 3; i++) d.linha(7 + i * 17, 9 + (i % 2) * 3, 17 + i * 17, 9 + (i % 2) * 3, m.luz);   // veio
        const fy = h - 14;                                                                     // gavetas
        for (const gx of [6, w / 2 + 2]) { d.rect(gx, fy, w / 2 - 8, 7, m.base).borda(gx, fy, w / 2 - 8, 7, m.contorno); d.rect(gx + (w / 2 - 8) / 2 - 3, fy + 3, 6, 2, 0xe2c15a); }
        d.rect(w - 22, 8, 9, 7, 0xf4f4ea).borda(w - 22, 8, 9, 7, 0x3a3f4a);                  // papel
        d.linha(w - 20, 10, w - 15, 10, 0x9aa3ad).linha(w - 20, 12, w - 16, 12, 0x9aa3ad);
        d.rect(10, 9, 8, 2, 0x2f3b4a);                                                         // caneta/régua
        d.disco(24, 10, 3.2, 0x9fe3c8).anel(24, 10, 3.2, 0x2f4d44);                            // béquer
    },
    // Armário alto com portas de vidro e prateleiras com frascos.
    cabinet(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(2, 2, w - 4, h - 5, 6, m);
        d.rect(5, 7, w - 10, h - 20, tom(m.fundo, -0.1));                                      // interior
        const n = Math.max(3, Math.floor((h - 20) / 17));
        for (let i = 0; i < n; i++) {
            const y = 7 + i * Math.floor((h - 20) / n);
            d.rect(5, y + Math.floor((h - 20) / n) - 3, w - 10, 2, m.luz);                     // prateleira
            const cores = [0x58c777, 0xe0584f, 0x4f8be0, 0xe8c14a];
            for (let k = 0; k < 3; k++) { const fx = 7 + k * 7; d.rect(fx, y + Math.floor((h - 20) / n) - 10, 5, 7, cores[(i + k) % 4]).rect(fx + 1, y + Math.floor((h - 20) / n) - 12, 3, 2, 0xe9edf0).rect(fx + 1, y + Math.floor((h - 20) / n) - 9, 1, 4, 0xffffff, 0.6); }
        }
        d.linha(w / 2, 7, w / 2, h - 12, m.contorno);                                          // junta das portas
        d.rect(w / 2 - 3, h / 2, 2, 5, 0xd9dde2).rect(w / 2 + 1, h / 2, 2, 5, 0xd9dde2);       // puxadores
        d.rect(6, 8, 3, h - 22, 0xffffff, 0.16);                                               // reflexo no vidro
    },
    // Cama hospitalar vista de cima: cabeceira, travesseiro, cobertor com dobra, grades e rodízios.
    bed(d, w, h, cor) {
        const aco = paleta(0x8a97a3);
        d.sombra(2, h - 6, w - 2, 7);
        d.rect(3, h - 6, 5, 4, 0x2b2f36).rect(w - 9, h - 6, 5, 4, 0x2b2f36);                    // rodízios
        d.rect(2, 3, w - 4, h - 8, aco.base).borda(2, 3, w - 4, h - 8, aco.contorno);          // estrutura
        d.rect(2, 3, 5, h - 8, tom(cor, -0.35)).borda(2, 3, 5, h - 8, aco.contorno);            // cabeceira
        d.rect(8, 6, w - 13, h - 14, 0xeef3f6).borda(8, 6, w - 13, h - 14, 0x5d6b78);           // colchão
        d.rect(10, 8, 14, h - 18, 0xffffff).borda(10, 8, 14, h - 18, 0x9fb0bc);                 // travesseiro
        d.rect(12, 10, 10, 2, 0xdfe8ee);
        d.rect(27, 6, w - 32, h - 14, 0x7fb4d6).borda(27, 6, w - 32, h - 14, 0x35607f);         // cobertor
        d.rect(27, 6, 5, h - 14, 0xa9d3ea);                                                    // dobra
        d.linha(36, 9, w - 9, 9, 0x6aa0c4).linha(36, h - 12, w - 9, h - 12, 0x6aa0c4);
        d.linha(8, 4, w - 5, 4, aco.luz, 2);                                                   // grade
    },
    // Estação de trabalho: bancada, monitor com tela acesa, teclado, mouse e torre.
    computer(d, w, h, cor) {
        const m = paleta(cor), ferro = paleta(0x58636e);
        d.sombra(3, h - 7, w - 4, 8);
        d.caixa(2, 6, w - 4, h - 10, 8, ferro);                                                 // bancada
        d.rect(w - 17, 2, 12, 18, 0xcfd6dc).borda(w - 17, 2, 12, 18, 0x3a4048);                 // torre
        d.rect(w - 14, 5, 6, 2, 0x2f3640).rect(w - 14, 9, 6, 2, 0x2f3640).disco(w - 11, 16, 1.4, 0x5fe38a);
        d.rect(9, 1, 24, 15, 0x20262e).borda(9, 1, 24, 15, 0x0e1115);                           // monitor
        d.rect(11, 3, 20, 11, 0x1d3f4e).rect(11, 3, 20, 3, 0x2f7d93);                           // tela
        for (let i = 0; i < 3; i++) d.linha(13, 8 + i * 2, 20 + (i % 2) * 6, 8 + i * 2, 0x7be0c0);
        d.rect(18, 16, 6, 2, 0x20262e);                                                         // pé
        d.rect(10, 19, 22, 6, 0xdde2e6).borda(10, 19, 22, 6, 0x3a4048);                         // teclado
        for (let i = 0; i < 5; i++) d.rect(12 + i * 4, 21, 3, 1, 0x8d98a3).rect(12 + i * 4, 23, 3, 1, 0x8d98a3);
        d.rect(38, 21, 5, 4, 0xe8ecef).borda(38, 21, 5, 4, 0x3a4048);                          // mouse
    },
    // Armário de metal (vestiário): duas folhas com venezianas, puxador e plaquinha.
    locker(d, w, h, cor) {
        const m = paleta(cor);
        d.sombra(3, h - 5, w - 3, 6);
        d.caixa(3, 2, w - 6, h - 5, 5, m);
        d.rect(5, 4, w - 10, 3, m.luz);
        for (let i = 0; i < 4; i++) d.rect(8, 9 + i * 3, w - 16, 1, m.fundo);                    // venezianas
        d.linha(w / 2, 17, w / 2, h - 10, m.contorno);
        d.rect(w / 2 - 5, h / 2 - 2, 3, 7, 0xd9dde2).borda(w / 2 - 5, h / 2 - 2, 3, 7, 0x2b2f36);
        d.rect(w / 2 + 3, h / 2 - 2, 3, 7, 0xd9dde2).borda(w / 2 + 3, h / 2 - 2, 3, 7, 0x2b2f36);
        d.rect(w / 2 - 6, 11 + 24, 12, 5, 0xefe9d2).borda(w / 2 - 6, 11 + 24, 12, 5, 0x5b5646); // plaquinha
        d.rect(5, h - 11, w - 10, 2, m.fundo);
    },
};

// Chave "tema:id" tem prioridade sobre "id" (que vale para qualquer tema).
const TODOS = { ...DESENHOS, ...INTERIOR, ...RUINAS };
export const MOVEIS_RPG = Object.keys(TODOS);

// Desgaste por tema: quantidade de manchas de ferrugem/sujeira/musgo e suas cores. Posição determinística (semente = casa do móvel).
const DESGASTE = {
    junkyard: { n: 7, cores: [0x9a4a1e, 0x6b3412, 0x3a2a1e], a: 0.55 },
    hospital: { n: 5, cores: [0x3a352c, 0x5a5646, 0x6b2a2a], a: 0.32 },
    nuclear:  { n: 5, cores: [0x1b1f22, 0x4a4a22, 0x3a2a1e], a: 0.38 },
    bunker:   { n: 6, cores: [0x4a3a28, 0x3f5a2e, 0x1b1b1b], a: 0.35 },
    factory:  { n: 3, cores: [0x3a2a14, 0x2a1d10], a: 0.25 },
};

function desgastar(d, w, h, tema, seed) {
    const cfg = DESGASTE[tema];
    if (!cfg) return;
    const rnd = aleatorio(seed);
    for (let i = 0; i < cfg.n; i++) {
        const x = 2 + rnd() * (w - 8), y = 3 + rnd() * (h - 10), c = cfg.cores[Math.floor(rnd() * cfg.cores.length)];
        const ww = 2 + Math.floor(rnd() * 5), hh = 1 + Math.floor(rnd() * 3);
        d.rect(Math.floor(x), Math.floor(y), ww, hh, c, cfg.a);
        if (rnd() < 0.4) d.rect(Math.floor(x) + 1, Math.floor(y) + hh, 1, 2 + Math.floor(rnd() * 3), c, cfg.a * 0.8);   // escorrido
    }
}

export function desenharMovelRpg(scene, f, tema = '') {
    const fn = TODOS[`${tema}:${f.type.id}`] || TODOS[f.type.id];
    if (!fn) return null;
    const g = scene.add.graphics().setDepth(2);
    const w = f.type.width * T, h = f.type.height * T;
    const d = pincel(g, f.x * T, f.y * T);
    fn(d, w, h, f.type.color);
    desgastar(d, w, h, tema, f.x * 131 + f.y * 17 + f.type.id.length);
    return g;
}
