// Paginação ("em partes") da história da missão e das lições + layout no celular.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';
import { paginarTexto, paginarParagrafos } from '../current/js/paginar.js';

test('paginarTexto: respeita o limite, preserva todo o conteúdo e nunca devolve vazio', () => {
  const txt = 'TÍTULO\n\n' + Array.from({ length: 12 }, (_, i) => `Parágrafo ${i}. Frase um. Frase dois. Frase três.`).join('\n\n') + '\n\n' + 'A'.repeat(100) + '. ' + 'B'.repeat(100) + '. ' + 'C'.repeat(100) + '.';
  const pgs = paginarTexto(txt, 200);
  assert.ok(pgs.length > 3);
  for (const p of pgs) assert.ok(p.length <= 200 + 2, 'parte maior que o limite: ' + p.length);
  const junta = (s) => s.replace(/\s+/g, '');
  assert.equal(junta(pgs.join('')), junta(txt));
  assert.deepEqual(paginarTexto('', 100), ['']);
  assert.deepEqual(paginarTexto('curto', 100), ['curto']);
  assert.deepEqual(paginarParagrafos(['a'.repeat(150), 'b'.repeat(150), 'c'.repeat(10)], 200).map((x) => x.length), [1, 2]);
});

const MEDIDAS = [[390, 844], [360, 640], [844, 390], [667, 375]];

test('história da missão: em partes, botão sempre dentro da tela e texto sem estourar (celular, retrato e paisagem)', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    for (const [w, h] of MEDIDAS) {
      const { pg, erros } = await novaPagina(nav, s.url, { academia: true, viewport: { width: w, height: h }, idioma: 'pt' });
      await pg.click('#btn-missions');
      await pg.click('#missions-container > *:nth-child(1) .mission-title');
      await pg.waitForSelector('#story-continue', { state: 'visible' });
      let partes = 0, vistas = '';
      for (let i = 0; i < 40 && await pg.$eval('#story-intro', (e) => e.classList.contains('active')); i++) {
        await pg.click('#story-text'); // termina a digitação
        const r = await pg.evaluate(() => {
          const b = document.getElementById('story-continue').getBoundingClientRect();
          const t = document.getElementById('story-text');
          const c = document.querySelector('.story-container').getBoundingClientRect();
          return { bb: b.bottom, bt: b.top, br: b.right, vh: innerHeight, vw: innerWidth, cb: c.bottom, rotulo: document.getElementById('story-pagina').textContent, txt: t.textContent, over: document.documentElement.scrollWidth > innerWidth };
        });
        assert.ok(r.bt >= 0 && r.bb <= r.vh, `${w}x${h} parte ${i}: botão fora da tela (${r.bt}-${r.bb} de ${r.vh})`);
        assert.ok(r.br <= r.vw, `${w}x${h}: botão além da largura`);
        assert.ok(r.cb <= r.vh + 1, `${w}x${h}: contêiner passa da altura visível`);
        assert.equal(r.over, false, `${w}x${h}: rolagem horizontal`);
        assert.match(r.rotulo, /Parte \d+ de \d+/);
        vistas += r.txt; partes++;
        await pg.click('#story-continue'); await pg.waitForTimeout(30);
      }
      assert.ok(partes >= 2, `${w}x${h}: história deveria ter várias partes (${partes})`);
      assert.deepEqual(erros, []);
      await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted);
      await pg.context().close();
    }
  } finally { await nav.close(); await s.fechar(); }
});

test('história: Voltar retorna à parte anterior e some na primeira', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    const { pg } = await novaPagina(nav, s.url, { academia: true, viewport: { width: 390, height: 700 }, idioma: 'pt' });
    await pg.click('#btn-missions'); await pg.click('#missions-container > *:nth-child(1) .mission-title');
    await pg.waitForSelector('#story-continue', { state: 'visible' });
    assert.equal(await pg.$eval('#story-voltar', (e) => e.hidden), true);
    await pg.click('#story-text'); const p1 = await pg.textContent('#story-text');
    await pg.click('#story-continue');
    assert.equal(await pg.$eval('#story-voltar', (e) => e.hidden), false);
    await pg.click('#story-voltar'); await pg.click('#story-text');
    assert.equal(await pg.textContent('#story-text'), p1);
    assert.equal(await pg.$eval('#story-voltar', (e) => e.hidden), true);
    await pg.context().close();
  } finally { await nav.close(); await s.fechar(); }
});

