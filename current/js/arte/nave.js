// ============================================
// KIT DE ARTE · NAVE (v3.12). Uma só nave desenhada, usada no hangar e na superfície (coerência visual).
// Origem (0,0) = centro da fuselagem; nariz para a direita; o trem de pouso toca o chão em y = 27. Largura ≈ 170, altura ≈ 56.
// Original deste projeto (sem relação com nenhuma nave de jogo ou filme).
// ============================================
import { P, tom } from './paleta.js';
import { r, poli, lin } from './primitivas.js';

/** Cores por tipo de nave: [casco, sombra, faixa]. */
export const COR_NAVE = {
    tripulacao: ['#dfe8ee', '#a9bac7', '#3f86c5'],
    resgate: ['#f3d2c4', '#d99a84', '#ff6b35'],
    levantamento: ['#cfe8f7', '#8fb6d0', '#26b6a3'],
};

export function naveSvg(tipo = 'tripulacao', { fogo = true } = {}) {
    const [c1, c2, fx] = COR_NAVE[tipo] || COR_NAVE.tripulacao;
    const escuro = tom(c2, -.35), claro = tom(c1, .35);
    // asa distante, deriva, fuselagem, asa próxima, cabine, motor, trem de pouso
    const asaLonge = poli([[-4, -4], [-30, -34], [-12, -34], [26, -4]], escuro);
    const deriva = poli([[-64, -2], [-80, -28], [-62, -28], [-40, -4]], c2) + poli([[-64, -2], [-72, -16], [-66, -16], [-54, -3]], fx);
    const fus = `<path d="M-74 6 L-52 -8 Q8 -15 62 -6 Q88 -1 91 7 Q74 16 20 17 L-52 17Z" fill="${c1}"/>`
        + `<path d="M-74 6 L-52 -8 Q8 -15 62 -6 L50 -2 Q6 -9 -50 -2Z" fill="${claro}"/>`
        + `<path d="M-52 17 L20 17 Q74 16 91 7 L84 11 Q60 13 20 13 L-50 13Z" fill="${c2}"/>`
        + r(-50, 3, 100, 2, fx) + r(-50, 5, 100, 1, tom(fx, -.45))
        + lin(-20, -10, -20, 16, escuro, 1, 'opacity=".5"') + lin(22, -12, 22, 16, escuro, 1, 'opacity=".5"');
    const cabine = `<path d="M46 -6 Q70 -8 84 3 L62 4 Q54 -1 46 -6Z" fill="${P.ciano}" opacity=".9"/><path d="M50 -6 Q66 -7 76 -1 L60 0Z" fill="#ffffff" opacity=".45"/>`;
    const asaPerto = poli([[-8, 10], [-38, 30], [-20, 30], [26, 12]], c2) + poli([[-8, 10], [-26, 22], [-18, 22], [4, 11]], tom(c2, .25)) + r(-38, 29, 18, 1, escuro);
    const motor = r(-72, 4, 22, 9, escuro) + r(-72, 4, 22, 1, tom(escuro, .4)) + (fogo ? `<path class="ag-pulsa" d="M-72 5 L-92 8.5 L-72 12Z" fill="${P.laranja}" opacity=".9"/><path class="ag-pulsa" d="M-72 6.5 L-84 8.5 L-72 10.5Z" fill="#fff3c0"/>` : r(-74, 5, 2, 7, '#222'));
    const trem = lin(-30, 17, -30, 27, '#2a3139', 3) + lin(40, 15, 40, 27, '#2a3139', 3) + r(-35, 26, 10, 3, '#14191e') + r(35, 26, 10, 3, '#14191e');
    return asaLonge + deriva + trem + fus + asaPerto + cabine + motor + r(88, 5, 3, 3, P.vermelho, 'opacity=".9"');
}
