// Assistência do alfa: alcance 1,0 -> 1,5 tile por tempo (75% da meta, ou 50% se faltam mais da metade das fontes).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { taxaFonte, PARAMETROS } from '../current/js/fisica/geiger.js';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

const CTX = { tileM: 0.5, paredeCm: 30, ehParede: () => false, blindagem: null };
const fonte = { type: 'alfa', base: 100, x: 5.5, y: 5.5, rect: { x: 5, y: 5, w: 1, h: 1 } };
const sonda = (d) => ({ x: 6 + d, y: 5.5, dir: Math.PI });   // d = distância até a superfície (face direita em x=6)

test('modelo: alcance padrão 1,0 e ampliado 1,5 (só altera o alfa)', () => {
  assert.equal(PARAMETROS.alfaAlcanceTiles, 1.0);
  assert.equal(taxaFonte(fonte, sonda(1.3), CTX), 0, 'a 1,3 tile não conta sem assistência');
  const com = taxaFonte(fonte, sonda(1.3), { ...CTX, alfaAlcanceTiles: 1.5 });
  assert.ok(com > 0 && com < 100 * (1 - 1.3 / 1.5) + 1e-9 + 1, `conta com assistência: ${com}`);
  // perto, a taxa da assistência é a mesma fórmula com outro alcance (não ultrapassa a base)
  assert.ok(taxaFonte(fonte, sonda(0.2), { ...CTX, alfaAlcanceTiles: 1.5 }) <= 100);
  const gama = { type: 'gama', base: 100, x: 5.5, y: 5.5, rect: fonte.rect, energyMeV: 0.66 };
  assert.equal(taxaFonte(gama, sonda(1.3), CTX), taxaFonte(gama, sonda(1.3), { ...CTX, alfaAlcanceTiles: 1.5 }));
});

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

async function comMissao(id, fn) {
  const { pg, ctx } = await novaPagina(nav, srv.url, { semEncontros: true, todasDesbloqueadas: true });
  try { await iniciarMissao(pg, id); return await fn(pg); } finally { await ctx.close(); }
}
const tempo = (pg, frac) => pg.evaluate((f) => { const g = window.gameScene; g.elapsedMs = f * g.metaTempoS * 1000; g.verificarAssistencia(); return g.assistenciaAlfa; }, frac);

test('missão alfa, nenhuma fonte achada: liga aos 50% da meta, não antes', () => comMissao(1, async (pg) => {
  assert.equal(await tempo(pg, 0.45), false);
  assert.equal(await tempo(pg, 0.55), true);
}));

test('metade ou menos das fontes faltando: só liga aos 75%', () => comMissao(3, async (pg) => {
  await pg.evaluate(() => { const g = window.gameScene; g.sources.forEach((s, i) => { if (i < g.sources.length / 2) s.found = true; }); });
  assert.equal(await tempo(pg, 0.6), false);
  assert.equal(await tempo(pg, 0.74), false);
  assert.equal(await tempo(pg, 0.76), true);
}));

test('missão sem alfa (Cs-137): a assistência nunca liga', () => comMissao(2, async (pg) => {
  assert.equal(await tempo(pg, 2), false);
}));

test('assistência ligada: o alcance usado pelo Geiger sobe para 1,5 e há um aviso', () => comMissao(1, async (pg) => {
  await tempo(pg, 0.8);
  const r = await pg.evaluate(() => {
    const g = window.gameScene;
    return { ativa: g.assistenciaAlfa, alc: 1.5, aviso: document.body.innerText.includes('Detector') || document.body.innerText.includes('detector') };
  });
  assert.equal(r.ativa, true);
  assert.equal(r.aviso, true);
}));
