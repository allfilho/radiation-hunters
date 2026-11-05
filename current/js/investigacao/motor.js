// ============================================
// MOTOR DAS INVESTIGAÇÕES (funções puras, sem DOM)
// Uma investigação é uma lista de cenas. Tipos de cena:
//   registro  hipótese inicial livre de punição (inclui "não sei"); fica guardada para a revisão final
//   escolha   uma resposta certa entre várias; cada alternativa errada tem o seu retorno; pode ter uma
//             segunda etapa `evidencia` (qual observação sustenta a resposta)
//   cartoes   marcar todas as frases corretas e deixar de fora as generalizações (retorno por cartão)
//   ficha     fecha com o resumo: hipótese inicial, evidência, decisão, revisão e limite
// Nada aqui pontua: a investigação registra o raciocínio, não dá nota.
// ============================================

import { VERSAO } from '../modo.js';
import { observarAtividade } from './modelos.js';

export function criarSessao(investigacao) {
    return { id: investigacao.id, i: 0, registro: {}, tentativas: {}, notas: {}, concluidas: {}, historico: [], observacoesCampo: [], transferencia: null, estadosModelos: {} };
}

const conta = (s, cenaId) => { s.tentativas[cenaId] = (s.tentativas[cenaId] || 0) + 1; return s.tentativas[cenaId]; };

/** Avalia uma alternativa de `escolha` ou de `evidencia`. Devolve { ok, retorno }. Conta a tentativa. */
export function avaliarOpcao(sessao, cena, etapa, opcaoId) {
    const lista = etapa === 'evidencia' ? cena.evidencia.opcoes : cena.opcoes;
    const op = lista.find((o) => o.id === opcaoId);
    if (!op) return { ok: false, retorno: '' };
    const chave = etapa === 'evidencia' ? cena.id + ':evidencia' : cena.id;
    conta(sessao, chave);
    sessao.historico.push({ cena: cena.id, etapa, opcao: op.id, texto: op.txt, correta: op.ok === true, retorno: op.retorno || '' });
    if (op.ok) {
        sessao.registro[chave] = { opcao: op.id, texto: op.txt, tentativas: sessao.tentativas[chave] };
        return { ok: true, retorno: op.retorno || '' };
    }
    return { ok: false, retorno: op.retorno || '' };
}

/** Registro livre de punição: guarda a hipótese e se ela é compatível com a evidência. */
export function registrarHipotese(sessao, cena, opcaoId) {
    const op = cena.opcoes.find((o) => o.id === opcaoId);
    if (!op) return null;
    if (sessao.concluidas[cena.id]) return sessao.registro[cena.id];
    sessao.registro[cena.id] = { opcao: op.id, texto: op.txt, compativel: op.compativel === true, naoSei: op.naoSei === true };
    return sessao.registro[cena.id];
}

/**
 * Avalia a marcação de `cartoes`. Certo = marcou todos os corretos e nenhum errado.
 * porCartao: para cada cartão marcado, { certo, retorno }; cartão correto esquecido vira { certo: false, faltou: true }.
 */
export function avaliarCartoes(sessao, cena, marcados) {
    const sel = new Set(marcados);
    const porCartao = {};
    let ok = true;
    for (const c of cena.cartoes) {
        const marcou = sel.has(c.id);
        if (c.ok && marcou) porCartao[c.id] = { certo: true, retorno: c.retorno || '' };
        else if (!c.ok && marcou) { porCartao[c.id] = { certo: false, retorno: c.retorno || '' }; ok = false; }
        else if (c.ok && !marcou) { porCartao[c.id] = { certo: false, faltou: true, retorno: '' }; ok = false; }
    }
    conta(sessao, cena.id);
    if(cena.registrarMural)sessao.mural={cartoes:cena.cartoes.filter(c=>sel.has(c.id)).map(c=>({id:c.id,texto:c.txt})),revisado:ok};
    sessao.historico.push({ cena: cena.id, etapa: 'cartoes', cartoes: cena.cartoes.filter((c) => sel.has(c.id)).map((c) => ({ id: c.id, texto: c.txt })), correta: ok, retorno: porCartao });
    if (ok) sessao.registro[cena.id] = { cartoes: cena.cartoes.filter((c) => c.ok).map((c) => ({ id: c.id, texto: c.txt })), tentativas: sessao.tentativas[cena.id] };
    return { ok, porCartao };
}

