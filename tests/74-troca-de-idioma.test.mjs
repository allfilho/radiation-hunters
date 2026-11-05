// v3.27.1: trocar o idioma no menu (pt → en → pt → en) deve trocar TODOS os textos, nas duas direções, sem recarregar a página.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';

const PT = /[ãõçÃÕÇ]|\b(não|você|vocês|também|está|são|missão|missões|equipe|pelo|pela|isso|quando|porque|sobre|depois|antes|muito|cada|voltar|próximo|notícia|blindagem|dias|Agência|Equipe|Iniciar|Continuar|Sair|Fechar|Nova|Opções|Idioma|Pontos|Voltar|alerta|chamado|Resposta|Pergunta|Errata|Edição|prateleira|Selecione|Guardar|LIMITE|PESSOAS|DESCON|RESGATE|VOO|Escolha|Configurações|Investigações|Missões|Créditos|Construir|Alojamento|Hangar e naves|Pesquisa|Treinamento)\b/;
const EN = /\b(the|and|with|your|you|this|that|from|Mission|Missions|Back|Continue|Settings|Start|Press|Choose|Select|Investigations|Credits|Build|Quarters|Research|Training|Alert|Alerts|days|day left|Close|Quit)\b/;
const PERMITIDO = /Goiânia|Zaragoza|Cecília|Téo|Otávio|Chernóbil|São Paulo|Brasília|Inês|André|Lúcia|Fábio|Graça|Kátia|Lívia|Sérgio|Tânia|Marília|Mayapuri|Lok Sabha|Resolução CNEN|Grupo de Cronologia|Agência Chronos|Chronos Agency|Radiation Hunters|The Isotope Chronicles|Hunters|Geiger|Base da Agência|Agency Base|Marta|Teo|Yara|Otavio/g;
const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 40, creditos: 9000, proximoAlerta: null, ativos: [] })); } catch (e) {} `;

async function textos(pg) {
  return pg.evaluate(() => {
    const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const e = w.currentNode.parentElement; if (!e || ['SCRIPT', 'STYLE'].includes(e.tagName)) continue; if (e.closest('.lang-btn')) continue; { const st = getComputedStyle(e); if (st.display === 'none' || st.visibility === 'hidden' || e.closest('[hidden]') || !e.getClientRects().length) continue; } const s = w.currentNode.textContent.replace(/\s+/g, ' ').trim(); if (s.length > 2) out.push(s); }
    for (const e of document.querySelectorAll('[aria-label],[title],[placeholder],[alt]')) if (e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')) for (const a of ['aria-label', 'title', 'placeholder', 'alt']) { const s = e.getAttribute(a); if (s && s.length > 2) out.push(a + ': ' + s); }
    return out;
  });
}
const sujos = (lista, alvo) => { const r = alvo === 'en' ? PT : EN; return [...new Set(lista.filter((s) => r.test(s.replace(PERMITIDO, ''))))]; };

async function percurso(pg, idioma, onde) {
  const achados = [];
  const olha = async (tela) => { for (const s of sujos(await textos(pg), idioma)) achados.push(`[${idioma} · ${tela}] ${s.slice(0, 110)}`); };
  await olha('menu');
  await pg.click('#btn-missions'); await olha('lista de missões'); await pg.click('#aba-investigacoes'); await olha('lista de investigações');
  await pg.click('#btn-back-missions').catch(() => {});
  await pg.evaluate(() => ui.showScreen('mainMenu'));
  await pg.evaluate(() => { ui.origem = 'agencia'; ui.agencia.abrir(); ui.showScreen('agencia'); }); await pg.waitForSelector('.ag-mapa');
  const ids = await pg.evaluate(async () => { const d = await import('/js/agencia/dados.js'), m = await import('/js/agencia/rapidas.js'); const out = d.ALERTAS.map((a) => a.id).concat([1, 2, 3, 4].map((s) => m.alertaRapida(s).id)); const e = ui.agencia.est; e.ativos = out.map((id) => ({ id, desde: e.dia, expira: e.dia + 60 })); ui.agencia.desenhar(); return out; });
  await olha('mapa da Agência');
  for (const id of ids) { await pg.evaluate((i) => ui.agencia.selecionar(i), id); await olha('alerta ' + id); }
  await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena'); await olha('Base');
  for (const sala of ['alojamento', 'hangar', 'laboratorio', 'comando', 'academia', 'cofre', 'biblioteca', 'oficina']) { const b = await pg.$(`[data-sala="${sala}"]`); if (b) { await b.click(); await olha('sala ' + sala); } }
  await pg.click('[data-ag="normas"]').catch(() => {}); await olha('normas');
  await pg.evaluate(() => { ui.agencia.cb.sair(); });
  return achados;
}

test('pt → en → pt → en no menu: nenhum texto fica no idioma errado em menu, missões, Agência, Base e salas', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: 1280, height: 720 }, antes: ESTADO });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa'); await pg.evaluate(() => { ui.agencia.cb.sair(); });
    const todos = [];
    for (const idioma of ['pt', 'en', 'pt', 'en']) {
      await pg.click(`.lang-btn[data-lang="${idioma}"]`); await pg.waitForTimeout(200);
      assert.equal(await pg.evaluate(() => document.documentElement.lang), idioma);
      todos.push(...await percurso(pg, idioma));
    }
    assert.deepEqual(todos, []);
    assert.deepEqual(erros, []);
    await pg.close();
  } finally { await nav.close(); await srv.fechar(); }
});

test('troca de idioma com a história de missão e uma investigação: abertura em reportagem no idioma escolhido', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: 1280, height: 720 }, antes: ESTADO });
    const achados = [];
    for (const idioma of ['en', 'pt', 'en']) {
      await pg.click(`.lang-btn[data-lang="${idioma}"]`); await pg.waitForTimeout(200);
      await pg.click('#btn-missions'); await pg.click('#missions-container > *:nth-child(2) .mission-title'); await pg.waitForSelector('#story-continue', { state: 'visible' });
      for (let i = 0; i < 8 && await pg.$eval('#story-intro', (e) => e.classList.contains('active')); i++) { for (const s of sujos(await textos(pg), idioma)) achados.push(`[${idioma} · história m2] ${s.slice(0, 110)}`); await pg.click('#story-continue'); await pg.waitForTimeout(60); }
      await pg.waitForFunction(() => window.gameScene, null, { timeout: 15000 }); await pg.waitForTimeout(500);
      for (const s of sujos(await textos(pg), idioma)) achados.push(`[${idioma} · jogo m2] ${s.slice(0, 110)}`);
      const canvas = await pg.evaluate(() => (window.gameScene?.children?.list || []).filter((c) => c.type === 'Text' && c.text).map((c) => 'canvas: ' + c.text));
      for (const s of sujos(canvas, idioma)) achados.push(`[${idioma} · texto do mapa] ${s.slice(0, 110)}`);
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
      for (const s of sujos(await textos(pg), idioma)) achados.push(`[${idioma} · pausa] ${s.slice(0, 110)}`);
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
      await pg.evaluate(() => { ui.encerrarJogo?.(); ui.showScreen('mainMenu'); });
      await pg.click('#btn-missions'); await pg.click('#aba-investigacoes'); await pg.click('.investigacao-card'); await pg.waitForSelector('#story-continue', { state: 'visible' });
      for (const s of sujos(await textos(pg), idioma)) achados.push(`[${idioma} · jornal investigação] ${s.slice(0, 110)}`);
      await pg.evaluate(() => { ui.encerrarJogo?.(); ui.showScreen('mainMenu'); });
    }
    assert.deepEqual(achados, []);
    assert.deepEqual(erros, []);
    await pg.close();
  } finally { await nav.close(); await srv.fechar(); }
});
