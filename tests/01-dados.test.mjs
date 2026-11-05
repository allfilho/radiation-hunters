// Dados estáticos: i18n, isótopos, blindagens, missões.
// "Caracterização" = trava o comportamento ATUAL (inclusive o que será mudado de
// propósito nas etapas 3; nesse caso o teste é reescrito junto com a mudança).
// "todo" = comportamento DESEJADO que ainda falha; vira teste normal quando corrigido.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

let srv, nav, pg;
before(async () => {
  srv = await servidor(); nav = await abrirNavegador();
  ({ pg } = await novaPagina(nav, srv.url));
});
after(async () => { await nav?.close(); await srv?.fechar(); });

test('i18n: todos os idiomas têm exatamente as mesmas chaves', async () => {
  const r = await pg.evaluate(() => {
    const langs = Object.keys(i18n), ref = new Set(Object.keys(i18n[langs[0]]));
    return { langs, faltas: langs.map((l) => [l, [...ref].filter((k) => !(k in i18n[l])), Object.keys(i18n[l]).filter((k) => !ref.has(k))]) };
  });
  for (const [l, falta, sobra] of r.faltas) {
    assert.deepEqual(falta, [], `${l} sem chaves`);
    assert.deepEqual(sobra, [], `${l} com chaves a mais`);
  }
});

test('i18n (caracterização): hoje existem exatamente en e pt, com 208 chaves cada', async () => {
  const r = await pg.evaluate(() => ({ langs: Object.keys(i18n), n: Object.keys(i18n.en).length }));
  assert.deepEqual(r.langs, ['en', 'pt']);
  assert.equal(r.n, 208);
});

test('i18n: toda chave data-i18n do HTML existe em todos os idiomas', async () => {
  const faltas = await pg.evaluate(() => {
    const ks = [...new Set([...document.querySelectorAll('[data-i18n]')].map((e) => e.dataset.i18n))];
    return Object.keys(i18n).flatMap((l) => ks.filter((k) => !(k in i18n[l])).map((k) => `${l}:${k}`));
  });
  assert.deepEqual(faltas, []);
});

test('i18n: t() com as missões usa chaves existentes (título, descrição, história)', async () => {
  const faltas = await pg.evaluate(() => MISSIONS.flatMap((m) =>
    ['titleKey', 'descKey', 'storyKey'].filter((c) => !(m[c] in i18n.en) || !(m[c] in i18n.pt)).map((c) => `${m.id}:${c}`)));
  assert.deepEqual(faltas, []);
});

test('isótopos (caracterização): 10 isótopos, tipo e faixa de atividade atuais', async () => {
  const r = await pg.evaluate(() => ISOTOPES.map((i) => [i.name, i.type, i.minBase, i.maxBase]));
  assert.deepEqual(r, [
    ['U-238', 'alfa', 40, 90], ['Am-241', 'alfa', 80, 160], ['Po-210', 'alfa', 70, 120],
    ['Sr-90', 'beta', 170, 300], ['P-32', 'beta', 220, 400], ['I-131', 'gama', 220, 420],
    ['Tc-99m', 'gama', 300, 620], ['Cs-137', 'gama', 360, 720], ['Ir-192', 'gama', 380, 820],
    ['Co-60', 'gama', 500, 950]]);
});

test('blindagens: material e espessura reais (alumínio 3 mm, acrílico 5 mm, chumbo 10 mm); sem fatores fixos', async () => {
  const r = await pg.evaluate(() => SHIELDS.map((s) => [s.key, s.material, s.cm, 'attenuation' in s]));
  assert.deepEqual(r, [['none', null, 0, false], ['alu', 'aluminio', 0.3, false], ['acr', 'acrilico', 0.5, false], ['pb', 'chumbo', 1.0, false]]);
});

test('isótopos: todos têm meia-vida (s) e energia (gama, alfa) ou alcance máximo (beta) do projeto 3a', async () => {
  const r = await pg.evaluate(() => ISOTOPES.map((i) => [i.name, typeof i.halfLifeS === 'number' && i.halfLifeS > 0,
    i.type === 'beta' ? typeof i.betaRangeMgCm2 === 'number' : typeof i.energyMeV === 'number']));
  assert.deepEqual(r.filter(([, a, b]) => !(a && b)), []);
});

