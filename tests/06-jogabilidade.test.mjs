// Jogabilidade de ponta a ponta no jogo real (Chromium): as 8 missões podem ser concluídas.
// O robô usa as funções reais da cena (isBlocked, measureRadiation, handleIdentify, tryIdentify via
// botões do modal, completeMission). Limitação declarada: a caminhada é por teletransporte entre
// posições alcançáveis (verificadas por inundação sobre isBlocked); o movimento por teclado tem
// teste próprio abaixo.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

async function comPagina(opc, fn) {
  const p = await novaPagina(nav, srv.url, opc);
  try { return await fn(p); } finally { await p.ctx.close(); }
}

import { ROBO } from './helpers/robo.mjs';

for (let id = 1; id <= 8; id++) {
  test(`missão ${id}: concluível de ponta a ponta (detectar, identificar todas as fontes, tela de conclusão)`, () =>
    comPagina({ todasDesbloqueadas: true, semEncontros: true }, async ({ pg, erros }) => {
      await iniciarMissao(pg, id);
      const r = await pg.evaluate(ROBO);
      assert.ok(r.ok, JSON.stringify(r));
      await pg.waitForSelector('#complete-modal.active', { timeout: 40000 });
      const f = await pg.evaluate(() => ({
        n: window.gameScene.sources.length, achadas: window.gameScene.foundSources.length,
        estrelas: document.getElementById('complete-stars').textContent,
        salvo: JSON.parse(localStorage.getItem('radiationHunters')),
        fim: window.gameScene.fim,
      }));
      assert.equal(f.achadas, f.n);
      assert.equal(f.fim, true);
      assert.ok(f.salvo.bestStars[id] >= 1, 'estrelas gravadas');
      if (id < 8) assert.ok(f.salvo.unlockedMissions.includes(id + 1), 'próxima missão desbloqueada');
      assert.deepEqual(erros, []);
    }));
}

test('movimento por teclado: andar e correr deslocam o jogador; correr gasta fôlego', () =>
  comPagina({}, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    const r = await pg.evaluate(async () => {
      const s = window.gameScene; const livre = [];
      // põe o jogador num ponto com espaço à direita
      for (let y = 40; y < 480 && !livre.length; y += 8) for (let x = 40; x < 600; x += 8)
        if (![0, 40, 80, 120].some((d) => s.isBlocked(x + d, y))) { livre.push([x, y]); break; }
      s.player.x = livre[0][0]; s.player.y = livre[0][1];
      return { x: s.player.x, y: s.player.y };
    });
    await pg.keyboard.down('d');
    await pg.waitForTimeout(600);
    await pg.keyboard.up('d');
    const dep = await pg.evaluate(() => ({ x: window.gameScene.player.x, est: GameState.stamina }));
    assert.ok(dep.x > r.x + 3, `andou ${dep.x - r.x}px`);
    await pg.keyboard.down('Shift'); await pg.keyboard.down('a');
    await pg.waitForTimeout(600);
    await pg.keyboard.up('a'); await pg.keyboard.up('Shift');
    const fim = await pg.evaluate(() => ({ x: window.gameScene.player.x, est: GameState.stamina }));
    assert.ok(fim.x < dep.x - 3, 'correu para a esquerda');
    assert.ok(fim.est < 100, 'fôlego diminuiu');
  }));

test('toque: joystick analógico flutuante move o jogador e para ao soltar (celular 390x844)', () =>
  comPagina({ viewport: { width: 390, height: 844 } }, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    const antes = await pg.evaluate(() => {
      const s = window.gameScene;
      for (let y = 40; y < 480; y += 8) for (let x = 40; x < 600; x += 8)
        if (![0, 40, 80, 120].some((d) => s.isBlocked(x + d, y))) { s.player.x = x; s.player.y = y; return x; }
    });
    assert.equal(await pg.isVisible('#joy-zone'), true);
    await pg.mouse.move(120, 520);
    await pg.mouse.down();
    assert.equal(await pg.isVisible('#joy-base'), true, 'a base do joystick aparece onde o dedo toca');
    await pg.mouse.move(180, 520, { steps: 4 });
    await pg.waitForTimeout(600);
    const meio = await pg.evaluate(() => ({ x: window.gameScene.player.x, vec: GameState.virtualVec }));
    await pg.mouse.up();
    assert.ok(meio.x > antes + 3, `andou ${meio.x - antes}px`);
    assert.ok(meio.vec && meio.vec.x > 0.5, 'vetor analógico para a direita');
    assert.equal(await pg.evaluate(() => GameState.virtualVec), null, 'soltar zera o vetor');
    assert.equal(await pg.isVisible('#joy-base'), false);
  }));

test('pausa congela relógio e movimento; Esc retoma', () =>
  comPagina({}, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    await pg.waitForTimeout(500);
    await pg.keyboard.press('Escape');
    const a = await pg.evaluate(() => window.gameScene.elapsedMs);
    await pg.keyboard.down('d'); await pg.waitForTimeout(500); await pg.keyboard.up('d');
    const b = await pg.evaluate(() => window.gameScene.elapsedMs);
    assert.equal(a, b, 'relógio parado na pausa');
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(500);
    assert.ok((await pg.evaluate(() => window.gameScene.elapsedMs)) > b, 'relógio volta a andar');
  }));
