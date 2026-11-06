// Agência (mapa-múndi + relógio + Base em corte): interface e ligação com as missões e investigações existentes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, passarHistoria, ativos, novoJogo } from './helpers/navegador.mjs';
import { RAIZ_JOGO } from './helpers/navegador.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
// jogador que já fez o treinamento; relógio parado, sem alertas e sem sorteio pendente
const COM_TREINO = `try { if (!localStorage.getItem('radiationHuntersAgencia')) { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 1, iniciado: true, dia: 0, proximoAlerta: null })); } } catch (e) {}`;
const COM_ALERTAS = (ids) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 1, iniciado: true, dia: 3, proximoAlerta: null, ativos: ${JSON.stringify(ids.map((id) => ({ id, desde: 3, expira: 17 })))} })); } catch (e) {}`;

test('dados: alertas cobrem as missões 2 a 8 e as 4 investigações; coordenadas, níveis e distância corretos', async () => {
  const D = await mod('agencia/dados.js'), M = await mod('data/missoes/index.js'), I = await mod('investigacao/index.js');
  const ids = D.ALERTAS.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(D.ALERTAS.filter((a) => a.tipo === 'missao').map((a) => a.missaoId).sort(), M.MISSIONS.slice(1).map((m) => m.id));
  assert.deepEqual(D.ALERTAS.filter((a) => a.tipo === 'investigacao').map((a) => a.invId).sort(), I.INVESTIGACOES.map((x) => x.id).sort());
  for (const a of D.ALERTAS) {
    assert.ok(a.lat >= -58 && a.lat <= 84 && a.lon >= -180 && a.lon <= 180, a.id);
    assert.ok(Number.isInteger(a.liberaMes) && a.liberaMes >= 0, a.id + ' liberaMes');
    assert.ok(a.local.pt && a.local.en);
    if (a.tipo === 'missao') assert.equal(a.nivel, M.MISSIONS.find((m) => m.id === a.missaoId).difficulty, a.id + ': nível igual à dificuldade da missão');
  }
  assert.ok(Math.abs(D.distanciaKm({ lat: 0, lon: 0 }, { lat: 0, lon: 90 }) - Math.PI / 2 * 6371) < 0.01);
  assert.equal(D.treinamentoConcluido([1]), false); assert.equal(D.treinamentoConcluido([1, 2]), true);
});

test('menu: Novo jogo e Continuar abrem o mapa-múndi; antes do treinamento o relógio está desligado e a Base leva à Academia', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt' });
    assert.equal(await pg.isVisible('#btn-agencia').catch(() => false), false, 'não há mais um botão Agência separado');
    await novoJogo(pg);
    await pg.waitForSelector('#agencia-screen.active .ag-mapa');
    assert.equal(await pg.evaluate(() => document.activeElement.id), 'ag-titulo');
    assert.equal(await pg.$$eval('[data-vel]:not([disabled])', (e) => e.length), 0, 'relógio desligado');
    assert.equal(await pg.$$eval('.ag-pino', (e) => e.length), 0);
    assert.match(await pg.textContent('.ag-painel'), /depois do treinamento/);
    await pg.click('[data-ag="sala-academia"]');
    await pg.waitForSelector('[data-ag="pular"]'); await pg.click('[data-ag="pular"]');
    await pg.click('[data-ag="trocar"]'); // volta ao mapa
    await pg.waitForSelector('.ag-mapa');
    assert.equal(await pg.$$eval('[data-vel]:not([disabled])', (e) => e.length), 3, 'relógio ligado depois do treinamento');
    assert.equal(await pg.evaluate(() => ui.agencia.est.iniciado), true);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('relógio: começa pausado, avança por dia, e PARA sozinho quando surge um alerta (que aparece no mapa, na lista e no registro)', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: COM_TREINO });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    assert.equal(await pg.getAttribute('[data-vel="0"]', 'aria-pressed'), 'true');
    await pg.evaluate(() => { ui.agencia.est.proximoAlerta = 3; ui.agencia.est.proximaRapida = 9999; });
    await pg.click('[data-ag="passo"]'); assert.match(await pg.textContent('#ag-data'), /Mês 1 · Dia 1/);
    await pg.click('[data-vel="2"]');
    assert.equal(await pg.getAttribute('[data-vel="2"]', 'aria-pressed'), 'true');
    await pg.waitForSelector('.ag-pino', { timeout: 8000 });
    assert.equal(await pg.getAttribute('[data-vel="0"]', 'aria-pressed'), 'true', 'o relógio parou sozinho');
    const dia = await pg.evaluate(() => ui.agencia.est.dia); assert.equal(dia, 3);
    await pg.waitForTimeout(1200);
    assert.equal(await pg.evaluate(() => ui.agencia.est.dia), 3, 'continua parado');
    assert.equal(await pg.$$eval('.ag-pino', (e) => e.length), 1); assert.equal(await pg.$$eval('.ag-lista .ag-item', (e) => e.length), 1);
    assert.match(await pg.textContent('.ag-registro'), /novo alerta/);
    assert.match(await pg.textContent('#ag-anuncio'), /Tempo pausado/);
    const salvo = await pg.evaluate(() => JSON.parse(localStorage.getItem('radiationHuntersAgencia')));
    assert.equal(salvo.dia, 3); assert.equal(salvo.ativos.length, 1);
    await pg.reload(); await pg.waitForFunction(() => typeof ui !== 'undefined');
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    assert.equal(await pg.$$eval('.ag-pino', (e) => e.length), 1, 'o estado sobrevive ao recarregar');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('alertas vencem: o alerta some, o registro explica, a nota cai e o relógio para', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: COM_ALERTAS(['m3']) });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.evaluate(() => { ui.agencia.est.ativos[0].expira = ui.agencia.est.dia + 1; });
    await pg.click('[data-ag="passo"]');
    await pg.waitForFunction(() => document.querySelectorAll('.ag-pino').length === 0);
    assert.match(await pg.textContent('.ag-registro'), /venceu/);
    assert.equal(await pg.evaluate(() => ui.agencia.est.nota), -2);
    assert.match(await pg.textContent('.ag-painel'), /Nenhum alerta ativo/);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('alerta de missão: detalhe com prazo, voo no próprio mapa, pular viagem, sair sem concluir mantém o alerta; concluir paga', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: COM_ALERTAS(['m6', 'i-hospital']) });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    assert.equal(await pg.$$eval('.ag-pino', (e) => e.length), 2);
    await pg.click('.ag-item[data-alerta="m6"]');
    const det = await pg.textContent('#ag-detalhe');
    assert.match(det, /Zaragoza/); assert.match(det, /faltam 14 dias/); assert.match(det, /Distância aproximada/); assert.match(det, /Recriação educativa/);
    await pg.click('[data-ag="enviar"]');
    assert.match(await pg.textContent('#ag-preparo'), /Montar a equipe/); assert.equal(await pg.$$eval('.ag-assento.ocupado', (e) => e.length), 2);
    await pg.click('[data-ag="decolar"]');
    await pg.waitForSelector('#ag-rota');
    assert.equal(await pg.$$eval('.ag-mapa', (e) => e.length), 1, 'o mapa continua na tela durante o voo');
    assert.equal(await pg.$$eval('[data-vel]:not([disabled])', (e) => e.length), 0, 'relógio parado durante o voo');
    assert.equal(await pg.textContent('#ag-chegar'), 'Pular viagem');
    await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' });
    assert.equal(await pg.evaluate(() => ui.origem), 'agencia');
    await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted);
    await pg.waitForTimeout(300);
    await pg.keyboard.press('Escape'); await pg.click('#btn-quit');
    await pg.waitForSelector('#agencia-screen.active .ag-mapa');
    assert.match(await pg.textContent('.ag-relatorio'), /sem concluir/);
    assert.equal(await pg.evaluate(() => ui.agencia.est.ativos.some((a) => a.id === 'm6')), true, 'o alerta continua ativo');
    assert.deepEqual(await ativos(pg), ['agencia-screen']);
    // concluir: simula o registro da conclusão da missão 6 (2 estrelas) e o retorno pelo painel de conclusão
    await pg.evaluate(() => { GameState.currentMission = MISSIONS[5]; ui.agencia.alvo = { tipo: 'missao', id: 'm6', missaoId: 6 }; GameState.ultimaConclusao = { id: 6, estrelas: 2 }; ui.origem = 'agencia'; ui.voltarDaMissao(true); });
    assert.match(await pg.textContent('.ag-relatorio'), /★★☆/); assert.match(await pg.textContent('.ag-relatorio'), /\+600/);
    assert.equal(await pg.evaluate(() => ui.agencia.est.creditos), 600);
    assert.equal(await pg.evaluate(() => ui.agencia.est.ativos.some((a) => a.id === 'm6')), false);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('alerta de investigação abre a investigação; ficha concluída paga; o Modo Atalho continua voltando ao menu', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'en', antes: COM_ALERTAS(['i-radonio']) });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-pino[data-alerta="i-radonio"]');
    assert.match(await pg.textContent('#ag-detalhe'), /fictional/i);
    await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota');
    await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-text .jornal');   // v3.24: investigação pela Agência abre como reportagem
    await pg.click('#story-continue');
    await pg.waitForFunction(() => document.getElementById('game-screen').classList.contains('active'));
    await pg.evaluate(() => { ui.investigacao.ficha = { concluida: true }; ui.voltarAgencia(true); });
    await pg.waitForSelector('#agencia-screen.active .ag-mapa');
    assert.equal(await pg.evaluate(() => ui.agencia.est.creditos), 600);
    assert.equal(await pg.evaluate(() => ui.agencia.est.ativos.length), 0);
    // Modo Atalho: menu -> missões avulsas -> missão -> sair = menu principal (comportamento anterior)
    await pg.evaluate(() => { ui.encerrarJogo(); ui.showScreen('mainMenu'); });
    await pg.click('#btn-missions');
    await pg.click('#missions-container > *:nth-child(2) .mission-title');
    await pg.waitForSelector('#story-continue', { state: 'visible' });
    await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted);
    await pg.waitForTimeout(300);
    await pg.keyboard.press('Escape'); await pg.click('#btn-quit');
    await pg.waitForSelector('#main-menu.active');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('Base em corte: 7 salas clicáveis com o painel de cada uma; cofre derivado das missões concluídas; caderno abre; volta ao mapa', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: COM_ALERTAS([]) });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-planta');
    assert.equal(await pg.$$eval('.ag-cel[data-sala]', (e) => e.length), 7); assert.equal(await pg.$$eval('.ag-cel.vazio', (e) => e.length), 1);
    assert.equal(await pg.evaluate(() => document.activeElement.id), 'ag-titulo');
    for (const [sala, esperado] of [['hangar', /jato está abastecido/], ['comando', /Alertas ativos: 0/], ['academia', /Refazer treinamento/], ['cofre', /Missões concluídas: 2 de 8/], ['alojamento', /Camas: 4 de 6/], ['oficina', /Os engenheiros fabricam/], ['biblioteca', /caderno de campo/]]) {
      await pg.click(`[data-sala="${sala}"]`);
      assert.match(await pg.textContent('.ag-painel'), esperado, sala);
      assert.equal(await pg.getAttribute(`[data-sala="${sala}"]`, 'aria-pressed'), 'true');
    }
    await pg.click('[data-ag="caderno"]');
    await pg.waitForSelector('#caderno-modal.active'); await pg.click('#close-caderno');
    await pg.click('[data-sala="cofre"]');
    assert.match(await pg.textContent('.ag-painel'), /Cs-137/);
    await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-mapa .ag-base-btn');
    await pg.click('.ag-base-btn'); await pg.waitForSelector('.ag-planta');   // o marcador da Base no mapa também leva à Base
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('idioma e movimento reduzido: textos em inglês; o voo chega sem animação', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: COM_ALERTAS(['m2']) });
    await pg.emulateMedia({ reducedMotion: 'reduce' });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-pino[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota');
    assert.equal(await pg.textContent('#ag-chegar'), 'Desembarcar');
    assert.equal(await pg.getAttribute('#ag-barra', 'aria-valuenow'), '100');
    assert.ok(await pg.$eval('#ag-aviao', (e) => e.classList.contains('pousado')), 'o jato fica pousado no destino');
    assert.ok(await pg.$eval('#ag-pista', (e) => e.classList.contains('on')), 'a pista do destino é marcada');
    assert.match(await pg.textContent('#ag-voo-estado'), /pousou/);
    await pg.click('[data-ag="cancelar-voo"]');
    assert.equal(await pg.$$eval('.ag-estacionado', (n) => n.length), 1, 'sem voo, o jato fica estacionado na Base');
    await pg.evaluate(() => { document.querySelector('.lang-btn[data-lang="en"]').click(); });
    assert.match(await pg.textContent('.ag-barra h2'), /World map/);
    assert.match(await pg.textContent('.ag-painel'), /Active alerts/);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

for (const [w, h] of [[360, 640], [800, 420], [1280, 800], [1920, 1080]]) {
  test(`mapa e Base em ${w}×${h}: sem rolagem horizontal, alvos ≥ 44 px, pinos dentro do mapa, relógio e painel à vista`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: COM_ALERTAS(['m2', 'm3', 'i-hospital']), viewport: { width: w, height: h } });
      const sem = async (rot) => assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.getElementById('agencia-screen').scrollWidth <= innerWidth + 1), 'rolagem horizontal em ' + rot);
      await novoJogo(pg);
      await pg.waitForSelector('.ag-pino'); await sem('mapa');
      const cx = await pg.$$eval('.ag-pino', (els) => { const m = document.querySelector('.ag-mapa').getBoundingClientRect(); return els.map((e) => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, dentro: r.left + r.width / 2 >= m.left && r.left + r.width / 2 <= m.right && r.top + r.height / 2 >= m.top && r.top + r.height / 2 <= m.bottom }; }); });
      assert.ok(cx.every((p) => p.dentro && p.w >= 44 && p.h >= 44), 'pino fora do mapa ou pequeno');
      const rel = await pg.$$eval('.ag-btn-rel', (e) => e.map((b) => { const r = b.getBoundingClientRect(); return [r.width, r.height]; }));
      assert.ok(rel.every(([bw, bh]) => bw >= 44 && bh >= 44), 'botões do relógio pequenos');
      const mapa = await pg.$eval('.ag-mapa', (e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; });
      assert.ok(mapa.l >= -1 && mapa.r <= w + 1, 'mapa fora da largura');
      await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await sem('voo');
      assert.ok(await pg.$eval('#ag-chegar', (e) => e.getBoundingClientRect().height) >= 44);
      await pg.click('[data-ag="cancelar-voo"]');
      await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-planta'); await sem('base');
      const salas = await pg.$$eval('.ag-cel', (els) => { const b = document.querySelector('.ag-planta').getBoundingClientRect(); return els.every((e) => { const r = e.getBoundingClientRect(); return r.left >= b.left - 1 && r.right <= b.right + 1 && r.height > 20; }); });
      assert.ok(salas, 'sala fora do corte');
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
