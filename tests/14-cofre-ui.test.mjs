// Etapa 5e-D: interface do cofre no jogo real (Chromium). Mouse, teclado, arrastar, erros, saída, inglês e celular.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';
import { abrirCofre, itensDoJogo, guardarPorTecla, resolverCofreCerto, MATERIAL_CERTO, teclaDaPrat } from './helpers/cofre.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });
async function comPagina(opc, fn) {
  const p = await novaPagina(nav, srv.url, opc);
  try { return await fn(p); } finally { await p.ctx.close(); }
}
const M5 = { todasDesbloqueadas: true, idioma: 'pt' };
const flags = (pg) => pg.evaluate(() => ({ m: GameState.modalAberto, p: GameState.paused, emE: window.gameScene.emEncontro, t: window.gameScene.elapsedMs, x: window.gameScene.player.x, esc: GameState.currentShield }));
const retorno = (pg) => pg.textContent('.cf-retorno');
const aprend = (pg) => pg.evaluate(() => JSON.parse(JSON.stringify(GameState.aprendizado)));

test('abre com o tempo e o movimento parados; Esc e pausa não atrapalham; 1-2-3 não trocam a blindagem do Geiger', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    const itens = await itensDoJogo(pg);
    assert.ok(itens.length >= 2, 'a missão 5 tem ao menos 2 isótopos distintos');
    const antes = await flags(pg);
    await abrirCofre(pg);
    assert.equal(await pg.getAttribute('#cofre-modal', 'role'), 'dialog');
    assert.equal(await pg.getAttribute('#cofre-modal', 'aria-modal'), 'true');
    assert.equal(await pg.locator('.cf-bandeja .cf-fonte').count(), itens.length);
    assert.equal(await pg.locator('.cf-prat').count(), 3);
    await pg.keyboard.down('d'); await pg.waitForTimeout(500); await pg.keyboard.up('d');
    const a = await flags(pg);
    assert.equal(a.m, true); assert.equal(a.emE, true);
    assert.equal(a.t, (await flags(pg)).t, 'relógio parado');
    assert.equal(a.x, antes.x, 'jogador parado');
    await pg.keyboard.press('3');   // sem fonte selecionada: nada acontece e o Phaser não troca a blindagem
    assert.equal((await flags(pg)).esc, antes.esc);
    await pg.keyboard.press('Escape');   // sem nada selecionado: pede confirmação, não pausa
    await pg.waitForSelector('.cf-confirmar');
    assert.equal(await pg.isVisible('#pause-modal'), false);
    assert.equal((await flags(pg)).p, false);
    await pg.keyboard.press('Escape');   // Esc fecha a confirmação e volta ao cofre
    await pg.waitForSelector('.cf-confirmar', { state: 'detached' });
    assert.equal(await pg.$eval('#cofre-modal', (e) => e.classList.contains('active')), true);
    assert.deepEqual(erros, []);
  }));

