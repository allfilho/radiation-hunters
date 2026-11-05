// Etapa 3: evidência reunida na identificação e a saída "ainda não dá para concluir".
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

async function comPagina(opcoes, fn) {
  const s = await servidor(); const nav = await abrirNavegador();
  try { const r = await novaPagina(nav, s.url, { idioma: 'pt', semEncontros: true, ...opcoes }); await fn(r); assert.deepEqual(r.erros, []); }
  finally { await nav.close(); await s.fechar?.(); }
}

/** Põe o jogador sobre a primeira fonte e abre a identificação pelo caminho real (handleIdentify). */
async function abrir(pg) {
  await pg.evaluate(() => {
    const s = window.gameScene, f = s.sources[0].furniture;
    s.player.x = f.centerX; s.player.y = f.centerY;
    s.currentReading = 999;               // sinal acima do limiar: o teste é da interface, não da física
    s.handleIdentify();
  });
  await pg.waitForSelector('#identify-modal.active');
}

test('modal mostra a evidência (○/✓) e o botão "ainda não dá para concluir" sem custo', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await abrir(pg);
  assert.match(await pg.textContent('#identify-evidencia'), /○ leitura sem placa\s+○ leitura com placa/);
  assert.equal(await pg.isVisible('#btn-mais-dados'), true);
  const antes = await pg.evaluate(() => [GameState.attempts, GameState.score, GameState.combo]);
  await pg.click('#btn-mais-dados');
  await pg.waitForFunction(() => !document.getElementById('identify-modal').classList.contains('active'));
  assert.deepEqual(await pg.evaluate(() => [GameState.attempts, GameState.score, GameState.combo]), antes);
  assert.equal(await pg.evaluate(() => window.gameScene.pedidosDeDados), 1);
  await pg.waitForFunction(() => document.body.innerText.includes('Boa decisão'));
}));

test('com sem-placa e com-placa registrados, a evidência aparece marcada e a mensagem muda', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.evaluate(() => { window.gameScene.evidencia = { semPlaca: true, placas: new Set([1]) }; });
  await abrir(pg);
  assert.match(await pg.textContent('#identify-evidencia'), /✓ leitura sem placa\s+✓ leitura com placa/);
  await pg.click('#btn-mais-dados');
  await pg.waitForFunction(() => document.body.innerText.includes('Compare as quedas'));
}));

test('acertar sem comparar placas mostra a nota de método; com comparação, não; a evidência zera por fonte', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await abrir(pg);
  let nome = await pg.evaluate(() => window.gameScene.sources[0].name);
  await pg.click(`.isotope-btn:has(.isotope-name:text-is("${nome}"))`);
  assert.match(await pg.textContent('#identify-feedback'), /Nota de método/);
  assert.equal(await pg.evaluate(() => window.gameScene.evidencia.semPlaca), false);

  await pg.waitForFunction(() => !document.getElementById('identify-modal').classList.contains('active'), null, { timeout: 90000 });
  await pg.evaluate(() => { window.gameScene.evidencia = { semPlaca: true, placas: new Set([2]) }; const f = window.gameScene.sources[1].furniture; const s = window.gameScene; s.player.x = f.centerX; s.player.y = f.centerY; s.currentReading = 999; s.handleIdentify(); });
  await pg.waitForSelector('#identify-modal.active');
  nome = await pg.evaluate(() => window.gameScene.sources[1].name);
  await pg.click(`.isotope-btn:has(.isotope-name:text-is("${nome}"))`);
  assert.doesNotMatch(await pg.textContent('#identify-feedback'), /Nota de método/);
}));

test('medir com sinal registra a evidência: sem placa e com placa', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.evaluate(() => {
    const s = window.gameScene, f = s.sources[0].furniture;
    s.player.x = f.centerX; s.player.y = f.centerY;
    if (!s.geigerActive) s.toggleGeiger();
    for (let i = 0; i < 40; i++) s.measureRadiation();
  });
  const a = await pg.evaluate(() => [window.gameScene.currentReading, window.gameScene.evidencia.semPlaca]);
  assert.ok(a[0] > 10 && a[1] === true, JSON.stringify(a));
  await pg.evaluate(() => { const s = window.gameScene; s.setShield(1); for (let i = 0; i < 40; i++) s.measureRadiation(); });
  const b = await pg.evaluate(() => [window.gameScene.currentReading, [...window.gameScene.evidencia.placas]]);
  // a placa só entra na evidência se ainda houve sinal acima do limiar (fonte alfa some atrás de qualquer placa)
  assert.equal(b[0] > 10, b[1].includes(1), JSON.stringify(b));
}));
