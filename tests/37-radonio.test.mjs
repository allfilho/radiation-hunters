// Radônio em ambientes (episódio da escola v2): modelo de balanço de massa. Node puro, sem navegador.
// Confere a solução exata contra a EDO, os limites físicos, o valor de Jonassen (1,5 % a 0,5 1/h) e o comportamento
// por agenda, andar e tipo de ambiente. Os valores de ambiente são [H] (jogo); os testes verificam relações, não dados reais.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const R = await import(pathToFileURL(path.join(RAIZ, 'js/fisica/radonio.js')).href);
const near = (a, b, tol, m = '') => assert.ok(Math.abs(a - b) <= tol, `${m} ${a} x ${b} (±${tol})`);
const A = R.AMBIENTES;

test('λ vem da meia-vida de 3,8232 d (IAEA/LNHB): metade em 3,8232 d, τ ≈ 5,52 d', () => {
  near(R.LAMBDA, 0.0075542, 1e-7, 'λ');
  near(1 / R.LAMBDA / 24, 5.5157, 1e-3, 'τ em dias');
  const C = R.passo(100, 0, 1, 0, R.MEIA_VIDA_RN222_H, 0);       // sem entrada, sem ventilação, sem externa
  near(C, 50, 1e-9, 'metade');
});

test('Jonassen (c. 1980): com 0,5 1/h a concentração fica em 1,5 % do valor sem ventilação (λ/(λv+λ))', () => {
  const semVent = R.estacionario(10, 1, 0, 0), comVent = R.estacionario(10, 1, 0.5, 0);
  near(comVent / semVent, 0.0149, 5e-5);
});

test('solução exata confere com a EDO integrada por Runge-Kutta de 4ª ordem', () => {
  const S = 700, V = 150, lv = 0.8, C0 = 8;
  const f = (C) => S / V - (lv + R.LAMBDA) * C + lv * C0;
  let c = 20; const h = 0.001, T = 5;
  for (let t = 0; t < T; t += h) {
    const k1 = f(c), k2 = f(c + h * k1 / 2), k3 = f(c + h * k2 / 2), k4 = f(c + h * k3);
    c += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  }
  near(R.passo(20, S, V, lv, T, C0), c, 1e-6);
});

test('passos se compõem (dois meios passos = um passo), dt = 0 não muda e dt grande vai ao regime permanente', () => {
  const a = R.passo(R.passo(33, 500, 120, 0.3, 1.5), 500, 120, 0.3, 1.5), b = R.passo(33, 500, 120, 0.3, 3);
  near(a, b, 1e-9);
  assert.equal(R.passo(41, 500, 120, 0.3, 0), 41);
  near(R.passo(5, 500, 120, 0.3, 1e6), R.estacionario(500, 120, 0.3), 1e-9);
});

test('nunca negativo e sempre entre o valor inicial e o regime permanente (sem ultrapassar)', () => {
  for (const [C, S, lv] of [[0, 800, 0.2], [500, 100, 3], [20, 0, 0.05], [3, 3000, 5]]) {
    const cInf = R.estacionario(S, 150, lv);
    let c = C;
    for (let i = 0; i < 200; i++) {
      const n = R.passo(c, S, 150, lv, 0.25);
      assert.ok(n >= 0);
      assert.ok(n >= Math.min(c, cInf) - 1e-9 && n <= Math.max(c, cInf) + 1e-9, `${c} -> ${n} (alvo ${cInf})`);
      c = n;
    }
  }
});

test('abrir a janela: o desvio até o novo regime cai a 1/e depois de uma constante de tempo 1/(λv+λ)', () => {
  const s = A['sala-terreo'], e = R.entradas(s);
  const lv0 = R.trocaDeAr(s), lv1 = R.trocaDeAr(s, { janelas: 1 });
  const c0 = R.estacionario(e.total, s.volume, lv0), c1 = R.estacionario(e.total, s.volume, lv1);
  assert.ok(c1 < c0);
  const tau = R.constanteDeTempo(lv1);
  const c = R.passo(c0, e.total, s.volume, lv1, tau);
  near((c - c1) / (c0 - c1), Math.exp(-1), 1e-9);
  assert.ok(tau < 1, 'com janela aberta a constante de tempo é menor que 1 h');
});

test('S_mat = E·A em qualquer andar; S_solo cresce com o contato com o solo (porão > térreo > 1º andar > sótão)', () => {
  for (const s of Object.values(A)) near(R.entradas(s).mat, s.exalacao * s.area, 1e-9, s.id);
  const soloPorM2 = (s) => R.entradas(s).solo / s.pisoM2;
  assert.ok(soloPorM2(A.porao) > soloPorM2(A['sala-terreo']));
  assert.ok(soloPorM2(A['sala-terreo']) > soloPorM2(A['sala-andar1']));
  assert.ok(soloPorM2(A['sala-andar1']) > soloPorM2(A.sotao));
  assert.ok(R.entradas(A.porao).solo > R.entradas(A.porao).mat, 'porão: o solo domina');
  assert.ok(R.entradas(A.sotao).mat > R.entradas(A.sotao).solo, 'sótão: os materiais dominam');
});

