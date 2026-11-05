// v3.27.1: com o inglês escolhido, nenhum texto visível (nem rótulo de ilustração, nem descrição de acessibilidade) pode ficar em português.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';

const PT = /[ãõçÃÕÇ]|\b(não|você|vocês|também|está|são|missão|missões|equipe|pelo|pela|isso|quando|porque|sobre|depois|antes|muito|cada|voltar|próximo|notícia|blindagem|fontes|dias|Agência|Equipe|Iniciar|Continuar|Sair|Fechar|Nova|Opções|Idioma|Pontos|Voltar|alerta|chamado|Resposta|Pergunta|Mito|Errata|Edição|prateleira|Selecione|Guardar|LIMITE|PESSOAS|DESCON|RESGATE|LEV|VOO|Dep)\b/;
const PERMITIDO = /Goiânia|Zaragoza|Cecília|Téo|Otávio|Chernóbil|São Paulo|Brasília|Inês|André|Lúcia|Fábio|Graça|Kátia|Lívia|Sérgio|Tânia|Marília|Mayapuri|Lok Sabha|Resolução CNEN|Grupo de Cronologia|Agência Chronos/g;
const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 40, creditos: 9000, proximoAlerta: null, ativos: [] })); } catch (e) {} `;

async function textos(pg) {
  return pg.evaluate(() => {
    const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const e = w.currentNode.parentElement; if (!e || ['SCRIPT', 'STYLE'].includes(e.tagName)) continue; const s = w.currentNode.textContent.replace(/\s+/g, ' ').trim(); if (s.length > 2) out.push(s); }
    for (const e of document.querySelectorAll('[aria-label],[title],[placeholder],[alt]')) for (const a of ['aria-label', 'title', 'placeholder', 'alt']) { const s = e.getAttribute(a); if (s && s.length > 2) out.push(a + ': ' + s); }
    return out;
  });
}
const vazamentos = (lista) => [...new Set(lista.filter((s) => PT.test(s.replace(PERMITIDO, ''))))];

test('dados: nenhum texto "en" dos módulos do jogo contém palavras em português (referências bibliográficas ficam de fora)', async () => {
  const raiz = path.join(RAIZ_JOGO, 'js'), arquivos = [];
  (function andar(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) andar(p); else if (p.endsWith('.js')) arquivos.push(p); } })(raiz);
  const achados = [];
  const anda = (o, trilha, emEn, mod, vistos) => {
    if (o == null || typeof o === 'function') return;
    if (typeof o === 'object') { if (vistos.has(o)) return; vistos.add(o); }
    if (typeof o === 'string') { if (emEn && !/\.fontes?(Publicas)?(\.en)?$/.test(trilha) && PT.test(o.replace(PERMITIDO, ''))) achados.push(`${mod} :: ${trilha} = ${o.slice(0, 80)}`); return; }
    if (Array.isArray(o)) { o.forEach((v, i) => anda(v, trilha + '.' + i, emEn, mod, vistos)); return; }
    for (const [k, v] of Object.entries(o)) anda(v, trilha + '.' + k, emEn || k === 'en', mod, vistos);
  };
  for (const f of arquivos) { try { const m = await import(pathToFileURL(f).href); for (const [n, v] of Object.entries(m)) anda(v, n, false, path.relative(raiz, f), new Set()); } catch (e) { /* módulo que precisa do navegador */ } }
  assert.deepEqual(achados, []);
});

test('interface em inglês: menu, Base, todas as salas, módulos e janelas estáticas sem português', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'en', viewport: { width: 1280, height: 720 }, antes: ESTADO });
    let todos = await textos(pg);
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa'); todos = todos.concat(await textos(pg));
    await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
    await pg.evaluate(() => { const e = ui.agencia.est; e.modulos.push({ id: 'bmed', tipo: 'medico', x: 3, y: 1, pronto: 0 }); e.equipe[0].tratamento = true; e.equipe[0].doses = [{ dia: e.dia, msv: 4 }]; ui.agencia.desenhar(); });
    for (const sala of ['alojamento', 'medico', 'hangar', 'laboratorio', 'comando', 'academia', 'cofre', 'biblioteca', 'oficina']) {
      const b = await pg.$(`[data-sala="${sala}"]`); if (!b) continue; await b.click(); await pg.waitForTimeout(150); todos = todos.concat(await textos(pg));
    }
    await pg.click('[data-ag="normas"]').catch(() => {}); todos = todos.concat(await textos(pg));
    const svgs = await pg.$$eval('svg text', (ts) => ts.map((t) => t.textContent));
    assert.deepEqual(vazamentos(todos.concat(svgs)), []);
    assert.deepEqual(erros, []);
    await pg.close();
  } finally { await nav.close(); await srv.fechar(); }
});

test('rótulos das ilustrações da Base mudam com o idioma (pt e en)', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const dados = {};
    for (const idioma of ['pt', 'en']) {
      const { pg } = await novaPagina(nav, srv.url, { idioma, antes: ESTADO });
      dados[idioma] = await pg.evaluate(async () => { const B = await import('/js/agencia/base-svg.js'); return [B.moduloSvg('cofre'), B.moduloSvg('medico'), B.superficieSvg([{ tipo: 'resgate', missao: {} }, { tipo: 'levantamento', missao: {} }, { tipo: 'tripulacao', missao: {} }], 3)].join(''); });
      await pg.close();
    }
    assert.match(dados.pt, /LIMITE: 3 PESSOAS|DESCON\.|EM VOO/); assert.match(dados.en, /LIMIT: 3 PEOPLE|DECON\.|IN FLIGHT/);
    assert.doesNotMatch(dados.en, /LIMITE|PESSOAS|DESCON\.|RESGATE|EM VOO|LEV\./);
  } finally { await nav.close(); await srv.fechar(); }
});
