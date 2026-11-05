// ============================================
// ESTILO "RPG DE CIMA" (Zelda / Pokémon): contorno escuro, 3 tons por material, luz vinda de cima-esquerda,
// sombra projetada no piso e o móvel ocupando toda a sua área (largura × altura em casas de 32 px).
// Funções puras de cor + um "pincel" que desenha em coordenadas relativas ao canto do móvel.
// ============================================
export const T = 32;

/** Clareia (f > 0, até 1 = branco) ou escurece (f < 0, até -1 = preto) uma cor 0xRRGGBB, canal a canal. */
export function tom(cor, f) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
    return (c((cor >> 16) & 255) << 16) | (c((cor >> 8) & 255) << 8) | c(cor & 255);
}

/** Três tons de um material: luz (topo), base e sombra (frente), mais o contorno (quase preto, com a matiz da base). */
export function paleta(base) {
    return { luz: tom(base, 0.28), base, sombra: tom(base, -0.28), fundo: tom(base, -0.5), contorno: tom(base, -0.72), brilho: tom(base, 0.55) };
}

/**
 * Pincel sobre um Graphics. (X, Y) = canto superior esquerdo do móvel em px; todas as coordenadas dos métodos são relativas a ele.
 */
export function pincel(g, X, Y) {
    const p = {
        rect(x, y, w, h, cor, a = 1) { g.fillStyle(cor, a); g.fillRect(X + x, Y + y, w, h); return p; },
        borda(x, y, w, h, cor) { g.lineStyle(1, cor, 1); g.strokeRect(X + x + 0.5, Y + y + 0.5, w - 1, h - 1); return p; },
        linha(x1, y1, x2, y2, cor, esp = 1) { g.lineStyle(esp, cor, 1); g.lineBetween(X + x1, Y + y1, X + x2, Y + y2); return p; },
        disco(cx, cy, r, cor, a = 1) { g.fillStyle(cor, a); g.fillCircle(X + cx, Y + cy, r); return p; },
        anel(cx, cy, r, cor, esp = 1) { g.lineStyle(esp, cor, 1); g.strokeCircle(X + cx, Y + cy, r); return p; },
        /** Polígono preenchido (pts = [[x,y],...]) com contorno opcional. */
        poli(pts, cor, contorno = null, a = 1) {
            g.fillStyle(cor, a); g.beginPath(); g.moveTo(X + pts[0][0], Y + pts[0][1]);
            for (let i = 1; i < pts.length; i++) g.lineTo(X + pts[i][0], Y + pts[i][1]);
            g.closePath(); g.fillPath();
            if (contorno !== null) { g.lineStyle(1, contorno, 1); g.strokePath(); }
            return p;
        },
        /** Sombra projetada no piso (retângulo achatado sob o móvel). */
        sombra(x, y, w, h, a = 0.32) { g.fillStyle(0x000000, a); g.fillRoundedRect(X + x, Y + y, w, h, 3); return p; },
        /** Caixa em 3/4: face de cima (luz) + face da frente (sombra) de altura `frente`, com realce e contorno. */
        caixa(x, y, w, h, frente, pal, { realce = true } = {}) {
            p.rect(x, y, w, h - frente, pal.base);
            p.rect(x, y + h - frente, w, frente, pal.sombra);
            if (realce) { p.rect(x + 1, y + 1, w - 2, 2, pal.luz); p.rect(x + 1, y + 1, 2, h - frente - 1, pal.luz); }
            p.rect(x, y + h - frente, w, 1, pal.fundo);
            p.borda(x, y, w, h, pal.contorno);
            return p;
        },
    };
    return p;
}

/** Gerador pseudoaleatório determinístico (mulberry32): o desgaste de um móvel é sempre o mesmo, a cada partida. */
export function aleatorio(seed) {
    let a = (seed * 2654435761) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
