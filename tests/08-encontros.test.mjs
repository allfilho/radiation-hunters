// Encontros de aprendizado (etapa 5d-1): banco, motor e aproveitamento. Node puro, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = process.env.RH_ROOT || fileURLToPath(new URL('../current/', import.meta.url));
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const { CONCEITOS: C, TEMAS } = await imp('js/data/encontros/conceitos.js');
const { PERGUNTAS: P } = await imp('js/data/encontros/perguntas.js');
const M = await imp('js/encontros/motor.js');
const A = await imp('js/encontros/aproveitamento.js');

const errada = (q) => (q.formato === 'mf' ? (q.correta === 'mito' ? 'fato' : 'mito') : (q.correta + 1) % 3);

test('banco válido: grafo sem ciclos, pré-requisitos existem, todo nó tem nível 1, respostas na faixa', () => {
  assert.deepEqual(M.validarBanco(C, P), []);
});
test('detecta ciclo e pré-requisito inexistente', () => {
  const ruim = [{ id: 'X', prereq: ['Y'] }, { id: 'Y', prereq: ['X'] }, { id: 'Z', prereq: ['W'] }];
  const e = M.validarBanco(ruim, []).join('|');
  assert.match(e, /ciclo/); assert.match(e, /inexistente/);
});
test('temas dos nós são válidos e há pelo menos 50 perguntas', () => {
  C.forEach((c) => assert.ok(TEMAS.includes(c.tema), c.id));
  assert.ok(P.length >= 50);
});
test('PT e EN completos; explicações curtas; fontes presentes', () => {
  for (const q of P) {
    for (const l of ['pt', 'en']) {
      assert.ok(q[l].enunciado?.length > 10, q.id + l);
      assert.ok(q[l].explicacao?.length > 10 && q[l].explicacao.length <= 280, `${q.id} ${l} explicação ${q[l].explicacao.length}`);
    }
    assert.ok(q.fatos.length >= 1, q.id);
  }
  for (const c of C) for (const l of ['pt', 'en']) { assert.ok(c[l].ficha && c[l].fonte && c[l].titulo, c.id + l); }
});
test('IDs de fatos existem no banco de referências', () => {
  const base = path.join(RAIZ, '..', 'docs');
  if (!fs.existsSync(path.join(base, 'referencias-5c'))) return; // roda onde a documentação não está junto
  const busca = path.join(base, 'referencias-5c', 'busca');
  const txt = fs.readdirSync(busca).map((f) => fs.readFileSync(path.join(busca, f), 'utf8')).join('\n') + fs.readFileSync(path.join(base, 'fatos-historicos-3e.md'), 'utf8');
  const f3e = fs.readFileSync(path.join(base, 'fatos-historicos-3e.md'), 'utf8');
  const PALAVRA = { 'F3E-CHE': 'Chernobyl', 'F3E-LIA': 'Lia', 'F3E-FUK': 'Fukushima' };   // F3E-xxx = acidente no documento de fatos da etapa 3e
  for (const q of P) for (const f of q.fatos) {
    if (f.startsWith('F3E-')) assert.ok(PALAVRA[f] && f3e.includes(PALAVRA[f]), `${q.id}: ${f} sem correspondente em fatos-historicos-3e.md`);
    else assert.ok(txt.includes('### ' + f) || txt.includes('### ' + f + ' '), `${q.id}: fato ${f} não encontrado`);
  }
});
test('não usa Math.random', () => {
  for (const f of ['js/encontros/motor.js', 'js/encontros/aproveitamento.js', 'js/data/encontros/perguntas.js', 'js/data/encontros/conceitos.js'])
    assert.ok(!/Math\.random\(/.test(fs.readFileSync(path.join(RAIZ, f), 'utf8')), f);
});

test('mesma semente e mesmo estado ⇒ mesmas perguntas (determinístico)', () => {
  const run = () => { const ap = M.aprendizadoVazio(); return [1, 2, 3].map((i) => M.iniciar(C, P, ap, { missao: 2, gatilho: 'fixo', semente: 7 + i, usadas: [] }).cadeia[0].id); };
  assert.deepEqual(run(), run());
});
test('nó de história só aparece na própria missão; sem pré-requisito visto, nó dependente não é sorteado', () => {
  const ap = M.aprendizadoVazio();
  for (let s = 0; s < 60; s++) {
    const e = M.iniciar(C, P, ap, { missao: 1, gatilho: 'fixo', semente: s, usadas: [] });
    const no = C.find((c) => c.id === e.no);
    if (no.historia) assert.ok(no.missoes.includes(1));
    else assert.ok(no.prereq.length === 0, `${no.id} com pré-requisito não visto`);
  }
});
test('erro em nível 2 ⇒ pergunta mais simples do mesmo nó; acerto na ficha ⇒ crédito 0,4 e mostra a original', () => {
  const ap = M.aprendizadoVazio();
  const q2 = P.find((q) => q.nivel === 2 && P.some((r) => r.no === q.no && r.nivel === 1));
  const enc = { semente: 1, missao: 1, gatilho: 'fixo', no: q2.no, cadeia: [q2], passo: 0, resultados: [], fim: null };
  const r = M.responder(enc, C, P, ap, errada(q2));
  assert.equal(r.proxima.no, q2.no); assert.ok(r.proxima.nivel < 2); assert.notEqual(r.proxima.id, q2.id);
  const r2 = M.responder(enc, C, P, ap, r.proxima.correta);
  assert.equal(r2.fim.credito, 0.4); assert.deepEqual(r2.fim.ensino.map((q) => q.id), [q2.id]);
});
test('3 erros ⇒ crédito 0, ensina as três do mais simples ao original, nunca repete pergunta, no máximo 3', () => {
  for (const base of P.filter((q) => q.nivel >= 1)) {
    const ap = M.aprendizadoVazio();
    const enc = { semente: 5, missao: 1, gatilho: 'fixo', no: base.no, cadeia: [base], passo: 0, resultados: [], fim: null };
    let r = M.responder(enc, C, P, ap, errada(base));
    while (!r.fim) r = M.responder(enc, C, P, ap, errada(enc.cadeia[enc.passo]));
    assert.ok(enc.cadeia.length <= 3); assert.equal(new Set(enc.cadeia.map((q) => q.id)).size, enc.cadeia.length);
    assert.equal(r.fim.credito, 0);
    assert.deepEqual(r.fim.ensino.map((q) => q.id), [...enc.cadeia].reverse().map((q) => q.id));
  }
});
test('pular = 0 e não abre cadeia; acertar de primeira = 1', () => {
  const ap = M.aprendizadoVazio();
  const q = P[0];
  const e1 = { semente: 1, missao: 1, no: q.no, cadeia: [q], passo: 0, resultados: [], fim: null };
  const r = M.responder(e1, C, P, ap, null);
  assert.ok(r.pulou); assert.equal(r.fim.credito, 0); assert.equal(r.proxima, null);
  const e2 = { semente: 1, missao: 1, no: q.no, cadeia: [q], passo: 0, resultados: [], fim: null };
  assert.equal(M.responder(e2, C, P, ap, q.correta).fim.credito, 1);
});
test('aplicarResultado não altera o original e mantém domínio em 0–4', () => {
  const ap = M.aprendizadoVazio(); const copia = JSON.stringify(ap);
  const q = P[0];
  let atual = ap;
  for (let i = 0; i < 12; i++) {
    const e = { semente: i, missao: 1, no: q.no, cadeia: [q], passo: 0, resultados: [], fim: null };
    M.responder(e, C, P, atual, q.correta); atual = M.aplicarResultado(atual, e);
  }
  assert.equal(JSON.stringify(ap), copia);
  assert.ok(atual.nos[q.no].m <= 4 && atual.nos[q.no].m >= 0);
});
test('normalizarAprendizado descarta lixo', () => {
  const n = M.normalizarAprendizado({ nos: { N01: { m: 99, v: -3, a: 'x' }, FOO: { m: 1 } }, perguntas: { 'N01-1': 2, XX: 1 }, fichas: { N01: true, ZZ: true, N02: 1 } }, C, P);
  assert.deepEqual(Object.keys(n.nos), ['N01']); assert.equal(n.nos.N01.m, 4); assert.equal(n.nos.N01.v, 0);
  assert.deepEqual(Object.keys(n.perguntas), ['N01-1']); assert.deepEqual(Object.keys(n.fichas), ['N01']);
  assert.deepEqual(M.normalizarAprendizado('lixo', C, P), M.aprendizadoVazio());
});

test('aproveitamento: perfeito = 100; caçador perfeito com todas erradas = 75; desligado teto 75; pular = 0', () => {
  const base = { precisao: 1, tempo: 100, meta: 240 };
  assert.equal(A.aproveitamento({ ...base, creditos: [1, 1, 1], cofre: [1, 1] }).total, 100);
  assert.equal(A.aproveitamento({ ...base, creditos: [0, 0, 0], cofre: [0, 0] }).total, 75);
  assert.equal(A.aproveitamento({ ...base, creditos: [], cofre: [], encontrosAtivos: false }).total, 75);
  assert.equal(A.aproveitamento({ ...base, creditos: [1, 1, 1], cofre: [1, 1], encontrosAtivos: false }).total, 75);
  assert.ok(Math.abs(A.aproveitamento({ ...base, creditos: [1, 1, 0] }).encontros - 15 * 2 / 3) < 1e-9);
  assert.ok(Math.abs(A.aproveitamento({ ...base, cofre: [1, 0] }).cofre - 5) < 1e-9);
  assert.equal(A.PESOS.fontes + A.PESOS.tempo + A.PESOS.encontros + A.PESOS.cofre, 100);
});
test('aproveitamento: lento e impreciso não chega a 75 mesmo acertando tudo; monotônico', () => {
  assert.ok(A.aproveitamento({ precisao: 0.5, tempo: 480, meta: 240, creditos: [1, 1, 1], cofre: [1] }).total < 75);
  const f = (p, t, c) => A.aproveitamento({ precisao: p, tempo: t, meta: 240, creditos: [c, c, c] }).total;
  assert.ok(f(1, 100, 1) >= f(0.8, 100, 1) && f(0.8, 100, 1) >= f(0.8, 300, 1) && f(0.8, 300, 1) >= f(0.8, 300, 0.5));
  assert.equal(A.aproveitamento({ precisao: NaN, tempo: 0, meta: 240, creditos: [] }).total, 0);
});

// ---- escala de confiança do Mito x Fato (14/10/2026) ----
const nova = (q) => ({ semente: 1, missao: 1, no: q.no, cadeia: [q], passo: 0, resultados: [], fim: null });
test('confiança: certeza certa = 1; quase certeza certa = 0,7; "não sei" = erro sem penalidade', () => {
  const ap = M.aprendizadoVazio();
  const q = P.find((x) => x.formato === 'mf');
  assert.equal(M.responder(nova(q), C, P, ap, q.correta).fim.credito, 1);
  assert.equal(M.responder(nova(q), C, P, ap, q.correta + '?').fim.credito, M.FATOR_QUASE);
  const e = nova(q); const r = M.responder(e, C, P, ap, 'naosei');
  assert.equal(r.acertou, false); assert.ok(r.proxima); assert.equal(e.fator, undefined);
  assert.equal(M.responder(e, C, P, ap, r.proxima.correta).fim.credito, M.CREDITOS[1]);
});
test('confiança: errar com certeza total reduz pela metade a chance seguinte; errar com "quase" não', () => {
  const ap = M.aprendizadoVazio();
  const q = P.find((x) => x.formato === 'mf' && x.nivel > 1) || P.find((x) => x.formato === 'mf');
  const e1 = nova(q); const r1 = M.responder(e1, C, P, ap, errada(q));
  if (r1.proxima) assert.equal(M.responder(e1, C, P, ap, r1.proxima.correta).fim.credito, M.CREDITOS[1] * M.FATOR_SUPERCONFIANCA * (r1.proxima.formato === 'mf' ? 1 : 1));
  const e2 = nova(q); const r2 = M.responder(e2, C, P, ap, errada(q) + '?');
  if (r2.proxima && r2.proxima.formato === 'mc') assert.equal(M.responder(e2, C, P, ap, r2.proxima.correta).fim.credito, M.CREDITOS[1]);
});
test('confiança: "naosei" nunca é correta e respostas só de mc ignoram sufixos', () => {
  const ap = M.aprendizadoVazio();
  for (const q of P.filter((x) => x.formato === 'mf')) assert.equal(M.responder(nova(q), C, P, ap, 'naosei').acertou, false);
  assert.deepEqual(M.interpretar({ formato: 'mc' }, 2), { valor: 2, confianca: null });
});

// (os testes do cofre de transporte, etapa 5e, estão em 11-cofre.test.mjs e 13-cofre-ui.test.mjs)
