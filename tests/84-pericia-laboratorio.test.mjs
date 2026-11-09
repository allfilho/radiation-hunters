// v3.37: Perícia de Laboratório — pesquisa de geocronologia, Ato 1 (chamado com Na-24) e Ato 2 (datação, bônus).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

const pronto = async (concluidas) => {
  const S = await mod('agencia/simulacao.js');
  const e = S.novoEstado(); e.iniciado = true; e.dia = 40; e.proximoAlerta = 9999; e.proximaRapida = 9999; e.ciencia.concluidas = concluidas;
  return { S, e };
};

test('dados do Na-24: meia-vida da IAEA, gama alto, fora de ISOTOPES, aceito pelo save', async () => {
  const D = await mod('data/isotopes.js'), C = await mod('agencia/ciencia.js'), K = await mod('fisica/componentes.js');
  assert.equal(D.NA24.name, 'Na-24'); assert.equal(D.NA24.type, 'gama');
  assert.ok(Math.abs(D.NA24.halfLifeS / 3600 - 14.96) < 0.01, 'cerca de 14,96 h');
  assert.ok(!D.ISOTOPES.some((i) => i.name === 'Na-24'), 'fora do sorteio comum');
  assert.ok(D.NA24.energyMeV > 1.37 && D.NA24.energyMeV < 2.5);
  assert.equal(C.tipoDoIsotopo('Na-24'), 'gama');
  const e = (await mod('agencia/simulacao.js')).novoEstado(); assert.equal(C.registrarColhidas(e, ['Na-24', 'Co-60']), 2); assert.equal(e.colhidas['Na-24'], 1);
  assert.equal(K.linhasGamaTexto(D.NA24, 'pt'), '1368,6 e 2754 keV'); assert.equal(K.linhasGamaTexto(D.NA24, 'en'), '1368.6 and 2754 keV');
  assert.equal(K.componentesDe(D.NA24).length, 1);
});

test('pesquisa de geocronologia: oculta sem espectrômetro, disponível depois, custa 1800 e leva 10 dias, sem equipamento', async () => {
  const C = await mod('agencia/ciencia.js'), { S, e } = await pronto({});
  assert.equal(C.estadoNo(e, 'geocronologia'), 'oculta'); assert.equal(C.NOS.geocronologia.equipamento, undefined);
  e.ciencia.concluidas = { espectrometriaGama: 1 }; assert.equal(C.estadoNo(e, 'geocronologia'), 'disponivel');
  e.creditos = 1799; assert.equal(C.iniciarCiencia(e, 'geocronologia', true).motivo, 'creditos');
  e.creditos = 2000; const r = C.iniciarCiencia(e, 'geocronologia', true); assert.ok(r.ok); assert.equal(e.creditos, 200); assert.equal(r.pronto, e.dia + 10);
  for (let i = 0; i < 10; i++) S.avancarDia(e, () => 0.5);
  assert.equal(C.estadoNo(e, 'geocronologia'), 'concluida');
});

test('Ato 1: semente fixa reservada, alerta com Na-24 e distratores, missão com addIsotope; sorteios comuns ficam abaixo da faixa', async () => {
  const R = await mod('agencia/rapidas.js');
  assert.equal(R.PERICIA_ID, 'q980000001'); assert.ok(R.ehRapida(R.PERICIA_ID));
  assert.equal(R.ehPericia(979999999), false); assert.equal(R.ehPericia(980000000), true); assert.equal(R.ehPericia(989999999), true); assert.equal(R.ehPericia(990000000), false);
  const a = R.alertaPorId(R.PERICIA_ID);
  assert.equal(a.pericia, true); assert.equal(a.iso, 'Na-24'); assert.deepEqual(a.extras, ['Co-60', 'Cs-137']); assert.equal(a.n, 2); assert.equal(a.nivel, 'pericia1');
  assert.ok(a.relato.pt.length > 80 && a.relato.en.length > 80 && a.titulo.en && a.local.pt && a.noticia.manchete.en && a.noticia.fala.pt);
  const m = R.missaoRapida(R.PERICIA_SEM, 'en'); assert.equal(m.addIsotope.name, 'Na-24'); assert.deepEqual(m.allowedIsotopes, []); assert.equal(m.numSources, 2); assert.ok(m.titulo.startsWith('Expertise'));
  for (const v of [0, 0.5, 0.999999, 0.9999999]) assert.ok(R.novaSemente(() => v, [], 3, false) < R.PERICIA_MIN, 'sorteio ' + v);
  assert.ok(!R.alertaRapida(12345).pericia);
});

