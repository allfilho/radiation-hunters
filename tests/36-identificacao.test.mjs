// Revisão do cofre, etapa 4 (27/10/2026): a identificação mostra uma lista fixa de candidatos, sem nomes repetidos,
// com distratores que as placas do jogo separam do isótopo real, e o rótulo do tipo no idioma do jogo.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const { candidatosDaMissao, rotuloDoCandidato } = await imp('js/data/candidatos.js');
const { ISOTOPES } = await imp('js/data/isotopes.js');
const { MISSIONS } = await imp('js/data/missoes/index.js');
const G = await imp('js/fisica/geiger.js');
const C = await imp('js/fisica/componentes.js');
const { SHIELDS } = await imp('js/data/shields.js');

const todos = [...ISOTOPES, ...MISSIONS.map((m) => m.addIsotope).filter(Boolean)];
const iso = (n) => todos.find((i) => i.name === n);
const livre = { tileM: 0.5, paredeCm: 30, ehParede: () => false };
/** Fração do sinal que passa por cada placa (Al, acrílico, Pb) a 0,5 m (1 tile), base mínima: a "impressão digital" no Geiger do jogo. */
function assinatura(nome) {
  const i = iso(nome);
  const f = { type: i.type, base: i.minBase, x: 10, y: 10, rect: { x: 9.5, y: 9.5, w: 1, h: 1 }, found: false, energyMeV: i.energyMeV, betaRangeMgCm2: i.betaRangeMgCm2, componentes: C.componentesDe(i) };
  const taxa = (s) => G.taxaFonte(f, { x: 9, y: 10, dir: 0 }, { ...livre, blindagem: s.material ? s : null });
  const t0 = taxa(SHIELDS[0]);
  return t0 > 0 ? SHIELDS.slice(1).map((s) => taxa(s) / t0) : null;
}
// Am-241 e Ra-226: alfa só por contato. A 0,5 m a taxa é 0 e não há assinatura por placa; eles se distinguem de qualquer fonte beta/gama por isso.
const ALFA_CONTATO = new Set(['Am-241', 'Ra-226', 'Po-210', 'U-238']);
const separaveis = (a, b) => {
  if (ALFA_CONTATO.has(a) && ALFA_CONTATO.has(b)) return false;
  if (ALFA_CONTATO.has(a) || ALFA_CONTATO.has(b)) return true;   // gama ou beta lidas a 0,5 m x alfa só por contato
  const x = assinatura(a), y = assinatura(b);
  return Math.max(...x.map((v, k) => Math.abs(v - y[k]))) >= 0.1;
};

test('candidatosDaMissao: nomes distintos das fontes mais os extras, em ordem alfabética, sem repetir e sem inventar nome', () => {
  const fontes = [{ name: 'Cs-137' }, { name: 'Cs-137' }, { name: 'Cs-137' }];
  const r = candidatosDaMissao(fontes, ['Co-60', 'Sr-90', 'Cs-137', 'X-999']);
  assert.deepEqual(r.map((x) => x.name), ['Co-60', 'Cs-137', 'Sr-90']);
  assert.deepEqual(candidatosDaMissao([], []), []);
  assert.deepEqual(candidatosDaMissao([{ name: 'B' }, { name: 'A' }], undefined).map((x) => x.name), ['A', 'B']);
});

test('toda missão tem pelo menos 3 candidatos distintos (nenhuma resposta óbvia; a 6 tem só os 2 reais) e extras que existem', () => {
  for (const m of MISSIONS) {
    const nomes = new Set([...(m.allowedIsotopes || []), ...(m.candidatosExtras || [])]);
    if (m.addIsotope) nomes.add(m.addIsotope.name);
    assert.ok(nomes.size >= 3 || m.id === 6, `missão ${m.id}: ${[...nomes]}`);   // a 6 tem só Co-60 e Cs-137 (decisão do projeto: 2 candidatos reais)
    for (const e of m.candidatosExtras || []) assert.ok(todos.some((i) => i.name === e), `${m.id}: extra desconhecido ${e}`);
  }
});

test('distratores: cada par (isótopo real, distrator) da mesma missão se separa por pelo menos uma placa (>= 10 pontos percentuais) ou por ser alfa só por contato', () => {
  for (const m of MISSIONS.filter((x) => x.candidatosExtras)) {
    const reais = m.addIsotope ? [m.addIsotope.name] : m.allowedIsotopes;
    for (const r of reais) for (const d of m.candidatosExtras) assert.ok(separaveis(r, d), `missão ${m.id}: ${r} x ${d}`);
  }
  assert.ok(!MISSIONS.find((m) => m.id === 3).candidatosExtras.includes('Am-241'), 'M3: Am-241 e Ra-226 não se distinguem por medida');
});

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });
async function comPagina(opc, fn) {
  const p = await novaPagina(nav, srv.url, opc);
  try { return await fn(p); } finally { await p.ctx.close(); }
}
/** Chama o handleIdentify real: jogador sobre o móvel da 1ª fonte, leitura forte (acima do limiar). */
const identificar = (pg) => pg.evaluate(() => {
  const s = window.gameScene, f = s.sources[0].furniture;
  s.player.x = f.centerX; s.player.y = f.centerY; s.currentReading = 999;
  s.handleIdentify();
  return [...document.querySelectorAll('#isotope-buttons .isotope-btn')].map((b) => [b.dataset.name, b.querySelector('.isotope-type').textContent.trim()]);
});

