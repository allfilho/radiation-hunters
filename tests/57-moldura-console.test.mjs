// v3.14.0: cena noturna atrás do menu + moldura de console nos botões e janelas (só aparência; alvos de toque continuam >= 44 px).
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

test('menu tem cena decorativa escondida do leitor de tela, sem capturar cliques, e botões continuam clicáveis', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: 390, height: 844 }, toque: true, semEncontros: true });
    const c = await pg.evaluate(() => { const e = document.querySelector('#menu-cena'); const cs = e && getComputedStyle(e); return e && { aria: e.getAttribute('aria-hidden'), pe: cs.pointerEvents, svg: !!e.querySelector('svg.ag-sup-svg'), naves: e.querySelectorAll('svg g[transform]').length, urls: /https?:|<image/.test(e.innerHTML) }; });
    assert.ok(c, 'cena existe'); assert.equal(c.aria, 'true'); assert.equal(c.pe, 'none'); assert.ok(c.svg); assert.ok(!c.urls, 'sem URL nem imagem externa');
    const tam = await pg.$$eval('#main-menu .menu-btn', (bs) => bs.filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return [r.width, r.height]; }));
    assert.ok(tam.length >= 4 && tam.every(([w, h]) => w >= 43.9 && h >= 43.9), 'alvos: ' + JSON.stringify(tam));
    await pg.click('#btn-new-game'); await pg.waitForSelector('#slots-modal.active');
    const parafuso = await pg.evaluate(() => getComputedStyle(document.querySelector('#slots-modal .modal-content'), '::before').content);
    assert.ok(parafuso && parafuso !== 'none', 'moldura com parafusos');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
