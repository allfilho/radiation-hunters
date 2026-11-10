// ============================================
// AGÊNCIA: CARREIRA dos cientistas, MURAL e BRIEFING do dia (v3.39). Lógica PURA (sem DOM).
//
// Inspiração (ver claude/radhunter-ideias-cult-of-the-lamb.md): seguidores com níveis, traços e pensamentos legíveis
// (Cult of the Lamb) e postos com árvore curta de bônus e memorial (X-COM). Aqui não há morte: quem se aposenta vai
// para o Mural da Agência. Todos os números são HIPÓTESES DE JOGO [H], a calibrar em sala.
// ============================================

import { ajustarMoral, moralDe, MORAL } from './base-viva.js';

/** Postos por missões concluídas [H]. Nomes neutros quanto a gênero (pt). */
export const POSTOS = [
    { id: 'iniciante', min: 0 },
    { id: 'especialista', min: 3 },
    { id: 'senior', min: 8 },
    { id: 'referencia', min: 15 },
];
/** Bônus de carreira [H]. velocidade multiplica a velocidade em campo; erroId e coleta multiplicam doses extras; retorno soma ao limite de alta. */
export const BONUS_CARREIRA = {
    agilidade: { velocidade: 1.08 },
    manuseio: { coleta: 0.7 },
    precisao: { erroId: 0.5 },
    recuperacao: { retorno: 0.05 },
};
export const IDS_BONUS = Object.keys(BONUS_CARREIRA);
/** O que cada promoção oferece (escolhe 1 de 2). No último posto, os dois que ainda faltam. */
const OFERTAS = { especialista: ['agilidade', 'manuseio'], senior: ['precisao', 'recuperacao'] };
export const APOSENTADORIA = { posto: 'referencia', missoes: 20, nota: 1 };   // [H] pode se aposentar com 20 missões; +1 de nota da Agência

const idxPosto = (id) => POSTOS.findIndex((p) => p.id === id);
/** Posto atual pelo número de missões. */
export const postoDe = (m) => { let p = POSTOS[0]; for (const x of POSTOS) if ((m.missoes || 0) >= x.min) p = x; return p.id; };
/** Missões que faltam para o próximo posto (null no último). */
export function faltamParaProximo(m) {
    const i = idxPosto(postoDe(m)); if (i >= POSTOS.length - 1) return null;
    return POSTOS[i + 1].min - (m.missoes || 0);
}
/** Oferta de bônus de um posto para `m` (os já escolhidos ficam de fora). */
export function ofertaDe(m, posto) {
    const ja = Object.values(m.escolhas || {});
    if (OFERTAS[posto]) return OFERTAS[posto].filter((b) => !ja.includes(b)).slice(0, 2);
    return IDS_BONUS.filter((b) => !ja.includes(b)).slice(0, 2);
}
/** Primeiro posto alcançado ainda sem bônus escolhido (null se não há promoção pendente). */
export function promocaoPendente(m) {
    const atual = idxPosto(postoDe(m));
    for (let i = 1; i <= atual; i++) { const p = POSTOS[i].id; if (!(m.escolhas || {})[p] && ofertaDe(m, p).length) return p; }
    return null;
}
/** Soma uma missão concluída. Devolve o novo posto se houve promoção, senão null. */
export function registrarMissao(m) {
    const antes = postoDe(m);
    m.missoes = (m.missoes || 0) + 1;
    const depois = postoDe(m);
    return depois !== antes ? depois : null;
}
/** Escolhe o bônus da promoção pendente. Devolve true se valeu. */
export function escolherBonus(m, bonus) {
    const p = promocaoPendente(m); if (!p || !ofertaDe(m, p).includes(bonus)) return false;
    m.escolhas = { ...(m.escolhas || {}), [p]: bonus };
    return true;
}
/** Fator de carreira para `chave` (1 sem bônus; 0 de soma para retorno). */
export function fatorCarreira(m, chave) {
    let f = chave === 'retorno' ? 0 : 1;
    for (const b of Object.values((m && m.escolhas) || {})) {
        const v = (BONUS_CARREIRA[b] || {})[chave]; if (v === undefined) continue;
        f = chave === 'retorno' ? f + v : f * v;
    }
    return f;
}
export const podeAposentar = (m) => postoDe(m) === APOSENTADORIA.posto && (m.missoes || 0) >= APOSENTADORIA.missoes && !m.tratamento;

/** Aposenta `id` com homenagem no Mural. Devolve o registro do mural ou null. */
export function aposentar(est, id) {
    const i = est.equipe.findIndex((m) => m.id === id); if (i < 0) return null;
    const m = est.equipe[i];
    if (!podeAposentar(m) || (m.ocupadoAte || 0) > est.dia || est.equipe.length <= 1) return null;
    est.equipe.splice(i, 1);
    const reg = { nome: m.nome, retrato: m.retrato, especialidade: m.especialidade, missoes: m.missoes || 0, dia: est.dia };
    est.mural = [...(est.mural || []), reg].slice(-40);
    est.nota += APOSENTADORIA.nota;
    return reg;
}

