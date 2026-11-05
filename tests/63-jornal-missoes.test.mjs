// v3.20: abertura das missões 2 a 8 como primeira página de jornal fictício (retrospectiva), com "Saiba mais" para o texto longo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, passarHistoria } from './helpers/navegador.mjs';

const RAIZ = new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/', import.meta.url).href;

test('jornal: 7 missões × 2 idiomas, texto curto, fonte e aviso de jornal fictício; foto desenhada determinística', async () => {
  const { JORNAIS } = await import(RAIZ + 'jornal/textos.js'), { htmlJornal, temJornal } = await import(RAIZ + 'jornal/jornal.js'), { fotoSvg } = await import(RAIZ + 'jornal/foto.js');
  assert.deepEqual(Object.keys(JORNAIS).filter((k) => k !== 'tutorial').map(Number), [2, 3, 4, 5, 6, 7, 8]);   // v3.22.2: 'tutorial' = edição de boas-vindas
  assert.equal(temJornal(1), false);
  for (const id of [2, 3, 4, 5, 6, 7, 8]) for (const l of ['pt', 'en']) {
    const L = JORNAIS[id][l];
    assert.ok(L.nome && L.manchete && L.sub && L.data && L.fonte && L.jogo && L.legenda);
    assert.equal(L.paragrafos.length, 3); assert.ok(L.paragrafos.join(' ').length < 900, 'texto curto (id ' + id + ')');
    const h = htmlJornal(id, l, 'texto longo');
    assert.match(h, /jornal-manchete/); assert.match(h, /<svg/); assert.match(h, /<details class="jornal-mais"/);
    assert.match(h, l === 'pt' ? /Jornal fictício/ : /Fictional newspaper/);
  }
  assert.equal(fotoSvg('hospital'), fotoSvg('hospital'));
  assert.notEqual(fotoSvg('hospital'), fotoSvg('costa'));
  assert.ok(!htmlJornal(2, 'pt').includes('<script'));
});

test('missão 2: a abertura é o jornal numa página só; "Saiba mais" guarda o texto longo; Continuar inicia a missão; o tutorial não usa jornal', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: `localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: {} }));` });
    await pg.click('#btn-missions'); await pg.click('#missions-container > *:nth-child(2) .mission-title');
    await pg.waitForSelector('.jornal');
    assert.match(await pg.textContent('.jornal-nome'), /Gazeta do Cerrado/);
    assert.equal(await pg.$$eval('.jornal-foto svg', (x) => x.length), 1);
    assert.equal(await pg.$eval('#story-voltar', (e) => e.hidden), true);
    assert.match(await pg.textContent('.jornal-mais-texto'), /AIEA, "The Radiological Accident in Goiânia"/);
    await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    assert.equal(await pg.evaluate(() => gameScene.missionData.id), 2);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
