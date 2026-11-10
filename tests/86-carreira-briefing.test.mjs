// v3.39: carreira dos cientistas (postos, bônus, pensamento, aposentadoria e Mural) e briefing do dia.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo, passarHistoria } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('postos e promoções: 3, 8 e 15 missões; cada promoção oferece 2 bônus; bônus não se repetem', async () => {
  const C = await mod('agencia/carreira.js');
  const m = { missoes: 0, escolhas: {} };
  assert.equal(C.postoDe(m), 'iniciante'); assert.equal(C.faltamParaProximo(m), 3);
  assert.equal(C.registrarMissao(m), null); C.registrarMissao(m);
  assert.equal(C.registrarMissao(m), 'especialista'); assert.equal(C.promocaoPendente(m), 'especialista');
  assert.deepEqual(C.ofertaDe(m, 'especialista'), ['agilidade', 'manuseio']);
  assert.equal(C.escolherBonus(m, 'precisao'), false, 'fora da oferta');
  assert.equal(C.escolherBonus(m, 'manuseio'), true); assert.equal(C.promocaoPendente(m), null);
  assert.equal(C.fatorCarreira(m, 'coleta'), 0.7); assert.equal(C.fatorCarreira(m, 'velocidade'), 1); assert.equal(C.fatorCarreira(m, 'retorno'), 0);
  m.missoes = 15; assert.equal(C.postoDe(m), 'referencia'); assert.equal(C.faltamParaProximo(m), null);
  assert.equal(C.promocaoPendente(m), 'senior'); C.escolherBonus(m, 'recuperacao');
  assert.deepEqual(C.ofertaDe(m, 'referencia'), ['agilidade', 'precisao']);
  C.escolherBonus(m, 'agilidade'); assert.equal(C.fatorCarreira(m, 'velocidade'), 1.08); assert.equal(C.fatorCarreira(m, 'retorno'), 0.05);
});

test('bônus de carreira somam ao da especialidade (equipe.js) e o save saneia carreira, mural e briefing', async () => {
  const E = await mod('agencia/equipe.js'), S = await mod('agencia/simulacao.js');
  const m = E.novoCientista('c9', 'Rui', 'caio', 'campo'); m.escolhas = { especialista: 'manuseio' };
  assert.equal(E.bonusDe(m, 'coleta'), 0.5 * 0.7);
  const f = E.novoCientista('c8', 'Iara', 'lara', 'fisica'); f.escolhas = { senior: 'precisao' };
  assert.equal(E.bonusDe(f, 'erroId'), 0.25);
  const e = S.sanear({ iniciado: true, equipe: [{ id: 'c1', nome: 'Ana', missoes: 4.4, escolhas: { especialista: 'agilidade', senior: 'agilidade', x: 'y' } }], mural: [{ nome: 'Zé', missoes: 21, dia: 300 }, 7], briefing: { dia: 9, acertos: 2, vistas: ['N01-1', 3] } });
  assert.equal(e.equipe[0].missoes, 4); assert.deepEqual(e.equipe[0].escolhas, { especialista: 'agilidade' });
  assert.equal(e.mural.length, 1); assert.equal(e.mural[0].nome, 'Zé');
  assert.deepEqual(e.briefing, { dia: 9, acertos: 2, respostas: 0, vistas: ['N01-1'] });
  const v = S.sanear(null); assert.deepEqual(v.mural, []); assert.equal(v.briefing.dia, -1);
});

test('aposentadoria: só Referência com 20 missões, fora de viagem; vai ao Mural e dá +1 de nota', async () => {
  const C = await mod('agencia/carreira.js'), S = await mod('agencia/simulacao.js');
  const e = S.sanear({ iniciado: true, dia: 50, nota: 3, equipe: [{ id: 'c1', nome: 'Ana', missoes: 19 }, { id: 'c2', nome: 'Bruno', missoes: 20, ocupadoAte: 60 }] });
  assert.equal(C.aposentar(e, 'c1'), null, '19 missões');
  assert.equal(C.aposentar(e, 'c2'), null, 'em viagem');
  e.equipe[1].ocupadoAte = 0;
  const reg = C.aposentar(e, 'c2');
  assert.equal(reg.nome, 'Bruno'); assert.equal(e.equipe.length, 1); assert.equal(e.mural.length, 1); assert.equal(e.nota, 4);
  e.equipe[0].missoes = 25; assert.equal(C.aposentar(e, 'c1'), null, 'o último cientista não se aposenta');
});

