// Modelo físico do Geiger (js/fisica/geiger.js): função pura, roda em Node, sem navegador.
// Cada teste cita a propriedade física que verifica. Projeto: docs/geiger-projeto-3a.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO } from './helpers/navegador.mjs';

const mod = (p) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', p)).href);
const G = await mod('fisica/geiger.js');
const { ISOTOPES } = await mod('data/isotopes.js');
const { SHIELDS } = await mod('data/shields.js');

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const perto = (o, e, tol, m) => assert.ok(Math.abs(o - e) <= tol, `${m}: obtido ${o}, esperado ${e} (+-${tol})`);
const rel = (o, e, tol, m) => assert.ok(Math.abs(o / e - 1) <= tol, `${m}: obtido ${o}, esperado ${e} (+-${tol * 100}%)`);

const livre = { tileM: 0.5, paredeCm: 30, ehParede: () => false, blindagem: null };
const fonte = (tipo, extra = {}) => {
  // Com `nome`, procura só pelo nome: o I-131 é gama (componente primária) mas tem alcance beta próprio, usado aqui como fonte beta pura.
  const iso = ISOTOPES.find((i) => extra.nome ? i.name === extra.nome : i.type === tipo);
  return { type: tipo, base: 400, x: 10, y: 10, rect: { x: 9.5, y: 9.5, w: 1, h: 1 }, found: false,
    energyMeV: iso.energyMeV, betaRangeMgCm2: iso.betaRangeMgCm2, ...extra };
};
const sondaA = (f, dTiles, dir = 0) => ({ x: f.x - dTiles * Math.cos(dir), y: f.y - dTiles * Math.sin(dir), dir });
const taxa = (f, d, ctx = livre, dir = 0) => G.taxaFonte(f, sondaA(f, d, dir), ctx);

test('μ/ρ: reproduz os pontos tabelados do NIST e interpola de forma monótona', () => {
  perto(G.muRho('chumbo', 0.5), 0.1614, 1e-12, 'Pb 0,5 MeV');
  perto(G.muRho('concreto', 1.0), 0.06495, 1e-12, 'concreto 1 MeV');
  const a = G.muRho('aluminio', 0.662);
  assert.ok(a < G.muRho('aluminio', 0.6) && a > G.muRho('aluminio', 0.8));
});

test('μ linear e camada semirredutora: Pb a 0,662 MeV ~5,5 mm; concreto ~3,8 cm (valores do projeto 3a)', () => {
  const hvl = (m, E) => Math.log(2) / G.muLinear(m, E);
  perto(hvl('chumbo', 0.6617) * 10, 5.5, 0.15, 'HVL Pb (mm)');
  perto(hvl('concreto', 0.6617), 3.83, 0.1, 'HVL concreto (cm)');
});

test('gama em campo livre cai como 1/d² (inclinação -2 em log-log, ±0,06 por causa da atenuação no ar)', () => {
  const f = fonte('gama', { nome: 'Cs-137' });
  const d = [4, 6, 8, 12, 16]; // tiles = 2 a 8 m, acima da distância mínima
  const lx = d.map(Math.log), ly = d.map((x) => Math.log(taxa(f, x)));
  const n = d.length, mx = lx.reduce((a, b) => a + b) / n, my = ly.reduce((a, b) => a + b) / n;
  const incl = lx.reduce((s, x, i) => s + (x - mx) * (ly[i] - my), 0) / lx.reduce((s, x) => s + (x - mx) ** 2, 0);
  perto(incl, -2, 0.06, 'inclinação'); // o ar (μ~1e-4/cm) adiciona ~-0,04 entre 2 e 8 m, por isso a tolerância
});

test('gama a 1 m vale S = fator × base (referência), a menos do ar', () => {
  const f = fonte('gama', { nome: 'Cs-137', base: 500 });
  rel(taxa(f, 2), 0.3 * 500, 0.015, 'taxa a 1 m (2 tiles); o ar atenua ~1% em 1 m');
});

test('distância mínima: a taxa satura a 0,25 m em vez de divergir', () => {
  const f = fonte('gama', { nome: 'Cs-137' });
  assert.equal(taxa(f, 0.1), taxa(f, 0.5));
  assert.ok(Number.isFinite(taxa(f, 0)));
});

