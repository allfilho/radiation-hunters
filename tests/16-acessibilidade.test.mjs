// Acessibilidade das fontes: o sorteio só pode escolher móveis de onde o Geiger as detecta, a partir de posições alcançáveis.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { posicoesAlcancaveis, melhorTaxaLiquida } from '../current/js/fisica/acessibilidade.js';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

const CTX = { tileM: 0.5, paredeCm: 30, ehParede: () => false, blindagem: null };
const alfa = (x, y, w, h) => ({ type: 'alfa', base: 60, x: x + w / 2, y: y + h / 2, rect: { x, y, w, h } });
const caixa = (cols, rows, extras = []) => {
  const b = new Set(extras);
  for (let x = 0; x < cols; x++) { b.add(x + ',0'); b.add(x + ',' + (rows - 1)); }
  for (let y = 0; y < rows; y++) { b.add('0,' + y); b.add((cols - 1) + ',' + y); }
  return b;
};

test('sala aberta: o jogador alcança posições e mede o alfa de um móvel livre', () => {
  const blocked = caixa(10, 8, ['5,3']);
  const pos = posicoesAlcancaveis({ cols: 10, rows: 8, blocked, inicio: { x: 48, y: 48 } });
  assert.ok(pos.length > 100);
  assert.ok(melhorTaxaLiquida(alfa(5, 3, 1, 1), pos, CTX) > 25);
});

test('móvel numa área fechada (sem passagem) não é detectável: taxa 0', () => {
  // parede de 1 tile separando uma "cela" 3x3 que contém o móvel
  const cela = [];
  for (let x = 6; x <= 8; x++) for (const y of [2, 6]) cela.push(x + ',' + y);
  for (let y = 2; y <= 6; y++) for (const x of [6, 9]) cela.push(x + ',' + y);
  const blocked = caixa(12, 9, [...cela, '7,4']);
  const pos = posicoesAlcancaveis({ cols: 12, rows: 9, blocked, inicio: { x: 48, y: 48 } });
  assert.equal(melhorTaxaLiquida(alfa(7, 4, 1, 1), pos, CTX), 0);
});

test('vão de 1 tile permite passar; vão fechado por móvel bloqueia', () => {
  // móveis deixam só 1 tile de vão, o que cabe (32 px > 20 px): passa; vão fechado por móvel: não passa
  const aberto = caixa(10, 6, ['5,1', '5,2', '5,4']);       // vão em y=3
  const fechado = caixa(10, 6, ['5,1', '5,2', '5,3', '5,4']);
  const p1 = posicoesAlcancaveis({ cols: 10, rows: 6, blocked: aberto, inicio: { x: 48, y: 80 } });
  const p2 = posicoesAlcancaveis({ cols: 10, rows: 6, blocked: fechado, inicio: { x: 48, y: 80 } });
  assert.ok(p1.some(p => p.x > 6), 'passa pelo vão');
  assert.ok(!p2.some(p => p.x > 6), 'não passa');
});

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

for (const id of [1, 3, 5, 8]) {
  test(`missão ${id}: em 4 sorteios, toda fonte está num móvel alcançável de onde se mede >= 15 cps líquidos`, async () => {
    for (let k = 0; k < 4; k++) {
      const { pg, ctx } = await novaPagina(nav, srv.url, { semEncontros: true, todasDesbloqueadas: true });
      try {
        await iniciarMissao(pg, id);
        const taxas = await pg.evaluate(() => {
          const g = window.gameScene, pos = g.posicoesDoJogador();
          return g.sources.map(s => g.taxaMelhorPosicao(s.furniture, s, s.base, pos));
        });
        assert.ok(taxas.length > 0);
        for (const t of taxas) assert.ok(t >= 15, `taxa ${t}`);
      } finally { await ctx.close(); }
    }
  });
}
