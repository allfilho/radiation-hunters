// ============================================
// KIT DE ARTE · PRIMITIVAS SVG (v3.12). Funções que devolvem TEXTO SVG. Sem DOM, sem dependências: testável em Node.
// Convenções: unidade = 1 "pixel" do desenho; coordenadas inteiras (o SVG é desenhado com shape-rendering="crispEdges");
// luz vem de cima à esquerda (realce em cima/esquerda, sombra embaixo/direita). Animações são classes CSS (ag-pisca, ag-varre, ag-gira,
// ag-pulsa, ag-bolha) desligadas por prefers-reduced-motion. Para fazer uma peça nova, siga o guia em docs/skills/arte-radhunter/SKILL.md.
// ============================================
import { P, tom } from './paleta.js';

const n = (v) => Math.round(v * 10) / 10;
/** Retângulo. `ex` = atributos extras (ex.: 'opacity=".5"'). */
export const r = (x, y, w, h, fill, ex = '') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}"${ex ? ' ' + ex : ''}/>`;
/** Polígono a partir de [[x,y],...]. */
export const poli = (pts, fill, ex = '') => `<polygon points="${pts.map(([x, y]) => `${n(x)},${n(y)}`).join(' ')}" fill="${fill}"${ex ? ' ' + ex : ''}/>`;
/** Linha. */
export const lin = (x1, y1, x2, y2, cor, w = 1, ex = '') => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${cor}" stroke-width="${w}"${ex ? ' ' + ex : ''}/>`;
/** Grupo com translação (e escala opcional). */
export const grupo = (x, y, miolo, esc = 1, ex = '') => `<g transform="translate(${n(x)} ${n(y)})${esc !== 1 ? ` scale(${esc})` : ''}"${ex ? ' ' + ex : ''}>${miolo}</g>`;

/** Peça com bisel: base + realce em cima/esquerda + sombra embaixo/direita (dá volume a qualquer retângulo). */
export function bisel(x, y, w, h, base = P.aco3) {
    return r(x, y, w, h, base) + r(x, y, w, 1, tom(base, .35)) + r(x, y, 1, h, tom(base, .22)) + r(x, y + h - 1, w, 1, tom(base, -.5)) + r(x + w - 1, y, 1, h, tom(base, -.4));
}
/** Parafuso/rebite 2×2. */
export const parafuso = (x, y) => r(x, y, 2, 2, P.aco5) + r(x + 1, y + 1, 1, 1, P.aco1);
/** Parafusos nos quatro cantos de um retângulo. */
export const parafusos = (x, y, w, h, m = 2) => parafuso(x + m, y + m) + parafuso(x + w - m - 2, y + m) + parafuso(x + m, y + h - m - 2) + parafuso(x + w - m - 2, y + h - m - 2);
/** LED piscante. `i` defasa a animação para as luzes não piscarem juntas. */
export const led = (x, y, cor = P.verde, i = 0) => `<rect class="ag-pisca" style="animation-delay:${((i * 0.37) % 2).toFixed(2)}s" x="${x}" y="${y}" width="2" height="2" fill="${cor}"/>`;
/** LED fixo (aceso) com halo. */
export const ledFixo = (x, y, cor = P.verde) => r(x - 1, y - 1, 4, 4, cor, 'opacity=".25"') + r(x, y, 2, 2, cor);

