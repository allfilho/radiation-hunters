// v3.38: Fase F — plano de dose antes da saída (objetivo individual, alarme do dosímetro, bônus e revisão pós-trabalho).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('margem: menor folga entre as janelas de 1, 7 e 30 dias; nunca negativa', async () => {
  const P = await mod('agencia/plano-dose.js'), E = await mod('agencia/equipe.js');
  const m = E.novoCientista('c1', 'Ana', 'lara', 'campo');
  assert.equal(P.margemMsv(m, 10), 1.5);
  m.doses = [{ dia: 10, msv: 0.4 }]; assert.equal(P.margemMsv(m, 10), 1.1);           // hoje: 1,5 − 0,4
  m.doses = [{ dia: 5, msv: 1.2 }, { dia: 8, msv: 1.3 }, { dia: 9, msv: 1.4 }, { dia: 10, msv: 0.2 }];
  assert.equal(P.margemMsv(m, 10), 0.9);                                                 // semana: 5 − 4,1 = 0,9 < dia 1,3
  m.doses = [{ dia: 10, msv: 2 }]; assert.equal(P.margemMsv(m, 10), 0);
});

test('sugestão: o maior objetivo que cabe na menor margem; avisos para quem não cabe', async () => {
  const P = await mod('agencia/plano-dose.js'), E = await mod('agencia/equipe.js');
  const a = E.novoCientista('c1', 'Ana', 'lara', 'campo'), b = E.novoCientista('c2', 'Bruno', 'caio', 'fisica');
  assert.equal(P.sugerirObjetivo([a, b], 10), 1.0);
  b.doses = [{ dia: 10, msv: 0.9 }];   // margem 0,6
  assert.equal(P.sugerirObjetivo([a, b], 10), 0.5);
  b.doses = [{ dia: 10, msv: 1.4 }];   // margem 0,1: nada cabe, sugere o menor
  assert.equal(P.sugerirObjetivo([a, b], 10), 0.25);
  assert.deepEqual(P.avisosPlano([a, b], 10, 0.25).map((x) => x.nome), ['Bruno']);
  assert.deepEqual(P.avisosPlano([a, b], 10, null), []);
  assert.equal(P.sugerirObjetivo([], 10), null);
});

test('avaliação, bônus e revisão (25 % acima) seguem a tabela; sem objetivo não há nada', async () => {
  const P = await mod('agencia/plano-dose.js');
  assert.deepEqual(P.OBJETIVOS.map((o) => [o.msv, o.bonus]), [[0.25, 0.2], [0.5, 0.15], [0.75, 0.1], [1, 0.05]]);
  let v = P.avaliarPlano(0.5, [{ id: 'c1', msv: 0.5 }, { id: 'c2', msv: 0.2 }]);
  assert.equal(v.cumprido, true); assert.equal(v.revisao, false);
  assert.equal(P.bonusPlano(0.5, 780, v.cumprido, true), 117);
  assert.equal(P.bonusPlano(0.5, 780, v.cumprido, false), 0, 'sem conclusão não há bônus');
  v = P.avaliarPlano(0.5, [{ id: 'c1', msv: 0.6 }, { id: 'c2', msv: 0.2 }]);
  assert.equal(v.cumprido, false); assert.deepEqual(v.acima, ['c1']); assert.equal(v.revisao, false, '0,6 é 20 % acima: sem revisão');
  v = P.avaliarPlano(0.5, [{ id: 'c1', msv: 0.63 }]);
  assert.equal(v.revisao, true); assert.deepEqual(v.revisados, ['c1']);
  v = P.avaliarPlano(null, [{ id: 'c1', msv: 9 }]);
  assert.equal(v.objetivo, null); assert.equal(v.cumprido, false); assert.equal(v.revisao, false);
  assert.equal(P.objetivoValido(0.3), null);
});

