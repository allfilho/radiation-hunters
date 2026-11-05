// Encontros de aprendizado no jogo real (Chromium): pontos, modal, relógio, cadeia, gatilho do Geiger,
// fim de missão, aproveitamento, configurações e caderno de campo.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';
import { ROBO } from './helpers/robo.mjs';
import { resolverCofreCerto, cofreAtivo } from './helpers/cofre.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });
async function comPagina(opc, fn) {
  const p = await novaPagina(nav, srv.url, opc);
  try { return await fn(p); } finally { await p.ctx.close(); }
}
const ir = (pg, i) => pg.evaluate((i) => {
  const s = window.gameScene; s.elapsedMs = Math.max(s.elapsedMs, 50000);
  const p = s.encontros.pontos[i]; s.player.x = p.x * 32 + 16; s.player.y = p.y * 32 + 16;
}, i);
const modalEnc = (pg) => pg.$eval('#encontro-modal', (e) => e.classList.contains('active'));

test('dois pontos fixos, distintos, alcançáveis, longe da largada e determinísticos', async () => {
  const pontos = [];
  for (let rep = 0; rep < 2; rep++) {
    await comPagina({ todasDesbloqueadas: true }, async ({ pg }) => {
      await iniciarMissao(pg, 3);
      pontos.push(await pg.evaluate(() => {
        const s = window.gameScene, e = s.encontros, st = s.mapData.playerStart;
        return { pontos: e.pontos, livres: e.pontos.every((p) => !s.isBlocked(p.x * 32 + 16, p.y * 32 + 16)), st };
      }));
    });
  }
  assert.equal(pontos[0].pontos.length, 2);
  assert.deepEqual(pontos[0], pontos[1], 'mesma missão e mesma semente: mesmos pontos');
  assert.ok(pontos[0].livres);
  const [a, b] = pontos[0].pontos;
  assert.ok(a.x !== b.x || a.y !== b.y);
  for (const p of pontos[0].pontos) assert.ok(Math.abs(p.x - pontos[0].st.x) + Math.abs(p.y - pontos[0].st.y) >= 3);
});

test('ponto fixo abre o encontro: relógio e movimento parados; Esc pula (0%) e o jogo volta', () =>
  comPagina({ todasDesbloqueadas: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    await ir(pg, 0);
    await pg.waitForSelector('#encontro-modal.active');
    const t0 = await pg.evaluate(() => ({ t: window.gameScene.elapsedMs, x: window.gameScene.player.x, p: GameState.paused, m: GameState.modalAberto }));
    assert.equal(t0.m, true);
    await pg.keyboard.down('d'); await pg.waitForTimeout(700); await pg.keyboard.up('d');
    const t1 = await pg.evaluate(() => ({ t: window.gameScene.elapsedMs, x: window.gameScene.player.x }));
    assert.equal(t1.t, t0.t, 'relógio parado');
    assert.equal(t1.x, t0.x, 'jogador parado');
    assert.equal(await pg.isVisible('#pause-modal'), false);
    await pg.keyboard.press('Escape');
    await pg.waitForFunction(() => !document.getElementById('encontro-modal').classList.contains('active') || document.querySelector('#enc-corpo .enc-continuar'));
    // Esc pula: aparece o encerramento "pulado"; continuar com Enter
    await pg.keyboard.press('Enter');
    await pg.waitForFunction(() => !document.getElementById('encontro-modal').classList.contains('active'));
    const r = await pg.evaluate(() => ({ creditos: window.gameScene.encontros.creditos, m: GameState.modalAberto, emE: window.gameScene.emEncontro, pausado: GameState.paused, vistas: GameState.aprendizado }));
    assert.deepEqual(r.creditos, [0]);
    assert.equal(r.m, false); assert.equal(r.emE, false); assert.equal(r.pausado, false);
    // volta a andar e o relógio volta a correr
    await pg.waitForTimeout(500);
    assert.ok((await pg.evaluate(() => window.gameScene.elapsedMs)) > t1.t);
    assert.deepEqual(erros, []);
  }));

