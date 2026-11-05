// ============================================
// ACESSIBILIDADE DAS FONTES
// Garante que uma fonte sorteada possa ser achada: existe uma posição que o jogador consegue ALCANÇAR
// (varredura a partir do ponto inicial, com a mesma colisão do jogo) de onde o Geiger a detecta bem.
// Funções puras (sem Phaser/DOM), testáveis em Node.
// ============================================
import { PARAMETROS, taxaFonte } from './geiger.js';

/** Posições (px) que o jogador alcança andando. blocked: Set de 'x,y' (tiles); raio = meia caixa de colisão. */
export function posicoesAlcancaveis({ cols, rows, blocked, inicio, tile = 32, raio = 10, passo = 4 }) {
    const livre = (x, y) => {
        for (const [cx, cy] of [[x - raio, y - raio], [x + raio, y - raio], [x - raio, y + raio], [x + raio, y + raio]]) {
            const tx = Math.floor(cx / tile), ty = Math.floor(cy / tile);
            if (tx < 0 || ty < 0 || tx >= cols || ty >= rows || blocked.has(tx + ',' + ty)) return false;
        }
        return true;
    };
    const chave = (x, y) => x + ',' + y;
    const x0 = Math.round(inicio.x / passo) * passo, y0 = Math.round(inicio.y / passo) * passo;
    const visto = new Set([chave(x0, y0)]);
    const fila = [[x0, y0]];
    for (let i = 0; i < fila.length; i++) {
        const [x, y] = fila[i];
        for (const [dx, dy] of [[passo, 0], [-passo, 0], [0, passo], [0, -passo]]) {
            const nx = x + dx, ny = y + dy, k = chave(nx, ny);
            if (visto.has(k) || !livre(nx, ny)) continue;
            visto.add(k); fila.push([nx, ny]);
        }
    }
    return fila.map(([x, y]) => ({ x: x / tile, y: y / tile })); // em tiles
}

// Direção de mira realista: o teclado dá 8 direções (o joystick dá qualquer uma; aqui vale o pior caso)
const mira8 = (ang) => Math.round(ang / (Math.PI / 4)) * (Math.PI / 4);

/**
 * Melhor taxa líquida (cps, sem o fundo) que o jogador consegue medir da fonte, entre as posições alcançáveis.
 * fonte: no formato de taxaFonte (x, y, rect em tiles, base, type/componentes...). ctx: como em taxaEsperada.
 */
export function melhorTaxaLiquida(fonte, posicoes, ctx) {
    let melhor = 0;
    const cx = fonte.x, cy = fonte.y;
    for (const p of posicoes) {
        // só vale a pena testar perto da fonte (alfa: ≤1 tile; beta/gama: dentro do alcance de visão)
        if (Math.hypot(cx - p.x, cy - p.y) > 12) continue;
        const dir = mira8(Math.atan2(cy - p.y, cx - p.x));
        const r = taxaFonte(fonte, { x: p.x, y: p.y, dir }, ctx);
        if (r > melhor) melhor = r;
    }
    return melhor;
}

export const LIMIARES_ACESSO = [25, 15, 8, 0]; // cps líquidos desejados, do mais confortável ao último recurso
export { PARAMETROS };
