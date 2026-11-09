// v3.36: Fase E (parte 2) — chamados de poço de petróleo com Am-241/Be, só depois da pesquisa do espectrômetro.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('sementes de poço: alerta determinístico com Am-241/Be, distratores separáveis, sem falso alarme; sementes comuns não mudam de tipo', async () => {
  const R = await mod('agencia/rapidas.js');
  assert.equal(R.POCO_MIN, 990000000); assert.equal(R.ehPoco(989999999), false); assert.equal(R.ehPoco(990000000), true);
  for (let x = R.POCO_MIN; x < R.POCO_MIN + 3000; x++) { const q = R.alertaRapida(x); assert.ok(q.poco && q.lat != null && q.n >= 1 && q.n <= 2 && q.local.pt, 'semente ' + x); }   // pegou um erro de sorteio dentro do find
  const a = R.alertaRapida(991234567), b = R.alertaRapida(991234567);
  assert.deepEqual(a, b, 'determinístico');
  assert.equal(a.poco, true); assert.equal(a.iso, 'Am-241/Be'); assert.deepEqual(a.extras, ['Tc-99m', 'Sr-90', 'Am-241']); assert.ok(a.n >= 1 && a.n <= 2); assert.equal(a.falso, undefined);
  assert.equal(a.bioma, 'industrial'); assert.ok(a.relato.pt.length > 60 && a.relato.en.length > 60 && a.noticia.manchete.en && a.noticia.fala.pt);
  assert.match(a.local.pt, /campo de petróleo/); assert.match(a.local.en, /oil-field/);
  for (const s of [1, 12345, 500000000, 989999999]) assert.ok(!R.alertaRapida(s).poco, 'semente comum ' + s);
  const m = R.missaoRapida(991234567, 'pt'); assert.equal(m.addIsotope.name, 'Am-241/Be'); assert.deepEqual(m.allowedIsotopes, []); assert.equal(m.numSources, a.n);
  assert.equal(R.missaoRapida(12345, 'pt').addIsotope, undefined);
  const r = () => 0.5; assert.ok(R.novaSemente(r, [], 3, true) >= R.POCO_MIN); assert.ok(R.novaSemente(r, [], 3, false) < R.POCO_MIN);
});

test('sorteio: sem a pesquisa do espectrômetro nunca sai poço (e o fluxo antigo não consome sorteio extra); com ela, sai quando o sorteio cai na chance', async () => {
  const S = await mod('agencia/simulacao.js'), R = await mod('agencia/rapidas.js');
  const roda = (concluidas, valor) => {
    const e = S.novoEstado(); e.iniciado = true; e.ciencia.concluidas = concluidas; e.proximaRapida = 1; e.dia = 1; e.rapidasFeitas = 0;
    const seq = []; let k = 0; const rand = () => { seq.push(1); return typeof valor === 'function' ? valor(k++) : valor; };
    S.avancarDia(e, rand); return { e, chamadas: seq.length };
  };
  const sem = roda({}, 0.01), com = roda({ espectrometriaGama: 1 }, 0.01);
  const rapidaSem = sem.e.ativos.find((x) => R.ehRapida(x.id)), rapidaCom = com.e.ativos.find((x) => R.ehRapida(x.id));
  assert.ok(rapidaSem && rapidaCom, 'o chamado novo entrou');
  assert.equal(R.alertaPorId(rapidaSem.id).poco, undefined, 'sem pesquisa: chamado comum');
  assert.equal(R.alertaPorId(rapidaCom.id).poco, true, 'com pesquisa e sorteio baixo: poço');
  const naoCai = roda({ espectrometriaGama: 1 }, 0.99); assert.equal(R.alertaPorId(naoCai.e.ativos.find((x) => R.ehRapida(x.id)).id).poco, undefined, 'sorteio alto: chamado comum');
});

