// Varre telas da Agência em viewports de celular: rolagem horizontal, botões fora do alcance e captura.
import { servidor, abrirNavegador, novaPagina } from '../helpers/navegador.mjs';
const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, creditos: 5000, proximoAlerta: null, ativos: [{ id: 'm2', desde: 3, expira: 17 }] })); } catch (e) {} `;
const VPS = [[390, 844], [360, 640], [740, 360]];
const srv = await servidor(), nav = await abrirNavegador();
for (const [w, h] of VPS) {
  const { pg } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: w, height: h }, toque: true, antes: ESTADO });
  await pg.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
  await pg.click('#btn-new-game'); await pg.waitForSelector('.ag-pino');
  const medir = async (nome) => {
    const r = await pg.evaluate(() => {
      const sc = document.querySelector('#agencia-screen'); const bs = [...document.querySelectorAll('#agencia-screen button:not([disabled])')].filter((b) => b.offsetParent);
      const cut = bs.filter((b) => { const r = b.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).map((b) => b.textContent.trim().slice(0, 20));
      const ok = sc.scrollHeight > sc.clientHeight ? 'rola' : 'cabe';
      return { sw: document.documentElement.scrollWidth - innerWidth, cut, ok, sh: sc.scrollHeight, ch: sc.clientHeight };
    });
    console.log(`${w}x${h} ${nome}:`, JSON.stringify(r));
    await pg.screenshot({ path: `/tmp/claude-0/work/cap-${w}x${h}-${nome}.png` });
  };
  await medir('mapa');
  await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('.ag-nave-int'); await medir('nave');
  await pg.click('[data-ag="cancelar-preparo"]').catch(() => {});
  await pg.evaluate(() => ui.agencia.est && 0);
  for (const sel of ['[data-sala="hangar"]', '[data-sala="alojamento"]', '[data-sala="laboratorio"]']) { /* tenta abrir salas se existirem */
    const el = await pg.$(sel); if (el) { await el.click(); await medir(sel.slice(12, -2)); }
  }
}
await nav.close(); await srv.fechar();