test('cadeia: errar abre ficha de reforço e pergunta mais simples; acertar dá 40% e mostra a original', () =>
  comPagina({ todasDesbloqueadas: true, idioma: 'pt' }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    // força uma pergunta de nível 2 conhecida (N01 só entra na missão 3; usa N02-2 da missão 1)
    await pg.evaluate(async () => {
      const m = await import('/js/encontros/motor.js'); const { CONCEITOS: C } = await import('/js/data/encontros/conceitos.js'); const { PERGUNTAS: P } = await import('/js/data/encontros/perguntas.js');
      window.__M = { m, C, P };
      const s = window.gameScene, e = s.encontros;
      const orig = m.iniciar;
      e.rodar('fixo');
    });
    await pg.waitForSelector('#enc-corpo .enc-opcao');
    const info = await pg.evaluate(() => {
      const ap = window.gameScene.encontros;
      return { n: document.querySelectorAll('#enc-corpo .enc-opcao').length, txt: document.getElementById('enc-enunciado').textContent };
    });
    // responde errado por DOM: acha o id da pergunta atual pelo enunciado
    const alvo = await pg.evaluate(() => {
      const { P } = window.__M; const txt = document.getElementById('enc-enunciado').textContent;
      const q = P.find((x) => x.pt.enunciado === txt);
      return { id: q.id, formato: q.formato, correta: q.correta, nivel: q.nivel, no: q.no };
    });
    const clicar = async (val) => pg.click(`#enc-corpo .enc-opcao[data-val="${val}"]`);
    // Mito x Fato: erro com "quase certeza" (sem a penalidade de excesso de confiança), para o crédito ser 40%
    const errada = alvo.formato === 'mf' ? (alvo.correta === 'mito' ? 'fato?' : 'mito?') : (alvo.correta + 1) % 3;
    if (alvo.formato === 'mf') assert.equal((await pg.$$('#enc-corpo .enc-opcao')).length, 5, 'escala de confiança: 5 botões');
    await clicar(errada);
    await pg.waitForSelector('#enc-corpo .enc-faixa.errado');
    assert.ok(await pg.$('#enc-corpo .enc-ficha'), 'ficha de reforço');
    await pg.click('#enc-corpo .enc-continuar');
    await pg.waitForSelector('#enc-corpo .enc-opcao');
    assert.ok(await pg.$('.enc-reforco'), 'selo de reforço');
    const prox = await pg.evaluate(() => { const { P } = window.__M; const txt = document.getElementById('enc-enunciado').textContent; const q = P.find((x) => x.pt.enunciado === txt); return { id: q.id, formato: q.formato, correta: q.correta }; });
    assert.notEqual(prox.id, alvo.id, 'nunca repete a pergunta');
    await clicar(prox.correta);
    await pg.waitForSelector('#enc-corpo .enc-faixa.certo');
    await pg.click('#enc-corpo .enc-continuar');
    await pg.waitForSelector('#enc-corpo .enc-solucao');
    assert.match(await pg.textContent('#enc-corpo'), /40%/);
    await pg.click('#enc-corpo .enc-continuar');
    await pg.waitForFunction(() => !document.getElementById('encontro-modal').classList.contains('active'));
    assert.deepEqual(await pg.evaluate(() => window.gameScene.encontros.creditos), [0.4]);
    assert.deepEqual(erros, []);
  }));

test('gatilho do Geiger dispara uma vez; não dispara com o Geiger desligado nem antes de 15 s', () =>
  comPagina({ todasDesbloqueadas: true }, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    const r = await pg.evaluate(async () => {
      const s = window.gameScene, e = s.encontros;
      s.currentReading = 500; s.geigerActive = false; s.elapsedMs = 60000;
      e.checar(2000); const desligado = e.rodando;
      s.geigerActive = true; s.elapsedMs = 5000; e.sinalMs = 0;
      e.checar(2000); const cedo = e.rodando;
      s.elapsedMs = 60000; e.sinalMs = 0;
      e.checar(1000); const curto = e.rodando;
      e.checar(1000); const longo = e.rodando;
      return { desligado, cedo, curto, longo, usou: e.usouGeiger };
    });
    assert.deepEqual(r, { desligado: false, cedo: false, curto: false, longo: true, usou: true });
    await pg.waitForSelector('#encontro-modal.active');
  }));

