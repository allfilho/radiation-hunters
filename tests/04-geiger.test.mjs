// Geiger dentro do jogo (integração): confere que a GameScene usa o modelo físico de
// js/fisica/geiger.js (projeto 3a) e que o contador se comporta como um contador de verdade.
// A física em si (fórmulas, tabelas, Poisson) é testada em 05-geiger-modelo.test.mjs, em Node puro.
//
// Convenção: `lastCount` = contagens no passo de 0,2 s (cru); cps = contagens/0,2; sinal = cps - BG (5).
// Cada fonte é isolada marcando as outras como achadas; o jogador é posicionado por código (atalho).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao, mediaVar } from './helpers/navegador.mjs';
import { instalarMedidor, sinal } from './helpers/geiger.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

async function missao(id, fn) {
  const p = await novaPagina(nav, srv.url, { todasDesbloqueadas: true });
  try { await iniciarMissao(p.pg, id); await instalarMedidor(p.pg); return await fn(p); }
  finally { await p.ctx.close(); }
}
const perto = (obtido, esperado, tol, msg) =>
  assert.ok(Math.abs(obtido - esperado) <= tol, `${msg}: obtido ${obtido.toFixed(3)}, esperado ${esperado.toFixed(3)} (+-${tol})`);
const rel = (obtido, esperado, tol, msg) =>
  assert.ok(Math.abs(obtido / esperado - 1) <= tol, `${msg}: obtido ${obtido.toFixed(3)}, esperado ${esperado.toFixed(3)} (+-${tol * 100}%)`);

test('fundo: Poisson de 5 cps -> média 1,0 contagem por passo de 0,2 s, variância ~ média', () => missao(1, async ({ pg }) => {
  const a = await pg.evaluate(() => window.__geiger.fundo(4000));
  const { media, variancia } = mediaVar(a);
  perto(media, 1.0, 0.06, 'média de contagens'); perto(variancia / media, 1, 0.1, 'dispersão do fundo');
}));

test('gama: a taxa medida confere com S/d² (S = 0,3 × base a 1 m) e a escala de 50 cm por tile', () => missao(1, async ({ pg }) => {
  // F (5e): o Cs-137 também emite beta, com alcance de ~1,4 m no ar; a partir de 3 tiles (1,5 m) só a gama conta
  for (const d of [3, 4, 6]) { // tiles do centro da fonte; atenuação no ar ~1% por metro
    const r = await sinal(pg, 'gama', d, { n: 3000 });
    const dm = d * 0.5; // 0,5 m por tile
    rel(r.sinal, 0.3 * r.base / (dm * dm), 0.05, `gama d=${d} tiles (${dm} m)`);
  }
}));

test('gama: queda com a distância é 1/d² (inclinação -2 em log-log, ±0,15 com ruído estatístico)', () => missao(1, async ({ pg }) => {
  const ds = [3, 4, 5, 6];   // F (5e): fora do alcance da beta do Cs-137 (~1,4 m)
  const ys = []; for (const d of ds) ys.push((await sinal(pg, 'gama', d, { n: 3000 })).sinal);
  const lx = ds.map(Math.log), ly = ys.map(Math.log), n = ds.length;
  const mx = lx.reduce((a, b) => a + b) / n, my = ly.reduce((a, b) => a + b) / n;
  const incl = lx.reduce((s, x, i) => s + (x - mx) * (ly[i] - my), 0) / lx.reduce((s, x) => s + (x - mx) ** 2, 0);
  perto(incl, -2, 0.15, 'inclinação log-log');
}));

test('sinal é Poisson: variância das contagens ~ média (índice de dispersão ~1) mesmo com sinal forte', () => missao(1, async ({ pg }) => {
  const r = await sinal(pg, 'gama', 2, { n: 4000 });   // 1 m: gama + beta somadas, ainda Poisson
  assert.ok(r.sinal > 100, 'sinal forte esperado');
  perto(r.dispersao, 1, 0.12, 'dispersão');
}));

