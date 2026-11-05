// Academia (missão 1): mapa grande de 8 salas, uma fonte por sala, todas alcançáveis; pode ser pulada no menu.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { ACADEMIA_COLUNAS, ACADEMIA_LINHAS, SALAS_TRANCADAS, sala } from '../current/js/mapa/academia.js';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

test('geometria: 57 x 33, corredor central e 8 salas de 13 x 12 sem sobreposição', () => {
  assert.equal(ACADEMIA_COLUNAS, 57);
  assert.equal(ACADEMIA_LINHAS, 33);
  const s = Array.from({ length: 8 }, (_, i) => sala(i));
  for (const r of s) { assert.equal(r.w, 13); assert.equal(r.h, 12); assert.ok(r.x + r.w < ACADEMIA_COLUNAS && r.y + r.h < ACADEMIA_LINHAS); }
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    const a = s[i], b = s[j];
    assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y, `salas ${i} e ${j} se sobrepõem`);
  }
  assert.deepEqual(SALAS_TRANCADAS, [3, 7]);
});

for (const semente of [1, 2, 3, 4]) {
  test(`jogo (semente ${semente}): 5 fontes (salas 4 a 8), uma por sala; chaves resolvem a cadeia; nenhuma sala fica inalcançável`, async () => {
    const { pg, ctx, erros } = await novaPagina(nav, srv.url, { semEncontros: true, academia: true, semente });
    try {
      await iniciarMissao(pg, 1);
      const r = await pg.evaluate(async () => {
        const { posicoesAlcancaveis } = await import('./js/fisica/acessibilidade.js');
        const g = window.gameScene, T = 32, salas = g.mapData.salas;
        const dentro = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
        const tipoParede = new Set(g.blockedTiles.filter(t => g.mapData.map[t.y][t.x] !== 3).map(t => t.x + ',' + t.y));
        const fechadas = (abertas) => { const b = new Set(tipoParede); for (const p of g.portasEstado) if (!abertas.has(p.cor)) for (let dy = 0; dy < p.rect.h; dy++) for (let dx = 0; dx < p.rect.w; dx++) b.add((p.rect.x + dx) + ',' + (p.rect.y + dy)); return b; };
        const alcanca = (abertas) => posicoesAlcancaveis({ cols: g.mapCols, rows: g.mapRows, blocked: fechadas(abertas), inicio: { x: g.mapData.playerStart.x * T + 16, y: g.mapData.playerStart.y * T + 16 }, tile: T });
        const temSala = (pos, i) => pos.some(p => dentro(salas[i], p.x, p.y));
        const pega = (pos, k) => pos.some(p => Math.hypot(k.tx + 0.5 - p.x, k.ty + 0.5 - p.y) < 0.3);
        const azul = g.chavesItens.find(k => k.cor === 'azul'), verm = g.chavesItens.find(k => k.cor === 'vermelha');
        const p0 = alcanca(new Set()), p1 = alcanca(new Set(['azul'])), p2 = alcanca(new Set(['azul', 'vermelha']));
        return {
          n: g.sources.length,
          porSala: salas.map(r => g.sources.filter(s => dentro(r, s.furniture.x, s.furniture.y)).length),
          fechado: [temSala(p0, 3), temSala(p0, 7)],             // salas 4 e 8 inalcançáveis sem chaves
          azulSemNada: !!azul && pega(p0, azul), vermSemNada: !!verm && pega(p0, verm),
          vermComAzul: !!verm && pega(p1, verm), oito: temSala(p1, 7),
          todas: salas.map((_, i) => temSala(p2, i)),
          taxas: g.sources.map(s => g.taxaMelhorPosicao(s.furniture, s, s.base, p2)),
          salaDaAzul: azul ? salas.findIndex(r => dentro(r, azul.tx, azul.ty)) : -1,
          salaDaVerm: verm ? salas.findIndex(r => dentro(r, verm.tx, verm.ty)) : -1,
        };
      });
      assert.equal(r.n, 5);
      assert.deepEqual(r.porSala, [0, 0, 0, 1, 1, 1, 1, 1]);
      assert.deepEqual(r.fechado, [false, false], 'salas 4 e 8 ficam atrás das portas');
      assert.equal(r.azulSemNada, true, 'a chave azul se pega sem nenhuma chave');
      assert.equal(r.vermSemNada, false, 'a vermelha NÃO se pega sem a azul');
      assert.equal(r.vermComAzul, true, 'a vermelha se pega depois da azul');
      assert.equal(r.oito, false, 'a sala 8 continua fechada só com a azul');
      assert.deepEqual(r.todas, Array(8).fill(true), 'com as duas chaves todas as salas são alcançáveis');
      assert.equal(r.salaDaAzul, 0); assert.equal(r.salaDaVerm, 3);
      for (const t of r.taxas) assert.ok(t >= 15, `taxa ${t}`);
      assert.deepEqual(erros, []);
    } finally { await ctx.close(); }
  });
}

