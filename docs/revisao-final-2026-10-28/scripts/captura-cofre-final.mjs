// Capturas do cofre e do caderno — revisão final (28/10/2026). Só leitura: não altera o jogo.
// Derivado de docs/revisao-cofre-2026-10-27/captura-cofre.mjs, com: PT e EN; celular com toque (hasTouch/isMobile) e
// toques nos botões "Guardar" da ficha (sem teclado); métricas de cobertura do retorno e de visibilidade do "Lacrar".
// Uso (de dentro de tests/<subpasta>/): CHROMIUM_PATH=... node captura-cofre-final.mjs <pasta-saida>
import fs from 'node:fs';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from '../helpers/navegador.mjs';
import { abrirCofre, itensDoJogo, teclaDaPrat } from '../helpers/cofre.mjs';

const OUT = process.argv[2] || './capturas';
fs.mkdirSync(OUT, { recursive: true });
const srv = await servidor(), nav = await abrirNavegador();
const relatorio = [];
const ERRADA = { alfa: 'gama', beta: 'alfa', gama: 'beta' };
const IDX = { alfa: 0, beta: 1, gama: 2 };

async function metricas(pg, rotulo) {
  const m = await pg.evaluate(() => {
    const c = document.querySelector('#cofre-modal.active .cofre-content') || document.querySelector('#caderno-modal.active .caderno-content');
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const pequenos = [...document.querySelectorAll('.modal.active button')].filter(vis).map((b) => { const r = b.getBoundingClientRect(); return { cls: b.className, txt: (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.w < 44 || x.h < 44);
    const fw = document.querySelector('.cf-ficha-wrap');
    // o retorno está na tela e não coberto? (centro do elemento)
    const ret = document.querySelector('.cf-retorno');
    let retorno = null;
    if (ret && vis(ret)) {
      const r = ret.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 20);
      const dentro = cy >= 0 && cy <= innerHeight;
      const topo = dentro ? document.elementFromPoint(cx, cy) : null;
      retorno = { naTela: dentro, descoberto: !!topo && ret.contains(topo), y: Math.round(r.top) };
    }
    const lac = document.querySelector('.cf-lacrar');
    let lacrar = null;
    if (lac && vis(lac)) { const r = lac.getBoundingClientRect(); lacrar = { naTela: r.bottom <= innerHeight && r.top >= 0, disabled: lac.disabled }; }
    return {
      vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth,
      conteudo: c ? { sh: c.scrollHeight, ch: c.clientHeight, w: Math.round(c.getBoundingClientRect().width) } : null,
      ficha: fw ? { sh: fw.scrollHeight, ch: fw.clientHeight, vis: getComputedStyle(fw).visibility, aberta: fw.classList.contains('aberta') } : null,
      retorno, lacrar, alvosPequenos: pequenos,
      atalhosTecladoVisiveis: [...document.querySelectorAll('.cf-atalhos-teclado, .cf-tecla')].some(vis),
    };
  });
  relatorio.push({ rotulo, ...m });
}
const foto = async (pg, nome) => { await pg.waitForTimeout(350); await pg.screenshot({ path: `${OUT}/${nome}.png` }); await metricas(pg, nome); };
const celular = (vp) => vp.width <= 860;
const fichaAberta = (pg) => pg.evaluate(() => document.querySelector('.cf-ficha-wrap')?.classList.contains('aberta'));
async function guardar(pg, nome, prat, vp) {
  if (celular(vp)) {   // toque: abre a ficha e toca no botão "Guardar <tipo>" da ficha
    if (!(await fichaAberta(pg)) || !(await pg.locator('.cf-f-acoes button').count())) await pg.tap(`.cf-bandeja .cf-fonte[data-nome="${nome}"]`);
    await pg.tap(`.cf-f-acoes button >> nth=${IDX[prat]}`);
  } else {
    await pg.click(`.cf-bandeja .cf-fonte[data-nome="${nome}"]`);
    await pg.keyboard.press(teclaDaPrat[prat]);
  }
}
const clicar = (pg, sel, vp) => celular(vp) ? pg.tap(sel) : pg.click(sel);

for (const lang of ['pt', 'en']) for (const [tag0, vp] of [['960x640', { width: 960, height: 640 }], ['390x844', { width: 390, height: 844 }]]) {
  const tag = `${lang}-${tag0}`, toque = celular(vp);
  // Missão 5 (Lia)
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, idioma: lang, viewport: vp, toque });
  await iniciarMissao(pg, 5);
  await abrirCofre(pg);
  const itens = await itensDoJogo(pg);
  relatorio.push({ rotulo: `${tag}-itens-m5`, itens });
  await foto(pg, `${tag}-01-cofre-inicio`);
  await clicar(pg, `.cf-fonte[data-nome="${itens[0].nome}"]`, vp);
  await foto(pg, `${tag}-02-ficha-aberta-${itens[0].nome}`);
  await guardar(pg, itens[0].nome, ERRADA[itens[0].prat], vp);   // erro de propósito
  await foto(pg, `${tag}-03-erro-1a-tentativa`);
  await guardar(pg, itens[0].nome, itens[0].prat, vp);
  for (const it of itens.slice(1)) await guardar(pg, it.nome, it.prat, vp);
  await foto(pg, `${tag}-03c-tudo-guardado`);
  const usadas = [...new Set(itens.map((i) => i.prat))];
  const MAT = { alfa: 'papel', beta: 'chumbo', gama: 'chumbo' };   // uma certa (alfa/gama) e uma 0,4 (beta + chumbo)
  for (const p of usadas) await clicar(pg, `.cf-prat.${p} .cf-mat[data-material="${MAT[p]}"]`, vp);
  await foto(pg, `${tag}-04-blindagens-escolhidas`);
  await clicar(pg, '.cf-lacrar:not([disabled])', vp);
  await foto(pg, `${tag}-05-resumo`);
  await clicar(pg, '.cf-resumo .cf-lacrar', vp);
  await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
  await pg.evaluate(() => document.getElementById('btn-caderno-pausa').click());
  await pg.waitForSelector('#caderno-modal.active');
  await foto(pg, `${tag}-06-caderno-aba1`);
  relatorio.push({ rotulo: `${tag}-erros-m5`, erros });
  await ctx.close();

  // Missão 4 (Chernobyl): ficha do I-131 depois de guardado
  const p2 = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, idioma: lang, viewport: vp, toque });
  await iniciarMissao(p2.pg, 4);
  await abrirCofre(p2.pg);
  const it4 = await itensDoJogo(p2.pg);
  relatorio.push({ rotulo: `${tag}-itens-m4`, itens: it4 });
  if (it4.find((i) => i.nome === 'I-131')) {
    await guardar(p2.pg, 'I-131', 'gama', vp);
    await clicar(p2.pg, '.cf-baia .cf-fonte[data-nome="I-131"]', vp);
    await foto(p2.pg, `${tag}-08-ficha-I-131-guardado`);
  }
  relatorio.push({ rotulo: `${tag}-erros-m4`, erros: p2.erros });
  await p2.ctx.close();
}
fs.writeFileSync(`${OUT}/metricas.json`, JSON.stringify(relatorio, null, 2));
await nav.close(); await srv.fechar();
console.log('ok', relatorio.length);
