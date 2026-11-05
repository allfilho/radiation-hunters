// Fotos das telas principais (menu, vagas, mapa da Agência, configurações) para conferir a moldura. Uso: node ferramentas/foto-telas.mjs [VP=m] [PREFIXO=/tmp/x]
import { servidor, abrirNavegador, novaPagina } from '../helpers/navegador.mjs';
const m = process.env.VP === 'm', pre = process.env.PREFIXO || '/tmp/claude-0/work/tela';
const srv = await servidor(), nav = await abrirNavegador();
try {
  const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: m ? { width: 390, height: 844 } : { width: 1280, height: 720 }, toque: m, semEncontros: true });
  await pg.waitForTimeout(600);
  await pg.screenshot({ path: `${pre}-menu.png` });
  await pg.click('#btn-new-game'); await pg.waitForSelector('#slots-modal.active').catch(() => {});
  await pg.waitForTimeout(400); await pg.screenshot({ path: `${pre}-vagas.png` });
  console.log('erros', erros);
} finally { await nav.close(); await srv.fechar(); }
