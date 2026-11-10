// ============================================
// MODO PROFESSOR E VERSÃO
// Parâmetros de endereço (opcionais; sem eles o jogo é o de sempre):
//   ?missao=N   abre direto a missão N (1 a 8), sem passar pelo menu nem pelo desbloqueio
//   ?estudo=1   modo estudo: o tempo não entra no aproveitamento (os demais pesos são reescalados a 100%)
//   ?investigacao=hospital   abre direto a investigação do hospital (protótipo em teste)
// Funções puras sobre a string de busca, para poderem ser testadas sem navegador.
// ============================================
export const VERSAO = '3.39.0 · 2026-11-10';

/** @param {string} busca  ex.: "?missao=3&estudo=1" (padrão: o endereço atual) */
export function lerParametros(busca = (globalThis.location && globalThis.location.search) || '', totalMissoes = 8) {
    let p;
    try { p = new URLSearchParams(busca); } catch (e) { return { missao: null, estudo: false, investigacao: null }; }
    const valorMissao = p.get('missao') || '';
    const n = /^\d+$/.test(valorMissao) ? Number(valorMissao) : NaN;
    const e = (p.get('estudo') || '').toLowerCase();
    return {
        missao: Number.isInteger(n) && n >= 1 && n <= totalMissoes ? n : null,
        estudo: e === '1' || e === 'true' || e === 'sim',
        investigacao: (p.get('investigacao') || '').replace(/[^a-z0-9-]/gi, '') || null,
    };
}

let atuais = null;
/** Parâmetros do endereço atual (lidos uma vez). */
export function parametros() {
    if (!atuais) atuais = lerParametros();
    return atuais;
}
export const modoEstudo = () => parametros().estudo;
