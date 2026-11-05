// ============================================
// MOTOR DOS ENCONTROS DE APRENDIZADO (funções puras, sem DOM e sem Math.random)
// Regras: docs/encontros-5c.md. Tudo determinístico a partir de uma semente.
// ============================================

/** Gerador pseudoaleatório com semente (mulberry32). */
export function rng(semente) {
    let a = (semente >>> 0) || 1;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const limitar = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const numero = (v, padrao = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : padrao);

/** Estado de aprendizagem vazio. nos[id] = {m: domínio 0–4, v: vezes visto, a: acertos, e: erros}. */
export const aprendizadoVazio = () => ({ nos: {}, perguntas: {}, fichas: {} });

/** Normaliza qualquer coisa vinda do armazenamento (descarta ids que não existem no banco). */
export function normalizarAprendizado(dados, conceitos, perguntas) {
    const out = aprendizadoVazio();
    const d = dados && typeof dados === 'object' ? dados : {};
    const idsNo = new Set(conceitos.map((c) => c.id));
    const idsQ = new Set(perguntas.map((p) => p.id));
    if (d.nos && typeof d.nos === 'object') {
        for (const [k, x] of Object.entries(d.nos)) {
            if (!idsNo.has(k) || !x || typeof x !== 'object') continue;
            out.nos[k] = {
                m: limitar(numero(x.m), 0, 4), v: Math.max(0, Math.round(numero(x.v))),
                a: Math.max(0, Math.round(numero(x.a))), e: Math.max(0, Math.round(numero(x.e))),
            };
        }
    }
    if (d.perguntas && typeof d.perguntas === 'object') {
        for (const [k, n] of Object.entries(d.perguntas)) if (idsQ.has(k)) out.perguntas[k] = Math.max(0, Math.round(numero(n)));
    }
    if (d.fichas && typeof d.fichas === 'object') {
        for (const k of Object.keys(d.fichas)) if (idsNo.has(k) && d.fichas[k] === true) out.fichas[k] = true;
    }
    return out;
}

/** Verifica o banco; devolve lista de problemas (vazia = ok). */
export function validarBanco(conceitos, perguntas, statusValidos = ['V', 'V+C', 'V+R']) {
    const erros = [];
    const ids = new Set();
    for (const c of conceitos) {
        if (ids.has(c.id)) erros.push(`nó duplicado ${c.id}`);
        ids.add(c.id);
    }
    for (const c of conceitos) for (const p of c.prereq) if (!ids.has(p)) erros.push(`${c.id}: pré-requisito inexistente ${p}`);
    // ciclos (busca em profundidade)
    const cor = {};
    const mapa = Object.fromEntries(conceitos.map((c) => [c.id, c]));
    const visita = (id, pilha) => {
        if (cor[id] === 2) return;
        if (cor[id] === 1) { erros.push(`ciclo: ${[...pilha, id].join(' > ')}`); return; }
        cor[id] = 1;
        for (const p of (mapa[id]?.prereq || [])) if (mapa[p]) visita(p, [...pilha, id]);
        cor[id] = 2;
    };
    conceitos.forEach((c) => visita(c.id, []));
    const qIds = new Set();
    for (const p of perguntas) {
        if (qIds.has(p.id)) erros.push(`pergunta duplicada ${p.id}`);
        qIds.add(p.id);
        if (!ids.has(p.no)) erros.push(`${p.id}: nó inexistente ${p.no}`);
        if (![1, 2, 3].includes(p.nivel)) erros.push(`${p.id}: nível inválido`);
        if (!statusValidos.includes(p.status)) erros.push(`${p.id}: status inválido`);
        if (p.formato === 'mf') {
            if (p.correta !== 'mito' && p.correta !== 'fato') erros.push(`${p.id}: resposta mito/fato inválida`);
        } else if (p.formato === 'mc') {
            for (const l of ['pt', 'en']) {
                const n = p[l].opcoes?.length;
                if (n !== 3) erros.push(`${p.id}: ${l} deve ter 3 alternativas`);
                if (!Number.isInteger(p.correta) || p.correta < 0 || p.correta >= (n || 0)) erros.push(`${p.id}: índice correto fora da faixa`);
            }
        } else erros.push(`${p.id}: formato inválido`);
    }
    for (const c of conceitos) {
        if (!perguntas.some((p) => p.no === c.id && p.nivel === 1)) erros.push(`${c.id}: sem pergunta de nível 1`);
    }
    return erros;
}

const dom = (aprend, id) => aprend.nos[id] || { m: 0, v: 0, a: 0, e: 0 };
const nivelAlvo = (m) => (m < 2 ? 1 : m < 3 ? 2 : 3);
const vezes = (aprend, q) => aprend.perguntas[q.id] || 0;

/**
 * Escolhe o nó e a pergunta de um encontro.
 * ctx = {missao, gatilho: 'fixo'|'geiger', semente, usadas: [ids de perguntas já feitas na missão], nosUsados: [nós já usados na missão]}
 */
export function escolher(conceitos, perguntas, aprend, ctx) {
    const rand = rng(ctx.semente);
    const usadasM = new Set(ctx.usadas || []);
    const nosM = new Set(ctx.nosUsados || []);
    const vistos = (id) => dom(aprend, id).v > 0;
    const cand = [];
    for (const c of conceitos) {
        if (c.historia && !c.missoes.includes(ctx.missao)) continue; // história só na própria missão
        const livres = perguntas.filter((p) => p.no === c.id && !usadasM.has(p.id));
        if (!livres.length) continue;
        // nível 1 exige os pré-requisitos já vistos (nós de história são isentos); nível 2+ já implica nó visto
        if (!c.historia && nivelAlvo(dom(aprend, c.id).m) === 1 && !c.prereq.every(vistos)) continue;
        const d = dom(aprend, c.id);
        let pts = (4 - d.m) * 2;
        if (c.missoes.includes(ctx.missao)) pts += 3;
        if (c.gatilhos.includes(ctx.gatilho)) pts += 3;
        if (c.historia) pts += 5;
        if (nosM.has(c.id)) pts -= 6; // evita repetir o mesmo nó na missão
        cand.push({ c, pts, v: d.v, r: rand() });
    }
    if (!cand.length) return null;
    cand.sort((a, b) => b.pts - a.pts || a.v - b.v || a.r - b.r);
    const no = cand[0].c;
    return { no, pergunta: perguntaDoNo(perguntas, aprend, no.id, nivelAlvo(dom(aprend, no.id).m), usadasM, rand) };
}

/** Pergunta do nó mais próxima do nível pedido, menos vista primeiro, desempate por semente. */
export function perguntaDoNo(perguntas, aprend, noId, nivel, excluir, rand) {
    const base = perguntas.filter((p) => p.no === noId && !excluir.has(p.id));
    if (!base.length) return null;
    const lista = base.map((p) => ({ p, d: Math.abs(p.nivel - nivel), v: vezes(aprend, p), r: rand() }));
    lista.sort((a, b) => a.v - b.v || a.d - b.d || a.r - b.r);
    return lista[0].p;
}

/** Cadeia de reforço: a próxima pergunta é mais simples que a atual (mesmo nó, nível menor; senão pré-requisito fraco). */
function maisSimples(enc, conceitos, perguntas, aprend) {
    const atual = enc.cadeia[enc.passo];
    const usadas = new Set(enc.cadeia.map((p) => p.id));
    const rand = rng(enc.semente + 101 * (enc.passo + 1));
    if (atual.nivel > 1) {
        const mesmo = perguntas.filter((p) => p.no === atual.no && p.nivel < atual.nivel && !usadas.has(p.id));
        if (mesmo.length) {
            const alvo = Math.max(...mesmo.map((p) => p.nivel));
            const l = mesmo.filter((p) => p.nivel === alvo).map((p) => ({ p, v: vezes(aprend, p), r: rand() }));
            l.sort((a, b) => a.v - b.v || a.r - b.r);
            return l[0].p;
        }
    }
    const no = conceitos.find((c) => c.id === atual.no);
    const pre = (no ? no.prereq : []).map((id) => conceitos.find((c) => c.id === id)).filter(Boolean)
        .sort((a, b) => dom(aprend, a.id).m - dom(aprend, b.id).m);
    for (const p of pre) {
        const q = perguntaDoNo(perguntas.filter((x) => x.nivel === 1), aprend, p.id, 1, usadas, rand);
        if (q) return q;
    }
    return perguntaDoNo(perguntas.filter((x) => x.nivel === 1), aprend, atual.no, 1, usadas, rand);
}

export const CREDITOS = [1, 0.4, 0.15]; // acerto na 1ª, 2ª ou 3ª pergunta da cadeia (decidido com Arnaldo em 14/10/2026; a calibrar)
export const LIMITE_CADEIA = 3;

/** Inicia um encontro; devolve null se não houver pergunta. */
export function iniciar(conceitos, perguntas, aprend, ctx) {
    const esc = escolher(conceitos, perguntas, aprend, ctx);
    if (!esc || !esc.pergunta) return null;
    return { semente: ctx.semente, missao: ctx.missao, gatilho: ctx.gatilho, no: esc.no.id, cadeia: [esc.pergunta], passo: 0, resultados: [], fim: null };
}

/** Fator de crédito de um acerto "quase certo" (Mito x Fato) e das chances seguintes após erro com certeza total. Decididos com Arnaldo em 14/10/2026; a calibrar. */
export const FATOR_QUASE = 0.7;
export const FATOR_SUPERCONFIANCA = 0.5;

/**
 * Interpreta a resposta. Mito x Fato aceita 'mito'|'fato' (certeza), 'mito?'|'fato?' (quase certeza) e 'naosei'.
 * Alternativas (mc) aceitam só o índice. Devolve {valor, confianca: 'certa'|'quase'|'naosei'|null}.
 */
export function interpretar(p, resp) {
    if (p.formato !== 'mf') return { valor: resp, confianca: null };
    if (resp === 'naosei') return { valor: null, confianca: 'naosei' };
    if (typeof resp === 'string' && resp.endsWith('?')) return { valor: resp.slice(0, -1), confianca: 'quase' };
    return { valor: resp, confianca: 'certa' };
}

/**
 * Responde à pergunta atual. `resp` = 'mito'|'fato' (mf), índice na ordem escrita (mc) ou null (pular).
 * Devolve {acertou, pulou, proxima|null, fim|null}; `fim` = {credito 0–1, ensino:[perguntas a mostrar, do mais simples ao original], ficha: nó}.
 */
export function responder(enc, conceitos, perguntas, aprend, resp) {
    const atual = enc.cadeia[enc.passo];
    if (enc.fim) throw new Error('encontro já terminou');
    if (resp === null || resp === undefined) {
        enc.resultados.push({ id: atual.id, ok: false, pulou: true });
        enc.fim = { credito: 0, pulou: true, ensino: [], ficha: null };
        return { acertou: false, pulou: true, proxima: null, fim: enc.fim };
    }
    const { valor, confianca } = interpretar(atual, resp);
    const ok = confianca !== 'naosei' && valor === atual.correta;
    enc.resultados.push({ id: atual.id, ok, pulou: false, confianca });
    // erro com certeza total (Mito x Fato) reduz o crédito das chances seguintes; "não sei" não tem penalidade
    if (!ok && confianca === 'certa') enc.fator = FATOR_SUPERCONFIANCA;
    const anteriores = enc.cadeia.slice(0, enc.passo).reverse(); // do mais simples ao original
    if (ok) {
        const credito = CREDITOS[enc.passo] * (enc.fator ?? 1) * (confianca === 'quase' ? FATOR_QUASE : 1);
        enc.fim = { credito, pulou: false, ensino: anteriores, ficha: enc.passo > 0 ? enc.no : null };
        return { acertou: true, pulou: false, proxima: null, fim: enc.fim };
    }
    if (enc.passo + 1 < LIMITE_CADEIA) {
        const prox = maisSimples(enc, conceitos, perguntas, aprend);
        if (prox) {
            enc.cadeia.push(prox);
            enc.passo += 1;
            return { acertou: false, pulou: false, proxima: prox, fim: null };
        }
    }
    enc.fim = { credito: 0, pulou: false, ensino: [atual, ...anteriores], ficha: enc.no };
    return { acertou: false, pulou: false, proxima: null, fim: enc.fim };
}

/** Atualiza o domínio dos nós e as contagens (devolve novo objeto; não altera o original). */
export function aplicarResultado(aprend, enc) {
    const novo = JSON.parse(JSON.stringify(aprend));
    enc.cadeia.slice(0, enc.resultados.length).forEach((p, i) => {
        const r = enc.resultados[i];
        const n = novo.nos[p.no] || (novo.nos[p.no] = { m: 0, v: 0, a: 0, e: 0 });
        n.v += 1;
        novo.perguntas[p.id] = (novo.perguntas[p.id] || 0) + 1;
        if (r.ok) { n.a += 1; n.m = limitar(n.m + (i === 0 ? 1 : 0.5), 0, 4); } else if (!r.pulou) n.e += 1;
    });
    if (enc.fim && enc.fim.ficha) novo.fichas[enc.fim.ficha] = true;
    return novo;
}
