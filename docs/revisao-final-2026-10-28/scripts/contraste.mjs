// Razão de contraste WCAG 2.x entre pares de cores (revisão final 28/10/2026). Uso: node contraste.mjs
const lum = (h) => { const c = h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pares = process.argv.slice(2).length ? [process.argv.slice(2)] : [
  ['#7b2cbf', '#151520', 'rótulo gama na identificação (--accent sobre --surface)'],
  ['#7b2cbf', '#1e1e2e', 'rótulo gama sobre --surface-light'],
  ['#ffcc00', '#151520', 'rótulo alfa'], ['#72b5ff', '#151520', 'rótulo beta'],
  ['#888899', '#151520', '--text-muted sobre --surface'],
  ['#8a5d00', '#fffaf0', 'ficha: alfa'], ['#1f63b0', '#fffaf0', 'ficha: beta'], ['#a12fd6', '#fffaf0', 'ficha: gama'],
  ['#5f5230', '#fffaf0', 'ficha: tinta-2'], ['#aab1c4', '#1a1d25', 'cofre: texto mudo sobre metal'], ['#8a92a8', '#1a1d25', 'cofre: .cf-vazio'],
  ['#ca4ff9', '#1a1d25', 'cofre: letra gama'], ['#eebb40', '#1a1d25', 'cofre: letra alfa'],
];
for (const [a, b, r] of pares) console.log(`${cr(a, b).toFixed(2)}:1  ${a} / ${b}  ${r || ''}`);
