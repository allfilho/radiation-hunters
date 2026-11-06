// v3.33: Fase D (parte 2) — inventário individual: cada cientista leva 1 equipamento do estoque da Base.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('equipar: estoque livre, trocar devolve o anterior, sem estoque falha, devolver zera', async () => {
  const C = await mod('agencia/ciencia.js'), E = await mod('agencia/equipe.js');
  const est = { equipe: E.equipeInicial(), equipamentos: { sondaAlfa: 1, espectrometro: 2 } };
  assert.equal(C.estoqueLivre(est, 'sondaAlfa'), 1);
  assert.deepEqual(C.equipar(est, 'c1', 'sondaAlfa'), { ok: true }); assert.equal(C.estoqueLivre(est, 'sondaAlfa'), 0);
  assert.equal(C.equipar(est, 'c2', 'sondaAlfa').motivo, 'semEstoque');
  C.equipar(est, 'c1', 'espectrometro'); assert.equal(C.estoqueLivre(est, 'sondaAlfa'), 1, 'trocar devolve');
  assert.equal(C.equipar(est, 'zz', 'sondaAlfa').motivo, 'membro'); assert.equal(C.equipar(est, 'c1', 'bomba').motivo, 'equipamento');
  C.equipar(est, 'c1', ''); assert.equal(C.equipDe(est.equipe[0]), null); assert.equal(C.estoqueLivre(est, 'espectrometro'), 2);
});

test('save: itens antigos ficam no estoque; entregas além do total e itens inválidos são corrigidos', async () => {
  const S = await mod('agencia/simulacao.js'), C = await mod('agencia/ciencia.js');
  const velho = S.sanear({ v: 3, iniciado: true, dia: 5, equipamentos: { sondaAlfa: 2 } });
  assert.ok(velho.equipe.every((m) => C.equipDe(m) === null)); assert.equal(C.estoqueLivre(velho, 'sondaAlfa'), 2);
  const ruim = S.sanear({ v: 3, iniciado: true, dia: 5, equipamentos: { sondaAlfa: 1 }, equipe: [
    { id: 'a', nome: 'A', equip: 'sondaAlfa' }, { id: 'b', nome: 'B', equip: 'sondaAlfa' }, { id: 'c', nome: 'C', equip: 'bomba' }, { id: 'd', nome: 'D', equip: 7 }] });
  assert.deepEqual(ruim.equipe.map((m) => m.equip), ['sondaAlfa', null, null, null]);
});

const estado = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 3, proximoAlerta: null, creditos: 0, ativos: [], equipamentos: { sondaAlfa: 1 } })); } catch (e) {} `;
for (const lang of ['pt', 'en']) {
  test(`alojamento (${lang}): entregar a sonda a um cientista, o estoque cai a 0 e os outros ficam sem botão`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estado });
      await novoJogo(pg); await pg.waitForSelector('.ag-mapa'); await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
      await pg.click('[data-sala="alojamento"]'); await pg.waitForSelector('.ag-janela');
      assert.deepEqual(await pg.$$eval('[data-equip-de]', (e) => e.map((x) => x.dataset.equipDe)), ['', '', '', '']);
      await pg.click('[data-membro="c1"] [data-ag="equipar"][data-id="sondaAlfa"]');
      await pg.waitForSelector('[data-membro="c1"] [data-equip-de="sondaAlfa"]');
      assert.equal(await pg.isDisabled('[data-membro="c2"] [data-ag="equipar"][data-id="sondaAlfa"]'), true);
      const txt = await pg.textContent('[data-membro="c1"]');
      assert.match(txt, lang === 'pt' ? /Leva:\s*Sonda alfa/ : /Carries:\s*Alpha/);
      assert.match(await pg.textContent('[data-membro="c2"]'), /\(0\)/);
      if (lang === 'en') assert.doesNotMatch(await pg.textContent('.ag-janela'), /Leva|Nenhum|estoque/);
      await pg.click('[data-membro="c1"] [data-ag="equipar"][data-id=""]');
      await pg.waitForSelector('[data-membro="c1"] [data-equip-de=""]');
      assert.equal(await pg.isDisabled('[data-membro="c2"] [data-ag="equipar"][data-id="sondaAlfa"]'), false);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
