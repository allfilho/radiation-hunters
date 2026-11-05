// Foto da Base (cena em corte). Uso: node ferramentas/foto-base.mjs [VP=m] [SAIDA=/caminho.png] [SALA=hangar]
import { servidor, abrirNavegador, novaPagina, novoJogo } from '../helpers/navegador.mjs';
const m = process.env.VP === 'm';
const vp = m ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 40, creditos: 5000, proximoAlerta: null, ativos: [] })); } catch (e) {} `;
const srv = await servidor(), nav = await abrirNavegador();
try {
  const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: vp, toque: m, antes: ESTADO });
  await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
  await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
  if (process.env.SALA) { await pg.click(`[data-sala="${process.env.SALA}"]`); await pg.waitForSelector('.ag-janela'); }
  await pg.waitForTimeout(800);
  await pg.screenshot({ path: process.env.SAIDA || '/tmp/claude-0/work/base.png' });
  console.log('erros', erros);
} finally { await nav.close(); await srv.fechar(); }
