// Trilha sonora (12 composições originais por código): estrutura musical em Node; nível e silêncio por renderização
// offline no Chromium; integração com o jogo (cada missão toca a sua trilha, volume 0 = silêncio).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao, passarHistoria } from './helpers/navegador.mjs';
import { TRILHAS, trilhaDaMissao } from '../current/js/musica/trilhas.js';
import { compilar, validarTrilha, duracaoDoCiclo, notaMidi, frequencia, acorde, compilarMelodia } from '../current/js/musica/partitura.js';
import { INVESTIGACOES, PROBLEMAS, prepararProblema } from '../current/js/investigacao/index.js';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

test('notação: notas, acordes e erros de compasso são tratados', () => {
  assert.equal(notaMidi('A4'), 69); assert.equal(notaMidi('C#5'), 73); assert.equal(notaMidi('Bb3'), 58); assert.equal(notaMidi('H4'), null);
  assert.ok(Math.abs(frequencia(69) - 440) < 1e-9);
  assert.deepEqual(acorde('Am').tons, [9, 0, 4]); assert.deepEqual(acorde('G7').tons, [7, 11, 2, 5]); assert.equal(acorde('H'), null);
  assert.deepEqual(compilarMelodia(['C5 - D5 .'], 4), [{ s: 0, d: 2, midi: 72 }, { s: 2, d: 1, midi: 74 }]);
  assert.throws(() => compilarMelodia(['C5 - D5'], 4), /símbolos/);
  assert.throws(() => compilarMelodia(['. - C5 D5'], 4), /sem nota/);
  assert.throws(() => compilarMelodia(['C5 X D5 E5'], 4), /inválida/);
});

