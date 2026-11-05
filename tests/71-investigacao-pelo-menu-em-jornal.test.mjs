// v3.26: investigações abertas pelo menu "Investigações" também abrem como reportagem (jornal/TV/rádio) antes do mapa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, passarHistoria } from './helpers/navegador.mjs';

test('cartão do menu: abre a reportagem (mastro de veículo) e só depois o mapa; o sorteio de pesquisa também', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true });
    await pg.click('#btn-missions'); await pg.click('#aba-investigacoes');
    await pg.click('.investigacao-card');
    await pg.waitForSelector('#story-continue', { state: 'visible' });
    assert.equal(await pg.evaluate(() => document.getElementById('story-intro').classList.contains('active')), true);
    assert.ok((await pg.textContent('#story-intro')).length > 200);
    assert.equal(await pg.evaluate(() => !!window.gameScene), false, 'o mapa ainda não começou');
    await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene?.missionData.investigacao);
    assert.deepEqual(erros, []);
    await pg.close();
  } finally { await nav.close(); await srv.fechar?.(); }
});
