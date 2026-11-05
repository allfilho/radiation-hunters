// ============================================
// RADÔNIO EM AMBIENTES FECHADOS (episódio "O ar da escola", v2). Puro, roda em Node.
//
// Modelo de uma caixa bem misturada (balanço de massa), com concentração C em Bq/m³ e tempo em horas:
//     dC/dt = (S_solo + S_mat)/V - (λv + λ)·C + λv·C0
//   S_solo = gás do solo que entra por laje, trincas e tubulações (Bq/h); decresce com a altura do piso   [H: calibrado]
//   S_mat  = E · A: exalação das superfícies (Bq/m²/h) × área (m²); NÃO depende do andar                   [E: faixa V; A: H]
//   λv     = troca de ar (1/h): infiltração + janelas + portas + ventilação mecânica                       [H]
//   λ      = constante de decaimento do Rn-222 = ln 2 / 3,8232 d  (IAEA/LNHB, https://www-nds.iaea.org/act_ddl/data/Rn-222_com.pdf) [V]
//   C0     = concentração externa                                                                          [H]
// Com entrada e ventilação constantes num passo a solução é exata: C(t+dt) = C∞ + (C - C∞)·exp(-(λv+λ)·dt),
// C∞ = (S/V + λv·C0)/(λv + λ). Não há integração numérica, então o passo pode ser de minutos ou de dias.
//
// Rótulos: [V] verificado em fonte; [C] cálculo; [H] hipótese de ensino (valor de jogo, sem fonte direta).
// Fontes e tabela de parâmetros: docs/radonio-parametros.md. Nenhum valor daqui descreve uma escola real.
// ============================================

export const MEIA_VIDA_RN222_H = 3.8232 * 24;                 // [V] 3,8232 (8) d
export const LAMBDA = Math.LN2 / MEIA_VIDA_RN222_H;            // [C] ≈ 0,007554 1/h

export const PARAMETROS = Object.freeze({
  concentracaoExterna: 8,        // Bq/m³ [H]; a literatura citada em docs/radonio-parametros.md dá faixas de 0,6 a 28 (segunda mão)
  soloRefBqHPorM2: 112,          // Bq/h por m² de piso em contato com o solo, com índice de contato 1 [H: calibrado para as faixas de escolas]
  infiltracaoFechada: 0.15,      // 1/h com portas e janelas fechadas [H]
  janelaAberta: 1.5,             // 1/h somados por janela totalmente aberta [H]
  portaAberta: 0.5,              // 1/h somados por porta aberta [H]
  mecanica: 3.0,                 // 1/h com ventilação mecânica ligada [H]; os cenários de projeto de sala ocupada somam 4,6 a 6,5 (Calama-González et al. 2019) [V, cálculo]
  aulaInicioH: 8, aulaFimH: 17,  // horário de aula, de segunda a sexta [H]
  limiteOmsBqM3: 100,            // [V] WHO Handbook on Indoor Radon (2009)
  limiteMaximoBqM3: 300,         // [V] idem
});

// Ambientes da escola (todos [H]; E dentro das médias de cimento e tijolo de Nugraha et al. 2025, 1,08 a 1,44 Bq/m²/h [V]).
// piso = índice de contato com o solo (0 a 1). area = superfície total das paredes, piso e forro (m²); pisoM2 = área do piso.
export const AMBIENTES = Object.freeze({
  porao:          { id: 'porao',          andar: -1, volume: 150, area: 190, pisoM2: 40, contatoSolo: 1.00, exalacao: 2.0,  infiltracao: 0.10 },
  'deposito-terreo': { id: 'deposito-terreo', andar: 0, volume: 40, area: 90, pisoM2: 16, contatoSolo: 0.50, exalacao: 1.44, infiltracao: 0.05 },
  'sala-terreo':  { id: 'sala-terreo',    andar: 0,  volume: 180, area: 201, pisoM2: 48, contatoSolo: 0.50, exalacao: 1.08, infiltracao: 0.15 },
  'sala-andar1':  { id: 'sala-andar1',    andar: 1,  volume: 180, area: 201, pisoM2: 48, contatoSolo: 0.12, exalacao: 1.08, infiltracao: 0.15 },
  sotao:          { id: 'sotao',          andar: 2,  volume: 120, area: 160, pisoM2: 40, contatoSolo: 0.03, exalacao: 1.44, infiltracao: 0.30 },
  corredor:       { id: 'corredor',       andar: 0,  volume: 300, area: 420, pisoM2: 80, contatoSolo: 0.50, exalacao: 1.08, infiltracao: 0.20 },
});