test('fechados (só infiltração), os ambientes ordenam como o esperado e todos ficam acima do ar externo', () => {
  const cf = (id) => { const s = A[id], e = R.entradas(s); return R.estacionario(e.total, s.volume, R.trocaDeAr(s)); };
  // o depósito sem janela (λv de 0,05) pode passar o porão: o que decide é entrada E ventilação, não só o contato com o solo
  assert.ok(Math.min(cf('porao'), cf('deposito-terreo')) > cf('sala-terreo') && cf('sala-terreo') > cf('sala-andar1') && cf('sala-andar1') > cf('sotao'));
  for (const id of Object.keys(A)) assert.ok(cf(id) > R.PARAMETROS.concentracaoExterna, id);
});

test('sem solo e sem materiais a concentração vai ao ar externo; sótão hermético acumula só pelos materiais', () => {
  const nada = { volume: 100, area: 0, pisoM2: 10, contatoSolo: 0, exalacao: 0, infiltracao: 0.2 };
  near(R.estacionario(R.entradas(nada).total, 100, 0.2, 8), 8 * 0.2 / (0.2 + R.LAMBDA), 1e-9);   // o ar externo também decai dentro: um pouco menos que C0
  const sot = { ...A.sotao, infiltracao: 0.05 };
  const so_mat = { ...sot, contatoSolo: 0 };
  const c = R.estacionario(R.entradas(so_mat).total, so_mat.volume, 0.05);
  assert.ok(c > 8 + 20, `sótão hermético, só materiais: ${c}`);
  const cVent = R.estacionario(R.entradas(so_mat).total, so_mat.volume, 0.05 + 3);
  assert.ok(cVent < 8 + 2, 'ventilar o mesmo sótão derruba o acúmulo');
});

test('agenda e relógio: aula de segunda a sexta, das 8 às 17; fim de semana fechado', () => {
  assert.equal(R.ocupado(10), true);                 // segunda 10 h
  assert.equal(R.ocupado(7.9), false);
  assert.equal(R.ocupado(17), false);
  assert.equal(R.ocupado(5 * 24 + 10), false);       // sábado
  assert.equal(R.diaDaSemana(6 * 24 + 1), 6);
  const mec = R.agenda({ mecanica: 'programada' });
  assert.equal(mec(7.5).mecanica, true);             // 1 h antes da aula
  assert.equal(mec(17.5).mecanica, true);
  assert.equal(mec(19).mecanica, false);
  assert.equal(mec(5 * 24 + 10).mecanica, false);    // sábado
  assert.equal(R.agenda({ mecanica: 'continua' })(5 * 24 + 3).mecanica, true);
  assert.deepEqual(R.agenda({ janelasNaAula: 2, portaNaAula: 1 })(10), { janelas: 2, portas: 1, mecanica: false });
  assert.deepEqual(R.agenda({ janelasNaAula: 2 })(20), { janelas: 0, portas: 0, mecanica: false });
});

test('ventilação programada: o fim de semana passa a noite de semana, o pico cai no fim de semana e as horas de aula ficam bem abaixo da média', () => {
  const s = A['sala-terreo'];
  const ser = R.simular(s, R.agenda({ mecanica: 'programada' }), { dias: 7 });
  const r = R.resumo(ser);
  const noiteSemana = R.mediaEntre(ser, 1 * 24 + 20, 2 * 24 + 6);      // terça 20 h a quarta 6 h
  const fimDeSemana = R.mediaEntre(ser, 5 * 24 + 6, 6 * 24 + 24);      // sábado 6 h a domingo 24 h
  assert.ok(fimDeSemana > noiteSemana, `fim de semana ${fimDeSemana} x noite ${noiteSemana}`);
  assert.ok(r.horaDoPico <= 8 || r.horaDoPico > 5 * 24, `pico em ${r.horaDoPico} h (manhã de segunda, depois do fim de semana, ou no próprio fim de semana)`);
  assert.ok(r.fator < 0.6 && r.fator > 0.02, `fator ocupado/total ${r.fator}`);
  assert.ok(r.mediaOcupado < r.media);
});

