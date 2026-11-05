// Capturas das missões rápidas: uma por bioma (semente que cai no bioma). Uso: node ferramentas/foto-rapidas.mjs [VP=m]
import { servidor, abrirNavegador, novaPagina, passarHistoria } from '../helpers/navegador.mjs';
const vp = process.env.VP === 'm' ? { width: 390, height: 844 } : { width: 1280, height: 800 };
const srv = await servidor(), nav = await abrirNavegador();
try {
  const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true, semEncontros: true, viewport: vp, toque: process.env.VP === 'm' });
  const achar = await pg.evaluate(async () => { const R = await import('/js/agencia/rapidas.js'); const o = {}; for (let s = 11; s < 4000 && Object.keys(o).length < 6; s++) { const a = R.alertaRapida(s); if (!o[a.bioma]) o[a.bioma] = s; } return o; });
  for (const [b, sem] of Object.entries(achar)) {
    await pg.evaluate(async (s) => { const R = await import('/js/agencia/rapidas.js'); window.gameScene?.scene?.stop?.(); ui.startMission(R.missaoRapida(s, 'pt')); }, sem);
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    await pg.waitForTimeout(1200);
    const r = await pg.evaluate(() => ({ n: window.gameScene.sources.length, c: window.gameScene.mapCols, r: window.gameScene.mapRows }));
    console.log(b, sem, JSON.stringify(r));
    await pg.screenshot({ path: `/tmp/claude-0/work/rap-${b}${process.env.VP || 'd'}.png` });
    await pg.keyboard.press('Escape'); await pg.click('#btn-quit').catch(() => {}); await pg.waitForTimeout(400);
  }
  console.log('erros', erros);
} finally { await nav.close(); await srv.fechar(); }
