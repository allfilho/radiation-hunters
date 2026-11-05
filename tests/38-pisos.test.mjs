// Pisos nas investigações (etapa 3b do radônio v2): escada entre mapas, cada piso com a sua planta. Node + Chromium.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const P = await imp('js/investigacao/pisos.js');
const { INVESTIGACOES } = await imp('js/investigacao/index.js');
const { MapGenerator } = await imp('js/mapa/gerador.js');
const radon = INVESTIGACOES.find((i) => i.id === 'radonio-escola');
const campo = radon.campo;

const base = () => ({ id: campo.numero, mapTheme: campo.tema, mapCols: campo.planta.cols, mapRows: campo.planta.rows, investigacaoCampo: campo });
const alcancaveis = (map, ini) => {
  const rows = map.length, cols = map[0].length, vis = new Set([ini.x + ',' + ini.y]), fila = [[ini.x, ini.y]];
  while (fila.length) {
    const [x, y] = fila.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || vis.has(k) || map[ny][nx] === 1 || map[ny][nx] === 2) continue;
      vis.add(k); fila.push([nx, ny]);
    }
  }
  return vis;
};

test('configuração de pisos coerente: toda escada tem volta, chegada fora do raio da escada de volta, pontos em pisos que existem', () => {
  assert.deepEqual(P.validarPisos(campo), []);
  assert.equal(P.temPisos(campo), true);
  assert.equal(P.temPisos({ locais: [] }), false);
  const ruim = { pisos: { terreo: { escadas: [{ id: 'a', x: 1, y: 1, para: 'x', chegada: { x: 2, y: 2 } }] } }, locais: [{ id: 'p', piso: 'y' }] };
  assert.ok(P.validarPisos({ ...ruim, pisos: { ...ruim.pisos, x: { planta: {}, escadas: [] } } }).length >= 2);
});

test('rota entre pisos: busca em largura sobre as escadas (porão, térreo, 1º andar, sótão em cadeia)', () => {
  const cadeia = { pisos: {
    porao: { escadas: [{ id: 'a', x: 0, y: 0, para: 'terreo' }] },
    terreo: { escadas: [{ id: 'b', x: 1, y: 0, para: 'porao' }, { id: 'c', x: 2, y: 0, para: 'andar1' }] },
    andar1: { planta: {}, escadas: [{ id: 'd', x: 3, y: 0, para: 'terreo' }, { id: 'e', x: 4, y: 0, para: 'sotao' }] },
    sotao: { planta: {}, escadas: [{ id: 'f', x: 5, y: 0, para: 'andar1' }] },
  } };
  assert.equal(P.proximaEscada(cadeia, 'porao', 'sotao').id, 'a');
  assert.equal(P.proximaEscada(cadeia, 'terreo', 'sotao').id, 'c');
  assert.equal(P.proximaEscada(cadeia, 'sotao', 'porao').id, 'f');
  assert.equal(P.proximaEscada(cadeia, 'terreo', 'terreo'), null);
  assert.equal(P.proximaEscada(cadeia, 'terreo', 'nao-existe'), null);
  assert.equal(P.escadaSobre([{ x: 10, y: 5 }], 10.5, 5.5)?.x, 10);
  assert.equal(P.escadaSobre([{ x: 10, y: 5 }], 12.5, 5.5), null);
});

test('cada piso gera o seu mapa: móveis todos colocados; escada, chegada e pontos do piso alcançáveis a partir do início', () => {
  for (const piso of Object.keys(campo.pisos)) {
    const m = P.missaoDoPiso(base(), piso), c = m.investigacaoCampo;
    const d = new MapGenerator(m.mapCols, m.mapRows, m.mapTheme, m).generate();
    assert.equal(d.map.length, c.planta.rows); assert.equal(d.map[0].length, c.planta.cols);
    assert.equal(d.furniture.length, c.planta.moveis.length, piso + ': móveis perdidos');
    const alc = alcancaveis(d.map, d.playerStart);
    const perto = (x, y, r = 1.6) => [...alc].some((k) => { const [tx, ty] = k.split(',').map(Number); return Math.hypot(tx + 0.5 - x, ty + 0.5 - y) < r; });
    for (const e of c.escadas) assert.ok(alc.has(e.x + ',' + e.y), `${piso}: escada ${e.id} inalcançável`);
    for (const e of Object.values(campo.pisos).flatMap((p) => p.escadas || []).filter((e) => e.para === piso)) {
      assert.ok(alc.has(Math.floor(e.chegada.x) + ',' + Math.floor(e.chegada.y)), `chegada em ${piso} fora do piso andável`);
    }
    for (const l of campo.locais.filter((l) => P.pisoDoLocal(l) === piso)) assert.ok(perto(l.x, l.y), `${piso}: ponto ${l.id} inalcançável`);
  }
});

const abrir = async (nav, srv, opcoes = {}) => {
  const r = await novaPagina(nav, srv.url + '?investigacao=radonio-escola', { idioma: 'pt', ...opcoes });
  await r.pg.waitForFunction(() => window.gameScene?.pontosInvestigacao?.length > 0 && window.gameScene.player, null, { timeout: 30000 });
  await r.pg.waitForTimeout(400);
  return r;
};
const noPiso = (pg, piso) => pg.waitForFunction((p) => { const g = window.gameScene; return g.piso === p && !g.transicao && g.player && g.pontosInvestigacao?.length && g.cameras.main.fadeEffect?.isRunning === false; }, piso, { timeout: 15000 });
const andar = async (pg, tecla, ms) => { await pg.keyboard.down(tecla); await pg.waitForTimeout(ms); await pg.keyboard.up(tecla); };