/** Entradas separadas (Bq/h): do solo e dos materiais. */
export function entradas(sala, P = PARAMETROS) {
  const solo = sala.contatoSolo * P.soloRefBqHPorM2 * sala.pisoM2;
  const mat = sala.exalacao * sala.area;
  return { solo, mat, total: solo + mat };
}

/** Troca de ar (1/h) para um estado {janelas: n de janelas abertas (0..), portas: n, mecanica: bool}. Soma simples. */
export function trocaDeAr(sala, estado = {}, P = PARAMETROS) {
  const j = Math.max(0, estado.janelas || 0), p = Math.max(0, estado.portas || 0);
  return (sala.infiltracao ?? P.infiltracaoFechada) + j * P.janelaAberta + p * P.portaAberta + (estado.mecanica ? P.mecanica : 0);
}

/** Concentração de regime permanente (Bq/m³) para entrada S (Bq/h), volume V, troca lv e externa C0. */
export function estacionario(S, V, lv, C0 = PARAMETROS.concentracaoExterna) {
  return (S / V + lv * C0) / (lv + LAMBDA);
}

/** Constante de tempo (h) do ambiente com troca lv. */
export const constanteDeTempo = (lv) => 1 / (lv + LAMBDA);

/** Avança dtH horas com entrada e ventilação constantes (solução exata). */
export function passo(C, S, V, lv, dtH, C0 = PARAMETROS.concentracaoExterna) {
  const cInf = estacionario(S, V, lv, C0);
  return cInf + (C - cInf) * Math.exp(-(lv + LAMBDA) * dtH);
}

// ---- Agenda (tempo em horas a partir de segunda-feira 0 h) ----
export const diaDaSemana = (tH) => Math.floor(tH / 24) % 7;                 // 0 = segunda ... 6 = domingo
export const horaDoDia = (tH) => ((tH % 24) + 24) % 24;
export const ocupado = (tH, P = PARAMETROS) => diaDaSemana(tH) < 5 && horaDoDia(tH) >= P.aulaInicioH && horaDoDia(tH) < P.aulaFimH;

/**
 * Agenda de uso. opcoes:
 *   janelasNaAula: n de janelas abertas durante a aula (0 = tudo fechado)
 *   portaNaAula: n de portas abertas durante a aula
 *   janelasFora: n de janelas deixadas abertas também fora da aula (noite, fim de semana); padrão 0
 *   mecanica: 'nenhuma' | 'programada' (ligada 1 h antes da aula até 1 h depois, seg a sex) | 'continua' | 'so-na-aula'
 * Fora desses horários o ambiente fica fechado (noite, fim de semana, feriado).
 */
export function agenda({ janelasNaAula = 0, portaNaAula = 0, mecanica = 'nenhuma', janelasFora = 0 } = {}, P = PARAMETROS) {
  return (tH) => {
    const util = diaDaSemana(tH) < 5, h = horaDoDia(tH), oc = ocupado(tH, P);
    let mec = false;
    if (mecanica === 'continua') mec = true;
    else if (mecanica === 'so-na-aula') mec = oc;
    else if (mecanica === 'programada') mec = util && h >= P.aulaInicioH - 1 && h < P.aulaFimH + 1;
    return { janelas: oc ? Math.max(janelasNaAula, janelasFora) : janelasFora, portas: oc ? portaNaAula : 0, mecanica: mec };
  };
}

