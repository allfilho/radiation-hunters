import { PLANTA_MAYAPURI } from '../../mapa/plantas-missoes.js';

export const missao = {
        id: 7,
        titleKey: 'mission7Title',
        descKey: 'mission7Desc',
        storyKey: 'story7',
        difficulty: 'hard',
        numSources: 5,
        timeLimit: 250,
        mapTheme: 'junkyard',
        planta: PLANTA_MAYAPURI,   // v3.8: mapa contínuo (ver mapa/plantas-missoes.js)
        mapCols: PLANTA_MAYAPURI.cols,
        mapRows: PLANTA_MAYAPURI.rows,
        unlocked: false,
        // Mayapuri, India scrap yard incident
        allowedIsotopes: ['Co-60'],
        allSameIsotope: true,
        // Distratores da identificação (data/candidatos.js): distinguíveis do Co-60 com as placas do jogo
        candidatosExtras: ['Cs-137', 'Sr-90', 'Am-241'],
    };
