// v3.44: dossiês como pasta de arquivo (legíveis), Hangar em papel e símbolos desenhados (SVG) nas cartas e arcanos.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, iniciarMissao } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const lum = (rgb) => { const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const EMOJI = /\p{Extended_Pictographic}/u;

test('símbolos: um SVG para cada carta de campo e cada arcano, sem emoji', async () => {
  const S = await mod('arte/arcanos.js'), D = await mod('agencia/decisoes.js'), C = await mod('corridas.js');
  for (const id of [...D.IDS_CARTAS, ...C.IDS_ARCANOS]) { const s = S.simbolo(id); assert.match(s, /^<svg [^>]*aria-hidden="true"/, id); assert.ok(!EMOJI.test(s), id); }
});

const EST = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 6, proximoAlerta: null, proximaRapida: 999, creditos: 0, ativos: [{ id: 'm2', desde: 6, expira: 20 }], briefing: { dia: 6 },
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0}],
    equipe: [{ id: 'c1', nome: 'Ana', retrato: 'lara', especialidade: 'campo', doses: [{ dia: 6, msv: 1.2 }], moral: 30 }, { id: 'c2', nome: 'Bruno', retrato: 'caio', especialidade: 'fisica', doses: [] }] })); } catch (e) {} `;

for (const [w, h] of [[1280, 720], [390, 844]]) {
  test(`telas (${w}×${h}): dossiê em papel legível (contraste ≥ 7), Hangar em papel, cartas e arcanos com símbolo desenhado`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: w, height: h }, toque: w < 800, antes: EST });
      await novoJogo(pg); await pg.waitForSelector('.ag-pino');
      await pg.evaluate(() => { ui.agencia.vista = 'base'; ui.agencia.abrirSala('alojamento'); }); await pg.waitForSelector('[data-membro="c1"]');
      const c = await pg.evaluate(() => { const d = document.querySelector('[data-membro="c1"]'), cs = (e, p) => getComputedStyle(e)[p];
        return { fundo: cs(d, 'backgroundColor'), nome: cs(d.querySelector('.ag-fala-nome'), 'color'), nota: cs(d.querySelector('.ag-nota'), 'color'), caneta: cs(d.querySelector('span.ag-caneta'), 'color') }; });
      assert.ok(contraste(c.fundo, c.nome) >= 7, `nome ${c.nome} / ${c.fundo}`);
      assert.ok(contraste(c.fundo, c.nota) >= 7, `nota ${c.nota} / ${c.fundo}`);
      assert.ok(contraste(c.fundo, c.caneta) >= 4.5, `caneta ${c.caneta} / ${c.fundo}`);
      await pg.evaluate(() => ui.agencia.abrirSala('hangar')); await pg.waitForSelector('#ag-hangar.papel');
      assert.match(await pg.textContent('#ag-hangar'), /Quadro de operações/);
      await pg.evaluate(() => { ui.agencia.vista = 'mapa'; ui.agencia.desenhar(false); });
      await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-cartas');
      assert.equal(await pg.$$eval('#ag-cartas .ag-carta-icone', (x) => x.every((e) => e.querySelector('svg') && !/\p{Extended_Pictographic}/u.test(e.textContent))), true);
      const sw = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= w + 1, `sem rolagem horizontal (${sw})`);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}

test('arcanos no meio da missão usam o símbolo desenhado', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3 }, settings: { encontros: false } })); } catch (e) {}` });
    await iniciarMissao(pg, 2); await pg.evaluate(() => window.gameScene.oferecerArcanos());
    await pg.waitForSelector('#arcano-oferta:not([hidden]) .arcano');
    assert.equal(await pg.$$eval('#arcano-oferta .ag-carta-icone', (x) => x.length === 2 && x.every((e) => e.querySelector('svg.arcano-svg'))), true);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
