// Captura o mapa inteiro de uma investigação em PNG (para revisão visual).
// Uso: node tests/ferramentas/captura-mapa.mjs <id-da-investigação> <saida.png> [zoom=0.45] [centro-x centro-y em tiles]
// ids: hospital-imagem, medicina-nuclear, arquivo-tempo, radonio-escola
import { servidor, abrirNavegador, novaPagina } from '../helpers/navegador.mjs';
const id = process.argv[2] || 'radonio-escola', out = process.argv[3] || '/tmp/escola.png';
const srv = await servidor(), nav = await abrirNavegador();
const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, viewport: { width: 1700, height: 1400 } });
await pg.click('#btn-missions'); await pg.click('#aba-investigacoes');
await pg.click(`.investigacao-card[data-investigacao="${id}"]`);
await pg.waitForFunction((i) => window.gameScene?.missionData.investigacao === i, id);
await pg.waitForTimeout(800); await pg.evaluate(([z, x, y]) => { window.__zoom = z; window.__cx = x; window.__cy = y; }, [Number(process.argv[4] || 0.45), Number(process.argv[5] || 0), Number(process.argv[6] || 0)]);
if (process.argv[5]) await pg.evaluate(([x, y]) => { const s = window.gameScene; s.player.setPosition(x * 64, y * 64); }, [Number(process.argv[5]), Number(process.argv[6])]);   // perto de um ponto: segue o robô com o zoom normal
else await pg.evaluate(() => { const s = window.gameScene, c = s.cameras.main; c.stopFollow(); const w = s.mapData.map[0].length * 64, h = s.mapData.map.length * 64; c.setBounds(0, 0, w, h); c.setZoom(Number(window.__zoom || 1.0)); c.centerOn(w / 2, h / 2); });
await pg.waitForTimeout(500); console.log(JSON.stringify(await pg.evaluate(() => { const c = window.gameScene.cameras.main; return { sx: c.scrollX, sy: c.scrollY, z: c.zoom, w: c.width, h: c.height, cx: window.__cx }; })));
await pg.screenshot({ path: out });
console.log('erros', JSON.stringify(erros));
await ctx.close(); await nav.close(); await srv.fechar();
