// Etapa 5e-F: Geiger com componentes (beta + gama). Node puro, sem navegador.
// Parte 1: o modelo (componentes.js + taxaFonte). Parte 2: jogabilidade, ou seja, nenhuma fonte impossível de identificar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const G = await imp('js/fisica/geiger.js');
const C = await imp('js/fisica/componentes.js');
const E = await imp('js/data/emissoes.js');
const K = await imp('js/encontros/cofre.js');
const { ISOTOPES } = await imp('js/data/isotopes.js');
const { SHIELDS } = await imp('js/data/shields.js');
const { MISSIONS } = await imp('js/data/missoes/index.js');

const near = (a, b, tol, m = '') => assert.ok(Math.abs(a - b) <= tol, `${m} ${a} x ${b} (±${tol})`);
const BG = G.PARAMETROS.fundoCps;
const livre = { tileM: 0.5, paredeCm: 30, ehParede: () => false };
const todos = [...ISOTOPES, ...MISSIONS.map((m) => m.addIsotope).filter(Boolean)];
const iso = (n) => todos.find((i) => i.name === n);
const fonte = (nome, { base, comps = true } = {}) => {
  const i = iso(nome);
  return { type: i.type, base: base ?? i.minBase, x: 10, y: 10, rect: { x: 9.5, y: 9.5, w: 1, h: 1 }, found: false,
    energyMeV: i.energyMeV, betaRangeMgCm2: i.betaRangeMgCm2, ...(comps ? { componentes: C.componentesDe(i) } : {}) };
};
const sonda = (d, dir = 0) => ({ x: 10 - d * Math.cos(dir), y: 10 - d * Math.sin(dir), dir });
const taxa = (f, d, shield = 0, dir = 0) => { const s = SHIELDS[shield]; return G.taxaFonte(f, sonda(d, dir), { ...livre, blindagem: s.material ? s : null }); };

// =========================== modelo ===========================
test('componentes: tipos e pesos de cada isótopo (rendimento do tipo ÷ rendimento do tipo primário; limiar 50)', () => {
  const tipos = (n) => C.componentesDe(iso(n)).map((c) => c.tipo).join('+');
  for (const [n, t] of Object.entries({ 'Am-241': 'alfa', 'Ra-226': 'alfa', 'Po-210': 'alfa', 'U-238': 'alfa', 'Sr-90': 'beta', 'P-32': 'beta',
    'I-131': 'gama+beta', 'Cs-137': 'gama+beta', 'Co-60': 'gama+beta', 'Ir-192': 'gama+beta', 'Tc-99m': 'gama' })) assert.equal(tipos(n), t, n);
  const peso = (n, tipo) => C.componentesDe(iso(n)).find((c) => c.tipo === tipo).peso;
  near(peso('Cs-137', 'beta'), 100 / 85.01, 1e-3, 'Cs-137 beta'); near(peso('Co-60', 'beta'), 100 / 199.8326, 1e-3, 'Co-60 beta');
  near(peso('I-131', 'beta'), 98.73 / 98.8589, 2e-3, 'I-131 beta'); assert.equal(peso('Cs-137', 'gama'), 1);
});

test('componentes: a primária é idêntica ao que isotopes.js já tinha; as secundárias vêm de emissoes.js (Katz-Penfold e energia efetiva)', () => {
  for (const i of todos) {
    const [p, ...sec] = C.componentesDe(i);
    assert.deepEqual([p.tipo, p.peso, p.energyMeV, p.betaRangeMgCm2], [i.type, 1, i.energyMeV, i.betaRangeMgCm2], i.name);
    for (const c of sec) {
      if (c.tipo === 'beta') near(c.betaRangeMgCm2, E.alcanceBetaKP(E.emaxBetaPrincipal(i.name)), 1e-9, i.name);
      if (c.tipo === 'gama') near(c.energyMeV, E.energiaGamaEfetiva(i.name), 1e-9, i.name);
    }
  }
  near(C.componentesDe(iso('Cs-137'))[1].betaRangeMgCm2, 170, 1.5, 'beta do Cs-137 (mg/cm²)');
  near(C.componentesDe(iso('Co-60'))[1].betaRangeMgCm2, 85, 1.5, 'beta do Co-60');
  near(C.componentesDe(iso('I-131'))[0].energyMeV, 0.3645, 1e-4, 'gama do I-131 (primária)');
  near(C.componentesDe(iso('I-131'))[1].betaRangeMgCm2, 214, 1.5, 'beta do I-131 (secundária, Katz-Penfold)');
});

test('coerência com o cofre: a prateleira é o tipo mais penetrante entre as componentes do Geiger (mesmo limiar)', () => {
  assert.equal(C.LIMIAR_COMPONENTE, K.LIMIAR);
  for (const i of todos) {
    const mais = C.componentesDe(i).map((c) => c.tipo).sort((a, b) => E.PENETRACAO[b] - E.PENETRACAO[a])[0];
    assert.equal(mais, K.prateleiraDe(i.name, K.LIMIAR, i.type), i.name);
  }
});

