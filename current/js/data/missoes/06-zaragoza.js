import { PLANTA_ZARAGOZA } from '../../mapa/plantas-missoes.js';

export const missao = {
        id: 6,
        titleKey: 'mission6Title',
        descKey: 'mission6Desc',
        storyKey: 'story6',
        difficulty: 'normal',
        numSources: 4,
        timeLimit: 200,
        mapTheme: 'hospital',
        planta: PLANTA_ZARAGOZA,   // v3.8: mapa contínuo (ver mapa/plantas-missoes.js)
        mapCols: PLANTA_ZARAGOZA.cols,
        mapRows: PLANTA_ZARAGOZA.rows,
        unlocked: false,
        // v3.21: o acidente real foi um acelerador (sem isótopo). Aqui o levantamento só acha fontes de MEDICINA NUCLEAR (exames):
        // elas não são a causa; as de radioterapia (Co-60, Cs-137) entram só como candidatos errados da identificação.
        allowedIsotopes: ['Tc-99m', 'I-131'],
        candidatosExtras: ['Cs-137', 'Co-60'],
        depoisInvestigacao: 'i-zaragoza',
    };
