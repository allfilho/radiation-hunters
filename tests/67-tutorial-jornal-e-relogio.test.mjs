// v3.22.2: (1) o tutorial abre com um jornal (edição de boas-vindas); (2) o aviso "Correto! Fonte identificada!" ficava invisível em cima
// dos botões do relógio da Agência (topo, centro) e engolia os cliques: depois do tutorial, play e +1 dia pareciam mortos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';

test('o tutorial abre com a primeira página da Gazeta dos Caçadores (boas-vindas), em PT e EN; a Academia completa continua sem jornal', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    for (const idioma of ['pt', 'en']) {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma });
      await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
      await pg.click('[data-ag="sala-academia"]'); await pg.click('[data-ag="treino"]');
      await pg.waitForSelector('#story-continue', { state: 'visible' });
      const nome = await pg.textContent('#story-text .jornal-nome'), esp = await pg.textContent('#story-text .jornal-especial'), fonte = await pg.textContent('#story-text .jornal-fonte');
      assert.equal(nome, idioma === 'pt' ? 'Gazeta dos Caçadores' : 'The Hunters’ Gazette');
      assert.match(esp, idioma === 'pt' ? /BOAS-VINDAS/ : /WELCOME/); assert.ok(!/RETROSPECTIVA|RETROSPECTIVE/.test(esp));
      assert.match(fonte, idioma === 'pt' ? /sem fatos históricos/ : /no historical facts/);
      assert.ok(await pg.$('#story-text .jornal-foto svg'));
      assert.deepEqual(erros, []); await pg.context().close();
    }
  } finally { await nav.close(); await srv.fechar(); }
});

test('na Agência, nenhum aviso (visível ou escondido) intercepta o clique nos botões do relógio', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const antes = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3 }, settings: { encontros: true } })); localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, proximoAlerta: 500, proximaRapida: 500, ativos: [] })); } catch (e) {}`;
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa');
    // texto largo, como o do fim do tutorial; confere durante o aviso e depois que ele some
    await pg.evaluate(() => ui.showNotification('Correto! Fonte identificada! Correto! Fonte identificada!', 'success'));
    for (const espera of [100, 3600]) {
      await pg.waitForTimeout(espera);
      const r = await pg.evaluate(() => ['[data-vel="0"]', '[data-vel="1"]', '[data-vel="2"]', '[data-ag="passo"]'].map((sel) => { const b = document.querySelector(sel), q = b.getBoundingClientRect(), e = document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2); return { sel, ok: !!e && b.contains(e) }; }));
      assert.deepEqual(r.filter((x) => !x.ok), [], 'botão coberto após ' + espera + ' ms');
    }
    const dia0 = await pg.evaluate(() => ui.agencia.est.dia);
    await pg.click('[data-ag="passo"]'); assert.equal(await pg.evaluate(() => ui.agencia.est.dia), dia0 + 1);
    await pg.click('[data-vel="1"]'); await pg.waitForTimeout(2200);
    assert.ok(await pg.evaluate((d) => ui.agencia.est.dia >= d + 2, dia0), 'o play avança os dias');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
