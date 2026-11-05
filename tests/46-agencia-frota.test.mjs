// Agência: naves, hangar, Base em grade, pesquisa, contratação, coleta e integração com o relógio. Lógica pura.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const semente = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const novo = async () => { const S = await mod('agencia/simulacao.js'), F = await mod('agencia/frota.js'), E = await mod('agencia/equipe.js'); const e = S.sanear(null); return { S, F, E, e }; };

test('estado inicial: 4 cientistas, 6 camas, 2 baias, 1 nave, grade 4×2 com 7 módulos', async () => {
  const { F, e } = await novo();
  assert.equal(e.equipe.length, 4); assert.equal(F.camasTotal(e), 6); assert.equal(F.baiasTotal(e), 2);
  assert.equal(e.naves.length, 1); assert.deepEqual(e.grade, { cols: 4, rows: 2 }); assert.equal(e.modulos.length, 7);
  assert.equal(F.celulasLivres(e).length, 1);
});

test('dotação inicial só na primeira vez', async () => {
  const { S, e } = await novo();
  S.iniciar(e, 400); S.iniciar(e, 400); assert.equal(e.creditos, 400);
});

test('comprar nave: baias, créditos e pesquisa', async () => {
  const { F, e } = await novo();
  e.creditos = 6000;
  assert.equal(F.comprarNave(e, 'levantamento').motivo, 'pesquisa');
  assert.equal(F.comprarNave(e, 'resgate').ok, true); assert.equal(e.creditos, 6000 - F.CUSTOS.nave.resgate);
  assert.equal(F.comprarNave(e, 'resgate').motivo, 'baias', 'só 2 baias');
  // novo hangar: nada até a obra acabar
  assert.equal(F.construirModulo(e, 'hangar', 3, 1).ok, true);
  assert.equal(F.baiasTotal(e), 2); e.dia += 5; assert.equal(F.baiasTotal(e), 4);
});

test('construir: célula ocupada, módulo único, sem crédito; expandir a base até o máximo', async () => {
  const { F, e } = await novo(); e.creditos = 5000;
  assert.equal(F.construirModulo(e, 'hangar', 0, 0).motivo, 'celula');
  assert.equal(F.construirModulo(e, 'laboratorio', 3, 1).ok, true);
  assert.equal(F.construirModulo(e, 'hangar', 4, 0).motivo, 'celula', 'fora da grade');
  assert.equal(F.expandirBase(e, 'coluna').ok, true); assert.equal(F.expandirBase(e, 'coluna').ok, true);
  assert.equal(F.expandirBase(e, 'coluna').motivo, 'maximo'); assert.equal(F.expandirBase(e, 'linha').ok, true);
  assert.deepEqual(e.grade, { cols: 6, rows: 3 });
  assert.equal(F.construirModulo(e, 'laboratorio', 4, 0).motivo, 'unico');
  e.creditos = 0; assert.equal(F.construirModulo(e, 'alojamento', 4, 0).motivo, 'creditos');
});

test('pesquisa do detector aéreo libera a nave de levantamento; o voo marca o alerta', async () => {
  const { S, F, e } = await novo(); S.iniciar(e, 0); e.creditos = 9000;
  assert.equal(F.iniciarPesquisa(e, 'detectorAereo').motivo, 'laboratorio');
  F.construirModulo(e, 'laboratorio', 3, 1); e.dia += 4;
  assert.equal(F.iniciarPesquisa(e, 'detectorAereo').ok, true);
  assert.equal(F.iniciarPesquisa(e, 'detectorAereo').motivo, 'ja');
  e.dia += 10; assert.ok(F.pesquisaPronta(e, 'detectorAereo'));
  e.modulos.push({ id: 'bx', tipo: 'hangar', x: 0, y: 1, pronto: 0 });   // atalho: mais baias
  e.modulos = e.modulos.filter((m) => m.id !== 'b5'); // libera uma célula? (alojamento) — não precisa
  assert.equal(F.comprarNave(e, 'levantamento').ok, true);
  e.ativos.push({ id: 'm2', desde: e.dia, expira: e.dia + 14 });
  const r = F.enviarLevantamento(e, 'm2'); assert.equal(r.ok, true);
  assert.equal(F.enviarLevantamento(e, 'm2').motivo, 'ja');
  S.avancarDia(e, semente(1)); assert.equal(F.foiLevantado(e, 'm2'), false);
  const ev = S.avancarDia(e, semente(2)); assert.ok(ev.some((x) => x.tipo === 'levantamento'));
  assert.equal(F.foiLevantado(e, 'm2'), true);
});

