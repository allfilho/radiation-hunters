// v3.30: Fase C (parte 2) — câmara de ionização mostra a taxa de dose no HUD (modo Agência, missão de campo).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

const COM = (id) => ({ equipamentos: { [id]: 4 }, equipe: [1, 2, 3, 4].map((i) => ({ id: 'c' + i, nome: 'N' + i, retrato: 'lara', especialidade: 'campo', doses: [], equip: id })) });   // v3.33: cada cientista leva o item
const estado = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 3, iniciado: true, dia: 3, proximoAlerta: null, creditos: 0, ativos: [{ id: 'm2', desde: 3, expira: 17 }] }, ${JSON.stringify(extra || {})}))); } catch (e) {} `;

async function entrarNaMissao(pg) {
  await novoJogo(pg); await pg.waitForSelector('.ag-pino');
  await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('.ag-nave-int');
  await pg.click('[data-assento="2"]'); await pg.click('[data-cartao]:not([disabled])');
  await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
  await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
  await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
  await pg.waitForTimeout(300);
}
const aoLado = (pg) => pg.evaluate(() => { const s = window.gameScene, f = s.sources[0].furniture; s.player.x = f.centerX; s.player.y = f.centerY; s.currentReading = 9999; s.handleIdentify(); return s.sources[0].name; });


for (const lang of ['pt', 'en']) {
  test(`com câmara de ionização (${lang}): a taxa de dose aparece no HUD e sobe perto da fonte`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estado(COM('camaraIonizacao')) });
      await entrarNaMissao(pg);
      const longe = await pg.evaluate(() => { const s = window.gameScene; s.player.x = s.mapData.playerStart.x * 32 + 16; s.player.y = s.mapData.playerStart.y * 32 + 16; return true; });
      await pg.waitForTimeout(900);
      assert.equal(await pg.isVisible('#camara-display'), true);
      const t0 = await pg.textContent('#camara-rot');
      assert.match(t0, lang === 'pt' ? /Câmara: .* mSv\/h \(estimativa de jogo\)/ : /Chamber: .* mSv\/h \(game estimate\)/);
      await pg.evaluate(() => { const s = window.gameScene, f = s.sources[0].furniture; s.player.x = f.centerX; s.player.y = f.centerY + 40; });
      await pg.waitForTimeout(900);
      const t1 = await pg.textContent('#camara-rot');
      const num = (x) => parseFloat(x.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
      assert.ok(num(t1) > num(t0), `perto da fonte a taxa é maior (longe: ${t0}; perto: ${t1})`);
      if (lang === 'en') assert.doesNotMatch(t1, /Câmara|estimativa/);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('sem câmara de ionização o painel não aparece', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado() });
    await entrarNaMissao(pg); await pg.waitForTimeout(900);
    assert.equal(await pg.isVisible('#camara-display'), false);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
