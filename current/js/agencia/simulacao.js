// ============================================
// AGÊNCIA: o "microcontrole" do jogo (relógio, surgimento e vencimento de alertas, nota e verba mensais).
// Lógica PURA: sem DOM e sem Phaser; recebe o gerador de números aleatórios (testável com semente).
//
// Inspiração (ideias gerais, sem copiar números nem dados), conferida na UFOpaedia em 28/10/2026:
//  [V] o tempo da Geoscape corre em velocidades e PARA quando surge um contato novo (UFOpaedia, Geoscape EU);
//  [V] as missões vêm de um calendário mensal e de um sorteio por região SEM REPETIR até esvaziar a lista (OpenXcom, Alien Missions);
//  [V] o conselho avalia a nota todo mês: feliz +5 % a +20 %, satisfeito sem mudança, infeliz −5 % a −20 %;
//      a mudança aparece no início do mês e só entra no pagamento seguinte (UFOpaedia, Country Funding).
// Todos os VALORES abaixo são escolhas de jogo [H], para calibrar com testes de sala de aula.
// Não existe game over: a verba tem piso.
// ============================================
import { ALERTAS } from './dados.js';
import { ehRapida, alertaPorId, novaSemente } from './rapidas.js';
import { equipeInicial, saneaEquipe, verificarRetorno, inteiro as inteiroE, distribuirDoseMissao, NORMAS } from './equipe.js';
import { modulosIniciais, naveInicial, GRADE_INICIAL, GRADE_MAX, MODULOS_VALIDOS, TIPOS_NAVE, CUSTOS, renovarCandidatos, PRAZO_COLETA, limiteRetorno } from './frota.js';

export const PARAMETROS = {
    diasPorMes: 30,
    maxAtivos: 3,
    intervaloMin: 10, intervaloMax: 16,      // dias entre um alerta e o próximo (v3.16: era 3 a 6; o relógio parava a cada 1 a 4 dias)
    primeiroAlertaEm: 5,                   // dias depois de começar
    prazoDias: { easy: 14, normal: 14, hard: 12, insane: 10, investigacao: 21 },
    verbaBase: 1500,                       // créditos de pesquisa por mês a 100 %
    fatorInicial: 100, fatorMin: 50, fatorMax: 150,
    passoMin: 5, passoMax: 20,             // variação mensal da verba (em pontos percentuais)
    notaFeliz: 5, notaInfeliz: 0,          // nota do mês: ≥ 5 feliz; ≤ 0 infeliz
    pontosExpirou: -2,                     // nota por alerta que venceu
    pontosInvestigacao: 2,                 // "estrelas" equivalentes de uma investigação concluída
    creditosPorPonto: 50,   // legado (sem uso desde a v3.6.3)
    premioMissao: { rapida: 180, easy: 400, normal: 600, hard: 900, insane: 1400, investigacao: 600 },   // [H] pago ao concluir, com 2 estrelas (v3.24: dobrado a pedido do Arnaldo; marcos recalibrados com tests/ferramentas/calibrar-economia.mjs: laboratório dia ~14, 2º hangar ~60, Base completa ~251)
    fatorEstrelas: { 1: 0.7, 2: 1, 3: 1.3 },
    historicoMax: 12,
    // v3.10: chamados de cidadãos (missões rápidas), valores [H] a calibrar em sala
    rapidas: { max: 2, primeira: 2, intervaloMin: 4, intervaloMax: 7, prazo: 10, pontosExpirou: -1, nota: 1, facilAte: 3, medioAte: 6 },   // v3.17.2: o primeiro vem no dia 4 e depois a cada 4–7 dias (o relógio não para mais por eles); as 3 primeiras só com 1 fonte, até a 6ª no máximo 2 fontes (usa `rapidasFeitas`)
};

const ID_VALIDOS = new Set(ALERTAS.map((a) => a.id));
const idValido = (id) => ID_VALIDOS.has(id) || ehRapida(id);

