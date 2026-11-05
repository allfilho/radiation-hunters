import { PLANTA_GOIANIA } from '../../mapa/plantas-missoes.js';

export const missao = {
        id: 2,
        titleKey: 'mission2Title',
        descKey: 'mission2Desc',
        storyKey: 'story2',
        difficulty: 'easy',
        numSources: 5,
        timeLimit: 0,
        mapTheme: 'junkyard',
        // v3.8: mapa contínuo maior (exterior + edifícios), a partir da planta esquemática de mapa/plantas-missoes.js
        planta: PLANTA_GOIANIA,
        mapCols: PLANTA_GOIANIA.cols,
        mapRows: PLANTA_GOIANIA.rows,
        unlocked: false,
        // Goiânia: ONLY Cs-137 fragments scattered in junkyard - REALISTIC!
        allowedIsotopes: ['Cs-137'],
        allSameIsotope: true,
        // Distratores da identificação (data/candidatos.js): distinguíveis do Cs-137 com as placas do jogo
        candidatosExtras: ['Co-60', 'Sr-90', 'Am-241'],
    };
