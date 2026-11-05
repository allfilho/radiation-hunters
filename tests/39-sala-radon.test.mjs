// Etapa 3 do radônio v2: atividade interativa "sala-radon" (gráfico animado, leituras), retratos dos personagens e aviso de andar.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const M = await imp('js/investigacao/modelos.js');
const R = await imp('js/investigacao/retratos.js');
const { INVESTIGACOES } = await imp('js/investigacao/index.js');
const radon = INVESTIGACOES.find((i) => i.id === 'radonio-escola');

test('modelo sala-radon: três cenários, ventilar na aula reduz a média das aulas mas não a do fim de semana; texto PT/EN com rótulo de hipótese', () => {
  const o = Object.fromEntries(['fechada', 'janelas', 'mecanica'].map((e) => [e, M.observarAtividade('sala-radon', e)]));
  for (const e of Object.values(o)) {
    assert.equal(e.dados.hipotese, true); assert.equal(e.dados.C.length, 336); assert.ok(e.dados.C.every(Number.isFinite));
    assert.match(e.texto.pt, /hipóteses de ensino/); assert.match(e.texto.en, /teaching hypotheses/); assert.match(e.texto.en, /does not describe a real school/);
  }
  assert.ok(o.fechada.dados.fator > 0.99, 'fechada: aulas ≈ semana');
  assert.ok(o.janelas.dados.mediaOcupado < 0.3 * o.fechada.dados.mediaOcupado);
  assert.ok(o.mecanica.dados.mediaOcupado < 0.3 * o.fechada.dados.mediaOcupado);
  // à noite e no fim de semana a sala ventilada volta a acumular: o máximo é próximo do valor da sala fechada
  assert.ok(o.janelas.dados.maximo > 0.9 * o.fechada.dados.maximo);
  assert.ok(o.janelas.dados.media > o.janelas.dados.mediaOcupado);
  assert.throws(() => M.observarAtividade('sala-radon', 'xyz'));
});

test('cena nova no episódio: ordem das cenas = ordem dos locais, atividade com 3 estados, títulos numerados em sequência', () => {
  const ids = radon.cenas.map((c) => c.id);
  assert.deepEqual(ids, radon.campo.locais.map((l) => l.id));
  assert.equal(ids[1], 'ventilacao');
  const c = radon.cenas[1]; assert.deepEqual(c.atividade.estados, ['fechada', 'janelas', 'mecanica']);
  for (const l of ['pt', 'en']) radon.cenas.forEach((cc, i) => assert.ok(cc.titulo[l].startsWith(`${i + 1} · `), `${l}: ${cc.id}`));
});

test('retratos: paleta para cada personagem usado nos episódios, SVG decorativo (aria-hidden), sem imagens externas', () => {
  for (const inv of INVESTIGACOES) for (const l of inv.campo.locais) if (l.npc && R.temRetrato(l.npc)) {
    const s = R.retratoSvg(l.npc); assert.match(s, /aria-hidden="true"/); assert.ok(!/<image|href=|http/.test(s)); assert.ok(R.NOMES[l.npc]);
  }
  assert.ok(R.temRetrato('ines') && R.temRetrato('dora')); assert.equal(R.retratoSvg('inexistente'), '');
});

