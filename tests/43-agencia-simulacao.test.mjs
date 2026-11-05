// Agência: o "microcontrole" (relógio, alertas que surgem e vencem, nota e verba mensais). Lógica pura, sem navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO } from './helpers/navegador.mjs';

const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const semente = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

test('o relógio só corre depois de iniciar; o 1º chamado rápido vem no dia 2 e o 1º alerta da história no dia 5', async () => {
  const S = await mod('agencia/simulacao.js'), e = S.novoEstado();
  assert.deepEqual(S.avancarDia(e), [], 'sem treinamento o tempo não corre');
  assert.equal(e.dia, 0);
  assert.equal(S.iniciar(e), true); assert.equal(S.iniciar(e), false);
  const r = semente(7);
  assert.deepEqual(S.avancarDia(e, r), []); assert.equal(e.dia, 1);
  const ev = S.avancarDia(e, r);
  assert.equal(ev.length, 1); assert.equal(ev[0].tipo, 'novo'); assert.match(ev[0].id, /^q/, 'o primeiro é um chamado rápido'); assert.equal(e.ativos.length, 1);
  for (let d = 3; d <= 4; d++) assert.deepEqual(S.avancarDia(e, r).filter((x) => !String(x.id).startsWith('q')), []);
  const h = S.avancarDia(e, r); assert.equal(e.dia, 5); assert.ok(h.some((x) => x.tipo === 'novo' && !String(x.id).startsWith('q')), 'a história começa no dia 5');
});

test('nunca mais de 3 alertas ativos; só alertas já liberados no mês; determinístico com a mesma semente', async () => {
  const S = await mod('agencia/simulacao.js'), D = await mod('agencia/dados.js');
  const rodar = (seed, dias) => { const e = S.novoEstado(); S.iniciar(e); const r = semente(seed), log = []; for (let i = 0; i < dias; i++) { for (const ev of S.avancarDia(e, r)) log.push([e.dia, ev.tipo, ev.id || ev.humor]); const historia = e.ativos.filter((x) => !/^q\d+$/.test(x.id)); assert.ok(historia.length <= S.PARAMETROS.maxAtivos, 'mais de 3 ativos da história'); assert.ok(e.ativos.length - historia.length <= S.PARAMETROS.rapidas.max, 'mais chamados rápidos que o limite'); for (const a of historia) assert.ok(D.ALERTAS.find((x) => x.id === a.id).liberaMes <= S.mesDe(a.desde), 'alerta antes do mês de liberação'); } return JSON.stringify(log) + JSON.stringify(e); };
  for (let seed = 1; seed <= 25; seed++) rodar(seed, 200);
  assert.equal(rodar(42, 150), rodar(42, 150));
  assert.notEqual(rodar(42, 150), rodar(43, 150));
});

test('no 1º mês só aparecem alertas fáceis, normais e investigações liberadas; a missão 8 só a partir do 5º mês', async () => {
  const S = await mod('agencia/simulacao.js');
  const vistos = new Set();
  for (let seed = 1; seed <= 40; seed++) { const e = S.novoEstado(); S.iniciar(e); const r = semente(seed); for (let d = 0; d < 30; d++) for (const ev of S.avancarDia(e, r)) if (ev.tipo === 'novo') vistos.add(ev.id); }
  for (const id of ['m4', 'm5', 'm7', 'm8', 'i-radonio', 'i-nuclear', 'i-tempo']) assert.ok(!vistos.has(id), id + ' apareceu cedo demais');
  // fáceis primeiro: no 1º mês chegam m2, o hospital e m3; Zaragoza (m6, normal) vem depois
  for (const id of ['m2', 'm3', 'i-hospital']) assert.ok(vistos.has(id), id + ' nunca apareceu no 1º mês');
  const tarde = new Set();
  for (let seed = 1; seed <= 40; seed++) { const e = S.novoEstado(); S.iniciar(e); e.dia = 125; e.proximoAlerta = 126; e.usados = ['m2', 'm3', 'm4', 'm5', 'm6', 'm7', 'i-hospital', 'i-nuclear', 'i-tempo', 'i-radonio']; const r = semente(seed); for (let d = 0; d < 60; d++) for (const ev of S.avancarDia(e, r)) if (ev.tipo === 'novo') tarde.add(ev.id); }
  assert.ok(tarde.has('m8'), 'a missão 8 deve poder aparecer a partir do 5º mês');
});

test('sorteio sem repetir até esvaziar a lista (e a lista é reposta)', async () => {
  const S = await mod('agencia/simulacao.js'), e = S.novoEstado(); S.iniciar(e); e.dia = 1;
  const r = semente(3), vistos = [];
  for (let i = 0; i < 4; i++) vistos.push(S.sortear(e, r));
  assert.equal(new Set(vistos).size, 4, 'no 1º mês há 4 elegíveis: os 4 primeiros sorteios são distintos');
  const quinto = S.sortear(e, r); assert.ok(vistos.includes(quinto), 'a lista foi reposta');
  assert.equal(e.usados.length, 1);
});

