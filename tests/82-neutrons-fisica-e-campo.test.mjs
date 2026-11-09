// v3.35: Fase E (parte 1) — fonte Am-241/Be, Geiger sem contagem de nêutrons, placa de polietileno, árvore e detector de nêutrons.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const near = (a, b, tol, m = '') => assert.ok(Math.abs(a - b) <= tol, `${m} ${a} vs ${b}`);

test('Am-241/Be fica fora de ISOTOPES; componentes: nêutron + gama de 4,44 MeV com peso 0,75; espectrômetro lista as linhas', async () => {
  const I = await mod('data/isotopes.js'), C = await mod('fisica/componentes.js'), K = await mod('data/candidatos.js');
  assert.ok(!I.ISOTOPES.some((i) => i.name === 'Am-241/Be'), 'não entra no sorteio de fontes');
  const cs = C.componentesDe(I.AMBE); assert.deepEqual(cs.map((c) => c.tipo), ['neutron', 'gama']); assert.equal(cs[1].energyMeV, 4.44); assert.equal(cs[1].peso, 0.75);
  cs[0].peso = 99; assert.equal(C.componentesDe(I.AMBE)[0].peso, 1, 'devolve cópia');
  assert.equal(C.linhasGamaTexto(I.AMBE, 'pt'), '60 e 4440 keV'); assert.equal(C.linhasGamaTexto(I.AMBE, 'en'), '60 and 4440 keV');
  assert.match(C.nomesDasComponentes(I.AMBE, 'pt'), /nêutron e gama/); assert.match(C.nomesDasComponentes(I.AMBE, 'en'), /neutron and gamma/);
  assert.match(K.rotuloDoCandidato(I.AMBE, 'pt'), /^n\+γ nêutron e gama · γ ≈ 4,44 MeV$/);
  assert.equal(I.AMBE.halfLifeS, I.ISOTOPES.find((i) => i.name === 'Am-241').halfLifeS, 'meia-vida do Am-241');
});

const livre = { tileM: 1, paredeCm: 20, ehParede: () => false, blindagem: null };
const fonte = (extra = {}) => ({ type: 'neutron', base: 200, x: 0, y: 0, rect: { x: -0.5, y: -0.5, w: 1, h: 1 }, found: false, componentes: [{ tipo: 'neutron', peso: 1 }, { tipo: 'gama', peso: 0.75, energyMeV: 4.44 }], ...extra });
const sonda = (d) => ({ x: d, y: 0, dir: Math.PI });

test('Geiger não conta nêutrons (só a parte gama), enquanto o detector conta; 1/d²; achada não conta', async () => {
  const G = await mod('fisica/geiger.js');
  const f = fonte(), soGama = fonte({ componentes: [{ tipo: 'gama', peso: 0.75, energyMeV: 4.44 }] }), soN = fonte({ componentes: [{ tipo: 'neutron', peso: 1 }] });
  near(G.taxaFonte(f, sonda(2), livre), G.taxaFonte(soGama, sonda(2), livre), 1e-9, 'Geiger = só gama');
  assert.equal(G.taxaFonte(soN, sonda(2), livre), 0, 'fonte só de nêutrons é invisível ao Geiger');
  const n1 = G.taxaNeutronsEsperada([soN], sonda(1), livre) - G.FUNDO_NEUTRON_CPS, n2 = G.taxaNeutronsEsperada([soN], sonda(2), livre) - G.FUNDO_NEUTRON_CPS;
  near(n1 / n2, 4, 1e-9, '1/d²'); near(n1, 200, 1e-9, 'base a 1 m');
  assert.equal(G.taxaNeutronsEsperada([{ ...soN, found: true }], sonda(1), livre), G.FUNDO_NEUTRON_CPS, 'achada some');
  assert.equal(G.taxaNeutronsEsperada([f], { x: 0, y: 0, dir: 0 }, { ...livre, params: undefined }) > 0, true);
});

