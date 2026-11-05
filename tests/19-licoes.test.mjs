// Academia, etapa 3: lições lineares por sala, Geiger como item na sala 4, fontes só nas salas 4 a 8, travas.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { LICOES, TEXTOS } from '../current/js/academia/licoes.js';
import { servidor, abrirNavegador, novaPagina, iniciarMissao, lerLicao } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

test('dados: 8 lições em pt e en, perguntas bem formadas, UV-A/B/C na lição 3, rótulos [V]/[H]/[N] nas fontes', () => {
  assert.equal(LICOES.length, 8);
  for (const [i, l] of LICOES.entries()) for (const lang of ['pt', 'en']) {
    const L = l[lang];
    assert.ok(L.titulo && L.paragrafos.length >= 2 && L.fonte, `lição ${i + 1} ${lang}`);
    assert.ok(/\[(V|H|N)\]/.test(L.fonte), `lição ${i + 1} ${lang}: sem rótulo de verificação`);
    assert.ok(L.perguntas.length >= 1);
    for (const q of L.perguntas) {
      assert.ok(q.opcoes.length >= 2 && q.certa >= 0 && q.certa < q.opcoes.length && q.porque && q.q);
    }
  }
  // a alternativa certa varia de posição (não é quase sempre a primeira) e pt/en coincidem
  const pos = LICOES.flatMap((l) => l.pt.perguntas.map((q) => q.certa));
  assert.ok(pos.filter((c) => c === 0).length <= Math.ceil(pos.length * 0.4), `muitas certas na 1ª posição: ${pos}`);
  for (let k = 0; k < 3; k++) assert.ok(pos.includes(k), `nenhuma certa na posição ${k + 1}`);
  LICOES.forEach((l, i) => l.pt.perguntas.forEach((q, j) => assert.equal(q.certa, l.en.perguntas[j].certa, `lição ${i + 1} q${j + 1}: pt/en divergem`)));
  assert.equal(LICOES[0].pt.perguntas.length, 1);
  assert.equal(LICOES[2].pt.perguntas.length, 3);
  for (const lang of ['pt', 'en']) {
    const tx = LICOES[2][lang].paragrafos.join(' ');
    for (const n of ['315', '280', '100', 'UV-A', 'UV-B', 'UV-C']) assert.ok(tx.includes(n), `lição 3 ${lang} sem ${n}`);
  }
  assert.deepEqual(Object.keys(TEXTOS.pt).sort(), Object.keys(TEXTOS.en).sort());
});

async function iniciar(semente = 3) {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { semEncontros: true, academia: true, semente });
  await iniciarMissao(pg, 1);
  return { pg, ctx, erros };
}
const ir = (pg, x, y) => pg.evaluate(([x, y]) => { window.gameScene.player.setPosition(x * 32, y * 32); }, [x, y]);
const irAoPainel = async (pg, i) => {
  const p = await pg.evaluate((i) => { const q = window.gameScene.paineis[i]; return { x: q.tx + 0.5, y: q.ty + 0.5 }; }, i);
  await ir(pg, 2, 2);
  await pg.waitForTimeout(150);
  await ir(pg, p.x, p.y);
  await pg.waitForTimeout(250);
};
const modalAtivo = (pg) => pg.$eval('#licao-modal', (e) => e.classList.contains('active'));
/** Percorre o painel: iniciar, responder SEMPRE a primeira alternativa (certa ou não) e seguir até fechar */
async function fazerLicao(pg) {
  await lerLicao(pg);
  for (let k = 0; k < 6 && await modalAtivo(pg); k++) {
    await pg.click('.licao-opcao:not([disabled]) >> nth=0');
    await pg.click('#licao-seguir');
  }
}