test('blindagem gama: Pb de 1 cm transmite exp(-μx) para Cs-137, Co-60, Ir-192 e Tc-99m', () => {
  for (const nome of ['Cs-137', 'Co-60', 'Ir-192', 'Tc-99m']) {
    const f = fonte('gama', { nome });
    const sem = taxa(f, 4), com = taxa(f, 4, { ...livre, blindagem: { material: 'chumbo', cm: 1.0 } });
    rel(com / sem, Math.exp(-G.muLinear('chumbo', f.energyMeV) * 1.0), 1e-9, `transmissão Pb 1 cm, ${nome}`);
  }
  // ordem física esperada: quanto menor a energia, mais o chumbo atenua
  const t = (n) => { const f = fonte('gama', { nome: n }); return taxa(f, 4, { ...livre, blindagem: { material: 'chumbo', cm: 1 } }) / taxa(f, 4); };
  assert.ok(t('Tc-99m') < t('Ir-192') && t('Ir-192') < t('Cs-137') && t('Cs-137') < t('Co-60'));
});

test('blindagem gama: alumínio de 3 mm e acrílico de 5 mm mudam o gama menos de 8% (Cs-137, Co-60, Ir-192)', () => {
  for (const key of ['alu', 'acr']) {
    const sh = SHIELDS.find((s) => s.key === key);
    for (const nome of ['Cs-137', 'Co-60', 'Ir-192']) {
      const f = fonte('gama', { nome });
      const r = taxa(f, 4, { ...livre, blindagem: sh }) / taxa(f, 4);
      assert.ok(r > 0.92, `${key} ${nome}: ${r}`);
    }
  }
});

test('parede: 1 tile (30 cm de concreto) atenua o Cs-137 em exp(-μ·30) e bloqueia beta e alfa', () => {
  const parede = (x) => x === 9; // coluna de parede entre a sonda e a fonte (fonte em x=10)
  const ctx = { ...livre, ehParede: parede };
  const g = fonte('gama', { nome: 'Cs-137' });
  rel(taxa(g, 6, ctx) / taxa(g, 6), Math.exp(-G.muLinear('concreto', 0.6617) * 30), 1e-9, 'gama atrás da parede');
  assert.ok(taxa(g, 6, ctx) / taxa(g, 6) < 0.01);
  assert.equal(taxa(fonte('beta', { nome: 'P-32' }), 2, ctx), 0);
  assert.equal(taxa(fonte('alfa'), 0.5, ctx), 0);
});

test('beta: corte no alcance do ar (I-131 ~1,8 m) e ordem dos alcances Sr-90/Y-90 > P-32 > I-131', () => {
  const f = fonte('beta', { nome: 'I-131' });
  assert.ok(taxa(f, 3) > 0, 'a 1,5 m ainda chega');
  assert.equal(taxa(f, 4), 0, 'a 2,0 m já passou do alcance (1,78 m)');
  const limite = (nome) => { const b = fonte('beta', { nome }); let d = 1; while (taxa(b, d) > 0 && d < 100) d += 0.05; return d * 0.5; };
  const [p, s, i] = ['P-32', 'Sr-90', 'I-131'].map(limite);
  assert.ok(s > p && p > i, `alcances em m: P-32 ${p}, Sr-90 ${s}, I-131 ${i}`);
  perto(p, 6.56, 0.1, 'alcance P-32 no ar (m)');
  perto(limite('I-131'), 1.78, 0.06, 'alcance I-131 no ar (m)');
});

test('beta: alumínio de 3 mm bloqueia P-32, I-131; acrílico de 5 mm bloqueia I-131 e Sr-90; chumbo bloqueia todos', () => {
  const com = (nome, key) => taxa(fonte('beta', { nome }), 1, { ...livre, blindagem: SHIELDS.find((s) => s.key === key) });
  assert.equal(com('P-32', 'alu'), 0); assert.equal(com('I-131', 'alu'), 0);
  assert.equal(com('I-131', 'acr'), 0);
  assert.ok(com('Sr-90', 'acr') < taxa(fonte('beta', { nome: 'Sr-90' }), 1) * 0.6, 'acrílico reduz bem o Sr-90/Y-90');
  for (const nome of ['P-32', 'Sr-90', 'I-131']) assert.equal(com(nome, 'pb'), 0, 'Pb ' + nome);
});

test('alfa: só por contato (superfície <= 1 tile), cai linearmente, qualquer blindagem zera', () => {
  const f = fonte('alfa'); // retângulo 1x1 centrado na fonte: superfície a 0,5 tile do centro
  const sonda = (dx) => ({ x: f.x - 0.5 - dx, y: f.y, dir: 0 });
  const t = (dx, ctx = livre) => G.taxaFonte(f, sonda(dx), ctx);
  rel(t(0), f.base, 1e-9, 'em contato');
  rel(t(0.5), f.base * 0.5, 1e-9, 'a meio tile da superfície');
  assert.equal(t(1.0), 0); assert.equal(t(2), 0);
  for (const sh of SHIELDS.slice(1)) assert.equal(t(0.2, { ...livre, blindagem: sh }), 0, sh.key);
});

