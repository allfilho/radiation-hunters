// ============================================
// AGÊNCIA: a EQUIPE (cientistas), a dose recebida e o tratamento. Lógica PURA (sem DOM nem Phaser).
//
// Tudo é SIMPLIFICAÇÃO didática. A "vida" de um cientista é uma função da dose que ele recebeu nas janelas de 1, 7 e 30 dias;
// "tratamento" é ficar afastado de novas exposições até a dose relativa cair a um nível adequado às normas do jogo.
//
// Limites do jogo: [V] os limites OPERACIONAIS usados na resposta ao acidente de Goiânia, segundo os slides de treinamento da AIEA
// (ORPNET, slide 22): 1,5 mSv por dia, 5,0 mSv por semana, 15 mSv por mês (e 30 mSv por trimestre, que o jogo não usa).
// Os slides não dizem quem fixou esses limites; no jogo eles aparecem como "Normas da Agência".
// Valores de uso [H]: nível de atenção em 50 % e retorno ao serviço abaixo de 75 % do limite da janela mais restritiva.
// ============================================

export const NORMAS = {
    janelas: [
        { dias: 1, limite: 1.5, id: 'dia' },
        { dias: 7, limite: 5, id: 'semana' },
        { dias: 30, limite: 15, id: 'mes' },
    ],
    atencao: 0.5,    // r >= 0,5: caneta amarela [H]
    retorno: 0.75,   // sai do tratamento quando r < 0,75 [H]
    retornoMedico: 0.85, // com o Departamento médico construído: alta com reavaliação clínica quando r < 0,85 [H]
    doseLider: 1,    // fração da dose da missão recebida por quem vai à frente [H]
    doseApoio: 0.4,  // fração recebida pelos demais (ficam atrás) [H]
    doseColeta: 0.2, // dose de manejo na coleta de fontes, em fração de L1 por fonte [H]
};

const JANELA_MAX = 30;
const NOMES_POOL = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Graça', 'Hugo', 'Iara', 'Jonas', 'Kátia', 'Lívia', 'Mateus', 'Nina', 'Otto', 'Paula', 'Quintino', 'Rosa', 'Sérgio', 'Tereza'];
export const RETRATOS_POOL = ['lara', 'caio', 'dora', 'ines', 'nelson', 'leo', 'vera', 'paulo', 'tania', 'helena', 'rita', 'andre'];

export const inteiro = (v, lo, hi, padrao) => { const n = typeof v === 'number' ? v : Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : padrao; };
const num = (v, lo, hi, padrao) => { const n = typeof v === 'number' ? v : Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : padrao; };

// ---------- especialidades (v3.32, Fase D) ----------
// Cada cientista tem uma especialidade com um bônus pequeno. Valores [H], a calibrar em sala.
export const ESPECIALIDADES = ['campo', 'fisica', 'medicina'];
export const BONUS = {
    campo: { coleta: 0.5 },      // manuseia fontes na coleta com metade da dose
    fisica: { erroId: 0.5 },     // identificar errado custa metade da dose extra
    medicina: { retorno: 0.05 }, // volta ao serviço com 5 pontos percentuais a mais no limite de retorno
};
/** Especialidade de saves antigos: derivada do id, sempre a mesma. */
export const especialidadePorId = (id) => { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return ESPECIALIDADES[h % ESPECIALIDADES.length]; };
export const especialidadeDe = (m) => (m && ESPECIALIDADES.includes(m.especialidade) ? m.especialidade : especialidadePorId(m && m.id));
/** Fator do bônus da especialidade de `m` para `chave` (1 = sem bônus). */
export const bonusDe = (m, chave) => (BONUS[especialidadeDe(m)] || {})[chave] ?? 1;

export function novoCientista(id, nome, retrato, especialidade) {
    return { id, nome, retrato, especialidade: ESPECIALIDADES.includes(especialidade) ? especialidade : especialidadePorId(id), doses: [], tratamento: false, ocupadoAte: 0, equip: null };
}

/** Equipe inicial: 4 cientistas (decisão do Arnaldo, 28/10/2026). */
export function equipeInicial() {
    const esp = ['campo', 'fisica', 'medicina', 'campo'];   // [H] equipe inicial
    return NOMES_POOL.slice(0, 4).map((n, i) => novoCientista('c' + (i + 1), n, RETRATOS_POOL[i], esp[i]));
}

/** Soma das doses (mSv) recebidas nos últimos `dias` dias (dias = 1: só hoje). */
export function doseNaJanela(m, dia, dias) {
    let s = 0;
    for (const d of m.doses) if (d.dia > dia - dias && d.dia <= dia) s += d.msv;
    return s;
}

/** Razão dose/limite da janela mais restritiva (r = 1 é o limite). */
export function razao(m, dia) {
    let r = 0;
    for (const j of NORMAS.janelas) r = Math.max(r, doseNaJanela(m, dia, j.dias) / j.limite);
    return r;
}

/** Janela que está mandando agora (para o texto "por quê"). */
export function janelaMaisRestritiva(m, dia) {
    let melhor = null, r = -1;
    for (const j of NORMAS.janelas) { const x = doseNaJanela(m, dia, j.dias) / j.limite; if (x > r) { r = x; melhor = j; } }
    return melhor;
}

/** "Vida" de 0 a 100: 100 sem dose; 0 no limite. */
export const vida = (m, dia) => Math.round(100 * (1 - Math.min(1, razao(m, dia))));

