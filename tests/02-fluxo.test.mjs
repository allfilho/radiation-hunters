// Fluxo do jogo: telas, missões, pausa, identificação, conclusão, progresso.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao, passarHistoria, aguardarCenaAtiva, ativos, modalAtivo } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

async function comPagina(opc, fn) {
  const p = await novaPagina(nav, srv.url, opc);
  try { return await fn(p); } finally { await p.ctx.close(); }
}

test('carga: menu principal ativo, sem erros no console, Continue oculto', () => comPagina({}, async ({ pg, erros }) => {
  assert.deepEqual(await ativos(pg), ['main-menu']);
  assert.equal(await pg.isVisible('#btn-continue'), false);
  assert.deepEqual(erros, []);
}));

test('seleção: só a missão 1 está liberada no início (7 cartões bloqueados)', () => comPagina({}, async ({ pg }) => {
  await pg.click('#btn-missions');
  const cls = await pg.$$eval('#missions-container > *', (e) => e.map((x) => x.classList.contains('locked')));
  assert.equal(cls.length, 8);
  assert.deepEqual(cls, [false, true, true, true, true, true, true, true]);
}));

test('missão 1 pela interface: história -> jogo, canvas preenche o contêiner, 2 fontes (alfa e gama)', () => comPagina({}, async ({ pg, erros }) => {
  await iniciarMissao(pg, 1);
  assert.deepEqual(await ativos(pg), ['game-screen']);
  const dim = await pg.$eval('#game-container canvas', (c) => { const k = document.getElementById('game-container').getBoundingClientRect(), d = window.gameScene.registry.get('dpr') || 1; return [c.width, c.height, Math.round(k.width * d), Math.round(k.height * d)]; });
  assert.ok(Math.abs(dim[0] - dim[2]) <= 2 && Math.abs(dim[1] - dim[3]) <= 2, `canvas ${dim}`);
  const tipos = await pg.evaluate(() => window.gameScene.sources.map((s) => s.type).sort());
  assert.deepEqual(tipos, ['alfa', 'gama']);
  assert.deepEqual(erros, []);
}));

test('pausa: botão e Esc abrem o modal; Retomar libera o jogo', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.click('#btn-pause');
  assert.equal(await modalAtivo(pg, 'pause-modal'), true);
  assert.equal(await pg.evaluate(() => GameState.paused), true);
  await pg.click('#btn-resume');
  assert.equal(await pg.evaluate(() => GameState.paused), false);
  await aguardarCenaAtiva(pg); // scene.resume() só vale no quadro seguinte
  await pg.keyboard.press('Escape');
  assert.equal(await modalAtivo(pg, 'pause-modal'), true);
}));

test('reiniciar: zera pontuação, tentativas e combo', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.evaluate(() => { GameState.score = 500; GameState.attempts = 3; GameState.combo = 4; });
  await pg.keyboard.press('Escape');
  await pg.click('#btn-restart');
  // scene.restart() é assíncrono: espera o init() da cena zerar o estado
  await pg.waitForFunction(() => GameState.score === 0, null, { timeout: 4000 });
  await aguardarCenaAtiva(pg);
  const r = await pg.evaluate(() => [GameState.score, GameState.attempts, GameState.combo, GameState.paused]);
  assert.deepEqual(r, [0, 0, 1, false]);
}));

test('sair ao menu: volta ao menu principal', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.keyboard.press('Escape');
  await pg.click('#btn-quit');
  assert.deepEqual(await ativos(pg), ['main-menu']);
}));

async function abrirIdentificacao(pg, idx) {
  await pg.evaluate((i) => {
    const s = window.gameScene, src = s.sources[i];
    s.selectedFurniture = src.furniture;
    ui.showIdentifyModal(s.sources.filter((x) => !x.found).map((x) => ({ name: x.name, type: x.type, symbol: x.symbol })),
      (sel) => s.tryIdentify(sel));
  }, idx);
}

