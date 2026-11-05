import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';
import { chromium } from 'playwright-core';
const srv = await servidor();
const nav = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=user-gesture-required'] });
const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, semEncontros: true });
await iniciarMissao(pg, 1);
await pg.waitForTimeout(2500);
const r = await pg.evaluate(async () => {
  const { audioManager: a } = await import('/js/audio.js');
  const c = a.audioContext;
  return { estado: c?.state, t: c?.currentTime, music: a.music && { id: a.music.id, ganho: a.music.gain.gain.value, nivel: a.music.nivel, timer: !!a.music.seq.timer }, vol: a.musicVolume };
});
console.log(JSON.stringify(r), erros);
await nav.close(); await srv.fechar();
