// ============================================
// CONSTANTS & CONFIGURATION
// ============================================
export const CONFIG = {
    WIDTH: 960,
    HEIGHT: 640,
    TILE_SIZE: 32,
    MAP_COLS: 24,
    MAP_ROWS: 16,
    PLAYER_SPEED: 2.5,
    PLAYER_RUN_SPEED: 4.5,
    STAMINA_MAX: 100,
    STAMINA_DRAIN: 0.8,
    STAMINA_REGEN: 0.4,
    BG_RADIATION: 5,
    VISION_DISTANCE: 6,
    VISION_ANGLE: Math.PI / 2,
    // Identificar: a fonte conta como "ao alcance" quando a SUPERFÍCIE do móvel está a até
    // IDENTIFY_DISTANCE tiles do jogador (antes era o centro, o que tornava impossível
    // identificar fontes em móveis 3x3: missões 4 e 8).
    IDENTIFY_DISTANCE: 1.0,
    OBSERVE_DISTANCE: 2.0, // também medido até a superfície do móvel (era 2,5 até o centro)
    // Escala física: 1 tile = TILE_M metros (projeto 3a, D2); parede = PAREDE_CM de concreto por tile (D5)
    TILE_M: 0.5,
    PAREDE_CM: 30,
    // Janela de exibição do Geiger (projeto 3a, D6) e passo de amostragem
    GEIGER_JANELA_S: 3,
    GEIGER_PASSO_MS: 200,
    // Assistência do alfa [H]: se o tempo passar de ASSIST_TEMPO_FRAC da meta, ou de ASSIST_TEMPO_FRAC_FALTAM da meta
    // com mais de ASSIST_FALTAM_MAIS_QUE das fontes ainda por achar, o alcance do alfa sobe para ASSIST_ALFA_TILES.
    ASSIST_ALFA_TILES: 1.5,
    ASSIST_TEMPO_FRAC: 0.75,
    ASSIST_TEMPO_FRAC_FALTAM: 0.5,
    ASSIST_FALTAM_MAIS_QUE: 0.5,
};