test('12 trilhas: uma por missão (1 a 12), nomes PT/EN, todas válidas (escala, tessitura, estilos), 16 compassos, ciclo de 25 a 70 s', () => {
  assert.deepEqual(TRILHAS.map((t) => t.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  for (const t of TRILHAS) {
    assert.ok(t.nome.pt && t.nome.en && t.clima.pt && t.clima.en, t.id);
    assert.deepEqual(validarTrilha(t), [], 'trilha ' + t.id);
    const c = compilar(t);
    assert.equal(c.compassos, 16, 'trilha ' + t.id);
    const s = duracaoDoCiclo(c);
    assert.ok(s >= 25 && s <= 70, `trilha ${t.id}: ${s.toFixed(1)} s`);
    assert.ok(c.melodia.length >= 20 && c.baixo.length > 0 && c.harmonia.length > 0, 'trilha ' + t.id);
    // a melodia nunca ultrapassa o fim do ciclo e as notas não se sobrepõem
    c.melodia.forEach((n, i) => { assert.ok(n.s + n.d <= c.total); if (i) assert.ok(n.s >= c.melodia[i - 1].s + c.melodia[i - 1].d); });
  }
});

test('as trilhas são diferentes entre si (andamento, tom ou melodia) e as sóbrias dos acidentes são lentas', () => {
  const chaves = new Set(TRILHAS.map((t) => JSON.stringify(t.secoes.map((s) => s.melodia))));
  assert.equal(chaves.size, 12);
  for (const id of [2, 4, 8]) assert.ok(trilhaDaMissao(id).bpm <= 72, 'trilha sóbria ' + id);
  assert.equal(trilhaDaMissao(99), null);
});

test('mapa de missões: as 4 investigações têm número 9 a 12, cobertos por trilhas', () => {
  const nums = INVESTIGACOES.filter((i) => i.campo).map((i) => i.campo.numero).sort((a, b) => a - b);
  assert.deepEqual(nums.filter((n) => n >= 9), nums, 'todas ≥ 9');
  nums.forEach((n) => assert.ok(trilhaDaMissao(n), 'sem trilha para ' + n));
});

test('Laboratório de pesquisa: todos os problemas (13 a 16) também têm trilha', () => {
  assert.ok(PROBLEMAS.length >= 4);
  for (const p of PROBLEMAS) {
    const inv = prepararProblema(p.id);
    const n = inv?.campo?.numero;
    assert.ok(n >= 13, 'número do problema ' + p.id);
    assert.ok(trilhaDaMissao(n), 'sem trilha para ' + p.id);
  }
});

test('renderização offline: nenhuma trilha fica muda, estoura ou produz NaN (volume 100%: pico < 0,95; volume padrão: nível audível e moderado)', async () => {
  const pg = await (await nav.newContext()).newPage();
  await pg.goto(srv.url + 'index.html');
  const r = await pg.evaluate(async () => {
    const { TRILHAS } = await import('/js/musica/trilhas.js');
    const { compilar } = await import('/js/musica/partitura.js');
    const { agendarTudo } = await import('/js/musica/sequenciador.js');
    const { GANHO_MUSICA } = await import('/js/audio.js');
    const saida = [];
    for (const t of TRILHAS) {
      const sr = 22050, seg = 14;
      const ctx = new OfflineAudioContext(1, sr * seg, sr);
      const gain = ctx.createGain(); gain.gain.value = GANHO_MUSICA * (t.nivel || 1);   // volume 100%
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; comp.attack.value = 0.005; comp.release.value = 0.2;
      gain.connect(comp); comp.connect(ctx.destination);
      agendarTudo(ctx, gain, compilar(t), seg - 1);
      const buf = await ctx.startRendering();
      const d = buf.getChannelData(0);
      let pico = 0, soma = 0, ruim = 0;
      for (const x of d) { if (!Number.isFinite(x)) ruim++; pico = Math.max(pico, Math.abs(x)); soma += x * x; }
      // trecho de 1 s com menor energia (procura buracos de silêncio longos)
      let minimo = Infinity;
      for (let i = sr * 2; i + sr <= d.length - sr; i += sr / 2) { let e = 0; for (let k = 0; k < sr; k++) e += d[i + k] * d[i + k]; minimo = Math.min(minimo, Math.sqrt(e / sr)); }
      saida.push({ id: t.id, pico, rms: Math.sqrt(soma / d.length), minimo, ruim });
    }
    return saida;
  });
  console.log(r.map((x) => `    trilha ${x.id}: pico ${x.pico.toFixed(2)} rms ${x.rms.toFixed(3)} mín ${x.minimo.toFixed(3)}`).join('\n'));
  const problemas = [];
  for (const x of r) {
    if (x.ruim) problemas.push('NaN na trilha ' + x.id);
    if (!(x.pico < 0.95)) problemas.push(`trilha ${x.id}: pico ${x.pico.toFixed(3)}`);
    if (!(x.rms > 0.08 && x.rms < 0.12)) problemas.push(`trilha ${x.id}: rms ${x.rms.toFixed(4)} fora de 0,08–0,12`);
    if (!(x.minimo > 0.02)) problemas.push(`trilha ${x.id}: trecho quase mudo (${x.minimo.toFixed(4)})`);
  }
  assert.deepEqual(problemas, []);
});

test('no jogo: a missão 1 toca a trilha 1; volume 0 silencia; trocar de missão troca de trilha; sem erros no console', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true });
  try {
    await iniciarMissao(pg, 1);
    const a = await pg.evaluate(async () => { const { audioManager } = await import('/js/audio.js'); return { id: audioManager.music?.id, ganho: audioManager.music?.gain.gain.value, ativo: !!audioManager.music?.seq.timer }; });
    assert.equal(a.id, 1); assert.ok(a.ativo);
    assert.ok(a.ganho >= 0 && a.ganho < 0.5);
    const b = await pg.evaluate(async () => {
      const { audioManager } = await import('/js/audio.js');
      audioManager.setMusicVolume(0); await new Promise((r) => setTimeout(r, 1200));
      const mudo = audioManager.music.gain.gain.value;
      audioManager.setMusicVolume(50); audioManager.startMusic(3); const nova = audioManager.music.id; audioManager.startMusic(3); const mesma = audioManager.music.seq;
      audioManager.startMusic(77); const sem = audioManager.music;
      return { mudo, nova, repetida: audioManager.music === null && mesma != null, sem };
    });
    assert.ok(b.mudo < 0.001, 'volume 0 = silêncio: ' + b.mudo);
    assert.equal(b.nova, 3); assert.equal(b.sem, null, 'missão sem trilha para a música');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('no jogo: toda investigação (4 cartões e os 4 problemas de pesquisa) toca uma trilha', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true });
  try {
    const esperado = [];
    await pg.click('#btn-missions'); await pg.click('#aba-investigacoes');
    for (const inv of INVESTIGACOES) {
      await pg.click(`.investigacao-card[data-investigacao="${inv.id}"]`);
      await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
      await pg.waitForFunction((id) => window.gameScene?.missionData.investigacao === id, inv.id);
      const r = await pg.evaluate(async () => ({ n: window.gameScene.missionData.id, m: (await import('/js/audio.js')).audioManager.music?.id }));
      assert.ok(r.m, 'investigação ' + inv.id + ' sem música'); assert.equal(r.m, r.n === 20 ? 6 : r.n);   // Zaragoza (20) toca a trilha 6
      await pg.click('#inv-caderno'); await pg.click('#inv-menu');
    }
    for (const p of PROBLEMAS) {
      const r = await pg.evaluate(async (id) => {
        const { audioManager } = await import('/js/audio.js');
        ui.abrirInvestigacao(id);
        for (let i = 0; i < 80 && !(window.gameScene && audioManager.music); i++) await new Promise((x) => setTimeout(x, 100));
        return { n: window.gameScene?.missionData.id, m: audioManager.music?.id };
      }, p.id);
      assert.ok(r.m, 'problema ' + p.id + ' sem música');
    }
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('página para ouvir as faixas: lista as 12, toca e para, sem erros', async () => {
  const ctx = await nav.newContext(), pg = await ctx.newPage(), erros = [];
  pg.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', (e) => erros.push(e.message));
  try {
    await pg.goto(srv.url + 'trilhas.html');
    await pg.waitForSelector('#lista li');
    assert.equal(await pg.$$eval('#lista li', (l) => l.length), 12);
    await pg.click('#lista li:nth-child(4) button');
    assert.equal(await pg.evaluate(async () => (await import('/js/audio.js')).audioManager.music?.id), 4);
    await pg.click('#lista li:nth-child(4) button');
    assert.equal(await pg.evaluate(async () => (await import('/js/audio.js')).audioManager.music), null);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('configurações durante a missão: botão na pausa abre as configurações por cima; liga e desliga música e efeitos sem perder o volume; Esc fecha só as configurações', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { todasDesbloqueadas: true, semEncontros: true });
  try {
    await iniciarMissao(pg, 1);
    await pg.keyboard.press('Escape');
    await pg.waitForSelector('#pause-modal.active');
    await pg.click('#btn-settings-pausa');
    assert.ok(await pg.$eval('#settings-modal', (e) => e.classList.contains('active')));
    assert.ok(await pg.$eval('#pause-modal', (e) => e.classList.contains('active')), 'a pausa continua por baixo');
    const estado = () => pg.evaluate(async () => { const { audioManager: a } = await import('/js/audio.js'); return { ganho: a.music.gain.gain.value, vol: a.musicVolume, ef: a.efeitosLigados, tocaClique: (() => { const antes = a.audioContext.currentTime; return antes >= 0; })() }; });
    await pg.waitForTimeout(400);
    const ligada = await estado();
    assert.ok(ligada.ganho > 0.05, 'música audível: ' + ligada.ganho);
    await pg.uncheck('#music-on');
    await pg.waitForTimeout(1200);
    const desl = await estado();
    assert.ok(desl.ganho < 0.001, 'música desligada: ' + desl.ganho); assert.equal(desl.vol, 0.5, 'o volume escolhido não se perde');
    await pg.check('#music-on');
    await pg.waitForTimeout(1200);
    assert.ok((await estado()).ganho > 0.05, 'música volta');
    await pg.uncheck('#sound-on');
    assert.equal((await estado()).ef, false);
    const salvo = await pg.evaluate(() => JSON.parse(localStorage.getItem('radiationHunters')).settings);
    assert.equal(salvo.soundOn, false); assert.equal(salvo.musicOn, true);
    await pg.keyboard.press('Escape');
    assert.equal(await pg.$eval('#settings-modal', (e) => e.classList.contains('active')), false);
    assert.ok(await pg.$eval('#pause-modal', (e) => e.classList.contains('active')), 'Esc fechou só as configurações');
    await pg.keyboard.press('Escape');
    await pg.waitForFunction(() => !document.getElementById('pause-modal').classList.contains('active'));
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('configurações salvas: música desligada continua desligada ao abrir o jogo de novo', async () => {
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { antes: `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1], settings: { musicOn: false, soundOn: false } })); } catch (e) {}` });
  try {
    assert.equal(await pg.$eval('#music-on', (e) => e.checked), false);
    assert.equal(await pg.$eval('#sound-on', (e) => e.checked), false);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('robustez: com uma página antiga em cache (sem as chaves novas de som), o menu continua funcionando', async () => {
  const transformarHtml = (h) => h.replace(/id="music-on"/, 'id="x1"').replace(/id="sound-on"/, 'id="x2"').replace(/id="btn-settings-pausa"/, 'id="x3"');
  const { pg, ctx, erros } = await novaPagina(nav, srv.url, { transformarHtml });
  try {
    assert.equal(await pg.$('#x1') !== null, true, 'a página antiga foi simulada');
    await pg.click('#btn-missions');
    assert.ok(await pg.$eval('#mission-select', (e) => e.classList.contains('active')), 'a tela de missões abre');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});