test('tempo até o objetivo: D = taxa × tempo', async () => {
  const P = await mod('agencia/plano-dose.js');
  assert.equal(P.tempoAteObjetivo(0.5, 0.25, 1), 900);       // faltam 0,25 mSv a 1 mSv/h = 15 min
  assert.equal(P.tempoAteObjetivo(0.5, 0.6, 1), 0);
  assert.equal(P.tempoAteObjetivo(0.5, 0.1, 0), null);
  assert.equal(P.tempoAteObjetivo(null, 0.1, 1), null);
});

test('textos pt/en do plano completos', async () => {
  const T = await mod('agencia/textos.js');
  const chaves = ['planoTit', 'planoExpl', 'planoMargem', 'planoOpcao', 'planoSem', 'planoEscolha', 'planoSugestao', 'planoSemNota', 'planoAviso', 'relPlanoOk', 'relPlanoFora', 'relPlanoRevisao', 'relPlanoSemConclusao'];
  for (const lang of ['pt', 'en']) for (const k of chaves) assert.ok(T.TXT[lang][k], `${lang}.${k}`);
  const I = await mod('i18n/pt.js'), J = await mod('i18n/en.js');
  for (const k of ['planoAria', 'planoRot', 'planoTempo', 'planoAtingido', 'alarmeDose']) {
    assert.ok(I.pt[k] && J.en[k], k);
  }
});

