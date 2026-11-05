// Investigação do hospital (protótipo): dados, motor e percurso completo pela interface (PT/EN, celular).
import test from 'node:test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, passarHistoria } from './helpers/navegador.mjs';
import { HOSPITAL } from '../current/js/investigacao/hospital.js';
import { criarSessao, avaliarOpcao, avaliarCartoes, registrarHipotese, montarFicha, resolver, embaralhar, semRotulos, limparRotulos } from '../current/js/investigacao/motor.js';
import { lerParametros } from '../current/js/modo.js';

const folhas = (o, saida = []) => {
  if (Array.isArray(o)) o.forEach((x) => folhas(x, saida));
  else if (o && typeof o === 'object') {
    const k = Object.keys(o);
    if (k.length === 2 && k.includes('pt') && k.includes('en')) saida.push(o); else k.forEach((x) => folhas(o[x], saida));
  }
  return saida;
};

test('dados: toda folha tem pt e en não vazios; EN em inglês americano; ids únicos', () => {
  const f = folhas(HOSPITAL);
  assert.ok(f.length > 60);
  for (const x of f) { assert.ok(x.pt.trim() && x.en.trim(), JSON.stringify(x)); assert.doesNotMatch(x.en, /caesium|aluminium|behaviour|colour|millimetre|centimetre/i); }
  const ids = HOSPITAL.cenas.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes(HOSPITAL.cenaHipotese) && ids.includes(HOSPITAL.cenaDecisao) && ids.includes(HOSPITAL.cenaLimite));
});

test('dados: cada escolha/evidência tem exatamente 1 certa; erradas têm retorno; cartões misturam certos e errados', () => {
  for (const c of HOSPITAL.cenas) {
    const etapas = c.tipo === 'escolha' ? [c.opcoes, ...(c.evidencia ? [c.evidencia.opcoes] : [])] : [];
    for (const ops of etapas) {
      assert.equal(ops.filter((o) => o.ok).length, 1, c.id);
      for (const o of ops) assert.ok(o.retorno && o.retorno.pt, `${c.id}/${o.id} sem retorno`);
      assert.ok(ops.length >= 3);
    }
    if (c.tipo === 'cartoes') {
      assert.ok(c.cartoes.some((k) => k.ok) && c.cartoes.some((k) => !k.ok));
      for (const k of c.cartoes) assert.ok(k.retorno && k.retorno.pt);
    }
    if (c.tipo === 'registro') assert.ok(c.opcoes.some((o) => o.naoSei) && c.opcoes.some((o) => o.compativel) && c.opcoes.some((o) => o.compativel === false));
  }
});

test('dados: a alternativa certa não se destaca pelo tamanho (nem sempre a mais longa, razão <= 1.35)', () => {
  let n = 0, maisLonga = 0;
  for (const c of HOSPITAL.cenas.filter((x) => x.tipo === 'escolha')) {
    for (const ops of [c.opcoes, ...(c.evidencia ? [c.evidencia.opcoes] : [])]) {
      for (const l of ['pt', 'en']) {
        const ok = ops.find((o) => o.ok).txt[l].length, outras = ops.filter((o) => !o.ok).map((o) => o.txt[l].length);
        const media = outras.reduce((a, b) => a + b, 0) / outras.length;
        assert.ok(ok / media <= 1.35, `${c.id} ${l}: ${ok} vs média ${media}`);
        n++; if (ok > Math.max(...outras)) maisLonga++;
      }
    }
  }
  assert.ok(maisLonga / n <= 0.5, `certa é a mais longa em ${maisLonga} de ${n}`);
});