test('fluxo certo pela interface: ficha abre, 1-2-3 guardam, blindagem por prateleira, lacrar; créditos 100% e caderno', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    await pg.click(`.cf-fonte[data-nome="${itens[0].nome}"]`);
    const ficha = await pg.textContent('.cf-ficha');
    assert.match(ficha, /meia-vida/); assert.match(ficha, /Emissões por 100 decaimentos/); assert.match(ficha, /Geiger/); assert.match(ficha, /LNHB/);
    assert.equal(await pg.isDisabled('.cf-lacrar'), true, 'lacrar só depois de tudo');
    assert.equal(await pg.getAttribute(`.cf-fonte[data-nome="${itens[0].nome}"]`, 'aria-pressed'), 'true');
    await pg.keyboard.press(teclaDaPrat[itens[0].prat]);
    assert.match(await retorno(pg), /prateleira/i);
    for (const it of itens.slice(1)) await guardarPorTecla(pg, it.nome, it.prat);
    assert.equal(await pg.locator('.cf-bandeja .cf-fonte').count(), 0);
    assert.equal(await pg.isDisabled('.cf-lacrar'), true, 'ainda faltam as blindagens');
    const usadas = [...new Set(itens.map((i) => i.prat))];
    for (const prat of usadas) assert.equal(await pg.locator(`.cf-prat.${prat} .cf-mat`).count(), 5);
    for (const prat of ['alfa', 'beta', 'gama'].filter((p) => !usadas.includes(p))) assert.equal(await pg.locator(`.cf-prat.${prat} .cf-mat`).count(), 0, 'prateleira vazia não pede blindagem');
    for (const prat of usadas) await pg.click(`.cf-prat.${prat} .cf-mat[data-material="${MATERIAL_CERTO[prat]}"]`);
    assert.equal(await pg.isDisabled('.cf-lacrar'), false);
    await pg.click('.cf-lacrar');
    const resumo = await pg.textContent('.cf-resumo');
    assert.match(resumo, /Cofre lacrado/); assert.match(resumo, /10 de 10 pontos/); assert.match(resumo, /caderno de campo/);
    await pg.click('.cf-resumo .cf-lacrar');
    await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
    assert.equal(await pg.evaluate(() => window.__cofreFim), 'fim');
    const r = await pg.evaluate(() => ({ c: window.gameScene.encontros.cofreCreditos, m: GameState.modalAberto, emE: window.gameScene.emEncontro }));
    assert.equal(r.c.length, itens.length + usadas.length);
    assert.ok(r.c.every((x) => x === 1));
    assert.equal(r.m, false); assert.equal(r.emE, false);
    const ap = await aprend(pg);
    assert.ok(ap.nos.N04 && ap.nos.N04.m >= 1, 'N04 registrado');
    assert.ok(ap.nos.N09 && ap.nos.N09.m >= 1, 'N09 registrado');
    assert.deepEqual(erros, []);
  }));

test('erro: 1º erro dá dica sem revelar e vale 40% depois; 2 erros: o cofre guarda e explica (0%)', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    const a = itens[0], errada = ['alfa', 'beta', 'gama'].filter((p) => p !== a.prat);
    await guardarPorTecla(pg, a.nome, errada[0]);
    assert.match(await retorno(pg), /Ainda não/);
    assert.equal(await pg.locator('.cf-bandeja .cf-fonte').count(), itens.length, 'continua na bandeja');
    assert.doesNotMatch(await retorno(pg), new RegExp('prateleira ' + a.prat, 'i'), 'não revela a certa');
    await pg.keyboard.press(teclaDaPrat[a.prat]);   // a fonte segue selecionada
    assert.match(await pg.textContent(`.cf-baia .cf-fonte[data-nome="${a.nome}"] .cf-selo`), /2ª/);
    const b = itens[1];
    const erradaB = ['alfa', 'beta', 'gama'].filter((p) => p !== b.prat);
    await guardarPorTecla(pg, b.nome, erradaB[0]);
    await pg.keyboard.press(teclaDaPrat[erradaB[1]]);
    assert.match(await retorno(pg), /vai para a prateleira/i);
    assert.match(await pg.textContent(`.cf-prat.${b.prat} .cf-fonte[data-nome="${b.nome}"] .cf-selo`), /×/);
    for (const it of itens.slice(2)) await guardarPorTecla(pg, it.nome, it.prat);
    for (const prat of [...new Set(itens.map((i) => i.prat))]) await pg.click(`.cf-prat.${prat} .cf-mat[data-material="${MATERIAL_CERTO[prat]}"]`);
    await pg.click('.cf-lacrar'); await pg.click('.cf-resumo .cf-lacrar');
    await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
    const c = await pg.evaluate(() => window.gameScene.encontros.cofreCreditos);
    assert.equal(c[0], 0.4); assert.equal(c[1], 0);
    assert.deepEqual(erros, []);
  }));

test('blindagem errada explica e vale menos; escolha única por prateleira (a escolhida continua legível e focável)', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
    const prat = itens[0].prat, errado = { alfa: 'chumbo', beta: 'papel', gama: 'aluminio' }[prat], outro = prat === 'gama' ? 'papel' : 'acrilico';
    await pg.click(`.cf-prat.${prat} .cf-mat[data-material="${errado}"]`);
    assert.ok(await pg.$(`.cf-retorno.erro`), 'blindagem errada ou excessiva: retorno de erro');
    assert.ok((await retorno(pg)).length > 40, 'com explicação');
    assert.equal(await pg.getAttribute(`.cf-prat.${prat} .cf-mat[data-material="${errado}"]`, 'aria-pressed'), 'true');
    await pg.click(`.cf-prat.${prat} .cf-mat[data-material="${outro}"]`, { force: true });   // segunda escolha é ignorada (aria-disabled)
    assert.equal(await pg.getAttribute(`.cf-prat.${prat} .cf-mat[data-material="${errado}"]`, 'aria-pressed'), 'true');
    assert.equal(await pg.getAttribute(`.cf-prat.${prat} .cf-mat[data-material="${outro}"]`, 'aria-pressed'), 'false');
    assert.equal(await pg.getAttribute(`.cf-prat.${prat} .cf-mat[data-material="${outro}"]`, 'aria-disabled'), 'true');
    assert.deepEqual(erros, []);
  }));