const estado = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 30, proximoAlerta: null, proximaRapida: 99, creditos: 5000, ativos: [{ id: 'q991234567', desde: 30, expira: 50 }],
    ciencia: { concluidas: { espectrometriaGama: 1 }, andamento: {} } })); } catch (e) {} `;
for (const lang of ['pt', 'en']) {
  test(`campo (${lang}): o chamado de poço leva Am-241/Be; o Geiger lê só o gama; o modal mostra o candidato com rótulo n+γ e a identificação certa conclui sem dose extra`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estado });
      await novoJogo(pg); await pg.waitForSelector('.ag-pino');
      await pg.click('.ag-item[data-alerta="q991234567"]');
      assert.match(await pg.textContent('.ag-janela, .ag-painel'), lang === 'pt' ? /campo de petróleo|poços|poço/i : /oil/i);
      await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('.ag-nave-int');
      await pg.click('[data-assento="2"]'); await pg.click('[data-cartao]:not([disabled])');
      await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
      await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
      await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
      const src = await pg.evaluate(() => window.gameScene.sources.map((s) => [s.name, s.type, (s.componentes || []).map((c) => c.tipo).join('+')]));
      assert.ok(src.length >= 1 && src.every((x) => x[0] === 'Am-241/Be' && x[1] === 'neutron' && x[2] === 'neutron+gama'), JSON.stringify(src));
      await pg.evaluate(() => { const s = window.gameScene, f = s.sources[0].furniture; s.player.x = f.centerX; s.player.y = f.centerY; s.currentReading = 9999; s.handleIdentify(); });
      await pg.waitForSelector('#identify-modal.active');
      const botoes = await pg.$$eval('.isotope-btn', (e) => e.map((x) => [x.dataset.name, x.textContent]));
      assert.deepEqual(botoes.map((b) => b[0]).sort(), ['Am-241', 'Am-241/Be', 'Sr-90', 'Tc-99m']);
      const rot = botoes.find((b) => b[0] === 'Am-241/Be')[1];
      assert.match(rot, lang === 'pt' ? /nêutron e gama/ : /neutron and gamma/); assert.match(rot, /4[,.]44 MeV/);
      if (lang === 'en') assert.doesNotMatch(rot, /nêutron/);
      const antes = await pg.evaluate(() => GameState.doseMissao || 0);
      await pg.click('.isotope-btn[data-name="Am-241/Be"]'); await pg.waitForSelector('#identify-feedback.visible');
      assert.ok(Math.abs((await pg.evaluate(() => GameState.doseMissao || 0)) - antes) < 0.05, 'acerto não custa dose extra');
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('erro de identificação numa fonte de nêutrons mostra a dica de nêutrons (pt/en), não a de beta+gama', async () => {
  const I = await mod('i18n/pt.js'), E = await mod('i18n/en.js');
  const pt = (I.default || I.pt || Object.values(I)[0]), en = (E.default || E.en || Object.values(E)[0]);
  const achar = (o) => { const st = [o]; while (st.length) { const x = st.pop(); if (x && typeof x === 'object') { if ('neutronHint' in x) return x.neutronHint; st.push(...Object.values(x)); } } };
  assert.match(achar(pt), /nêutrons e gama/); assert.match(achar(en), /neutrons and gamma/); assert.doesNotMatch(achar(en), /nêutrons|gama/);
});

test('lição N15: nó e quatro perguntas com fatos registrados; ficha e perguntas em pt e en', async () => {
  const C = await mod('data/encontros/conceitos.js'), P = await mod('data/encontros/perguntas.js');
  const no = C.CONCEITOS.find((c) => c.id === 'N15'); assert.ok(no); assert.deepEqual(no.prereq, ['N04']);
  const qs = P.PERGUNTAS.filter((q) => q.no === 'N15'); assert.equal(qs.length, 4);
  for (const q of qs) { assert.ok(q.fatos.every((f) => /^N15-F[123]$/.test(f))); assert.ok(q.pt.enunciado && q.en.enunciado); }
  assert.doesNotMatch(qs[0].en.enunciado + qs[0].en.explicacao, /nêutron|hidrogênio/);
});