test('rótulos de fonte: removidos do texto do jogador (modo normal) e mantidos nos dados', () => {
  assert.equal(semRotulos('Correta [V CDC]. Outra [N] e [H].'), 'Correta. Outra e.');
  for (const l of ['pt', 'en']) {
    const limpo = JSON.stringify(limparRotulos(resolver(HOSPITAL, l)));
    assert.doesNotMatch(limpo, /\[(V|N|H)[ \]]/);
    assert.match(JSON.stringify(resolver(HOSPITAL, l)), /\[V /);   // os dados continuam rotulados para a revisão
    assert.ok(limpo.includes('fontesPublicas'));
  }
});

test('motor: tentativas, avaliação de cartões, ficha e revisão', () => {
  const inv = resolver(HOSPITAL, 'pt');
  const s = criarSessao(HOSPITAL);
  const rec = inv.cenas.find((c) => c.id === 'recepcao');
  assert.equal(registrarHipotese(s, rec, 'a').compativel, false);
  const eq = inv.cenas.find((c) => c.id === 'equipamento');
  assert.equal(avaliarOpcao(s, eq, 'principal', 'corpo').ok, false);
  assert.equal(avaliarOpcao(s, eq, 'principal', 'tubo').ok, true);
  assert.equal(s.registro.equipamento.tentativas, 2);
  assert.equal(avaliarOpcao(s, eq, 'evidencia', 'liga').ok, true);
  const cz = inv.cenas.find((c) => c.id === 'cartaz');
  const r1 = avaliarCartoes(s, cz, ['c1', 'c2', 'c3']);
  assert.equal(r1.ok, false); assert.equal(r1.porCartao.c4.faltou, true);
  const r2 = avaliarCartoes(s, cz, ['c1', 'c2', 'c3', 'c4', 'g1']);
  assert.equal(r2.ok, false); assert.equal(r2.porCartao.g1.certo, false);
  assert.equal(avaliarCartoes(s, cz, ['c1', 'c2', 'c3', 'c4']).ok, true);
  const f = montarFicha(s, HOSPITAL, 'pt');
  assert.equal(f.revisao, 'em-andamento');
  assert.ok(f.evidencias.length >= 5);
  assert.ok(f.cenasComMaisDeUmaTentativa.some((x) => x.cena === 'equipamento'));
  assert.ok(typeof f.hipoteseInicial === 'string');
  const s2 = criarSessao(HOSPITAL); registrarHipotese(s2, rec, 'c');
  assert.equal(montarFicha(s2, HOSPITAL, 'en').revisao, 'em-andamento');
});

test('embaralhar: preserva os elementos, não altera o original e muda a ordem (rng injetado)', () => {
  const orig = [1, 2, 3, 4, 5, 6];
  const sem = (() => { let x = 7; return () => { x = (x * 48271) % 2147483647; return x / 2147483647; }; })();
  const a = embaralhar(orig, sem);
  assert.deepEqual([...a].sort(), orig); assert.deepEqual(orig, [1, 2, 3, 4, 5, 6]);
  const posicoes = new Set(); for (let k = 0; k < 40; k++) posicoes.add(embaralhar(orig, sem).indexOf(1));
  assert.ok(posicoes.size > 3, 'o 1 deveria cair em várias posições');
});

test('parâmetro ?investigacao=hospital é lido e sanitizado', () => {
  assert.equal(lerParametros('?investigacao=hospital', 8).investigacao, 'hospital');
  assert.equal(lerParametros('?investigacao=<script>', 8).investigacao, 'script');
  assert.equal(lerParametros('', 8).investigacao, null);
});

async function percurso(pg, errarPrimeiro) {
  const clicar = async (id) => pg.click(`.inv-opcao[data-id="${id}"]`);
  const seguir = async () => { await pg.waitForFunction(() => !document.getElementById('inv-continuar').disabled); await pg.click('#inv-continuar'); };
  await clicar(errarPrimeiro ? 'a' : 'c'); await seguir();                         // 1 recepção
  await pg.click('#inv-registrar-observacao'); await pg.click('#inv-liga'); await pg.click('#inv-registrar-observacao'); // two observed states
  assert.ok((await pg.innerHTML('.inv-visual')).includes('polygon'));
  await clicar('corpo'); assert.match(await pg.textContent('.inv-retorno'), /✗/); await clicar('tubo');
  await pg.waitForSelector('.inv-opcao[data-id="liga"]'); await clicar('osso'); await clicar('liga'); await seguir();
  await clicar('material'); await clicar('rx'); await pg.waitForSelector('.inv-opcao[data-id="seta"]'); await clicar('seta'); await seguir();   // 3 caminho
  await pg.click('#inv-registrar-observacao'); await pg.click('#inv-liga'); await pg.click('#inv-registrar-observacao');
  await clicar('horas'); await clicar('dif'); await pg.waitForSelector('.inv-opcao[data-id="estado"]'); await clicar('estado'); await seguir();   // 4 comparação
  for (const id of ['c1', 'c2', 'c3']) await pg.click(`.inv-cartao[data-id="${id}"]`);                                                           // 5 cartaz
  await pg.click('#inv-verificar'); assert.equal(await pg.isDisabled('#inv-continuar'), true); assert.ok(await pg.$('.inv-cartao.faltou'));
  await pg.click('.inv-cartao[data-id="c4"]'); await pg.click('.inv-cartao[data-id="g1"]'); await pg.click('#inv-verificar'); assert.ok(await pg.$('.inv-cartao.errado'));
  await pg.click('.inv-cartao[data-id="g1"]'); await pg.click('#inv-verificar'); await seguir();
  await clicar('zero'); await clicar('ok'); await seguir();                         // 6 mensagem
  await clicar('igual'); await clicar('ok'); await seguir();                        // 7 retomada
}

test('interface (PT, celular, MODO DE REVISÃO): percurso com erros, observação guardada, ficha e exportação', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    const REV = `try { localStorage.setItem('radiationHunters', JSON.stringify({ settings: { revisao: true } })); } catch (e) {}`;
    const { pg, erros, ctx } = await novaPagina(nav, s.url + '?investigacao=hospital&leitura=1', { idioma: 'pt', viewport: { width: 360, height: 640 }, antes: REV });
    await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
    assert.match(await pg.textContent('.inv-aviso'), /Versão de teste/);
    assert.ok(await pg.$('.inv-selo'));
    await pg.click('.inv-obs summary'); await pg.fill('.inv-nota', 'Teste de observação do revisor');
    const [obs] = await Promise.all([pg.waitForEvent('download'), pg.click('#inv-baixar-obs')]);
    assert.match(obs.suggestedFilename(), /observacoes\.json/);
    await pg.reload(); await pg.waitForSelector('.inv-titulo');                           // a observação sobrevive ao recarregar
    assert.equal(await pg.inputValue('.inv-nota'), 'Teste de observação do revisor');
    await percurso(pg, true);
    await pg.waitForSelector('#inv-menu');
    const ficha = await pg.evaluate(() => ui.investigacao.ficha);
    assert.equal(ficha.revisao, 'revisada');
    assert.match(ficha.hipoteseInicial, /continua emitindo/);
    assert.equal(ficha.observacoes.recepcao, 'Teste de observação do revisor');
    assert.ok(ficha.cenasComMaisDeUmaTentativa.length >= 4);
    assert.match(await pg.textContent('.inv-corpo'), /A resposta final registrada difere da hipótese inicial/);
    assert.match(await pg.textContent('.inv-corpo'), /\[V\]/);   // no modo de revisão os rótulos de fonte aparecem
    const larg = await pg.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth, document.querySelector('.inv-corpo').scrollWidth]);
    assert.ok(larg[0] <= larg[1] + 1 && larg[2] <= larg[1] + 1, JSON.stringify(larg));
    const [dl] = await Promise.all([pg.waitForEvent('download'), (async()=>{await pg.evaluate(()=>{document.getElementById('inv-prof').open=true;});return pg.click('#inv-baixar');})()]);
    assert.match(dl.suggestedFilename(), /radiation-hunters-hospital-imagem\.json/);
    const exportado = JSON.parse(await fs.readFile(await dl.path(), 'utf8'));
    assert.equal(exportado.concluida, true);
    assert.equal(exportado.esquema, 2);
    assert.ok(exportado.versaoJogo && exportado.fontes);
    assert.deepEqual(exportado.historico.filter((r) => r.cena === 'equipamento' && r.etapa === 'principal').map((r) => [r.opcao, r.correta]), [['corpo', false], ['tubo', true]]);
    await pg.click('#inv-menu');
    assert.equal(await pg.$eval('#mission-select', (e) => e.classList.contains('active')), true);
    assert.equal(await pg.$$eval('#missions-container > *', (e) => e.length), 8);
    assert.equal(await pg.$$eval('#investigacoes-container > *', (e) => e.length), 6); // cinco cartões de investigação + o cartão do Laboratório de pesquisa
    assert.deepEqual(erros, []);
    await ctx.close();
  } finally { await nav.close(); await s.fechar?.(); }
});

