// v3.28: Fase B — isótopos entregues, árvore de pesquisa, engenheiros, Oficina com fila, save v3.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);
const novo = async () => { const S = await mod('agencia/simulacao.js'), F = await mod('agencia/frota.js'), C = await mod('agencia/ciencia.js'); const e = S.sanear(null); e.creditos = 20000; e.modulos.push({ id: 'b60', tipo: 'laboratorio', x: 3, y: 1, pronto: 0 }); return { S, F, C, e }; };

test('coleta guarda os isótopos, a entrega os põe no inventário e ignora nomes inválidos', async () => {
  const { S, F, C, e } = await novo();
  e.ativos.push({ id: 'm2', desde: 0, expira: 99 }); e.iniciado = true;
  assert.equal(F.registrarColeta(e, 'm2', 3, ['Cs-137', 'Co-60', '<b>x</b>', 7]), true);
  assert.deepEqual(e.coleta[0].isotopos, ['Cs-137', 'Co-60']);
  const r = F.enviarResgate(e, e.coleta[0].id, ['c1']); assert.equal(r.ok, false, 'falta nave de resgate'); // só há a de tripulação
  e.naves.push({ id: 'n9', tipo: 'resgate', livreEm: 0, missao: null }); e.modulos.push({ id: 'b61', tipo: 'hangar', x: 4, y: 0, pronto: 0 });
  const r2 = F.enviarResgate(e, e.coleta[0].id, ['c1']); assert.equal(r2.ok, true);
  e.proximoAlerta = 999; e.proximaRapida = 999;
  for (let i = 0; i < 4; i++) S.avancarDia(e, () => 0.5);
  assert.equal(e.colhidas['Cs-137'], 1); assert.equal(e.colhidas['Co-60'], 1); assert.equal(Object.keys(e.colhidas).length, 2);
});

test('gatilho: a espectrometria só aparece com Cs-137 E Co-60; nêutrons ficam bloqueados', async () => {
  const { C, e } = await novo();
  assert.equal(C.estadoNo(e, 'espectrometriaGama'), 'oculta');
  C.registrarColhidas(e, ['Cs-137']); assert.equal(C.estadoNo(e, 'espectrometriaGama'), 'oculta');
  C.registrarColhidas(e, ['Co-60']); assert.equal(C.estadoNo(e, 'espectrometriaGama'), 'disponivel');
  assert.equal(C.estadoNo(e, 'sondaAlfa'), 'oculta'); C.registrarColhidas(e, ['Am-241']); assert.equal(C.estadoNo(e, 'sondaAlfa'), 'disponivel');
  assert.equal(C.estadoNo(e, 'detectorNeutrons'), 'bloqueada');
  assert.equal(C.iniciarCiencia(e, 'detectorNeutrons', true).motivo, 'bloqueada');
});

test('pesquisa: exige laboratório, créditos, uma por vez; conclui no dia certo', async () => {
  const { F, C, e } = await novo();
  C.registrarColhidas(e, ['Cs-137', 'Co-60', 'Am-241']);
  assert.equal(C.iniciarCiencia(e, 'espectrometriaGama', false).motivo, 'laboratorio');
  e.creditos = 100; assert.equal(C.iniciarCiencia(e, 'espectrometriaGama', true).motivo, 'creditos'); e.creditos = 20000;
  const r = C.iniciarCiencia(e, 'espectrometriaGama', F.temLaboratorio(e)); assert.equal(r.ok, true); assert.equal(e.creditos, 18000);
  assert.equal(C.iniciarCiencia(e, 'sondaAlfa', true).motivo, 'ocupado');
  assert.equal(C.iniciarCiencia(e, 'espectrometriaGama', true).motivo, 'ja');
  e.dia = r.pronto - 1; assert.deepEqual(C.avancarCiencia(e, true), []); e.dia = r.pronto;
  assert.deepEqual(C.avancarCiencia(e, true).map((x) => x.tipo), ['ciencia']); assert.equal(C.estadoNo(e, 'espectrometriaGama'), 'concluida');
});

