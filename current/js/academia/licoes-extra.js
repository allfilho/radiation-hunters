// ============================================
// ACADEMIA · lições EXTRAS (leitura opcional). Não entram em LICOES: as 8 lições lineares do mapa não mudam e a conclusão
// da missão não depende destas. Abertas em modo de revisão (só teoria, sem quiz), por exemplo a partir do episódio do radônio.
// Rótulos: [V] verificado em fonte; [C] dedução/cálculo a partir do modelo; [H] valor de jogo (hipótese de ensino).
// ============================================
import { LAMBDA, PARAMETROS, AMBIENTES, entradas, estacionario, trocaDeAr, constanteDeTempo } from '../fisica/radonio.js';

const nf = (v, d, l) => v.toLocaleString(l === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sala = AMBIENTES['sala-terreo'], e = entradas(sala);
const lvF = trocaDeAr(sala, {}), lvM = trocaDeAr(sala, { mecanica: true });
/** Números da lição, calculados com o mesmo módulo da atividade: a lição e o gráfico nunca divergem. */
export const NUMEROS_RADONIO = Object.freeze({
  lambda: LAMBDA, semiVidaDias: 3.8232,
  entradaPorVolume: e.total / sala.volume,
  lvFechada: lvF, lvMecanica: lvM,
  cFechada: estacionario(e.total, sala.volume, lvF), cMecanica: estacionario(e.total, sala.volume, lvM),
  tauFechadaH: constanteDeTempo(lvF), tauMecanicaMin: constanteDeTempo(lvM) * 60, tauDecaimentoH: 1 / LAMBDA,
});
const N = NUMEROS_RADONIO;
const pt = (v, d) => nf(v, d, 'pt'), en = (v, d) => nf(v, d, 'en');

const FONTE_PT = 'Meia-vida do Rn-222, 3,8232 dias: IAEA/LNHB, tabela de dados de decaimento (www-nds.iaea.org/act_ddl/data/Rn-222_com.pdf) [V]. Referência de 100 Bq/m³ (e, se não for possível, no máximo 300): OMS, Handbook on Indoor Radon, 2009 [V]. A equação é o balanço de massa de uma caixa bem misturada e foi deduzida para o jogo [C]. A sala, a entrada de radônio, as trocas de ar e a concentração do ar de fora são valores de jogo [H], não medidas de uma escola real; o jogo ensina o comportamento, não a escala.';
const FONTE_EN = 'Rn-222 half-life, 3.8232 days: IAEA/LNHB decay data table (www-nds.iaea.org/act_ddl/data/Rn-222_com.pdf) [V]. Reference level of 100 Bq/m³ (and, if that is not achievable, no more than 300): WHO, Handbook on Indoor Radon, 2009 [V]. The equation is the mass balance of a well-mixed box and was derived for the game [C]. The room, the radon input, the air changes and the outdoor concentration are game values [H], not measurements from a real school; the game teaches the behavior, not the scale.';

export const LICOES_EXTRA = {
  'radonio-equacao': {
    pt: {
      titulo: 'Extra · Por que o radônio sobe e desce numa sala',
      paragrafos: [
        'Leitura opcional: não vale estrela e não destrava nada. Ela explica, com uma equação, o que o gráfico da atividade mostra.',
        'O radônio-222 é um gás radioativo que vem do decaimento do rádio, presente em pequenas quantidades no solo e nos materiais de construção. Ele entra numa sala vindo do solo (por trincas, juntas e tubulações) e das paredes e do piso. Sai quando o ar é trocado. E ainda desaparece sozinho, porque decai, com meia-vida de ' + pt(N.semiVidaDias, 4) + ' dias.',
        'Em palavras, a regra é um balanço: em cada hora, a variação da concentração é o que entra, menos o que sai, menos o que decai. Em símbolos: dC/dt = S/V − (λv + λ)·C + λv·C0.',
        'C é a concentração de radônio na sala (Bq/m³; 1 Bq/m³ é uma desintegração por segundo em cada metro cúbico de ar). S é a entrada de radônio do solo e dos materiais (Bq/h). V é o volume da sala (m³). λv é a troca de ar (1/h): 1 h⁻¹ significa que, por hora, o ar da sala é trocado uma vez. C0 é a concentração do ar de fora. λ é a constante de decaimento: λ = ln 2 / meia-vida ≈ ' + pt(N.lambda, 4) + ' h⁻¹.',
        'Se nada mudar por tempo suficiente, a sala chega a um equilíbrio, e a variação passa a ser zero: C∞ = (S/V + λv·C0) / (λv + λ). O tempo para chegar perto dele é a constante de tempo τ = 1 / (λv + λ).',
        'Veja com os números de jogo da sala de aula do térreo: S/V ≈ ' + pt(N.entradaPorVolume, 1) + ' Bq/m³ por hora. Fechada, λv = ' + pt(N.lvFechada, 2) + ' h⁻¹, e a sala chega a cerca de ' + pt(N.cFechada, 0) + ' Bq/m³, com τ ≈ ' + pt(N.tauFechadaH, 1) + ' h. Com ventilação mecânica ligada, λv = ' + pt(N.lvMecanica, 2) + ' h⁻¹: o equilíbrio cai para cerca de ' + pt(N.cMecanica, 0) + ' Bq/m³, e τ ≈ ' + pt(N.tauMecanicaMin, 0) + ' min. Por isso o gráfico cai depressa quando a ventilação liga e sobe devagar quando ela desliga.',
        'Duas conclusões. Primeira: o decaimento (λ ≈ ' + pt(N.lambda, 4) + ' h⁻¹) é muito menor do que a troca de ar de uma sala (0,15 h⁻¹ ou mais), então quem manda na concentração é a ventilação, e não o decaimento. Segunda: aumentar λv reduz C, e quando λv fica grande a concentração da sala se aproxima da do ar de fora (C0), que é o piso que a ventilação não ultrapassa; é o que a ventilação nos dias de aula faz com a média das aulas, mas não com a noite e o fim de semana, quando ela está desligada.',
        'Limites: a sala é tratada como uma caixa bem misturada, sem cantos mais parados; S e λv são constantes em cada trecho; e os números são do jogo. Uma medição real exige instrumento adequado, protocolo e período declarado, como no episódio.',
      ],
      fonte: FONTE_PT,
      perguntas: [],
    },
    en: {
      titulo: 'Extra · Why radon rises and falls in a room',
      paragrafos: [
        'Optional reading: it earns no star and unlocks nothing. It explains, with an equation, what the activity chart shows.',
        'Radon-222 is a radioactive gas that comes from the decay of radium, present in small amounts in soil and building materials. It enters a room from the ground (through cracks, joints and pipes) and from the walls and floor. It leaves when the air is exchanged. And it also disappears on its own, because it decays, with a half-life of ' + en(N.semiVidaDias, 4) + ' days.',
        'In words, the rule is a balance: each hour, the change in concentration is what comes in, minus what goes out, minus what decays. In symbols: dC/dt = S/V − (λv + λ)·C + λv·C0.',
        'C is the radon concentration in the room (Bq/m³; 1 Bq/m³ is one disintegration per second in each cubic meter of air). S is the radon input from the ground and materials (Bq/h). V is the room volume (m³). λv is the air change rate (1/h): 1 h⁻¹ means the room air is replaced once per hour. C0 is the outdoor concentration. λ is the decay constant: λ = ln 2 / half-life ≈ ' + en(N.lambda, 4) + ' h⁻¹.',
        'If nothing changes for long enough, the room reaches equilibrium, and the change becomes zero: C∞ = (S/V + λv·C0) / (λv + λ). The time to get close to it is the time constant τ = 1 / (λv + λ).',
        'See it with the game numbers for the ground-floor classroom: S/V ≈ ' + en(N.entradaPorVolume, 1) + ' Bq/m³ per hour. Closed, λv = ' + en(N.lvFechada, 2) + ' h⁻¹, and the room reaches about ' + en(N.cFechada, 0) + ' Bq/m³, with τ ≈ ' + en(N.tauFechadaH, 1) + ' h. With mechanical ventilation on, λv = ' + en(N.lvMecanica, 2) + ' h⁻¹: equilibrium falls to about ' + en(N.cMecanica, 0) + ' Bq/m³, and τ ≈ ' + en(N.tauMecanicaMin, 0) + ' min. That is why the chart drops quickly when ventilation starts and rises slowly when it stops.',
        'Two conclusions. First: decay (λ ≈ ' + en(N.lambda, 4) + ' h⁻¹) is much smaller than the air change of a room (0.15 h⁻¹ or more), so ventilation, not decay, controls the concentration. Second: raising λv lowers C, and when λv gets large the room concentration approaches the outdoor one (C0), the floor that ventilation cannot go below; this is what ventilation on school days does to the class-hours mean, but not to nights and weekends, when it is off.',
        'Limits: the room is treated as a well-mixed box, with no stagnant corners; S and λv are constant within each stretch; and the numbers are game values. A real measurement requires a suitable instrument, a protocol and a stated period, as in the episode.',
      ],
      fonte: FONTE_EN,
      perguntas: [],
    },
  },
};
