// Etapa 5: o terreno é pintado com semente fixa (mesma missão = mesma imagem), as paredes continuam
// bloqueando, e a câmera preenche a tela. Limitação declarada: a comparação é por hash do canvas
// gerado por pintarTerreno, não por captura de tela.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

test('drawMap não usa Math.random (aspecto estável entre partidas)', () => {
  const src = fs.readFileSync(path.join(RAIZ_JOGO, 'js/scenes/GameScene.js'), 'utf8');
  const ini = src.indexOf('drawMap() {'), fim = src.indexOf('placeSources() {');
  assert.ok(ini > 0 && fim > ini);
  assert.ok(!src.slice(ini, fim).includes('Math.random('));
  const ter = fs.readFileSync(path.join(RAIZ_JOGO, 'js/render/terreno.js'), 'utf8');
  assert.ok(!ter.includes('Math.random('));
});

async function hashTextura(pg) {
  return pg.evaluate(() => {
    const c = window.gameScene.textures.get('terreno').getSourceImage();
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let h = 2166136261;
    for (let i = 0; i < d.length; i += 7) h = Math.imul(h ^ d[i], 16777619) >>> 0;
    return { h, w: c.width, hh: c.height };
  });
}

test('mesma missão gera o mesmo terreno; missões diferentes geram terrenos diferentes', async () => {
  const hs = {};
  for (const [rotulo, id] of [['a', 2], ['b', 2], ['c', 5]]) {
    const { pg, ctx } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true });
    await iniciarMissao(pg, id);
    hs[rotulo] = await hashTextura(pg);
    hs[rotulo].dim = await pg.evaluate(() => ({ c: window.gameScene.mapCols, r: window.gameScene.mapRows }));
    await ctx.close();
  }
  assert.equal(hs.a.w, hs.a.dim.c * 32 * 2);   // o tamanho vem da missão (24×16 padrão; plantas maiores desde a v3.8)
  assert.equal(hs.a.hh, hs.a.dim.r * 32 * 2);
  assert.equal(hs.a.h, hs.b.h);
  assert.notEqual(hs.a.h, hs.c.h);
});

test('paredes bloqueiam, o mapa fica inteiro e centralizado na vista e o texto do móvel fica na tela', async () => {
  const { pg, ctx } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true });
  await iniciarMissao(pg, 1);
  const r = await pg.evaluate(() => {
    const s = window.gameScene, m = s.mapData.map;
    let paredes = 0, bloqueadas = 0;
    for (let y = 0; y < m.length; y++) for (let x = 0; x < m[y].length; x++)
      if (m[y][x] === 1) { paredes++; if (s.blockedTiles.some(t => t.x === x && t.y === y)) bloqueadas++; }
    const cam = s.cameras.main, tx = s.furnitureInfoText;
    // posição na tela de um objeto com scrollFactor 0: gira em torno do centro da câmera
    const sx = (tx.x - cam.width / 2) * cam.zoom + cam.width / 2;
    const sy = (tx.y - cam.height / 2) * cam.zoom + cam.height / 2;
    return { paredes, bloqueadas, zoom: cam.zoom, dpr: s.registry.get('dpr') || 1, cx: cam.midPoint.x, cy: cam.midPoint.y, sx, sy, esc: tx.scaleX * cam.zoom };
  });
  assert.ok(r.paredes > 0);
  assert.equal(r.paredes, r.bloqueadas);
  assert.ok(r.zoom / r.dpr >= 1);
  assert.ok(Math.abs(r.cx - 384) < 1 && Math.abs(r.cy - 256) < 1);
  assert.ok(Math.abs(r.sx - 20 * r.dpr) < 0.5 && Math.abs(r.sy - 82 * r.dpr) < 0.5);
  assert.ok(Math.abs(r.esc - r.dpr) < 1e-9);
  await ctx.close();
});
