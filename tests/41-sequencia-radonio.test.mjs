// Sequência do episódio do radônio (v3.3.8): roteiro por andares, personagens em cada ponto e lição extra da Academia.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const { INVESTIGACOES } = await imp('js/investigacao/index.js');
const P = await imp('js/investigacao/pisos.js');
const E = await imp('js/academia/licoes-extra.js');
const R = await imp('js/investigacao/retratos.js');
const L = await imp('js/academia/licoes.js');
const radon = INVESTIGACOES.find((i) => i.id === 'radonio-escola'), campo = radon.campo;
const ler = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');

test('ordem das cenas e andares: térreo → porão → sótão → 1º andar → térreo, no máximo 3 escadas seguidas e 6 trocas no total', () => {
  assert.deepEqual(radon.cenas.map((c) => c.id), ['pergunta-ar', 'ventilacao', 'porao-ar', 'sotao-ar', 'serie', 'protocolo', 'quadro-ar', 'conclusao-ar', 'limite-ar']);
  assert.deepEqual(campo.locais.map((l) => P.pisoDoLocal(l)), ['terreo', 'terreo', 'porao', 'sotao', 'andar1', 'terreo', 'terreo', 'terreo', 'terreo']);
  let total = 0;
  for (let i = 1; i < campo.locais.length; i++) {
    let piso = P.pisoDoLocal(campo.locais[i - 1]), saltos = 0; const alvo = P.pisoDoLocal(campo.locais[i]);
    while (piso !== alvo) { piso = P.proximaEscada(campo, piso, alvo).para; saltos++; assert.ok(saltos <= 3); }
    total += saltos;
  }
  assert.equal(total, 6, 'trocas de andar do percurso');
  for (const l of ['pt', 'en']) radon.cenas.forEach((c, i) => assert.ok(c.titulo[l].startsWith(`${i + 1} · `)));
});

test('personagens: um por ponto, 7 diferentes, cada um com sprite, retrato e nome; cenas citam o personagem do ponto (PT e EN)', () => {
  const npcs = campo.locais.map((l) => l.npc);
  assert.ok(npcs.every(Boolean)); assert.ok(new Set(npcs).size >= 7, [...new Set(npcs)].join(','));
  const sprites = ler('js/render/npcs-hospital.js'), nomes = ler('js/investigacao/campo.js');
  for (const n of new Set(npcs)) { assert.ok(new RegExp(`\\b${n}:\\{blusa`).test(sprites), 'sprite ' + n); assert.ok(R.temRetrato(n), 'retrato ' + n); assert.ok(new RegExp(`\\b${n}:'`).test(nomes), 'nome ' + n); }
  const cita = { 'porao-ar': 'Nelson', 'sotao-ar': 'Léo', serie: 'Vera', protocolo: 'Paulo', 'quadro-ar': 'Tânia', ventilacao: 'Inês' };
  for (const [id, nome] of Object.entries(cita)) { const c = radon.cenas.find((x) => x.id === id); for (const l of ['pt', 'en']) assert.ok(c.texto[l].includes(nome), `${id} ${l} deveria citar ${nome}`); }
  const roteiro = radon.cenas[0].texto;
  for (const l of ['pt', 'en']) for (const n of ['Inês', 'Nelson', 'Léo', 'Vera', 'Paulo', 'Tânia', 'Dora']) assert.ok(roteiro[l].includes(n), `roteiro ${l} sem ${n}`);
});

test('dependências entre cenas: a campanha vem depois do modelo e do tour; o protocolo, depois de todos os ambientes', () => {
  const ordem = radon.cenas.map((c) => c.id), i = (id) => ordem.indexOf(id);
  assert.ok(i('serie') > i('ventilacao') && i('serie') > i('sotao-ar') && i('serie') > i('porao-ar'));
  assert.match(radon.cenas[i('serie')].texto.pt, /mesmo modelo que você acabou de explorar/);
  assert.ok(i('protocolo') > i('serie') && i('quadro-ar') > i('protocolo') && i('conclusao-ar') > i('quadro-ar') && i('limite-ar') > i('conclusao-ar'));
  assert.match(radon.cenas[i('protocolo')].texto.pt, /De volta ao térreo/);
  assert.match(radon.cenas[i('sotao-ar')].texto.pt, /Suba do porão/); assert.match(radon.cenas[i('serie')].texto.pt, /Desça do sótão/);
});

