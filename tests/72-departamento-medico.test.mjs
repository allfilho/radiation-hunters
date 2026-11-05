// v3.27: Departamento médico (Fase A): construção, alta mais cedo (limite 85 % em vez de 75 %), tratamento na sala, arte e UI.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const novo = async () => { const S = await mod('agencia/simulacao.js'), F = await mod('agencia/frota.js'), E = await mod('agencia/equipe.js'); const e = S.sanear(null); return { S, F, E, e }; };

test('construir: único, custa créditos, 4 dias de obra; só vale depois de pronto', async () => {
  const { F, e } = await novo();
  e.creditos = 5000; e.grade = { cols: 5, rows: 2 };
  assert.equal(F.temMedico(e), false); assert.equal(F.limiteRetorno(e), 0.75);
  const r = F.construirModulo(e, 'medico', 4, 0); assert.equal(r.ok, true); assert.equal(e.creditos, 5000 - F.CUSTOS.modulo.medico);
  assert.equal(F.temMedico(e), false, 'em obra');
  assert.equal(F.construirModulo(e, 'medico', 4, 1).motivo, 'unico');
  e.dia += F.CUSTOS.diasObra.medico; assert.equal(F.temMedico(e), true); assert.equal(F.limiteRetorno(e), 0.85);
});

test('alta: com o departamento a pessoa volta antes do que sem ele; o save antigo sem módulo continua válido', async () => {
  const { S, F, E, e } = await novo();
  const A = { id: 'x', nome: 'A', retrato: 'lara', doses: [], tratamento: false, ocupadoAte: 0 };
  E.registrarDose(A, 10, 4.0); assert.equal(A.tratamento, true);
  const dSem = E.diasParaVoltar(A, 10), dCom = E.diasParaVoltar(A, 10, E.NORMAS.retornoMedico);
  assert.ok(dCom < dSem, `com ${dCom} < sem ${dSem}`);
  const rs = S.sanear(JSON.parse(JSON.stringify(e))); assert.equal(rs.modulos.some((m) => m.tipo === 'medico'), false);
  const com = S.sanear({ ...JSON.parse(JSON.stringify(e)), modulos: [...e.modulos, { id: 'b99', tipo: 'medico', x: 3, y: 1, pronto: 0 }], grade: { cols: 4, rows: 2 } });
  assert.ok(com.modulos.some((m) => m.tipo === 'medico'));
});

test('arte: bloco do médico existe na vista em corte e na planta, e é diferente do alojamento', async () => {
  const B = await mod('agencia/base-svg.js'), P = await mod('arte/planta.js');
  assert.notEqual(B.moduloSvg('medico'), B.moduloSvg('alojamento')); assert.ok(!/NaN|undefined/.test(B.moduloSvg('medico')));
  assert.notEqual(P.planta('medico'), P.planta('alojamento')); assert.ok(!/NaN|undefined/.test(P.planta('medico')));
  assert.ok(P.PONTOS.medico.length >= 3);
});

const ESTADO = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 40, creditos: 5000, proximoAlerta: null, ativos: [] })); } catch (e) {} `;

for (const [w, h] of [[1280, 720], [390, 844]]) {
  test(`na Base (${w}×${h}): construir o médico, abrir a sala e ver quem está em tratamento`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', viewport: { width: w, height: h }, toque: w < 800, antes: ESTADO });
      const { novoJogo } = await import('./helpers/navegador.mjs');
      await novoJogo(pg); await pg.waitForSelector('.ag-mapa'); await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
      assert.equal(await pg.$('[data-sala="medico"]'), null, 'ainda não construído: botão desabilitado');
      assert.match(await pg.textContent('.ag-console'), /Departamento médico/);
      await pg.click('[data-vazio]'); await pg.waitForSelector('.ag-janela');
      await pg.click('[data-ag="construir"][data-tipo="medico"]');
      assert.equal(await pg.evaluate(() => ui.agencia.est.modulos.some((m) => m.tipo === 'medico')), true);
      await pg.evaluate(() => { const e = ui.agencia.est; e.dia += 10; const m = e.equipe[0]; m.doses = [{ dia: e.dia, msv: 4 }]; m.tratamento = true; ui.agencia.render?.(); });
      await pg.click('[data-sala="medico"]'); await pg.waitForSelector('.ag-janela');
      const txt = await pg.textContent('.ag-janela');
      assert.match(txt, /Cecília/); assert.match(txt, /1 em tratamento/); assert.match(txt, /85 %/);
      assert.equal(await pg.$$eval('.ag-janela .ag-membro', (e) => e.length), 1);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
