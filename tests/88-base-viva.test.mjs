// v3.41: moral da equipe, confiança pública por região, mini-jogo dos dados do decaimento, ajuda escondida e ícones de recompensa.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('moral: limites 0–100, faixas e fator de velocidade; saves antigos começam em 70', async () => {
  const B = await mod('agencia/base-viva.js'), S = await mod('agencia/simulacao.js');
  const m = { moral: 70 };
  assert.equal(B.fatorMoral(m), 1); B.ajustarMoral(m, 15); assert.equal(B.faixaMoral(m), 'alto'); assert.equal(B.fatorMoral(m), 1.03);
  B.ajustarMoral(m, 100); assert.equal(m.moral, 100); B.ajustarMoral(m, -70); assert.equal(B.fatorMoral(m), 0.95); B.ajustarMoral(m, -50); assert.equal(m.moral, 0); assert.equal(B.fatorMoral(m), 0.9);
  const e = S.sanear({ iniciado: true, equipe: [{ id: 'c1', nome: 'Ana' }, { id: 'c2', nome: 'Bia', moral: 140 }] });
  assert.equal(e.equipe[0].moral, 70); assert.equal(e.equipe[1].moral, 100);
  const C = await mod('agencia/carreira.js');
  assert.equal(C.pensamento({ missoes: 2, moral: 30 }, 1, 0, 0), 'desanimado');
});

test('moral no dia a dia: folga anima; briefing certo anima todos', async () => {
  const S = await mod('agencia/simulacao.js'), C = await mod('agencia/carreira.js'), P = await mod('data/encontros/perguntas.js');
  const e = S.sanear({ iniciado: true, dia: 10, proximoAlerta: 999, proximaRapida: 999, equipe: [{ id: 'c1', nome: 'Ana', moral: 50 }, { id: 'c2', nome: 'Bia', moral: 50, doses: [{ dia: 10, msv: 0.3 }] }] });
  S.avancarDia(e, () => 0.5);
  assert.equal(e.equipe[0].moral, 53, 'folga'); assert.equal(e.equipe[1].moral, 50, 'teve dose ontem');
  const p = C.perguntaDoBriefing(P.PERGUNTAS, e.dia, []); C.responderBriefing(e, p.id, true);
  assert.deepEqual(e.equipe.map((m) => m.moral), [57, 54]);
});

test('confiança pública: regiões do mapa, +5 ao concluir, −10 ao vencer; a média muda a verba (1 com 60)', async () => {
  const B = await mod('agencia/base-viva.js'), S = await mod('agencia/simulacao.js');
  assert.equal(B.regiaoDe(-16.7, -49.3), 'americaSul'); assert.equal(B.regiaoDe(40.7, -74), 'americaNorte'); assert.equal(B.regiaoDe(51.4, 30.1), 'europa');
  assert.equal(B.regiaoDe(37.4, 141), 'asia'); assert.equal(B.regiaoDe(-33.9, 151.2), 'oceania'); assert.equal(B.regiaoDe(6.5, 3.4), 'africa'); assert.equal(B.regiaoDe(null, 3), null);
  const e = S.sanear({ iniciado: true, ativos: [{ id: 'm2', desde: 1, expira: 20 }] });
  assert.equal(B.fatorVerba(e), 1);
  S.concluir(e, 'm2', 2); assert.equal(e.confianca.americaSul, 65);
  const f = S.sanear({ iniciado: true, dia: 19, proximoAlerta: 999, proximaRapida: 999, ativos: [{ id: 'm4', desde: 1, expira: 20 }] });
  S.avancarDia(f, () => 0.5); assert.equal(f.confianca.europa, 50);
  f.confianca = { americaSul: 0, americaNorte: 0, europa: 0, africa: 0, asia: 0, oceania: 0 }; assert.equal(B.fatorVerba(f), 0.7);
  f.confianca = { americaSul: 100, americaNorte: 100, europa: 100, africa: 100, asia: 100, oceania: 100 }; assert.equal(B.fatorVerba(f), 1.2);
  // verba mensal: com confiança média 80, 10 % a mais
  const g = S.sanear({ iniciado: true, dia: S.PARAMETROS.diasPorMes - 1, proximoAlerta: 999, proximaRapida: 999, confianca: { americaSul: 80, americaNorte: 80, europa: 80, africa: 80, asia: 80, oceania: 80 } });
  const c0 = g.creditos; S.avancarDia(g, () => 0.5);
  assert.equal(g.creditos - c0, Math.round(S.PARAMETROS.verbaBase * S.PARAMETROS.fatorInicial / 100 * 1.1));
});

