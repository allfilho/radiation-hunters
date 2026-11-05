import { servidor, abrirNavegador, novaPagina, iniciarMissao } from '../helpers/navegador.mjs';
const srv = await servidor(), nav = await abrirNavegador();
for (const [m, lang] of [[2,'pt'],[5,'en']]) {
  const { pg, ctx } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, idioma: lang, viewport: { width: 960, height: 640 } });
  await iniciarMissao(pg, m);
  // posiciona o jogador ao lado da 1a fonte, de frente, e chama o fluxo real de identificação
  const r = await pg.evaluate(() => {
    const s = window.gameScene, T = 32, f = s.sources[0].furniture;
    s.currentReading = 999;
    const rect = s.rectDoMovel(f);
    s.player.x = (rect.x - 0.3) * s.constructor.TILE || 0;
    return { tile: (window.CONFIG||{}).TILE_SIZE, rect };
  });
  await pg.evaluate(() => {
    const s = window.gameScene, T = CONFIG.TILE_SIZE, rect = s.rectDoMovel(s.sources[0].furniture);
    s.player.x = (rect.x - 0.2) * T; s.player.y = (rect.y + rect.h / 2) * T; s.playerDirection = 0; s.currentReading = 999;
    s.handleIdentify();
  });
  await pg.waitForTimeout(400);
  const botoes = await pg.$$eval('#isotope-buttons .isotope-btn', (b) => b.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  console.log('missao', m, lang, JSON.stringify(botoes));
  await pg.screenshot({ path: `/mnt/user-data/outputs/capturas/960x640-09-identificar-m${m}-${lang}.png` });
  await ctx.close();
}
await nav.close(); await srv.fechar();