test('alerta vence no prazo: some, a nota do mês cai 2 e o evento é registrado', async () => {
  const S = await mod('agencia/simulacao.js'), e = S.novoEstado(); S.iniciar(e); e.proximoAlerta = null; e.proximaRapida = 9999;   // sem chamados rápidos neste teste
  e.dia = 10; e.ativos = [{ id: 'm2', desde: 5, expira: 12 }];
  assert.deepEqual(S.avancarDia(e, semente(1)), []); assert.equal(e.dia, 11);
  const ev = S.avancarDia(e, semente(1));
  assert.deepEqual(ev.map((x) => x.tipo), ['expirou']); assert.equal(e.ativos.length, 0); assert.equal(e.nota, -2); assert.equal(e.expirados, 1);
  assert.equal(S.prazoDe('m8'), 10); assert.equal(S.prazoDe('i-hospital'), 21); assert.equal(S.prazoDe('m2'), 14);
});

test('fim do mês: paga a verba, avalia a nota (feliz/satisfeito/infeliz) e a verba muda só para o mês seguinte', async () => {
  const S = await mod('agencia/simulacao.js'), P = S.PARAMETROS;
  const caso = (nota) => { const e = S.novoEstado(); S.iniciar(e); e.proximoAlerta = null; e.dia = 29; e.nota = nota; const ev = S.avancarDia(e, semente(5)); return { e, m: ev.find((x) => x.tipo === 'mes') }; };
  let { e, m } = caso(6); assert.equal(m.humor, 'feliz'); assert.equal(m.valor, 1500, 'pagamento a 100 % antes da avaliação'); assert.ok(e.fator >= 105 && e.fator <= 120); assert.equal(e.nota, 0); assert.equal(e.creditos, 1500);
  ({ e, m } = caso(3)); assert.equal(m.humor, 'satisfeito'); assert.equal(e.fator, 100);
  ({ e, m } = caso(0)); assert.equal(m.humor, 'infeliz'); assert.ok(e.fator >= 80 && e.fator <= 95);
  ({ e, m } = caso(-4)); assert.equal(m.humor, 'infeliz');
  assert.equal(P.verbaBase, 1500);
});

test('sem game over: ignorando tudo por 10 anos a verba cai até o piso de 50 % e nunca abaixo; os créditos continuam entrando', async () => {
  const S = await mod('agencia/simulacao.js'), e = S.novoEstado(); S.iniciar(e); const r = semente(11);
  let anterior = 0;
  for (let d = 0; d < 3600; d++) { S.avancarDia(e, r); assert.ok(e.fator >= 50 && e.fator <= 150); assert.ok(e.creditos >= anterior); anterior = e.creditos; }
  assert.equal(e.fator, 50); assert.ok(e.creditos > 0);
});

test('concluir: paga o prêmio do nível × fator das estrelas, soma na nota, tira dos ativos; alerta que não está ativo não paga', async () => {
  const S = await mod('agencia/simulacao.js'), e = S.novoEstado(); S.iniciar(e);
  e.ativos = [{ id: 'm3', desde: 1, expira: 15 }, { id: 'i-hospital', desde: 1, expira: 22 }];
  assert.equal(S.concluir(e, 'm3', 3), 780); assert.equal(e.nota, 3); assert.equal(e.creditos, 780); assert.equal(e.concluidos.m3, 1); assert.equal(e.ativos.length, 1);
  assert.equal(S.concluir(e, 'm3', 3), 0, 'não paga duas vezes'); assert.equal(e.creditos, 780);
  assert.equal(S.concluir(e, 'i-hospital', S.PARAMETROS.pontosInvestigacao), 600);
  assert.equal(S.concluir(e, 'm8', 3), 0);
  assert.equal(S.totalConcluidos(e), 2);
});

test('sanear: lixo vira estado válido; ids desconhecidos e excesso de ativos são descartados', async () => {
  const S = await mod('agencia/simulacao.js');
  for (const lixo of [null, undefined, 5, 'x', [], { dia: 'abc', fator: 9999, creditos: -5, ativos: 'z', usados: 3, concluidos: 7, historico: 'h' }]) {
    const e = S.sanear(lixo);
    assert.ok(e.fator >= 50 && e.fator <= 150 && e.dia >= 0 && e.creditos >= 0 && Array.isArray(e.ativos) && Array.isArray(e.usados) && Array.isArray(e.historico));
  }
  const e = S.sanear({ iniciado: true, dia: 40, fator: 120, ativos: [{ id: 'm2', desde: 30, expira: 44 }, { id: 'zzz', desde: 1, expira: 2 }, { id: 'm2', desde: 1, expira: 2 }, { id: 'm3', desde: 31, expira: 45 }, { id: 'm6', desde: 32, expira: 46 }, { id: 'm4', desde: 33, expira: 47 }], usados: ['m2', 'xx'], concluidos: { m2: 2, bobo: 9 } });
  assert.equal(e.ativos.length, 3); assert.deepEqual(e.ativos.map((a) => a.id), ['m2', 'm3', 'm6']); assert.deepEqual(e.usados, ['m2']); assert.deepEqual(e.concluidos, { m2: 2 });
  assert.deepEqual(S.sanear(JSON.parse(JSON.stringify(e))), e, 'ida e volta pelo JSON');
});

test('calendário: mês e dia do mês', async () => {
  const S = await mod('agencia/simulacao.js');
  assert.equal(S.mesDe(0), 0); assert.equal(S.mesDe(1), 0); assert.equal(S.mesDe(30), 0); assert.equal(S.mesDe(31), 1);
  assert.equal(S.diaDoMes(1), 1); assert.equal(S.diaDoMes(30), 30); assert.equal(S.diaDoMes(31), 1);
});
