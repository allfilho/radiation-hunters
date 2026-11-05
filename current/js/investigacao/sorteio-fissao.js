// ============================================
// SORTEIO DE DADOS FICTÍCIOS PARA OS PROBLEMAS DO LABORATÓRIO DE PESQUISA.
// Mesma forma de DADOS_PADRAO (dados-fissao.js). Tudo é gerado de uma semente, portanto reproduzível, e é FICTÍCIO.
// Coerência por construção:
//  - ζ não é suposto: sai do padrão de idade conhecida (ζ = [exp(λD·t) − 1]/(λD·g·ρd·ρs/ρi)), como numa calibração real.
//  - Cada grão da amostra tem Ni sorteado e Ns ~ Poisson(Ni·R), com R = [exp(λD·T) − 1]/(λD·g·ζ·ρd) para a idade verdadeira T
//    (sobredispersão: R multiplicado por exp(σ·z) em cada grão).
//  - Os comprimentos vêm da história térmica fictícia sorteada (resfriamento rápido, residência prolongada ou reaquecimento).
// O que não é inventado: equação, constantes (λD, g), erro de Poisson, teste χ² (traco-fissao.js, conferido com a skill).
// ============================================
import { DADOS_PADRAO, AREA_CONTAGEM_CM2, ZETA_ERRO_REL, ND, T_PADRAO_MA } from './dados-fissao.js';
import { idadeZeta, idadePooled, erroIdade, testeChi2, zetaDoPadrao, LAMBDA_D, G_EDM } from './traco-fissao.js';

export function criarRng(semente) {
    let a = (semente >>> 0) || 1;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const normal = (r) => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
const poisson = (r, l) => { if (l > 40) return Math.max(0, Math.round(l + Math.sqrt(l) * normal(r))); const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; };
const umaCasa = (x) => Math.round(x * 10) / 10;
export const HISTORIAS = Object.freeze(['rapida', 'prolongada', 'reaquecimento']);

function comprimentos(r, historia, n = 60) {
    const um = () => {
        if (historia === 'rapida') return 14.5 + 0.7 * normal(r);
        if (historia === 'prolongada') return 12.3 + 1.3 * normal(r);
        return r() < 0.55 ? 14.2 + 0.8 * normal(r) : 10.0 + 1.2 * normal(r);   // reaquecimento: duas populações
    };
    return Array.from({ length: n }, () => umaCasa(Math.min(16.9, Math.max(7.1, um()))));
}

/** Gera um conjunto completo de dados. `opcoes.amostra` ('homogeneo'|'sobredisperso') e `opcoes.historia` forçam o tipo (para teste). */
export function gerarDados(semente, opcoes = {}) {
    const r = criarRng(semente);
    const rhod = Math.round((0.9e6 + r() * 0.6e6) / 1e4) * 1e4;
    const zetaAlvo = 300 + r() * 100, tPad = T_PADRAO_MA;
    const razaoPad = Math.round(((Math.exp(LAMBDA_D * tPad * 1e6) - 1) / (LAMBDA_D * G_EDM * zetaAlvo * rhod)) * 1e4) / 1e4;
    const zeta = Math.round(zetaDoPadrao(tPad * 1e6, razaoPad, rhod) * 10) / 10;
    const tVerd = 30 + Math.floor(r() * 25) * 5;                                    // idade fictícia da amostra, 30 a 150 Ma
    const R = (Math.exp(LAMBDA_D * tVerd * 1e6) - 1) / (LAMBDA_D * G_EDM * zeta * rhod);
    const quer = opcoes.amostra || (r() < 0.5 ? 'homogeneo' : 'sobredisperso');
    let graos = null;
    for (let tent = 0; tent < 200 && !graos; tent++) {
        const g = Array.from({ length: 12 }, () => { const Ni = 25 + Math.floor(r() * 50), f = quer === 'sobredisperso' ? Math.exp(0.7 * normal(r)) : 1; return [poisson(r, Ni * R * f), Ni]; });
        if (g.some(([Ns]) => Ns < 1)) continue;
        const p = testeChi2(g).p;
        if ((quer === 'homogeneo' && p > 0.2) || (quer === 'sobredisperso' && p < 0.001)) graos = g;
    }
    if (!graos) throw Error('Sorteio sem conjunto coerente para a semente ' + semente);
    const historia = opcoes.historia || HISTORIAS[Math.floor(r() * 3)];
    const amostraComp = comprimentos(r, historia);
    // Conjunto de annealing fictício: comprimento reduzido r = l/l0 cai com o tempo de aquecimento numa temperatura fixa.
    const base = [0.95, 0.88, 0.76, 0.58];
    const annealing = base.map((b, i) => Math.round((b + (r() - 0.5) * 0.04 - i * 0.002) * 100) / 100);
    for (let i = 1; i < 4; i++) annealing[i] = Math.min(annealing[i], annealing[i - 1] - 0.03);
    // Segundo padrão de idade conhecida, para verificar o ζ.
    const tB = 30 + Math.floor(r() * 15) * 5, RB = (Math.exp(LAMBDA_D * tB * 1e6) - 1) / (LAMBDA_D * G_EDM * zeta * rhod);
    const Ni = 600 + Math.floor(r() * 400), Ns = poisson(r, Ni * RB);
    const idade = idadeZeta(Ns / Ni, zeta, rhod), erro = erroIdade(Ns, Ni, idade, ZETA_ERRO_REL, ND);
    const verificacao = { tMa: tB, Ns, Ni, idadeMa: idade / 1e6, erroMa: erro / 1e6, dif: (idade / 1e6 - tB) / (erro / 1e6) };
    return Object.freeze({
        semente, zeta, zetaErroRel: ZETA_ERRO_REL, rhod, nd: ND, area: AREA_CONTAGEM_CM2, graos, sobredisperso: graos,
        padrao: { tMa: tPad, razao: razaoPad }, comprimentos: { longos: DADOS_PADRAO.comprimentos.longos, curtos: DADOS_PADRAO.comprimentos.curtos, amostra: amostraComp },
        historia, annealing, verificacao, tVerdadeiraMa: tVerd, amostraTipo: quer,
    });
}
