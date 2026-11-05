// Rastreabilidade da investigação e limites das conclusões.
import test from 'node:test';
import assert from 'node:assert/strict';
import { criarSessao, registrarHipotese, avaliarOpcao, avaliarCartoes, montarFicha, resolver } from '../current/js/investigacao/motor.js';
import { HOSPITAL } from '../current/js/investigacao/hospital.js';
import { lerParametros } from '../current/js/modo.js';
import { servidor, abrirNavegador, novaPagina, passarHistoria } from './helpers/navegador.mjs';
const inv = resolver(HOSPITAL, 'pt');
const cena = (id) => inv.cenas.find((c) => c.id === id);

test('hipótese confirmada ao sair da recepção não pode ser apagada pelo motor', () => {
  const s = criarSessao(HOSPITAL);
  registrarHipotese(s, cena('recepcao'), 'a');
  registrarHipotese(s, cena('recepcao'), 'c'); // ainda pode escolher antes de continuar
  s.concluidas.recepcao = true;
  registrarHipotese(s, cena('recepcao'), 'b');
  assert.equal(s.registro.recepcao.opcao, 'c');
  assert.equal(montarFicha(s, HOSPITAL, 'pt').revisao, 'em-andamento');
});

test('ficha conserva respostas erradas, cartões, versão e fontes sem afirmar conclusão prematura', () => {
  const s = criarSessao(HOSPITAL);
  registrarHipotese(s, cena('recepcao'), 'a');
  avaliarOpcao(s, cena('equipamento'), 'principal', 'corpo');
  avaliarOpcao(s, cena('equipamento'), 'principal', 'tubo');
  avaliarOpcao(s, cena('equipamento'), 'evidencia', 'liga');
  avaliarCartoes(s, cena('cartaz'), ['c1', 'g1']);
  avaliarCartoes(s, cena('cartaz'), ['c1', 'c2', 'c3', 'c4']);
  const f = JSON.parse(JSON.stringify(montarFicha(s, HOSPITAL, 'pt')));
  assert.equal(f.esquema, 2);
  assert.ok(f.versaoJogo && f.fontes.includes('CDC'));
  assert.equal(f.concluida, false);
  assert.deepEqual(f.historico.slice(0, 2).map((x) => [x.opcao, x.correta]), [['corpo', false], ['tubo', true]]);
  assert.deepEqual(f.historico[3].cartoes.map((x) => x.id), ['c1', 'g1']);
  assert.equal(f.historico[4].correta, true);
});

test('parâmetro de missão exige inteiro completo, sem aceitar prefixos de texto', () => {
  for (const n of ['3abc', '3.5', '3e0', ' 3', 'Infinity', '1<script>']) assert.equal(lerParametros('?missao=' + encodeURIComponent(n)).missao, null, n);
  assert.equal(lerParametros('?missao=8').missao, 8);
});

test('distribuição local inicia com Phaser real e rede externa bloqueada, sem substituir recursos', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const ctx = await nav.newContext(), pg = await ctx.newPage(), erros = [];
    pg.on('pageerror', (e) => erros.push(e.message));
    await pg.route('**/*', (r) => r.request().url().startsWith(srv.url) ? r.continue() : r.abort());
    await pg.goto(srv.url + '?investigacao=hospital&leitura=1');
    await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
    assert.ok(await pg.evaluate(() => typeof Phaser.Scene === 'function'));
    await pg.click('.inv-opcao[data-id="c"]'); await pg.click('#inv-continuar');
    assert.ok(await pg.$('.inv-svg'));
    assert.deepEqual(erros, []); await ctx.close();
  } finally { await nav.close(); await srv.fechar(); }
});

test('interface: voltar preserva hipótese; título recebe foco; SVG descreve estado e caminho', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, ctx, erros } = await novaPagina(nav, srv.url + '?investigacao=hospital&leitura=1', { idioma: 'pt' });
    await pg.waitForSelector('.inv-titulo');
    await pg.click('.inv-sair');
    assert.equal(await pg.getAttribute('.investigacao-card', 'role'), 'button');
    await pg.focus('.investigacao-card'); await pg.keyboard.press('Enter');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);   // v3.26: abre como reportagem
    await pg.click('#inv-modo-leitura');
    await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
    await pg.click('.inv-opcao[data-id="a"]'); await pg.click('#inv-continuar');
    assert.equal(await pg.evaluate(() => document.activeElement.className), 'inv-titulo');
    assert.match(await pg.getAttribute('.inv-svg', 'aria-label'), /DESLIGADO/);
    await pg.click('#inv-liga');
    assert.match(await pg.getAttribute('.inv-svg', 'aria-label'), /LIGADO.*Tubo de raios X.*Paciente.*Detector/);
    await pg.click('.inv-voltar');
    assert.equal(await pg.isDisabled('.inv-opcao[data-id="b"]'), true);
    assert.match(await pg.textContent('.inv-retorno'), /preservada/);
    assert.equal(await pg.evaluate(() => ui.investigacao.sessao.registro.recepcao.opcao), 'a');
    assert.deepEqual(erros, []); await ctx.close();
  } finally { await nav.close(); await srv.fechar(); }
});

test('modo de revisão tolera notas corrompidas e descarta cenas desconhecidas', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const antes = `localStorage.setItem('radiationHunters', JSON.stringify({settings:{revisao:true}})); localStorage.setItem('radiationHuntersRevisao', JSON.stringify({'hospital-imagem':{recepcao:42,equipamento:'Observação válida',fantasma:'descartar'}}));`;
    const { pg, ctx, erros } = await novaPagina(nav, srv.url + '?investigacao=hospital&leitura=1', { idioma: 'pt', antes });
    await pg.waitForSelector('.inv-nota', { state: 'attached' });
    assert.equal(await pg.inputValue('.inv-nota'), '');
    assert.deepEqual(await pg.evaluate(() => ui.investigacao.sessao.notas), { equipamento: 'Observação válida' });
    await pg.click('.inv-opcao[data-id="c"]'); await pg.click('#inv-continuar');
    assert.equal(await pg.inputValue('.inv-nota'), 'Observação válida');
    assert.deepEqual(erros, []); await ctx.close();
  } finally { await nav.close(); await srv.fechar(); }
});
