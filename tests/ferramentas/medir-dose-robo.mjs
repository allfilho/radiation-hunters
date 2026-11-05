// Mede cps·s gama por saída nas missões 2 a 8 (robô que anda e fica 10 s junto de cada fonte). Uso: cd tests/ferramentas && RH_ROOT=../../current node medir-dose-robo.mjs > saida.json
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from '../helpers/navegador.mjs';
const srv = await servidor(), nav = await abrirNavegador();
const res = {};
for (const id of [2, 3, 4, 5, 6, 7, 8]) {
  res[id] = [];
  for (let k = 0; k < 3; k++) {
    const { pg } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true, semEncontros: true, semente: 100 + k * 7 });
    await iniciarMissao(pg, id);
    const r = await pg.evaluate(async () => {
      const { taxaGamaCps } = await import('/js/fisica/dose.js');
      const s = window.gameScene, T = CONFIG.TILE_SIZE, P = 8, V = 150;
      const W = (s.mapCols || CONFIG.MAP_COLS) * T, H = (s.mapRows || CONFIG.MAP_ROWS) * T;
      const ch = (x, y) => x + ',' + y;
      const bfs = (x0, y0) => { const d = new Map([[ch(x0, y0), 0]]), f = [[x0, y0]]; for (let i = 0; i < f.length; i++) { const [x, y] = f[i]; for (const [dx, dy] of [[P, 0], [-P, 0], [0, P], [0, -P]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx > W || ny > H || d.has(ch(nx, ny)) || s.isBlocked(nx, ny)) continue; d.set(ch(nx, ny), d.get(ch(x, y)) + 1); f.push([nx, ny]); } } return d; };
      const ctx = { tileM: s.missionData.tileM ?? CONFIG.TILE_M, paredeCm: CONFIG.PAREDE_CM, ehParede: s.ehParede };
      const cps = (x, y) => taxaGamaCps(s.sources.map((q) => s.fonteFisica(q)), { x: x / T, y: y / T }, ctx);
      const x0 = Math.round(s.player.x / P) * P, y0 = Math.round(s.player.y / P) * P;
      let cur = [x0, y0], soma = 0, tempo = 0, pico = 0; const fonteK = [];
      const andar = (de, para) => { // caminho por gradiente reverso: BFS a partir do destino
        const d = bfs(para[0], para[1]); let [x, y] = de;
        for (let g = 0; g < 4000 && (x !== para[0] || y !== para[1]); g++) {
          let melhor = null, md = d.get(ch(x, y));
          for (const [dx, dy] of [[P, 0], [-P, 0], [0, P], [0, -P]]) { const v = d.get(ch(x + dx, y + dy)); if (v !== undefined && v < md) { md = v; melhor = [x + dx, y + dy]; } }
          if (!melhor) break; x = melhor[0]; y = melhor[1];
          const c = cps(x, y), dt = P / V; soma += c * dt; tempo += dt; pico = Math.max(pico, c);
        }
        return [x, y];
      };
      const restantes = () => s.sources.filter((q) => !q.found);
      let guarda = 0;
      while (restantes().length && guarda++ < 20) {
        const d0 = bfs(cur[0], cur[1]); let alvo = null, melhorD = 1e9;
        for (const q of restantes()) {
          const r = s.rectDoMovel(q.furniture);
          for (const [k, dist] of d0) { const [x, y] = k.split(',').map(Number); if (Geiger.distanciaAoRetangulo(r, x / T, y / T) <= CONFIG.IDENTIFY_DISTANCE * 0.9 && dist < melhorD) { melhorD = dist; alvo = { q, x, y }; } }
        }
        if (!alvo) break;
        cur = andar(cur, [alvo.x, alvo.y]);
        const c = cps(cur[0], cur[1]); soma += c * 10; tempo += 10; pico = Math.max(pico, c); fonteK.push(Math.round(c));
        alvo.q.found = true;
      }
      return { cpsSegundos: soma, tempo, pico, n: s.sources.length, cpsNaFonte: fonteK };
    });
    res[id].push(r);
    await pg.close();
  }
}
console.log(JSON.stringify(res));
await nav.close(); await srv.fechar();
