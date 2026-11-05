import { CONFIG } from './data/config.js';

// ============================================
// GAME STATE
// ============================================
export const GameState = {
    currentMission: null,
    score: 0,
    combo: 1,
    maxCombo: 1,
    attempts: 0,
    correct: 0,
    startTime: 0,
    paused: false,
    geigerActive: false,
    currentShield: 0,
    stamina: CONFIG.STAMINA_MAX,
    sources: [],
    foundSources: [],
    settings: {
        soundVolume: 70,
        musicVolume: 50,
        musicOn: true,    // liga e desliga a música sem perder o volume escolhido
        soundOn: true,    // liga e desliga os efeitos sonoros
        showHints: true,
        screenShake: true,
        encontros: true,
        revisao: false,   // modo de revisão (investigações mostram observações, rótulos de fonte e avisos de versão)
    },
    aprendizado: { nos: {}, perguntas: {}, fichas: {} },
    achievements: [],
    unlockedMissions: [1],
    bestStars: {},
    tempoPausadoMs: 0,
    modalAberto: false,
};
