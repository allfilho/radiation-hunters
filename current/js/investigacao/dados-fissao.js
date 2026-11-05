// ============================================
// DADOS FICTÍCIOS DO EPISÓDIO "ARQUIVO DO TEMPO" (traço de fissão, detector externo).
// Todos os números abaixo são de ILUSTRAÇÃO, não de uma amostra real. Os 12 grãos, ζ, ρd e Nd são o exemplo da documentação
// da skill de termocronologia (exemplo_graos.csv e README), para que cada resultado possa ser conferido com os scripts dela
// (ver tests/33-traco-fissao.test.mjs). A área de contagem e o segundo conjunto de comprimentos também são fictícios.
// A equação, λD (Jaffey et al. 1971), g = 0,5 e os testes estatísticos são os reais.
// ============================================
import { idadeGrao, erroIdade, idadePooled, idadeCentral, testeChi2, zetaDoPadrao, estatisticaComprimentos, histograma, idadeZeta, LAMBDA_D, G_EDM } from './traco-fissao.js';

export const ZETA = 350, ZETA_ERRO_REL = 10 / 350, RHOD = 1.2e6, ND = 5000;
export const AREA_CONTAGEM_CM2 = 4.0e-5;                 // área fictícia de contagem em cada grão
export const GRAOS = Object.freeze([[12, 45], [8, 31], [15, 52], [20, 68], [6, 25], [11, 40], [18, 60], [9, 35], [14, 49], [22, 71], [7, 28], [13, 44]]);
export const GRAOS_SOBREDISPERSOS = Object.freeze([[2, 40], [30, 30], [10, 50], [25, 20], [5, 45], [40, 15], [8, 30], [20, 25]]);
export const T_PADRAO_MA = 28.2, RAZAO_PADRAO = 0.1346;   // padrão de idade conhecida (valor usado na documentação da skill) e razão ρs/ρi fictícia
export const COMPRIMENTOS_LONGOS = Object.freeze([14.2, 15.1, 13.8, 14.6, 15.3, 14.0, 13.5, 14.9, 15.0, 14.4, 13.9, 14.7, 15.2, 14.1, 14.8, 13.6, 14.3, 15.4, 14.5, 14.0]);
export const COMPRIMENTOS_CURTOS = Object.freeze([10.2, 11.8, 9.5, 12.4, 13.1, 10.9, 8.7, 11.3, 12.0, 9.9, 13.5, 10.4, 11.7, 12.8, 9.2, 10.6, 11.1, 12.3, 8.9, 13.0]);

const ma = (anos) => anos / 1e6;
/** Conjunto de dados padrão (o episódio "Arquivo do tempo"). Os problemas sorteados (sorteio-fissao.js) trazem outro conjunto com a mesma forma. */
export const DADOS_PADRAO = Object.freeze({
    semente: null, zeta: ZETA, zetaErroRel: ZETA_ERRO_REL, rhod: RHOD, nd: ND, area: AREA_CONTAGEM_CM2,
    graos: GRAOS, sobredisperso: GRAOS_SOBREDISPERSOS, padrao: Object.freeze({ tMa: T_PADRAO_MA, razao: RAZAO_PADRAO }),
    comprimentos: Object.freeze({ longos: COMPRIMENTOS_LONGOS, curtos: COMPRIMENTOS_CURTOS, amostra: null }), historia: null,
    annealing: Object.freeze([0.92, 0.8, 0.62, 0.4]), verificacao: null,
});
export const idadesDosGraos = (d = DADOS_PADRAO) => d.graos.map(([Ns, Ni]) => { const t = idadeGrao(Ns, Ni, d.zeta, d.rhod); return { Ns, Ni, razao: Ns / Ni, idadeMa: ma(t), erroMa: ma(erroIdade(Ns, Ni, t, d.zetaErroRel, d.nd)) }; });
export function resumoConjunto(graos, d = DADOS_PADRAO) {
    const chi = testeChi2(graos), pooled = idadePooled(graos, d.zeta, d.rhod, d.zetaErroRel, d.nd), central = idadeCentral(graos, d.zeta, d.rhod, d.zetaErroRel);
    return { n: graos.length, sNs: graos.reduce((a, x) => a + x[0], 0), sNi: graos.reduce((a, x) => a + x[1], 0), chi2: chi.chi2, gl: chi.df, p: chi.p, homogeneo: chi.p > 0.05, pooledMa: ma(pooled.idade), pooledErroMa: ma(pooled.erro), centralMa: ma(central.idade), centralErroMa: ma(central.erro), dispersao: central.dispersao };
}
export const zetaCalculado = (d = DADOS_PADRAO) => zetaDoPadrao(d.padrao.tMa * 1e6, d.padrao.razao, d.rhod);
export const resumoComprimentos = (lista) => ({ ...estatisticaComprimentos(lista), hist: histograma(lista, 1, 7, 17) });
export { idadeZeta, LAMBDA_D, G_EDM };