test('identificar errado: combo volta a 1, conta tentativa, mostra dica do tipo certo', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  const { certo, errado } = await pg.evaluate(() => {
    const n = window.gameScene.sources.map((s) => s.name); return { certo: n[0], errado: n.find((x) => x !== n[0]) };
  });
  await abrirIdentificacao(pg, 0);
  await pg.click(`.isotope-btn:has(.isotope-name:text-is("${errado}"))`);
  const r = await pg.evaluate(() => [GameState.combo, GameState.attempts, GameState.correct]);
  assert.deepEqual(r, [1, 1, 0]);
  assert.match(await pg.textContent('#identify-feedback'), /Wrong isotope/);
  assert.notEqual(certo, errado);
}));

test('identificar certo e concluir: 100*combo por acerto, modal de conclusão, próxima missão libera', () => comPagina({ semEncontros: true }, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  for (let i = 0; i < 2; i++) {
    await abrirIdentificacao(pg, i);
    const nome = await pg.evaluate((k) => window.gameScene.sources[k].name, i);
    await pg.click(`.isotope-btn:has(.isotope-name:text-is("${nome}"))`);
    if (i === 0) await pg.waitForFunction(() => !document.getElementById('identify-modal').classList.contains('active'), null, { timeout: 90000 }); // o jogo fecha o modal depois de 8 s de jogo
  }
  // o combo sobe antes de pontuar: 1º acerto = 100*2, 2º acerto = 100*3
  assert.equal(await pg.evaluate(() => GameState.score), 500);
  await pg.waitForSelector('#complete-modal.active', { timeout: 90000 });
  assert.deepEqual(await pg.evaluate(() => GameState.unlockedMissions), [1, 2]);
  assert.match(await pg.textContent('#complete-message'), /Hunter|Great|Good effort|Mission complete/);
}));

test('após acertar, o botão Cancelar vira OK e fecha a identificação na hora; após errar continua Cancel', () => comPagina({ semEncontros: true }, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  const { certo, errado } = await pg.evaluate(() => { const n = window.gameScene.sources.map((s) => s.name); return { certo: n[0], errado: n.find((x) => x !== n[0]) }; });
  await abrirIdentificacao(pg, 0);
  assert.equal((await pg.textContent('#btn-cancel-identify')).trim(), 'Cancel');
  await pg.click(`.isotope-btn:has(.isotope-name:text-is("${errado}"))`);
  assert.equal((await pg.textContent('#btn-cancel-identify')).trim(), 'Cancel');
  await pg.evaluate(() => ui.liberarEscolhas());
  await pg.click(`.isotope-btn:has(.isotope-name:text-is("${certo}"))`);
  assert.equal((await pg.textContent('#btn-cancel-identify')).trim(), 'OK');
  await pg.click('#btn-cancel-identify');
  assert.equal(await pg.evaluate(() => document.getElementById('identify-modal').classList.contains('active')), false);
  await abrirIdentificacao(pg, 1);   // reabrir restaura o rótulo
  assert.equal((await pg.textContent('#btn-cancel-identify')).trim(), 'Cancel');
}));

test('próxima missão: carrega a missão 2 com estatísticas zeradas', () => comPagina({}, async ({ pg }) => {
  await iniciarMissao(pg, 1);
  await pg.evaluate(() => { GameState.score = 777; GameState.unlockedMissions.push(2); ui.showCompleteModal({ time: 5, accuracy: 100, score: 777, stars: 3, message: 'x' }); });
  await pg.click('#btn-next-mission');
  await pg.waitForSelector('#story-continue', { state: 'visible' });
  await passarHistoria(pg);
  await pg.waitForFunction(() => window.gameScene?.missionData?.id === 2 && window.gameScene.gameStarted);
  const r = await pg.evaluate(() => [GameState.currentMission.id, GameState.score, GameState.attempts, window.gameScene.sources.length]);
  assert.deepEqual(r, [2, 0, 0, 5]);
}));

test('progresso: missões desbloqueadas sobrevivem ao recarregar (beforeunload)', () => comPagina({}, async ({ pg }) => {
  await pg.evaluate(() => { GameState.unlockedMissions = [1, 2, 3]; });
  await pg.reload();
  await pg.waitForFunction(() => typeof ui !== 'undefined');
  assert.deepEqual(await pg.evaluate(() => GameState.unlockedMissions), [1, 2, 3]);
}));

