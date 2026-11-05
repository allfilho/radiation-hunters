// Recalcula taxaFonte do I-131 antes (type beta) e depois (type gama, current/) — revisão final 28/10/2026.
// Uso: node calc-i131.mjs <caminho para current/js>
import path from 'node:path';
const J = path.resolve(process.argv[2] || '../../current/js');
const { taxaFonte } = await import(path.join(J, 'fisica/geiger.js'));
const { componentesDe } = await import(path.join(J, 'fisica/componentes.js'));
const { ISOTOPES } = await import(path.join(J, 'data/isotopes.js'));
const depois = ISOTOPES.find((i) => i.name === 'I-131');
const antes = { ...depois, type: 'beta', symbol: 'β', energyMeV: undefined, betaRangeMgCm2: 214 };
const bl = { nenhum: null, Al3: { material: 'aluminio', cm: 0.3 }, Acr5: { material: 'acrilico', cm: 0.5 }, Pb10: { material: 'chumbo', cm: 1.0 } };
const ctx = (b) => ({ tileM: 0.5, ehParede: () => false, paredeCm: 20, blindagem: b });
console.log('componentes antes:', JSON.stringify(componentesDe(antes)));
console.log('componentes depois:', JSON.stringify(componentesDe(depois)));
let maxRel = 0; const linhas = [];
for (const dM of [0.5, 1, 2]) for (const [k, b] of Object.entries(bl)) {
  const f = (iso) => taxaFonte({ type: iso.type, base: 220, x: dM / 0.5, y: 0, rect: { x: dM / 0.5, y: 0, w: 1, h: 1 }, componentes: componentesDe(iso) }, { x: 0, y: 0, dir: 0 }, ctx(b));
  const a = f(antes), d = f(depois), rel = Math.abs(d - a) / a;
  maxRel = Math.max(maxRel, rel);
  linhas.push(`| ${dM} m | ${k} | ${a.toFixed(2)} | ${d.toFixed(2)} | ${(100 * rel).toFixed(3)} % |`);
}
console.log('| d | blindagem | antes (cps) | depois (cps) | dif. |\n|---|---|---|---|---|\n' + linhas.join('\n'));
console.log('diferença máxima: ' + (100 * maxRel).toFixed(3) + ' %');