const estado = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 3, proximoAlerta: null, proximaRapida: 99, creditos: 0, ativos: [{ id: 'm2', desde: 3, expira: 17 }],
    equipe: [{ id: 'c1', nome: 'Ana', retrato: 'lara', especialidade: 'campo', doses: [] }, { id: 'c2', nome: 'Bruno', retrato: 'caio', especialidade: 'fisica', doses: [{ dia: 3, msv: 0.9 }] }, { id: 'c3', nome: 'Carla', retrato: 'dora', especialidade: 'medicina', doses: [] }] })); } catch (e) {} `;

// com a câmara de ionização (todos levam uma): o HUD do dosímetro mostra o tempo até o objetivo
const estadoCam = estado.replace("ativos: [{ id: 'm2', desde: 3, expira: 17 }],", "ativos: [{ id: 'm2', desde: 3, expira: 17 }], equipamentos: { camaraIonizacao: 3 },")
  .replace(/doses: \[([^\]]*)\] \}/g, "doses: [$1], equip: 'camaraIonizacao' }");
async function preparar(pg) {
  await novoJogo(pg); await pg.waitForSelector('.ag-pino');
  await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-plano');
}
async function voar(pg) {
  await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
  await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
  await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
}

for (const [w, h] of [[1280, 720], [390, 844]]) {
  for (const lang of ['pt', 'en']) {
    test(`preparo (${w}×${h}, ${lang}): plano mostra margens, sugere o objetivo, avisa e a escolha vai para o campo`, async () => {
      const srv = await servidor(), nav = await abrirNavegador();
      try {
        const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, viewport: { width: w, height: h }, toque: w < 800, antes: estado });
        await preparar(pg);
        const txt = await pg.textContent('#ag-plano');
        // padrão: sem objetivo (o bônus exige escolher); embarcam Ana e Carla (margem 1,5): sugestão de 1 mSv
        assert.match(txt, lang === 'pt' ? /Ana: margem de 1,5 mSv até o limite/ : /Ana: margin of 1\.5 mSv to the limit/);
        assert.match(await pg.textContent('#ag-plano-escolha'), lang === 'pt' ? /Sem objetivo \(padrão\): sem alarme e sem bônus/ : /No goal \(default\): no alarm and no bonus/);
        assert.equal(await pg.getAttribute('[data-ag="objetivo"][data-v="0"]', 'aria-pressed'), 'true');
        assert.match(await pg.textContent('#ag-plano-sugestao'), lang === 'pt' ? /Sugestão para esta equipe: 1 mSv/ : /Suggestion for this team: 1 mSv/);
        if (lang === 'en') assert.doesNotMatch(txt, /margem|Objetivo|bônus|Sem objetivo|Sugestão/);
        // Bruno (margem 0,6) no lugar de Carla: a sugestão cai para 0,5
        await pg.click('[data-assento="1"]'); await pg.click('[data-cartao="c2"]');
        assert.match(await pg.textContent('#ag-plano'), lang === 'pt' ? /Bruno: margem de 0,6 mSv até o limite/ : /Bruno: margin of 0\.6 mSv to the limit/);
        assert.match(await pg.textContent('#ag-plano-sugestao'), lang === 'pt' ? /Sugestão para esta equipe: 0,5 mSv/ : /Suggestion for this team: 0\.5 mSv/);
        // escolher 1 mSv: bônus de 5 % anunciado e aviso para Bruno
        await pg.click('[data-ag="objetivo"][data-v="1"]');
        const t1 = await pg.textContent('#ag-plano');
        assert.match(await pg.textContent('#ag-plano-escolha'), lang === 'pt' ? /Objetivo: 1 mSv por cientista; bônus de 5 % do prêmio/ : /Goal: 1 mSv per scientist; bonus of 5 % of the prize/);
        assert.match(t1, lang === 'pt' ? /Margem menor que o objetivo: Bruno \(0,6 mSv\)/ : /Margin smaller than the goal: Bruno \(0\.6 mSv\)/);
        await pg.click('[data-ag="objetivo"][data-v="0.25"]');
        assert.equal(await pg.getAttribute('[data-ag="objetivo"][data-v="0.25"]', 'aria-pressed'), 'true');
        assert.doesNotMatch(await pg.textContent('#ag-plano'), /Margem menor|Margin smaller/);
        const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
        assert.ok(sw <= w + 1, `sem rolagem horizontal (${sw})`);
        await voar(pg);
        assert.equal(await pg.evaluate(() => ui.agencia.equipeSaida.objetivo), 0.25);
        // sem câmara de ionização: o dosímetro mostra dose e objetivo, sem o tempo estimado
        await pg.evaluate(() => { const q = ui.agencia.equipeSaida; q.acum = { [q.lider]: 0.1 }; window.gameScene.verificarPlanoDose(q, q.lider, 1); });
        const hud = await pg.textContent('#plano-dose');
        assert.match(hud, lang === 'pt' ? /Dosímetro: 0,1 de 0,25 mSv/ : /Dosimeter: 0\.1 of 0\.25 mSv/);
        assert.doesNotMatch(hud, /cerca de|about/);
        assert.deepEqual(erros, []);
      } finally { await nav.close(); await srv.fechar(); }
    });
  }
}

for (const lang of ['pt', 'en']) {
  test(`campo e relatório (${lang}): dosímetro no HUD, alarme ao atingir o objetivo, bônus quando cumpre, revisão quando passa 25 %`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estadoCam });
      await preparar(pg);
      await pg.click('[data-ag="objetivo"][data-v="0.5"]');
      await voar(pg);
      // dose a 60 % do objetivo na taxa de 1 mSv/h: HUD mostra o tempo restante (0,2 mSv a 1 mSv/h = 12:00)
      await pg.evaluate(() => { const q = ui.agencia.equipeSaida; q.acum = { [q.lider]: 0.3 }; window.gameScene.verificarPlanoDose(q, q.lider, 1); });
      const hud = await pg.textContent('#plano-dose');
      assert.match(hud, lang === 'pt' ? /Dosímetro: 0,3 de 0,5 mSv · cerca de 12:00 até o objetivo/ : /Dosimeter: 0\.3 of 0\.5 mSv · about 12:00 to the goal/);
      assert.equal(await pg.isVisible('#plano-dose'), true);
      // atinge o objetivo: alarme uma vez
      await pg.evaluate(() => { const q = ui.agencia.equipeSaida; q.acum[q.lider] = 0.5; window.gameScene.verificarPlanoDose(q, q.lider, 1); });
      const aviso = await pg.textContent('#notification');
      assert.match(aviso, lang === 'pt' ? /Alarme do dosímetro de Ana: objetivo de 0,5 mSv atingido/ : /Ana’s dosimeter alarm: goal of 0\.5 mSv reached/);
      assert.match(await pg.textContent('#plano-dose'), lang === 'pt' ? /objetivo atingido/ : /goal reached/);
      assert.equal(await pg.evaluate(() => ui.agencia.equipeSaida.alarmes[ui.agencia.equipeSaida.lider]), true);
      // fim: cumprido (0,5 e 0,1) com missão concluída → bônus de 15 % do prêmio
      const r = await pg.evaluate(() => { const ag = ui.agencia, q = ag.equipeSaida, c0 = ag.est.creditos; q.acum = { [q.ids[0]]: 0.5, [q.ids[1]]: 0.1 }; q.exato = true;
        ag.retornar({ concluida: true, estrelas: 3, dose: 0.6, fontes: 0 }); return { ganho: ag.est.creditos - c0, rel: ag.relatorio, plano: ag.ultimoPlano }; });
      assert.equal(r.plano.cumprido, true); assert.ok(r.plano.bonus > 0);
      assert.match(r.rel, lang === 'pt' ? new RegExp(`Plano de dose cumprido \\(objetivo 0,5 mSv\\): bônus de ${r.plano.bonus} créditos`) : new RegExp(`Dose plan met \\(goal 0\\.5 mSv\\): bonus of ${r.plano.bonus} credits`));
      const S = await pg.evaluate(async () => (await import('./js/agencia/simulacao.js')).PARAMETROS);
      const premio = Math.round(S.premioMissao.easy * S.fatorEstrelas[3]);
      assert.equal(r.plano.bonus, Math.round(premio * 0.15));
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('revisão pós-trabalho: dose 30 % acima do objetivo deixa a equipe 1 dia a mais ocupada e não paga bônus', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado });
    await preparar(pg);
    await pg.click('[data-ag="objetivo"][data-v="0.5"]');
    await voar(pg);
    const r = await pg.evaluate(() => { const ag = ui.agencia, q = ag.equipeSaida, ids = [...q.ids];
      q.acum = { [ids[0]]: 0.65, [ids[1]]: 0.1 }; q.exato = true;
      const sem = ag.est.creditos; ag.retornar({ concluida: true, estrelas: 3, dose: 0.75, fontes: 0 });
      const oc = ids.map((id) => ag.est.equipe.find((m) => m.id === id).ocupadoAte);
      return { rel: ag.relatorio, plano: ag.ultimoPlano, oc, dia: ag.est.dia, nave: ag.est.naves.find((n) => n.missao && n.missao.tipo === 'retorno').missao.chegaEm }; });
    assert.equal(r.plano.cumprido, false); assert.equal(r.plano.revisao, true); assert.equal(r.plano.bonus, 0);
    assert.match(r.rel, /Plano de dose não cumprido \(objetivo 0,5 mSv\): Ana passou\./);
    assert.match(r.rel, /Revisão pós-trabalho: Ana passou o objetivo em mais de 25 %; a equipe fica 1 dia a mais/);
    for (const o of r.oc) assert.equal(o, r.nave + 1, 'toda a equipe: volta do voo + 1 dia de revisão');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('sem escolher objetivo: nada muda (sem HUD do dosímetro, sem bônus, prêmio igual ao de antes)', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado });
    await preparar(pg); await voar(pg);
    const r = await pg.evaluate(() => { const ag = ui.agencia, q = ag.equipeSaida; window.gameScene.verificarPlanoDose(q, q.lider, 1);
      const hud = document.getElementById('plano-dose').hidden; const c0 = ag.est.creditos; q.acum = { [q.ids[0]]: 0.2 }; q.exato = true;
      ag.retornar({ concluida: true, estrelas: 3, dose: 0.2, fontes: 0 }); return { obj: q.objetivo, hud, ganho: ag.est.creditos - c0, rel: ag.relatorio }; });
    assert.equal(r.obj, null); assert.equal(r.hud, true);
    const S = await pg.evaluate(async () => (await import('./js/agencia/simulacao.js')).PARAMETROS);
    assert.equal(r.ganho, Math.round(S.premioMissao.easy * S.fatorEstrelas[3]));
    assert.doesNotMatch(r.rel, /Plano de dose/);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