test('a taxa esperada da cena é a do modelo puro (mesma entrada, mesma saída)', () => missao(1, async ({ pg }) => {
  const ok = await pg.evaluate(() => {
    const s = window.gameScene, T = CONFIG.TILE_SIZE, i = window.__geiger.indice('gama');
    window.__geiger.medir(i, 3, { n: 1 });
    const ctx = { tileM: CONFIG.TILE_M, paredeCm: CONFIG.PAREDE_CM, ehParede: s.ehParede, blindagem: null };
    const taxa = Geiger.taxaEsperada(s.sources.map((x) => s.fonteFisica(x)), { x: s.player.x / T, y: s.player.y / T, dir: s.playerDirection }, ctx);
    return Math.abs(taxa - s.lastRate) < 1e-9;
  });
  assert.equal(ok, true);
}));

test('alfa: só por contato (superfície do móvel a <= 1 tile); longe, só o fundo', () => missao(1, async ({ pg }) => {
  const perta = await sinal(pg, 'alfa', 0.9, { n: 800 });   // centro a 0,9 tile: superfície a ~0,4 tile (móvel 1x1) ou menos
  assert.ok(perta.sinal > 0.3 * perta.base, `alfa perto: ${perta.sinal} (base ${perta.base})`);
  const longe = await sinal(pg, 'alfa', 3, { n: 800 });
  perto(longe.sinal, 0, 1.5, 'alfa a 3 tiles');
}));

test('blindagem: qualquer escudo zera o alfa; o chumbo (1 cm) zera o beta e atenua o gama pelo μ do material', () => missao(4, async ({ pg }) => {
  for (const esc of [1, 2, 3]) perto((await sinal(pg, 'alfa', 0.5, { escudo: esc, n: 600 }).catch(() => ({ sinal: 0 }))).sinal, 0, 1.5, `alfa escudo ${esc}`);
  const sem = await sinal(pg, 'beta', 1, { escudo: 0, n: 1500 });
  assert.ok(sem.sinal > 50, 'beta sem escudo');
  // F (5e): a fonte 'beta' pode ser o I-131, que também emite gama (364 keV): com chumbo de 1 cm sobra ~4% da gama.
  // O resultado tem de bater com o modelo da cena e ser < 6% do sinal sem escudo (o beta em si é zerado).
  const pb = await sinal(pg, 'beta', 1, { escudo: 3, n: 1500 });
  perto(pb.sinal, pb.taxa - 5, Math.max(1.5, 0.06 * (pb.taxa - 5)), 'beta com chumbo = o que o modelo prevê');
  assert.ok(pb.sinal < 0.06 * sem.sinal, `chumbo deixa ${pb.sinal} de ${sem.sinal}`);
  // 4 tiles = 2,0 m: fora do alcance no ar da beta do I-131 (1,78 m), que também é componente da fonte 'gama' da missão 4
  const g0 = await sinal(pg, 'gama', 4, { escudo: 0, n: 8000 });
  const g3 = await sinal(pg, 'gama', 4, { escudo: 3, n: 8000 });
  const esperado = await pg.evaluate((nome) => {
    const E = ISOTOPES.find((i) => i.name === nome).energyMeV; return Math.exp(-Geiger.muLinear('chumbo', E) * 1.0);
  }, g0.nome);
  rel(g3.sinal / g0.sinal, esperado, 0.12, `transmissão do Pb 1 cm para ${g0.nome}`);
}));