test('arrastar a fonte até a prateleira (mouse) guarda uma vez, sem deixar fonte selecionada nem fantasma', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    const [a] = await itensDoJogo(pg);
    const fonte = await pg.locator(`.cf-bandeja .cf-fonte[data-nome="${a.nome}"]`).boundingBox();
    const alvo = await pg.locator(`.cf-prat.${a.prat}`).boundingBox();
    await pg.mouse.move(fonte.x + 20, fonte.y + 20);
    await pg.mouse.down();
    await pg.mouse.move(fonte.x + 60, fonte.y + 60, { steps: 4 });
    await pg.mouse.move(alvo.x + alvo.width / 2, alvo.y + alvo.height / 2, { steps: 8 });
    assert.ok(await pg.locator('.cf-fantasma').count() === 1, 'fonte acompanha o ponteiro');
    await pg.mouse.up();
    assert.equal(await pg.locator(`.cf-prat.${a.prat} .cf-baia .cf-fonte[data-nome="${a.nome}"]`).count(), 1);
    assert.equal(await pg.locator('.cf-fantasma').count(), 0);
    await pg.waitForTimeout(50);
    assert.equal(await pg.locator('.cf-fonte[aria-pressed="true"]').count(), 0, 'nada selecionado depois de soltar');
    assert.match(await pg.textContent('.cf-prog'), /^1\//);
    assert.deepEqual(erros, []);
  }));

test('Esc com uma fonte selecionada só fecha a ficha; depois, confirmação; sair vale 0 para o que faltou e o jogo volta', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    await guardarPorTecla(pg, itens[0].nome, itens[0].prat);
    await pg.click(`.cf-bandeja .cf-fonte[data-nome="${itens[1].nome}"]`);
    await pg.keyboard.press('Escape');
    assert.equal(await pg.getAttribute(`.cf-fonte[data-nome="${itens[1].nome}"]`, 'aria-pressed'), 'false');
    assert.equal(await pg.locator('.cf-confirmar').count(), 0);
    await pg.click('.cf-fechar');
    await pg.waitForSelector('.cf-confirmar');
    await pg.click('.cf-confirmar .perigo');
    assert.match(await pg.textContent('.cf-resumo'), /Você saiu do cofre/);
    await pg.click('.cf-resumo .cf-lacrar');
    await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
    const r = await pg.evaluate(() => ({ c: window.gameScene.encontros.cofreCreditos, m: GameState.modalAberto, emE: window.gameScene.emEncontro }));
    assert.equal(r.c[0], 1); assert.ok(r.c.slice(1).every((x) => x === 0));
    assert.equal(r.m, false); assert.equal(r.emE, false);
    assert.deepEqual(erros, []);
  }));

test('inglês: textos, nomes das prateleiras e das blindagens', () =>
  comPagina({ ...M5, idioma: 'en' }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    assert.match(await pg.textContent('.cf-h1'), /Transport vault/);
    assert.match(await pg.textContent('.cf-regra'), /most penetrating/);
    assert.equal(await pg.getAttribute('#cofre-modal', 'lang'), 'en');
    const [a] = await itensDoJogo(pg);
    await pg.click(`.cf-fonte[data-nome="${a.nome}"]`);
    assert.match(await pg.textContent('.cf-ficha'), /half-life/);
    await pg.keyboard.press(teclaDaPrat[a.prat]);
    assert.match(await retorno(pg), /shelf/);
    assert.match(await pg.textContent(`.cf-prat.${a.prat} .cf-blind`), /Shielding/);
    assert.doesNotMatch(await pg.textContent('#cofre-corpo'), /prateleira|Guardar/i);
    assert.deepEqual(erros, []);
  }));

