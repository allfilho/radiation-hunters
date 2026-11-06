// ============================================
// AGÊNCIA: banco de pesquisa (árvore), inventário de materiais coletados, engenheiros e fila de produção da Oficina. Lógica PURA.
//
// Fase B (v3.28). Valores de custo e dias são [H] (hipóteses de jogo), a calibrar em sala. A pesquisa do detector aéreo continua em
// `est.pesquisa` (frota.js) para não quebrar saves antigos; aqui ficam os nós novos, em `est.ciencia`.
// Nada neste arquivo afirma propriedade física de instrumento: os nós só liberam um equipamento no inventário; o efeito em missão é da Fase C.
// ============================================
import { ISOTOPES } from '../data/isotopes.js';

export const NOS = {
    espectrometriaGama: {
        id: 'espectrometriaGama', custo: 2000, dias: 12, requer: [],
        descoberta: [{ iso: ['Cs-137'] }, { iso: ['Co-60'] }],   // [H] precisa ter coletado os dois: ambos são gama e só se distinguem com detector melhor
        equipamento: 'espectrometro',
    },
    sondaAlfa: {
        id: 'sondaAlfa', custo: 1200, dias: 8, requer: [],
        descoberta: [{ tipo: 'alfa' }],                             // [H] qualquer fonte alfa coletada
        equipamento: 'sondaAlfa',
    },
    camaraIonizacao: {
        id: 'camaraIonizacao', custo: 1600, dias: 10, requer: [],
        descoberta: [{ iso: ['Co-60', 'Ir-192'] }],                 // [H] fonte gama de taxa alta
        equipamento: 'camaraIonizacao',
    },
    detectorNeutrons: { id: 'detectorNeutrons', custo: 0, dias: 0, requer: [], descoberta: [], bloqueado: true, equipamento: null },   // o jogo ainda não tem fonte de nêutrons
};
export const IDS_NOS = Object.keys(NOS);

export const EQUIPAMENTOS = {
    espectrometro: { id: 'espectrometro', no: 'espectrometriaGama', custo: 900, dias: 6 },
    sondaAlfa: { id: 'sondaAlfa', no: 'sondaAlfa', custo: 600, dias: 4 },
    camaraIonizacao: { id: 'camaraIonizacao', no: 'camaraIonizacao', custo: 800, dias: 5 },
};
export const IDS_EQUIPAMENTOS = Object.keys(EQUIPAMENTOS);

export const CIENCIA = { contratarEngenheiro: 500, filaMax: 6, colhidasMax: 999, engenheirosMax: 6 };

const falha = (motivo) => ({ ok: false, motivo });
const NOME_ISO = /^[A-Z][a-z]?-\d{1,3}m?$/;

// ---------- inventário de materiais coletados ----------
/** Tipo de radiação de um isótopo pelo nome; Ra-226 entra nas missões como fonte especial (alfa). */
export function tipoDoIsotopo(nome) {
    const i = ISOTOPES.find((x) => x.name === nome);
    if (i) return i.type;
    return nome === 'Ra-226' ? 'alfa' : null;
}
/** Soma os isótopos entregues ao inventário. Aceita qualquer lista; ignora o que não for nome de isótopo. */
export function registrarColhidas(est, isotopos) {
    let n = 0;
    for (const nome of Array.isArray(isotopos) ? isotopos : []) {
        if (typeof nome !== 'string' || !NOME_ISO.test(nome)) continue;
        est.colhidas[nome] = Math.min(CIENCIA.colhidasMax, (est.colhidas[nome] || 0) + 1); n++;
    }
    return n;
}
/** Saneia uma lista de isótopos vinda do armazenamento ou da missão (máximo 20). */
export const saneaIsotopos = (l) => (Array.isArray(l) ? l : []).filter((x) => typeof x === 'string' && NOME_ISO.test(x)).slice(0, 20);

// ---------- pesquisa ----------
const reqOk = (est, r) => (r.iso ? r.iso.some((n) => (est.colhidas[n] || 0) > 0) : Object.keys(est.colhidas).some((n) => est.colhidas[n] > 0 && tipoDoIsotopo(n) === r.tipo));
export const descobertaOk = (est, no) => no.descoberta.every((r) => reqOk(est, r));
export const cienciaConcluida = (est, id) => !!est.ciencia.concluidas[id];
export const cienciaEmAndamento = (est) => Object.keys(est.ciencia.andamento)[0] || null;