test('blindagem de nêutrons: polietileno 5 cm corta muito; chumbo 1 cm, alumínio e acrílico quase nada; parede de concreto atenua; gama quase não muda', async () => {
  const G = await mod('fisica/geiger.js'), S = await mod('data/shields.js');
  const soN = fonte({ componentes: [{ tipo: 'neutron', peso: 1 }] }), n = (bl) => G.taxaNeutronsEsperada([soN], sonda(1), { ...livre, blindagem: bl }) - G.FUNDO_NEUTRON_CPS;
  const base = n(null);
  const pe = n(S.PLACA_NEUTRON), pb = n(S.SHIELDS.find((s) => s.key === 'pb')), al = n(S.SHIELDS.find((s) => s.key === 'alu')), ac = n(S.SHIELDS.find((s) => s.key === 'acr'));
  assert.ok(pe / base < 0.45, `polietileno ${pe / base}`); assert.ok(pb / base > 0.98 && al / base > 0.98 && ac / base > 0.9, `${pb / base} ${al / base} ${ac / base}`);
  assert.ok(pe < ac && ac < al && al < base || (pe < ac && pe < al), 'ordem: polietileno é o melhor');
  const parede = G.taxaNeutronsEsperada([soN], sonda(1), { ...livre, ehParede: (x) => x === 0 }) - G.FUNDO_NEUTRON_CPS;
  assert.ok(parede < base, 'parede atenua');
  const gama = (bl) => G.taxaFonte(fonte({ componentes: [{ tipo: 'gama', peso: 1, energyMeV: 4.44 }] }), sonda(1), { ...livre, blindagem: bl });
  assert.ok(gama(S.PLACA_NEUTRON) / gama(null) > 0.5, 'polietileno pouco atenua o gama de 4,4 MeV no modelo');
  assert.equal(S.SHIELDS.length, 4, 'SHIELDS (cofre) não mudou'); assert.equal(S.PLACA_NEUTRON.id, 4); assert.equal(S.PLACA_NEUTRON.material, 'polietileno');
});

test('árvore: nêutrons exige espectrometria concluída E Am-241/Be coletado; custo, equipamento, nome aceito no save', async () => {
  const C = await mod('agencia/ciencia.js'), S = await mod('agencia/simulacao.js'), F = await mod('agencia/frota.js');
  const e = S.novoEstado(); e.creditos = 99999; e.iniciado = true;
  assert.equal(C.estadoNo(e, 'detectorNeutrons'), 'oculta');
  C.registrarColhidas(e, ['Am-241/Be']); assert.equal(e.colhidas['Am-241/Be'], 1, 'nome com barra é aceito');
  assert.equal(C.estadoNo(e, 'detectorNeutrons'), 'oculta', 'sem espectrômetro ainda');
  e.ciencia.concluidas.espectrometriaGama = 5; assert.equal(C.estadoNo(e, 'detectorNeutrons'), 'disponivel');
  assert.equal(C.tipoDoIsotopo('Am-241/Be'), 'neutron');
  const r = C.iniciarCiencia(e, 'detectorNeutrons', true); assert.equal(r.ok, true); assert.equal(e.creditos, 99999 - 2400);
  e.dia += 14; C.avancarCiencia(e, true); assert.equal(C.estadoNo(e, 'detectorNeutrons'), 'concluida');
  e.engenheiros.push({ id: 'e1', nome: 'R', retrato: 'caio' });
  assert.equal(C.enfileirar(e, 'detectorNeutrons', true).ok, true);
  const salvo = S.sanear(JSON.parse(JSON.stringify(e))); assert.equal(salvo.colhidas['Am-241/Be'], 1); assert.ok(salvo.ciencia.concluidas.detectorNeutrons);
  assert.equal(C.equipar({ equipe: [{ id: 'c1' }], equipamentos: { detectorNeutrons: 1 } }, 'c1', 'detectorNeutrons').ok, true);
  assert.equal(S.sanear({ v: 3, iniciado: true, colhidas: { 'Am-241/Be<': 3 } }).colhidas['Am-241/Be<'], undefined, 'lixo não passa');
});

