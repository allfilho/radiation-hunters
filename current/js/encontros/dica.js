// ============================================
// DICA DE LOCALIZAÇÃO DAS FONTES (funções puras)
// Quando o jogador demora a achar a próxima fonte, as que faltam passam a pulsar em vermelho:
//   nível 1 (após DICA_NIVEL1_S sem progresso): só no minimapa — sem custo;
//   nível 2 (após DICA_NIVEL2_S sem progresso, ou ao pedir a dica): também no mapa — custa DICA_DESCONTO pontos
//   de aproveitamento, no máximo uma vez por intervalo entre duas fontes achadas (teto DICA_DESCONTO_MAX). [H] escolhas de projeto.
// "Progresso" = identificar uma fonte, concluir uma lição, pegar uma chave ou o Geiger.
// ============================================
export const DICA_NIVEL1_S = 90;
export const DICA_NIVEL2_S = 150;
export const DICA_PEDIDA_S = 8;
export const DICA_DESCONTO = 2;
export const DICA_DESCONTO_MAX = 6;

/** Nível automático (0, 1 ou 2) segundo os segundos de jogo sem progresso. */
export function nivelDicaAuto(semProgressoS) {
    if (!Number.isFinite(semProgressoS) || semProgressoS < DICA_NIVEL1_S) return 0;
    return semProgressoS >= DICA_NIVEL2_S ? 2 : 1;
}

/** Pontos de aproveitamento descontados por `usos` dicas de nível 2 (nunca negativo, com teto). */
export function descontoDeDicas(usos) {
    const n = Number.isFinite(usos) ? Math.max(0, Math.floor(usos)) : 0;
    return Math.min(DICA_DESCONTO_MAX, n * DICA_DESCONTO);
}
