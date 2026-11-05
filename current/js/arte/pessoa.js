// ============================================
// KIT DE ARTE · PESSOA (v3.12). Figura de pé, viewBox 24×40, vista de frente, em pixel art vetorial.
// `i` (número inteiro) escolhe pele, cabelo e jaleco de forma determinística: a mesma pessoa é sempre desenhada igual.
// `corCaneta` ('verde'|'amarelo'|'vermelho') acende a caneta dosimétrica no bolso (regra do jogo).
// ============================================
import { P, tom } from './paleta.js';
import { r } from './primitivas.js';

const CANETA = { verde: '#00e07a', amarelo: '#ffcc00', vermelho: '#ff5a4a' };

export function pessoaSvg(corCaneta, jaleco, i = 0) {
    const k = typeof i === 'string' ? [...i].reduce((a, c) => a + c.charCodeAt(0), 0) : Math.abs(i | 0), pele = P.peles[k % P.peles.length], cab = P.cabelos[(k * 3 + 1) % P.cabelos.length];
    const jal = jaleco || P.jalecos[k % P.jalecos.length], pen = CANETA[corCaneta] || CANETA.verde;
    const longo = k % 3 === 2;
    const corpo = r(7, 14, 10, 16, jal) + r(7, 14, 1, 16, tom(jal, .3)) + r(16, 14, 1, 16, tom(jal, -.3)) + r(11, 14, 2, 16, tom(jal, -.12)) // jaleco aberto com sombra
        + r(9, 14, 6, 2, tom(jal, -.25)) + r(10, 14, 4, 3, '#3b5f84')                                                                          // gola e camisa
        + r(5, 15, 3, 12, jal) + r(16, 15, 3, 12, jal) + r(5, 15, 1, 12, tom(jal, .25)) + r(18, 15, 1, 12, tom(jal, -.3)) + r(5, 27, 3, 2, pele) + r(16, 27, 3, 2, pele); // braços e mãos
    const pernas = r(8, 30, 4, 8, '#2d3b4e') + r(12, 30, 4, 8, '#26323f') + r(7, 38, 5, 2, '#10151b') + r(12, 38, 5, 2, '#10151b');
    const cabeca = r(8, 4, 8, 9, pele) + r(8, 11, 8, 2, tom(pele, -.15)) + r(9, 7, 2, 2, '#1a1410') + r(13, 7, 2, 2, '#1a1410') + r(11, 10, 2, 1, tom(pele, -.3))
        + r(7, 2, 10, 4, cab) + r(7, 2, 2, 7, cab) + r(15, 2, 2, 5, cab) + (longo ? r(6, 5, 2, 10, cab) + r(16, 5, 2, 10, cab) : '');
    const bolso = r(13, 20, 3, 4, tom(jal, -.18)) + r(14, 17, 1, 5, pen) + r(14, 17, 1, 1, '#fff');
    return `<svg class="ag-pessoa" viewBox="0 0 24 40" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${r(6, 39, 12, 1, '#000', 'opacity=".35"')}${pernas}${corpo}${bolso}${cabeca}</svg>`;
}