test('fluxo: depois da pesquisa o Ato 1 aparece; concluir abre o Ato 2; o bônus paga muito e só uma vez', async () => {
  const sem = await pronto({ espectrometriaGama: 1 }); const R = await mod('agencia/rapidas.js');
  S: { const { S, e } = sem; S.avancarDia(e, () => 0.5); assert.ok(!e.ativos.some((x) => x.id === R.PERICIA_ID), 'sem geocronologia nada acontece'); }
  const { S, e } = await pronto({ espectrometriaGama: 1, geocronologia: 1 });
  const ev = S.avancarDia(e, () => 0.5);
  const at = e.ativos.find((x) => x.id === R.PERICIA_ID); assert.ok(at, 'Ato 1 oferecido'); assert.ok(ev.some((x) => x.tipo === 'novo' && x.id === R.PERICIA_ID));
  S.avancarDia(e, () => 0.5); assert.equal(e.ativos.filter((x) => x.id === R.PERICIA_ID).length, 1, 'não duplica');
  assert.ok(!e.ativos.some((x) => x.id === 'i-tempo'), 'Ato 2 só depois do Ato 1');
  const antes = e.creditos, g1 = S.concluir(e, R.PERICIA_ID, 2); assert.equal(g1, 500); assert.equal(e.creditos, antes + 500); assert.equal(e.pericia.feita, true);
  S.avancarDia(e, () => 0.5); const b = e.ativos.find((x) => x.id === 'i-tempo'); assert.ok(b, 'Ato 2 aberto'); assert.equal(b.expira - b.desde, 30);
  S.avancarDia(e, () => 0.5); assert.equal(e.ativos.filter((x) => x.id === 'i-tempo').length, 1);
  assert.ok(!e.ativos.some((x) => x.id === R.PERICIA_ID), 'Ato 1 não volta');
  const c0 = e.creditos, g2 = S.concluir(e, 'i-tempo', 2); assert.equal(g2, 2500); assert.equal(e.creditos, c0 + 2500); assert.equal(e.pericia.ato2, true);
  assert.ok(g2 > 4 * 600 - 1, 'bem acima do prêmio de uma investigação comum (600)');
  for (let i = 0; i < 3; i++) S.avancarDia(e, () => 0.5); assert.ok(!e.ativos.some((x) => x.id === 'i-tempo'), 'Ato 2 só uma vez');
});

test('Ato 1 vencido volta a ser oferecido; o bônus do Ato 2 vence sem punir; i-tempo nunca sai no sorteio comum', async () => {
  const R = await mod('agencia/rapidas.js');
  const { S, e } = await pronto({ espectrometriaGama: 1, geocronologia: 1 });
  S.avancarDia(e, () => 0.5); const at = e.ativos.find((x) => x.id === R.PERICIA_ID); at.expira = e.dia;   // vence agora
  const ev = S.avancarDia(e, () => 0.5); assert.ok(ev.some((x) => x.tipo === 'expirou' && x.id === R.PERICIA_ID));
  assert.ok(e.ativos.some((x) => x.id === R.PERICIA_ID), 'oferecido de novo');
  e.pericia.feita = true; e.ativos = [{ id: 'i-tempo', desde: e.dia, expira: e.dia + 1 }]; e.nota = 3; const exp = e.expirados;
  S.avancarDia(e, () => 0.5); S.avancarDia(e, () => 0.5);
  const it = e.ativos.find((x) => x.id === 'i-tempo'); assert.ok(it && it.expira > e.dia, 'prorrogado'); assert.equal(e.nota, 3); assert.equal(e.expirados, exp);
  const f = (await pronto({})).e; f.dia = 400; let visto = false;
  for (let i = 0; i < 300; i++) { f.ativos = []; const id = S.sortear(f, Math.random); if (id === 'i-tempo') visto = true; if (i % 15 === 14) f.usados = []; }
  assert.equal(visto, false, 'i-tempo só pela Perícia');
});

test('save: estado antigo ganha a Perícia zerada; valores estranhos são corrigidos; i-tempo antigo continua válido', async () => {
  const S = await mod('agencia/simulacao.js');
  assert.deepEqual(S.sanear({ v: 3, iniciado: true }).pericia, { feita: false, ato2: false });
  assert.deepEqual(S.sanear({ pericia: { feita: 1, ato2: 'x' } }).pericia, { feita: true, ato2: true });
  assert.deepEqual(S.sanear({ pericia: 'lixo' }).pericia, { feita: false, ato2: false });
  const e = S.sanear({ iniciado: true, dia: 5, ativos: [{ id: 'i-tempo', desde: 3, expira: 20 }], concluidos: { 'i-tempo': 1 }, pericia: { feita: true } });
  assert.equal(e.ativos[0].id, 'i-tempo'); assert.equal(e.concluidos['i-tempo'], 1); assert.equal(e.pericia.feita, true);
  assert.deepEqual(S.sanear(JSON.parse(JSON.stringify(e))).pericia, e.pericia);
});

test('textos pt/en: pesquisa, rótulo de tipo e lição N16 completos', async () => {
  const { TXT } = await mod('agencia/textos.js'), { CONCEITOS } = await mod('data/encontros/conceitos.js'), { PERGUNTAS } = await mod('data/encontros/perguntas.js');
  for (const L of ['pt', 'en']) {
    const x = TXT[L]; assert.ok(x.nos.geocronologia.nome && x.nos.geocronologia.desc.length > 60, L); assert.ok(x.tipoPericia.length > 5);
  }
  assert.equal(TXT.en.tipoPericia, 'Laboratory expertise');
  const n = CONCEITOS.find((c) => c.id === 'N16'); assert.ok(n && n.prereq.includes('N03') && n.pt.ficha && n.en.ficha && n.pt.fonte && n.en.fonte);
  const qs = PERGUNTAS.filter((p) => p.no === 'N16'); assert.equal(qs.length, 4); assert.ok(qs.some((p) => p.nivel === 1) && qs.some((p) => p.nivel === 2));
});