test('lições: em partes no celular, botões visíveis em todas as partes; demo da lição 7 em parte própria; fonte na última', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    for (const [w, h] of [[390, 844], [844, 390]]) {
      const { pg, erros } = await novaPagina(nav, s.url, { academia: true, viewport: { width: w, height: h }, idioma: 'pt' });
      await iniciarMissao(pg, 1);
      for (let i = 0; i < 8; i++) {
        await pg.evaluate((k) => { const g = window.gameScene; g.emEncontro = true; GameState.modalAberto = true; g.licaoUI.abrir(k, 'pt', () => {}, () => {}); }, i);
        let partes = 0, viuDemo = false, viuFonte = false;
        for (let k = 0; k < 20; k++) {
          const r = await pg.evaluate(() => {
            const m = document.querySelector('#licao-modal .licao-content').getBoundingClientRect();
            const bs = [...document.querySelectorAll('#licao-modal .licao-botoes button')].map((b) => { const q = b.getBoundingClientRect(); return [q.top, q.bottom, q.right]; });
            return { mb: m.bottom, mt: m.top, vh: innerHeight, vw: innerWidth, bs, demo: !!document.querySelector('.licao-demo'), fonte: !!document.querySelector('.licao-fonte'), prox: !!document.getElementById('licao-proxima'), quiz: !!document.getElementById('licao-iniciar') };
          });
          assert.ok(r.mt >= 0 && r.mb <= r.vh + 1, `${w}x${h} lição ${i + 1}: painel fora da tela`);
          for (const [bt, bb, br] of r.bs) assert.ok(bt >= 0 && bb <= r.vh + 1 && br <= r.vw, `${w}x${h} lição ${i + 1} parte ${k}: botão fora da tela (${bt}-${bb}/${r.vh})`);
          partes++; viuDemo ||= r.demo; viuFonte ||= r.fonte;
          if (!r.prox) { assert.equal(r.quiz, true, 'última parte oferece o quiz'); assert.equal(r.fonte, true, 'fonte na última parte'); break; }
          assert.equal(r.fonte, false, 'fonte só na última parte');
          await pg.click('#licao-proxima');
        }
        if (i === 6) assert.equal(viuDemo, true, 'lição 7 tem a demo');
        assert.ok(viuFonte);
        if (h === 390 && i === 5) assert.ok(partes >= 2, `lição 6 em paisagem baixa deveria ter ≥2 partes (${partes})`);
        if (i === 6) assert.ok(partes >= 2, 'lição 7 tem ao menos texto + demo');
        await pg.click('#licao-iniciar');            // quiz ainda alcançável
        for (let q = 0; q < 6 && await pg.$('.licao-opcao:not([disabled])'); q++) { await pg.click('.licao-opcao:not([disabled]) >> nth=0'); await pg.click('#licao-seguir'); }
        await pg.evaluate(() => { const g = window.gameScene; g.licaoUI.fechar(); g.emEncontro = false; GameState.modalAberto = false; });
      }
      assert.deepEqual(erros, []);
      await pg.context().close();
    }
  } finally { await nav.close(); await s.fechar(); }
});

test('lições: Voltar funciona e Esc ainda adia em qualquer parte', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    const { pg } = await novaPagina(nav, s.url, { academia: true, viewport: { width: 390, height: 700 }, idioma: 'pt' });
    await iniciarMissao(pg, 1);
    await pg.evaluate(() => { window.gameScene.emEncontro = true; GameState.modalAberto = true; window.gameScene.licaoUI.abrir(6, 'pt', () => {}, () => { window.__adiou = true; }); });
    const t1 = await pg.textContent('#licao-modal .licao-texto');
    await pg.click('#licao-proxima');
    assert.notEqual(await pg.textContent('#licao-modal .licao-texto'), t1);
    await pg.click('#licao-voltar');
    assert.equal(await pg.textContent('#licao-modal .licao-texto'), t1);
    await pg.click('#licao-proxima'); await pg.keyboard.press('Escape');
    assert.equal(await pg.evaluate(() => window.__adiou), true);
    await pg.context().close();
  } finally { await nav.close(); await s.fechar(); }
});
