// Retratos (v3.13): busto vetorial com 4 expressões, ficha em dossiê e expressão ligada ao estado do jogo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { RAIZ_JOGO as raiz, servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';

const carregar = (p) => import(pathToFileURL(join(raiz, p)).href);

test('retratos: todos os personagens em todas as expressões, bem formados e determinísticos', async () => {
  const R = await carregar('js/investigacao/retratos.js');
  assert.deepEqual(R.EXPRESSOES, ['neutro', 'sorriso', 'preocupado', 'surpreso']);
  const ids = new Set();
  for (const k of Object.keys(R.NOMES)) {
    const vistos = new Set();
    for (const e of R.EXPRESSOES) {
      const s = R.retratoSvg(k, e);
      assert.ok(!/NaN|undefined|<image|href=|http/.test(s), `${k}/${e}`);
      assert.match(s, /aria-hidden="true"/); assert.match(s, /viewBox="0 0 96 96"/);
      assert.equal(s, R.retratoSvg(k, e), 'determinístico');
      vistos.add(s);
      const aberta = (s.match(/<(?!\/|\?|!)[a-zA-Z]+/g) || []).length, fechada = (s.match(/<\/[a-zA-Z]+>/g) || []).length, auto = (s.match(/\/>/g) || []).length;
      assert.equal(aberta, fechada + auto, `tags balanceadas em ${k}/${e}`);
    }
    assert.equal(vistos.size, 4, `as 4 expressões de ${k} são diferentes`);
    for (const m of R.retratoSvg(k).matchAll(/id="([^"]+)"/g)) ids.add(m[1]);
    assert.equal(R.retratoSvg(k), R.retratoSvg(k, 'inexistente'), 'expressão inválida cai em neutro');
  }
  assert.equal(ids.size, Object.keys(R.NOMES).length * 2, 'ids de gradiente únicos por personagem');
  assert.equal(R.retratoSvg('ninguem'), '');
});

const ESTADO = (ativos) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 40, creditos: 5000, proximoAlerta: null, ativos: ${JSON.stringify(ativos)} })); } catch (e) {} `;
const BOCA_PREOCUPADA = 'M42.5 60 Q48 56.4';

test('ficha em dossiê no alojamento e expressão da Marta conforme os alertas', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    for (const [ativos, preocupada] of [[[], false], [[{ id: 'q123', desde: 38, expira: 46 }], true]]) {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: 1280, height: 720 }, antes: ESTADO(ativos) });
      await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
      await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-planta');
      assert.equal((await pg.innerHTML('.ag-marta-barra .inv-retrato')).includes(BOCA_PREOCUPADA), preocupada, 'Marta ' + (preocupada ? 'preocupada com alerta' : 'tranquila sem alerta'));
      if (!preocupada) {
        await pg.click('[data-sala="alojamento"]'); await pg.waitForSelector('.ag-dossie');
        const n = await pg.evaluate(() => ui.agencia.est.equipe.length);
        assert.equal(await pg.$$eval('.ag-dossie', (e) => e.length), n);
        assert.match(await pg.textContent('.ag-dossie .ag-foto-cab'), /FICHA \d\d/);
        assert.equal(await pg.$$eval('.ag-dossie .ag-foto svg', (e) => e.length), n);
        const cx = await pg.evaluate(() => { const r = document.querySelector('.ag-dossie .ag-foto').getBoundingClientRect(); return r.width >= 60 && r.height >= 60; });
        assert.ok(cx, 'foto grande o bastante');
      }
      assert.deepEqual(erros, []);
      await pg.context().close();
    }
  } finally { await nav.close(); await srv.fechar(); }
});
