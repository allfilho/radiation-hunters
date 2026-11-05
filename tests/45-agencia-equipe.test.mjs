// Agência: equipe, dose por janelas (1/7/30 dias), vida, tratamento e retorno. Lógica pura.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('equipe inicial tem 4 cientistas com vida 100', async () => {
  const E = await mod('agencia/equipe.js'), eq = E.equipeInicial();
  assert.equal(eq.length, 4);
  for (const m of eq) { assert.equal(E.vida(m, 1), 100); assert.ok(E.disponivel(m, 1)); }
});

test('2 mSv em um dia passa de 1,5: tratamento; no dia seguinte a razão cai e ele volta só abaixo de 75 %', async () => {
  const E = await mod('agencia/equipe.js'), m = E.novoCientista('x', 'X', 'lara');
  const r = E.registrarDose(m, 10, 2);
  assert.equal(r.tratamento, true); assert.equal(m.tratamento, true);
  assert.equal(E.vida(m, 10), 0);
  // dia 11: janela de 1 dia já não conta; semana: 2/5=0,4; mês 2/15=0,133
  assert.ok(E.razao(m, 11) < 0.75);
  assert.equal(E.diasParaVoltar(m, 10), 1);
  assert.equal(E.verificarRetorno(m, 10), false);
  assert.equal(E.verificarRetorno(m, 11), true);
  assert.equal(m.tratamento, false);
});

test('doses repetidas: a janela semanal (5 mSv) manda e o retorno demora', async () => {
  const E = await mod('agencia/equipe.js'), m = E.novoCientista('x', 'X', 'lara');
  for (let d = 1; d <= 4; d++) E.registrarDose(m, d, 1.4);   // 5,6 mSv em 4 dias: semana estoura
  assert.equal(m.tratamento, true);
  assert.equal(E.janelaMaisRestritiva(m, 4).id, 'semana');
  const n = E.diasParaVoltar(m, 4);
  assert.ok(n >= 3 && n <= 7, 'volta quando as doses saem da semana: ' + n);
  assert.equal(E.corCaneta(E.razao(m, 4)), 'vermelho');
});

test('cores da caneta e distribuição líder/apoio', async () => {
  const E = await mod('agencia/equipe.js');
  assert.equal(E.corCaneta(0.1), 'verde'); assert.equal(E.corCaneta(0.5), 'amarelo'); assert.equal(E.corCaneta(0.75), 'vermelho');
  const eq = E.equipeInicial();
  const s = E.distribuirDoseMissao(eq, ['c1', 'c2'], 'c1', 1, 5);
  assert.equal(s[0].msv, 1); assert.equal(s[1].msv, 0.4);
});

test('saneaEquipe aceita lixo', async () => {
  const E = await mod('agencia/equipe.js');
  assert.equal(E.saneaEquipe(null).length, 4);
  const l = E.saneaEquipe([{ id: 'a', nome: 'Z', retrato: 'xx', doses: [{ dia: 'q', msv: 1 }, { dia: 3, msv: 2 }], tratamento: 'sim' }, { id: 'a', nome: 'dup' }, 7]);
  assert.equal(l.length, 1); assert.equal(l[0].retrato, 'lara'); assert.equal(l[0].doses.length, 1); assert.equal(l[0].tratamento, false);
});
