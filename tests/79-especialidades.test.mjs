// v3.32: Fase D (parte 1) — especialidades dos cientistas com bônus pequenos; saves antigos recebem especialidade fixa.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('equipe inicial tem especialidades; save antigo sem especialidade recebe a mesma sempre; lixo é corrigido', async () => {
  const E = await mod('agencia/equipe.js'), S = await mod('agencia/simulacao.js');
  const ini = E.equipeInicial(); assert.deepEqual(ini.map((m) => m.especialidade), ['campo', 'fisica', 'medicina', 'campo']);
  const antigo = E.saneaEquipe([{ id: 'c9', nome: 'Z' }, { id: 'c9b', nome: 'Y', especialidade: 'bruxo' }]);
  assert.ok(E.ESPECIALIDADES.includes(antigo[0].especialidade)); assert.equal(antigo[0].especialidade, E.especialidadePorId('c9'));
  assert.equal(antigo[1].especialidade, E.especialidadePorId('c9b'));
  const e = S.sanear({ v: 2, iniciado: true, dia: 3, equipe: [{ id: 'a', nome: 'A' }], candidatos: [{ id: 'k1', nome: 'K', expira: 99 }] });
  assert.ok(E.ESPECIALIDADES.includes(e.equipe[0].especialidade)); assert.ok(E.ESPECIALIDADES.includes(e.candidatos[0].especialidade));
});

test('medicina: limite de retorno 5 pontos maior; as outras especialidades mantêm 0,75', async () => {
  const E = await mod('agencia/equipe.js');
  const mk = (esp) => { const m = E.novoCientista('x', 'X', 'lara', esp); m.tratamento = true; return m; };
  // acha uma dose cuja razão fique entre 0,75 e 0,80 (faixa que só a medicina libera)
  let msv = 0.1, alvo = null;
  for (; msv < 60; msv += 0.05) { const t = mk('campo'); E.registrarDose(t, 10, msv); t.tratamento = true; const r = E.razao(t, 10); if (r >= 0.76 && r < 0.79) { alvo = msv; break; } }
  assert.ok(alvo, 'dose de teste encontrada');
  const med = mk('medicina'), cam = mk('campo'), fis = mk('fisica');
  for (const m of [med, cam, fis]) { E.registrarDose(m, 10, alvo); m.tratamento = true; }
  assert.equal(E.verificarRetorno(med, 10), true, 'medicina volta');
  assert.equal(E.verificarRetorno(cam, 10), false); assert.equal(E.verificarRetorno(fis, 10), false);
  assert.ok(E.diasParaVoltar(cam, 10) >= E.diasParaVoltar(E.novoCientista('y', 'Y', 'lara', 'medicina'), 10));
});

test('campo: dose de manuseio na coleta pela metade; física: erro de identificação pela metade (fator de bônus)', async () => {
  const E = await mod('agencia/equipe.js');
  const a = E.novoCientista('a', 'A', 'lara', 'campo'), b = E.novoCientista('b', 'B', 'lara', 'fisica');
  const rc = E.distribuirDoseMissao([a], ['a'], 'a', 1, 5, null, false, { coleta: true })[0].msv, rb = E.distribuirDoseMissao([b], ['b'], 'b', 1, 5, null, false, { coleta: true })[0].msv;
  assert.ok(Math.abs(rc - rb / 2) < 1e-9, `campo ${rc} × outro ${rb}`);
  assert.equal(E.bonusDe(b, 'erroId'), 0.5); assert.equal(E.bonusDe(a, 'erroId'), 1); assert.equal(E.bonusDe(a, 'coleta'), 0.5);
  assert.equal(E.distribuirDoseMissao([a], ['a'], 'a', 1, 6)[0].msv, E.NORMAS.doseLider, 'sem a opção de coleta não há desconto');
});

const estado = (extra) => `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify(Object.assign({ v: 3, iniciado: true, dia: 40, creditos: 9000, proximoAlerta: null, ativos: [],
    candidatos: [{ id: 'k1', nome: 'Rui', retrato: 'caio', expira: 99, funcao: 'cientista', especialidade: 'fisica' }] }, ${JSON.stringify(extra || {})}))); } catch (e) {} `;
for (const lang of ['pt', 'en']) {
  test(`telas (${lang}): alojamento mostra especialidade e bônus de cada cientista e do candidato`, async () => {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
      const { pg, erros } = await novaPagina(nav, srv.url, { idioma: lang, antes: estado() });
      const { novoJogo } = await import('./helpers/navegador.mjs');
      await novoJogo(pg); await pg.waitForSelector('.ag-mapa'); await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
      await pg.click('[data-sala="alojamento"]'); await pg.waitForSelector('.ag-janela');
      assert.deepEqual(await pg.$$eval('.ag-janela [data-esp]', (e) => e.map((x) => x.dataset.esp)), ['campo', 'fisica', 'medicina', 'campo']);
      const txt = await pg.textContent('.ag-janela');
      assert.match(txt, lang === 'pt' ? /Física: identificar errado custa metade/ : /Physics: a wrong identification costs half/);
      assert.match(txt, lang === 'pt' ? /Rui/ : /Rui/);
      if (lang === 'en') assert.doesNotMatch(txt, /Campo|Medicina|manuseia|volta ao serviço|identificar errado/);
      assert.deepEqual(erros, []);
    } finally { await nav.close(); await srv.fechar(); }
  });
}
