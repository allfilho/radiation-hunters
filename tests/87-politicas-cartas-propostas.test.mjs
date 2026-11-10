// v3.40: Políticas da Agência (1 de 2), cartas de campo (1 de 3) e propostas do cliente (tentação com consequência).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('políticas: abrem com 3, 8 e 15 alertas concluídos; 1 de 2; permanentes; efeitos combinados', async () => {
  const D = await mod('agencia/decisoes.js'), S = await mod('agencia/simulacao.js');
  const e = S.sanear({ iniciado: true, concluidos: { m2: 1 }, rapidasFeitas: 1 });
  assert.deepEqual(D.politicasPendentes(e), []);
  assert.equal(D.escolherPolitica(e, 'dose', 'revezamento'), false, 'antes do marco');
  e.rapidasFeitas = 2; assert.deepEqual(D.politicasPendentes(e).map((p) => p.id), ['dose']);
  assert.equal(D.escolherPolitica(e, 'dose', 'mapaPrevio'), false, 'opção de outra política');
  assert.equal(D.escolherPolitica(e, 'dose', 'producao'), true);
  assert.equal(D.escolherPolitica(e, 'dose', 'revezamento'), false, 'permanente');
  assert.equal(D.efeito(e, 'premioCampo'), 1.1); assert.equal(D.efeito(e, 'bonusPlano'), 0);
  e.rapidasFeitas = 20; D.escolherPolitica(e, 'informacao', 'mapaPrevio'); D.escolherPolitica(e, 'pessoal', 'plantao');
  assert.ok(Math.abs(D.efeito(e, 'premioCampo') - 0.935) < 1e-9); assert.equal(D.efeito(e, 'levantamento'), true);
  assert.equal(D.efeito(e, 'rapidas'), 1); assert.equal(D.efeito(e, 'retorno'), -0.05); assert.equal(D.efeito(e, 'prazo'), 0);
  assert.deepEqual(S.sanear({ politicas: { dose: 'producao', informacao: 'xx', zz: 'folga' } }).politicas, { dose: 'producao' });
});

test('políticas nos números do jogo: prêmio de campo, prazo dos alertas novos, limite de alta e vagas de chamados', async () => {
  const D = await mod('agencia/decisoes.js'), S = await mod('agencia/simulacao.js'), F = await mod('agencia/frota.js'), E = await mod('agencia/equipe.js');
  const e = S.sanear({ iniciado: true, ativos: [{ id: 'm2', desde: 1, expira: 20 }], politicas: { dose: 'producao' } });
  assert.equal(S.concluir(e, 'm2', 2), Math.round(S.PARAMETROS.premioMissao.easy * 1.1));
  const f = S.sanear({ iniciado: true, politicas: { pessoal: 'folga' } });
  assert.equal(F.limiteRetorno(f), E.NORMAS.retorno + 0.05);
  // resposta rápida: alertas novos com 4 dias a mais
  const g = S.sanear({ iniciado: true, dia: 10, proximoAlerta: 11, proximaRapida: 999, politicas: { informacao: 'respostaRapida' } });
  S.avancarDia(g, () => 0.5);
  const novo = g.ativos.find((x) => x.desde === 11);
  assert.ok(novo, 'um alerta novo'); assert.equal(novo.expira, 11 + S.prazoDe(novo.id) + 4);
});