test('tela 960x640: nada estoura na horizontal; celular 390x844: a ficha vira painel inferior e o cofre cabe', async () => {
  for (const [viewport, ficha] of [[{ width: 960, height: 640 }, false], [{ width: 390, height: 844 }, true]]) {
    await comPagina({ ...M5, viewport }, async ({ pg, erros }) => {
      await iniciarMissao(pg, 5);
      await abrirCofre(pg);
      await pg.waitForTimeout(600);   // fim da animação de entrada
      const [a] = await itensDoJogo(pg);
      const larg = () => pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, c: (() => { const r = document.querySelector('.cofre-content').getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; })(), vh: innerHeight }));
      let m = await larg();
      assert.ok(m.sw <= m.cw + 1, `sem rolagem horizontal ${JSON.stringify(m)}`);
      assert.ok(m.c.l >= -1 && m.c.r <= viewport.width + 1 && m.c.b <= m.vh + 1);
      await pg.click(`.cf-bandeja .cf-fonte[data-nome="${a.nome}"]`);
      await pg.waitForTimeout(500);
      if (ficha) {
        assert.equal(await pg.$eval('.cf-ficha-wrap', (e) => e.classList.contains('aberta')), true);
        assert.ok((await pg.locator('.cf-ficha-wrap').boundingBox()).y > 100, 'painel inferior, não cobre a tela inteira');
        await pg.click('.cf-ficha-fechar');
        assert.equal(await pg.$eval('.cf-ficha-wrap', (e) => e.classList.contains('aberta')), false);
      } else assert.ok(await pg.isVisible('.cf-ficha'), 'ficha ao lado no desktop');
      m = await larg();
      assert.ok(m.sw <= m.cw + 1, 'sem rolagem horizontal depois de abrir a ficha');
      assert.deepEqual(erros, []);
    });
  }
});

test('missão completa de ponta a ponta: o cofre abre no fim, o relógio fica parado e a tela de conclusão mostra o cofre', () =>
  comPagina({ ...M5, semente: 7 }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    const { ROBO } = await import('./helpers/robo.mjs');
    const r = await pg.evaluate(ROBO);
    assert.ok(r.ok, JSON.stringify(r));
    let visto = false, t0 = null;
    for (let i = 0; i < 240; i++) {
      if (await pg.$eval('#complete-modal', (e) => e.classList.contains('active'))) break;
      await pg.waitForTimeout(250);
      if (await pg.$eval('#cofre-modal', (e) => e.classList.contains('active'))) {
        visto = true;
        t0 = await pg.evaluate(() => window.gameScene.elapsedMs);
        await pg.waitForTimeout(400);
        assert.equal(await pg.evaluate(() => window.gameScene.elapsedMs), t0, 'relógio parado dentro do cofre');
        await resolverCofreCerto(pg);
      } else if (await pg.$eval('#encontro-modal', (e) => e.classList.contains('active'))) {
        const alt = await pg.$('#enc-corpo .enc-opcao');
        if (alt) {
          const val = await pg.evaluate(async () => {
            const { PERGUNTAS: P } = await import('/js/data/encontros/perguntas.js');
            const q = P.find((x) => x.pt.enunciado === document.getElementById('enc-enunciado').textContent || x.en.enunciado === document.getElementById('enc-enunciado').textContent);
            return q ? q.correta : 0;
          });
          await pg.click(`#enc-corpo .enc-opcao[data-val="${val}"]`);
        } else if (await pg.$('#enc-corpo .enc-continuar')) await pg.click('#enc-corpo .enc-continuar');
      }
    }
    assert.ok(visto, 'o cofre apareceu antes da conclusão');
    await pg.waitForSelector('#complete-modal.active', { timeout: 20000 });
    const f = await pg.evaluate(() => ({ det: document.getElementById('complete-aprov-detalhe').textContent, aprov: document.getElementById('complete-aproveitamento').textContent, c: window.gameScene.encontros.cofreCreditos }));
    assert.match(f.det, /cofre|vault/i);
    assert.ok(f.c.length >= 2 && f.c.every((x) => x === 1));
    assert.ok(parseInt(f.aprov) >= 85, f.aprov);
    assert.deepEqual(erros, []);
  }));

