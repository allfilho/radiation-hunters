// ============================================
// AGÊNCIA: PLANO DE DOSE antes da saída (v3.38, Fase F). Lógica PURA (sem DOM nem Phaser).
//
// Base real [V]: OECD/NEA, "Work Management to Optimise Occupational Radiological Protection at Nuclear Power Plants"
// (NEA n.º 6399, 2009): a exposição depende do nível de radiação na área, do tempo e do número de trabalhadores (p. 11);
// objetivos de dose são fixados na preparação do trabalho e comparados com a dose real depois (p. 24); na Coreia há revisão
// ALARA pós-trabalho quando a dose real passa a esperada em 25 % (p. 32). Dosímetros eletrônicos podem alertar ao passar um
// limite de dose escolhido.
// No jogo [H]: um objetivo de dose individual por saída, igual para toda a equipe; o dosímetro de cada um toca ao atingi-lo;
// bônus sobre o prêmio se todos ficarem dentro; revisão (1 dia a mais ocupado) se alguém passar 25 % acima.
// ============================================
import { NORMAS, doseNaJanela } from './equipe.js';

/** Opções de objetivo (mSv) e o bônus sobre o prêmio da missão se todos ficarem dentro [H]. */
export const OBJETIVOS = [
    { msv: 0.25, bonus: 0.20 },
    { msv: 0.5, bonus: 0.15 },
    { msv: 0.75, bonus: 0.10 },
    { msv: 1.0, bonus: 0.05 },
];
export const PLANO = {
    revisaoFator: 1.25,  // revisão pós-trabalho se a dose real passar o objetivo em mais de 25 % (critério citado pela NEA) [V+H]
    revisaoDias: 1,      // dias a mais ocupados na revisão [H]
};

/** Objetivo válido (mSv) ou null ("sem objetivo"). */
export const objetivoValido = (v) => (OBJETIVOS.some((o) => o.msv === v) ? v : null);
/** Fração de bônus de um objetivo (0 sem objetivo). */
export const bonusDoObjetivo = (v) => (OBJETIVOS.find((o) => o.msv === v) || { bonus: 0 }).bonus;

/** Margem (mSv) de um cientista: quanto ainda cabe até o limite da janela mais restritiva (≥ 0). */
export function margemMsv(m, dia) {
    let r = Infinity;
    for (const j of NORMAS.janelas) r = Math.min(r, j.limite - doseNaJanela(m, dia, j.dias));
    return Math.max(0, Math.round(r * 1000) / 1000);
}

/** Sugestão: o maior objetivo que cabe na menor margem da equipe; se nenhum cabe, o menor. null sem equipe. */
export function sugerirObjetivo(membros, dia) {
    if (!membros || !membros.length) return null;
    const menor = Math.min(...membros.map((m) => margemMsv(m, dia)));
    const cabem = OBJETIVOS.filter((o) => o.msv <= menor + 1e-9);
    return (cabem.length ? cabem[cabem.length - 1] : OBJETIVOS[0]).msv;
}

/** Quem embarcado tem margem menor que o objetivo: [{ id, nome, margem }]. */
export function avisosPlano(membros, dia, objetivo) {
    if (objetivoValido(objetivo) === null) return [];
    return membros.map((m) => ({ id: m.id, nome: m.nome, margem: margemMsv(m, dia) })).filter((x) => x.margem < objetivo - 1e-9);
}

/**
 * Avalia o plano no fim da saída. `doses` = [{ id, msv }] (dose da saída de cada um).
 * Devolve { objetivo, cumprido, revisao, acima: [ids acima do objetivo], revisados: [ids acima de 125 %] }.
 */
export function avaliarPlano(objetivo, doses) {
    const o = objetivoValido(objetivo);
    if (o === null) return { objetivo: null, cumprido: false, revisao: false, acima: [], revisados: [] };
    const acima = doses.filter((d) => d.msv > o + 1e-9).map((d) => d.id);
    const revisados = doses.filter((d) => d.msv > o * PLANO.revisaoFator + 1e-9).map((d) => d.id);
    return { objetivo: o, cumprido: doses.length > 0 && acima.length === 0, revisao: revisados.length > 0, acima, revisados };
}

/** Créditos de bônus: só com missão concluída e plano cumprido. */
export const bonusPlano = (objetivo, premio, cumprido, concluida) => (concluida && cumprido ? Math.round(Math.max(0, premio) * bonusDoObjetivo(objetivo)) : 0);

/** Segundos até atingir o objetivo na taxa atual (mSv/h). null se não há objetivo ou a taxa é ~0; 0 se já atingiu. */
export function tempoAteObjetivo(objetivo, doseMsv, taxaMsvH) {
    const o = objetivoValido(objetivo);
    if (o === null) return null;
    if (doseMsv >= o) return 0;
    if (!(taxaMsvH > 1e-9)) return null;
    return (o - doseMsv) / taxaMsvH * 3600;
}
