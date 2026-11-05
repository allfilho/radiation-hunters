// v3.17.0: balanço final só com "Voltar à Base", voo de volta com nave ocupada e ponto H também nas missões aleatórias.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
import { novoEstado, iniciar, avancarDia, sanear } from '../current/js/agencia/simulacao.js';
import { registrarRetorno, diasDeVolta, primeiraNaveLivre, registrarColeta } from '../current/js/agencia/frota.js';

test('registrarRetorno: nave e equipe ocupadas até o pouso; depois há evento "pouso"; save mantém a viagem e a coleta de chamado rápido', () => {
  const est = novoEstado(); iniciar(est, 1000); est.proximoAlerta = null; est.proximaRapida = 9999;
  const ids = est.equipe.slice(0, 2).map((m) => m.id), nave = est.naves[0];
  const chega = registrarRetorno(est, nave.id, ids, 2, 'q777');
  assert.equal(chega, est.dia + 2); assert.equal(primeiraNaveLivre(est, 'tripulacao'), null, 'sem nave livre durante o voo de volta');
  assert.ok(est.equipe.filter((m) => ids.includes(m.id)).every((m) => m.ocupadoAte === chega));
  assert.ok(registrarColeta(est, 'q777', 2) && est.coleta.length === 1);
  const salvo = sanear(JSON.parse(JSON.stringify(est)));
  assert.equal(salvo.naves[0].missao.tipo, 'retorno'); assert.equal(salvo.naves[0].missao.alertaId, 'q777');
  assert.equal(salvo.coleta.length, 1, 'coleta de chamado rápido não se perde ao salvar e carregar');
  const rand = () => 0.5; let ev = [];
  for (let i = 0; i < 2; i++) ev = ev.concat(avancarDia(est, rand));
  assert.ok(ev.some((e) => e.tipo === 'pouso'), 'evento de pouso'); assert.ok(primeiraNaveLivre(est, 'tripulacao'), 'nave livre depois do pouso');
  assert.equal(diasDeVolta(0), 1); assert.equal(diasDeVolta(12), 1); assert.equal(diasDeVolta(12.1), 2);
});

test('chamado rápido: ponto H, balanço só com Voltar à Base, voo de volta e nave ocupada', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
      localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 12, creditos: 500, proximoAlerta: null, proximaRapida: 9999, ativos: [{ id: 'q4242', desde: 12, expira: 22 }] })); } catch (e) {} `;
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: ESTADO });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="q4242"]'); await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    await pg.waitForTimeout(300);
    // ponto H também no chamado rápido
    assert.equal(await pg.evaluate(() => { const g = window.gameScene; g.foundSources.push(g.sources[0]); return g.precisaColeta(); }), true);
    // balanço: só "Voltar à Base"
    await pg.evaluate(() => { ui.showCompleteModal({ time: 90, accuracy: 100, score: 500, stars: 3, message: 'ok', fontes: { n: 2, total: 2 } }); });
    if (process.env.FOTO) { await pg.waitForTimeout(700); await pg.screenshot({ path: process.env.FOTO + '-balanco.png' }); }
    assert.equal(await pg.isVisible('#btn-replay'), false); assert.equal(await pg.isVisible('#btn-to-menu'), false);
    assert.equal((await pg.textContent('#btn-next-mission')).trim(), 'Voltar à Base');
    assert.equal((await pg.textContent('#complete-fontes')).trim(), '2/2');
    // volta à Base: voo de volta, nave ocupada, coleta registrada
    await pg.evaluate(() => { GameState.ultimaConclusao = { id: 100, estrelas: 3 }; GameState.fontesColeta = 2; });
    await pg.click('#btn-next-mission');
    await pg.waitForSelector('#agencia-screen.active #ag-chegar');
    const s = await pg.evaluate(() => ({ retorno: !!ui.agencia.voo && ui.agencia.voo.retorno, nave: ui.agencia.est.naves[0].missao && ui.agencia.est.naves[0].missao.tipo, coleta: ui.agencia.est.coleta.map((c) => c.alertaId), dis: [...document.querySelectorAll('[data-vel]')].every((b) => b.disabled) }));
    assert.equal(s.retorno, true); assert.equal(s.nave, 'retorno'); assert.deepEqual(s.coleta, ['q4242']); assert.equal(s.dis, true, 'relógio parado durante o voo');
    if (process.env.FOTO) { await pg.waitForTimeout(2500); await pg.screenshot({ path: process.env.FOTO + '-volta.png' }); }
    assert.equal(await pg.$$eval('[data-ag="cancelar-voo"]', (e) => e.length), 0, 'não se cancela o voo de volta');
    assert.match(await pg.textContent('.ag-relatorio'), /Fontes organizadas|Resultado/);
    await pg.click('#ag-chegar');
    await pg.waitForSelector('.ag-mapa');
    assert.equal(await pg.evaluate(() => ui.agencia.voo), null);
    // sem outra nave livre: não dá para decolar de novo até o pouso
    const dia = await pg.evaluate(() => ui.agencia.est.dia);
    await pg.evaluate(() => { ui.agencia.est.ativos.push({ id: 'q4243', desde: ui.agencia.est.dia, expira: ui.agencia.est.dia + 10 }); ui.agencia.desenhar(false); });
    await pg.click('.ag-item[data-alerta="q4243"]'); await pg.click('[data-ag="enviar"]');
    assert.equal(await pg.isDisabled('[data-ag="decolar"]'), true, 'sem nave livre');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