test('dados do decaimento: rolagem determinística, meia-vida ≈ 3,8 rodadas, uma partida por dia, acerto exato paga', async () => {
  const B = await mod('agencia/base-viva.js'), S = await mod('agencia/simulacao.js');
  assert.ok(Math.abs(B.MEIA_VIDA_RODADAS - 3.8018) < 1e-3);
  const r = B.rolarDados(30, B.rngDados(5)); assert.deepEqual(B.rolarDados(30, B.rngDados(5)), r);
  assert.equal(r[0], 30); for (let i = 1; i < r.length; i++) assert.ok(r[i] <= r[i - 1]);
  // média da rodada da metade em 2000 partidas perto de 4
  let s = 0; for (let k = 0; k < 2000; k++) s += B.rodadaDaMetade(B.rolarDados(30, B.rngDados(k)));
  const media = s / 2000; assert.ok(media > 3.5 && media < 4.6, `média ${media}`);
  const e = S.sanear({ iniciado: true, dia: 4, creditos: 0, equipe: [{ id: 'c1', nome: 'Ana', moral: 50 }] });
  const meta = B.rodadaDaMetade(B.rolarDados(30, B.rngDados(4 * 7919 + 17)));
  const res = B.jogarDados(e, meta);
  assert.equal(res.certo, true); assert.equal(e.creditos, 40); assert.equal(e.equipe[0].moral, 53);
  assert.equal(B.jogarDados(e, meta), null, 'uma por dia'); assert.equal(B.dadosPendente(e), false);
  e.dia = 5; assert.equal(B.jogarDados(e, 99), null, 'palpite fora das opções');
  assert.deepEqual(S.sanear({ dados: { dia: 3, partidas: 2, acertos: 1 } }).dados, { dia: 3, partidas: 2, acertos: 1 });
});

test('ajuda escondida: só depois de muito tempo sem achar fonte; posição aproximada em blocos de 4', async () => {
  const B = await mod('agencia/base-viva.js');
  assert.equal(B.precisaAjuda(30, 240), false); assert.equal(B.precisaAjuda(84, 240), true); assert.equal(B.precisaAjuda(59, 100), false); assert.equal(B.precisaAjuda(60, 100), true);
  assert.deepEqual(B.posAproximada(9.5, 2.1), { x: 10, y: 2 }); assert.deepEqual(B.posAproximada(0.2, 7.9), { x: 2, y: 6 });
});