/** Luminária de teto: aparelho + dois cones de luz (a luz "cai" sobre a cena). `alt` = comprimento do cone. */
export function lampada(cx, y, larg = 18, alt = 70, cor = P.luzFria) {
    const a = larg / 2;
    return `<g class="ag-lamp">` + poli([[cx - a, y + 3], [cx + a, y + 3], [cx + a * 2.6, y + alt], [cx - a * 2.6, y + alt]], cor, 'opacity=".05"')
        + poli([[cx - a * .6, y + 3], [cx + a * .6, y + 3], [cx + a * 1.5, y + alt * .8], [cx - a * 1.5, y + alt * .8]], cor, 'opacity=".06"')
        + r(cx - a, y, larg, 3, P.aco5) + r(cx - a + 2, y + 3, larg - 4, 1, cor) + `</g>`;
}
/** Tubulação horizontal (ou vertical se h > w) com realce e sombra. */
export function tubo(x, y, w, h, cor = P.aco4) {
    return r(x, y, w, h, cor) + (h > w ? r(x, y, 1, h, tom(cor, .4)) + r(x + w - 1, y, 1, h, tom(cor, -.5)) : r(x, y, w, 1, tom(cor, .4)) + r(x, y + h - 1, w, 1, tom(cor, -.5)));
}
/** Grade de ventilação (venezianas). */
export function veneziana(x, y, w, h) {
    let s = r(x, y, w, h, P.aco1) + r(x, y, w, 1, P.aco5);
    for (let yy = y + 2; yy < y + h - 1; yy += 3) s += r(x + 1, yy, w - 2, 1, P.aco3) + r(x + 1, yy + 1, w - 2, 1, P.aco0);
    return s;
}
/** Faixa zebrada de perigo (amarelo/preto) sem <pattern>: listras desenhadas. */
export function zebra(x, y, w, h, passo = 6) {
    let s = r(x, y, w, h, '#1a1a1a');
    for (let xx = 0; xx < w + h; xx += passo * 2) s += poli([[x + xx, y + h], [x + xx + passo, y + h], [x + xx + passo + h, y], [x + xx + h, y]].map(([px, py]) => [Math.min(x + w, Math.max(x, px)), py]), P.ambar);
    return s;
}
/** Símbolo de trevo (radiação), 3 pás, centrado em (0,0), raio `rr`. */
export function trevo(rr, cor = P.ambar) {
    const p = (a, q) => [(Math.cos(a) * q).toFixed(1), (Math.sin(a) * q).toFixed(1)];
    const pa = (a0) => {
        const a1 = a0 + Math.PI / 3, [x0, y0] = p(a0, rr), [x1, y1] = p(a1, rr), [i0x, i0y] = p(a0, rr * 0.28), [i1x, i1y] = p(a1, rr * 0.28);
        return `<path d="M${i0x} ${i0y} L${x0} ${y0} A${rr} ${rr} 0 0 1 ${x1} ${y1} L${i1x} ${i1y} A${rr * 0.28} ${rr * 0.28} 0 0 0 ${i0x} ${i0y}Z" fill="${cor}" stroke="#2a2000" stroke-width="0.7"/>`;
    };
    return pa(-Math.PI / 2) + pa(-Math.PI / 2 + 2 * Math.PI / 3) + pa(-Math.PI / 2 + 4 * Math.PI / 3) + `<circle r="${(rr * 0.18).toFixed(1)}" fill="${cor}" stroke="#2a2000" stroke-width="0.7"/>`;
}
/** Monitor com moldura, grade e traço animado (`pontos` = nº de vértices da curva). */
export function monitor(x, y, w, h, pontos = 8, cor = P.verde, semente = 1) {
    const pts = Array.from({ length: pontos }, (_, i) => `${x + 3 + i * ((w - 6) / (pontos - 1))},${n(y + h / 2 + Math.sin((i + semente) * 1.9) * (h / 3.2))}`).join(' ');
    let grade = ''; for (let g = 1; g < 4; g++) grade += r(x + 2, y + (h * g) / 4, w - 4, 1, cor, 'opacity=".12"');
    return bisel(x - 2, y - 2, w + 4, h + 4, P.aco3) + r(x, y, w, h, '#04110b') + grade + `<polyline class="ag-varre" fill="none" stroke="${cor}" stroke-width="1" points="${pts}"/>` + r(x, y, w, 1, cor, 'opacity=".25"');
}
/** Bancada com pés e tampo biselado. */
export const bancada = (x, y, w, alt = 18, tampo = P.aco4) => bisel(x, y, w, 5, tampo) + r(x + 3, y + 5, 4, alt - 5, P.aco2) + r(x + w - 7, y + 5, 4, alt - 5, P.aco2) + r(x + 7, y + 6, w - 14, 2, P.aco1, 'opacity=".6"');
/** Cadeira de lado (encosto à esquerda). */
export const cadeira = (x, y, cor = P.aco4) => r(x, y - 12, 3, 12, cor) + r(x, y - 2, 12, 3, cor) + r(x + 5, y + 1, 2, 9, P.aco1) + r(x + 1, y + 9, 10, 2, P.aco1);

/** Casca de módulo (200 ou 300 × 120): parede com painéis, laje com tubulação e luminárias, piso de grade, portas laterais para o corredor. */
export function casco(w, h = 120, { luzes = null, cor = P.aco2, porta = true } = {}) {
    const piso = h - 22, cx = luzes || [w * 0.25, w * 0.75];
    let s = r(0, 0, w, h, P.aco1) + r(0, 10, w, piso - 10, cor);
    for (let x = 20; x < w; x += 24) s += r(x, 10, 1, piso - 10, tom(cor, -.35)) + r(x + 1, 10, 1, piso - 10, tom(cor, .08));
    s += r(0, 10, w, 2, tom(cor, -.5));
    // laje do teto: concreto, duto de cabos e tubo
    s += r(0, 0, w, 10, P.aco0) + r(0, 8, w, 2, P.aco3) + r(0, 9, w, 1, P.aco5) + tubo(0, 2, w, 3, tom(P.aco4, -.2)) + r(0, 6, w, 1, P.aco2);
    for (let x = 14; x < w; x += 40) s += r(x, 1, 2, 7, P.aco5);
    cx.forEach((x) => { s += lampada(x, 10, 18, piso - 14); });
    // piso: face superior clara, grade e rodapé; sombra sob a laje e nas laterais
    s += r(0, piso, w, h - piso, P.aco2) + r(0, piso, w, 2, P.aco5) + r(0, piso + 2, w, 1, P.aco0);
    for (let x = 2; x < w; x += 6) s += r(x, piso + 6, 3, 2, P.aco1) + r(x + 3, piso + 12, 3, 2, P.aco1);
    s += r(0, piso + 16, w, h - piso - 16, P.aco0, 'opacity=".55"');
    s += r(0, 12, w, 5, '#000', 'opacity=".25"') + r(0, 12, 5, piso - 12, '#000', 'opacity=".3"') + r(w - 5, 12, 5, piso - 12, '#000', 'opacity=".3"');
    if (porta) for (const px of [0, w - 7]) s += r(px, piso - 30, 7, 30, P.aco0) + r(px, piso - 30, 7, 2, P.ambar) + r(px + (px ? 0 : 5), piso - 30, 2, 30, P.ambarEsc) + led(px + 2, piso - 26, P.verde, px);
    return s;
}