for (const id of [2, 3, 7]) {
  test(`missão ${id}: o modal de identificação real não repete nomes e traz os distratores da missão (PT)`, () =>
    comPagina({ todasDesbloqueadas: true, idioma: 'pt' }, async ({ pg, erros }) => {
      await iniciarMissao(pg, id);
      const r = await identificar(pg);
      const extras = await pg.evaluate(() => window.gameScene.missionData.candidatosExtras);
      const nomes = r.map((x) => x[0]);
      assert.equal(new Set(nomes).size, nomes.length, `sem repetição: ${nomes}`);
      for (const e of extras) assert.ok(nomes.includes(e), `${e} na lista ${nomes}`);
      assert.ok(nomes.length >= 3, nomes.join());
      for (const [, rot] of r) assert.match(rot, /^[αβγ](\+[αβγ])* (alfa|beta|gama|gama e beta)( · γ ≈ \d,\d\d MeV)?$/);
      assert.deepEqual(erros, []);
    }));
}

test('rótulo do tipo no idioma do jogo (EN: "α alpha", nunca "alfa"/"gama") e a lista não encolhe depois de achar uma fonte', () =>
  comPagina({ todasDesbloqueadas: true, idioma: 'en' }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 2);
    const antes = await identificar(pg);
    assert.ok(antes.length >= 4, JSON.stringify(antes));
    for (const [n, rot] of antes) assert.ok(!/alfa|gama/.test(rot) && /alpha|beta|gamma/.test(rot), `${n}: ${rot}`);
    await pg.evaluate(() => { window.gameScene.sources[1].found = true; ui.hideModal && ui.hideModal('identify'); });
    const depois = await identificar(pg);
    assert.deepEqual(depois.map((x) => x[0]), antes.map((x) => x[0]), 'mesma lista de candidatos');
    assert.deepEqual(erros, []);
  }));

// ---- revisão final (28/10/2026): C2 (rótulos com a energia da gama), D4 (tabela com addIsotope), E2 e E5 (visual do modal) ----
test('rótulo do candidato: tipos, nomes no idioma e a energia da gama (só quando há gama)', () => {
  assert.equal(rotuloDoCandidato(iso('I-131'), 'pt'), 'γ+β gama e beta · γ ≈ 0,36 MeV');
  assert.equal(rotuloDoCandidato(iso('I-131'), 'en'), 'γ+β gamma and beta · γ ≈ 0.36 MeV');
  assert.equal(rotuloDoCandidato(iso('Cs-137'), 'pt'), 'γ+β gama e beta · γ ≈ 0,66 MeV');
  assert.equal(rotuloDoCandidato(iso('Co-60'), 'pt'), 'γ+β gama e beta · γ ≈ 1,25 MeV');
  assert.equal(rotuloDoCandidato(iso('Sr-90'), 'en'), 'β beta');
  assert.equal(rotuloDoCandidato(iso('Am-241'), 'pt'), 'α alfa');
  assert.equal(rotuloDoCandidato(iso('Ra-226'), 'en'), 'α alpha');
});

test('toda missão: todos os pares de candidatos (reais e extras) têm rótulos distintos e se separam por placa ou por serem alfa só por contato', () => {
  for (const m of MISSIONS) {
    const nomes = [...new Set([...(m.addIsotope ? [m.addIsotope.name] : m.allowedIsotopes || []), ...(m.candidatosExtras || [])])];
    for (let i = 0; i < nomes.length; i++) for (let j = i + 1; j < nomes.length; j++) {
      assert.ok(separaveis(nomes[i], nomes[j]), `missão ${m.id}: ${nomes[i]} x ${nomes[j]} não se separam pelas placas`);
      assert.notEqual(rotuloDoCandidato(iso(nomes[i]), 'pt'), rotuloDoCandidato(iso(nomes[j]), 'pt'), `missão ${m.id}: rótulos iguais para ${nomes[i]} e ${nomes[j]}`);
    }
  }
});

test('a lista de extras de cada missão usa só nomes de ISOTOPES (o jogo procura neles; um nome de addIsotope sumiria em silêncio)', () => {
  for (const m of MISSIONS) for (const e of m.candidatosExtras || []) assert.ok(ISOTOPES.some((i) => i.name === e), `${m.id}: ${e} não está em ISOTOPES`);
});

test('modal de identificação: botão "Ainda não dá para concluir" com 44 px e fonte própria; rótulo γ com contraste ≥ 4,5:1', () =>
  comPagina({ todasDesbloqueadas: true, idioma: 'pt' }, async ({ pg, erros }) => {
    await iniciarMissao(pg, 4);
    await identificar(pg);
    await pg.evaluate(() => { document.getElementById('btn-mais-dados').hidden = false; });
    const r = await pg.evaluate(() => {
      const b = document.getElementById('btn-mais-dados'), cs = getComputedStyle(b), t = [...document.querySelectorAll('.isotope-type.gama')][0];
      const lum = (c) => { const [r, g, bl] = c.match(/\d+/g).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
      const fundo = getComputedStyle(t.closest('.isotope-btn')).backgroundColor, cor = getComputedStyle(t).color;
      const [a, c] = [lum(cor), lum(fundo)].sort((x, y) => y - x);
      return { altura: b.getBoundingClientRect().height, fonte: cs.fontFamily, razao: (a + 0.05) / (c + 0.05), cor, fundo };
    });
    assert.ok(r.altura >= 44, `altura ${r.altura}`);
    assert.ok(!/^arial/i.test(r.fonte), r.fonte);
    assert.ok(r.razao >= 4.5, `contraste ${r.razao.toFixed(2)} (${r.cor} sobre ${r.fundo})`);
    assert.deepEqual(erros, []);
  }));