test('no navegador: sobe e desce a escada, a sessão se mantém, o ponto do 1º andar aparece lá e o objetivo aponta para a escada', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await abrir(nav, srv);
    assert.equal(await pg.evaluate(() => window.gameScene.piso), 'terreo');
    // a 2ª etapa fica no 1º andar: o objetivo, no térreo, aponta para a escada
    await pg.evaluate(() => { for (const id of ['pergunta-ar', 'ventilacao', 'porao-ar', 'sotao-ar']) ui.investigacao.sessao.concluidas[id] = true; window.gameScene.hudInvestigacao = null; window.gameScene.atualizarObjetivo(); });
    const alvo = await pg.evaluate(() => ({ ...window.gameScene.objAtual.alvo, prox: document.getElementById('sources-tracker').textContent }));
    assert.deepEqual([alvo.x, alvo.y], [29.5, 13.5]);
    assert.match(alvo.prox, /Térreo/);
    const serie = await pg.evaluate(() => { const p = window.gameScene.pontosInvestigacao.find((q) => q.id === 'serie'); return { fora: p.fora, vis: p.obj.visible }; });
    assert.deepEqual(serie, { fora: true, vis: false });
    // sobe
    await pg.evaluate(() => window.gameScene.player.setPosition(28.3 * 32, 13.5 * 32));
    await andar(pg, 'd', 400);
    await noPiso(pg, 'andar1');
    const a1 = await pg.evaluate(() => { const g = window.gameScene, T = 32, p = g.pontosInvestigacao.find((q) => q.id === 'serie'); return { x: g.player.x / T, y: g.player.y / T, rows: g.mapRows, cols: g.mapCols, fora: p.fora, vis: p.obj.visible, alvo: g.objAtual.alvo, feita: !!ui.investigacao.sessao.concluidas['pergunta-ar'], botoes: document.querySelectorAll('#inv-caderno').length + document.querySelectorAll('#inv-modo-leitura').length, tracker: document.getElementById('sources-tracker').textContent }; });
    assert.equal(a1.rows, 16); assert.equal(a1.cols, 32);
    assert.ok(Math.hypot(a1.x - 27.5, a1.y - 11.5) < 0.8, `chegada em ${a1.x},${a1.y}`);
    assert.equal(a1.fora, undefined); assert.equal(a1.vis, true);
    assert.equal(a1.feita, true, 'a sessão da investigação se mantém entre os pisos');
    assert.equal(a1.botoes, 2, 'botões de leitura e caderno não duplicam');
    assert.match(a1.tracker, /1º andar/);
    await pg.waitForTimeout(900);
    assert.equal(await pg.evaluate(() => window.gameScene.piso), 'andar1', 'não deve voltar sozinho (sem vaivém na escada)');
    // volta
    await pg.evaluate(() => window.gameScene.player.setPosition(28.3 * 32, 12.5 * 32));
    await andar(pg, 'd', 400);
    await noPiso(pg, 'terreo');
    const t = await pg.evaluate(() => { const g = window.gameScene; return { x: g.player.x / 32, y: g.player.y / 32, rows: g.mapRows, botoes: document.querySelectorAll('#inv-caderno').length }; });
    assert.equal(t.rows, 44); assert.ok(Math.hypot(t.x - 27.5, t.y - 13.5) < 0.8, `volta em ${t.x},${t.y}`); assert.equal(t.botoes, 1);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('no navegador: o ponto do 1º andar abre a cena certa; o minimapa e a câmera seguem o piso; celular em paisagem', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await abrir(nav, srv, { toque: true, viewport: { width: 844, height: 390 } });
    await pg.evaluate(() => { for (const id of ['pergunta-ar', 'ventilacao', 'porao-ar', 'sotao-ar']) ui.investigacao.sessao.concluidas[id] = true; });
    await pg.evaluate(() => window.gameScene.subirOuDescer(window.gameScene.campo.escadas[0]));
    await noPiso(pg, 'andar1');
    const m = await pg.evaluate(() => { const g = window.gameScene, c = document.getElementById('minimap-canvas'); const b = g.cameras.main.getBounds(); return { mw: c.width, mh: c.height, bw: b.width, bh: b.height, cols: g.mapCols, rows: g.mapRows }; });
    assert.ok(m.mw / m.mh > 1.5 && m.mw / m.mh < 2.5, 'o minimapa acompanha a proporção de 32 x 16 tiles');
    assert.ok(m.bw >= m.cols * 32 - 1 && m.bh >= m.rows * 32 - 1);
    await pg.evaluate(() => window.gameScene.player.setPosition(window.gameScene.pontosInvestigacao.find((p) => p.id === 'serie').x * 32, window.gameScene.pontosInvestigacao.find((p) => p.id === 'serie').y * 32 + 30));
    await pg.evaluate(() => window.gameScene.handleIdentify());
    await pg.waitForSelector('#investigacao-screen.active', { timeout: 5000 });
    assert.equal(await pg.evaluate(() => ui.investigacao.sessao.i), 4, 'abriu a cena 5 (a campanha: registros do 1º andar)');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
