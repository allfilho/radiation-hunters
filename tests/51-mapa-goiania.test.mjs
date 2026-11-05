// Mapa contínuo de Goiânia (v3.8): exterior + edifícios com porta, tudo alcançável a partir do heliponto H.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('planta de Goiânia: 60×40, início em piso livre, móveis alcançáveis, cada edifício tem porta e fontes possíveis', async () => {
  const G = await mod('mapa/gerador.js'), M = await mod('data/missoes/index.js'), P = await mod('mapa/plantas-missoes.js'), X = await mod('render/mobiliario-externo.js');
  const mis = M.MISSIONS.find((m) => m.id === 2);
  assert.equal(mis.mapCols, 60); assert.equal(mis.mapRows, 40);
  const d = new G.MapGenerator(mis.mapCols, mis.mapRows, mis.mapTheme, mis).generate();
  const H = d.playerStart; assert.equal(d.map[H.y][H.x], 0);
  const visto = new Set([`${H.x},${H.y}`]), fila = [[H.x, H.y]];
  while (fila.length) { const [x, y] = fila.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = `${nx},${ny}`; if (!visto.has(k) && d.map[ny]?.[nx] === 0) { visto.add(k); fila.push([nx, ny]); } } }
  const alcanca = (f) => { for (let dy = -1; dy <= f.type.height; dy++) for (let dx = -1; dx <= f.type.width; dx++) if (visto.has(`${f.x + dx},${f.y + dy}`)) return true; return false; };
  assert.deepEqual(d.furniture.filter((f) => !alcanca(f)).map((f) => f.type.id + '@' + f.x + ',' + f.y), [], 'móvel inalcançável');
  const fontes = d.furniture.filter((f) => !X.ehMovelExterno(f.type.id));
  assert.ok(fontes.length >= 25, 'móveis suficientes para esconder as fontes');
  for (const b of P.PLANTA_GOIANIA.internas) assert.ok(visto.has(`${b.x + 1},${b.y + 1}`) || [...visto].some((k) => { const [x, y] = k.split(',').map(Number); return x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h; }), `sala ${b.x},${b.y} sem acesso`);
});

test('Goiânia no jogo: mapa grande, 5 fontes fora de árvores e postes, minimapa e ponto H', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true, semEncontros: true });
    await iniciarMissao(pg, 2);
    const r = await pg.evaluate(() => { const s = window.gameScene; return { c: s.mapCols, r: s.mapRows, n: s.sources.length, ext: s.sources.filter((q) => ['tree', 'lamp_post', 'parked_car'].includes(q.furniture.type.id)).length, h: s.mapData.playerStart }; });
    assert.equal(r.c, 60); assert.equal(r.r, 40); assert.equal(r.n, 5); assert.equal(r.ext, 0); assert.deepEqual(r.h, { x: 4, y: 19 });
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