test('pensamentos: o estado decide a frase (tratamento, promoção, caneta, cansaço, novato, veterano)', async () => {
  const C = await mod('agencia/carreira.js');
  assert.equal(C.pensamento({ tratamento: true, missoes: 5 }, 1, 0, 0), 'tratamento');
  assert.equal(C.pensamento({ missoes: 3, escolhas: {} }, 1, 0.9, 0), 'promocao');
  assert.equal(C.pensamento({ missoes: 1 }, 1, 0.8, 0), 'vermelho');
  assert.equal(C.pensamento({ missoes: 1 }, 1, 0.6, 0), 'amarelo');
  assert.equal(C.pensamento({ missoes: 1 }, 1, 0.1, 3), 'cansado');
  assert.equal(C.pensamento({ missoes: 0 }, 1, 0, 0), 'novato');
  assert.equal(C.pensamento({ missoes: 9, escolhas: { especialista: 'agilidade', senior: 'precisao' } }, 1, 0, 0), 'veterano');
  assert.equal(C.pensamento({ missoes: 1 }, 1, 0, 0), 'pronto');
  const T = await mod('agencia/textos.js');
  for (const lang of ['pt', 'en']) for (const k of ['tratamento', 'promocao', 'vermelho', 'amarelo', 'cansado', 'novato', 'aposentar', 'veterano', 'pronto']) assert.ok(T.TXT[lang].pensa[k], `${lang}.${k}`);
});

test('briefing: uma pergunta por dia, determinística, sem repetir as recentes; acerto paga uma vez', async () => {
  const C = await mod('agencia/carreira.js'), P = await mod('data/encontros/perguntas.js'), S = await mod('agencia/simulacao.js');
  const p1 = C.perguntaDoBriefing(P.PERGUNTAS, 12, []);
  assert.equal(C.perguntaDoBriefing(P.PERGUNTAS, 12, []).id, p1.id);
  assert.ok(p1.nivel <= 2 && !p1.no.startsWith('E-'));
  assert.notEqual(C.perguntaDoBriefing(P.PERGUNTAS, 12, [p1.id]).id, p1.id);
  const e = S.sanear({ iniciado: true, dia: 12, creditos: 100 });
  assert.equal(C.briefingPendente(e), true);
  assert.equal(C.responderBriefing(e, p1.id, true), 30); assert.equal(e.creditos, 130);
  assert.equal(C.briefingPendente(e), false); assert.equal(C.responderBriefing(e, p1.id, true), 0); assert.equal(e.creditos, 130);
  e.dia = 13; assert.equal(C.responderBriefing(e, 'x', false), 0); assert.equal(e.briefing.acertos, 1); assert.equal(e.briefing.respostas, 2);
});