test('interface (EN, modo normal) pelo menu: cartão abre; voltar numa cena já respondida mantém a resposta; ficha em inglês', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    const { pg, erros, ctx } = await novaPagina(nav, s.url, { idioma: 'en' });
    await pg.click('#btn-missions');
    await pg.click('#aba-investigacoes');
    await pg.click('.investigacao-card');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);   // v3.26: abre como reportagem
    await pg.click('#inv-modo-leitura');
    await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
    assert.match(await pg.textContent('.inv-aviso'), /Fictional hospital and characters/);
    assert.equal(await pg.$('.inv-obs'), null); assert.equal(await pg.$('.inv-selo'), null); assert.equal(await pg.$('#inv-baixar-obs'), null);
    assert.doesNotMatch(await pg.textContent('#investigacoes-container'), /REVIEW|TEST/);
    await pg.click('.inv-opcao[data-id="b"]'); await pg.click('#inv-continuar');
    await pg.click('.inv-voltar'); assert.ok(await pg.$('.inv-opcao.escolhida[data-id="b"]'));
    await pg.click('#inv-continuar');
    await pg.click('#inv-registrar-observacao'); await pg.click('#inv-liga'); await pg.click('#inv-registrar-observacao');
    await pg.click('.inv-opcao[data-id="tubo"]'); await pg.click('.inv-opcao[data-id="liga"]');
    await pg.click('#inv-continuar'); await pg.click('.inv-voltar');
    assert.match(await pg.textContent('.inv-perguntas .inv-resumo'), /X-ray tube/);
    assert.equal(await pg.isDisabled('#inv-continuar'), false);
    await pg.click('#inv-continuar');
    await pg.click('.inv-opcao[data-id="rx"]'); await pg.click('.inv-opcao[data-id="seta"]'); await pg.click('#inv-continuar');
    await pg.click('#inv-registrar-observacao'); await pg.click('#inv-liga'); await pg.click('#inv-registrar-observacao');
    await pg.click('.inv-opcao[data-id="dif"]'); await pg.click('.inv-opcao[data-id="estado"]'); await pg.click('#inv-continuar');
    for (const id of ['c1', 'c2', 'c3', 'c4']) await pg.click(`.inv-cartao[data-id="${id}"]`);
    await pg.click('#inv-verificar'); await pg.click('#inv-continuar');
    await pg.click('.inv-opcao[data-id="ok"]'); await pg.click('#inv-continuar');
    await pg.click('.inv-opcao[data-id="ok"]'); await pg.click('#inv-continuar');
    await pg.waitForSelector('#inv-menu');
    const f = await pg.evaluate(() => ui.investigacao.ficha);
    assert.equal(f.idioma, 'en'); assert.equal(f.revisao, 'confirmada');
    assert.match(await pg.textContent('.inv-corpo'), /Your first hypothesis is consistent/);
    assert.doesNotMatch(await pg.textContent('.inv-corpo'), /\[(V|N|H)[ \]]/);
    assert.deepEqual(f.observacoes, {});
    assert.deepEqual(erros, []);
    await ctx.close();
  } finally { await nav.close(); await s.fechar?.(); }
});

