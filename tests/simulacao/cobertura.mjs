// Área do mapa em que cada fonte é "audível" e em que o gradiente é legível (novo modelo), por tipo e escala.
const { P, prepara, taxaNova, taxaAtual, MAPAS } = await import('./lib.mjs');
function analisa(taxa, tileM, wallCm, W = 1) {
  P.tileM = tileM; P.wallCm = wallCm; const res = {};
  for (const m of MAPAS) { const g = prepara(m);
    for (const s0 of g.srcs) { g.srcs.forEach(s => s.found = true); s0.found = false;   // só esta fonte
      let walk = 0, aud = 0, grad = 0, audForaSala = 0, dmax = 0;
      for (let y = 0; y < 16; y++) for (let x = 0; x < 24; x++) { if (!g.walk(x, y)) continue; walk++;
        const dir = Math.atan2(s0.fy - (y + .5), s0.fx - (x + .5)); const r = taxa(g, x + .5, y + .5, dir);
        if (r * W >= 5 * W + 3 * Math.sqrt(5 * W)) { aud++; dmax = Math.max(dmax, Math.hypot(s0.fx - x - .5, s0.fy - y - .5) * tileM);
          // vizinho 1 tile mais perto
          let best = null; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!g.walk(nx, ny)) continue; const d1 = Math.hypot(s0.fx - nx - .5, s0.fy - ny - .5); if (!best || d1 < best.d) best = { d: d1, nx, ny }; }
          if (best && best.d < Math.hypot(s0.fx - x - .5, s0.fy - y - .5)) { const r2 = taxa(g, best.nx + .5, best.ny + .5, dir); if ((r2 - r) * W >= 2 * Math.sqrt((r + r2) / 2 * W)) grad++; } } }
      const k = s0.type; (res[k] ??= { n: 0, aud: 0, grad: 0, dmax: 0, walk: 0 }); const o = res[k]; o.n++; o.aud += aud / walk; o.grad += grad / walk; o.dmax += dmax; o.walk += walk; }
  }
  return Object.fromEntries(Object.entries(res).map(([k, o]) => [k, `audível ${(100 * o.aud / o.n).toFixed(1)}% do piso | gradiente legível em 1 s ${(100 * o.grad / o.n).toFixed(1)}% | alcance máx. médio ${(o.dmax / o.n).toFixed(1)} m`]));
}
const mostra = (rot, o) => console.log(rot + '\n   ' + Object.entries(o).map(([k, v]) => k + ': ' + v).join('\n   '));
mostra('ATUAL (janela 1 s)', analisa((g, x, y, d) => taxaAtual(g, x, y, d), 0.5, 30, 1));
for (const [kb, kg] of [[0.35, 0.2], [0.7, 0.2], [1.0, 0.3], [1.4, 0.3]]) for (const W of [1, 3]) { P.kB = kb; P.kG = kg; mostra(`NOVO tile=0.5 kB=${kb} kG=${kg} janela=${W}s`, analisa(taxaNova, 0.5, 30, W)); }