test('contratação: camas, créditos e candidatos no fim do mês', async () => {
  const { S, F, e } = await novo(); S.iniciar(e, 0); const r = semente(3);
  assert.equal(e.candidatos.length, 0);
  for (let d = 0; d < 30; d++) S.avancarDia(e, r);
  assert.ok(e.candidatos.length >= 1 && e.candidatos.length <= 4);
  e.creditos = 1000;
  assert.equal(F.contratar(e, e.candidatos[0].id).ok, true); assert.equal(e.equipe.length, 5); assert.equal(e.creditos, 1000 - F.CUSTOS.contratar);
  F.contratar(e, e.candidatos[0].id); assert.equal(e.equipe.length, 6);
  assert.equal(F.contratar(e, e.candidatos[0] && e.candidatos[0].id || 'zz').ok, false, 'camas cheias (6)');
});

test('coleta: nave de resgate leva 2 dias, paga, e dá dose de manejo; coleta esquecida vence', async () => {
  const { S, F, E, e } = await novo(); S.iniciar(e, 0);
  e.naves.push({ id: 'n9', tipo: 'resgate', livreEm: 0, missao: null });
  assert.equal(F.registrarColeta(e, 'm2', 3), true); assert.equal(F.registrarColeta(e, 'm2', 3), false);
  const c = e.coleta[0];
  assert.equal(F.enviarResgate(e, c.id, ['c1', 'c2', 'c3']).motivo, 'equipe', 'a nave leva 2');
  const r = F.enviarResgate(e, c.id, ['c1', 'c2']); assert.equal(r.ok, true);
  assert.equal(E.disponivel(e.equipe[0], e.dia), false);
  S.avancarDia(e, semente(1)); const ev = S.avancarDia(e, semente(1));
  const ent = ev.find((x) => x.tipo === 'entrega'); assert.ok(ent); assert.equal(e.creditos, 3 * F.CUSTOS.valorColetaPorFonte);
  assert.ok(E.doseNaJanela(e.equipe[0], e.dia, 1) > 0);
  assert.equal(E.disponivel(e.equipe[0], e.dia), true);
  F.registrarColeta(e, 'm3', 2); const antes = e.nota;
  for (let d = 0; d < F.PRAZO_COLETA; d++) S.avancarDia(e, semente(5));
  assert.equal(e.coleta.length, 0); assert.ok(e.nota < antes + 1);
});

test('tratamento: dose alta na missão tira o cientista do serviço e ele volta sozinho com o passar dos dias', async () => {
  const { S, E, e } = await novo(); S.iniciar(e, 0);
  const r = E.distribuirDoseMissao(e.equipe, ['c1', 'c2'], 'c1', 2, e.dia);
  assert.equal(r[0].tratamento, true); assert.equal(r[1].tratamento, false);
  assert.equal(E.disponivel(e.equipe[0], e.dia), false);
  let voltou = false; for (let d = 0; d < 8 && !voltou; d++) voltou = S.avancarDia(e, semente(9)).some((x) => x.tipo === 'retorno');
  assert.ok(voltou); assert.equal(E.disponivel(e.equipe[0], e.dia), true);
});

test('sanear aceita lixo no estado novo', async () => {
  const { S } = await novo();
  for (const lixo of [{ equipe: 5, naves: 'x', modulos: [{ tipo: 'foo' }], grade: { cols: 99 }, coleta: [1], pesquisa: 3, candidatos: 'a' }]) {
    const e = S.sanear(lixo);
    assert.equal(e.equipe.length, 4); assert.ok(e.naves.length >= 1); assert.equal(e.grade.cols, 6); assert.equal(e.modulos.length, 7); assert.deepEqual(e.coleta, []);
  }
});
