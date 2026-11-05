// ============================================
// AGÊNCIA: naves, hangar, módulos da Base (grade), pesquisa, contratação e coleta de fontes. Lógica PURA.
// Inspiração (ideias gerais, sem copiar números), conferida na UFOpaedia em 28/10/2026 [V]: a base é uma grade de 6×6 com hangares de
// 4 células, alojamento, laboratório, oficina e radar; o transporte leva até 14 soldados; soldados feridos se recuperam e voltam.
// Todos os VALORES abaixo (custos, prazos, capacidades) são escolhas de jogo [H] para calibrar em sala de aula.
// As ações recebem o estado `est` (de simulacao.js) e devolvem { ok: true, ... } ou { ok: false, motivo }.
// ============================================
import { disponivel, gerarCandidato } from './equipe.js';

// Calibrados em 28/10/2026 com tests/ferramentas/calibrar-economia.mjs (200 anos simulados, jogador que atende 85 % dos alertas):
// laboratório por volta do dia 30, pesquisa do detector aéreo pronta por volta do dia 70, 2º hangar por volta do dia 120,
// nave de levantamento por volta do dia 150 e Base 6×3 completa por volta do mês 17 [H]. Quem joga mais devagar leva mais tempo.
export const CUSTOS = {
    nave: { tripulacao: 1000, resgate: 750, levantamento: 1500 },
    modulo: { hangar: 1900, alojamento: 1000, laboratorio: 1250 },
    diasObra: { hangar: 5, alojamento: 3, laboratorio: 4 },
    expandirColuna: 750, expandirLinha: 1000,
    contratar: 500,
    pesquisa: { detectorAereo: { custo: 1500, dias: 10 } },
    creditosIniciais: 800,
    valorColetaPorFonte: 60,
};
export const NAVES = {
    tripulacao: { capacidade: 4 },   // leva a equipe às missões e investigações
    resgate: { capacidade: 2 },      // só recolhe fontes já organizadas no ponto de coleta
    levantamento: { capacidade: 0 }, // voo aéreo: marca no minimapa as fontes que emitem gama
};
export const DIAS_VIAGEM = { resgate: 2, levantamento: 2 };
export const PRAZO_COLETA = 20;
export const BAIAS_POR_HANGAR = 2;
export const CAMAS_POR_ALOJAMENTO = 6;
export const GRADE_INICIAL = { cols: 4, rows: 2 };
export const GRADE_MAX = { cols: 6, rows: 3 };
export const UNICOS = ['comando', 'academia', 'cofre', 'biblioteca', 'oficina', 'laboratorio'];
export const CONSTRUIVEIS = ['hangar', 'alojamento', 'laboratorio'];
export const MODULOS_VALIDOS = ['hangar', 'comando', 'academia', 'cofre', 'alojamento', 'oficina', 'biblioteca', 'laboratorio'];
export const TIPOS_NAVE = Object.keys(NAVES);

export function modulosIniciais() {
    const l = [['hangar', 0, 0], ['comando', 1, 0], ['academia', 2, 0], ['cofre', 3, 0], ['alojamento', 0, 1], ['oficina', 1, 1], ['biblioteca', 2, 1]];
    return l.map(([tipo, x, y], i) => ({ id: 'b' + (i + 1), tipo, x, y, pronto: 0 }));
}
export const naveInicial = () => [{ id: 'n1', tipo: 'tripulacao', livreEm: 0, missao: null }];

const falha = (motivo) => ({ ok: false, motivo });
const gasta = (est, v) => { if (est.creditos < v) return false; est.creditos -= v; return true; };
const novoId = (est, p) => { est.proxId += 1; return p + est.proxId; };