test('foco: abre na primeira fonte e nunca cai no <body> depois de guardar, escolher blindagem ou fechar a ficha com Esc', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    const dentro = () => pg.evaluate(() => document.getElementById('cofre-modal').contains(document.activeElement) && document.activeElement !== document.body);
    assert.equal(await dentro(), true, 'foco entra no cofre ao abrir');
    const itens = await itensDoJogo(pg);
    await pg.click(`.cf-fonte[data-nome="${itens[0].nome}"]`);
    await pg.keyboard.press('Escape');
    assert.equal(await dentro(), true, 'depois do Esc que fecha a ficha');
    for (const it of itens) { await guardarPorTecla(pg, it.nome, it.prat); assert.equal(await dentro(), true, 'depois de guardar ' + it.nome); }
    const [k] = [...new Set(itens.map((i) => i.prat))];
    await pg.click(`.cf-prat.${k} .cf-mat[data-material="${MATERIAL_CERTO[k]}"]`);
    assert.equal(await dentro(), true, 'depois de escolher a blindagem');
    assert.deepEqual(erros, []);
  }));

test('Tab fica dentro do cofre (inclusive no celular, com a ficha escondida) em 40 voltas de Tab e Shift+Tab', () =>
  comPagina({ ...M5, viewport: { width: 390, height: 844 } }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    await pg.waitForTimeout(400);
    const dentro = () => pg.evaluate(() => document.getElementById('cofre-modal').contains(document.activeElement));
    for (let i = 0; i < 40; i++) { await pg.keyboard.press('Tab'); assert.equal(await dentro(), true, 'Tab ' + i); }
    for (let i = 0; i < 40; i++) { await pg.keyboard.press('Shift+Tab'); assert.equal(await dentro(), true, 'Shift+Tab ' + i); }
    assert.deepEqual(erros, []);
  }));

test('reiniciar a missão com o cofre aberto: fecha, solta o jogo, sem fantasma nem erro; o novo cofre abre normalmente depois', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    await pg.evaluate(() => { const g = document.createElement('div'); g.className = 'cf-fantasma'; document.body.append(g); window.gameScene.restartMission(); });
    await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
    assert.equal(await pg.locator('.cf-fantasma').count(), 0);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources && window.gameScene.sources.length);
    await pg.waitForTimeout(300);
    const f = await pg.evaluate(() => ({ m: GameState.modalAberto, emE: window.gameScene.emEncontro, p: GameState.paused }));
    assert.deepEqual(f, { m: false, emE: false, p: false });
    await abrirCofre(pg);
    assert.ok(await pg.locator('.cf-bandeja .cf-fonte').count() >= 2);
    assert.deepEqual(erros, []);
  }));

// ---- revisão do cofre, etapa 2 (27/10/2026): UX no celular, blindagem travada, 960x640, atalhos só no teclado ----
test('celular: guardar (certo ou errado) fecha a ficha e o retorno fica à vista; a alça de fechar tem 44 px', () =>
  comPagina({ ...M5, viewport: { width: 390, height: 844 }, toque: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5);
    await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    const aberta = () => pg.$eval('.cf-ficha-wrap', (e) => e.classList.contains('aberta'));
    await pg.tap(`.cf-bandeja .cf-fonte[data-nome="${itens[0].nome}"]`);
    await pg.waitForTimeout(300);
    assert.equal(await aberta(), true);
    const alca = await pg.locator('.cf-ficha-fechar').boundingBox();
    assert.ok(alca.height >= 44 && alca.width >= 44, `alça ${alca.width}x${alca.height}`);
    // guarda na prateleira ERRADA primeiro (botão da ficha): a ficha fecha e o retorno de erro aparece dentro da tela
    const errada = ['alfa', 'beta', 'gama'].find((k) => k !== itens[0].prat);
    await pg.tap(`.cf-f-acoes button:nth-child(${['alfa', 'beta', 'gama'].indexOf(errada) + 1})`);
    await pg.waitForTimeout(350);
    assert.equal(await aberta(), false, 'a ficha fecha depois de errar');
    const r = await pg.locator('.cf-retorno').boundingBox();
    assert.ok(r && r.y >= 0 && r.y + r.height <= 845, 'retorno dentro da tela ' + JSON.stringify(r));
    const vis = await pg.evaluate(() => { const e = document.querySelector('.cf-retorno'), b = e.getBoundingClientRect(), f = document.querySelector('.cf-ficha-wrap').getBoundingClientRect(); return getComputedStyle(document.querySelector('.cf-ficha-wrap')).visibility === 'hidden' || f.top >= b.bottom; });
    assert.equal(vis, true, 'a ficha não cobre o retorno');
    assert.deepEqual(erros, []);
  }));

