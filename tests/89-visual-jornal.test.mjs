// v3.42: identidade de jornal (caderno legível, boletim da manhã, edição extra, ficha de dosimetria, arcanos, telegrama, Diário Oficial, mesa de dados)
// e briefing fácil no começo.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

// contraste WCAG entre duas cores rgb(...)
const lum = (rgb) => { const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('briefing fácil no começo: até o dia 15 só "fato ou mito" de nível 1 dos conceitos de base; depois sobe', async () => {
  const C = await mod('agencia/carreira.js'), P = await mod('data/encontros/perguntas.js'), K = await mod('data/encontros/conceitos.js');
  const raiz = new Set(K.CONCEITOS.filter((c) => !c.prereq.length && !c.historia).map((c) => c.id));
  for (let d = 0; d < 15; d++) { const p = C.perguntaDoBriefing(P.PERGUNTAS, d, [], K.CONCEITOS); assert.equal(p.nivel, 1); assert.equal(p.formato, 'mf'); assert.ok(raiz.has(p.no), `${d}: ${p.no}`); }
  for (let d = 15; d < 40; d++) assert.equal(C.perguntaDoBriefing(P.PERGUNTAS, d, [], K.CONCEITOS).nivel, 1);
  assert.ok([...Array(60).keys()].some((k) => C.perguntaDoBriefing(P.PERGUNTAS, 40 + k, [], K.CONCEITOS).nivel === 2), 'nível 2 aparece depois do dia 40');
  // sem as fáceis disponíveis (todas vistas), ainda devolve alguma
  const faceis = P.PERGUNTAS.filter((p) => p.nivel === 1 && p.formato === 'mf' && raiz.has(p.no)).map((p) => p.id);
  assert.ok(C.perguntaDoBriefing(P.PERGUNTAS, 3, faceis, K.CONCEITOS));
});

for (const [w, h] of [[1280, 720], [390, 844]]) {
  test(`caderno legível (${w}×${h}): papel claro, tinta escura (contraste ≥ 7), recortes e abas`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: w, height: h }, toque: w < 800,
        antes: `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: {}, settings: {}, aprendizado: { nos: {}, perguntas: {}, fichas: { N01: true } } })); } catch (e) {}` });
      await pg.click('#btn-caderno'); await pg.waitForSelector('#caderno-modal.active .cad-carta');
      const c = await pg.evaluate(() => { const box = document.querySelector('#caderno-modal .caderno-content'), tit = document.querySelector('#caderno-titulo'), ficha = document.querySelector('.cad-carta:not(.fechada) .cad-ficha'), card = document.querySelector('.cad-carta:not(.fechada)');
        const cs = (e, p) => getComputedStyle(e)[p]; return { fundo: cs(box, 'backgroundColor'), tit: cs(tit, 'color'), ficha: cs(ficha, 'color'), card: cs(card, 'backgroundColor'), kicker: document.querySelector('#caderno-modal .caderno-kicker').textContent }; });
      assert.ok(contraste(c.fundo, c.tit) >= 7, `título ${c.tit} sobre ${c.fundo}`);
      assert.ok(contraste(c.card, c.ficha) >= 7, `ficha ${c.ficha} sobre ${c.card}`);
      assert.match(c.kicker, /Arquivo de recortes/);
      const sw = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= w + 1);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

const EST = (dia) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false }, aprendizado: { nos: {}, perguntas: {}, fichas: {} } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: ${dia}, proximoAlerta: null, proximaRapida: 999, creditos: 0, ativos: [{ id: 'm2', desde: ${dia}, expira: ${dia + 14} }], concluidos: { m4: 2 }, rapidasFeitas: 1,
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0}] })); } catch (e) {} `;

for (const lang of ['pt', 'en']) {
  test(`jornal na Agência (${lang}): boletim da manhã guarda o recorte; edição extra; ficha, arcanos, Diário Oficial; aviso leva à mesa de dados`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: EST(4) });
      await novoJogo(pg); await pg.waitForSelector('#ag-briefing.papel');
      assert.match(await pg.textContent('#ag-briefing'), lang === 'pt' ? /Gazeta Chronos.*Boletim da manhã · Mês 1, dia 4.*fato ou é mito/s : /Chronos Gazette.*Morning bulletin · Month 1, day 4.*fact or myth/s);
      const no = await pg.evaluate(async () => { const id = document.querySelector('#ag-briefing').dataset.pergunta; return (await import('./js/data/encontros/perguntas.js')).PERGUNTAS.find((x) => x.id === id).no; });
      await pg.click('[data-ag="briefing"][data-v="fato"]');
      assert.match(await pg.textContent('#ag-briefing'), lang === 'pt' ? /recorte deste assunto foi guardado no Caderno/ : /clipping on this topic was saved in the Field Notebook/);
      assert.equal(await pg.evaluate((n) => !!GameState.aprendizado.fichas[n], no), true, 'o conceito entra no caderno');
      // aviso da mesa de dados leva ao Alojamento
      assert.match(await pg.textContent('#ag-aviso-dados'), lang === 'pt' ? /Mesa de jogos aberta hoje/ : /Game table open today/);
      await pg.click('[data-ag="ir-dados"]'); await pg.waitForSelector('#ag-dados');
      assert.ok(await pg.$('#ag-dados .ag-dados-topo svg'), 'dados desenhados');
      // preparo: ficha de dosimetria e arcanos com numeral
      await pg.evaluate(() => { ui.agencia.vista = 'mapa'; ui.agencia.desenhar(false); });
      await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-cartas');
      assert.match(await pg.textContent('#ag-plano'), lang === 'pt' ? /Ficha de dosimetria/ : /Dosimetry form/);
      assert.equal(await pg.$$eval('.ag-carta .ag-carta-num', (x) => x.every((e) => /^[IV]+$/.test(e.textContent))), true);
      // volta: edição extra com manchete
      await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
      await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
      await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
      await pg.evaluate(() => { GameState.doseMissao = 0; GameState.ultimaConclusao = { id: 2, estrelas: 2 }; ui.voltarAgencia(true); });
      await pg.waitForSelector('.ag-relatorio.papel .papel-manchete');
      assert.match(await pg.textContent('.ag-relatorio'), lang === 'pt' ? /Edição extra/ : /Special edition/);
      // Diário Oficial no Centro de comando
      await pg.evaluate(() => { ui.agencia.voo = null; ui.agencia.vista = 'base'; ui.agencia.abrirSala('comando'); }); await pg.waitForSelector('#ag-politicas.papel');
      assert.match(await pg.textContent('#ag-politicas'), lang === 'pt' ? /Diário Oficial da Agência/ : /Agency Official Gazette/);
      if (lang === 'en') assert.doesNotMatch(await pg.textContent('#ag-politicas'), /Diário|Políticas/);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
