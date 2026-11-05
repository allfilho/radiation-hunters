// Investigação em campo: um NPC só (anda entre as etapas), sem texto livre, digitação sem perder letras e encerramento no jato.
import test from 'node:test';
import assert from 'node:assert/strict';
import { encerrarNoJato } from './helpers/jato.mjs';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

async function hospital(fn) {
  const srv = await servidor(), nav = await abrirNavegador();
  try { const r = await novaPagina(nav, srv.url + '?investigacao=hospital', { idioma: 'pt' }); await r.pg.waitForFunction(() => window.gameScene?.pontosHospital?.length === 7); await fn(r); assert.deepEqual(r.erros, []); await r.ctx.close(); }
  finally { await nav.close(); await srv.fechar(); }
}

test('Helena é um personagem só: aparece em um ponto por vez e caminha até o seguinte ao resolver a etapa', async () => {
  await hospital(async ({ pg }) => {
    const estado = () => pg.evaluate(() => { const s = window.gameScene, a = s.atores.helena; return { idx: a.idx, visiveis: s.pontosInvestigacao.filter((p) => p.npc === 'helena' && p.obj.visible).length, sprites: s.children.list.filter((c) => c.list && c.list.some((x) => x.texture && x.texture.key === 'hospital_npc_helena')).length, andando: a.andando, px: a.px, py: a.py }; });
    const ini = await estado();
    assert.equal(ini.idx, 0); assert.equal(ini.visiveis, 1); assert.equal(ini.sprites, 1);
    // resolve a etapa 0 (concluída na sessão): ela passa a ter como destino o ponto seguinte dela (o último da lista)
    await pg.evaluate(() => { const s = ui.investigacao; s.sessao.concluidas[s.cenas[0].id] = true; window.gameScene.hudInvestigacao = null; window.gameScene.velAtores = 6; window.gameScene.atualizarObjetivo(); });
    const dep = await estado();
    assert.equal(dep.idx, 6, 'o destino é o ponto da medicina nuclear'); assert.equal(dep.andando, true); assert.equal(dep.sprites, 1); assert.equal(dep.visiveis, 1);
    await pg.waitForFunction(() => !window.gameScene.atores.helena.andando, null, { timeout: 30000 });
    const fim = await estado();
    assert.ok(Math.hypot(fim.px - dep.px, fim.py - dep.py) > 100, 'andou de verdade até outra sala');
    // parada no destino, ela dá passos curtos por perto, sem sair do ponto
    const q = await pg.evaluate(() => { const s = window.gameScene, p = s.pontosInvestigacao[6]; return { x: p.x * 32, y: p.y * 32 }; });
    assert.ok(Math.hypot(fim.px - q.x, fim.py - q.y) < 40);
  });
});

test('sem resposta dissertativa: nenhuma cena do hospital abre caixa de texto livre', async () => {
  await hospital(async ({ pg }) => {
    const n = await pg.evaluate(() => { const u = ui.investigacao; let total = 0; for (let i = 0; i < u.cenas.length; i++) { u.sessao.i = i; u.abrirCampo(); u.cena(); total += u.tela.querySelectorAll('textarea,input[type=text]').length; } return total; });
    assert.equal(n, 0);
  });
});

test('observações do modo revisão aceitam todas as letras (W, A, S, D e espaço não são capturados pelo jogo)', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, ctx, erros } = await novaPagina(nav, srv.url + '?investigacao=hospital', { idioma: 'pt', antes: `localStorage.setItem('radiationHuntersSettings', JSON.stringify({revisao:true}));` });
    await pg.waitForFunction(() => window.gameScene?.pontosHospital?.length === 7);
    await pg.evaluate(() => { GameState.settings.revisao = true; const u = ui.investigacao; u.revisao = true; u.sessao.i = 0; u.abrirCampo(); u.cena(); });
    const alvo = await pg.$('.inv-nota');
    assert.ok(alvo, 'o campo de observação do revisor existe');
    {
      await pg.evaluate(() => { const d = document.querySelector('.inv-obs'); if (d) d.open = true; });
      await pg.focus('.inv-nota');
      const texto = 'wasd espaco abc xyz';
      await pg.keyboard.type(texto, { delay: 10 });
      assert.equal(await pg.inputValue('.inv-nota'), texto);
    }
    assert.deepEqual(erros, []); await ctx.close();
  } finally { await nav.close(); await srv.fechar(); }
});

test('terminadas as etapas, só o jato encerra: E longe do jato avisa; perto do jato abre a ficha', async () => {
  await hospital(async ({ pg }) => {
    assert.ok(await pg.evaluate(() => !!window.gameScene.jato), 'há um jato no mapa');
    await pg.evaluate(() => { const u = ui.investigacao; u.cenas.forEach((c) => { u.sessao.concluidas[c.id] = true; }); window.gameScene.hudInvestigacao = null; window.gameScene.atualizarObjetivo(); });
    // longe do jato: E não abre a ficha
    await pg.evaluate(() => { const s = window.gameScene; s.player.setPosition((s.jato.x + 12) * 32, s.jato.y * 32); });
    await pg.keyboard.press('e');
    await pg.waitForTimeout(250);
    assert.equal(await pg.evaluate(() => document.getElementById('investigacao-screen').classList.contains('active')), false);
    assert.match(await pg.textContent('#next-objective, .next-objective, #hud-proximo, body').catch(() => ''), /jato|saída|Jet|exit/i);
    // perto: abre a ficha
    await encerrarNoJato(pg);
    await pg.waitForSelector('#inv-menu');
    assert.equal(await pg.evaluate(() => ui.investigacao.ficha.concluida), false, 'ficha só foi montada; as respostas não foram feitas nesta sessão');
  });
});
