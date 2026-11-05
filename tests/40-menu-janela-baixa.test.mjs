// Tela inicial em janelas baixas: rola, o topo não é cortado e o crédito não cobre os botões PT/EN (bug relatado no Opera).
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

for (const [w, h] of [[1280, 800], [1366, 600], [1024, 500], [800, 420], [360, 640]]) {
  test(`menu inicial ${w}×${h}: topo visível, rodapé fora dos botões PT/EN e rolagem quando não cabe`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: w, height: h } });
      await pg.waitForSelector('#main-menu.active .lang-btn');
      const r = await pg.evaluate(() => {
        const m = document.getElementById('main-menu'), q = (s) => document.querySelector(s).getBoundingClientRect();
        const lang = q('.language-toggle'), cred = q('.credits'), logo = q('.logo-container');
        return { rola: m.scrollHeight > m.clientHeight, overflowY: getComputedStyle(m).overflowY, topo: logo.top, credTop: cred.top, langBottom: lang.bottom, sh: m.scrollHeight, ch: m.clientHeight, x: document.documentElement.scrollWidth, w: innerWidth };
      });
      assert.ok(r.topo >= -0.5, `topo cortado (${r.topo})`);
      assert.ok(r.credTop >= r.langBottom - 0.5, 'o crédito cobre os botões de idioma');
      assert.ok(r.x <= r.w, 'rolagem horizontal');
      assert.equal(r.overflowY, 'auto');
      if (r.rola) { // chega ao fim: o crédito fica inteiro à vista
        await pg.evaluate(() => { const m = document.getElementById('main-menu'); m.scrollTop = m.scrollHeight; });
        const fim = await pg.evaluate(() => document.querySelector('.credits').getBoundingClientRect().bottom <= innerHeight + 0.5);
        assert.ok(fim, 'o crédito não chega a ficar à vista ao rolar até o fim');
      }
      await pg.click('.lang-btn[data-lang="en"]'); assert.equal(await pg.getAttribute('.lang-btn[data-lang="en"]', 'class').then((c) => /active/.test(c)), true);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
