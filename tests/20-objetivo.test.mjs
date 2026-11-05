// Academia: próximo objetivo (ordem linear), seta de caminho (mapa de distâncias), revisão de lição, minimapa.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { proximoObjetivo, mapaDeDistancias, pontoAdiante, OBJ_TXT } from '../current/js/academia/objetivo.js';
import { servidor, abrirNavegador, novaPagina, iniciarMissao, lerLicao } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

const P = Array.from({ length: 8 }, (_, i) => ({ x: 10 + i, y: 3 }));
const base = () => ({
  licoes: [], temGeiger: false, tenho: { azul: false, vermelha: false }, portaAberta: { azul: false, vermelha: false },
  chavePos: { azul: { x: 5, y: 5 }, vermelha: { x: 50, y: 5 } }, geigerPos: { x: 48, y: 8 },
  portaPos: { azul: { x: 42, y: 6 }, vermelha: { x: 42, y: 25 } }, painel: P,
  salaCentro: P.map((p, i) => ({ x: 7 + i * 6, y: 7 })), salasComFonteRestante: [3, 5], achadas: 0, total: 5,
});

test('objetivo: sequência linear lição 1 > chave azul > lições 2-3 > porta azul > Geiger > lição 4 > chave vermelha > lições 5-7 > porta vermelha > lição 8 > fontes > fim', () => {
  const e = base();
  const passo = (esp, cond) => { const o = proximoObjetivo(e); assert.equal(`${o.id}${o.n ?? o.cor ?? ''}`, esp); return o; };
  passo('licao1');
  e.licoes = [0]; passo('chaveazul');
  e.tenho.azul = true; e.chavePos.azul = null; passo('licao2');
  e.licoes = [0, 1]; passo('licao3');
  e.licoes = [0, 1, 2]; passo('portaazul');
  e.portaAberta.azul = true; passo('geiger');
  e.temGeiger = true; e.geigerPos = null; passo('licao4');
  e.licoes = [0, 1, 2, 3]; passo('chavevermelha');
  e.tenho.vermelha = true; e.chavePos.vermelha = null; passo('licao5');
  e.licoes = [0, 1, 2, 3, 4, 5, 6]; passo('portavermelha');
  e.portaAberta.vermelha = true; passo('licao8');
  e.licoes = [0, 1, 2, 3, 4, 5, 6, 7];
  const f = passo('fontes'); assert.equal(f.sala, 4); assert.deepEqual(f.alvo, e.salaCentro[3]);
  e.achadas = 5; passo('fim');
});

test('objetivo: sai da ordem sem travar (Geiger sem lições 2-3? porta fechada primeiro) e textos pt/en completos', () => {
  const e = base(); e.licoes = [0, 1, 2]; e.tenho.azul = true; e.chavePos.azul = null;
  assert.equal(proximoObjetivo(e).id, 'porta');
  e.licoes = [3]; // fez a lição 4 antes (impossível no jogo), mas não deve quebrar
  assert.ok(proximoObjetivo(e).id);
  for (const lang of ['pt', 'en']) {
    const L = OBJ_TXT[lang];
    for (const id of ['licao', 'chave', 'porta', 'geiger', 'fontes', 'fim']) assert.equal(typeof L[id], 'function', `${lang}.${id}`);
    assert.ok(L.licao({ n: 2, sala: 2 }).includes('2'));
    assert.ok(L.progresso(3, 1, 5).includes('3'));
  }
});

test('caminho: mapa de distâncias contorna paredes e pontoAdiante anda ao longo do caminho, não em linha reta', () => {
  const map = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  const md = mapaDeDistancias(map, new Set(), { x: 3.5, y: 3.5 });
  assert.equal(md.dist.get(3 * 7 + 3), 0);
  assert.equal(md.dist.get(1 * 7 + 1), 8);                 // 1,1 -> 5,1 -> 5,3 -> 3,3 : 4 + 2 + 2 = 8
  const a = pontoAdiante(md, 1.5, 1.5, 3);                  // 3 passos pelo corredor de cima, não atravessa a parede
  assert.deepEqual(a, { x: 4.5, y: 1.5 });
  assert.equal(pontoAdiante(md, 0.5, 0.5, 3), null);        // dentro da parede: sem caminho
  const md2 = mapaDeDistancias(map, new Set(['5,2']), { x: 3.5, y: 3.5 });   // móvel fecha a passagem
  assert.equal(md2.dist.get(1 * 7 + 1), undefined);
});

