// Vagas de save (v3.11): 3 vagas independentes; "Novo jogo" abre as vagas; "Continuar" retoma; apagar e recomeçar pedem confirmação.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const memoria = (ini = {}) => { const m = new Map(Object.entries(ini)); return { m, ler: (k) => (m.has(k) ? m.get(k) : null), gravar: (k, v) => { m.set(k, v); return true; }, remover: (k) => { m.delete(k); } }; };
const J = (o) => JSON.stringify(o);
const AG = (dia, creditos, extra = {}) => J({ v: 2, iniciado: true, dia, creditos, equipe: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }], ativos: [], ...extra });

test('vagas: instalação nova não tem vaga; save antigo vira a vaga 1; progresso feito fora do "Novo jogo" também', async () => {
  const { criarSlots } = await mod('slots.js');
  const vazio = criarSlots(memoria()); assert.equal(vazio.algumaCriada(), false); assert.deepEqual(vazio.listar().map((v) => v.criada), [false, false, false]);
  const antigo = criarSlots(memoria({ radiationHunters: J({ unlockedMissions: [1, 2], bestStars: { 1: 3 } }), radiationHuntersAgencia: AG(40, 700) }));
  const l = antigo.listar(); assert.equal(l[0].criada, true); assert.equal(l[0].ativa, true); assert.equal(l[1].criada, false);
  assert.equal(l[0].resumo.mes, 2); assert.equal(l[0].resumo.diaDoMes, 10); assert.equal(l[0].resumo.creditos, 700); assert.equal(l[0].resumo.equipe, 4); assert.equal(l[0].resumo.missoes, 1);
  const prof = criarSlots(memoria({ radiationHunters: J({ unlockedMissions: [1, 2, 3], bestStars: {} }) }));
  assert.equal(prof.algumaCriada(), true);
  const lixo = criarSlots(memoria({ radiationHuntersSlots: '{{{', radiationHunters: 'xx' })); assert.equal(lixo.algumaCriada(), false); assert.equal(lixo.listar().length, 3);
});

test('vagas: cada vaga guarda o seu progresso e a sua Agência; as configurações são globais; novo jogo zera só a vaga escolhida', async () => {
  const { criarSlots } = await mod('slots.js');
  const arm = memoria({ radiationHunters: J({ unlockedMissions: [1, 2, 3], bestStars: { 1: 3, 2: 2 }, settings: { soundVolume: 33 } }), radiationHuntersAgencia: AG(10, 500) });
  const s = criarSlots(arm);
  assert.equal(s.ativar(2, { novo: true }), true);
  assert.equal(s.ativa(), 2);
  let vivo = JSON.parse(arm.ler('radiationHunters')); assert.deepEqual(vivo.unlockedMissions, [1]); assert.deepEqual(vivo.bestStars, {}); assert.equal(vivo.settings.soundVolume, 33, 'configurações ficam');
  assert.equal(arm.ler('radiationHuntersAgencia'), null, 'Agência da vaga nova começa vazia');
  // joga na vaga 2
  arm.gravar('radiationHunters', J({ ...vivo, unlockedMissions: [1, 2], bestStars: { 1: 1 }, settings: { soundVolume: 10 } })); arm.gravar('radiationHuntersAgencia', AG(5, 111));
  assert.equal(s.ativar(1), true);
  vivo = JSON.parse(arm.ler('radiationHunters')); assert.deepEqual(vivo.unlockedMissions, [1, 2, 3]); assert.deepEqual(vivo.bestStars, { 1: 3, 2: 2 }); assert.equal(vivo.settings.soundVolume, 10, 'a configuração mais recente vale para todas');
  assert.equal(JSON.parse(arm.ler('radiationHuntersAgencia')).creditos, 500);
  const l = s.listar(); assert.equal(l[0].resumo.creditos, 500); assert.equal(l[1].resumo.creditos, 111); assert.equal(l[1].resumo.missoes, 1); assert.equal(l[2].criada, false);
  assert.equal(s.ativar(3), false, 'continuar vaga vazia não funciona'); assert.equal(s.ativar(4, { novo: true }), false); assert.equal(s.ativar(0), false);
  // recomeçar a vaga 1 não mexe na 2
  assert.equal(s.ativar(1, { novo: true }), true); assert.equal(arm.ler('radiationHuntersAgencia'), null);
  assert.equal(s.listar()[1].resumo.creditos, 111);
});

test('vagas: apagar tira só a vaga escolhida; apagar a ativa zera as chaves vivas; contar e algumaCriada acompanham', async () => {
  const { criarSlots } = await mod('slots.js');
  const arm = memoria({ radiationHunters: J({ unlockedMissions: [1, 2], bestStars: { 1: 2 } }), radiationHuntersAgencia: AG(3, 90) });
  const s = criarSlots(arm); s.ativar(2, { novo: true }); arm.gravar('radiationHuntersAgencia', AG(7, 70)); s.ativar(1);
  assert.equal(s.contar(), 2);
  assert.equal(s.apagar(2), true); assert.equal(s.contar(), 1); assert.equal(arm.ler('radiationHuntersSlot2'), null); assert.equal(JSON.parse(arm.ler('radiationHuntersAgencia')).creditos, 90, 'a ativa não foi tocada');
  assert.equal(s.apagar(2), false);
  assert.equal(s.apagar(1), true); assert.equal(s.algumaCriada(), false); assert.equal(arm.ler('radiationHuntersAgencia'), null);
  assert.deepEqual(JSON.parse(arm.ler('radiationHunters')).unlockedMissions, [1]);
  assert.equal(s.listar().every((v) => !v.criada), true, 'não "renasce" depois de apagar');
});