const estado = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 30, proximoAlerta: null, proximaRapida: 99, creditos: 5000, ativos: [{ id: 'q980000001', desde: 30, expira: 50 }],
    ciencia: { concluidas: { espectrometriaGama: 1, geocronologia: 1 }, andamento: {} } })); } catch (e) {} `;
for (const lang of ['pt', 'en']) {
  test(`campo (${lang}): o Ato 1 leva fontes de Na-24 (2), candidatos Na-24/Co-60/Cs-137 e a identificação certa conclui sem dose extra`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estado });
      await novoJogo(pg); await pg.waitForSelector('.ag-pino');
      await pg.click('.ag-item[data-alerta="q980000001"]');
      assert.match(await pg.textContent('.ag-janela, .ag-painel'), lang === 'pt' ? /Perícia/ : /Laboratory expertise|Expertise/);
      await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('.ag-nave-int');
      await pg.click('[data-assento="2"]'); await pg.click('[data-cartao]:not([disabled])');
      await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
      await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
      await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
      const src = await pg.evaluate(() => window.gameScene.sources.map((s) => [s.name, s.type]));
      assert.equal(src.length, 2); assert.ok(src.every((x) => x[0] === 'Na-24' && x[1] === 'gama'), JSON.stringify(src));
      await pg.evaluate(() => { const s = window.gameScene, f = s.sources[0].furniture; s.player.x = f.centerX; s.player.y = f.centerY; s.currentReading = 9999; s.handleIdentify(); });
      await pg.waitForSelector('#identify-modal.active');
      const botoes = await pg.$$eval('.isotope-btn', (e) => e.map((x) => [x.dataset.name, x.textContent]));
      assert.deepEqual(botoes.map((b) => b[0]).sort(), ['Co-60', 'Cs-137', 'Na-24']);
      if (lang === 'en') for (const b of botoes) assert.doesNotMatch(b[1], /gama|nêutron/);
      const antes = await pg.evaluate(() => GameState.doseMissao || 0);
      await pg.click('.isotope-btn[data-name="Na-24"]'); await pg.waitForSelector('#identify-feedback.visible');
      assert.ok(Math.abs((await pg.evaluate(() => GameState.doseMissao || 0)) - antes) < 0.05, 'acerto não custa dose extra');
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

// v3.37.1: a tela do Ato 2 explica o bônus e o prêmio; a pesquisa de geocronologia não diz "o material coletado abriu esta linha".
const estadoUi = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 40, creditos: 9000, proximoAlerta: null, proximaRapida: 99,
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b3',tipo:'academia',x:2,y:0,pronto:0},{id:'b4',tipo:'cofre',x:3,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0},{id:'b6',tipo:'oficina',x:1,y:1,pronto:0},{id:'b7',tipo:'biblioteca',x:2,y:1,pronto:0},{id:'b8',tipo:'laboratorio',x:3,y:1,pronto:0}],
    ativos: [{ id: 'q980000001', desde: 40, expira: 50 }, { id: 'i-tempo', desde: 40, expira: 70 }],
    ciencia: { concluidas: { espectrometriaGama: 1 }, andamento: {} } })); } catch (e) {} `;
for (const lang of ['pt', 'en']) {
  test(`telas (${lang}): pesquisa de geocronologia com texto próprio; Ato 1 e Ato 2 explicam o bônus e o prêmio`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estadoUi });
      await novoJogo(pg); await pg.waitForSelector('.ag-pino');
      await pg.click('.ag-item[data-alerta="q980000001"]');
      assert.match(await pg.textContent('.ag-janela, .ag-painel'), lang === 'pt' ? /bônus opcional de 2500 créditos/ : /optional bonus of 2500 credits/);
      await pg.click('.ag-item[data-alerta="i-tempo"]');
      const t2 = await pg.textContent('.ag-janela, .ag-painel');
      assert.match(t2, lang === 'pt' ? /Bônus opcional da Perícia: a datação completa paga 2500 créditos \(com 2 estrelas; até 3250 com 3\)/ : /Optional Expertise bonus: the full dating work pays 2500 credits \(with 2 stars; up to 3250 with 3\)/);
      if (lang === 'en') assert.doesNotMatch(t2, /Bônus|créditos|penalidade/);
      await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena'); await pg.click('[data-sala="laboratorio"]'); await pg.waitForSelector('.ag-janela');
      const cartao = await pg.textContent('[data-no="geocronologia"]');
      assert.match(cartao, lang === 'pt' ? /Disponível: a pesquisa anterior abriu esta linha/ : /Available: the previous research opened this line/);
      assert.doesNotMatch(cartao, /material coletado|collected material/);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
