// v3.29: Fase C (parte 1) — espectrômetro no modal de identificação e dose extra ao identificar errado.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('linhasGamaTexto: Cs-137 uma linha, Co-60 duas, Sr-90 nenhuma, desconhecido = null; idioma', async () => {
  const C = await mod('fisica/componentes.js');
  assert.equal(C.linhasGamaTexto({ name: 'Cs-137' }, 'pt'), '661,7 keV');
  assert.equal(C.linhasGamaTexto({ name: 'Co-60' }, 'pt'), '1173,2 e 1332,5 keV');
  assert.equal(C.linhasGamaTexto({ name: 'Co-60' }, 'en'), '1173.2 and 1332.5 keV');
  assert.equal(C.linhasGamaTexto({ name: 'Sr-90' }), '');
  assert.equal(C.linhasGamaTexto({ name: 'Xx-1' }), null);
});

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
  test(`com espectrômetro (${lang}): botão aparece, mostra a linha gama do Cs-137; erro de identificação custa 0,3 mSv`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estado(COM('espectrometro')) });
      await entrarNaMissao(pg);
      const nome = await aoLado(pg); assert.equal(nome, 'Cs-137');
      await pg.waitForSelector('#identify-modal.active');
      assert.equal(await pg.isVisible('#btn-espectro'), true);
      assert.equal(await pg.isVisible('#identify-espectro'), false);
      await pg.click('#btn-espectro');
      const lido = await pg.textContent('#identify-espectro');
      assert.match(lido, lang === 'pt' ? /661,7 keV/ : /661\.7 keV/);
      if (lang === 'en') assert.doesNotMatch(lido, /Espectr|linha|fonte/i);
      const antes = await pg.evaluate(() => GameState.doseMissao || 0);
      await pg.click('.isotope-btn:not([data-name="Cs-137"])');
      await pg.waitForSelector('#identify-feedback.visible');
      const dep = await pg.evaluate(() => GameState.doseMissao || 0);
      assert.ok(Math.abs(dep - antes - 0.3) < 0.05, `dose extra de 0,3 mSv (antes ${antes}, depois ${dep})`);
      const fb = await pg.textContent('#identify-feedback');
      assert.match(fb, lang === 'pt' ? /0,3 mSv/ : /0\.3 mSv/);
      if (lang === 'en') assert.doesNotMatch(fb, /demora|cientista/i);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('sem espectrômetro: botão não aparece, mas o erro de identificação ainda custa dose; acertar não custa', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado() });
    await entrarNaMissao(pg);
    await aoLado(pg); await pg.waitForSelector('#identify-modal.active');
    assert.equal(await pg.isVisible('#btn-espectro'), false);
    const antes = await pg.evaluate(() => GameState.doseMissao || 0);
    await pg.click('.isotope-btn[data-name="Cs-137"]');
    await pg.waitForSelector('#identify-feedback.visible');
    const dep = await pg.evaluate(() => GameState.doseMissao || 0);
    assert.ok(dep - antes < 0.2, 'acertar não adiciona a dose de erro');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
