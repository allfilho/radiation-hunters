// Missões rápidas (v3.10): chamados de cidadãos. Mapa aleatório por semente e bioma, 1 a 3 fontes, prazo curto, prêmio menor.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, passarHistoria, novoJogo } from './helpers/navegador.mjs';
import { ROBO } from './helpers/robo.mjs';

const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const cria = (ativos) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: true } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 2, iniciado: true, dia: 3, proximoAlerta: null, proximaRapida: 99, ativos: ${JSON.stringify(ativos)} })); } catch (e) {}`;

test('plantas rápidas: determinísticas, pequenas, início livre, tudo alcançável, móveis suficientes, em todos os biomas', async () => {
  const P = await mod('mapa/plantas-rapidas.js'), G = await mod('mapa/gerador.js'), X = await mod('render/mobiliario-externo.js');
  assert.deepEqual(P.gerarPlantaRapida(123, 'urbano'), P.gerarPlantaRapida(123, 'urbano'), 'mesma semente, mesma planta');
  assert.notDeepEqual(P.gerarPlantaRapida(123, 'urbano').planta.blocos, P.gerarPlantaRapida(124, 'urbano').planta.blocos, 'sementes diferentes, plantas diferentes');
  for (const b of P.BIOMAS) for (let s = 1; s <= 40; s++) {
    const g = P.gerarPlantaRapida(s * 7919, b);
    assert.ok(g.cols >= 34 && g.cols <= 42 && g.rows >= 24 && g.rows <= 30, `${b} ${s}: tamanho ${g.cols}x${g.rows}`);
    const d = new G.MapGenerator(g.cols, g.rows, g.mapTheme, { planta: g.planta, id: 100 }).generate();
    const H = d.playerStart; assert.equal(d.map[H.y][H.x], 0, `${b} ${s}: início bloqueado`);
    const vis = new Set([`${H.x},${H.y}`]), fila = [[H.x, H.y]];
    while (fila.length) { const [x, y] = fila.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (!vis.has(k) && d.map[y + dy]?.[x + dx] === 0) { vis.add(k); fila.push([x + dx, y + dy]); } } }
    const alcanca = (f) => { for (let dy = -1; dy <= f.type.height; dy++) for (let dx = -1; dx <= f.type.width; dx++) if (vis.has(`${f.x + dx},${f.y + dy}`)) return true; return false; };
    assert.deepEqual(d.furniture.filter((f) => !alcanca(f)).map((f) => f.type.id), [], `${b} ${s}: móvel inalcançável`);
    assert.ok(d.furniture.filter((f) => !X.ehMovelExterno(f.type.id)).length >= 6, `${b} ${s}: poucos móveis para esconder 3 fontes`);
    for (const p of g.planta.portas) assert.ok([...Array(p.w * p.h).keys()].some((i) => vis.has(`${p.x + (i % p.w)},${p.y + Math.floor(i / p.w)}`)), `${b} ${s}: porta sem acesso`);
  }
});

test('alertas rápidos: calculados da semente; 1 a 3 fontes; regiões e biomas variados; ids válidos; missão completa no formato do jogo', async () => {
  const Rp = await mod('agencia/rapidas.js');
  assert.ok(Rp.ehRapida('q123') && !Rp.ehRapida('m2') && !Rp.ehRapida('q') && !Rp.ehRapida('q1234567890') && !Rp.ehRapida('q12a'));
  const ns = new Set(), bs = new Set(), rs = new Set();
  for (let s = 1; s <= 600; s++) {
    const a = Rp.alertaRapida(s * 104729 % 999999937 + 1); ns.add(a.n); bs.add(a.bioma); rs.add(a.local.pt);
    assert.ok(a.n >= 0 && a.n <= 3 && (a.n > 0 || a.falso) && a.lat >= -60 && a.lat <= 85 && a.local.pt && a.local.en && a.titulo.pt && a.relato.pt && a.relato.en);
    assert.equal(a.tipo, 'rapida'); assert.equal(a.missaoId, 100);
    assert.deepEqual(Rp.alertaRapida(s * 104729 % 999999937 + 1), a, 'determinístico');
  }
  assert.deepEqual([...ns].sort(), [0, 1, 2, 3]);   // v3.21: 0 = falso alarme (sem fonte) assert.equal(bs.size, 6); assert.ok(rs.size > 15);
  const m = Rp.missaoRapida(4242, 'en'), a = Rp.alertaRapida(4242);
  assert.equal(m.rapida, true); assert.equal(m.numSources, a.n); assert.equal(m.titulo, a.titulo.en); assert.equal(m.storyText, a.relato.en);
  assert.deepEqual(m.allowedIsotopes, [a.iso]); assert.ok(m.mapCols <= 64 && m.mapRows <= 64); assert.ok(m.timeLimit > 0 && m.timeLimit <= 270);
  assert.equal(Rp.alertaPorId('q4242').id, 'q4242'); assert.equal(Rp.alertaPorId('m2').id, 'm2'); assert.equal(Rp.alertaPorId('zzz'), undefined);
});

test('perfis de fonte: cada isótopo real se separa de todos os seus distratores com as placas do jogo (como o teste 36)', async () => {
  const Rp = await mod('agencia/rapidas.js'), { ISOTOPES } = await mod('data/isotopes.js'), G = await mod('fisica/geiger.js'), C = await mod('fisica/componentes.js'), { SHIELDS } = await mod('data/shields.js');
  const iso = (n) => ISOTOPES.find((i) => i.name === n); const livre = { tileM: 0.5, paredeCm: 30, ehParede: () => false };
  const ALFA = new Set(['Am-241', 'Ra-226', 'Po-210', 'U-238']);
  const assin = (n) => { const i = iso(n), f = { type: i.type, base: i.minBase, x: 10, y: 10, rect: { x: 9.5, y: 9.5, w: 1, h: 1 }, found: false, energyMeV: i.energyMeV, betaRangeMgCm2: i.betaRangeMgCm2, componentes: C.componentesDe(i) }; const tx = (s) => G.taxaFonte(f, { x: 9, y: 10, dir: 0 }, { ...livre, blindagem: s.material ? s : null }); const t0 = tx(SHIELDS[0]); return t0 > 0 ? SHIELDS.slice(1).map((s) => tx(s) / t0) : null; };
  const sep = (a, b) => { if (ALFA.has(a) && ALFA.has(b)) return false; if (ALFA.has(a) || ALFA.has(b)) return true; const x = assin(a), y = assin(b); return Math.max(...x.map((v, k) => Math.abs(v - y[k]))) >= 0.1; };
  for (const p of Rp.PERFIS_FONTE) { assert.ok(iso(p.iso), p.iso); assert.ok(p.extras.length >= 3); for (const e of p.extras) { assert.ok(iso(e), e); assert.ok(sep(p.iso, e), `${p.iso} x ${e}`); } }
  for (const r of Rp.REGIOES) assert.ok(Rp.PERFIS_FONTE.some((p) => p.biomas.includes(r.bioma)), 'bioma sem perfil: ' + r.bioma);
});

test('simulação: chamados surgem em calendário próprio (máx. 2), vencem com −1, não tomam vaga das missões, salvam e carregam; concluir paga pouco', async () => {
  const S = await mod('agencia/simulacao.js'), Rp = await mod('agencia/rapidas.js');
  let x = 7; const rand = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
  const e = S.novoEstado(); S.iniciar(e, 0);
  let max = 0, novos = 0, venc = 0, maxHist = 0;
  for (let i = 0; i < 120; i++) { const ev = S.avancarDia(e, rand); novos += ev.filter((v) => v.tipo === 'novo' && Rp.ehRapida(v.id)).length; venc += ev.filter((v) => v.tipo === 'expirou' && Rp.ehRapida(v.id)).length; max = Math.max(max, e.ativos.filter((a) => Rp.ehRapida(a.id)).length); maxHist = Math.max(maxHist, e.ativos.filter((a) => !Rp.ehRapida(a.id)).length); }
  assert.ok(max <= 2 && max >= 1); assert.ok(novos >= 12 && venc >= 6, `novos ${novos}, vencidos ${venc}`); assert.ok(maxHist <= 3 && maxHist >= 2, 'missões da história seguem com as suas 3 vagas');
  const rel = S.sanear(JSON.parse(JSON.stringify(e)));
  assert.deepEqual(rel.ativos, e.ativos); assert.equal(rel.proximaRapida, e.proximaRapida);
  // save antigo (sem os campos novos) continua válido
  const antigo = S.sanear({ v: 2, iniciado: true, dia: 5, ativos: [{ id: 'm2', desde: 3, expira: 17 }] });
  assert.equal(antigo.proximaRapida, null); assert.equal(antigo.rapidasFeitas, 0); S.avancarDia(antigo, rand); assert.ok(antigo.proximaRapida >= 6);
  // vencimento: −1; ids falsos são descartados
  const f = S.novoEstado(); f.iniciado = true; f.dia = 10; f.ativos = [{ id: 'q55', desde: 10, expira: 11 }]; f.proximaRapida = 500; f.proximoAlerta = 500;
  S.avancarDia(f, rand); assert.equal(f.nota, -1); assert.equal(f.ativos.length, 0);
  const lixo = S.sanear({ iniciado: true, ativos: [{ id: 'q12a', desde: 0, expira: 5 }, { id: 'q1', desde: 0, expira: 5 }, { id: 'q2', desde: 0, expira: 5 }, { id: 'q3', desde: 0, expira: 5 }] });
  assert.deepEqual(lixo.ativos.map((a) => a.id), ['q1', 'q2']);
  // concluir: 180 × fator das estrelas; nota +1; contador
  const c = S.novoEstado(); c.ativos = [{ id: 'q9', desde: 0, expira: 9 }];
  assert.equal(S.concluir(c, 'q9', 3), 234); assert.equal(c.nota, 1); assert.equal(c.rapidasFeitas, 1); assert.equal(c.creditos, 234);
});

test('Agência: chamado aparece no mapa, voo, missão com mapa gerado, conclusão paga e a missão 3 não é desbloqueada por ela', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: cria([{ id: 'q4242', desde: 3, expira: 10 }]) });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino.rapida');
    assert.equal(await pg.$$eval('.ag-pino.rapida', (e) => e.length), 1);
    await pg.click('.ag-item[data-alerta="q4242"]');
    const det = await pg.textContent('#ag-detalhe');
    assert.match(det, /Chamado de cidadão/); assert.match(det, /Relato fictício/); assert.match(det, /faltam 7 dias/);
    await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-chegar'); await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' });
    await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    const info = await pg.evaluate(() => { const s = window.gameScene; return { n: s.sources.length, c: s.mapCols, r: s.mapRows, rap: s.missionData.rapida, ext: s.sources.filter((q) => ['tree', 'lamp_post', 'parked_car'].includes(q.furniture.type.id)).length, enc: s.encontros.ativo, nome: document.getElementById('hud-mission-name').textContent }; });
    const esperado = await pg.evaluate(async () => (await import('/js/agencia/rapidas.js')).alertaRapida(4242).n);
    assert.equal(info.n, esperado); assert.equal(info.rap, true); assert.ok(info.c <= 42 && info.r <= 30); assert.equal(info.ext, 0); assert.equal(info.enc, false); assert.match(info.nome, /Chamado/);
    const r = await pg.evaluate(ROBO); assert.ok(r.ok, JSON.stringify(r));
    // v3.17: chamado rápido também exige levar as fontes ao ponto H antes do balanço
    await pg.waitForFunction(() => window.gameScene.faseColeta === true, null, { timeout: 40000 });
    await pg.evaluate(() => { const s = window.gameScene, T = 32; s.player.setPosition(s.pontoColeta.x * T, s.pontoColeta.y * T); });
    await pg.waitForSelector('#complete-modal.active', { timeout: 40000 });
    await pg.evaluate(() => ui.voltarDaMissao(true));
    await pg.waitForSelector('#agencia-screen.active .ag-mapa');
    assert.match(await pg.textContent('.ag-relatorio'), /Créditos: \+\d+|\+\d+/);
    const fim = await pg.evaluate(() => ({ cred: ui.agencia.est.creditos, ativo: ui.agencia.est.ativos.some((a) => a.id === 'q4242'), feitas: ui.agencia.est.rapidasFeitas, desb: GameState.unlockedMissions, best: Object.keys(GameState.bestStars) }));
    assert.ok(fim.cred >= 126 && fim.cred <= 234, 'prêmio 180 × (0,7 a 1,3): ' + fim.cred); assert.equal(fim.ativo, false); assert.equal(fim.feitas, 1);
    assert.deepEqual(fim.desb, [1, 2]); assert.ok(!fim.best.includes('100') && !fim.best.includes('101'));
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});

test('Agência: chamado em inglês e no celular (390×844) cabe na tela sem rolagem horizontal', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'en', viewport: { width: 390, height: 844 }, toque: true, antes: cria([{ id: 'q777', desde: 3, expira: 10 }, { id: 'q778', desde: 3, expira: 9 }]) });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino.rapida');
    assert.match(await pg.textContent('.ag-lista'), /Citizen call/);
    assert.equal(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