test('todas as 8 missões iniciam com o número de fontes e o tema declarados', async () => {
  for (let id = 1; id <= 8; id++) {
    await comPagina({ todasDesbloqueadas: true }, async ({ pg, erros }) => {
      await iniciarMissao(pg, id);
      const r = await pg.evaluate(() => [window.gameScene.sources.length, window.gameScene.missionData.numSources, window.gameScene.missionData.id]);
      assert.equal(r[0], r[1], `missão ${id}: fontes geradas`);
      assert.equal(r[2], id);
      assert.deepEqual(erros, [], `missão ${id}: erros`);
    });
  }
});

// ---- correções da etapa 3d (antes eram 'todo') ----
test('Continue: botão visível quando há progresso salvo', () =>
  comPagina({ todasDesbloqueadas: true }, async ({ pg }) => {
    assert.equal(await pg.isVisible('#btn-continue'), true);
  }));

test('salvamento: progresso gravado ao concluir a missão (não só no beforeunload)', () =>
  comPagina({}, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    await pg.evaluate(() => { const s = window.gameScene; s.sources.forEach((x) => { x.found = true; s.foundSources.push(x); }); s.completeMission(); });
    const salvo = await pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('radiationHunters')).unlockedMissions; } catch (e) { return null; } });
    assert.deepEqual(salvo, [1, 2]);
  }));

test('modais: Esc com a identificação aberta não empilha a pausa', () =>
  comPagina({}, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    await abrirIdentificacao(pg, 0);
    await pg.keyboard.press('Escape');
    const ambos = (await modalAtivo(pg, 'pause-modal')) && (await modalAtivo(pg, 'identify-modal'));
    assert.equal(ambos, false);
  }));

test('sair ao menu: o canvas do Phaser é destruído', () =>
  comPagina({}, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    await pg.keyboard.press('Escape');
    await pg.click('#btn-quit');
    // booleano de propósito: assert sobre um ElementHandle trava ao formatar a mensagem
    assert.equal(!!(await pg.$('#game-container canvas')), false);
  }));

test('configurações: dicas, tremor de tela e música alteram GameState.settings', () =>
  comPagina({}, async ({ pg }) => {
    await pg.click('#btn-settings');
    await pg.click('#show-hints'); await pg.click('#screen-shake');
    await pg.$eval('#music-volume', (e) => { e.value = 10; e.dispatchEvent(new Event('input', { bubbles: true })); });
    const s = await pg.evaluate(() => GameState.settings);
    assert.equal(s.showHints, false); assert.equal(s.screenShake, false); assert.equal(s.musicVolume, 10);
  }));

test('tempo limite: a cena considera missionData.timeLimit', async () => {
  const usa = await comPagina({}, ({ pg }) => pg.evaluate(() =>
    [GameScene, UIManager].some((c) => c.toString().includes('timeLimit'))));
  assert.equal(usa, true);
});

test('celular: existem controles de toque (direcional ou joystick)', () =>
  comPagina({ viewport: { width: 390, height: 844 } }, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    assert.ok(!!(await pg.$('.touch-controls, #joystick, #dpad')));
  }));

test('identificar: fonte dentro de móvel 3x3 (Damaged Core) pode ser identificada de perto (missões 4 e 8)', async () => {
  for (const missao of [4, 8]) {
    await comPagina({ todasDesbloqueadas: true }, async ({ pg }) => {
      await iniciarMissao(pg, missao);
      const r = await pg.evaluate(() => {
        const s = window.gameScene;
        const src = s.sources.find((x) => x.furniture.type?.width === 3 && x.furniture.type?.height === 3);
        if (!src) return { semNucleo: true };
        const f = src.furniture; let melhor = null;
        for (let x = f.x * 32 - 40; x <= (f.x + 3) * 32 + 40; x++) for (let y = f.y * 32 - 40; y <= (f.y + 3) * 32 + 40; y++) {
          if (s.isBlocked(x, y)) continue;
          const d = Math.hypot(x - f.centerX, y - f.centerY) / 32; if (!melhor || d < melhor.d) melhor = { x, y, d };
        }
        s.player.x = melhor.x; s.player.y = melhor.y;
        s.playerDirection = Math.atan2(f.centerY - melhor.y, f.centerX - melhor.x);
        s.currentReading = 9999; s.handleIdentify();
        return { selecionou: !!s.selectedFurniture };
      });
      assert.ok(r.semNucleo || r.selecionou, `missão ${missao}: fonte no núcleo não pode ser identificada`);
    });
  }
});
