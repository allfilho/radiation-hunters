// Mapas grandes das missões 2–8 (v3.9): ≤64 colunas/linhas, início livre, tudo alcançável, móveis suficientes.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO } from './helpers/navegador.mjs';

const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

for (const id of [2, 3, 4, 5, 6, 7, 8]) {
  test(`missão ${id}: planta grande, início livre, móveis alcançáveis e fontes possíveis`, async () => {
    const G = await mod('mapa/gerador.js'), M = await mod('data/missoes/index.js'), X = await mod('render/mobiliario-externo.js');
    const mis = M.MISSIONS.find((m) => m.id === id);
    assert.ok(mis.planta, 'sem planta');
    assert.ok(mis.mapCols <= 64 && mis.mapRows <= 64 && mis.mapCols >= 40, 'tamanho fora de 40..64');
    for (let sem = 0; sem < 5; sem++) {
      const d = new G.MapGenerator(mis.mapCols, mis.mapRows, mis.mapTheme, mis).generate();
      const H = d.playerStart; assert.equal(d.map[H.y][H.x], 0, 'início bloqueado');
      const visto = new Set([`${H.x},${H.y}`]), fila = [[H.x, H.y]];
      while (fila.length) { const [x, y] = fila.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = `${nx},${ny}`; if (!visto.has(k) && d.map[ny]?.[nx] === 0) { visto.add(k); fila.push([nx, ny]); } } }
      const alcanca = (f) => { for (let dy = -1; dy <= f.type.height; dy++) for (let dx = -1; dx <= f.type.width; dx++) if (visto.has(`${f.x + dx},${f.y + dy}`)) return true; return false; };
      const fontes = d.furniture.filter((f) => !X.ehMovelExterno(f.type.id));
      assert.deepEqual(fontes.filter((f) => !alcanca(f)).map((f) => f.type.id + '@' + f.x + ',' + f.y), [], 'móvel de fonte inalcançável');
      assert.ok(fontes.length >= (mis.numSources || 3) * 2, `poucos móveis (${fontes.length})`);
      if (mis.planta.reator) assert.ok(d.reactorPosition, 'sem reator');
    }
  });
}
