// v3.16.0: blindagens nas teclas 1-4 e cientistas em campo nas teclas 7, 8, 9, 0 (modo Agência).
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
import { distribuirDoseMissao, NORMAS } from '../current/js/agencia/equipe.js';

const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, proximoAlerta: null, creditos: 0, ativos: [{ id: 'm2', desde: 3, expira: 17 }] })); } catch (e) {} `;

test('distribuirDoseMissao: sem acumulado vale a regra antiga; com acumulado cada um recebe líder no seu trecho e apoio no resto', () => {
  const mk = (id) => ({ id, nome: id, doses: [], ocupadoAte: 0 });
  const eq = [mk('a'), mk('b'), mk('c')];
  let r = distribuirDoseMissao(eq.map((m) => ({ ...m, doses: [] })), ['a', 'b'], 'a', 10, 3);
  assert.equal(r[0].msv, 10 * NORMAS.doseLider); assert.equal(r[1].msv, 10 * NORMAS.doseApoio);
  r = distribuirDoseMissao(eq.map((m) => ({ ...m, doses: [] })), ['a', 'b', 'c'], 'a', 10, 3, { a: 6, b: 4 });
  assert.ok(Math.abs(r[0].msv - (6 * NORMAS.doseLider + 4 * NORMAS.doseApoio)) < 1e-9);
  assert.ok(Math.abs(r[1].msv - (4 * NORMAS.doseLider + 6 * NORMAS.doseApoio)) < 1e-9);
  assert.ok(Math.abs(r[2].msv - 10 * NORMAS.doseApoio) < 1e-9, 'quem não foi a campo recebe só o apoio');
});

test('em missão: 1 a 4 trocam a blindagem e 7, 8, 9, 0 trocam o cientista em campo', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: ESTADO });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('.ag-nave-int');
    await pg.click('[data-assento="2"]'); await pg.click('[data-cartao]:not([disabled])');
    await pg.click('[data-assento="3"]'); await pg.click('[data-cartao]:not([disabled])');
    assert.equal(await pg.$$eval('.ag-assento.ocupado', (e) => e.length), 4);
    await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    await pg.waitForTimeout(400);
    if (process.env.FOTO) await pg.screenshot({ path: process.env.FOTO });
    // painel de equipe no HUD
    assert.equal(await pg.$$eval('#hud-equipe .hud-cient', (e) => e.length), 4);
    assert.deepEqual(await pg.$$eval('#hud-equipe .hud-cient-tecla', (e) => e.map((x) => x.textContent)), ['7', '8', '9', '0']);
    assert.ok(await pg.$eval('#hud-equipe .hud-cient:first-child', (e) => e.classList.contains('ativo')));
    // rótulos das blindagens
    assert.deepEqual(await pg.$$eval('.shield-btn:not([hidden]) .shield-key', (e) => e.map((x) => x.textContent)), ['1', '2', '3', '4']);
    // blindagens
    for (const [tecla, id] of [['2', 1], ['3', 2], ['4', 3], ['1', 0]]) {
      await pg.keyboard.press(tecla); await pg.waitForTimeout(80);
      assert.ok(await pg.$eval(`.shield-btn[data-shield="${id}"]`, (e) => e.classList.contains('active')), 'botão ativo na tecla ' + tecla);
    }
    // cientistas
    const ativo = () => pg.evaluate(() => ui.agencia.cientistaAtivo());
    const primeiro = await ativo();
    // todos os cientistas da saída aparecem no mapa; os não selecionados ficam parados com o número da tecla
    const cena = () => pg.evaluate(() => { const g = window.gameScene, q = ui.agencia.equipeSaida; return { n: Object.keys(g.colegas || {}).length, visiveis: q.ids.filter((id) => g.colegas[id].visible).length, px: g.player.x, py: g.player.y, pos: Object.fromEntries(q.ids.map((id) => [id, [g.colegas[id].x, g.colegas[id].y, g.colegas[id].visible]])), ids: q.ids }; });
    const c0 = await cena(); assert.equal(c0.n, 4); assert.equal(c0.visiveis, 3, 'três parados e um controlado');
    await pg.keyboard.press('8'); await pg.waitForTimeout(100);
    const c1 = await cena(); assert.equal(c1.visiveis, 3);
    assert.equal(c1.px, c0.pos[c0.ids[1]][0], 'o controle foi para onde o 2º cientista estava');
    assert.deepEqual(c1.pos[c0.ids[0]].slice(0, 2), [c0.px, c0.py], 'o 1º fica parado onde estava'); assert.equal(c1.pos[c0.ids[0]][2], true); assert.equal(c1.pos[c0.ids[1]][2], false);
    const segundo = await ativo(); assert.notEqual(segundo, primeiro);
    assert.ok(await pg.$eval('#hud-equipe .hud-cient:nth-child(2)', (e) => e.classList.contains('ativo')));
    await pg.keyboard.press('0'); await pg.waitForTimeout(100);
    assert.equal(await ativo(), await pg.evaluate(() => ui.agencia.equipeSaida.ids[3]));
    await pg.click('#hud-equipe .hud-cient:nth-child(1)');
    assert.equal(await ativo(), primeiro, 'clique no retrato também troca');
    // dose do lugar onde cada um está: quem fica perto de uma fonte recebe mais do que quem fica parado longe
    await pg.evaluate(() => { const g = window.gameScene, f = g.sources[0].furniture; g.player.setPosition(f.centerX + 20, f.centerY); });
    await pg.waitForTimeout(1500);
    const dd = await pg.evaluate(() => { const q = ui.agencia.equipeSaida, a = ui.agencia.cientistaAtivo(); return { ativo: q.acum[a] || 0, outros: q.ids.filter((i) => i !== a).map((i) => q.acum[i] || 0), exato: q.exato }; });
    assert.ok(dd.exato); assert.ok(dd.ativo > Math.max(...dd.outros), 'quem está perto da fonte recebe mais: ' + JSON.stringify(dd));
    // a tecla 0 não mexe na blindagem (continua sem blindagem, que é a tecla 1)
    assert.ok(await pg.$eval('.shield-btn[data-shield="0"]', (e) => e.classList.contains('active')));
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