// ---------- consultas ----------
export const modulosProntos = (est, tipo) => est.modulos.filter((m) => m.tipo === tipo && m.pronto <= est.dia);
export const baiasTotal = (est) => modulosProntos(est, 'hangar').length * BAIAS_POR_HANGAR;
export const camasTotal = (est) => modulosProntos(est, 'alojamento').length * CAMAS_POR_ALOJAMENTO;
export const temLaboratorio = (est) => modulosProntos(est, 'laboratorio').length > 0;
export const pesquisaPronta = (est, id) => !!est.pesquisa[id] && est.pesquisa[id].pronto <= est.dia;
export const naveLivre = (n, dia) => !n.missao && n.livreEm <= dia;
export const celulaLivre = (est, x, y) => x >= 0 && y >= 0 && x < est.grade.cols && y < est.grade.rows && !est.modulos.some((m) => m.x === x && m.y === y);
export const celulasLivres = (est) => { const l = []; for (let y = 0; y < est.grade.rows; y++) for (let x = 0; x < est.grade.cols; x++) if (celulaLivre(est, x, y)) l.push({ x, y }); return l; };
export const navesDoTipo = (est, tipo) => est.naves.filter((n) => n.tipo === tipo);
export const primeiraNaveLivre = (est, tipo) => est.naves.find((n) => n.tipo === tipo && naveLivre(n, est.dia)) || null;

// ---------- Base ----------
export function construirModulo(est, tipo, x, y) {
    if (!CONSTRUIVEIS.includes(tipo)) return falha('tipo');
    if (UNICOS.includes(tipo) && est.modulos.some((m) => m.tipo === tipo)) return falha('unico');
    if (!celulaLivre(est, x, y)) return falha('celula');
    if (!gasta(est, CUSTOS.modulo[tipo])) return falha('creditos');
    est.modulos.push({ id: novoId(est, 'b'), tipo, x, y, pronto: est.dia + CUSTOS.diasObra[tipo] });
    return { ok: true, pronto: est.dia + CUSTOS.diasObra[tipo] };
}
export function expandirBase(est, eixo) {
    const col = eixo === 'coluna';
    if (!col && eixo !== 'linha') return falha('tipo');
    if (col ? est.grade.cols >= GRADE_MAX.cols : est.grade.rows >= GRADE_MAX.rows) return falha('maximo');
    if (!gasta(est, col ? CUSTOS.expandirColuna : CUSTOS.expandirLinha)) return falha('creditos');
    if (col) est.grade.cols += 1; else est.grade.rows += 1;
    return { ok: true };
}

// ---------- naves ----------
export function comprarNave(est, tipo) {
    if (!TIPOS_NAVE.includes(tipo)) return falha('tipo');
    if (est.naves.length >= baiasTotal(est)) return falha('baias');
    if (tipo === 'levantamento' && !pesquisaPronta(est, 'detectorAereo')) return falha('pesquisa');
    if (!gasta(est, CUSTOS.nave[tipo])) return falha('creditos');
    est.naves.push({ id: novoId(est, 'n'), tipo, livreEm: 0, missao: null });
    return { ok: true };
}

// ---------- pesquisa ----------
export function iniciarPesquisa(est, id) {
    const p = CUSTOS.pesquisa[id];
    if (!p) return falha('tipo');
    if (!temLaboratorio(est)) return falha('laboratorio');
    if (est.pesquisa[id]) return falha('ja');
    if (!gasta(est, p.custo)) return falha('creditos');
    est.pesquisa[id] = { pronto: est.dia + p.dias };
    return { ok: true, pronto: est.dia + p.dias };
}

// ---------- contratação ----------
export function contratar(est, candidatoId) {
    const i = est.candidatos.findIndex((c) => c.id === candidatoId);
    if (i < 0) return falha('candidato');
    if (est.equipe.length >= camasTotal(est)) return falha('camas');
    if (!gasta(est, CUSTOS.contratar)) return falha('creditos');
    const c = est.candidatos.splice(i, 1)[0];
    est.equipe.push({ id: novoId(est, 'c'), nome: c.nome, retrato: c.retrato, doses: [], tratamento: false, ocupadoAte: 0 });
    return { ok: true };
}
/** No fim do mês chegam 2 candidatos; os antigos que passaram do prazo saem. */
export function renovarCandidatos(est, rand) {
    est.candidatos = est.candidatos.filter((c) => c.expira > est.dia);
    const usados = [...est.equipe.map((m) => m.nome), ...est.candidatos.map((c) => c.nome)];
    for (let k = 0; k < 2 && est.candidatos.length < 4; k++) {
        const c = gerarCandidato(rand, usados, est.dia, ++est.proxId);
        usados.push(c.nome); est.candidatos.push(c);
    }
}

