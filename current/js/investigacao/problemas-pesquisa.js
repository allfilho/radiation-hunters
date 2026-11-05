// ============================================
// LABORATÓRIO DE PESQUISA: banco de problemas sorteados no mapa do laboratório de cronologia.
// Cada problema usa só um subconjunto das salas e reaproveita as cenas do episódio "Arquivo do tempo" (arquivo-tempo.js);
// os números vêm de um conjunto de dados FICTÍCIO gerado de uma semente (sorteio-fissao.js). As cenas que dependem dos
// números (idade a reportar, interpretação dos comprimentos, verificação de ζ) têm a resposta certa calculada, não escrita.
// O Caderno (ficha) lista as etapas do problema com as marcas de conclusão.
// Textos de ensino: [H] a validar pelo Grupo de Cronologia (ver docs/laboratorio-pesquisa.md).
// ============================================
import { T, opcao as O, escolha as E, hipotese } from './autoria.js';
import { ARQUIVO_TEMPO } from './arquivo-tempo.js';
import { CAMPO_TEMPO } from './configuracoes-campo.js';
import { gerarDados } from './sorteio-fissao.js';
import { resumoConjunto, resumoComprimentos } from './dados-fissao.js';

const num = (v, d, l) => v.toLocaleString(l === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const por = (f) => T(f('pt'), f('en'));
const pcStr = (p, l) => (p < 1e-4 ? '< 0' + (l === 'pt' ? ',' : '.') + '01%' : num(p * 100, p < 0.1 ? 2 : 1, l) + '%');
const base = (id) => structuredClone(ARQUIVO_TEMPO.cenas.find((c) => c.id === id));
const local = (id) => CAMPO_TEMPO.locais.find((l) => l.id === id);
const renumerar = (cenas) => cenas.forEach((c, i) => { for (const l of ['pt', 'en']) c.titulo[l] = c.titulo[l].replace(/^\d+ · /, `${i + 1} · `); });

// ---------- cenas que dependem dos dados sorteados ----------
function idadeAmostra(D) {
    const r = resumoConjunto(D.graos, D), idade = (l) => (r.homogeneo ? `${num(r.pooledMa, 1, l)} ± ${num(r.pooledErroMa, 1, l)} Ma (pooled)` : `${num(r.centralMa, 1, l)} ± ${num(r.centralErroMa, 1, l)} Ma (${l === 'pt' ? 'central' : 'central'})`);
    const p = (l) => pcStr(r.p, l);
    return E('idade-amostra', '10 · Calcular a idade e testar o conjunto (Lab 5)', '10 · Calculate the age and test the set (Lab 5)',
        'Com ζ e ρd, calcula-se a idade. Antes de escolher qual idade média reportar, o teste χ² verifica se os grãos são compatíveis com uma única idade. Se P(χ²) > 5%, a idade pooled é adequada. Se P(χ²) < 5%, há sobredispersão e usa-se a idade central, com a dispersão. Abra o resultado dos seus grãos e registre.',
        'With ζ and ρd the age is calculated. Before choosing which mean age to report, the χ² test checks whether the grains are compatible with a single age. If P(χ²) > 5%, the pooled age is appropriate. If P(χ²) < 5%, there is overdispersion and the central age is used, with the dispersion. Open the result for your grains and record it.',
        'Qual idade e qual cuidado se aplicam à sua amostra?', 'Which age and what caution apply to your sample?', [
            { ...O('pooled', 'Reportar a idade pooled: os grãos são compatíveis com uma única idade (P(χ²) > 5%).', 'Report the pooled age: the grains are compatible with a single age (P(χ²) > 5%).', r.homogeneo, '', ''), retorno: por((l) => r.homogeneo ? (l === 'pt' ? `P(χ²) = ${p(l)} > 5%: sem sinal de sobredispersão. A idade pooled é adequada: ${idade(l)}.` : `P(χ²) = ${p(l)} > 5%: no sign of overdispersion. The pooled age is appropriate: ${idade(l)}.`) : (l === 'pt' ? `Na sua amostra P(χ²) = ${p(l)} < 5%: há sobredispersão e a idade pooled subestimaria a incerteza.` : `In your sample P(χ²) = ${p(l)} < 5%: there is overdispersion and the pooled age would underestimate the uncertainty.`)) },
            { ...O('central', 'Reportar a idade central com a dispersão, e investigar se há mais de uma componente de idade.', 'Report the central age with the dispersion, and investigate whether there is more than one age component.', !r.homogeneo, '', ''), retorno: por((l) => !r.homogeneo ? (l === 'pt' ? `P(χ²) = ${p(l)} < 5%: sobredispersão (dispersão ≈ ${num(r.dispersao * 100, 0, l)}%). Idade central = ${idade(l)}; a pooled subestimaria a incerteza.` : `P(χ²) = ${p(l)} < 5%: overdispersion (dispersion ≈ ${num(r.dispersao * 100, 0, l)}%). Central age = ${idade(l)}; the pooled age would underestimate the uncertainty.`) : (l === 'pt' ? `Na sua amostra P(χ²) = ${p(l)} > 5%: os grãos são compatíveis com uma única idade, e a idade pooled é adequada.` : `In your sample P(χ²) = ${p(l)} > 5%: the grains are compatible with a single age, and the pooled age is appropriate.`)) },
            O('descartar', 'Descartar os grãos que destoam até o χ² passar.', 'Discard outlier grains until χ² passes.', false, 'Descartar dados para passar no teste distorce o resultado; a dispersão é informação.', 'Discarding data to pass the test distorts the result; dispersion is information.'),
        ], { atividade: { tipo: 'idade', estados: ['amostra'], dados: D } });
}

function tabelaCena(D) {
    const c = base('tabela'), g = D.graos, k = g.reduce((m, x, i) => (x[0] < g[m][0] ? i : m), 0);
    c.pergunta = por((l) => (l === 'pt' ? `Por que o grão ${k + 1}, com apenas ${g[k][0]} traços espontâneos, tem erro relativo tão grande?` : `Why does grain ${k + 1}, with only ${g[k][0]} spontaneous tracks, have such a large relative error?`));
    c.opcoes.find((o) => o.id === 'pequeno').txt = por((l) => (l === 'pt' ? `Porque o grão ${k + 1} é menor e portanto mais jovem.` : `Because grain ${k + 1} is smaller and therefore younger.`));
    c.opcoes.find((o) => o.id === 'pequeno').retorno = T('O tamanho do grão não define a idade; o erro vem do número de traços contados.', 'Grain size does not define age; the error comes from the number of tracks counted.');
    return c;
}

function comprimentosAmostra(D) {
    const r = resumoConjunto(D.graos, D), c = resumoComprimentos(D.comprimentos.amostra), rapida = D.historia === 'rapida';
    const idade = (l) => (r.homogeneo ? `${num(r.pooledMa, 1, l)} Ma (pooled)` : `${num(r.centralMa, 1, l)} Ma (central)`);
    const estat = (l) => `${l === 'pt' ? 'média' : 'mean'} ${num(c.media, 1, l)} µm, ${l === 'pt' ? 'DP' : 'SD'} ${num(c.sd, 1, l)} µm`;
    const dois = D.historia === 'reaquecimento';
    return E('comprimentos-amostra', '11 · Comprimentos de traço e história térmica (Lab 5)', '11 · Track lengths and thermal history (Lab 5)',
        por((l) => l === 'pt' ? `A idade da sua amostra é ${idade(l)}. Agora meça os comprimentos dos traços confinados dentro do cristal: cada traço se forma num instante e sofre o annealing da história que se segue. A forma da distribuição, junto com Dpar, indica o tipo de história. Abra a distribuição e registre.` : `The age of your sample is ${idade(l)}. Now measure the lengths of the confined tracks inside the crystal: each track forms at a different time and undergoes the annealing of the history that follows. The shape of the distribution, together with Dpar, indicates the kind of history. Open the distribution and record it.`).pt,
        por((l) => l === 'pt' ? `A idade da sua amostra é ${idade(l)}. Agora meça os comprimentos dos traços confinados dentro do cristal: cada traço se forma num instante e sofre o annealing da história que se segue. A forma da distribuição, junto com Dpar, indica o tipo de história. Abra a distribuição e registre.` : `The age of your sample is ${idade(l)}. Now measure the lengths of the confined tracks inside the crystal: each track forms at a different time and undergoes the annealing of the history that follows. The shape of the distribution, together with Dpar, indicates the kind of history. Open the distribution and record it.`).en,
        'O que a distribuição de comprimentos da sua amostra sugere?', 'What does the length distribution of your sample suggest?', [
            { ...O('rapido', 'Resfriamento relativamente rápido através da zona de annealing parcial: traços longos e distribuição estreita.', 'Relatively fast cooling through the partial annealing zone: long tracks and a narrow distribution.', rapida, '', ''), retorno: por((l) => rapida ? (l === 'pt' ? `Sim: ${estat(l)}, traços longos e distribuição estreita, como no resfriamento rápido. A trajetória exata ainda pede modelagem tempo–temperatura.` : `Yes: ${estat(l)}, long tracks and a narrow distribution, as in fast cooling. The exact path still requires time–temperature modelling.`) : (l === 'pt' ? `Não: aqui ${estat(l)}. Resfriamento rápido daria traços longos e distribuição estreita.` : `No: here ${estat(l)}. Fast cooling would give long tracks and a narrow distribution.`)) },
            { ...O('complexa', 'Residência prolongada na zona de annealing parcial ou uma história complexa, como reaquecimento; só a modelagem tempo–temperatura testa histórias específicas.', 'Prolonged residence in the partial annealing zone or a complex history such as reheating; only time–temperature modelling tests specific histories.', !rapida, '', ''), retorno: por((l) => !rapida ? (l === 'pt' ? `Sim: ${estat(l)}${dois ? ', com dois grupos de comprimentos, um longo e outro curto' : ', traços mais curtos e distribuição mais larga'}. Isso aponta residência prolongada ou uma história mais complexa que o resfriamento rápido; qual delas, só a modelagem tempo–temperatura testa.` : `Yes: ${estat(l)}${dois ? ', with two groups of lengths, one long and one short' : ', shorter tracks and a wider distribution'}. This points to prolonged residence or a history more complex than fast cooling; which one, only time–temperature modelling tests.`) : (l === 'pt' ? `Não: aqui ${estat(l)}, traços longos e distribuição estreita; isso é típico de resfriamento rápido.` : `No: here ${estat(l)}, long tracks and a narrow distribution; this is typical of fast cooling.`)) },
            O('jovem', 'A amostra é necessariamente mais jovem.', 'The sample is necessarily younger.', false, 'O comprimento sozinho não dá a idade; ele informa sobre a história térmica.', 'Length alone does not give age; it informs the thermal history.'),
        ], { atividade: { tipo: 'comprimentos', estados: ['amostra'], dados: D } });
}

function zetaVerifica(D) {
    const v = D.verificacao, ok = Math.abs(v.dif) <= 2;
    const dado = (l) => `${num(v.idadeMa, 1, l)} ± ${num(v.erroMa, 1, l)} Ma ${l === 'pt' ? 'contra' : 'against'} ${num(v.tMa, 0, l)} Ma (${num(Math.abs(v.dif), 1, l)}σ)`;
    return E('zeta-verifica', '5 · Verificar o ζ com um segundo padrão (Lab 5)', '5 · Check ζ with a second standard (Lab 5)',
        'Um ζ só é confiável se reproduz a idade de outro padrão, que não entrou na calibração. Abra o segundo padrão: ele foi tratado com o ζ que você acabou de calibrar.',
        'A ζ is only trustworthy if it reproduces the age of another standard that was not used in the calibration. Open the second standard: it was treated with the ζ you have just calibrated.',
        'A idade calculada do segundo padrão é compatível com a idade conhecida?', 'Is the calculated age of the second standard compatible with the known age?', [
            { ...O('compativel', 'Sim: a diferença é de cerca de 2σ ou menos (critério didático), então o ζ é coerente com este padrão.', 'Yes: the difference is about 2σ or less (didactic criterion), so ζ is consistent with this standard.', ok, '', ''), retorno: por((l) => ok ? (l === 'pt' ? `Idade calculada ${dado(l)}: dentro de cerca de 2σ. O ζ reproduz o segundo padrão.` : `Calculated age ${dado(l)}: within about 2σ. ζ reproduces the second standard.`) : (l === 'pt' ? `Aqui a diferença é de ${num(Math.abs(v.dif), 1, l)}σ (${dado(l)}): passa de cerca de 2σ.` : `Here the difference is ${num(Math.abs(v.dif), 1, l)}σ (${dado(l)}): it exceeds about 2σ.`)) },
            { ...O('recalibrar', 'Não: a diferença passa de cerca de 2σ; vale rever as contagens e o ζ antes de usá-lo em amostras.', 'No: the difference exceeds about 2σ; the counts and ζ should be reviewed before using it on samples.', !ok, '', ''), retorno: por((l) => !ok ? (l === 'pt' ? `Idade calculada ${dado(l)}: acima de cerca de 2σ, o ζ merece revisão.` : `Calculated age ${dado(l)}: above about 2σ, ζ deserves review.`) : (l === 'pt' ? `Aqui a diferença é de ${num(Math.abs(v.dif), 1, l)}σ (${dado(l)}): dentro de cerca de 2σ, o ζ reproduz o padrão.` : `Here the difference is ${num(Math.abs(v.dif), 1, l)}σ (${dado(l)}): within about 2σ, ζ reproduces the standard.`)) },
            O('convencao', 'A diferença não importa, porque a idade do padrão é só uma convenção.', 'The difference does not matter, because the standard’s age is just a convention.', false, 'A idade do padrão é o que ancora o ζ; se o ζ não a reproduz, algo precisa ser revisto.', 'The standard’s age is what anchors ζ; if ζ does not reproduce it, something needs review.'),
        ], { atividade: { tipo: 'zeta-verifica', estados: ['padrao-b'], dados: D } });
}

// ---------- cenas fixas (sem números sorteados) ----------
const perguntaAnnealing = () => hipotese('pergunta-annealing', '1 · Um conjunto de annealing', '1 · An annealing set',
    'O Lab 2 precisa de dados de laboratório para calibrar um modelo de annealing. Antes de começar, diga para que serve aquecer apatitas por tempos diferentes.',
    'Lab 2 needs laboratory data to calibrate an annealing model. Before starting, say what heating apatite for different times is for.', [
        { id: 'calibra', txt: T('Para ver, em condições controladas, como os traços encurtam com o tempo e a temperatura, e calibrar modelos de annealing.', 'To see, under controlled conditions, how tracks shorten with time and temperature, and to calibrate annealing models.'), compativel: true },
        { id: 'datar', txt: T('Para medir a idade da amostra diretamente.', 'To measure the sample’s age directly.'), compativel: false },
        { id: 'naosei', txt: T('Ainda não sei para que serve.', 'I do not yet know what it is for.'), naoSei: true },
    ]);
const medidasAnnealing = (D) => E('annealing-medidas', '4 · Medir os comprimentos depois do aquecimento (Lab 5)', '4 · Measure lengths after heating (Lab 5)',
    'Cada apatita aquecida é atacada (Lab 3) e, no Lab 5, mede-se o comprimento médio de traço confinado. Em vez do comprimento bruto, usa-se o comprimento reduzido r = l/l0, que compara com o material sem aquecer. Abra os quatro tempos e registre.',
    'Each heated apatite is etched (Lab 3) and, in Lab 5, the mean confined track length is measured. Instead of the raw length, the reduced length r = l/l0 is used, comparing with the unheated material. Open the four times and record them.',
    'Como r varia com o tempo de aquecimento, numa temperatura fixa?', 'How does r vary with heating time at a fixed temperature?', [
        O('decresce', 'Diminui: quanto maior o tempo, mais os traços encurtam por annealing.', 'It decreases: the longer the time, the more tracks shorten by annealing.', true, 'É o comportamento que os modelos de annealing descrevem e que os conjuntos de laboratório medem.', 'This is the behaviour annealing models describe and laboratory sets measure.'),
        O('cresce', 'Aumenta, porque o aquecimento cria traços novos.', 'It increases, because heating creates new tracks.', false, 'O aquecimento encurta e apaga traços; ele não os cria.', 'Heating shortens and erases tracks; it does not create them.'),
        O('constante', 'Não muda: o comprimento só depende da idade da apatita.', 'It does not change: length depends only on the apatite’s age.', false, 'O aquecimento de laboratório altera o comprimento; é isso que se mede.', 'Laboratory heating changes the length; that is what is measured.'),
    ], { atividade: { tipo: 'annealing-medidas', estados: ['1h', '10h', '100h', '1000h'], dados: D } });
const limiteAnnealing = () => E('limite-annealing', '5 · O que este conjunto permite concluir', '5 · What this set allows us to conclude',
    'O seu conjunto tem quatro tempos de aquecimento (1 h, 10 h, 100 h e 1000 h) numa única temperatura.',
    'Your set has four heating times (1 h, 10 h, 100 h and 1000 h) at a single temperature.',
    'O que se pode afirmar com este conjunto?', 'What can be stated with this set?', [
        O('serie', 'Que, nessa temperatura, os traços encurtam com o tempo de aquecimento. Calibrar um modelo exige a série em várias temperaturas e o ajuste do modelo a esses dados.', 'That, at this temperature, tracks shorten with heating time. Calibrating a model requires the series at several temperatures and fitting the model to those data.', true, 'Dados de laboratório alimentam a calibração; o ajuste e a extrapolação são etapas à parte.', 'Laboratory data feed the calibration; fitting and extrapolation are separate steps.'),
        O('pronto', 'Que o modelo de annealing já está calibrado e prevê qualquer história térmica.', 'That the annealing model is already calibrated and predicts any thermal history.', false, 'Uma temperatura não calibra um modelo, e prever histórias exige o ajuste e as suas limitações.', 'One temperature does not calibrate a model, and predicting histories requires fitting and its limitations.'),
        O('soma', 'Que a idade da apatita é a soma das horas aquecidas.', 'That the apatite’s age is the sum of the hours heated.', false, 'O aquecimento de laboratório mede a cinética do annealing, não a idade.', 'Laboratory heating measures annealing kinetics, not age.'),
    ]);
const perguntaZeta = () => hipotese('pergunta-zeta', '1 · Uma calibração de ζ', '1 · A ζ calibration',
    'Um analista vai usar o método do detector externo e precisa calibrar o seu ζ. Antes de começar, diga o que é ζ.',
    'An analyst is going to use the external detector method and needs to calibrate their ζ. Before starting, say what ζ is.', [
        { id: 'calibracao', txt: T('Um parâmetro de calibração do analista, obtido com padrões de idade conhecida.', 'A calibration parameter of the analyst, obtained with standards of known age.'), compativel: true },
        { id: 'constante', txt: T('Uma constante física universal, igual para todos os laboratórios.', 'A universal physical constant, the same for all laboratories.'), compativel: false },
        { id: 'naosei', txt: T('Ainda não sei o que é.', 'I do not yet know what it is.'), naoSei: true },
    ]);
const limiteZeta = () => E('limite-zeta', '6 · O que acompanha o ζ no relato', '6 · What accompanies ζ in the report',
    'O laudo vai citar a idade de uma amostra medida com o ζ que você calibrou.',
    'The report will cite the age of a sample measured with the ζ you calibrated.',
    'Que informações de calibração devem acompanhar a idade?', 'Which calibration information should accompany the age?', [
        O('completo', 'O valor de ζ com a sua incerteza, o padrão de idade usado, ρd, o número de grãos e o χ², para o resultado ser reprodutível.', 'The ζ value with its uncertainty, the age standard used, ρd, the number of grains and χ², so the result is reproducible.', true, 'Essas são as informações de reporte recomendadas para a área (Hurford, IUGS).', 'These are the reporting items recommended for the field (Hurford, IUGS).'),
        O('so-idade', 'Só a idade e a incerteza, porque o ζ é igual em todo laboratório.', 'Only the age and uncertainty, because ζ is the same in every laboratory.', false, 'Cada analista calibra o seu ζ; sem ele a idade não pode ser conferida.', 'Each analyst calibrates their own ζ; without it the age cannot be checked.'),
        O('nada', 'Nada: o ζ já está embutido na idade.', 'Nothing: ζ is already built into the age.', false, 'Embutido, sim, mas invisível: o leitor precisa do ζ e do padrão para reproduzir o cálculo.', 'Built in, yes, but invisible: the reader needs ζ and the standard to reproduce the calculation.'),
    ]);

// ---------- definições dos quatro problemas ----------
const L = (id) => local(id);
const pt = (id, x, y, ptt, enn, extra = {}) => ({ id, x, y, pt: ptt, en: enn, npc: null, ...extra });
const comNpc = (id, extra = {}) => ({ ...L(id), ...extra });

const DEFS = [
    {
        id: 'pesquisa-datar', atalho: 'pesquisa-datar', numero: 13, salas: [1, 3, 4, 5],
        pt: { titulo: 'Problema: datar uma apatita', descricao: 'Da superfície polida à idade de traço de fissão. Salas: Lab 1, 3, 4 e 5.', problema: 'Uma apatita chegou ao laboratório. Conduza o método do detector externo e decida qual idade reportar.' },
        en: { titulo: 'Problem: date an apatite', descricao: 'From the polished surface to the fission-track age. Rooms: Lab 1, 3, 4 and 5.', problema: 'An apatite arrived at the laboratory. Run the external detector method and decide which age to report.' },
        cenas: (D) => { const c = ['pergunta-tempo', 'montagem', 'ataque-apatita', 'contagem', 'conjunto', 'reator', 'ataque-mica'].map(base); c.push(tabelaCena(D), base('zeta'), idadeAmostra(D), base('limite-tempo')); return c; },
        decisao: 'idade-amostra', limite: 'limite-tempo', transferencia: true,
    },
    {
        id: 'pesquisa-annealing', atalho: 'pesquisa-annealing', numero: 14, salas: [2, 3, 5],
        pt: { titulo: 'Problema: montar um conjunto de annealing', descricao: 'Aquecer apatitas por 1 h, 10 h, 100 h e 1000 h e medir o encurtamento dos traços. Salas: Lab 2, 3 e 5, sem passar pelos outros.', problema: 'O Lab 2 precisa de dados para calibrar um modelo de annealing. Monte o conjunto e diga o que ele permite concluir.' },
        en: { titulo: 'Problem: build an annealing set', descricao: 'Heat apatites for 1 h, 10 h, 100 h and 1000 h and measure track shortening. Rooms: Lab 2, 3 and 5, without going through the others.', problema: 'Lab 2 needs data to calibrate an annealing model. Build the set and say what it allows us to conclude.' },
        cenas: (D) => [perguntaAnnealing(), base('annealing'), base('ataque-apatita'), medidasAnnealing(D), limiteAnnealing()],
        decisao: 'annealing-medidas', limite: 'limite-annealing',
    },
    {
        id: 'pesquisa-zeta', atalho: 'pesquisa-zeta', numero: 15, salas: [1, 4, 5],
        pt: { titulo: 'Problema: calibrar o ζ com um padrão', descricao: 'Padrão de idade conhecida, reator, contagens e verificação com um segundo padrão. Salas: Lab 1, 4 e 5.', problema: 'Um analista precisa do seu ζ. Calibre-o com um padrão de idade conhecida e verifique com outro.' },
        en: { titulo: 'Problem: calibrate ζ with a standard', descricao: 'Known-age standard, reactor, counts and a check with a second standard. Rooms: Lab 1, 4 and 5.', problema: 'An analyst needs their ζ. Calibrate it with a known-age standard and check it with another.' },
        cenas: (D) => [perguntaZeta(), base('conjunto'), base('reator'), base('zeta'), zetaVerifica(D), limiteZeta()],
        decisao: 'zeta-verifica', limite: 'limite-zeta',
    },
    {
        id: 'pesquisa-historia', atalho: 'pesquisa-historia', numero: 16, salas: [1, 3, 4, 5],
        pt: { titulo: 'Problema: datar e interpretar a história térmica', descricao: 'A cadeia da idade e, depois, os comprimentos de traço confinado. Salas: Lab 1, 3, 4 e 5.', problema: 'Uma apatita chegou ao laboratório. Calcule a idade e use os comprimentos de traço para interpretar a história térmica.' },
        en: { titulo: 'Problem: date and interpret the thermal history', descricao: 'The age chain and then the confined track lengths. Rooms: Lab 1, 3, 4 and 5.', problema: 'An apatite arrived at the laboratory. Calculate the age and use the track lengths to interpret the thermal history.' },
        cenas: (D) => { const c = ['pergunta-tempo', 'montagem', 'ataque-apatita', 'contagem', 'conjunto', 'reator', 'ataque-mica'].map(base); c.push(tabelaCena(D), base('zeta'), idadeAmostra(D), comprimentosAmostra(D), base('limite-tempo')); return c; },
        decisao: 'comprimentos-amostra', limite: 'limite-tempo', transferencia: true,
    },
];

// posição de cada cena no mapa (as cenas reaproveitadas mantêm a posição do episódio original)
const POSICAO = {
    'montagem': [5, 5], 'ataque-apatita': [29, 6], 'contagem': [10, 32], 'conjunto': [9, 3], 'reator': [10, 19], 'ataque-mica': [35, 6],
    'tabela': [5, 34], 'zeta': [11, 34], 'idade-amostra': [12, 30], 'comprimentos-amostra': [3, 30], 'annealing': [21, 5],
    'pergunta-annealing': [17, 3], 'annealing-medidas': [12, 30], 'limite-annealing': [3, 30],
    'pergunta-zeta': [3, 30], 'zeta-verifica': [5, 34], 'limite-zeta': [12, 30],
};
const CURTO = {
    'montagem': T('Montagem', 'Mounting'), 'ataque-apatita': T('Ataque', 'Etch'), 'contagem': T('ρs', 'ρs'), 'conjunto': T('Conjunto', 'Set'), 'reator': T('Reator', 'Reactor'),
    'ataque-mica': T('Mica', 'Mica'), 'tabela': T('Tabela', 'Table'), 'zeta': T('ζ', 'ζ'), 'idade-amostra': T('Idade', 'Age'), 'comprimentos-amostra': T('Comprimentos', 'Lengths'),
    'annealing': T('Annealing', 'Annealing'), 'pergunta-annealing': T('Pergunta', 'Question'), 'annealing-medidas': T('Medidas', 'Measures'), 'limite-annealing': T('Limite', 'Limit'),
    'pergunta-zeta': T('Pergunta', 'Question'), 'zeta-verifica': T('Verificar', 'Check'), 'limite-zeta': T('Limite', 'Limit'),
};
const ICONE = { 'ataque-apatita': 'frasco', 'ataque-mica': 'frasco', 'contagem': 'detector', 'reator': 'detector', 'annealing': 'detector' };

function montarLocais(cenas) {
    const n = cenas.length;
    return cenas.map((c, i) => {
        if (c.id === 'pergunta-tempo') return { ...comNpc('pergunta-tempo'), visivelAte: n - 2 };
        if (c.id === 'limite-tempo') return { ...comNpc('limite-tempo'), visivelDe: n - 1 };
        const orig = local(c.id), [x, y] = POSICAO[c.id] || [orig.x, orig.y];
        return { id: c.id, x, y, pt: c.titulo.pt.replace(/^\d+ · /, '').replace(/ \(Lab \d\)$/, ''), en: c.titulo.en.replace(/^\d+ · /, '').replace(/ \(Lab \d\)$/, ''), npc: null, curto: CURTO[c.id] || orig?.curto, ...(ICONE[c.id] ? { icone: ICONE[c.id] } : {}) };
    });
}

/** Constrói o problema `id` com a semente dada (o mesmo par id+semente gera sempre o mesmo problema). */
export function construirProblema(id, semente, opcoes = {}) {
    const def = DEFS.find((d) => d.id === id || d.atalho === id);
    if (!def) return null;
    const D = gerarDados(semente, opcoes), cenas = def.cenas(D);
    renumerar(cenas);
    for (const c of cenas) if (c.atividade) c.atividade.dados = D;
    const campo = { numero: def.numero, tema: 'lab', nome: T('laboratório de pesquisa', 'research laboratory'), progresso: T('Etapas', 'Steps'), locais: montarLocais(cenas), salas: CAMPO_TEMPO.salas, planta: CAMPO_TEMPO.planta, instrutores: CAMPO_TEMPO.instrutores };
    const hip = cenas[0].id;
    return {
        id: def.id, atalho: def.atalho, versao: '0.1-teste', campo, problema: true, semente,
        cenaHipotese: hip, cenaDecisao: def.decisao, cenaLimite: def.limite, transferenciaObrigatoria: def.transferencia === true,
        pt: { ...def.pt, nota: 'Amostra, contagens, ζ, ρd e comprimentos são fictícios e sorteados. A equação de idade, as constantes e os testes estatísticos são os reais.', aviso: 'Versão de teste: o conteúdo científico aguarda revisão do Grupo de Cronologia.' },
        en: { ...def.en, nota: 'Sample, counts, ζ, ρd and lengths are fictional and drawn at random. The age equation, constants and statistical tests are the real ones.', aviso: 'Test version: the scientific content awaits review by the Chronology Group.' },
        fontes: ARQUIVO_TEMPO.fontes, fontesPublicas: ARQUIVO_TEMPO.fontesPublicas, recursos: ARQUIVO_TEMPO.recursos,
        rotulosFicha: ARQUIVO_TEMPO.rotulosFicha, cenas, dados: D, sorteio: { problema: def.id, semente },
        etapasProblema: true,
    };
}

export const PROBLEMAS = Object.freeze(DEFS.map((d) => Object.freeze({ id: d.id, atalho: d.atalho, pt: d.pt, en: d.en, salas: d.salas })));
const ATIVOS = new Map();
/** Sorteia (ou fixa) a semente e registra o problema para o restante do jogo. */
export function prepararProblema(id, semente, opcoes) {
    const s = Number.isFinite(semente) ? semente >>> 0 : (Math.floor(Math.random() * 4294967295) + 1);
    const inv = construirProblema(id, s, opcoes);
    if (inv) ATIVOS.set(inv.id, inv);
    return inv;
}
export function sortearProblema() { const d = DEFS[Math.floor(Math.random() * DEFS.length)]; return prepararProblema(d.id); }
/** Problema já preparado; se ainda não houver, prepara um com semente do endereço (?semente=) ou aleatória. */
export function problemaAtivo(id) {
    const def = DEFS.find((d) => d.id === id || d.atalho === id);
    if (!def) return null;
    if (!ATIVOS.has(def.id)) {
        let s = NaN; try { s = Number(new URLSearchParams(globalThis.location?.search || '').get('semente')); } catch (e) { /* sem endereço */ }
        prepararProblema(def.id, s);
    }
    return ATIVOS.get(def.id);
}