test('cone: beta e alfa só dentro de ±45°; gama fora do cone cai para 30% (piso)', () => {
  const g = fonte('gama', { nome: 'Cs-137' }), b = fonte('beta', { nome: 'P-32' });
  const costas = G.taxaFonte(g, { x: g.x - 4, y: g.y, dir: Math.PI }, livre);
  rel(costas / taxa(g, 4, livre, 0), 0.3, 1e-9, 'gama de costas');
  const com = (desvio) => G.taxaFonte(b, { x: b.x - 2, y: b.y, dir: desvio }, livre);
  assert.equal(com(Math.PI / 2), 0);
  assert.ok(com(Math.PI / 6) > 0);
  rel(com(Math.PI / 6) / com(0), Math.cos(Math.PI / 6) ** 2, 1e-9, 'cos² do desvio');
});

test('contagem é Poisson: índice de dispersão (variância/média) ~1 de λ=3 a λ=1000, e a média confere', () => {
  const r = rng(12345);
  for (const lam of [0.5, 3, 12, 40, 100, 1000]) {
    const N = 20000, a = Array.from({ length: N }, () => G.poisson(lam, r));
    const m = a.reduce((x, y) => x + y) / N, v = a.reduce((x, y) => x + (y - m) ** 2, 0) / N;
    perto(m, lam, 5 * Math.sqrt(lam / N) + 0.02, `média λ=${lam}`);
    perto(v / m, 1, 0.08 + (lam > 40 ? 0.03 : 0), `dispersão λ=${lam}`);
  }
});

test('taxa total: fundo + soma das fontes não achadas (fontes achadas somem)', () => {
  const a = fonte('gama', { nome: 'Cs-137', x: 10 }), b = fonte('gama', { nome: 'Co-60', x: 20, rect: { x: 19.5, y: 9.5, w: 1, h: 1 } });
  const s = { x: 14, y: 10, dir: 0 };
  const tot = G.taxaEsperada([a, b], s, livre);
  rel(tot, 5 + G.taxaFonte(a, s, livre) + G.taxaFonte(b, s, livre), 1e-12, 'soma');
  a.found = true;
  rel(G.taxaEsperada([a, b], s, livre), 5 + G.taxaFonte(b, s, livre), 1e-12, 'sem a fonte achada');
});

test('janela de contagem: média de 3 s, incerteza √N/T; descarta amostras antigas', () => {
  const j = new G.JanelaDeContagem(3);
  for (let i = 0; i < 40; i++) j.adicionar(i < 20 ? 100 : 2, 0.2);
  perto(j.tempo, 3, 0.2, 'tempo da janela'); // a janela fica entre 2,8 e 3,0 s
  perto(j.cps, 10, 1e-9, 'cps depois de 20 amostras baixas');
  perto(j.incerteza, Math.sqrt(j.contagens) / j.tempo, 1e-12, 'incerteza');
});

test('atividade constante: perda em 6 min < 1,2% (Tc-99m) e < 0,04% para os demais; em 1 h o Tc-99m perde ~11%', () => {
  for (const i of ISOTOPES) {
    assert.equal(typeof i.halfLifeS, 'number', i.name);
    const perda = G.perdaDeAtividade(360, i.halfLifeS);
    assert.ok(perda < (i.name === 'Tc-99m' ? 0.012 : 0.0004), `${i.name}: ${perda}`);
  }
  perto(G.perdaDeAtividade(3600, ISOTOPES.find((i) => i.name === 'Tc-99m').halfLifeS), 0.109, 0.002, 'Tc-99m em 1 h');
});

test('meias-vidas conferem com a tabela LNHB do projeto 3a (anos/dias/horas)', () => {
  const T = Object.fromEntries(ISOTOPES.map((i) => [i.name, i.halfLifeS]));
  const ANO = 365.2422 * 86400;
  rel(T['Cs-137'], 30.018 * ANO, 1e-9, 'Cs-137'); rel(T['Co-60'], 5.2711 * ANO, 1e-9, 'Co-60');
  rel(T['I-131'], 8.0233 * 86400, 1e-9, 'I-131'); rel(T['Tc-99m'], 6.0067 * 3600, 1e-9, 'Tc-99m');
});
