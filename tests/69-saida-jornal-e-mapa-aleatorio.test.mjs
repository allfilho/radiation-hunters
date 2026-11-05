// v3.24: falso alarme em mapa sorteado; investigação abre e termina como reportagem; saída única "Voltar à Base"; prêmios maiores.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

const RAIZ = new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/', import.meta.url).href;

test('campoAleatorio: 5 locais na ordem das cenas, planta externa e tema do bioma, para todos os biomas', async () => {
  const { campoAleatorio, falsoAlarmePorId, prepararFalso } = await import(RAIZ + 'investigacao/falso-alarme.js');
  const { BIOMAS } = await import(RAIZ + 'mapa/plantas-rapidas.js');
  for (const b of BIOMAS) {
    const c = campoAleatorio(123 + b.length, b);
    assert.deepEqual(c.locais.map((l) => l.id), ['receio', 'medida', 'explicacao', 'mensagem', 'fecho']);
    assert.equal(c.planta.externo, true); assert.equal(c.hospitalAtivo, false);
  }
  prepararFalso(555, 'rural'); const e = falsoAlarmePorId('falso-fertilizante');
  assert.equal(e.campo.planta.externo, true); assert.equal(e.campo.planta, falsoAlarmePorId('falso-fertilizante').campo.planta, 'mesmo sorteio = mesma planta');
  prepararFalso(null);
  assert.equal(falsoAlarmePorId('falso-fertilizante').campo.hospitalAtivo, true, 'sem sorteio, vale a planta antiga (menu)');
});

test('reportagens de investigação: abertura (TV/rádio/jornal) e final com decisão e limites; PT e EN', async () => {
  const { jornalInvestigacao, reportagemInvestigacao } = await import(RAIZ + 'jornal/reportagens.js'), { investigacaoPorId } = await import(RAIZ + 'investigacao/index.js');
  const inv = investigacaoPorId('falso-vidro'), j = jornalInvestigacao(inv);
  assert.ok(j.pt.manchete && j.en.manchete && j.pt.paragrafos[0].length > 20); assert.match(j.pt.kicker, /PLANTÃO|EDIÇÃO/);
  const f = { investigacao: 'falso-vidro', titulo: 'Vaso', concluida: true, decisao: 'Risco baixo.', limite: 'Falta laudo.', evidencias: [{ texto: 'Leitura baixa' }] };
  const r = reportagemInvestigacao(f, 'pt'); assert.match(r.manchete, /Caso encerrado: Vaso/); assert.match(r.paragrafos[0], /Leitura baixa/); assert.match(r.paragrafos[1], /Falta laudo/);
  assert.match(reportagemInvestigacao({ ...f, concluida: false }, 'en').manchete, /still open/);
});

test('prêmios dobrados (v3.24) e coleta a 60 por fonte', async () => {
  const S = await import(RAIZ + 'agencia/simulacao.js'), F = await import(RAIZ + 'agencia/frota.js');
  assert.deepEqual(S.PARAMETROS.premioMissao, { rapida: 180, easy: 400, normal: 600, hard: 900, insane: 1400, investigacao: 600 }); assert.equal(F.CUSTOS.valorColetaPorFonte, 60);
});

test('final da investigação: manchete de jornal, um único botão de saída "Voltar à Base", exportação recolhida', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url + '?investigacao=falso-granito', { idioma: 'pt' });
    await pg.waitForFunction(() => window.gameScene?.pontosHospital?.length === 5);
    await pg.evaluate(() => { ui.investigacao.base = true; ui.investigacao.abrirCampo(); ui.investigacao.fichaFinal(); });
    assert.match(await pg.textContent('#investigacao-screen .jornal-manchete'), /Caso (em aberto|encerrado)/);
    assert.equal(await pg.textContent('#inv-menu'), 'Voltar à Base');
    assert.equal(await pg.locator('#investigacao-screen .inv-nav button').count(), 1);
    assert.equal(await pg.evaluate(() => document.getElementById('inv-prof').open), false, 'exportar .json fica recolhido');
    assert.equal(await pg.evaluate(() => !document.getElementById('inv-baixar').checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true })), true);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
