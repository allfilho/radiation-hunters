import { PLANTA_FUKUSHIMA } from '../../mapa/plantas-missoes.js';

export const missao = {
        id: 8,
        titleKey: 'mission8Title',
        descKey: 'mission8Desc',
        storyKey: 'story8',
        difficulty: 'insane',
        numSources: 8,
        timeLimit: 360,
        mapTheme: 'nuclear',
        planta: PLANTA_FUKUSHIMA,   // v3.8: mapa contínuo (ver mapa/plantas-missoes.js)
        mapCols: PLANTA_FUKUSHIMA.cols,
        mapRows: PLANTA_FUKUSHIMA.rows,
        raioConcentracao: 20,
        unlocked: false,
        // Fukushima - multiple isotopes, large area
        allowedIsotopes: ['I-131', 'Cs-137', 'Sr-90'],
        concentratedSources: true,
    };