/** Registra apenas estados declarados pelo episódio; valores e texto vêm do modelo comum. */
export function registrarObservacao(sessao,cena,observacao){
    if(!cena.atividade || !cena.atividade.estados.includes(observacao.estado))return false;
    const canonica=observarAtividade(cena.atividade.tipo,observacao.estado,cena.atividade.dados);
    if(sessao.observacoesCampo.some(o=>o.cena===cena.id&&o.estado===canonica.estado))return false;
    const registro={cena:cena.id,...canonica};
    sessao.observacoesCampo.push(registro);sessao.historico.push({...registro,etapa:'observacao'});return true;
}
export function observacoesCompletas(sessao,cena){
    if(cena.atividade)return cena.atividade.estados.every(estado=>sessao.observacoesCampo.some(o=>o.cena===cena.id&&o.modelo===cena.atividade.tipo&&o.estado===estado));
    return [true,false].every(emissao=>sessao.observacoesCampo.some(o=>o.cena===cena.id&&o.emissao===emissao));
}

/** Ficha final (objeto simples, serializável). `lang` escolhe o texto. */
export function montarFicha(sessao, investigacao, lang) {
    const L = investigacao[lang] || investigacao.en;
    const h = sessao.registro[investigacao.cenaHipotese];
    const evidencias = [];
    for (const c of investigacao.cenas) {
        const r = sessao.registro[c.id + ':evidencia'];
        if (r) evidencias.push({ cena: c.id, texto: r.texto });
        const cart = sessao.registro[c.id];
        if (cart && cart.cartoes) for (const k of cart.cartoes) evidencias.push({ cena: c.id, texto: k.texto });
    }
    const dec = sessao.registro[investigacao.cenaDecisao];
    const lim = sessao.registro[investigacao.cenaLimite];
    const requeridas=investigacao.cenas.filter(c=>c.atividade||(investigacao.observacoesObrigatorias||[]).includes(c.id));
    const observou = requeridas.every(c=>observacoesCompletas(sessao,c));
    // Sem respostas dissertativas: só escolhas e registros guiados. (`transferenciaObrigatoria` nos dados fica sem efeito.)
    const completa = Boolean(observou && h && dec && lim && investigacao.cenas.every((c) => sessao.registro[c.id] && (!c.evidencia || sessao.registro[c.id + ':evidencia'])));
    let revisao = 'sem-hipotese';
    if (h && !completa) revisao = 'em-andamento';
    else if (h) revisao = h.naoSei ? 'partiu-do-nao-sei' : (h.compativel ? 'confirmada' : 'revisada');
    const erros = Object.entries(sessao.tentativas).filter(([k, n]) => n > 1).map(([k, n]) => ({ cena: k, tentativas: n }));
    return {
        esquema: 2, versaoJogo: VERSAO,
        investigacao: investigacao.id, versao: investigacao.versao, idioma: lang, titulo: L.titulo,
        concluida: completa,
        ...(investigacao.sorteio?{sorteio:{...investigacao.sorteio}}:{}),
        historico: sessao.historico.map((r) => ({ ...r })),
        fontes: resolver(investigacao.fontesPublicas, lang),
        hipoteseInicial: h ? h.texto : null,
        evidencias,
        observacoesCampo: (sessao.observacoesCampo || []).map(o => ({...o})),
        transferencia: sessao.transferencia ? {...sessao.transferencia} : null,
        mural: sessao.mural ? resolver(sessao.mural,lang) : null,
        decisao: dec ? dec.texto : null,
        revisao,
        limite: lim ? lim.texto : null,
        cenasComMaisDeUmaTentativa: erros,
        observacoes: Object.fromEntries(Object.entries(sessao.notas).filter(([, v]) => typeof v === 'string' && v.trim())),
    };
}

/** Troca cada folha { pt, en } pelo texto do idioma (en como reserva). Não altera o original. */
export function resolver(obj, lang) {
    if (Array.isArray(obj)) return obj.map((x) => resolver(x, lang));
    if (obj && typeof obj === 'object') {
        const k = Object.keys(obj);
        if (k.length === 2 && k.includes('pt') && k.includes('en') && typeof obj.pt === 'string' && typeof obj.en === 'string') return obj[lang] ?? obj.en;
        return Object.fromEntries(k.map((x) => [x, resolver(obj[x], lang)]));
    }
    return obj;
}

/** Ordem aleatória (Fisher-Yates) sem alterar a lista original; `rng` injetável para teste. */
export function embaralhar(lista, rng = Math.random) {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

/** Tira os rótulos de fonte ([V ...], [N], [H]) do texto mostrado ao jogador; ficam só no modo de revisão. */
export function semRotulos(texto) {
    return String(texto).replace(/\s*\[(?:V|N|H)(?:\s[^\]]*)?\]/g, '').replace(/\s+([.,;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

/** Aplica semRotulos a todas as folhas de texto de uma investigação já resolvida (uma língua). */
export function limparRotulos(obj) {
    if (Array.isArray(obj)) return obj.map(limparRotulos);
    if (obj && typeof obj === 'object') return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, k === 'id' ? v : limparRotulos(v)]));
    return typeof obj === 'string' ? semRotulos(obj) : obj;
}