test('lição extra da Academia: fora das 8 lineares, só teoria, com os números do mesmo modelo da atividade', () => {
  assert.equal(L.LICOES.length, 8); assert.ok(!L.LICOES.some((x) => x.pt.titulo.startsWith('Extra')));
  const x = E.LICOES_EXTRA['radonio-equacao']; assert.deepEqual(x.pt.perguntas, []); assert.deepEqual(x.en.perguntas, []);
  const pt = x.pt.paragrafos.join(' '), en = x.en.paragrafos.join(' ');
  for (const t of [pt, en]) { assert.ok(t.includes('dC/dt = S/V − (λv + λ)·C + λv·C0')); assert.ok(t.includes('C∞ = (S/V + λv·C0) / (λv + λ)')); assert.ok(t.includes('τ = 1 / (λv + λ)')); }
  assert.match(pt, /cerca de 110 Bq\/m³, com τ ≈ 6,3 h/); assert.match(pt, /cerca de 13 Bq\/m³, e τ ≈ 19 min/); assert.match(en, /about 110 Bq\/m³, with τ ≈ 6\.3 h/); assert.match(en, /about 13 Bq\/m³, and τ ≈ 19 min/);
  assert.ok(Math.abs(E.NUMEROS_RADONIO.cFechada - 110.05) < 0.1 && Math.abs(E.NUMEROS_RADONIO.cMecanica - 13.09) < 0.1);
  assert.match(x.pt.fonte, /\[V\]/); assert.match(x.pt.fonte, /\[H\]/); assert.match(x.pt.fonte, /\[C\]/);
  assert.equal(radon.cenas[1].leituraExtra, 'radonio-equacao');
});

for (const [rotulo, viewport, toque] of [['desktop', { width: 1280, height: 800 }, false], ['celular 360×640', { width: 360, height: 640 }, true]]) {
  test(`no navegador (${rotulo}): leitura opcional abre sobre a cena, mostra a equação, fecha e devolve o foco; cena tem retrato do personagem`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url + '?investigacao=radonio-escola', { idioma: 'pt', viewport, toque });
      await pg.waitForFunction(() => window.gameScene?.pontosInvestigacao?.length > 0 && window.gameScene.player, null, { timeout: 30000 });
      await pg.evaluate(() => { ui.investigacao.sessao.concluidas['pergunta-ar'] = true; const s = window.gameScene, p = s.pontosInvestigacao.find((q) => q.id === 'ventilacao'); s.player.setPosition(p.x * 32, p.y * 32 + 20); s.handleIdentify(); });
      await pg.waitForSelector('#investigacao-screen.active #inv-leitura-extra', { timeout: 8000 });
      assert.match(await pg.textContent('.inv-fala-nome'), /Inês/);
      await pg.click('#inv-leitura-extra');
      await pg.waitForSelector('#licao-modal.active .licao-titulo');
      assert.match(await pg.textContent('#licao-modal .licao-titulo'), /Extra · Por que o radônio sobe e desce/);
      const noTopo = await pg.evaluate(() => { const m = document.getElementById('licao-modal').getBoundingClientRect(), el = document.elementFromPoint(m.left + m.width / 2, m.top + 40); return !!el?.closest('#licao-modal'); });
      assert.ok(noTopo, 'a lição fica por cima da investigação');
      let textos = '';
      for (let k = 0; k < 8; k++) {
        textos += await pg.textContent('#licao-modal .licao-texto');
        const w = await pg.evaluate(() => ({ x: document.documentElement.scrollWidth, w: innerWidth })); assert.ok(w.x <= w.w, 'rolagem horizontal');
        if (await pg.locator('#licao-fechar').count()) break;
        await pg.click('#licao-proxima');
      }
      assert.ok(textos.includes('dC/dt = S/V − (λv + λ)·C + λv·C0'));
      assert.equal(await pg.locator('#licao-modal .licao-opcao').count(), 0, 'sem quiz');
      await pg.click('#licao-fechar');
      await pg.waitForFunction(() => !document.getElementById('licao-modal').classList.contains('active'));
      assert.equal(await pg.evaluate(() => document.activeElement?.id), 'inv-leitura-extra');
      assert.equal(await pg.locator('#investigacao-screen.active').count(), 1);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
