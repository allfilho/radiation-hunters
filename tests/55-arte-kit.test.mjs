// Kit de arte (v3.12): paleta, primitivas, nave, pessoa, planta (vista de cima) e salas em corte da Base. Puro (sem navegador).
import test from 'node:test';
import assert from 'node:assert/strict';
import { RAIZ_JOGO as raiz } from './helpers/navegador.mjs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const carregar = (p) => import(pathToFileURL(join(raiz, p)).href);
const bemFormado = (svg) => {
  assert.ok(!/NaN|undefined|Infinity/.test(svg), 'sem NaN/undefined');
  const abre = [...svg.matchAll(/<([a-zA-Z]+)(?:\s[^>]*?)?(\/?)>/g)].filter((m) => !m[2]).map((m) => m[1]);
  const fecha = [...svg.matchAll(/<\/([a-zA-Z]+)>/g)].map((m) => m[1]);
  assert.equal(abre.length, fecha.length, 'tags balanceadas');
  for (const m of svg.matchAll(/ (?:fill|stroke)="(#[0-9a-fA-F]+)"/g)) assert.match(m[1], /^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'cor válida ' + m[1]);
};

test('paleta: tom() clareia/escurece e prng é determinístico', async () => {
  const { tom, prng, P } = await carregar('js/arte/paleta.js');
  assert.equal(tom('#000000', 1), '#ffffff');
  assert.equal(tom('#ffffff', -1), '#000000');
  assert.equal(tom('#fff', 0), '#ffffff', 'aceita forma curta');
  assert.throws(() => tom('azul', .1));
  const a = prng(42), b = prng(42);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
  assert.ok(Object.values(P).flat().every((c) => /^#[0-9a-f]{6}$/i.test(c)));
});

test('módulos da Base: todos os tipos geram SVG bem formado, e a obra/vazio também', async () => {
  const { moduloSvg } = await carregar('js/agencia/base-svg.js');
  for (const t of ['hangar', 'comando', 'academia', 'cofre', 'alojamento', 'oficina', 'biblioteca', 'laboratorio', 'vazio']) {
    const s = moduloSvg(t); bemFormado(s); assert.match(s, /viewBox="0 0 200 120"/); assert.match(s, /aria-hidden="true"/);
    assert.equal(s, moduloSvg(t), 'determinístico: ' + t);
    bemFormado(moduloSvg(t, true));
  }
});

test('superfície, rocha, nave e pessoa', async () => {
  const { superficieSvg, rochaSvg } = await carregar('js/agencia/base-svg.js');
  const { naveSvg, COR_NAVE } = await carregar('js/arte/nave.js');
  const { pessoaSvg } = await carregar('js/arte/pessoa.js');
  const sup = superficieSvg([{ tipo: 'tripulacao' }, { tipo: 'resgate', missao: { id: 1 } }, { tipo: 'levantamento' }], 3);
  bemFormado(sup); assert.match(sup, /EM VOO|IN FLIGHT|RESGATE|RESCUE/);   // o rótulo segue o idioma (v3.27.1)
  bemFormado(superficieSvg([], 1));
  bemFormado(rochaSvg());
  for (const t of Object.keys(COR_NAVE)) bemFormado(`<g>${naveSvg(t)}</g>`);
  for (const c of ['verde', 'amarelo', 'vermelho', undefined]) bemFormado(pessoaSvg(c, null, 3));
  assert.equal(pessoaSvg('verde', null, 'm7'), pessoaSvg('verde', null, 'm7'), 'mesma pessoa, mesmo desenho');
  assert.notEqual(pessoaSvg('verde', null, 1), pessoaSvg('verde', null, 2), 'pessoas diferentes');
});

test('planta (vista de cima): todos os blocos, obra, escavação, corredores e pessoas', async () => {
  const { planta, PONTOS, pessoaTopo } = await carregar('js/arte/planta.js');
  const viz = { n: true, s: false, o: true, l: false };
  for (const t of ['hangar', 'comando', 'academia', 'cofre', 'alojamento', 'oficina', 'biblioteca', 'laboratorio', 'vazio']) {
    const s = planta(t, { viz, naves: ['tripulacao', 'resgate'], pessoas: [{ cor: 'verde', i: 1 }, { cor: 'vermelho', i: 'm2' }] });
    bemFormado(s); assert.match(s, /viewBox="0 0 120 120"/); assert.match(s, /ag-planta-svg/);
    assert.equal(s, planta(t, { viz, naves: ['tripulacao', 'resgate'], pessoas: [{ cor: 'verde', i: 1 }, { cor: 'vermelho', i: 'm2' }] }), 'determinístico: ' + t);
    if (t !== 'vazio') assert.equal((s.match(/class="ag-pessoa"/g) || []).length, 2, 'duas pessoas em ' + t);
  }
  bemFormado(planta('hangar', { obra: true }));
  assert.equal((planta('comando', { obra: true, pessoas: [{ cor: 'verde', i: 1 }] }).match(/ag-pessoa"/g) || []).length, 0, 'ninguém em obra');
  assert.notEqual(planta('comando', { viz: { n: true } }), planta('comando', { viz: {} }), 'corredor só aparece com vizinho');
  assert.ok(planta('hangar', { naves: ['resgate'] }).length > planta('hangar', { naves: [] }).length, 'nave estacionada aparece no hangar');
  for (const [t, pts] of Object.entries(PONTOS)) for (const [x, y] of pts) assert.ok(x > 8 && x < 112 && y > 8 && y < 112, `ponto fora do bloco: ${t}`);
  bemFormado(pessoaTopo(10, 10, 'amarelo', 5));
});

test('regra do kit: nenhuma Math.random na arte', async () => {
  const { readFileSync } = await import('node:fs');
  for (const f of ['js/arte/paleta.js', 'js/arte/primitivas.js', 'js/arte/nave.js', 'js/arte/pessoa.js', 'js/arte/planta.js', 'js/agencia/base-svg.js']) assert.ok(!/Math\.random/.test(readFileSync(join(raiz, f), 'utf8')), f);
});
