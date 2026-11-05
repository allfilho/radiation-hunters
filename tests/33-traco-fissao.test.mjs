// Cálculos do traço de fissão (EDM): conferidos contra ft_lib.py da skill de termocronologia (valores gerados com os mesmos dados).
// Dados de teste: exemplo_graos.csv (12 grãos), exemplo_comprimentos.csv (20 comprimentos), ζ = 350, ρd = 1,2e6; ver README da skill.
import test from 'node:test';
import assert from 'node:assert/strict';
import { idadeZeta, idadeJovem, idadeGrao, erroIdade, idadePooled, testeChi2, idadeCentral, zetaDoPadrao, estatisticaComprimentos, histograma, chi2Sf, LAMBDA_D } from '../current/js/investigacao/traco-fissao.js';

const G = [[12, 45], [8, 31], [15, 52], [20, 68], [6, 25], [11, 40], [18, 60], [9, 35], [14, 49], [22, 71], [7, 28], [13, 44]];
const G2 = [[2, 40], [30, 30], [10, 50], [25, 20], [5, 45], [40, 15], [8, 30], [20, 25]];
const L = [14.2, 15.1, 13.8, 14.6, 15.3, 14.0, 13.5, 14.9, 15.0, 14.4, 13.9, 14.7, 15.2, 14.1, 14.8, 13.6, 14.3, 15.4, 14.5, 14.0];
const perto = (a, b, rel = 1e-9) => assert.ok(Math.abs(a - b) <= Math.abs(b) * rel + 1e-12, `${a} ≠ ${b}`);

test('constante e idade de um grão e do conjunto reproduzem a skill', () => {
    assert.equal(LAMBDA_D, 1.55125e-10);
    perto(idadeGrao(12, 45, 350, 1.2e6), 55758163.54630196);
    perto(erroIdade(12, 45, idadeGrao(12, 45, 350, 1.2e6), 10 / 350, 5000), 18202447.167066067);
    const p = idadePooled(G, 350, 1.2e6, 10 / 350, 5000);
    perto(p.idade, 59125831.38788993); perto(p.erro, 5699667.876901031);
});

test('teste χ², p-valor e idade central (homogêneo e sobredisperso) reproduzem a skill', () => {
    const c = testeChi2(G); perto(c.chi2, 0.6106893431042147); assert.equal(c.df, 11); perto(c.p, 0.9999960619910231, 1e-6);
    const m = idadeCentral(G, 350, 1.2e6, 10 / 350);
    perto(m.idade, 60262364.03390821, 1e-7); perto(m.erro, 4569691.712648272, 1e-7); assert.ok(m.dispersao < 1e-6);
    const c2 = testeChi2(G2); perto(c2.chi2, 92.62967805410308); assert.ok(c2.p < 1e-10);
    const m2 = idadeCentral(G2, 350, 1.2e6, 0); perto(m2.idade, 114625878.87054375, 1e-7); perto(m2.dispersao, 0.9703220894166001, 1e-7);
    for (const [x, d, esperado] of [[3, 5, 0.6999858358786275], [20, 11, 0.045340674434060424], [0.5, 2, 0.7788007830714049]]) perto(chi2Sf(x, d), esperado, 1e-9);
    perto(chi2Sf(45, 11), 4.852175800929004e-06, 1e-6);
});

test('ζ do padrão, aproximação para idades jovens e estatística de comprimentos', () => {
    perto(zetaDoPadrao(28.2e6, 0.30e6 / 1.05e6, 1.2e6), 164.86032991372366);
    // ida e volta: com o ζ obtido, a razão do padrão devolve 28,2 Ma
    perto(idadeZeta(0.30e6 / 1.05e6, zetaDoPadrao(28.2e6, 0.30e6 / 1.05e6, 1.2e6), 1.2e6) / 1e6, 28.2);
    // idade jovem: λD·t pequeno → t ≈ ½·ζ·ρd·(Ns/Ni), diferença relativa pequena para ~28 Ma
    const razao = 0.3 / 1.05, exata = idadeZeta(razao, 165, 1.2e6), aprox = idadeJovem(razao, 165, 1.2e6);
    assert.ok(Math.abs(exata - aprox) / exata < 0.01);
    const s = estatisticaComprimentos(L); perto(s.media, 14.465); perto(s.sd, 0.5751658799630627); perto(s.mediana, 14.45); assert.equal(s.n, 20);
    assert.equal(histograma(L, 1, 13, 17).reduce((a, [, v]) => a + v, 0), 20);
    // grão sem traços espontâneos: correção de +½ evita idade zero ou erro infinito
    assert.ok(idadeGrao(0, 40, 350, 1.2e6) > 0 && Number.isFinite(erroIdade(0, 40, 1, 0)));
});