export function novoEstado() {
    return {
        v: 2, iniciado: false, dia: 0, fator: PARAMETROS.fatorInicial, creditos: 0, nota: 0, proximoAlerta: null, proximaRapida: null, rapidasFeitas: 0, ativos: [], usados: [], concluidos: {}, expirados: 0, historico: [],
        equipe: equipeInicial(), candidatos: [], naves: naveInicial(), modulos: modulosIniciais(), grade: { ...GRADE_INICIAL },
        pesquisa: {}, coleta: [], levantados: [], proxId: 10,
    };
}

const inteiro = (v, lo, hi, padrao) => { const n = typeof v === 'number' ? v : Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : padrao; };

/** Aceita qualquer coisa vinda do armazenamento e devolve um estado válido. */
export function sanear(d) {
    const e = novoEstado(), o = d && typeof d === 'object' ? d : {};
    e.iniciado = o.iniciado === true;
    e.dia = inteiro(o.dia, 0, 100000, 0);
    e.fator = inteiro(o.fator, PARAMETROS.fatorMin, PARAMETROS.fatorMax, PARAMETROS.fatorInicial);
    e.creditos = inteiro(o.creditos, 0, 10000000, 0);
    e.nota = inteiro(o.nota, -1000, 1000, 0);
    e.proximoAlerta = o.proximoAlerta == null ? null : inteiro(o.proximoAlerta, 0, 1000000, null);
    e.expirados = inteiro(o.expirados, 0, 100000, 0);
    e.proximaRapida = o.proximaRapida == null ? null : inteiro(o.proximaRapida, 0, 1000000, null);
    e.rapidasFeitas = inteiro(o.rapidasFeitas, 0, 1000000, 0);
    const vistos = new Set();
    for (const a of Array.isArray(o.ativos) ? o.ativos : []) {
        if (!a || !idValido(a.id) || vistos.has(a.id)) continue;
        const rap = ehRapida(a.id);
        if (e.ativos.filter((x) => ehRapida(x.id) === rap).length >= (rap ? PARAMETROS.rapidas.max : PARAMETROS.maxAtivos)) continue;
        vistos.add(a.id);
        const desde = inteiro(a.desde, 0, 1000000, e.dia);
        e.ativos.push({ id: a.id, desde, expira: inteiro(a.expira, desde, 1000000, desde + 14) });
    }
    e.usados = [...new Set((Array.isArray(o.usados) ? o.usados : []).filter((id) => ID_VALIDOS.has(id)))];
    if (o.concluidos && typeof o.concluidos === 'object') for (const [k, n] of Object.entries(o.concluidos)) if (ID_VALIDOS.has(k)) e.concluidos[k] = inteiro(n, 0, 100000, 0);
    e.historico = (Array.isArray(o.historico) ? o.historico : []).filter((h) => h && typeof h.tipo === 'string' && typeof h.dia === 'number').slice(-PARAMETROS.historicoMax)
        .map((h) => ({ tipo: String(h.tipo).slice(0, 20), dia: inteiro(h.dia, 0, 1000000, 0), id: idValido(h.id) ? h.id : undefined, valor: Number.isFinite(h.valor) ? h.valor : undefined, humor: ['feliz', 'satisfeito', 'infeliz'].includes(h.humor) ? h.humor : undefined }));
    e.equipe = saneaEquipe(o.equipe);
    e.proxId = inteiro(o.proxId, 10, 1000000, 10);
    e.grade = { cols: inteiro(o.grade && o.grade.cols, GRADE_INICIAL.cols, GRADE_MAX.cols, GRADE_INICIAL.cols), rows: inteiro(o.grade && o.grade.rows, GRADE_INICIAL.rows, GRADE_MAX.rows, GRADE_INICIAL.rows) };
    const ocupadas = new Set(), mods = [];
    for (const m of Array.isArray(o.modulos) ? o.modulos : []) {
        if (!m || !MODULOS_VALIDOS.includes(m.tipo) || typeof m.id !== 'string') continue;
        const x = inteiro(m.x, 0, GRADE_MAX.cols - 1, -1), y = inteiro(m.y, 0, GRADE_MAX.rows - 1, -1), k = x + ',' + y;
        if (x < 0 || y < 0 || x >= e.grade.cols || y >= e.grade.rows || ocupadas.has(k)) continue;
        ocupadas.add(k); mods.push({ id: m.id.slice(0, 12), tipo: m.tipo, x, y, pronto: inteiro(m.pronto, 0, 1000000, 0) });
    }
    if (mods.length) e.modulos = mods;
    const idsEq = new Set(e.equipe.map((m) => m.id));
    const naves = [];
    for (const n of Array.isArray(o.naves) ? o.naves : []) {
        if (!n || !TIPOS_NAVE.includes(n.tipo) || typeof n.id !== 'string' || naves.length >= 30) continue;
        const mi = n.missao && typeof n.missao === 'object' && ['coleta', 'levantamento', 'retorno'].includes(n.missao.tipo)
            ? { tipo: n.missao.tipo, coletaId: typeof n.missao.coletaId === 'string' ? n.missao.coletaId.slice(0, 12) : undefined, alertaId: idValido(n.missao.alertaId) ? n.missao.alertaId : undefined, chegaEm: inteiro(n.missao.chegaEm, 0, 1000000, e.dia), saiuEm: inteiro(n.missao.saiuEm, 0, 1000000, Math.max(0, e.dia - 1)), fontes: inteiro(n.missao.fontes, 0, 20, 0), ids: (Array.isArray(n.missao.ids) ? n.missao.ids : []).filter((i) => idsEq.has(i)).slice(0, 4) } : null;
        naves.push({ id: n.id.slice(0, 12), tipo: n.tipo, livreEm: inteiro(n.livreEm, 0, 1000000, 0), missao: mi });
    }
    if (naves.length) e.naves = naves;
    e.candidatos = (Array.isArray(o.candidatos) ? o.candidatos : []).filter((c) => c && typeof c.id === 'string' && typeof c.nome === 'string').slice(0, 6).map((c) => ({ id: c.id.slice(0, 12), nome: c.nome.slice(0, 24), retrato: typeof c.retrato === 'string' ? c.retrato.slice(0, 12) : 'lara', expira: inteiro(c.expira, 0, 1000000, e.dia + 30) }));
    if (o.pesquisa && typeof o.pesquisa === 'object') for (const k of Object.keys(CUSTOS.pesquisa)) if (o.pesquisa[k]) e.pesquisa[k] = { pronto: inteiro(o.pesquisa[k].pronto, 0, 1000000, 0) };
    e.coleta = (Array.isArray(o.coleta) ? o.coleta : []).filter((c) => c && typeof c.id === 'string' && idValido(c.alertaId)).slice(0, 10).map((c) => ({ id: c.id.slice(0, 12), alertaId: c.alertaId, fontes: inteiro(c.fontes, 1, 20, 1), desde: inteiro(c.desde, 0, 1000000, 0), expira: inteiro(c.expira, 0, 1000000, e.dia + PRAZO_COLETA) }));
    e.levantados = [...new Set((Array.isArray(o.levantados) ? o.levantados : []).filter((id) => idValido(id)))];
    e.v = 2;
    return e;
}