test('toque: o rodapé mostra "arrastar" e some com os atalhos de teclado; no mouse é o contrário', async () => {
  await comPagina({ ...M5, viewport: { width: 390, height: 844 }, toque: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    assert.equal(await pg.isVisible('.cf-atalhos-teclado'), false); assert.equal(await pg.isVisible('.cf-atalhos-toque'), true);
    assert.equal(await pg.locator('.cf-tecla').first().isVisible(), false);
    assert.deepEqual(erros, []);
  });
  await comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    assert.equal(await pg.isVisible('.cf-atalhos-teclado'), true); assert.equal(await pg.isVisible('.cf-atalhos-toque'), false);
    assert.deepEqual(erros, []);
  });
});

test('blindagem travada: grupo com aria-pressed, as outras opções apagadas e uma nota fixa explica', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
    const prat = itens[0].prat, sel = `.cf-prat.${prat}`;
    assert.equal(await pg.getAttribute(`${sel} .cf-blind`, 'role'), 'group');
    assert.equal(await pg.locator(`${sel} .cf-blind-nota`).count(), 0, 'sem nota antes de escolher');
    await pg.click(`${sel} .cf-mat[data-material="${MATERIAL_CERTO[prat]}"]`);
    assert.equal(await pg.locator(`${sel} .cf-blind-nota`).isVisible(), true);
    const op = await pg.$$eval(`${sel} .cf-mat`, (bs) => bs.map((b) => [b.dataset.material, b.getAttribute('aria-pressed'), getComputedStyle(b).opacity]));
    for (const [m, p, o] of op) { if (p === 'true') assert.equal(Number(o), 1, m + ' escolhida'); else assert.ok(Number(o) < 0.6, `${m} apagada: ${o}`); }
    assert.equal(await pg.locator(`${sel} [role="radio"]`).count(), 0, 'sem role=radio');
    assert.deepEqual(erros, []);
  }));

test('960x640 com a ficha aberta: a ficha fica à vista (rolagem própria), o botão de lacrar é alcançável e os 5 materiais cabem numa linha', () =>
  comPagina({ ...M5, viewport: { width: 960, height: 640 } }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    await pg.waitForTimeout(600);
    const itens = await itensDoJogo(pg);
    for (const it of itens.slice(0, -1)) await guardarPorTecla(pg, it.nome, it.prat);
    await pg.click(`.cf-bandeja .cf-fonte[data-nome="${itens[itens.length - 1].nome}"]`);
    await pg.waitForTimeout(300);
    const m = await pg.evaluate(() => {
      const w = document.querySelector('.cf-ficha-wrap'), c = document.querySelector('.cofre-content');
      c.scrollTop = c.scrollHeight;
      const r = w.getBoundingClientRect();
      return { pos: getComputedStyle(w).position, topo: r.top, base: r.bottom, vh: innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
    });
    assert.equal(m.pos, 'sticky'); assert.ok(m.topo >= -1 && m.base <= m.vh + 1, `ficha na tela ${JSON.stringify(m)}`);
    assert.ok(m.sw <= m.cw + 1, 'sem rolagem horizontal');
    const ys = await pg.$$eval('.cf-prat .cf-blind', (bl) => bl.map((b) => [...b.querySelectorAll('.cf-mat')].map((x) => Math.round(x.getBoundingClientRect().top))));
    for (const linha of ys) assert.equal(new Set(linha).size, 1, `materiais em mais de uma linha: ${linha}`);
    const dentro = await pg.$$eval('.cf-prat .cf-blind', (bl) => bl.every((b) => { const r = b.getBoundingClientRect(); return [...b.querySelectorAll('.cf-mat')].every((x) => x.getBoundingClientRect().right <= r.right + 1); }));
    assert.equal(dentro, true, 'nenhum material passa da borda da prateleira');
    assert.deepEqual(erros, []);
  }));

