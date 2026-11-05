// Agência: equipe na interface, dose em campo (caneta), ponto de coleta, Hangar e Base em grade.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, passarHistoria, novoJogo } from './helpers/navegador.mjs';

const ESTADO = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 2, iniciado: true, dia: 3, proximoAlerta: null, creditos: 0, ativos: [{ id: 'm2', desde: 3, expira: 17 }] }, ${JSON.stringify(extra || {})}))); } catch (e) {}`;


test('dose em campo: perto de uma fonte de gama a caneta sobe; fim da missão exige o ponto de coleta; tratamento e coleta pendente', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: ESTADO() });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota');
    await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted);
    // vai para junto de uma fonte de gama ainda não achada
    await pg.evaluate(() => { const s = window.gameScene, f = s.sources.find((q) => q.type === 'gama') || s.sources[0], T = 32; s.player.setPosition(f.furniture.centerX + 40, f.furniture.centerY); });
    await pg.waitForFunction(() => (GameState.doseMissao || 0) > 0, null, { timeout: 8000 });
    assert.equal(await pg.isVisible('#pen-dose'), true);
    assert.match(await pg.textContent('#pen-rot'), /Caneta: .* mSv/);
    // achou tudo: o jogo exige levar as fontes ao ponto de coleta antes de concluir
    await pg.evaluate(() => { const s = window.gameScene; s.sources.forEach((q) => { q.found = true; }); s.foundSources = [...s.sources]; s.concluindo = true; s.tempoFinalMs = s.elapsedMs; s.concluirComEncontros(); });
    await pg.waitForFunction(() => window.gameScene.faseColeta === true, null, { timeout: 8000 });
    assert.equal(await pg.evaluate(() => window.gameScene.fim), false);
    await pg.evaluate(() => { const s = window.gameScene, T = 32; s.player.setPosition(s.pontoColeta.x * T, s.pontoColeta.y * T); });
    await pg.waitForFunction(() => window.gameScene.fim === true, null, { timeout: 8000 });
    const n = await pg.evaluate(() => GameState.fontesColeta); assert.ok(n >= 1);
    await pg.evaluate(() => { GameState.doseMissao = 3; ui.voltarAgencia(true); });   // dose alta: 3 mSv ao líder
    await pg.waitForSelector('#agencia-screen.active .ag-mapa');
    assert.match(await pg.textContent('.ag-relatorio'), /Em tratamento/);
    assert.match(await pg.textContent('.ag-relatorio'), /Fontes organizadas no ponto de coleta/);
    const est = await pg.evaluate(() => ({ c: ui.agencia.est.coleta.length, t: ui.agencia.est.equipe.filter((m) => m.tratamento).length, p: document.getElementById('pen-dose').hidden }));
    assert.equal(est.c, 1); assert.equal(est.t, 1); assert.equal(est.p, true, 'a caneta some do HUD ao voltar');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('Base em grade: comprar nave, construir laboratório, pesquisar, escavar e contratar pela interface', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: ESTADO({ creditos: 5000, ativos: [], candidatos: [{ id: 'k1', nome: 'Zeca', retrato: 'leo', expira: 40 }], coleta: [{ id: 'k9', alertaId: 'm2', fontes: 2, desde: 1, expira: 20 }] }) });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-planta');
    assert.match(await pg.textContent('#ag-base-resumo'), /Área escavada: 4×2/);
    await pg.click('[data-sala="hangar"]');
    assert.match(await pg.textContent('.ag-painel'), /Baias: 1 de 2/);
    await pg.click('[data-ag="comprar-nave"][data-tipo="resgate"]');
    assert.match(await pg.textContent('.ag-painel'), /Baias: 2 de 2/);
    assert.equal(await pg.isDisabled('[data-ag="comprar-nave"][data-tipo="levantamento"]'), true);
    assert.match(await pg.textContent('.ag-painel'), /Sem baia livre/);
    // envia a nave de resgate com 2 cientistas
    await pg.click('[data-ag="resgate"]'); assert.match(await pg.textContent('#ag-preparo'), /Montar a equipe/);
    await pg.click('[data-ag="decolar"]');
    assert.match(await pg.textContent('.ag-painel'), /viagem|Nenhuma fonte|em viagem/i);
    assert.equal(await pg.evaluate(() => ui.agencia.est.equipe.filter((m) => m.ocupadoAte > ui.agencia.est.dia).length), 2);
    // a nave em viagem aparece no mapa e na lista de texto
    await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-mapa');
    assert.equal(await pg.$$eval('.ag-nave-viagem', (e) => e.length), 1);
    assert.match(await pg.textContent('.ag-painel'), /Naves em viagem/);
    await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-planta');
    // célula livre -> laboratório
    await pg.click('.ag-cel.vazio'); await pg.click('[data-ag="construir"][data-tipo="laboratorio"]');
    assert.equal(await pg.$$eval('.ag-cel.vazio', (e) => e.length), 0);
    assert.equal(await pg.evaluate(() => ui.agencia.est.modulos.length), 8);
    // escavar mais uma coluna
    await pg.click('[data-ag="escavar-coluna"]'); assert.match(await pg.textContent('#ag-base-resumo'), /5×2/);
    // contratar: sem cama livre (4 de 6)? há 2 camas livres
    await pg.click('[data-sala="alojamento"]'); await pg.click('[data-ag="contratar"]');
    assert.match(await pg.textContent('.ag-painel'), /Camas: 5 de 6/);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
