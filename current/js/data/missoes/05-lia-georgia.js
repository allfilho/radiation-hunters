import { PLANTA_LIA } from '../../mapa/plantas-missoes.js';

export const missao = {
        id: 5,
        titleKey: 'mission5Title',
        descKey: 'mission5Desc',
        storyKey: 'story5',
        difficulty: 'hard',
        numSources: 6,
        timeLimit: 300,
        mapTheme: 'bunker',
        planta: PLANTA_LIA,   // v3.8: mapa contínuo (ver mapa/plantas-missoes.js)
        mapCols: PLANTA_LIA.cols,
        mapRows: PLANTA_LIA.rows,
        unlocked: false,
        // Lia case: RTG with Sr-90 + various orphan sources
        allowedIsotopes: ['Sr-90', 'Cs-137', 'Co-60', 'Am-241'],
    };
