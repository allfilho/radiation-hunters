// ============================================
// TUTORIAL "PRIMEIROS PASSOS" (v3.19): três fontes, três blocos curtos (Geiger e distância; blindagem; tempo-distância-blindagem).
// O jogador começa com o Geiger na mão; cada fonte identificada abre UMA lição de um parágrafo e UMA pergunta
// (reusa o painel da Academia, academia/ui-licao.js, com `opcoes.licao`). A Academia completa (8 salas) continua
// disponível como missão opcional. Lógica pura: sem DOM e sem Phaser.
// Rótulos: [V] verificado em fonte aberta; [C] consenso/regra geral; [H] escolha de jogo.
// ============================================
const FONTE_BASE = 'EPA, Radiation Basics (epa.gov/radiation/radiation-basics); NRC, Unit 1: Radiation (nrc.gov) [V], as mesmas fontes das lições da Academia.';

export const BLOCOS = [
    { // 1 · Geiger e distância
        pt: {
            titulo: '1 · Geiger e distância',
            paragrafos: ['Os cliques do Geiger aceleram quando você chega perto de uma fonte e diminuem quando você se afasta. Para uma fonte pequena, a leitura cai rápido com a distância: afastar-se é a proteção mais simples.'],
            fonte: 'NRC, What is a Geiger Counter (nrc.gov) [V]. A queda da leitura com a distância é a regra geral para fonte pequena [C].',
            perguntas: [{ q: 'Você se afasta da fonte. O que acontece com os cliques do Geiger?', opcoes: ['Diminuem', 'Aumentam', 'Ficam iguais'], certa: 0, porque: 'Quanto mais longe da fonte, menos radiação chega ao detector.' }],
        },
        en: {
            titulo: '1 · Geiger and distance',
            paragrafos: ['The Geiger clicks speed up as you get close to a source and slow down as you move away. For a small source the reading drops fast with distance: stepping back is the simplest protection.'],
            fonte: 'NRC, What is a Geiger Counter (nrc.gov) [V]. The drop of the reading with distance is the general rule for a small source [C].',
            perguntas: [{ q: 'You move away from the source. What happens to the Geiger clicks?', opcoes: ['They slow down', 'They speed up', 'They stay the same'], certa: 0, porque: 'The farther from the source, the less radiation reaches the detector.' }],
        },
    },
    { // 2 · Blindagem
        pt: {
            titulo: '2 · Blindagem',
            paragrafos: ['Cada tipo de radiação é barrado por um material diferente: a partícula alfa, até por uma folha de papel; a beta, por alguns milímetros de alumínio ou plástico; o gama só é bem reduzido por materiais densos, como o chumbo. Por isso comparar a leitura COM e SEM placa ajuda a descobrir o tipo.'],
            fonte: FONTE_BASE + ' Simplificação de jogo [H].',
            perguntas: [{ q: 'Qual destes materiais reduz mais a radiação gama?', opcoes: ['Folha de papel', 'Chumbo', 'Plástico fino'], certa: 1, porque: 'O gama atravessa materiais leves; o chumbo, denso, é o que mais o reduz.' }],
        },
        en: {
            titulo: '2 · Shielding',
            paragrafos: ['Each kind of radiation is stopped by a different material: alpha particles even by a sheet of paper; beta by a few millimetres of aluminium or plastic; gamma is only well reduced by dense materials such as lead. That is why comparing the reading WITH and WITHOUT a plate helps to find the type.'],
            fonte: 'EPA, Radiation Basics (epa.gov/radiation/radiation-basics); NRC, Unit 1: Radiation (nrc.gov) [V], the same sources as the Academy lessons. Game simplification [H].',
            perguntas: [{ q: 'Which of these materials reduces gamma radiation the most?', opcoes: ['Sheet of paper', 'Lead', 'Thin plastic'], certa: 1, porque: 'Gamma goes through light materials; dense lead reduces it the most.' }],
        },
    },
    { // 3 · Tempo, distância, blindagem
        pt: {
            titulo: '3 · Tempo, distância, blindagem',
            paragrafos: ['Para receber menos dose: passe menos tempo perto da fonte, fique mais longe e use blindagem. São as três regras básicas de proteção radiológica, e na Agência elas decidem quanta dose sua equipe recebe em cada missão.'],
            fonte: 'Regra geral de proteção radiológica (tempo, distância e blindagem) [C]; conferir em EPA, Radiation Protection (epa.gov/radiation).',
            perguntas: [{ q: 'Qual combinação diminui a dose recebida?', opcoes: ['Ficar perto, por muito tempo', 'Ficar longe, por pouco tempo e atrás de blindagem', 'Desligar o Geiger'], certa: 1, porque: 'Menos tempo, mais distância e blindagem reduzem a dose. Desligar o Geiger só esconde a medida.' }],
        },
        en: {
            titulo: '3 · Time, distance, shielding',
            paragrafos: ['To receive less dose: spend less time near the source, stay farther away and use shielding. These are the three basic rules of radiation protection, and in the Agency they decide how much dose your team gets on each mission.'],
            fonte: 'General radiation-protection rule (time, distance and shielding) [C]; check EPA, Radiation Protection (epa.gov/radiation).',
            perguntas: [{ q: 'Which combination lowers the dose received?', opcoes: ['Stay close, for a long time', 'Stay far, for a short time and behind shielding', 'Switch the Geiger off'], certa: 1, porque: 'Less time, more distance and shielding lower the dose. Switching the Geiger off only hides the measurement.' }],
        },
    },
];

const TXT = {
    pt: { rotulo: 'Agora', progresso: (a, n) => `Fontes: ${a}/${n}` },
    en: { rotulo: 'Now', progresso: (a, n) => `Sources: ${a}/${n}` },
};
const PASSOS = {
    pt: {
        ligar: 'Pressione G para ligar o Geiger.',
        procurar: 'Ande devagar: quanto mais perto de uma fonte, mais rápidos os cliques. Junto ao móvel, pressione Q para identificar.',
        placas: 'Experimente as placas 1 a 4 (1 = nenhuma, 4 = chumbo) e compare as leituras; depois pressione Q.',
        ultima: 'Última fonte: aproxime-se aos poucos e use as placas para decidir.',
    },
    en: {
        ligar: 'Press G to switch the Geiger on.',
        procurar: 'Walk slowly: the closer to a source, the faster the clicks. Next to the furniture, press Q to identify.',
        placas: 'Try plates 1 to 4 (1 = none, 4 = lead) and compare the readings; then press Q.',
        ultima: 'Last source: approach step by step and use the plates to decide.',
    },
};

/** Texto do HUD para o estado atual: { progresso, proximo }. */
export function objetivoTutorial({ geigerLigado, achadas, total }, lang = 'pt') {
    const L = TXT[lang] || TXT.en, P = PASSOS[lang] || PASSOS.en;
    const id = !geigerLigado && achadas === 0 ? 'ligar' : achadas === 0 ? 'procurar' : achadas < total - 1 ? 'placas' : 'ultima';
    return { id, progresso: L.progresso(achadas, total), proximo: `${L.rotulo}: ${P[id]}` };
}