test('missões (caracterização): 8 missões, fontes, limites de tempo e isótopos permitidos', async () => {
  const r = await pg.evaluate(() => MISSIONS.map((m) => [m.id, m.numSources, m.timeLimit, m.mapTheme, m.allowedIsotopes.join('+')]));
  assert.deepEqual(r, [
    [1, 2, 0, 'lab', 'Am-241+Cs-137'], [2, 5, 0, 'junkyard', 'Cs-137'],
    [3, 4, 180, 'factory', 'Ra-226'], [4, 5, 240, 'nuclear', 'I-131+Cs-137+Sr-90'],
    [5, 6, 300, 'bunker', 'Sr-90+Cs-137+Co-60+Am-241'], [6, 4, 200, 'hospital', 'Tc-99m+I-131'],
    [7, 5, 250, 'junkyard', 'Co-60'], [8, 8, 360, 'nuclear', 'I-131+Cs-137+Sr-90']]);
});

test('missões: todo isótopo permitido existe em ISOTOPES ou em addIsotope', async () => {
  const ruins = await pg.evaluate(() => MISSIONS.flatMap((m) => m.allowedIsotopes
    .filter((n) => !ISOTOPES.some((i) => i.name === n) && m.addIsotope?.name !== n).map((n) => `${m.id}:${n}`)));
  assert.deepEqual(ruins, []);
});

test('missões: o desbloqueio inicial é só a missão 1', async () => {
  assert.deepEqual(await pg.evaluate(() => GameState.unlockedMissions), [1]);
});

test('o cabeçalho de autoria do game.js continua intacto (não alterar sem confirmação)', async () => {
  const fs = await import('node:fs'); const { RAIZ_JOGO } = await import('./helpers/navegador.mjs');
  const path = await import('node:path');
  // procura no game.js ou, depois da modularização, em qualquer .js da pasta
  const achou = fs.readdirSync(RAIZ_JOGO, { recursive: true }).filter((f) => String(f).endsWith('.js'))
    .some((f) => fs.readFileSync(path.join(RAIZ_JOGO, String(f)), 'utf8').includes('By Grupo de Cronologia - IFGW - Arnaldo Filho'));
  assert.ok(achou);
});

// ---- correções da etapa 3d (antes eram 'todo') ----
test('idiomas: botões de blindagem têm title traduzido em pt', async () => {
  const { pg: p, ctx } = await novaPagina(nav, srv.url, { idioma: 'pt' });
  const titulos = await p.$$eval('.shield-btn', (e) => e.map((x) => x.title));
  await ctx.close();
  assert.ok(!titulos.includes('Lead') && !titulos.includes('No Shield'), titulos.join(','));
});

test('idiomas: <html lang> acompanha o idioma escolhido', async () => {
  const { pg: p, ctx } = await novaPagina(nav, srv.url, { idioma: 'pt' });
  const lang = await p.evaluate(() => document.documentElement.lang);
  await ctx.close();
  assert.equal(lang, 'pt');
});

test('idiomas: mensagem de conclusão sai em português quando o idioma é pt', async () => {
  const { pg: p, ctx } = await novaPagina(nav, srv.url, { idioma: 'pt' });
  const msg = await p.evaluate(() => GameScene.prototype.getCompletionMessage.call({}, 100, 30));
  await ctx.close();
  assert.ok(!/Hunter|Great|Good effort|Mission complete/.test(msg), msg);
});

test('storytelling: cada missão tem 4 notas de campo e uma história com fonte, em en e pt; sem alegações removidas', async () => {
  const r = await pg.evaluate(() => {
    const out = [];
    for (const l of ['en', 'pt']) for (let m = 1; m <= 8; m++) {
      for (let k = 1; k <= 4; k++) if (!i18n[l]['fact' + m + '_' + k]) out.push(`${l}: falta fact${m}_${k}`);
      const h = i18n[l]['story' + m];
      if (!/(Fonte|Source):/.test(h)) out.push(`${l}: story${m} sem linha de fonte`);
      for (const proibido of [/Roberto|Wagner|Devair|Leide|Leide/, /15 grams|15 g\b|60 TBq/, /hunters|caçadores de/i, /Clínica Quirón/])
        if (proibido.test(h)) out.push(`${l}: story${m} contém ${proibido}`);
    }
    return out;
  });
  assert.deepEqual(r, []);
});

test('storytelling: Chernobyl e Fukushima não listam Co-60 (não é radionuclídeo principal desses acidentes)', async () => {
  const r = await pg.evaluate(() => [4, 8].map((i) => MISSIONS.find((m) => m.id === i).allowedIsotopes.includes('Co-60')));
  assert.deepEqual(r, [false, false]);
});