test('engenheiros e Oficina: sem engenheiro não fabrica; com 1 a fila anda um por vez; com 2, em paralelo', async () => {
  const { F, C, e } = await novo();
  C.registrarColhidas(e, ['Cs-137', 'Co-60', 'Am-241']);
  C.iniciarCiencia(e, 'espectrometriaGama', true); C.iniciarCiencia(e, 'sondaAlfa', true);
  e.dia = 30; C.avancarCiencia(e, true); C.iniciarCiencia(e, 'sondaAlfa', true); e.dia = 60; C.avancarCiencia(e, true);
  assert.equal(C.enfileirar(e, 'espectrometro', true).motivo, 'engenheiro');
  e.candidatos = [{ id: 'k1', nome: 'Rui', retrato: 'caio', expira: 99, funcao: 'engenheiro' }, { id: 'k2', nome: 'Zeca', retrato: 'leo', expira: 99, funcao: 'engenheiro' }];
  e.modulos.push({ id: 'b62', tipo: 'alojamento', x: 4, y: 1, pronto: 0 });
  assert.equal(F.contratar(e, 'k1').ok, true); assert.equal(e.engenheiros.length, 1); assert.equal(e.equipe.length, 4, 'engenheiro não entra na equipe de campo');
  assert.equal(F.equipeDisponivel(e).some((m) => m.nome === 'Rui'), false);
  assert.equal(C.enfileirar(e, 'espectrometro', true).ok, true); assert.equal(C.enfileirar(e, 'sondaAlfa', true).ok, true);
  C.avancarCiencia(e, true); assert.equal(e.fila.filter((f) => f.eng).length, 1, 'um engenheiro, um item por vez');
  assert.equal(F.contratar(e, 'k2').ok, true); C.avancarCiencia(e, true); assert.equal(e.fila.filter((f) => f.eng).length, 2, 'dois em paralelo');
  e.dia += 10; const ev = C.avancarCiencia(e, true); assert.equal(ev.filter((x) => x.tipo === 'fabricado').length, 2);
  assert.equal(e.equipamentos.espectrometro, 1); assert.equal(e.equipamentos.sondaAlfa, 1); assert.equal(e.fila.length, 0);
  assert.equal(C.enfileirar(e, 'camaraIonizacao', true).motivo, 'pesquisaEquip');
  assert.equal(C.enfileirar(e, 'espectrometro', false).motivo, 'oficina');
});

test('contratar engenheiro exige cama e crédito; fim do mês traz um candidato engenheiro quando não há nenhum', async () => {
  const { S, F, e } = await novo();
  e.candidatos = [{ id: 'k1', nome: 'Rui', retrato: 'caio', expira: 99, funcao: 'engenheiro' }];
  e.creditos = 100; assert.equal(F.contratar(e, 'k1').motivo, 'creditos'); e.creditos = 5000;
  e.modulos = e.modulos.filter((m) => m.tipo !== 'alojamento'); assert.equal(F.contratar(e, 'k1').motivo, 'camas');
  const e2 = S.sanear(null); e2.candidatos = []; F.renovarCandidatos(e2, () => 0.3);
  assert.equal(e2.candidatos.filter((c) => c.funcao === 'engenheiro').length, 1); assert.equal(e2.candidatos.length, 3);
});

test('save: v2 antigo continua válido; v3 faz ida e volta; lixo é saneado', async () => {
  const { S, C, e } = await novo();
  const antigo = S.sanear({ v: 2, iniciado: true, dia: 5, creditos: 10, ativos: [], pesquisa: { detectorAereo: { pronto: 3 } } });
  assert.equal(antigo.v, 3); assert.deepEqual(antigo.colhidas, {}); assert.deepEqual(antigo.engenheiros, []); assert.equal(antigo.pesquisa.detectorAereo.pronto, 3);
  C.registrarColhidas(e, ['Cs-137']); e.engenheiros.push({ id: 'e1', nome: 'Rui', retrato: 'caio' }); e.equipamentos.sondaAlfa = 2;
  e.ciencia.concluidas.sondaAlfa = 7; e.fila.push({ id: 'f1', equip: 'sondaAlfa', eng: 'e1', pronto: 20 });
  const r = S.sanear(JSON.parse(JSON.stringify(e)));
  assert.deepEqual(r.colhidas, e.colhidas); assert.deepEqual(r.engenheiros, e.engenheiros); assert.deepEqual(r.equipamentos, e.equipamentos); assert.deepEqual(r.fila, e.fila); assert.deepEqual(r.ciencia, e.ciencia);
  const lixo = S.sanear({ colhidas: { 'x<y': 3, 'Cs-137': 5000 }, ciencia: { concluidas: { lixo: 1, detectorNeutrons: 3 }, andamento: { sondaAlfa: { pronto: 'a' } } }, engenheiros: [7, { id: 'a' }], fila: [{ equip: 'x' }, { id: 'f', equip: 'sondaAlfa', eng: 'nao' }], equipamentos: { sondaAlfa: -3, x: 4 } });
  assert.deepEqual(lixo.colhidas, { 'Cs-137': 999 }); assert.deepEqual(lixo.ciencia.concluidas, {}); assert.deepEqual(Object.keys(lixo.ciencia.andamento), ['sondaAlfa']);
  assert.deepEqual(lixo.engenheiros, []); assert.equal(lixo.fila.length, 1); assert.equal(lixo.fila[0].eng, null); assert.deepEqual(lixo.equipamentos, {});
});

