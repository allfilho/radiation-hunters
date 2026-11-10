// ============================================
// AGÊNCIA (v3.40): POLÍTICAS da Agência, CARTAS de campo e PROPOSTAS do cliente. Lógica PURA (sem DOM nem Phaser).
//
// Inspiração (claude/radhunter-ideias-cult-of-the-lamb.md): doutrinas escolhidas entre duas opções permanentes, cartas de tarô
// sorteadas antes da corrida e o princípio de "tentar sem forçar" (Cult of the Lamb); escolha de equipamento antes da missão
// (X-COM). Aqui a tentação é de dose e dinheiro, com consequência realista. Todos os números são HIPÓTESES DE JOGO [H].
// ============================================

// ---------- políticas (1 de 2, permanentes, abertas por número de alertas concluídos) ----------
export const POLITICAS = [
    { id: 'dose', marco: 3, opcoes: ['revezamento', 'producao'] },
    { id: 'informacao', marco: 8, opcoes: ['mapaPrevio', 'respostaRapida'] },
    { id: 'pessoal', marco: 15, opcoes: ['folga', 'plantao'] },
];
/** Efeitos [H]: premioCampo (× prêmio de missão de campo), bonusPlano (× bônus do plano de dose), levantamento (missões de campo chegam levantadas),
 *  prazo (+dias nos alertas novos), retorno (+ limite de alta do tratamento), rapidas (+ chamados rápidos ao mesmo tempo). */
export const EFEITOS = {
    revezamento: { bonusPlano: 1.5 },
    producao: { premioCampo: 1.1, bonusPlano: 0 },
    mapaPrevio: { levantamento: true, premioCampo: 0.85 },
    respostaRapida: { prazo: 4 },
    folga: { retorno: 0.05, rapidas: -1 },
    plantao: { rapidas: 1, retorno: -0.05 },
};
export const concluidosTotal = (est) => Object.values(est.concluidos || {}).reduce((s, n) => s + (n > 0 ? n : 0), 0) + (est.rapidasFeitas || 0);
/** Políticas abertas e ainda sem escolha. */
export const politicasPendentes = (est) => POLITICAS.filter((p) => concluidosTotal(est) >= p.marco && !(est.politicas || {})[p.id]);
export function escolherPolitica(est, id, opcao) {
    const p = POLITICAS.find((x) => x.id === id);
    if (!p || !p.opcoes.includes(opcao) || (est.politicas || {})[id] || concluidosTotal(est) < p.marco) return false;
    est.politicas = { ...(est.politicas || {}), [id]: opcao };
    return true;
}
/** Efeito combinado das políticas escolhidas: multiplica fatores; soma prazo, retorno e rapidas; OU lógico em levantamento. */
export function efeito(est, chave) {
    const soma = chave === 'prazo' || chave === 'retorno' || chave === 'rapidas';
    let v = chave === 'levantamento' ? false : (soma ? 0 : 1);
    for (const op of Object.values((est && est.politicas) || {})) {
        const x = (EFEITOS[op] || {})[chave]; if (x === undefined) continue;
        if (chave === 'levantamento') v = v || x; else if (soma) v += x; else v *= x;
    }
    return v;
}
export function saneaPoliticas(o) {
    const r = {};
    for (const p of POLITICAS) { const v = o && o[p.id]; if (p.opcoes.includes(v)) r[p.id] = v; }
    return r;
}

// ---------- cartas de campo (1 de 3 antes do voo) ----------
export const CARTAS = {
    levantamento: {},                       // a missão chega levantada (fontes gama marcadas no minimapa)
    pressa: { premio: 1.25, meta: 0.75 },   // +25 % no prêmio; meta de tempo 25 % menor
    folego: { stamina: 0.5 },               // corrida gasta metade do fôlego
    segundaChance: { erroGratis: 1 },       // o primeiro erro de identificação não custa dose
    patrocinio: { creditos: 100 },          // +100 créditos se concluir
};
export const IDS_CARTAS = Object.keys(CARTAS);
const hash = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** Três cartas diferentes, sempre as mesmas para o mesmo alerta no mesmo dia. */
export function sortearCartas(alertaId, dia) {
    const ids = [...IDS_CARTAS], out = [];
    let h = hash(alertaId + '|' + dia);
    while (out.length < 3 && ids.length) { out.push(ids.splice(h % ids.length, 1)[0]); h = Math.imul(h, 2654435761) >>> 0 || 1; }
    return out;
}
export const cartaValida = (c) => (IDS_CARTAS.includes(c) ? c : null);

// ---------- propostas do cliente (tentação) ----------
export const PROPOSTAS = {
    sozinho: { premio: 0.4 },   // +40 % se embarcar só 1 cientista (toda a dose numa pessoa)
    semPlano: { premio: 0.3 },  // +30 % se a saída for sem objetivo de dose (sem alarme)
};
export const PROPOSTA = { chance: 30, notaPerda: 1, limiteCaneta: 0.75, limiteSemPlano: 1.0 };   // [H] 30 % dos alertas de campo; −1 de nota se a exposição for alta
/** Proposta do alerta (null se não há): determinística por id e dia de chegada; só missões de campo e chamados rápidos (não perícia). */
export function propostaDe(a, desde) {
    if (!a || !(a.tipo === 'missao' || a.tipo === 'rapida') || a.pericia || a.falso) return null;
    const h = hash(a.id + '#' + desde);
    if (h % 100 >= PROPOSTA.chance) return null;
    return (h >>> 8) % 2 ? 'sozinho' : 'semPlano';
}
/** A saída cumpre a condição da proposta? */
export function cumpreProposta(prop, ids, objetivo) {
    if (prop === 'sozinho') return ids.length === 1;
    if (prop === 'semPlano') return objetivo == null;
    return false;
}
/** Consequência: a exposição ficou alta? (sozinho: quem foi chegou a 75 % do limite; semPlano: alguém recebeu mais de 1 mSv na saída) */
export function exposicaoAlta(prop, razoesDepois, dosesSaida) {
    if (prop === 'sozinho') return razoesDepois.some((r) => r >= PROPOSTA.limiteCaneta);
    if (prop === 'semPlano') return dosesSaida.some((d) => d > PROPOSTA.limiteSemPlano);
    return false;
}
