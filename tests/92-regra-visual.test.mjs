// v3.45: uma regra visual (aço = aparelhos e comandos; papel = documentos) e movimento só quando a vista muda.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';
const lum = (rgb) => { const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const EST = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 40, proximoAlerta: null, proximaRapida: 999, creditos: 5000, ativos: [{ id: 'm2', desde: 40, expira: 54 }, { id: 'q4242', desde: 40, expira: 47 }], briefing: { dia: 40 }, colhidas: { 'Cs-137': 2 },
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b3',tipo:'academia',x:2,y:0,pronto:0},{id:'b4',tipo:'cofre',x:3,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0},{id:'b6',tipo:'oficina',x:1,y:1,pronto:0},{id:'b7',tipo:'biblioteca',x:2,y:1,pronto:0},{id:'b8',tipo:'laboratorio',x:3,y:1,pronto:0},{id:'b9',tipo:'medico',x:0,y:2,pronto:0}] })); } catch (e) {} `;
// cor de fundo efetiva (sobe na árvore até achar uma cor opaca) e cor do texto de cada elemento com texto próprio
const AUDITAR = (raiz) => { const out = []; const fundoDe = (e) => { for (let n = e; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const m = c.match(/[\d.]+/g); if (m && (m.length < 4 || Number(m[3]) > 0.9)) return c; } return 'rgb(0, 0, 0)'; };
  for (const e of document.querySelectorAll(raiz + ' *')) { if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) continue; if (!e.offsetParent || e.closest('svg, .ag-boletim, .mission-difficulty, [disabled]')) continue;
    const cs = getComputedStyle(e); out.push({ t: e.textContent.trim().slice(0, 30), cor: cs.color, fundo: fundoDe(e) }); } return out; };

for (const [w, h] of [[1280, 720], [390, 844]]) {
  test(`papel legível em toda a Agência (${w}×${h}): alertas, detalhe e as salas da Base com contraste ≥ 4,5; plano de dose sem vazar`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: w, height: h }, toque: w < 800, antes: EST });
      await novoJogo(pg); await pg.waitForSelector('.ag-item[data-alerta="q4242"]');
      await pg.click('.ag-item[data-alerta="q4242"]'); await pg.waitForTimeout(350);
      const ruins = [];
      let vistos = 0; const audita = async (onde, raiz) => { for (const x of await pg.evaluate(AUDITAR, raiz)) if (++vistos && contraste(x.cor, x.fundo) < 4.5) ruins.push(`${onde}: "${x.t}" ${x.cor} / ${x.fundo}`); };
      await audita('lista', '.ag-lista'); await audita('detalhe', '#ag-detalhe');
      for (const s of ['laboratorio', 'oficina', 'medico', 'academia', 'cofre', 'biblioteca', 'hangar', 'comando', 'alojamento']) {
        await pg.evaluate((s) => { ui.agencia.vista = 'base'; ui.agencia.abrirSala(s); }, s); await pg.waitForTimeout(350);
        await audita(s, '.ag-janela .ag-cartao');
      }
      assert.deepEqual(ruins, []); assert.ok(vistos > 60, `textos auditados: ${vistos}`);
      // plano de dose: nenhum botão passa da borda da ficha
      await pg.evaluate(() => { ui.agencia.vista = 'mapa'; ui.agencia.sala = null; ui.agencia.desenhar(false); });
      await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-plano'); await pg.waitForTimeout(350);
      const vaza = await pg.evaluate(() => { const p = document.querySelector('#ag-plano').getBoundingClientRect(); return [...document.querySelectorAll('#ag-plano .menu-btn')].filter((b) => b.getBoundingClientRect().right > p.right + 1).length; });
      assert.equal(vaza, 0);
      await audita('preparo', '#ag-preparo .ag-cartao-cient');
      assert.deepEqual(ruins, []);
      const sw = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= w + 1);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('movimento: a entrada anima ao trocar de vista ou de sala, não a cada clique; sem animação com "reduzir movimento"', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: EST });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    const entra = () => pg.evaluate(() => !!document.querySelector('.ag-painel.ag-entra, .ag-janela.ag-entra'));
    await pg.evaluate(() => ui.agencia.desenhar(false)); assert.equal(await entra(), false, 'redesenho sem mudança: sem entrada');
    await pg.evaluate(() => { ui.agencia.vista = 'base'; ui.agencia.abrirSala('laboratorio'); }); assert.equal(await entra(), true);
    await pg.evaluate(() => ui.agencia.desenhar(false)); assert.equal(await entra(), false);
    await pg.evaluate(() => ui.agencia.abrirSala('oficina')); assert.equal(await entra(), true);
    await pg.emulateMedia({ reducedMotion: 'reduce' });
    await pg.evaluate(() => ui.agencia.abrirSala('hangar'));
    assert.equal(await pg.evaluate(() => getComputedStyle(document.querySelector('.ag-janela.ag-entra > *')).animationName), 'none');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

// v3.46: sistema de botões. Nenhum botão de aço sobre papel; mesma letra e mesma altura por linha; ficha de identificação em papel.
test('sistema de botões: no treinamento (Academia) e nos avisos, botões em papel com a mesma fonte, tamanho de letra e altura por linha', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'en' });
    await novoJogo(pg); await pg.waitForSelector('.ag-aviso .menu-btn'); await pg.waitForTimeout(350);
    const ler = (sel) => pg.$$eval(sel, (bs) => bs.filter((b) => b.offsetParent).map((b) => { const c = getComputedStyle(b), r = b.getBoundingClientRect(); return { fam: c.fontFamily.split(',')[0].replace(/"/g, ''), fs: c.fontSize, h: Math.round(r.height), top: Math.round(r.top), bg: c.backgroundColor }; }));
    const aviso = await ler('.ag-aviso .menu-btn');
    assert.ok(aviso.length >= 1); for (const b of aviso) { assert.equal(b.fam, 'Georgia'); assert.notEqual(b.bg, 'rgba(0, 0, 0, 0)'); }
    await pg.click('[data-ag="sala-academia"]'); await pg.waitForSelector('[data-ag="treino"]'); await pg.waitForTimeout(350);
    const bs = await ler('.ag-janela .ag-cartao .menu-btn');
    assert.ok(bs.length >= 2);
    assert.equal(new Set(bs.map((b) => b.fam)).size, 1); assert.equal(bs[0].fam, 'Georgia');
    assert.equal(new Set(bs.map((b) => b.fs)).size, 1, 'mesmo tamanho de letra');
    const porLinha = {}; for (const b of bs) (porLinha[b.top] = porLinha[b.top] || []).push(b.h);
    for (const hs of Object.values(porLinha)) assert.equal(new Set(hs).size, 1, 'mesma altura na mesma linha');
    for (const b of bs) assert.ok(b.h >= 38, `altura mínima (${b.h})`);
    // fala do instrutor em papel (memorando), não em aço
    const fala = await pg.$eval('.ag-janela .ag-fala', (e) => getComputedStyle(e).backgroundColor);
    assert.ok(lum(fala) > 0.6, `fala em papel (${fala})`);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
