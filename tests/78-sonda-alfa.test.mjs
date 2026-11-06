// v3.31: Fase C (parte 3) — a sonda alfa da Oficina multiplica a leitura de fontes alfa na missão de campo da Agência.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('física: com a sonda, a parte alfa da taxa triplica; gama e beta ficam iguais; o fundo não muda', async () => {
  const G = await mod('fisica/geiger.js'), P = G.PARAMETROS;
  const ctx = { tileM: 0.5, paredeCm: 30, ehParede: () => false };
  const sonda = { x: 5, y: 5, dir: 0 };
  const mk = (tipo, extra = {}) => ({ type: tipo, base: 100, found: false, rect: { x: 5.2, y: 4.5, w: 1, h: 1 }, x: 5.7, y: 5, componentes: [{ tipo, peso: 1, ...extra }], ...extra });
  const com = { ...ctx, params: { ...P, fatorForca: { ...P.fatorForca, alfa: P.fatorForca.alfa * G.SONDA_ALFA_FATOR } } };
  const a0 = G.taxaEsperada([mk('alfa')], sonda, ctx) - P.fundoCps, a1 = G.taxaEsperada([mk('alfa')], sonda, com) - P.fundoCps;
  assert.ok(a0 > 0, 'o alfa é lido de contato');
  assert.ok(Math.abs(a1 / a0 - G.SONDA_ALFA_FATOR) < 1e-6, `razão ${a1 / a0}`);
  const g0 = G.taxaEsperada([mk('gama', { energyMeV: 0.66 })], sonda, ctx), g1 = G.taxaEsperada([mk('gama', { energyMeV: 0.66 })], sonda, com);
  assert.equal(g0, g1); assert.equal(G.taxaEsperada([], sonda, com), P.fundoCps);
});

const estado = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 3, iniciado: true, dia: 3, proximoAlerta: null, creditos: 0, ativos: [{ id: 'm2', desde: 3, expira: 17 }] }, ${JSON.stringify(extra || {})}))); } catch (e) {} `;
async function entrar(pg) {
  await novoJogo(pg); await pg.waitForSelector('.ag-pino');
  await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('.ag-nave-int');
  await pg.click('[data-assento="2"]'); await pg.click('[data-cartao]:not([disabled])');
  await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
  await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
  await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
}
for (const [rot, extra, esperado] of [['com sonda alfa', { equipamentos: { sondaAlfa: 1 } }, true], ['sem sonda alfa', {}, false]]) {
  test(`em missão de campo ${rot}: temSondaAlfa = ${esperado}`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado(extra) });
      await entrar(pg);
      assert.equal(await pg.evaluate(() => window.gameScene.temSondaAlfa()), esperado);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