/**
 * Simula dias*24 h com passo dtH (padrão 0,25 h). Retorna {tH[], C[], ocupado[]} com C em Bq/m³ ao FIM de cada passo.
 * `fatorSolo(tH)` (opcional) multiplica a entrada do solo em função do tempo (pressão, chuva...), padrão 1.
 */
export function simular(sala, agendaFn, { dias = 7, dtH = 0.25, C0 = PARAMETROS.concentracaoExterna, inicial = null, fatorSolo = null, P = PARAMETROS } = {}) {
  const e = entradas(sala, P);
  let C = inicial ?? estacionario(e.total, sala.volume, trocaDeAr(sala, {}, P), C0);
  const n = Math.round(dias * 24 / dtH);
  const out = { tH: [], C: [], ocupado: [] };
  for (let i = 0; i < n; i++) {
    const t0 = i * dtH, tm = t0 + dtH / 2;
    const f = fatorSolo ? fatorSolo(tm) : 1;
    const S = e.solo * f + e.mat;
    C = passo(C, S, sala.volume, trocaDeAr(sala, agendaFn(tm), P), dtH, C0);
    out.tH.push(t0 + dtH); out.C.push(C); out.ocupado.push(ocupado(tm, P));
  }
  return out;
}

/** Estatísticas de uma série: média do período, média nas horas ocupadas, fator ocupado/total, máximo e hora do pico. */
export function resumo(serie) {
  const n = serie.C.length;
  let soma = 0, somaOc = 0, nOc = 0, max = -Infinity, iMax = 0;
  for (let i = 0; i < n; i++) {
    soma += serie.C[i];
    if (serie.ocupado[i]) { somaOc += serie.C[i]; nOc++; }
    if (serie.C[i] > max) { max = serie.C[i]; iMax = i; }
  }
  const media = soma / n, mediaOcupado = nOc ? somaOc / nOc : NaN;
  return { media, mediaOcupado, fator: nOc ? mediaOcupado / media : NaN, maximo: max, horaDoPico: serie.tH[iMax], n };
}

/** Média de um subconjunto de horas {de, ate} da semana (horas desde segunda 0 h). */
export function mediaEntre(serie, deH, ateH) {
  let s = 0, k = 0;
  for (let i = 0; i < serie.C.length; i++) if (serie.tH[i] > deH && serie.tH[i] <= ateH) { s += serie.C[i]; k++; }
  return k ? s / k : NaN;
}

// ---- Campanha de 12 períodos de 30 dias (dispositivo passivo: média de todas as horas do período) ----
export const PERIODOS_FRIOS = Object.freeze([3, 4, 5, 6, 7]);   // períodos 4 a 8 (índices 0-based)
export const FATOR_SOLO_FRIO = 2.0;                              // [H] valor de jogo: entrada do solo multiplicada no frio (diferença de pressão entre dentro e fora; sem medida de escola real)

/**
 * Médias de 30 dias (12 períodos) de um ambiente. `agendaDoPeriodo(p)` devolve as opções de agenda() do período p (0..11).
 * A simulação roda dois anos e devolve o segundo, para não herdar o estado de partida.
 */
export function campanha12(sala, agendaDoPeriodo, { fatorFrio = FATOR_SOLO_FRIO, P = PARAMETROS } = {}) {
  const ags = Array.from({ length: 12 }, (_, p) => agenda(agendaDoPeriodo(p), P));
  const per = (tH) => Math.floor(tH / 720) % 12;
  const serie = simular(sala, (tH) => ags[per(tH)](tH), { dias: 720, dtH: 1, fatorSolo: (tH) => (PERIODOS_FRIOS.includes(per(tH)) ? fatorFrio : 1), P });
  const soma = Array(12).fill(0), n = Array(12).fill(0);
  for (let i = 0; i < serie.tH.length; i++) { const t = serie.tH[i]; if (t > 8640) { const p = per(t - 1e-9); soma[p] += serie.C[i]; n[p]++; } }
  return soma.map((v, p) => v / n[p]);
}
