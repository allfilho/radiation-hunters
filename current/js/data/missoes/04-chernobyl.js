import { PLANTA_CHERNOBYL } from '../../mapa/plantas-missoes.js';

export const missao = {
        id: 4,
        titleKey: 'mission4Title',
        descKey: 'mission4Desc',
        storyKey: 'story4',
        difficulty: 'hard',
        numSources: 5,
        timeLimit: 240,
        mapTheme: 'nuclear',
        planta: PLANTA_CHERNOBYL,   // v3.8: mapa contínuo (ver mapa/plantas-missoes.js)
        mapCols: PLANTA_CHERNOBYL.cols,
        mapRows: PLANTA_CHERNOBYL.rows,
        raioConcentracao: 16,
        unlocked: false,
        // Chernobyl: Reactor isotopes - SOURCES NEAR REACTOR ONLY
        allowedIsotopes: ['I-131', 'Cs-137', 'Sr-90'],
        concentratedSources: true, // Sources placed near reactor
    };