// ---------- equipe disponível ----------
export const equipeDisponivel = (est) => est.equipe.filter((m) => disponivel(m, est.dia));

// ---------- coleta de fontes e levantamento aéreo ----------
/** Depois de uma missão cumprida com fontes organizadas no ponto de coleta. */
export function registrarColeta(est, alertaId, fontes) {
    const n = Math.max(0, Math.min(20, Math.round(fontes) || 0));
    if (!n || est.coleta.some((c) => c.alertaId === alertaId)) return false;
    est.coleta.push({ id: novoId(est, 'k'), alertaId, fontes: n, desde: est.dia, expira: est.dia + PRAZO_COLETA });
    return true;
}
/** Envia uma nave de resgate com 2 cientistas disponíveis. */
export function enviarResgate(est, coletaId, ids) {
    const c = est.coleta.find((x) => x.id === coletaId);
    if (!c) return falha('coleta');
    const nave = primeiraNaveLivre(est, 'resgate');
    if (!nave) return falha('nave');
    const cap = NAVES.resgate.capacidade;
    const membros = [...new Set(ids)].map((id) => est.equipe.find((m) => m.id === id));
    if (membros.length < 1 || membros.length > cap || membros.some((m) => !m || !disponivel(m, est.dia))) return falha('equipe');
    const chega = est.dia + DIAS_VIAGEM.resgate;
    nave.missao = { tipo: 'coleta', saiuEm: est.dia, coletaId, fontes: c.fontes, alertaId: c.alertaId, chegaEm: chega, ids: membros.map((m) => m.id) };
    for (const m of membros) m.ocupadoAte = chega;
    est.coleta = est.coleta.filter((x) => x.id !== coletaId);
    return { ok: true, chega };
}
/** Envia a nave de levantamento a um alerta ativo: as fontes de gama aparecerão pré-localizadas no minimapa. */
export function enviarLevantamento(est, alertaId) {
    if (!est.ativos.some((a) => a.id === alertaId)) return falha('alerta');
    if (est.levantados.includes(alertaId) || est.naves.some((n) => n.missao && n.missao.tipo === 'levantamento' && n.missao.alertaId === alertaId)) return falha('ja');
    const nave = primeiraNaveLivre(est, 'levantamento');
    if (!nave) return falha('nave');
    const chega = est.dia + DIAS_VIAGEM.levantamento;
    nave.missao = { tipo: 'levantamento', saiuEm: est.dia, alertaId, chegaEm: chega, ids: [] };
    return { ok: true, chega };
}
export const foiLevantado = (est, alertaId) => est.levantados.includes(alertaId);

/** Dias do voo de volta de uma missão de campo (v3.17): 1 dia por até 12 h de jato, no mínimo 1 [H]. */
export const diasDeVolta = (horas) => Math.max(1, Math.ceil((Number(horas) || 0) / 12));
/**
 * A nave de tripulação (e quem foi nela) volta da missão: fica ocupada até `est.dia + dias`. Só dá para enviar outra equipe se houver outra nave livre.
 * Devolve o dia de chegada, ou 0 se a nave não foi encontrada.
 */
export function registrarRetorno(est, naveId, ids, dias, alertaId) {
    const nave = est.naves.find((n) => n.id === naveId && n.tipo === 'tripulacao' && !n.missao) || primeiraNaveLivre(est, 'tripulacao');
    if (!nave) return 0;
    const chega = est.dia + Math.max(1, dias | 0);
    nave.missao = { tipo: 'retorno', saiuEm: est.dia, alertaId, chegaEm: chega, ids: [...ids] };
    for (const id of ids) { const m = est.equipe.find((x) => x.id === id); if (m) m.ocupadoAte = Math.max(m.ocupadoAte || 0, chega); }
    return chega;
}
