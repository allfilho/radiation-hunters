// v3.21: Zaragoza deixa de ser caça a cabeçotes de radioterapia: o levantamento (missão 6) só acha fontes de medicina nuclear
// e, depois dele, abre a investigação "o mistério do acelerador", que compara com Goiânia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

const RAIZ = new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/', import.meta.url).href;
const semente = (n) => { let s = n >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

test('alerta i-zaragoza só aparece depois de concluir a missão 6', async () => {
  const S = await import(RAIZ + 'agencia/simulacao.js'), D = await import(RAIZ + 'agencia/dados.js');
  const a = D.ALERTAS.find((x) => x.id === 'i-zaragoza');
  assert.equal(a.depois, 'm6'); assert.equal(a.tipo, 'investigacao'); assert.equal(a.invId, 'zaragoza-acelerador');
  const e = S.novoEstado(); S.iniciar(e); e.dia = 400;
  const antes = new Set(); const r = semente(3);
  for (let i = 0; i < 40; i++) { e.ativos = []; antes.add(S.sortear(e, r)); }
  assert.ok(!antes.has('i-zaragoza'), 'não deve sair sem a missão 6');
  e.concluidos.m6 = 1; e.usados = []; const depois = new Set();
  for (let i = 0; i < 60; i++) { e.ativos = []; depois.add(S.sortear(e, r)); }
  assert.ok(depois.has('i-zaragoza'), 'deve poder sair depois da missão 6');
});

test('episódio: 7 cenas, medida com o acelerador ligado/desligado, comparação com Goiânia, receio de Helena e mensagem equilibrada', async () => {
  const { ZARAGOZA } = await import(RAIZ + 'investigacao/zaragoza.js');
  assert.equal(ZARAGOZA.cenas.length, 7);
  const bunker = ZARAGOZA.cenas.find((c) => c.id === 'bunker'); assert.deepEqual(bunker.atividade.estados, ['ligado', 'desligado']);
  const comp = ZARAGOZA.cenas.find((c) => c.id === 'comparacao'); assert.equal(comp.tipo, 'cartoes');
  assert.match(comp.texto.pt, /Goiânia/); assert.ok(comp.cartoes.filter((c) => c.ok).length >= 3 && comp.cartoes.some((c) => !c.ok));
  assert.match(ZARAGOZA.cenas[0].texto.pt, /receio/); assert.match(ZARAGOZA.cenas[0].texto.pt, /medicina nuclear/);
  const msg = ZARAGOZA.cenas.find((c) => c.id === 'mensagem'); assert.equal(msg.opcoes.filter((o) => o.ok).length, 1);
  assert.match(ZARAGOZA.fontes.pt, /fictíci/);
  const { observarAtividade } = await import(RAIZ + 'investigacao/modelos.js');
  assert.equal(observarAtividade('feixe', 'desligado').dados.fonteArmazenada, false);
  assert.equal(observarAtividade('feixe', 'ligado').dados.feixe, true);
});

test('missão 6: o levantamento só tem fontes de medicina nuclear (Tc-99m e I-131); Co-60 e Cs-137 são só candidatos errados', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true });
    await iniciarMissao(pg, 6);
    const d = await pg.evaluate(() => ({ nomes: [...new Set(gameScene.sources.map((s) => s.name))].sort(), extras: gameScene.missionData.candidatosExtras }));
    assert.ok(d.nomes.length >= 1 && d.nomes.every((n) => ['I-131', 'Tc-99m'].includes(n)), JSON.stringify(d));
    assert.deepEqual([...d.extras].sort(), ['Co-60', 'Cs-137']);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
