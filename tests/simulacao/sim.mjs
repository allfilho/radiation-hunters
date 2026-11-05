// Simulação de jogabilidade do Geiger (modelo atual x proposto) sobre os mapas reais.
import { MAPAS, P, arg, prepara, taxaAtual, taxaNova, jogar, semeia } from './lib.mjs';
const saida = {};
for (const modelo of ['atual', 'novo']) {
  for (const mapa of MAPAS) {
    for (let rp = 0; rp < P.reps; rp++) {
      semeia(mapa.semente * 100 + mapa.missao * 7 + rp);
      const g = prepara(mapa); g.srcs.forEach(s => { s.found = false; });
      // 'base' do jogo para o modelo atual vem do mapa extraído; tipos pt: alfa/beta/gama
      const r = jogar(g, modelo === 'atual' ? taxaAtual : taxaNova, modelo === 'novo');
      const k = modelo + '|' + mapa.missao; (saida[k] ??= []).push({ ...r, tl: mapa.tl, n: mapa.n });
    }
  }
}
const med = a => a.reduce((x, y) => x + y, 0) / a.length;
const q = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
console.log(`identificação corrigida (superfície ≤1 tile): ${P.corrigeIdent}`);
console.log(`parâmetros: tile=${P.tileM}m parede=${P.wallCm}cm pisoGama=${P.gamaPiso} kG=${P.kG} kB=${P.kb ?? P.kB} alfaR=${P.alfaR}tile reps=${P.reps}`);
console.log('missão | modelo | n | tempo p/ achar TODAS (s): mediana / p90 | % corridas que acham todas em ≤ limite (ou 900 s se sem limite) | tempo p/ 1ª fonte (mediana)');
for (let m = 1; m <= 8; m++) for (const mod of ['atual', 'novo']) {
  const rs = saida[mod + '|' + m]; const tl = rs[0].tl || 900;
  const tT = rs.map(r => r.achado.length === r.total ? r.t : 999);
  const ok = rs.filter(r => r.achado.length === r.total && r.t <= tl).length / rs.length;
  const t1 = rs.map(r => r.achado[0] ?? 999);
  console.log(`  ${m} | ${mod.padEnd(5)} | ${rs[0].n} | ${q(tT, .5).toFixed(0).padStart(4)} / ${q(tT, .9).toFixed(0).padStart(4)} | ${(100 * ok).toFixed(0).padStart(3)}% (limite ${tl}) | ${q(t1, .5).toFixed(0)}`);
}

if (arg.falt) { const c = {}; for (const [k, rs] of Object.entries(saida)) if (k.startsWith(arg.falt)) for (const r of rs) for (const f of r.falt) c[k + ' ' + f] = (c[k + ' ' + f] || 0) + 1; console.log('NÃO achadas (contagem de corridas):'); console.log(c); }
if (arg.resumo) { for (const mod of ['atual', 'novo']) { if (arg.so && arg.so !== mod) continue; const meds = [], oks = [], t1 = []; for (let m = 1; m <= 8; m++) { const rs = saida[mod + '|' + m]; const tl = rs[0].tl || 900; meds.push(q(rs.map(r => r.achado.length === r.total ? r.t : 999), .5)); oks.push(rs.filter(r => r.achado.length === r.total && r.t <= tl).length / rs.length); t1.push(q(rs.map(r => r.achado[0] ?? 999), .5)); }
  console.log(`${arg.resumo.padEnd(34)} ${mod.padEnd(5)} mediana tempo-tudo (média das 8 missões)=${med(meds).toFixed(0)}s  pior missão=${Math.max(...meds).toFixed(0)}s  1ª fonte=${med(t1).toFixed(0)}s  ok-no-limite=${(100 * med(oks)).toFixed(0)}%`); } }