test('compatibilidade: sem `componentes` o resultado é o de antes; com uma componente só, idêntico', () => {
  for (const n of ['Am-241', 'Sr-90', 'Tc-99m', 'U-238']) for (const d of [0.7, 1, 2, 5]) for (const s of [0, 1, 3]) {
    assert.equal(taxa(fonte(n), d, s), taxa(fonte(n, { comps: false }), d, s), `${n} d=${d} escudo ${s}`);
  }
});

test('componentes só somam: a taxa nunca fica menor que a da primária sozinha (nenhuma fonte fica mais difícil de achar)', () => {
  for (const n of ['I-131', 'Cs-137', 'Co-60', 'Ir-192']) for (const d of [0.5, 1, 1.5, 2, 4, 8, 16]) for (const s of [0, 1, 2, 3]) for (const dir of [0, 1, 2.5, 4]) {
    const com = taxa(fonte(n), d, s, dir), so = taxa(fonte(n, { comps: false }), d, s, dir);
    assert.ok(com >= so - 1e-12, `${n} d=${d} s=${s}`);
  }
});

test('Cs-137: beta some com 3 mm de alumínio e além do alcance no ar (~1,4 m); a gama fica igual à de antes', () => {
  const f = fonte('Cs-137'), antes = fonte('Cs-137', { comps: false });
  assert.ok(taxa(f, 2) > 1.25 * taxa(antes, 2), 'a 1 m a beta soma bastante');
  near(taxa(f, 3), taxa(antes, 3), 1e-9, 'a 1,5 m só a gama');
  near(taxa(f, 2, 1), taxa(antes, 2, 1), 1e-9, 'a 1 m com alumínio só a gama');
  near(taxa(f, 2, 2), taxa(antes, 2, 2), 1e-9, 'com acrílico só a gama');
});

test('I-131: com alumínio ou acrílico sobra a gama (92% a 94% no ar livre) e com 1 cm de chumbo quase nada (~4%)', () => {
  const f = fonte('I-131');
  for (const s of [1, 2]) { const r = taxa(f, 4, s) / taxa(f, 4, 0); assert.ok(r > 0.9 && r < 0.96, `escudo ${s}: ${r}`); }
  const pb = taxa(f, 4, 3) / taxa(f, 4, 0); assert.ok(pb > 0.02 && pb < 0.06, `chumbo ${pb}`);
});

test('Sr-90 e Am-241 não mudam: beta pura e alfa pura; qualquer escudo zera o alfa, o chumbo zera o beta', () => {
  assert.equal(C.componentesDe(iso('Sr-90')).length, 1); assert.equal(C.componentesDe(iso('Am-241')).length, 1);
  for (const s of [1, 2, 3]) assert.equal(taxa(fonte('Am-241'), 1, s), 0);
  assert.equal(taxa(fonte('Sr-90'), 2, 3), 0);
});

test('texto das emissões (ficha de identificação) em PT e EN', () => {
  assert.equal(C.descreverEmissoes(iso('Cs-137'), 'pt'), 'γ (661,7 keV; 85 em 100) + β (até 514 keV; 100 em 100)');
  assert.equal(C.descreverEmissoes(iso('I-131'), 'en'), 'γ (364.5 keV; 98.9 per 100) + β (up to 606.3 keV; 98.7 per 100)');
  assert.match(C.descreverEmissoes(iso('Co-60'), 'pt'), /γ \(1173,2 e 1332,5 keV; 199,8 em 100\)/);
  assert.equal(C.descreverEmissoes(iso('Am-241'), 'pt'), 'α (5442,9 e 5485,6 keV; 99,3 em 100)');
  assert.equal(C.nomesDasComponentes(iso('I-131'), 'pt'), 'gama e beta'); assert.equal(C.nomesDasComponentes(iso('Cs-137'), 'en'), 'gamma and beta');
  assert.equal(C.descreverEmissoes({ name: 'X-1', type: 'alfa' }, 'pt'), '');
});

// =========================== jogabilidade ===========================
// Protocolo: sonda de frente para a fonte, base MÍNIMA do isótopo (o pior caso), janela de 3 s do painel, fundo de 5 cps.
// z = contagens do sinal ÷ √(contagens do fundo): quantos desvios-padrão o excesso fica acima do fundo.
const z = (sinalCps, T = 3) => sinalCps * T / Math.sqrt(BG * T);
const soComponente = (nome, c) => ({ ...fonte(nome), componentes: [c] });
const nomesDaMissao = (m) => (m.allowedIsotopes || ISOTOPES.map((i) => i.name)).concat(m.addIsotope ? [m.addIsotope.name] : []);
const DIST_IDENT = 1.5;   // tiles do centro: a identificação exige a superfície do móvel a até 1 tile