const ESTADO = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 3, iniciado: true, dia: 40, creditos: 9000, proximoAlerta: null, ativos: [],
    modulos: [{id:'b1',tipo:'hangar',x:0,y:0,pronto:0},{id:'b2',tipo:'comando',x:1,y:0,pronto:0},{id:'b3',tipo:'academia',x:2,y:0,pronto:0},{id:'b4',tipo:'cofre',x:3,y:0,pronto:0},{id:'b5',tipo:'alojamento',x:0,y:1,pronto:0},{id:'b6',tipo:'oficina',x:1,y:1,pronto:0},{id:'b7',tipo:'biblioteca',x:2,y:1,pronto:0},{id:'b8',tipo:'laboratorio',x:3,y:1,pronto:0}],
    colhidas: { 'Cs-137': 2, 'Co-60': 1 }, candidatos: [{ id: 'k1', nome: 'Rui', retrato: 'caio', expira: 99, funcao: 'engenheiro' }] }, ${JSON.stringify(extra || {})}))); } catch (e) {} `;

for (const [w, h] of [[1280, 720], [390, 844]]) {
  for (const lang of ['pt', 'en']) {
    test(`telas (${w}×${h}, ${lang}): Laboratório abre a pesquisa, alojamento contrata engenheiro, Oficina fabrica`, async () => {
      const srv = await servidor(), nav = await abrirNavegador();
      try {
        const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, viewport: { width: w, height: h }, toque: w < 800, antes: ESTADO() });
        const { novoJogo } = await import('./helpers/navegador.mjs');
        await novoJogo(pg); await pg.waitForSelector('.ag-mapa'); await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
        await pg.click('[data-sala="laboratorio"]'); await pg.waitForSelector('.ag-janela');
        assert.deepEqual(await pg.$$eval('[data-no]', (e) => e.map((x) => x.dataset.no)), ['espectrometriaGama', 'camaraIonizacao', 'detectorNeutrons'], 'Cs-137 e Co-60 coletados: espectrometria e câmara abertas; nêutrons reservada; sonda alfa oculta');
        await pg.click('[data-no="espectrometriaGama"] [data-ag="ciencia"]');
        assert.equal(await pg.evaluate(() => !!ui.agencia.est.ciencia.andamento.espectrometriaGama), true);
        assert.equal(await pg.evaluate(() => ui.agencia.est.creditos), 7000);
        await pg.evaluate(() => { const e = ui.agencia.est; e.dia += 20; ui.agencia.avancarCiencia?.(); });
        await pg.click('[data-ag="fechar-janela"]'); await pg.click('[data-sala="alojamento"]'); await pg.waitForSelector('.ag-janela');
        await pg.click('[data-ag="contratar"][data-id="k1"]');
        assert.equal(await pg.evaluate(() => ui.agencia.est.engenheiros.length), 1);
        assert.equal(await pg.$$eval('[data-engenheiro]', (e) => e.length), 1);
        await pg.evaluate(async () => { const C = await import('./js/agencia/ciencia.js'); C.avancarCiencia(ui.agencia.est, true); ui.agencia.desenhar(false); });
        await pg.click('[data-ag="fechar-janela"]'); await pg.click('[data-sala="oficina"]'); await pg.waitForSelector('.ag-janela');
        assert.equal(await pg.$$eval('[data-equip]', (e) => e.length), 1);
        await pg.click('[data-equip="espectrometro"] [data-ag="fabricar"]');
        assert.equal(await pg.evaluate(() => ui.agencia.est.fila.length), 1);
        const txt = await pg.textContent('.ag-janela');
        if (lang === 'en') assert.doesNotMatch(txt, /fila|Fila|pronto|aguardando|Fabricar|engenheiro/i); else assert.match(txt, /Fila de produção/);
        assert.deepEqual(erros, []);
      } finally { await nav.close(); await srv.fechar(); }
    });
  }
}