const estado = (comPesq, comDet) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 3, proximoAlerta: null, creditos: 0, ativos: [{ id: 'm2', desde: 3, expira: 17 }],
    ciencia: { concluidas: ${comPesq ? '{ espectrometriaGama: 1, detectorNeutrons: 2 }' : '{}'}, andamento: {} }, equipamentos: ${comDet ? '{ detectorNeutrons: 4 }' : '{}'},
    equipe: [1, 2, 3, 4].map((i) => ({ id: 'c' + i, nome: 'N' + i, retrato: 'lara', especialidade: 'campo', doses: [], equip: ${comDet ? "'detectorNeutrons'" : 'null'} })) })); } catch (e) {} `;
async function entrarNaMissao(pg) {
  await novoJogo(pg); await pg.waitForSelector('.ag-pino');
  await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('.ag-nave-int');
  await pg.click('[data-assento="2"]'); await pg.click('[data-cartao]:not([disabled])');
  await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
  await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
  await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
  await pg.waitForTimeout(300);
}
const virarAmBe = (pg) => pg.evaluate(() => { const s = window.gameScene; Object.assign(s.sources[0], { ...globalThis.AMBE_TESTE, fis: null }); const f = s.sources[0].furniture; s.player.x = f.centerX; s.player.y = f.centerY + 40; });

for (const lang of ['pt', 'en']) {
  test(`campo (${lang}): com pesquisa e detector, a placa 5 aparece, o mostrador de nêutrons cai com o polietileno e o Geiger não vê a fonte de nêutrons`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estado(true, true) });
      await entrarNaMissao(pg);
      await pg.evaluate(async () => { globalThis.AMBE_TESTE = (await import('/js/data/isotopes.js')).AMBE; });
      assert.equal(await pg.isVisible('#shield-pe'), true, 'placa 5 liberada');
      await virarAmBe(pg); if (!(await pg.evaluate(() => window.gameScene.geigerActive))) await pg.keyboard.press('g'); await pg.waitForTimeout(1500);
      assert.equal(await pg.isVisible('#neutron-display'), true);
      const t0 = await pg.textContent('#neutron-rot');
      assert.match(t0, lang === 'pt' ? /^Nêutrons: .* cps$/ : /^Neutrons: .* cps$/);
      const num = (x) => parseFloat(x.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
      await pg.keyboard.press('5'); await pg.waitForTimeout(2200);
      assert.equal(await pg.evaluate(() => GameState.currentShield), 4, 'tecla 5 seleciona o polietileno');
      const t1 = await pg.textContent('#neutron-rot');
      assert.ok(num(t1) < num(t0) * 0.7, `polietileno reduz os nêutrons (sem: ${t0}; com: ${t1})`);
      await pg.keyboard.press('4'); await pg.waitForTimeout(2200);
      assert.ok(num(await pg.textContent('#neutron-rot')) > num(t1) * 1.3, 'chumbo não resolve');
      const gama = await pg.evaluate(() => { const s = window.gameScene; return s.lastRate; });
      assert.ok(gama < 400, 'taxa do Geiger finita'); 
      if (lang === 'en') assert.doesNotMatch(t1, /Nêutrons/);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('sem pesquisa e sem detector: placa 5 escondida, tecla 5 ignorada, mostrador de nêutrons oculto', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado(false, false) });
    await entrarNaMissao(pg); await pg.waitForTimeout(900);
    assert.equal(await pg.isVisible('#shield-pe'), false);
    await pg.keyboard.press('5'); assert.equal(await pg.evaluate(() => GameState.currentShield), 0, 'tecla 5 sem a pesquisa é ignorada');
    assert.equal(await pg.isVisible('#neutron-display'), false);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('pesquisa feita mas sem detector na mão: a placa 5 aparece, o mostrador não', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado(true, false) });
    await entrarNaMissao(pg); await pg.waitForTimeout(900);
    assert.equal(await pg.isVisible('#shield-pe'), true); assert.equal(await pg.isVisible('#neutron-display'), false);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
