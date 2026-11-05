// Ajuda para medir o Geiger de forma isolada, usando as funções reais do jogo.
// ATALHO DOCUMENTADO: o jogador é posicionado por código (não caminha). A
// leitura vem de GameScene.measureRadiation(), a mesma chamada do jogo.
import { mediaVar } from './navegador.mjs';

/** Prepara, dentro da página, a função de medição isolada. */
export async function instalarMedidor(pg) {
  await pg.evaluate(() => {
    window.__geiger = {
      /** índice da primeira fonte do tipo pedido ('alfa' | 'beta' | 'gama') */
      indice(tipo) { return window.gameScene.sources.findIndex((s) => s.type === tipo); },

      /**
       * Mede só a fonte `idx`, com o jogador a `dTiles` dela, de frente para ela
       * (a menos que `desvioGraus` desloque a direção do olhar).
       * Procura entre 16 direções uma com linha de visão livre e posição válida.
       */
      medir(idx, dTiles, { escudo = 0, n = 300, desvioGraus = 0 } = {}) {
        const s = window.gameScene, T = CONFIG.TILE_SIZE;
        s.sources.forEach((x, i) => { x.found = i !== idx; }); // isola a fonte
        const src = s.sources[idx];
        const cx = src.furniture.centerX, cy = src.furniture.centerY;
        const paredes = s.blockedTiles.filter((t) => s.mapData.map[t.y]?.[t.x] === 1);
        let escolhido = null;
        for (let k = 0; k < 16 && !escolhido; k++) {
          const ang = k * Math.PI / 8;
          const x = cx - Math.cos(ang) * dTiles * T, y = cy - Math.sin(ang) * dTiles * T;
          const tx = Math.floor(x / T), ty = Math.floor(y / T);
          const cel = s.mapData.map[ty]?.[tx];
          if (cel === undefined || cel === 1) continue;
          if (!hasLineOfSight(tx, ty, Math.floor(cx / T), Math.floor(cy / T), paredes)) continue;
          escolhido = { ang, x, y };
        }
        if (!escolhido) return { erro: 'sem direção livre' };
        s.player.x = escolhido.x; s.player.y = escolhido.y;
        s.playerDirection = escolhido.ang + desvioGraus * Math.PI / 180;
        GameState.currentShield = escudo;
        const a = [];
        const taxas = [];
        for (let i = 0; i < n; i++) { s.measureRadiation(); a.push(s.lastCount); taxas.push(s.lastRate); }
        return { amostras: a, taxa: taxas[0], ang: escolhido.ang, base: src.base, tipo: src.type, nome: src.name };
      },

      /** fundo puro: todas as fontes marcadas como achadas */
      fundo(n = 3000) {
        const s = window.gameScene;
        s.sources.forEach((x) => { x.found = true; });
        GameState.currentShield = 0;
        const a = [];
        for (let i = 0; i < n; i++) { s.measureRadiation(); a.push(s.lastCount); }
        return a;
      },
    };
  });
}

/**
 * Sinal da fonte. `amostras` são CONTAGENS por passo de GEIGER_PASSO_MS (cru, sem média móvel).
 * media/variancia: das contagens; cps = media/dt; sinal = cps - BG_RADIATION; taxa = taxa esperada (cps)
 * calculada pelo modelo; dispersao = variancia/media (Poisson => 1).
 */
export async function sinal(pg, tipo, dTiles, opcoes = {}) {
  const r = await pg.evaluate(([t, d, o]) => {
    const i = window.__geiger.indice(t);
    return { i, ...window.__geiger.medir(i, d, o) };
  }, [tipo, dTiles, opcoes]);
  if (r.erro) throw new Error(`${r.erro} (${tipo}, d=${dTiles})`);
  const mv = mediaVar(r.amostras);
  const [bg, dt] = await pg.evaluate(() => [CONFIG.BG_RADIATION, CONFIG.GEIGER_PASSO_MS / 1000]);
  const cps = mv.media / dt;
  return { ...mv, cps, sinal: cps - bg, taxa: r.taxa, dispersao: mv.variancia / mv.media, base: r.base, nome: r.nome, dt };
}