const EST = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 3, iniciado: true, dia: 8, proximoAlerta: null, proximaRapida: 999, creditos: 0, ativos: [{ id: 'm2', desde: 8, expira: 10 }],
    briefing: { dia: 8 }, confianca: { americaSul: 30 },
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0}],
    equipe: [{ id: 'c1', nome: 'Ana', retrato: 'lara', especialidade: 'campo', doses: [], moral: 85 }, { id: 'c2', nome: 'Bruno', retrato: 'caio', especialidade: 'fisica', doses: [], moral: 30 }] }, ${JSON.stringify(extra || {})}))); } catch (e) {} `;

for (const [w, h] of [[1280, 720], [390, 844]]) {
  for (const lang of ['pt', 'en']) {
    test(`telas (${w}×${h}, ${lang}): ícones no alerta; moral no dossiê; dados no Alojamento; confiança no Centro de comando`, async () => {
      const srv = await servidor(), nav = await abrirNavegador();
      try {
        const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, viewport: { width: w, height: h }, toque: w < 800, antes: EST() });
        await novoJogo(pg); await pg.waitForSelector('.ag-item[data-alerta="m2"] .ag-rende');
        const rende = await pg.textContent('.ag-item[data-alerta="m2"] .ag-rende');
        assert.match(rende, /💰 400/); assert.match(rende, lang === 'pt' ? /⏳ prazo curto/ : /⏳ short deadline/); assert.match(rende, lang === 'pt' ? /📉 região com confiança baixa/ : /📉 region with low trust/);
        await pg.click('.ag-item[data-alerta="m2"]'); assert.match(await pg.textContent('#ag-detalhe'), lang === 'pt' ? /Rende:/ : /Yields:/);
        await pg.evaluate(() => { ui.agencia.vista = 'base'; ui.agencia.abrirSala('alojamento'); }); await pg.waitForSelector('#ag-dados');
        assert.match(await pg.textContent('[data-carreira="c1"]'), lang === 'pt' ? /Moral: 85 \(animado\)/ : /Morale: 85 \(high\)/);
        assert.match(await pg.textContent('[data-carreira="c2"]'), lang === 'pt' ? /Moral: 30 \(desanimado\).*Ando sem ânimo/s : /Morale: 30 \(low\).*I feel down/s);
        assert.match(await pg.textContent('#ag-dados'), lang === 'pt' ? /Com 30 dados na mesa, em qual rodada vão restar 15 ou menos\?/ : /With 30 dice on the table, in which round will 15 or fewer remain\?/);
        const meta = await pg.evaluate(async () => { const B = await import('./js/agencia/base-viva.js'); return B.rodadaDaMetade(B.rolarDados(30, B.rngDados(ui.agencia.est.dia * 7919 + 17))); });
        await pg.click(`[data-ag="dados"][data-v="${meta}"]`);
        const t = await pg.textContent('#ag-dados');
        assert.match(t, lang === 'pt' ? /Acertou! \+40 créditos.*meia-vida.*3,8 rodadas/s : /Right! \+40 credits.*half-life.*3\.8 rounds/s);
        assert.equal(await pg.$$eval('[data-ag="dados"]', (x) => x.length), 0);
        await pg.evaluate(() => ui.agencia.abrirSala('comando')); await pg.waitForSelector('#ag-confianca');
        const c = await pg.textContent('#ag-confianca');
        assert.match(c, lang === 'pt' ? /América do Sul.*30/s : /South America.*30/s);
        assert.match(c, lang === 'pt' ? /hoje 98 % do normal/ : /now 98 % of normal/);
        const sw = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= w + 1, `sem rolagem horizontal (${sw})`);
        if (lang === 'en') assert.doesNotMatch(c + t, /Confiança|América do|dados|rodada|créditos/);
        assert.deepEqual(erros, []);
      } finally { await nav.close(); await srv.fechar(); }
    });
  }
}

test('campo: moral muda a velocidade; a saída cansa; ajuda escondida aparece só depois do tempo sem achar fonte', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: EST() });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-plano');
    await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    const r = await pg.evaluate(() => { const s = window.gameScene, ag = ui.agencia, out = {};
      out.vAna = s.fatorVelocidade(); ag.equipeSaida.ativo = 'c2'; out.vBruno = s.fatorVelocidade(); ag.equipeSaida.ativo = 'c1';
      s.ultimoAchadoMs = s.elapsedMs; s.drawMinimap(); out.antes = s.ajudaMostrada;
      s.ultimoAchadoMs = s.elapsedMs - 200000; s.drawMinimap(); out.depois = s.ajudaMostrada;
      GameState.doseMissao = 0; ui.voltarAgencia(false); out.moral = ag.est.equipe.map((m) => m.moral); return out; });
    assert.equal(r.vAna, 1.03); assert.equal(r.vBruno, 0.95);
    assert.equal(r.antes, null); assert.ok(r.depois && Number.isFinite(r.depois.x));
    assert.deepEqual(r.moral, [79, 24], 'cada saída: −6');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
