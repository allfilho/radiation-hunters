// Assinatura por placa (fração que passa em Al 3 mm, acrílico 5 mm, Pb 10 mm) a 0,5 m, base mínima, ar livre,
// com e sem o fundo de 5 cps, e separação estatística numa janela de 3 s (Poisson). Revisão final 28/10/2026.
// Uso: node assinaturas.mjs <current/js>
import path from 'node:path';
const J = path.resolve(process.argv[2] || '../../current/js');
const G = await import(path.join(J, 'fisica/geiger.js'));
const C = await import(path.join(J, 'fisica/componentes.js'));
const { ISOTOPES } = await import(path.join(J, 'data/isotopes.js'));
const { MISSIONS } = await import(path.join(J, 'data/missoes/index.js'));
const { SHIELDS } = await import(path.join(J, 'data/shields.js'));
const todos = [...ISOTOPES, ...MISSIONS.map((m) => m.addIsotope).filter(Boolean)];
const iso = (n) => todos.find((i) => i.name === n);
const livre = { tileM: 0.5, paredeCm: 30, ehParede: () => false };
function taxas(nome, base = 'minBase') {
  const i = iso(nome);
  const f = { type: i.type, base: i[base], x: 10, y: 10, rect: { x: 9.5, y: 9.5, w: 1, h: 1 }, componentes: C.componentesDe(i) };
  return SHIELDS.map((s) => G.taxaFonte(f, { x: 9, y: 10, dir: 0 }, { ...livre, blindagem: s.material ? s : null }));
}
console.log('placas:', SHIELDS.map((s) => s.material ? s.material + ' ' + s.cm + ' cm' : 'nenhuma').join(' | '));
for (const n of ['Sr-90', 'P-32', 'I-131', 'Cs-137', 'Co-60', 'Ir-192', 'Tc-99m']) {
  const t = taxas(n), fr = t.map((v) => (v / t[0]).toFixed(3));
  console.log(n.padEnd(7), 'cps(min):', t.map((v) => v.toFixed(1)).join(' / '), ' frações:', fr.slice(1).join(' / '));
}
// pares dentro de cada missão (isótopos reais + extras)
const fundo = 5, T = 3;
console.log('\nPares por missão: maior diferença de fração e z-score na placa mais discriminante (janela 3 s, fundo 5 cps, base mínima e máxima)');
for (const m of MISSIONS) {
  const nomes = [...new Set([...(m.addIsotope ? [m.addIsotope.name] : m.allowedIsotopes), ...(m.candidatosExtras || [])])];
  for (let a = 0; a < nomes.length; a++) for (let b = a + 1; b < nomes.length; b++) {
    const A = nomes[a], B = nomes[b];
    const ta = taxas(A), tb = taxas(B);
    if (!(ta[0] > 0) || !(tb[0] > 0)) { console.log(`M${m.id} ${A} x ${B}: alfa por contato (separa pelo alcance)`); continue; }
    let melhor = { d: 0 };
    for (let k = 1; k < SHIELDS.length; k++) {
      // razão observada com fundo: (S_k+fundo)/(S_0+fundo); incerteza por propagação Poisson
      const r = (t) => (t[k] + fundo) / (t[0] + fundo);
      const sr = (t) => r(t) * Math.sqrt(1 / ((t[k] + fundo) * T) + 1 / ((t[0] + fundo) * T));
      const d = Math.abs(r(ta) - r(tb)), z = d / Math.hypot(sr(ta), sr(tb));
      if (d > melhor.d) melhor = { d, z, k };
    }
    console.log(`M${m.id} ${A} x ${B}: Δfração ${melhor.d.toFixed(3)} (placa ${SHIELDS[melhor.k].material}), z ≈ ${melhor.z.toFixed(1)}`);
  }
}