export const mesDe = (dia) => Math.floor(Math.max(0, dia - 1) / PARAMETROS.diasPorMes);   // 0 = primeiro mês
export const diaDoMes = (dia) => ((Math.max(1, dia) - 1) % PARAMETROS.diasPorMes) + 1;

const inteiroAleatorio = (rand, a, b) => a + Math.floor(rand() * (b - a + 1));
const registrar = (est, ev) => { est.historico.push(ev); if (est.historico.length > PARAMETROS.historicoMax) est.historico.splice(0, est.historico.length - PARAMETROS.historicoMax); };

/** Começa o relógio (depois do treinamento). O primeiro alerta vem em poucos dias. */
export function iniciar(est, dotacao = 0) {
    if (est.iniciado) return false;
    est.iniciado = true; est.dia = 0; est.proximoAlerta = PARAMETROS.primeiroAlertaEm; est.proximaRapida = PARAMETROS.rapidas.primeira;
    est.creditos += Math.max(0, Math.round(dotacao) || 0);
    return true;
}

/** Sorteia um alerta elegível. Sem repetir até esvaziar a lista (o "baralho" é reposto); respeita o mês de liberação. */
export function sortear(est, rand = Math.random) {
    const mes = mesDe(est.dia);
    const livres = () => ALERTAS.filter((a) => a.liberaMes <= mes && (!a.depois || (est.concluidos[a.depois] || 0) > 0) && !est.ativos.some((x) => x.id === a.id) && !est.usados.includes(a.id));
    let lista = livres();
    if (!lista.length) { est.usados = []; lista = livres(); }
    if (!lista.length) return null;
    // v3.17.2: fáceis primeiro. Sorteia só entre as de menor dificuldade que ainda restam (Goiânia, depois investigações, depois as normais...)
    const ordem = { easy: 0, investigacao: 1, normal: 2, hard: 3, insane: 4 }, rank = (x) => (x.nivel in ordem ? ordem[x.nivel] : 2);
    const menor = Math.min(...lista.map(rank)); lista = lista.filter((x) => rank(x) === menor);
    const a = lista[Math.min(lista.length - 1, Math.floor(rand() * lista.length))];
    est.usados.push(a.id);
    return a.id;
}