test('vagas na interface: Novo jogo abre as 3 vagas; vaga vazia começa do zero; Continuar com 2 vagas pergunta; apagar pede confirmação; idioma em inglês', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt' });
    assert.equal(await pg.isVisible('#btn-continue'), false);
    await pg.click('#btn-new-game'); await pg.waitForSelector('#slots-modal.active .slot-card');
    assert.equal(await pg.$$eval('.slot-card', (e) => e.length), 3); assert.equal(await pg.$$eval('.slot-card.vazia', (e) => e.length), 3);
    assert.match(await pg.textContent('#slots-modal'), /Vagas de save/);
    // vaga 2: jogo novo (o treinamento ainda não foi feito)
    await pg.click('.slot-card[data-vaga="2"] [data-slot="novo"]');
    await pg.waitForSelector('#agencia-screen.active');
    assert.equal(await pg.evaluate(() => ui.slots.ativa()), 2);
    assert.equal(await pg.evaluate(() => ui.agencia.est.iniciado), false);
    // simula progresso na vaga 2 e volta ao menu
    await pg.evaluate(() => { ui.agencia.est.iniciado = true; ui.agencia.est.dia = 33; ui.agencia.est.creditos = 640; ui.agencia.gravar(); });
    await pg.evaluate(() => { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1, 2], bestStars: { 1: 3 }, settings: GameState.settings })); ui.showScreen('mainMenu'); });
    assert.equal(await pg.isVisible('#btn-continue'), true, 'Continuar aparece com uma vaga ocupada');
    // Novo jogo de novo: vaga 2 mostra o resumo, vaga 1 vazia
    await pg.click('#btn-new-game'); await pg.waitForSelector('#slots-modal.active .slot-card');
    assert.match(await pg.textContent('.slot-card[data-vaga="2"]'), /Mês 2 · dia 3 · 640 créditos/); assert.match(await pg.textContent('.slot-card[data-vaga="2"]'), /em uso/);
    assert.equal(await pg.$$eval('.slot-card.vazia', (e) => e.length), 2);
    // começar a vaga 1 do zero não mexe na 2
    await pg.click('.slot-card[data-vaga="1"] [data-slot="novo"]'); await pg.waitForSelector('#agencia-screen.active');
    assert.deepEqual(await pg.evaluate(() => ({ a: ui.slots.ativa(), ini: ui.agencia.est.iniciado, u: GameState.unlockedMissions })), { a: 1, ini: false, u: [1] });
    await pg.evaluate(() => ui.showScreen('mainMenu'));
    // Continuar com 2 vagas ocupadas (a 1 foi criada agora): pergunta qual
    await pg.click('#btn-continue'); await pg.waitForSelector('#slots-modal.active .slot-card');
    await pg.click('.slot-card[data-vaga="2"] [data-slot="continuar"]'); await pg.waitForSelector('#agencia-screen.active');
    assert.deepEqual(await pg.evaluate(() => ({ a: ui.slots.ativa(), d: ui.agencia.est.dia, c: ui.agencia.est.creditos, u: GameState.unlockedMissions })), { a: 2, d: 33, c: 640, u: [1, 2] });
    await pg.evaluate(() => ui.showScreen('mainMenu'));
    // apagar pede confirmação e só então apaga; Esc fecha a janela
    await pg.click('#btn-new-game'); await pg.waitForSelector('#slots-modal.active .slot-card');
    await pg.click('.slot-card[data-vaga="2"] [data-slot="apagar"]');
    assert.match(await pg.textContent('.slot-card[data-vaga="2"] .slot-aviso'), /não pode ser desfeito/);
    assert.equal(await pg.evaluate(() => ui.slots.contar()), 2, 'ainda não apagou');
    await pg.click('.slot-card[data-vaga="2"] [data-slot="cancelar"]'); assert.equal(await pg.evaluate(() => ui.slots.contar()), 2);
    await pg.click('.slot-card[data-vaga="2"] [data-slot="apagar"]'); await pg.click('[data-slot="apagar-sim"]');
    assert.equal(await pg.evaluate(() => ui.slots.contar()), 1); assert.equal(await pg.$$eval('.slot-card.vazia', (e) => e.length), 2);
    await pg.keyboard.press('Escape'); assert.equal(await pg.$eval('#slots-modal', (e) => e.classList.contains('active')), false);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('vagas no celular (360×640) e em inglês: janela cabe, botões ≥ 44 px, sem rolagem horizontal', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'en', viewport: { width: 360, height: 640 }, toque: true });
    await pg.click('#btn-new-game'); await pg.waitForSelector('#slots-modal.active .slot-card');
    assert.match(await pg.textContent('#slots-modal'), /Save slots/); assert.match(await pg.textContent('#slots-modal'), /New game here/);
    const m = await pg.$$eval('#slots-modal button', (bs) => bs.map((b) => { const r = b.getBoundingClientRect(); return [r.width, r.height]; }));
    assert.ok(m.every(([w, h]) => w >= 43.9 && h >= 43.9), 'alvos pequenos: ' + JSON.stringify(m));
    assert.equal(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('.slots-content').scrollWidth <= document.querySelector('.slots-content').clientWidth + 1), true);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
