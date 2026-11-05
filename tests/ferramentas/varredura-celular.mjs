// Varredura de telas em celular: procura rolagem horizontal da página, botões sem rótulo e elementos visíveis fora da janela.
// Uso: node tests/ferramentas/varredura-celular.mjs
import { servidor, abrirNavegador, novaPagina } from '../helpers/navegador.mjs';
const srv = await servidor(), nav = await abrirNavegador();
const achados = [];
for (const idioma of ['pt', 'en']) for (const [nome, vp] of [['retrato 360x740', { width: 360, height: 740 }], ['paisagem 740x360', { width: 740, height: 360 }]]) {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, viewport: vp, idioma });
  const verificar = async (tela) => {
    const r = await pg.evaluate(() => {
      const W = innerWidth, H = innerHeight, f = []; let n = 0;
      if (document.documentElement.scrollWidth > W + 1) f.push('rolagem horizontal: ' + document.documentElement.scrollWidth + ' > ' + W);
      for (const el of document.querySelectorAll('button, [role=button], a, input, select')) {
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0 || el.closest('[hidden], [inert]') || el.closest('.screen:not(.active)') || el.closest('.modal:not(.active)')) continue;
        n++; const rot = (el.textContent || '').trim() || el.getAttribute('aria-label') || el.getAttribute('title') || el.id;
        if (!(el.textContent || '').trim() && !el.getAttribute('aria-label') && !el.getAttribute('title') && el.tagName !== 'INPUT') f.push('sem rótulo: #' + el.id + '.' + el.className);
        if (r.right > W + 2 || r.left < -2) f.push('fora da janela (horizontal): ' + String(rot).slice(0, 30) + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']');
        if (r.height < 30 && r.width < 30 && el.tagName !== 'INPUT') f.push('alvo de toque pequeno (' + Math.round(r.width) + 'x' + Math.round(r.height) + '): ' + String(rot).slice(0, 24));
      }
      f.push('#verificados ' + n); return f;
    });
    for (const x of r) if (!x.startsWith('#') || process.env.VERBOSO) achados.push(`[${idioma} ${nome}] ${tela}: ${x}`);
  };
  await verificar('menu principal');
  await pg.click('#btn-missions'); await verificar('seleção de missões');
  await pg.click('#aba-investigacoes'); await verificar('investigações');
  await pg.click('.investigacao-card[data-investigacao="radonio-escola"]');
  await pg.waitForFunction(() => window.gameScene?.missionData.investigacao === 'radonio-escola'); await pg.waitForTimeout(700); await verificar('escola em campo');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); await verificar('pausa');
  if (await pg.$('#btn-settings-pausa')) { await pg.click('#btn-settings-pausa'); await pg.waitForTimeout(300); await verificar('configurações na pausa'); }
  if (erros.length) achados.push(`[${idioma} ${nome}] erros de console: ${erros.join(' | ').slice(0, 200)}`);
  await ctx.close();
}
console.log(achados.length ? achados.join('\n') : 'nenhum achado');
await nav.close(); await srv.fechar();