export const prazoDe = (id) => ehRapida(id) ? PARAMETROS.rapidas.prazo : PARAMETROS.prazoDias[alertaPorId(id).nivel] || 14;
export const diasRestantes = (est, a) => Math.max(0, a.expira - est.dia);

/**
 * Avança UM dia. Devolve a lista de eventos do dia: {tipo:'novo'|'expirou'|'mes', ...}.
 * Quem chama (a interface) PARA o relógio quando a lista não é vazia.
 */
export function avancarDia(est, rand = Math.random) {
    if (!est.iniciado) return [];
    const ev = [];
    est.dia += 1;
    // equipe: quem estava em tratamento volta quando a dose relativa cai abaixo de 75 % (85 % com Departamento médico)
    for (const m of est.equipe) if (verificarRetorno(m, est.dia, limiteRetorno(est))) { const e = { tipo: 'retorno', dia: est.dia, quem: m.nome }; ev.push(e); registrar(est, e); }
    // naves em viagem: chegada
    for (const n of est.naves) {
        if (n.missao && est.dia >= n.missao.chegaEm) {
            const mi = n.missao; n.missao = null; n.livreEm = est.dia;
            if (mi.tipo === 'levantamento') { if (!est.levantados.includes(mi.alertaId)) est.levantados.push(mi.alertaId); const e = { tipo: 'levantamento', dia: est.dia, id: mi.alertaId }; ev.push(e); registrar(est, e); }
            else if (mi.tipo === 'retorno') { const e = { tipo: 'pouso', dia: est.dia, id: mi.alertaId }; ev.push(e); registrar(est, e); }
            else {
                const ganho = (mi.fontes || 0) * CUSTOS.valorColetaPorFonte; est.creditos += ganho; est.nota += 1;
                const doses = distribuirDoseMissao(est.equipe, mi.ids, mi.ids[0], (mi.fontes || 0) * NORMAS.doseColeta * 1.5, est.dia);
                const e = { tipo: 'entrega', dia: est.dia, valor: ganho, fontes: mi.fontes || 0, tratamento: doses.filter((d) => d.tratamento).length }; ev.push(e); registrar(est, e);
            }
        }
    }
    // obras e pesquisas concluídas
    for (const m of est.modulos) if (m.pronto === est.dia) { const e = { tipo: 'obra', dia: est.dia, modulo: m.tipo }; ev.push(e); registrar(est, e); }
    for (const [k, p] of Object.entries(est.pesquisa)) if (p.pronto === est.dia) { const e = { tipo: 'pesquisa', dia: est.dia, id: k }; ev.push(e); registrar(est, e); }
    // coleta que ninguém buscou a tempo
    for (const c of [...est.coleta]) if (est.dia >= c.expira) { est.coleta = est.coleta.filter((x) => x.id !== c.id); est.nota -= 1; const e = { tipo: 'coleta-perdida', dia: est.dia, id: c.alertaId }; ev.push(e); registrar(est, e); }
    for (const a of [...est.ativos]) {
        if (est.dia >= a.expira) {
            est.ativos = est.ativos.filter((x) => x.id !== a.id);
            est.nota += ehRapida(a.id) ? PARAMETROS.rapidas.pontosExpirou : PARAMETROS.pontosExpirou; est.expirados += 1;
            const e = { tipo: 'expirou', dia: est.dia, id: a.id }; ev.push(e); registrar(est, e);
        }
    }
    if (est.proximoAlerta != null && est.dia >= est.proximoAlerta) {
        if (est.ativos.filter((x) => !ehRapida(x.id)).length < PARAMETROS.maxAtivos) {
            const id = sortear(est, rand);
            if (id) {
                est.ativos.push({ id, desde: est.dia, expira: est.dia + prazoDe(id) });
                const e = { tipo: 'novo', dia: est.dia, id }; ev.push(e); registrar(est, e);
            }
            est.proximoAlerta = est.dia + inteiroAleatorio(rand, PARAMETROS.intervaloMin, PARAMETROS.intervaloMax);
        } else est.proximoAlerta = est.dia + 1;   // lotado: tenta de novo amanhã
    }
    // chamados de cidadãos: calendário próprio, não ocupam as vagas das missões da história
    if (est.proximaRapida == null) est.proximaRapida = est.dia + PARAMETROS.rapidas.primeira;
    if (est.dia >= est.proximaRapida) {
        if (est.ativos.filter((x) => ehRapida(x.id)).length < PARAMETROS.rapidas.max) {
            const R = PARAMETROS.rapidas, nMax = est.rapidasFeitas < R.facilAte ? 1 : est.rapidasFeitas < R.medioAte ? 2 : 3;
            const id = 'q' + novaSemente(rand, est.ativos.map((x) => x.id), nMax);
            est.ativos.push({ id, desde: est.dia, expira: est.dia + PARAMETROS.rapidas.prazo });
            const e = { tipo: 'novo', dia: est.dia, id }; ev.push(e); registrar(est, e);
            est.proximaRapida = est.dia + inteiroAleatorio(rand, PARAMETROS.rapidas.intervaloMin, PARAMETROS.rapidas.intervaloMax);
        } else est.proximaRapida = est.dia + 1;
    }
    if (est.dia % PARAMETROS.diasPorMes === 0) {
        const pagamento = Math.round(PARAMETROS.verbaBase * est.fator / 100);
        est.creditos += pagamento;
        const nota = est.nota;
        let humor = 'satisfeito', passo = 0;
        if (nota >= PARAMETROS.notaFeliz) { humor = 'feliz'; passo = inteiroAleatorio(rand, PARAMETROS.passoMin, PARAMETROS.passoMax); }
        else if (nota <= PARAMETROS.notaInfeliz) { humor = 'infeliz'; passo = -inteiroAleatorio(rand, PARAMETROS.passoMin, PARAMETROS.passoMax); }
        est.fator = Math.min(PARAMETROS.fatorMax, Math.max(PARAMETROS.fatorMin, est.fator + passo));
        est.nota = 0;
        renovarCandidatos(est, rand);
        const e = { tipo: 'mes', dia: est.dia, valor: pagamento, humor, nota, fator: est.fator }; ev.push(e); registrar(est, { tipo: 'mes', dia: est.dia, valor: pagamento, humor });
    }
    return ev;
}

/** Registra uma conclusão. `pontos` = estrelas da missão (1 a 3) ou `pontosInvestigacao`. Devolve os créditos ganhos (0 se o alerta não estava ativo). */
export function concluir(est, id, pontos) {
    const i = est.ativos.findIndex((a) => a.id === id);
    if (i < 0) return 0;
    est.ativos.splice(i, 1);
    const p = inteiro(pontos, 1, 3, 1);
    est.nota += ehRapida(id) ? PARAMETROS.rapidas.nota : p;
    const base = PARAMETROS.premioMissao[(alertaPorId(id) || {}).nivel] || PARAMETROS.premioMissao.normal;
    const ganho = Math.round(base * PARAMETROS.fatorEstrelas[p]);
    est.creditos += ganho;
    if (ehRapida(id)) est.rapidasFeitas += 1; else est.concluidos[id] = (est.concluidos[id] || 0) + 1;
    registrar(est, { tipo: 'concluido', dia: est.dia, id, valor: ganho });
    return ganho;
}

/** Quantos alertas de cada tipo já foram concluídos (para o cofre e a Base). */
export const totalConcluidos = (est) => Object.values(est.concluidos).filter((n) => n > 0).length;
