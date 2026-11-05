// Sondas da revisão final (28/10/2026). Só leitura.
// 1) modal de identificação nas missões 2, 4, 6 e 8 (PT, 960x640): nomes, rótulos, cor do rótulo, estilo do "Ainda não dá".
// 2) região role=status do cofre: o nó é retirado e reinserido no DOM a cada desenho? (MutationObserver)
// Uso: CHROMIUM_PATH=... node sonda-final.mjs <pasta-saida>
import fs from 'node:fs';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from '../helpers/navegador.mjs';
import { abrirCofre, itensDoJogo, teclaDaPrat } from '../helpers/cofre.mjs';
const OUT = process.argv[2] || './sondas'; fs.mkdirSync(OUT, { recursive: true });
const srv = await servidor(), nav = await abrirNavegador(), out = {};
for (const id of [2, 4, 6, 8]) {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, idioma: 'pt', viewport: { width: 960, height: 640 } });
  await iniciarMissao(pg, id);
  const r = await pg.evaluate(() => {
    const s = window.gameScene, f = s.sources[0].furniture;
    s.player.x = f.centerX; s.player.y = f.centerY; s.currentReading = 999; s.handleIdentify();
    const bt = [...document.querySelectorAll('#isotope-buttons .isotope-btn')].map((b) => { const t = b.querySelector('.isotope-type'); return [b.dataset.name, t.textContent.trim(), getComputedStyle(t).color, getComputedStyle(b).backgroundColor]; });
    const mais = [...document.querySelectorAll('#identify-modal button')].filter((b) => /concluir|conclude/i.test(b.textContent)).map((b) => ({ txt: b.textContent.trim(), cls: b.className, bg: getComputedStyle(b).backgroundColor, font: getComputedStyle(b).fontFamily, h: b.getBoundingClientRect().height }));
    return { fonteReal: s.sources[0].name, fontes: s.sources.map((x) => x.name), bt, mais };
  });
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${OUT}/identificar-m${id}-pt-960x640.png` });
  out['m' + id] = { ...r, erros };
  await ctx.close();
}
{ // live region
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, idioma: 'pt', viewport: { width: 960, height: 640 } });
  await iniciarMissao(pg, 5); await abrirCofre(pg);
  const itens = await itensDoJogo(pg);
  await pg.evaluate(() => {
    window.__mut = []; const ret = document.querySelector('.cf-retorno');
    new MutationObserver((ms) => ms.forEach((m) => { [...m.removedNodes].forEach((n) => n === ret && window.__mut.push('removido')); [...m.addedNodes].forEach((n) => n === ret && window.__mut.push('inserido')); })).observe(document.getElementById('cofre-corpo'), { childList: true, subtree: true });
  });
  await pg.click(`.cf-fonte[data-nome="${itens[0].nome}"]`);
  await pg.keyboard.press(teclaDaPrat[itens[0].prat]);
  out.liveRegion = { eventos: await pg.evaluate(() => window.__mut), mesmoNo: await pg.evaluate(() => document.querySelectorAll('.cf-retorno').length), erros };
  await ctx.close();
}
fs.writeFileSync(`${OUT}/sonda-final.json`, JSON.stringify(out, null, 2));
await nav.close(); await srv.fechar(); console.log(JSON.stringify(out, null, 1));