test('Configurações: o modo de revisão liga e desliga, grava e muda o cartão do menu', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    const { pg, erros, ctx } = await novaPagina(nav, s.url, { idioma: 'pt' });
    assert.equal(await pg.evaluate(() => GameState.settings.revisao), false);
    await pg.click('#btn-missions');
    assert.doesNotMatch(await pg.textContent('#investigacoes-container'), /REVISÃO/);
    await pg.evaluate(() => { const c = document.getElementById('revisao-toggle'); c.checked = true; c.dispatchEvent(new Event('change')); });
    assert.equal(await pg.evaluate(() => GameState.settings.revisao), true);
    assert.match(await pg.textContent('#investigacoes-container'), /MODO DE REVISÃO/);
    assert.equal(JSON.parse(await pg.evaluate(() => localStorage.getItem('radiationHunters'))).settings.revisao, true);
    await pg.reload(); await pg.waitForFunction(() => typeof ui !== 'undefined');
    assert.equal(await pg.evaluate(() => document.getElementById('revisao-toggle').checked), true);
    assert.deepEqual(erros, []);
    await ctx.close();
  } finally { await nav.close(); await s.fechar?.(); }
});

test('seleção: abas Missões | Investigações — missões primeiro, inclusive no celular; sair da investigação volta à aba dela', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    const { pg, erros, ctx } = await novaPagina(nav, s.url, { idioma: 'pt', viewport: { width: 360, height: 640 } });
    await pg.click('#btn-missions');
    const vis = (sel) => pg.$eval(sel, (e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0);
    assert.equal(await vis('#missions-container'), true);
    assert.equal(await vis('#investigacoes-container'), false);
    assert.equal(await pg.getAttribute('#aba-missoes', 'aria-selected'), 'true');
    assert.equal(await pg.textContent('#aba-investigacoes'), 'Investigações');
    await pg.click('#aba-investigacoes');
    assert.equal(await vis('#missions-container'), false);
    assert.equal(await vis('#investigacoes-container'), true);
    assert.equal(await pg.getAttribute('#aba-investigacoes', 'aria-selected'), 'true');
    assert.equal(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await pg.click('#aba-missoes');
    assert.equal(await vis('#missions-container'), true);
    assert.deepEqual(erros, []);
    await ctx.close();
  } finally { await nav.close(); await s.fechar?.(); }
});