/** 'bloqueada' | 'oculta' (ainda não descoberta) | 'disponivel' | 'andamento' | 'concluida'. */
export function estadoNo(est, id) {
    const no = NOS[id]; if (!no) return 'oculta';
    if (cienciaConcluida(est, id)) return 'concluida';
    if (est.ciencia.andamento[id]) return 'andamento';
    if (no.bloqueado) return 'bloqueada';
    if (!no.requer.every((r) => cienciaConcluida(est, r))) return 'oculta';
    return descobertaOk(est, no) ? 'disponivel' : 'oculta';
}

/** Começa uma pesquisa. Exige Laboratório pronto (`temLab`), nó disponível, nenhuma outra em andamento e créditos. */
export function iniciarCiencia(est, id, temLab) {
    if (!temLab) return falha('laboratorio');
    const no = NOS[id]; if (!no) return falha('no');
    const s = estadoNo(est, id);
    if (s === 'concluida' || s === 'andamento') return falha('ja');
    if (s !== 'disponivel') return falha(s === 'bloqueada' ? 'bloqueada' : 'descoberta');
    if (cienciaEmAndamento(est)) return falha('ocupado');
    if (est.creditos < no.custo) return falha('creditos');
    est.creditos -= no.custo;
    est.ciencia.andamento[id] = { pronto: est.dia + no.dias };
    return { ok: true, pronto: est.dia + no.dias };
}

// ---------- engenheiros ----------
/** Contrata um engenheiro (lista própria `est.engenheiros`; ocupa cama como os cientistas). `camasLivres` vem de frota.js. */
export function contratarEngenheiro(est, candidato, camasLivres) {
    if (est.engenheiros.length >= CIENCIA.engenheirosMax) return falha('maxEng');
    if (camasLivres < 1) return falha('camas');
    if (est.creditos < CIENCIA.contratarEngenheiro) return falha('creditos');
    est.creditos -= CIENCIA.contratarEngenheiro;
    est.engenheiros.push({ id: 'e' + (++est.proxId), nome: candidato.nome, retrato: candidato.retrato });
    return { ok: true };
}

// ---------- Oficina: fila de produção ----------
/** Põe um equipamento na fila (paga na hora). Exige pesquisa concluída, Oficina pronta (`temOficina`) e ao menos um engenheiro. */
export function enfileirar(est, equip, temOficina) {
    const q = EQUIPAMENTOS[equip]; if (!q) return falha('equipamento');
    if (!temOficina) return falha('oficina');
    if (!cienciaConcluida(est, q.no)) return falha('pesquisaEquip');
    if (!est.engenheiros.length) return falha('engenheiro');
    if (est.fila.length >= CIENCIA.filaMax) return falha('fila');
    if (est.creditos < q.custo) return falha('creditos');
    est.creditos -= q.custo;
    est.fila.push({ id: 'f' + (++est.proxId), equip, eng: null, pronto: null });
    return { ok: true };
}
/** Engenheiros sem item em produção. */
export const engenheirosLivres = (est) => est.engenheiros.filter((g) => !est.fila.some((f) => f.eng === g.id));

/** Um dia de trabalho: conclui pesquisas e peças prontas hoje e distribui itens da fila aos engenheiros livres. Devolve eventos. */
export function avancarCiencia(est, temOficina = true) {
    const ev = [];
    for (const [id, a] of Object.entries(est.ciencia.andamento)) {
        if (a.pronto <= est.dia) { delete est.ciencia.andamento[id]; est.ciencia.concluidas[id] = est.dia; ev.push({ tipo: 'ciencia', dia: est.dia, id }); }
    }
    for (const f of [...est.fila]) {
        if (f.pronto != null && f.pronto <= est.dia) {
            est.fila = est.fila.filter((x) => x !== f);
            est.equipamentos[f.equip] = Math.min(99, (est.equipamentos[f.equip] || 0) + 1);
            ev.push({ tipo: 'fabricado', dia: est.dia, id: f.equip });
        }
    }
    if (temOficina) {
        const livres = engenheirosLivres(est);
        for (const f of est.fila) {
            if (f.eng || !livres.length) continue;
            f.eng = livres.shift().id; f.pronto = est.dia + EQUIPAMENTOS[f.equip].dias;
        }
    }
    return ev;
}

