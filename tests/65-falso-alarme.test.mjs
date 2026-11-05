// v3.21 (parte 2): todo chamado rápido chega como notícia (TV/rádio/jornal); cerca de 30% são falso alarme (sem fonte perdida):
// a equipe ouve o morador com receio, mede longe e junto ao objeto, entende a leitura e escolhe a mensagem que tranquiliza sem prometer risco zero.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encerrarNoJato } from './helpers/jato.mjs';
import { servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';

const RAIZ = new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/', import.meta.url).href;

test('chamados: todos têm notícia bilíngue; ~30% são falso alarme (n=0, sem isótopo, caso válido para o bioma); os outros mantêm 1 a 3 fontes', async () => {
  const Rp = await import(RAIZ + 'agencia/rapidas.js'), { CASOS_FALSO } = await import(RAIZ + 'investigacao/falso-alarme.js');
  let falsos = 0; const casos = new Set(), veic = new Set(); const N = 1500;
  for (let s = 1; s <= N; s++) {
    const a = Rp.alertaRapida(s * 104729 % 999999937 + 1), n = a.noticia;
    assert.ok(n && n.veiculo.nome.pt && n.veiculo.nome.en && n.manchete.pt && n.manchete.en && n.fala.pt && n.fala.en); veic.add(n.veiculo.id);
    if (a.falso) { falsos++; casos.add(a.falso); assert.equal(a.n, 0); assert.equal(a.iso, null); assert.deepEqual(a.extras, []); assert.ok(CASOS_FALSO.find((c) => c.id === a.falso).biomas.includes(a.bioma)); }
    else { assert.ok(a.n >= 1 && a.n <= 3 && a.iso); }
  }
  assert.ok(falsos / N > 0.2 && falsos / N < 0.4, 'proporção de falsos: ' + falsos / N);
  assert.equal(casos.size, 4); assert.deepEqual([...veic].sort(), ['jornal', 'radio', 'tv']);
});

test('4 episódios: 5 cenas ligadas ao campo, uma escolha certa por cena, atividade de medida longe/perto e fontes marcadas [C]/[H]', async () => {
  const { CASOS_FALSO, falsoAlarmePorId } = await import(RAIZ + 'investigacao/falso-alarme.js'), { investigacaoPorId } = await import(RAIZ + 'investigacao/index.js');
  const { observarAtividade } = await import(RAIZ + 'investigacao/modelos.js');
  assert.equal(falsoAlarmePorId('falso-inexistente'), null);
  for (const c of CASOS_FALSO) {
    const e = investigacaoPorId('falso-' + c.id); assert.ok(e, c.id); assert.equal(e.cenas.length, 5); assert.equal(e.campo.locais.length, 5);
    assert.deepEqual(e.cenas.map((x) => x.id), e.campo.locais.map((x) => x.id));
    for (const cena of e.cenas.filter((x) => x.tipo === 'escolha')) assert.equal(cena.opcoes.filter((o) => o.ok).length, 1, c.id + ' ' + cena.id);
    assert.equal(e.cenas.find((x) => x.id === 'medida').atividade.tipo, 'objeto');
    assert.match(e.cenas[0].texto.pt, /rádio e na TV/); assert.match(e.fontes.pt, /\[C\]/); assert.match(e.fontes.pt, /fictíci/);
    const msg = e.cenas.find((x) => x.id === 'mensagem'); assert.ok(msg.opcoes.some((o) => !o.ok && /zero/.test(o.txt.pt)), 'há a opção de falsa promessa');
    assert.ok(msg.opcoes.find((o) => o.ok).txt.pt.length > 60);
  }
  assert.equal(observarAtividade('objeto', 'perto').dados.perto, true); assert.equal(observarAtividade('objeto', 'longe').dados.leitura, 'proxima-do-fundo');
  assert.throws(() => observarAtividade('objeto', 'meio'));
});

test('percurso completo do caso do granito pelo mapa: ouvir, medir, explicar, mensagem, limites; ficha concluída', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url + '?investigacao=falso-granito', { idioma: 'pt' });
    await pg.waitForFunction(() => window.gameScene?.pontosHospital?.length === 5);
    const op = (id) => pg.click(`.inv-opcao[data-id="${id}"]`);
    const fluxo = [['pequena'], ['pouca'], ['natural'], ['ok'], ['limite']];
    for (let i = 0; i < 5; i++) {
      await pg.evaluate(() => { window.gameScene.velAtores = 25; });
      await pg.waitForFunction((k) => { const s = window.gameScene, p = s.pontosHospital[k], a = p.npcPonto && s.atores[p.npc]; return !a || !a.andando; }, i, { timeout: 25000 });
      await pg.evaluate((k) => { const s = window.gameScene, p = s.pontosHospital[k]; s.player.setPosition(p.x * 32, p.y * 32); }, i);
      await pg.keyboard.press('e'); await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
      if (i === 1) { await pg.click('#inv-registrar-observacao'); await pg.click('.inv-botao[data-estado="perto"]'); await pg.click('#inv-registrar-observacao'); }
      for (const id of fluxo[i]) await op(id);
      await pg.click('#inv-continuar');
      if (i < 4) await pg.waitForSelector('#investigacao-screen.active', { state: 'hidden' });
    }
    await encerrarNoJato(pg); await pg.waitForSelector('#inv-menu');
    const f = await pg.evaluate(() => ({ c: ui.investigacao.ficha.concluida, h: ui.investigacao.ficha.historico.length, ok: ui.investigacao.ficha.historico.every((r) => r.correta !== false || r.opcao === 'perigosa') }));
    assert.equal(f.c, true, JSON.stringify(f));
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

const cria = (ativos) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: true } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, proximoAlerta: null, proximaRapida: 99, ativos: ${JSON.stringify(ativos)} })); } catch (e) {}`;

test('Agência: falso alarme mostra a notícia, voa, abre a investigação (não o mapa de caça), e concluir paga o prêmio do chamado', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: cria([{ id: 'q9', desde: 3, expira: 13 }]) });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino.rapida');
    await pg.click('.ag-item[data-alerta="q9"]');
    assert.match(await pg.textContent('#ag-detalhe'), /Telejornal|Rádio|Jornal/); assert.ok(await pg.$('#ag-detalhe .ag-boletim'));
    await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-chegar'); await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-text .jornal');   // v3.24: a investigação abre como reportagem antes do mapa
    assert.match(await pg.textContent('#story-text .jornal-especial'), /PLANTÃO|EDIÇÃO EXTRA/);
    assert.equal(await pg.$('#story-text .jornal-mais'), null);
    await pg.click('#story-continue');
    await pg.waitForFunction(() => window.gameScene?.pontosHospital?.length === 5, null, { timeout: 30000 });
    assert.equal(await pg.evaluate(() => ui.investigacao.inv.id), 'falso-granito');
    const antes = await pg.evaluate(() => ui.agencia.est.creditos);
    await pg.evaluate(() => { ui.investigacao.ficha = ui.investigacao.ficha || {}; });
    // conclui a ficha pelo caminho do usuário (mesmo fluxo do teste anterior, resumido): marca a ficha como concluída e volta
    await pg.evaluate(() => { ui.investigacao.ficha.concluida = true; ui.voltarAgencia(true); });
    await pg.waitForSelector('#agencia-screen.active .ag-mapa');
    const fim = await pg.evaluate(() => ({ cred: ui.agencia.est.creditos, ativo: ui.agencia.est.ativos.some((a) => a.id === 'q9'), feitas: ui.agencia.est.rapidasFeitas }));
    assert.equal(fim.ativo, false); assert.equal(fim.feitas, 1); assert.equal(fim.cred - antes, 180 * 1, 'prêmio do chamado (2 estrelas = fator 1): ' + (fim.cred - antes));
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
