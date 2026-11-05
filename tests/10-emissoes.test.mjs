// Etapa 5e-B: tabela de emissões (js/data/emissoes.js). Node puro, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const E = await imp('js/data/emissoes.js');
const { ISOTOPES } = await imp('js/data/isotopes.js');
const { MISSIONS } = await imp('js/data/missoes/index.js');

const extras = MISSIONS.map((m) => m.addIsotope).filter(Boolean);
const todos = [...ISOTOPES, ...extras];
const kp = (MeV) => 412 * MeV ** (1.265 - 0.0954 * Math.log(MeV));   // Katz-Penfold (1952), mg/cm²

test('emissões: todo isótopo do jogo (isotopes.js e addIsotope das missões) tem entrada com fonte e status V', () => {
  for (const i of todos) {
    const e = E.EMISSOES[i.name];
    assert.ok(e, i.name);
    assert.match(e.fonte, /LNHB/, i.name);
    assert.equal(e.status, 'V', i.name);
    assert.ok(e.linhas.length > 0, i.name);
  }
});

test('emissões: linhas válidas (tipo conhecido, energia > 0, 0 < rendimento ≤ 100)', () => {
  for (const [n, e] of Object.entries(E.EMISSOES)) {
    for (const l of [...e.linhas, ...(e.filho ? e.filho.linhas : [])]) {
      assert.ok(E.TIPOS.includes(l.tipo), n);
      assert.ok(l.keV > 0, n);
      assert.ok(l.y > 0 && l.y <= 100, `${n} ${l.keV}`);
    }
  }
});

test('emissões: cada decaimento emite no máximo uma alfa ou uma beta (soma alfa + beta ≤ 100,05)', () => {
  for (const n of Object.keys(E.EMISSOES)) {
    const r = E.rendimentoPorTipo(n);
    assert.ok(r.alfa + r.beta <= 100.05, `${n}: ${r.alfa + r.beta}`);
  }
});

test('emissões: energias batem com isotopes.js (alfa e gama até 3%; Co-60 e Ir-192 pela média ponderada das gamas)', () => {
  const media = (n) => { const ls = E.EMISSOES[n].linhas.filter((l) => l.tipo === 'gama'); return ls.reduce((s, l) => s + l.keV * l.y, 0) / ls.reduce((s, l) => s + l.y, 0) / 1000; };
  for (const i of todos) {
    if (i.type === 'beta' || !i.energyMeV) continue;
    const ref = ['Co-60', 'Ir-192'].includes(i.name) ? media(i.name) : E.linhaPrincipal(i.name, i.type).keV / 1000;
    assert.ok(Math.abs(ref - i.energyMeV) / i.energyMeV < 0.03, `${i.name}: ${ref} x ${i.energyMeV}`);
  }
});

test('emissões: alcance beta de isotopes.js = Katz-Penfold na Emax do ramo principal (Sr-90 pelo filho Y-90), até 2%', () => {
  for (const i of ISOTOPES.filter((x) => x.type === 'beta')) {
    const e = E.EMISSOES[i.name];
    const Emax = (i.name === 'Sr-90' ? e.filho.linhas[0] : E.linhaPrincipal(i.name, 'beta')).keV / 1000;
    assert.ok(Math.abs(kp(Emax) - i.betaRangeMgCm2) / i.betaRangeMgCm2 < 0.02, `${i.name}: ${kp(Emax)} x ${i.betaRangeMgCm2}`);
  }
});

test('emissões: rendimentos por tipo que decidem as prateleiras (valores do LNHB)', () => {
  const r = (n) => E.rendimentoPorTipo(n);
  assert.ok(Math.abs(r('Am-241').gama - 35.92) < 1e-9);
  assert.ok(Math.abs(r('I-131').gama - 98.86) < 0.01);       // 81,2 da linha principal + linhas menores
  assert.ok(Math.abs(r('Cs-137').gama - 85.01) < 1e-9);
  assert.ok(r('Ra-226').gama < 4 && r('Po-210').gama < 0.01 && r('U-238').gama === 0);
  assert.equal(r('Sr-90').gama, 0); assert.equal(r('P-32').gama, 0);
  assert.equal(E.linhaPrincipal('I-131', 'gama').keV, 364.489);
});

test('documentação: cada isótopo de emissoes.js aparece no registro de fontes (V5D3.8 ou V5E.1)', (t) => {
  if (!fs.existsSync(path.join(RAIZ, '..', 'docs', 'referencias-5c', 'busca', 'agente-D-5d3.md'))) return t.skip('sem docs/referencias-5c nesta cópia');
  const txt = fs.readFileSync(path.join(RAIZ, '..', 'docs', 'referencias-5c', 'busca', 'agente-D-5d3.md'), 'utf8');
  assert.match(txt, /### V5E\.1/);
  for (const n of Object.keys(E.EMISSOES)) assert.ok(txt.includes('**' + n), n);
});