// ---------- inventário individual (v3.33) ----------
// `est.equipamentos` guarda o total fabricado. Cada cientista pode levar 1 item (`m.equip`); o que ninguém leva fica no estoque da Base.
export const equipDe = (m) => (m && IDS_EQUIPAMENTOS.includes(m.equip) ? m.equip : null);
export const comQuem = (est, id) => est.equipe.filter((m) => equipDe(m) === id).length;
export const estoqueLivre = (est, id) => Math.max(0, (est.equipamentos[id] || 0) - comQuem(est, id));
/** Entrega um item do estoque a um cientista (`id` vazio devolve o que ele leva). Trocar devolve o anterior ao estoque. */
export function equipar(est, membroId, id) {
    const m = est.equipe.find((x) => x.id === membroId); if (!m) return falha('membro');
    if (!id) { m.equip = null; return { ok: true }; }
    if (!EQUIPAMENTOS[id]) return falha('equipamento');
    if (equipDe(m) === id) return { ok: true };
    if (estoqueLivre(est, id) < 1) return falha('semEstoque');
    m.equip = id; return { ok: true };
}
/** Corrige entregas inconsistentes (item que não existe mais ou mais entregas que o total): tira dos últimos da equipe. */
export function saneaEntregas(est) {
    for (const m of est.equipe) if (m.equip != null && !IDS_EQUIPAMENTOS.includes(m.equip)) m.equip = null;
    for (const id of IDS_EQUIPAMENTOS) {
        const donos = est.equipe.filter((m) => equipDe(m) === id), sobra = donos.length - (est.equipamentos[id] || 0);
        for (let i = 0; i < sobra; i++) donos[donos.length - 1 - i].equip = null;
    }
}

// ---------- saneamento do save ----------
export function saneaCiencia(o, dia = 0) {
    const int = (v, lo, hi, p) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : p; };
    const r = { colhidas: {}, ciencia: { concluidas: {}, andamento: {} }, engenheiros: [], fila: [], equipamentos: {} };
    const src = o && typeof o === 'object' ? o : {};
    if (src.colhidas && typeof src.colhidas === 'object') for (const [k, v] of Object.entries(src.colhidas)) if (NOME_ISO.test(k) && Object.keys(r.colhidas).length < 40) r.colhidas[k] = int(v, 1, CIENCIA.colhidasMax, 1);
    const c = src.ciencia && typeof src.ciencia === 'object' ? src.ciencia : {};
    for (const id of IDS_NOS) {
        if (c.concluidas && c.concluidas[id] != null && !NOS[id].bloqueado) r.ciencia.concluidas[id] = int(c.concluidas[id], 0, 1000000, 0);
        else if (c.andamento && c.andamento[id] && !NOS[id].bloqueado && !Object.keys(r.ciencia.andamento).length) r.ciencia.andamento[id] = { pronto: int(c.andamento[id].pronto, 0, 1000000, dia) };
    }
    const vistos = new Set();
    for (const g of Array.isArray(src.engenheiros) ? src.engenheiros : []) {
        if (!g || typeof g.id !== 'string' || typeof g.nome !== 'string' || vistos.has(g.id) || r.engenheiros.length >= CIENCIA.engenheirosMax) continue;
        vistos.add(g.id); r.engenheiros.push({ id: g.id.slice(0, 12), nome: g.nome.slice(0, 24), retrato: typeof g.retrato === 'string' ? g.retrato.slice(0, 12) : 'lara' });
    }
    for (const f of Array.isArray(src.fila) ? src.fila : []) {
        if (!f || !EQUIPAMENTOS[f.equip] || r.fila.length >= CIENCIA.filaMax || typeof f.id !== 'string') continue;
        const eng = r.engenheiros.some((g) => g.id === f.eng) && !r.fila.some((x) => x.eng === f.eng) ? f.eng : null;
        r.fila.push({ id: f.id.slice(0, 12), equip: f.equip, eng, pronto: eng ? int(f.pronto, 0, 1000000, dia) : null });
    }
    if (src.equipamentos && typeof src.equipamentos === 'object') for (const id of IDS_EQUIPAMENTOS) if (src.equipamentos[id] > 0) r.equipamentos[id] = int(src.equipamentos[id], 1, 99, 1);
    return r;
}
