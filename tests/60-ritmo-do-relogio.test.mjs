// v3.16.0: chamados rápidos mais raros e progressivos (fáceis primeiro); o relógio não para por chamado rápido nem por volta de cientista.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';
import { novoEstado, iniciar, avancarDia, PARAMETROS } from '../current/js/agencia/simulacao.js';
import { alertaRapida, novaSemente, ehRapida, semDe } from '../current/js/agencia/rapidas.js';
import { prng } from '../current/js/arte/paleta.js';

test('novaSemente respeita o máximo de fontes', () => {
  const r = prng(7);
  for (const nMax of [1, 2, 3]) for (let i = 0; i < 60; i++) assert.ok(alertaRapida(novaSemente(r, [], nMax)).n <= nMax);
});

test('progressão: sem chamados concluídos só vêm de 1 fonte; depois até 2; depois até 3; o primeiro não vem antes do dia 10', () => {
  const colher = (feitas, seed) => {
    const est = novoEstado(); iniciar(est); est.rapidasFeitas = feitas; est.proximoAlerta = null; const rand = prng(seed), ns = []; let primeiro = null;
    for (let d = 0; d < 600; d++) { for (const e of avancarDia(est, rand)) if (e.tipo === 'novo' && ehRapida(e.id)) { ns.push(alertaRapida(semDe(e.id)).n); if (primeiro === null) primeiro = est.dia; } est.ativos = est.ativos.filter((a) => !ehRapida(a.id)); }
    return { ns, primeiro };
  };
  for (let seed = 1; seed <= 5; seed++) {
    const a = colher(0, seed), b = colher(3, seed), c = colher(6, seed);
    assert.ok(a.primeiro >= PARAMETROS.rapidas.primeira, 'primeiro chamado só depois do dia ' + PARAMETROS.rapidas.primeira);
    assert.ok(a.ns.length > 10 && a.ns.every((n) => n <= 1) && a.ns.includes(1), 'início: no máximo 1 fonte (0 = falso alarme)');
    assert.ok(b.ns.every((n) => n <= 2) && b.ns.includes(2), 'meio: até 2 fontes');
    assert.ok(c.ns.includes(3), 'avançado: aparecem 3 fontes');
  }
});

test('relógio: chegada de chamado rápido não pausa; alerta da história pausa', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const est = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
      localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, creditos: 500, ativos: [], ${extra} })); } catch (e) {} `;
    let { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: est('proximoAlerta: null, proximaRapida: 4') });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    await pg.click('[data-vel="2"]'); await pg.waitForTimeout(2600);
    const a = await pg.evaluate(() => ({ vel: ui.agencia.vel, dia: ui.agencia.est.dia, q: ui.agencia.est.ativos.filter((x) => /^q/.test(x.id)).length }));
    assert.equal(a.vel, 2, 'o relógio continua correndo'); assert.ok(a.dia >= 6, 'dia ' + a.dia); assert.equal(a.q, 1, 'o chamado chegou');
    await pg.click('[data-vel="0"]'); assert.deepEqual(erros, []);
    ({ pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: est('proximoAlerta: 4, proximaRapida: 999') }));
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    await pg.click('[data-vel="2"]'); await pg.waitForTimeout(1800);
    const b = await pg.evaluate(() => ({ vel: ui.agencia.vel, n: ui.agencia.est.ativos.length }));
    assert.equal(b.vel, 0, 'alerta da história para o relógio'); assert.equal(b.n, 1);
    // depois da pausa por evento, ▶ volta a correr (relato: o relógio ficava em pause)
    await pg.evaluate(() => { ui.agencia.est.proximoAlerta = null; ui.agencia.est.proximaRapida = 999; });
    const d0 = await pg.evaluate(() => ui.agencia.est.dia);
    await pg.click('[data-vel="1"]'); await pg.waitForTimeout(1900);
    const c = await pg.evaluate(() => ({ vel: ui.agencia.vel, dia: ui.agencia.est.dia }));
    assert.equal(c.vel, 1); assert.ok(c.dia > d0, 'o dia avançou depois de reiniciar');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('barra de espaço pausa e retoma o relógio na Agência', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
      localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, creditos: 500, proximoAlerta: null, proximaRapida: 999, ativos: [] })); } catch (e) {} ` });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    await pg.evaluate(() => document.activeElement && document.activeElement.blur());
    await pg.keyboard.press('Space'); assert.equal(await pg.evaluate(() => ui.agencia.vel), 1);
    await pg.keyboard.press('Space'); assert.equal(await pg.evaluate(() => ui.agencia.vel), 0);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
