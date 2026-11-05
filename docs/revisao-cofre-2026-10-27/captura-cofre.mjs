// Capturas do cofre e do caderno (revisão de 27/10/2026). Só leitura: não altera o jogo.
// Uso: CHROMIUM_PATH=... node ferramentas/captura-cofre.mjs <pasta-saida>
import fs from 'node:fs';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from '../helpers/navegador.mjs';
import { abrirCofre, itensDoJogo, teclaDaPrat } from '../helpers/cofre.mjs';

const OUT = process.argv[2] || '/tmp/capturas';
fs.mkdirSync(OUT, { recursive: true });
const srv = await servidor(), nav = await abrirNavegador();
const relatorio = [];
const ERRADA = { alfa: 'gama', beta: 'alfa', gama: 'beta' };

async function metricas(pg, rotulo) {
  const m = await pg.evaluate(() => {
    const c = document.querySelector('.cofre-content') || document.querySelector('.caderno-content');
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const pequenos = [...document.querySelectorAll('.modal.active button')].filter(vis).map((b) => { const r = b.getBoundingClientRect(); return { cls: b.className, txt: (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.w < 44 || x.h < 44);
    const fw = document.querySelector('.cf-ficha-wrap');
    return {
      vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth,
      conteudo: c ? { sh: c.scrollHeight, ch: c.clientHeight, w: Math.round(c.getBoundingClientRect().width) } : null,
      ficha: fw ? { sh: fw.scrollHeight, ch: fw.clientHeight, vis: getComputedStyle(fw).visibility } : null,
      alvosPequenos: pequenos,
      fontes: [...new Set([...document.querySelectorAll('.modal.active *')].slice(0, 400).map((e) => getComputedStyle(e).fontFamily.split(',')[0]))],
    };
  });
  relatorio.push({ rotulo, ...m });
}
const fecharFicha = async (pg) => { if (await pg.locator('.cf-ficha-wrap.aberta .cf-ficha-fechar:visible').count()) { await pg.click('.cf-ficha-fechar'); await pg.waitForTimeout(250); } };
const foto = async (pg, nome) => { await pg.waitForTimeout(350); await pg.screenshot({ path: `${OUT}/${nome}.png` }); await metricas(pg, nome); };

for (const [tag, vp] of [['960x640', { width: 960, height: 640 }], ['390x844', { width: 390, height: 844 }]]) {
  // Missão 5 (Lia): três prateleiras
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, idioma: 'pt', viewport: vp });
  await iniciarMissao(pg, 5);
  await abrirCofre(pg);
  const itens = await itensDoJogo(pg);
  await foto(pg, `${tag}-01-cofre-inicio`);
  await pg.click(`.cf-fonte[data-nome="${itens[0].nome}"]`);
  await foto(pg, `${tag}-02-ficha-aberta-${itens[0].nome}`);
  if (tag === '390x844') {   // conteúdo da ficha rolado até a tabela do Geiger
    await pg.evaluate(() => { const w = document.querySelector('.cf-ficha-wrap'); w.scrollTop = w.scrollHeight; });
    await foto(pg, `${tag}-02b-ficha-rolada`);
  }
  await pg.keyboard.press(teclaDaPrat[ERRADA[itens[0].prat]]);
  if (tag === '390x844') { await pg.evaluate(() => { const c = document.querySelector('.cofre-content'); const r = document.querySelector('.cf-retorno'); r.scrollIntoView({ block: 'center' }); }); }
  await foto(pg, `${tag}-03-erro-1a-tentativa`);
  if (tag === '390x844') { await fecharFicha(pg); await pg.evaluate(() => document.querySelector('.cf-retorno').scrollIntoView({ block: 'center' })); await foto(pg, `${tag}-03b-erro-ficha-fechada`); await pg.click(`.cf-fonte[data-nome="${itens[0].nome}"]`); }
  await pg.keyboard.press(teclaDaPrat[itens[0].prat]);
  for (const it of itens.slice(1)) { await fecharFicha(pg); await pg.click(`.cf-fonte[data-nome="${it.nome}"]`); await pg.keyboard.press(teclaDaPrat[it.prat]); }
  const usadas = [...new Set(itens.map((i) => i.prat))];
  // uma blindagem certa e uma errada, para ver os estados
  const MAT = { alfa: 'papel', beta: 'chumbo', gama: 'chumbo' };
  await fecharFicha(pg);
  for (const p of usadas) await pg.click(`.cf-prat.${p} .cf-mat[data-material="${MAT[p]}"]`);
  if (tag === '390x844') await pg.evaluate(() => document.querySelector('.cf-prat.beta')?.scrollIntoView({ block: 'center' }));
  else await pg.evaluate(() => { const c = document.querySelector('.cofre-content'); c.scrollTop = c.scrollHeight; });
  await foto(pg, `${tag}-04-blindagens-escolhidas`);
  await pg.click('.cf-lacrar:not([disabled])');
  await foto(pg, `${tag}-05-resumo`);
  await pg.click('.cf-resumo .cf-lacrar');
  await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
  // Caderno de campo (depois do cofre: N04 e N09 registrados)
  await pg.evaluate(() => document.getElementById('btn-caderno-pausa').click());
  await pg.waitForSelector('#caderno-modal.active');
  await foto(pg, `${tag}-06-caderno-aba1`);
  const abas = await pg.locator('.cad-aba').count();
  for (let i = 0; i < abas; i++) {
    const txt = await pg.locator('.cad-aba').nth(i).textContent();
    if (/Prote|🛡/.test(txt)) { await pg.locator('.cad-aba').nth(i).click(); await foto(pg, `${tag}-07-caderno-protecao`); break; }
  }
  relatorio.push({ rotulo: `${tag}-erros-m5`, erros });
  await ctx.close();

  // Missão 4 (Chernobyl): ficha do I-131 depois de guardado (prateleira gama, emissões beta + gama)
  const p2 = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, idioma: 'pt', viewport: vp });
  await iniciarMissao(p2.pg, 4);
  await abrirCofre(p2.pg);
  const it4 = await itensDoJogo(p2.pg);
  const iod = it4.find((i) => i.nome === 'I-131');
  if (iod) {
    await p2.pg.click('.cf-fonte[data-nome="I-131"]');
    await p2.pg.keyboard.press('3');
    await fecharFicha(p2.pg);
    await p2.pg.click('.cf-fonte[data-nome="I-131"]');
    await foto(p2.pg, `${tag}-08-ficha-I-131-guardado`);
  } else relatorio.push({ rotulo: `${tag}-m4-sem-I-131`, itens: it4 });
  relatorio.push({ rotulo: `${tag}-erros-m4`, erros: p2.erros });
  await p2.ctx.close();
}
fs.writeFileSync(`${OUT}/metricas.json`, JSON.stringify(relatorio, null, 2));
await nav.close(); await srv.fechar();
console.log('ok', relatorio.length);