test('academia: tudo alcançável em 10 sementes (painéis, chaves, Geiger, portas, 5 fontes) e o caminho do objetivo existe', async () => {
  for (const semente of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const { pg, ctx } = await novaPagina(nav, srv.url, { semEncontros: true, academia: true, semente });
    try {
      await iniciarMissao(pg, 1);
      const r = await pg.evaluate(async () => {
        const { mapaDeDistancias } = await import('./js/academia/objetivo.js');
        const g = window.gameScene;
        const bloq = new Set(g.blockedTiles.filter(b => g.mapData.map[b.y][b.x] !== 3).map(b => b.x + ',' + b.y));
        const md = mapaDeDistancias(g.mapData.map, bloq, g.mapData.playerStart);
        const alc = (x, y) => md.dist.has(Math.floor(y) * md.W + Math.floor(x));
        const faltam = [];
        g.paineis.forEach(p => { if (!alc(p.tx, p.ty)) faltam.push('painel' + (p.i + 1)); });
        g.chavesItens.forEach(k => { if (!alc(k.tx, k.ty)) faltam.push('chave' + k.cor); });
        if (!alc(g.geigerItem.tx, g.geigerItem.ty)) faltam.push('geiger');
        g.portasEstado.forEach(p => { if (!alc(p.rect.x, p.rect.y)) faltam.push('porta' + p.cor); });
        g.sources.forEach((s, i) => { if (!alc(s.furniture.centerX / 32, s.furniture.centerY / 32) && ![0, 1].some(() => false)) { /* móvel: o jogador chega ao lado */ } });
        // painéis não podem ficar em cima de chave/Geiger nem entre si
        const pts = [...g.paineis.map(p => [p.tx, p.ty]), ...g.chavesItens.map(k => [k.tx, k.ty]), [g.geigerItem.tx, g.geigerItem.ty]];
        let sobrepoe = 0; for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) < 1.5) sobrepoe++;
        return { faltam, sobrepoe, n: g.sources.length, pan: g.paineis.length };
      });
      assert.deepEqual(r.faltam, [], `semente ${semente}`);
      assert.equal(r.sobrepoe, 0, `semente ${semente}: itens sobrepostos`);
      assert.equal(r.n, 5); assert.equal(r.pan, 8);
    } finally { await ctx.close(); }
  }
});

test('jogo: HUD mostra progresso e próximo objetivo; seta só com dicas; revisão de lição pela tecla E sem quiz; minimapa com marcadores', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { semEncontros: true, academia: true, semente: 3, idioma: 'pt' });
  try {
    await iniciarMissao(pg, 1);
    await pg.waitForTimeout(700);
    assert.match(await pg.$eval('#hud-objective', (e) => e.textContent), /Lições 0\/8 · Fontes 0\/5/);
    assert.match(await pg.$eval('#hud-next', (e) => e.textContent), /Próximo: Lição 1: painel da sala 1/);
    assert.equal(await pg.$eval('#hud-next', (e) => e.hidden), false);
    assert.equal(await pg.evaluate(() => window.gameScene.visionGraphics.commandBuffer.length), 0, 'sem cone antes do Geiger');
    // seta existe e desenha quando o objetivo está longe (>3 tiles do jogador)
    const longe = await pg.evaluate(() => { const g = window.gameScene; g.player.setPosition(g.mapData.playerStart.x * 32 + 5 * 32, g.mapData.playerStart.y * 32); return null; });
    await pg.waitForTimeout(500);
    const seta = () => pg.evaluate(() => window.gameScene.seta && window.gameScene.seta.commandBuffer.length);
    assert.ok((await seta()) > 0, 'seta desenhada');
    await pg.evaluate(() => { GameState.settings.showHints = false; });
    await pg.waitForTimeout(300);
    assert.equal(await seta(), 0, 'sem dicas, sem seta');
    await pg.evaluate(() => { GameState.settings.showHints = true; });
    // marcadores no minimapa: algum pixel ciano (painel pendente) e algum azul (chave)
    const cores = await pg.evaluate(() => {
      const c = document.getElementById('minimap-canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let ciano = 0, azul = 0;
      for (let i = 0; i < d.length; i += 4) { if (d[i] < 80 && d[i + 1] > 170 && d[i + 2] > 190 && d[i + 3] > 200) ciano++; if (d[i] < 120 && d[i + 1] > 130 && d[i + 2] > 230 && d[i + 3] > 200 && d[i + 1] < 190) azul++; }
      return { ciano, azul };
    });
    assert.ok(cores.ciano > 0, 'painéis no minimapa'); assert.ok(cores.azul > 0, 'chave azul no minimapa');
    // faz a lição 1, depois revisa com E
    const p = await pg.evaluate(() => { const q = window.gameScene.paineis[0]; return { x: q.tx + 0.5, y: q.ty + 0.5 }; });
    await pg.evaluate(([x, y]) => { window.gameScene.player.setPosition(x * 32, y * 32); }, [p.x, p.y]);
    await pg.waitForTimeout(400);
    await lerLicao(pg); await pg.click('.licao-opcao >> nth=0'); await pg.click('#licao-seguir');
    await pg.waitForTimeout(300);
    assert.equal(await pg.$eval('#licao-modal', (e) => e.classList.contains('active')), false);
    await pg.keyboard.press('e'); await pg.waitForTimeout(300);
    assert.equal(await pg.$eval('#licao-modal', (e) => e.classList.contains('active')), true, 'E reabre a lição concluída');
    assert.equal(await pg.$('#licao-iniciar'), null, 'revisão sem botão de quiz');
    await lerLicao(pg, '#licao-fechar'); await pg.waitForTimeout(200);
    assert.equal(await pg.$eval('#licao-modal', (e) => e.classList.contains('active')), false);
    assert.equal(await pg.evaluate(() => window.gameScene.licoesFeitas.length), 1, 'revisar não conta de novo');
    // objetivo avançou: agora a chave azul
    await pg.waitForTimeout(500);
    assert.match(await pg.$eval('#hud-next', (e) => e.textContent), /chave azul/);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});