test('jogabilidade 1a: toda componente de toda fonte das missões passa de 5σ sobre o fundo encostando no móvel (centro a 1 tile = 0,5 m; 3 s; base mínima)', () => {
  for (const m of MISSIONS) for (const n of nomesDaMissao(m)) for (const c of C.componentesDe(iso(n))) {
    const s = taxa(soComponente(n, c), 1, 0);
    assert.ok(z(s) >= 5, `missão ${m.id} ${n} ${c.tipo}: sinal ${s.toFixed(1)} cps, z=${z(s).toFixed(1)}`);
  }
});

test('jogabilidade 1b: na distância de identificação (centro a 1,5 tile) a componente primária de cada fonte, exceto o alfa, passa de 5σ; o alfa só por contato (projeto D1)', () => {
  for (const m of MISSIONS) for (const n of nomesDaMissao(m)) {
    const [p, ...sec] = C.componentesDe(iso(n));
    if (p.tipo === 'alfa') continue;
    const s = taxa(soComponente(n, p), DIST_IDENT, 0);
    assert.ok(z(s) >= 5, `missão ${m.id} ${n} ${p.tipo}: z=${z(s).toFixed(1)}`);
    // a beta de baixa energia do Co-60 (alcance ~0,7 m no ar) não chega aí: é esperado e a gama garante a detecção
    for (const c of sec) if (c.tipo === 'beta' && n === 'Co-60') assert.equal(taxa(soComponente(n, c), DIST_IDENT, 0), 0);
  }
});

test('jogabilidade 2: a gama de I-131, Cs-137 e Co-60 atravessa 3 mm de alumínio e 5 mm de acrílico e continua acima de 5σ a 1 m', () => {
  for (const n of ['I-131', 'Cs-137', 'Co-60']) for (const s of [1, 2]) {
    const g = C.componentesDe(iso(n)).find((c) => c.tipo === 'gama');
    assert.ok(z(taxa(soComponente(n, g), 2, s)) >= 5, `${n} escudo ${s}`);
  }
});

test('jogabilidade 3: em cada missão, todo par de isótopos se distingue por pelo menos uma blindagem (razão com/sem escudo, 10 s por medida, 3σ)', () => {
  const T = 10, D = 1;   // sonda a 1 tile (0,5 m): o alfa só existe por contato
  const medir = (n) => {
    const f = fonte(n), s0 = taxa(f, D, 0);
    return [1, 2, 3].map((e) => {
      const se = taxa(f, D, e), r = se / s0;
      const var0 = (s0 + BG) / T, vare = (se + BG) / T;                 // variâncias de taxa (cps²) de cada medida
      return { r, sigma: Math.sqrt((vare + r * r * var0) / (s0 * s0)) };
    });
  };
  const tabela = [];
  for (const m of MISSIONS) {
    const ns = [...new Set(nomesDaMissao(m))];
    for (let a = 0; a < ns.length; a++) for (let b = a + 1; b < ns.length; b++) {
      const A = medir(ns[a]), B = medir(ns[b]);
      const melhor = A.map((x, i) => ({ esc: SHIELDS[i + 1].key, dif: Math.abs(x.r - B[i].r), sig: Math.hypot(x.sigma, B[i].sigma) }))
        .sort((p, q) => q.dif / q.sig - p.dif / p.sig)[0];
      tabela.push(`M${m.id} ${ns[a]} x ${ns[b]}: ${melhor.esc} Δ=${melhor.dif.toFixed(2)} (${(melhor.dif / melhor.sig).toFixed(0)}σ)`);
      assert.ok(melhor.dif >= 0.1 && melhor.dif >= 3 * melhor.sig, `missão ${m.id}: ${ns[a]} x ${ns[b]} → ${JSON.stringify(melhor)}`);
    }
  }
  console.log(tabela.join('\n'));
});

test('jogabilidade 4: os três isótopos de Chernobyl e Fukushima têm assinaturas diferentes com alumínio e chumbo (a 1 m)', () => {
  const r = (n, s) => taxa(fonte(n), 2, s) / taxa(fonte(n), 2, 0);
  assert.ok(r('Sr-90', 1) < 0.3 && r('Sr-90', 3) === 0);                 // beta: o alumínio já corta, o chumbo zera
  assert.ok(r('I-131', 1) > 0.5 && r('I-131', 3) < 0.1);                 // gama de energia média: passa pelo alumínio, o chumbo derruba
  assert.ok(r('Cs-137', 1) > 0.5 && r('Cs-137', 3) > 0.15 && r('Cs-137', 3) < 0.4);   // gama mais dura: o chumbo reduz menos
});
