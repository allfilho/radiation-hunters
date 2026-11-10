// ============================================
// AGÊNCIA (v3.41): MORAL da equipe, CONFIANÇA PÚBLICA por região, MINI-JOGO dos dados do decaimento e AJUDA ESCONDIDA.
// Lógica PURA (sem DOM nem Phaser).
//
// Inspiração (claude/radhunter-ideias-cult-of-the-lamb.md): fé e dissidência dos seguidores e a ajuda escondida a quem vai mal
// (Cult of the Lamb); pânico das nações e verba do conselho (X-COM de 1994); jogo de dados na base (Knucklebones), trocado pelo
// jogo dos dados do decaimento, uma analogia de sala de aula. Todos os números são HIPÓTESES DE JOGO [H], salvo indicação.
// ============================================

// ---------- moral (0 a 100) ----------
export const MORAL = { inicial: 70, folga: 3, missao: -6, canetaAlta: -6, promocao: 10, briefing: 4, dados: 3, alto: 80, baixo: 40, muitoBaixo: 20 };
export const moralDe = (m) => (Number.isFinite(m && m.moral) ? m.moral : MORAL.inicial);
export function ajustarMoral(m, delta) { m.moral = Math.max(0, Math.min(100, Math.round(moralDe(m) + delta))); return m.moral; }
/** Fator de velocidade em campo pelo moral [H]: animado anda um pouco mais rápido; desanimado, mais devagar. */
export function fatorMoral(m) {
    const v = moralDe(m);
    if (v >= MORAL.alto) return 1.03;
    if (v < MORAL.muitoBaixo) return 0.9;
    if (v < MORAL.baixo) return 0.95;
    return 1;
}
export const faixaMoral = (m) => { const v = moralDe(m); return v >= MORAL.alto ? 'alto' : v < MORAL.baixo ? 'baixo' : 'medio'; };
export const saneaMoral = (o) => (Number.isFinite(o && o.moral) ? Math.max(0, Math.min(100, Math.round(o.moral))) : MORAL.inicial);

// ---------- confiança pública por região (0 a 100) ----------
export const REGIOES = ['americaSul', 'americaNorte', 'europa', 'africa', 'asia', 'oceania'];
/** Região do mapa por latitude e longitude (caixas simples, só para o jogo). */
export function regiaoDe(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (lon < -30) return lat < 12 ? 'americaSul' : 'americaNorte';
    if (lon < 60 && lat >= 35) return 'europa';
    if (lon < 52 && lat < 35) return 'africa';
    if (lat < -10 && lon >= 110) return 'oceania';
    return 'asia';
}
export const CONFIANCA = { inicial: 60, concluido: 5, expirou: -10, min: 0, max: 100 };
export function saneaConfianca(o) {
    const r = {};
    for (const k of REGIOES) { const v = o && o[k]; r[k] = Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : CONFIANCA.inicial; }
    return r;
}
/** Ajusta a confiança da região do alerta `a` (com lat/lon). Devolve a região ou null. */
export function ajustarConfianca(est, a, delta) {
    const k = a && regiaoDe(a.lat, a.lon); if (!k) return null;
    est.confianca = saneaConfianca(est.confianca);
    est.confianca[k] = Math.max(CONFIANCA.min, Math.min(CONFIANCA.max, est.confianca[k] + delta));
    return k;
}
export const confiancaMedia = (est) => { const c = saneaConfianca(est.confianca); return REGIOES.reduce((s, k) => s + c[k], 0) / REGIOES.length; };
/** Fator da verba mensal pela confiança média [H]: 1 com a confiança inicial (60); entre 0,7 e 1,2. */
export const fatorVerba = (est) => Math.max(0.7, Math.min(1.2, 1 + (confiancaMedia(est) - CONFIANCA.inicial) / 200));

// ---------- mini-jogo: dados do decaimento ----------
// Analogia clássica de sala de aula: cada dado é um núcleo; a cada rodada os dados que mostram 6 "decaem" e saem.
// Probabilidade de sobreviver a uma rodada = 5/6; "meia-vida" em rodadas = ln 2 / ln(6/5) ≈ 3,8 [C].
// (A versão aplicada pelo Arnaldo em sala pode ter outras regras; os números daqui são do cálculo acima.)
export const DADOS = { n: 30, rodadasMax: 20, premio: 40, opcoes: [2, 3, 4, 5, 6] };
export const MEIA_VIDA_RODADAS = Math.log(2) / Math.log(6 / 5);   // ≈ 3,80 [C]
/** Gerador simples e determinístico (mulberry32). */
export function rngDados(semente) { let a = semente >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** Rola os dados até sobrar nenhum (ou o máximo de rodadas). Devolve os que restam depois de cada rodada: [n0, n1, ...]. */
export function rolarDados(n, rand, max = DADOS.rodadasMax) {
    const restam = [n]; let k = n;
    for (let r = 0; r < max && k > 0; r++) { let s = 0; for (let i = 0; i < k; i++) if (Math.floor(rand() * 6) !== 5) s++; k = s; restam.push(k); }
    return restam;
}
/** Primeira rodada em que restam no máximo metade dos dados. */
export const rodadaDaMetade = (restam) => restam.findIndex((x) => x <= restam[0] / 2);
export const dadosPendente = (est) => !!est.iniciado && (est.dados || {}).dia !== est.dia;
/** Joga a partida do dia com o palpite (rodada da metade). Acerta se o palpite for exatamente a rodada; a 1 rodada é "quase". */
export function jogarDados(est, palpite) {
    if (!dadosPendente(est) || !DADOS.opcoes.includes(palpite)) return null;
    const restam = rolarDados(DADOS.n, rngDados(est.dia * 7919 + 17)), meta = rodadaDaMetade(restam);
    const certo = palpite === meta, quase = Math.abs(palpite - meta) === 1;
    const d = est.dados || { dia: -1, partidas: 0, acertos: 0 };
    d.dia = est.dia; d.partidas = (d.partidas || 0) + 1; if (certo) d.acertos = (d.acertos || 0) + 1;
    est.dados = d;
    if (certo) { est.creditos += DADOS.premio; for (const m of est.equipe) ajustarMoral(m, MORAL.dados); }
    return { restam, meta, palpite, certo, quase, premio: certo ? DADOS.premio : 0 };
}
export function saneaDados(o) {
    const b = o && typeof o === 'object' ? o : {}, int = (v) => (Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0);
    return { dia: Number.isFinite(b.dia) ? Math.round(b.dia) : -1, partidas: int(b.partidas), acertos: int(b.acertos) };
}

// ---------- ajuda escondida em campo ----------
export const AJUDA = { minS: 60, fracaoMeta: 0.35, grade: 4 };   // [H]
/** Já passou tempo demais sem achar fonte? (sem avisar o jogador) */
export const precisaAjuda = (segSemAchar, metaS) => segSemAchar >= Math.max(AJUDA.minS, AJUDA.fracaoMeta * metaS);
/** Posição aproximada (centro do bloco de `grade` × `grade` ladrilhos) para o pulso fraco no minimapa. */
export const posAproximada = (tx, ty, grade = AJUDA.grade) => ({ x: Math.floor(tx / grade) * grade + grade / 2, y: Math.floor(ty / grade) * grade + grade / 2 });
