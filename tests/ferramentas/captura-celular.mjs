// Captura a tela de uma investigação em celular (paisagem e retrato) para revisão de legibilidade e controles.
// Uso: node tests/ferramentas/captura-celular.mjs <id-da-investigação> <prefixo-saida>
import { servidor, abrirNavegador, novaPagina } from '../helpers/navegador.mjs';
const id = process.argv[2] || 'radonio-escola', pre = process.argv[3] || '/tmp/cel';
const srv = await servidor(), nav = await abrirNavegador();
for (const [nome, vp] of [['paisagem', { width: 844, height: 390 }], ['retrato', { width: 390, height: 844 }]]) {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, viewport: vp });
  await pg.click('#btn-missions'); await pg.click('#aba-investigacoes');
  await pg.click(`.investigacao-card[data-investigacao="${id}"]`);
  await pg.waitForFunction((i) => window.gameScene?.missionData.investigacao === i, id);
  await pg.waitForTimeout(1200);
  const info = await pg.evaluate(() => { const s = window.gameScene, c = s.cameras.main; return { zoom: c.zoom, cw: c.width, ch: c.height, mapa: [s.mapData.map[0].length, s.mapData.map.length] }; });
  console.log(nome, JSON.stringify(info), 'erros', JSON.stringify(erros));
  await pg.screenshot({ path: `${pre}-${nome}.png` });
  await ctx.close();
}
await nav.close(); await srv.fechar();
