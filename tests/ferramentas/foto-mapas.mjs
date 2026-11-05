import { servidor, abrirNavegador, novaPagina, iniciarMissao } from '../helpers/navegador.mjs';
const ids = process.argv.slice(2).map(Number), vp = process.env.VP === 'm' ? { width: 390, height: 844 } : { width: 1280, height: 800 };
const srv = await servidor(), nav = await abrirNavegador();
try {
  for (const id of ids) {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true, semEncontros: true, viewport: vp, toque: process.env.VP === 'm' });
    await iniciarMissao(pg, id);
    await pg.waitForTimeout(1500);
    const r = await pg.evaluate(() => { const s = window.gameScene; return { c: s.mapCols, r: s.mapRows, n: s.sources.length, h: s.mapData.playerStart }; });
    console.log(id, JSON.stringify(r), erros.length ? erros : 'sem erros');
    await pg.screenshot({ path: `/tmp/claude-0/work/foto-${id}${process.env.VP || 'd'}.png` });
    await pg.close();
  }
} finally { await nav.close(); await srv.fechar(); }