const EST = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 3, iniciado: true, dia: 12, proximoAlerta: null, proximaRapida: 99, creditos: 100, ativos: [{ id: 'm2', desde: 12, expira: 26 }],
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b3',tipo:'academia',x:2,y:0,pronto:0},{id:'b4',tipo:'cofre',x:3,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0}],
    equipe: [{ id: 'c1', nome: 'Ana', retrato: 'lara', especialidade: 'campo', doses: [], missoes: 2 }, { id: 'c2', nome: 'Bruno', retrato: 'caio', especialidade: 'fisica', doses: [], missoes: 22, escolhas: { especialista: 'agilidade', senior: 'precisao', referencia: 'manuseio' } }, { id: 'c3', nome: 'Carla', retrato: 'dora', especialidade: 'medicina', doses: [], missoes: 0 }] }, ${JSON.stringify(extra || {})}))); } catch (e) {} `;

for (const [w, h] of [[1280, 720], [390, 844]]) {
  for (const lang of ['pt', 'en']) {
    test(`telas (${w}×${h}, ${lang}): briefing no mapa; promoção depois da missão; escolha no Alojamento; aposentadoria vai ao Mural`, async () => {
      const srv = await servidor(), nav = await abrirNavegador();
      try {
        const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, viewport: { width: w, height: h }, toque: w < 800, antes: EST() });
        await novoJogo(pg); await pg.waitForSelector('#ag-briefing');
        assert.match(await pg.textContent('#ag-briefing'), lang === 'pt' ? /Briefing do dia.*Acertar rende 30 créditos/s : /Daily briefing.*A right answer earns 30 credits/s);
        // responde certo usando a resposta registrada
        const certa = await pg.evaluate(async () => { const id = document.querySelector('#ag-briefing').dataset.pergunta; const P = (await import('./js/data/encontros/perguntas.js')).PERGUNTAS.find((x) => x.id === id); return String(P.correta); });
        await pg.click(`[data-ag="briefing"][data-v="${certa}"]`);
        assert.match(await pg.textContent('#ag-briefing'), lang === 'pt' ? /Certo! \+30 créditos/ : /Right! \+30 credits/);
        assert.equal(await pg.evaluate(() => ui.agencia.est.creditos), 130);
        assert.equal(await pg.$$eval('[data-ag="briefing"]', (x) => x.length), 0, 'uma vez por dia');
        // missão concluída com Ana e Bruno (os dois primeiros embarcam): Ana chega a 3 missões (Especialista)
        await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-plano');
        await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
        await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
        await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
        const rel = await pg.evaluate(() => { GameState.ultimaConclusao = { id: 2, estrelas: 2 }; GameState.doseMissao = 0; ui.voltarAgencia(true); return ui.agencia.relatorio; });
        assert.match(rel, lang === 'pt' ? /Ana chegou a Especialista\. Escolha o bônus da promoção no Alojamento\./ : /Ana reached Specialist\. Choose the promotion bonus in the Quarters\./);
        assert.deepEqual(await pg.evaluate(() => ui.agencia.est.equipe.map((m) => m.missoes)), [3, 23, 0]);
        // Alojamento: promoção pendente de Ana; escolher Manuseio
        await pg.evaluate(() => { ui.agencia.voo = null; ui.agencia.vista = 'base'; ui.agencia.abrirSala('alojamento'); });
        await pg.waitForSelector('[data-carreira="c1"]');
        const ana = await pg.textContent('[data-carreira="c1"]');
        assert.match(ana, lang === 'pt' ? /Especialista · 3 missões · próximo posto em 5/ : /Specialist · 3 missions · next rank in 5/);
        assert.match(ana, lang === 'pt' ? /Promoção! Qual bônus/ : /I got promoted! Which bonus/);
        await pg.click('[data-ag="carreira"][data-m="c1"][data-b="manuseio"]');
        assert.deepEqual(await pg.evaluate(() => ui.agencia.est.equipe[0].escolhas), { especialista: 'manuseio' });
        assert.match(await pg.textContent('[data-carreira="c1"]'), lang === 'pt' ? /Manuseio: 30 % menos dose na coleta/ : /Handling: 30 % less dose when collecting/);
        assert.match(await pg.textContent('[data-carreira="c3"]'), lang === 'pt' ? /Iniciante · 0 missões.*Ainda não fui a campo/s : /Rookie · 0 missions.*I have not been to the field yet/s);
        // Bruno (Referência, 22 missões, voltando do voo) só pode se aposentar depois do pouso
        await pg.evaluate(() => { const b = ui.agencia.est.equipe[1]; b.ocupadoAte = 0; ui.agencia.desenhar(false); });
        await pg.click('[data-ag="aposentar"][data-m="c2"]');
        assert.match(await pg.evaluate(() => ui.agencia.relatorio), lang === 'pt' ? /Bruno se aposentou depois de 23 missões/ : /Bruno retired after 23 missions/);
        await pg.evaluate(() => ui.agencia.abrirSala('comando'));
        assert.match(await pg.textContent('#ag-mural'), lang === 'pt' ? /Mural da Agência.*Bruno.*23 missões/s : /Agency Wall.*Bruno.*23 missions/s);
        const sw = await pg.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= w + 1, `sem rolagem horizontal (${sw})`);
        if (lang === 'en') assert.doesNotMatch(await pg.evaluate(() => document.querySelector('.agencia, #agencia, body').innerText), /Missões|Promoção|Aposentar|Mural da/);
        assert.deepEqual(erros, []);
      } finally { await nav.close(); await srv.fechar(); }
    });
  }
}

test('agilidade: o cientista ativo com o bônus anda 8 % mais rápido em campo', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: EST() });
    await novoJogo(pg); await pg.waitForSelector('.ag-pino');
    await pg.click('.ag-item[data-alerta="m2"]'); await pg.click('[data-ag="enviar"]'); await pg.waitForSelector('#ag-plano');
    await pg.click('[data-assento="1"]'); await pg.click('[data-ag="passar-frente"]');
    await pg.click('[data-ag="decolar"]'); await pg.waitForSelector('#ag-rota'); await pg.click('#ag-chegar');
    await pg.waitForSelector('#story-continue', { state: 'visible' }); await passarHistoria(pg);
    await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
    assert.equal(await pg.evaluate(() => ui.agencia.cientistaAtivo()), 'c2');
    assert.equal(await pg.evaluate(() => window.gameScene.fatorVelocidade()), 1.08);
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
