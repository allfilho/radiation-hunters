// v3.22: perguntas dos encontros e lições da Academia saem como coluna de jornal (nome do jornal da região e seção).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

const RAIZ = new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/', import.meta.url).href;

test('mastro: nome do jornal da missão ou a Gazeta geral; seção muda com o formato e o reforço; PT e EN', async () => {
  const { mastro, temJornal } = await import(RAIZ + 'jornal/jornal.js');
  assert.ok(temJornal(2) && !temJornal(100));
  const a = mastro(2, 'pt', { formato: 'mf' }); assert.equal(a.nome, 'A Gazeta do Cerrado'); assert.match(a.data, /1987/); assert.equal(a.secao, 'Mito ou fato?');
  assert.equal(mastro(2, 'pt', { formato: 'mc' }).secao, 'Pergunta do leitor');
  assert.equal(mastro(2, 'pt', { formato: 'mf', reforco: true }).secao, 'Errata e reforço');
  const g = mastro(100, 'en', { formato: 'mf' }); assert.equal(g.nome, 'The Hunters’ Gazette'); assert.equal(g.data, ''); assert.equal(g.secao, 'Myth or fact?');
  assert.equal(mastro(undefined, 'pt', {}).nome, 'Gazeta dos Caçadores');
});

test('no jogo: o encontro da missão 2 abre com o mastro d’A Gazeta do Cerrado e a lição com a Gazeta dos Caçadores', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true });
    await iniciarMissao(pg, 2);
    await pg.evaluate(async () => {
      const { PERGUNTAS } = await import('/js/data/encontros/perguntas.js'), { mastro } = await import('/js/jornal/jornal.js');
      window.__p = gameScene.encontros.ui.perguntar(PERGUNTAS.find((q) => q.formato === 'mf'), { n: 1, total: 3, tema: 'X', semente: 1, jornal: mastro(2, 'pt', { formato: 'mf' }) });
    });
    assert.equal(await pg.textContent('#enc-cabecalho .enc-mastro-nome'), 'A Gazeta do Cerrado');
    assert.equal(await pg.evaluate(() => document.getElementById('encontro-modal').classList.contains('enc-jornal')), true);
    assert.ok(await pg.$('#enc-corpo .enc-opcao'), 'as alternativas continuam lá');
    await pg.evaluate(() => gameScene.encontros.ui.cancelar());
    await pg.evaluate(() => gameScene.licaoUI.abrir(0, 'pt', () => {}, () => {}));
    assert.equal(await pg.textContent('#licao-modal .enc-mastro-nome'), 'Gazeta dos Caçadores');
    await pg.click('#licao-modal .licao-botoes .confirm-btn, #licao-modal .licao-botoes .primary, #licao-modal .licao-botoes button:last-child');
    assert.ok(await pg.$('#licao-modal .enc-mastro'), 'o quiz também tem mastro');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('cada região (E-GOI a E-FUK) tem pergunta de nível 1 de mito E de fato, com fonte e PT/EN (v3.22.1: o jogador não pode aprender "região = sempre fato")', async () => {
  const { PERGUNTAS } = await import(RAIZ + 'data/encontros/perguntas.js');
  for (const no of ['E-GOI', 'E-RAD', 'E-CHE', 'E-LIA', 'E-ZAR', 'E-MAY', 'E-FUK']) {
    const mf = PERGUNTAS.filter((p) => p.no === no && p.nivel === 1 && p.formato === 'mf');
    assert.ok(mf.some((p) => p.correta === 'mito') && mf.some((p) => p.correta === 'fato'), no);
    for (const p of mf) { assert.ok(p.fatos.length >= 1 && p.pt.enunciado && p.en.enunciado && p.pt.explicacao && p.en.explicacao, p.id); }
  }
  assert.match(PERGUNTAS.find((p) => p.id === 'E-ZAR-M').pt.explicacao, /Nenhuma fonte radioativa/);   // alinhado com a investigação de Zaragoza (v3.21)
});
