// Tutorial curto (v3.19): sala pequena de laboratório, Geiger desde o início, 3 fontes de tipos diferentes
// (Cs-137 gama, Sr-90 beta, Am-241 alfa), uma lição de 1 pergunta ao identificar cada uma.
// Mantém id 1: concluir libera a missão 2 e a Agência, como a Academia fazia. A Academia completa continua em 01-treinamento.js.
export const missao = {
    id: 1,
    tutorial: true,
    titleKey: 'tutorialTitle',
    descKey: 'tutorialDesc',
    storyKey: 'tutorialStory',
    difficulty: 'tutorial',
    mapCols: 32,
    mapRows: 22,
    numSources: 3,
    timeLimit: 0,
    mapTheme: 'lab',
    unlocked: true,
    allowedIsotopes: ['Cs-137', 'Sr-90', 'Am-241'],
};
