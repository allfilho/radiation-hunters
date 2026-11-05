// Etapa 5e-D: fichas e textos do cofre (js/encontros/cofre-ficha.js, cofre-textos.js). Node puro, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const F = await imp('js/encontros/cofre-ficha.js');
const X = await imp('js/encontros/cofre-textos.js');
const K = await imp('js/encontros/cofre.js');
const G = await imp('js/fisica/geiger.js');
const { ISOTOPES } = await imp('js/data/isotopes.js');
const { MISSIONS } = await imp('js/data/missoes/index.js');
const { SHIELDS } = await imp('js/data/shields.js');

const RA = MISSIONS.find((m) => m.addIsotope).addIsotope;
const TODOS = [...ISOTOPES, RA];
const doMundo = (m) => TODOS.filter((i) => (m.allowedIsotopes || ISOTOPES.map((x) => x.name)).includes(i.name));

test('textos PT/EN: mesmas chaves, nenhuma vazia, mesmos marcadores {n}', () => {
  const pt = X.TEXTOS.pt, en = X.TEXTOS.en;
  assert.deepEqual(Object.keys(pt).sort(), Object.keys(en).sort());
  const marc = (s) => (s.match(/\{\d\}/g) || []).sort().join('');
  for (const k of Object.keys(pt)) {
    assert.ok(pt[k].trim() && en[k].trim(), k);
    assert.equal(marc(pt[k]), marc(en[k]), 'marcadores de ' + k);
  }
  assert.equal(X.tx('guardada', 'pt', 'Cs-137', 'Gama'), 'Cs-137 na prateleira Gama.');
  assert.equal(X.tx('guardada', 'en', 'Cs-137', 'Gamma'), 'Cs-137 on the Gamma shelf.');
  assert.doesNotMatch(X.tx('progresso', 'pt', 1, 4), /\{/);
});

test('ficha: todo isótopo do jogo em todas as missões, PT e EN, com nome, meia-vida, emissões e tabela do Geiger', () => {
  let n = 0;
  for (const m of MISSIONS) for (const iso of doMundo(m)) for (const lang of ['pt', 'en']) {
    const f = F.fichaDe(iso, m.id, lang, 2);
    n++;
    assert.ok(f.nomeCompleto && f.simbolo, iso.name);
    assert.ok(f.meiaVida.length > 3, `${iso.name} ${lang}`);
    assert.ok(f.emissoes.length >= 1, iso.name);
    assert.equal(f.prat, K.prateleiraDe(iso.name, undefined, iso.type));
    assert.ok(f.historia.length >= 1 && f.historia.every((h) => h.texto.length > 20 && ['fato', 'jogo'].includes(h.kind)), iso.name);
    assert.ok(f.geiger.linhas.length >= 1);
    assert.match(f.fonteDados, /LNHB/);
    const dec = f.emissoes.filter((e) => e.decide);
    assert.equal(dec.length, 1, iso.name);
    assert.equal(dec[0].tipo, f.prat);
    for (const e of f.emissoes) { assert.ok(e.barra > 0 && e.barra <= 100); assert.ok(e.energias.includes('keV')); }
  }
  assert.equal(n, 2 * MISSIONS.reduce((a, m) => a + doMundo(m).length, 0));
  assert.ok(n >= 30, 'n = ' + n);
});

test('ficha: tabela do Geiger usa o modelo do jogo (mesmas funções e espessuras) e alfa é só por contato', () => {
  const cs = F.fichaDe(ISOTOPES.find((i) => i.name === 'Cs-137'), 2, 'pt');
  const gama = cs.geiger.linhas.find((l) => l.tipo === 'gama'), beta = cs.geiger.linhas.find((l) => l.tipo === 'beta');
  assert.equal(cs.geiger.linhas[0].tipo, 'gama', 'componente primária primeiro');
  assert.equal(gama.valores[0], 1);
  SHIELDS.forEach((s, i) => {
    const esperado = G.transmissaoGama(s.material ? [{ material: s.material, cm: s.cm }] : [], 0.6617);
    assert.ok(Math.abs(gama.valores[i] - esperado) < 0.004, `${s.key} ${gama.valores[i]} x ${esperado}`);
  });
  assert.ok(gama.valores[3] > 0.2 && gama.valores[3] < 0.35, 'Pb 1 cm deixa ~28% da gama do Cs-137');
  assert.ok(gama.valores[1] > 0.9 && gama.valores[2] > 0.9, 'Al e acrílico quase não barram a gama');
  assert.deepEqual(beta.valores.slice(1), [0, 0, 0], 'a beta do Cs-137 some com 3 mm de Al');
  for (const nome of ['Am-241', 'U-238', 'Po-210']) {
    const l = F.fichaDe(ISOTOPES.find((i) => i.name === nome), 1, 'pt').geiger.linhas;
    assert.equal(l.length, 1); assert.equal(l[0].contato, true); assert.equal(l[0].valores, null);
  }
  const ra = F.fichaDe(RA, 3, 'pt').geiger.linhas;
  assert.equal(ra.length, 1); assert.equal(ra[0].contato, true);
  for (const iso of ISOTOPES) for (const l of F.fichaDe(iso, 1, 'pt').geiger.linhas) {
    if (!l.valores) continue;
    assert.equal(l.valores[0], 1);
    assert.ok(l.valores.every((v) => v >= 0 && v <= 1), iso.name + l.tipo);   // acrílico pode passar mais que Al: não é monotônico
  }
});

test('ficha: gama mostra a espessura de chumbo (feixe estreito); só a prateleira gama', () => {
  for (const nome of ['Cs-137', 'Co-60', 'I-131']) {
    const f = F.fichaDe(ISOTOPES.find((i) => i.name === nome), 1, 'pt');
    assert.ok(f.chumbo && f.chumbo.hvlCm > 0 && f.chumbo.milCm > f.chumbo.hvlCm, nome);
    assert.ok(Math.abs(f.chumbo.milCm / f.chumbo.hvlCm - Math.log2(1000)) < 0.01);
  }
  for (const nome of ['Am-241', 'Sr-90', 'P-32']) assert.equal(F.fichaDe(ISOTOPES.find((i) => i.name === nome), 1, 'pt').chumbo, null);
});

test('meia-vida legível: valores do isotopes.js (LNHB) em anos, dias e horas', () => {
  const ano = 365.2422 * 86400;
  assert.equal(F.meiaVidaTexto(30.018 * ano, 'pt'), '30,02 anos');
  assert.equal(F.meiaVidaTexto(30.018 * ano, 'en'), '30.02 years');
  assert.equal(F.meiaVidaTexto(8.0233 * 86400, 'pt'), '8,023 dias');
  assert.equal(F.meiaVidaTexto(6.0067 * 3600, 'en'), '6.007 hours');
  assert.equal(F.meiaVidaTexto(4.468e9 * ano, 'pt'), '4,468 bilhões de anos');
});

test('história: só há "fato" onde o registro tem o fato, e para um isótopo daquela missão', () => {
  const fatos = [];
  for (const m of MISSIONS) for (const iso of doMundo(m)) {
    const h = F.historiaDe(iso.name, m.id, 'pt');
    if (h.some((x) => x.kind === 'fato')) fatos.push(`${m.id}:${iso.name}`);
    else assert.equal(h.length, 1, 'sem fato conferido: uma linha "jogo"');
  }
  assert.deepEqual(fatos.sort(), ['2:Cs-137', '3:Ra-226', '4:Cs-137', '4:I-131', '4:Sr-90', '5:Sr-90', '7:Co-60', '8:Cs-137', '8:I-131'].sort());
  assert.equal(F.historiaDe('Cs-137', 5, 'pt')[0].kind, 'jogo');
  assert.equal(F.historiaDe('Am-241', 5, 'en')[0].kind, 'jogo');
});

test('história: números e datas dos fatos aparecem no registro docs/fatos-historicos-3e.md', (t) => {
  const doc = path.join(RAIZ, '..', 'docs', 'fatos-historicos-3e.md');
  if (!fs.existsSync(doc)) return t.skip('sem docs/ nesta cópia: copie docs/ para ao lado de current/ para conferir');   // aparece como "skipped" no relatório
  const txt = fs.readFileSync(doc, 'utf8');
  const pares = [[2, 'Cs-137'], [3, 'Ra-226'], [4, 'Cs-137'], [4, 'I-131'], [4, 'Sr-90'], [5, 'Sr-90'], [7, 'Co-60'], [8, 'Cs-137'], [8, 'I-131']];
  for (const [mis, nome] of pares) {
    const t = F.historiaDe(nome, mis, 'pt')[0].texto;
    for (const tok of t.match(/\d[\d.,/]*\d|\d{2,}/g) || []) assert.ok(txt.includes(tok), `${mis}:${nome} "${tok}" não está no registro`);
  }
});

test('ficha: nenhuma atividade em Bq por fonte', () => {
  for (const iso of ISOTOPES) assert.doesNotMatch(JSON.stringify(F.fichaDe(iso, 5, 'pt')), /\bBq\b|GBq|MBq/);
  assert.match(X.TEXTOS.pt.sinalValor, /sem Bq/);
});

test('coerência: o texto de blindagem da beta não afirma "barra" absoluto quando a placa fina do Geiger deixa passar parte (tabela da ficha)', () => {
  let verificados = 0;
  for (const iso of TODOS) {
    if (K.prateleiraDe(iso.name, undefined, iso.type) !== 'beta') continue;
    const beta = F.fichaDe(iso, 1, 'pt').geiger.linhas.find((l) => l.tipo === 'beta');
    const passaAl = beta.valores[SHIELDS.findIndex((s) => s.material === 'aluminio')], passaAcr = beta.valores[SHIELDS.findIndex((s) => s.material === 'acrilico')];
    if (passaAl > 0.05 || passaAcr > 0.05) {
      verificados++;
      for (const lang of ['pt', 'en']) for (const m of ['aluminio', 'acrilico']) assert.match(K.explicarBlindagem('beta', m, lang), /espessura suficiente|sufficient thickness/, `${iso.name} ${m} ${lang}`);
    }
  }
  assert.ok(verificados >= 1, 'o Sr-90 (alcance do Y-90) tem de cair neste caso');
});

test('explicação da prateleira: rendimento acima de 100 vira "fótons por decaimento", nunca "199,8 de cada 100 decaimentos"', () => {
  for (const nome of ['Co-60', 'Ir-192']) for (const lang of ['pt', 'en']) {
    const t = K.explicarPrateleira(nome, lang);
    assert.match(t, /fótons|photons/, nome);
    assert.doesNotMatch(t, /sai em|emits gamma radiation in/, nome);
  }
  assert.match(K.explicarPrateleira('Cs-137', 'pt'), /sai em 85/);
});

test('cabeçalhos da tabela do Geiger seguem as colunas do modelo (espessuras de shields.js)', () => {
  const f = F.fichaDe(ISOTOPES.find((i) => i.name === 'Cs-137'), 1, 'pt');
  assert.deepEqual(f.geiger.colunas.map((c) => c.cm), SHIELDS.map((s) => s.cm));
});
