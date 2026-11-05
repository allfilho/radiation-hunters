// Dica de localização das fontes: tempos, custo e interface. Projeto em js/encontros/dica.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';
import { nivelDicaAuto, descontoDeDicas, DICA_NIVEL1_S, DICA_NIVEL2_S, DICA_DESCONTO, DICA_DESCONTO_MAX } from '../current/js/encontros/dica.js';
import { aproveitamento } from '../current/js/encontros/aproveitamento.js';

test('dica (puro): nível 0 até DICA_NIVEL1_S, 1 até DICA_NIVEL2_S, depois 2; entradas inválidas = 0', () => {
  assert.equal(nivelDicaAuto(0), 0);
  assert.equal(nivelDicaAuto(DICA_NIVEL1_S - 0.1), 0);
  assert.equal(nivelDicaAuto(DICA_NIVEL1_S), 1);
  assert.equal(nivelDicaAuto(DICA_NIVEL2_S - 0.1), 1);
  assert.equal(nivelDicaAuto(DICA_NIVEL2_S), 2);
  assert.equal(nivelDicaAuto(NaN), 0);
  assert.equal(nivelDicaAuto(undefined), 0);
});

test('dica (puro): desconto = 2 por uso, teto 6, nunca negativo', () => {
  assert.equal(descontoDeDicas(0), 0);
  assert.equal(descontoDeDicas(1), DICA_DESCONTO);
  assert.equal(descontoDeDicas(2), 2 * DICA_DESCONTO);
  assert.equal(descontoDeDicas(50), DICA_DESCONTO_MAX);
  assert.equal(descontoDeDicas(-3), 0);
  assert.equal(descontoDeDicas('x'), 0);
});

test('aproveitamento: sem dicas nada muda; com dicas desconta, respeita o teto e nunca fica negativo', () => {
  const base = { precisao: 1, tempo: 100, meta: 100, creditos: [1, 1, 1], cofre: [1] };
  const a0 = aproveitamento(base);
  assert.equal(a0.total, 100); assert.equal(a0.dicas, undefined); assert.equal(a0.descontoDicas, undefined);
  const a1 = aproveitamento({ ...base, dicas: 1 });
  assert.equal(a1.total, 98); assert.equal(a1.dicas, 1); assert.equal(a1.descontoDicas, 2);
  assert.equal(aproveitamento({ ...base, dicas: 99 }).total, 100 - DICA_DESCONTO_MAX);
  assert.equal(aproveitamento({ ...base, precisao: 0, tempo: 0, creditos: [], cofre: [], dicas: 3 }).total, 0);
  assert.equal(aproveitamento({ ...base, semTempo: true, dicas: 1 }).total, 98);
});

async function comPagina(opcoes, fn) {
  const s = await servidor(); const nav = await abrirNavegador();
  try { const r = await novaPagina(nav, s.url, { idioma: 'pt', semEncontros: true, ...opcoes }); await fn(r); assert.deepEqual(r.erros, []); }
  finally { await nav.close(); await s.fechar?.(); }
}
const frames = (pg, n = 3) => pg.evaluate((k) => new Promise((ok) => { let i = 0; const f = () => (++i >= k ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

test('dica (jogo): 90 s → minimapa (grátis); 150 s → mapa e 1 cobrança; achar fonte zera; botão H pede e cobra uma vez por intervalo', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  const est = () => pg.evaluate(() => ({ n: window.gameScene.dica.nivel, usos: window.gameScene.dica.usos, btn: !document.getElementById('btn-dica').hidden }));
  assert.deepEqual(await est(), { n: 0, usos: 0, btn: true });
  await pg.evaluate(() => { window.gameScene.elapsedMs = 95000; }); await frames(pg);
  assert.deepEqual(await est(), { n: 1, usos: 0, btn: true });
  await pg.waitForFunction(() => document.getElementById('notification').classList.contains('show') && /minimapa/.test(document.getElementById('notification').textContent));
  await pg.evaluate(() => { window.gameScene.elapsedMs = 155000; }); await frames(pg);
  assert.deepEqual(await est(), { n: 2, usos: 1, btn: true });
  // Achar uma fonte é progresso: a dica some e o custo é do intervalo anterior
  await pg.evaluate(() => { const s = window.gameScene; s.sources[0].found = true; s.foundSources.push(s.sources[0]); });
  await frames(pg);
  assert.deepEqual(await est(), { n: 0, usos: 1, btn: true });
  // Pedir pelo botão: nível 2 na hora, 1 cobrança; pedir de novo no mesmo intervalo não cobra de novo
  await pg.click('#btn-dica'); await frames(pg);
  assert.deepEqual(await est(), { n: 2, usos: 2, btn: true });
  await pg.evaluate(() => { window.gameScene.elapsedMs += 9000; }); await frames(pg);
  assert.equal((await est()).n, 0);
  await pg.click('#btn-dica'); await frames(pg);
  assert.deepEqual(await est(), { n: 2, usos: 2, btn: true });
  // Com todas as fontes achadas não há o que mostrar
  await pg.evaluate(() => { const s = window.gameScene; for (const x of s.sources) { x.found = true; } s.dica.pedidaAteMs = 0; }); await frames(pg);
  assert.equal((await est()).n, 0);
}));

test('dica (jogo): showHints desligado cala a dica automática, mas o botão continua valendo; relógio parado em encontro não conta', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.evaluate(() => { GameState.settings.showHints = false; window.gameScene.elapsedMs = 200000; }); await frames(pg);
  assert.equal(await pg.evaluate(() => window.gameScene.dica.nivel), 0);
  await pg.click('#btn-dica'); await frames(pg);
  assert.equal(await pg.evaluate(() => window.gameScene.dica.nivel), 2);
}));

test('dica (jogo, celular 360×640): o botão cabe, não há rolagem horizontal e a dica desenha círculos no mapa', () => comPagina({ viewport: { width: 360, height: 640 } }, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.evaluate(() => { window.gameScene.elapsedMs = 160000; }); await frames(pg, 5);
  const r = await pg.evaluate(() => {
    const b = document.getElementById('btn-dica').getBoundingClientRect();
    return { dentro: b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight, rolagemX: document.documentElement.scrollWidth > innerWidth,
      circulo: !!window.gameScene.dicaGfx && window.gameScene.dicaGfx.commandBuffer.length > 0 };
  });
  assert.deepEqual(r, { dentro: true, rolagemX: false, circulo: true });
}));