test('início: sem Geiger (botões ocultos, G avisa), 5 fontes só nas salas 4 a 8, isótopo por sala, 8 painéis, Geiger na sala 4', async () => {
  const { pg, ctx, erros } = await iniciar();
  try {
    const r = await pg.evaluate(() => {
      const g = window.gameScene;
      return {
        tem: g.temGeiger, est: GameState.temGeiger,
        btnG: document.getElementById('btn-geiger').hidden, btnI: document.getElementById('btn-identify').hidden,
        fontes: g.sources.map(s => ({ sala: s.sala, nome: s.name })),
        paineis: g.paineis.length, item: g.geigerItem && { tx: g.geigerItem.tx, ty: g.geigerItem.ty },
        s4: g.mapData.salas[3], slots: document.querySelectorAll('#inventory .inventory-slot').length,
      };
    });
    assert.equal(r.tem, false); assert.equal(r.est, false);
    assert.equal(r.btnG, true); assert.equal(r.btnI, true);
    assert.deepEqual(r.fontes.map(f => f.sala), [3, 4, 5, 6, 7]);
    assert.deepEqual(r.fontes.slice(0, 3).map(f => f.nome), ['Cs-137', 'Cs-137', 'Sr-90']);
    assert.equal(r.fontes[3].nome, 'Am-241');
    assert.equal(r.paineis, 8);
    assert.ok(r.item && r.item.tx > r.s4.x && r.item.tx < r.s4.x + r.s4.w && r.item.ty > r.s4.y && r.item.ty < r.s4.y + r.s4.h, 'Geiger dentro da sala 4');
    assert.equal(r.slots, 3, 'inventário: 2 chaves + Geiger');
    // G sem Geiger não liga
    await pg.keyboard.press('g');
    await pg.waitForTimeout(150);
    assert.equal(await pg.evaluate(() => window.gameScene.geigerActive), false);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('fluxo linear: lição 2 bloqueada antes da 1; quiz errado explica e conclui; porta azul exige lições 1-3; Geiger libera a lição 4', async () => {
  const { pg, ctx, erros } = await iniciar();
  try {
    // lição 2 (índice 1) antes da 1: não abre
    await irAoPainel(pg, 1);
    assert.equal(await modalAtivo(pg), false, 'lição 2 não abre antes da 1');
    // lição 1: abre sozinha ao chegar perto; o jogo fica travado enquanto aberta
    await irAoPainel(pg, 0);
    assert.equal(await modalAtivo(pg), true);
    assert.deepEqual(await pg.evaluate(() => ({ m: GameState.modalAberto, e: window.gameScene.emEncontro })), { m: true, e: true });
    // resposta ERRADA (alternativa 2): mostra a certa, explica e permite seguir; a lição conta como feita
    await lerLicao(pg);
    const errada = await pg.evaluate(() => { const u = window.gameScene.licaoUI.estado; return (u.ordem.indexOf(u.L.perguntas[0].certa) + 1) % u.ordem.length; }); // posição visível de uma alternativa que NÃO é a certa
    await pg.click(`.licao-opcao >> nth=${errada}`);
    const retorno = await pg.$eval('.licao-retorno', (e) => e.textContent);
    assert.ok(/Resposta certa/.test(retorno) || /Correct answer/.test(retorno), retorno);
    assert.equal(await pg.$$eval('.licao-opcao.certa', (b) => b.length), 1);
    await pg.click('#licao-seguir');
    assert.equal(await modalAtivo(pg), false);
    assert.deepEqual(await pg.evaluate(() => ({ f: window.gameScene.licoesFeitas.slice(), m: GameState.modalAberto, e: window.gameScene.emEncontro })), { f: [0], m: false, e: false });
    // lições 2 e 3 em sequência
    for (const i of [1, 2]) { await irAoPainel(pg, i); assert.equal(await modalAtivo(pg), true, `lição ${i + 1} abre`); await fazerLicao(pg); }
    assert.deepEqual(await pg.evaluate(() => window.gameScene.licoesFeitas.slice()), [0, 1, 2]);
    // lição 4 (índice 3) exige o Geiger: sem ele, não abre
    await irAoPainel(pg, 3);
    assert.equal(await modalAtivo(pg), false, 'lição 4 não abre sem Geiger');
    // Geiger: pegar passando perto liga os botões e o inventário
    const it = await pg.evaluate(() => ({ x: window.gameScene.geigerItem.tx + 0.5, y: window.gameScene.geigerItem.ty + 0.5 }));
    await ir(pg, it.x, it.y);
    await pg.waitForTimeout(300);
    const g = await pg.evaluate(() => ({ tem: window.gameScene.temGeiger, b: document.getElementById('btn-geiger').hidden, cheios: document.querySelectorAll('#inventory .inventory-slot.cheio').length, item: window.gameScene.geigerItem }));
    assert.equal(g.tem, true); assert.equal(g.b, false); assert.equal(g.cheios, 1); assert.equal(g.item, null);
    await pg.keyboard.press('g');
    await pg.waitForTimeout(200);
    assert.equal(await pg.evaluate(() => window.gameScene.geigerActive), true);
    await pg.keyboard.press('g');
    // agora a lição 4 abre
    await irAoPainel(pg, 3);
    assert.equal(await modalAtivo(pg), true, 'lição 4 abre com o Geiger');
    await fazerLicao(pg);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('porta azul: com a chave mas sem as lições 1-3 fica fechada; com as lições abre', async () => {
  const { pg, ctx } = await iniciar();
  try {
    const k = await pg.evaluate(() => { const c = window.gameScene.chavesItens.find(c => c.cor === 'azul'); return { x: c.tx + 0.5, y: c.ty + 0.5 }; });
    await ir(pg, k.x, k.y); await pg.waitForTimeout(300);
    assert.equal(await pg.evaluate(() => window.gameScene.chavesItens.some(c => c.cor === 'azul')), false);
    await ir(pg, 41.2, 6.5); await pg.waitForTimeout(400);
    assert.equal(await pg.evaluate(() => window.gameScene.mapData.map[6][42]), 3, 'continua fechada sem as lições');
    await pg.evaluate(() => { window.gameScene.licoesFeitas.push(0, 1, 2); });
    await ir(pg, 36, 8); await pg.waitForTimeout(150);
    await ir(pg, 41.2, 6.5); await pg.waitForTimeout(400);
    assert.equal(await pg.evaluate(() => window.gameScene.mapData.map[6][42]), 0, 'abre depois das lições');
  } finally { await ctx.close(); }
});

test('conclusão: exige todas as fontes E todas as lições, em qualquer ordem', async () => {
  const { pg, ctx } = await iniciar();
  try {
    // todas as fontes achadas, lições incompletas: não conclui
    await pg.evaluate(() => { const g = window.gameScene; g.foundSources = [...g.sources]; g.licoesFeitas = [0, 1, 2, 3, 4, 5]; g.tentarConcluirAcademia(); });
    assert.equal(await pg.evaluate(() => window.gameScene.concluindo), false);
    // a última lição (sala 8) conclui a Academia
    await pg.evaluate(() => { window.gameScene.temGeiger = true; });
    await irAoPainel(pg, 6); await fazerLicao(pg);
    await irAoPainel(pg, 7); await fazerLicao(pg);
    assert.equal(await pg.evaluate(() => window.gameScene.licoesFeitas.length), 8);
    assert.equal(await pg.evaluate(() => window.gameScene.concluindo), true);
  } finally { await ctx.close(); }
});

test('lição 7: demonstração de meia-vida (64 átomos), 3 perguntas, passos só diminuem e reiniciar volta a 64', async () => {
  assert.equal(LICOES[6].demo, 'meiavida');
  assert.equal(LICOES[6].pt.perguntas.length, 3);
  const { pg, ctx, erros } = await iniciar();
  try {
    await pg.evaluate(() => { const g = window.gameScene; g.temGeiger = true; g.licoesFeitas = [0, 1, 2, 3, 4, 5]; });
    await irAoPainel(pg, 6);
    assert.equal(await modalAtivo(pg), true);
    for (let i = 0; i < 6 && !(await pg.$('.licao-demo')); i++) await pg.click('#licao-proxima'); // a demo tem parte própria
    assert.ok(await pg.$('.licao-demo'), 'demo alcançável pelas partes');
    const vivos = () => pg.$$eval('.licao-atomo.vivo', (e) => e.length);
    assert.equal(await vivos(), 64);
    let ant = 64;
    for (let k = 0; k < 4; k++) {
      await pg.click('#licao-demo-passo');
      const v = await vivos();
      assert.ok(v <= ant, `passo ${k + 1}: ${v} > ${ant}`);
      ant = v;
    }
    assert.ok(ant < 64, 'depois de 4 meias-vidas sobram bem menos de 64 (esperado 4)');
    assert.match(await pg.$eval('.licao-demo-info', (e) => e.textContent), /Meias-vidas: 4|Half-lives: 4/);
    await pg.click('#licao-demo-reiniciar');
    assert.equal(await vivos(), 64);
    await fazerLicao(pg);
    assert.ok((await pg.evaluate(() => window.gameScene.licoesFeitas)).includes(6));
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('quiz: a ordem das alternativas é sorteada a cada vez; a certa aparece em todas as posições e não repete a da pergunta anterior', async () => {
  const { pg, ctx, erros } = await iniciar();
  try {
    const r = await pg.evaluate(() => {
      const u = window.gameScene.licaoUI; const vistas = new Set(); let repetiu = false, ok = true;
      for (let n = 0; n < 40; n++) {
        u.abrir(2, 'pt', () => {}, () => {}); u.proximaPergunta();           // lição 3: 3 perguntas
        let ant = -1;
        for (let k = 0; k < 3; k++) {
          const e = u.estado; const q = e.L.perguntas[e.p];
          const pos = [...document.querySelectorAll('.licao-opcao')].findIndex((b) => b.textContent.endsWith(q.opcoes[q.certa]));
          if (pos !== e.ordem.indexOf(q.certa)) ok = false;
          vistas.add(pos); if (pos === ant) repetiu = true; ant = pos;
          u.responder(0); u.proximaPergunta();
        }
        u.fechar();
      }
      return { vistas: [...vistas].sort(), repetiu, ok };
    });
    assert.deepEqual(r.vistas, [0, 1, 2]);
    assert.equal(r.repetiu, false);
    assert.equal(r.ok, true, 'a posição mostrada corresponde à ordem sorteada');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});
