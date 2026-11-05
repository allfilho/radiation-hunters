// Gera folhas de catálogo (PNG) com TODOS os móveis de cada tema, desenhados pelo renderizador real do jogo.
// Uso: RH_ROOT=<current> node catalogo-moveis.mjs <pasta-de-saída> [zoom=2] [tema,tema,...]
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { servidor, abrirNavegador, novaPagina, RAIZ_JOGO } from '../helpers/navegador.mjs';
const saida = process.argv[2] || '.', zoom = Number(process.argv[3] || 2), filtro = (process.argv[4] || '').split(',').filter(Boolean);
const { FURNITURE_TYPES } = await import(pathToFileURL(path.join(RAIZ_JOGO, 'js/data/moveis.js')).href);
const { MAP_THEMES } = await import(pathToFileURL(path.join(RAIZ_JOGO, 'js/mapa/temas.js')).href);
const s = await servidor(); const nav = await abrirNavegador();
try {
  const { pg, erros } = await novaPagina(nav, s.url, { viewport: { width: 1400, height: 900 } });
  for (const tema of Object.keys(FURNITURE_TYPES)) {
    if (filtro.length && !filtro.includes(tema)) continue;
    const tipos = FURNITURE_TYPES[tema], piso = MAP_THEMES[tema]?.floor ?? 0x333333;
    await pg.evaluate(async ({ tema, tipos, piso, zoom }) => {
      const { FurnitureRenderer } = await import('/js/render/moveis.js');
      document.querySelectorAll('canvas').forEach((c) => { c.style.display = 'none'; });
      document.querySelectorAll('.screen').forEach((e) => { e.style.display = 'none'; });
      document.getElementById('catalogo')?.remove();
      const box = document.createElement('div'); box.id = 'catalogo'; box.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#000';
      document.body.appendChild(box);
      const colunas = 5, cel = 5, W = colunas * cel * 32 * zoom, linhas = Math.ceil(tipos.length / colunas), H = linhas * cel * 32 * zoom;
      await new Promise((ok) => {
        class Cena extends Phaser.Scene {
          create() {
            this.cameras.main.setZoom(zoom).setOrigin(0, 0).setScroll(0, 0);
            this.cameras.main.setBackgroundColor(piso);
            const r = new FurnitureRenderer(this);
            tipos.forEach((t, i) => {
              const x = (i % colunas) * cel + 1, y = Math.floor(i / colunas) * cel + 1.3;
              this.add.rectangle((x - 1) * 32, (y - 1.3) * 32, cel * 32, cel * 32).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.12);
              r.render({ x, y, type: t }, tema);
              this.add.text((x - 0.6) * 32, (y - 1) * 32 + 2, `${t.id} ${t.width}x${t.height}`, { fontSize: '10px', color: '#fff', backgroundColor: '#000a' });
            });
            ok();
          }
        }
        new Phaser.Game({ type: Phaser.CANVAS, parent: box, width: W, height: H, scene: Cena, banner: false, audio: { noAudio: true } });
      });
    }, { tema, tipos, piso, zoom });
    await pg.waitForTimeout(400);
    const box = await pg.$('#catalogo');
    await box.screenshot({ path: path.join(saida, `catalogo-${tema}.png`) });
    console.log('ok', tema, tipos.length);
  }
  if (erros.length) console.log('erros', erros.slice(0, 3));
} finally { await nav.close(); await s.fechar?.(); }