for (const [rotulo, viewport, toque] of [['desktop', { width: 1280, height: 800 }, false], ['celular 360×640', { width: 360, height: 640 }, true]]) {
  test(`no navegador (${rotulo}): cena de ventilação com retrato, gráfico, leituras e sem rolagem horizontal; aviso de andar ao subir`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url + '?investigacao=radonio-escola', { idioma: 'pt', viewport, toque });
      await pg.waitForFunction(() => window.gameScene?.pontosInvestigacao?.length > 0 && window.gameScene.player, null, { timeout: 30000 });
      await pg.waitForTimeout(400);
      await pg.evaluate(() => { const c = ui.investigacao.sessao.concluidas; c['pergunta-ar'] = true; });
      await pg.evaluate(() => { const s = window.gameScene, p = s.pontosInvestigacao.find((q) => q.id === 'ventilacao'); s.player.setPosition(p.x * 32, p.y * 32 + 20); s.handleIdentify(); });
      await pg.waitForSelector('#investigacao-screen.active .inv-titulo', { timeout: 8000 });
      assert.match(await pg.textContent('.inv-titulo'), /^2 · Ventilar/);
      assert.equal(await pg.locator('.inv-fala .inv-retrato svg').count(), 1);
      assert.match(await pg.textContent('.inv-fala-nome'), /Inês/);
      for (const estado of ['fechada', 'janelas', 'mecanica']) {
        await pg.click(`.inv-modelo-controles [data-estado="${estado}"]`);
        assert.equal(await pg.locator('.inv-modelo-visor svg.inv-svg path.rn-linha').count(), 1);
        assert.equal(await pg.locator('.inv-modelo-visor .inv-leitura').count(), 4);
        const larg = await pg.evaluate(() => ({ x: document.documentElement.scrollWidth, w: innerWidth, sv: document.querySelector('.inv-modelo-visor svg').getBoundingClientRect().width }));
        assert.ok(larg.x <= larg.w, `rolagem horizontal ${larg.x} > ${larg.w}`); assert.ok(larg.sv <= larg.w);
        await pg.click('#inv-registrar-observacao');
      }
      assert.equal(await pg.locator('#inv-observacoes li').count(), 3);
      assert.match(await pg.getAttribute('.inv-modelo-visor svg', 'aria-label'), /Concentração de radônio simulada/);
      // aviso de andar: sobe a escada e a faixa aparece e some sozinha
      await pg.click('#inv-voltar-mapa');
      await pg.evaluate(() => { const g = window.gameScene; g.scene.restart({ mission: g.missaoBase, piso: 'andar1', chegada: { x: 27.5, y: 11.5 } }); });
      await pg.waitForFunction(() => { const g = window.gameScene; return g.piso === 'andar1' && !g.transicao && g.player; }, null, { timeout: 15000 });
      const faixa = await pg.evaluate(() => window.gameScene.children.list.filter((o) => o.depth === 9000 && o.text).map((o) => o.text));
      assert.deepEqual(faixa, ['1º andar']);
      await pg.waitForFunction(() => !window.gameScene.children.list.some((o) => o.depth === 9000 && o.text), null, { timeout: 6000 });
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('modelo ambiente-radon: depósito e porão fechados acumulam mais que a sala; ventilação programada reduz a média das aulas; a maior parte vem do solo (hipótese rotulada)', () => {
  const o = Object.fromEntries(['sala', 'deposito', 'porao'].map((e) => [e, M.observarAtividade('ambiente-radon', e)]));
  assert.ok(o.deposito.dados.mediaFechada > 2 * o.sala.dados.mediaFechada && o.porao.dados.mediaFechada > 2 * o.sala.dados.mediaFechada);
  for (const e of Object.values(o)) {
    assert.ok(e.dados.mediaOcupado < 0.35 * e.dados.mediaFechada); assert.ok(e.dados.media > e.dados.mediaOcupado);
    assert.equal(e.dados.Cfechada.length, e.dados.C.length); assert.ok(e.dados.fracaoSolo > 0 && e.dados.fracaoSolo < 1);
    assert.match(e.texto.pt, /hipóteses de ensino/); assert.match(e.texto.en, /teaching hypotheses/); assert.match(e.texto.en, /It does not describe a real school/);
  }
  assert.throws(() => M.observarAtividade('ambiente-radon', 'xyz'));
});

test('porão: piso próprio abaixo do térreo, escada de ida e volta, cena 4 no porão', () => {
  const campo = radon.campo, P = campo.pisos;
  assert.equal(P.porao.nivel, -1); assert.ok(P.terreo.escadas.some((e) => e.para === 'porao')); assert.ok(P.porao.escadas.some((e) => e.para === 'terreo'));
  const l = campo.locais.find((x) => x.id === 'porao-ar'); assert.equal(l.piso, 'porao'); assert.equal(radon.cenas[2].id, 'porao-ar');
});

test('no navegador: no porão a cena abre, o gráfico mostra a linha do ambiente fechado e o nome do piso aparece', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url + '?investigacao=radonio-escola', { idioma: 'pt', viewport: { width: 360, height: 640 }, toque: true });
    await pg.waitForFunction(() => window.gameScene?.pontosInvestigacao?.length > 0 && window.gameScene.player, null, { timeout: 30000 });
    await pg.evaluate(() => { const c = ui.investigacao.sessao.concluidas; c['pergunta-ar'] = c['ventilacao'] = true; const g = window.gameScene; g.scene.restart({ mission: g.missaoBase, piso: 'porao', chegada: { x: 4.5, y: 12.5 } }); });
    await pg.waitForFunction(() => { const g = window.gameScene; return g.piso === 'porao' && !g.transicao && g.player && g.pontosInvestigacao?.length && g.cameras.main.fadeEffect?.isRunning === false; }, null, { timeout: 15000 });
    assert.match(await pg.textContent('#sources-tracker'), /Porão/);
    await pg.evaluate(() => { const s = window.gameScene, p = s.pontosInvestigacao.find((q) => q.id === 'porao-ar'); s.player.setPosition(p.x * 32, p.y * 32 + 20); s.handleIdentify(); });
    await pg.waitForSelector('#investigacao-screen.active .inv-titulo', { timeout: 8000 });
    assert.match(await pg.textContent('.inv-titulo'), /^3 · Porão/);
    for (const estado of ['sala', 'deposito', 'porao']) {
      await pg.click(`.inv-modelo-controles [data-estado="${estado}"]`);
      assert.equal(await pg.locator('.inv-modelo-visor svg path[stroke-dasharray="2 3"]').count(), 1);
      assert.equal(await pg.locator('.inv-modelo-visor .inv-leitura').count(), 4);
      const t = await pg.evaluate(() => ({ x: document.documentElement.scrollWidth, w: innerWidth })); assert.ok(t.x <= t.w);
      await pg.click('#inv-registrar-observacao');
    }
    assert.equal(await pg.locator('#inv-observacoes li').count(), 3);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('sótão: piso 3 acima do 1º andar; a parte dos materiais domina no sótão e o valor fechado é menor que o da sala do 1º andar, mas não zero', () => {
  const P = radon.campo.pisos; assert.equal(P.sotao.nivel, 2);
  assert.ok(P.andar1.escadas.some((e) => e.para === 'sotao') && P.sotao.escadas.some((e) => e.para === 'andar1'));
  const a = M.observarAtividade('ambiente-radon', 'andar1').dados, s = M.observarAtividade('ambiente-radon', 'sotao').dados;
  assert.ok(s.mediaFechada > 5 && s.mediaFechada < a.mediaFechada); assert.ok(s.fracaoSolo < 0.5 && a.fracaoSolo > s.fracaoSolo);
  assert.equal(radon.cenas[3].id, 'sotao-ar'); assert.equal(radon.campo.locais.find((l) => l.id === 'sotao-ar').piso, 'sotao');
  assert.match(M.observarAtividade('ambiente-radon', 'sotao').texto.pt, /materiais da construção/);
});