test('cartas: 3 diferentes, as mesmas para o mesmo alerta e dia; propostas em cerca de 30 % dos alertas de campo', async () => {
  const D = await mod('agencia/decisoes.js');
  const c = D.sortearCartas('m2', 7);
  assert.equal(c.length, 3); assert.equal(new Set(c).size, 3); assert.deepEqual(D.sortearCartas('m2', 7), c);
  assert.ok(c.every((x) => D.IDS_CARTAS.includes(x)));
  let n = 0; for (let d = 0; d < 400; d++) if (D.propostaDe({ id: 'm2', tipo: 'missao' }, d)) n++;
  assert.ok(n > 80 && n < 160, `propostas: ${n}/400`);
  assert.equal(D.propostaDe({ id: 'i-tempo', tipo: 'investigacao' }, 3), null);
  assert.equal(D.propostaDe({ id: 'q980000001', tipo: 'rapida', pericia: true }, 3), null);
  assert.equal(D.cumpreProposta('sozinho', ['c1'], 0.5), true); assert.equal(D.cumpreProposta('sozinho', ['c1', 'c2'], null), false);
  assert.equal(D.cumpreProposta('semPlano', ['c1', 'c2'], null), true); assert.equal(D.cumpreProposta('semPlano', ['c1'], 0.5), false);
  assert.equal(D.exposicaoAlta('sozinho', [0.8], [1.2]), true); assert.equal(D.exposicaoAlta('sozinho', [0.5], [0.75]), false);
  assert.equal(D.exposicaoAlta('semPlano', [0.2, 0.1], [1.1, 0.2]), true); assert.equal(D.exposicaoAlta('semPlano', [0.9], [0.9]), false);
});