/** Pensamento do cartão (chave de texto), a partir do estado. `r` = dose relativa; `seguidas` = dias com dose nos últimos 7. */
export function pensamento(m, dia, r, seguidas) {
    if (m.tratamento) return 'tratamento';
    if (promocaoPendente(m)) return 'promocao';
    if (moralDe(m) < MORAL.baixo) return 'desanimado';   // v3.41
    if (r >= 0.75) return 'vermelho';
    if (r >= 0.5) return 'amarelo';
    if (seguidas >= 3) return 'cansado';
    if ((m.missoes || 0) === 0) return 'novato';
    if (podeAposentar(m)) return 'aposentar';
    if (postoDe(m) === 'referencia' || postoDe(m) === 'senior') return 'veterano';
    return 'pronto';
}

/** Saneia os campos de carreira de um cientista (saves antigos ficam com zero missões). */
export function saneaCarreira(o) {
    const missoes = Number.isFinite(o && o.missoes) ? Math.max(0, Math.min(10000, Math.round(o.missoes))) : 0;
    const escolhas = {};
    for (const [p, b] of Object.entries((o && o.escolhas) || {})) if (POSTOS.some((x) => x.id === p) && IDS_BONUS.includes(b) && !Object.values(escolhas).includes(b)) escolhas[p] = b;
    return { missoes, escolhas };
}
export function saneaMural(lista) {
    return (Array.isArray(lista) ? lista : []).filter((r) => r && typeof r.nome === 'string').slice(-40)
        .map((r) => ({ nome: r.nome.slice(0, 24), retrato: typeof r.retrato === 'string' ? r.retrato.slice(0, 12) : 'lara', especialidade: typeof r.especialidade === 'string' ? r.especialidade.slice(0, 12) : 'campo', missoes: Math.max(0, Math.round(Number(r.missoes) || 0)), dia: Math.max(0, Math.round(Number(r.dia) || 0)) }));
}

// ---------- briefing do dia ----------
export const BRIEFING = { premio: 30, memoria: 30 };   // [H] créditos por acerto; não repete as últimas 30 perguntas
/** Dificuldade do briefing pelo dia de jogo [H] (v3.42): começa com "fato ou mito" fácil dos conceitos de base e sobe aos poucos. */
export const BRIEFING_FASES = [{ ate: 15, nivel: 1, formato: 'mf', raiz: true }, { ate: 40, nivel: 1 }, { ate: Infinity, nivel: 2 }];
export const faseBriefing = (dia) => BRIEFING_FASES.find((f) => dia < f.ate);
/** Pergunta do briefing do dia: determinística pelo dia, fácil no começo, sem repetir as recentes. `conceitos` (opcional) diz quais nós são de base. */
export function perguntaDoBriefing(perguntas, dia, vistas = [], conceitos = null) {
    const f = faseBriefing(dia), raiz = conceitos ? new Set(conceitos.filter((c) => !c.prereq.length && !c.historia).map((c) => c.id)) : null;
    const filtro = (p, rigido) => p.nivel <= f.nivel && !String(p.no).startsWith('E-') && (!rigido || ((!f.formato || p.formato === f.formato) && (!f.raiz || !raiz || raiz.has(p.no))));
    let ok = perguntas.filter((p) => filtro(p, true));
    if (!ok.length) ok = perguntas.filter((p) => filtro(p, false));
    const novas = ok.filter((p) => !vistas.includes(p.id));
    const lista = novas.length ? novas : ok;
    if (!lista.length) return null;
    let h = 2166136261; for (const ch of String(dia)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return lista[h % lista.length];
}
export const briefingPendente = (est) => !!est.iniciado && (est.briefing || {}).dia !== est.dia;
/** Registra a resposta do dia. `certo` = acertou. Devolve os créditos ganhos (0 se já respondeu hoje). */
export function responderBriefing(est, perguntaId, certo) {
    if (!briefingPendente(est)) return 0;
    const b = est.briefing || { dia: -1, acertos: 0, respostas: 0, vistas: [] };
    b.dia = est.dia; b.respostas = (b.respostas || 0) + 1;
    b.vistas = [...(b.vistas || []), perguntaId].slice(-BRIEFING.memoria);
    let ganho = 0;
    if (certo) { b.acertos = (b.acertos || 0) + 1; ganho = BRIEFING.premio; est.creditos += ganho; for (const m of est.equipe || []) ajustarMoral(m, MORAL.briefing); }   // v3.41: moral
    est.briefing = b;
    return ganho;
}
export function saneaBriefing(o) {
    const b = o && typeof o === 'object' ? o : {};
    const int = (v) => (Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0);
    return { dia: Number.isFinite(b.dia) ? Math.round(b.dia) : -1, acertos: int(b.acertos), respostas: int(b.respostas), vistas: (Array.isArray(b.vistas) ? b.vistas : []).filter((x) => typeof x === 'string').slice(-BRIEFING.memoria) };
}