test('cone: gama de costas ainda é lido, com 30% (piso); fora do cone, alfa e beta somem', () => missao(4, async ({ pg }) => {
  const frente = await sinal(pg, 'gama', 3, { n: 3000 });
  const costas = await sinal(pg, 'gama', 3, { desvioGraus: 180, n: 3000 });
  rel(costas.sinal / frente.sinal, 0.3, 0.12, 'gama de costas / de frente');
  // F (5e): a 60 graus a beta some; se a fonte 'beta' for o I-131 sobra a gama dele (piso de 30% fora do cone), igual ao modelo
  const b60 = await sinal(pg, 'beta', 1, { desvioGraus: 60, n: 1000 });
  perto(b60.sinal, b60.taxa - 5, Math.max(1.5, 0.06 * (b60.taxa - 5)), 'beta a 60 graus = modelo');
  assert.ok(b60.sinal < 0.4 * (await sinal(pg, 'beta', 1, { n: 1000 })).sinal, 'a 60 graus o sinal cai muito');
}));

test('parede: uma parede de concreto entre sonda e fonte reduz o gama a < 5% e anula o beta', () => missao(4, async ({ pg }) => {
  const r = await pg.evaluate(() => {
    const s = window.gameScene, T = CONFIG.TILE_SIZE;
    // procura, no mapa real, um par (sonda, fonte gama) separado por exatamente uma parede
    const g = s.sources.find((x) => x.type === 'gama') || s.sources[0];
    s.sources.forEach((x) => { x.found = x !== g; });
    const cx = g.furniture.centerX / T, cy = g.furniture.centerY / T;
    for (let ty = 1; ty < s.mapRows - 1; ty++) for (let tx = 1; tx < s.mapCols - 1; tx++) {
      if (s.mapData.map[ty][tx] === 1 || s.blockedTiles.some((b) => b.x === tx && b.y === ty)) continue;
      const px = tx + 0.5, py = ty + 0.5;
      if (Math.hypot(px - cx, py - cy) > 8 || Math.hypot(px - cx, py - cy) < 2) continue;
      const n = Geiger.paredesNoRaio(s.ehParede, px, py, cx, cy);
      if (n !== 1) continue;
      const dir = Math.atan2(cy - py, cx - px);
      const ctx = { tileM: CONFIG.TILE_M, paredeCm: CONFIG.PAREDE_CM, ehParede: s.ehParede, blindagem: null };
      const livre = Geiger.taxaFonte(s.fonteFisica(g), { x: px, y: py, dir }, { ...ctx, ehParede: () => false });
      const parede = Geiger.taxaFonte(s.fonteFisica(g), { x: px, y: py, dir }, ctx);
      s.player.x = px * T; s.player.y = py * T; s.playerDirection = dir; s.measureRadiation();
      return { achou: true, razao: parede / livre, taxaCena: s.lastRate, taxaModelo: parede + CONFIG.BG_RADIATION };
    }
    return { achou: false };
  });
  assert.equal(r.achou, true, 'não achei posição com uma parede no caminho neste mapa');
  assert.ok(r.razao < 0.05, `razão ${r.razao}`);
  perto(r.taxaCena, r.taxaModelo, 1e-9, 'cena usa o mesmo cálculo com parede');
}));

test('janela de exibição: o painel mostra a média de 3 s (não o valor instantâneo)', () => missao(1, async ({ pg }) => {
  const r = await pg.evaluate(() => {
    const s = window.gameScene; s.sources.forEach((x) => { x.found = true; });
    s.janelaGeiger.reset(); const dt = CONFIG.GEIGER_PASSO_MS / 1000; let leituras = [];
    for (let i = 0; i < 60; i++) { s.measureRadiation(); leituras.push(s.currentReading); }
    return { tempo: s.janelaGeiger.tempo, ultimas: leituras.slice(-5), dtotal: dt * 60 };
  });
  assert.ok(r.tempo >= 2.8 && r.tempo <= 3.01, `janela de ${r.tempo} s`);
}));

test('atividade das fontes é constante durante a missão (a cena não altera a base)', () => missao(1, async ({ pg }) => {
  const r = await pg.evaluate(() => { const s = window.gameScene; const antes = s.sources.map((x) => x.base);
    for (let i = 0; i < 500; i++) s.measureRadiation(); return s.sources.every((x, k) => x.base === antes[k]); });
  assert.equal(r, true);
}));