test('chaves e portas no jogo: pegar passando perto, inventário, aviso sem chave, porta abre sozinha com a chave', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { semEncontros: true, academia: true });
  try {
    await iniciarMissao(pg, 1);
    const slots = () => pg.$$eval('#inventory .inventory-slot', (e) => e.map((x) => x.classList.contains('cheio')));
    assert.deepEqual(await slots(), [false, false, false]);   // 2 chaves + Geiger
    const ir = (x, y) => pg.evaluate(([x, y]) => { window.gameScene.player.setPosition(x * 32, y * 32); }, [x, y]);
    // perto da porta azul sem chave: continua fechada e há aviso
    await ir(41.2, 6.5); await pg.waitForTimeout(600);
    assert.equal(await pg.evaluate(() => window.gameScene.mapData.map[6][42]), 3);
    assert.match(await pg.evaluate(() => document.body.innerText), /trancada|Locked door/);
    // pega a chave azul
    const k = await pg.evaluate(() => { const c = window.gameScene.chavesItens.find(c => c.cor === 'azul'); return { x: c.tx + 0.5, y: c.ty + 0.5 }; });
    await ir(k.x, k.y); await pg.waitForTimeout(400);
    assert.deepEqual(await slots(), [true, false, false]);
    assert.equal(await pg.evaluate(() => window.gameScene.chavesItens.some(c => c.cor === 'azul')), false);
    // com a chave mas sem as lições 1-3 a porta continua fechada; com as lições abre sozinha
    await pg.evaluate(() => { window.gameScene.licoesFeitas.push(0, 1, 2); });
    await ir(41.2, 6.5); await pg.waitForTimeout(600);
    const aberta = await pg.evaluate(() => ({ tile: window.gameScene.mapData.map[6][42], bloq: window.gameScene.blockedTiles.some(t => t.x === 42 && t.y === 6) }));
    assert.equal(aberta.tile, 0); assert.equal(aberta.bloq, false);
    // dá para entrar na sala 4 e pegar a chave vermelha lá
    const v = await pg.evaluate(() => { const c = window.gameScene.chavesItens.find(c => c.cor === 'vermelha'); return { x: c.tx + 0.5, y: c.ty + 0.5 }; });
    await ir(v.x, v.y); await pg.waitForTimeout(400);
    assert.deepEqual(await slots(), [true, true, false]);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('academia: a câmera segue o jogador pelo mapa grande (teleporte à última sala)', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { semEncontros: true, academia: true });
  try {
    await iniciarMissao(pg, 1);
    await pg.evaluate(() => { window.gameScene.player.setPosition(10 * 32, 25 * 32); });   // sala 5
    await pg.waitForTimeout(1500);
    const c = await pg.evaluate(() => { const g = window.gameScene, v = g.cameras.main.worldView; return { px: g.player.x, py: g.player.y, vx: v.x, vy: v.y, vw: v.width, vh: v.height }; });
    assert.ok(c.px >= c.vx && c.px <= c.vx + c.vw && c.py >= c.vy && c.py <= c.vy + c.vh, 'jogador na vista');
    assert.ok(c.vh < 33 * 32 && c.vw < 57 * 32, 'a vista é menor que o mapa');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('menu: a Academia tem o botão de pular; pular libera a missão 2 e o botão some', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { academia: true, antes: "try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1] })); } catch (e) {}" });
  try {
    await pg.click('#btn-missions');
    const cartoes = async () => pg.$$eval('#missions-container > *', (els) => els.map((e) => e.classList.contains('locked')));
    assert.equal((await cartoes())[1], true, 'missão 2 bloqueada');
    assert.equal(await pg.locator('#btn-skip-academy').count(), 1);
    await pg.click('#btn-skip-academy');
    assert.equal((await cartoes())[1], false, 'missão 2 liberada');
    assert.equal(await pg.locator('#btn-skip-academy').count(), 0);
    const salvo = await pg.evaluate(() => JSON.parse(localStorage.getItem('radiationHunters')).unlockedMissions);
    assert.ok(salvo.includes(2));
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});
