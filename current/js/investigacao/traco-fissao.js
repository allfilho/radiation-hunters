// ============================================
// CÁLCULOS DO MÉTODO DO TRAÇO DE FISSÃO (detector externo, EDM) — portado de ft_lib.py da skill de termocronologia.
// Fontes: Hurford & Green (1983), forma zeta; Galbraith (2005); Galbraith & Laslett (1993), idade central;
// Vermeesch (2018, cap. 6 em Malusà & Fitzgerald 2019); λD = 1,55125×10⁻¹⁰ ano⁻¹ (Jaffey et al. 1971).
// Uso: ensino com dados FICTÍCIOS. Para resultados de publicação, validar com o IsoplotR (Vermeesch 2018).
// Convenções: Ns, Ni = traços espontâneos/induzidos por grão; rhod = ρd (traços/cm²) no vidro dosímetro;
// zeta = ζ (ano·cm²); g = 0,5 no EDM; idades em ANOS (use /1e6 para Ma).
// ============================================
export const LAMBDA_D = 1.55125e-10;
export const G_EDM = 0.5;

function lgamma(x) { // Lanczos (g=7, n=9)
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1; let a = c[0]; const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function gammaincLower(s, x) {
    if (x < 0 || s <= 0) throw new Error('parâmetros inválidos');
    if (x === 0) return 0;
    if (x < s + 1) {
        let ap = s, sum = 1 / s, term = sum;
        for (let i = 0; i < 1000; i++) { ap += 1; term *= x / ap; sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-15) break; }
        return sum * Math.exp(-x + s * Math.log(x) - lgamma(s));
    }
    let b = x + 1 - s, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 1000; i++) {
        const an = -i * (i - s); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
        c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const delta = d * c; h *= delta; if (Math.abs(delta - 1) < 1e-15) break;
    }
    return 1 - Math.exp(-x + s * Math.log(x) - lgamma(s)) * h;
}
/** P(χ² ≥ x) para df graus de liberdade. */
export const chi2Sf = (x, df) => (x <= 0 ? 1 : 1 - gammaincLower(df / 2, x / 2));

