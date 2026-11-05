import { PLANTA_RADIUM } from '../../mapa/plantas-missoes.js';

export const missao = {
        id: 3,
        titleKey: 'mission3Title',
        descKey: 'mission3Desc',
        storyKey: 'story3',
        difficulty: 'normal',
        numSources: 4,
        timeLimit: 180,
        mapTheme: 'factory',
        planta: PLANTA_RADIUM,   // v3.8: mapa contínuo (ver mapa/plantas-missoes.js)
        mapCols: PLANTA_RADIUM.cols,
        mapRows: PLANTA_RADIUM.rows,
        unlocked: false,
        // Radium Girls: ONLY Ra-226 - historically accurate!
        // Ra-226 was the ONLY isotope used in luminous paint
        allowedIsotopes: ['Ra-226'],
        allSameIsotope: true,
        // Distratores da identificação (data/candidatos.js). Sem Am-241: no Geiger do jogo ele e o Ra-226 são alfa só por contato e não se distinguem por medida
        candidatosExtras: ['Sr-90', 'Cs-137'],
        addIsotope: { name: "Ra-226", type: "alfa", color: "#ffdd55", minBase: 60, maxBase: 140, symbol: "α", energy: 4.78, energyMeV: 4.784, halfLifeS: 1600 * 365.2422 * 86400 },
    };
