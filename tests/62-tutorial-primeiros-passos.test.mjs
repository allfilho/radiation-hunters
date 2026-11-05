// v3.19: tutorial curto "Primeiros passos": Geiger desde o início, 3 fontes de tipos diferentes, uma lição de 1 pergunta por fonte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria, lerLicao } from './helpers/navegador.mjs';

test('objetivo do tutorial: ligar o Geiger, procurar, comparar placas, última fonte', async () => {
  const T = await import(new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/tutorial/tutorial.js', import.meta.url).href);
  assert.equal(T.objetivoTutorial({ geigerLigado: false, achadas: 0, total: 3 }, 'pt').id, 'ligar');
  assert.equal(T.objetivoTutorial({ geigerLigado: true, achadas: 0, total: 3 }, 'pt').id, 'procurar');
  assert.equal(T.objetivoTutorial({ geigerLigado: true, achadas: 1, total: 3 }, 'pt').id, 'placas');
  assert.equal(T.objetivoTutorial({ geigerLigado: true, achadas: 2, total: 3 }, 'en').id, 'ultima');
  assert.match(T.objetivoTutorial({ geigerLigado: true, achadas: 2, total: 3 }, 'pt').progresso, /2\/3/);
  assert.equal(T.BLOCOS.length, 3);
  for (const b of T.BLOCOS) for (const l of ['pt', 'en']) {
    assert.equal(b[l].paragrafos.length, 1, 'um parágrafo só'); assert.equal(b[l].perguntas.length, 1, 'uma pergunta só');
    const q = b[l].perguntas[0]; assert.ok(q.certa >= 0 && q.certa < q.opcoes.length && q.porque);
    assert.ok(b[l].paragrafos[0].length < 420, 'cartão curto');
  }
});

test('Agência: treinamento abre o tutorial curto (3 fontes de tipos diferentes, Geiger na mão) e a Academia completa segue opcional', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt' });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    await pg.click('[data-ag="sala-academia"]');
    assert.ok(await pg.$('[data-ag="academia-completa"]'), 'botão da Academia completa');
    assert.match(await pg.textContent('.ag-cartao'), /Primeiros passos/);
    await pg.click('[data-ag="treino"]');
    await pg.waitForSelector('#story-continue', { state: 'visible' });
    await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    const d = await pg.evaluate(() => ({ t: gameScene.missionData.tutorial, geiger: gameScene.temGeiger, nomes: gameScene.sources.map((s) => s.name).sort(), id: gameScene.missionData.id }));
    assert.equal(d.t, true); assert.equal(d.geiger, true); assert.equal(d.id, 1); assert.deepEqual(d.nomes, ['Am-241', 'Cs-137', 'Sr-90']);
    await pg.waitForFunction(() => /Pressione G/.test(document.getElementById('hud-next').textContent), null, { timeout: 5000 });
    await pg.keyboard.press('g');
    await pg.waitForFunction(() => /devagar/.test(document.getElementById('hud-next').textContent), null, { timeout: 5000 });
    // bloco 2: abre a lição curta, responde certo e o retorno roda
    await pg.evaluate(() => { window.__depois = false; gameScene.tutorialBloco(2, () => { window.__depois = true; }); });
    await pg.waitForSelector('#licao-modal.active');
    assert.match(await pg.textContent('.licao-titulo'), /Blindagem/);
    await lerLicao(pg);
    await pg.click('.licao-opcao >> nth=1');
    await pg.waitForSelector('#licao-seguir'); assert.equal(await pg.$$eval('.licao-opcao.certa', (x) => x.length), 1);
    await pg.click('#licao-seguir'); await pg.waitForTimeout(200);
    assert.equal(await pg.evaluate(() => window.__depois), true);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('tutorial de ponta a ponta: 3 fontes identificadas, 3 lições curtas e a Agência é liberada', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt' });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    await pg.click('[data-ag="sala-academia"]'); await pg.click('[data-ag="treino"]');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    await pg.waitForTimeout(200);
    for (let n = 1; n <= 3; n++) {
      const r = await pg.evaluate(async () => {
        const { posicoesAlcancaveis } = await import('./js/fisica/acessibilidade.js');
        const s = window.gameScene, T = 32;
        if (!s.geigerActive) s.toggleGeiger();
        const blocked = new Set(s.blockedTiles.map((b) => b.x + ',' + b.y));
        const alc = posicoesAlcancaveis({ cols: s.mapCols, rows: s.mapRows, blocked, inicio: { x: s.player.x, y: s.player.y }, tile: T });
        const src = s.sources.find((q) => !q.found), rc = s.rectDoMovel(src.furniture);
        const cands = alc.map((p) => ({ ...p, d: Geiger.distanciaAoRetangulo(rc, p.x, p.y) })).filter((c) => c.d <= CONFIG.IDENTIFY_DISTANCE * 0.9).sort((a, b) => a.d - b.d).filter((_, i) => i % 3 === 0).slice(0, 80);
        for (const c of cands) {
          s.player.setPosition(c.x * T, c.y * T);
          const pm = Geiger.pontoMaisProximo(rc, c.x, c.y); s.playerDirection = Math.atan2(pm.y - c.y, pm.x - c.x);
          s.janelaGeiger.reset(); for (let i = 0; i < 15; i++) s.measureRadiation();
          if (s.currentReading <= CONFIG.BG_RADIATION * 2) continue;
          s.handleIdentify();
          if (!document.getElementById('identify-modal').classList.contains('active')) continue;
          const alvo = s.selectedFurniture.source;
          [...document.querySelectorAll('#isotope-buttons .isotope-btn')].find((b) => b.dataset.name === alvo.name).click();
          return { ok: true, nome: alvo.name };
        }
        return { ok: false };
      });
      assert.ok(r.ok, 'fonte ' + n + ' não detectada');
      await pg.evaluate(() => window.gameScene.fecharIdentificacao && window.gameScene.fecharIdentificacao());
      await pg.waitForSelector('#licao-modal.active');
      assert.match(await pg.textContent('.licao-titulo'), new RegExp('^' + n + ' ·'));
      await lerLicao(pg);
      const certa = await pg.evaluate(() => { const q = (window.gameScene.licaoUI.estado.L.perguntas[0]); return q.certa; });
      await pg.click(`.licao-opcao >> nth=${certa}`);
      await pg.click('#licao-seguir');
      await pg.waitForFunction(() => !document.getElementById('licao-modal').classList.contains('active'));
    }
    assert.equal(await pg.evaluate(() => window.gameScene.concluindo), true);
    await pg.waitForSelector('#complete-modal.active', { timeout: 20000 });
    await pg.evaluate(() => ui.voltarDaMissao(true));
    await pg.waitForSelector('#agencia-screen.active .ag-mapa');
    assert.equal(await pg.evaluate(() => GameState.unlockedMissions.includes(2)), true, 'concluir libera a missão 2 e a Agência');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
