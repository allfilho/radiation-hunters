import { ACADEMIA_COLUNAS, ACADEMIA_LINHAS } from '../../mapa/academia.js';

export const missao = {
        id: 1,
        titleKey: 'mission1Title',
        descKey: 'mission1Desc',
        storyKey: 'story1',
        difficulty: 'tutorial',
        // Academia: mapa grande de 8 salas com corredor central (mapa/academia.js), uma fonte por sala,
        // 2 salas trancadas (chaves azul e vermelha); pode ser pulada no menu
        layout: 'academia',
        mapCols: ACADEMIA_COLUNAS,
        mapRows: ACADEMIA_LINHAS,
        numSources: 5,
        // Currículo linear (docs: Academia do Caçador): salas 1 a 3 só teoria; o Geiger é um item na sala 4;
        // fontes nas salas 4 a 8 (índices 3 a 7), uma por sala, com o isótopo da lição de cada sala
        umaFontePorSala: true,
        salasComFonte: [3, 4, 5, 6, 7],
        isotopoPorSala: { 3: 'Cs-137', 4: 'Cs-137', 5: 'Sr-90', 6: 'Am-241', 7: '*' },
        licoes: true,
        geigerComoItem: true,
        timeLimit: 1200,   // meta de tempo [H]: o tempo de leitura das lições não conta
        mapTheme: 'lab',
        unlocked: true,
        allowedIsotopes: ['Am-241', 'Sr-90', 'Cs-137'],
    };
