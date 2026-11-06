// v3.34: retratos próprios dos engenheiros (capacete e colete refletivo), no Alojamento e nos candidatos.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ_JOGO, servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';
const mod = (f) => import(pathToFileURL(path.join(RAIZ_JOGO, 'js', f)).href);

test('retratoSvg: engenheiro ganha capacete e colete; cientista, não; SVG continua bem formado', async () => {
  const R = await mod('investigacao/retratos.js');
  const eng = R.retratoSvg('caio', 'sorriso', { engenheiro: true }), cie = R.retratoSvg('caio', 'sorriso'), cie2 = R.retratoSvg('caio', 'sorriso', { engenheiro: false });
  assert.match(eng, /data-capacete="1"/); assert.match(eng, /data-colete="1"/); assert.match(eng, /data-retrato-eng="1"/);
  assert.doesNotMatch(cie, /data-capacete|data-colete|data-retrato-eng/); assert.equal(cie, cie2);
  for (const s of [eng, cie]) { assert.equal((s.match(/<svg/g) || []).length, 1); assert.equal((s.match(/<\/svg>/g) || []).length, 1); assert.equal((s.match(/<g[ >]/g) || []).length, (s.match(/<\/g>/g) || []).length); }
  for (const id of R.NOMES ? Object.keys(R.NOMES) : []) assert.match(R.retratoSvg(id, 'neutro', { engenheiro: true }), /data-capacete/);
});

const estado = `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], bestStars: { 1: 3, 2: 2 }, settings: { encontros: false } }));
  localStorage.setItem('radiationHuntersAgencia', JSON.stringify({ v: 3, iniciado: true, dia: 40, creditos: 9000, proximoAlerta: null, ativos: [],
    engenheiros: [{ id: 'e1', nome: 'Rui', retrato: 'caio' }],
    candidatos: [{ id: 'k1', nome: 'Ana', retrato: 'dora', expira: 99, funcao: 'engenheiro' }, { id: 'k2', nome: 'Zé', retrato: 'leo', expira: 99, funcao: 'cientista', especialidade: 'campo' }] })); } catch (e) {} `;
test('alojamento: engenheiro e candidato a engenheiro com capacete; cientistas e candidato a cientista sem', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', antes: estado });
    await novoJogo(pg); await pg.waitForSelector('.ag-mapa'); await pg.click('[data-ag="trocar"]'); await pg.waitForSelector('.ag-cena');
    await pg.click('[data-sala="alojamento"]'); await pg.waitForSelector('.ag-janela');
    assert.equal(await pg.locator('[data-engenheiro="e1"] [data-capacete]').count(), 1);
    assert.equal(await pg.locator('.ag-janela [data-capacete]').count(), 2, 'engenheiro contratado + candidato a engenheiro');
    assert.equal(await pg.locator('[data-membro] [data-capacete]').count(), 0, 'cientistas sem capacete');
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