// dia em que m2 chega com proposta "sozinho" (procurado no próprio módulo)
async function diaComProposta(tipo) { const D = await mod('agencia/decisoes.js'); for (let d = 1; d < 500; d++) if (D.propostaDe({ id: 'm2', tipo: 'missao' }, d) === tipo) return d; return null; }
const EST = (dia, extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 3, iniciado: true, dia: ${dia}, proximoAlerta: null, proximaRapida: 999, creditos: 0, nota: 5, ativos: [{ id: 'm2', desde: ${dia}, expira: ${dia + 14} }], concluidos: { m4: 1, m5: 1 }, rapidasFeitas: 1,
    briefing: { dia: ${dia}, acertos: 0, respostas: 1, vistas: [] },
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0}],
    equipe: [{ id: 'c1', nome: 'Ana', retrato: 'lara', especialidade: 'campo', doses: [] }, { id: 'c2', nome: 'Bruno', retrato: 'caio', especialidade: 'fisica', doses: [] }] }, ${JSON.stringify(extra || {})}))); } catch (e) {} `;

for (const [w, h] of [[1280, 720], [390, 844]]) {
  for (const lang of ['pt', 'en']) {
    test(`telas (${w}×${h}, ${lang}): aviso e escolha de política no Centro de comando; cartas e proposta no preparo; relatório paga e audita`, async () => {
      const dia = await diaComProposta('sozinho');
      const srv = await servidor(), nav = await abrirNavegador();
      try {
        const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, viewport: { width: w, height: h }, toque: w < 800, antes: EST(dia) });
        await novoJogo(pg); await pg.waitForSelector('#ag-aviso-politica');
        assert.match(await pg.textContent('#ag-aviso-politica'), lang === 'pt' ? /Nova Política da Agência/ : /A new Agency Policy/);
        await pg.evaluate(() => { ui.agencia.vista = 'base'; ui.agencia.abrirSala('comando'); }); await pg.waitForSelector('#ag-politicas');
        const t0 = await pg.textContent('#ag-politicas');
        assert.match(t0, lang === 'pt' ? /Revezamento obrigatório.*Produção/s : /Mandatory rotation.*Production/s);
        assert.match(t0, lang === 'pt' ? /Informação antes do voo: abre com mais 5 alertas concluídos/ : /Information before the flight: opens with 5 more completed alerts/);
        await pg.click('[data-ag="politica"][data-p="dose"][data-o="revezamento"]');
        assert.deepEqual(await pg.evaluate(() => ui.agencia.est.politicas), { dose: 'revezamento' });
        assert.equal(await pg.$$eval('[data-ag="politica"][data-p="dose"]', (x) => x.length), 0);
        // preparo: 3 cartas e a proposta "sozinho"
        await pg.evaluate(() => { ui.agencia.vista = 'mapa'; ui.agencia.desenhar(false); });
        await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-cartas');
        assert.equal(await pg.$$eval('[data-ag="carta"]', (x) => x.length), 3);
        const carta = await pg.getAttribute('[data-ag="carta"]', 'data-c');
        await pg.click(`[data-ag="carta"][data-c="${carta}"]`);
        assert.equal(await pg.getAttribute(`[data-ag="carta"][data-c="${carta}"]`, 'aria-pressed'), 'true');
        assert.match(await pg.textContent('#ag-proposta'), lang === 'pt' ? /Proposta do cliente: paga \+40 % do prêmio se for só um cientista/ : /Client offer: pays \+40 % of the prize if only one scientist goes/);
        await pg.click('[data-ag="proposta"]');
        assert.match(await pg.textContent('#ag-proposta'), lang === 'pt' ? /não cumpre a condição/ : /does not meet the condition/);
        await pg.click('[data-assento="1"]'); await pg.click('[data-ag="tirar-assento"]');
        assert.match(await pg.textContent('#ag-proposta'), lang === 'pt' ? /A equipe atual cumpre a condição/ : /The current team meets the condition/);
        const sw = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= w + 1, `sem rolagem horizontal (${sw})`);
        await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
        await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
        await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
        const q = await pg.evaluate(() => ({ carta: ui.agencia.equipeSaida.carta, proposta: ui.agencia.equipeSaida.proposta, ids: ui.agencia.equipeSaida.ids }));
        assert.equal(q.carta, carta); assert.equal(q.proposta, 'sozinho'); assert.deepEqual(q.ids, ['c1']);
        // Ana recebe 1,3 mSv sozinha: a caneta passa de 75 % → extra pago e auditoria (−1 de nota)
        const r = await pg.evaluate(() => { const ag = ui.agencia, q = ag.equipeSaida; q.acum = { c1: 1.3 }; q.exato = true; GameState.doseMissao = 1.3; GameState.ultimaConclusao = { id: 2, estrelas: 2 };
          const c0 = ag.est.creditos; ui.voltarAgencia(true); return { rel: ag.relatorio, ganho: ag.est.creditos - c0, nota: ag.est.nota, dec: ag.ultimaDecisao }; });
        assert.match(r.rel, lang === 'pt' ? /Proposta do cliente cumprida: \+160 créditos/ : /Client offer met: \+160 credits/);
        assert.match(r.rel, lang === 'pt' ? /exposição desnecessária.*−1 de nota/ : /unnecessary exposure.*−1 Agency rating/);
        assert.equal(r.dec.notaDelta, -1);
        if (lang === 'en') assert.doesNotMatch(r.rel, /Proposta|créditos|Carta/);
        assert.deepEqual(erros, []);
      } finally { await nav.close(); await srv.fechar(); }
    });
  }
}

test('cartas em campo: levantamento marca as fontes, pressa encurta a meta, fôlego gasta menos, segunda chance não cobra o 1º erro', async () => {
  const dia = 3, srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: EST(dia) });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-cartas');
    await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    const r = await pg.evaluate(() => { const s = window.gameScene, q = ui.agencia.equipeSaida, out = {};
      out.semCarta = { lev: s.levantado, meta: s.metaTempoS };
      q.carta = 'levantamento'; out.lev = s.levantado;
      q.carta = 'pressa'; out.meta = s.metaTempoS;
      q.carta = 'segundaChance'; out.erro1 = s.doseDoErroDeIdentificacao(); out.erro2 = s.doseDoErroDeIdentificacao();
      q.carta = null; ui.agencia.est.politicas = { informacao: 'mapaPrevio' }; out.polLev = s.levantado; ui.agencia.est.politicas = {};
      return out; });
    assert.equal(r.semCarta.lev, false); assert.equal(r.lev, true); assert.equal(r.polLev, true);
    assert.equal(r.meta, Math.round(r.semCarta.meta * 0.75));
    assert.equal(r.erro1, 0); assert.ok(r.erro2 > 0, 'o 2º erro cobra');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
