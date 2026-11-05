// Simulação de jogabilidade do Geiger (modelo atual x proposto) sobre os mapas reais.
import fs from 'node:fs';
export const MAPAS = JSON.parse(fs.readFileSync(new URL('./mapas.json', import.meta.url)));
export const arg = Object.fromEntries(process.argv.slice(2).map(a => a.split('=')));
export const P = { tileM: +(arg.tile ?? 0.5), wallCm: +(arg.wall ?? 30), gamaPiso: +(arg.piso ?? 0.3), reps: +(arg.reps ?? 4),
  kG: +(arg.kg ?? 0.2), kB: +(arg.kb ?? 0.35), alfaR: +(arg.alfar ?? 1.0), corrigeIdent: arg.fixid==='1', vel: 4.7 * 0.8 /*tiles/s*/, limite: 900 };
const MU_CONC = { 'Tc-99m': .3443, 'Cs-137': .1812, 'Ir-192': .2313, 'Co-60': .1336 };      // /cm, seção 4
const R_BETA = { 'Sr-90': 1095, 'P-32': 791, 'I-131': 214 };                                   // mg/cm2 (Y-90 p/ Sr-90)
// RNG
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = rng(1);
function pois(l) { if (l <= 0) return 0; if (l > 60) { return Math.max(0, Math.round(l + Math.sqrt(l) * (Math.sqrt(-2 * Math.log(1 - R())) * Math.cos(2 * Math.PI * R())))); } const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; }
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };

export function prepara(m) {
  const wall = (x, y) => m.map[y]?.[x] === 1;
  const bloq = new Set(m.blocked.map(b => b.x + ',' + b.y));
  const walk = (x, y) => x >= 0 && y >= 0 && x < 24 && y < 16 && !bloq.has(x + ',' + y);
  const srcs = m.furn.filter(f => f.src).map(f => ({ ...f.src, fx: f.cx / 32, fy: f.cy / 32, rx: f.x, ry: f.y, rw: f.w || 1, rh: f.h || 1, found: false }));
  return { m, wall, walk, srcs, furn: m.furn };
}
function paredesNoRaio(g, x0, y0, x1, y1) { // nº de tiles de parede atravessados (amostragem fina)
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.05), vis = new Set();
  for (let i = 0; i <= n; i++) { const x = Math.floor(x0 + (x1 - x0) * i / n), y = Math.floor(y0 + (y1 - y0) * i / n); if (g.wall(x, y)) vis.add(x + ',' + y); }
  return vis.size;
}
function distSuperficie(s, px, py) { const dx = Math.max(s.rx - px, 0, px - (s.rx + s.rw)), dy = Math.max(s.ry - py, 0, py - (s.ry + s.rh)); return Math.hypot(dx, dy); }

// taxa esperada (cps) na posição (px,py) em tiles, olhando na direção 'dir'
export function taxaAtual(g, px, py, dir) {            // reprodução de GameScene.measureRadiation
  let tot = 0;
  for (const s of g.srcs) { if (s.found) continue; const d = Math.hypot(s.fx - px, s.fy - py);
    if (angDiff(Math.atan2(s.fy - py, s.fx - px), dir) > Math.PI / 4) continue;
    if (paredesNoRaio(g, px, py, s.fx, s.fy) > 0) continue;
    let r = s.base; if (s.type === 'alfa') r *= d < 1.2 ? 1 : 0; else if (s.type === 'beta') r *= d < 3 ? 1 - d * .2 : .1; else r *= Math.max(.1, 1 - d * .1);
    tot += Math.round(r); }
  return 5 + 0 * tot + tot;
}
export function taxaNova(g, px, py, dir) {
  let tot = 0;
  for (const s of g.srcs) { if (s.found) continue;
    const dm = Math.max(Math.hypot(s.fx - px, s.fy - py) * P.tileM, 0.25);
    const th = angDiff(Math.atan2(s.fy - py, s.fx - px), dir), nw = paredesNoRaio(g, px, py, s.fx, s.fy);
    let r = 0;
    if (s.type === 'gama') { const mu = MU_CONC[s.name] ?? .2; r = P.kG * s.base / (dm * dm) * Math.exp(-mu * P.wallCm * nw) * (th <= Math.PI / 4 ? 1 : P.gamaPiso); }
    else if (s.type === 'beta') { if (nw > 0 || th > Math.PI / 4) continue; const T = Math.max(0, 1 - 1.205 * dm * 100 / (R_BETA[s.name] ?? 500)); r = P.kB * s.base * (0.5 / dm) ** 2 * T * Math.cos(th) ** 2; }
    else { if (nw > 0 || th > Math.PI / 4) continue; const ds = distSuperficie(s, px, py); r = ds <= P.alfaR ? s.base * (1 - ds / P.alfaR) * Math.cos(th) ** 2 : 0; }
    tot += r; }
  return 5 + tot;
}

