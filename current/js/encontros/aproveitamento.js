// ============================================
// APROVEITAMENTO DA MISSÃO (0–100%): 55% fontes identificadas, 20% tempo, 15% encontros, 10% cofre (aprendizagem 25%).
// Pesos aprovados como ponto de partida (docs/encontros-5c.md, seção 6). Funções puras.
// ============================================
import { descontoDeDicas } from './dica.js';
export const PESOS = { fontes: 55, tempo: 20, encontros: 15, cofre: 10 };
export const TOTAL_ENCONTROS = 3;
export const MAXIMO_SEM_ENCONTROS = PESOS.fontes + PESOS.tempo; // 75

const clamp01 = (x) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/**
 * @param {object} p
 * @param {number} p.precisao  acertos / tentativas de identificação (0–1; sem tentativas = 0)
 * @param {number} p.tempo     segundos de jogo (sem contar encontros)
 * @param {number} p.meta      meta de tempo da missão (s)
 * @param {number[]} p.creditos créditos dos encontros feitos (0–1); encontros não feitos contam 0
 * @param {number[]} p.cofre   créditos (0–1) das perguntas do cofre de transporte; sem nenhuma resposta = 0
 * @param {boolean} p.encontrosAtivos  false = jogador desligou os encontros e o cofre (teto de 75%)
 * @param {number} p.dicas  dicas de localização de nível 2 usadas (cada uma desconta DICA_DESCONTO pontos, com teto)
 * @param {boolean} p.semTempo  modo estudo: o tempo não conta; fontes, encontros e cofre são reescalados para somar 100%
 */
export function aproveitamento({ precisao, tempo, meta, creditos = [], cofre = [], encontrosAtivos = true, semTempo = false, dicas = 0 }) {
    const fontes = PESOS.fontes * clamp01(precisao);
    const t = semTempo ? 0 : PESOS.tempo * (tempo > 0 && meta > 0 ? clamp01(meta / tempo) : 0);
    const soma = creditos.slice(0, TOTAL_ENCONTROS).reduce((a, c) => a + clamp01(c), 0);
    const enc = encontrosAtivos ? PESOS.encontros * (soma / TOTAL_ENCONTROS) : 0;
    const cof = encontrosAtivos && cofre.length ? PESOS.cofre * (cofre.reduce((a, c) => a + clamp01(c), 0) / cofre.length) : 0;
    // Modo estudo: divide pela soma dos pesos que restam (80), para o máximo continuar 100
    const k = semTempo ? 100 / (100 - PESOS.tempo) : 1;
    const desconto = descontoDeDicas(dicas);
    const total = Math.max(0, (fontes + t + enc + cof) * k - desconto);
    const maxBruto = semTempo ? (encontrosAtivos ? 100 - PESOS.tempo : PESOS.fontes) : (encontrosAtivos ? 100 : MAXIMO_SEM_ENCONTROS);
    const r = { fontes: fontes * k, tempo: t, encontros: enc * k, cofre: cof * k, total: Math.round(total * 10) / 10, maximo: Math.round(maxBruto * k * 10) / 10 };
    if (semTempo) r.semTempo = true;
    if (desconto > 0) { r.dicas = Math.floor(dicas); r.descontoDicas = desconto; }
    return r;
}