test('pouca x muita ventilação: a sala fechada fica mais alta nas aulas; a sala aberta sobe à noite e cai ao abrir', () => {
  const A1 = R.simular(A['sala-terreo'], R.agenda({}), { dias: 7 });
  const B1 = R.simular(A['sala-terreo'], R.agenda({ janelasNaAula: 2, portaNaAula: 1 }), { dias: 7 });
  const ra = R.resumo(A1), rb = R.resumo(B1);
  assert.ok(ra.mediaOcupado > 3 * rb.mediaOcupado, `A ${ra.mediaOcupado} x B ${rb.mediaOcupado}`);
  const i = (tH) => B1.tH.findIndex((t) => t >= tH);
  const antes = B1.C[i(1 * 24 + 7.9)], depois = B1.C[i(1 * 24 + 9)];    // terça, antes e depois de abrir
  assert.ok(depois < antes / 2, `abrir deve derrubar: ${antes} -> ${depois}`);
  const fim = B1.C[i(1 * 24 + 16.9)], manha = B1.C[i(2 * 24 + 7.9)];     // fim da aula x manhã seguinte
  assert.ok(manha > fim, 'a sala volta a acumular de noite com tudo fechado');
});

test('pisos: com a mesma agenda, a média da semana cai do porão ao 1º andar', () => {
  const ag = R.agenda({ janelasNaAula: 1 });
  const m = (id) => R.resumo(R.simular(A[id], ag, { dias: 7 })).media;
  assert.ok(m('porao') > m('sala-terreo') && m('sala-terreo') > m('sala-andar1'));
});

test('simulação é determinística e a série tem o tamanho esperado', () => {
  const a = R.simular(A.corredor, R.agenda({ mecanica: 'so-na-aula' }), { dias: 3, dtH: 0.5 });
  const b = R.simular(A.corredor, R.agenda({ mecanica: 'so-na-aula' }), { dias: 3, dtH: 0.5 });
  assert.deepEqual(a.C, b.C);
  assert.equal(a.C.length, 3 * 24 / 0.5);
  near(a.tH.at(-1), 72, 1e-9);
});

test('o passo da simulação não muda o resultado (dt = 0,1 h x 0,5 h) quando a agenda é constante no passo', () => {
  const ag = R.agenda({ mecanica: 'continua' });
  const a = R.simular(A['sala-terreo'], ag, { dias: 2, dtH: 0.5 }), b = R.simular(A['sala-terreo'], ag, { dias: 2, dtH: 0.1 });
  const em = (s, tH) => s.C[s.tH.findIndex((t) => Math.abs(t - tH) < 1e-9)];
  for (const tH of [1, 12, 30, 48]) near(em(a, tH), em(b, tH), 1e-9, `t = ${tH} h`);
});

test('parâmetros: números finitos e positivos, ids dos ambientes batem com as chaves, limites da OMS (100 e 300)', () => {
  for (const [k, v] of Object.entries(R.PARAMETROS)) assert.ok(Number.isFinite(v) && v > 0, k);
  for (const [k, s] of Object.entries(A)) {
    assert.equal(s.id, k);
    for (const c of ['volume', 'area', 'pisoM2', 'exalacao', 'infiltracao']) assert.ok(s[c] > 0, `${k}.${c}`);
    assert.ok(s.contatoSolo >= 0 && s.contatoSolo <= 1, k);
  }
  assert.equal(R.PARAMETROS.limiteOmsBqM3, 100);
  assert.equal(R.PARAMETROS.limiteMaximoBqM3, 300);
});

test('a tabela de parâmetros do docs cita a meia-vida e os rótulos [V]/[H]', (t) => {
  const p = path.resolve(RAIZ, '../docs/radonio-parametros.md');
  if (!fs.existsSync(p)) return t.skip('docs/radonio-parametros.md ausente');
  const s = fs.readFileSync(p, 'utf8');
  assert.match(s, /3,8232/); assert.match(s, /\[H\]/); assert.match(s, /\[V\]/);
});

test('janelasFora: janelas abertas também fora da aula derrubam o valor noturno; campanha12 devolve 12 médias e o frio sobe (fator de solo)', () => {
  const sala = R.AMBIENTES['sala-terreo'];
  const noite = (cfg) => R.agenda(cfg)(24 * 1 + 3);   // terça, 3 h
  assert.equal(noite({ janelasNaAula: 2 }).janelas, 0); assert.equal(noite({ janelasNaAula: 2, janelasFora: 1 }).janelas, 1);
  assert.equal(R.agenda({ janelasNaAula: 2, janelasFora: 1 })(24 * 1 + 10).janelas, 2);
  const m = R.campanha12(sala, () => ({}));
  assert.equal(m.length, 12); assert.ok(m.every(Number.isFinite));
  R.PERIODOS_FRIOS.forEach((p) => assert.ok(m[p] > 1.5 * m[0], `período ${p + 1} deveria subir`));
  assert.ok(Math.abs(m[0] - R.estacionario(R.entradas(sala).total, sala.volume, R.trocaDeAr(sala, {}))) < 1, 'fechada o ano todo: igual ao regime permanente');
});
