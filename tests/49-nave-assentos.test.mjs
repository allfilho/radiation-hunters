// Interior da nave: assentos, troca de cientista, líder = assento da frente.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';

const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, proximoAlerta: null, creditos: 0, ativos: [{ id: 'm2', desde: 3, expira: 17 }] })); } catch (e) {} `;

test('assentos: troca, tirar, passar para a frente, sugerir e líder na decolagem', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: ESTADO });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]');
    await pg.waitForSelector('.ag-nave-int');
    const nomes = () => pg.$$eval('.ag-assento', (e) => e.map((x) => x.querySelector('.ag-assento-nome')?.textContent || null));
    let n = await nomes(); assert.equal(n.length, 4); assert.ok(n[0] && n[1] && !n[2] && !n[3]);
    const [a, b] = n;
    // seleciona o assento 1 (apoio) e embarca o 3º cientista do elenco no lugar
    await pg.click('[data-assento="1"]');
    const livre = await pg.$$eval('[data-cartao]:not([disabled])', (e) => e.map((x) => x.dataset.cartao));
    assert.ok(livre.length >= 2);
    await pg.click(`[data-cartao="${livre[0]}"]`);
    n = await nomes(); assert.notEqual(n[1], b, 'o apoio foi trocado'); assert.equal(n[0], a);
    // encher a nave e tentar um quinto
    await pg.click('[data-assento="2"]'); await pg.click(`[data-cartao]:not([disabled])`);
    // passar o assento 2 para a frente
    const n2 = await nomes(); await pg.click('[data-assento="2"]'); await pg.click('[data-ag="passar-frente"]');
    n = await nomes(); assert.equal(n[0], n2[2]);
    // sugerir equipe volta a 2 a bordo
    await pg.click('[data-ag="sugerir"]');
    assert.equal(await pg.$$eval('.ag-assento.ocupado', (e) => e.length), 2);
    // tirar da nave
    await pg.click('[data-assento="1"]'); await pg.click('[data-ag="tirar-assento"]');
    assert.equal(await pg.$$eval('.ag-assento.ocupado', (e) => e.length), 1);
    await pg.click('[data-ag="sugerir"]');
    const frente = (await nomes())[0];
    await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota');
    const sai = await pg.evaluate(() => { const e = ui.agencia.equipeSaida; return { n: e.ids.length, lider: ui.agencia.est.equipe.find((m) => m.id === e.lider).nome }; });
    assert.equal(sai.n, 2); assert.equal(sai.lider, frente);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('nave no celular: assentos e botão de decolar acessíveis', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: 390, height: 844 }, toque: true, antes: ESTADO });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]');
    await pg.waitForSelector('.ag-nave-int');
    const r = await pg.evaluate(() => { const el = document.querySelector('[data-ag="decolar"]'); el.scrollIntoView(); const b = el.getBoundingClientRect(); const a = document.querySelector('.ag-assento').getBoundingClientRect(); return { b: b.bottom <= innerHeight + 1 && b.top >= 0, w: document.documentElement.scrollWidth <= innerWidth + 1, aw: a.width }; });
    assert.ok(r.b, 'decolar visível após rolar'); assert.ok(r.w, 'sem rolagem horizontal'); assert.ok(r.aw > 60);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