// BFS
function caminho(g, a, b) {
  const key = (x, y) => y * 24 + x, prev = new Map([[key(a[0], a[1]), null]]), q = [a];
  while (q.length) { const [x, y] = q.shift(); if (x === b[0] && y === b[1]) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = x + dx, ny = y + dy; if (!g.walk(nx, ny) || prev.has(key(nx, ny))) continue; if (dx && dy && (!g.walk(x + dx, y) || !g.walk(x, y + dy))) continue; prev.set(key(nx, ny), [x, y]); q.push([nx, ny]); } }
  if (!prev.has(key(b[0], b[1]))) return null; const out = []; let c = b; while (c) { out.push(c); c = prev.get(key(c[0], c[1])); } return out.reverse();
}

export function jogar(g, taxa, modeloNovo) {
  // pontos de exploração: reticulado de 2 tiles + pontos ao lado de cada móvel
  let passe = 0; const alvos = []; const insp = []; for (let y = 1; y < 16; y += 2) for (let x = 1; x < 24; x += 2) if (g.walk(x, y)) alvos.push([x, y]);
  for (const f of g.furn) { const w = f.w || 1, h = f.h || 1; for (const [dx, dy] of [[-1, 0], [w, 0], [0, -1], [0, h]]) { const x = f.x + dx, y = f.y + dy; if (g.walk(x, y)) { alvos.push([x, y]); insp.push([x, y]); break; } } }
  let pos = [Math.floor(g.m.start[0] / 32), Math.floor(g.m.start[1] / 32)], t = 0, dir = 0; const achado = []; const vis = [];
  const IDF = 1.5, LIM = modeloNovo ? 12 : 11;   // gatilho: contagens em 1 s (novo) / leitura > 10 (atual: exibe por amostra)
  function mede(p, d, dur) { // retorna contagem escalada a "por segundo"
    if (modeloNovo) return pois(taxa(g, p[0] + .5, p[1] + .5, d) * dur) / dur;
    return taxa(g, p[0] + .5, p[1] + .5, d) - 5 + pois(5);   // atual: soma + Poisson do fundo
  }
  function verifica() { for (const s of g.srcs) if (!s.found && (P.corrigeIdent ? distSuperficie(s, pos[0] + .5, pos[1] + .5) <= 1.0 : Math.hypot(s.fx - pos[0] - .5, s.fy - pos[1] - .5) - 0.19 <= IDF)) { s.found = true; achado.push(t); t += 3; } }
  function vai(dest) { const c = caminho(g, pos, dest); if (!c) return false; for (let i = 1; i < c.length; i++) { dir = Math.atan2(c[i][1] - c[i - 1][1], c[i][0] - c[i - 1][0]); t += Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]) / P.vel; pos = c[i]; if (modeloNovo || true) { verifica(); } } return true; }
  const limiar = (dur) => modeloNovo ? 5 + 3 * Math.sqrt(5 / dur) : 11;
  while (t < P.limite && achado.length < g.srcs.length) {
    // próximo alvo: o mais próximo ainda não coberto
    let melhor = null, bd = 1e9; for (const a of (passe ? insp : alvos)) { if (vis.some(v => Math.hypot(v[0] - a[0], v[1] - a[1]) < (passe ? 0.6 : 1.5))) continue; const d = Math.hypot(a[0] - pos[0], a[1] - pos[1]); if (d < bd) { bd = d; melhor = a; } }
    if (!melhor) { vis.length = 0; passe = 1; continue; }
    if (!vai(melhor)) { vis.push(melhor); continue; }
    vis.push(pos);
    // varredura: 4 direções x 0,5 s
    let disparo = false, dd = dir;
    for (let k = 0; k < 4 && !disparo; k++) { const d = k * Math.PI / 2; t += .5; if (mede(pos, d, .5) >= limiar(.5)) { disparo = true; dd = d; } }
    verifica();
    if (!disparo) continue;
    // subida de gradiente
    dir = dd; let prev = mede(pos, dir, 1); t += 1; let falhas = 0, passos = 0;
    while (falhas < 10 && passos < 60 && t < P.limite && achado.length < g.srcs.length) {
      let ok = false; const cand = [];
      for (const off of [0, 1, -1, 2, -2, 3, -3, 4]) { const a = dir + off * Math.PI / 4; cand.push([Math.round(Math.cos(a)), Math.round(Math.sin(a)), a]); }
      for (const [dx, dy, a] of cand) { const n = [pos[0] + dx, pos[1] + dy]; if (!g.walk(n[0], n[1]) || (dx && dy && (!g.walk(pos[0] + dx, pos[1]) || !g.walk(pos[0], pos[1] + dy)))) continue;
        const ant = pos; pos = n; dir = a; t += Math.hypot(dx, dy) / P.vel; verifica(); const m = mede(pos, dir, 1); t += 1; passos++;
        if (m >= prev) { prev = m; ok = true; falhas = 0; break; } pos = ant; t += Math.hypot(dx, dy) / P.vel; falhas++; if (falhas >= 10) break; }
      if (!ok) break;
      if (achado.length === g.srcs.length) break;
    }
    verifica();
  }
  return { achado, t, total: g.srcs.length, falt: g.srcs.filter(x=>!x.found).map(x=>x.type+':'+x.name+'@'+(x.rw)+'x'+(x.rh)) };
}


export function semeia(n) { R = rng(n); }
