// Base gráfica (v3.12): PLANTA vista de cima (blocos por instalação, corredores), terra a escavar, coluna de menu à direita, cientistas, janela flutuante e barra da Marta.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';

const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 40, creditos: 5000, proximoAlerta: null, ativos: [] })); } catch (e) {} `;

for (const [w, h] of [[1280, 720], [390, 844]]) {
  test(`cena da Base em ${w}×${h}`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: w, height: h }, toque: w < 800, antes: ESTADO });
      await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
      await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
      assert.equal(await pg.$$eval('.ag-planta > .ag-cel', (e) => e.length), 8, '4×2 células construídas/livres');
      assert.equal(await pg.$$eval('.ag-planta .ag-planta-svg', (e) => e.length), 8, 'cada célula tem a sua planta');
      assert.equal(await pg.$$eval('.ag-rocha', (e) => e.length), 15 - 8, 'só se mostra a terra que dá para escavar (5×3 menos 4×2)');
      assert.equal(await pg.$$eval('.ag-console [data-ag^="escavar"]', (e) => e.length), 2, 'escavar fica no menu');
      assert.equal(await pg.$$eval('.ag-console .ag-menu-bt', (e) => e.length), 13, 'menu: 8 instalações + construir + escavar×2 + normas + mapa');
      assert.ok(await pg.$$eval('.ag-pessoa', (e) => e.length) >= 1, 'cientistas aparecem nas salas');
      assert.equal(await pg.$$eval('.ag-janela', (e) => e.length), 0, 'sem sala aberta não há janela');
      assert.match(await pg.textContent('.ag-marta-barra'), /Marta/);
      await pg.click('[data-sala="alojamento"]'); await pg.waitForSelector('.ag-janela');
      const ok = await pg.evaluate(() => { const r = document.querySelector('.ag-fechar').getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.top >= 0 && r.right <= innerWidth + 1; });
      assert.ok(ok, 'botão fechar acessível');
      await pg.click('[data-ag="fechar-janela"]'); assert.equal(await pg.$$eval('.ag-janela', (e) => e.length), 0);
      await pg.click('[data-ag="escavar-coluna"]');
      assert.equal(await pg.evaluate(() => ui.agencia.est.grade.cols), 5);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
