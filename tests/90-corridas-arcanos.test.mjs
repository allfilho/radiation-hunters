// v3.43: arcanos oferecidos no meio da missão (Cult of the Lamb) e semente da turma no modo professor.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('corridas: oferta de 2 arcanos diferentes sem repetir; abre na 1ª e na 3ª fonte; semente da turma saneada', async () => {
  const C = await mod('corridas.js');
  const r = C.prng(42), a = C.sortearOferta(r, []);
  assert.equal(a.length, 2); assert.notEqual(a[0], a[1]);
  assert.deepEqual(C.sortearOferta(C.prng(42), []), a, 'determinístico');
  assert.deepEqual(C.sortearOferta(r, C.IDS_ARCANOS.slice(1)), [C.IDS_ARCANOS[0]]);
  assert.equal(C.abreOferta(1, 5), true); assert.equal(C.abreOferta(2, 5), false); assert.equal(C.abreOferta(3, 5), true); assert.equal(C.abreOferta(3, 3), false, 'a última fonte encerra a missão');
  assert.equal(C.saneaSementeTurma(' turma-7b! '), 'TURMA7B'); assert.equal(C.saneaSementeTurma(null), '');
  const P = await mod('progresso.js');
  assert.equal(P.sanear({ settings: { sementeTurma: 'abc 123' } }).settings.sementeTurma, 'ABC123');
  assert.equal(P.sanear(null).settings.sementeTurma, '');
});

const comSemente = (s) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2,3], bestStars: { 1: 3 }, settings: { encontros: false, sementeTurma: '${s}' } })); } catch (e) {}`;
async function posicoes(nav, url, semente) {
  const { pg } = await novaPagina(nav, url, { idioma: 'pt', antes: comSemente(semente) });
  await iniciarMissao(pg, 2);
  return pg.evaluate(() => { const s = window.gameScene; return { fontes: s.sources.map((f) => [f.name, Math.round(f.furniture.centerX), Math.round(f.furniture.centerY), f.baseActivity ?? f.strength ?? null]), oferta: (() => { s.oferecerArcanos(); return s.ofertaArcanos; })() }; });
}

test('semente da turma: a mesma semente dá a mesma corrida (fontes e arcanos); outra semente muda', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const a = await posicoes(nav, srv.url, 'TURMA1'), b = await posicoes(nav, srv.url, 'TURMA1'), c = await posicoes(nav, srv.url, 'OUTRA9');
    assert.deepEqual(a, b);
    assert.notDeepEqual(a.fontes, c.fontes);
  } finally { await nav.close(); await srv.fechar(); }
});

for (const [w, h] of [[1280, 720], [390, 844]]) {
  for (const lang of ['pt', 'en']) {
    test(`telas (${w}×${h}, ${lang}): semente da turma nas missões avulsas; painel de arcanos no meio da missão e efeitos`, async () => {
      const srv = await servidor(), nav = await abrirNavegador();
      try {
        const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, viewport: { width: w, height: h }, toque: w < 800, antes: comSemente('') });
        await pg.click('#btn-missions'); await pg.waitForSelector('#turma-form');
        assert.match(await pg.textContent('#turma-estado'), lang === 'pt' ? /Sem semente/ : /No seed/);
        await pg.fill('#turma-semente', 'aula 3b'); await pg.click('#turma-form button[type="submit"]');
        assert.match(await pg.textContent('#turma-estado'), lang === 'pt' ? /Semente em uso: AULA3B/ : /Seed in use: AULA3B/);
        assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('radiationHunters')).settings.sementeTurma), 'AULA3B');
        const sw = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= w + 1, `sem rolagem horizontal (${sw})`);
        await pg.click('#btn-back-missions'); await iniciarMissao(pg, 2);
        const m0 = await pg.evaluate(() => ({ v: window.gameScene.fatorVelocidade(), meta: window.gameScene.metaTempoS }));
        await pg.evaluate(() => window.gameScene.oferecerArcanos());
        await pg.waitForSelector('#arcano-oferta:not([hidden]) .arcano');
        assert.match(await pg.textContent('#arcano-oferta'), lang === 'pt' ? /Achado de campo: escolha um arcano/ : /Field find: choose an arcanum/);
        assert.equal(await pg.$$eval('#arcano-oferta .arcano', (x) => x.length), 2);
        // força uma oferta conhecida e escolhe "passos" e depois "tempo"
        await pg.evaluate(() => { const s = window.gameScene; s.ofertaArcanos = ['passos', 'tempo']; ui.mostrarArcanos(['passos', 'tempo'], (id) => s.escolherArcano(id)); });
        await pg.click('#arcano-oferta [data-arcano="passos"]');
        assert.equal(await pg.isVisible('#arcano-oferta'), false);
        assert.match(await pg.textContent('#notification'), lang === 'pt' ? /Arcano escolhido: Passos leves/ : /Arcanum chosen: Light steps/);
        await pg.evaluate(() => { const s = window.gameScene; s.ofertaArcanos = ['tempo', 'escudo']; ui.mostrarArcanos(['tempo', 'escudo'], (id) => s.escolherArcano(id)); });
        await pg.click('#arcano-oferta [data-arcano="tempo"]');
        const m1 = await pg.evaluate(() => ({ v: window.gameScene.fatorVelocidade(), meta: window.gameScene.metaTempoS, arc: window.gameScene.arcanos }));
        assert.ok(Math.abs(m1.v - m0.v * 1.1) < 1e-9); assert.equal(m1.meta, m0.meta + 30); assert.deepEqual(m1.arc, ['passos', 'tempo']);
        // deixar passar fecha sem escolher
        await pg.evaluate(() => { const s = window.gameScene; s.ofertaArcanos = ['escudo', 'radar']; ui.mostrarArcanos(['escudo', 'radar'], (id) => s.escolherArcano(id)); });
        await pg.click('#arcano-oferta .arcano-passar');
        assert.equal(await pg.isVisible('#arcano-oferta'), false); assert.deepEqual(await pg.evaluate(() => window.gameScene.arcanos), ['passos', 'tempo']);
        if (lang === 'en') assert.doesNotMatch(await pg.textContent('#mission-select'), /Semente|turma/);
        assert.deepEqual(erros, []);
      } finally { await nav.close(); await srv.fechar(); }
    });
  }
}

test('arcano do escudo: o primeiro erro de identificação não quebra o combo; o arcano de pontos rende 50 % a mais', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: comSemente('') });
    await iniciarMissao(pg, 2);
    const r = await pg.evaluate(() => { const s = window.gameScene; s.arcanos = ['escudo', 'pontos'];
      return { escudo: s.temArcano('escudo'), pontos: s.temArcano('pontos') }; });
    assert.deepEqual(r, { escudo: true, pontos: true });
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