test('ficha de uma fonte guardada mostra a regra de blindagem com a citação da NRC; antes de guardar, não', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    await pg.click(`.cf-bandeja .cf-fonte[data-nome="${itens[0].nome}"]`);
    assert.equal(await pg.locator('.cf-f-regra').count(), 0, 'antes de guardar');
    await pg.keyboard.press(teclaDaPrat[itens[0].prat]);
    await pg.waitForSelector('.cf-f-regra');
    assert.match(await pg.textContent('.cf-f-regra'), /Regra de blindagem: US NRC/);
    assert.deepEqual(erros, []);
  }));

test('Am-241 guardado: escolher papel mostra a frase da gama de 59,5 keV no retorno (a missão 5 tem Am-241 com a semente padrão)', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
    const alfa = itens.filter((i) => i.prat === 'alfa').map((i) => i.nome);
    assert.ok(alfa.length, 'a missão 5 deve ter prateleira alfa (Am-241) nesta semente; se o gerador mudou, force as fontes com a opção `antes`');
    await pg.click('.cf-prat.alfa .cf-mat[data-material="papel"]');
    const txt = await retorno(pg);
    assert.ok(alfa.includes('Am-241'), 'a missão 5 com a semente padrão tem Am-241');
    assert.match(txt, /59,5 keV/);
    assert.deepEqual(erros, []);
  }));

test('selo da fonte guardada na 2ª tentativa: "2ª" (não "!"), com título e nome acessível que dizem o resultado; baia vazia tracejada', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    const errada = ['alfa', 'beta', 'gama'].find((k) => k !== itens[0].prat);
    await pg.click(`.cf-bandeja .cf-fonte[data-nome="${itens[0].nome}"]`);
    await pg.keyboard.press(teclaDaPrat[errada]);          // 1º erro (dica)
    await pg.keyboard.press(teclaDaPrat[itens[0].prat]);   // acerto na 2ª tentativa: crédito 0,4
    const b = pg.locator(`.cf-baia .cf-fonte[data-nome="${itens[0].nome}"]`);
    assert.equal((await b.locator('.cf-selo').textContent()).trim(), '2ª');
    assert.match(await b.getAttribute('title'), /2ª tentativa/);
    assert.match(await b.getAttribute('aria-label'), /2ª tentativa/);
    assert.ok(await pg.locator('.cf-baia.vazia').count() >= 1, 'há ao menos uma baia vazia');
    assert.equal(await pg.$eval('.cf-baia.vazia', (e) => getComputedStyle(e).borderTopStyle), 'dashed');
    assert.deepEqual(erros, []);
  }));

// ---- revisão final (28/10/2026): correções do relatório do Opus ----
test('blindagem: o selo segue o crédito (✓ só na certa; beta + chumbo mostra ≈, gama + alumínio mostra ×) e a escolha é descrita ao leitor de tela', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
    const pr = [...new Set(itens.map((i) => i.prat))];
    const escolha = { alfa: ['papel', '✓', 'ok'], beta: ['chumbo', '≈', 'parcial'], gama: ['aluminio', '×', 'errada'] };
    for (const p of pr) await pg.click(`.cf-prat.${p} .cf-mat[data-material="${escolha[p][0]}"]`);
    for (const p of pr) {
      const b = pg.locator(`.cf-prat.${p} .cf-mat[data-material="${escolha[p][0]}"]`);
      assert.equal((await b.locator('.cf-mat-selo').textContent()).trim(), escolha[p][1], p);
      assert.ok(await b.evaluate((e, c) => e.classList.contains(c), escolha[p][2]), p);
      assert.ok((await b.getAttribute('title')).length > 10 && (await b.getAttribute('aria-description')).length > 10, p);
      assert.equal(await pg.locator(`.cf-prat.${p} .cf-mat-selo`).count(), 1, 'só a escolhida tem selo');
    }
    assert.deepEqual(erros, []);
  }));