/** Cor da caneta, sempre acompanhada de texto na interface. */
export function corCaneta(r) {
    if (r >= 0.75) return 'vermelho';
    if (r >= NORMAS.atencao) return 'amarelo';
    return 'verde';
}

/** Registra uma dose (mSv) recebida no dia. Devolve { tratamento: true } se isso colocou o cientista em tratamento. */
export function registrarDose(m, dia, msv) {
    const v = num(msv, 0, 1000, 0);
    if (v > 0) {
        const hoje = m.doses.find((d) => d.dia === dia);
        if (hoje) hoje.msv += v; else m.doses.push({ dia, msv: v });
        m.doses = m.doses.filter((d) => d.dia > dia - JANELA_MAX);
    }
    if (!m.tratamento && razao(m, dia) >= 1) { m.tratamento = true; return { tratamento: true }; }
    return { tratamento: false };
}

/** A cada dia: quem está em tratamento volta ao serviço quando r < 0,75. Devolve true se voltou. */
export function verificarRetorno(m, dia, limite = NORMAS.retorno) {
    if (m.tratamento && razao(m, dia) < limite + (BONUS[especialidadeDe(m)].retorno || 0)) { m.tratamento = false; return true; }
    return false;
}

/** Quantos dias faltam para voltar (só com as doses que ainda estão nas janelas; sem novas doses). null se não está em tratamento. */
export function diasParaVoltar(m, dia, limite = NORMAS.retorno) {
    if (!m.tratamento) return null;
    const lim = limite + (BONUS[especialidadeDe(m)].retorno || 0);
    for (let t = 0; t <= 60; t++) if (razao(m, dia + t) < lim) return t;
    return 60;
}

export const disponivel = (m, dia) => !m.tratamento && (m.ocupadoAte || 0) <= dia;

/** Tira da equipe o que a norma do jogo manda e devolve o motivo (para a interface). */
export function motivoIndisponivel(m, dia) {
    if (m.tratamento) return 'tratamento';
    if ((m.ocupadoAte || 0) > dia) return 'viagem';
    return null;
}

/**
 * Dose da missão repartida pela equipe: o líder recebe `doseLider` × dose; os outros, `doseApoio` × dose.
 * Devolve [{id, msv, tratamento}] (e registra no cientista).
 */
export function distribuirDoseMissao(equipe, ids, liderId, doseMsv, dia, acum = null, exato = false, opcoes = {}) {
    const saida = [];
    for (const id of ids) {
        const m = equipe.find((x) => x.id === id); if (!m) continue;
        // v3.16: com `acum` (dose recebida enquanto cada um esteve à frente), vale a fração de líder para esse trecho e a de apoio para o resto
        const campo = acum && Number.isFinite(acum[id]) ? Math.min(doseMsv, Math.max(0, acum[id])) : (id === liderId ? doseMsv : 0);
        // exato (v3.17): cada cientista recebeu a dose do lugar onde esteve; não há fração de apoio
        const msv = exato && acum ? Math.max(0, Number(acum[id]) || 0) : campo * NORMAS.doseLider + (doseMsv - campo) * NORMAS.doseApoio;
        const msvFinal = msv * (opcoes.coleta ? bonusDe(m, 'coleta') : 1);   // v3.32: especialidade campo na coleta
        const r = registrarDose(m, dia, msvFinal);
        saida.push({ id, msv: msvFinal, tratamento: r.tratamento });
    }
    return saida;
}

/** Candidato novo (contratação). Não repete nomes já usados. */
export function gerarCandidato(rand, usados, dia, idNum, funcao = 'cientista') {
    const livres = NOMES_POOL.filter((n) => !usados.includes(n));
    const nome = (livres.length ? livres : NOMES_POOL)[Math.floor(rand() * (livres.length || NOMES_POOL.length))];
    const retrato = RETRATOS_POOL[Math.floor(rand() * RETRATOS_POOL.length)];
    return { id: 'k' + idNum, nome, retrato, expira: dia + 30, funcao, especialidade: ESPECIALIDADES[Math.floor(rand() * ESPECIALIDADES.length)] };
}

/** Aceita qualquer coisa vinda do armazenamento. */
export function saneaEquipe(lista) {
    const ok = [], vistos = new Set();
    for (const o of Array.isArray(lista) ? lista : []) {
        if (!o || typeof o.id !== 'string' || vistos.has(o.id) || typeof o.nome !== 'string' || ok.length >= 40) continue;
        vistos.add(o.id);
        ok.push({
            id: o.id.slice(0, 12), nome: o.nome.slice(0, 24), retrato: RETRATOS_POOL.includes(o.retrato) ? o.retrato : 'lara', especialidade: ESPECIALIDADES.includes(o.especialidade) ? o.especialidade : especialidadePorId(o.id),
            doses: (Array.isArray(o.doses) ? o.doses : []).filter((d) => d && Number.isFinite(d.dia) && Number.isFinite(d.msv)).slice(-60).map((d) => ({ dia: inteiro(d.dia, 0, 1000000, 0), msv: num(d.msv, 0, 1000, 0) })),
            tratamento: o.tratamento === true, ocupadoAte: inteiro(o.ocupadoAte, 0, 1000000, 0), equip: typeof o.equip === 'string' ? o.equip.slice(0, 20) : null,
        });
    }
    return ok.length ? ok : equipeInicial();
}
