// v3.23: "edição extra" ao concluir a missão, plantão de jornal nos chamados rápidos e encerramento dos encontros no papel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

const RAIZ = new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/', import.meta.url).href;

test('reportagemFim: manchete muda com as estrelas e usa só os números do desempenho; PT e EN', async () => {
  const { reportagemFim } = await import(RAIZ + 'jornal/reportagens.js');
  const d = { jornalId: 2, titulo: 'Cerrado', stars: 3, fontes: { n: 2, total: 3 }, tempo: 95, precisao: 80, aproveitamento: 77, mensagem: 'Ótimo.\nMeta cumprida.' };
  const a = reportagemFim(d, 'pt'); assert.equal(a.kicker, 'EDIÇÃO EXTRA'); assert.match(a.manchete, /Missão cumprida: Cerrado/); assert.match(a.sub, /2 de 3 fontes localizadas em 1:35/);
  assert.match(a.paragrafos[0], /precisão de 80%/); assert.ok(a.paragrafos.includes('Meta cumprida.')); assert.match(a.nome, /Gazeta/);
  assert.match(reportagemFim({ ...d, stars: 1 }, 'pt').manchete, /há o que melhorar/);
  const e = reportagemFim({ ...d, jornalId: null, fontes: null }, 'en'); assert.equal(e.kicker, 'EXTRA EDITION'); assert.match(e.manchete, /Mission accomplished/); assert.match(e.sub, /closed in 1:35/);
});

test('jornalRapida: objeto de plantão com cena, manchete e PT/EN', async () => {
  const { jornalRapida } = await import(RAIZ + 'jornal/reportagens.js'), { missaoRapida } = await import(RAIZ + 'agencia/rapidas.js');
  const m = missaoRapida(12345, 'pt'), j = jornalRapida(m);
  assert.equal(j.edicao, 'plantao'); assert.match(j.pt.kicker, /^PLANTÃO/); assert.match(j.en.kicker, /^BREAKING/); assert.ok(j.pt.manchete && j.en.manchete && j.pt.paragrafos[0]);
});

test('no jogo: balanço vira edição extra mantendo os ids; chamado rápido abre como plantão', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true });
    await pg.evaluate(() => { ui.showCompleteModal({ time: 90, accuracy: 100, score: 500, stars: 3, message: 'ok', fontes: { n: 2, total: 2 }, jornal: { id: 2, titulo: 'Cerrado' } }); });
    assert.match(await pg.textContent('#complete-jornal .jornal-manchete'), /Missão cumprida/);
    assert.equal(await pg.evaluate(() => document.querySelector('#complete-modal .complete-content').classList.contains('com-jornal')), true);
    for (const id of ['complete-time', 'complete-accuracy', 'complete-score', 'complete-fontes', 'complete-stars', 'btn-next-mission']) assert.ok(await pg.$('#' + id), id);
    assert.equal(await pg.textContent('#complete-fontes'), '2/2');
    await pg.evaluate(() => { ui.showCompleteModal({ time: 90, accuracy: 100, score: 500, stars: 3, message: 'ok', fontes: { n: 2, total: 2 } }); });
    assert.equal(await pg.$('#complete-jornal'), null, 'sem dados de jornal, o modal volta ao normal');
    await pg.evaluate(async () => { const { missaoRapida } = await import('/js/agencia/rapidas.js'); ui.startMission(missaoRapida(777, 'pt')); });
    assert.match(await pg.textContent('#story-text .jornal-especial'), /PLANTÃO/);
    assert.equal(await pg.$('#story-text .jornal-mais'), null);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