/** t = (1/λD)·ln[1 + λD·g·ζ·ρd·(ρs/ρi)]  (Hurford & Green 1983). Entrada: razão ρs/ρi = Ns/Ni na mesma área. */
export const idadeZeta = (razao, zeta, rhod, g = G_EDM, lam = LAMBDA_D) => (1 / lam) * Math.log(1 + lam * g * zeta * rhod * razao);
/** Aproximação para idades jovens (λD·x ≪ 1): t ≈ ½·ζ·ρd·(ρs/ρi) com g = 0,5. */
export const idadeJovem = (razao, zeta, rhod, g = G_EDM) => g * zeta * rhod * razao;
/** Idade de um grão; se Ns ou Ni for zero, usa Ns+½ e Ni+½ (Galbraith 2005, p. 80). */
export function idadeGrao(Ns, Ni, zeta, rhod, g = G_EDM) { const zero = Ns === 0 || Ni === 0; return idadeZeta((zero ? Ns + 0.5 : Ns) / (zero ? Ni + 0.5 : Ni), zeta, rhod, g); }
/** Erro 1σ da idade: σ[t]/t ≈ √[(σζ/ζ)² + 1/Ns + 1/Ni + 1/Nd] (Vermeesch 2018, Eq. 6.8). */
export function erroIdade(Ns, Ni, idade, zetaErroRel = 0, Nd = null) {
    const s = Ns === 0 ? 0.5 : Ns, i = Ni === 0 ? 0.5 : Ni; let v = zetaErroRel ** 2 + 1 / s + 1 / i; if (Nd) v += 1 / Nd; return idade * Math.sqrt(v);
}
export function idadePooled(graos, zeta, rhod, zetaErroRel = 0, Nd = null, g = G_EDM) {
    const sNs = graos.reduce((a, x) => a + x[0], 0), sNi = graos.reduce((a, x) => a + x[1], 0), idade = idadeZeta(sNs / sNi, zeta, rhod, g);
    return { idade, erro: erroIdade(sNs, sNi, idade, zetaErroRel, Nd) };
}
/** Teste χ² de homogeneidade (Galbraith 1981): p > 0,05 → idade única (pooled); p < 0,05 → sobredispersão (idade central). */
export function testeChi2(graos) {
    const sNs = graos.reduce((a, x) => a + x[0], 0), sNi = graos.reduce((a, x) => a + x[1], 0), theta = sNs / (sNs + sNi); let chi2 = 0;
    for (const [Ns, Ni] of graos) { const m = Ns + Ni; if (!m) continue; chi2 += (Ns - m * theta) ** 2 / (m * theta) + (Ni - m * (1 - theta)) ** 2 / (m * (1 - theta)); }
    const df = graos.length - 1; return { chi2, df, p: df > 0 ? chi2Sf(chi2, df) : NaN, n: graos.length };
}
/** Idade central e dispersão (Galbraith & Laslett 1993), algoritmo iterativo. */
export function idadeCentral(graos, zeta, rhod, zetaErroRel = 0, g = G_EDM, tol = 1e-10, maxIter = 1000) {
    const ys = graos.map((x) => x[0]), ms = graos.map((x) => x[0] + x[1]), n = graos.length; let theta = ys.reduce((a, b) => a + b, 0) / ms.reduce((a, b) => a + b, 0), sigma = 0.15, sw = 0;
    for (let it = 0; it < maxIter; it++) {
        const w = ms.map((m) => { const d = theta * (1 - theta) + (m - 1) * theta ** 2 * (1 - theta) ** 2 * sigma ** 2; return d > 0 ? m / d : 0; });
        sw = w.reduce((a, b) => a + b, 0);
        let num = 0; for (let j = 0; j < n; j++) num += w[j] ** 2 * (ys[j] / ms[j] - theta) ** 2;
        const s2 = sw > 0 ? sigma ** 2 * (num / sw) : 0;
        let a = 0, b = 0; for (let j = 0; j < n; j++) { a += w[j] * ys[j]; b += w[j] * ms[j]; }
        const thetaNovo = a / b, sigmaNovo = Math.sqrt(Math.max(s2, 0));
        const fim = Math.abs(thetaNovo - theta) < tol && Math.abs(sigmaNovo - sigma) < tol;
        theta = thetaNovo; sigma = sigmaNovo; if (fim) break;
    }
    const idade = idadeZeta(theta / (1 - theta), zeta, rhod, g), seRel = sw > 0 ? Math.sqrt(1 / sw) / theta : NaN;
    return { idade, erro: idade * Math.sqrt(seRel ** 2 + zetaErroRel ** 2), dispersao: sigma, theta, n };
}
/** ζ a partir de um padrão de idade conhecida: ζ = [exp(λD·t) − 1] / [λD·g·ρd·(ρs/ρi)]. tPadraoAnos em anos. */
export const zetaDoPadrao = (tPadraoAnos, razao, rhod, g = G_EDM, lam = LAMBDA_D) => (Math.exp(lam * tPadraoAnos) - 1) / (lam * g * rhod * razao);
/** Estatística descritiva de comprimentos de traço confinado (µm). */
export function estatisticaComprimentos(c) {
    const n = c.length, media = c.reduce((a, b) => a + b, 0) / n, sd = n > 1 ? Math.sqrt(c.reduce((a, x) => a + (x - media) ** 2, 0) / (n - 1)) : 0, s = [...c].sort((a, b) => a - b);
    return { n, media, sd, se: sd / Math.sqrt(n), mediana: n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2, min: s[0], max: s[n - 1] };
}
export function histograma(c, largura = 1, lo = 0, hi = 20) {
    const nb = Math.round((hi - lo) / largura), cont = new Array(nb).fill(0);
    for (const x of c) { const k = Math.floor((x - lo) / largura); if (k >= 0 && k < nb) cont[k]++; }
    return cont.map((v, i) => [lo + i * largura, v]);
}
