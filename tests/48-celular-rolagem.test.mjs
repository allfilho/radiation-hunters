// Celular: o botão "Lacrar" do cofre fica sempre à vista, a rolagem funciona com o dedo sobre uma fonte e os modais cabem na janela visível.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';
import { abrirCofre, itensDoJogo, MATERIAL_CERTO } from './helpers/cofre.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });
async function comPagina(opc, fn) { const p = await novaPagina(nav, srv.url, opc); try { return await fn(p); } finally { await p.ctx.close(); } }

for (const [w, h] of [[390, 844], [360, 640], [740, 360]]) {
  test(`cofre no celular ${w}x${h}: Lacrar à vista sem rolar, fonte rola com o dedo e dá para guardar tudo pela ficha e lacrar`, () =>
    comPagina({ todasDesbloqueadas: true, idioma: 'pt', viewport: { width: w, height: h }, toque: true }, async ({ pg, erros }) => {
      await iniciarMissao(pg, 5); await abrirCofre(pg); await pg.waitForTimeout(300);
      const lac = () => pg.evaluate(() => { const r = document.querySelector('.cf-lacrar').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, vh: innerHeight }; });
      let r = await lac();
      assert.ok(r.bottom <= r.vh + 1 && r.top >= 0, `Lacrar fora da janela: ${JSON.stringify(r)}`);
      assert.notEqual(await pg.evaluate(() => getComputedStyle(document.querySelector('.cf-fonte')).touchAction), 'none', 'touch-action none trava a rolagem');
      const itens = await itensDoJogo(pg);
      for (const it of itens) {
        await pg.tap(`.cf-bandeja .cf-fonte[data-nome="${it.nome}"]`); await pg.waitForTimeout(250);
        const ix = ['alfa', 'beta', 'gama'].indexOf(it.prat) + 1;
        const b = pg.locator(`.cf-f-acoes button:nth-child(${ix})`);
        const bb = await b.boundingBox();
        assert.ok(bb && bb.y >= 0 && bb.y + bb.height <= h + 1, 'botão de guardar fora da janela');
        await b.tap(); await pg.waitForTimeout(300);
      }
      for (const prat of [...new Set(itens.map((i) => i.prat))]) {
        const m = pg.locator(`.cf-prat.${prat} .cf-mat[data-material="${MATERIAL_CERTO[prat]}"]`);
        await m.scrollIntoViewIfNeeded(); await m.tap();
      }
      r = await lac(); assert.ok(r.bottom <= r.vh + 1 && r.top >= 0, 'Lacrar sumiu depois de guardar');
      await pg.tap('.cf-lacrar:not([disabled])');
      await pg.waitForSelector('.cf-resumo', { state: 'visible' });
      const rr = await pg.evaluate(() => { const b = document.querySelector('.cf-resumo .cf-lacrar'); b.scrollIntoView({ block: 'nearest' }); const q = b.getBoundingClientRect(); return { top: q.top, bottom: q.bottom, vh: innerHeight }; });
      assert.ok(rr.bottom <= rr.vh + 1 && rr.top >= 0, 'botão do resumo fora da janela');
      await pg.tap('.cf-resumo .cf-lacrar');
      await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
      assert.deepEqual(erros, []);
    }));
}

test('modais do jogo em celular deitado: o conteúdo cabe na janela (dvh) e rola por dentro', () =>
  comPagina({ todasDesbloqueadas: true, idioma: 'pt', viewport: { width: 740, height: 360 }, toque: true }, async ({ pg }) => {
    await iniciarMissao(pg, 2);
    await pg.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    const r = await pg.evaluate(() => {
      const out = [];
      for (const id of ['identify-modal', 'encontro-modal', 'pause-modal', 'complete-modal', 'howto-modal']) {
        const m = document.getElementById(id); if (!m) continue;
        m.classList.add('active');
        const c = m.querySelector('.modal-content'), q = c.getBoundingClientRect(), cs = getComputedStyle(c);
        out.push({ id, dentro: q.top >= -1 && q.bottom <= innerHeight + 1, overflowY: cs.overflowY });
        m.classList.remove('active');
      }
      return out;
    });
    assert.ok(r.length >= 3);
    for (const x of r) { assert.ok(x.dentro, x.id + ' passa da janela'); assert.equal(x.overflowY, 'auto', x.id); }
  }));