test('missão 1 de ponta a ponta com encontros: restantes aparecem no fim, aproveitamento exibido', () =>
  comPagina({ todasDesbloqueadas: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    const r = await pg.evaluate(ROBO);
    assert.ok(r.ok, JSON.stringify(r));
    // responde tudo certo pela interface até a tela de conclusão
    for (let i = 0; i < 240; i++) {
      if (await pg.$eval('#complete-modal', (e) => e.classList.contains('active'))) break;
      await pg.waitForTimeout(250);
      if (await cofreAtivo(pg)) { await resolverCofreCerto(pg); continue; }   // cofre de transporte (5e-D)
      if (!(await modalEnc(pg))) continue;
      const opc = await pg.$('#enc-corpo .enc-opcao');
      if (opc) {
        const alvo = await pg.evaluate(async () => {
          const { PERGUNTAS: P } = await import('/js/data/encontros/perguntas.js');
          const q = P.find((x) => x.pt.enunciado === document.getElementById('enc-enunciado').textContent || x.en.enunciado === document.getElementById('enc-enunciado').textContent);
          return q ? q.correta : 0;   // sem par no banco = pergunta do cofre (correta = 0)
        });
        await pg.click(`#enc-corpo .enc-opcao[data-val="${alvo}"]`);
      } else if (await pg.$('#enc-corpo .enc-continuar')) await pg.click('#enc-corpo .enc-continuar');
    }
    await pg.waitForSelector('#complete-modal.active', { timeout: 20000 });
    const f = await pg.evaluate(() => ({ cred: window.gameScene.encontros.creditos, aprov: document.getElementById('complete-aproveitamento').textContent, det: document.getElementById('complete-aprov-detalhe').textContent, fim: window.gameScene.fim }));
    assert.deepEqual(f.cred, [1, 1, 1], 'três encontros, todos de primeira');
    const cof = await pg.evaluate(() => ({ c: window.gameScene.encontros.cofreCreditos, n: new Set(window.gameScene.sources.map((s) => s.type)).size }));
    assert.ok(cof.c.length >= 2, 'créditos do cofre: um por isótopo e um por prateleira usada');
    assert.ok(cof.c.every((x) => x === 1));
    assert.match(f.det, /cofre|vault/i);
    assert.equal(f.fim, true);
    const n = parseInt(f.aprov);
    assert.ok(n >= 85 && n <= 100, f.aprov);   // fontes+encontros+cofre perfeitos; só o tempo varia
    assert.doesNotMatch(f.det, /máximo|maximum/);
    const salvo = await pg.evaluate(() => JSON.parse(localStorage.getItem('radiationHunters')).aprendizado);
    assert.ok(Object.keys(salvo.nos).length >= 1);
    assert.deepEqual(erros, []);
  }));

test('encontros desligados: nenhum modal, teto de 75% exibido', () =>
  comPagina({ semEncontros: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    assert.equal(await pg.evaluate(() => window.gameScene.encontros.pontos.length), 0);
    const r = await pg.evaluate(ROBO);
    assert.ok(r.ok, JSON.stringify(r));
    await pg.waitForSelector('#complete-modal.active', { timeout: 30000 });
    assert.equal(await modalEnc(pg), false);
    const txt = await pg.textContent('#complete-aprov-detalhe');
    assert.match(txt, /maximum possible 75%|máximo possível 75%/);
    assert.ok(parseInt(await pg.textContent('#complete-aproveitamento')) <= 75);
    assert.deepEqual(erros, []);
  }));

test('configurações: o interruptor persiste e o aviso dos 75% aparece', () =>
  comPagina({}, async ({ pg }) => {
    await pg.click('#btn-settings');
    assert.match(await pg.textContent('#encontros-aviso'), /75%/);
    assert.equal(await pg.isChecked('#encontros-toggle'), true);
    await pg.uncheck('#encontros-toggle');
    assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('radiationHunters')).settings.encontros), false);
    await pg.reload();
    await pg.waitForFunction(() => typeof ui !== 'undefined');
    assert.equal(await pg.isChecked('#encontros-toggle'), false);
  }));

test('caderno de campo: conceitos por descobrir ficam trancados; depois de um encontro a ficha abre; Esc fecha', () =>
  comPagina({ todasDesbloqueadas: true, idioma: 'pt' }, async ({ pg, erros }) => {
    await pg.click('#btn-caderno');
    assert.equal(await modalEnc(pg), false);
    assert.equal(await pg.$$eval('.cad-carta:not(.fechada)', (e) => e.length), 0);
    assert.ok((await pg.$$eval('.cad-aba', (e) => e.length)) === 6);
    await pg.keyboard.press('Escape');
    assert.equal(await pg.$eval('#caderno-modal', (e) => e.classList.contains('active')), false);
    // marca um conceito como visto e reabre
    await pg.evaluate(() => { GameState.aprendizado.nos.N02 = { m: 2, v: 2, a: 2, e: 0 }; });
    await pg.click('#btn-caderno');
    assert.ok((await pg.$$eval('.cad-carta:not(.fechada)', (e) => e.length)) >= 1);
    assert.match(await pg.textContent('#caderno-resumo'), /1 de 21/);
    assert.deepEqual(erros, []);
  }));