test('o retorno (role=status) fica no mesmo nó do DOM do começo ao fim: nunca é removido e reinserido (leitores de tela anunciam a troca de texto)', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    await pg.evaluate(() => {
      const n = document.querySelector('.cf-retorno'); window.__ret = n; window.__movs = 0;
      new MutationObserver((ms) => { for (const m of ms) for (const x of [...m.removedNodes, ...m.addedNodes]) if (x === n) window.__movs++; })
        .observe(document.querySelector('#cofre-corpo'), { childList: true, subtree: true });
    });
    const itens = await itensDoJogo(pg);
    for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
    await pg.click(`.cf-prat.${itens[0].prat} .cf-mat[data-material="${MATERIAL_CERTO[itens[0].prat]}"]`);
    const r = await pg.evaluate(() => ({ mesmo: document.querySelector('.cf-retorno') === window.__ret, movs: window.__movs, role: window.__ret.getAttribute('role'), vivo: window.__ret.getAttribute('aria-live') }));
    assert.deepEqual(r, { mesmo: true, movs: 0, role: 'status', vivo: 'polite' });
    assert.deepEqual(erros, []);
  }));

test('960x640, tudo guardado e blindagens escolhidas: o botão "Lacrar o cofre" está à vista sem rolar', () =>
  comPagina({ ...M5, viewport: { width: 960, height: 640 } }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    await pg.waitForTimeout(600);
    const itens = await itensDoJogo(pg);
    for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
    for (const p of new Set(itens.map((i) => i.prat))) await pg.click(`.cf-prat.${p} .cf-mat[data-material="${MATERIAL_CERTO[p]}"]`);
    await pg.waitForTimeout(300);
    const b = await pg.locator('.cf-lacrar').boundingBox();
    assert.ok(b.y >= 0 && b.y + b.height <= 640, `lacrar em y=${b.y}, altura ${b.height}`);
    assert.deepEqual(erros, []);
  }));

test('tabela do Geiger: o tipo de cada linha é cabeçalho de linha (th scope=row); o resumo é descrito pelo botão "Voltar ao campo"', () =>
  comPagina(M5, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    await pg.click(`.cf-bandeja .cf-fonte[data-nome="${itens[0].nome}"]`);
    const ths = await pg.$$eval('.cf-geiger tbody th', (t) => t.map((x) => [x.scope, x.getAttribute('aria-label')]));
    assert.ok(ths.length >= 1); for (const [s, a] of ths) { assert.equal(s, 'row'); assert.ok(a); }
    await resolverCofreCertoSemVoltar(pg);
    assert.match(await pg.getAttribute('.cf-resumo .cf-lacrar', 'aria-describedby'), /cf-res-h.*cf-res-lista.*cf-res-total/);
    assert.equal(await pg.getAttribute('.cf-resumo', 'role'), 'status');
    for (const id of ['cf-res-h', 'cf-res-lista', 'cf-res-total']) assert.equal(await pg.locator('#' + id).count(), 1, id);
    assert.deepEqual(erros, []);
  }));

async function resolverCofreCertoSemVoltar(pg) {
  const itens = await itensDoJogo(pg);
  for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
  for (const p of new Set(itens.map((i) => i.prat))) await pg.click(`.cf-prat.${p} .cf-mat[data-material="${MATERIAL_CERTO[p]}"]`);
  await pg.click('.cf-lacrar:not([disabled])');
  await pg.waitForSelector('.cf-resumo .cf-lacrar');
}

test('celular: o botão da prateleira tem 44 px e, depois de guardar, o retorno fica dentro da tela', () =>
  comPagina({ ...M5, viewport: { width: 390, height: 844 }, toque: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 5); await abrirCofre(pg);
    const itens = await itensDoJogo(pg);
    await pg.waitForTimeout(500);   // fim da animação de entrada (escala .985)
    const h = await pg.locator('.cf-prat-btn').first().boundingBox();
    assert.ok(h.height >= 43.5, `prateleira ${h.height}`);
    for (const it of itens) { await pg.tap(`.cf-bandeja .cf-fonte[data-nome="${it.nome}"]`); await pg.waitForTimeout(250); await pg.tap(`.cf-f-acoes button:nth-child(${['alfa', 'beta', 'gama'].indexOf(it.prat) + 1})`); await pg.waitForTimeout(250); }
    const r = await pg.locator('.cf-retorno').boundingBox();
    assert.ok(r.y >= 0 && r.y + r.height <= 845, `retorno em y=${r.y} h=${r.height}`);
    assert.deepEqual(erros, []);
  }));
