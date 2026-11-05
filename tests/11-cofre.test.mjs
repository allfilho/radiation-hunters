// Etapa 5e-C: lógica pura do cofre (js/encontros/cofre.js). Node puro, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const K = await imp('js/encontros/cofre.js');
const E = await imp('js/data/emissoes.js');
const M = await imp('js/encontros/motor.js');
const A = await imp('js/encontros/aproveitamento.js');
const G = await imp('js/fisica/geiger.js');
const { SHIELDS } = await imp('js/data/shields.js');
const { ISOTOPES } = await imp('js/data/isotopes.js');
const { MISSIONS } = await imp('js/data/missoes/index.js');
const { CONCEITOS } = await imp('js/data/encontros/conceitos.js');

const ESPERADO = {
  'U-238': 'alfa', 'Am-241': 'alfa', 'Po-210': 'alfa', 'Ra-226': 'alfa',
  'Sr-90': 'beta', 'P-32': 'beta',
  'I-131': 'gama', 'Tc-99m': 'gama', 'Cs-137': 'gama', 'Ir-192': 'gama', 'Co-60': 'gama',
};
const fontes = (...nomes) => nomes.map((n) => ({ name: n, type: 'x' }));
const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} x ${b} (±${tol})`);

// ---------- regra de prateleira ----------
test('prateleira: todos os isótopos do jogo caem onde o plano diz (Am-241 e Ra-226 em alfa; I-131 e Cs-137 em gama)', () => {
  for (const [n, p] of Object.entries(ESPERADO)) assert.equal(K.prateleiraDe(n), p, n);
  assert.deepEqual(Object.keys(ESPERADO).sort(), Object.keys(E.EMISSOES).sort());
});

test('prateleira: qualquer limiar de 36 a 85 dá o mesmo resultado; 35 move o Am-241 para gama (é ele que marca o limite)', () => {
  for (let L = 36; L <= 85; L++) for (const [n, p] of Object.entries(ESPERADO)) assert.equal(K.prateleiraDe(n, L), p, `${n} @${L}`);
  assert.equal(K.prateleiraDe('Am-241', 35), 'gama');
  assert.equal(K.prateleiraDe('Cs-137', 86), 'beta');
});

test('prateleira: nuclídeo sem entrada usa o tipo do jogo; sem nada, null', () => {
  assert.equal(K.prateleiraDe('X-1', 50, 'beta'), 'beta');
  assert.equal(K.prateleiraDe('X-1', 50, 'zzz'), null);
  assert.deepEqual(K.itensDaMissao([{ name: 'X-1', type: 'alfa' }, { name: 'Y-2', type: 'zzz' }]).map((i) => i.nome), ['X-1']);
});

test('missões: prateleiras possíveis por missão (conjunto dos isótopos permitidos) e interações mínimas ≤ 12', () => {
  const alvo = { 1: 'alfa,beta,gama', 2: 'gama', 3: 'alfa', 4: 'beta,gama', 5: 'alfa,beta,gama', 6: 'gama', 7: 'gama', 8: 'beta,gama' };
  for (const m of MISSIONS) {
    const nomes = m.allowedIsotopes || ISOTOPES.map((i) => i.name);
    for (const n of nomes) assert.ok(E.EMISSOES[n], `${m.id}: ${n} sem emissões`);
    const itens = K.itensDaMissao(fontes(...nomes));
    assert.equal(K.prateleirasUsadas(itens).join(','), alvo[m.id], `missão ${m.id}`);
    assert.ok(K.interacoesMinimas(itens) <= 12, `missão ${m.id}: ${K.interacoesMinimas(itens)}`);
  }
});

test('itens: agrupa por isótopo, conta fontes e ordena por prateleira (alfa, beta, gama) e nome', () => {
  const it = K.itensDaMissao(fontes('Cs-137', 'Sr-90', 'Cs-137', 'Am-241', 'Co-60'));
  assert.deepEqual(it.map((i) => [i.nome, i.n, i.prat]), [['Am-241', 1, 'alfa'], ['Sr-90', 1, 'beta'], ['Co-60', 1, 'gama'], ['Cs-137', 2, 'gama']]);
  assert.deepEqual(K.itensDaMissao([]), []);
  assert.deepEqual(K.itensDaMissao(null), []);
});

// ---------- estado e créditos ----------
const novo = () => K.novoCofre(fontes('Sr-90', 'Cs-137', 'Cs-137', 'Am-241'));

test('guardar: 1ª tentativa certa = 1; 2ª = 0,4; dois erros = o cofre guarda e vale 0', () => {
  let e = novo();
  let r = K.guardar(e, 'Cs-137', 'gama'); assert.ok(r.ok); assert.equal(r.credito, 1); e = r.estado;
  r = K.guardar(e, 'Sr-90', 'gama'); assert.ok(!r.ok && !r.revelou); assert.equal(r.motivo, 'sem-emissao'); e = r.estado;
  r = K.guardar(e, 'Sr-90', 'beta'); assert.ok(r.ok); assert.equal(r.credito, 0.4); e = r.estado;
  r = K.guardar(e, 'Am-241', 'gama'); assert.equal(r.motivo, 'minoritaria'); e = r.estado;
  r = K.guardar(e, 'Am-241', 'beta'); assert.ok(!r.ok && r.revelou); assert.equal(r.credito, 0);
  assert.equal(r.estado.itens.find((i) => i.nome === 'Am-241').guardada, 'alfa');
});

test('guardar: motivos do erro (sem emissão, minoritária, menos penetrante) e entradas inválidas', () => {
  assert.equal(K.motivoDoErro('Cs-137', 'beta'), 'menos-penetrante');
  assert.equal(K.motivoDoErro('Cs-137', 'alfa'), 'sem-emissao');
  assert.equal(K.motivoDoErro('Am-241', 'gama'), 'minoritaria');
  assert.equal(K.motivoDoErro('Cs-137', 'gama'), null);
  const e = novo();
  assert.equal(K.guardar(e, 'Z-9', 'gama').invalido, 'item-ou-prateleira');
  assert.equal(K.guardar(e, 'Cs-137', 'x').invalido, 'item-ou-prateleira');
  const g = K.guardar(e, 'Cs-137', 'gama').estado;
  assert.equal(K.guardar(g, 'Cs-137', 'gama').invalido, 'ja-guardada');
});

test('guardar: não altera o estado recebido (função pura)', () => {
  const e = novo(), antes = JSON.stringify(e);
  K.guardar(e, 'Cs-137', 'beta'); K.guardar(e, 'Cs-137', 'gama');
  assert.equal(JSON.stringify(e), antes);
});

test('blindagem: só depois de guardar uma fonte na prateleira, uma vez só; tabela completa 3 x 5 com créditos em [0,1]', () => {
  let e = novo();
  assert.equal(K.escolherBlindagem(e, 'gama', 'chumbo').invalido, 'prateleira-vazia');
  e = K.guardar(e, 'Cs-137', 'gama').estado;
  assert.equal(K.escolherBlindagem(e, 'gama', 'ouro').invalido, 'prateleira-ou-material');
  const r = K.escolherBlindagem(e, 'gama', 'papel'); assert.equal(r.credito, 0);
  assert.equal(K.escolherBlindagem(r.estado, 'gama', 'chumbo').invalido, 'ja-escolhida');
  for (const t of K.TIPOS_COFRE) for (const m of K.MATERIAIS) {
    const c = K.BLINDAGEM[t][m]; assert.ok(c >= 0 && c <= 1, `${t}/${m}`);
    assert.ok(K.explicarBlindagem(t, m, 'pt').length > 10 && K.explicarBlindagem(t, m, 'en').length > 10, `${t}/${m}`);
  }
  assert.deepEqual(Object.entries(K.BLINDAGEM).map(([t, o]) => [t, Object.entries(o).filter(([, c]) => c === 1).map(([m]) => m).sort()]),
    [['alfa', ['papel']], ['beta', ['acrilico', 'aluminio']], ['gama', ['chumbo', 'concreto']]]);
});

test('nota: média dos créditos de itens e blindagens; o que ficou por fazer vale 0; entra no aproveitamento (10 pontos)', () => {
  let e = novo();                                   // 3 itens (Am-241, Sr-90, Cs-137) e 3 prateleiras
  assert.deepEqual(K.creditos(e), [0, 0, 0, 0, 0, 0]); assert.equal(K.nota(e), 0); assert.ok(!K.completo(e));
  for (const [n, p] of [['Am-241', 'alfa'], ['Sr-90', 'beta'], ['Cs-137', 'gama']]) e = K.guardar(e, n, p).estado;
  assert.ok(!K.completo(e));
  e = K.escolherBlindagem(e, 'alfa', 'papel').estado;
  e = K.escolherBlindagem(e, 'beta', 'chumbo').estado;            // 0,4
  e = K.escolherBlindagem(e, 'gama', 'chumbo').estado;
  assert.ok(K.completo(e));
  near(K.nota(e), (3 + 1 + 0.4 + 1) / 6, 1e-12);
  near(A.aproveitamento({ precisao: 1, tempo: 100, meta: 100, creditos: [1, 1, 1], cofre: K.creditos(e) }).cofre, 10 * K.nota(e), 1e-9);
  assert.equal(K.nota({ itens: [], blind: {}, credBlind: {} }), 0);
});

test('perfeito = 100% do cofre; tudo errado e sem blindagem = 0; sair no meio conta 0 nos itens restantes', () => {
  let e = novo();
  for (const [n, p] of [['Am-241', 'alfa'], ['Sr-90', 'beta'], ['Cs-137', 'gama']]) e = K.guardar(e, n, p).estado;
  for (const [p, m] of [['alfa', 'papel'], ['beta', 'acrilico'], ['gama', 'concreto']]) e = K.escolherBlindagem(e, p, m).estado;
  assert.equal(K.nota(e), 1);
  let f = novo(); f = K.guardar(f, 'Cs-137', 'gama').estado;       // sai depois de 1 item
  near(K.nota(f), 1 / 6, 1e-12);
});

// ---------- caderno ----------
const ap = (e) => K.registros(e).reduce((a, r) => M.aplicarResultado(a, r), M.aprendizadoVazio());
const guardaTudoCerto = (e) => { for (const i of e.itens) e = K.guardar(e, i.nome, i.prat).estado; return e; };

test('registros: dois registros agregados (N04 e N09), nunca um por item', () => {
  const e = guardaTudoCerto(novo());
  const regs = K.registros(e);
  assert.deepEqual(regs.map((r) => r.no), ['N04', 'N09']);
  assert.ok(CONCEITOS.some((c) => c.id === 'N04') && CONCEITOS.some((c) => c.id === 'N09'));
});

test('registros: cofre perfeito soma no máximo 1 acerto por nó (sem saturar o domínio)', () => {
  let e = guardaTudoCerto(novo());
  for (const t of ['alfa', 'beta', 'gama']) e = K.escolherBlindagem(e, t, K.MATERIAL_CERTO ? K.MATERIAL_CERTO[t] : ({ alfa: 'papel', beta: 'acrilico', gama: 'chumbo' })[t]).estado;
  const a = ap(e);
  assert.equal(a.nos.N04.a, 1); assert.equal(a.nos.N04.e || 0, 0); assert.ok(a.nos.N04.m <= 1);
  assert.equal(a.fichas.N04, undefined);
});

test('registros: acertar só na 2ª tentativa é acerto, sem erro e sem ficha (a 2ª tentativa não é punida)', () => {
  let e = novo();
  for (const i of e.itens) { const errada = ['alfa', 'beta', 'gama'].find((p) => p !== i.prat); e = K.guardar(e, i.nome, errada).estado; e = K.guardar(e, i.nome, i.prat).estado; }
  const a = ap(e);
  assert.equal(a.nos.N04.a, 1); assert.equal(a.nos.N04.e || 0, 0);
  assert.equal(a.fichas.N04, undefined);
});

test('registros: todos revelados (erro duas vezes) = erro e ficha; 1 de vários revelado = acerto, mas a ficha abre', () => {
  let t = novo();
  for (const i of t.itens) { const outras = ['alfa', 'beta', 'gama'].filter((p) => p !== i.prat); t = K.guardar(K.guardar(t, i.nome, outras[0]).estado, i.nome, outras[1]).estado; }
  const a = ap(t);
  assert.equal(a.nos.N04.e, 1); assert.equal(a.fichas.N04, true);
  let u = novo();
  const [p, ...resto] = u.itens;
  const outras = ['alfa', 'beta', 'gama'].filter((x) => x !== p.prat);
  u = K.guardar(K.guardar(u, p.nome, outras[0]).estado, p.nome, outras[1]).estado;
  for (const i of resto) u = K.guardar(u, i.nome, i.prat).estado;
  const b = ap(u);
  if (u.itens.length > 2) { assert.equal(b.nos.N04.a, 1); assert.equal(b.nos.N04.e || 0, 0); }
  assert.equal(b.fichas.N04, true);
});

test('registros: saída antecipada sem nada feito = pulado (sem erro nem ficha); N09 só com blindagens possíveis', () => {
  const e = novo();
  const regs = K.registros(e);
  assert.equal(regs[0].resultados[0].pulou, true);
  const a = ap(e);
  assert.equal(a.nos.N04.e || 0, 0); assert.equal(a.fichas.N04, undefined);
});

// ---------- chumbo ----------
test('chumbo: tabela concorda com a de geiger.js nos pontos em comum (NIST XCOM) e respeita a borda K', () => {
  G.ENERGIAS_MEV.forEach((En, i) => near(K.muRhoChumbo(En) / G.MU_RHO.chumbo[i], 1, 0.005));
  near(K.muRhoChumbo(0.6617) / G.muRho('chumbo', 0.6617), 1, 0.02);
  assert.ok(K.muRhoChumbo(0.0881) > 2 * K.muRhoChumbo(0.0879), 'salto da borda K');
  near(K.muRhoChumbo(0.06), 5.021, 1e-9);
  assert.equal(K.muRhoChumbo(0.02), null); assert.equal(K.muRhoChumbo(2), null);
});

test('chumbo: energia efetiva e espessuras (HVL e 1/1000) por isótopo', () => {
  near(K.energiaGamaEfetiva('Cs-137'), 0.661655, 1e-9);
  near(K.energiaGamaEfetiva('I-131'), 0.364489, 1e-9);
  near(K.energiaGamaEfetiva('Co-60'), 1.2528, 0.001);
  near(K.energiaGamaEfetiva('Am-241'), 0.0595409, 1e-9);
  for (const n of ['Ra-226', 'Sr-90', 'P-32', 'Po-210', 'U-238']) assert.equal(K.espessuraChumbo(n), null, n);
  const cs = K.espessuraChumbo('Cs-137'), co = K.espessuraChumbo('Co-60'), io = K.espessuraChumbo('I-131'), am = K.espessuraChumbo('Am-241');
  near(cs.hvlCm, 0.55, 0.03); near(co.hvlCm, 1.04, 0.05); near(io.hvlCm, 0.215, 0.015);
  assert.ok(am.hvlCm < 0.02 && am.milCm > 0.08 && am.milCm < 0.2, `Am-241: ${am.hvlCm} ${am.milCm}`);   // décimos de milímetro e ~1 mm
  near(cs.milCm / cs.hvlCm, Math.log2(1000), 1e-9);
  assert.ok(am.hvlCm < io.hvlCm && io.hvlCm < cs.hvlCm && cs.hvlCm < co.hvlCm, 'quanto mais energia, mais chumbo');
});

// ---------- textos ----------
test('texto da gama em acrílico e alumínio vale para as fontes gama das missões (Cs-137, Co-60, I-131) com as espessuras de shields.js', () => {
  const gamaNasMissoes = new Set(MISSIONS.flatMap((m) => m.allowedIsotopes || []).filter((n) => K.prateleiraDe(n) === 'gama'));
  gamaNasMissoes.delete('Tc-99m');   // v3.21: Tc-99m (140 keV, ~89% em 3 mm de Al) entra na missão 6, mas o texto nomeia só Cs-137, Co-60 e I-131
  assert.deepEqual([...gamaNasMissoes].sort(), ['Co-60', 'Cs-137', 'I-131']);
  const placa = (id) => SHIELDS.find((s) => s.id === id);
  const ts = (mat, cm) => [...gamaNasMissoes].map((n) => 100 * G.transmissaoGama([{ material: mat, cm }], K.energiaGamaEfetiva(n)));
  const al = ts('aluminio', placa(1).cm), ac = ts('acrilico', placa(2).cm);
  assert.ok(Math.min(...al) >= 91.5 && Math.max(...al) <= 96.5, al.join());
  assert.ok(Math.min(...ac) >= 93.5 && Math.max(...ac) <= 96.5, ac.join());
  assert.match(K.explicarBlindagem('gama', 'aluminio', 'pt'), /92% a 96%/); assert.match(K.explicarBlindagem('gama', 'acrilico', 'pt'), /94% a 96%/);
  assert.match(K.explicarBlindagem('gama', 'aluminio', 'en'), /92% to 96%/); assert.match(K.explicarBlindagem('gama', 'acrilico', 'en'), /94% to 96%/);
});

test('explicações: PT e EN completas, citam o isótopo e o limiar; Am-241 explica a gama abaixo do limiar; dicas só dão o motivo', () => {
  for (const n of Object.keys(ESPERADO)) for (const l of ['pt', 'en']) {
    const t = K.explicarPrateleira(n, l); assert.ok(t.includes(n) && t.includes('50'), `${n} ${l}: ${t}`);
  }
  assert.match(K.explicarPrateleira('Am-241', 'pt'), /gama \(35,9 por 100\), abaixo de 50/);
  assert.match(K.explicarPrateleira('Am-241', 'en'), /gamma \(35\.9 per 100\), below 50/);
  assert.ok(!/gama \(/.test(K.explicarPrateleira('Cs-137', 'pt')), 'Cs-137: nada mais penetrante que a gama');
  assert.match(K.dicaDoErro('Sr-90', 'gama', 'pt'), /não emite radiação gama/);
  assert.match(K.dicaDoErro('Am-241', 'gama', 'pt'), /só em 35,9 de cada 100/);
  assert.match(K.dicaDoErro('Cs-137', 'beta', 'en'), /more penetrating/);
  assert.equal(K.dicaDoErro('Cs-137', 'gama', 'pt'), '');
  for (const n of ['Cs-137', 'Sr-90']) assert.ok(!K.dicaDoErro(n, 'alfa', 'pt').toLowerCase().includes('prateleira'));
});

test('fatos das explicações existem no banco de referências', (t) => {
  const dir = path.join(RAIZ, '..', 'docs', 'referencias-5c', 'busca');
  if (!fs.existsSync(dir)) return t.skip('sem docs/referencias-5c nesta cópia');
  const txt = fs.readdirSync(dir).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  for (const [t, fs_] of Object.entries(K.FATOS_PRATELEIRA)) for (const f of fs_) assert.ok(new RegExp('### ' + f.replace('.', '\\.') + '(\\s|$)').test(txt), `${t} ${f}`);
});

// ---- revisão do cofre, etapa 3 (27/10/2026): textos das decisões 1 e 4 e citação da regra ----
test('papel na prateleira alfa: Am-241 e Ra-226 ganham a frase da gama que o papel não barra; o crédito do papel continua 1', () => {
  assert.equal(K.BLINDAGEM.alfa.papel, 1);
  const base = K.explicarBlindagem('alfa', 'papel', 'pt');
  const am = K.explicarBlindagem('alfa', 'papel', 'pt', ['Am-241']), ra = K.explicarBlindagem('alfa', 'papel', 'pt', ['Ra-226']);
  assert.ok(am.startsWith(base) && ra.startsWith(base));
  assert.match(am, /59,5 keV \(35,9 em cada 100 decaimentos\)/); assert.match(am, /cerca de 0,12 mm/);
  assert.match(ra, /609,3 keV \(45,49 em 100 decaimentos\)/);
  assert.match(K.explicarBlindagem('alfa', 'papel', 'en', ['Am-241']), /59\.5 keV gamma \(35\.9 in every 100 decays\).*about 0\.12 mm/);
  assert.match(K.explicarBlindagem('alfa', 'papel', 'en', ['Ra-226']), /609\.3 keV gamma \(45\.49 per 100 decays\)/);
  assert.equal(K.explicarBlindagem('alfa', 'papel', 'pt', ['Po-210']), base, 'outras fontes alfa: sem frase extra');
  assert.equal(K.explicarBlindagem('alfa', 'acrilico', 'pt', ['Am-241']), K.explicarBlindagem('alfa', 'acrilico', 'pt'), 'só o papel ganha a frase');
});

test('beta com chumbo: o texto liga o chumbo sozinho (raios X de freamento) ao contêiner de chumbo de Lia, e o crédito segue 0,4', () => {
  assert.equal(K.BLINDAGEM.beta.chumbo, 0.4);
  assert.match(K.explicarBlindagem('beta', 'chumbo', 'pt'), /chumbo sozinho.*freamento.*1\.300 TBq de Sr-90.*contêiner/s);
  assert.match(K.explicarBlindagem('beta', 'chumbo', 'en'), /lead alone.*bremsstrahlung.*1,300 TBq of Sr-90.*lead/s);
  assert.ok(!/por dentro e chumbo por fora/.test(K.explicarBlindagem('beta', 'chumbo', 'pt')), 'frase sem fonte ([P]) não entra');
});

test('citação da regra de blindagem: uma por fato visível, sem C6.3 (PDF da OMS sem título nem data), em todas as prateleiras', () => {
  for (const t of K.TIPOS_COFRE) assert.ok(K.citacaoDaRegra(t).length > 20, t);
  assert.ok(!Object.keys(K.CITACOES_REGRA).includes('C6.3'));
  assert.match(K.citacaoDaRegra('alfa'), /Radiation Basics/); assert.match(K.citacaoDaRegra('beta'), /slides 16-17/); assert.match(K.citacaoDaRegra('gama'), /NIST/);
  for (const ids of Object.values(K.FATOS_PRATELEIRA)) for (const id of ids) assert.ok(id in K.CITACOES_REGRA || id === 'C6.3', id);
});
