// Câmera que segue o jogador, mapas maiores que a tela, layouts de celular (retrato e paisagem) e redimensionamento.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

async function comPagina(opc, fn) {
  const p = await novaPagina(nav, srv.url, { semEncontros: true, ...opc });
  try { return await fn(p); } finally { await p.ctx.close(); }
}
const camera = (pg) => pg.evaluate(() => {
  const g = window.gameScene, c = g.cameras.main, v = c.worldView, T = 32;
  return { zoom: c.zoom, dpr: g.registry.get('dpr'), W: g.mapCols * T, H: g.mapRows * T,
    vx: v.x, vy: v.y, vw: v.width, vh: v.height, px: g.player.x, py: g.player.y,
    cw: g.scale.width, ch: g.scale.height };
});
const W_ = (f) => Math.round(56 * 32 * f), H_ = (f) => Math.round(40 * 32 * f);
const dentro = (pg, seletores) => pg.evaluate((sel) => sel.map((q) => {
  const e = document.querySelector(q); if (!e) return [q, 'ausente'];
  const r = e.getBoundingClientRect();
  return [q, r.width > 0 && r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1];
}), seletores);

test('desktop: mapa pequeno aparece inteiro e centralizado, sem rolar', () =>
  comPagina({ viewport: { width: 1280, height: 800 } }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    const c = await camera(pg);
    assert.ok(c.zoom / c.dpr >= 1, 'tiles com pelo menos 32 px');
    assert.ok(c.vx <= 1 && c.vx + c.vw >= c.W - 1 && c.vy <= 1 && c.vy + c.vh >= c.H - 1, 'o mapa inteiro está na vista');
    assert.ok(Math.abs((c.vx + c.vw / 2) - c.W / 2) < 2, 'centralizado na horizontal');
    assert.deepEqual(erros, []);
  }));

test('mapa maior que a tela (56x40 tiles): a câmera segue o jogador e o minimapa acompanha o tamanho', () =>
  comPagina({ viewport: { width: 1280, height: 800 } }, async ({ pg, erros }) => {
    await pg.evaluate(() => { MISSIONS[0].mapCols = 56; MISSIONS[0].mapRows = 40; });
    await iniciarMissao(pg, 1);
    let c = await camera(pg);
    assert.equal(c.W, 56 * 32);
    assert.ok(c.vw < c.W && c.vh < c.H, 'a vista é menor que o mapa');
    const mm = await pg.evaluate(() => { const m = document.getElementById('minimap-canvas'); return [m.width, m.height]; });
    assert.ok(Math.abs(mm[0] / mm[1] - 56 / 40) < 0.05, 'minimapa proporcional ao mapa');
    // leva o jogador (teleporte) para pontos distantes; a câmera o acompanha e respeita as bordas
    for (const [x, y] of [[W_(0.5), H_(0.5)], [W_(0.9), H_(0.5)], [W_(0.9), H_(0.9)], [W_(0.1), H_(0.9)]]) {
      await pg.evaluate(([x, y]) => window.gameScene.player.setPosition(x, y), [x, y]);
      await pg.waitForTimeout(1500);
      c = await camera(pg);
      assert.ok(c.px >= c.vx && c.px <= c.vx + c.vw && c.py >= c.vy && c.py <= c.vy + c.vh, `jogador na vista em ${x},${y}`);
      assert.ok(c.vx >= -1 && c.vy >= -1 && c.vx + c.vw <= c.W + 1 && c.vy + c.vh <= c.H + 1, 'a câmera respeita as bordas do mapa');
    }
    assert.ok(c.vx > 0 || c.vy > 0, 'a câmera rolou');
    assert.deepEqual(erros, []);
  }));

for (const [nome, vp] of [['retrato 390x844', { width: 390, height: 844 }], ['paisagem 844x390', { width: 844, height: 390 }], ['paisagem 667x375', { width: 667, height: 375 }]]) {
  test(`celular ${nome}: botões de ação, escudos, joystick e HUD cabem na tela; canvas ocupa a tela`, () =>
    comPagina({ viewport: vp }, async ({ pg, erros }) => {
      await iniciarMissao(pg, 1);
      const r = await dentro(pg, ['#btn-geiger', '#btn-identify', '#btn-pause', '#touch-run', '.shield-btn[data-shield="0"]', '.shield-btn[data-shield="3"]', '#joy-zone', '.geiger-display', '#minimap-container']);
      for (const [q, ok] of r) assert.equal(ok, true, `${q} dentro da tela (${nome})`);
      const k = await pg.evaluate(() => { const b = document.querySelector('#game-container canvas').getBoundingClientRect(); return [b.width, b.height, innerWidth, innerHeight]; });
      assert.ok(Math.abs(k[0] - k[2]) < 2 && Math.abs(k[1] - k[3]) < 2, `canvas ${k.map(Math.round)}`);
      const c = await camera(pg);
      assert.ok(c.px >= c.vx && c.px <= c.vx + c.vw && c.py >= c.vy && c.py <= c.vy + c.vh, 'jogador na vista');
      assert.deepEqual(erros, []);
    }));
}

test('girar o celular (390x844 -> 844x390) reajusta o canvas e a câmera sem perder o jogador', () =>
  comPagina({ viewport: { width: 390, height: 844 } }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    await pg.setViewportSize({ width: 844, height: 390 });
    await pg.waitForTimeout(500);
    const k = await pg.evaluate(() => { const b = document.querySelector('#game-container canvas').getBoundingClientRect(); return [b.width, b.height]; });
    assert.ok(Math.abs(k[0] - 844) < 2 && Math.abs(k[1] - 390) < 2, `canvas ${k}`);
    const c = await camera(pg);
    assert.ok(Math.abs(c.cw / c.dpr - 844) < 2 && Math.abs(c.ch / c.dpr - 390) < 2, 'tamanho do jogo atualizado');
    assert.ok(c.px >= c.vx && c.px <= c.vx + c.vw && c.py >= c.vy && c.py <= c.vy + c.vh, 'jogador na vista');
    assert.deepEqual(erros, []);
  }));

test('o joystick não rouba toques dos botões de ação (Geiger liga com toque no botão)', () =>
  comPagina({ viewport: { width: 390, height: 844 } }, async ({ pg }) => {
    await iniciarMissao(pg, 1);
    const b = await pg.$('#btn-geiger');
    const box = await b.boundingBox();
    await pg.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    assert.equal(await pg.evaluate(() => GameState.geigerActive), true);
  }));

test('personagem: sprite muda de direção e anima ao andar; detector aponta para a frente', () =>
  comPagina({ viewport: { width: 1280, height: 800 } }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 1);
    const estado = () => pg.evaluate(() => { const g = window.gameScene; return { k: g.sprite.texture.key, a: g.geigerDevice.rotation, x: g.player.x }; });
    await pg.keyboard.down('d'); await pg.waitForTimeout(300);
    const dir = await estado();
    assert.match(dir.k, /^cacador_right_[12]$/);
    assert.ok(Math.abs(dir.a) < 0.01, 'detector aponta para a direita');
    await pg.keyboard.up('d'); await pg.waitForTimeout(200);
    assert.equal((await estado()).k, 'cacador_right_0', 'parado volta ao quadro 0');
    await pg.keyboard.down('a'); await pg.waitForTimeout(300);
    assert.match((await estado()).k, /^cacador_left_/);
    await pg.keyboard.up('a');
    assert.deepEqual(erros, []);
  }));