test('robustez: 15 encontros com respostas, pulos e teclas aleatórios terminam limpos e sem erro', () =>
  comPagina({ todasDesbloqueadas: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 4);
    const rel = await pg.evaluate(async () => {
      const s = window.gameScene, e = s.encontros;
      let a = 987654321;
      const r = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const vistas = [];
      const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
      for (let i = 0; i < 15; i++) {
        e.feitos = 0; e.ultimoMs = -Infinity;
        const p = e.rodar('fixo');
        for (let k = 0; k < 40 && (e.rodando || document.getElementById('encontro-modal').classList.contains('active')); k++) {
          await esperar(30);
          const corpo = document.getElementById('enc-corpo');
          const opcoes = [...corpo.querySelectorAll('.enc-opcao')];
          const cont = corpo.querySelector('.enc-continuar');
          const enun = document.getElementById('enc-enunciado');
          if (opcoes.length) {
            vistas.push(enun.textContent);
            const x = r();
            if (x < 0.15) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            else opcoes[Math.floor(r() * opcoes.length)].click();
          } else if (cont) { r() < 0.5 ? cont.click() : document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); }
        }
        await p;
      }
      return { m: GameState.modalAberto, emE: s.emEncontro, rodando: e.rodando, ativo: document.getElementById('encontro-modal').classList.contains('active'), n: vistas.length, creditos: e.creditos.length, pausado: GameState.paused };
    });
    assert.equal(rel.m, false); assert.equal(rel.emE, false); assert.equal(rel.rodando, false); assert.equal(rel.ativo, false); assert.equal(rel.pausado, false);
    assert.ok(rel.n >= 15);
    assert.deepEqual(erros, []);
  }));

test('reiniciar ou sair no meio de um encontro fecha o modal e deixa o jogo utilizável', () =>
  comPagina({ todasDesbloqueadas: true }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    await ir(pg, 0);
    await pg.waitForSelector('#enc-corpo .enc-opcao');
    await pg.evaluate(() => { window.__velhoEnc = window.gameScene.encontros; window.gameScene.restartMission(); });
    await pg.waitForFunction(() => window.gameScene && window.gameScene.encontros !== window.__velhoEnc && window.gameScene.gameStarted && window.gameScene.sources);
    assert.equal(await modalEnc(pg), false);
    assert.deepEqual(await pg.evaluate(() => [GameState.modalAberto, window.gameScene.emEncontro, window.gameScene.encontros.rodando]), [false, false, false]);
    // novo encontro funciona na cena reiniciada
    await ir(pg, 0);
    await pg.waitForSelector('#enc-corpo .enc-opcao');
    await pg.evaluate(() => window.gameScene.quitToMenu());
    await pg.waitForSelector('#main-menu.active');
    assert.equal(await modalEnc(pg), false);
    assert.equal(await pg.evaluate(() => GameState.modalAberto), false);
    assert.deepEqual(erros, []);
  }));

test('apagar o caderno exige dois cliques e zera o aprendizado salvo', () =>
  comPagina({}, async ({ pg, erros }) => {
    await pg.evaluate(() => { GameState.aprendizado.nos.N02 = { m: 2, v: 2, a: 2, e: 0 }; });
    await pg.click('#btn-settings');
    await pg.click('#btn-apagar-caderno');
    assert.equal(await pg.evaluate(() => Object.keys(GameState.aprendizado.nos).length), 1, 'um clique só arma');
    await pg.click('#btn-apagar-caderno');
    assert.equal(await pg.evaluate(() => Object.keys(GameState.aprendizado.nos).length), 0);
    assert.deepEqual(await pg.evaluate(() => JSON.parse(localStorage.getItem('radiationHunters')).aprendizado.nos), {});
    assert.deepEqual(erros, []);
  }));

test('caderno (revisão do cofre, etapa 5): fechar tem 44x44 e nome em português; abas ligadas à folha (tabpanel) e com nome acessível', () =>
  comPagina({ todasDesbloqueadas: true, idioma: 'pt' }, async ({ pg, erros }) => {
    await pg.click('#btn-caderno');
    const b = await pg.locator('#close-caderno').boundingBox();
    assert.ok(b.width >= 44 && b.height >= 44, `fechar ${b.width}x${b.height}`);
    assert.equal(await pg.getAttribute('#close-caderno', 'aria-label'), 'Fechar o caderno');
    assert.equal(await pg.getAttribute('#caderno-folha', 'role'), 'tabpanel');
    const abas = await pg.$$eval('#caderno-abas [role=tab]', (a) => a.map((x) => [x.id, x.getAttribute('aria-controls'), x.getAttribute('aria-label'), x.getAttribute('aria-selected')]));
    assert.ok(abas.length >= 5);
    for (const [id, ctrl, nome] of abas) { assert.ok(id.startsWith('cad-aba-')); assert.equal(ctrl, 'caderno-folha'); assert.match(nome, /\d+\/\d+$/); }
    const ativa = abas.find((a) => a[3] === 'true');
    assert.equal(await pg.getAttribute('#caderno-folha', 'aria-labelledby'), ativa[0]);
    assert.deepEqual(erros, []);
  }));
